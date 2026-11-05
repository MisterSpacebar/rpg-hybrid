// Small standing Company marketplace. Prices are *campaign Gold*, not battlefield
// Point conversions; they are explicit starter-economy defaults, adjustable in
// a later economy balance pass. The Firestore rules mirror this whitelist exactly.
export const STANDARD_EQUIPMENT = Object.freeze([
  { id: 'basic-dagger', kind: 'melee', name: 'Dagger', price: 1 },
  { id: 'basic-shortsword', kind: 'melee', name: 'Shortsword', price: 1 },
  { id: 'basic-longsword', kind: 'melee', name: 'Longsword', price: 1 },
  { id: 'basic-warhammer', kind: 'melee', name: 'Warhammer', price: 2 },
  { id: 'basic-shortbow', kind: 'ranged', name: 'Shortbow', price: 1 },
  { id: 'basic-longbow', kind: 'ranged', name: 'Longbow', price: 2 },
  { id: 'basic-musket', kind: 'ranged', name: 'Musket', price: 3 },
  { id: 'basic-light-armor', kind: 'armor', name: 'Light Armor', price: 1 },
  { id: 'basic-medium-armor', kind: 'armor', name: 'Medium Armor', price: 2 },
  { id: 'basic-heavy-armor', kind: 'armor', name: 'Heavy Armor', price: 3 },
  { id: 'basic-shield', kind: 'shield', name: 'Shield', price: 1 },
])
export const standardOfferId = (id) => 'standard-' + id

export function standardOffers(data) {
  const valid = new Set([
    ...data.melee.map((x) => 'melee:' + x.name),
    ...data.ranged.map((x) => 'ranged:' + x.name),
    ...data.armor.map((x) => 'armor:' + x.name),
    'shield:' + data.shield.name,
  ])
  return STANDARD_EQUIPMENT.filter((x) => valid.has(x.kind + ':' + x.name))
    .map((x) => ({ ...x, offerId: standardOfferId(x.id),
      label: x.name, item: { kind: x.kind, name: x.name },
      kind: 'equipment', enabled: true, standardEquipment: true }))
}

export function standardItemKey(item) {
  return STANDARD_EQUIPMENT.find((x) => x.kind === item?.kind && x.name === item?.name)?.id ?? null
}
