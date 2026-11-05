import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { loadCharacterData } from '../character/data.js'
import { derive, emptyCharacter, normalizeCharacter } from '../character/engine.js'
import CharacterStats from '../components/CharacterStats.jsx'
import CharacterDatasheet from '../components/CharacterDatasheet.jsx'
import TalentPyramid from '../components/TalentPyramid.jsx'
import GearTab from '../components/GearTab.jsx'
import CampaignArmy from './CampaignArmy.jsx'
import CompanyEconomy from './CompanyEconomy.jsx'
import Toast from './Toast.jsx'
import { SignInButton } from '../components/UserMenu.jsx'
import {
  approveHero, approveJoin, createCampaign, FORMATS, rejectJoin, requestToJoin,
  saveHeroDraft, updateCampaignProgress, watchMyCampaigns,
  watchCampaign, watchHeroes, watchInventory, watchDetachments, watchApprovedHeroes, watchJoinRequests,
  deleteMyHero, revokeApproval, removePlayer, deleteCampaign,
} from './cloud.js'
import { validateCampaignSheet } from './equipment.js'
import { advanceTurn, baseXp, bonusXp } from './limits.js'
import { acceptSnapshot, discardDraft, editDraft } from './sync.js'

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

  useEffect(() => {
    if (!user) { setCampaigns([]); return }
    return watchMyCampaigns(user.uid, setCampaigns, (e) => setNotice(errorMessage(e)))
  }, [user?.uid])

  const submit = async (fn) => {
    setBusy(true); setNotice('')
    // Firestore writes wait forever when the backend is unreachable or blocked, so surface that instead of hanging silently.
    let timer
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('The server did not respond. Check your connection, ad/privacy blockers, and that the Firestore rules are deployed.')), 15000)
    })
    try { await Promise.race([fn(), timeout]) } catch (e) { console.error(e); setNotice(errorMessage(e)) }
    finally { clearTimeout(timer); setBusy(false) }
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
  const [campaignReady, setCampaignReady] = useState(false)
  const [connection, setConnection] = useState({ fromCache: false, hasPendingWrites: false })
  const [heroes, setHeroes] = useState([])
  const [heroesReady, setHeroesReady] = useState(false)
  const [requests, setRequests] = useState([])
  const [approved, setApproved] = useState(null)
  const [approvedHeroes, setApprovedHeroes] = useState([])
  const [inventory, setInventory] = useState([])
  const [detachments, setDetachments] = useState([])
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('overview')
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  const [sheetDraft, setSheetDraft] = useState(null)
  const [progressDraft, setProgressDraft] = useState(null)

  const isGm = campaign?.gmUid === user.uid
  // Firestore snapshots are the only source of remote state. One-time reloads
  // could resolve out of order and replace a newer snapshot with stale data.
  useEffect(() => {
    let cancelled = false
    loadCharacterData().then((result) => {
      if (!cancelled) setData(result)
    }).catch((e) => { if (!cancelled) setError(errorMessage(e)) })
    return () => { cancelled = true }
  }, [])
  useEffect(() => {
    const fail = (e) => { setError(errorMessage(e)); setCampaignReady(true) }
    const campaignFail = (e) => { setCampaign(null); fail(e) }
    const stops = [
      watchCampaign(id, (c, status) => {
        setConnection(status)
        setCampaign(c)
        setCampaignReady(true)
        if (c) setProgressDraft((prev) => acceptSnapshot(prev, {
          bonusXp: bonusXp(c), patronFactionId: c.patronFactionId ?? '',
        }))
      }, campaignFail),
      watchHeroes(id, (list) => { setHeroes(list); setHeroesReady(true) }, fail),
      watchInventory(id, setInventory, fail),
      watchDetachments(id, setDetachments, fail),
      watchApprovedHeroes(id, (list) => {
        setApprovedHeroes(list)
        setApproved(list.find((h) => h.ownerUid === user.uid) ?? null)
      }, fail),
    ]
    return () => stops.forEach((stop) => stop())
  }, [id, user.uid])
  // Join requests are GM-only in Firestore. A PC subscription is denied and
  // cannot recover after approval; never attach that listener for PCs.
  useEffect(() => {
    if (!isGm) { setRequests([]); return }
    return watchJoinRequests(id, setRequests, (e) => setError(errorMessage(e)))
  }, [id, isGm])

  useEffect(() => {
    if (!data || !heroesReady) return
    const saved = heroes.find((h) => h.ownerUid === user.uid)?.sheet ?? emptyCharacter()
    const normalized = normalizeCharacter({ ...saved, ownerUid: user.uid }, data)
    setSheetDraft((prev) => acceptSnapshot(prev, normalized))
  }, [heroes, heroesReady, data, user.uid])

  const actMax = campaign ? FORMATS[campaign.format]?.[campaign.act - 1] ?? 0 : 0
  const myHero = heroes.find((h) => h.ownerUid === user.uid)
  const sheet = sheetDraft?.value
  const progress = progressDraft?.value ?? { bonusXp: 0, patronFactionId: '' }
  const updateProgress = (patch) => setProgressDraft((prev) => editDraft(prev, patch))
  const myUpdate = (patch) => setSheetDraft((prev) => editDraft(prev, (current) => {
    const change = typeof patch === 'function' ? patch(current) : patch
    return normalizeCharacter({ ...current, ...change, ownerUid: user.uid }, data)
  }))
  const view = useMemo(() => sheet && data ? derive(sheet, data) : null, [sheet, data])
  const creationErrors = useMemo(() => sheet && data && campaign ? validateCampaignSheet(
    sheet, data, campaign.xpTotal, inventory, heroes.filter((h) => h.ownerUid !== user.uid), approved,
  ) : [], [sheet, data, campaign, inventory, heroes, approved, user.uid])
  const isValid = !!(view && view.checks.every((c) => c.ok) &&
    !creationErrors.length && view.points.spent <= (campaign?.xpTotal ?? 0))
  const run = async (fn) => {
    setWorking(true); setError('')
    try { await fn() } catch (e) { setError(errorMessage(e)) }
    finally { setWorking(false) }
  }
  if (!campaign || !data || !sheet || !progressDraft) return <div className="builder-wrap">
    <p role="status">{error || (campaignReady && !campaign ? 'Campaign no longer exists or you no longer have access.' : 'Loading live campaign data…')}</p>
    <a href="#/campaign">Back to campaigns</a>
  </div>

  return <div className="builder-wrap campaign-page">
    <p className="small"><a href="#/campaign">Campaigns</a> / {campaign.name}</p>
    <div className="campaign-heading"><div><h1>{campaign.name}</h1><p className="muted">{isGm ? 'Game Master' : 'Player'} · {campaign.format} · Act {campaign.act}: {actName[campaign.act - 1]} · Turn {Math.min(campaign.turn, actMax)}/{actMax}{campaign.status === 'completed' ? ' · Completed' : ''}</p></div>
      <span className="gold-chip" title="Shared Company treasury"><strong>{campaign.goldBalance ?? 0}</strong> Gold</span>
      {isGm && <button onClick={() => copyId(id)}>Copy invite ID</button>}
    </div>
    <Toast message={error} kind="bad" />
    {connection.fromCache && <p className="bad small" role="status">Showing locally cached campaign data. Updates from other players may be delayed until Firestore reconnects.</p>}
    {!connection.fromCache && connection.hasPendingWrites && <p className="muted small" role="status">Synchronizing campaign changes…</p>}
    <nav className="subtabs">
      {['overview', ...(!isGm ? ['character'] : []), 'company', 'army', ...(isGm ? ['gm'] : [])].map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t === 'gm' ? 'GM Controls' : t === 'character' ? 'My Character' : t === 'army' ? (isGm ? 'Company Arsenal' : 'My Army') : t === 'company' ? 'Company & Projects' : 'Overview'}</button>)}
    </nav>
    {tab === 'overview' && <div className="panel-grid">
      <section className="panel"><h2>Campaign progress</h2><p>Shared earned XP: <strong>{campaign.xpTotal}</strong></p><p>Active players: {campaign.memberUids.length - 1}</p><p className="muted small">Each completed turn grants 5 XP; additional exploration, Act and pivotal objective awards follow the campaign rules.</p></section>
      <section className="panel"><h2>Party roster</h2><ul className="plain-list">{heroes.map((h) => <li key={h.id}><strong>{h.sheet.name}</strong> · {h.sheet.classId} <span className="muted small">({h.id === user.uid ? 'You' : h.id.slice(0, 7)})</span></li>)}</ul>{!heroes.length && <p className="muted">Players can create their campaign characters in My Character.</p>}</section>
      <section className="panel"><h2>Company resources</h2><p>{inventory.filter((x) => x.kind === 'unit').length} owned formations · {inventory.filter((x) => x.kind === 'equipment').length} equipment items</p><p className="muted small"><strong>{campaign.goldBalance ?? 0} Company Gold</strong> · Gold purchases, crafting proposals and recruitment are managed under Company & Projects. Political Stakes and the strategic map remain future milestones.</p></section>
    </div>}
    {tab === 'character' && <div>
      <div className="panel campaign-character-actions"><div><h2>{sheet.name}</h2><div className="muted small">{view.points.total} points · {view.points.spent}/{campaign.xpTotal} XP spent · {campaign.xpTotal - view.points.spent} XP unspent</div><p className="small">{myHero ? 'Saved campaign draft' : 'New campaign character'} · {approved ? 'An approved snapshot exists' : 'Not yet approved by GM'}</p></div>
        <div className="saved-actions"><button className="primary" disabled={working || !isValid || sheetDraft?.conflict} onClick={() => run(() => saveHeroDraft(id, user.uid, sheet))}>Save draft</button>
          {myHero && <button className="danger" disabled={working} onClick={() => {
            if (!window.confirm('Delete your campaign character draft and release your reserved formations? A GM-approved snapshot stays until the GM revokes it. This cannot be undone.')) return
            run(() => deleteMyHero(id, user.uid))
          }}>Delete character</button>}</div>
      </div>
      {sheetDraft?.conflict && <section className="panel"><h3>Updated from another session</h3><p className="bad small">A newer character sheet was saved elsewhere. Your local edits were preserved; load the saved sheet to resolve the conflict.</p><button onClick={() => setSheetDraft(discardDraft)}>Load saved character</button></section>}
      {sheetDraft?.dirty && !sheetDraft?.conflict && <p className="muted small">Unsaved character changes</p>}
      {!isValid && <section className="panel"><h3>Before saving</h3><ul className="checks">{[...creationErrors, ...(view.checks.filter((c) => !c.ok).map((c) => c.label + ': ' + c.detail)), ...(view.points.spent > campaign.xpTotal ? ['Talent XP exceeds campaign earned XP'] : [])].map((m, i) => <li key={i} className="bad">{m}</li>)}</ul></section>}
      <CharacterEditor data={data} sheet={sheet} view={view} update={myUpdate} inventory={inventory} approved={approved} otherHeroes={heroes.filter((h) => h.ownerUid !== user.uid)} ownerUid={user.uid} xpBudget={campaign.xpTotal} />
      {approved && <section className="panel"><h2>Last GM-approved character</h2><CharacterDatasheet character={approved.sheet} view={derive(normalizeCharacter(approved.sheet, data), data)} /></section>}
    </div>}
    {tab === 'company' && <CompanyEconomy campaign={campaign} user={user} isGm={isGm} heroes={heroes} detachments={detachments} />}
    {tab === 'army' && <CampaignArmy campaign={campaign} user={user} isGm={isGm} heroes={heroes} inventory={inventory} detachments={detachments} approvedHeroes={approvedHeroes} />}
    {tab === 'gm' && isGm && <div className="panel-grid">
      <section className="panel"><h2>Progression</h2><p className="muted small">XP follows the campaign position: 5 XP per completed Turn and 5 XP on beginning Acts II, III and IV. Add exploration and Pivotal Objective XP below. Progress only moves forward.</p>
        <p>Earned XP: <strong>{campaign.xpTotal}</strong> <span className="muted small">({baseXp(campaign.format, campaign.act, campaign.turn)} from progression + {bonusXp(campaign)} bonus)</span></p>
        <button className="primary" disabled={working || progressDraft?.conflict || campaign.status === 'completed' || (campaign.act === 1 && campaign.turn >= actMax && !progress.patronFactionId)} onClick={() => run(() => updateCampaignProgress(campaign, { ...advanceTurn(campaign), patronFactionId: progress.patronFactionId }))}>
          {campaign.status === 'completed' ? 'Campaign complete' : campaign.act === 4 && campaign.turn >= actMax ? 'Complete final Turn (+5 XP)' : campaign.turn >= actMax ? `Complete Turn (+5 XP) and begin Act ${campaign.act + 1} (+5 XP)` : 'Complete Turn (+5 XP)'}
        </button>
        {progressDraft?.conflict && <div role="status" className="bad small">Campaign settings changed elsewhere while you were editing. Your inputs were preserved. <button onClick={() => setProgressDraft(discardDraft)}>Load current settings</button></div>}
        <form className="campaign-form" onSubmit={(e) => { e.preventDefault(); run(() => updateCampaignProgress(campaign, { bonusXp: progress.bonusXp, patronFactionId: progress.patronFactionId })) }}>
          <label className="field">Bonus XP (exploration Sites and Pivotal Objectives, 5 each)<input type="number" min={0} step={5} value={progress.bonusXp} onChange={(e) => updateProgress({ bonusXp: Number(e.target.value) })} /></label>
          <label className="field">Company sponsoring faction (Act II onward)<select value={progress.patronFactionId} onChange={(e) => updateProgress({ patronFactionId: e.target.value })}><option value="">Select when Company is founded…</option>{['free-realms','sacred-orders','iron-holds','wild-courts','warclans','underclans','death-legions','blood-courts','spirit-hosts','infernal-hosts','arcane-orders','titan-clans'].map((id) => <option key={id} value={id}>{id.replace(/-/g, ' ')}</option>)}</select></label>
          <button className="primary" disabled={working || progressDraft?.conflict || (campaign.act >= 2 && !progress.patronFactionId)}>Save progress</button>
        </form>
      </section>
      <section className="panel"><h2>Join requests</h2>{!requests.length && <p className="muted">No pending requests.</p>}
        <ul className="saved-list panel-scroll">{requests.map((r) => <li key={r.id}><strong>{r.displayName}</strong><div className="saved-actions"><button className="primary" disabled={working} onClick={() => run(() => approveJoin(campaign, r.uid))}>Accept</button><button disabled={working} onClick={() => run(() => rejectJoin(id, r.uid))}>Reject</button></div></li>)}</ul>
      </section>
      <section className="panel span-2"><h2>Character reviews</h2><p className="muted small">Approve a saved snapshot for deployment; further player edits do not change the approved sheet.</p><ul className="saved-list panel-scroll tall">{heroes.map((h) => {
        const v = derive(normalizeCharacter({ ...h.sheet, xpEarned: campaign.xpTotal }, data), data)
        const issues = validateCampaignSheet({ ...h.sheet, ownerUid: h.ownerUid }, data, campaign.xpTotal, inventory, heroes.filter((other) => other.ownerUid !== h.ownerUid), approvedHeroes.find((a) => a.ownerUid === h.ownerUid))
        const eligible = v.checks.every((c) => c.ok) && !issues.length && v.points.spent <= campaign.xpTotal
        return <li key={h.id}><div><strong>{h.sheet.name}</strong><div className="muted small">{v.points.total} pts · {v.points.spent}/{campaign.xpTotal} XP spent · {eligible ? 'Valid' : 'Needs corrections'}</div></div>        <button className="primary" disabled={working || !eligible} onClick={() => run(() => approveHero(id, h.ownerUid, h.sheet))}>Approve snapshot</button>{approvedHeroes.some((a) => a.ownerUid === h.ownerUid) && <button disabled={working} onClick={() => window.confirm('Revoke this approved snapshot? The player will be unable to deploy this Hero until re-approved.') && run(() => revokeApproval(id, h.ownerUid))}>Revoke approval</button>}</li>
      })}</ul></section>
              <section className="panel"><h2>Players</h2><p className="muted small">Removing a player deletes their character, approval, detachment and slot entitlements, and releases any formations or equipment they reserved.</p>
                <ul className="saved-list panel-scroll">{campaign.memberUids.filter((uid) => uid !== campaign.gmUid).map((uid) => <li key={uid}>
                  <span>{heroes.find((h) => h.ownerUid === uid)?.sheet?.name ?? 'No character yet'} <span className="muted small">({uid.slice(0, 7)})</span></span>
                  <button className="danger" disabled={working} onClick={() => window.confirm('Remove this player and their character from the campaign?') && run(() => removePlayer(campaign, uid))}>Remove player</button>
                </li>)}</ul>
                {campaign.memberUids.length <= 1 && <p className="muted">No players have joined.</p>}
              </section>
              <section className="panel"><h2>Danger zone</h2>
                <button className="danger" disabled={working} onClick={() => {
                  if (window.prompt(`Type the campaign name to permanently delete "${campaign.name}" and everything in it.`) !== campaign.name) return
                  run(async () => { await deleteCampaign(id); window.location.hash = '#/campaign' })
                }}>Delete campaign</button>
              </section>
    </div>}
  </div>
}

