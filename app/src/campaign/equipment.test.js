import assert from 'node:assert/strict'
import test from 'node:test'
import { startingArmorAllowed, startingWeaponNames, validateCampaignSheet } from './equipment.js'

const cls = {
  id: 'rogue', name: 'Rogue',
  subclasses: [{ id: 'ranger', combatPhaseWeapons: { options: [{ name: 'Dagger' }] }, assaultPhaseWeapons: { options: [{ name: 'Shortbow' }] } }],
}
const data = {
  classes: [cls],
  melee: [{ name: 'Dagger' }, { name: 'Greataxe' }],
  ranged: [{ name: 'Shortbow' }],
  armor: [{ name: 'Light Armor' }, { name: 'Heavy Armor' }],
  shield: { name: 'Shield' },
  armorAccess: [{ class: 'Rogue', normalArmorAccess: 'Light, Medium, appropriate Shields' }],
}
const sheet = (gear = []) => ({ classId: 'rogue', subclassId: 'ranger', gear, spells: [], otherPoints: 0, xpEarned: null })

test('starting selection is limited to class/subclass weapons', () => {
  const allowed = startingWeaponNames(cls, cls.subclasses[0])
  assert(allowed.has('Dagger'))
  assert(allowed.has('Shortbow'))
  assert(!allowed.has('Greataxe'))
})

test('class armor access limits creation options', () => {
  assert(startingArmorAllowed(data, cls, { kind: 'armor', name: 'Light Armor' }))
  assert(!startingArmorAllowed(data, cls, { kind: 'armor', name: 'Heavy Armor' }))
  assert(startingArmorAllowed(data, cls, { kind: 'shield', name: 'Shield' }))
})

test('valid starting gear passes, unrestricted and duplicated gear is rejected', () => {
  assert.deepEqual(validateCampaignSheet(sheet([{ kind: 'melee', name: 'Dagger' }]), data, 0), [])
  const errors = validateCampaignSheet(sheet([
    { kind: 'melee', name: 'Greataxe' },
    { kind: 'melee', name: 'Dagger' },
    { kind: 'armor', name: 'Heavy Armor' },
  ]), data, 0)
  assert(errors.some((e) => e.includes('not a starting weapon')))
  assert(errors.some((e) => e.includes('one melee')))
  assert(errors.some((e) => e.includes('starting armor access')))
})

test('campaign setup does not accept custom points or self-reported earned XP', () => {
  assert(validateCampaignSheet({ ...sheet(), otherPoints: 100, xpEarned: 50 }, data, 0).length >= 2)
})
