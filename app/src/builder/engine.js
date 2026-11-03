import { applyFactionEffects } from './factionEffects.js'
import { applyTagChoices, attackPhase, modifyAttacks, modifyStats, modifyTags } from './modifiers.js'

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
    const options = chosenOf(g, cfg).slice(0, groupLimit(entry, g, cfg))
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
  const tag = o.tagChoice && cfg.tagPicks?.[o.id]?.tag
  if (!tag) return o
  const subject = targets[o.id] || (o.tagChoice.scope === 'unit' ? 'This unit' : 'The selected weapon')
  return { ...o, chosenTag: tag, effect: `${subject} gains Anti-${tag} ${o.tagChoice.rank}.` }
}

export function resolveUnit(entry, cfg, factionId = null) {
  const selected = selectedOf(entry, cfg)
  const picked = selected.flatMap((s) => s.options)

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
  if (extra > 0) total += extra * (perModelCost(entry, selected) + PACKAGE_SURCHARGE * paidPackages)

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

  const rawAttacks = [
    ...entry.attacks.map((a) => ({ ...a, origin: 'entry' })),
    ...picked.flatMap((o) => [
      o.arcaneBolt && { name: 'Arcane Bolt', ...o.arcaneBolt, origin: 'pick' },
      o.profile && { name: o.name, ...o.profile, origin: 'pick' },
    ]),
  ].filter(Boolean)
  // Ranged attacks and spells resolve in the Assault Phase, melee in the Combat Phase.
  // Veterans training makes every weapon of an infantry formation better, not just one package.
  const infantryVeterans = entry.source === 'generic' && ['Core', 'Elite', 'Ranged'].includes(entry.category)
  const upgraded = modifyAttacks(rawAttacks, picked, { allWeapons: infantryVeterans ? ['Veterans'] : [] })
  const { attacks: tagged, applied: tagTargets } = applyTagChoices(upgraded, picked, cfg.tagPicks)
  const attacks = tagged
    .map((a) => ({ ...a, phase: attackPhase(a) }))
    .sort((a, b) => (a.phase === b.phase ? 0 : a.phase === 'Assault' ? -1 : 1))

  const finalModels = doubled ? models * 2 : models
  const tags = modifyTags(entry.tags.filter((t) => !(isHero && t === 'Elite' && entry.heroOption === 'Master Wizard')), picked)
  const fx = applyFactionEffects(factionId, { source: entry.source, models: finalModels, stats, attacks, tags })

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
    changedStats: changed,
    factionChanged: fx.factionChanged,
    factionRule: fx.factionRule,
    impact: entry.impact ?? null,
    tags: fx.tags,
    attacks: fx.attacks,
    abilities: entry.abilities,
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
  check('slot-eligible', 'Each Unit uses an eligible Slot', badSlot.length === 0, badSlot.map((u) => u.name).join(', ') || 'OK')
  check('points', `Points within ${limits.maxPoints}`, points <= limits.maxPoints, `${points} / ${limits.maxPoints}`)
  check('hq', `At least ${limits.minHeadquarters} Headquarters`, hq >= limits.minHeadquarters, `${hq}`)
  check('core', `At least ${limits.minCoreUnits} Core Units`, core >= limits.minCoreUnits, `${core}`)
  check('heroes', `At most ${limits.maxHeroes} Heroes`, heroes <= limits.maxHeroes, `${heroes}`)
  check('leaders', `At most ${limits.maxNamedFactionLeaders} named Faction Leader`, leaders <= limits.maxNamedFactionLeaders, `${leaders}`)
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