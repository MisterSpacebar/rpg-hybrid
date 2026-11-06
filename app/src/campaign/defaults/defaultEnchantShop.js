// Standing, non-special Minor Enchantments. Special recipes remain quest/GM unlocks.
// These Gold prices are provisional material costs and independent of battlefield Points.
export const STANDARD_ENCHANTMENTS = Object.freeze([
  { id: 'accurate-melee', enchantKey: 'minor:Accurate 1', targetKind: 'melee', price: 2 },
  { id: 'accurate-ranged', enchantKey: 'minor:Accurate 1', targetKind: 'ranged', price: 2 },
  { id: 'tough-armor', enchantKey: 'minor:Tough 1', targetKind: 'armor', price: 2 },
  { id: 'tough-shield', enchantKey: 'minor:Tough 1', targetKind: 'shield', price: 2 },
  { id: 'range-ranged', enchantKey: 'minor:+1" Attack Range', targetKind: 'ranged', price: 1 },
  { id: 'move-melee', enchantKey: 'minor:+1" Move while equipped', targetKind: 'melee', price: 2 },
  { id: 'move-ranged', enchantKey: 'minor:+1" Move while equipped', targetKind: 'ranged', price: 2 },
  { id: 'move-armor', enchantKey: 'minor:+1" Move while equipped', targetKind: 'armor', price: 2 },
  { id: 'move-shield', enchantKey: 'minor:+1" Move while equipped', targetKind: 'shield', price: 2 },
  { id: 'magic-melee', enchantKey: 'minor:Magic Attack keyword', targetKind: 'melee', price: 2 },
  { id: 'magic-ranged', enchantKey: 'minor:Magic Attack keyword', targetKind: 'ranged', price: 2 },
])
export const enchantOfferId = (id) => 'standard-enchant-' + id

export function standardEnchantOffers(data) {
  const entries = new Map(data.magic.enchantGroups
    .flatMap((g) => g.entries)
    .filter((e) => e.group === 'minor' && !e.choice && !e.custom)
    .map((e) => [e.key, e]))
  return STANDARD_ENCHANTMENTS.flatMap((x) => {
    const entry = entries.get(x.enchantKey)
    if (!entry?.allowed?.includes(x.targetKind)) return []
    return [{ ...x, offerId: enchantOfferId(x.id),
      kind: 'enchant', label: entry.name, difficulty: 2, check: 'Mind + Mysticism',
      enabled: true, standardEnchant: true,
    }]
  })
}
