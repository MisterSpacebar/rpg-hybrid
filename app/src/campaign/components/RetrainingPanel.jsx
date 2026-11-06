import { useEffect, useMemo, useRef, useState } from 'react'
import { derive, attackMatches, CHARACTERISTICS, SKILLS } from '../../character/engine.js'
import { choiceSpecs, TIERS } from '../../character/talents.js'
import { checkRetraining, developOrderId, retrainingChoices, RETRAINING_GOLD } from '../logic/retraining.js'
import {
  finalizeRetraining, openDevelopOrder, resolveRetraining,
  submitRetraining, watchRetrainingRequests,
} from '../cloud/retrainingCloud.js'

const ALLOWED = {
  skill: (spec) => SKILLS.map((name) => ({ value: name, label: name })),
  characteristic: () => CHARACTERISTICS.map((name) => ({ value: name, label: name })),
}
const label = (e) => e?.name ?? e?.id ?? 'Talent'

function choiceOptions(spec, view) {
  if (spec.kind === 'attack') return [...new Set(view.attackOptions.filter((a) =>
    attackMatches(a, spec.filter)).map((a) => a.name))].map((value) => ({ value, label: value }))
  if (spec.kind === 'formula') return (view.sub.formulas ?? []).map((f) => ({ value: f.name, label: f.name }))
  if (spec.kind === 'favoredTag') return view.entries.filter((e) => e.def.id === 'favored-enemy' && e.entry.enemy)
    .map((e) => ({ value: e.entry.enemy, label: e.entry.enemy }))
  return ALLOWED[spec.kind]?.(spec) ?? spec.options ?? []
}

