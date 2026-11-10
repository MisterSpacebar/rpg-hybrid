import { applyFactionEffects } from './factionEffects.js'
import { canonicalTags, normalizeTag } from '../tags.js'
import { applyTagChoices, attackPhase, modifyAttacks, modifyStats, modifyTags } from './modifiers.js'
import { resolveRush } from './rush.js'

export const SLOT_ORDER = ['H', 'C', 'E', 'R', 'V', 'S', 'A']

export const emptyArmy = () => ({
  name: 'New Army',
  factionId: null,
  doctrineIds: [null, null],
  factionCommands: [],
  doctrineCommands: {},
  units: [],
})

const PACKAGE_SURCHARGE = 5

// ---------- unit configuration ----------

export function defaultPicks(entry) {
  const picks = {}
  for (const g of entry.groups) picks[g.id] = g.kind === 'radio' ? (g.required ? g.options[0].id : null) : []
  return picks
}

// Migrate older saved Captain equipment without silently changing the meaning of
// historical option IDs, and give existing Wizards their free primary spell.
export function migrateUnitConfig(entry, cfg) {
  const picks = { ...(cfg.picks ?? {}) }
  let changed = false
  if (entry.key === 'generic:captain') {
    const training = asArray(picks.equipmentAndCombatTraining)
    const oldWeapons = { 'equipmentAndCombatTraining:2': 'rangedWeaponPackages:0', 'equipmentAndCombatTraining:3': 'rangedWeaponPackages:1', 'equipmentAndCombatTraining:4': 'rangedWeaponPackages:2', 'equipmentAndCombatTraining:5': 'rangedWeaponPackages:3' }
    const weapon = training.find((id) => oldWeapons[id])
    if (weapon && !picks.rangedWeaponPackages) { picks.rangedWeaponPackages = oldWeapons[weapon]; changed = true }
    const replaced = training.map((id) => id === 'equipmentAndCombatTraining:9' ? 'equipmentAndCombatTraining:10' : id)
      .filter((id) => !oldWeapons[id])
    if (replaced.length !== training.length || replaced.some((id, i) => id !== training[i])) {
      picks.equipmentAndCombatTraining = [...new Set(replaced)]
      changed = true
    }
  }
  for (const group of entry.groups.filter((g) => g.kind === 'radio' && g.required)) {
    if (!picks[group.id] || !group.options.some((o) => o.id === picks[group.id])) {
      picks[group.id] = group.options[0]?.id ?? null
      changed = true
    }
  }
  if (entry.key === 'generic:wizard') {
    const primary = entry.groups.find((g) => g.id === 'primarySpell')?.options.find((o) => o.id === picks.primarySpell)
    const arcana = entry.groups.find((g) => g.id === 'arcana')
    if (primary && arcana && Array.isArray(picks.arcana)) {
      const cleaned = picks.arcana.filter((id) => arcana.options.find((o) => o.id === id)?.name !== primary.name)
      if (cleaned.length !== picks.arcana.length) { picks.arcana = cleaned; changed = true }
    }
  }
  return changed ? { ...cfg, picks } : cfg
}

export function newUnitConfig(entry, slot) {
  return {
    uid: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    key: entry.key,
    slot,
    models: entry.baseModels,
    doubled: false,
    picks: defaultPicks(entry),
    note: '',
  }
}

const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : [])

const chosenOf = (g, cfg) => asArray(cfg.picks?.[g.id]).map((id) => g.options.find((o) => o.id === id)).filter(Boolean)

// How many options a group allows. Some groups grow with purchased upgrades (Additional Command, Additional Arcana).
export function groupLimit(entry, g, cfg) {
  if (!g.limit) return g.max ?? Infinity
  const { base, bonus } = g.limit
  const groupOf = (id) => entry.groups.find((x) => x.id === id)
  const baseCount = typeof base === 'number' ? base : (chosenOf(groupOf(base.group), cfg)[0]?.[base.field] ?? 0)
  const bonusCount = chosenOf(groupOf(bonus.group), cfg).filter((o) => o.name === bonus.option).length
  return baseCount + bonusCount
}

function selectedOf(entry, cfg) {
  const result = []
  for (const g of entry.groups) {
    if (g.when) {
      const dep = entry.groups.find((x) => x.id === g.when.group)
      if (!dep || !chosenOf(dep, cfg).some((o) => o.name === g.when.option)) continue
    }
    let options = chosenOf(g, cfg).slice(0, groupLimit(entry, g, cfg))
    if (g.id === 'arcana') {
      const primary = entry.groups.find((x) => x.id === 'primarySpell')
      const primaryName = primary && chosenOf(primary, cfg)[0]?.name
      if (primaryName) options = options.filter((o) => o.name !== primaryName)
    }
    result.push({ group: g, options })
  }
  return result
}

