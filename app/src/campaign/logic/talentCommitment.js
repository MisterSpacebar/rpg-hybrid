// A saved campaign Talent purchase is a commitment, not a temporary builder
// selection. Only adding new talents with later earned XP is permitted. A
// future Retrain Company Order will issue an explicit authorized exception.
import { TIERS } from '../../character/talents.js'

const stable = (value) => {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']'
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map((k) => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}'
  }
  return JSON.stringify(value)
}

export const committedTalentCount = (saved, tier) => saved?.[tier]?.length ?? 0
export const isCommittedTalent = (saved, tier, index) => index < committedTalentCount(saved, tier)
export const sameTalent = (a, b) => stable(a ?? null) === stable(b ?? null)

export function committedTalentIssues(current, saved) {
  if (!saved) return []
  const issues = []
  for (const tier of TIERS) {
    const existing = saved[tier] ?? []
    const next = current?.[tier] ?? []
    for (let i = 0; i < existing.length; i++) {
      if (i >= next.length) {
        issues.push(`Tier ${tier} Talent ${i + 1} cannot be removed without Retraining`)
      } else if (stable(next[i]) !== stable(existing[i])) {
        issues.push(`Tier ${tier} Talent ${i + 1} is already committed; Retraining is required to change it or its choices`)
      }
    }
  }
  return issues
}
