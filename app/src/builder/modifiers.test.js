import test from 'node:test'
import assert from 'node:assert/strict'
import { modifyStats, modifyTags, modifyAttacks, tagChoiceOf, applyTagChoices } from './modifiers.js'
import { resolveUnit } from './engine.js'

const bodies = 'Each existing and future Model in this Unit gains +1 maximum Wound (W3 to W4).'
const upgraded = (name, effect) => ({ name, effect })

test('Reinforced Bodies increases Wounds per Model, never just the total pool', () => {
  assert.equal(modifyStats({ move: '4"', wounds: 3, armor: '5+', evade: '5+' }, [upgraded('Reinforced Bodies', bodies)]).stats.wounds, 4)
})

test('Armored upgrade replaces Unarmored', () => {
  const tags = modifyTags(['Infantry', 'Unarmored'], [
    upgraded('Armor', "Improve the Unit's Armor one step. Gain the Armored tag; lose Unarmored."),
  ])
  assert.ok(tags.includes('Armored'))
  assert.ok(!tags.includes('Unarmored'))
})

test('Expert Marksmen grants unranked Pinpoint to the ranged Attack', () => {
  const attacks = modifyAttacks([
    { name: 'Longbow', range: '12"', attacks: 3, hit: '5+', keywords: [] },
    { name: 'Knife', range: 'Engaged', attacks: 1, hit: '6+', keywords: [] },
  ], [upgraded('Expert Marksmen', 'The primary ranged weapon gains Pinpoint.')])
  assert.ok(attacks[0].keywords.includes('Pinpoint'))
  assert.ok(!attacks[1].keywords.includes('Pinpoint'))
})

test('Precision Casting affects one Spell Attack, not all weapons', () => {
  const attacks = modifyAttacks([
    { name: 'Arcane Bolt', range: '9"', attacks: 3, hit: '5+', keywords: ['Magic'] },
    { name: 'Staff', range: 'Engaged', attacks: 1, hit: '6+', keywords: [] },
  ], [upgraded('Precision Casting', 'Choose one Spell Attack this Wizard knows. It gains Pinpoint.')])
  assert.ok(attacks[0].keywords.includes('Pinpoint'))
  assert.ok(!attacks[1].keywords.includes('Pinpoint'))
})

test('Passive Deadly Precision is recorded as Critical 1', () => {
  const attacks = modifyAttacks([
    { name: 'Sword', range: 'Engaged', attacks: 2, hit: '5+', keywords: [] },
  ], [upgraded('Deadly Precision', 'One selected weapon gains Critical 1 per Surge.')])
  assert.ok(attacks[0].keywords.includes('Critical 1'))
})

test('Tactical Guidance selects an aura tag without buffing the Support weapon', () => {
  const effect = 'At list construction choose one creature Trait. Other friendly Units wholly within 3" gain Anti-[selected tag] 2.'
  const tagChoice = tagChoiceOf(effect)
  assert.equal(tagChoice.scope, 'aura')
  const attack = { name: 'Staff', range: 'Engaged', attacks: 2, hit: '5+', keywords: [] }
  const result = applyTagChoices([attack], [{ id: 'guidance:0', name: 'Tactical Guidance', effect, tagChoice }], { 'guidance:0': { tag: 'Undead' } })
  assert.deepEqual(result.attacks[0].keywords, [])
})

test('Reinforced models pay the extra Wound-training surcharge', () => {
  const entry = {
    source: 'generic', basePoints: 105, baseModels: 3, maxModels: 5,
    modelOptions: [{ perModel: 40 }], tags: ['Elite', 'Infantry'], slots: ['E'], category: 'Elite',
    stats: { move: '4"', wounds: 3, armor: '5+', evade: '5+', ward: null },
    attacks: [{ name: 'Sword', range: 'Engaged', attacks: 3, hit: '5+', damage: 1, keywords: [] }],
    abilities: [], groups: [{
      id: 'formationAndCombatUpgrades', label: 'Formation', kind: 'check',
      options: [{ id: 'reinforce:0', name: 'Reinforced Bodies', points: 30, extraModelSurcharge: 10, effect: bodies }],
    }],
  }
  const u = resolveUnit(entry, { uid: 'test', models: 5, picks: { formationAndCombatUpgrades: ['reinforce:0'] } })
  assert.equal(u.points, 235)
  assert.equal(u.stats.wounds, 4)
})
