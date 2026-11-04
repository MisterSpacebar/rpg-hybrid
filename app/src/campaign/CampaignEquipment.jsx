import { newGearItem } from '../character/engine.js'
import { campaignGearOptions } from './equipment.js'
import { formatProfile } from '../builder/format.js'

export default function CampaignEquipment({ data, character, view, update, inventory, approved, otherHeroes, ownerUid }) {
  const options = campaignGearOptions({ ...character, ownerUid }, data, inventory, approved, otherHeroes)
  const claim = (item, inventoryId = null) => update((char) => {
    const owned = char.gear ?? []
    const same = owned.find((g) => inventoryId ? g.inventoryId === inventoryId
      : !g.inventoryId && g.kind === item.kind && g.name === item.name)
    if (same) return {}
    // Acquiring a second item never deletes or reproduces an old item. Only
    // unequip overlapping categories; the entire inventory stays visible.
    const gear = owned.map((g) => g.kind === item.kind ? { ...g, equipped: false } : g)
    return { gear: [...gear, newGearItem(item.kind, item.name, inventoryId ? { inventoryId } : {})] }
  })
  const toggle = (item) => update((char) => ({
    gear: char.gear.map((g) => g.uid === item.uid ? { ...g, equipped: !g.equipped }
      : g.kind === item.kind && !item.equipped ? { ...g, equipped: false } : g),
  }))
  const release = (item) => update((char) => ({ gear: char.gear.filter((g) => g.uid !== item.uid) }))
  const has = (item, inventoryId) => character.gear.some((g) => inventoryId
    ? g.inventoryId === inventoryId : !g.inventoryId && g.kind === item.kind && g.name === item.name)
  const points = (item) => {
    if (item.points != null) return item.points
    if (item.kind === 'shield') return data.shield.points
    if (item.kind === 'armor') return data.armor.find((a) => a.name === item.name)?.points ?? 0
    if (['melee', 'ranged'].includes(item.kind)) return data[item.kind].find((a) => a.name === item.name)?.points ?? 0
    return data.magic.byKey.get(`${item.kind}:${item.name}`)?.points ?? 0
  }
  return <div className="panel-grid">
    <section className="panel span-all">
      <h2>Carried and equipped gear <span className="muted">({view.points.gear} pts equipped)</span></h2>
      <p className="muted small">Campaign equipment is restricted to starting choices or actual Company inventory. Equipped items count towards your Hero's battlefield Points; Company inventory cannot be created from this screen.</p>
      <ul className="saved-list">{character.gear.map((g) => <li key={g.uid}>
        <div><strong>{g.name}</strong><div className="muted small">{g.kind} · {g.inventoryId ? 'Company item' : 'Starting item'} · {points(g)} pts</div></div>
        <div className="saved-actions"><label className="choice"><input type="checkbox" checked={g.equipped !== false} onChange={() => toggle(g)} /> Equipped</label><button onClick={() => release(g)}>Return / Remove</button></div>
      </li>)}</ul>
    </section>
    <section className="panel">
      <h2>Starting equipment</h2>
      <p className="muted small">{approved ? 'Only the starting items already approved by your GM may be re-equipped.' : 'Choose Class/Subclass weapons and Class-legal basic armor. Standard Equipment Points apply.'}</p>
      <ul className="picker one-col">{options.starting.map((item) => <li key={item.kind + item.name}>
        <div className="picker-main"><strong>{item.name}</strong> <span className="muted small">{points(item)} pts · {item.kind}</span>{item.profile && <div className="muted small">{formatProfile(item.profile)}</div>}</div>
        <button disabled={has(item)} onClick={() => claim(item)}>{has(item) ? 'Carried' : 'Take'}</button>
      </li>)}</ul>
    </section>
    <section className="panel">
      <h2>Company equipment pool</h2>
      <p className="muted small">These are finite items acquired during the campaign. Selecting an item reserves that copy for your character; it cannot be carried by another PC simultaneously.</p>
      {!options.acquired.length && <p className="muted">No unclaimed campaign equipment is available.</p>}
      <ul className="picker one-col">{options.acquired.map((item) => <li key={item.id}>
        <div className="picker-main"><strong>{item.name}</strong> <span className="muted small">{points(item)} pts · {item.kind}</span></div>
        <button disabled={has(item, item.id)} onClick={() => claim(item, item.id)}>{has(item, item.id) ? 'Carried' : 'Equip / carry'}</button>
      </li>)}</ul>
    </section>
  </div>
}