function CharacterEditor({ data, sheet, view, update, inventory, approved, otherHeroes, ownerUid, xpBudget }) {
  const [page, setPage] = useState('stats')
  return <>
    <nav className="subtabs nested">{['stats','talents','equipment','magic','sheet'].map((t) => <button key={t} className={page===t?'active':''} onClick={() => setPage(t)}>{t[0].toUpperCase()+t.slice(1)}</button>)}</nav>
    {page === 'stats' && <CharacterStats campaignMode lockedIdentity={!!approved} data={data} character={sheet} view={view} update={(patch) => {
      const prospective = typeof patch === 'function' ? patch(sheet) : patch
      if (!approved && (prospective.classId && prospective.classId !== sheet.classId || prospective.subclassId && prospective.subclassId !== sheet.subclassId)) {
        update({ ...prospective, gear: [], spells: [], otherPoints: 0 })
      } else update(patch)
    }} />}
    {page === 'talents' && <TalentPyramid data={data} character={sheet} view={view} update={update} xpBudget={xpBudget} />}
    {page === 'equipment' && <GearTab data={data} character={sheet} view={view} update={update}
      hash="#/character/gear" campaignPolicy={{ inventory, approved, otherHeroes, ownerUid }} />}
    {page === 'magic' && <section className="panel">
      <h2>Starting magic and formulas</h2>
      <p className="muted small">Only the included starting choices are available. Additional spells, magical equipment, and permanent crafting must be acquired during the campaign.</p>
      {view.sub.subclassSpellAttacks?.chooseCount && <div><h3>Subclass Spell Attack — choose one</h3>
        {view.sub.subclassSpellAttacks.spells.map((spell) => <label className="choice" key={spell.name}><input type="radio" name="campaign-starting-spell" checked={sheet.subclassSpell === spell.name} onChange={() => update({ subclassSpell: spell.name })} />{spell.name}</label>)}
      </div>}
      {view.cls.id === 'artificer' && <div><h3>Choose two starting formulas</h3>
        {(view.sub.formulas ?? []).map((formula) => <label className="choice" key={formula.name}><input type="checkbox" checked={sheet.formulas.includes(formula.name)} disabled={!sheet.formulas.includes(formula.name) && sheet.formulas.length >= 2} onChange={() => update((char) => ({
          formulas: char.formulas.includes(formula.name) ? char.formulas.filter((f) => f !== formula.name) : [...char.formulas, formula.name],
          fieldSpecialty: char.fieldSpecialty === formula.name ? null : char.fieldSpecialty,
        }))} />{formula.name}</label>)}
        <label className="field">Field Specialty<select value={sheet.fieldSpecialty ?? ''} onChange={(e) => update({ fieldSpecialty: e.target.value || null })}><option value="">Choose…</option>{sheet.formulas.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
      </div>}
      {!view.sub.subclassSpellAttacks?.chooseCount && view.cls.id !== 'artificer' && <p>Any included base Spell Attacks are automatically available to this character.</p>}
    </section>}
    {page === 'sheet' && <CharacterDatasheet character={sheet} view={view} />}
  </>
}
