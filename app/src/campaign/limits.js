import { resolveUnit, SLOT_ORDER } from '../builder/engine.js'

// The ordinary army builder uses a 2,000 point matched-play template.
// Campaign detachments do not: each PC has a personal Hero slot, Patron slots,
// and later their own Doctrine command slots. The Company's roster is shared.
export const CAMPAIGN_CAPS = {
  local: [null, 200, 275, 375],
  standard: [null, 250, 375, 500],
  long: [null, 325, 475, 625],
  grand: [null, 375, 575, 750],
}
export const FIELD_SLOTS = ['C', 'E', 'R', 'V', 'S', 'A']

export const emptyDetachment = () => ({ doctrineId: null, commands: [], selections: [] })

export function deploymentCap(campaign) {
  return CAMPAIGN_CAPS[campaign?.format]?.[Number(campaign?.act) - 1] ?? null
}

export function allowedDoctrineCommands(campaign, entitlement = {}) {
  if (campaign.act < 3) return 0
  if (campaign.act === 3) return 1
  return 2 + (campaign.format === 'grand' && entitlement.grandThirdCommand === true ? 1 : 0)
}

export function campaignSlots(campaign, entitlement = {}, detachment = {}, catalog) {
  const slots = Object.fromEntries(SLOT_ORDER.map((slot) => [slot, 0]))
  const sources = [{ slot: 'H', source: 'Personal PC Hero (reserved)' }]
  slots.H = 1
  if (campaign.act >= 2) {
    for (const s of (entitlement.patronSlots ?? []).slice(0, 2)) {
      if (!FIELD_SLOTS.includes(s)) continue
      slots[s] += 1
      sources.push({ slot: s, source: 'Patron (individual PC)' })
    }
  }
  const doctrine = campaign.act >= 3
    ? catalog.doctrines.find((d) => d.id === detachment.doctrineId) : null
  if (doctrine) {
    slots[doctrine.foundationSlot]++
    sources.push({ slot: doctrine.foundationSlot, source: doctrine.name + ' foundation' })
    const max = allowedDoctrineCommands(campaign, entitlement)
    for (const name of (detachment.commands ?? []).slice(0, max)) {
      const command = doctrine.commands.find((c) => c.name === name)
      if (!command) continue
      slots[command.slot]++
      sources.push({ slot: command.slot, source: name })
    }
  }
  for (const slot of (entitlement.flexSlots ?? []).slice(0, 2)) {
    if (!FIELD_SLOTS.includes(slot)) continue
    slots[slot]++
    sources.push({ slot, source: 'Purchased Flex' })
  }
  // The first H slot is occupied by the PC Hero, never by a formation.
  const unitSlots = { ...slots, H: slots.H - 1 }
  return { slots, unitSlots, sources, doctrine, total: sources.length }
}

export function detachmentView(campaign, entitlement, detachment, inventory, catalog, heroPoints, otherDetachments = []) {
  const errors = []
  const check = (ok, message) => { if (!ok) errors.push(message) }
  const cap = deploymentCap(campaign)
  const budget = campaignSlots(campaign, entitlement, detachment, catalog)
  const allUnits = inventory.filter((i) => i.kind === 'unit' && i.config && i.config.key)
  const byId = new Map(allUnits.map((u) => [u.id, u]))
  const selections = detachment.selections ?? []
  const selectedIds = selections.map((s) => s.id)
  const takenElsewhere = new Set(otherDetachments.flatMap((d) =>
    d.ownerUid === detachment.ownerUid ? [] : (d.selections ?? []).map((s) => s.id)))
  const used = Object.fromEntries(SLOT_ORDER.map((s) => [s, 0]))
  const units = selections.map((selection) => {
    const saved = byId.get(selection.id)
    const entry = catalog.unitsByKey[saved?.config.key]
    if (!entry) return { id: selection.id, missing: true }
    const unit = resolveUnit(entry, saved.config, saved.factionId ?? null)
    const slot = selection.slot
    if (slot in used) used[slot]++
    return { ...unit, poolId: saved.id, slot, missing: false }
  })
  check(selections.length === new Set(selectedIds).size, 'A formation can only be selected once')
  check(!selectedIds.some((id) => takenElsewhere.has(id)), 'A formation is already reserved by another PC')
  check(!units.some((u) => u.missing), 'A selected formation is no longer in the Company roster')
  check(!units.some((u) => !u.missing && !u.eligibleSlots.includes(u.slot)), 'A formation occupies an ineligible recruitment slot')
  check(!units.some((u) => !u.missing && u.missingTags.length), 'A formation has unresolved Anti-[Type] choices')
  check(!units.some((u) => !u.missing && u.pointsVary), 'A formation has an unresolved variable Point cost')
  check(SLOT_ORDER.every((s) => used[s] <= budget.unitSlots[s]), 'Detachment exceeds its available recruitment slots')
  check(campaign.act >= 2 || selections.length === 0, 'Military formations unlock in Act II')
  if (campaign.act >= 2) check((entitlement.patronSlots ?? []).length === 2, 'GM must assign two Patron slots')
  if (campaign.act < 3) check(!detachment.doctrineId && !(detachment.commands ?? []).length, 'Doctrine unlocks in Act III')
  if (campaign.act >= 3) {
    check(!!budget.doctrine, 'Choose your personal Doctrine')
    const selected = detachment.commands ?? []
    check(selected.length <= allowedDoctrineCommands(campaign, entitlement), 'Too many Doctrine Commands selected')
    check(new Set(selected).size === selected.length, 'Doctrine Commands cannot repeat')
    check(selected.every((name) => budget.doctrine?.commands.some((c) => c.name === name)), 'Unknown Doctrine Command')
  }
  const unique = units.filter((u) => !u.missing && u.tags.includes('Unique')).map((u) => u.entry.key)
  check(new Set(unique).size === unique.length, 'Unique formation profile repeated')
  const total = Number(heroPoints ?? 0) + units.reduce((sum, u) => sum + (u.points ?? 0), 0)
  if (cap != null) {
    check(heroPoints != null, 'Your GM must approve a Hero sheet before you deploy')
    check(total <= cap, `Deployment exceeds the ${cap}-point personal limit`)
  }
  return { cap, total, slots: budget, used, units, errors, legal: errors.length === 0 }
}
