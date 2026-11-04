import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { antiBonus, ANTI_TAGS, canonicalTags } from '../tags.js'
import { buildThrall } from './summons.js'
import { buildArmyView, resolveUnit } from '../builder/engine.js'

const dataRoot = new URL('../../../rules_data_json/', import.meta.url)
const readJson = (path) => JSON.parse(readFileSync(new URL(path, dataRoot), 'utf8'))
const factionNames = [
  '01_free_realms', '02_sacred_orders', '03_iron_holds', '04_wild_courts',
  '05_warclans', '06_underclans', '07_death_legions', '08_blood_courts',
  '09_spirit_hosts', '10_infernal_hosts', '11_arcane_orders', '12_titan_clans',
]

test('all twelve faction leaders have Unique, without deriving creature type from faction', () => {
  assert.equal(factionNames.length, 12)
  for (const name of factionNames) {
    const faction = readJson(`factions/${name}.json`)
    const leader = faction.factionLeader
    assert.ok(leader?.name, `${name} has a named leader`)
    assert.ok(leader.tags.includes('Unique'), `${leader.name} is Unique`)
    assert.ok(leader.tags.includes('Hero'), `${leader.name} is Hero`)
    assert.ok(!leader.tags.includes('Character'), `${leader.name} has no legacy Character tag`)
    const resolved = resolveUnit({
      source: 'faction', name: leader.name, key: `faction:${name}:${leader.name}`,
      basePoints: leader.points, baseModels: 1, maxModels: 1, modelOptions: [],
      tags: leader.tags, slots: ['H'], stats: leader.modelProfile,
      attacks: leader.attackProfiles ?? [], abilities: [], groups: [],
      isHero: true, isLeader: true, unique: true,
    }, { uid: name, models: 1, slot: 'H', picks: {} })
    assert.ok(resolved.tags.includes('Unique'), `${leader.name}: resolved Unique`)
    assert.equal(resolved.unique, true)
  }
})

test('all battle profile JSON files use current Unique targeting and tags', () => {
  const directories = ['factions', 'units/generic', 'bestiary', 'pc/classes', 'pc/talents']
  let scanned = 0
  const walk = (value, path) => {
    if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`))
    if (!value || typeof value !== 'object') return
    for (const [key, item] of Object.entries(value)) {
      if (key === 'tags' && Array.isArray(item)) {
        assert.ok(!item.includes('Character'), `${path}: legacy Character tag`)
      }
      if (key === 'keywords' && Array.isArray(item)) {
        assert.ok(!item.some((k) => k === 'Anti-Character' || k.startsWith('Anti-Character ')), `${path}: legacy Anti-Character`)
      }
      walk(item, `${path}.${key}`)
    }
  }
  for (const dir of directories) {
    const folder = new URL(dir + '/', dataRoot)
    for (const filename of readdirSync(folder).filter((f) => f.endsWith('.json'))) {
      walk(readJson(`${dir}/${filename}`), `${dir}/${filename}`)
      scanned++
    }
  }
  assert.ok(scanned >= 30)
})

test('legacy Character targeting remains readable but newly offered choices use Unique', () => {
  assert.ok(ANTI_TAGS.includes('Unique'))
  assert.ok(ANTI_TAGS.includes('Summoned'))
  assert.ok(!ANTI_TAGS.includes('Character'))
  assert.deepEqual(canonicalTags(['Character', 'Hero']), ['Unique', 'Hero'])
  assert.equal(antiBonus(['Anti-Character 2'], ['Unique']), 2)
  assert.equal(antiBonus(['Anti-Unique 3', 'Anti-Undead 2'], ['Unique', 'Undead']), 3)
})

test('Thrall profiles gain Infantry, Undead and Summoned, but not Hero or Unique', () => {
  const mage = readJson('pc/classes/mage.json')
  const necromancer = mage.subclasses.find((s) => s.id === 'necromancer')
  assert.deepEqual(necromancer.summonedUnit.tags, ['Infantry', 'Undead', 'Summoned'])
  const thrall = buildThrall(
    necromancer.summonedUnit,
    { mind: 4 },
    { medicine: 3, stealth: 4, mysticism: 2 },
    [{ name: 'Anti-Undead 3' }],
    [{ keywords: ['Anti-Unique 4', 'Anti-Undead 1'] }],
    'death-legions',
  )
  assert.ok(thrall.tags.includes('Death Legions'))
  assert.ok(thrall.tags.includes('Infantry'))
  assert.ok(thrall.tags.includes('Undead'))
  assert.ok(thrall.tags.includes('Summoned'))
  assert.ok(!thrall.tags.includes('Unique'))
  assert.ok(!thrall.tags.includes('Hero'))
  assert.equal(thrall.startingModels, 4)
  assert.equal(thrall.maxModels, 6)
  assert.equal(thrall.attack.attacks, 1)
  assert.equal(thrall.attack.hit, '3+')
  assert.equal(thrall.stats.armor, '5+')
  assert.equal(thrall.stats.evade, '6+')
  assert.ok(thrall.attack.keywords.includes('Anti-Undead 2'))
  assert.ok(thrall.attack.keywords.includes('Anti-Unique 3'))
  assert.equal(antiBonus(thrall.attack.keywords, ['Unique', 'Undead']), 3)
})

test('duplicate named Unique entries fail army validation independently of Hero cap', () => {
  const leader = {
    key: 'test:unique', source: 'faction', name: 'Named Champion',
    basePoints: 100, baseModels: 1, maxModels: 1, modelOptions: [],
    tags: ['Unique', 'Hero'], slots: ['H'], category: 'Leader',
    stats: { move: '4"', wounds: 3, armor: '5+', evade: '6+', ward: null },
    attacks: [], abilities: [], groups: [], isHero: true, isLeader: true, unique: true,
  }
  const limits = {
    maxPoints: 2000, minHeadquarters: 0, minCoreUnits: 0,
    maxHeroes: 3, maxNamedFactionLeaders: 2,
    maxLargeAssets: 2, maxLargeAssetsWithHeavySupport: 3,
    heavySupportDoctrineId: 'heavy-support', factionCommandsSelected: 0,
    doctrineCommandsSelectedPerDoctrine: 0, totalRecruitmentSlots: 2,
  }
  const catalog = {
    rules: { standardArmy: limits, slotCalculation: { universalFoundation: ['H', 'H'] } },
    factions: [], doctrines: [], unitsByKey: { [leader.key]: leader },
  }
  const army = {
    name: 'Test', factionId: null, doctrineIds: [null, null],
    factionCommands: [], doctrineCommands: {}, units: [
      { uid: 'one', key: leader.key, slot: 'H', picks: {}, models: 1 },
      { uid: 'two', key: leader.key, slot: 'H', picks: {}, models: 1 },
    ],
  }
  const view = buildArmyView(army, catalog)
  assert.equal(view.checks.find((c) => c.id === 'heroes').ok, true)
  assert.equal(view.checks.find((c) => c.id === 'unique').ok, false)
  assert.equal(view.checks.find((c) => c.id === 'unique').detail, 'test:unique')
  const ordinaryHero = { ...leader, tags: ['Hero', 'Officer'], unique: false, isLeader: false }
  const ordinaryView = buildArmyView(army, { ...catalog, unitsByKey: { [leader.key]: ordinaryHero } })
  assert.equal(ordinaryView.checks.find((c) => c.id === 'unique').ok, true)
})
