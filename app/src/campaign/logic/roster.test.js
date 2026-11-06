import test from 'node:test'
import assert from 'node:assert/strict'
import { groupRoster, holdersOf, unitSignature } from './roster.js'

const item = (id, picks, extra = {}) => ({ id, kind: 'unit', factionId: 'f', config: { uid: id, key: 'spear', slot: 'C', models: 10, doubled: false, picks, note: id, ...extra } })

test('Identical formations group together regardless of id, note, slot or pick order', () => {
  const groups = groupRoster([
    item('a', { weapons: ['x'], upgrades: ['p', 'q'] }),
    item('b', { upgrades: ['q', 'p'], weapons: ['x'] }, { slot: 'E' }),
    item('c', { weapons: ['y'], upgrades: ['p', 'q'] }),
  ])
  assert.deepEqual(groups.map((g) => g.items.map((i) => i.id)), [['a', 'b'], ['c']])
})

test('Different size, doubling or faction splits a group', () => {
  assert.notEqual(unitSignature(item('a', {})), unitSignature(item('a', {}, { models: 12 })))
  assert.notEqual(unitSignature(item('a', {})), unitSignature(item('a', {}, { doubled: true })))
  assert.notEqual(unitSignature(item('a', {})), unitSignature({ ...item('a', {}), factionId: 'g' }))
})

test('holdersOf shows other PCs saved drafts and the viewer live draft', () => {
  const holders = holdersOf([
    { ownerUid: 'me', selections: [{ id: 'old', slot: 'C' }] },
    { ownerUid: 'amy', selections: [{ id: 'a', slot: 'E' }] },
  ], 'me', [{ id: 'b', slot: 'R' }])
  assert.deepEqual(holders.get('a'), { uid: 'amy', slot: 'E' })
  assert.deepEqual(holders.get('b'), { uid: 'me', slot: 'R' })
  assert.equal(holders.has('old'), false)
})
