import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { saveCharacter } from '../character/cloud.js'
import { useCharacter } from '../character/useCharacter.js'
import CharacterDatasheet from './CharacterDatasheet.jsx'
import CharacterStats from './CharacterStats.jsx'
import GearTab from './GearTab.jsx'
import TalentPyramid from './TalentPyramid.jsx'
import { SignInButton } from './UserMenu.jsx'

const PAGES = [
  { id: 'stats', label: 'Stats', href: '#/character' },
  { id: 'talents', label: 'Talent Pyramid', href: '#/character/talents' },
  { id: 'gear', label: 'Gear', href: '#/character/gear' },
  { id: 'sheet', label: 'Sheet', href: '#/character/sheet' },
]

const pageOf = (hash) =>
  hash.startsWith('#/character/talents') ? 'talents' : hash.startsWith('#/character/gear') ? 'gear' : hash.startsWith('#/character/sheet') ? 'sheet' : 'stats'

// Saving to the account is explicit, which keeps writes (and cost) to one per Save.
function Sidebar({ character, view, update, reset, dirty, markSaved }) {
  const { user, loading } = useAuth()
  const [state, setState] = useState('idle')

  const save = async (asNew) => {
    setState('saving')
    try {
      const id = await saveCharacter(user.uid, asNew ? { ...character, cloudId: null } : character, {
        points: view.points.total,
        ancestry: view.ancestry.name,
      })
      markSaved(id)
      setState('saved')
    } catch (err) {
      console.error(err)
      setState('error')
    }
  }

  const startNew = () => {
    if (!dirty || window.confirm('Start a new character? Anything not saved to your account will be cleared.')) reset()
  }

  const { points } = view
  return (
    <aside className="builder-side panel">
      <input className="army-name" value={character.name} maxLength={80} onChange={(e) => update({ name: e.target.value })} aria-label="Character name" />
      <div className="muted small">{view.ancestry.name} {view.cls.name} · {view.sub.name}</div>
      <div className="side-row">
        <div className="points" title="max(100, XP spent on Talents) + equipped gear + other Points">
          {points.total} <span className="muted">pts</span>
        </div>
        <div className="side-buttons">
          {!loading && (user ? (
            <button className="primary" disabled={state === 'saving' || (!!character.cloudId && !dirty)} onClick={() => save(false)}>
              {state === 'saving' ? 'Saving…' : character.cloudId ? 'Save changes' : 'Save'}
            </button>
          ) : (
            <SignInButton label="Sign in" />
          ))}
          <button onClick={startNew} title="Start a new character">New</button>
        </div>
      </div>
      <div className="side-status small">
        {loading ? null : !user ? (
          <span className="muted">Sign in to save to your account. Kept in this browser meanwhile.</span>
        ) : state === 'error' ? (
          <span className="bad">Could not save. Check your connection.</span>
        ) : character.cloudId && !dirty ? (
          <span className="ok">✓ Saved to your account · <button className="linkish" onClick={() => save(true)}>Save as new</button></span>
        ) : character.cloudId ? (
          <span className="muted">Unsaved changes · <button className="linkish" onClick={() => save(true)}>Save as new</button></span>
        ) : (
          <span className="muted">Not saved to your account yet</span>
        )}
      </div>
      <table className="slot-table points-table">
        <tbody>
          <tr><td>Base (floor 100, or XP spent)</td><td>{points.base}</td></tr>
          <tr><td>Equipped gear</td><td>{points.gear}</td></tr>
          {points.spells > 0 && <tr><td>Learned spells</td><td>{points.spells}</td></tr>}
          {points.other > 0 && <tr><td>Other Points</td><td>{points.other}</td></tr>}
          <tr><td>Talent XP spent</td><td>{points.spent} / 250</td></tr>
        </tbody>
      </table>
      <ul className="checks">
        {view.checks.map((c) => (
          <li key={c.label} className={c.ok ? 'ok' : 'bad'} title={c.detail}>
            {c.ok ? '✓' : '✗'} {c.label} <span className="muted small">{c.detail}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default function CharacterSection({ hash }) {
  const { data, character, update, reset, view, dirty, markSaved } = useCharacter()
  const page = pageOf(hash)

  return (
    <div className="builder-wrap">
      <nav className="subtabs">
        {PAGES.map((p) => (
          <a key={p.id} href={p.href} className={p.id === page ? 'active' : ''}>{p.label}</a>
        ))}
      </nav>
      {!data || !view ? (
        <p className="muted">Loading rules data…</p>
      ) : page === 'sheet' ? (
        <CharacterDatasheet character={character} view={view} />
      ) : (
        <div className="builder">
          <Sidebar character={character} view={view} update={update} reset={reset} dirty={dirty} markSaved={markSaved} />
          <div className="builder-col">
            {page === 'talents' ? (
              <TalentPyramid data={data} character={character} view={view} update={update} />
            ) : page === 'gear' ? (
              <GearTab hash={hash} data={data} character={character} view={view} update={update} />
            ) : (
              <CharacterStats data={data} character={character} view={view} update={update} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
