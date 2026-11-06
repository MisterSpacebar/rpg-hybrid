import { blockedReason, normalizeTalents, talentPool, TIERS } from '../character/talents.js'

export const RETRAINING_GOLD = 2
export const developOrderId = ({ act, turn }) => `act-${act}-turn-${turn}`

export function retrainingChoices(sheet, data, tier, index) {
  const talents = sheet?.talents
  const existing = talents?.[tier]?.[index]
  if (!existing) return []
  const pool = talentPool(data, sheet.classId)
  const without = { ...talents, [tier]: talents[tier].filter((_, i) => i !== index) }
  return pool.filter((def) => def.id !== existing.id && !blockedReason(def, tier, without, pool))
}

export function replacedTalents(talents, tier, index, replacement) {
  if (!TIERS.includes(tier) || !Number.isInteger(index) || index < 0 ||
      !talents?.[tier]?.[index] || !replacement?.id) throw new Error('Select an owned Talent and replacement')
  return { ...talents, [tier]: talents[tier].map((e, i) => i === index ? replacement : e) }
}

export function checkRetraining(sheet, data, tier, index, replacement, deriveCandidate = null) {
  if (!retrainingChoices(sheet, data, tier, index).some((x) => x.id === replacement?.id)) {
    return { ok: false, error: 'Choose a different legal Talent in the same Tier' }
  }
  const talents = replacedTalents(sheet.talents, tier, index, replacement)
  const pool = talentPool(data, sheet.classId)
  // Normalization removes illegal prerequisite chains, ranks and pyramid slots.
  // Any change beyond the chosen slot means the retrain is not valid.
  if (JSON.stringify(normalizeTalents(talents, pool)) !== JSON.stringify(talents)) {
    return { ok: false, error: 'Replacement breaks a ranked prerequisite or Talent Pyramid structure' }
  }
  const candidate = { ...sheet, talents }
  const view = deriveCandidate?.(candidate) ?? null
  const invalid = (view?.checks ?? []).filter((c) => !c.ok)
  if (invalid.length) return { ok: false, error: invalid.map((c) => `${c.label}: ${c.detail}`).join('; '), candidate, view }
  return { ok: true, candidate, view, error: '' }
}
