import { formatProfile } from '../../builder/format.js'
import { spellProfile } from '../../character/engine.js'

const profileText = (p) => `${formatProfile(p)}${p.damageTypes?.length ? ` · ${p.damageTypes.join('/')}` : ''}`

function Spell({ spell, right }) {
  return (
    <li>
      <div className="picker-main">
        <strong>{spell.name}</strong>{' '}
        {spell.points != null && <span className="muted small">{spell.points} pts</span>}
        <div className="muted small">{profileText(spellProfile(spell))}</div>
        {spell.effect && <div className="small">{spell.effect}</div>}
      </div>
      {right}
    </li>
  )
}

// Mage and Priest: starting spells (included in the base value), plus extra Spell Attacks learned for Points.
export function SpellsTab({ data, character, view, update }) {
  const { cls, sub } = view
  const base = cls.baseSpellAttacks?.spells ?? []
  const subSpells = sub.subclassSpellAttacks
  const catalog = data.spells[cls.id]
  const learnedNames = new Set(character.spells)
  const learn = (name) => update((c) => ({ spells: [...c.spells, name] }))
  const forget = (name) => update((c) => ({ spells: c.spells.filter((n) => n !== name) }))
  const lists = [
    { title: `General ${cls.name} spells`, spells: catalog.general },
    { title: `${sub.name} spells`, spells: catalog.bySubclass[sub.id] ?? [] },
  ]
  return (
    <div className="panel-grid">
      <section className="panel span-all">
        <h2>Known spells <span className="muted">({view.points.spells} pts learned)</span></h2>
        <p className="muted small">
          Spell Attacks use the Assault Phase (Combat Phase if Engaged), never take Command slots and can be improved by Prowess talents. Starting spells are included in your base Points; learned spells add their listed cost.
        </p>
        <h3>Starting spells <span className="muted small">(included)</span></h3>
        <ul className="picker one-col">
          {base.map((s) => <Spell key={s.name} spell={{ ...s, ...s.profile, points: null }} />)}
          {subSpells?.spells.map((s) => {
            const chosen = !subSpells.chooseCount || character.subclassSpell === s.name
            return (
              <Spell
                key={s.name}
                spell={{ ...s, ...s.profile, points: null }}
                right={subSpells.chooseCount ? (
                  <label className="choice">
                    <input type="radio" name="subclass-spell" checked={chosen} onChange={() => update({ subclassSpell: s.name })} /> {chosen ? 'Chosen' : 'Choose'}
                  </label>
                ) : null}
              />
            )
          })}
        </ul>
        {subSpells?.chooseCount && !character.subclassSpell && <p className="bad small">Choose one {sub.name} spell above.</p>}
        {sub.combatPhaseOptionalSpell && (
          <label className="choice">
            <input type="checkbox" checked={character.psychicBlade} onChange={(e) => update({ psychicBlade: e.target.checked })} />
            {sub.combatPhaseOptionalSpell.name} ({sub.combatPhaseOptionalSpell.cost}): {profileText(sub.combatPhaseOptionalSpell.profile)}
          </label>
        )}
        <h3>Learned spells</h3>
        {!view.learned.length && <p className="muted small">None yet. Learn spells from the lists below.</p>}
        <ul className="picker one-col">
          {view.learned.map((s) => (
            <Spell key={s.name} spell={s} right={<button className="danger" onClick={() => forget(s.name)}>Forget</button>} />
          ))}
        </ul>
      </section>
      {lists.map(({ title, spells }) => (
        <section key={title} className="panel">
          <h2>{title}</h2>
          {!spells.length && <p className="muted small">No spells listed.</p>}
          <ul className="picker one-col">
            {spells.map((s) => (
              <Spell
                key={s.name}
                spell={s}
                right={<button disabled={learnedNames.has(s.name)} onClick={() => learn(s.name)}>{learnedNames.has(s.name) ? 'Learned' : `Learn +${s.points}`}</button>}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

// Artificer: Formulas are CP-powered Commands, two known at creation and more through Formula Study.
export function FormulasTab({ character, view, update }) {
  const { sub } = view
  const attacks = new Map((sub.formulaAttacks?.spells ?? []).map((a) => [a.name, a.profile]))
  const toggle = (name) =>
    update((c) => ({
      formulas: c.formulas.includes(name) ? c.formulas.filter((f) => f !== name) : c.formulas.length >= 2 ? c.formulas : [...c.formulas, name],
    }))
  const specialty = view.commands.find((c) => c.source === 'Field Specialty')?.name ?? ''
  return (
    <div className="panel-grid">
      <section className="panel span-all">
        <h2>{sub.name} Formulas <span className="muted">({view.formulas.length} known)</span></h2>
        <p className="muted small">
          Choose two Formulas at creation. Each further rank of the Formula Study talent teaches one more. Your Field Specialty is always prepared; the rest must use one of the four optional Command slots on the Stats tab.
        </p>
        <ul className="picker one-col">
          {sub.formulas.map((f) => {
            const starting = character.formulas.includes(f.name)
            const studied = view.formulas.includes(f.name) && !starting
            return (
              <li key={f.name}>
                <div className="picker-main">
                  <strong>{f.name}</strong> <span className="muted small">{f.timing}</span>
                  {f.name === specialty && <span className="tag tag-special">Field Specialty</span>}
                  <div className="small">{f.summary}</div>
                  {attacks.has(f.name) && <div className="muted small">Attack: {profileText(attacks.get(f.name))}</div>}
                </div>
                {studied ? (
                  <span className="muted small">Learned via Formula Study</span>
                ) : (
                  <label className="choice">
                    <input type="checkbox" checked={starting} disabled={!starting && character.formulas.length >= 2} onChange={() => toggle(f.name)} />
                    Starting Formula
                  </label>
                )}
              </li>
            )
          })}
        </ul>
        {view.formulas.length > 0 && (
          <label className="field">
            Field Specialty (always prepared)
            <select value={specialty} onChange={(e) => update({ fieldSpecialty: e.target.value })}>
              {view.formulas.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
        )}
      </section>
    </div>
  )
}
