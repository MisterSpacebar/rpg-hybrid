import { appliedToProfile } from './modifiers.js'

const dash = (v) => (v == null || v === '' ? '–' : String(v))

// Ward is printed in several ways ("6+ (Magic)", "6+ Magic", "5+ (Physical)", "4+ (Physical Ward +2)"). Show it split by
// type like the character sheet: "Magic 6+", "Phys 6+ / Magic 5+", or just "6+" when both types match.
//  - "6+ (Magic)" is a Ward against Magic only.
//  - "4+ (Physical Ward +2)" is a Ward 4+ against everything, improved 2 steps against Physical: Phys 2+ / Magic 4+.
// Ward cannot go past 2+. An unlabelled Ward is left as printed, and the raw text stays available as a tooltip.
export function formatWard(ward) {
  if (ward == null || ward === '') return '–'
  const best = new Map()
  const keep = (type, value) => best.set(type, Math.min(best.get(type) ?? 9, value))
  const unlabelled = []
  for (const p of String(ward).split(/\s*·\s*|\s*\/\s*/).filter(Boolean)) {
    const value = p.match(/\d\+/)?.[0]
    const typeText = p.match(/Magic|Phys(?:ical)?/i)?.[0]
    if (!value || !typeText) {
      unlabelled.push(p.trim())
      continue
    }
    const base = parseInt(value, 10)
    const type = /^magic$/i.test(typeText) ? 'Magic' : 'Phys'
    const steps = Number(p.slice(p.indexOf(value) + value.length).match(/\+\s*(\d)/)?.[1] ?? 0)
    keep(type, Math.max(2, base - steps))
    if (steps > 0) keep(type === 'Magic' ? 'Phys' : 'Magic', base)
  }
  const phys = best.get('Phys')
  const magic = best.get('Magic')
  const typed =
    phys != null && phys === magic
      ? [`${phys}+`]
      : [phys != null && `Phys ${phys}+`, magic != null && `Magic ${magic}+`].filter(Boolean)
  return [...typed, ...unlabelled].join(' / ')
}
export function formatProfile(p) {
  const core = [p.range, p.attacks != null ? `${p.attacks}A` : null, p.hit, p.damage != null ? `D${p.damage}` : null]
    .filter(Boolean)
    .join(' · ')
  const kw = p.keywords?.length ? p.keywords.join(', ') : null
  return [core, kw].filter(Boolean).join(' · ')
}

export function formatStats(stats) {
  if (!stats) return ''
  return `M ${dash(stats.move)} · W ${dash(stats.wounds)} · Arm ${dash(stats.armor)} · Eva ${dash(stats.evade)} · Ward ${formatWard(stats.ward)}`
}

const truncate = (text, n) => (text.length > n ? `${text.slice(0, n - 1).trimEnd()}…` : text)

// One-line reminder of what an option does, mirrored next to each choice in the builder.
export function optionBrief(o) {
  if (o.profile) return formatProfile(o.profile)
  if (o.stats) return formatStats(o.stats)
  if (o.arcaneBolt) return `Arcane Bolt: ${formatProfile(o.arcaneBolt)}`
  return o.effect ? truncate(o.effect, 120) : ''
}

export function abilityMeta(a) {
  return [a.type, a.cost ?? a.cpCost, a.timing, a.frequency].filter(Boolean).join(' · ')
}

// Splits a unit's chosen options for compact display: `applied` names are already reflected in the stat line, attack table or
// tags (so only the name is listed); `detailed` options carry rules text that appears nowhere else.
export function splitOptions(u) {
  const detailed = []
  const applied = []
  for (const p of u.picks) {
    for (const o of p.options) {
      if (/^no /i.test(o.name)) continue
      // Purchased personal Commands appear in the Abilities section, not twice.
      if (o.cpCost && u.abilities.some((a) => a.name === o.name)) { applied.push(o.name); continue }
      if (o.profile || o.arcaneBolt) { if (o.points > 0) applied.push(o.name) } else if (appliedToProfile(o)) applied.push(o.name)
      else detailed.push({ ...o, group: p.group })
    }
  }
  return { detailed, applied }
}

export const statDash = dash
const cpText = (cost) => (typeof cost === 'number' ? `${cost} CP` : cost || '1 CP')

// One entry per printable card: the army's selected Faction and Doctrine Commands. Unit Commands stay on their datasheets.
export function collectCommandCards(view) {
  const cards = []
  view.factionCommands.forEach((c) =>
    cards.push({ kind: 'Faction Command', source: view.faction.name, name: c.name, slot: c.slot, timing: c.timing, cost: cpText(c.cost), effect: c.effect }),
  )
  view.doctrines.forEach((d, i) => {
    if (!d) return
    view.doctrineCommands[i].forEach((c) =>
      cards.push({ kind: 'Doctrine Command', source: d.name, name: c.name, slot: c.slot, timing: c.timing, cost: cpText(c.cost), effect: c.effect }),
    )
  })
  return cards
}
