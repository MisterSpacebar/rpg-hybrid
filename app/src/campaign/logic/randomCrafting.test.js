import assert from 'node:assert/strict'
import test from 'node:test'
import { ANTI_TAGS } from '../../tags.js'
import { generateCraftingQualities } from './randomCrafting.js'
import { QUALITY_RULES, validateQualityPlan, randomDeterioration, eligibleDeteriorations } from './qualityEngine.js'

const data = {
  melee: [{ name: 'Longsword', points: 10,
    profile: { range: 'Engaged', attacks: 4, hit: '5+', damage: 1, keywords: [] } }],
  ranged: [{ name: 'Shortbow', points: 5,
    profile: { range: '6"', attacks: 2, hit: '5+', damage: 1, keywords: [] } }],
  armor: [
    { name: 'Light Armor', points: 10, armor: '5+' },
    { name: 'Heavy Armor', points: 35, armor: '3+' },
  ],
  shield: { name: 'Shield', points: 15 },
}
const item = (kind='melee', name='Longsword', extras={}) =>
  ({kind,name,workshopEvents:[],enchants:[],...extras})
const roll = (qualities=0,surges=0,success=true) => ({qualities,surges,success})
const validate = (base, r, plan, magical=false) =>
  validateQualityPlan(base,data,r,plan.map((p)=>
    p.id === 'specialized' && !p.choice ? {...p,choice:ANTI_TAGS[0]} : p),{magical})
const seeded = (seed) => {
  let x = seed >>> 0
  return () => { x = (1664525*x + 1013904223) >>> 0; return x/4294967296 }
}

test('failure never grants Boons and a zero-budget Surge can still unlock Critical 1', () => {
  assert.deepEqual(generateCraftingQualities(item(),data,roll(3,1,false),{},seeded(1)).plan,[])
  const result=generateCraftingQualities(item(),data,roll(0,1),{},seeded(2))
  assert.deepEqual(result.plan,[{id:'exceptionalEdge',ranks:1}])
  assert.equal(result.spent,0)
  assert.equal(result.addedPoints,30)
})

test('every generated plan is legal and budget-limited across deterministic rolls and item types', () => {
  const kinds=[
    item(),item('ranged','Shortbow'),item('armor','Light Armor'),
    item('armor','Heavy Armor'),item('shield','Shield'),
  ]
  for(const base of kinds) for(let n=0;n<80;n++){
    const r=roll(n%5,n%3===0?1:0)
    const options={magical:n%2===0}
    const generated=generateCraftingQualities(base,data,r,options,seeded(101+n*17))
    const actual=validate(base,r,generated.plan,options.magical)
    assert.equal(actual.spent,generated.spent)
    assert.equal(actual.addedPoints,generated.addedPoints)
    assert(actual.spent<=r.qualities)
    assert(generated.plan.length<=3)
    assert(generated.plan.every((p)=>QUALITY_RULES[p.id].allowed.includes(base.kind)))
    assert(generated.plan.every((p)=>!QUALITY_RULES[p.id].exceptional||r.surges>0))
    assert(new Set(generated.plan.map((p)=>p.id)).size===generated.plan.length)
  }
})

test('ordinary crafting cannot generate a new exceptional Quality without Surge', () => {
  for(let n=1;n<=40;n++){
    const result=generateCraftingQualities(item(),data,roll(4),{},seeded(n))
    assert(!result.plan.some((p)=>QUALITY_RULES[p.id].exceptional))
  }
})

test('Sheltering can appear on Light Armor but never Heavy Armor', () => {
  let found=false
  for(let n=1;n<=300;n++){
    const light=generateCraftingQualities(item('armor','Light Armor'),data,roll(3),{},seeded(n))
    found ||= light.plan.some((p)=>p.id==='sheltering')
    const heavy=generateCraftingQualities(item('armor','Heavy Armor'),data,roll(3),{},seeded(n))
    assert(!heavy.plan.some((p)=>p.id==='sheltering'))
  }
  assert(found)
})

test('Specialized is generated without choosing its new Anti-tag for the player', () => {
  let found
  for(let n=1;n<=500 && !found;n++){
    const result=generateCraftingQualities(item(),data,roll(5),{},seeded(n))
    if(result.needsAntiTag) found=result
  }
  assert(found)
  const row=found.plan.find((p)=>p.id==='specialized')
  assert.equal(row.choice,'')
  assert.throws(()=>validateQualityPlan(item(),data,roll(5),found.plan),/Invalid/)
  assert.doesNotThrow(()=>validate(item(),roll(5),found.plan))
})

test('an existing Anti tag is retained rather than chosen again', () => {
  const old=item('melee','Longsword',{workshopEvents:[{
    kind:'improve',plan:[{id:'specialized',ranks:1,choice:ANTI_TAGS.at(-1)}],
  }]})
  for(let n=1;n<=70;n++){
    const g=generateCraftingQualities(old,data,roll(3),{},seeded(n))
    const anti=g.plan.find((p)=>p.id==='specialized')
    if(anti)assert.equal(anti.choice,ANTI_TAGS.at(-1))
    assert(!g.needsAntiTag)
  }
})

test('generated Boons and random Banes both honor existing equipment limits', () => {
  const base=item()
  const g=generateCraftingQualities(base,data,roll(3,1),{},seeded(25))
  const choices=eligibleDeteriorations(base,data,g.plan)
  const bane=randomDeterioration(base,data,g.plan,seeded(5))
  assert(choices.includes(bane))
  assert.equal(validate(base,roll(3,1),g.plan).addedPoints,g.addedPoints)
})
