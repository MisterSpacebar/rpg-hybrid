import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const json = (name) => JSON.parse(readFileSync(
  new URL(`../../../../rules_data_json/equipment/${name}.json`, import.meta.url), 'utf8',
))
const crafting = json('14_crafting')
const components = json('12_enchantment_components')
const ordinary = crafting.craftingQualities.commonQualities
const enhancements = components.rankedPermanentEnhancements

test('crafting and enchanting share matching ranked ordinary Qualities', () => {
  for (const q of ordinary) {
    const e = enhancements.ordinary.find((v) => v.name === q.name)
    assert(e, `Missing enchantment entry for ${q.name}`)
    assert.equal(e.maxRank, q.maxRank)
    assert.equal(e.addedPointsPerRank, q.pointsPerRank)
    assert.equal(e.excessSuccessesPerRank, q.successesPerRank)
  }
  assert.equal(ordinary.find((q) => q.name === 'Sheltering').maxRank, 2)
  assert.equal(ordinary.find((q) => q.name === 'Sheltering').pointsPerRank, 15)
})

test('surges unlock Critical that only triggers on future combat Surges', () => {
  const crit = crafting.craftingQualities.surgeExclusive.find((q) => q.name === 'Exceptional Edge')
  const enchanted = enhancements.exceptional.find((q) => q.name === 'Exceptional Edge')
  assert(crit && enchanted)
  assert.equal(crit.initialAddedPoints, 30)
  assert.equal(enchanted.initialRank, 1)
  assert.equal(enchanted.ordinaryMaxRank, 2)
  assert.equal(crit.additionalRanks[0].rank, 2)
  assert.equal(crit.additionalRanks[0].excessSuccesses, 1)
  assert.equal(crit.additionalRanks[0].additionalPoints, 15)
  assert.equal(crafting.craftingExample.result.totalPoints, 65)
  assert.equal(crafting.craftingExample.result.pointsBreakdown.reduce((sum, x) => sum + x.points, 0), 65)
})

test('all deteriorating item statistics have explicit floors', () => {
  const flaws = crafting.craftingFlaws
  assert(flaws.stats.length >= 8)
  assert(flaws.stats.every((stat) => Object.hasOwn(stat, 'floor')))
  assert(flaws.exceptions.some((x) => x.includes('Damage 0')))
  assert(flaws.exceptions.some((x) => x.includes('battlefield Points')))
  assert(flaws.selection.includes('uniformly at random'))
})

test('ordinary equipment caps and cover compatibility are shared', () => {
  assert.equal(enhancements.limits.distinctNamedQualitiesOrdinaryItem, 3)
  assert.equal(enhancements.limits.exceptionalNamedQualitiesOrdinaryItem, 1)
  assert.equal(enhancements.limits.heavyArmorShelteringRequiresExplicitException, true)
  assert.equal(enhancements.limits.coverSourcesStackUnderNormalCombatRules, true)
  assert.equal(enhancements.limits.noDoubleRerolls, true)
  assert.equal(enhancements.limits.noDoubleSpendingExcessSuccesses, true)
})
