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

export function validateCampaignSheet(char, data, earnedXp) {
  const cls = data.classes.find((c) => c.id === char.classId)
  const sub = cls?.subclasses.find((s) => s.id === char.subclassId)
  if (!cls || !sub || !Array.isArray(char.gear)) return ['Invalid class, subclass or equipment']
  const allowed = startingWeaponNames(cls, sub)
  const counts = { melee: 0, ranged: 0, armor: 0, shield: 0 }
  const errors = []
  for (const item of char.gear) {
    if (!(item.kind in counts)) {
      errors.push(`Equipment acquisition is not enabled: ${item.name ?? 'unknown item'}`)
      continue
    }
    if ((item.enchants ?? []).length || (item.qualities ?? []).length || item.crafted || item.customProfile) {
      errors.push(`${item.name} has an upgrade requiring campaign acquisition`)
    }
    counts[item.kind]++
    if (item.kind === 'melee' || item.kind === 'ranged') {
      const found = data[item.kind].some((w) => w.name === item.name)
      if (!found || !allowed.has(item.name)) errors.push(`${item.name} is not a starting weapon`)
    } else if (!startingArmorAllowed(data, cls, item)) {
      errors.push(`${item.name} is not allowed by starting armor access`)
    }
  }
  for (const [kind, total] of Object.entries(counts)) {
    if (total > 1) errors.push(`Only one ${kind} item may be chosen during creation`)
  }
  if ((char.spells ?? []).length || char.psychicBlade) errors.push('Additional learned spells require campaign acquisition')
  if (Number(char.otherPoints || 0) !== 0) errors.push('Additional points require GM approval')
  if (Number(char.xpEarned ?? 0) > Number(earnedXp)) errors.push('Earned XP is managed by the campaign')
  return errors
}
