import { ANTI_TAGS } from '../tags.js'
// Canonical permanent equipment improvements shared by crafting, enchanting,
// repair, the Company inventory, and the Character sheet. Only purchased item
// records carry these events; a PC draft is never authoritative.
export const MAX_WORK_EVENTS = 8
export const QUALITY_RULES = Object.freeze({
  balanced: { name: 'Balanced', keyword: 'Accurate', allowed: ['melee','ranged'], max: 3, cost: 1, points: 10 },
  specialized: { name: 'Specialized', keyword: 'Anti', allowed: ['melee','ranged'], max: 3, cost: 1, points: 10, choice: 'tag' },
  extended: { name: 'Extended', allowed: ['ranged'], max: 3, cost: 1, points: 5 },
  reinforced: { name: 'Reinforced', keyword: 'Tough', allowed: ['armor','shield'], max: 2, cost: 1, points: 15 },
  sheltering: { name: 'Sheltering', keyword: 'Cover', allowed: ['armor'], armorNames: ['Light Armor', 'Medium Armor'], max: 2, cost: 1, points: 15 },
  swift: { name: 'Swift', allowed: ['melee','ranged','armor','shield'], max: 2, cost: 1, points: 10 },
  deadly: { name: 'Deadly', allowed: ['melee','ranged'], max: 2, cost: 1, points: 15 },
  precise: { name: 'Precise', allowed: ['melee','ranged'], max: 1, cost: 2, points: 20 },
  protective: { name: 'Protective', allowed: ['armor','shield'], max: 1, cost: 2, points: 20 },
  exceptionalEdge: { name: 'Exceptional Edge', keyword: 'Critical', allowed: ['melee','ranged'], max: 2, cost: 1, points: 30, exceptional: true },
  destructive: { name: 'Destructive', allowed: ['melee','ranged'], max: 1, cost: 2, points: 30, exceptional: true },
  warded: { name: 'Warded', allowed: ['armor','shield'], max: 1, cost: 1, points: 20, exceptional: true, magical: true, choice: 'ward' },
})
const BASE_ENCHANT_QUALITY = Object.freeze({
  'minor:Accurate 1': 'balanced',
  'minor:Tough 1': 'reinforced',
  'minor:+1" Attack Range': 'extended',
  'minor:+1" Move while equipped': 'swift',
  'minor:Anti-[Category] 1': 'specialized',
  'major:Critical 1': 'exceptionalEdge',
})
const INC = (id, rankBefore, amount) => id === 'exceptionalEdge'
  ? Array.from({ length: amount }, (_, i) => rankBefore + i === 0 ? 30 : 15).reduce((a,b)=>a+b,0)
  : (QUALITY_RULES[id]?.points ?? 0) * amount
const asInt = (v) => Number.isInteger(v) && v >= 0 ? v : 0
const keywordRank = (profile, word) => {
  const m = (profile?.keywords ?? []).find((x) => new RegExp('^' + word + ' +[0-9]+','i').test(x))
  return Number(m?.match(/\d+/)?.[0] ?? 0)
}
const empty = () => ({})

export function itemDefinition(item, data) {
  if (!item || !data) return null
  return item.kind === 'shield' ? data.shield
    : (['melee','ranged','armor'].includes(item.kind)
      ? data[item.kind]?.find((x) => x.name === item.name) : null)
}
export function qualityAllowed(id, item) {
  const q = QUALITY_RULES[id]
  return !!q && !!item && (q.allowed.includes(item.kind) || (id === 'extended' && item.kind === 'melee' && /^Engaged\\s+\\d+/.test(item.profile?.range ?? ''))) &&
    (!q.armorNames || q.armorNames.includes(item.name)) &&
    !(id === 'extended' && !/\d+/.test(item.profile?.range ?? ''))
}

