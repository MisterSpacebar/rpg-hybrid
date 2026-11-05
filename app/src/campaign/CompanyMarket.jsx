import { useEffect, useMemo, useState } from 'react'
import { loadCatalog } from '../builder/catalog.js'
import { loadCharacterData } from '../character/data.js'
import { derive, normalizeCharacter } from '../character/engine.js'
import { newUnitConfig, resolveUnit } from '../builder/engine.js'
import { equipmentCatalog } from './economy.js'
import { craftRoll, priceForFormation } from './market.js'
import {
  publishMarketOffer, purchaseOffer, setMarketOfferEnabled,
  watchMarketOffers, watchMarketPurchases,
} from './marketCloud.js'

// Firestore validates the market's price and assets atomically; this UI handles
// only the player experience and choosing a GM-published offer.
export default function CompanyMarket({ campaign, user, isGm, heroes }) {
  const [offers, setOffers] = useState([])
  const [purchases, setPurchases] = useState([])
  const [catalog, setCatalog] = useState(null)
  const [characterData, setCharacterData] = useState(null)
  const [form, setForm] = useState({ kind: 'equipment', item: '', unit: '', price: '', difficulty: 2, check: 'Mind + Craft' })
  const [craftChar, setCraftChar] = useState('mind')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true
    loadCatalog().then((d) => active && setCatalog(d)).catch((e) => active && setMessage(e.message))
    loadCharacterData().then((d) => active && setCharacterData(d)).catch((e) => active && setMessage(e.message))
    return () => { active = false }
  }, [])
  useEffect(() => {
    const fail = (e) => setMessage(e.message)
    const a = watchMarketOffers(campaign.id, setOffers, fail)
    const b = watchMarketPurchases(campaign.id, setPurchases, fail)
    return () => { a(); b() }
  }, [campaign.id])
  const gear = useMemo(() => characterData ? equipmentCatalog(characterData) : [], [characterData])
  const patron = catalog?.factions.find((f) => f.id === campaign.patronFactionId)
  const units = campaign.act < 2 || !patron ? [] : [...catalog.generic, ...patron.units]
  const selectedUnit = units.find((e) => e.key === form.unit)
  const defaultUnit = selectedUnit && catalog ? newUnitConfig(selectedUnit, selectedUnit.slots[0]) : null
  const resolved = selectedUnit && defaultUnit ? resolveUnit(selectedUnit, defaultUnit, selectedUnit.source === 'faction' ? patron.id : null) : null
  const selected = gear.find((g) => `${g.kind}:${g.name}` === form.item)
  const pc = heroes.find((h) => h.ownerUid === user.uid)?.sheet
  const pcView = pc && characterData ? derive(normalizeCharacter(pc, characterData), characterData) : null
  const run = async (fn, success) => {
    setBusy(true); setMessage('')
    try { await fn(); setMessage(success) } catch (e) { setMessage(e.message || 'Action failed') }
    finally { setBusy(false) }
  }
  const publish = async () => {
    let offer
    const price = form.kind === 'unit' && resolved ? priceForFormation(resolved.points) : Number(form.price)
    if (form.kind === 'unit') {
      if (!resolved || resolved.pointsVary || (resolved.missingTags ?? []).length) throw new Error('Select a fully resolved formation')
      offer = { kind: 'unit', label: resolved.name, price, config: defaultUnit,
        points: resolved.points, factionId: selectedUnit.source === 'faction' ? patron.id : null }
    } else {
      if (!selected) throw new Error('Choose equipment')
      offer = { kind: form.kind, label: selected.name, price,
        item: { kind: selected.kind, name: selected.name } }
      if (form.kind === 'craft') {
        offer.difficulty = Number(form.difficulty)
        offer.check = form.check
      }
    }
    await publishMarketOffer(campaign.id, user.uid, offer)
    setForm((f) => ({ ...f, item: '', unit: '', price: '' }))
  }
  const buy = async (offer) => {
    let result = null
    if (offer.kind === 'craft') {
      if (!pcView) throw new Error('Save a campaign character before crafting')
      const [char, skill] = offer.check.toLowerCase().split(' + ')
      const pool = pcView.characteristics[char]
      const threshold = pcView.skills[skill]
      if (!Number.isInteger(pool) || !Number.isInteger(threshold)) throw new Error('Crafting check is not valid for your character')
      // Web Crypto provides dice without Math.random bias; the record is visible
      // to every campaign member. Truly tamper-proof dice require a trusted server.
      const dice = []
      const buffer = new Uint32Array(1)
      while (dice.length < pool) {
        crypto.getRandomValues(buffer)
        const n = buffer[0]
        if (n < 4294967292) dice.push((n % 6) + 1)
      }
      const roll = craftRoll(dice, threshold, offer.difficulty)
      result = { dice, threshold, successes: roll.successes, surges: roll.surges, blunders: roll.blunders }
    }
    await purchaseOffer(campaign.id, user.uid, offer.id, result)
    return result
  }

  return <div className="panel-grid">
    <section className="panel span-all">
      <h2>Company Marketplace</h2>
      <p><strong>{campaign.goldBalance ?? 0} Gold</strong> in the shared treasury</p>
      <p className="muted small">Ordinary purchases are immediate: no individual GM approval. The GM publishes available prices once. Every purchase charges Company Gold and updates inventory in the same transaction.</p>
      {message && <p role="status">{message}</p>}
    </section>

    {!isGm && <section className="panel span-all">
      <h2>Available equipment, crafting, and formations</h2>
      {!offers.some((o) => o.enabled) && <p className="muted">The GM has not published any market offers yet.</p>}
      <ul className="saved-list">{offers.filter((o) => o.enabled && (o.kind !== 'unit' ||
        (campaign.act >= 2 && !!campaign.patronFactionId && (!o.factionId || o.factionId === campaign.patronFactionId)))).map((offer) =>
        <li key={offer.id}>
          <div><strong>{offer.label}</strong><div className="muted small">{offer.kind === 'craft'
            ? `Crafting · ${offer.check} · Difficulty ${offer.difficulty}`
            : offer.kind === 'unit' ? `Recruitment · ${offer.points} Points` : 'Equipment'}
            {' · '}{offer.price} Gold</div></div>
          <button className="primary" disabled={busy || (campaign.goldBalance ?? 0) < offer.price ||
            (offer.kind === 'craft' && !pcView)} onClick={() => run(async () => {
              const roll = await buy(offer)
              setMessage(roll ? `Crafted with dice ${roll.dice.join(', ')}; outcome recorded in Company history` : 'Purchased. Inventory updated.')
            }, 'Purchased. Inventory updated.')}> {offer.kind === 'craft' ? 'Craft' : 'Buy'}</button>
        </li>)}</ul>
      <p className="muted small">Crafting checks are client-generated and recorded. Crafted Qualities and Flaws do not yet modify equipment profiles. Recruit and Develop opportunity limits remain GM-administered until Company Orders are automated.</p>
    </section>}

    {isGm && <section className="panel">
      <h2>Publish regular market offers</h2>
      <p className="muted small">Publishing an item establishes an ongoing price and availability; players can purchase it without further approval.</p>
      <div className="campaign-form">
        <label className="field">Type<select value={form.kind} onChange={(e) => setForm({ ...f, kind: e.target.value, item: '', unit: '', price: '' })}>
          <option value="equipment">Equipment purchase</option>
          <option value="craft">Crafting project</option>
          <option value="unit">Formation recruitment</option>
        </select></label>
        {form.kind === 'unit' ? <label className="field">Formation<select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
          <option value="">Choose a formation…</option>
          {units.map((u) => <option key={u.key} value={u.key}>{u.name}</option>)}
        </select></label> : <label className="field">Equipment<select value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })}>
          <option value="">Choose equipment…</option>
          {gear.map((g) => <option key={g.kind + g.name} value={`${g.kind}:${g.name}`}>{g.name} ({g.kind})</option>)}
        </select></label>}
        {form.kind === 'unit' ? <p className="muted small">Default formation · {resolved?.points ?? '—'} Points · {resolved && !resolved.pointsVary ? priceForFormation(resolved.points) : '—'} Gold</p>
        : <label className="field">Published Gold price<input type="number" min={1} max={1000} step={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>}
        {form.kind === 'craft' && <>
          <label className="field">Difficulty<select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })}>
            {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} successes</option>)}
          </select></label>
          <label className="field">Crafting approach<select value={form.check} onChange={(e) => setForm({ ...form, check: e.target.value })}>
            {['Body + Craft','Agility + Craft','Mind + Craft','Mind + Mysticism','Spirit + Mysticism'].map((x) => <option key={x} value={x}>{x}</option>)}
          </select></label>
        </>}
        <button className="primary" disabled={busy || !(form.kind === 'unit' ? resolved && !resolved.pointsVary && !(resolved.missingTags ?? []).length : selected && Number.isInteger(Number(form.price)) && Number(form.price) >= 1)} onClick={() => run(publish, 'Offer published')}>Publish offer</button>
      </div>
    </section>}
    {isGm && <section className="panel">
      <h2>Published offers</h2>
      <ul className="saved-list">{offers.map((o) => <li key={o.id}>
        <div><strong>{o.label}</strong><div className="muted small">{o.kind} · {o.price} Gold · {o.enabled ? 'Available' : 'Disabled'}</div></div>
        <button disabled={busy} onClick={() => run(() => setMarketOfferEnabled(campaign.id, o.id, !o.enabled),
          o.enabled ? 'Offer disabled' : 'Offer enabled')}>{o.enabled ? 'Disable' : 'Enable'}</button>
      </li>)}</ul>
    </section>}
    <section className="panel span-all">
      <h2>Recent self-service purchases</h2>
      {!purchases.length && <p className="muted">No self-service purchases recorded.</p>}
      <ul className="saved-list">{purchases.slice(-20).reverse().map((p) => <li key={p.id}>
        <div><strong>{offers.find((o) => o.id === p.offerId)?.label ?? p.kind}</strong><div className="muted small">{heroes.find((h) => h.ownerUid === p.ownerUid)?.sheet?.name ?? p.ownerUid.slice(0, 8)} · {p.price} Gold</div></div>
        {p.crafting && <span className="muted small">{p.crafting.success ? 'Craft succeeded' : 'Craft failed'} · {p.crafting.qualities} Qualities</span>}
      </li>)}</ul>
    </section>
  </div>
}
