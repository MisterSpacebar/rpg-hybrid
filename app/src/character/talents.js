import { ANTI_TAGS } from '../tags.js'

// The 6/5/4/3/2 talent trapezoid (rulebook: Experience and Advancement, section 2).
export const TIERS = [1, 2, 3, 4, 5]
export const TIER_CAP = { 1: 6, 2: 5, 3: 4, 4: 3, 5: 2 }
export const TIER_COST = { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25 }

export const talentPool = (data, classId) => [...data.shared, ...(data.talentsByClass[classId] ?? [])]

export const emptyTalents = () => ({ 1: [], 2: [], 3: [], 4: [], 5: [] })

export const allEntries = (talents) => TIERS.flatMap((tier) => (talents[tier] ?? []).map((entry) => ({ tier, entry })))

export const ownedRanks = (talents, id) => allEntries(talents).filter((x) => x.entry.id === id).length

export const xpSpent = (talents) => TIERS.reduce((sum, t) => sum + (talents[t]?.length ?? 0) * TIER_COST[t], 0)

// Why a talent cannot go in the next slot of this tier, or null when it can.
export function blockedReason(def, tier, talents, pool) {
  const owned = ownedRanks(talents, def.id)
  if (def.ranked) {
    if (owned >= def.maxRank) return 'All ranks taken'
    if (def.baseTier + owned !== tier) return `Next rank belongs in Tier ${def.baseTier + owned}`
  } else {
    if (owned) return 'Already taken'
    if (def.baseTier !== tier) return `Tier ${def.baseTier} talent`
  }
  const held = allEntries(withNames(talents, pool))
  const missing = (def.prerequisites ?? []).filter((name) => !held.some((x) => x.entry.name === name))
  return missing.length ? `Requires ${missing.join(', ')}` : null
}

// A tier's next slot is open once the tier below holds count + 2 talents (k talents need k + 1 beneath).
export function slotState(tier, talents) {
  const count = talents[tier].length
  if (count >= TIER_CAP[tier]) return { open: false, reason: 'Tier full' }
  if (tier > 1 && talents[tier - 1].length < count + 2) {
    const need = count + 2 - talents[tier - 1].length
    return { open: false, reason: `Needs ${need} more Tier ${tier - 1} talent${need > 1 ? 's' : ''}` }
  }
  return { open: true, reason: null }
}

export function availableTalents(pool, tier, talents) {
  return pool.filter((def) => !blockedReason(def, tier, talents, pool))
}

// Entries only store ids; prerequisites are written as talent names, so attach names for the lookup.
function withNames(talents, pool) {
  const byId = new Map(pool.map((d) => [d.id, d]))
  return Object.fromEntries(TIERS.map((t) => [t, (talents[t] ?? []).map((e) => ({ ...e, name: byId.get(e.id)?.name }))]))
}

// Drops anything that is no longer legal (class changed, a lower tier talent removed, ...) so the pyramid is always valid.
export function normalizeTalents(talents, pool) {
  const byId = new Map(pool.map((d) => [d.id, d]))
  const out = emptyTalents()
  for (const tier of TIERS) {
    const limit = tier === 1 ? TIER_CAP[1] : Math.min(TIER_CAP[tier], Math.max(0, out[tier - 1].length - 1))
    for (const entry of talents?.[tier] ?? []) {
      if (out[tier].length >= limit) break
      const def = byId.get(entry.id)
      if (!def) continue
      if (blockedReason(def, tier, out, pool)) continue
      out[tier].push(entry)
    }
  }
  return out
}

// ---------- choices a talent needs ----------

// Battlefield tags and creature types an Anti-[Type] ability can name (Keywords: Creature Types and Battlefield Tags).
export const ENEMY_TAGS = ANTI_TAGS

const SKILL = { key: 'skill', kind: 'skill', label: 'Skill to improve' }
const MODE = {
  key: 'mode',
  kind: 'select',
  label: 'This rank improves',
  options: [{ value: 'attacks', label: '+1 Attack die' }, { value: 'hit', label: 'Hit by 1 step' }],
  default: 'attacks',
}
const attack = (filter, extra = {}) => ({ key: 'attack', kind: 'attack', filter, label: 'Attack', ...extra })

// `sticky` choices are made at Rank I and shared by later ranks; `perRank` choices are made on every rank.
const prowess = (filter) => ({ family: 'prowess', sticky: [attack(filter, { label: 'Attack improved' })], perRank: [MODE, SKILL] })

export const TALENT_CHOICES = {
  'combat-prowess': prowess('any'),
  'martial-prowess': prowess('weapon'),
  'spell-prowess': prowess('spell'),
  'mobility-training': { perRank: [SKILL] },
  toughened: { perRank: [SKILL] },
  sharpeye: { perRank: [attack('ranged', { unique: true, label: 'Ranged attack (different each rank)' })] },
  'critical-prowess': { sticky: [attack('any')] },
  'long-range': { sticky: [attack('ranged')] },
  'extended-shot': { sticky: [attack('rangedNonFirearm', { label: 'Non-Firearm ranged weapon' })] },
  'spell-reach': { sticky: [attack('spell')] },
  'sacred-reach': { sticky: [attack('spell')] },
  'weapon-mastery': { perRank: [attack('melee', { unique: true, label: 'Melee weapon (different each rank)' })] },
  'exceptional-development': { perRank: [{ key: 'characteristic', kind: 'characteristic', unique: true, label: 'Characteristic' }] },
  'favored-enemy': { perRank: [{ key: 'enemy', kind: 'select', unique: true, label: 'Anti-[Type] 3 against (different each rank)', options: ENEMY_TAGS.map((t) => ({ value: t, label: t })) }] },
  'master-hunter': { perRank: [{ key: 'tag', kind: 'favoredTag', label: 'Favored Enemy tag raised to Anti 4' }] },
  'precision-shooting': { perRank: [attack('ranged', { label: 'Ranged Weapon or Spell Attack gaining Pinpoint' })] },
  'critical-force': { perRank: [attack('weapon', { label: 'Weapon Attack gaining Critical Force' })] },
  'greater-ward': {
    perRank: [{
      key: 'ward',
      kind: 'select',
      label: 'Improves Ward against',
      options: [{ value: 'physical', label: 'Physical' }, { value: 'magic', label: 'Magic' }],
      default: 'physical',
    }],
  },
  'formula-study': { perRank: [{ key: 'formula', kind: 'formula', unique: true, label: 'Formula learned' }] },
  'formula-prowess': { perRank: [{ key: 'note', kind: 'text', label: 'Formula and enhancements' }] },
}

export function choiceSpecs(def) {
  const rules = TALENT_CHOICES[def.id] ?? {}
  const specs = [...(rules.sticky ?? []).map((s) => ({ ...s, sticky: true })), ...(rules.perRank ?? [])]
  if (def.options) {
    specs.push({
      key: 'option',
      kind: 'select',
      label: 'Option',
      options: def.options.map((o) => ({ value: o.name, label: o.name, hint: o.effect })),
    })
  }
  return specs
}

// Rank (1-based) of the entry at this position, and the Rank I entry that holds its sticky choices.
export function rankInfo(talents, tier, index) {
  const id = talents[tier][index].id
  const earlier = allEntries(talents).filter((x) => x.entry.id === id && (x.tier < tier || (x.tier === tier && talents[tier].indexOf(x.entry) < index)))
  return { rank: earlier.length + 1, first: earlier[0]?.entry ?? talents[tier][index] }
}

export const choiceValue = (spec, entry, first) => (spec.sticky ? first[spec.key] : entry[spec.key]) ?? spec.default ?? ''
