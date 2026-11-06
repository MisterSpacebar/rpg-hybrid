// Resolve Company-owned equipment into a derived Hero without trusting
// modifiers copied into the editable Character draft.
export function withOwnedEquipment(sheet, inventory, ownerUid) {
  const items = new Map((inventory ?? []).filter((item) => item.kind === 'equipment').map((item) => [item.id, item]))
  return { ...sheet, gear: (sheet.gear ?? []).map((gear) => {
    const owned = items.get(gear.inventoryId || `starter-${ownerUid}-${gear.uid}`)
    if (!owned?.item || owned.item.kind !== gear.kind || owned.item.name !== gear.name) return gear
    return { ...gear, enchants: owned.enchants ?? [], workshopEvents: owned.workshopEvents ?? [] }
  }) }
}
