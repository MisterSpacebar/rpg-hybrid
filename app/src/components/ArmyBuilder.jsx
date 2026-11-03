import { Fragment, useState } from 'react'
import {
  SLOT_ORDER, emptyArmy, firstOpenSlot, groupLimit, newUnitConfig, resolveUnit, visibleGroups,
} from '../builder/engine.js'
import { optionBrief } from '../builder/format.js'
import { ANTI_TAGS } from '../builder/modifiers.js'
import { AbilityLines, AttackLines, StatStrip } from './StatStrip.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { saveArmy } from '../builder/cloud.js'
import { SignInButton } from './UserMenu.jsx'

const toggle = (list, value, max) =>
  list.includes(value) ? list.filter((v) => v !== value) : list.length < max ? [...list, value] : list

function SlotBadge({ slot, dim }) {
  return <span className={`slot slot-${slot} ${dim ? 'dim' : ''}`}>{slot}</span>
}

// ---------- centre: Faction and Doctrines ----------

function CommandChoice({ command, checked, onChange }) {
  return (
    <label className="choice" title={command.effect}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <SlotBadge slot={command.slot} />
      <span className="cmd-name">{command.name}<span className="muted small">{command.timing}</span></span>
    </label>
  )
}

function Setup({ army, setArmy, catalog, view }) {
  const { standardArmy: limits } = catalog.rules
  const update = (patch) => setArmy((a) => ({ ...a, ...patch }))

  const chooseFaction = (id) =>
    setArmy((a) => ({
      ...a,
      factionId: id || null,
      factionCommands: [],
      units: a.units.filter((u) => !u.key.startsWith('faction:') || u.key.startsWith(`faction:${id}:`)),
    }))

  const chooseDoctrine = (i, id) =>
    setArmy((a) => {
      const doctrineIds = [...a.doctrineIds]
      const old = doctrineIds[i]
      doctrineIds[i] = id || null
      const doctrineCommands = { ...a.doctrineCommands }
      if (old) delete doctrineCommands[old]
      return { ...a, doctrineIds, doctrineCommands }
    })

  return (
    <section className="panel">
      <h2>Faction &amp; Doctrines</h2>
      <div className="setup-grid">
        <div>
          <label className="field">
            Faction
            <select value={army.factionId ?? ''} onChange={(e) => chooseFaction(e.target.value)}>
              <option value="">Choose a Faction…</option>
              {catalog.factions.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </label>
          {view.faction && (
            <>
              <p className="muted small">
                <strong>{view.faction.rule.name}:</strong> {view.faction.rule.effect}
              </p>
              <p className="small">Foundation: {view.faction.foundationSlots.map((s, i) => <SlotBadge key={i} slot={s} />)}</p>
              <h3>Commands <span className="muted">({army.factionCommands.length}/{limits.factionCommandsSelected})</span></h3>
              {view.faction.commands.map((c) => (
                <CommandChoice key={c.name} command={c} checked={army.factionCommands.includes(c.name)}
                  onChange={() => update({ factionCommands: toggle(army.factionCommands, c.name, limits.factionCommandsSelected) })} />
              ))}
            </>
          )}
        </div>

        {[0, 1].map((i) => {
          const d = view.doctrines[i]
          const chosen = d ? army.doctrineCommands[d.id] ?? [] : []
          return (
            <div key={i}>
              <label className="field">
                Doctrine {i + 1}
                <select value={army.doctrineIds[i] ?? ''} onChange={(e) => chooseDoctrine(i, e.target.value)}>
                  <option value="">Choose a Doctrine…</option>
                  {catalog.doctrines.map((x) => (
                    <option key={x.id} value={x.id} disabled={army.doctrineIds.includes(x.id) && army.doctrineIds[i] !== x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              {d && (
                <>
                  <p className="muted small">{d.strategy}</p>
                  <p className="small">Foundation: <SlotBadge slot={d.foundationSlot} /></p>
                  <h3>Commands <span className="muted">({chosen.length}/{limits.doctrineCommandsSelectedPerDoctrine})</span></h3>
                  {d.commands.map((c) => (
                    <CommandChoice key={c.name} command={c} checked={chosen.includes(c.name)}
                      onChange={() =>
                        update({
                          doctrineCommands: {
                            ...army.doctrineCommands,
                            [d.id]: toggle(chosen, c.name, limits.doctrineCommandsSelectedPerDoctrine),
                          },
                        })
                      } />
                  ))}
                </>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ---------- sidebar ----------

// A box for every Recruitment Slot the army has; boxes light up as Units claim them.
function SlotRack({ view, onRemove }) {
  return (
    <div className="rack">
      {SLOT_ORDER.map((slot) => {
        const units = view.units.filter((u) => u.slot === slot)
        const sources = view.slots.sources.filter((s) => s.slot === slot)
        const count = Math.max(view.slots.available[slot], units.length)
        if (!count) return null
        return (
          <div key={slot} className="rack-group">
            {Array.from({ length: count }, (_, i) => {
              const unit = units[i]
              const over = i >= view.slots.available[slot]
              return (
                <div
                  key={i}
                  className={`rack-box slot-${slot} ${unit ? 'lit' : ''} ${over ? 'over' : ''}`}
                  title={unit ? `Click to remove ${unit.name}` : over ? `${slot}: no slot available` : `${slot} from ${sources[i]?.source}`}
                  onClick={unit ? () => onRemove(unit.uid) : undefined}
                >
                  <span className="rack-letter">{slot}</span>
                  <span className="rack-unit">{unit ? unit.name : ''}</span>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// Only unmet requirements are listed; the ones already satisfied are tucked into a collapsed list.
function Checks({ view }) {
  const failing = view.checks.filter((c) => !c.ok)
  const passing = view.checks.filter((c) => c.ok)
  return (
    <div className="checks-wrap">
      {failing.length === 0 ? (
        <p className="ok legal">✓ Army is legal</p>
      ) : (
        <ul className="checks">
          {failing.map((c) => (
            <li key={c.id} className="bad">
              <span>✗</span> {c.label} <span className="muted small">{c.detail}</span>
            </li>
          ))}
        </ul>
      )}
      <details className="checks-done" open>
        <summary>{passing.length} of {view.checks.length} requirements met</summary>
        <ul className="checks">
          {passing.map((c) => (
            <li key={c.id} className="ok">
              <span>✓</span> {c.label} <span className="muted small">{c.detail}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
// Saving to the account is explicit, which keeps writes (and cost) to one per Save.
// The button sits beside the points and its status is a single line, so the sidebar stays short.
function useSave({ army, view, markSaved }) {
  const { user, loading } = useAuth()
  const [state, setState] = useState('idle')
  const save = async (asNew) => {
    setState('saving')
    try {
      const id = await saveArmy(user.uid, asNew ? { ...army, cloudId: null } : army, { points: view.points })
      markSaved(id)
      setState('saved')
    } catch (err) {
      console.error(err)
      setState('error')
    }
  }
  return { user, loading, state, save }
}

function SaveStatus({ army, dirty, user, state, save }) {
  if (!user) return <span className="muted">Sign in to save to your account. Kept in this browser meanwhile.</span>
  if (state === 'error') return <span className="bad">Could not save. Check your connection.</span>
  if (army.cloudId && !dirty) {
    return (
      <span className="ok">
        ✓ Saved to your account · <button className="linkish" onClick={() => save(true)}>Save as new</button>
      </span>
    )
  }
  if (army.cloudId) {
    return (
      <span className="muted">
        Unsaved changes · <button className="linkish" onClick={() => save(true)}>Save as new</button>
      </span>
    )
  }
  return <span className="muted">Not saved to your account yet</span>
}

function Sidebar({ army, setArmy, view, dirty, markSaved }) {
  const [removed, setRemoved] = useState(null)
  const removeUnit = (uid) => {
    const index = army.units.findIndex((u) => u.uid === uid)
    if (index < 0) return
    setRemoved({ cfg: army.units[index], index, name: view.units.find((u) => u.uid === uid)?.name })
    setArmy((a) => ({ ...a, units: a.units.filter((u) => u.uid !== uid) }))
  }
  const undo = () => {
    setArmy((a) => {
      const units = [...a.units]
      units.splice(Math.min(removed.index, units.length), 0, removed.cfg)
      return { ...a, units }
    })
    setRemoved(null)
  }
  const reset = () => {
    if (!army.units.length || window.confirm('Start a new army? Anything not saved to your account will be cleared.')) setArmy(emptyArmy())
  }
  const { user, loading, state, save: doSave } = useSave({ army, view, markSaved })
  return (
    <aside className="builder-side panel">
      <input className="army-name" value={army.name} onChange={(e) => setArmy((a) => ({ ...a, name: e.target.value }))} />
      <div className="side-row">
        <div className={`points ${view.points > view.limits.maxPoints ? 'bad' : ''}`}>
          {view.points} <span className="muted">/ {view.limits.maxPoints}</span>
        </div>
        <div className="side-buttons">
          {!loading && (user ? (
            <button className="primary" disabled={state === 'saving' || (!!army.cloudId && !dirty)} onClick={() => doSave(false)}>
              {state === 'saving' ? 'Saving…' : army.cloudId ? 'Save changes' : 'Save'}
            </button>
          ) : (
            <SignInButton label="Sign in" />
          ))}
          <button onClick={reset} title="Start a new army">New</button>
        </div>
      </div>
      <div className="side-status small">
        {!loading && <SaveStatus army={army} dirty={dirty} user={user} state={state} save={doSave} />}
      </div>
      <div className="slot-count muted small">{view.units.length} of {view.slots.total} Recruitment Slots used</div>
      <SlotRack view={view} onRemove={removeUnit} />
      {removed && (
        <div className="undo small">
          Removed {removed.name}. <button onClick={undo}>Undo</button>
        </div>
      )}
      <Checks view={view} />
    </aside>
  )
}

// ---------- unit lists ----------

function UnitGrid({ units, view, army, onAdd, emptyText }) {
  const full = (s) => view.used[s] >= view.slots.available[s]
  if (!units.length) return <p className="muted small">{emptyText}</p>
  return (
    <ul className="picker">
      {units.map((u) => {
        const taken = u.unique && army.units.some((x) => x.key === u.key)
        const base = resolveUnit(u, newUnitConfig(u, u.slots[0]), view.faction?.id)
        return (
          <li key={u.key}>
            <div className="picker-main">
              <strong>{u.name}</strong>{' '}
              <span className="muted small">{u.category} · {u.baseModels > 1 ? `${u.baseModels} Models · ` : ''}{u.basePoints} pts</span>
              <div>
                {u.slots.map((sl) => <SlotBadge key={sl} slot={sl} dim={full(sl)} />)}
                {u.isCore && <span className="tag">Core</span>}
                {u.isHero && <span className="tag">Hero</span>}
              </div>
              <StatStrip stats={base.stats} impact={base.impact} />
              <AttackLines attacks={base.attacks} />
              <AbilityLines entry={u} />
            </div>
            <button disabled={taken} onClick={() => onAdd(u)}>{taken ? 'Added' : 'Add'}</button>
          </li>
        )
      })}
    </ul>
  )
}

// Hunters, Master Hunter and Weapon Specialization: pick the tag (and, for a single weapon, which weapon) the Anti-[Type] applies to.
function TagChoice({ option, cfg, attacks, onChange }) {
  const current = cfg.tagPicks?.[option.id] ?? {}
  const set = (changes) => onChange({ tagPicks: { ...cfg.tagPicks, [option.id]: { ...current, ...changes } } })
  const weapons = [...new Set(attacks.map((a) => a.name))]
  return (
    <div className="tag-choice">
      <label>
        Anti-[Type] against{' '}
        <select value={current.tag ?? ''} className={current.tag ? '' : 'needs-choice'} onChange={(e) => set({ tag: e.target.value || undefined })}>
          <option value="">Choose a tag…</option>
          {ANTI_TAGS.map((t) => <option key={t} value={t}>{t} {option.tagChoice.rank}</option>)}
        </select>
      </label>
      {option.tagChoice.scope === 'weapon' && weapons.length > 1 && (
        <label>
          On weapon{' '}
          <select value={current.weapon ?? ''} onChange={(e) => set({ weapon: e.target.value || undefined })}>
            <option value="">Primary melee</option>
            {weapons.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </label>
      )}
    </div>
  )
}

function UnitCard({ entry, cfg, view, onChange, onRemove, onDuplicate }) {
  const r = resolveUnit(entry, cfg, view.faction?.id)
  const groups = visibleGroups(entry, cfg)
  // Gaining Hero (Heroic Commission, Master Wizard) moves the Unit from E to H on the slot tracker; losing it moves it back.
  const setPick = (groupId, value) => {
    const next = { ...cfg, picks: { ...cfg.picks, [groupId]: value } }
    const before = resolveUnit(entry, cfg, view.faction?.id)
    const after = resolveUnit(entry, next, view.faction?.id)
    let slot = next.slot
    if (after.isHero && !before.isHero && after.eligibleSlots.includes('H')) slot = 'H'
    else if (!after.eligibleSlots.includes(slot)) slot = after.eligibleSlots[0]
    onChange({ picks: next.picks, ...(slot !== cfg.slot ? { slot } : {}) })
  }

  return (
    <li className={`unit slot-${cfg.slot}`}>
      <header>
        <div>
          <strong>{r.name}</strong> <span className="muted small">{r.category}{r.models > 1 ? ` · ${r.models} Models` : ''}</span>
          <div>
            {r.isCore && <span className="tag">Core</span>}
            {r.isHero && <span className="tag">Hero</span>}
            {r.isLeader && <span className="tag">Leader</span>}
            {r.isLargeAsset && <span className="tag">Large Asset</span>}
          </div>
        </div>
        <div className="unit-points">{r.points} pts{r.pointsVary && <span title="Some selected options have a variable cost; check the rules"> *</span>}</div>
      </header>

      <StatStrip stats={r.stats} impact={r.impact} models={r.models} changed={r.changedStats} base={r.baseStats} factionChanged={r.factionChanged} factionRule={r.factionRule} />
      <AttackLines attacks={r.attacks} />
      <AbilityLines entry={entry} />

      <div className="unit-controls">
        <label>
          Slot{' '}
          <select value={cfg.slot} onChange={(e) => onChange({ slot: e.target.value })}>
            {r.eligibleSlots.map((s) => (
              <option key={s} value={s}>{s}{view.used[s] >= view.slots.available[s] && s !== cfg.slot ? ' (full)' : ''}</option>
            ))}
          </select>
        </label>
        {entry.maxModels > entry.baseModels && (
          <label>
            Models{' '}
            <input type="number" min={entry.baseModels} max={entry.maxModels} value={cfg.models}
              onChange={(e) => onChange({ models: Number(e.target.value) })} />
          </label>
        )}
        {entry.canDouble && (
          <label>
            <input type="checkbox" checked={cfg.doubled} onChange={(e) => onChange({ doubled: e.target.checked })} /> Double Formation
          </label>
        )}
      </div>

      {groups.map((g) => {
        const current = g.options.find((o) => o.id === cfg.picks[g.id])
        const limit = groupLimit(entry, g, cfg)
        const picked = g.kind === 'check' ? (cfg.picks[g.id] ?? []).slice(0, limit) : []
        return (
          <div key={g.id} className="group">
            <div className="group-label">
              {g.label}
              {Number.isFinite(limit) && limit > 1 && (
                <span className="muted small"> ({g.kind === 'check' && g.limit ? `${picked.length} of ${limit}` : `up to ${limit}`})</span>
              )}
            </div>
            {g.kind === 'radio' ? (
              <>
                <select value={cfg.picks[g.id] ?? ''} onChange={(e) => setPick(g.id, e.target.value || null)}>
                  {!g.required && <option value="">None</option>}
                  {g.options.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}{o.points ? ` (+${o.points})` : ''}</option>
                  ))}
                </select>
                {current && optionBrief(current) && <div className="brief">{optionBrief(current)}</div>}
              </>
            ) : (
              g.options.map((o) => {
                const count = picked.filter((id) => id === o.id).length
                return (
                  <Fragment key={o.id}>
                  <label className="choice stack" title={o.effect ?? ''}>
                    {o.each ? (
                      <input type="number" min={0} max={o.maxCount ?? 9} value={count} style={{ width: '3.5em' }}
                        onChange={(e) => {
                          const n = Math.min(Math.max(Number(e.target.value) || 0, 0), o.maxCount ?? 9)
                          setPick(g.id, [...picked.filter((id) => id !== o.id), ...Array(n).fill(o.id)])
                        }} />
                    ) : (
                      <input type="checkbox" checked={count > 0}
                        onChange={() => setPick(g.id, toggle(picked, o.id, limit))} />
                    )}
                    <span>
                      {o.name} <span className="muted small">{o.varies ? '(varies)' : o.points ? `(+${o.points}${o.each ? ' each' : ''})` : ''}</span>
                      {optionBrief(o) && <span className="brief">{optionBrief(o)}</span>}
                    </span>
                  </label>
                  {count > 0 && o.tagChoice && <TagChoice option={o} cfg={cfg} attacks={r.attacks} onChange={onChange} />}
                  </Fragment>
                )
              })
            )}
          </div>
        )
      })}

      <input className="note" placeholder="Notes (shown on the printed card)" value={cfg.note ?? ''}
        onChange={(e) => onChange({ note: e.target.value })} />
      <div className="unit-actions">
        {!entry.unique && <button onClick={onDuplicate}>Duplicate</button>}
        <button className="danger" onClick={onRemove}>Remove</button>
      </div>
    </li>
  )
}

const TABS = [
  { id: 'faction', label: 'Faction Units' },
  { id: 'generic', label: 'Generic Units' },
  { id: 'list', label: 'Army List' },
]

export default function ArmyBuilder({ catalog, army, setArmy, view, dirty, markSaved }) {
  const [tab, setTab] = useState('faction')
  const [query, setQuery] = useState('')

  const addUnit = (entry) =>
    setArmy((a) => ({ ...a, units: [...a.units, newUnitConfig(entry, firstOpenSlot(entry, view))] }))

  const changeUnit = (uid, patch) =>
    setArmy((a) => ({
      ...a,
      units: a.units.map((u) => {
        if (u.uid !== uid) return u
        const next = { ...u, ...patch }
        const entry = catalog.unitsByKey[next.key]
        const eligible = resolveUnit(entry, next).eligibleSlots
        return eligible.includes(next.slot) ? next : { ...next, slot: firstOpenSlot(entry, view, eligible) }
      }),
    }))

  const removeUnit = (uid) => setArmy((a) => ({ ...a, units: a.units.filter((u) => u.uid !== uid) }))

  const duplicateUnit = (cfg) => {
    const entry = catalog.unitsByKey[cfg.key]
    setArmy((a) => ({
      ...a,
      units: [...a.units, { ...structuredClone(cfg), uid: newUnitConfig(entry, cfg.slot).uid, slot: firstOpenSlot(entry, view, resolveUnit(entry, cfg).eligibleSlots) }],
    }))
  }

  const match = (u) => u.name.toLowerCase().includes(query.toLowerCase())

  return (
    <div className="builder">
      <Sidebar army={army} setArmy={setArmy} view={view} dirty={dirty} markSaved={markSaved} />

      <div className="builder-main">
        <Setup army={army} setArmy={setArmy} catalog={catalog} view={view} />

        <section className="panel">
          <nav className="unit-tabs">
            {TABS.map((t) => (
              <button key={t.id} className={t.id === tab ? 'active' : ''} onClick={() => setTab(t.id)}>
                {t.label}
                {t.id === 'list' && <span className="count">{view.units.length}</span>}
              </button>
            ))}
          </nav>

          {tab !== 'list' && (
            <input className="search" placeholder="Search Units…" value={query} onChange={(e) => setQuery(e.target.value)} />
          )}

          {tab === 'faction' && (
            view.faction
              ? <UnitGrid units={view.faction.units.filter(match)} view={view} army={army} onAdd={addUnit} emptyText="No Units match." />
              : <p className="muted small">Choose a Faction above to see its signature Units.</p>
          )}
          {tab === 'generic' && (
            <UnitGrid units={catalog.generic.filter(match)} view={view} army={army} onAdd={addUnit} emptyText="No Units match." />
          )}
          {tab === 'list' && (
            <>
              {!army.units.length && <p className="muted small">No Units yet. Add some from the Faction or Generic tabs.</p>}
              <ul className="units">
                {army.units.map((cfg) => {
                  const entry = catalog.unitsByKey[cfg.key]
                  return entry && (
                    <UnitCard key={cfg.uid} entry={entry} cfg={cfg} view={view}
                      onChange={(patch) => changeUnit(cfg.uid, patch)}
                      onRemove={() => removeUnit(cfg.uid)}
                      onDuplicate={() => duplicateUnit(cfg)} />
                  )
                })}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  )
}