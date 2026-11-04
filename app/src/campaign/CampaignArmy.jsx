import { useEffect, useMemo, useState } from 'react'
import { loadCatalog } from '../builder/catalog.js'
import { newUnitConfig, resolveUnit } from '../builder/engine.js'
import { detachmentView, deploymentCap, allowedDoctrineCommands, FIELD_SLOTS } from './limits.js'
import { grantEquipment, grantFormation, removeInventoryItem, saveDetachment, loadEntitlement, setEntitlement } from './cloud.js'
import { loadCharacterData } from '../character/data.js'
import { derive, normalizeCharacter } from '../character/engine.js'

const empty = { doctrineId: null, commands: [], selections: [] }
const labelSlot = (s) => ({ C: 'Core', E: 'Elite', R: 'Ranged', V: 'Mobile', S: 'Support', A: 'Asset', H: 'Headquarters' }[s] || s)

export default function CampaignArmy({ campaign, user, isGm, heroes, approvedHeroes, inventory, detachments, onRefresh }) {
  const [catalog, setCatalog] = useState(null)
  const [charData, setCharData] = useState(null)
  const [entitlements, setEntitlements] = useState({})
  const [draft, setDraft] = useState(null)
  const [selectedKey, setSelectedKey] = useState('')
  const [selectedGear, setSelectedGear] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const my = detachments.find((d) => d.ownerUid === user.uid) ?? empty

  useEffect(() => { loadCatalog().then(setCatalog).catch((e) => setMessage(e.message)); loadCharacterData().then(setCharData).catch((e) => setMessage(e.message)) }, [])
  useEffect(() => { setDraft({ ...empty, ...my, selections: [...(my.selections ?? [])], commands: [...(my.commands ?? [])] }) }, [campaign.id, JSON.stringify(my)])
  useEffect(() => {
    if (!campaign) return
    Promise.all(campaign.memberUids.map(async (uid) => [uid, await loadEntitlement(campaign.id, uid)]))
      .then((pairs) => setEntitlements(Object.fromEntries(pairs))).catch((e) => setMessage(e.message))
  }, [campaign.id, campaign.memberUids.join(',')])

  const approved = approvedHeroes.find((h) => h.ownerUid === user.uid)
  const hero = approved && charData ? derive(normalizeCharacter(approved.sheet, charData), charData) : null
  const other = detachments.filter((d) => d.ownerUid !== user.uid)
  const result = useMemo(() => catalog && draft ? detachmentView(
    campaign, entitlements[user.uid] ?? {}, { ...draft, ownerUid: user.uid }, inventory,
    catalog, hero?.points.total ?? null, other,
  ) : null, [campaign, entitlements, user.uid, draft, inventory, catalog, hero?.points.total, detachments])
  const sponsor = catalog?.factions.find((f) => f.id === campaign.patronFactionId)
  const canRecruit = campaign.act >= 2 && !!sponsor
  const available = catalog && canRecruit ? [
    ...catalog.generic,
    ...sponsor.units,
  ] : []
  const allGear = charData ? [
    ...charData.melee.map((g) => ({ kind: 'melee', name: g.name })),
    ...charData.ranged.map((g) => ({ kind: 'ranged', name: g.name })),
    ...charData.armor.map((g) => ({ kind: 'armor', name: g.name })),
    { kind: 'shield', name: 'Shield' },
  ] : []

  const perform = async (callback) => {
    setSaving(true); setMessage('')
    try { await callback(); await onRefresh(); setMessage('Saved') }
    catch (e) { setMessage(e.message ?? 'Could not save') }
    finally { setSaving(false) }
  }
  const add = (id, slot) => setDraft((d) => ({
    ...d, selections: [...d.selections, { id, slot }],
  }))
  const remove = (id) => setDraft((d) => ({ ...d, selections: d.selections.filter((s) => s.id !== id) }))
  const selectedIds = new Set(draft?.selections.map((s) => s.id) ?? [])
  const takenElsewhere = new Set(other.flatMap((d) => (d.selections ?? []).map((s) => s.id)))
  if (!catalog || !charData || !draft || !result) return <section className="panel"><p>Loading campaign army catalogue…</p>{message && <p className="bad">{message}</p>}</section>

  return <div className="panel-grid">
    <section className="panel span-all">
      <h2>Company military pool</h2>
      <p className="muted small">
        All formations are Company property. Each player builds a temporary detachment from the same owned pool;
        a formation cannot be deployed by two PCs simultaneously. Faction foundation slots belong to every PC,
        while each PC chooses their own Doctrine. Purchasing a formation does not automatically grant another slot.
      </p>
      <p><strong>{inventory.filter((i) => i.kind === 'unit').length}</strong> owned formations · <strong>{campaign.act >= 2 ? sponsor?.name ?? 'Sponsor not chosen' : 'Company not founded'}</strong> · {deploymentCap(campaign) ?? 'Hero only'} deployment points per PC</p>
      {message && <p className={message === 'Saved' ? 'ok' : 'bad'} role="status">{message}</p>}
    </section>
    {!isGm && <section className="panel">
      <h2>My Detachment</h2>
      <p className="muted small">{result.total} / {result.cap ?? 'Hero only'} points, including {hero?.points.total ?? '?'} Hero points</p>
      {campaign.act >= 3 && <label className="field">Personal Doctrine
        <select value={draft.doctrineId ?? ''} onChange={(e) => setDraft({ ...draft, doctrineId: e.target.value || null, commands: [] })}>
          <option value="">Choose Doctrine…</option>
          {catalog.doctrines.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </label>}
      {campaign.act >= 3 && result.slots.doctrine && <section>
        <h3>Personal Doctrine Commands ({draft.commands.length}/{allowedDoctrineCommands(campaign, entitlements[user.uid])})</h3>
        {result.slots.doctrine.commands.map((command) => <label key={command.name} className="choice">
          <input type="checkbox" checked={draft.commands.includes(command.name)}
            disabled={!draft.commands.includes(command.name) && draft.commands.length >= allowedDoctrineCommands(campaign, entitlements[user.uid])}
            onChange={() => setDraft((d) => ({ ...d, commands: d.commands.includes(command.name) ? d.commands.filter((s) => s !== command.name) : [...d.commands, command.name] }))} />
          <strong>{command.name}</strong> · {command.slot}
        </label>)}
      </section>}
      <h3>Recruitment slots</h3>
      <div className="slot-count">{result.slots.sources.map((s, i) => <span key={i} className="tag" title={s.source}>{s.slot} ({s.source}) </span>)}</div>
      <ul className="saved-list">{result.units.filter((u) => !u.missing).map((u) => <li key={u.poolId}>
        <span><strong>{u.name}</strong> · {u.points} points</span>
        <div className="saved-actions"><select aria-label={`Recruitment slot for ${u.name}`} value={u.slot} onChange={(e) => setDraft((d) => ({ ...d, selections: d.selections.map((s) => s.id === u.poolId ? { ...s, slot: e.target.value } : s) }))}>
          {u.eligibleSlots.map((s) => <option key={s} value={s}>{s}{result.slots.unitSlots[s] === 0 ? ' (locked)' : ''}</option>)}
        </select><button onClick={() => remove(u.poolId)}>Remove</button></div>
      </li>)}</ul>
      {result.errors.length > 0 && <ul className="checks">{result.errors.map((e, i) => <li className="bad" key={i}>{e}</li>)}</ul>}
      <button className="primary" disabled={saving || !result.legal} onClick={() => perform(() => saveDetachment(campaign.id, user.uid, draft))}>Save legal detachment</button>
    </section>}
    {!isGm && <section className="panel">
      <h2>Select owned formations</h2>
      {campaign.act === 1 && <p className="muted">Act I uses your Hero. Military deployments begin in Act II.</p>}
      {campaign.act >= 2 && !sponsor && <p className="muted">The GM must select a sponsoring faction before military deployment.</p>}
      <ul className="saved-list">{canRecruit && inventory.filter((i) => i.kind === 'unit').map((item) => {
        const entry = catalog.unitsByKey[item.config?.key]
        if (!entry) return <li key={item.id}>Unsupported formation ({item.config?.key})</li>
        const unit = resolveUnit(entry, item.config, item.factionId)
        const chosen = selectedIds.has(item.id)
        const taken = takenElsewhere.has(item.id)
        const slots = unit.eligibleSlots.filter((slot) => result.used[slot] < result.slots.unitSlots[slot])
        return <li key={item.id}><div><strong>{unit.name}</strong><div className="muted small">{unit.points} pts · {unit.models} Models {taken ? '· Selected by another PC' : ''}</div></div>
          <div className="saved-actions">{chosen ? <span className="ok">Selected</span> : <button disabled={taken || !slots.length} onClick={() => add(item.id, slots[0])}>{taken ? 'In use' : slots.length ? 'Deploy' : 'No slot'}</button>}</div>
        </li>
      })}</ul>
      {canRecruit && !inventory.some((i) => i.kind === 'unit') && <p className="muted">No formations have been recruited into the Company pool.</p>}
    </section>}
    {isGm && <section className="panel span-all">
      <h2>GM — Manage Company formations</h2>
      <p className="muted small">Only the GM can register acquired units. Use a recruitment, Patron grant, mission reward, or approved agreement before adding them. Gold expenditure and recruiting eligibility are not yet automatically enforced.</p>
      <label className="field">Grant formation
        <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)}>
          <option value="">Choose a formation…</option>
          {available.map((unit) => <option key={unit.key} value={unit.key}>{unit.name} · {unit.basePoints} pts · {unit.source}</option>)}
        </select>
      </label>
      <button disabled={saving || !selectedKey || !canRecruit} onClick={() => perform(async () => {
        const entry = catalog.unitsByKey[selectedKey]
        await grantFormation(campaign.id, newUnitConfig(entry, entry.slots[0]), entry.source === 'faction' ? sponsor.id : null)
      })}>Grant to Company roster</button>
      <p className="muted small">Act II provides two free standard-size Patron formations to the entire Company; assign them manually from an eligible source. Subsequent grants should reflect paid recruitment or campaign rewards.</p>
      <h3>Owned formations</h3>
      <ul className="saved-list">{inventory.filter((i) => i.kind === 'unit').map((i) => <li key={i.id}><span>{catalog.unitsByKey[i.config?.key]?.name ?? i.config.key}</span><button className="danger" disabled={saving || detachments.some((d) => d.selections?.some((s) => s.id === i.id))} onClick={() => perform(() => removeInventoryItem(campaign.id, i.id))}>Remove</button></li>)}</ul>
    </section>}
    {isGm && <section className="panel span-all">
      <h2>GM — Equipment awards</h2>
      <p className="muted small">Granted equipment enters a finite shared pool. A PC may equip it in their character builder, but it cannot be selected by two PCs at once.</p>
      <label className="field">Grant equipment
        <select value={selectedGear} onChange={(e) => setSelectedGear(e.target.value)}>
          <option value="">Choose equipment…</option>
          {allGear.map((g) => <option key={g.kind + ':' + g.name} value={g.kind + ':' + g.name}>{g.name} ({g.kind})</option>)}
        </select>
      </label>
      <button disabled={saving || !selectedGear} onClick={() => perform(() => {
        const [kind, name] = selectedGear.split(':')
        return grantEquipment(campaign.id, kind, name)
      })}>Grant to Company inventory</button>
      <ul className="saved-list">{inventory.filter((i) => i.kind === 'equipment').map((i) => <li key={i.id}>
        <span>{i.item?.name} <span className="muted small">({i.item?.kind})</span></span>
        <button disabled={saving || heroes.some((h) => h.sheet?.gear?.some((g) => g.inventoryId === i.id))} className="danger" onClick={() => perform(() => removeInventoryItem(campaign.id, i.id))}>Remove</button>
      </li>)}</ul>
    </section>}
    {isGm && <section className="panel span-all">
      <h2>GM — Personal detachment upgrades</h2>
      <p className="muted small">Each player inherits the same two foundation slots from the sponsoring faction. Flex slots are purchased individually through Develop (2 Gold each, maximum two). Grand's third Doctrine Command requires a separate unlock.</p>
      {campaign.memberUids.filter((uid) => uid !== campaign.gmUid).map((uid) => {
        const entitlement = entitlements[uid] ?? {}
        return <div key={uid} className="group">
          <div className="group-label">{heroes.find((h) => h.ownerUid === uid)?.sheet?.name ?? uid.slice(0, 8)}</div>
          <label className="field">Flex slot 1<select value={entitlement.flexSlots?.[0] ?? ''} onChange={(e) => setEntitlements((prev) => {
            const slots = [e.target.value, entitlement.flexSlots?.[1] ?? ''].filter(Boolean)
            return { ...prev, [uid]: { ...entitlement, flexSlots: slots } }
          })}><option value="">None</option>{FIELD_SLOTS.map((s) => <option key={s} value={s}>{labelSlot(s)}</option>)}</select></label>
          <label className="field">Flex slot 2<select value={entitlement.flexSlots?.[1] ?? ''} onChange={(e) => setEntitlements((prev) => ({ ...prev, [uid]: { ...entitlement, flexSlots: [entitlement.flexSlots?.[0] ?? '', e.target.value].filter(Boolean) } }))}><option value="">None</option>{FIELD_SLOTS.map((s) => <option key={s} value={s}>{labelSlot(s)}</option>)}</select></label>
          {campaign.format === 'grand' && <label className="choice"><input type="checkbox" checked={!!entitlement.grandThirdCommand} onChange={(e) => setEntitlements((prev) => ({ ...prev, [uid]: { ...entitlement, grandThirdCommand: e.target.checked } }))} />Grand third Doctrine Command unlocked</label>}
          <button disabled={saving} onClick={() => perform(() => setEntitlement(campaign.id, uid, entitlements[uid] ?? {}))}>Save entitlement</button>
        </div>
      })}
    </section>}
  </div>
}
