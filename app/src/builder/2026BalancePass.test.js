import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { antiBonus, resolvedAntiBonus, canControlObjective, objectiveControlValue } from '../tags.js'
import { resolveUnit, migrateUnitConfig } from './engine.js'
import { modifyAttacks } from './modifiers.js'

const root = new URL('../../../rules_data_json/', import.meta.url)
const data = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'))
const faction = slug => data('factions/' + slug + '.json')
const ranged = data('units/generic/01_infantry.json').units.find(u => u.id === 'ranged-infantry')

function entry(u, name = u.name, key = 'faction:example') {
  return { key, source: 'faction', name, category: 'Core', basePoints: u.points,
    baseModels: u.models, maxModels: u.models, modelOptions: [], tags: u.tags,
    slots: ['C'], isCore: true, canDouble: true, stats: u.modelProfile,
    attacks: u.attackProfiles, abilities: u.abilities, groups: [] }
}

test('Anti weapon per Model differs from Unit Anti once per pool, and non-stacking compares totals', () => {
  assert.equal(resolvedAntiBonus({ weaponKeywords: ['Anti-Armored 2'], targetTags: ['Armored'], contributingModels: 4 }), 8)
  assert.equal(resolvedAntiBonus({ unitKeywords: ['Anti-Armored 4'], targetTags: ['Armored'], contributingModels: 4 }), 4)
  assert.equal(resolvedAntiBonus({ weaponKeywords: ['Anti-Armored 2'], unitKeywords: ['Anti-Armored 4'], targetTags: ['Armored'], contributingModels: 4 }), 8)
  assert.equal(resolvedAntiBonus({ weaponKeywords: ['Anti-Armored 2'], unitKeywords: ['Anti-Armored 4'], targetTags: ['Armored'], contributingModels: 1 }), 4)
  assert.equal(antiBonus(['Anti-Horde 3'], ['Horde Infantry']), 3)
})
test('normal objectives require half strength, Horde stays eligible to last model', () => {
  assert.equal(canControlObjective({ startingModels: 5, survivingModels: 2 }), false)
  assert.equal(canControlObjective({ startingModels: 5, survivingModels: 3 }), true)
  assert.equal(canControlObjective({ startingModels: 10, survivingModels: 1, tags: ['Horde'] }), true)
  assert.equal(canControlObjective({ startingModels: 10, survivingModels: 1, tags: ['Horde'], withdrawn: true }), false)
  assert.equal(objectiveControlValue({ eligible: true }), 1)
  assert.equal(objectiveControlValue({ eligible: true, modifiers: [2, 3] }), 3)
})
test('non-Elite faction Double Formation gains Horde without an extra control value', () => {
  const free = faction('01_free_realms').signatureCoreUnits[0]
  const u = resolveUnit(entry(free), { uid: 'free', models: 5, doubled: true, picks: {}, slot: 'C' })
  assert.equal(u.models, 10)
  assert.equal(u.points, 290)
  assert.ok(u.tags.includes('Horde'))
  const spell = faction('11_arcane_orders').signatureCoreUnits[0]
  const elite = resolveUnit(entry(spell), { uid: 'arcane', models: spell.models, doubled: true, picks: {}, slot: 'C' })
  assert.equal(spell.name, 'Spellstriders')
  assert.equal(elite.tags.includes('Horde'), false)
})
test('updated faction and unit prices, and selected transport/Waymark mechanics', () => {
  const iron = faction('03_iron_holds')
  const bastion = iron.largeAssets.find(u => u.name === 'Steam Bastion')
  assert.equal(bastion.points, 270)
  assert.equal(bastion.attackProfiles[0].attacks, 4)
  assert.equal(bastion.abilities.find(a => a.name === 'Transport Capacity').capacity.units, 2)
  assert.equal(bastion.abilities.find(a => a.name === 'Transport Capacity').capacity.maxModelsPerUnit, 5)
  const thunderers = iron.signatureCoreUnits.find(u => u.name === 'Thunderers')
  assert.equal(thunderers.attackProfiles.find(w => w.name === 'Musket').keywords.includes('Heavy'), true)
  assert.equal(thunderers.abilities.find(a => a.scope === 'unit').keyword, 'Anti-Armored 4')
  const spell = faction('11_arcane_orders').signatureCoreUnits[0]
  assert.equal(spell.models, 5)
  assert.equal(spell.points, 180)
  assert.equal(spell.modelProfile.ward, '6+')
  assert.ok(spell.abilities.find(a => a.name === 'Fold Step').effect.includes('leading Model'))
  assert.equal(faction('07_death_legions').signatureCoreUnits[0].points, 120)
})
test('new generic ranged packages and Longshot extension are consistent', () => {
  const options = ranged.rangedWeaponPackages.options
  assert.ok(!options.some(x => x.name === 'Slings'))
  assert.equal(options.find(x => x.name === 'Longbows').profile.range, '9"')
  assert.deepEqual(options.find(x => x.name === 'Heavy Crossbows').profile.keywords.filter(x => x.startsWith('Long Range')), ['Long Range 2"'])
  const training = ranged.formationAndShootingUpgrades.options.find(x => x.name === 'Longshot Training')
  const result = modifyAttacks([{ name: 'Longbows', range: '9"', attacks: 3, hit: '5+', keywords: ['Long Range 6"'], origin: 'pick' }], [training])
  assert.equal(result[0].keywords.find(x => x.startsWith('Long Range')), 'Long Range 8"')
})
test('retired Sling selection is not silently reassigned', () => {
  const raw = { uid: 'old', picks: { rangedWeaponPackages: 'rangedWeaponPackages:7' } }
  const selected = { key: 'generic:ranged-infantry', groups: [{ id: 'rangedWeaponPackages', required: true, kind: 'radio', options: [{ id: 'rangedWeaponPackages:0', name: 'Shortbows' }] }] }
  assert.equal(migrateUnitConfig(selected, raw).picks.rangedWeaponPackages, 'rangedWeaponPackages:7')
})
