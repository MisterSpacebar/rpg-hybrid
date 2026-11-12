import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

const root=new URL('../../../rules_data_json/',import.meta.url)
const books=new URL('../../../rulebooks/chapters/',import.meta.url)
const json=(p)=>JSON.parse(readFileSync(new URL(p,root),'utf8'))
const md=(p)=>readFileSync(new URL(p,books),'utf8')
const fslugs=['free_realms','sacred_orders','iron_holds','wild_courts','warclans','underclans','death_legions','blood_courts','spirit_hosts','infernal_hosts','arcane_orders','titan_clans']
const dslugs=['combined_arms','objective_play','elite','counter_strike','castling','firing_line','mobility','control','alpha_strike','horde','grinding','deep_strike','slingshot','gambit','heavy_support','breakthrough']
const factions=fslugs.map((slug,i)=>json(`factions/${String(i+1).padStart(2,'0')}_${slug}.json`))
const doctrines=dslugs.map((slug,i)=>json(`doctrines/${String(i+1).padStart(2,'0')}_${slug}.json`))
const faction=(name)=>factions.find(f=>f.name===name)
const doctrine=(name)=>doctrines.find(d=>d.name===name)
const fc=(name,command)=>faction(name).factionCommands.find(c=>c.name===command)
const dc=(name,command)=>doctrine(name).commands.find(c=>c.name===command)

test('all 48 faction commands and all 80 doctrine commands match rulebook data',()=>{
  const fbook=md('02_wargame/02_core_factions.md'), dbook=md('02_wargame/03_non_faction_doctrines.md')
  assert.equal(factions.length,12);assert.equal(doctrines.length,16)
  for(const f of factions){
    assert.equal(f.factionCommands.length,4,f.name)
    assert.ok(fbook.includes(f.factionRule.effect),f.name+' faction passive not reflected in book')
    for(const c of f.factionCommands)assert.ok(fbook.includes(`**${c.name} — ${c.timing}, ${c.cost||'1 CP'}:** ${c.effect}`),f.name+' / '+c.name)
  }
  for(const d of doctrines){
    assert.equal(d.commands.length,5,d.name)
    for(const c of d.commands)assert.ok(dbook.includes(`| ${c.name} | ${c.slot} | ${c.timing} | ${c.effect.replaceAll('|','\\|')} |`),d.name+' / '+c.name)
  }
  const reference=json('factions/15_all_faction_rules_and_commands.json')
  for(const f of reference.factions){
    assert.deepEqual(f.factionRule,faction(f.faction).factionRule)
    assert.deepEqual(f.factionCommands,faction(f.faction).factionCommands)
  }
})

test('Berserker Frenzy and Infernal Hosts use the same pending temporary-Wound resolution',()=>{
 const warrior=json('pc/classes/warrior.json')
 const frenzy=warrior.subclasses.find(x=>x.id==='berserker').signatureAbility
 assert.match(frenzy.effect.join(' '),/2 temporary Wounds/)
 assert.doesNotMatch(frenzy.effect.join(' '),/Suffer 2 Damage/)
 const core=md('01_rpg/16_structured_combat.md')
 assert.match(core,/Temporary Wounds \(pending Damage\)/)
 assert.match(core,/next time the Unit suffers at least 1 Damage/)
 assert.match(core,/all its pending temporary Wounds/)
 assert.match(core,/voluntarily accrue no more than \*\*2 temporary Wounds\*\*/)
 const infernal=faction('Infernal Hosts')
 assert.match(infernal.factionRule.effect,/1 temporary Wound/)
 assert.match(fc('Infernal Hosts','Blood Offering').effect,/2 temporary Wounds/)
 assert.match(fc('Infernal Hosts','Unbound Power').effect,/temporary Wound/)
 for(const p of ['01_rpg/01_core_rules.md','01_rpg/05_classes.md','01_rpg/15_narrative_combat.md'])assert.match(md(p),/temporary Wounds/i,p)
})

