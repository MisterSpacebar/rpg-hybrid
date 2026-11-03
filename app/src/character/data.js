import { buildMagic } from './magic.js'

// Character rules data is loaded lazily, only when the Characters tab is opened.
const files = import.meta.glob(
  [
    '../../../rules_data_json/pc/ancestries.json',
    '../../../rules_data_json/pc/classes/{warrior,rogue,mage,priest,artificer}.json',
    '../../../rules_data_json/pc/talents/*_talents.json',
    '../../../rules_data_json/pc/talents/*_specialization.json',
    '../../../rules_data_json/equipment/{01_melee_weapons,02_ranged_weapons,03_armor_and_shields}.json',
    '../../../rules_data_json/spells/{mage_spells,priest_spells}.json',
    '../../../rules_data_json/equipment/{04_magical_foci,06_magical_weapons,07_magical_armor,08_magical_shields,09_arcane_and_divine_foci,10_general_artifacts,11_relics,12_enchantment_components,13_command_imprinted_equipment}.json',
  ],
  { import: 'default' },
)

// Flattens the several shapes a talent's effect text is stored in into one readable string.
export function flat(v) {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v.map(flat).join(' ')
  const labels = { narrative: 'Narrative', structuredCombat: 'Structured Combat' }
  return Object.entries(v).map(([k, x]) => `${labels[k] ?? k}: ${flat(x)}`).join(' ')
}

// Formula Study teaches the five Formulas minus the two known at creation.
const MAX_RANKS = { 'formula-study': 3 }

function normalizeTalent(t, category) {
  const ranked = String(t.tier).includes('+')
  const baseTier = parseInt(t.tier, 10)
  return {
    id: t.id,
    name: t.name,
    category,
    baseTier,
    ranked,
    maxRank: ranked ? (MAX_RANKS[t.id] ?? 6 - baseTier) : 1,
    type: String(t.type ?? '').replace(/,?\s*Ranked\s*[—–-]?\s*/i, ' ').trim() || null,
    cost: t.cost ?? null,
    prerequisite: t.prerequisite ?? null,
    effect: flat(t.effect),
    options: t.options?.options ?? null,
  }
}

// Learnable spells per class: a general list plus one list per subclass (Elementalist also gets Flame Lance).
function spellCatalog(file) {
  const out = { general: [], bySubclass: {} }
  for (const [key, value] of Object.entries(file)) {
    if (!key.endsWith('Spells') || !value?.spells) continue
    const spells = [...value.spells, ...(value.additionalFireSpell ? [value.additionalFireSpell] : [])]
    if (key.startsWith('general')) out.general = spells
    else out.bySubclass[key.replace(/Spells$/, '')] = spells
  }
  return out
}

let cache = null

export function loadCharacterData() {
  cache ??= build()
  return cache
}

async function build() {
  const raw = Object.fromEntries(
    await Promise.all(Object.entries(files).map(async ([p, load]) => [p.split('rules_data_json/')[1], await load()])),
  )
  const talentsOf = (file, category) => raw[`pc/talents/${file}.json`].talents.map((t) => normalizeTalent(t, category))

  const shared = [
    ...talentsOf('generic_talents', 'Generic'),
    ...talentsOf('animal_companion_talents', 'Generic'),
    ...talentsOf('critical_specialization', 'Specialization'),
    ...talentsOf('social_specialization', 'Specialization'),
  ]
  const classes = ['warrior', 'rogue', 'mage', 'priest', 'artificer'].map((id) => raw[`pc/classes/${id}.json`])
  const talentsByClass = Object.fromEntries(classes.map((c) => [c.id, talentsOf(`${c.id}_talents`, c.name)]))

  const weapons = (file, kind) =>
    raw[`equipment/${file}.json`].categories.flatMap((cat) => cat.weapons.map((w) => ({ ...w, kind, category: cat.name })))
  const armorFile = raw['equipment/03_armor_and_shields.json']

  return {
    ancestries: raw['pc/ancestries.json'].ancestries,
    classes,
    shared,
    talentsByClass,
    melee: weapons('01_melee_weapons', 'melee'),
    ranged: weapons('02_ranged_weapons', 'ranged'),
    armor: armorFile.armorTypes,
    shield: armorFile.shields[0],
    armorAccess: armorFile.classArmorAccess.access,
    magic: buildMagic({
      foci: raw['equipment/04_magical_foci.json'],
      weapons: raw['equipment/06_magical_weapons.json'],
      armor: raw['equipment/07_magical_armor.json'],
      shields: raw['equipment/08_magical_shields.json'],
      arcaneFoci: raw['equipment/09_arcane_and_divine_foci.json'],
      artifacts: raw['equipment/10_general_artifacts.json'],
      relics: raw['equipment/11_relics.json'],
      components: raw['equipment/12_enchantment_components.json'],
      imprint: raw['equipment/13_command_imprinted_equipment.json'],
    }),
    spells: { mage: spellCatalog(raw['spells/mage_spells.json']), priest: spellCatalog(raw['spells/priest_spells.json']) },
  }
}
