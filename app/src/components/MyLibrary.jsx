import { useCallback, useEffect, useState } from 'react'
import { MAX_NAME, useAuth } from '../auth/AuthContext.jsx'
import { deleteArmy, duplicateArmy, listArmies } from '../builder/cloud.js'
import { hasUnsavedWork, loadLocalArmy, saveLocalArmy, setSavedSnapshot } from '../builder/storage.js'
import { emptyArmy } from '../builder/engine.js'
import { deleteCharacter, duplicateCharacter, listCharacters } from '../character/cloud.js'
import { loadCharacterData } from '../character/data.js'
import { normalizeCharacter } from '../character/engine.js'
import { hasUnsavedCharacter, loadLocalCharacter, saveLocalCharacter, setCharacterSnapshot } from '../character/storage.js'
import { SignInButton } from './UserMenu.jsx'
import { listMyCampaignsWithHeroes } from '../campaign/cloud.js'

const FACTION_NAMES = {}

function Profile() {
  const { profile, updateDisplayName } = useAuth()
  const [name, setName] = useState(profile?.displayName ?? '')
  const [state, setState] = useState('idle')

  useEffect(() => setName(profile?.displayName ?? ''), [profile])

  const save = async (e) => {
    e.preventDefault()
    setState('saving')
    try {
      await updateDisplayName(name)
      setState('saved')
    } catch (err) {
      console.error(err)
      setState('error')
    }
  }

  return (
    <section className="panel">
      <h2>Profile</h2>
      <form className="profile-form" onSubmit={save}>
        <label className="field">
          Display name
          <input value={name} maxLength={MAX_NAME} onChange={(e) => { setName(e.target.value); setState('idle') }} />
        </label>
        <button type="submit" disabled={!name.trim() || name.trim() === profile?.displayName || state === 'saving'}>
          {state === 'saving' ? 'Saving…' : 'Save name'}
        </button>
        {state === 'saved' && <span className="ok small">Saved</span>}
        {state === 'error' && <span className="bad small">Could not save</span>}
      </form>
    </section>
  )
}

const when = (ts) => (ts?.toDate ? ts.toDate().toLocaleString() : '')

const SECTIONS = [
  { id: 'armies', label: 'Armies', href: '#/library' },
  { id: 'characters', label: 'Characters', href: '#/library/characters' },
  { id: 'campaigns', label: 'Campaigns', href: '#/library/campaigns' },
]

const sectionOf = (hash) => (hash.startsWith('#/library/characters') ? 'characters' : hash.startsWith('#/library/campaigns') ? 'campaigns' : 'armies')

// Loads a list of saved documents and exposes a refresh, so each section handles its own errors.
function useSaved(user, list, noun) {
  const [items, setItems] = useState(null)
  const [problem, setProblem] = useState(null)
  const refresh = useCallback(async () => {
    try {
      setItems(await list(user.uid))
      setProblem(null)
    } catch (err) {
      console.error(err)
      setProblem(`Could not load your ${noun}. Firestore may not be enabled yet.`)
    }
  }, [user, list, noun])
  useEffect(() => {
    refresh()
  }, [refresh])
  return { items, problem, refresh }
}

