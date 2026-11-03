import { ENEMY_TAGS } from './talents.js'

// Magic items and enchantments. Names, Points and rules text come from the rules data; the entries below say how an
// item changes the sheet. Anything without an entry (or with conditional effects) is shown as rules text instead.

export const SLOT_LIMITS = { focus: 1, artifact: 2 }
export const WEAPON_KINDS = ['melee', 'ranged']
const ARMOR_KINDS = ['armor', 'shield']
const ANY_KINDS = [...WEAPON_KINDS, ...ARMOR_KINDS]

const ward = (type, value) => ({ wards: [{ type, value }] })

// choice: what the player must pick for the item ('spell', 'ward' or 'category'); fx may be a function of that choice.
const SPEC = {
  // ----- weapon enchantments -----
  Flamebrand: { allowed: WEAPON_KINDS, fx: { weapon: { types: ['Magic', 'Fire'], keywords: ['Anti-Regeneration 1', 'Surge: +1 Damage on one Hit'] } } },
  Frostbite: { allowed: WEAPON_KINDS, fx: { weapon: { types: ['Magic'], keywords: ['On Damage: Slow 1'] } } },
  Stormcaller: { allowed: WEAPON_KINDS, fx: { weapon: { types: ['Magic'], keywords: ['Surge: Direct Damage 1 nearby (once per Round)'] } } },
  "Duelist's Edge": { allowed: WEAPON_KINDS, fx: { weapon: { critical: 1 } } },
  Giantslayer: { allowed: WEAPON_KINDS, fx: { weapon: { anti: { Monster: 2 }, keywords: ['Hit +1 step vs Monster or Wounds 6+'] } } },
  "Witch-Hunter's Weapon": { allowed: WEAPON_KINDS, fx: { weapon: { anti: { Magic: 1 }, keywords: ['Critical 1 vs Ward'] } } },
  'Vampiric Weapon': { allowed: WEAPON_KINDS, fx: { weapon: { keywords: ['On Damage: Heal 1 (once per Round)'] } } },
  'Weapon of Returning': { allowed: ['ranged'], fx: { weapon: { range: 3, keywords: ['Returning'] } } },
  // ----- armor enchantments -----
  'Armor of Resilience': { allowed: ['armor'], fx: { defenses: ['Tough 1'] } },
  'Spellguard Armor': { allowed: ['armor'], fx: { wardImprove: [{ type: 'magic', value: 6 }] } },
  'Armor of the Bastion': { allowed: ['armor'], fx: { defenses: ['Armor +1 step if you did not Move'] } },
  'Armor of Endurance': { allowed: ['armor'], fx: { wounds: 1, defenses: ['First Direct Damage each Round reduced by 1'] } },
  'Shadow Armor': { allowed: ['armor'], fx: { evadeSteps: 1, defenses: ['Concealed after Disengaging'] } },
  // ----- shield enchantments -----
  'Mirror Shield': { allowed: ['shield'], fx: ward('magic', 6) },
  'Shield of the Guardian': { allowed: ['shield'], fx: {} },
  'Spellbreaker Shield': { allowed: ['shield'], fx: {} },
  // ----- minor components -----
  'Accurate 1': { allowed: WEAPON_KINDS, fx: { weapon: { accurate: 1 } } },
  'Tough 1': { allowed: ARMOR_KINDS, fx: { defenses: ['Tough 1'] } },
  '+1" Attack Range': { allowed: ['ranged'], fx: { weapon: { range: 1 } } },
  '+1" Move while equipped': { allowed: ANY_KINDS, fx: { move: 1 } },
  'Anti-[Category] 1': {
    allowed: WEAPON_KINDS,
    choice: 'category',
    fx: (c) => ({ weapon: { anti: c ? { [c]: 1 } : {} } }),
  },
  'Magic Attack keyword': { allowed: WEAPON_KINDS, fx: { weapon: { types: ['Magic'] } } },
  // ----- major components -----
  'Critical 1': { allowed: WEAPON_KINDS, fx: { weapon: { critical: 1 } } },
  'Ward 6+ against one type': { allowed: ARMOR_KINDS, choice: 'ward', fx: (c) => (c ? ward(c, 6) : {}) },
  '+1 Maximum Wound': { allowed: ANY_KINDS, fx: { wounds: 1 } },
  '+1 Attack die on one profile': { allowed: WEAPON_KINDS, fx: { weapon: { attacks: 1 } } },
  'Improve Hit by 1 step': { allowed: WEAPON_KINDS, fx: { weapon: { hit: 1 } } },
  '+1 Damage on one profile': { allowed: WEAPON_KINDS, fx: { weapon: { damage: 1 } } },
  'Improve Armor by 1 step': { allowed: ARMOR_KINDS, fx: { armorSteps: 1 } },
  'Conditional Direct Damage 1': { allowed: WEAPON_KINDS, fx: { weapon: { keywords: ['Conditional Direct Damage 1'] } } },
  'Minor Item Command': { allowed: ANY_KINDS, custom: true, fx: {} },
  // ----- command-imprinted equipment -----
  'Blade of Focus': { allowed: WEAPON_KINDS, fx: {} },
  'Shield of Bracing': { allowed: ['shield'], fx: {} },
  // ----- foci -----
  'Arcane Focus': { choice: 'spell', fx: (c) => ({ spell: { target: c, range: 1 } }) },
  'Channeling Focus': { fx: {} },
  'Protective Focus': { fx: ward('magic', 6) },
  'Wand of Precision': { fx: {} },
  'Staff of Reach': { choice: 'spell', fx: (c) => ({ spell: { target: c, range: 2 } }) },
  'Staff of Echoes': { fx: {} },
  'Orb of Channeling': { fx: {} },
  'Holy Reliquary': { fx: {} },
  'Icon of Protection': { fx: {} },
  // ----- general artifacts -----
  'Boots of Swiftness': { fx: { move: 1 } },
  'Amulet of Warding': { choice: 'ward', fx: (c) => (c ? ward(c, 6) : {}) },
  // ----- relics -----
  'Blade of the Falling Star': { fx: {} },
  'Aegis of the First King': { fx: { armorSteps: 1, ...ward('magic', 5) } },
  'Crown of Command': { fx: {} },
  'Staff of the Archmage': { choice: 'spell', fx: (c) => ({ spell: { target: c, range: 2, attacks: 1 } }) },
  "Saint's Reliquary": { fx: ward('magic', 5) },
}