export function itemWorkState(item, data) {
  const def = itemDefinition(item, data)
  if (!def) return null
  const ranks = empty(), choices = empty(), paidRanks = empty(), defects = empty()
  let points = 0, damaged = false
  // Existing fixed Enchantments keep their original Points and work alongside
  // new ranked additions (their effects are applied by the old magic engine).
  for (const e of item.enchants ?? []) {
    const id = BASE_ENCHANT_QUALITY[e.key]
    if (id) {
      ranks[id] = (ranks[id] ?? 0) + 1
      if (e.choice) choices[id] = e.choice
    }
  }
  const events = (item.workshopEvents ?? []).slice(0, MAX_WORK_EVENTS)
  for (const event of events) {
    if (event.repair) {
      if (event.repair === 'damaged') damaged = false
      else defects[event.repair] = Math.max(0, (defects[event.repair] ?? 0) - 1)
    }
    for (const p of event.plan ?? []) {
      if (!QUALITY_RULES[p.id]) continue
      const prior = ranks[p.id] ?? 0
      const n = asInt(p.ranks)
      points += INC(p.id, prior, n)
      ranks[p.id] = prior + n
      paidRanks[p.id] = (paidRanks[p.id] ?? 0) + n
      if (p.choice) choices[p.id] = p.choice
    }
    if (event.flaw) {
      if (event.flaw === 'damaged') damaged = true
      else defects[event.flaw] = (defects[event.flaw] ?? 0) + 1
    }
  }
  return { ranks, paidRanks, choices, defects, damaged, points, def, events }
}
export function availableQualities(item, data) {
  const def = itemDefinition(item, data)
  return def ? Object.keys(QUALITY_RULES).filter((id) => qualityAllowed(id, { ...item, profile: def.profile })) : []
}
const validChoice = (q, choice) => !q.choice || (q.choice === 'ward'
  ? ['physical','magic'].includes(choice)
  : ANTI_TAGS.includes(choice))

// This validates the *increment* purchased by a single check; ranks may already
// exist on the owned item. No excess success can be spent twice.
export function validateQualityPlan(item, data, roll, plan = [], opts = {}) {
  const state = itemWorkState(item, data)
  if (!state || !Array.isArray(plan) || plan.length > 3) throw new Error('Invalid equipment Quality selection')
  if (!roll?.success && plan.length) throw new Error('Failed projects cannot improve equipment')
  const ranks = { ...state.ranks }, names = new Set(Object.keys(ranks).filter((k) => ranks[k] > 0))
  const seen = new Set()
  let spend = 0, exceptionalNew = 0, addedPoints = 0
  for (const p of plan) {
    const q = QUALITY_RULES[p?.id]
    if (!q || seen.has(p.id) || !Number.isInteger(p.ranks) || p.ranks < 1 ||
        !qualityAllowed(p.id, { ...item, profile: state.def.profile }) || !validChoice(q, p.choice)) {
      throw new Error('Invalid or incompatible ranked Quality')
    }
    if (q.choice && state.choices[p.id] && p.choice !== state.choices[p.id]) {
      throw new Error('A ranked Quality cannot change its chosen target')
    }
    seen.add(p.id)
    const prior = ranks[p.id] ?? 0
    if (prior + p.ranks > q.max) throw new Error(q.name + ' exceeds its normal rank cap')
    if (q.exceptional && !prior) {
      if (q.magical && opts.magical !== true) throw new Error(q.name + ' requires Mysticism and magical materials')
      exceptionalNew++
      if (!roll?.surges) throw new Error(q.name + ' must be unlocked by a Skill Check Surge')
      spend += q.id === 'exceptionalEdge' ? p.ranks - 1 : p.ranks * q.cost
    } else {
      spend += p.ranks * q.cost
    }
    addedPoints += INC(p.id, prior, p.ranks)
    ranks[p.id] = prior + p.ranks
    names.add(p.id)
  }
  if (exceptionalNew > 1 || [...names].filter((k) => QUALITY_RULES[k]?.exceptional).length > 1) {
    throw new Error('Ordinary equipment may have only one exceptional Quality')
  }
  if (names.size > 3) throw new Error('Ordinary equipment supports at most three distinct Qualities')
  if (spend > (roll?.qualities ?? 0)) throw new Error('Insufficient excess successes for selected ranks')
  if (state.damaged && plan.length) throw new Error('Damaged equipment must be repaired before improvement')
  if ((state.events?.length ?? 0) >= MAX_WORK_EVENTS) throw new Error('Item work history is full')
  return { spent: spend, remaining: (roll?.qualities ?? 0) - spend, addedPoints, ranks, names: [...names] }
}

