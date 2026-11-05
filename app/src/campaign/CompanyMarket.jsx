import { useEffect, useMemo, useState } from 'react'
import Toast from './Toast.jsx'
import { loadCatalog } from '../builder/catalog.js'
import { loadCharacterData } from '../character/data.js'
import { derive, normalizeCharacter } from '../character/engine.js'
import { newUnitConfig, resolveUnit } from '../builder/engine.js'
import { equipmentCatalog } from './economy.js'
import { eligibleStandardOffer, standardRecruitmentProfiles } from './recruitmentAccess.js'
import { watchEntitlements } from './cloud.js'
import { craftRoll, priceForFormation } from './market.js'
import {
  publishMarketOffer, purchaseOffer, setMarketOfferEnabled, seedStandardRecruitmentOffers, seedDefaultEquipmentOffers,
  watchMarketOffers, watchMarketPurchases,
} from './marketCloud.js'

// Firestore validates the market's price and assets atomically; this UI handles
// only the player experience and choosing a GM-published offer.
export default function CompanyMarket({ campaign, user, isGm, heroes, detachments = [], inventory = [] }) {
  const [offers, setOffers] = useState([])
  const [purchases, setPurchases] = useState([])
  const [entitlements, setEntitlements] = useState({})
  const [catalog, setCatalog] = useState(null)
  const [characterData, setCharacterData] = useState(null)
  const [form, setForm] = useState({ kind: 'equipment', item: '', unit: '', price: '', difficulty: 2, check: 'Mind + Craft' })
  const [message, setMessage] = useState('')
  const [selectedTargets, setSelectedTargets] = useState({})
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
    const c = watchEntitlements(campaign.id, setEntitlements, fail)
    return () => { a(); b(); c() }
  }, [campaign.id])
  useEffect(() => {
    if (!isGm || !characterData) return
    seedDefaultEquipmentOffers(campaign.id, user.uid, characterData)
      .catch((error) => setMessage(`Could not populate the equipment shop: ${error.message}`))
  }, [isGm, characterData, campaign.id, user.uid])
  useEffect(() => {
    if (!isGm || !catalog || campaign.act < 2 || !campaign.patronFactionId) return
    seedStandardRecruitmentOffers(campaign.id, user.uid, campaign, catalog)
      .catch((error) => setMessage(`Could not unlock standard recruitment: ${error.message}`))
  }, [isGm, catalog, campaign.id, campaign.act, campaign.patronFactionId, user.uid])
  const gear = useMemo(() => characterData ? equipmentCatalog(characterData) : [], [characterData])
  const recruitAccess = useMemo(() => standardRecruitmentProfiles(catalog, campaign, entitlements, detachments), [catalog, campaign, entitlements, detachments])
  const patron = catalog?.factions.find((f) => f.id === campaign.patronFactionId)
  const units = campaign.act < 2 || !patron ? [] : [...catalog.generic, ...patron.units]
  const selectedUnit = units.find((e) => e.key === form.unit)
  const defaultUnit = selectedUnit && catalog ? newUnitConfig(selectedUnit, selectedUnit.slots[0]) : null
  const resolved = selectedUnit && defaultUnit ? resolveUnit(selectedUnit, defaultUnit, selectedUnit.source === 'faction' ? patron.id : null) : null
  const selected = gear.find((g) => `${g.kind}:${g.name}` === form.item)
  const enchantRecipes = characterData?.magic.enchantGroups.flatMap((group) => group.entries
    .filter((entry) => entry.allowed?.length && !entry.choice && !entry.custom && entry.group === 'minor')
    .map((entry) => ({ key: entry.key, name: entry.name, allowed: entry.allowed, points: entry.points }))) ?? []
  const selectedEnchant = enchantRecipes.find((entry) => entry.key === form.enchantKey)
  const pc = heroes.find((h) => h.ownerUid === user.uid)?.sheet
  const pcView = pc && characterData ? derive(normalizeCharacter(pc, characterData), characterData) : null
  const run = async (fn, success) => {
    setBusy(true); setMessage('')
    try { const value = await fn(); setMessage(typeof success === 'function' ? success(value) : success) } catch (e) { setMessage(e.message || 'Action failed') }
    finally { setBusy(false) }
  }
  const publish = async () => {
    let offer
    const price = form.kind === 'unit' && resolved ? priceForFormation(resolved.points) : Number(form.price)
    if (form.kind === 'enchant') {
      if (!selectedEnchant) throw new Error('Choose an enchantment')
      if (!['melee', 'ranged', 'armor', 'shield'].includes(form.targetKind) || !selectedEnchant.allowed.includes(form.targetKind)) throw new Error('Choose compatible equipment')
      offer = { kind: 'enchant', label: selectedEnchant.name, price, enchantKey: selectedEnchant.key,
        targetKind: form.targetKind, difficulty: Number(form.difficulty), check: form.check }
    } else if (form.kind === 'unit') {
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
    if (['craft', 'enchant'].includes(offer.kind)) {
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
    await purchaseOffer(campaign.id, user.uid, offer.id, result,
      offer.kind === 'enchant' ? selectedTargets[offer.id] : null)
    return result
  }
  const claimedByOthers = new Set(heroes.filter((h) => h.ownerUid !== user.uid)
    .flatMap((h) => (h.sheet?.gear ?? []).map((g) => g.inventoryId).filter(Boolean)))
  const compatibleTargets = (offer) => inventory.filter((entry) => entry.kind === 'equipment'
    && entry.item?.kind === offer.targetKind
    && (!entry.ownerUid || entry.ownerUid === user.uid)
    && !claimedByOthers.has(entry.id)
    && !(entry.enchants ?? []).some((e) => e.key === offer.enchantKey)
    && (entry.enchants ?? []).length < 3)

  const visibleOffers = offers.filter((o) => o.enabled && (o.standardAccess
    ? eligibleStandardOffer(o, catalog, campaign, entitlements, detachments)
    : o.kind !== 'unit' || (campaign.act >= 2 && !!campaign.patronFactionId &&
        (!o.factionId || o.factionId === campaign.patronFactionId))))

  return <div className="panel-grid contents">
    <Toast message={message} kind={/purchased|recorded|published|enabled|disabled|updated/i.test(message) ? 'ok' : 'bad'} />

    {!isGm && <div className="offer-row span-all">
      {[
        ['equipment', 'Equipment', 'Bought instantly with Company Gold; added to the Company inventory.'],
        ['craft', 'Crafting', 'Quest/reward recipes are published once; ordinary projects do not require per-attempt GM approval. Advanced crafted Qualities and flaws await the full profile editor.'],
        ['enchant', 'Enchanting', 'Apply an unlocked Minor Enchantment to actual Company equipment. A successful Mysticism check updates its effects and Points; exceptional Surge Qualities, ranks and Blunder deterioration await the dedicated modifier editor.'],
        ['unit', 'Formations', `Patron Core profiles: ${recruitAccess.factionCore.length} · Generic profiles permitted by party slots: ${recruitAccess.generic.length}. Two free starting formations are Company grants, not Marketplace purchases.`],
      ].map(([kind, title, note]) => {
        const list = visibleOffers.filter((o) => o.kind === kind)
        return <section className="panel" key={kind}>
          <h2>{title}</h2>
          <p className="muted small">{note}</p>
          {!list.length && <p className="muted">{offers.some((o) => o.enabled) ? 'Nothing available yet.' : 'No offers have been initialized. The GM can open this page once after assigning the Patron; standard offers are published automatically.'}</p>}
          <ul className="saved-list panel-scroll">{list.map((offer) =>
            <li key={offer.id}>
              <div><strong>{offer.label}</strong><div className="muted small">{['craft', 'enchant'].includes(offer.kind)
                ? `${offer.check} · Difficulty ${offer.difficulty}`
                : offer.kind === 'unit' ? `${offer.points} Points` : 'Equipment'}
                {' · '}{offer.price} Gold</div></div>
              {offer.kind === 'enchant' && <label className="field">Item
                <select value={selectedTargets[offer.id] ?? ''} onChange={(event) =>
                  setSelectedTargets((prev) => ({ ...prev, [offer.id]: event.target.value }))}>
                  <option value="">Choose owned item…</option>
                  {compatibleTargets(offer).map((item) => <option key={item.id} value={item.id}>{item.item.name} · {(item.enchants ?? []).length} enchantments</option>)}
                </select>
              </label>}
              <button className="primary" disabled={busy || (campaign.goldBalance ?? 0) < offer.price ||
                (['craft', 'enchant'].includes(offer.kind) && !pcView) ||
                (offer.kind === 'enchant' && !compatibleTargets(offer).some((item) => item.id === selectedTargets[offer.id]))} onClick={() => run(() => buy(offer), (roll) => !roll ? 'Purchased. Company inventory updated.' :
                  `${roll.dice.join(', ')} · ${roll.successes} successes, ${roll.surges} Surge, ${roll.blunders} Blunder. ${roll.successes >= offer.difficulty ? 'Project succeeded; inventory updated.' : 'Project failed; materials Gold spent.'} Bonus Qualities and Blunder deterioration await the profile editor.`)}>{offer.kind === 'craft' ? 'Craft' : offer.kind === 'enchant' ? 'Enchant' : 'Buy'}</button>
            </li>)}</ul>
        </section>
      })}
    </div>}

    {isGm && <section className="panel">
      <h2>Publish regular market offers</h2>
      <p className="muted small">Ordinary equipment is automatically stocked. Publish quest-unlocked crafting and enchantment recipes once, or make special arrangements; PCs then use them without another GM approval.</p>
      <div className="campaign-form">
        <label className="field">Type<select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value, item: '', unit: '', price: '', enchantKey: '', targetKind: '', check: e.target.value === 'enchant' ? 'Mind + Mysticism' : 'Mind + Craft' })}>
          <option value="equipment">Equipment purchase</option>
          <option value="craft">Crafting project</option>
          <option value="enchant">Enchantment recipe</option>
          <option value="unit">Formation recruitment</option>
        </select></label>
        {form.kind === 'enchant' ? <><label className="field">Enchantment
          <select value={form.enchantKey ?? ''} onChange={(e) => setForm({ ...form, enchantKey: e.target.value, targetKind: '' })}>
            <option value="">Choose a component…</option>
            {enchantRecipes.map((e) => <option key={e.key} value={e.key}>{e.name} (+{e.points} battlefield pts)</option>)}
          </select></label>
          <label className="field">Equipment type<select value={form.targetKind ?? ''} onChange={(e) => setForm({ ...form, targetKind: e.target.value })}>
            <option value="">Choose…</option>
            {(selectedEnchant?.allowed ?? []).map((kind) => <option key={kind} value={kind}>{kind}</option>)}
          </select></label></> : form.kind === 'unit' ? <label className="field">Formation<select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
          <option value="">Choose a formation…</option>
          {units.map((u) => <option key={u.key} value={u.key}>{u.name}</option>)}
        </select></label> : <label className="field">Equipment<select value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })}>
          <option value="">Choose equipment…</option>
          {gear.map((g) => <option key={g.kind + g.name} value={`${g.kind}:${g.name}`}>{g.name} ({g.kind})</option>)}
        </select></label>}
        {form.kind === 'unit' ? <p className="muted small">Default formation · {resolved?.points ?? '—'} Points · {resolved && !resolved.pointsVary ? priceForFormation(resolved.points) : '—'} Gold</p>
        : <label className="field">Published Gold price<input type="number" min={1} max={1000} step={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>}
        {['craft', 'enchant'].includes(form.kind) && <>
          <label className="field">Difficulty<select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })}>
            {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} successes</option>)}
          </select></label>
          <label className="field">Crafting approach<select value={form.check} onChange={(e) => setForm({ ...form, check: e.target.value })}>
            {(form.kind === 'enchant' ? ['Mind + Mysticism','Spirit + Mysticism'] : ['Body + Craft','Agility + Craft','Mind + Craft','Mind + Mysticism','Spirit + Mysticism']).map((x) => <option key={x} value={x}>{x}</option>)}
          </select></label>
        </>}
        <button className="primary" disabled={busy || !(form.kind === 'unit' ? resolved && !resolved.pointsVary && !(resolved.missingTags ?? []).length : (form.kind === 'enchant' ? selectedEnchant && selectedEnchant.allowed.includes(form.targetKind) : selected) && Number.isInteger(Number(form.price)) && Number(form.price) >= 1)} onClick={() => run(publish, 'Offer published')}>Publish offer</button>
      </div>
    </section>}
    {isGm && <section className="panel">
      <h2>Published offers</h2>
      <ul className="saved-list panel-scroll">{offers.map((o) => <li key={o.id}>
        <div><strong>{o.label}</strong><div className="muted small">{o.kind} · {o.price} Gold · {o.enabled ? 'Available' : 'Disabled'}</div></div>
        <button disabled={busy} onClick={() => run(() => setMarketOfferEnabled(campaign.id, o.id, !o.enabled),
          o.enabled ? 'Offer disabled' : 'Offer enabled')}>{o.enabled ? 'Disable' : 'Enable'}</button>
      </li>)}</ul>
    </section>}
    <section className="panel">
      <h2>Recent self-service purchases</h2>
      {!purchases.length && <p className="muted">No self-service purchases recorded.</p>}
      <ul className="saved-list panel-scroll">{purchases.slice(-20).reverse().map((p) => <li key={p.id}>
        <div><strong>{offers.find((o) => o.id === p.offerId)?.label ?? p.kind}</strong><div className="muted small">{heroes.find((h) => h.ownerUid === p.ownerUid)?.sheet?.name ?? p.ownerUid.slice(0, 8)} · {p.price} Gold</div></div>
        {p.crafting && <span className="muted small">{p.crafting.success ? 'Succeeded' : 'Failed'} · {p.crafting.qualities} ordinary excess successes · {p.crafting.surges ? 'Surge' : 'No Surge'} · {p.crafting.blunders ? 'Blunder' : 'No Blunder'}</span>}
      </li>)}</ul>
    </section>
  </div>
}
