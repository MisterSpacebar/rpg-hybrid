import { useState } from 'react'
import { CharacterStatGroups, PhaseTag } from './StatStrip.jsx'
import { formatProfile } from '../builder/format.js'
import { CHARACTERISTICS, MAX_PREPARED, SKILLS, cap, talentDetail, talentTitle } from '../character/engine.js'
import { TIERS, TIER_COST } from '../character/talents.js'

const toggle = (list, value, max) =>
  list.includes(value) ? list.filter((v) => v !== value) : max === 1 ? [value] : list.length >= max ? list : [...list, value]

function Identity({ data, character, view, update }) {
  const { ancestry, cls, sub } = view
  return (
    <section className="panel span-all">
      <h2>Identity</h2>
      <div className="identity-cols">
      <div>
      <h3 className="identity-heading">Ancestry</h3>
      <div className="form-grid">
        <label className="field">
          Ancestry
          <select value={ancestry.id} onChange={(e) => update({ ancestry: e.target.value, adaptations: [], archetype: null, humanBoost: null })}>
            {data.ancestries.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        {view.sizeChoice && (
          <label className="field">
            Size ({ancestry.size})
            <select value={character.size} onChange={(e) => update({ size: e.target.value })}>
              <option value="S">Small</option>
              <option value="M">Medium</option>
              <option value="L">Large</option>
            </select>
          </label>
        )}
        {ancestry.archetypes && (
          <label className="field">
            Undead Archetype
            <select value={character.archetype ?? ''} onChange={(e) => update({ archetype: e.target.value || null })}>
              <option value="">Choose…</option>
              {ancestry.archetypes.options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </label>
        )}
      </div>
      {ancestry.adaptations && (
        <div className="group">
          <div className="group-label">Beastfolk Adaptation{ancestry.adaptations.chooseCount > 1 ? 's' : ''} (choose {ancestry.adaptations.chooseCount === 1 ? 'one' : ancestry.adaptations.chooseCount})</div>
          <div className="chips">
            {ancestry.adaptations.options.map((o) => {
              const on = character.adaptations.includes(o.name)
              return (
                <label key={o.name} className="choice" title={o.effect}>
                  <input type="checkbox" checked={on} disabled={!on && ancestry.adaptations.chooseCount > 1 && character.adaptations.length >= ancestry.adaptations.chooseCount}
                    onChange={() => update({ adaptations: toggle(character.adaptations, o.name, ancestry.adaptations.chooseCount) })} />
                  {o.name}
                </label>
              )
            })}
          </div>
        </div>
      )}
<ul className="plain-list ancestry-traits">
  {view.traits.filter((t) => t.ancestry).map((t, i) => (
    <li key={i}>
      <strong>{t.name}</strong> <span className="muted small">{t.source}</span>
      <div className="small">{t.text}</div>
    </li>
  ))}
</ul>
</div>
<div>
<h3 className="identity-heading">Class</h3>
      <div className="form-grid">
        <label className="field">
          Class
          <select value={cls.id} onChange={(e) => update({ classId: e.target.value, subclassId: data.classes.find((c) => c.id === e.target.value).subclasses[0].id })}>
            {data.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="field">
          Subclass
          <select value={sub.id} onChange={(e) => update({ subclassId: e.target.value })}>
            {cls.subclasses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>
      <p className="muted small">{cls.role}. {sub.description}</p>
      {(cls.id === 'artificer' || sub.subclassSpellAttacks || sub.combatPhaseOptionalSpell || cls.baseSpellAttacks) && (
        <p className="small">
          {cls.id === 'artificer' ? 'Formulas' : 'Spells'} are managed on <a href="#/character/gear/spells">Gear → {cls.id === 'artificer' ? 'Formulas' : 'Spells'}</a>.
        </p>
      )}
      </div>
      </div>
      <label className="field">
        Background / description
        <textarea rows={2} value={character.background} onChange={(e) => update({ background: e.target.value })} />
      </label>
    </section>
  )
}

function Stats({ character, view, update }) {
  return (
    <section className="panel">
      <h2>Combat Profile &amp; Characteristics</h2>
      <CharacterStatGroups view={view} />
      {view.ancestry.id === 'human' && (
        <label className={`field adaptable ${character.humanBoost ? '' : 'needs'}`}>
          Adaptable (Human): raise one Characteristic from 3 to 4
          <select value={character.humanBoost ?? ''} onChange={(e) => update({ humanBoost: e.target.value || null })} className={character.humanBoost ? '' : 'needs-choice'}>
            <option value="">Choose a Characteristic…</option>
            {CHARACTERISTICS.map((c) => <option key={c} value={c}>{cap(c)}</option>)}
          </select>
        </label>
      )}
      <div className="stat-group-label">Class &amp; subclass abilities</div>
      <ul className="plain-list ancestry-traits">
        {view.traits.filter((t) => t.klass).map((t, i) => (
          <li key={i}>
            <strong>{t.name}</strong> <span className="muted small">{t.source}{t.timing ? ` · ${t.timing}` : ''}</span>
            <div className="small">{t.text}</div>
          </li>
        ))}
        {view.commands.filter((c) => c.key === 'signature').map((c) => (
          <li key={c.key}>
            <span className="ok" title="Always prepared">●</span> <strong>{c.name}</strong> <span className="muted small">{c.source} · {c.timing}</span>
            <div className="small">{c.effect}</div>
          </li>
        ))}
        {!view.traits.some((t) => t.klass) && !view.commands.some((c) => c.key === 'signature') && (
          <li className="muted small">The Artificer's Formulas are on Gear → Formulas.</li>
        )}
      </ul>
      <div className="muted small">Highlighted values differ from the {view.cls.name} printed profile (or the Ancestry start) because of Ancestry, Talents or gear.</div>
      <div>{view.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
    </section>
  )
}

function Skills({ character, view, update }) {
  // A skill holds at most one creation pick, so ticking one box replaces the other.
  const setPick = (skill, kind, on) => {
    const picks = { ...character.skillPicks }
    if (on) picks[skill] = kind
    else delete picks[skill]
    update({ skillPicks: picks })
  }
  const classFull = view.classPicks.length >= 2
  const extraFull = view.extraPicks.length >= 3
  return (
    <section className="panel">
      <h2>Skills</h2>
      <p className="muted small">All Skills start at 6+. Tick two Class Skills and three Background Skills to improve them to 5+ at creation; once a list is full its other boxes lock. Talents and Adaptations improve skills further (best 2+).</p>
      <table className="slot-table skill-table">
        <thead>
          <tr>
            <th className="left">Skill</th>
            <th>Rating</th>
            <th>Class Skill <span className={view.classPicks.length === 2 ? 'ok' : 'muted'}>({view.classPicks.length}/2)</span></th>
            <th>Background <span className={view.extraPicks.length === 3 ? 'ok' : 'muted'}>({view.extraPicks.length}/3)</span></th>
          </tr>
        </thead>
        <tbody>
          {SKILLS.map((s) => {
            const pick = character.skillPicks[s]
            const isClass = view.classList.includes(s)
            return (
              <tr key={s}>
                <td className="left">{cap(s)}{isClass && <span className="tag tag-class" title={`${view.cls.name} Class Skill`}>class</span>}</td>
                <td className={view.skills[s] < view.skillsAtCreation[s] ? 'ok' : ''}><strong>{view.skills[s]}+</strong></td>
                <td>
                  {isClass && (
                    <input type="checkbox" checked={pick === 'class'} disabled={classFull && pick !== 'class'}
                      onChange={(e) => setPick(s, 'class', e.target.checked)} aria-label={`${cap(s)} Class Skill`} />
                  )}
                </td>
                <td>
                  <input type="checkbox" checked={pick === 'extra'} disabled={extraFull && pick !== 'extra'}
                    onChange={(e) => setPick(s, 'extra', e.target.checked)} aria-label={`${cap(s)} Background Skill`} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
function Attacks({ view }) {
  return (
    <section className="panel">
      <h2>Attacks</h2>
      {!view.attacks.length && <p className="muted small">No equipped weapons or known spells. Add weapons on the <a href="#/character/gear">Gear</a> tab.</p>}
      <ul className="attack-lines">
        {view.attacks.map((a) => (
          <li key={a.name}>
            <PhaseTag phase={a.phase} /> <strong>{a.name}{a.modified && <span className="mod-mark" title="Modified by Talents"> ▲</span>}</strong>{' '}
            <span className="muted">{formatProfile(a)}{a.damageTypes.length ? ` · ${a.damageTypes.join('/')}` : ''}</span>
            {a.label && <span className="tag tag-spell">{a.label}</span>}
          </li>
        ))}
      </ul>
      {view.carried.length > 0 && <p className="muted small">Carried, not equipped: {view.carried.map((a) => a.name).join(', ')}</p>}
    </section>
  )
}

function Abilities({ view, update }) {
  const optional = view.commands.filter((c) => !c.always)
  const full = view.prepared.length >= MAX_PREPARED
  const togglePrepared = (key) => update({ prepared: toggle(view.prepared, key, MAX_PREPARED) })
  return (
    <section className="panel">
      <h2>Abilities</h2>
      <h3>Traits</h3>
      <p className="muted small">Ancestry and Class abilities are listed under Identity.</p>
      <ul className="plain-list">
        {view.traits.filter((t) => !t.ancestry && !t.klass).map((t, i) => (
          <li key={i}>
            <strong>{t.name}</strong> <span className="muted small">{t.source}{t.timing ? ` · ${t.timing}` : ''}</span>
            <div className="small">{t.text}</div>
          </li>
        ))}
      </ul>
      <h3>Commands <span className="muted small">(prepare up to {MAX_PREPARED} optional; the Signature Command under Identity is always prepared)</span></h3>
      {!view.commands.some((c) => c.key !== 'signature') && <p className="muted small">No other Commands yet.</p>}
      <ul className="plain-list">
        {view.commands.filter((c) => c.key !== 'signature').map((c) => (
          <li key={c.key}>
            {c.always ? <span className="ok" title="Always prepared">●</span> : (
              <input type="checkbox" checked={view.prepared.includes(c.key)} disabled={full && !view.prepared.includes(c.key)} onChange={() => togglePrepared(c.key)} aria-label={`Prepare ${c.name}`} />
            )}{' '}
            <strong>{c.name}</strong> <span className="muted small">{c.source} · {c.timing}</span>
            <div className="small">{c.effect}</div>
          </li>
        ))}
      </ul>
      {optional.length > 0 && <div className="muted small">{view.prepared.length} of {MAX_PREPARED} optional Commands prepared.</div>}
    </section>
  )
}

function TalentSummary({ view }) {
  return (
    <section className="panel">
      <h2>Talents <span className="muted">({view.entries.length} / 20 · {view.points.spent} XP)</span> <a className="small" href="#/character/talents">Edit in Talent Pyramid</a></h2>
      {!view.entries.length && <p className="muted small">No Talents yet. Build the pyramid on the Talent Pyramid tab and it will appear here.</p>}
      {TIERS.map((tier) => {
        const list = view.entries.filter((e) => e.tier === tier)
        if (!list.length) return null
        return (
          <div key={tier} className="group">
            <div className="group-label">Tier {tier} · {TIER_COST[tier]} XP each</div>
            <ul className="plain-list">
              {list.map((e) => (
                <li key={`${e.tier}-${e.index}`}>
                  <strong>{talentTitle(e)}</strong>{' '}
                  <span className="muted small">{talentDetail(e)}</span>
                  <div className="small">{e.text}</div>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}

function GearSummary({ view }) {
  const equipped = view.gear.filter((g) => g.equipped)
  return (
    <section className="panel">
      <h2>Equipment <span className="muted">({view.points.gear} pts)</span> <a className="small" href="#/character/gear">Edit on Gear tab</a></h2>
      {!view.gear.length && <p className="muted small">Nothing equipped yet.</p>}
      <ul className="plain-list">
        {equipped.map((g) => (
          <li key={g.uid}><strong>{g.name}</strong> <span className="muted small">{g.kind === 'custom' ? `${g.points || 0} pts` : `${g.def.points} pts`}</span></li>
        ))}
      </ul>
      {view.gear.length > equipped.length && <p className="muted small">Not equipped: {view.gear.filter((g) => !g.equipped).map((g) => g.name).join(', ')}</p>}
    </section>
  )
}

// Narrative odds and ends (rope, rations, a lantern…). They cost no Points and have no rules text.
function AdventuringGear({ character, update }) {
  const [name, setName] = useState('')
  const items = character.miscGear
  const setItems = (fn) => update((c) => ({ miscGear: fn(c.miscGear) }))
  const add = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setItems((list) => [...list, { uid: Math.random().toString(36).slice(2, 10), name: name.trim().slice(0, 60), qty: 1, note: '' }])
    setName('')
  }
  const patch = (uid, changes) => setItems((list) => list.map((i) => (i.uid === uid ? { ...i, ...changes } : i)))
  return (
    <section className="panel">
      <h2>Adventuring Gear <span className="muted">({items.length})</span></h2>
      <p className="muted small">Ropes, rations, tools and other narrative items. These cost no Points and don't affect combat stats.</p>
      <ul className="plain-list misc-gear">
        {items.map((i) => (
          <li key={i.uid}>
            <input className="misc-name" value={i.name} maxLength={60} onChange={(e) => patch(i.uid, { name: e.target.value })} aria-label="Item name" />
            <input className="misc-qty" type="number" min="1" value={i.qty} onChange={(e) => patch(i.uid, { qty: Math.max(1, Number(e.target.value) || 1) })} aria-label="Quantity" />
            <input className="misc-note" value={i.note} maxLength={120} placeholder="Note" onChange={(e) => patch(i.uid, { note: e.target.value })} aria-label="Note" />
            <button className="danger" onClick={() => setItems((list) => list.filter((x) => x.uid !== i.uid))}>Remove</button>
          </li>
        ))}
      </ul>
      <form className="profile-form" onSubmit={add}>
        <label className="field">
          Add an item
          <input value={name} maxLength={60} placeholder="e.g. 50 ft of rope" onChange={(e) => setName(e.target.value)} />
        </label>
        <button type="submit" disabled={!name.trim()}>Add</button>
      </form>
    </section>
  )
}
export default function CharacterStats({ data, character, view, update }) {
  return (
    <div className="panel-grid">
      <Identity data={data} character={character} view={view} update={update} />
      <Stats character={character} view={view} update={update} />
      <Skills character={character} view={view} update={update} />
      <Attacks view={view} />
      <GearSummary view={view} />
      <Abilities view={view} update={update} />
      <TalentSummary view={view} />
      <AdventuringGear character={character} update={update} />
      <section className="panel">
        <h2>Notes</h2>
        <textarea className="note" rows={5} value={character.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Campaign notes, bonds, goals…" />
      </section>
    </div>
  )
}
