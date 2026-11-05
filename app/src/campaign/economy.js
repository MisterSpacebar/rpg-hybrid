// Campaign economy: Gold and battlefield Points are deliberately different currencies.
// Only formation recruitment and owned formation upgrades have a defined Gold/Points formula.
export const EQUIPMENT_KINDS = ['melee', 'ranged', 'armor', 'shield', 'focus', 'artifact', 'relic']
export const REQUEST_KINDS = ['equipment', 'craft', 'recruit', 'flex']
export const INCOME_SOURCES = ['Commerce', 'Province dividend', 'Treasury opportunity', 'Development reward', 'Discovery / mission', 'GM adjustment']
export const CRAFT_CHECKS = ['Body + Craft', 'Agility + Craft', 'Mind + Craft', 'Mind + Mysticism', 'Spirit + Mysticism']
export const DIFFICULTIES = [
  { value: 1, label: 'Simple (1 success)' },
  { value: 2, label: 'Standard (2 successes)' },
  { value: 3, label: 'Complex (3 successes)' },
  { value: 4, label: 'Advanced (4 successes)' },
  { value: 5, label: 'Exceptional (5 successes)' },
]
export const FLEX_SLOTS = ['C', 'E', 'R', 'V', 'S', 'A']
export const goldForRecruitment = (points) => {
  if (!Number.isFinite(points) || points <= 0) throw new Error('Formation must have a positive, resolved Point value')
  return Math.ceil(points / 25)
}
export const goldForUpgrade = (addedPoints) => goldForRecruitment(addedPoints)
export const goldForFlex = () => 2

export function affordable(balance, expense) {
  return Number.isInteger(balance) && Number.isInteger(expense) && expense >= 0 && balance >= expense
}

export function resolveCraft({ difficulty, successes, surges, blunders }) {
  if (![difficulty, successes, surges, blunders].every(Number.isInteger) || difficulty < 1 || difficulty > 5
    || successes < 0 || successes > 6 || surges < 0 || surges > 3 || blunders < 0 || blunders > 3) {
    throw new Error('Crafting results require legal difficulty and nonnegative counts')
  }
  const success = successes >= difficulty
  return {
    success,
    qualities: success ? successes - difficulty + surges : 0,
    flaws: success ? blunders : 0,
    complications: !success && blunders > 0,
  }
}

export function equipmentCatalog(data) {
  return [
    ...data.melee.map((v) => ({ kind: 'melee', name: v.name, points: v.points })),
    ...data.ranged.map((v) => ({ kind: 'ranged', name: v.name, points: v.points })),
    ...data.armor.map((v) => ({ kind: 'armor', name: v.name, points: v.points })),
    { kind: 'shield', name: data.shield.name, points: data.shield.points },
    ...Object.entries(data.magic.items).flatMap(([kind, values]) =>
      values.map((v) => ({ kind, name: v.name, points: v.points }))),
  ]
}

export function validEquipment(data, item) {
  return EQUIPMENT_KINDS.includes(item?.kind) &&
    equipmentCatalog(data).some((x) => x.kind === item.kind && x.name === item.name)
}

export function validateRequestInput(input) {
  if (!REQUEST_KINDS.includes(input.kind)) throw new Error('Unsupported acquisition type')
  if (!input.ownerUid || typeof input.ownerUid !== 'string') throw new Error('Missing requesting player')
  if (typeof input.note !== 'string' || input.note.length > 500) throw new Error('Notes must be at most 500 characters')
  if (input.kind === 'equipment' || input.kind === 'craft') {
    if (!EQUIPMENT_KINDS.includes(input.item?.kind) || !input.item?.name || input.item.name.length > 120)
      throw new Error('Select a valid equipment item')
    if (input.kind === 'craft') {
      if (!CRAFT_CHECKS.includes(input.check)) throw new Error('Choose a crafting check')
      if (typeof input.materials !== 'string' || input.materials.length > 300) throw new Error('Describe materials (up to 300 characters)')
    }
  }
  if (input.kind === 'recruit' && !input.config?.key) throw new Error('Choose a formation')
  if (input.kind === 'flex' && !FLEX_SLOTS.includes(input.slot)) throw new Error('Choose a legal Flex slot')
  return true
}
