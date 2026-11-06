import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MAX_WORK_EVENTS, QUALITY_RULES, availableQualities, eligibleDeteriorations,
  itemWorkState, randomDeterioration, repairOptions, validateQualityPlan, workEffects,
} from './qualityEngine.js'

const data = {
  melee: [{ name: 'Longsword', points: 10,
    profile: { range: 'Engaged', attacks: 4, hit: '5+', damage: 1, keywords: [] } }],
  ranged: [{ name: 'Shortbow', points: 5,
    profile: { range: '6"', attacks: 4, hit: '6+', damage: 1, keywords: [] } }],
  armor: [
    { name: 'Light Armor', points: 10, armor: '5+' },
    { name: 'Heavy Armor', points: 35, armor: '3+' },
  ],
  shield: { name: 'Shield', points: 15 },
}
const sword = () => ({ kind:'melee', name:'Longsword', workshopEvents:[], enchants:[] })
const roll = (qualities, surges=0, success=true) => ({ success, qualities, surges })

test('Surge unlocks Critical, excess successes buy Critical 2 and Accurate 1 for +55 pts', () => {
  const plan = [{ id:'exceptionalEdge',ranks:2 },{ id:'balanced',ranks:1 }]
  const v = validateQualityPlan(sword(),data,roll(2,1),plan)
  assert.equal(v.spent,2)
  assert.equal(v.addedPoints,55)
  const item = { ...sword(),workshopEvents:[{ kind:'craft',plan,flaw:null }] }
  assert.equal(itemWorkState(item,data).points,55)
  assert.equal(data.melee[0].points + workEffects(item,data).points,65)
  assert.equal(workEffects(item,data).mod.critical,2)
  assert.equal(workEffects(item,data).mod.accurate,1)
  assert.throws(()=>validateQualityPlan(sword(),data,roll(2),plan),/Surge/)
})

test('existing ranks cannot exceed caps or double-spend excess successes', () => {
  const item = { ...sword(),workshopEvents:[{ plan:[{id:'balanced',ranks:2}] }] }
  assert.equal(validateQualityPlan(item,data,roll(1),[{id:'balanced',ranks:1}]).spent,1)
  assert.throws(()=>validateQualityPlan(item,data,roll(2),[{id:'balanced',ranks:2}]),/rank cap/)
  assert.throws(()=>validateQualityPlan(sword(),data,roll(1),[{id:'precise',ranks:1}]),/excess successes/)
  assert.throws(()=>validateQualityPlan(sword(),data,roll(2),[{id:'balanced',ranks:1},{id:'balanced',ranks:1}]),/Invalid/)
})

test('Sheltering Cover stacks up to 2 and is not offered to ordinary Heavy Armor', () => {
  const light = {kind:'armor',name:'Light Armor',workshopEvents:[]}
  assert(availableQualities(light,data).includes('sheltering'))
  assert(!availableQualities({kind:'armor',name:'Heavy Armor'},data).includes('sheltering'))
  const plan=[{id:'sheltering',ranks:2}]
  assert.equal(validateQualityPlan(light,data,roll(2),plan).addedPoints,30)
  const actual=workEffects({...light,workshopEvents:[{plan}]},data)
  assert.equal(actual.coverAdjust,2)
  assert(actual.defenses.includes('Cover 2'))
})

test('Blunder picks only eligible reducible stats and retains purchased Points', () => {
  const item={...sword(),workshopEvents:[{plan:[{id:'destructive',ranks:1}]}]}
  assert(eligibleDeteriorations(item,data).includes('damage'))
  const flaw=randomDeterioration(item,data,[],()=>0)
  assert(eligibleDeteriorations(item,data).includes(flaw))
  const penalized={...item,workshopEvents:[...item.workshopEvents,{flaw:'damage'}]}
  assert.equal(workEffects(penalized,data).mod.damage,0)
  assert.equal(workEffects(penalized,data).points,30)
  assert(repairOptions(penalized,data).includes('damage'))
  const repaired={...penalized,workshopEvents:[...penalized.workshopEvents,{kind:'repair',repair:'damage'}]}
  assert.equal(workEffects(repaired,data).mod.damage,1)
  assert.equal(workEffects(repaired,data).points,30)
})

test('fixed Minor Enchantments share cap with added ranks and are not repriced', () => {
  const item={...sword(),enchants:[{key:'minor:Accurate 1'}],workshopEvents:[]}
  const plan=[{id:'balanced',ranks:2}]
  assert.equal(validateQualityPlan(item,data,roll(2),plan).addedPoints,20)
  const result=workEffects({...item,workshopEvents:[{plan}]},data)
  assert.equal(result.mod.accurate,2)
  assert.equal(result.points,20)
  assert.throws(()=>validateQualityPlan(item,data,roll(3),[{id:'balanced',ranks:3}]),/rank cap/)
})
test('workshop history limit is finite and a damaged item needs repair first', () => {
  const damaged={...sword(),workshopEvents:[{flaw:'damaged'}]}
  assert.throws(()=>validateQualityPlan(damaged,data,roll(1),[{id:'balanced',ranks:1}]),/repaired/)
  assert.equal(MAX_WORK_EVENTS,8)
  assert.equal(QUALITY_RULES.exceptionalEdge.max,2)
})
