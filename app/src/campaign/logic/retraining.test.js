import assert from 'node:assert/strict'
import test from 'node:test'
import { developOrderId, replacedTalents, retrainingChoices, RETRAINING_GOLD } from './retraining.js'

const talents = {
  1: [{ id: 'combat-prowess', attack: 'Dagger' }, { id: 'mobility-training', skill: 'craft' }],
  2: [], 3: [], 4: [], 5: [],
}
const data = {
  shared: [
    { id: 'combat-prowess', name: 'Combat Prowess', ranked: true, baseTier: 1, maxRank: 5 },
    { id: 'mobility-training', name: 'Mobility Training', ranked: true, baseTier: 1, maxRank: 5 },
    { id: 'toughened', name: 'Toughened', ranked: true, baseTier: 1, maxRank: 5 },
    { id: 'critical-prowess', name: 'Critical Prowess', ranked: false, baseTier: 2, maxRank: 1 },
  ],
  talentsByClass: { warrior: [] },
}
test('one retraining opportunity belongs to one specific Act/Turn', () => {
  assert.equal(developOrderId({ act: 2, turn: 3 }), 'act-2-turn-3')
  assert.equal(RETRAINING_GOLD, 2)
})
test('same-tier replacement options exclude current, unavailable or already owned talents', () => {
  const candidates = retrainingChoices({ classId: 'warrior', talents }, data, 1, 0).map((x) => x.id)
  assert(candidates.includes('toughened'))
  assert(!candidates.includes('combat-prowess'))
  assert(!candidates.includes('critical-prowess'))
})
test('replacement modifies one slot without mutating saved character', () => {
  const next = replacedTalents(talents, 1, 0, { id: 'toughened', skill: 'craft' })
  assert.equal(next[1].length, 2)
  assert.equal(next[1][0].id, 'toughened')
  assert.deepEqual(next[1][1], talents[1][1])
  assert.equal(talents[1][0].id, 'combat-prowess')
  assert.throws(() => replacedTalents(talents, 2, 0, { id: 'toughened' }))
})
