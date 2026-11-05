import assert from 'node:assert/strict'
import test from 'node:test'
import { craftRoll, eligibleOffer, priceForFormation, publishableOffer } from './market.js'

test('GM-published market offer has a valid Gold price and catalog identity', () => {
  assert.equal(publishableOffer({ kind: 'equipment', price: 2, item: { kind: 'melee', name: 'Dagger' } }), true)
  assert.throws(() => publishableOffer({ kind: 'equipment', price: 0, item: { kind: 'melee', name: 'Dagger' } }))
  assert.throws(() => publishableOffer({ kind: 'craft', price: 3, item: { kind: 'armor', name: 'Light Armor' }, difficulty: 6 }))
  assert.throws(() => publishableOffer({ kind: 'unit', price: 4, config: { key: 'generic:infantry' }, points: null }))
})

test('recruitment costs depend only on whole resolved Points', () => {
  assert.equal(priceForFormation(1), 1)
  assert.equal(priceForFormation(25), 1)
  assert.equal(priceForFormation(26), 2)
  assert.equal(priceForFormation(100), 4)
  assert.throws(() => priceForFormation(0))
  assert.throws(() => priceForFormation(99.5))
})

test('crafting rolls count successes and pairs of sixes/ones', () => {
  assert.deepEqual(craftRoll([6, 6, 1, 1, 4], 4, 2), {
    dice: [6, 6, 1, 1, 4], successes: 3, surges: 1, blunders: 1,
    difficulty: 2, success: true, qualities: 1, flaws: 1, complications: false,
  })
  assert.equal(craftRoll([1,2,3,4], 5, 3).success, false)
  assert.throws(() => craftRoll([7], 4, 2))
  assert.throws(() => craftRoll([1,2], 1, 2))
})

test('ordinary formation offers require Act II and the legal Patron', () => {
  const offer = { enabled: true, kind: 'unit', factionId: 'warclans' }
  assert.equal(eligibleOffer(offer, { act: 1, patronFactionId: 'warclans' }), false)
  assert.equal(eligibleOffer(offer, { act: 2, patronFactionId: 'warclans' }), true)
  assert.equal(eligibleOffer(offer, { act: 2, patronFactionId: 'free-realms' }), false)
  assert.equal(eligibleOffer({ kind: 'equipment', enabled: true }, { act: 1 }), true)
  assert.equal(eligibleOffer({ kind: 'equipment', enabled: false }, { act: 1 }), false)
})
