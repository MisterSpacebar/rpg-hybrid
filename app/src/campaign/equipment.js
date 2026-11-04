// Campaign creation is deliberately narrower than the unrestricted standalone builder.
// Acquisition/crafting will add approved equipment to campaign inventory in a later milestone.
export function startingWeaponNames(cls, sub) {
  return new Set([
    ...(sub.combatPhaseWeapons?.options ?? []).map((w) => w.name),
    ...(sub.assaultPhaseWeapons?.options ?? []).map((w) => w.name),
    ...(cls.startingEquipment?.combatPhaseOptions ?? []).map((w) => w.name),
    cls.startingEquipment?.assaultPhaseOption?.name,
  ].filter(Boolean))
}

export function startingArmorAllowed(data, cls, item) {
  const access = data.armorAccess.find((a) => a.class === cls.name)?.normalArmorAccess ?? ''
  if (item.kind === 'shield') return access.includes('Shield') && item.name === data.shield.name
  return item.kind === 'armor' && data.armor.some((a) => a.name === item.name)
    && access.includes(item.name.split(' ')[0])
}

// Starting gear is granted through creation. Once a sheet is approved it cannot
// silently mint new starter gear. All later equipment needs a company inventory ID.
export function campaignGearOptions(char, data, inventory = [], approved = null, otherHeroes = []) {
  const cls = data.classes.find((c) => c.id === char.classId)
  const sub = cls?.subclasses.find((s) => s.id === char.subclassId)
  if (!cls || !sub) return { starting: [], acquired: [] }
  const names = startingWeaponNames(cls, sub)
  const starter = [
    ...data.melee.map((w) => ({ ...w, kind: 'melee' })),
    ...data.ranged.map((w) => ({ ...w, kind: 'ranged' })),
    ...data.armor.map((w) => ({ ...w, kind: 'armor' })),
    { ...data.shield, kind: 'shield' },
  ].filter((w) => ['melee', 'ranged'].includes(w.kind) ? names.has(w.name) : startingArmorAllowed(data, cls, w))
  const original = approved?.sheet?.gear
  const starting = original
    ? starter.filter((w) => original.some((g) => !g.inventoryId && g.kind === w.kind && g.name === w.name))
    : starter
  const claimed = new Set(otherHeroes.flatMap((h) => (h.sheet?.gear ?? []).map((g) => g.inventoryId).filter(Boolean)))
  const acquired = inventory
    .filter((x) => x.kind === 'equipment' && x.item && (!x.ownerUid || x.ownerUid === char.ownerUid))
    .filter((x) => !claimed.has(x.id))
    .map((x) => ({ id: x.id, ...x.item }))
    .filter((x) => !!(x.kind === 'shield' ? data.shield.name === x.name : x.kind === 'armor' ? data.armor.some((w) => w.name === x.name) : x.kind === 'melee' || x.kind === 'ranged' ? data[x.kind].some((w) => w.name === x.name) : data.magic.byKey.has(`${x.kind}:${x.name}`)))
  return { starting, acquired }
}

export function validateCampaignSheet(char, data, earnedXp, inventory = [], otherHeroes = [], approved = null) {
  const cls = data.classes.find((c) => c.id === char.classId)
  const sub = cls?.subclasses.find((s) => s.id === char.subclassId)
  if (!cls || !sub || !Array.isArray(char.gear)) return ['Invalid class, subclass or equipment']
  const allowed = startingWeaponNames(cls, sub)
  const original = approved?.sheet?.gear
  if (approved?.sheet) {
    for (const key of ['ancestry', 'classId', 'subclassId', 'size', 'humanBoost', 'adaptations', 'archetype', 'skillPicks', 'subclassSpell', 'formulas']) {
      if (JSON.stringify(char[key] ?? null) !== JSON.stringify(approved.sheet[key] ?? null)) {
        return [`Starting character choice ${key} is locked after GM approval`]
      }
    }
  }
  const known = new Map(inventory.filter((i) => i.kind === 'equipment').map((i) => [i.id, i]))
  const claimed = new Set(otherHeroes.flatMap((h) => (h.sheet?.gear ?? []).map((g) => g.inventoryId).filter(Boolean)))
  const errors = []
  const equipped = { melee: 0, ranged: 0, armor: 0, shield: 0 }
  const claimedHere = []
  for (const item of char.gear) {
    if ((item.enchants ?? []).length || (item.qualities ?? []).length || item.crafted || item.customProfile) {
      errors.push(`${item.name} has an upgrade requiring GM approval`)
    }
    if (item.inventoryId) {
      const entry = known.get(item.inventoryId)
      if (!entry || entry.item.kind !== item.kind || entry.item.name !== item.name ||
          (entry.ownerUid && entry.ownerUid !== char.ownerUid)) {
        errors.push(`${item.name} is not owned by this campaign character`)
      }
      claimedHere.push(item.inventoryId)
      if (claimed.has(item.inventoryId)) errors.push(`${item.name} is equipped by another PC`)
    } else {
      const isStarter = ['melee', 'ranged'].includes(item.kind)
        ? allowed.has(item.name) && data[item.kind].some((w) => w.name === item.name)
        : startingArmorAllowed(data, cls, item)
      if (!isStarter || (original && !original.some((g) => !g.inventoryId && g.kind === item.kind && g.name === item.name))) {
        errors.push(`${item.name} is not an available starting item`)
      }
    }
    if (item.kind in equipped && item.equipped !== false) equipped[item.kind]++
  }
  if (new Set(claimedHere).size !== claimedHere.length) errors.push('The same company item cannot be selected twice')
  for (const [kind, total] of Object.entries(equipped)) {
    if (total > 1) errors.push(`Only one equipped ${kind} item is permitted`)
  }
  if ((char.spells ?? []).length || char.psychicBlade) errors.push('Learned optional spells require campaign acquisition')
  if (Number(char.otherPoints || 0) !== 0) errors.push('Additional Points require GM approval')
  if (Number(char.xpEarned ?? 0) > Number(earnedXp)) errors.push('Earned XP is managed by the campaign')
  return errors
}