test('cover and concealment mechanics are coherent',()=>{
 const w=faction('Wild Courts')
 assert.match(w.factionRule.effect,/additional Cover 1/)
 assert.doesNotMatch(w.factionRule.effect,/Ignore the first 2/)
 for(const name of ['Through the Wild','Fade into the Wilds'])assert.match(fc('Wild Courts',name).effect,/Concealed/)
 assert.match(fc('Wild Courts','Through the Wild').effect,/Blink 6/)
 assert.match(fc('Wild Courts','Fade into the Wilds').effect,/Move up to 2"/)
 const keywords=md('01_rpg/10_keywords.md')
 assert.match(keywords,/Concealed ends for that Unit/)
 assert.match(keywords,/enemy is within 4"/)
 assert.match(dc('Firing Line','Marked Fire Lane').effect,/ignore Concealed/)
 assert.match(dc('Control','Jamming Field').effect,/suppress that enemy's Concealed/)
})

test('conditional model-scaling and capped warclan offense',()=>{
 assert.equal(fc('Warclans','Overwhelm').cost,'1 CP')
 assert.match(fc('Warclans','Overwhelm').effect,/maximum of \+6/)
 assert.match(dc('Horde','Mob Tactics').effect,/maximum of 6/)
 assert.match(dc('Elite','Find the Opening').effect,/maximum 6/)
 assert.match(dc('Elite','Find the Opening').effect,/own matching battlefield Unit Type or Role tags/)
 assert.match(dc('Gambit','Double Down').effect,/each complete pair of natural 1s/)
 assert.match(dc('Control','Lockdown').effect,/by 2"/)
})

test('two contrasting 2,000-point matched-play examples obey command and recruitment rules', () => {
 const army=json('army_construction.json')
 const limits=army.standardArmy
 assert.equal(limits.factionCommandsAvailable,4)
 assert.equal(limits.minHeadquarters,1)
 for(const removed of ['minCoreUnits','maxHeroes','maxLargeAssets','maxLargeAssetsWithHeavySupport'])assert.equal(removed in limits,false)
 const book=md('02_wargame/04_army_construction.md')
 assert.match(book,/Choose 2 of the [Ff]action's 4/)
 const examples=[
  {title:'Free Realms Coordinated Gunline',doctrines:['Firing Line','Combined Arms'],points:2000,units:13,reserve:6,onTable:7,slotUse:{H:1,C:4,E:2,R:4,V:1,S:1,A:0}},
  {title:'Sacred Orders Hammer and Anvil',doctrines:['Castling','Breakthrough'],points:2000,units:10,reserve:5,onTable:5,slotUse:{H:1,C:4,E:1,R:0,V:2,S:1,A:1}}
 ]
 for(const [idx,e] of examples.entries()){
  const marker=`# ${idx+10}. Worked Example — ${e.title}`
  const start=book.indexOf(marker)
  const end=book.indexOf(`# ${idx+11}. `,start+marker.length)
  assert.ok(start>=0&&end>start,e.title+' not found')
  const block=book.slice(start,end)
  for(const n of e.doctrines)assert.ok(block.includes(n),e.title+' doctrine '+n)
  const roster=block.split('## Step 7: Purchase Units')[1].split('## Step 8:')[0]
  const rows=roster.split('\n').filter(x=>/^\|/.test(x)).map(x=>x.split('|').map(c=>c.trim()).filter(Boolean))
  const units=rows.filter(x=>x.length===4&&!x[0].startsWith('**')&&x[0]!=='Unit'&&!x[0].startsWith('---'))
  const points=units.reduce((n,row)=>n+Number(row[3]),0)
  const count=units.reduce((n,row)=>n+Number(row[1]),0)
  assert.equal(points,e.points,e.title+' points')
  assert.equal(count,e.units,e.title+' units')
  for(const slot of Object.keys(e.slotUse)){
   const used=units.reduce((n,row)=>n+row[2].split(',').map(x=>x.trim()).filter(x=>x===slot).length,0)
   assert.equal(used,e.slotUse[slot],e.title+' '+slot)
  }
  assert.match(block,new RegExp(`\\*\\*${e.onTable}\\*\\* Units on table; \\*\\*${e.reserve}\\*\\* in Reserve`))
 }
})

test('reserve rounding, healing pending Wounds, medics, and fusilier rifle range',()=>{
 const book=md('01_rpg/16_structured_combat.md')
 const quick=md('01_rpg/09_structured_combat_quick_reference.md')
 const doctrine=md('02_wargame/03_non_faction_doctrines.md')
 assert.match(book,/purchased Units in Reserve, rounded down/)
 assert.match(quick,/purchased Units, \*\*rounded down\*\*/)
 assert.match(doctrine,/Reserve, rounded down/)
 for(const size of [9,10,13,15])assert.equal(Math.floor(size/2),({9:4,10:5,13:6,15:7})[size])
 assert.match(book,/Heal X can remove up to X accumulated Damage and\/or temporary Wounds/)
 assert.match(md('01_rpg/10_keywords.md'),/Remove up to X total accumulated Damage and\/or temporary Wounds/)
 const units=json('units/generic/05_support_units.json')
 const med=units.specializations.find(x=>x.id==='field-medics')
 const eng=units.specializations.find(x=>x.id==='engineers')
 assert.match(med.abilities.find(x=>x.name==='Triage').effect,/within 3"/)
 assert.match(eng.abilities.find(x=>x.name==='Repair').effect,/within 3"/)
 const gun=faction('Free Realms').signatureCoreUnits.find(x=>x.name==='Shielded Fusiliers')
 assert.equal(gun.points,160)
 assert.equal(gun.attackProfiles[0].name,'Shielded Rifle')
 assert.equal(gun.attackProfiles[0].range,'12"')
 assert.ok(gun.attackProfiles[0].keywords.includes('Firearm'))
})
