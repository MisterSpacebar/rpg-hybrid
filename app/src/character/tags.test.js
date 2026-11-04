import test from 'node:test'
import assert from 'node:assert/strict'
import { ANTI_TAGS, canonicalTags, antiBonus } from '../tags.js'
import { combineMods } from './magic.js'
import { resolveUnit } from '../builder/engine.js'
import { modifyTags } from '../builder/modifiers.js'

test('both builders share selectable Faction, Role and Trait tags', () => {
  for (const tag of ['Death Legions', 'Officer', 'Ranged', 'Flying', 'Unarmored', 'Character']) {
    assert.ok(ANTI_TAGS.includes(tag), tag)
  }
})

test('compound roles match all constituent Anti categories, without adding slots', () => {
  assert.deepEqual(canonicalTags(['Elite Ranged Infantry']), ['Elite Ranged Infantry', 'Elite', 'Ranged', 'Infantry'])
  assert.equal(antiBonus(['Anti-Infantry 1', 'Anti-Elite 3'], ['Elite Ranged Infantry']), 3)
})

test('multiple matching Anti tags use highest rank just once', () => {
  assert.equal(antiBonus(['Anti-Undead 2', 'Anti-Armored 3', 'Anti-Undead 1'], ['Undead', 'Armored']), 3)
  assert.equal(antiBonus(['Anti-Undead 2'], ['Mortal']), 0)
})

test('adding Anti from multiple sources keeps highest rank', () => {
  const combined = combineMods({ anti: { Undead: 3 }, attacks: 1 }, { anti: { Undead: 2, Monster: 4 }, attacks: 2 })
  assert.deepEqual(combined.anti, { Undead: 3, Monster: 4 })
  assert.equal(combined.attacks, 3)
})

test('faction allegiance does not imply a creature type', () => {
  const tags = canonicalTags(['Infantry', 'Mortal'], 'death-legions')
  assert.ok(tags.includes('Death Legions'))
  assert.ok(tags.includes('Mortal'))
  assert.ok(!tags.includes('Undead'))
})

test('a generic Captain is an Officer, not automatically Character', () => {
  const entry = {
    source: 'generic', name: 'Captain', basePoints: 125, baseModels: 1, maxModels: 1,
    modelOptions: [], tags: ['Infantry', 'Elite', 'Officer'], slots: ['E'],
    category: 'Captain', stats: { move: '5"', wounds: 4, armor: '5+', evade: '5+' },
    attacks: [], abilities: [], groups: [], heroOption: 'Heroic Commission',
  }
  const unit = resolveUnit(entry, { uid: 'captain', models: 1, picks: {} }, 'free-realms')
  assert.ok(unit.tags.includes('Free Realms'))
  assert.ok(unit.tags.includes('Officer'))
  assert.ok(!unit.tags.includes('Character'))
})

test('explicit Armored upgrade removes Unarmored', () => {
  const tags = modifyTags(['Infantry', 'Unarmored'], [{
    name: 'Armor', effect: "Improve the Unit's Armor one step. Gain the Armored tag; lose Unarmored.",
  }])
  assert.ok(tags.includes('Armored'))
  assert.ok(!tags.includes('Unarmored'))
})
