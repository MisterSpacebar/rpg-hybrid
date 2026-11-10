import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { defaultPicks, migrateUnitConfig, resolveUnit } from './engine.js'
import { modifyAttacks } from './modifiers.js'

const readUnit = (file) =>
  JSON.parse(readFileSync(new URL(`../../../rules_data_json/units/generic/${file}.json`, import.meta.url), 'utf8')).units[0]
const infantry = JSON.parse(readFileSync(new URL('../../../rules_data_json/units/generic/01_infantry.json', import.meta.url), 'utf8')).units

function fixture(u, category, key) {
  const groups = Object.entries(u).filter(([, v]) => v && Array.isArray(v.options)).map(([id, group]) => ({
    id, kind: group.chooseCount === 1 ? 'radio' : 'check',
    max: group.chooseCount ?? null,
    required: group.chooseCount === 1 && group.options.some((o) => !(o.points ?? 0)),
    package: /weapon|equipment|shield/i.test(id) && !/training|upgrade/i.test(id),
    options: group.options.map((o, i) => ({ ...o, id: o.legacyId ?? `${id}:${i}` })),
  }))
  return {
    key, category, source: 'generic', name: u.name,
    basePoints: u.basePoints, baseModels: u.baseModels ?? 1,
    maxModels: u.maxModels ?? u.baseModels ?? 1, modelOptions: [],
    tags: u.tags, slots: ['E'], isHero: false, isCore: false, isLargeAsset: false,
    unique: false, isLeader: false, canDouble: false, stats: u.stats ?? null,
    attacks: [], abilities: [], groups, heroOption: category === 'Captain' ? 'Heroic Commission' : category === 'Wizard' ? 'Master Wizard' : null,
  }
}
const opt=(e,group,name)=>e.groups.find(g=>g.id===group).options.find(o=>o.name===name)
const picked=(e,group,name)=>opt(e,group,name).id

test('Deadly Precision costs 20, is a 1 CP Command and never a passive weapon keyword',()=>{
  const entries=[
    [infantry[0],'formationAndTrainingUpgrades'],
    [infantry[1],'formationAndShootingUpgrades'],
    [infantry[2],'formationAndCombatUpgrades'],
    [readUnit('02_cavalry_and_mobile_troops'),'unitUpgrades'],
    [readUnit('03_captains'),'equipmentAndCombatTraining'],
  ]
  for(const [unit,group] of entries){
    const upgrade=unit[group].options.find(x=>x.name==='Deadly Precision')
    assert.equal(upgrade.points,20,unit.name)
    assert.equal(upgrade.cpCost,1,unit.name)
    assert.match(upgrade.effect,/any (?:eligible )?weapon|any weapon/i,unit.name)
    assert.equal(upgrade.extraModelSurcharge,undefined,unit.name)
    const modified=modifyAttacks([{name:'Sword',range:'Engaged',attacks:2,hit:'5+',keywords:[]}],[upgrade])
    assert.ok(!modified[0].keywords.some(k=>k.startsWith('Critical')),unit.name)
  }
})

test('Marksman Training and Weapon Master provide Accurate 1 and one Hit step',()=>{
  for(const [upgrade,weapon] of [
    [infantry[1].formationAndShootingUpgrades.options.find(o=>o.name==='Marksman Training'),{name:'Bow',range:'9"',attacks:2,hit:'5+',keywords:[]}],
    [infantry[2].formationAndCombatUpgrades.options.find(o=>o.name==='Weapon Master'),{name:'Sword',range:'Engaged',attacks:3,hit:'5+',keywords:[]}],
    [readUnit('03_captains').equipmentAndCombatTraining.options.find(o=>o.name==='Weapon Master'),{name:'Sword',range:'Engaged',attacks:3,hit:'4+',keywords:[]}],
  ]){
    assert.equal(upgrade.points,30)
    const result=modifyAttacks([{...weapon,origin:'pick'}],[upgrade])[0]
    assert.equal(result.hit,weapon.hit==='4+'?'3+':'4+')
    assert.ok(result.keywords.includes('Accurate 1'))
  }
  const ranged=infantry[1].formationAndShootingUpgrades.options.find(o=>o.name==='Sharpeye')
  assert.equal(ranged.points,20)
  assert.match(ranged.effect,/Pinpoint/)
})

test('Captain ranged selector is optional and independent of Combat Training; Veterans buff both profiles',()=>{
  const raw=readUnit('03_captains'),captain=fixture(raw,'Captain','generic:captain')
  assert.equal(raw.rangedWeaponPackages.chooseCount,1)
  assert.deepEqual(raw.rangedWeaponPackages.options.map(o=>o.name),['Bow','Crossbow','Pistol','Musket'])
  assert.equal(raw.equipmentAndCombatTraining.options.some(o=>o.name==='Monster Hunter'),false)
  assert.equal(raw.equipmentAndCombatTraining.options.find(o=>o.name==='Armored').points,25)
  const cfg={uid:'c',models:1,picks:{
    meleeWeapons:picked(captain,'meleeWeapons',"Officer's Weapon"),
    rangedWeaponPackages:picked(captain,'rangedWeaponPackages','Pistol'),
    equipmentAndCombatTraining:[picked(captain,'equipmentAndCombatTraining','Veterans')],
  }}
  const result=resolveUnit(captain,cfg)
  assert.deepEqual(result.attacks.map(a=>a.name),['Pistol',"Officer's Weapon"])
  for(const attack of result.attacks){
    assert.equal(attack.attacks,attack.name==='Pistol'?3:4)
    assert.equal(attack.hit,attack.name==='Pistol'?'4+':'3+')
  }
  assert.equal(result.loadoutConflicts.length,0)
})

