// Faction rules that change a unit's printed profile, applied on top of the unit and its upgrades.
// Only effects that can be worked out from the unit itself are applied; conditional rules
// (once per Round, on a Charge, after a kill) stay as the rule text shown on every datasheet.

const stepUp = (v) => {
  const m = String(v ?? '').match(/^(\d)\+(.*)$/)
  return m ? `${Math.max(2, Number(m[1]) - 1)}+${m[2]}` : v
}

// Spell Attacks are ranged magic attacks; magical melee weapons are not counted.
const isSpell = (a) =>
  ((a.keywords ?? []).includes('Magic') || (a.damageTypes ?? []).includes('Magic') || a.name === 'Arcane Bolt') && !/engaged/i.test(a.range ?? '')

function addRank(a, keyword, rank) {
  const keywords = [...(a.keywords ?? [])]
  const i = keywords.findIndex((k) => k.startsWith(`${keyword} `))
  if (i >= 0) keywords[i] = `${keyword} ${parseInt(keywords[i].slice(keyword.length), 10) + rank}`
  else keywords.push(`${keyword} ${rank}`)
  a.keywords = keywords
  a.factionKeywords = [...(a.factionKeywords ?? []), keywords[i >= 0 ? i : keywords.length - 1]]
}

// Spirit Hosts: Ward 6+ against Physical, or an existing Physical Ward improved by one step.
function incorporeal(ward) {
  if (ward == null || ward === '') return '6+ (Physical)'
  const parts = String(ward).split(/\s*·\s*|\s*\/\s*/)
  const phys = parts.findIndex((p) => /physical/i.test(p) || !/\(/.test(p))
  if (phys >= 0) parts[phys] = stepUp(parts[phys])
  else parts.push('6+ (Physical)')
  return parts.join(' · ')
}

export const FACTION_EFFECTS = {
  'spirit-hosts': {
    label: 'Incorporeal',
    // Faction Units already print this Ward, so only generic Units gain it.
    applies: (u) => u.source === 'generic',
    stats: (s) => ({ ward: incorporeal(s.ward) }),
    tags: ['Spirit'],
  },
  underclans: {
    label: 'Strength in Numbers',
    applies: (u) => u.models >= 5,
    attacks: (a) => addRank(a, 'Accurate', 2),
  },
  'arcane-orders': {
    label: 'Arcane Discipline',
    applies: () => true,
    attacks: (a) => isSpell(a) && addRank(a, 'Accurate', 1),
  },
}

// u is the partly resolved unit: { source, models, stats, attacks, tags }.
export function applyFactionEffects(factionId, u) {
  const fx = FACTION_EFFECTS[factionId]
  const out = { stats: u.stats, factionChanged: [], attacks: u.attacks, tags: u.tags, factionRule: null }
  if (!fx || !fx.applies(u)) return out

  if (fx.stats && u.stats) {
    const next = { ...u.stats, ...fx.stats(u.stats) }
    out.factionChanged = Object.keys(next).filter((k) => next[k] !== u.stats[k])
    out.stats = next
  }
  if (fx.attacks) {
    out.attacks = u.attacks.map((a) => {
      const copy = { ...a, keywords: [...(a.keywords ?? [])], factionKeywords: [] }
      fx.attacks(copy)
      return copy
    })
  }
  if (fx.tags) out.tags = [...u.tags, ...fx.tags.filter((t) => !u.tags.includes(t))]
  const touched = out.factionChanged.length > 0 || out.attacks.some((a) => a.factionKeywords?.length)
  out.factionRule = touched ? fx.label : null
  return out
}
