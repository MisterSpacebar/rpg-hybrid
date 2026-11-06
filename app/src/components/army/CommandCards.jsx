import { collectCommandCards } from '../../builder/format.js'
import PdfButton from './PdfButton.jsx'

export default function CommandCards({ view }) {
  const cards = collectCommandCards(view)
  return (
    <div className="datasheets">
      <div className="datasheets-top">
        <div>
          <h2>{view.name || 'Army'} <span className="muted">· Command Cards</span></h2>
          <div className="muted small">{cards.length} cards</div>
        </div>
        <PdfButton view={view} />
      </div>
      {!cards.length && (
        <p className="muted">
          Choose a Faction, Doctrines and Commands on the <a href="#/builder">Build</a> page and their cards will appear here.
        </p>
      )}
      <div className="command-grid">
        {cards.map((c) => (
          <article key={`${c.kind}|${c.source}|${c.name}`} className={`cmd-card ${c.slot ? `slot-${c.slot}` : ''} ${c.kind === 'Unit Command' ? 'unit-cmd' : ''}`}>
            <header>
              <h3>{c.name}</h3>
              {c.slot && <span className={`slot slot-${c.slot}`}>{c.slot}</span>}
            </header>
            <div className="cmd-meta">
              <span>{c.kind} · {c.source}</span>
              <span>{[c.timing, c.cost, c.frequency].filter(Boolean).join(' · ')}</span>
            </div>
            <p>{c.effect}</p>
          </article>
        ))}
      </div>
    </div>
  )
}