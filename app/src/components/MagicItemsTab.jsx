import { formatProfile } from '../builder/format.js'
import { newGearItem } from '../character/engine.js'
import { CATEGORY_CHOICES, SLOT_LIMITS, WARD_CHOICES, slotOf } from '../character/magic.js'

const MAGIC_KINDS = ['focus', 'artifact', 'relic']

// Picks the Spell Attack, Ward type or enemy category an item needs.
export function ChoiceSelect({ choice, value, view, onChange }) {
  const options =
    choice === 'spell'
      ? [...new Set(view.attackOptions.filter((a) => a.source === 'spell').map((a) => a.name))].map((n) => ({ value: n, label: n }))
      : choice === 'ward'
        ? WARD_CHOICES
        : CATEGORY_CHOICES.map((c) => ({ value: c, label: c }))
  const label = choice === 'spell' ? 'Spell Attack' : choice === 'ward' ? 'Ward against' : 'Anti-[Type] against'
  return (
    <label className="field inline-choice">
      {label}
      <select value={value ?? ''} className={value ? '' : 'needs-choice'} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        {value && !options.some((o) => o.value === value) && <option value={value}>{value}</option>}
      </select>
    </label>
  )
}

function Catalog({ title, note, entries, owned, onAdd }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {note && <p className="muted small">{note}</p>}
      <ul className="picker one-col">
        {entries.map((e) => {
          const has = owned.some((g) => g.name === e.name)
          return (
            <li key={e.key}>
              <div className="picker-main">
                <strong>{e.name}</strong> <span className="muted small">{e.points} pts</span>
                {e.source && <span className="tag">{e.source}</span>}
                {e.profile && <div className="muted small">{formatProfile(e.profile)}{e.profile.damageTypes?.length ? ` · ${e.profile.damageTypes.join('/')}` : ''}</div>}
                {e.effect && <div className="small">{e.effect}</div>}
                {e.command && (
                  <div className="small"><span className="tag tag-spell">Command</span><strong>{e.command.name}</strong> <span className="muted">{e.command.cost} · {e.command.timing}</span> {e.command.effect}</div>
                )}
              </div>
              <button disabled={has} onClick={() => onAdd(e)}>{has ? 'Owned' : 'Add'}</button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// Foci, artifacts and relics: items that fill a magic slot instead of being enchantments on other gear.
export default function MagicItemsTab({ data, view, update }) {
  const { items } = data.magic
  const mine = view.gear.filter((g) => MAGIC_KINDS.includes(g.kind))
  const used = (slot) => mine.filter((g) => g.equipped && slotOf(g, g.def) === slot).length
  const setGear = (fn) => update((c) => ({ gear: fn(c.gear) }))
  const add = (kind) => (entry) => setGear((gear) => [...gear, newGearItem(kind, entry.name)])
  const patch = (uid, changes) => setGear((gear) => gear.map((g) => (g.uid === uid ? { ...g, ...changes } : g)))
  const slotLabel = (g) => ({ focus: 'Focus', artifact: 'Artifact', weapon: 'Weapon slot', shield: 'Shield slot' })[slotOf(g, g.def)]

  return (
    <div className="panel-grid">
      <section className="panel span-all">
        <h2>Magic items <span className="muted">(Focus {used('focus')}/{SLOT_LIMITS.focus} · Artifacts {used('artifact')}/{SLOT_LIMITS.artifact})</span></h2>
        <p className="muted small">
          A character normally equips one Magical Focus and up to two General Artifacts. Relics take the slot of what they are (weapon, shield, focus or artifact).
          Equipped items add their Points, apply what they can to the Stats and Attacks, and list the rest as rules text and Commands on the Sheet. Item Commands never use your four prepared Command slots.
          To add enchantments to your weapons, armor or shield, use the Enchantments tab.
        </p>
        {!mine.length && <p className="muted">Nothing yet. Add items from the lists below.</p>}
        <ul className="saved-list">
          {mine.map((g) => (
            <li key={g.uid}>
              <div>
                <label className="choice">
                  <input type="checkbox" checked={g.equipped} onChange={() => patch(g.uid, { equipped: !g.equipped })} />
                  <strong>{g.name}</strong>
                  <span className="muted small">{g.def.points} pts</span>
                  <span className="tag tag-suggested">{slotLabel(g)}</span>
                </label>
                {g.def.choice && <ChoiceSelect choice={g.def.choice} value={g.choice} view={view} onChange={(choice) => patch(g.uid, { choice })} />}
              </div>
              <button className="danger" onClick={() => setGear((gear) => gear.filter((x) => x.uid !== g.uid))}>Remove</button>
            </li>
          ))}
        </ul>
      </section>
      <Catalog title="Magical foci" note="Occupy the Focus slot. They improve Spell Attacks or give a supernatural benefit." entries={items.focus} owned={mine} onAdd={add('focus')} />
      <Catalog title="General artifacts" note="Up to two can be equipped." entries={items.artifact} owned={mine} onAdd={add('artifact')} />
      <Catalog title="Relics" note="Exceptional items, normally earned through major adventures. The listed Points are the item's complete cost." entries={items.relic} owned={mine} onAdd={add('relic')} />
    </div>
  )
}
