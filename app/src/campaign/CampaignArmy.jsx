import { useEffect, useMemo, useState } from 'react'
import Toast from './Toast.jsx'
import { loadCatalog } from '../builder/catalog.js'
import { newUnitConfig, resolveUnit, SLOT_ORDER } from '../builder/engine.js'
import { formatProfile, formatStats, optionBrief, splitOptions } from '../builder/format.js'
import { detachmentView, deploymentCap, allowedDoctrineCommands, FIELD_SLOTS } from './limits.js'
import { grantEquipment, grantFormation, removeInventoryItem, saveDetachment, setEntitlement, watchEntitlements } from './cloud.js'
import { loadCharacterData } from '../character/data.js'
import { derive, normalizeCharacter } from '../character/engine.js'
import { acceptSnapshot, discardDraft, editDraft } from './sync.js'
import { groupRoster, holdersOf } from './roster.js'

const empty = { doctrineId: null, commands: [], selections: [] }
const labelSlot = (s) => ({ C: 'Core', E: 'Elite', R: 'Ranged', V: 'Mobile', S: 'Support', A: 'Asset', H: 'Headquarters' }[s] || s)
// Slot names and keyword tags overlap (e.g. Core, Ranged); show each label once.
const unitLabels = (unit) => {
  const slots = unit.eligibleSlots.map(labelSlot)
  const seen = new Set(slots.map((s) => s.toLowerCase()))
  return { slotIds: unit.eligibleSlots, tags: unit.tags.filter((t) => !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase())) }
}
function Chips({ unit, active, onPick, locked = {} }) {
  const { slotIds, tags } = unitLabels(unit)
  return <div className="unit-chips">
    {slotIds.map((id) => onPick && slotIds.length > 1
      ? <button type="button" key={id} className={`tag pick slot-${id} ${active === id ? 'active' : ''}`} aria-pressed={active === id}
        disabled={locked[id] && active !== id} title={locked[id] ? `${labelSlot(id)} (no slot)` : `Fill a ${labelSlot(id)} slot`} onClick={() => onPick(id)}>{labelSlot(id)}</button>
      : <span key={id} className={`tag slot-chip slot-${id} ${active === id ? 'active' : ''}`}>{labelSlot(id)}</span>)}
    {tags.map((t) => <span className="tag muted" key={t}>{t}</span>)}
  </div>
}

