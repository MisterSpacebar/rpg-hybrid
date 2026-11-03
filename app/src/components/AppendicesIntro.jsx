import { bookGroups } from '../rulebooks.js'

// One-line summaries; the Campaign Core Rules chapter points readers to these appendices.
const SUMMARIES = {
  Appendix_A: 'The Company Orders (Explore, Commerce, Develop, Construct, Recruit, Politics, Mobilize) a Company can take each turn.',
  Appendix_B: 'Maneuver cards used by the Grand Factions during the campaign.',
  Appendix_C: 'The twelve Act Agendas; one is revealed at the start of each Act to set its central political issue.',
  Appendix_D: 'Political Tasks available to any faction.',
  Appendix_E: 'Political Tasks specific to each Grand Faction.',
  Appendix_F: 'The catalog of Neutral and Special Opportunities.',
  Appendix_G: 'Exploration Sites and the Discoveries they can yield.',
  Appendix_H: 'The Development reward deck and NPC reward conversions.',
  Appendix_I: 'Charters defining each Grand Faction’s campaign identity.',
  Appendix_J: 'Component inventory and the campaign setup checklist.',
  Appendix_K: 'Worked campaign examples.',
  Appendix_L: 'Quick reference sheets for use at the table.',
  Appendix_M: 'Optional dice tables and randomized card selection.',
  Appendix_N: 'The Campaign Council and the step-by-step turn procedure.',
  Appendix_O: 'Tri-Hex Atlas: tile layouts, resources, structures, and territorial development.',
  Appendix_P: 'Legacy Captains and converting Heroes from earlier campaigns.',
  Appendix_Q: 'Campaign records and tracking sheets.',
  Appendix_Layouts: 'Every Battlefield Layout card (Matched Play, Additional, Campaign, Escort, and Rescue), shown with its Deployment Zones and objectives.',
}

// Per-group intro text shown above that group's list, keyed by rulebooks.js group id.
const GROUP_INTROS = {
  '04_campaign':
    'These appendices support Campaign Mode. They hold the card decks, task and reward catalogs, setup checklists, tables, and tracking sheets that the Campaign Core Rules refer to. They are not needed for standard matched play, so start with the Campaign chapter on the Rules tab and come here when it points you to an appendix.',
  '05_reference':
    'This reference applies to both Matched Play and Campaign Mode. Missions and layout-selection rules call out Battlefield Layouts by name; use this to see what each one looks like.',
}

export default function AppendicesIntro({ library }) {
  const groups = bookGroups('appendices')
  return (
    <article className="markdown">
      <h1>Appendices</h1>
      {groups.map((g) => (
        <section key={g.id}>
          <h2>{g.title}</h2>
          {GROUP_INTROS[g.id] && <p>{GROUP_INTROS[g.id]}</p>}
          <ul className="appendix-list">
            {g.chapters.map((c) => (
              <li key={c.slug}>
                <a href={`#/appendices/${c.slug}`}>{library?.[c.slug]?.title ?? c.file.replace('_', ' ')}</a>
                <span className="muted">{SUMMARIES[c.file]}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}