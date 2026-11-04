import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { loadCharacterData } from '../character/data.js'
import { derive, emptyCharacter, newGearItem, normalizeCharacter } from '../character/engine.js'
import CharacterStats from '../components/CharacterStats.jsx'
import CharacterDatasheet from '../components/CharacterDatasheet.jsx'
import TalentPyramid from '../components/TalentPyramid.jsx'
import { SignInButton } from '../components/UserMenu.jsx'
import {
  approveHero, approveJoin, createCampaign, FORMATS, listCampaignHeroes, listJoinRequests,
  listMyCampaigns, loadApprovedHero, loadCampaign, rejectJoin, requestToJoin,
  saveHeroDraft, updateCampaignProgress,
} from './cloud.js'
import { startingArmorAllowed, startingWeaponNames, validateCampaignSheet } from './equipment.js'

const errorMessage = (e) => e?.message || 'Something went wrong. Please try again.'
const actName = ['The Gathering Storm', 'Founding the Company', 'Rising Powers', 'The Final Reckoning']
const copyId = (id) => navigator.clipboard?.writeText(id)

export default function CampaignSection({ hash }) {
  const { user, profile, loading } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [name, setName] = useState('')
  const [format, setFormat] = useState('standard')
  const [invite, setInvite] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const id = hash.match(/^#\/campaign\/([^/]+)/)?.[1]

  const refresh = useCallback(async () => {
    if (!user) return
    try { setCampaigns(await listMyCampaigns(user.uid)) }
    catch (e) { setNotice(errorMessage(e)) }
  }, [user])
  useEffect(() => { refresh() }, [refresh])

  const submit = async (fn) => {
    setBusy(true); setNotice('')
    try { await fn() } catch (e) { setNotice(errorMessage(e)) }
    finally { setBusy(false) }
  }

  if (loading) return <div className="builder-wrap"><p className="muted">Loading…</p></div>
  if (!user) return <div className="builder-wrap"><section className="panel narrow"><h2>Campaigns</h2><p>Sign in to create or join a campaign.</p><SignInButton /></section></div>
  if (id) return <Workspace key={id} id={id} user={user} />

  return <div className="builder-wrap campaign-page">
    <h1>Campaigns</h1>
    {notice && <p className="bad" role="alert">{notice}</p>}
    <div className="panel-grid">
      <section className="panel">
        <h2>Create campaign</h2>
        <form className="campaign-form" onSubmit={(e) => { e.preventDefault(); submit(async () => {
          const created = await createCampaign(user.uid, name, format)
          window.location.hash = `#/campaign/${created}`
        }) }}>
          <label className="field">Campaign name<input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="field">Campaign length
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              {Object.keys(FORMATS).map((f) => <option key={f} value={f}>{f[0].toUpperCase() + f.slice(1)} ({FORMATS[f].reduce((a,b) => a+b,0)} turns)</option>)}
            </select>
          </label>
          <button className="primary" disabled={busy || !name.trim()}>Create</button>
        </form>
      </section>
      <section className="panel">
        <h2>Request to join</h2>
        <p className="muted small">Ask your GM for their campaign ID. They must approve your request before you can view it.</p>
        <form className="campaign-form" onSubmit={(e) => { e.preventDefault(); submit(async () => {
          await requestToJoin(invite.trim(), user.uid, profile?.displayName)
          setNotice('Join request submitted. Your GM can now approve it.')
        }) }}>
          <label className="field">Campaign ID<input required value={invite} onChange={(e) => setInvite(e.target.value)} /></label>
          <button disabled={busy || !invite.trim()}>Request access</button>
        </form>
      </section>
    </div>
    <section className="panel"><h2>My campaigns</h2>
      {!campaigns.length && <p className="muted">No campaigns yet.</p>}
      <ul className="saved-list">{campaigns.map((c) => <li key={c.id}><div><strong>{c.name}</strong><div className="muted small">{c.format} · Act {c.act} · {c.gmUid === user.uid ? 'GM' : 'PC'}</div></div><a className="button primary" href={`#/campaign/${c.id}`}>Open</a></li>)}</ul>
    </section>
  </div>
}

function Workspace({ id, user }) {
  const [campaign, setCampaign] = useState(null)
  const [heroes, setHeroes] = useState([])
  const [requests, setRequests] = useState([])
  const [approved, setApproved] = useState(null)
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('overview')
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  const [sheet, setSheet] = useState(null)
  const [progress, setProgress] = useState({ xpTotal: 0, act: 1, turn: 1 })

  const isGm = campaign?.gmUid === user.uid
  const refresh = useCallback(async () => {
    const c = await loadCampaign(id)
    setCampaign(c)
    setProgress({ xpTotal: c.xpTotal, act: c.act, turn: c.turn })
    const [hs, d, approval] = await Promise.all([listCampaignHeroes(id), loadCharacterData(), loadApprovedHero(id, user.uid)])
    setHeroes(hs); setData(d); setApproved(approval)
    setSheet((previous) => previous ?? normalizeCharacter(hs.find((h) => h.ownerUid === user.uid)?.sheet ?? emptyCharacter(), d))
    if (c.gmUid === user.uid) setRequests(await listJoinRequests(id))
  }, [id, user.uid])

  useEffect(() => { refresh().catch((e) => setError(errorMessage(e))) }, [refresh])
  const actMax = campaign ? FORMATS[campaign.format][campaign.act - 1] : 0
  const myHero = heroes.find((h) => h.ownerUid === user.uid)
  const myUpdate = (patch) => setSheet((s) => normalizeCharacter({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }, data))
  const view = useMemo(() => sheet && data ? derive(sheet, data) : null, [sheet, data])
  const creationErrors = useMemo(() => sheet && data && campaign ? validateCampaignSheet(sheet, data, campaign.xpTotal) : [], [sheet, data, campaign])
  const isValid = view && view.checks.every((c) => c.ok) && !creationErrors.length && view.points.spent <= campaign.xpTotal
  const run = async (fn) => {
    setWorking(true); setError('')
    try { await fn(); await refresh() } catch (e) { setError(errorMessage(e)) }
    finally { setWorking(false) }
  }
  if (!campaign || !data) return <div className="builder-wrap"><p>{error || 'Loading campaign…'}</p><a href="#/campaign">Back to campaigns</a></div>

  return <div className="builder-wrap campaign-page">
    <p className="small"><a href="#/campaign">Campaigns</a> / {campaign.name}</p>
    <div className="campaign-heading"><div><h1>{campaign.name}</h1><p className="muted">{isGm ? 'Game Master' : 'Player'} · {campaign.format} · Act {campaign.act}: {actName[campaign.act - 1]} · Turn {campaign.turn}/{actMax}</p></div>
      {isGm && <button onClick={() => copyId(id)}>Copy invite ID</button>}
    </div>
    {error && <p className="bad" role="alert">{error}</p>}
    <nav className="subtabs">
      {['overview', 'character', ...(isGm ? ['gm'] : [])].map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t === 'gm' ? 'GM Controls' : t === 'character' ? 'My Character' : 'Overview'}</button>)}
    </nav>
    {tab === 'overview' && <div className="panel-grid">
      <section className="panel"><h2>Campaign progress</h2><p>Shared earned XP: <strong>{campaign.xpTotal}</strong></p><p>Active players: {campaign.memberUids.length - 1}</p><p className="muted small">Each completed turn grants 5 XP; additional exploration, Act and pivotal objective awards follow the campaign rules.</p></section>
      <section className="panel"><h2>Party roster</h2><ul className="plain-list">{heroes.map((h) => <li key={h.id}><strong>{h.sheet.name}</strong> · {h.sheet.classId} <span className="muted small">({h.id === user.uid ? 'You' : h.id.slice(0, 7)})</span></li>)}</ul>{!heroes.length && <p className="muted">Players can create their campaign characters in My Character.</p>}</section>
      <section className="panel"><h2>Campaign modules</h2><p className="muted">Company roster, deployment, Gold, crafting projects, political Stakes, and strategic map are planned for subsequent milestones. These are not yet enforced by the app.</p></section>
    </div>}
    {tab === 'character' && <div>
      <div className="panel campaign-character-actions"><div><h2>{sheet.name}</h2><div className="muted small">{view.points.total} points · {view.points.spent}/{campaign.xpTotal} XP spent · {campaign.xpTotal - view.points.spent} XP unspent</div><p className="small">{myHero ? 'Saved campaign draft' : 'New campaign character'} · {approved ? 'An approved snapshot exists' : 'Not yet approved by GM'}</p></div>
        <button className="primary" disabled={working || !isValid} onClick={() => run(() => saveHeroDraft(id, user.uid, sheet))}>Save draft</button>
      </div>
      {!isValid && <section className="panel"><h3>Before saving</h3><ul className="checks">{[...creationErrors, ...(view.checks.filter((c) => !c.ok).map((c) => c.label + ': ' + c.detail)), ...(view.points.spent > campaign.xpTotal ? ['Talent XP exceeds campaign earned XP'] : [])].map((m, i) => <li key={i} className="bad">{m}</li>)}</ul></section>}
      <CharacterEditor data={data} sheet={sheet} view={view} update={myUpdate} />
      {approved && <section className="panel"><h2>Last GM-approved character</h2><CharacterDatasheet character={approved.sheet} view={derive(normalizeCharacter(approved.sheet, data), data)} /></section>}
    </div>}
    {tab === 'gm' && isGm && <div className="panel-grid">
      <section className="panel"><h2>Progression</h2><p className="muted small">Adjust manually for the first milestone. Only the GM may change campaign XP or Act progression.</p>
        <form className="campaign-form" onSubmit={(e) => { e.preventDefault(); run(() => updateCampaignProgress(campaign, progress)) }}>
          <label className="field">Total earned XP<input type="number" min={campaign.xpTotal} max={250} step={5} value={progress.xpTotal} onChange={(e) => setProgress({ ...progress, xpTotal: Number(e.target.value) })} /></label>
          <label className="field">Act<select value={progress.act} onChange={(e) => setProgress({ ...progress, act: Number(e.target.value), turn: 1 })}>{[1,2,3,4].map((a) => <option value={a} key={a}>Act {a}</option>)}</select></label>
          <label className="field">Turn<input type="number" min={1} max={FORMATS[campaign.format][progress.act - 1]} value={progress.turn} onChange={(e) => setProgress({ ...progress, turn: Number(e.target.value) })} /></label>
          <button className="primary" disabled={working}>Save progress</button>
        </form>
      </section>
      <section className="panel"><h2>Join requests</h2>{!requests.length && <p className="muted">No pending requests.</p>}
        <ul className="saved-list">{requests.map((r) => <li key={r.id}><strong>{r.displayName}</strong><div className="saved-actions"><button className="primary" disabled={working} onClick={() => run(() => approveJoin(campaign, r.uid))}>Accept</button><button disabled={working} onClick={() => run(() => rejectJoin(id, r.uid))}>Reject</button></div></li>)}</ul>
      </section>
      <section className="panel span-all"><h2>Character reviews</h2><p className="muted small">Approve a saved snapshot for deployment; further player edits do not change the approved sheet.</p><ul className="saved-list">{heroes.map((h) => {
        const v = derive(normalizeCharacter({ ...h.sheet, xpEarned: campaign.xpTotal }, data), data)
        const issues = validateCampaignSheet(h.sheet, data, campaign.xpTotal)
        const eligible = v.checks.every((c) => c.ok) && !issues.length
        return <li key={h.id}><div><strong>{h.sheet.name}</strong><div className="muted small">{v.points.total} pts · {v.points.spent}/{campaign.xpTotal} XP spent · {eligible ? 'Valid' : 'Needs corrections'}</div></div><button className="primary" disabled={working || !eligible} onClick={() => run(() => approveHero(id, h.ownerUid, h.sheet))}>Approve snapshot</button></li>
      })}</ul></section>
    </div>}
  </div>
}

