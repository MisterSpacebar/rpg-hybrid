import { useState } from 'react'
import { formatProfile } from '../builder/format.js'
import { newGearItem } from '../character/engine.js'
import EnchantmentsTab from './EnchantmentsTab.jsx'
import MagicItemsTab from './MagicItemsTab.jsx'
import { FormulasTab, SpellsTab } from './SpellsTab.jsx'

const suggestedNames = (cls, sub) =>
  new Set([
    ...(sub.combatPhaseWeapons?.options ?? []).map((o) => o.name),
    ...(sub.assaultPhaseWeapons?.options ?? []).map((o) => o.name),
    ...(cls.startingEquipment ? [cls.startingEquipment.assaultPhaseOption?.name, ...cls.startingEquipment.combatPhaseOptions.map((o) => o.name)] : []),
    ...(sub.optionalEquipment ?? []).map((o) => o.name),
  ])

function WeaponTable({ title, weapons, kind, owned, suggested, onAdd }) {
  const categories = [...new Set(weapons.map((w) => w.category))]
  return (
    <section className="panel">
      <h2>{title}</h2>
      {categories.map((cat) => (
        <div key={cat} className="group">
          <div className="group-label">{cat}</div>
          <ul className="picker one-col">
            {weapons.filter((w) => w.category === cat).map((w) => {
              const has = owned.some((g) => g.kind === kind && g.name === w.name)
              return (
                <li key={w.name}>
                  <div className="picker-main">
                    <strong>{w.name}</strong> <span className="muted small">{w.points} pts</span>
                    {suggested.has(w.name) && <span className="tag tag-suggested" title="Suggested by your Class or Subclass">suggested</span>}
                    <div className="muted small">{formatProfile(w.profile)}{w.combatProfile ? ` · also melee: ${formatProfile(w.combatProfile)}` : ''}</div>
                  </div>
                  <button disabled={has} onClick={() => onAdd(kind, w.name)}>{has ? 'Owned' : 'Add'}</button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}

function Equipment({ data, character, view, update }) {
  const [custom, setCustom] = useState({ name: '', points: '' })
  const suggested = suggestedNames(view.cls, view.sub)
  const access = data.armorAccess.find((a) => a.class === view.cls.name)?.normalArmorAccess

  const setGear = (fn) => update((c) => ({ gear: fn(c.gear) }))
  const add = (kind, name, extra) =>
    setGear((gear) => {
      // Only one armor and one Shield can be worn at a time, so a new one replaces the equipped one.
      const base = kind === 'armor' || kind === 'shield' ? gear.map((g) => (g.kind === kind ? { ...g, equipped: false } : g)) : gear
      return [...base, newGearItem(kind, name, extra)]
    })
  const toggleEquipped = (item) =>
    setGear((gear) =>
      gear.map((g) => {
        if (g.uid === item.uid) return { ...g, equipped: !g.equipped }
        return !item.equipped && (item.kind === 'armor' || item.kind === 'shield') && g.kind === item.kind ? { ...g, equipped: false } : g
      }),
    )
  const remove = (item) => setGear((gear) => gear.filter((g) => g.uid !== item.uid))

  const addCustom = (e) => {
    e.preventDefault()
    if (!custom.name.trim()) return
    add('custom', custom.name.trim().slice(0, 60), { points: Math.max(0, Number(custom.points) || 0) })
    setCustom({ name: '', points: '' })
  }

  return (
    <div className="panel-grid">
      <section className="panel">
        <h2>Carried gear <span className="muted">({view.points.gear} pts equipped)</span></h2>
        <p className="muted small">Only equipped items add Points and appear on the Stats and Sheet tabs. Equipment does not cost XP.</p>
        {!view.gear.length && <p className="muted">Nothing yet. Add weapons, armor or a Shield below.</p>}
        <ul className="saved-list">
          {view.gear.filter((g) => !['focus', 'artifact', 'relic'].includes(g.kind)).map((g) => (
            <li key={g.uid}>
              <label className="choice">
                <input type="checkbox" checked={g.equipped} onChange={() => toggleEquipped(g)} />
                <strong>{g.name}</strong>
                <span className="muted small">
                  {g.kind === 'custom' ? `custom · ${g.points || 0} pts` : `${g.kind} · ${g.def.points} pts`}
                  {g.def?.armor ? ` · Armor ${g.def.armor}` : ''}
                  {g.def?.profile ? ` · ${formatProfile(g.def.profile)}` : ''}
                  {g.def?.additionalRule ? ` · ${g.def.additionalRule}` : ''}
                  {g.enchantList?.length ? ` · ${g.enchantList.length} enchantment${g.enchantList.length > 1 ? 's' : ''} (+${g.enchantList.reduce((s, e) => s + e.points, 0)} pts)` : ''}
                </span>
              </label>
              <button className="danger" onClick={() => remove(g)}>Remove</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Armor &amp; Shield</h2>
        <p className="muted small">
          {access ? `${view.cls.name} normal access: ${access}.` : `No armor access is printed for ${view.cls.name}s; check with your GM.`}{' '}
          Armor replaces your Armor if better; a Shield then improves it one step.
        </p>
        <ul className="picker one-col">
          {[...data.armor.map((a) => ({ ...a, kind: 'armor' })), { ...data.shield, kind: 'shield' }].map((a) => {
            const has = view.gear.some((g) => g.kind === a.kind && g.name === a.name)
            const allowed = !access || new RegExp(a.kind === 'shield' ? 'shield' : a.name.split(' ')[0], 'i').test(access)
            return (
              <li key={a.name} className={allowed ? '' : 'restricted'}>
                <div className="picker-main">
                  <strong>{a.name}</strong> <span className="muted small">{a.points} pts{a.armor ? ` · Armor ${a.armor}` : ''}</span>
                  {!allowed && <span className="tag tag-warn" title={`${view.cls.name} normal access: ${access}`}>not available to {view.cls.name}s</span>}
                  <div className="muted small">{a.description ?? a.effect}{a.additionalRule ? ` ${a.additionalRule}.` : ''}</div>
                </div>
                <button disabled={has || !allowed} onClick={() => add(a.kind, a.name)}>{has ? 'Owned' : 'Add'}</button>
              </li>
            )
          })}
        </ul>
      </section>

      <WeaponTable title="Melee weapons" weapons={data.melee} kind="melee" owned={view.gear} suggested={suggested} onAdd={add} />
      <WeaponTable title="Ranged weapons" weapons={data.ranged} kind="ranged" owned={view.gear} suggested={suggested} onAdd={add} />

      <section className="panel span-all">
        <h2>Other gear &amp; Points</h2>
        <form className="profile-form" onSubmit={addCustom}>
          <label className="field">
            Custom item (magic item, foci, relic…)
            <input value={custom.name} maxLength={60} onChange={(e) => setCustom({ ...custom, name: e.target.value })} />
          </label>
          <label className="field">
            Points
            <input type="number" min="0" value={custom.points} onChange={(e) => setCustom({ ...custom, points: e.target.value })} />
          </label>
          <button type="submit" disabled={!custom.name.trim()}>Add item</button>
        </form>
        <div className="profile-form">
          <label className="field">
            Other explicit Points (Animal Companions, extra spells)
            <input type="number" min="0" value={character.otherPoints} onChange={(e) => update({ otherPoints: Math.max(0, Number(e.target.value) || 0) })} />
          </label>
          <label className="field">
            XP earned (optional, to track unspent XP)
            <input type="number" min="0" value={character.xpEarned ?? ''} onChange={(e) => update({ xpEarned: e.target.value === '' ? null : Math.max(0, Number(e.target.value) || 0) })} />
          </label>
        </div>
      </section>
    </div>
  )
}

// Gear has Equipment, Magic Items and Enchantments pages for everyone, plus Spells (Mage, Priest) or Formulas (Artificer).
export default function GearTab({ hash, data, character, view, update }) {
  const magic = view.cls.id === 'artificer' ? 'Formulas' : data.spells[view.cls.id] ? 'Spells' : null
  const pages = [
    { id: 'equipment', label: 'Equipment', href: '#/character/gear' },
    { id: 'items', label: 'Magic Items', href: '#/character/gear/items' },
    { id: 'enchantments', label: 'Enchantments', href: '#/character/gear/enchantments' },
    ...(magic ? [{ id: 'spells', label: magic, href: '#/character/gear/spells' }] : []),
  ]
  const requested = ['items', 'enchantments', 'spells'].find((id) => hash.startsWith(`#/character/gear/${id}`)) ?? 'equipment'
  const page = pages.some((p) => p.id === requested) ? requested : 'equipment'
  return (
    <>
      <nav className="subtabs nested">
        {pages.map((p) => <a key={p.id} href={p.href} className={p.id === page ? 'active' : ''}>{p.label}</a>)}
      </nav>
      {page === 'items' ? (
        <MagicItemsTab data={data} view={view} update={update} />
      ) : page === 'enchantments' ? (
        <EnchantmentsTab data={data} view={view} update={update} />
      ) : page === 'spells' ? (
        magic === 'Formulas' ? <FormulasTab character={character} view={view} update={update} /> : <SpellsTab data={data} character={character} view={view} update={update} />
      ) : (
        <Equipment data={data} character={character} view={view} update={update} />
      )}
    </>
  )
}