function SavedArmies({ user }) {
  const { items: armies, problem, refresh } = useSaved(user, listArmies, 'armies')

  const open = (saved) => {
    if (hasUnsavedWork(loadLocalArmy()) && !window.confirm('Replace the army you are currently editing? Its unsaved changes will be lost.')) return
    const army = { ...emptyArmy(), ...saved.army, cloudId: saved.id }
    saveLocalArmy(army)
    setSavedSnapshot(army)
    window.location.hash = '#/builder'
  }

  const duplicate = async (saved) => {
    await duplicateArmy(user.uid, saved)
    refresh()
  }

  const remove = async (saved) => {
    if (!window.confirm(`Delete "${saved.name}"? This cannot be undone.`)) return
    await deleteArmy(user.uid, saved.id)
    refresh()
  }

  return (
    <section className="panel">
      <h2>Armies {armies && <span className="muted">({armies.length})</span>}</h2>
      {problem && <p className="bad small">{problem}</p>}
      {armies && !armies.length && (
        <p className="muted">No saved armies yet. Build one on the <a href="#/builder">Army Builder</a> tab and press Save.</p>
      )}
      <ul className="saved-list">
        {armies?.map((a) => (
          <li key={a.id}>
            <div>
              <strong>{a.name}</strong>
              <div className="muted small">
                {[FACTION_NAMES[a.factionId] ?? a.factionId?.replace(/-/g, ' '), `${a.points} pts`, `${a.unitCount} units`, when(a.updatedAt)].filter(Boolean).join(' · ')}
              </div>
            </div>
            <div className="saved-actions">
              <button className="primary" onClick={() => open(a)}>Open</button>
              <button onClick={() => duplicate(a)}>Duplicate</button>
              <button className="danger" onClick={() => remove(a)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SavedCharacters({ user }) {
  const { items: characters, problem, refresh } = useSaved(user, listCharacters, 'characters')
  const { items: campaignHeroes } = useSaved(user, listMyCampaignsWithHeroes, 'campaign characters')

  const open = async (saved) => {
    if (hasUnsavedCharacter(loadLocalCharacter()) && !window.confirm('Replace the character you are currently editing? Its unsaved changes will be lost.')) return
    const character = normalizeCharacter({ ...saved.character, cloudId: saved.id }, await loadCharacterData())
    saveLocalCharacter(character)
    setCharacterSnapshot(character)
    window.location.hash = '#/character'
  }

  const duplicate = async (saved) => {
    await duplicateCharacter(user.uid, saved)
    refresh()
  }

  const remove = async (saved) => {
    if (!window.confirm(`Delete "${saved.name}"? This cannot be undone.`)) return
    await deleteCharacter(user.uid, saved.id)
    refresh()
  }

  return (
    <section className="panel">
      <h2>Characters {characters && <span className="muted">({characters.length})</span>}</h2>
      {problem && <p className="bad small">{problem}</p>}
      {characters && !characters.length && (
        <p className="muted">No saved characters yet. Create one on the <a href="#/character">Characters</a> tab and press Save.</p>
      )}
      <ul className="saved-list">
        {characters?.map((c) => (
          <li key={c.id}>
            <div>
              <strong>{c.name}</strong>
              <div className="muted small">
                {[`${c.ancestry} ${c.classId}`, c.subclassId, `${c.points} pts`, when(c.updatedAt)].filter(Boolean).join(' · ')}
              </div>
            </div>
            <div className="saved-actions">
              <button className="primary" onClick={() => open(c)}>Open</button>
              <button onClick={() => duplicate(c)}>Duplicate</button>
              <button className="danger" onClick={() => remove(c)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {campaignHeroes?.some((c) => c.hero) && <>
        <h3>Campaign characters</h3>
        <ul className="saved-list">
          {campaignHeroes.filter((c) => c.hero).map((c) => (
            <li key={c.id}>
              <div>
                <strong>{c.hero.name}</strong> <span className="tag">PC</span> <span className="tag">{c.name}</span>
                <div className="muted small">{[`${c.hero.ancestry} ${c.hero.classId}`, c.hero.subclassId, `Act ${c.act}`].filter(Boolean).join(' · ')}</div>
              </div>
              <div className="saved-actions"><a className="button primary" href={`#/campaign/${c.id}`}>Open in campaign</a></div>
            </li>
          ))}
        </ul>
      </>}
    </section>
  )
}

function CampaignBadge({ role }) {
  return <span className="tag" title={role === 'GM' ? 'You run this campaign' : 'You play a character in this campaign'}>{role === 'GM' ? 'GM' : 'PC'}</span>
}

function Campaigns({ user }) {
  const { items: campaigns, problem } = useSaved(user, listMyCampaignsWithHeroes, 'campaigns')
  return (
    <section className="panel">
      <h2>Campaigns {campaigns && <span className="muted">({campaigns.length})</span>}</h2>
      {problem && <p className="bad small">{problem}</p>}
      {campaigns && !campaigns.length && (
        <p className="muted">You are not in any campaigns. Create or join one on the <a href="#/campaign">Campaigns</a> tab.</p>
      )}
      <ul className="saved-list">
        {campaigns?.map((c) => (
          <li key={c.id}>
            <div>
              <strong>{c.name}</strong> <CampaignBadge role={c.role} />
              <div className="muted small">
                {[c.format, `Act ${c.act}`, c.status === 'completed' ? 'Completed' : null, c.role === 'PC' ? (c.hero ? `Playing ${c.hero.name}` : 'No character yet') : null, when(c.updatedAt)].filter(Boolean).join(' · ')}
              </div>
            </div>
            <div className="saved-actions"><a className="button primary" href={`#/campaign/${c.id}`}>Open</a></div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function MyLibrary({ hash }) {
  const { user, loading, error } = useAuth()
  const section = sectionOf(hash)

  if (loading) return <div className="builder-wrap"><p className="muted">Loading…</p></div>
  if (!user) {
    return (
      <div className="builder-wrap">
        <section className="panel narrow">
          <h2>My Library</h2>
          <p>Sign in to save armies and characters to your account and open them from any device.</p>
          <SignInButton />
          {error && <p className="bad small">{error}</p>}
        </section>
      </div>
    )
  }

  return (
    <div className="builder-wrap">
      <div className="armies-page">
        <Profile />
        <nav className="subtabs">
          {SECTIONS.map((s) => (
            <a key={s.id} href={s.href} className={s.id === section ? 'active' : ''}>{s.label}</a>
          ))}
        </nav>
        {section === 'characters' ? <SavedCharacters user={user} /> : section === 'campaigns' ? <Campaigns user={user} /> : <SavedArmies user={user} />}
      </div>
    </div>
  )
}