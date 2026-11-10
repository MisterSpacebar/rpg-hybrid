import { SLOT_ORDER } from '../../builder/engine.js'
import { abilityMeta, formatProfile, optionBrief, splitOptions } from '../../builder/format.js'
import PdfButton from './PdfButton.jsx'
import { StatStrip } from '../character/StatStrip.jsx'

const slotBadge = (slot) => <span className={`slot slot-${slot}`}>{slot}</span>

function Sheet({ u, rule }) {
  return (
    <article className={`sheet slot-${u.slot}`}>
      <header className="sheet-head">
        <div>
          <h3>{u.name}</h3>
          <div className="sheet-sub">
            {slotBadge(u.slot)} {u.category}
            {u.doubled && ' · Double Formation'}
            {u.isHero && <span className="tag">Hero</span>}
            {u.isCore && <span className="tag">Core</span>}
          </div>
        </div>
        <div className="sheet-points">{u.points}<span>pts</span></div>
      </header>

      <StatStrip big stats={u.stats} charge={u.charge} impact={u.impact} models={u.models} changed={u.changedStats} base={u.baseStats} factionChanged={u.factionChanged} factionRule={u.factionRule} />

      {u.attacks.length > 0 && (
        <table className="sheet-table">
          <thead>
            <tr><th>Attack</th><th>Range</th><th>A</th><th>Hit</th><th>Dmg</th><th>Keywords</th></tr>
          </thead>
          {['Assault', 'Combat'].map((phase) => {
            const rows = u.attacks.filter((a) => a.phase === phase)
            return rows.length > 0 && (
              <tbody key={phase}>
                <tr className="phase-row">
                  <td colSpan={6}>{phase} Phase <span className="muted">{phase === 'Assault' ? '· ranged attacks & spells' : '· melee'}</span></td>
                </tr>
                {rows.map((a, i) => (
                  <tr key={i} className={a.modified ? 'modified' : ''}>
                    <td>{a.name}{a.modified && <span className="mod-mark" title="Modified by upgrades"> ▲</span>}</td>
                    <td>{a.range}</td><td>{a.attacks}</td><td>{a.hit}</td><td>{a.damage}</td>
                    <td>{(a.keywords ?? []).map((k, i) => (
                      <span key={k} className={a.factionKeywords?.includes(k) ? 'fac-kw' : ''}>{i > 0 && ', '}{k}</span>
                    ))}</td>
                  </tr>
                ))}
              </tbody>
            )
          })}
        </table>
      )}
      {u.abilities.length > 0 && (
        <div className="sheet-block">
          <h4>Abilities</h4>
          {u.abilities.map((a, i) => (
            <p key={i}>
              <strong>{a.name}</strong> <span className="muted small">{abilityMeta(a)}</span>
              <br />{a.effect}
            </p>
          ))}
        </div>
      )}

      {(() => {
        const { detailed, applied } = splitOptions(u)
        return (detailed.length > 0 || applied.length > 0) && (
          <div className="sheet-block">
            {detailed.length > 0 && <h4>Options</h4>}
            {detailed.map((o, i) => (
              <p key={i}>
                <strong>{o.name}</strong> <span className="muted small">{o.group}{o.points ? ` · +${o.points}` : ''}</span>
                <br />{o.effect ?? optionBrief(o)}
              </p>
            ))}
            {applied.length > 0 && <p className="muted small">Upgrades applied above: {applied.join(', ')}.</p>}
          </div>
        )
      })()}

      {u.note && <p className="muted small">Note: {u.note}</p>}

      {rule && (
        <div className="sheet-rule">
          <strong>Faction Rule — {rule.name}.</strong> {rule.effect}
          {u.factionRule && <span className="fac-note"> ◆ Applied to this unit's profile.</span>}
        </div>
      )}
      <footer className="sheet-keywords">{[...u.tags, ...(u.isCore && !u.tags.includes('Core') ? ['Core'] : [])].join(' · ')}</footer>
    </article>
  )
}

export default function Datasheets({ view }) {
  const { faction, doctrines } = view
  const units = [...view.units].sort(
    (a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot) || a.name.localeCompare(b.name),
  )

  return (
    <div className="datasheets">
      <div className="datasheets-top">
        <div>
          <h2>{view.name || 'Army'} <span className="muted">· Datasheets</span></h2>
          <div className="muted small">
            {[faction?.name, ...doctrines.filter(Boolean).map((d) => d.name)].filter(Boolean).join(' · ') || 'No Faction chosen'}
            {' · '}{view.points} / {view.limits.maxPoints} pts
          </div>
        </div>
        <PdfButton view={view} />
      </div>

      {!units.length && (
        <p className="muted">
          No Units yet. Add Units on the <a href="#/builder">Build</a> page and their datasheets will appear here.
        </p>
      )}

      <div className="sheet-grid">
        {units.map((u) => <Sheet key={u.uid} u={u} rule={faction?.rule} />)}
      </div>

      {(faction || doctrines.some(Boolean)) && (
        <>
          <h2 className="sheet-section">Faction &amp; Doctrine Cards</h2>
          <div className="sheet-grid">
            {faction && (
              <article className="sheet faction-card">
                <header className="sheet-head">
                  <div>
                    <h3>{faction.name}</h3>
                    <div className="sheet-sub">Faction · Foundation {faction.foundationSlots.map((s, i) => <span key={i}>{slotBadge(s)}</span>)}</div>
                  </div>
                </header>
                <div className="sheet-rule"><strong>{faction.rule.name}.</strong> {faction.rule.effect}</div>
              </article>
            )}
            {doctrines.map((d) => d && (
              <article key={d.id} className="sheet doctrine-card">
                <header className="sheet-head">
                  <div>
                    <h3>{d.name}</h3>
                    <div className="sheet-sub">Doctrine · Foundation {slotBadge(d.foundationSlot)}</div>
                  </div>
                </header>
                <p className="muted">{d.strategy}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}