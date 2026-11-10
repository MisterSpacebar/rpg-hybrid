import { flat } from './data.js'
import { SLOT_LIMITS, combineMods } from './magic.js'
import { canonicalTags, normalizeTag } from '../tags.js'
import { buildThrall } from './summons.js'
import { workEffects } from '../campaign/logic/qualityEngine.js'
export { buildThrall } from './summons.js'
import { choiceSpecs, emptyTalents, normalizeTalents, rankInfo, talentPool, TIERS, xpSpent } from './talents.js'

export const CHARACTERISTICS = ['body', 'agility', 'mind', 'spirit']
export const SKILLS = ['athletics', 'stealth', 'survival', 'awareness', 'lore', 'craft', 'medicine', 'influence', 'mysticism']

// Character Creation, Step 2: the Skills each Class may improve from its training.
export const CLASS_SKILLS = {
  warrior: ['athletics', 'survival', 'awareness', 'influence'],
  rogue: ['stealth', 'awareness', 'craft', 'influence'],
  mage: ['mysticism', 'lore', 'craft', 'awareness'],
  priest: ['medicine', 'mysticism', 'influence', 'lore'],
  artificer: ['craft', 'lore', 'awareness', 'mysticism'],
}

const ADAPTATION_SKILL = {
  'Keen Senses': 'awareness',
  Predator: 'stealth',
  Tracker: 'survival',
  'Sure-Footed': 'athletics',
  'Herbal Instinct': 'medicine',
  'Spirit-Touched': 'mysticism',
}

export const MAX_PREPARED = 4
const BASE_POINTS = 100
const PROWESS = new Set(['combat-prowess', 'martial-prowess', 'spell-prowess'])

export const emptyCharacter = () => ({
  cloudId: null,
  name: 'New Character',
  ancestry: 'human',
  size: 'M',
  humanBoost: null,
  adaptations: [],
  archetype: null,
  classId: 'warrior',
  subclassId: 'berserker',
  skillPicks: {},
  subclassSpell: null,
  formulas: [],
  fieldSpecialty: null,
  psychicBlade: false,
  spells: [],
  talents: emptyTalents(),
  gear: [],
  miscGear: [],
  prepared: [],
  otherPoints: 0,
  xpEarned: null,
  background: '',
  notes: '',
})

export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V']
export const talentTitle = (e) => `${e.def.name}${e.def.ranked ? ` ${ROMAN[e.rank]}` : ''}`

// Type, CP cost and the choices made for a talent, for compact display.
export const talentDetail = (e) =>
  [e.def.type, e.def.cost, e.entry.attack ?? e.first.attack, e.entry.skill && cap(e.entry.skill), e.entry.characteristic && cap(e.entry.characteristic), e.entry.formula, e.entry.enemy, e.entry.tag, e.entry.option]
    .filter(Boolean)
    .join(' · ')

// Commands for the printed sheet: Formulas get their own block, so only the other prepared Commands are listed here.
export const sheetCommands = (view) =>
  view.commands.filter((c) => !c.key.startsWith('formula:') && (c.always || view.prepared.includes(c.key)))

// Talents whose effect is already folded into the Stats, Skills or Attacks on the sheet; the printed sheet only needs their names.
const APPLIED_TALENTS = new Set([
  'combat-prowess', 'martial-prowess', 'spell-prowess', 'toughened', 'mobility-training', 'commanding-presence', 'sharpeye',
  'critical-prowess', 'long-range', 'extended-shot', 'spell-reach', 'sacred-reach', 'weapon-mastery', 'evasive-training',
  'exceptional-development', 'warded', 'greater-ward', 'formula-study', 'favored-enemy',
])

// Colour tone for gear and attack names: melee red, ranged green, armor and shields blue.
export function gearTone(g) {
  if (g.kind === 'melee' || (g.kind === 'relic' && g.def?.slot === 'weapon')) return 'melee'
  if (g.kind === 'ranged') return 'ranged'
  if (g.kind === 'armor' || g.kind === 'shield' || (g.kind === 'relic' && g.def?.slot === 'shield')) return 'armor'
  return null
}
export const attackTone = (a) => (a.melee ? 'melee' : 'ranged')

// Colour group for a talent: Commands (cost CP), talents that raise a stat, skill or attack on the sheet, or everything else.
// Formula Study and Favored Enemy are applied to the sheet too, but they teach or condition rather than raise a number.
const NOT_STAT = new Set(['formula-study', 'favored-enemy'])
export const talentKind = (def) => (def.cost ? 'command' : APPLIED_TALENTS.has(def.id) && !NOT_STAT.has(def.id) ? 'passive' : 'other')
export const TALENT_KINDS = [
  { id: 'passive', label: 'Stat boost' },
  { id: 'command', label: 'Command' },
  { id: 'other', label: 'Other' },
]

// Splits the talents for the printed sheet: abilities worth spelling out, versus a one-line list of everything else.
export function sheetTalents(entries) {
  const ability = (e) => !APPLIED_TALENTS.has(e.def.id) && !e.def.cost
  // Ranked talents appear once, at their highest rank.
  const highest = (list) => list.filter((e, i) => !list.some((x, j) => j > i && x.def.id === e.def.id))
  return {
    abilities: highest(entries.filter(ability)),
    other: highest(entries.filter((e) => !ability(e))),
  }
}
const num = (s) => Number.parseInt(String(s ?? '').match(/\d+/)?.[0], 10)
const plus = (n) => `${n}+`

