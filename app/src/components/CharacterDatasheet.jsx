import { useState } from 'react'
import { SKILLS, attackTone, cap, gearTone, sheetCommands, sheetTalents, talentDetail, talentTitle } from '../character/engine.js'
import { CharacterStatGroups } from './StatStrip.jsx'

function PdfButton({ character, view }) {
  const [state, setState] = useState('idle')
  const download = async () => {
    setState('working')
    try {
      const { downloadCharacterPdf } = await import('../character/pdf.jsx')
      await downloadCharacterPdf(character, view)
      setState('idle')
    } catch (err) {
      console.error(err)
      setState('error')
    }
  }
  return (
    <div className="pdf-controls">
      <button className="primary" disabled={state === 'working'} onClick={download}>
        {state === 'working' ? 'Building PDF…' : 'Download PDF'}
      </button>
      {state === 'error' && <span className="bad small">Could not build the PDF (see console).</span>}
    </div>
  )
}

// Printable character sheet: everything needed at the table, without the editing controls.
export default function CharacterDatasheet({ character, view }) {
  const { ancestry, cls, sub, attacks } = view
  const commands = sheetCommands(view)
  const equipped = view.gear.filter((g) => g.equipped)
  const talents = sheetTalents(view.entries)

  return (
    <div className="datasheets">
      <div className="datasheets-top">
        <div>
          <h2>{character.name || 'Character'} <span className="muted">· Sheet</span></h2>
          <div className="muted small">Print-ready summary. Edit values on the Stats, Talent Pyramid and Gear tabs.</div>
        </div>
        <PdfButton character={character} view={view} />
      </div>

      <article className="sheet char-sheet">
        <header className="sheet-head">
          <div>
            <h3>{character.name || 'Unnamed Character'}</h3>
            <div className="sheet-sub">{ancestry.name} {cls.name} · {sub.name} · Size {view.size}</div>
          </div>
          <div className="sheet-points">{view.points.total}<span>pts</span></div>
        </header>

        <CharacterStatGroups view={view} />

        <h4>Skills</h4>
        <div className="skill-chips">
          {SKILLS.map((s) => (
            <span key={s} className={`skill-chip ${view.skills[s] < 6 ? 'trained' : ''}`}>{cap(s)} <strong>{view.skills[s]}+</strong></span>
          ))}
        </div>

        {attacks.length > 0 && (
          <table className="sheet-table">
            <thead>
              <tr><th>Attack</th><th>Range</th><th>A</th><th>Hit</th><th>Dmg</th><th>Keywords</th></tr>
            </thead>
            {['Assault', 'Combat'].map((phase) => {
              const rows = attacks.filter((a) => a.phase === phase)
              return rows.length > 0 && (
                <tbody key={phase}>
                  <tr className="phase-row">
                    <td colSpan={6}>{phase} Phase <span className="muted">{phase === 'Assault' ? '· ranged attacks & spells' : '· melee'}</span></td>
                  </tr>
                  {rows.map((a) => (
                    <tr key={a.name} className={a.modified ? 'modified' : ''}>
                      <td className={`name-${attackTone(a)}`}>{a.name}{a.modified && <span className="mod-mark" title="Modified by Talents or items"> ▲</span>}</td>
                      <td>{a.range}</td><td>{a.attacks}</td><td>{a.hit}</td>
                      <td>{a.damage}{a.damageTypes.length > 0 && <span className="muted small"> {a.damageTypes.join('/')}</span>}</td>
                      <td>{a.keywords.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              )
            })}
          </table>
        )}

        {view.thrall && (
          <div className="sheet-block">
            <h4>{view.thrall.name} Unit <span className="muted small">· starts with {view.thrall.startingModels} Models (max {view.thrall.maxModels})</span></h4>
            <table className="sheet-table">
              <thead>
                <tr><th>Move</th><th>Wounds</th><th>Armor</th><th>Evade</th><th>Ward</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>{view.thrall.stats.move}</td><td>{view.thrall.stats.wounds} per Model</td>
                  <td>{view.thrall.stats.armor}</td><td>{view.thrall.stats.evade}</td><td>{view.thrall.stats.ward ?? '—'}</td>
                </tr>
              </tbody>
              <thead>
                <tr><th>Attack</th><th>Range</th><th>A</th><th>Hit</th><th>Dmg</th><th>Keywords</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td className="name-melee">{view.thrall.attack.name}</td><td>{view.thrall.attack.range}</td><td>{view.thrall.attack.attacks}</td>
                  <td>{view.thrall.attack.hit}</td>
                  <td>{view.thrall.attack.damage} <span className="muted small">{view.thrall.attack.damageTypes.join('/')}</span></td>
                  <td>{view.thrall.attack.keywords.join(', ')}</td>
                </tr>
              </tbody>
            </table>
            <p><strong>{view.thrall.passive.name}</strong><br />{view.thrall.passive.effect}</p>
            <p className="muted small">Move, Armor, Evade and Hit follow the Necromancer's Athletics, Medicine, Stealth and Mysticism skills.</p>
          </div>
        )}

        <div className="char-cols">
          <div>
            <div className="sheet-block">
              <h4>Traits</h4>
              {view.traits.map((t, i) => (
                <p key={i}><strong>{t.name}</strong> <span className="muted small">{t.source}{t.timing ? ` · ${t.timing}` : ''}</span><br />{t.text}</p>
              ))}
            </div>
            {view.formulaList.length > 0 && (
              <div className="sheet-block">
                <h4>Formulas</h4>
                {view.formulaList.map((f) => (
                  <p key={f.name}>
                    <strong>{f.name}</strong> <span className="muted small">{f.timing}</span>
                    {f.specialty && <span className="tag tag-special">Field Specialty</span>}
                    {!f.specialty && f.prepared && <span className="tag tag-suggested">Prepared</span>}
                    <br />{f.effect}
                    {f.attack && <><br /><span className="muted small">Attack: {f.attack.range} · {f.attack.attacks}A · {f.attack.hit} · D{f.attack.damage}{f.attack.keywords.length ? ` · ${f.attack.keywords.join(', ')}` : ''}</span></>}
                  </p>
                ))}
              </div>
            )}            {commands.length > 0 && (
              <div className="sheet-block">
                <h4>Prepared Commands</h4>
                {commands.map((c) => (
                  <p key={c.key}><strong>{c.name}</strong> <span className="muted small">{c.source} · {c.timing}</span><br />{c.effect}</p>
                ))}
              </div>
            )}
          </div>
          <div>
            {view.entries.length > 0 && (
              <div className="sheet-block">
                <h4>Talents · {view.points.spent} XP</h4>
                {talents.abilities.map((e) => (
                  <p key={`${e.tier}-${e.index}`}>
                    <strong>{talentTitle(e)}</strong> <span className="muted small">Tier {e.tier}{talentDetail(e) ? ` · ${talentDetail(e)}` : ''}</span>
                    <br />{e.text}
                  </p>
                ))}
                {talents.other.length > 0 && (
                  <p className="muted small">
                    Applied in the stats and attacks above, or available as Commands: {talents.other.map((e) => talentTitle(e)).join(', ')}.
                  </p>
                )}
              </div>
            )}
            <div className="sheet-block">
              <h4>Equipment</h4>
              {!equipped.length && <p className="muted">Nothing equipped.</p>}
              {equipped.map((g) => (
                <div key={g.uid} className="gear-entry">
                  <p>
                    <strong className={gearTone(g) ? `name-${gearTone(g)}` : ''}>{g.name}</strong>{' '}
                    <span className="muted small">{g.kind === 'custom' ? g.points || 0 : g.def.points} pts</span>
                  </p>
                  {g.enchantList?.map((e) => (
                    <p key={e.key} className="enchant-line small">
                      <span className="enchant-mark">✦</span> <strong>{e.entry.name}{e.choice ? ` (${e.choice})` : ''}</strong> <span className="muted">+{e.points}</span>
                      {(e.entry.effect || e.cmdText) && <> {e.entry.effect ?? e.cmdText}</>}
                      {(e.entry.command || e.cmdName) && <span className="muted"> Command: {e.entry.command?.name ?? e.cmdName}.</span>}
                    </p>
                  ))}
                </div>
              ))}
              {view.points.other > 0 && <p className="muted small">Other Points: {view.points.other}</p>}
            </div>
            {character.miscGear.length > 0 && (
              <div className="sheet-block">
                <h4>Adventuring Gear</h4>
                {character.miscGear.map((i) => (
                  <p key={i.uid}><strong>{i.name}</strong>{i.qty > 1 && <span className="muted small"> ×{i.qty}</span>}{i.note && <span className="muted small"> · {i.note}</span>}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {(character.background || character.notes) && (
          <div className="sheet-block">
            <h4>Notes</h4>
            {character.background && <p>{character.background}</p>}
            {character.notes && <p className="muted pre">{character.notes}</p>}
          </div>
        )}
        <footer className="sheet-keywords">{view.tags.join(' · ')}</footer>
      </article>
    </div>
  )
}
