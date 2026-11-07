// Ordinary Company crafting, improvements and bonus enchantment Qualities are
// generated automatically from legal options. This is a pure, seeded-by-caller
// rules helper: it never edits Company inventory or deducts Gold.
import { ANTI_TAGS } from '../../tags.js'
import { QUALITY_RULES, itemWorkState, availableQualities, validateQualityPlan } from './qualityEngine.js'

// A random source supplies a uniform number in [0, 1). The browser supplies
// cryptographic random values; tests inject a deterministic sequence.
const pick = (items, rng) => items[Math.min(items.length - 1,
  Math.floor(Math.max(0, Math.min(0.9999999999999999, rng())) * items.length))]

const exampleChoice = (id, currentChoice, rng) => {
  if (currentChoice) return currentChoice
  if (id === 'specialized') return ANTI_TAGS[0]
  if (id === 'warded') return pick(['physical', 'magic'], rng)
  return ''
}
const candidate = (id, old, state, rng) => ({
  id, ranks: (old?.ranks ?? 0) + 1,
  ...(QUALITY_RULES[id].choice
    ? { choice: old?.choice || exampleChoice(id, state.choices[id], rng) }
    : {}),
})
const plusOne = (plan, addition) => {
  const found = plan.findIndex((p) => p.id === addition.id)
  return found === -1 ? [...plan, addition] : plan.map((p,i) => i === found ? addition : p)
}
const legalNext = (item, data, roll, plan, opts, ids) => {
  const state = itemWorkState(item, data)
  if (!state) return []
  return ids.flatMap((id) => {
    const existing = plan.find((p) => p.id === id)
    // Only one named Quality per result; maximum three distinct names overall.
    if (!existing && plan.length >= 3) return []
    const row = candidate(id, existing, state, () => 0)
    try {
      const next = plusOne(plan, row)
      const result = validateQualityPlan(item, data, roll, next, opts)
      const current = validateQualityPlan(item, data, roll, plan, opts)
      // The Surge-unlocked first exceptional rank costs zero, otherwise the
      // random step must spend at least one excess success.
      const spent = result.spent - current.spent
      if (spent < 0 || (spent === 0 && !(QUALITY_RULES[id].exceptional &&
          !state.ranks[id] && !existing && roll.surges))) return []
      return [{ id, plan: next, spent }]
    } catch { return [] }
  })
}

/**
 * Return one finished immutable Quality allocation for a completed check.
 *
 * A successful Surge first unlocks a randomly selected legal exceptional
 * Quality (when one can be afforded). After that each iteration draws a
 * uniformly random eligible next increment from currently affordable ordinary
 * and already-unlocked exceptional ranks. A two-success Quality consumes both
 * successes; no success is silently spent twice. If all Qualities are capped,
 * unused successes are allowed.
 *
 * Anti-[Type] is randomly selected as a Quality, but its target is deliberately
 * left blank for the PC to choose. An existing Anti target stays committed.
 */
export function generateCraftingQualities(item, data, roll, opts = {}, rng = Math.random) {
  if (!roll?.success) return { plan: [], spent: 0, remaining: 0, addedPoints: 0, needsAntiTag: false }
  if (!itemWorkState(item, data)) throw new Error('The selected item has no equipment profile')
  let plan = []
  const allowed = availableQualities(item, data)
  const exceptional = allowed.filter((id) => QUALITY_RULES[id].exceptional)
  if (roll.surges) {
    const surgeOptions = legalNext(item, data, roll, plan, opts, exceptional)
      .filter((x) => (itemWorkState(item, data).ranks[x.id] ?? 0) === 0)
    if (surgeOptions.length) plan = pick(surgeOptions, rng).plan
  }
  const maxIterations = Math.max(1, (roll.qualities ?? 0) + 1)
  for (let i=0; i<maxIterations; i++) {
    const ids = allowed.filter((id) => !QUALITY_RULES[id].exceptional ||
      (itemWorkState(item,data).ranks[id] ?? 0) > 0 || plan.some((p) => p.id === id))
    const choices = legalNext(item, data, roll, plan, opts, ids)
      .filter((x) => x.spent > 0)
    if (!choices.length) break
    plan = pick(choices, rng).plan
  }
  // Warded's type is selected randomly; the PC explicitly chooses only
  // a newly generated Anti target. Previously chosen targets never change.
  const state = itemWorkState(item, data)
  const needsAntiTag = plan.some((p) => p.id === 'specialized' && !state.choices.specialized)
  if (needsAntiTag) plan = plan.map((p) =>
    p.id === 'specialized' ? { ...p, choice: '' } : p)
  const validationPlan = plan.map((p) => p.id === 'specialized' && !p.choice
    ? { ...p, choice: ANTI_TAGS[0] } : p)
  const summary = validateQualityPlan(item, data, roll, validationPlan, opts)
  return { plan, spent: summary.spent, remaining: summary.remaining,
    addedPoints: summary.addedPoints, needsAntiTag }
}