const uid = () => Math.random().toString(36).slice(2, 10)
export const newGearItem = (kind, name, extra = {}) => ({ uid: uid(), kind, name, equipped: true, ...extra })

export const SPELL_CLASSES = ['mage', 'priest']

// Spells a character may learn: the Class list plus their own Subclass list (other subclasses need GM permission).
export function learnableSpells(data, classId, subclassId) {
  const catalog = data.spells[classId]
  if (!catalog) return []
  return [
    ...catalog.general.map((s) => ({ ...s, list: 'General' })),
    ...(catalog.bySubclass[subclassId] ?? []).map((s) => ({ ...s, list: 'Subclass' })),
  ]
}

export const spellProfile = (s) => ({ range: s.range, attacks: s.attacks, hit: s.hit, damage: s.damage, damageTypes: s.damageTypes, keywords: s.keywords })

// Brings a stored or freshly edited character back to a legal shape: valid class/subclass, a legal talent pyramid, trimmed picks.
export function normalizeCharacter(raw, data) {
  const char = { ...emptyCharacter(), ...raw }
  const ancestry = data.ancestries.find((a) => a.id === char.ancestry) ?? data.ancestries[0]
  const cls = data.classes.find((c) => c.id === char.classId) ?? data.classes[0]
  const sub = cls.subclasses.find((s) => s.id === char.subclassId) ?? cls.subclasses[0]
  char.ancestry = ancestry.id
  char.classId = cls.id
  char.subclassId = sub.id
  if (!['S', 'M', 'L'].includes(char.size)) char.size = 'M'
  char.skillPicks = Object.fromEntries(
    Object.entries(char.skillPicks ?? {}).filter(([s, v]) => SKILLS.includes(s) && (v === 'extra' || (v === 'class' && CLASS_SKILLS[cls.id].includes(s)))),
  )
  const formulaNames = new Set((sub.formulas ?? []).map((f) => f.name))
  char.formulas = (char.formulas ?? []).filter((f) => formulaNames.has(f)).slice(0, 2)
  if (ancestry.adaptations) char.adaptations = (char.adaptations ?? []).slice(0, ancestry.adaptations.chooseCount)
  if (!formulaNames.has(char.fieldSpecialty)) char.fieldSpecialty = null
  const spellNames = new Set((sub.subclassSpellAttacks?.spells ?? []).map((s) => s.name))
  if (!spellNames.has(char.subclassSpell)) char.subclassSpell = null
  if (char.psychicBlade && !sub.combatPhaseOptionalSpell) char.psychicBlade = false
  const learnable = learnableSpells(data, cls.id, sub.id).map((s) => s.name)
  char.spells = [...new Set(Array.isArray(char.spells) ? char.spells : [])].filter((n) => learnable.includes(n))
  if (char.humanBoost && !CHARACTERISTICS.includes(char.humanBoost)) char.humanBoost = null
  if (!Array.isArray(char.miscGear)) char.miscGear = []
  char.talents = normalizeTalents(char.talents, talentPool(data, cls.id))
  // Migrate saved Anti-Character choices without discarding talent ranks.
  for (const tier of Object.keys(char.talents)) {
    char.talents[tier] = char.talents[tier].map((entry) => ({
      ...entry,
      ...(entry.enemy ? { enemy: normalizeTag(entry.enemy) } : {}),
      ...(entry.tag ? { tag: normalizeTag(entry.tag) } : {}),
    }))
  }
  char.gear = (char.gear ?? []).map((item) => ({
    ...item,
    ...(item.choice === 'Character' ? { choice: 'Unique' } : {}),
    ...(item.enchants ? { enchants: item.enchants.map((e) => e.choice === 'Character' ? { ...e, choice: 'Unique' } : e) } : {}),
  }))
  return char
}

function attackFrom({ name, profile, source, points, label, equipped = true, firearm, gearUid }) {
  const range = profile.range ?? ''
  const ranged = !/^Engaged/i.test(range)
  return {
    name,
    source,
    label,
    points,
    equipped,
    gearUid,
    ranged,
    melee: !ranged,
    firearm: firearm ?? (profile.keywords ?? []).some((k) => /^Firearm/i.test(k)),
    phase: ranged ? 'Assault' : 'Combat',
    range,
    attacks: profile.attacks,
    hit: num(profile.hit),
    damage: profile.damage,
    damageTypes: [...(profile.damageTypes ?? [])],
    keywords: [...(profile.keywords ?? [])],
  }
}

export function gearDefinition(item, data) {
  if (item.kind === 'melee') return data.melee.find((w) => w.name === item.name)
  if (item.kind === 'ranged') return data.ranged.find((w) => w.name === item.name)
  if (item.kind === 'armor') return data.armor.find((a) => a.name === item.name)
  if (item.kind === 'shield') return data.shield
  if (['focus', 'artifact', 'relic'].includes(item.kind)) return data.magic.byKey.get(`${item.kind}:${item.name}`)
  return null
}

