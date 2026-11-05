import assert from 'node:assert/strict'
import test from 'node:test'
import { STANDARD_EQUIPMENT, standardOffers, standardItemKey, standardOfferId } from './defaultShop.js'
import { craftRoll } from './market.js'

test('default shop prices are explicit and identities stable', () => {
  assert(STANDARD_EQUIPMENT.length >= 8 && STANDARD_EQUIPMENT.length <= 20)
  assert(STANDARD_EQUIPMENT.every((o) => Number.isInteger(o.price) && o.price > 0))
  assert.equal(new Set(STANDARD_EQUIPMENT.map((o) => o.id)).size, STANDARD_EQUIPMENT.length)
  assert.equal(standardOfferId('basic-dagger'), 'standard-basic-dagger')
  assert.equal(standardItemKey({ kind: 'melee', name: 'Dagger' }), 'basic-dagger')
  assert.equal(standardItemKey({ kind: 'relic', name: 'Dagger' }), null)
})

test('standard offers do not invent entries not present in the equipment catalog', () => {
  const data = {
    melee: [{ name: 'Dagger' }], ranged: [{ name: 'Shortbow' }],
    armor: [{ name: 'Light Armor' }], shield: { name: 'Shield' },
  }
  const offers = standardOffers(data)
  assert.equal(offers.length, 4)
  assert(offers.every((o) => o.kind === 'equipment' && o.enabled && o.standardEquipment))
  assert.deepEqual(offers.map((o) => o.item.name).sort(), ['Dagger','Light Armor','Shield','Shortbow'])
})

test('crafting Skill Checks cap Surges and Blunders at one and never award Surge as ordinary budget', () => {
  const r = craftRoll([1,1,6,6,6,6], 4, 2)
  assert.equal(r.success, true)
  assert.equal(r.surges, 1)
  assert.equal(r.blunders, 1)
  assert.equal(r.qualities, 2)
  assert.equal(r.flaws, 1)
})
