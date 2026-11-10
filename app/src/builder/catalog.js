import { slugify } from '../rulebooks.js'
import { tagChoiceOf } from './modifiers.js'

// All rules data is loaded lazily, only when the Army Builder is opened.
const files = import.meta.glob(
  '../../../rules_data_json/{army_construction,factions/*,doctrines/*,units/generic/*}.json',
  { import: 'default' },
)

async function loadAll() {
  const entries = await Promise.all(
    Object.entries(files).map(async ([path, load]) => [path.split('rules_data_json/')[1], await load()]),
  )
  return Object.fromEntries(entries)
}

const parseCost = (cost) => {
  const m = String(cost ?? '').match(/(\d+)/)
  return m ? Number(m[1]) : null
}

const ADDITIONAL_MODEL = /^additional(?: (.+?))? model$/i

// ---------- generic units: turn the option tables into uniform option groups ----------

function optionOf(o, groupKey) {
  return {
    name: o.name,
    points: o.points ?? o.pointsEach ?? 0,
    each: o.pointsEach != null,
    extraModelSurcharge: o.extraModelSurcharge ?? 0,
    varies: o.points == null && o.pointsEach == null && o.pointsPerModel == null && !/commands?$/i.test(groupKey),
    arcanaChoices: o.arcanaChoices ?? null,
    tagChoice: tagChoiceOf(o.effect),
    effect: o.effect ?? o.notes ?? null,
    profile: o.profile ?? null,
    stats: o.stats ?? null,
    arcaneBolt: o.arcaneBolt ?? null,
    tagChange: o.tagChange ?? null,
    cpCost: o.cpCost ?? null,
    incompatibleWith: o.incompatibleWith ?? null,
    charge: o.charge ?? null,
    impact: o.impact ?? null,
    timing: o.timing ?? null,
  }
}

function buildGroups(raw, modelOptions) {
  const groups = []
  for (const [key, val] of Object.entries(raw)) {
    const opts = Array.isArray(val) ? val : Array.isArray(val?.options) ? val.options : null
    if (!opts?.length || typeof opts[0] !== 'object' || !('name' in opts[0])) continue

    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
    const isPackage = /weapon|equipment|shield/i.test(key) && !/upgrade|training|formation/i.test(key)
    const radio = val.chooseCount === 1
    const addons = []
    const choices = []

    for (const o of opts) {
      const m = o.name.match(ADDITIONAL_MODEL)
      if (m && (o.pointsPerModel != null || o.points != null)) {
        modelOptions.push({
          label: m[1] ?? null,
          perModel: o.pointsPerModel ?? o.points,
          max: o.maxModels ?? null,
        })
        continue
      }
      if (radio && o.profile === null && /shield/i.test(o.name) && (o.points ?? 0) > 0) {
        addons.push(o)
        continue
      }
      if (!radio && /^standard\b/i.test(o.name) && !o.points) continue
      choices.push(o)
    }

    if (choices.length) {
      groups.push({
        id: key,
        label,
        kind: radio ? 'radio' : 'check',
        required: radio && choices.some((o) => !o.points),
        max: radio ? 1 : (val.chooseCount ?? null),
        package: isPackage,
        options: choices.map((o, i) => ({ id: `${key}:${i}`, ...optionOf(o, key) })),
      })
    }
    if (addons.length) {
      groups.push({
        id: `${key}+addon`,
        label: 'Shields',
        kind: 'check',
        package: true,
        options: addons.map((o, i) => ({ id: `${key}+addon:${i}`, ...optionOf(o, key) })),
      })
    }
  }
  return groups
}

// A Wizard learns as many Arcana as its specialization grants, plus one for each Additional Arcana purchased.
function arcanaGroup(arcana) {
  const list = [...(arcana?.offensive ?? []), ...(arcana?.command?.options ?? [])]
  if (!list.length) return null
  return {
    id: 'arcana',
    label: 'Arcana',
    kind: 'check',
    package: false,
    max: null,
    limit: { base: { group: 'specialization', field: 'arcanaChoices' }, bonus: { group: 'wizardUpgrades', option: 'Additional Arcana' } },
    options: list.map((a, i) => ({
      id: `arcana:${i}`,
      name: a.name,
      points: 0,
      varies: false,
      effect: a.effect ?? null,
      profile: a.profile ?? null,
      stats: null,
      arcaneBolt: null,
      tagChange: null,
      cpCost: a.cpCost ?? null,
      timing: a.timing ?? null,
    })),
  }
}

function genericEntry(base, raw) {
  const modelOptions = []
  const groups = buildGroups(raw, modelOptions)
  return {
    source: 'generic',
    category: base.category,
    name: base.name,
    key: `generic:${base.id}`,
    basePoints: base.basePoints,
    baseModels: base.baseModels ?? 1,
    maxModels: base.maxModels ?? (modelOptions[0]?.max ?? base.baseModels ?? 1),
    modelOptions,
    tags: base.tags ?? [],
    slots: base.slots,
    isCore: !!base.isCore,
    isHero: false,
    isLargeAsset: false,
    isLeader: false,
    unique: false,
    canDouble: false,
    stats: perModelWounds(base.stats),
    attacks: base.attacks ?? [],
    abilities: base.abilities ?? [],
    description: base.description ?? null,
    groups,
    heroOption: base.heroOption ?? null,
  }
}

