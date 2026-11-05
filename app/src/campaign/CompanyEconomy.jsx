import { useEffect, useMemo, useState } from 'react'
import { loadCatalog } from '../builder/catalog.js'
import { newUnitConfig, resolveUnit } from '../builder/engine.js'
import { loadCharacterData } from '../character/data.js'
import {
  CRAFT_CHECKS, DIFFICULTIES, FLEX_SLOTS, INCOME_SOURCES,
  equipmentCatalog, goldForRecruitment, resolveCraft,
} from './economy.js'
import {
  awardGold, rejectAcquisition, resolveAcquisition, submitAcquisition,
  watchAcquisitionRequests, watchGoldLedger,
} from './economyCloud.js'

const nameOf = (heroes, uid) => heroes.find((x) => x.ownerUid === uid)?.sheet?.name ?? uid.slice(0, 8)
const dateOf = (stamp) => stamp?.toDate?.().toLocaleString() ?? ''
const DEFAULT = { kind: 'equipment', equipment: '', formation: '', slot: 'C', check: 'Mind + Craft', materials: '', note: '' }
const validInt = (n) => Number.isInteger(Number(n)) && Number(n) >= 0

export default function CompanyEconomy({ campaign, user, isGm, heroes }) {
  const [requests, setRequests] = useState([])
  const [ledger, setLedger] = useState([])
  const [data, setData] = useState(null)
  const [catalog, setCatalog] = useState(null)
  const [form, setForm] = useState(DEFAULT)
  const [ledgerForm, setLedgerForm] = useState({ amount: '', source: 'Commerce', note: '' })
  const [decisions, setDecisions] = useState({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    loadCharacterData().then((result) => active && setData(result)).catch((e) => active && setMessage(e.message))
    loadCatalog().then((result) => active && setCatalog(result)).catch((e) => active && setMessage(e.message))
    return () => { active = false }
  }, [])
  useEffect(() => {
    const error = (e) => setMessage(e.message)
    const unsubRequests = watchAcquisitionRequests(campaign.id, setRequests, error)
    const unsubLedger = watchGoldLedger(campaign.id, setLedger, error)
    return () => { unsubRequests(); unsubLedger() }
  }, [campaign.id])

  const gear = useMemo(() => data ? equipmentCatalog(data) : [], [data])
  const allowedUnits = useMemo(() => {
    if (!catalog || campaign.act < 2) return []
    const faction = catalog.factions.find((f) => f.id === campaign.patronFactionId)
    if (!faction) return []
    return [...catalog.generic, ...faction.units]
  }, [catalog, campaign.act, campaign.patronFactionId])
  const estimate = (req) => {
    if (req.kind !== 'recruit' || !catalog) return null
    const entry = catalog.unitsByKey[req.config?.key]
    if (!entry) return null
    try { return resolveUnit(entry, req.config, req.factionId ?? null) }
    catch { return null }
  }
  const perform = async (fn, success) => {
    setBusy(true); setMessage('')
    try { await fn(); setMessage(success) }
    catch (e) { setMessage(e.message ?? 'Request failed') }
    finally { setBusy(false) }
  }

  const submit = () => {
    const request = { kind: form.kind, note: form.note }
    if (['equipment', 'craft'].includes(form.kind)) {
      const item = gear.find((g) => `${g.kind}:${g.name}` === form.equipment)
      if (!item) { setMessage('Select an equipment item'); return }
      request.item = { kind: item.kind, name: item.name }
      if (form.kind === 'craft') { request.materials = form.materials; request.check = form.check }
    }
    if (form.kind === 'recruit') {
      const entry = allowedUnits.find((u) => u.key === form.formation)
      if (!entry) { setMessage('Select an eligible formation'); return }
      request.config = newUnitConfig(entry, entry.slots[0])
      request.factionId = entry.source === 'faction' ? campaign.patronFactionId : null
    }
    if (form.kind === 'flex') request.slot = form.slot
    perform(async () => { await submitAcquisition(campaign.id, user.uid, request); setForm(DEFAULT) },
      'Proposal submitted for GM review')
  }
  const editDecision = (id, patch) => setDecisions((prev) => ({ ...prev,
    [id]: { ...(prev[id] ?? {}), ...patch },
  }))
  const requestLabel = (r) => r.kind === 'recruit'
    ? (catalog?.unitsByKey[r.config?.key]?.name ?? r.config?.key ?? 'Formation')
    : r.kind === 'flex' ? `Flex slot ${r.slot}`
      : r.item?.name ?? 'Equipment'
  const pending = requests.filter((r) => r.status === 'pending')
  const resolved = requests.filter((r) => r.status !== 'pending')

  if (!data || !catalog) return <section className="panel"><h2>Company economy</h2><p>{message || 'Loading equipment and formation catalogs…'}</p></section>
  return <div className="panel-grid">
    <section className="panel span-all">
      <h2>Company Treasury</h2>
      <p><strong>{campaign.goldBalance ?? 0} Gold</strong> available · Shared by the whole Company</p>
      <p className="muted small">Gold buys recruitment, equipment and projects. Battlefield Points remain a separate value. Only GM-approved transactions affect the treasury.</p>
      {message && <p role="status" className={/submitted|recorded|approved|rejected/i.test(message) ? 'ok' : 'bad'}>{message}</p>}
    </section>

    {!isGm && <section className="panel">
      <h2>Propose an acquisition</h2>
      <p className="muted small">The GM checks opportunity, access, materials and Gold before approving. A proposal does not spend Gold or create inventory.</p>
      <div className="campaign-form">
        <label className="field">Project
          <select value={form.kind} onChange={(e) => setForm({ ...DEFAULT, kind: e.target.value })}>
            <option value="equipment">Acquire equipment</option>
            <option value="craft">Craft equipment (Develop)</option>
            {campaign.act >= 2 && <option value="recruit">Recruit formation</option>}
            {campaign.act >= 2 && <option value="flex">Purchase Flex slot (Develop)</option>}
          </select>
        </label>
        {['equipment', 'craft'].includes(form.kind) && <label className="field">Equipment
          <select value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })}>
            <option value="">Choose an item…</option>
            {gear.map((g) => <option key={g.kind + ':' + g.name} value={g.kind + ':' + g.name}>
              {g.name} ({g.kind}, {g.points} battlefield pts)</option>)}
          </select>
        </label>}
        {form.kind === 'craft' && <>
          <label className="field">Crafting approach
            <select value={form.check} onChange={(e) => setForm({ ...form, check: e.target.value })}>
              {CRAFT_CHECKS.map((check) => <option key={check} value={check}>{check}</option>)}
            </select>
          </label>
          <label className="field">Materials, tools or recipe
            <textarea rows={2} maxLength={300} value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} placeholder="Explain available materials and facilities…" />
          </label>
        </>}
        {form.kind === 'recruit' && <label className="field">Formation
          <select value={form.formation} onChange={(e) => setForm({ ...form, formation: e.target.value })}>
            <option value="">Choose a formation…</option>
            {allowedUnits.map((unit) => <option key={unit.key} value={unit.key}>{unit.name} ({unit.basePoints} base pts)</option>)}
          </select>
          <span className="muted small">Initial proposal uses its default profile. The GM must confirm recruitment rights; purchased unit customization follows later.</span>
        </label>}
        {form.kind === 'flex' && <label className="field">Fixed recruitment slot · 2 Gold
          <select value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>
            {FLEX_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
          </select>
        </label>}
        <label className="field">Reason or agreement notes
          <textarea rows={2} maxLength={500} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </label>
        <button className="primary" disabled={busy || (['equipment', 'craft'].includes(form.kind) && !form.equipment) || (form.kind === 'recruit' && !form.formation)} onClick={submit}>Submit to GM</button>
      </div>
    </section>}

    {isGm && <section className="panel">
      <h2>GM — Treasury adjustment</h2>
      <p className="muted small">Record Commerce income, Province dividends, mission rewards or justified manual spending. Every change is logged.</p>
      <div className="campaign-form">
        <label className="field">Gold change (+ income, − expense)
          <input type="number" step={1} value={ledgerForm.amount} onChange={(e) => setLedgerForm({ ...ledgerForm, amount: e.target.value })} />
        </label>
        <label className="field">Source
          <select value={ledgerForm.source} onChange={(e) => setLedgerForm({ ...ledgerForm, source: e.target.value })}>
            {INCOME_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="field">Details
          <input maxLength={120} value={ledgerForm.note} onChange={(e) => setLedgerForm({ ...ledgerForm, note: e.target.value })} placeholder="e.g. Four PCs completed Commerce"/>
        </label>
        <button className="primary" disabled={busy || !ledgerForm.amount || !Number.isInteger(Number(ledgerForm.amount))} onClick={() => perform(async () => {
          await awardGold(campaign.id, user.uid, Number(ledgerForm.amount),
            `${ledgerForm.source}: ${ledgerForm.note || 'Recorded by GM'}`)
          setLedgerForm({ ...ledgerForm, amount: '', note: '' })
        }, 'Gold transaction recorded')}>Record transaction</button>
      </div>
    </section>}

    <section className="panel span-all">
      <h2>{isGm ? 'GM — Pending acquisition requests' : 'My acquisition requests'} ({isGm ? pending.length : requests.filter((r) => r.ownerUid === user.uid && r.status === 'pending').length} pending)</h2>
      {!(isGm ? pending : requests.filter((r) => r.ownerUid === user.uid)).length && <p className="muted">No proposals yet.</p>}
      <div className="campaign-request-list">
        {(isGm ? pending : requests.filter((r) => r.ownerUid === user.uid)).map((request) => {
          const unit = estimate(request)
          const defaultCost = request.kind === 'recruit' && unit && Number.isFinite(unit.points)
            ? goldForRecruitment(unit.points) : request.kind === 'flex' ? 2 : 0
          const decision = decisions[request.id] ?? {}
          const cost = decision.cost ?? String(defaultCost)
          const discount = decision.discount ?? '0'
          const craft = {
            difficulty: Number(decision.difficulty ?? 2),
            successes: Number(decision.successes ?? 0),
            surges: Number(decision.surges ?? 0),
            blunders: Number(decision.blunders ?? 0),
          }
          let craftResult
          try { craftResult = resolveCraft(craft) } catch { craftResult = null }
          const canApprove = validInt(cost) && validInt(discount) && Number(discount) <= Number(cost)
            && (request.kind !== 'recruit' || (unit && !unit.pointsVary && !unit.missingTags && Number(cost) === defaultCost))
            && (request.kind !== 'flex' || Number(cost) === 2)
            && (request.kind !== 'craft' || !!craftResult)
          return <div className="panel" key={request.id}>
            <h3>{requestLabel(request)} <span className="muted small">({request.kind})</span></h3>
            <p className="muted small">Requested by {nameOf(heroes, request.ownerUid)} · {dateOf(request.createdAt)} · {request.status}</p>
            {request.note && <p>{request.note}</p>}
            {request.kind === 'craft' && <p className="muted small">{request.check} · Materials: {request.materials || 'Not specified'}</p>}
            {unit && <p className="muted small">Resolved formation: {unit.points} Points · {goldForRecruitment(unit.points)} Gold base cost</p>}
            {isGm && <div className="campaign-form">
              <label className="field">Base Gold cost
                <input type="number" min={0} max={1000} step={1} value={cost} disabled={request.kind === 'recruit' || request.kind === 'flex'} onChange={(e) => editDecision(request.id, { cost: e.target.value })} />
              </label>
              <label className="field">Gold discount
                <input type="number" min={0} max={1000} step={1} value={discount} onChange={(e) => editDecision(request.id, { discount: e.target.value })} />
              </label>
              {request.kind === 'craft' && <>
                <p className="muted small">GM resolves the Craft/Mysticism check. Successful results record Qualities and Flaws; bonuses require separate equipment profile support.</p>
                <label className="field">Crafting Difficulty
                  <select value={craft.difficulty} onChange={(e) => editDecision(request.id, { difficulty: Number(e.target.value) })}>
                    {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </label>
                {['successes', 'surges', 'blunders'].map((key) => <label className="field" key={key}>{key[0].toUpperCase() + key.slice(1)}
                  <input type="number" min={0} max={key === 'successes' ? 6 : 3} step={1} value={craft[key]} onChange={(e) => editDecision(request.id, { [key]: Number(e.target.value) })} />
                </label>)}
                {craftResult && <p className="muted small">{craftResult.success ? 'Craft succeeded' : 'Craft failed'} · {craftResult.qualities} Quality points · {craftResult.flaws} Flaws</p>}
              </>}
              <label className="field">Resolution notes
                <textarea rows={2} maxLength={500} value={decision.note ?? ''} onChange={(e) => editDecision(request.id, { note: e.target.value })} />
              </label>
              <div className="saved-actions">
                <button className="primary" disabled={busy || !canApprove || Number(cost) - Number(discount) > (campaign.goldBalance ?? 0)} onClick={() => perform(() => resolveAcquisition(
                  campaign.id, request.id, user.uid, {
                    goldCost: Number(cost), discount: Number(discount),
                    note: decision.note ?? '', formationPoints: unit?.points,
                    ...(request.kind === 'craft' ? { crafting: craft } : {}),
                  },
                ), 'Acquisition approved and treasury updated')}>Approve · {Number(cost) - Number(discount)} Gold</button>
                <button disabled={busy} onClick={() => perform(() =>
                  rejectAcquisition(campaign.id, request.id, user.uid, decision.note), 'Request rejected')}>Reject</button>
              </div>
            </div>}
            {request.status !== 'pending' && request.resolutionNote && <p className="muted small">GM: {request.resolutionNote}</p>}
          </div>
        })}
      </div>
    </section>

    <section className="panel">
      <h2>Recent treasury transactions</h2>
      {!ledger.length && <p className="muted small">No Gold transactions recorded yet.</p>}
      <ul className="saved-list">{ledger.slice(0, 30).map((entry) => <li key={entry.id}>
        <div><strong>{entry.delta > 0 ? '+' : ''}{entry.delta} Gold</strong><div className="muted small">{entry.reason} · {dateOf(entry.createdAt)}</div></div>
        <span className="muted small">{entry.balanceAfter} left</span>
      </li>)}</ul>
    </section>
    {isGm && <section className="panel">
      <h2>Previously resolved requests</h2>
      {!resolved.length && <p className="muted">No resolved requests.</p>}
      <ul className="saved-list">{resolved.slice(0, 20).map((r) => <li key={r.id}>
        <span>{requestLabel(r)} <span className="muted small">· {nameOf(heroes, r.ownerUid)} · {r.status}</span></span>
        <span className="muted small">{r.paid ?? 0} Gold</span>
      </li>)}</ul>
    </section>}
  </div>
}
