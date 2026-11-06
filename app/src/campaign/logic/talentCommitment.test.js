import assert from 'node:assert/strict'
import test from 'node:test'
import { committedTalentIssues, isCommittedTalent, committedTalentCount, sameTalent } from './talentCommitment.js'

const saved = {
  1: [{ id: 'combat-prowess', attack: 'Longsword', mode: 'attacks', skill: 'craft' }],
  2: [{ id: 'critical-prowess', attack: 'Longsword' }],
  3: [], 4: [], 5: [],
}
const copy = (value) => JSON.parse(JSON.stringify(value))

test('talent choices are editable only before first save', () => {
  assert.deepEqual(committedTalentIssues({ ...copy(saved), 1: [] }, null), [])
  assert.equal(committedTalentIssues(copy(saved), saved).length, 0)
  assert(isCommittedTalent(saved, 1, 0))
  assert(!isCommittedTalent(saved, 1, 1))
  assert.equal(committedTalentCount(saved, 2), 1)
})
test('saved talents cannot be removed, swapped or have choices changed', () => {
  const removed = copy(saved); removed[1] = []
  assert(committedTalentIssues(removed, saved).length)
  const changed = copy(saved); changed[1][0].attack = 'Dagger'
  assert(committedTalentIssues(changed, saved).some((e) => e.includes('Retraining')))
  const rekeyed = copy(saved); rekeyed[1][0] = { ...rekeyed[1][0], skill: 'survival' }
  assert(committedTalentIssues(rekeyed, saved).length)
})
test('new XP can append talents and ranks without affecting previously saved purchases', () => {
  const next = copy(saved)
  next[1].push({ id: 'mobility-training', skill: 'athletics' })
  next[2].push({ id: 'another-legal-talent' })
  assert.deepEqual(committedTalentIssues(next, saved), [])
})
test('sameTalent ignores key order, as Firestore returns sorted maps', () => {
  assert(sameTalent({ id: 'a', skill: 'craft' }, { skill: 'craft', id: 'a' }))
  assert(!sameTalent({ id: 'a' }, { id: 'b' }))
  assert(!sameTalent({ id: 'a' }, undefined))
})
