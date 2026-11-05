import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'

const get = (filename) => JSON.parse(readFileSync(new URL(`../../../rules_data_json/bestiary/${filename}.json`, import.meta.url), 'utf8'))
const monsters = get('04_large_monsters').units
const creatures = get('02_common_creatures').units
const unusual = get('03_unusual_creatures').units
const companions = get('07_animal_companions')
const allCompanions = [...companions.smallCompanions.units, ...companions.standardCompanions.units, ...companions.largeCompanions.units]
const find = (name) => monsters.find((u) => u.name === name)

test('expanded bestiary remains aligned with encounter counts', () => {
  assert.equal(monsters.length, 17)
  assert.equal(allCompanions.length, 15)
  const counts = get('08_encounter_and_army_integration').profileCounts
  assert.equal(counts.find((x) => x.section === 'Large Monsters').count, monsters.length)
  assert.equal(new Set(monsters.map((u) => u.name)).size, monsters.length)
})

test('dragon and Kraken encounter tiers are distinct and do not claim bonus activations', () => {
  const young = find('Young Dragon')
  const adult = find('Adult Dragon')
  const kraken = find('Abyssal Kraken')
  assert.equal(young.points, 445)
  assert.equal(adult.points, 675)
  assert.equal(kraken.points, 700)
  assert(adult.modelProfile.wounds > young.modelProfile.wounds)
  assert(adult.attackProfiles[0].attacks > young.attackProfiles[0].attacks)
  assert.equal(kraken.models, 4)
  assert.equal(kraken.modelProfile.tentacles.count, 3)
  assert.equal(kraken.modelProfile.body.wounds, 15)
  assert.equal(kraken.modelProfile.tentacles.wounds, 3)
  assert.equal(kraken.attackProfiles.find((a) => a.name === 'Titanic Tentacles').attacks, 3)
  for (const dragon of [young, adult]) {
    assert.equal(dragon.breathWeaponOptions.length, 3)
    assert(dragon.abilities.some((x) => x.name === 'Wing Buffet' && x.type === 'Command'))
  }
})

test('new intermediate bosses each have one legal native attack pool and a CP control option', () => {
  for (const name of ['Elder Treant', 'Sea Serpent']) {
    const monster = find(name)
    assert(monster.points > 400 && monster.points < 600)
    assert(monster.attackProfiles.every((a) => Number.isInteger(a.attacks) && a.attacks > 0))
    assert(monster.abilities.some((a) => a.type === 'Command' && a.cost === '1 CP'))
  }
})

test('Flying and Companion trait classifications are explicit', () => {
  for (const u of [...creatures, ...unusual, ...monsters]) {
    if (u.abilities?.some((a) => a.name === 'Flying')) assert(u.tags.includes('Flying'), u.name)
  }
  for (const u of allCompanions) {
    assert(u.tags.includes('Companion'), u.name)
    assert(u.tags.includes('Creature'), u.name)
    assert(u.tags.includes('Beast'), u.name)
  }
  assert(allCompanions.find((u) => u.name === 'Raven').tags.includes('Flying'))
  assert(allCompanions.find((u) => u.name === 'Hawk / Owl').tags.includes('Flying'))
})

test('Rat Swarm and Kraken data agree with their printed profiles', () => {
  const ratSwarm = creatures.find((u) => u.name === 'Rat Swarm')
  assert.equal(ratSwarm.models, 1)
  assert.equal(ratSwarm.attackProfiles[0].attacks, 5)
  assert(ratSwarm.upgrades.some((u) => u.name === 'Ordinary Swarm' && /five Gnawing/.test(u.description)))
  assert.equal(find('Abyssal Kraken').models, 4)
})
