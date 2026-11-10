import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolveUnit } from './engine.js'
import { modifyStats, modifyTags } from './modifiers.js'

const root = new URL('../../../rules_data_json/', import.meta.url)
const data = (p) => JSON.parse(readFileSync(new URL(p, root), 'utf8'))
const faction = (number, slug) => data(`factions/${String(number).padStart(2, '0')}_${slug}.json`)
const byName = (f, name) => f.signatureCoreUnits.find((u) => u.name === name)
const refs = data('factions/00_general_roster_rules.json').generalRosterRules.signatureCoreRecruitmentReference.entries

function toEntry(unit, source = 'faction', factionId = null) {
  return {
    key: `${source}:${unit.name}`, source, factionId,
    name: unit.name, category: 'Core', basePoints: unit.points,
    baseModels: unit.models ?? 1, maxModels: unit.models ?? 1,
    modelOptions: [], tags: unit.tags ?? [], slots: ['C'],
    isCore: true, isHero: false, isLargeAsset: false, unique: false,
    isLeader: false, canDouble: source === 'faction',
    stats: unit.modelProfile ?? null, attacks: unit.attackProfiles ?? [],
    abilities: unit.abilities ?? [], groups: [],
    charge: unit.charge ?? null, impact: unit.impact ?? null,
  }
}
function resolved(u, source, id, doubled = false) {
  return resolveUnit(toEntry(u, source, id), {
    uid: `test:${u.name}`, models: u.models, picks: {}, doubled, slot: 'C',
  }, id)
}

test('Fusiliers replace Vanguard Skirmishers without changing Outriders Vanguard eligibility', () => {
  const free = faction(1, 'free_realms')
  assert.equal(byName(free, 'Vanguard Skirmishers'), undefined)
  const u = byName(free, 'Shielded Fusiliers')
  assert.ok(u)
  assert.equal(u.models, 4)
  assert.equal(u.points, 160)
  assert.equal(u.modelProfile.move, '3"')
  assert.equal(u.modelProfile.wounds, 1)
  assert.equal(u.modelProfile.armor, '5+')
  assert.equal(u.modelProfile.evade, '6+')
  assert.deepEqual(u.attackProfiles[0].keywords, ['Firearm', 'Pinpoint'])
  assert.equal(u.attackProfiles[0].hit, '3+')
  assert.equal(u.attackProfiles[0].attacks, 1)
  const shield = u.abilities.find((a) => a.name === 'Shield Formation')
  assert.match(shield.effect, /number of surviving Models/)
  assert.match(shield.effect, /no cap/i)
  const slots = refs.find((r) => r.faction === free.name && r.unit === u.name)?.eligibleSlots
  assert.deepEqual(slots, ['C', 'R'])
  assert.ok(refs.find((r) => r.faction === free.name && r.unit === 'Outriders').eligibleSlots.includes('V'))
})

test('Faction Double Formation doubles Fusilier Models and paid points, not per-Model surcharges', () => {
  const u = byName(faction(1, 'free_realms'), 'Shielded Fusiliers')
  const original = resolved(u, 'faction', 'free-realms')
  const doubled = resolved(u, 'faction', 'free-realms', true)
  assert.equal(original.models, 4)
  assert.equal(doubled.models, 8)
  assert.equal(original.points, 160)
  assert.equal(doubled.points, 320)
  assert.equal(doubled.abilities[0].name, 'Shield Formation')
  assert.match(doubled.abilities[0].effect, /no cap/i)
})

test('Generic Ranged Infantry gains Armor 5+ and Armored for 15 points', () => {
  const ranged = data('units/generic/01_infantry.json').units.find((u) => u.id === 'ranged-infantry')
  const armored = ranged.formationAndShootingUpgrades.options.find((o) => o.name === 'Armored')
  assert.equal(armored.points, 15)
  const stats = modifyStats(ranged.stats, [armored]).stats
  assert.equal(stats.armor, '5+')
  assert.ok(modifyTags(ranged.tags, [armored]).includes('Armored'))
  assert.ok(!/shield|brace/i.test(armored.effect.split('This upgrade')[0]))
})

test('Cavalry have five different printed profiles, retaining the intended total Impact', () => {
  for (const [file, slug, name, charge, impact] of [
    [2, 'sacred_orders', 'Consecrated Knights', 1, 2],
    [4, 'wild_courts', 'Wild Riders', 4, 0],
    [5, 'warclans', 'Boar Riders', 3, 2],
    [8, 'blood_courts', 'Blood Knights', 2, 2],
    [12, 'titan_clans', 'Beast Riders', 2, 4],
  ]) {
    const u = byName(faction(file, slug), name)
    assert.equal(u.charge, charge, name)
    assert.equal(u.impact, impact, name)
    const unit = resolved(u, 'faction', slug.replaceAll('_', '-'))
    assert.equal(unit.charge, charge, name)
    assert.equal(unit.impact, `+${impact}`, name)
  }
})

