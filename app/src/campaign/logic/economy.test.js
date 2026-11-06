import assert from 'node:assert/strict'
import test from 'node:test'
import {
  affordable, goldForFlex, goldForRecruitment, goldForUpgrade,
  resolveCraft, validateRequestInput,
} from './economy.js'

test('formation recruitment and upgrades charge 1 Gold per started 25 Points', () => {
  for (const [points, gold] of [[1,1],[25,1],[26,2],[50,2],[75,3],[100,4],[125,5],[200,8]]) {
    assert.equal(goldForRecruitment(points), gold)
  }
  assert.equal(goldForUpgrade(36), 2)
  assert.equal(goldForFlex(), 2)
  assert.throws(() => goldForRecruitment(0))
  assert.throws(() => goldForRecruitment(NaN))
})

test('Company treasury does not permit overspending or fractional Gold', () => {
  assert(affordable(6, 6))
  assert(!affordable(6, 7))
  assert(!affordable(6, -1))
  assert(!affordable(6, 2.5))
})

test('successful craft derives ordinary quality budget from excess successes alone', () => {
  assert.deepEqual(resolveCraft({ difficulty: 2, successes: 4, surges: 1, blunders: 1 }), {
    success: true, qualities: 2, flaws: 1, complications: false,
  })
  assert.deepEqual(resolveCraft({ difficulty: 4, successes: 3, surges: 1, blunders: 1 }), {
    success: false, qualities: 0, flaws: 0, complications: true,
  })
  assert.throws(() => resolveCraft({ difficulty: 7, successes: 6, surges: 0, blunders: 0 }))
})

test('PC requests restrict allowed types and validated craft approaches', () => {
  const base = { kind: 'craft', ownerUid: 'pc1', note: '', item: { kind: 'melee', name: 'Dagger' },
    check: 'Mind + Craft', materials: 'forge, iron' }
  assert(validateRequestInput(base))
  assert.throws(() => validateRequestInput({ ...base, check: 'GM permission' }))
  assert.throws(() => validateRequestInput({ ...base, kind: 'unknown' }))
  assert.throws(() => validateRequestInput({ ...base, item: { kind: 'unknown', name: 'Thing' } }))
  assert(validateRequestInput({ kind: 'flex', ownerUid: 'pc1', note: '', slot: 'C' }))
  assert.throws(() => validateRequestInput({ kind: 'flex', ownerUid: 'pc1', note: '', slot: 'H' }))
  assert(validateRequestInput({ kind: 'recruit', ownerUid: 'pc1', note: '', config: { key: 'generic-unit' } }))
})
