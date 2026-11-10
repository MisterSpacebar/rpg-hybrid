// Charge and Impact, resolved with where each value came from so the statline can colour it.
// Charge X lengthens the Charge distance and never stacks (highest applies); Impact X adds to the Charge Impact pool.
const rank = (v) => (v == null || v === '' ? 0 : Number(String(v).replace(/^\+/, '')) || 0)

// Option text such as "Gain Charge 1." or "Increase Move to M6", gain +1 Wound and Charge 3."
function upgradeRush(picked) {
  let charge = 0
  let impact = 0
  for (const o of picked) {
    if (o.id?.startsWith('cavalryClass:') || o.profile || !o.effect) continue
    for (const m of o.effect.matchAll(/\bCharge (\d+)\b/gi)) charge = Math.max(charge, Number(m[1]))
    for (const m of o.effect.matchAll(/\bImpact \+?(\d+)\b/gi)) impact += Number(m[1])
  }
  return { charge, impact }
}

export function resolveRush({ printedCharge, printedImpact, picked = [], factionId, source, mayCharge }) {
  const generic = source === 'generic'
  const up = upgradeRush(picked)
  const pc = rank(printedCharge)
  const hasPrintedCharge = printedCharge != null
  const hasPrintedImpact = printedImpact != null

  // Warclans: faction Units Charge 2, generic recruits Charge 1, never added to other Charge ranks.
  const factionCharge = factionId === 'warclans' && mayCharge ? (generic ? 1 : 2) : 0
  const chargeValue = Math.max(pc, up.charge, factionCharge)
  const charge = chargeValue > 0 || hasPrintedCharge ? chargeValue : null
  const chargeSource = factionCharge > Math.max(pc, up.charge) ? 'faction' : up.charge > pc ? 'upgrade' : charge != null ? 'printed' : null

  // Titan Clans: generic recruits gain Impact +1; faction Units print the faction Impact +2 inside their own value.
  const titan = factionId === 'titan-clans' && mayCharge
  const factionImpact = titan ? (generic ? 1 : hasPrintedImpact ? 0 : 2) : 0
  const impactValue = rank(printedImpact) + factionImpact + up.impact
  const impact = hasPrintedImpact || titan || up.impact > 0 ? `+${impactValue}` : null
  const impactSource = titan ? 'faction' : up.impact > 0 ? 'upgrade' : impact != null ? 'printed' : null

  return { charge, impact, chargeSource, impactSource }
}

// A tile appears only once the value is above 0.
export const rushTiles = ({ charge, impact }) => [
  rank(charge) > 0 ? ['Charge', `+${rank(charge)}`, 'charge'] : null,
  rank(impact) > 0 ? ['Impact', `+${rank(impact)}`, 'impact'] : null,
].filter(Boolean)
