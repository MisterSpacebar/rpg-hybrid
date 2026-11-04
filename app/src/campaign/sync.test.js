import assert from 'node:assert/strict'
import test from 'node:test'
import { acceptSnapshot, discardDraft, editDraft } from './sync.js'

const sheet = (name, xp = 0) => ({ name, talents: { 1: [] }, xp })

test('initial live snapshot initializes a clean editor', () => {
  const draft = acceptSnapshot(null, sheet('Ada'))
  assert.equal(draft.value.name, 'Ada')
  assert.equal(draft.dirty, false)
  assert.equal(draft.conflict, false)
})

test('newer snapshots refresh clean editors without manual reload', () => {
  const initial = acceptSnapshot(null, sheet('Ada'))
  const next = acceptSnapshot(initial, sheet('Grace'))
  assert.equal(next.value.name, 'Grace')
  assert.equal(next.dirty, false)
})

test('unsaved local edits survive unrelated Firestore snapshots and show a conflict', () => {
  const initial = acceptSnapshot(null, sheet('Ada'))
  const local = editDraft(initial, { name: 'Local choice' })
  assert.equal(local.dirty, true)
  assert.equal(acceptSnapshot(local, sheet('Ada')), local)
  const conflict = acceptSnapshot(local, sheet('Remote choice'))
  assert.equal(conflict.value.name, 'Local choice')
  assert.equal(conflict.remote.name, 'Remote choice')
  assert.equal(conflict.conflict, true)
  assert.equal(discardDraft(conflict).value.name, 'Remote choice')
})

test('a matching server snapshot acknowledges a saved edit and clears dirty state', () => {
  const initial = acceptSnapshot(null, sheet('Ada'))
  const changed = editDraft(initial, { name: 'Grace' })
  const acknowledged = acceptSnapshot(changed, sheet('Grace'))
  assert.equal(acknowledged.value.name, 'Grace')
  assert.equal(acknowledged.dirty, false)
  assert.equal(acknowledged.conflict, false)
})

test('local changes reverted to saved values are no longer dirty', () => {
  const initial = acceptSnapshot(null, sheet('Ada'))
  const changed = editDraft(initial, (value) => ({ ...value, xp: 20 }))
  assert.equal(changed.dirty, true)
  const reversed = editDraft(changed, { xp: 0 })
  assert.equal(reversed.dirty, false)
  assert.equal(reversed.conflict, false)
})

test('deleting a saved record resets a clean draft to the empty default', () => {
  const initial = acceptSnapshot(null, sheet('Ada'))
  const newBlank = acceptSnapshot(initial, sheet('New Character'))
  assert.equal(newBlank.value.name, 'New Character')
  assert.equal(newBlank.dirty, false)
})
