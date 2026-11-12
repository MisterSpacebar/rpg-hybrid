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

test('matched-play example armies have legal point, command and recruitment totals',()=>{
 const army=json('army_construction.json')
 assert.equal(army.standardArmy.factionCommandsAvailable,4)
 const book=md('02_wargame/04_army_construction.md')
 assert.match(book,/Choose 2 of the faction's 4/)
 assert.ok(book.includes('# 10. Worked Example — Free Realms Heavy Gunline'))
 assert.ok(book.includes('# 11. Worked Example — Warclans Horde Breakthrough'))
 const free=book.split('# 10. Worked Example — Free Realms Heavy Gunline')[1].split('# 11. Worked Example')[0]
 const war=book.split('# 11. Worked Example — Warclans Horde Breakthrough')[1].split('# 12. Army List Checklist')[0]
 const sum=(block)=>block.split('## Step 7: Purchase Units')[1].split('## Step 8:')[0].split('\n').filter(x=>/^\|/.test(x)&&/\| (?:H|C|E|R|V|S|A)\s*\| \d+\s*\|/.test(x)).reduce((total,row)=>total+Number(row.trim().split('|').at(-2).trim()),0)
 assert.equal(sum(free),2000)
 assert.equal(sum(war),2000)
 assert.match(war,/\*\*Total\*\* \| \*\*15\*\* \| \*\*12\*\* \| \*\*3\*\*/)
 assert.match(free,/Outriders\s*\| V\s*\| 175/)
 assert.match(war,/Double Formation \(20 Models\)\s*\| C\s*\| 260/)
})
