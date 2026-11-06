import assert from 'node:assert/strict'
import test from 'node:test'
import { STANDARD_EQUIPMENT, standardOffers, standardItemKey, standardOfferId } from './defaultShop.js'
import { craftRoll } from '../logic/market.js'
import { STANDARD_ENCHANTMENTS, standardEnchantOffers } from './defaultEnchantShop.js'

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

test('routine Minor Enchantments are restricted to compatible known catalog entries', () => {
  const data = {
    magic: { enchantGroups: [{ entries: [
      { group: 'minor', key: 'minor:Accurate 1', name: 'Accurate 1', allowed: ['melee', 'ranged'] },
      { group: 'minor', key: 'minor:Tough 1', name: 'Tough 1', allowed: ['armor', 'shield'] },
      { group: 'major', key: 'major:Critical 1', name: 'Critical 1', allowed: ['melee'] },
    ] }] },
  }
  const options = standardEnchantOffers(data)
  assert.equal(options.length, 4)
  assert(options.every((o) => o.kind === 'enchant' && o.standardEnchant))
  assert(options.every((o) => o.enchantKey.startsWith('minor:')))
  assert(options.every((o) => o.difficulty === 2 && o.price === 2))
  assert(STANDARD_ENCHANTMENTS.every((o) => o.id && o.enchantKey && o.targetKind))
})