export function visibleGroups(entry, cfg) {
  return selectedOf(entry, cfg).map((s) => s.group)
}

function perModelCost(entry, selected) {
  if (!entry.modelOptions.length) return 0
  if (entry.modelOptions.length === 1) return entry.modelOptions[0].perModel
  // Cavalry price extra Models by class (e.g. "Additional Heavy Cavalry Model").
  const classNames = selected.flatMap((s) => s.options.map((o) => o.name))
  return (entry.modelOptions.find((m) => classNames.includes(m.label)) ?? entry.modelOptions[0]).perModel
}

// Once a tag is chosen, the option's text names it ('Longsword gains Anti-Undead 3') instead of the Anti-[Type] placeholder.
function describeTagChoice(o, cfg, targets) {
  const tag = o.tagChoice && normalizeTag(cfg.tagPicks?.[o.id]?.tag)
  if (!tag) return o
  const subject = targets[o.id] || (o.tagChoice.scope === 'unit' ? 'This unit' : 'The selected weapon')
  if (o.tagChoice.scope === 'aura') {
    return { ...o, chosenTag: tag, effect: String(o.effect).replace(/Anti-\[(?:selected tag|chosen tag|Type)\]/gi, `Anti-${tag}`) }
  }
  return { ...o, chosenTag: tag, effect: `${subject} gains Anti-${tag} ${o.tagChoice.rank}.` }
}