const RELIC_SLOT = { 'Melee Weapon': 'weapon', Shield: 'shield', Artifact: 'artifact', 'Magical Focus': 'focus' }

const entryOf = (group, raw, extra = {}) => {
  const spec = SPEC[raw.name] ?? {}
  return {
    key: `${group}:${raw.name}`,
    group,
    name: raw.name,
    points: raw.addedPoints ?? raw.points ?? 0,
    effect: raw.effect ?? raw.benefit ?? null,
    command: raw.command ?? null,
    allowed: spec.allowed ?? null,
    choice: spec.choice ?? null,
    custom: !!spec.custom,
    fx: typeof spec.fx === 'function' ? spec.fx : () => spec.fx ?? {},
    raw,
    ...extra,
  }
}

// Builds the lookup tables the Magic Items tab and the sheet engine both use.
export function buildMagic(files) {
  const group = (id, label, list, mapper) => ({ id, label, entries: list.map(mapper) })
  const enchantGroups = [
    group('weapon', 'Weapon enchantments', files.weapons.weaponEnchantments.enchantments, (e) => entryOf('weapon', e)),
    group('armor', 'Armor enchantments', files.armor.enchantments, (e) => entryOf('armor', e, { allowed: ['armor'] })),
    group('shield', 'Shield enchantments', files.shields.enchantments, (e) => entryOf('shield', e, { allowed: ['shield'] })),
    group('minor', 'Minor components', files.components.minorEnchantments.enchantments, (e) => entryOf('minor', e)),
    group('major', 'Major components', files.components.majorEnchantments.enchantments, (e) => entryOf('major', e)),
    group('imprint', 'Command-imprinted', files.imprint.examples.filter((e) => /Blade|Shield/.test(e.name)), (e) => entryOf('imprint', e)),
  ]
  const boots = files.imprint.examples.find((e) => /Boots/.test(e.name))
  const items = {
    focus: [
      ...files.foci.foci.map((f) => entryOf('focus', f, { source: 'Magical focus' })),
      ...files.arcaneFoci.foci.map((f) => entryOf('focus', f, { source: 'Arcane / divine focus' })),
    ],
    artifact: [
      ...files.artifacts.artifacts.map((a) => entryOf('artifact', a, { source: 'General artifact' })),
      ...(boots ? [entryOf('artifact', boots, { source: 'Command-imprinted' })] : []),
    ],
    relic: files.relics.relics.map((r) => entryOf('relic', r, { source: r.category, slot: RELIC_SLOT[r.category], profile: r.profile ?? null })),
  }
  const byKey = new Map([...enchantGroups.flatMap((g) => g.entries), ...Object.values(items).flat()].map((e) => [e.key, e]))
  return { enchantGroups, items, byKey }
}

export const CATEGORY_CHOICES = ENEMY_TAGS
export const WARD_CHOICES = [{ value: 'physical', label: 'Physical' }, { value: 'magic', label: 'Magic' }]

// Which slot an owned magic item occupies: 'focus', 'artifact', or (relics) 'weapon' / 'shield'.
export const slotOf = (item, entry) => (item.kind === 'relic' ? entry?.slot : item.kind)

// Combines per-attack modifiers; numbers add, lists concatenate and Anti-[Type] values add per type.
export function combineMods(a = {}, b = {}) {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) {
    if (typeof v === 'number') out[k] = (out[k] ?? 0) + v
    else if (Array.isArray(v)) out[k] = [...(out[k] ?? []), ...v]
    else if (v && typeof v === 'object') {
      const merged = { ...(out[k] ?? {}) }
      for (const [t, n] of Object.entries(v)) merged[t] = (merged[t] ?? 0) + n
      out[k] = merged
    }
  }
  return out
}
