import { useState } from 'react'
import { ChoiceSelect } from './MagicItemsTab.jsx'

const ENCHANTABLE = ['melee', 'ranged', 'armor', 'shield']
const KIND_LABEL = { melee: 'Melee weapon', ranged: 'Ranged weapon', armor: 'Armor', shield: 'Shield' }

function EnchantCard({ item, view, data, update }) {
  const [pick, setPick] = useState('')
  const patchItem = (fn) => update((c) => ({ gear: c.gear.map((g) => (g.uid === item.uid ? { ...g, enchants: fn(g.enchants ?? []) } : g)) }))
  const patchEnchant = (key, changes) => patchItem((list) => list.map((e) => (e.key === key ? { ...e, ...changes } : e)))
  const taken = new Set((item.enchants ?? []).map((e) => e.key))
  const groups = data.magic.enchantGroups
    .map((g) => ({ ...g, entries: g.entries.filter((e) => e.allowed?.includes(item.kind) && !taken.has(e.key)) }))
    .filter((g) => g.entries.length)
  const picked = data.magic.byKey.get(pick)
  const total = item.enchantList.reduce((sum, e) => sum + e.points, 0)

  const add = () => {
    if (!picked) return
    patchItem((list) => [...list, { key: picked.key, ...(picked.custom ? { points: 15, cmdName: '', cmdText: '' } : {}) }])
    setPick('')
  }

  return (
    <section className="panel">
      <h2>
        {item.name} <span className="muted small">{KIND_LABEL[item.kind]} · {item.def.points} pts{total ? ` + ${total} enchanted` : ''}</span>
        {!item.equipped && <span className="tag">not equipped</span>}
      </h2>
      {!item.enchantList.length && <p className="muted small">No enchantments yet.</p>}
      <ul className="plain-list">
        {item.enchantList.map((e) => (
          <li key={e.key} className="enchant-row">
            <div>
              <strong>{e.entry.name}</strong> <span className="muted small">{e.points} pts</span>
              {e.entry.effect && <div className="small">{e.entry.effect}</div>}
              {e.entry.command && <div className="small"><span className="tag tag-spell">Command</span><strong>{e.entry.command.name}</strong> <span className="muted">{e.entry.command.cost}</span></div>}
              {e.entry.choice && <ChoiceSelect choice={e.entry.choice} value={e.choice} view={view} onChange={(choice) => patchEnchant(e.key, { choice })} />}
              {e.entry.custom && (
                <div className="custom-command">
                  <label className="field">Points (15–25)<input type="number" min="15" max="25" value={e.points} onChange={(ev) => patchEnchant(e.key, { points: Number(ev.target.value) })} /></label>
                  <label className="field">Command name<input value={e.cmdName ?? ''} maxLength={40} onChange={(ev) => patchEnchant(e.key, { cmdName: ev.target.value })} /></label>
                  <label className="field">What it does<input value={e.cmdText ?? ''} maxLength={200} onChange={(ev) => patchEnchant(e.key, { cmdText: ev.target.value })} /></label>
                </div>
              )}
            </div>
            <button className="danger" onClick={() => patchItem((list) => list.filter((x) => x.key !== e.key))}>Remove</button>
          </li>
        ))}
      </ul>
      <div className="enchant-add">
        <select value={pick} onChange={(e) => setPick(e.target.value)} aria-label={`Add an enchantment to ${item.name}`}>
          <option value="">Add an enchantment…</option>
          {groups.map((g) => (
            <optgroup key={g.id} label={g.label}>
              {g.entries.map((e) => <option key={e.key} value={e.key}>{e.name} (+{e.custom ? '15–25' : e.points})</option>)}
            </optgroup>
          ))}
        </select>
        <button className="primary" disabled={!picked} onClick={add}>Enchant</button>
      </div>
      {picked && (
        <p className="small">
          {picked.effect ?? 'Rules text for this enchantment is on its Command.'}
          {picked.command && <> <span className="tag tag-spell">Command</span><strong>{picked.command.name}</strong> {picked.command.effect}</>}
        </p>
      )}
    </section>
  )
}

// Enchantments are attached to a specific weapon, armor or shield and cost Points on top of it.
export default function EnchantmentsTab({ data, view, update }) {
  const items = view.gear.filter((g) => ENCHANTABLE.includes(g.kind))
  return (
    <div className="panel-grid">
      <section className="panel span-all">
        <h2>Enchantments</h2>
        <p className="muted small">
          Enchantments add their Points to the item they are on, while it is equipped, and an item cannot take the same enchantment twice.
          Weapon enchantments change that weapon's attack on the Stats and Sheet tabs, and armor and shield ones change your stats. Their Commands appear on the Sheet and use no prepared slots.
        </p>
        {!items.length && <p className="muted">Add a weapon, armor or Shield on the Equipment tab first, then enchant it here.</p>}
      </section>
      {items.map((g) => <EnchantCard key={g.uid} item={g} view={view} data={data} update={update} />)}
    </div>
  )
}