test('Captain and Elite Shields reject two-handed ranged weapons',()=>{
  const captain=fixture(readUnit('03_captains'),'Captain','generic:captain')
  const cfg={uid:'c',models:1,picks:{
    meleeWeapons:picked(captain,'meleeWeapons',"Officer's Weapon"),
    rangedWeaponPackages:picked(captain,'rangedWeaponPackages','Musket'),
    equipmentAndCombatTraining:[picked(captain,'equipmentAndCombatTraining','Shield')],
  }}
  const illegal=resolveUnit(captain,cfg)
  assert.ok(illegal.loadoutConflicts.some(x=>x.includes('Musket')))
  cfg.picks.rangedWeaponPackages=picked(captain,'rangedWeaponPackages','Pistol')
  assert.deepEqual(resolveUnit(captain,cfg).loadoutConflicts,[])
  const elite=infantry[2]
  const shield=elite.meleeWeaponPackages.options.find(o=>o.name==='Shields')
  assert.ok(shield.incompatibleWith.includes('Longbow'))
  assert.ok(shield.incompatibleWith.includes('Musket'))
})

test('old Captain ranged and training picks migrate without being silently reassigned',()=>{
  const captain=fixture(readUnit('03_captains'),'Captain','generic:captain')
  const old={uid:'old',models:1,picks:{meleeWeapons:'meleeWeapons:0',equipmentAndCombatTraining:['equipmentAndCombatTraining:2','equipmentAndCombatTraining:14','equipmentAndCombatTraining:9']}}
  const modern=migrateUnitConfig(captain,old)
  assert.equal(modern.picks.rangedWeaponPackages,'rangedWeaponPackages:0')
  assert.deepEqual(modern.picks.equipmentAndCombatTraining,['equipmentAndCombatTraining:14','equipmentAndCombatTraining:10'])
  assert.equal(opt(captain,'equipmentAndCombatTraining','Veterans').id,'equipmentAndCombatTraining:14')
})

test('Wizard chooses one free primary spell; Master improves that spell only',()=>{
  const raw=readUnit('04_wizards'),wizard=fixture(raw,'Wizard','generic:wizard')
  const standard=defaultPicks(wizard)
  assert.equal(raw.primarySpell.chooseCount,1)
  assert.equal(raw.primarySpell.options.length,4)
  assert.equal(standard.primarySpell,'primarySpell:0')
  const mage=resolveUnit(wizard,{uid:'mage',models:1,picks:{...standard,meleeWeaponOptions:picked(wizard,'meleeWeaponOptions','Staff or Dagger')}})
  assert.equal(mage.attacks.filter(a=>a.phase==='Assault').length,1)
  assert.equal(mage.attacks.find(a=>a.name==='Arcane Bolt').hit,'5+')
  const master=resolveUnit(wizard,{uid:'master',models:1,picks:{
    ...standard,specialization:picked(wizard,'specialization','Master Wizard'),
    primarySpell:picked(wizard,'primarySpell','Force Bolt'),
    meleeWeaponOptions:picked(wizard,'meleeWeaponOptions','Staff or Dagger'),
  }})
  assert.equal(master.attacks.find(a=>a.name==='Force Bolt').range,'14"')
  assert.equal(master.attacks.find(a=>a.name==='Force Bolt').hit,'3+')
  assert.ok(!master.attacks.some(a=>a.name==='Arcane Bolt'))
})

test('Cavalry charge and impact scale inversely, and Charge Formation is a CP command',()=>{
  const raw=readUnit('02_cavalry_and_mobile_troops'),entry=fixture(raw,'Vanguard','generic:cavalry')
  for(const [name,charge,impact] of [['Light Cavalry',3,0],['Cavalry',2,1],['Heavy Cavalry',1,2]]){
    const c=resolveUnit(entry,{uid:name,models:3,picks:{cavalryClass:picked(entry,'cavalryClass',name)}})
    assert.equal(c.charge,charge)
    assert.equal(c.impact,`+${impact}`)
  }
  const formation=raw.unitUpgrades.options.find(o=>o.name==='Charge Formation')
  assert.equal(formation.cpCost,1)
  assert.equal(formation.timing,'Assault')
  assert.match(formation.effect,/\+3/)
})

test('mobile and heavy artillery have distinct Heavy and Hit trade-offs',()=>{
  const raw=readUnit('06_artillery')
  const light=raw.lightArtilleryWeapons.options
  for(const weapon of light.filter(o=>o.name!=='Light Cannon')) assert.ok(!weapon.profile.keywords.includes('Heavy'),weapon.name)
  assert.ok(light.find(o=>o.name==='Light Cannon').profile.keywords.includes('Heavy'))
  const heavy=raw.heavyArtilleryWeapons.options
  assert.ok(heavy.every(o=>o.profile.keywords.includes('Heavy')))
  assert.deepEqual(heavy.map(o=>o.profile.hit),['3+','4+','3+','3+'])
})
