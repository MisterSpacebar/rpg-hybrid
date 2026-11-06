// Fixed Company workshop availability. These are ordinary material/workshop
// costs (Gold), not equipment Point-to-Gold conversions.
export const DEFAULT_WORKSHOP = Object.freeze([
  ...['melee','ranged','armor','shield'].flatMap((targetKind) => [
    { id: 'improve-' + targetKind, kind: 'improve', targetKind, price: 2,
      label: 'Improve ' + targetKind, difficulty: 2,
      check: targetKind === 'armor' || targetKind === 'shield' ? 'Body + Craft' : 'Agility + Craft' },
    { id: 'repair-' + targetKind, kind: 'repair', targetKind, price: 1,
      label: 'Repair ' + targetKind, difficulty: 2, check: 'Body + Craft' },
  ]),
])
export const workshopOfferId = (id) => 'standard-workshop-' + id
export const standardWorkshopOffers = () => DEFAULT_WORKSHOP.map((x) =>
  ({ ...x, offerId: workshopOfferId(x.id), enabled: true, standardWorkshop: true }))