test('Warclans and Titan Clans reduce generic faction bonuses without changing signature cavalry', () => {
  const w = faction(5, 'warclans')
  const t = faction(12, 'titan_clans')
  assert.match(w.factionRule.effect, /generic Units recruited into Warclans instead gain Charge 1/)
  assert.match(t.factionRule.effect, /generic Units recruited into Titan Clans instead gain Impact 1/)
  const generic = { name: 'Recruited Troops', points: 75, models: 5,
    modelProfile: { move: '4"', wounds: 1, armor: '6+', evade: '6+' },
    tags: ['Infantry'], attackProfiles: [] }
  assert.equal(resolved(generic, 'generic', 'warclans').charge, 1)
  assert.equal(resolved(generic, 'generic', 'titan-clans').impact, '+1')
  assert.equal(resolved({ ...generic, charge: 3 }, 'generic', 'warclans').charge, 3)
  assert.equal(resolved({ ...generic, impact: 2 }, 'generic', 'titan-clans').impact, '+3')
  assert.equal(resolved(byName(w, 'Boar Riders'), 'faction', 'warclans').charge, 3)
  assert.equal(resolved(byName(t, 'Beast Riders'), 'faction', 'titan-clans').impact, '+4')
})

test('Wild Courts rules use any eligible Cover, without creating Cover from nothing', () => {
  const wild = faction(4, 'wild_courts')
  assert.match(wild.factionRule.effect, /while a friendly Unit already benefits from Cover/)
  assert.match(wild.factionRule.effect, /Cover 1/)
  assert.doesNotMatch(wild.factionRule.effect, /natural Cover|artificial Cover/i)
  const hunters = byName(wild, 'Glade Hunters')
  assert.equal(hunters.attackProfiles[0].hit, '5+')
  assert.equal(hunters.points, 190)
  assert.match(hunters.abilities.find((a) => a.name === 'Woodland Stalker').effect, /4\+/)
})

test('Factions gain distinct conditional accuracy instead of identical permanent 4+ profiles', () => {
  for (const [file, slug, name, points, passive] of [
    [3, 'iron_holds', 'Deep Watch', 180, 'Drilled Repeaters'],
    [5, 'warclans', 'Brutes', 195, 'Charging Fury'],
    [8, 'blood_courts', 'Night Stalkers', 170, 'Surround the Prey'],
  ]) {
    const u = byName(faction(file, slug), name)
    assert.equal(u.points, points)
    assert.equal(u.attackProfiles[0].hit, '5+')
    assert.ok(u.abilities.some((a) => a.name === passive && /4\+/.test(a.effect)))
  }
})

test('Optional 1 CP commands provide tactical differentiation without multiplying attack activations', () => {
  for (const [file, slug, unit, cmd] of [
    [2, 'sacred_orders', 'Sanctified Arbalests', 'Hallowed Screen'],
    [3, 'iron_holds', 'Ironbreakers', 'Lock Shields'],
    [6, 'underclans', 'Bombardiers', 'Overstuffed Bombs'],
    [7, 'death_legions', 'Bone Archers', 'Dread Volley'],
    [10, 'infernal_hosts', 'Rift Stalkers', 'Warp Frenzy'],
    [12, 'titan_clans', 'Stone Hurlers', 'Boulderfall'],
  ]) {
    const u = byName(faction(file, slug), unit)
    const a = u.abilities.find((a) => a.name === cmd)
    assert.equal(a.type, 'Command', `${unit} ${cmd}`)
    assert.equal(a.cost, '1 CP', `${unit} ${cmd}`)
    assert.ok(a.timing)
  }
  const guardian = byName(faction(11, 'arcane_orders'), 'Animated Guardians')
  assert.equal(guardian.points, 195)
  assert.ok(guardian.abilities.some((a) => a.name === 'Resonant Blades' && a.type === 'Passive'))
  const ranks = byName(faction(3, 'iron_holds'), 'Ironbreakers').abilities.map((a) => a.name)
  assert.ok(ranks.includes('Shieldwall') && ranks.includes('Lock Shields'))
})

test('Artillery never shows faction Charge or Impact bonuses it cannot use', () => {
  const artillery = {name: 'Field Cannon', points: 110, models: 1,
    modelProfile: {move: '3"', wounds: 4, armor: '5+', evade: null},
    tags: ['Artillery'], attackProfiles: []}
  assert.equal(resolved(artillery, 'generic', 'warclans').charge, null)
  assert.equal(resolved(artillery, 'generic', 'titan-clans').impact, null)
})