// Groups the budget's slots by where they came from and seats each drafted unit in the first open slot of its type.
function buildSlotGroups(result, campaign, sponsor) {
  const queues = Object.fromEntries(SLOT_ORDER.map((s) => [s, result.units.filter((u) => !u.missing && u.slot === s)]))
  const titles = { hero: 'Hero', patron: `Patron · ${sponsor?.name ?? 'Sponsor'}`, doctrine: `Doctrine · ${result.slots.doctrine?.name}`, flex: 'Purchased Flex' }
  const groups = new Map()
  const cellsFor = (kind) => {
    if (!groups.has(kind)) groups.set(kind, { key: kind, kind, title: titles[kind], cells: [] })
    return groups.get(kind).cells
  }
  const [heroSource, ...rest] = result.slots.sources
  cellsFor('hero').push({ slot: heroSource.slot, caption: 'Reserved', hero: true })
  for (const s of rest) {
    const kind = s.kind === 'command' ? 'doctrine' : s.kind
    const caption = s.kind === 'command' ? s.source : s.kind === 'flex' ? 'Flex' : 'Foundation'
    cellsFor(kind).push({ slot: s.slot, caption, unit: queues[s.slot].shift() })
  }
  if (campaign.act >= 3 && !result.slots.doctrine) {
    groups.set('doctrine', { key: 'doctrine', kind: 'doctrine', title: 'Doctrine', cells: [], note: 'Choose a Personal Doctrine to unlock its foundation and Command slots.' })
  }
  const list = ['hero', 'patron', 'doctrine', 'flex'].filter((k) => groups.has(k)).map((k) => groups.get(k))
  const over = SLOT_ORDER.flatMap((s) => queues[s].map((unit) => ({ slot: s, caption: 'No slot', unit, over: true })))
  if (over.length) list.push({ key: 'over', kind: 'over', title: 'Over the limit', cells: over })
  return list
}
export default function CampaignArmy({ campaign, user, isGm, heroes, approvedHeroes, inventory, detachments }) {
  const [catalog, setCatalog] = useState(null)
  const [charData, setCharData] = useState(null)
  const [entitlements, setEntitlements] = useState({})
  const [draftState, setDraftState] = useState(null)
  const [entitlementDrafts, setEntitlementDrafts] = useState({})
  const [selectedKey, setSelectedKey] = useState('')
  const [selectedGear, setSelectedGear] = useState('')
  const [message, setMessage] = useState('')
  const [armyPage, setArmyPage] = useState('detachment')
  const [poolQuery, setPoolQuery] = useState('')
  const [poolSlot, setPoolSlot] = useState('')
  const [poolAvailableOnly, setPoolAvailableOnly] = useState(false)
  const [saving, setSaving] = useState(false)
  const my = detachments.find((d) => d.ownerUid === user.uid) ?? empty
  const mySaved = { doctrineId: my.doctrineId ?? null, commands: my.commands ?? [], selections: my.selections ?? [] }
  const draft = draftState?.value
  const setDraft = (change) => setDraftState((prev) => editDraft(prev, change))
  const editEntitlement = (uid, change) => setEntitlementDrafts((prev) => ({ ...prev,
    [uid]: editDraft(prev[uid] ?? acceptSnapshot(null, { flexSlots: [], grandThirdCommand: false }), change),
  }))

  useEffect(() => { loadCatalog().then(setCatalog).catch((e) => setMessage(e.message)); loadCharacterData().then(setCharData).catch((e) => setMessage(e.message)) }, [])
  useEffect(() => {
    setDraftState((previous) => acceptSnapshot(previous, mySaved))
  }, [campaign.id, JSON.stringify(mySaved)])
  useEffect(() => {
    if (!campaign) return
    return watchEntitlements(campaign.id, (remote) => {
      setEntitlements(remote)
      setEntitlementDrafts((previous) => {
        const next = { ...previous }
        for (const [uid, value] of Object.entries(remote)) {
          next[uid] = acceptSnapshot(previous[uid], {
            flexSlots: value.flexSlots ?? [], grandThirdCommand: value.grandThirdCommand === true,
          })
        }
        for (const uid of Object.keys(next)) if (!(uid in remote) && previous[uid]?.remoteSignature !== JSON.stringify({ flexSlots: [], grandThirdCommand: false })) {
          next[uid] = acceptSnapshot(previous[uid], { flexSlots: [], grandThirdCommand: false })
        }
        return next
      })
    }, (e) => setMessage(e.message))
  }, [campaign.id])

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
    try { await callback(); setMessage('Saved — changes sync automatically') }
    catch (e) { setMessage(e.message ?? 'Could not save') }
    finally { setSaving(false) }
  }
  const add = (id, slot) => setDraft((d) => ({
    ...d, selections: [...d.selections, { id, slot }],
  }))
  const remove = (id) => setDraft((d) => ({ ...d, selections: d.selections.filter((s) => s.id !== id) }))
  const selectedIds = new Set(draft?.selections.map((s) => s.id) ?? [])
  const takenElsewhere = new Set(other.flatMap((d) => (d.selections ?? []).map((s) => s.id)))
  const slotGroups = result ? buildSlotGroups(result, campaign, sponsor) : []
  const activeArmyPage = armyPage === 'doctrine' && campaign.act < 3 || armyPage === 'roster' && campaign.act < 2 ? 'detachment' : armyPage
  if (!catalog || !charData || !draft || !result) return <section className="panel"><p>Loading campaign army catalogue…</p>{message && <p className="bad">{message}</p>}</section>

  return <div className="panel-grid">
    <section className="panel span-all">
      <h2>Company military pool</h2>
      <p><strong>{inventory.filter((i) => i.kind === 'unit').length}</strong> owned formations · <strong>{campaign.act >= 2 ? sponsor?.name ?? 'Sponsor not chosen' : 'Company not founded'}</strong> · {deploymentCap(campaign) ?? 'Hero only'} deployment points per PC</p>
      <p className="muted small">
        Formations are Company property; each PC drafts a temporary detachment from the shared pool, and a formation can't be deployed by two PCs at once.
        Foundation slots belong to every PC, while each PC chooses their own Doctrine.
      </p>
      {!isGm && <>
        <h3>Recruitment slots</h3>
        <div className="slot-count muted small">{result.units.filter((u) => !u.missing).length} of {result.slots.total - 1} Recruitment Slots used (plus Hero) · click a filled slot to free it</div>
        <div className="slot-sources">
          {slotGroups.map((group) => <div key={group.key} className={`source-card kind-${group.kind}`}>
            <div className="source-title">{group.title}</div>
            {group.note ? <p className="muted small">{group.note}</p> : <div className="source-cells">
              {group.cells.map((cell, i) => {
                const unit = cell.unit
                return <div key={i} className={`slot-cell slot-${cell.slot} ${unit || cell.hero ? 'lit' : ''} ${cell.over ? 'over' : ''}`}
                  style={unit ? undefined : { cursor: 'default' }}
                  title={cell.hero ? `Your Hero (reserved)${hero ? ` · ${hero.points.total} pts` : ''}` : unit ? `Click to remove ${unit.name}` : `${labelSlot(cell.slot)} slot from ${cell.caption}`}
                  onClick={unit ? () => remove(unit.poolId) : undefined}>
                  <span className="rack-letter">{cell.slot}</span>
                  <span className="rack-unit">{cell.hero ? (approved?.sheet?.name || 'Hero') : unit ? unit.name : 'Open'}</span>
                  <span className="cell-source">{cell.hero ? (hero ? `${hero.points.total} pts` : 'No approved Hero') : cell.caption}</span>
                </div>
              })}
            </div>}
          </div>)}
        </div>
      </>}
      <Toast message={message} kind={message.startsWith('Saved') ? 'ok' : 'bad'} />
    </section>
    {!isGm && <nav className="subtabs nested army-subtabs span-all" aria-label="PC Army sections">
      {[
        { id: 'detachment', label: 'Detachment' },
        ...(campaign.act >= 2 ? [{ id: 'roster', label: 'Company Roster' }] : []),
        ...(campaign.act >= 3 ? [{ id: 'doctrine', label: 'Personal Doctrine' }] : []),
      ].map(({ id, label }) =>
        <button type="button" key={id} className={activeArmyPage === id ? 'active' : ''}
          aria-current={activeArmyPage === id ? 'page' : undefined}
          onClick={() => setArmyPage(id)}>{label}</button>)}
    </nav>}
    {!isGm && activeArmyPage === 'detachment' && <div className="army-draft span-all"><div className="col-stack">
    <section className="panel">
      <h2>My Detachment</h2>
      {draftState?.conflict && <div className="bad small" role="status">Your detachment was changed elsewhere. Your unsaved selections are preserved. <button onClick={() => setDraftState(discardDraft)}>Load saved detachment</button></div>}
      {draftState?.dirty && !draftState?.conflict && <p className="muted small">Unsaved detachment changes</p>}
      <p className="muted small">{result.total} / {result.cap ?? 'Hero only'} points, including {hero?.points.total ?? '?'} Hero points</p>
      <ul className="saved-list panel-scroll">{result.units.filter((u) => !u.missing).map((u) => <li key={u.poolId}>
        <div><strong>{u.name}</strong> <span className="muted small">{u.points} pts · {u.models} Models</span>
          <Chips unit={u} active={u.slot} locked={Object.fromEntries(u.eligibleSlots.map((s) => [s, result.slots.unitSlots[s] === 0]))}
            onPick={(s) => setDraft((d) => ({ ...d, selections: d.selections.map((x) => x.id === u.poolId ? { ...x, slot: s } : x) }))} /></div>
        <div className="saved-actions"><button onClick={() => remove(u.poolId)}>Remove</button></div>
      </li>)}</ul>
      {result.errors.length > 0 && <ul className="checks">{result.errors.map((e, i) => <li className="bad" key={i}>{e}</li>)}</ul>}
      <button className="primary" disabled={saving || !result.legal || draftState?.conflict} onClick={() => perform(() => saveDetachment(campaign.id, user.uid, draft))}>Save legal detachment</button>
    </section>

    </div>
    <section className="panel pool-panel">
      <h2>Select owned formations</h2>
      {campaign.act === 1 && <p className="muted">Act I uses your Hero. Military deployments begin in Act II.</p>}
      {campaign.act >= 2 && !sponsor && <p className="muted">The GM must select a sponsoring faction before military deployment.</p>}
      {canRecruit && (() => {
        const rows = inventory.filter((i) => i.kind === 'unit').map((item) => {
          const entry = catalog.unitsByKey[item.config?.key]
          if (!entry) return { item, unit: null }
          const unit = resolveUnit(entry, item.config, item.factionId)
          const taken = takenElsewhere.has(item.id)
          const slots = unit.eligibleSlots.filter((slot) => result.used[slot] < result.slots.unitSlots[slot])
          return { item, unit, taken, slots, chosen: selectedIds.has(item.id) }
        })
        if (!rows.length) return <p className="muted">No formations have been recruited into the Company pool.</p>
        const q = poolQuery.trim().toLowerCase()
        const slotKinds = [...new Set(rows.flatMap((r) => r.unit?.eligibleSlots ?? []))]
        const shown = rows.filter((r) => !r.unit
          || ((!q || r.unit.name.toLowerCase().includes(q) || r.unit.tags.some((t) => t.toLowerCase().includes(q)))
            && (!poolSlot || r.unit.eligibleSlots.includes(poolSlot))
            && (!poolAvailableOnly || r.chosen || (!r.taken && r.slots.length))))
        return <>
          <div className="pool-filters">
            <input type="search" placeholder="Search name or tag…" aria-label="Search owned formations" value={poolQuery} onChange={(e) => setPoolQuery(e.target.value)} />
            <select aria-label="Filter by slot" value={poolSlot} onChange={(e) => setPoolSlot(e.target.value)}>
              <option value="">All slots</option>
              {slotKinds.map((s) => <option key={s} value={s}>{labelSlot(s)}</option>)}
            </select>
            <label className="choice"><input type="checkbox" checked={poolAvailableOnly} onChange={(e) => setPoolAvailableOnly(e.target.checked)} />Available only</label>
          </div>
          <p className="muted small">{shown.length} of {rows.length} formations</p>
          <ul className="saved-list pool-list">{shown.map(({ item, unit, taken, slots, chosen }) => {
            if (!unit) return <li key={item.id}>Unsupported formation ({item.config?.key})</li>
            return <li key={item.id}>
              <div>
                <strong>{unit.name}</strong> <span className="muted small">{unit.points} pts · {unit.models} Models{taken ? ' · Selected by another PC' : ''}</span>
                <Chips unit={unit} />
              </div>
              <div className="saved-actions">{chosen ? <span className="ok">Selected</span> : <button disabled={taken || !slots.length} onClick={() => add(item.id, slots[0])}>{taken ? 'In use' : slots.length ? 'Deploy' : 'No slot'}</button>}</div>
            </li>
          })}</ul>
        </>
      })()}
    </section></div>}
    {!isGm && activeArmyPage === 'doctrine' && campaign.act >= 3 && (() => {
      const maxCommands = allowedDoctrineCommands(campaign, entitlements[user.uid])
      const chosenDoctrine = result.slots.doctrine
      const toggle = (name) => setDraft((d) => ({ ...d, commands: d.commands.includes(name) ? d.commands.filter((s) => s !== name) : [...d.commands, name] }))
      return <div className="army-draft doctrine-page span-all">
        <section className="panel">
          <h2>Choose your Doctrine</h2>
          <p className="muted small">Your Doctrine is personal. It adds a foundation slot, and its Commands add more slots to your detachment. Changing it clears your chosen Commands.</p>
          <div className="doctrine-list panel-scroll" role="radiogroup" aria-label="Doctrine">
            {catalog.doctrines.map((d) => {
              const on = draft.doctrineId === d.id
              return <label key={d.id} className={`pick-card slot-${d.foundationSlot} ${on ? 'on' : ''}`}>
                <input type="radio" name="doctrine" checked={on} onChange={() => setDraft({ ...draft, doctrineId: d.id, commands: [] })} />
                <div>
                  <div className="pick-head"><strong>{d.name}</strong><span className={`tag slot-chip slot-${d.foundationSlot}`} title="Foundation slot">{labelSlot(d.foundationSlot)} foundation</span></div>
                  {d.strategy && <p className="muted small">{d.strategy}</p>}
                </div>
              </label>
            })}
          </div>
          {draft.doctrineId && <button type="button" onClick={() => setDraft({ ...draft, doctrineId: null, commands: [] })}>Clear Doctrine</button>}
        </section>
        <section className="panel">
          <h2>Commands <span className="muted small">{draft.commands.length} / {maxCommands} chosen</span></h2>
          {!chosenDoctrine ? <p className="muted">Choose a Doctrine to see its Commands.</p> : <>
            <p className="muted small">Each Command you take adds a recruitment slot of the type shown.</p>
            <div className="doctrine-list panel-scroll">
              {chosenDoctrine.commands.map((command) => {
                const on = draft.commands.includes(command.name)
                const locked = !on && draft.commands.length >= maxCommands
                return <label key={command.name} className={`pick-card slot-${command.slot} ${on ? 'on' : ''} ${locked ? 'locked' : ''}`}>
                  <input type="checkbox" checked={on} disabled={locked} onChange={() => toggle(command.name)} />
                  <div>
                    <div className="pick-head"><strong>{command.name}</strong><span className={`tag slot-chip slot-${command.slot}`} title="Slot gained">+{labelSlot(command.slot)} slot</span></div>
                    {command.timing && <div className="muted small">{command.timing}</div>}
                    {command.effect && <p className="small">{command.effect}</p>}
                  </div>
                </label>
              })}
            </div>
          </>}
          {draftState?.dirty && !draftState?.conflict && <p className="muted small">Unsaved changes</p>}
          {draftState?.conflict && <p className="bad small">Someone else changed this detachment; review the Detachment tab before saving.</p>}
          <button className="primary" disabled={saving || !result.legal || draftState?.conflict} onClick={() => perform(() => saveDetachment(campaign.id, user.uid, draft))}>Save legal detachment</button>
          {!result.legal && <p className="muted small">Can't save yet: {result.errors[0]}</p>}
        </section>
      </div>
    })()}
    {!isGm && activeArmyPage === 'roster' && campaign.act >= 2 && (() => {
      const holders = holdersOf(detachments, user.uid, draft.selections)
      const nameOf = (uid) => uid === user.uid ? 'You' : heroes.find((h) => h.ownerUid === uid)?.sheet?.name ?? uid.slice(0, 7)
      const items = inventory.filter((item) => item.kind === 'unit')
      const byId = new Map(items.map((item) => [item.id, item]))
      const unitOf = (item) => { const entry = catalog.unitsByKey[item.config?.key]; return entry ? resolveUnit(entry, item.config, item.factionId) : null }
      const players = (campaign.memberUids ?? []).filter((uid) => uid !== campaign.gmUid)
      const deployed = players.map((uid) => {
        const units = [...holders].filter(([, h]) => h.uid === uid).map(([id, h]) => ({ item: byId.get(id), slot: h.slot })).filter((x) => x.item)
          .map((x) => ({ ...x, unit: unitOf(x.item) })).filter((x) => x.unit)
        return { uid, units, points: units.reduce((sum, x) => sum + (x.unit.points ?? 0), 0) }
      })
      return <section className="panel span-all">
        <h2>Company Roster</h2>
        <p className="muted small">Inspect the Company’s owned formations, selected upgrades and combat profiles. Recruiting is handled in Company &amp; Projects. Each formation is shared, but can be deployed by only one PC at a time. Identical formations are grouped.</p>
        <h3>Who has what</h3>
        <div className="deploy-row">
          {deployed.map(({ uid, units, points }) => <div key={uid} className={`deploy-card ${uid === user.uid ? 'mine' : ''}`}>
            <div className="deploy-head"><strong>{nameOf(uid)}</strong><span className="muted small">{units.length} {units.length === 1 ? 'formation' : 'formations'} · {points} pts</span></div>
            {units.length ? <ul className="plain-list">{units.map(({ item, unit, slot }) => <li key={item.id} className="small">
              <span className={`tag slot-chip slot-${slot}`}>{labelSlot(slot)}</span> {unit.name}
            </li>)}</ul> : <p className="muted small">Nothing drafted</p>}
            {uid === user.uid && draftState?.dirty && <p className="muted small">Includes unsaved changes</p>}
          </div>)}
        </div>
        <h3>Owned formations</h3>
        <div className="army-roster-cards">
          {groupRoster(items).map(({ signature, items: copies }) => {
            const unit = unitOf(copies[0])
            if (!unit) return <div className="army-roster-entry bad" key={signature}>Unknown formation: {copies[0].config?.key || 'missing profile'}</div>
            const { detailed, applied } = splitOptions(unit)
            const taken = copies.filter((c) => holders.has(c.id))
            const free = copies.length - taken.length
            return <article key={signature} className="army-roster-entry">
              <div className="roster-head">
                <strong>{unit.name}{copies.length > 1 && <span className="roster-count"> ×{copies.length}</span>}</strong>
                <span className="roster-pts">{unit.points} pts{copies.length > 1 ? ' each' : ''}</span>
              </div>
              <div className="muted small">{unit.models} Models · <span className={free ? 'ok' : ''}>{copies.length > 1 ? `${free} of ${copies.length} available` : free ? 'Available' : 'Deployed'}</span></div>
              {!!taken.length && <div className="holder-row">{taken.map((c) => {
                const h = holders.get(c.id)
                return <span key={c.id} className={`tag holder ${h.uid === user.uid ? 'mine' : ''}`}>{nameOf(h.uid)} · {labelSlot(h.slot)}</span>
              })}</div>}
              <Chips unit={unit} />
              <p className="muted small roster-stats">{formatStats(unit.stats)}</p>
              {!!unit.attacks.length && <ul className="plain-list roster-list">{unit.attacks.map((attack, i) => <li key={i} className="small"><strong>{attack.name}</strong> {formatProfile(attack)}</li>)}</ul>}
              {!!unit.abilities.length && <ul className="plain-list roster-list">{unit.abilities.map((a, i) => <li key={i} className="small"><strong>{a.name}</strong> — {a.effect}</li>)}</ul>}
              {!!detailed.length && <ul className="plain-list roster-list">{detailed.map((o, i) => <li key={i} className="small"><strong>{o.name}</strong> — {o.effect ?? optionBrief(o)}</li>)}</ul>}
              {!!applied.length && <p className="muted small">Upgrades: {applied.join(', ')}</p>}
              {!!unit.missingTags.length && <p className="bad small">Unresolved Anti-type choices: {unit.missingTags.join(', ')}</p>}
            </article>
          })}
        </div>
        {!items.length && <p className="muted">No formations have been acquired yet. Purchase them in Company &amp; Projects after your Patron unlocks recruitment.</p>}
      </section>
    })()}
    {isGm && <section className="panel">
      <h2>GM — Manage Company formations</h2>
      <p className="muted small">These are free administrative/Patron/reward grants with no Gold charge. Use Company & Projects for paid recruitment proposals; GM approval there deducts Gold and adds the formation automatically.</p>
      {!canRecruit && <p className="bad" role="status">{campaign.act < 2 ? 'Formations can be granted once the campaign reaches Act II (complete every Turn of Act I in GM Controls).' : 'Choose a sponsoring faction in GM Controls → Progression before granting formations.'}</p>}
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
      <ul className="saved-list panel-scroll">{inventory.filter((i) => i.kind === 'unit').map((i) => <li key={i.id}><span>{catalog.unitsByKey[i.config?.key]?.name ?? i.config.key}</span><button className="danger" disabled={saving || detachments.some((d) => d.selections?.some((s) => s.id === i.id))} onClick={() => perform(() => removeInventoryItem(campaign.id, i.id))}>Remove</button></li>)}</ul>
    </section>}
    {isGm && <section className="panel">
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
      <ul className="saved-list panel-scroll">{inventory.filter((i) => i.kind === 'equipment').map((i) => <li key={i.id}>
        <span>{i.item?.name} <span className="muted small">({i.item?.kind})</span></span>
        <button disabled={saving || heroes.some((h) => h.sheet?.gear?.some((g) => g.inventoryId === i.id))} className="danger" onClick={() => perform(() => removeInventoryItem(campaign.id, i.id))}>Remove</button>
      </li>)}</ul>
    </section>}
    {isGm && <section className="panel">
      <h2>GM — Personal detachment upgrades</h2>
      <p className="muted small">Each PC inherits the sponsoring faction's two ordinary foundation slots. Paid Flex slots should be acquired through Company & Projects for 2 Gold each; controls below are GM overrides for corrections or narrative awards. Grand's third Doctrine Command requires its separate unlock.</p>
      {campaign.memberUids.filter((uid) => uid !== campaign.gmUid).map((uid) => {
        const current = entitlementDrafts[uid] ?? acceptSnapshot(null, { flexSlots: [], grandThirdCommand: false })
        const entitlement = current.value
        return <div key={uid} className="group">
          <div className="group-label">{heroes.find((h) => h.ownerUid === uid)?.sheet?.name ?? uid.slice(0, 8)}</div>
          {current.conflict && <div className="bad small">Entitlement updated in another session. <button onClick={() => setEntitlementDrafts((p) => ({ ...p, [uid]: discardDraft(p[uid]) }))}>Load saved entitlement</button></div>}
          <label className="field">Flex slot 1<select value={entitlement.flexSlots?.[0] ?? ''} onChange={(e) => editEntitlement(uid, {
            flexSlots: [e.target.value, entitlement.flexSlots?.[1] ?? ''].filter(Boolean),
          })}><option value="">None</option>{FIELD_SLOTS.map((slot) => <option key={slot} value={slot}>{labelSlot(slot)}</option>)}</select></label>
          <label className="field">Flex slot 2<select value={entitlement.flexSlots?.[1] ?? ''} onChange={(e) => editEntitlement(uid, {
            flexSlots: [entitlement.flexSlots?.[0] ?? '', e.target.value].filter(Boolean),
          })}><option value="">None</option>{FIELD_SLOTS.map((slot) => <option key={slot} value={slot}>{labelSlot(slot)}</option>)}</select></label>
          {campaign.format === 'grand' && <label className="choice"><input type="checkbox" checked={!!entitlement.grandThirdCommand} onChange={(e) => editEntitlement(uid, { grandThirdCommand: e.target.checked })} />Grand third Doctrine Command unlocked</label>}
          <button disabled={saving || current.conflict} onClick={() => perform(() => setEntitlement(campaign.id, uid, entitlement))}>Save entitlement</button>
        </div>
      })}
    </section>}
  </div>
}