const matchesFilter = (a, filter) => {
  switch (filter) {
    case 'weapon': return a.source === 'weapon'
    case 'spell': return a.source === 'spell'
    case 'ranged': return a.ranged
    case 'rangedNonFirearm': return a.source === 'weapon' && a.ranged && !a.firearm
    case 'melee': return a.source === 'weapon' && a.melee
    default: return true
  }
}
export const attackMatches = matchesFilter

function finishAttack(a, m = {}) {
  const out = { ...a, keywords: [...a.keywords] }
  out.attacks = Math.max(1, a.attacks + (m.attacks ?? 0))
  out.hit = Math.min(6, Math.max(2, a.hit - (m.hit ?? 0)))
  out.damage = Math.max(1, a.damage + (m.damage ?? 0))
  if (m.range && /\d+/.test(a.range)) out.range = a.range.replace(/\d+/, (n) => String(Math.max(1, Number(n) + m.range)))
  if (m.accurate) {
    const i = out.keywords.findIndex((k) => /^Accurate\s+\d+/i.test(k))
    const n = Math.max(0, (i >= 0 ? num(out.keywords[i]) : 0) + m.accurate)
    if (i >= 0) out.keywords.splice(i, 1)
    if (n) out.keywords.push(`Accurate ${n}`)
  }
  if (m.crit) out.keywords.push(`Surge: Critical +${m.crit}`)
  if (m.longRange) out.keywords.push(`Long Range +${m.longRange}"`)
  // Keywords that stack by value merge into the existing one instead of repeating it.
  const stack = (re, label, n) => {
    const i = out.keywords.findIndex((k) => re.test(k))
    if (i >= 0) out.keywords[i] = `${label} ${num(out.keywords[i]) + n}`
    else out.keywords.push(`${label} ${n}`)
  }
  if (m.critical) stack(/^Critical\s+\d+/i, 'Critical', m.critical)
  for (const [type, n] of Object.entries(m.anti ?? {})) {
    const re = new RegExp(`^Anti-${type}\\s+\\d+`, 'i')
    const i = out.keywords.findIndex((k) => re.test(k))
    if (i >= 0) out.keywords[i] = `Anti-${type} ${Math.max(num(out.keywords[i]), n)}`
    else out.keywords.push(`Anti-${type} ${n}`)
  }
  for (const k of m.keywords ?? []) if (!out.keywords.includes(k)) out.keywords.push(k)
  for (const t of m.types ?? []) if (!out.damageTypes.includes(t)) out.damageTypes.push(t)
  out.hit = plus(out.hit)
  out.modified = Object.values(m).some((v) => (Array.isArray(v) ? v.length : v && typeof v === 'object' ? Object.keys(v).length : v))
  return out
}

export function knownFormulas(char, sub, entries) {
  const known = [...char.formulas]
  for (const e of entries) if (e.def.id === 'formula-study' && e.entry.formula && !known.includes(e.entry.formula)) known.push(e.entry.formula)
  return known.filter((f) => (sub.formulas ?? []).some((x) => x.name === f))
}

