import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../../rules_data_json/', import.meta.url)
const rulebooks = new URL('../../../rulebooks/chapters/02_wargame/', import.meta.url)
const read = (relative) => JSON.parse(readFileSync(new URL(relative, root), 'utf8'))
const readRules = (relative) => readFileSync(new URL(relative, rulebooks), 'utf8')
const factions = [
  'free_realms', 'sacred_orders', 'iron_holds', 'wild_courts', 'warclans', 'underclans',
  'death_legions', 'blood_courts', 'spirit_hosts', 'infernal_hosts', 'arcane_orders', 'titan_clans'
].map((n,i) => read(`factions/${String(i+1).padStart(2,'0')}_${n}.json`))
const doctrines = [
  'combined_arms','objective_play','elite','counter_strike','castling','firing_line',
  'mobility','control','alpha_strike','horde','grinding','deep_strike','slingshot',
  'gambit','heavy_support','breakthrough',
].map((n,i)=>read(`doctrines/${String(i+1).padStart(2,'0')}_${n}.json`))
const cmd = (faction, name) => factions.find(f=>f.name===faction).factionCommands.find(c=>c.name===name)

test('each faction has four authoritative commands and the rulebook prints all 48 options',()=>{
  const book=readRules('02_core_factions.md')
  assert.equal(factions.length,12)
  const flattened=factions.flatMap(f=>f.factionCommands)
  assert.equal(flattened.length,48)
  for(const f of factions){
    assert.equal(f.factionCommands.length,4,f.name)
    assert.equal(new Set(f.factionCommands.map(c=>c.name)).size,4,f.name)
    for(const command of f.factionCommands){
      assert.ok(book.includes(`**${command.name} — ${command.timing}, ${command.cost||'1 CP'}:**`),`${f.name}: ${command.name} absent from book`)
      assert.ok(command.effect?.length>15)
    }
  }
  assert.match(book,/four.*Faction Commands|Faction Commands.*four/i)
  const reference=read('factions/15_all_faction_rules_and_commands.json')
  for(const f of reference.factions){
    const source=factions.find(x=>x.name===f.faction)
    assert.deepEqual(f.factionCommands,source.factionCommands)
  }
})

test('Captain Advance Orders refreshes Movement activation without free reposition',()=>{
  const data=read('units/generic/03_captains.json')
  const captain=data.units.find(x=>x.id==='captain')
  const advance=captain.commands.options.find(x=>x.name==='Advance Orders')
  assert.equal(advance.timing,'Movement')
  assert.equal(advance.cpCost,1)
  assert.match(advance.effect,/Short \(6"\)/)
  assert.match(advance.effect,/already been spent/)
  assert.match(advance.effect,/later this Phase/)
  assert.match(advance.effect,/only once per Round/)
  assert.match(advance.effect,/Withdrawn/)
  assert.match(advance.effect,/Heavy/)
  assert.match(advance.effect,/Disengage/)
  assert.match(advance.effect,/Finished side/)
  assert.doesNotMatch(advance.effect,/immediately Move up to 3"/)
  const rpg=readFileSync(new URL('../../../rulebooks/chapters/01_rpg/16_structured_combat.md',import.meta.url),'utf8')
  assert.match(rpg,/refreshes a spent activation/)
  assert.match(rpg,/Cannot|cannot/i)
})

test('Captain Identify Threat grants a single +2-dice combined Attack rather than Anti-tag',()=>{
  const c=read('units/generic/03_captains.json').units.find(x=>x.id==='captain').commands.options.find(x=>x.name==='Identify Threat')
  assert.equal(c.cpCost,1)
  assert.match(c.effect,/another friendly Unit within Short \(6"\)/)
  assert.match(c.effect,/enemy Unit also within Short \(6"\)/)
  assert.match(c.effect,/\+2 Attack dice/)
  assert.match(c.effect,/single combined Attack pool/)
  assert.match(c.effect,/not per Model/i)
  assert.doesNotMatch(c.effect,/Anti-\[/)
})

test('the six requested Faction Command revisions keep their target/timing conditions',()=>{
  const wild=cmd('Wild Courts','Through the Wild')
  assert.equal(wild.timing,'Movement')
  assert.match(wild.effect,/Blink 6/)
  assert.match(wild.effect,/different piece of terrain/)
  assert.match(wild.effect,/unengaged/)
  assert.match(cmd('Wild Courts','Fade into the Wilds').effect,/Move up to 2"/)
  const sacred=cmd('Sacred Orders','Heroic Intervention')
  assert.equal(sacred.timing,'Reaction')
  assert.match(sacred.effect,/different friendly Unit within Short of the attacked Unit/)
  assert.doesNotMatch(sacred.effect,/Unique/)
  const spirit=cmd('Spirit Hosts','Haunting Presence')
  assert.match(spirit.effect,/enemy Unit within Short of the active Unit/)
  assert.match(spirit.effect,/Cover or Cover X/)
  assert.doesNotMatch(spirit.effect,/worsens Evade by one step/i)
  const arcane=cmd('Arcane Orders','Overchannel')
  assert.match(arcane.effect,/\+1 Damage/)
  assert.doesNotMatch(arcane.effect,/either Attacks or Damage/)
  const titan=cmd('Titan Clans','Smash Through')
  assert.match(titan.effect,/Charge Impact ignores the defending Unit.*Tough X/)
  assert.match(titan.effect,/Brace and ordinary Armor\/Ward still apply/)
})

test('all 16 doctrines retain five commands; rulebook tables match authoritative source',()=>{
  const book=readRules('03_non_faction_doctrines.md')
  assert.equal(doctrines.length,16)
  for(const d of doctrines){
    assert.equal(d.commands.length,5,d.name)
    assert.equal(new Set(d.commands.map(c=>c.name)).size,5,d.name)
    for(const c of d.commands){
      assert.ok(c.slot && c.timing && c.effect,d.name+' / '+c.name)
      assert.ok(book.includes(`| ${c.name} | ${c.slot} | ${c.timing} |`),d.name+' / '+c.name)
    }
  }
  assert.match(book,/active Unit/)
  const index=read('doctrines/index.json')
  assert.match(index.description,/2 selected from 4 Faction Command options/)
})

test('Doctrine ordinary buffs use active Unit while explicit coordination is preserved',()=>{
  const by=(doctrine,name)=>doctrines.find(d=>d.name===doctrine).commands.find(c=>c.name===name)
  assert.match(by('Firing Line','Concentrated Fire').effect,/active Unit/)
  assert.match(by('Mobility','Mobile Fire Support').effect,/active Unit/)
  assert.match(by('Gambit','No Quarter').effect,/active Unit/)
  assert.match(by('Elite','Knightly Order').effect,/active Unit/)
  assert.match(by('Deep Strike','Signal Beacon').effect,/active friendly Unit/)
  assert.match(by('Slingshot','Relay Maneuver').effect,/different unengaged friendly Unit/)
  assert.match(by('Slingshot','Anchor and Launch').effect,/active Unit/)
  assert.match(by('Heavy Support','Fire Control').effect,/up to two different friendly Units/)
  assert.match(by('Deep Strike','Forward Insertion').effect,/Reserve Unit/)
})