// Wounds are always per Model, so text like "3 per Model" is reduced to the number.
const perModelWounds = (stats) => {
  const m = typeof stats?.wounds === 'string' && stats.wounds.match(/^(\d+)\s*per Model/i)
  return m ? { ...stats, wounds: Number(m[1]) } : (stats ?? null)
}

const profileAttack = (name, p) => (p ? { name, ...p } : null)

function normalizeGeneric(data) {
  const out = []
  const unitsOf = (file) => data[`units/generic/${file}.json`]?.units ?? []
  const supportFile = data['units/generic/05_support_units.json']

  for (const u of unitsOf('01_infantry')) {
    const { id, name, basePoints, baseModels, maxModels, tags, recruitmentSlots, stats, description, ...raw } = u
    const melee = raw.meleeWeapon
    out.push(
      genericEntry(
        {
          id, name, basePoints, baseModels, maxModels, tags, stats, description,
          category: id === 'line-infantry' ? 'Core' : id === 'elite-infantry' ? 'Elite' : 'Ranged',
          slots: recruitmentSlots,
          isCore: id === 'line-infantry',
          attacks: melee ? [profileAttack(melee.name, melee.profile)] : [],
        },
        raw,
      ),
    )
  }

  for (const u of unitsOf('02_cavalry_and_mobile_troops')) {
    const { id, name, basePoints, baseModels, maxModels, tags, stats, description, ...raw } = u
    out.push(
      genericEntry(
        { id, name, basePoints, baseModels, maxModels, tags, stats, description, category: 'Vanguard', slots: ['V'] },
        raw,
      ),
    )
  }

  for (const u of unitsOf('03_captains')) {
    const { id, name, basePoints, baseModels, tags, recruitmentSlots, stats, description, ...raw } = u
    const entry = genericEntry(
      { id, name, basePoints, baseModels, tags, stats, description, category: 'Captain', slots: recruitmentSlots, heroOption: 'Heroic Commission' },
      raw,
    )
    // The ranged package is a separate optional radio selector, not a Combat Training pick.
    // Keep non-weapon training available independently of the chosen ranged Attack.
    const rangedGroup = entry.groups.find((g) => g.id === 'rangedWeaponPackages')
    if (rangedGroup) { rangedGroup.required = false; rangedGroup.package = true }
        // The Additional Command upgrade raises the number of Commands the Captain may learn.
    const commands = entry.groups.find((g) => g.id === 'commands')
    if (commands) commands.limit = { base: commands.max, bonus: { group: 'commandUpgrades', option: 'Additional Command' } }
    out.push(entry)
  }

  for (const u of unitsOf('04_wizards')) {
    const { id, name, basePoints, baseModels, tags, description, ...raw } = u
    const entry = genericEntry(
      { id, name, basePoints, baseModels, tags, description, category: 'Wizard', slots: ['E'], heroOption: 'Master Wizard' },
      raw,
    )
    const arcana = arcanaGroup(raw.genericArcana)
    if (arcana) {
      // Learned offensive Arcana are separate optional attacks; the primary free spell
      // occupies neither Arcana slot nor a CP/card.
      entry.groups.push(arcana)
      const extra = entry.groups.find((g) => g.id === 'wizardUpgrades')?.options.find((o) => o.each)
      if (extra) extra.maxCount = Math.max(0, arcana.options.length - 2)
    }
    out.push(entry)
  }

  for (const u of unitsOf('06_artillery')) {
    const { id, name, basePoints, tags, description, ...raw } = u
    const entry = genericEntry(
      {
        id, name, basePoints, tags, description, category: 'Artillery', slots: ['A'],
        attacks: u.secondaryWeapon ? [profileAttack(u.secondaryWeapon.name, u.secondaryWeapon.profile)] : [],
      },
      raw,
    )
    const when = { lightArtilleryWeapons: 'Light Artillery', heavyArtilleryWeapons: 'Heavy Artillery', specialUpgrades: 'Heavy Artillery' }
    for (const g of entry.groups) if (when[g.id]) g.when = { group: 'artilleryClass', option: when[g.id] }
    out.push(entry)
  }

  if (supportFile) {
    const shared = supportFile.sharedProfile
    for (const s of supportFile.specializations) {
      const paid = (s.abilities ?? []).filter((a) => a.points > 0)
      const base = (s.abilities ?? []).filter((a) => !a.points)
      const entry = genericEntry(
        {
          id: s.id, name: s.name, basePoints: s.basePoints, baseModels: shared.baseModels,
          tags: shared.tags, stats: shared.stats, category: 'Support', slots: shared.recruitmentSlots,
          description: s.primaryRole,
          attacks: [s.defaultMeleeWeapon, s.defaultRangedWeapon].filter(Boolean).map((w) => profileAttack(w.name, w.profile)),
          abilities: base.map((a) => ({
            name: a.name, type: a.cpCost ? 'Command' : 'Passive',
            cost: a.cpCost ? `${a.cpCost} CP` : null, timing: a.timing ?? null, effect: a.effect,
          })),
        },
        { abilityUpgrades: { options: paid }, commonUpgrades: supportFile.commonSupportUpgrades },
      )
      const ab = entry.groups.find((g) => g.id === 'abilityUpgrades')
      if (ab) ab.label = 'Ability Upgrades'
      out.push(entry)
    }
  }
  return out
}