export default function RetrainingPanel({ campaign, user, isGm, heroes, data, target = null }) {
  const [requests, setRequests] = useState([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [tier, setTier] = useState(target?.tier ?? 1)
  const [index, setIndex] = useState(target?.index ?? 0)
  const [replacementId, setReplacementId] = useState('')
  const [choices, setChoices] = useState({})
  const panelRef = useRef(null)
  // Arriving from a committed Talent preselects it and brings the form into view.
  useEffect(() => {
    if (!target) return
    setTier(target.tier); setIndex(target.index); setReplacementId(''); setChoices({})
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [target])
  const mySheet = heroes.find((h) => h.ownerUid === user.uid)?.sheet
  const currentOrder = developOrderId(campaign)
  const open = campaign.activeDevelopOrder === currentOrder && campaign.status !== 'completed'
  const used = campaign.retrainOrderUsed === currentOrder
  useEffect(() => watchRetrainingRequests(campaign.id, setRequests, (error) =>
    setMessage(error.message)), [campaign.id])
  const entries = mySheet?.talents?.[tier] ?? []
  const options = useMemo(() => mySheet ? retrainingChoices(mySheet, data, tier, index) : [],
    [mySheet, data, tier, index])
  const selected = options.find((t) => t.id === replacementId)
  const newTalent = selected ? { id: selected.id, ...choices } : null
  const review = mySheet && newTalent ? checkRetraining(mySheet, data, tier, index, newTalent, (candidate) => derive(candidate, data)) : null
  const view = useMemo(() => mySheet ? derive(mySheet, data) : null, [mySheet, data])
  const current = mySheet && entries[index]
  const ownRequests = requests.filter((r) => r.ownerUid === user.uid)
  const existing = ownRequests.find((r) => r.orderId === currentOrder)
  const invoke = async (action, success) => {
    setBusy(true); setMessage('')
    try { await action(); setMessage(success) }
    catch (error) { setMessage(error.message ?? 'Retraining failed') }
    finally { setBusy(false) }
  }
  return <section className={`panel span-2${target ? ' retrain-target' : ''}`} ref={panelRef}>
    <h2>Talent Retraining · Develop</h2>
    <p className="muted small">A Develop Order permits one Talent replacement for the entire Company, for {RETRAINING_GOLD} Gold. The replacement must stay in the same Tier and keep the pyramid legal. It becomes effective after the current Turn and needs a new GM character approval for deployment.</p>
    <p className="small">Current Turn: Act {campaign.act}, Turn {campaign.turn} · {open ? used ? 'Retraining already used' : 'Develop available' : 'Develop not declared'}</p>
    {message && <p role="status" className="small">{message}</p>}
    {isGm && <div className="saved-actions">
      <button disabled={busy || used || open || campaign.status === 'completed'} onClick={() =>
        invoke(() => openDevelopOrder(campaign.id, user.uid), 'Develop Order recorded for the current Turn')}>
        Mark Develop for this Turn
      </button>
    </div>}
    {!isGm && <>
      {!mySheet && <p className="muted small">Save a campaign Hero before attempting Retraining.</p>}
      {!!mySheet && <>
        <div className="campaign-form">
          <label className="field">Tier
            <select value={tier} onChange={(ev) => { setTier(Number(ev.target.value)); setIndex(0); setReplacementId(''); setChoices({}) }}>
              {TIERS.map((t) => <option key={t} value={t}>Tier {t}</option>)}
            </select>
          </label>
          <label className="field">Existing Talent
            <select value={index} onChange={(ev) => { setIndex(Number(ev.target.value)); setReplacementId(''); setChoices({}) }}>
              {!entries.length && <option value={0}>No Talent in this Tier</option>}
              {entries.map((e, i) => <option key={i} value={i}>{i + 1}. {label(view?.pool.find((t) => t.id === e.id))}</option>)}
            </select>
          </label>
          <label className="field">Replacement Talent
            <select value={replacementId} onChange={(ev) => { setReplacementId(ev.target.value); setChoices({}) }}>
              <option value="">Choose a legal replacement…</option>
              {options.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
        </div>
        {selected && <div className="campaign-form">
          {choiceSpecs(selected).map((spec) => {
            const options = choiceOptions(spec, view)
            const value = choices[spec.key] ?? spec.default ?? ''
            return <label key={spec.key} className="field">{spec.label}
              {spec.kind === 'text' ? <input maxLength={120} value={value}
                onChange={(e) => setChoices((v) => ({ ...v, [spec.key]: e.target.value }))} /> :
                <select value={value} onChange={(e) => setChoices((v) => ({ ...v, [spec.key]: e.target.value }))}>
                  <option value="">Choose…</option>
                  {options.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>}
            </label>
          })}
        </div>}
        {review && !review.ok && <p className="bad small">{review.error}</p>}
        <button className="primary" disabled={busy || !open || used || !!existing || !current || !review?.ok ||
            (campaign.goldBalance ?? 0) < RETRAINING_GOLD}
          onClick={() => invoke(() => submitRetraining(campaign.id, user.uid, data, tier, index, newTalent),
            'Retraining submitted for GM to confirm this Develop opportunity')}>
          Request Retraining · {RETRAINING_GOLD} Gold if confirmed
        </button>
        {!!existing && <p className="muted small">Your request this Turn: {existing.status}. {existing.status === 'approved' ? 'Paid; will become effective after this Turn.' : ''}</p>}
      </>}
    </>}
    {isGm && <>
      {!requests.length && <p className="muted small">No Retraining requests have been submitted.</p>}
      <ul className="saved-list panel-scroll">
        {requests.filter((r) => r.status !== 'declined' && r.status !== 'applied').map((r) => <li key={r.id}>
          <div><strong>{heroes.find((h) => h.ownerUid === r.ownerUid)?.sheet?.name ?? r.ownerUid}</strong>
            <div className="muted small">{r.orderId} · Tier {r.tier} · {label(data.shared.find((x) => x.id === r.newTalent.id) ||
              data.talentsByClass[heroes.find((h) => h.ownerUid === r.ownerUid)?.sheet?.classId]?.find((x) => x.id === r.newTalent.id) ||
              r.newTalent)} · {r.status}</div>
          </div>
          <div className="saved-actions">
            {r.status === 'requested' && <>
              <button className="primary" disabled={busy || used || !open || r.orderId !== currentOrder ||
                  (campaign.goldBalance ?? 0) < RETRAINING_GOLD}
                onClick={() => invoke(() => resolveRetraining(campaign.id, r.id, user.uid, data, true),
                  'Retraining approved, 2 Gold spent; applies after this Turn')}>Confirm · 2 Gold</button>
              <button disabled={busy} onClick={() =>
                invoke(() => resolveRetraining(campaign.id, r.id, user.uid, data, false), 'Request declined')}>
                Decline
              </button>
            </>}
            {r.status === 'approved' && <button className="primary" disabled={busy || r.orderId === currentOrder}
              onClick={() => invoke(() => finalizeRetraining(campaign.id, r.id, user.uid, data),
                'Retraining applied; previous Hero approval was revoked for re-review')}>
              {r.orderId === currentOrder ? 'Applies next Turn' : 'Apply approved Retraining'}
            </button>}
          </div>
        </li>)}
      </ul>
    </>}
  </section>
}