export function resolveUnit(entry, cfg, factionId = null) {
  const selected = selectedOf(entry, cfg)
  const picked = selected.flatMap((s) => s.options)
  const chosenNames = new Set(picked.map((o) => o.name))
  const illegalPair = picked.flatMap((o) => (o.incompatibleWith ?? []).filter((name) => chosenNames.has(name)).map((name) => `${o.name} + ${name}`))
  const loadoutConflicts = [...new Set(illegalPair)]

  let total = entry.basePoints
  let paidPackages = 0
  let varies = false
  for (const { group, options } of selected) {
    for (const o of options) {
      total += o.points || 0
      if (o.varies) varies = true
      if (group.package && o.points > 0) paidPackages++
    }
  }

  const models = Math.min(Math.max(cfg.models ?? entry.baseModels, entry.baseModels), entry.maxModels)
  const extra = models - entry.baseModels
  if (extra > 0) {
    // Training such as Veterans, Deadly Precision, and Reinforced Bodies can add a
    // surcharge for EVERY additional Model, independently of paid weapon packages.
    const trainingSurcharge = picked.reduce((n, o) => n + (Number(o.extraModelSurcharge) || 0), 0)
    total += extra * (perModelCost(entry, selected) + PACKAGE_SURCHARGE * paidPackages + trainingSurcharge)
  }

  const doubled = entry.canDouble && !!cfg.doubled
  if (doubled) total *= 2

  const isHero = entry.isHero || (!!entry.heroOption && picked.some((o) => o.name === entry.heroOption))
  // A generic Master Wizard loses Elite and becomes a Hero, so it recruits as Headquarters. A Captain with Heroic Commission
  // keeps Elite (E) and gains H eligibility.
  const slots =
    entry.heroOption === 'Master Wizard' && isHero ? ['H'] : entry.heroOption === 'Heroic Commission' && isHero ? [...new Set([...entry.slots, 'H'])] : entry.slots

  const withStats = [...picked].reverse().find((o) => o.stats)
  const baseStats = withStats?.stats ?? entry.stats
  const { stats, changed } = modifyStats(baseStats, picked)

  const isMasterWizard = entry.key === 'generic:wizard' && picked.some((o) => o.name === 'Master Wizard')
  const primarySpell = picked.find((o) => o.id?.startsWith('primarySpell:'))
  const rawAttacks = [
    ...entry.attacks.map((a) => ({ ...a, origin: 'entry' })),
    ...picked.flatMap((o) => [
      o.arcaneBolt && { name: 'Arcane Bolt', ...o.arcaneBolt, origin: 'pick' },
      o.profile && { name: o.name, ...o.profile, origin: 'pick', sourceOption: o.id },
    ]),
  ].filter(Boolean)
  // The primary spell is a free alternative to Arcane Bolt, not an extra spell
  // granted alongside Bolt. Master Wizard improves that primary choice only.
  const spellAttacks = rawAttacks.filter((a) => !(a.sourceOption?.startsWith('arcana:') && a.name === primarySpell?.name))
  if (isMasterWizard) {
    for (const attack of spellAttacks.filter((a) => a.sourceOption === primarySpell?.id)) {
      attack.range = attack.range.replace(/\d+"/, (m) => `${Number.parseInt(m, 10) + 2}"`)
      attack.hit = `${Math.max(2, Number.parseInt(attack.hit, 10) - 1)}+`
    }
  }
  // Ranged attacks and spells resolve in the Assault Phase, melee in the Combat Phase.
  // Veterans training makes every weapon of an infantry formation better, not just one package.
  const infantryVeterans = entry.source === 'generic' && ['Core', 'Elite', 'Ranged', 'Captain'].includes(entry.category)
  const upgraded = modifyAttacks(spellAttacks, picked, { allWeapons: infantryVeterans ? ['Veterans'] : [], weaponTargets: cfg.weaponPicks ?? {} })
  const { attacks: tagged, applied: tagTargets } = applyTagChoices(upgraded, picked, cfg.tagPicks)
  const attacks = tagged
    .map((a) => ({ ...a, phase: attackPhase(a) }))
    .sort((a, b) => (a.phase === b.phase ? 0 : a.phase === 'Assault' ? -1 : 1))

  const finalModels = doubled ? models * 2 : models
  const tags = modifyTags([...entry.tags.filter((t) => !(isHero && t === 'Elite' && entry.heroOption === 'Master Wizard')), ...picked.flatMap((o) => o.grantsTags ?? [])], picked)
  // Hero and Unique are distinct. Commissioned generic Captains and Master Wizards
  // gain Hero but not Unique; PCs and named/legendary figures gain Unique explicitly.
  if (isHero && !tags.includes('Hero')) tags.push('Hero')
  if (entry.unique && !tags.includes('Unique')) tags.push('Unique')
  // Roster classifications are explicit and independent of the chosen recruitment slot.
  if (entry.isCore && !tags.includes('Core')) tags.push('Core')
  if (entry.isLargeAsset && !tags.includes('Large Asset')) tags.push('Large Asset')
  const fx = applyFactionEffects(factionId, { source: entry.source, models: finalModels, stats, attacks, tags: canonicalTags(tags, factionId ?? entry.factionId) })
  const cavalryClass = picked.find((o) => o.id?.startsWith('cavalryClass:'))
  // Faction-wide movement/shock bonuses vary by recruitment source.
  // Named cavalry retain printed ranks; generic recruits use smaller bonuses.
  const printedCharge = entry.charge ?? cavalryClass?.charge ?? null
  // Artillery cannot declare Charges: do not show an unusable faction Charge/Impact rank.
  const mayCharge = entry.category !== 'Artillery' && !(entry.tags ?? []).includes('Artillery')
  const printedImpact = entry.impact ?? cavalryClass?.impact ?? null
  const { charge, impact, chargeSource, impactSource } = resolveRush({ printedCharge, printedImpact, picked, factionId, source: entry.source, mayCharge })
  const rushFaction = [chargeSource === 'faction' && 'charge', impactSource === 'faction' && 'impact'].filter(Boolean)
  const rushChanged = [chargeSource === 'upgrade' && 'charge', impactSource === 'upgrade' && 'impact'].filter(Boolean)
  const optionCommands = picked.filter((o) => o.cpCost && !o.profile).map((o) => ({ name: o.name, type: 'Command', cost: `${o.cpCost} CP`, timing: o.timing, effect: o.effect }))

  return {
    uid: cfg.uid,
    entry,
    name: entry.name,
    category: entry.category,
    source: entry.source,
    slot: cfg.slot,
    eligibleSlots: slots,
    models: finalModels,
    doubled,
    points: total,
    pointsVary: varies,
    stats: fx.stats,
    baseStats,
    changedStats: [...changed, ...rushChanged],
    factionChanged: [...fx.factionChanged, ...rushFaction],
    factionRule: fx.factionRule ?? (rushFaction.length ? { warclans: 'Warclans Charge', 'titan-clans': 'Titan Clans Impact' }[factionId] : null),
    impact,
    charge,
    loadoutConflicts,
    tags: canonicalTags(fx.tags),
    attacks: fx.attacks,
    abilities: [...entry.abilities, ...(isMasterWizard && entry.masterWizardAbility ? [{ ...entry.masterWizardAbility }] : []), ...optionCommands],
    picks: selected
      .map(({ group, options }) => ({ group: group.label, options: options.map((o) => describeTagChoice(o, cfg, tagTargets)) }))
      .filter((p) => p.options.length),
    missingTags: picked.filter((o) => o.tagChoice && !cfg.tagPicks?.[o.id]?.tag).map((o) => o.name),
    isCore: entry.isCore,
    isHero,
    isLeader: entry.isLeader,
    isLargeAsset: entry.isLargeAsset,
    unique: entry.unique,
    note: cfg.note ?? '',
  }
}

// ---------- recruitment slots ----------

export function computeSlots(army, catalog) {
  const available = Object.fromEntries(SLOT_ORDER.map((s) => [s, 0]))
  const sources = []
  const add = (slot, source) => {
    if (!slot) return
    available[slot]++
    sources.push({ slot, source })
  }

  catalog.rules.slotCalculation.universalFoundation.forEach((s) => add(s, 'Universal'))
  const faction = catalog.factions.find((f) => f.id === army.factionId)
  if (faction) {
    faction.foundationSlots.forEach((s) => add(s, `${faction.name} foundation`))
    for (const name of army.factionCommands) add(faction.commands.find((c) => c.name === name)?.slot, name)
  }
  for (const id of army.doctrineIds) {
    const d = catalog.doctrines.find((x) => x.id === id)
    if (!d) continue
    add(d.foundationSlot, `${d.name} foundation`)
    for (const name of army.doctrineCommands[id] ?? []) add(d.commands.find((c) => c.name === name)?.slot, name)
  }
  return { available, sources, total: SLOT_ORDER.reduce((n, s) => n + available[s], 0) }
}

// ---------- the whole army ----------

export function buildArmyView(army, catalog) {
  const { standardArmy: limits } = catalog.rules
  const faction = catalog.factions.find((f) => f.id === army.factionId) ?? null
  const doctrines = army.doctrineIds.map((id) => catalog.doctrines.find((d) => d.id === id) ?? null)
  const slots = computeSlots(army, catalog)

  const units = army.units
    .map((cfg) => {
      const entry = catalog.unitsByKey[cfg.key]
      return entry ? resolveUnit(entry, cfg, army.factionId) : null
    })
    .filter(Boolean)

  const used = Object.fromEntries(SLOT_ORDER.map((s) => [s, 0]))
  units.forEach((u) => {
    if (u.slot in used) used[u.slot]++
  })

  const points = units.reduce((n, u) => n + u.points, 0)
  const largeAssetMax = doctrines.some((d) => d?.id === limits.heavySupportDoctrineId)
    ? limits.maxLargeAssetsWithHeavySupport
    : limits.maxLargeAssets

  const count = (fn) => units.filter(fn).length
  const heroes = count((u) => u.isHero)
  const core = count((u) => u.isCore)
  const hq = count((u) => u.slot === 'H')
  const leaders = count((u) => u.isLeader)
  const largeAssets = count((u) => u.isLargeAsset)

  const factionCommands = (faction?.commands ?? []).filter((c) => army.factionCommands.includes(c.name))
  const doctrineCommands = doctrines.map((d) => (d ? d.commands.filter((c) => (army.doctrineCommands[d.id] ?? []).includes(c.name)) : []))

  const checks = []
  const check = (id, label, ok, detail) => checks.push({ id, label, ok, detail })

  check('faction', 'Faction chosen', !!faction, faction?.name ?? 'Choose 1')
  const distinct = doctrines.every(Boolean) && doctrines[0].id !== doctrines[1].id
  check('doctrines', 'Two distinct Doctrines', distinct, `${doctrines.filter(Boolean).length} of 2`)
  check('faction-commands', 'Faction Commands', factionCommands.length === limits.factionCommandsSelected, `${factionCommands.length} of ${limits.factionCommandsSelected}`)
  doctrines.forEach((d, i) => {
    if (d) check(`doctrine-commands-${i}`, `${d.name} Commands`, doctrineCommands[i].length === limits.doctrineCommandsSelectedPerDoctrine, `${doctrineCommands[i].length} of ${limits.doctrineCommandsSelectedPerDoctrine}`)
  })
  check('slots', 'Recruitment Slots', slots.total === limits.totalRecruitmentSlots, `${slots.total} of ${limits.totalRecruitmentSlots}`)

  const overSlots = SLOT_ORDER.filter((s) => used[s] > slots.available[s])
  check('slot-capacity', 'Units fit their Recruitment Slots', overSlots.length === 0, overSlots.length ? `Over capacity: ${overSlots.join(', ')}` : `${units.length} Units placed`)
  const badSlot = units.filter((u) => !u.eligibleSlots.includes(u.slot))
  const illegalLoadouts = units.filter((u) => u.loadoutConflicts?.length)
  check('slot-eligible', 'Each Unit uses an eligible Slot', badSlot.length === 0, badSlot.map((u) => u.name).join(', ') || 'OK')
  check('equipment', 'No incompatible equipment', illegalLoadouts.length === 0, illegalLoadouts.map((u) => `${u.name}: ${u.loadoutConflicts.join(', ')}`).join('; ') || 'OK')
  check('points', `Points within ${limits.maxPoints}`, points <= limits.maxPoints, `${points} / ${limits.maxPoints}`)
  check('hq', `At least ${limits.minHeadquarters} Headquarters`, hq >= limits.minHeadquarters, `${hq}`)
  check('core', `At least ${limits.minCoreUnits} Core Units`, core >= limits.minCoreUnits, `${core}`)
  check('heroes', `At most ${limits.maxHeroes} Heroes`, heroes <= limits.maxHeroes, `${heroes}`)
  check('leaders', `At most ${limits.maxNamedFactionLeaders} named Faction Leader`, leaders <= limits.maxNamedFactionLeaders, `${leaders}`)
  const uniqueCounts = new Map()
  for (const unit of units.filter((u) => u.tags.includes('Unique'))) {
    const key = unit.entry.key ?? unit.name
    uniqueCounts.set(key, (uniqueCounts.get(key) ?? 0) + 1)
  }
  const repeatedUnique = [...uniqueCounts].filter(([, n]) => n > 1).map(([key]) => key)
  check('unique', 'Unique Units may be purchased once per profile', repeatedUnique.length === 0, repeatedUnique.length ? repeatedUnique.join(', ') : 'OK')
  check('large-assets', `At most ${largeAssetMax} Large Assets`, largeAssets <= largeAssetMax, `${largeAssets}`)
  if (units.some((u) => u.entry.groups.some((g) => g.options.some((o) => o.tagChoice)))) {
    const untagged = units.filter((u) => u.missingTags.length)
    check('anti-tags', 'Anti-[Type] choices made', untagged.length === 0, untagged.map((u) => `${u.name}: ${u.missingTags.join(', ')}`).join('; ') || 'OK')
  }

  return {
    name: army.name,
    faction, doctrines, factionCommands, doctrineCommands,
    slots, used, units, points, limits, checks,
    legal: checks.every((c) => c.ok),
    counts: { heroes, core, hq, largeAssets, largeAssetMax },
  }
}

export function firstOpenSlot(entry, view, eligible = entry.slots) {
  return eligible.find((s) => view.used[s] < view.slots.available[s]) ?? eligible[0]
}

// Units that can fill more than one Recruitment Slot (a faction Core Unit that is also Ranged, a Hero Captain that can sit in E or H)
// roll into whichever of their eligible slots has room, so adding a Unit that fits only one slot never overfills it needlessly.
export function rebalanceSlots(army, catalog) {
  if (!army.units.length) return army
  const { available } = computeSlots(army, catalog)
  const eligible = army.units.map((cfg) => {
    const entry = catalog.unitsByKey[cfg.key]
    return entry ? resolveUnit(entry, cfg, army.factionId).eligibleSlots : null
  })
  const slots = army.units.map((cfg, i) => (eligible[i] ? (eligible[i].includes(cfg.slot) ? cfg.slot : eligible[i][0]) : cfg.slot))
  const counts = () => Object.fromEntries(SLOT_ORDER.map((s) => [s, slots.filter((x) => x === s).length]))

  // Free a place in an overfilled slot by moving a flexible Unit along a chain of slots that ends in one with room.
  const relieve = (from) => {
    const used = counts()
    const parent = { [from]: null }
    const queue = [from]
    while (queue.length) {
      const here = queue.shift()
      for (let i = 0; i < slots.length; i++) {
        if (slots[i] !== here || !eligible[i]) continue
        for (const to of eligible[i]) {
          if (to in parent) continue
          parent[to] = { from: here, unit: i }
          if (used[to] < available[to]) {
            for (let step = to; parent[step]; step = parent[step].from) slots[parent[step].unit] = step
            return true
          }
          queue.push(to)
        }
      }
    }
    return false
  }

  for (let guard = 0; guard < 200; guard++) {
    const used = counts()
    const over = SLOT_ORDER.find((s) => used[s] > available[s])
    if (!over || !relieve(over)) break
  }

  if (slots.every((s, i) => s === army.units[i].slot)) return army
  return { ...army, units: army.units.map((cfg, i) => (slots[i] === cfg.slot ? cfg : { ...cfg, slot: slots[i] })) }
}