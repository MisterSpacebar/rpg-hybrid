import { canonicalTags, normalizeTag } from '../tags.js'

// Thralls derive saves and attacks from the Necromancer, but retain their own
// creature/formation tags. Temporary one-Attack Command effects are not inherited.
const clampThreshold = (n) => Math.min(6, Math.max(2, n))

export function buildThrall(unit, characteristics, skills, traits, attacks, factionId = null) {
  const ranks = {}
  const note = (text) => {
    const m = /^Anti-(.+?)\s+(\d+)/.exec(String(text ?? ''))
    if (m) {
      const type = normalizeTag(m[1])
      ranks[type] = Math.max(ranks[type] ?? 0, Number(m[2]))
    }
  }
  traits.forEach((t) => note(t.name))
  attacks.forEach((a) => (a.keywords ?? []).forEach(note))
  const anti = Object.entries(ranks).filter(([, rank]) => rank > 1).map(([tag, rank]) => `Anti-${tag} ${rank - 1}`)
  const claws = unit.combatPhaseAttack
  return {
    name: unit.name,
    tags: canonicalTags(unit.tags ?? [], factionId),
    startingModels: Math.min(characteristics.mind, unit.maxModels ?? 6),
    maxModels: unit.maxModels ?? 6,
    stats: { ...unit.stats, wounds: 1, armor: `${clampThreshold(skills.medicine + 2)}+`, evade: `${clampThreshold(skills.stealth + 3)}+` },
    attack: { ...claws.profile, name: claws.name, hit: `${clampThreshold(skills.mysticism + 1)}+`, keywords: [...(claws.profile.keywords ?? []), ...anti] },
    passive: unit.passive,
  }
}