function CharacterEditor({ data, sheet, view, update }) {
  const [page, setPage] = useState('stats')
  const allowedNames = startingWeaponNames(view.cls, view.sub)
  const weapons = [...data.melee.map((w) => ({ ...w, kind: 'melee' })), ...data.ranged.map((w) => ({ ...w, kind: 'ranged' }))].filter((w) => allowedNames.has(w.name))
  const armor = [...data.armor.map((w) => ({ ...w, kind: 'armor' })), { ...data.shield, kind: 'shield' }].filter((w) => startingArmorAllowed(data, view.cls, w))
  const addGear = (item) => update((c) => ({
    gear: [...c.gear.filter((g) => g.kind !== item.kind), newGearItem(item.kind, item.name)],
  }))
  return <>
    <nav className="subtabs nested">{['stats','talents','equipment','sheet'].map((t) => <button key={t} className={page===t?'active':''} onClick={() => setPage(t)}>{t[0].toUpperCase()+t.slice(1)}</button>)}</nav>
    {page === 'stats' && <CharacterStats data={data} character={sheet} view={view} update={(patch) => {
      const prospective = typeof patch === 'function' ? patch(sheet) : patch
      if (prospective.classId && prospective.classId !== sheet.classId || prospective.subclassId && prospective.subclassId !== sheet.subclassId) {
        update({ ...prospective, gear: [], spells: [], otherPoints: 0 })
      } else update(patch)
    }} />}
    {page === 'talents' && <TalentPyramid data={data} character={sheet} view={view} update={update} />}
    {page === 'equipment' && <div className="panel-grid">
      <section className="panel"><h2>Starting weapons</h2><p className="muted small">Choose only weapons offered by your Class/Subclass. Each selection still adds its equipment Points.</p><ul className="picker one-col">{weapons.map((w) => <li key={w.kind+w.name}><span><strong>{w.name}</strong> · {w.points} pts · {w.kind}</span><button disabled={sheet.gear.some((g) => g.name === w.name && g.kind === w.kind)} onClick={() => addGear(w)}>Choose</button></li>)}</ul></section>
      <section className="panel"><h2>Basic armor and shield</h2><p className="muted small">Armor access follows your Class. Acquired magical equipment is managed later.</p><ul className="picker one-col">{armor.map((w) => <li key={w.name}><span><strong>{w.name}</strong> · {w.points} pts</span><button disabled={sheet.gear.some((g) => g.name === w.name)} onClick={() => addGear(w)}>Choose</button></li>)}</ul></section>
      <section className="panel span-all"><h2>Selected equipment</h2><ul className="saved-list">{sheet.gear.map((g) => <li key={g.uid}><strong>{g.name}</strong><button className="danger" onClick={() => update((c) => ({ gear: c.gear.filter((x) => x.uid !== g.uid) }))}>Remove</button></li>)}</ul></section>
    </div>}
    {page === 'sheet' && <CharacterDatasheet character={sheet} view={view} />}
  </>
}