// ---------- faction units ----------

function factionEntries(f, coreReference) {
  const slug = slugify(f.name)
  const upgradeGroup = (u) =>
    u.upgrades?.length
      ? [{
          id: 'upgrades', label: 'Upgrades', kind: 'check', package: false,
          options: u.upgrades.map((g, i) => ({
            id: `upgrades:${i}`, name: g.name, points: parseCost(g.cost) ?? 0,
            varies: parseCost(g.cost) == null, effect: g.effect ?? null,
          })),
        }]
      : []
  const base = (u, extra) => ({
    source: 'faction', factionId: slug, key: `faction:${slug}:${slugify(u.name)}`, name: u.name,
    basePoints: u.points, baseModels: u.models ?? 1, maxModels: u.models ?? 1, modelOptions: [],
    tags: u.tags ?? [], stats: u.modelProfile ?? null, impact: u.impact ?? null,
    attacks: u.attackProfiles ?? [], abilities: u.abilities ?? [], description: u.note ?? null,
    groups: upgradeGroup(u), heroOption: null,
    isCore: false, isHero: false, isLargeAsset: false, isLeader: false,
    unique: u.tags?.includes('Unique') ?? false, canDouble: false,
    ...extra,
  })
  const out = []
  for (const u of f.signatureCoreUnits ?? []) {
    const ref = coreReference.find((r) => r.faction === f.name && r.unit === u.name)
    out.push(base(u, { category: 'Core', slots: ref?.eligibleSlots ?? ['C'], isCore: true, canDouble: true }))
  }
  for (const u of f.captainAndSpecialists ?? []) {
    const hero = u.tags?.includes('Hero')
    const elite = u.tags?.includes('Elite')
    let slots
    if (u.role === 'Captain') slots = ['H']
    else if (u.role === 'Wizard') slots = hero ? ['H', 'S'] : ['S', 'E']
    else slots = elite ? ['S', 'E'] : ['S']
    out.push(base(u, { category: u.role, slots, isHero: !!hero }))
  }
  for (const u of f.largeAssets ?? []) {
    out.push(base(u, { category: 'Large Asset', slots: ['A'], isLargeAsset: true }))
  }
  if (f.factionLeader) {
    const u = f.factionLeader
    // A few leaders have no tags in the source data; leaders are treated as Heroes unless tagged otherwise.
    const hero = !u.tags?.length || u.tags.includes('Hero')
    out.push(base(u, { category: 'Leader', slots: ['H'], isHero: hero, isLeader: true, unique: true }))
  }
  return out
}

// ---------- catalog ----------

let catalogPromise

export function loadCatalog() {
  catalogPromise ??= loadAll().then((data) => {
    const rules = data['army_construction.json']
    const roster = data['factions/00_general_roster_rules.json']
    const coreReference = roster.generalRosterRules.signatureCoreRecruitmentReference.entries

    const factions = Object.entries(data)
      .filter(([path, d]) => path.startsWith('factions/') && d.signatureCoreUnits && d.factionCommands)
      .map(([, f]) => {
        const id = slugify(f.name)
        const r = rules.factions.find((x) => x.id === id)
        return {
          id,
          name: f.name,
          rule: f.factionRule,
          foundationSlots: r.foundationSlots,
          favoredDoctrines: r.favoredDoctrines,
          compatibleDoctrines: r.compatibleDoctrines,
          commands: f.factionCommands.map((c) => ({
            ...c,
            slot: r.commandSlots.find((x) => x.name === c.name)?.slot,
          })),
          units: factionEntries(f, coreReference),
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    const doctrines = Object.entries(data)
      .filter(([path, d]) => path.startsWith('doctrines/') && d.commands && d.foundationRecruitmentSlot)
      .map(([, d]) => ({
        id: slugify(d.name),
        name: d.name,
        foundationSlot: d.foundationRecruitmentSlot,
        strategy: d.strategy,
        commands: d.commands,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const generic = normalizeGeneric(data)
    const unitsByKey = Object.fromEntries([...generic, ...factions.flatMap((f) => f.units)].map((u) => [u.key, u]))
    return { rules, factions, doctrines, generic, unitsByKey }
  })
  return catalogPromise
}