const baseNum = (s) => Number(String(s ?? '').match(/\d+/)?.[0] ?? 0)
export function eligibleDeteriorations(item, data, plan = []) {
  const work = { ...item, workshopEvents: [...(item.workshopEvents ?? []), { kind:'improve', plan }] }
  const state = itemWorkState(work, data)
  if (!state) return []
  const { def, ranks, defects } = state
  const keys = []
  const profile = def.profile
  if (profile) {
    if ((profile.attacks ?? 1) + (ranks.deadly ?? 0) - (defects.attacks ?? 0) > 1) keys.push('attacks')
    if (baseNum(profile.hit) - (ranks.precise ?? 0) + (defects.hit ?? 0) < 6) keys.push('hit')
    if ((profile.damage ?? 1) + (ranks.destructive ?? 0) - (defects.damage ?? 0) > 1) keys.push('damage')
    if (/\d+/.test(profile.range) && baseNum(profile.range) + (ranks.extended ?? 0) - (defects.range ?? 0) > 1) keys.push('range')
  }
  if (item.kind === 'armor' && baseNum(def.armor) - (ranks.protective ?? 0) + (defects.armor ?? 0) < 6) keys.push('armor')
  if (item.kind === 'shield' && (defects.armor ?? 0) < 1) keys.push('armor')
  if ((ranks.swift ?? 0) > (defects.swift ?? 0) + (defects.move ?? 0)) keys.push('move')
  for (const id of Object.keys(QUALITY_RULES)) if ((ranks[id] ?? 0) > (defects[id] ?? 0)) keys.push(id)
  // Intrinsic printed reroll keywords can be weakened as well.
  if (keywordRank(profile,'Accurate') > (defects.accurate ?? 0)) keys.push('accurate')
  if (!keys.length) keys.push('damaged')
  return keys
}
export function randomDeterioration(item, data, plan = [], rand = Math.random) {
  const options = eligibleDeteriorations(item, data, plan)
  return options[Math.min(options.length - 1, Math.floor(rand() * options.length))]
}
export function repairOptions(item, data) {
  const s = itemWorkState(item, data)
  if (!s) return []
  return [...Object.entries(s.defects).filter(([,v]) => v > 0).map(([k]) => k),
    ...(s.damaged ? ['damaged'] : [])]
}

// Effective effects apply once to the character even when one item is
// enchanted repeatedly. Damaged stats change current performance, not Points.
export function workEffects(item, data) {
  const s = itemWorkState(item, data)
  if (!s) return null
  const rank = (id) => (s.paidRanks[id] ?? 0) - (s.defects[id] ?? 0)
  const pos = (id) => Math.max(0, rank(id))
  const mod = { attacks: rank('deadly') - (s.defects.attacks ?? 0),
    hit: rank('precise') - (s.defects.hit ?? 0),
    damage: rank('destructive') - (s.defects.damage ?? 0),
    range: rank('extended') - (s.defects.range ?? 0),
    accurate: rank('balanced') - (s.defects.accurate ?? 0),
    critical: rank('exceptionalEdge'),
    anti: {},
  }
  if (pos('specialized') && s.choices.specialized) mod.anti[s.choices.specialized] = pos('specialized')
  const defenses = []
  if (pos('reinforced')) defenses.push('Tough ' + pos('reinforced'))
  if (pos('sheltering')) defenses.push('Cover ' + pos('sheltering'))
  return {
    points: s.points,
    mod,
    armor: rank('protective') - (s.defects.armor ?? 0),
    move: rank('swift') - (s.defects.move ?? 0),
    toughAdjust: rank('reinforced'), coverAdjust: rank('sheltering'),
    defenses,
    wards: pos('warded') && s.choices.warded ? [{type:s.choices.warded, value:6}] : [],
    damaged: s.damaged,
    defects: s.defects,
    ranks: s.ranks,
  }
}