// Abilities that scale with a Characteristic ("Heal X, where X equals your Spirit characteristic", "Roll Body + Athletics")
// are rewritten with this character's actual numbers, so the sheet never needs the reader to do the arithmetic.
const X_DEFINITION = /(?:,\s*where|\bWhere|\bwhere)\s+X\s+(?:is|equals)\s+(half\s+(?:of\s+)?)?(?:your|the\s+[A-Za-z']+'s)\s+(Body|Agility|Mind|Spirit)(?:\s+characteristic)?(,\s*rounded up)?(\.?)/
const DICE_POOL = /\b(Body|Agility|Mind|Spirit)\s*\+\s*(Athletics|Stealth|Survival|Awareness|Lore|Craft|Medicine|Influence|Mysticism)\b/g

export function fillCharacteristics(text, characteristics, skills) {
  if (!text) return text
  let out = String(text)
  const m = out.match(X_DEFINITION)
  if (m) {
    const stat = m[2].toLowerCase()
    const base = characteristics[stat]
    const value = m[1] ? Math.ceil(base / 2) : base
    const note = `(${m[2]} ${base}${m[1] ? ', halved and rounded up' : ''})`
    const before = out.slice(0, m.index).replace(/\bX\b/g, String(value))
    const after = out.slice(m.index + m[0].length).replace(/\bX\b/g, String(value))
    // A definition sentence ("Where X is ...") follows its own full stop; fold the note into the previous sentence instead.
    const sentence = /^Where/.test(m[0])
    const head = sentence ? before.replace(/\.\s*$/, '') : before
    out = `${head} ${note}${m[4] || (sentence ? '.' : '')}${after}`.replace(/ {2,}/g, ' ')
  }
  return out.replace(DICE_POOL, (_, stat, skill) => `${stat} + ${skill} (${characteristics[stat.toLowerCase()]}D6, ${skills[skill.toLowerCase()]}+)`)
}
export function derive(char, data) {
  const ancestry = data.ancestries.find((a) => a.id === char.ancestry)
  const cls = data.classes.find((c) => c.id === char.classId)
  const sub = cls.subclasses.find((s) => s.id === char.subclassId)
  const pool = talentPool(data, cls.id)
  const poolById = new Map(pool.map((d) => [d.id, d]))
  const checks = []
  const check = (ok, label, detail) => checks.push({ ok, label, detail })

  const entries = TIERS.flatMap((tier) =>
    char.talents[tier].map((entry, index) => ({ tier, index, entry, def: poolById.get(entry.id), ...rankInfo(char.talents, tier, index) })),
  )
  const has = (id) => entries.some((e) => e.def.id === id)
  const ranksOf = (id) => entries.filter((e) => e.def.id === id).length

  // ----- ancestry -----
  const sizeChoice = ancestry.size.includes('–')
  const size = sizeChoice ? char.size : ancestry.size
  const adaptations = ancestry.adaptations ? char.adaptations.filter((n) => ancestry.adaptations.options.some((o) => o.name === n)) : []
  const archetype = ancestry.archetypes?.options.find((o) => o.id === char.archetype) ?? null
  const ancestryNeeds = []
  if (ancestry.id === 'human' && !char.humanBoost) ancestryNeeds.push('choose the Characteristic Adaptable raises')
  if (ancestry.adaptations && adaptations.length !== ancestry.adaptations.chooseCount) ancestryNeeds.push(ancestry.adaptations.chooseCount === 1 ? 'choose an Adaptation' : `choose ${ancestry.adaptations.chooseCount} Adaptations`)
  if (ancestry.archetypes && !archetype) ancestryNeeds.push('choose an Undead Archetype')
  check(!ancestryNeeds.length, 'Ancestry choices', ancestryNeeds.join('; ') || ancestry.name)

  // ----- characteristics -----
  const baseChar = { ...ancestry.characteristics }
  if (ancestry.id === 'human' && char.humanBoost) baseChar[char.humanBoost] += 1
  const characteristics = { ...baseChar }
  const edTaken = new Set()
  const edBenefit = { body: 0, agility: 0, mind: 0, spirit: 0 }
  for (const e of entries.filter((x) => x.def.id === 'exceptional-development')) {
    const k = e.entry.characteristic
    if (!k || edTaken.has(k) || characteristics[k] >= 6) continue
    edTaken.add(k)
    characteristics[k] += 1
    edBenefit[k] += 1
  }

  // ----- skills -----
  const classList = CLASS_SKILLS[cls.id]
  const classPicks = SKILLS.filter((s) => char.skillPicks[s] === 'class')
  const extraPicks = SKILLS.filter((s) => char.skillPicks[s] === 'extra')
  const steps = Object.fromEntries(SKILLS.map((s) => [s, 0]))
  for (const s of [...classPicks, ...extraPicks]) steps[s] += 1
  for (const n of adaptations) if (ADAPTATION_SKILL[n]) steps[ADAPTATION_SKILL[n]] += 1
  const creationSteps = { ...steps }
  for (const e of entries) {
    if (e.entry.skill && SKILLS.includes(e.entry.skill)) steps[e.entry.skill] += 1
    if (e.def.id === 'commanding-presence') steps.influence += 1
  }
  const skills = Object.fromEntries(SKILLS.map((s) => [s, Math.max(2, 6 - steps[s])]))
  const skillsAtCreation = Object.fromEntries(SKILLS.map((s) => [s, 6 - creationSteps[s]]))
  check(classPicks.length === 2, 'Class Skills', `${classPicks.length} of 2 chosen from ${classList.map(cap).join(', ')}`)
  check(extraPicks.length === 3, 'Background Skills', `${extraPicks.length} of 3 chosen`)
  const over = SKILLS.filter((s) => 6 - steps[s] < 2)
  if (over.length) check(false, 'Skill limit', `${over.map(cap).join(', ')} cannot improve past 2+`)
  const creationOver = SKILLS.filter((s) => skillsAtCreation[s] < 4)
  if (creationOver.length) check(false, 'Creation limit', `${creationOver.map(cap).join(', ')} cannot start better than 4+`)

  // ----- gear and attacks -----
  const gear = char.gear.map((item) => ({ ...item, def: gearDefinition(item, data) })).filter((g) => g.kind === 'custom' || g.def)
  // Enchantments count only while their item is equipped; unknown, disallowed or repeated ones are ignored.
  for (const g of gear) {
    const seen = new Set()
    g.workshop = workEffects(g, data)
    g.enchantList = (g.enchants ?? []).flatMap((e) => {
      const entry = data.magic.byKey.get(e.key)
      if (!entry || !entry.allowed?.includes(g.kind) || seen.has(e.key)) return []
      seen.add(e.key)
      const points = entry.custom ? Math.min(25, Math.max(15, Number(e.points) || 15)) : entry.points
      return [{ ...e, entry, points }]
    })
  }
  const equipped = gear.filter((g) => g.equipped)
  const slotKind = (g) => (g.kind === 'relic' ? g.def.slot : g.kind)
  const armorItem = equipped.find((g) => g.kind === 'armor')
  const shieldItem = equipped.find((g) => g.kind === 'shield')
  const basePoints = (g) => (g.kind === 'custom' ? Number(g.points) || 0 : g.def.points)
  const gearPoints = equipped.reduce((sum, g) => sum + basePoints(g) + (g.workshop?.points ?? 0) + g.enchantList.reduce((s, e) => s + e.points, 0), 0)

  // Everything equipped magic contributes, gathered once and applied to the stats, attacks and Commands below.
  const fx = { move: 0, wounds: 0, evadeSteps: 0, armorSteps: 0, workshopTough: 0, workshopCover: 0, wards: [], wardImprove: [], defenses: [] }
  const gearMods = {}
  const spellBumps = []
  const itemCommands = []
  const itemTraits = []
  const itemNeeds = []
  const applyMagic = (g, entry, picked, label, extra = {}) => {
    const f = entry.fx(entry.choice === 'category' ? normalizeTag(picked.choice) : picked.choice)
    fx.move += f.move ?? 0
    fx.wounds += f.wounds ?? 0
    fx.evadeSteps += f.evadeSteps ?? 0
    fx.armorSteps += f.armorSteps ?? 0
    fx.wards.push(...(f.wards ?? []))
    fx.wardImprove.push(...(f.wardImprove ?? []))
    fx.defenses.push(...(f.defenses ?? []))
    if (f.weapon) gearMods[g.uid] = combineMods(gearMods[g.uid], f.weapon)
    if (f.spell?.target) spellBumps.push(f.spell)
    if (entry.choice && !picked.choice) itemNeeds.push(`${entry.name} (${entry.choice === 'spell' ? 'Spell Attack' : entry.choice === 'ward' ? 'Ward type' : 'category'})`)
    const shown = picked.choice ? `${entry.name} (${picked.choice})` : entry.name
    // Enchantments are listed under the item they are on (see enchantList), not as traits.
    if (entry.effect && label) itemTraits.push({ source: label, name: shown, text: entry.effect, ...extra })
    const cmd = entry.command ?? (picked.cmdName ? { name: picked.cmdName, cost: '1 CP', timing: '', effect: picked.cmdText } : null)
    if (entry.custom && !picked.cmdName) itemNeeds.push(`${entry.name} (name its Command)`)
    if (cmd) {
      itemCommands.push({ key: `item:${g.uid}:${entry.name}`, name: cmd.name, source: `Item · ${g.name}`, timing: [cmd.cost, cmd.timing].filter(Boolean).join(' · '), effect: cmd.effect ?? '', always: true })
    }
  }
  for (const g of equipped) {
    if (g.kind === 'custom') continue
    if (['focus', 'artifact', 'relic'].includes(g.kind)) applyMagic(g, g.def, g, g.def.source ?? 'Magic item')
    for (const e of g.enchantList) applyMagic(g, e.entry, e, null)
    if (g.workshop) {
      fx.move += g.workshop.move
      fx.armorSteps += g.workshop.armor
      fx.wards.push(...g.workshop.wards)
      fx.workshopTough += g.workshop.toughAdjust
      fx.workshopCover += g.workshop.coverAdjust
      if (g.workshop.damaged) itemTraits.push({
        source: 'Workshop', name: 'Damaged', text: 'This item requires repair before further permanent improvement.',
      })
      if (g.kind === 'melee' || g.kind === 'ranged')
        gearMods[g.uid] = combineMods(gearMods[g.uid], g.workshop.mod)
    }
  }

  const candidates = []
  for (const g of gear.filter((x) => x.kind === 'melee' || x.kind === 'ranged')) {
    candidates.push(attackFrom({ name: g.name, profile: g.def.profile, source: 'weapon', points: g.def.points, equipped: g.equipped, gearUid: g.uid }))
    if (g.def.combatProfile) {
      candidates.push(attackFrom({ name: `${g.name} (melee)`, profile: g.def.combatProfile, source: 'weapon', points: 0, equipped: g.equipped, gearUid: g.uid }))
    }
  }
  for (const g of gear.filter((x) => x.kind === 'relic' && x.def.slot === 'weapon' && x.def.profile)) {
    candidates.push(attackFrom({ name: g.name, profile: g.def.profile, source: 'weapon', points: g.def.points, equipped: g.equipped, gearUid: g.uid }))
  }
  const spellAttack = (s, label, cost = 0) => attackFrom({ name: s.name, profile: s.profile, source: 'spell', points: cost, label })
  const spells = []
  for (const s of cls.baseSpellAttacks?.spells ?? []) spells.push(spellAttack(s, `${cls.name} spell`))
  const sc = sub.subclassSpellAttacks
  for (const s of sc?.spells ?? []) {
    if (!sc.chooseCount || char.subclassSpell === s.name) spells.push(spellAttack(s, `${sub.name} spell`))
  }
  const formulas = knownFormulas(char, sub, entries)
  for (const s of sub.formulaAttacks?.spells ?? []) if (formulas.includes(s.name)) spells.push(spellAttack(s, 'Formula'))
  if (char.psychicBlade && sub.combatPhaseOptionalSpell) {
    spells.push(spellAttack(sub.combatPhaseOptionalSpell, 'Optional spell', num(sub.combatPhaseOptionalSpell.cost)))
  }
  const learned = learnableSpells(data, cls.id, sub.id).filter((s) => char.spells.includes(s.name))
  for (const s of learned) spells.push(attackFrom({ name: s.name, profile: spellProfile(s), source: 'spell', points: s.points, label: 'Learned spell' }))
  const spellPoints = learned.reduce((sum, s) => sum + s.points, 0)
  candidates.push(...spells)
  const psychicPoints = char.psychicBlade && sub.combatPhaseOptionalSpell ? num(sub.combatPhaseOptionalSpell.cost) : 0

  if (sc?.chooseCount) check(!!char.subclassSpell, 'Subclass spell', char.subclassSpell ?? `choose one ${sub.name} Spell Attack on Gear > Spells`)
  if (cls.id === 'artificer') {
    check(char.formulas.length === 2, 'Starting Formulas', `${char.formulas.length} of 2 chosen from the ${sub.name} list (Gear > Formulas)`)
  }

  const mods = {}
  const mod = (name) => (mods[name] ??= {})
  const bump = (name, key, n = 1) => {
    if (name) mod(name)[key] = (mod(name)[key] ?? 0) + n
  }
  for (const e of entries) {
    const target = e.first.attack
    if (PROWESS.has(e.def.id)) bump(target, e.entry.mode === 'hit' ? 'hit' : 'attacks')
    else if (e.def.id === 'sharpeye') bump(e.entry.attack, 'accurate')
    else if (e.def.id === 'precision-shooting') {
      if (e.entry.attack) (mod(e.entry.attack).keywords ??= []).push('Pinpoint')
    }
    else if (e.def.id === 'critical-force' && e.entry.attack) {
      (mod(e.entry.attack).keywords ??= []).push(
        has('greater-critical-force') ? 'Critical Force +2 (one surviving Critical Hit)' : 'Critical Force +1 (one surviving Critical Hit)'
      )
    }
    else if (e.def.id === 'critical-prowess') bump(target, 'crit')
    else if (e.def.id === 'long-range') bump(target, 'longRange', 3)
    else if (['extended-shot', 'spell-reach', 'sacred-reach'].includes(e.def.id)) bump(target, 'range', 2)
    else if (e.def.id === 'weapon-mastery') bump(e.entry.attack, 'damage')
  }
  for (const s of spellBumps) {
    bump(s.target, 'range', s.range ?? 0)
    bump(s.target, 'attacks', s.attacks ?? 0)
  }
  const attacks = candidates.filter((a) => a.equipped).map((a) => finishAttack(a, combineMods(mods[a.name], gearMods[a.gearUid])))
  const carried = candidates.filter((a) => !a.equipped && a.source === 'weapon')

  // ----- stats -----
  const printed = cls.stats
  let move = num(printed.move)
  let wounds = printed.wounds
  let evade = num(printed.evade)
  if (ancestry.id === 'elf') move += 1
  if (ancestry.id === 'dwarf') wounds += 1
  move += ranksOf('mobility-training') + edBenefit.agility
  wounds += ranksOf('toughened') + edBenefit.body
  evade = Math.max(2, evade - ranksOf('evasive-training') - edBenefit.mind)
  let armor = num(printed.armor)
  if (armorItem) armor = Math.min(armor, num(armorItem.def.armor))
  if (shieldItem) armor = Math.max(2, armor - 1)
  armor = Math.min(6, Math.max(2, armor - fx.armorSteps))
  move += fx.move
  wounds += fx.wounds
  evade = Math.max(2, evade - fx.evadeSteps)
  if (armorItem && /Move\s*[−-]\s*1/.test(armorItem.def.additionalRule ?? '')) move -= 1

  const wardImprove = (v, n) => (v == null ? null : Math.max(2, v - n))
  const best = (a, b) => (a == null ? b : b == null ? a : Math.min(a, b))
  let general = has('warded') ? wardImprove(6, edBenefit.spirit) : null
  const greater = entries.filter((e) => e.def.id === 'greater-ward').map((e) => e.entry.ward ?? 'physical')
  const bonus = (type) => greater.filter((t) => t === type).length
  let physical = best(general, ancestry.id === 'undead' && archetype?.id === 'spirit' ? 6 : null)
  let magic = best(general, ancestry.id === 'tiefling' ? 6 : null)
  for (const w of fx.wards) {
    if (w.type === 'physical') physical = best(physical, w.value)
    else magic = best(magic, w.value)
  }
  // "Gain Ward 6+ or improve an existing Ward by 1 step" (e.g. Spellguard Armor).
  for (const w of fx.wardImprove) {
    if (w.type === 'physical') physical = physical == null ? w.value : wardImprove(physical, 1)
    else magic = magic == null ? w.value : wardImprove(magic, 1)
  }
  physical = wardImprove(physical, bonus('physical'))
  magic = wardImprove(magic, bonus('magic'))
  const ward = physical == null && magic == null ? null : physical === magic ? plus(physical) : [physical != null ? `Phys ${plus(physical)}` : null, magic != null ? `Magic ${plus(magic)}` : null].filter(Boolean).join(' / ')

  const stats = { move: `${move}"`, wounds, armor: plus(armor), evade: plus(evade), ward }
  const printedStats = { move: printed.move, wounds: printed.wounds, armor: printed.armor, evade: printed.evade, ward: null }
  const changed = Object.keys(stats).filter((k) => String(stats[k] ?? '') !== String(printedStats[k] ?? ''))
  // Mighty Impact gives Impact X (X = rank) on a successful Charge. PCs have no printed Charge/Impact, so it always shows as gained.
  const impact = has('mighty-impact') ? `+${ranksOf('mighty-impact')}` : null
  const charge = null
  if (impact) changed.push('impact')

  // ----- traits and commands -----
  const traits = [{ source: ancestry.name, name: ancestry.traitName ?? 'Ancestry', text: ancestry.traits.join(' '), ancestry: true }]
  for (const n of adaptations) traits.push({ source: 'Adaptation', name: n, text: ancestry.adaptations.options.find((o) => o.name === n).effect, ancestry: true })
  if (archetype) traits.push({ source: 'Undead Archetype', name: archetype.name, text: archetype.effect, ancestry: true })
  // Each Favored Enemy rank names a different tag at Anti 3; Master Hunter raises one of those tags to Anti 4.
  const huntedTag = normalizeTag(entries.find((e) => e.def.id === 'master-hunter')?.entry.tag)
  for (const { entry } of entries.filter((e) => e.def.id === 'favored-enemy')) {
    if (!entry.enemy) continue
    const enemy = normalizeTag(entry.enemy)
    const x = enemy === huntedTag ? 4 : 3
    traits.push({
      source: enemy === huntedTag ? 'Favored Enemy · Master Hunter' : 'Favored Enemy',
      name: `Anti-${enemy} ${x}`,
      text: `Gain ${x} additional Attack dice against Units with the ${enemy} tag. This does not raise Damage.`,
    })
  }
  // The Artificer's Field Formulae ability just says how to pick Formulas, so the sheet lists the Formulas themselves instead.
  if (cls.classAbility && cls.id !== 'artificer') traits.push({ source: `${cls.name} Class Ability`, name: cls.classAbility.name, text: flat(cls.classAbility.effect), timing: [cls.classAbility.cost, cls.classAbility.timing].filter(Boolean).join(' · '), klass: true })
  // Unique denotes a PC or an explicitly named/legendary figure, not a generic
  // Hero. Ancestry and creature-type tags are independent of army allegiance.
  const tags = canonicalTags([...(ancestry.tags ?? []), ...(archetype?.tags ?? []), ...(cls.tags ?? []), ...(sub.additionalTags ?? []), 'Unique', 'Hero'])

  const commands = []
  const signature = sub.signatureAbility
  // A passive signature (the Ranger's Hunter's Eye) has no CP cost to prepare, so it reads as a trait.
  if (signature && !signature.cost && /^passive/i.test(signature.timing ?? '')) {
    traits.push({ source: `${sub.name} Signature`, name: signature.name, text: flat(signature.effect), timing: 'Passive', klass: true })
  } else if (signature) {
    const s = signature
    commands.push({ key: 'signature', name: s.name, source: `${sub.name} Signature`, timing: [s.cost, s.timing].filter(Boolean).join(' · '), effect: flat(s.effect), always: true })
  }
  if (cls.id === 'artificer') {
    const specialty = formulas.includes(char.fieldSpecialty) ? char.fieldSpecialty : formulas[0]
    for (const name of formulas) {
      const f = sub.formulas.find((x) => x.name === name)
      commands.push({ key: `formula:${name}`, name, source: name === specialty ? 'Field Specialty' : 'Formula', timing: f.timing, effect: f.summary, always: name === specialty })
    }
  }
  for (const e of entries) {
    if (e.def.cost) commands.push({ key: `talent:${e.def.id}`, name: e.def.name, source: 'Talent', timing: [e.def.cost, e.def.type].filter(Boolean).join(' · '), effect: e.def.effect, always: false })
  }
  // Item Commands are available while the item is equipped and never use the four optional prepared slots.
  commands.push(...itemCommands)
  traits.push(...itemTraits)
  // Rewrite Characteristic-dependent text with this character's numbers.
  const fill = (t) => fillCharacteristics(t, characteristics, skills)
  traits.forEach((t) => { t.text = fill(t.text) })
  commands.forEach((cmd) => { cmd.effect = fill(cmd.effect) })
  entries.forEach((e) => { e.text = fill(e.def.effect) })
  const optional = commands.filter((c) => !c.always)
  const prepared = char.prepared.filter((k) => optional.some((c) => c.key === k))
  const formulaList = commands
    .filter((c) => c.key.startsWith('formula:'))
    .map((c) => ({ name: c.name, timing: c.timing, effect: c.effect, specialty: c.always, prepared: c.always || prepared.includes(c.key), attack: attacks.find((a) => a.name === c.name) ?? null }))
  check(prepared.length <= MAX_PREPARED, 'Prepared Commands', `${prepared.length} of ${MAX_PREPARED} optional slots used`)

  // ----- talent choices -----
  const missing = []
  const lost = []
  for (const e of entries) {
    for (const spec of choiceSpecs(e.def)) {
      const v = spec.sticky ? e.first[spec.key] : e.entry[spec.key]
      if (spec.default || (v != null && v !== '')) {
        if (spec.kind === 'attack' && v && !candidates.some((a) => a.name === v)) lost.push(`${e.def.name}: ${v}`)
        continue
      }
      missing.push(`${e.def.name} (${spec.label.toLowerCase()})`)
    }
  }
  check(!missing.length, 'Talent choices', missing.length ? `Still to choose: ${[...new Set(missing)].join('; ')}` : `${entries.length} talents`)
  if (lost.length) check(false, 'Talent targets', `No longer available: ${[...new Set(lost)].join('; ')}. Re-equip it or pick a new target.`)

  // ----- gear checks -----
  const access = data.armorAccess.find((a) => a.class === cls.name)?.normalArmorAccess
  const restricted = []
  if (access) {
    if (armorItem && !new RegExp(armorItem.name.split(' ')[0], 'i').test(access)) restricted.push(armorItem.name)
    if (shieldItem && !/shield/i.test(access)) restricted.push('Shield')
  }
  check(!restricted.length, 'Armor access', restricted.length ? `${cls.name}s cannot normally use ${restricted.join(', ')}` : access ?? 'No restriction printed for this Class')
  const melee = equipped.filter((g) => g.kind === 'melee' || (g.kind === 'relic' && g.def.slot === 'weapon')).length
  const ranged = equipped.filter((g) => g.kind === 'ranged').length
  check(melee <= 1 && ranged <= 1, 'Equipped weapons', melee <= 1 && ranged <= 1 ? 'One primary melee and one ranged weapon' : 'Normally one primary melee and one ranged weapon; extra weapons should be backups')

  // ----- magic items -----
  const equippedMagic = equipped.filter((g) => ['focus', 'artifact', 'relic'].includes(g.kind))
  const count = (slot) => equipped.filter((g) => slotKind(g) === slot).length
  const shields = count('shield')
  const overSlots = [
    count('focus') > SLOT_LIMITS.focus && `${count('focus')} Foci (limit ${SLOT_LIMITS.focus})`,
    count('artifact') > SLOT_LIMITS.artifact && `${count('artifact')} Artifacts (limit ${SLOT_LIMITS.artifact})`,
    shields > 1 && `${shields} Shields (limit 1)`,
  ].filter(Boolean)
  if (equippedMagic.length || overSlots.length) {
    check(!overSlots.length, 'Magic item slots', overSlots.join('; ') || `${count('focus')}/${SLOT_LIMITS.focus} Focus · ${count('artifact')}/${SLOT_LIMITS.artifact} Artifacts`)
  }
  const lostTargets = equipped.flatMap((g) => [...(['focus', 'artifact', 'relic'].includes(g.kind) ? [{ entry: g.def, choice: g.choice }] : []), ...g.enchantList]
    .filter((x) => x.entry.choice === 'spell' && x.choice && !candidates.some((a) => a.name === x.choice))
    .map((x) => `${x.entry.name}: ${x.choice}`))
  if (itemNeeds.length || lostTargets.length) {
    check(false, 'Item choices', [itemNeeds.length ? `Still to choose: ${itemNeeds.join('; ')}` : null, lostTargets.length ? `No longer available: ${lostTargets.join('; ')}` : null].filter(Boolean).join('. '))
  }

  // ----- points -----
  const spent = xpSpent(char.talents)
  const other = Number(char.otherPoints) || 0
  const points = {
    base: Math.max(BASE_POINTS, spent),
    spent,
    gear: gearPoints + psychicPoints,
    spells: spellPoints,
    other,
    total: Math.max(BASE_POINTS, spent) + gearPoints + psychicPoints + spellPoints + other,
  }
  const earned = char.xpEarned == null || char.xpEarned === '' ? null : Number(char.xpEarned)
  if (earned != null) check(spent <= earned, 'Experience', spent <= earned ? `${earned - spent} XP unspent` : `${spent - earned} XP over the ${earned} earned`)

  const toughTotal = Math.max(0, fx.workshopTough + fx.defenses.filter((d) => /^Tough \d+$/.test(d)).reduce((sum, d) => sum + num(d), 0))
  const coverTotal = Math.max(0, fx.workshopCover + fx.defenses.filter((d) => /^Cover \d+$/.test(d)).reduce((sum, d) => sum + num(d), 0))
  const defenses = [...(toughTotal ? [`Tough ${toughTotal}`] : []), ...(coverTotal ? [`Cover ${coverTotal}`] : []), ...new Set(fx.defenses.filter((d) => !/^(Tough|Cover) \d+$/.test(d)))]

  const thrall = sub.summonedUnit ? buildThrall(sub.summonedUnit, characteristics, skills, traits, attacks, char.factionId ?? null) : null

  return {
    ancestry, cls, sub, size, sizeChoice, tags, adaptations, archetype,
    characteristics, baseChar, skills, skillSteps: steps, skillsAtCreation, classList, classPicks, extraPicks,
    stats, printedStats, changed, charge, impact, defenses, attacks, carried, attackOptions: candidates, gear, points, learned,
    traits, commands, prepared, formulas, formulaList, entries, checks, pool, thrall,
  }
}
