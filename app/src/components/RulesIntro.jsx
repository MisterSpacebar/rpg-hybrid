import { bookGroups } from '../rulebooks.js'

const BLURBS = {
  '01_rpg': 'Characters, skill checks, classes, talents, spells, equipment, adventuring, and combat summaries.',
  combat: 'The full Narrative Combat and Structured Combat rules.',
  '02_wargame': 'Units, the twelve Core Factions, Doctrines, and army construction.',
  '03_missions': 'Objectives and scoring for matched play and campaign battles.',
  '04_campaign': 'Company Orders, Grand Factions, political Stakes, and territory across four Acts.',
}

const INFLUENCES = [
  ['Roleplaying', 'Dice-pool RPGs such as Genesys and Vaesen, and story-first games like Call of Cthulhu and Powered by the Apocalypse, shaped the d6 pool and the character rules.'],
  ['Skirmish and army battles', 'Age of Sigmar, Frostgrave, and other contemporary wargames shaped unit profiles, target-number rolls, and objective-driven battles.'],
  ['Campaign play', 'Strategy and narrative board games such as Arkham Horror 2e, Runebound, Runewars, Oath, and Arcs shaped Campaign Mode: Company Orders, rival powers, territory, and political Stakes.'],
]

const PRINCIPLES = [
  ['Characters first', 'The wargame extends the roleplaying rules instead of replacing them.'],
  ['Built for campaigns, open to other play', 'Campaign Mode is the intended experience, but it is not required: RPG sessions and matched-play battles use the same rules and stand on their own.'],
  ['One combat system', 'Matched play and campaign battles use the same Structured Combat rules.'],
  ['Consequences are earned', 'Winning a political Stake does not automatically grant territory, units, or infrastructure.'],
  ['Low bookkeeping', 'Matched-play battles aim to finish within about five Rounds.'],
]

export default function RulesIntro() {
  return (
    <article className="markdown">
      <h1>Hybrid RPG / Wargame Rules</h1>
      <p className="muted">Select a chapter from the list to start reading.</p>

      <p>
        A tabletop roleplaying game with a wargame built on the same rules. Play it as an RPG, as a
        standalone battle between two armies, or as a campaign in which the players lead a Company, the
        Game Master runs the world and its main rival, and independent Grand Factions pursue their own
        goals.
      </p>

      <h2>Influences</h2>
      <ul>
        {INFLUENCES.map(([name, text]) => (
          <li key={name}><strong>{name}.</strong> {text}</li>
        ))}
      </ul>

      <h2>Three levels of play</h2>
      <p>
        <strong>Narrative play</strong> (exploration, negotiation, roleplaying),{' '}
        <strong>structured combat</strong> (characters and formations fighting for objectives), and{' '}
        <strong>strategic play</strong> (orders, territory, politics). In a campaign all three feed one
        shared state, so a battle matters for what it changes on the map.
      </p>

      <h2>Design principles</h2>
      <ul>
        {PRINCIPLES.map(([name, text]) => (
          <li key={name}><strong>{name}.</strong> {text}</li>
        ))}
      </ul>

      <h2>Where to start</h2>
      <ul className="appendix-list">
        {bookGroups('rules').map((g) => (
          <li key={g.id}>
            <a href={`#/rules/${g.chapters[0].slug}`}>{g.title}</a>
            <span className="muted">{BLURBS[g.id]}</span>
          </li>
        ))}
      </ul>
      <p>
        New here? Read <a href="#/rules/01_rpg/01_core_rules">Core Rules</a>, then{' '}
        <a href="#/rules/02_wargame/04_army_construction">Army Construction</a>. Campaign decks and
        tables are under <a href="#/appendices">Appendices</a>.
      </p>
    </article>
  )
}