import { useEffect, useRef, useState } from 'react'
import { CHARACTERISTICS, SKILLS, TALENT_KINDS, attackMatches, cap, talentKind } from '../character/engine.js'
import {
  TIERS, TIER_CAP, TIER_COST, allEntries, availableTalents, choiceSpecs, choiceValue, normalizeTalents, slotState,
} from '../character/talents.js'

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V']
const PROWESS = new Set(['combat-prowess', 'martial-prowess', 'spell-prowess'])
const titleOf = (e) => (e.def.ranked ? `${e.def.name} ${ROMAN[e.rank]}` : e.def.name)

// Choices that reference other entries (different attack per rank, different Characteristic, ...) must hide options already used.
function optionsFor(spec, e, view) {
  const same = view.entries.filter((x) => x.def.id === e.def.id && x.entry !== e.entry)
  if (spec.kind === 'skill') {
    const used = new Set(same.filter((x) => x.rank < e.rank).map((x) => x.entry.skill))
    // Skills already at 2+ (ignoring this entry's own pick) cannot be improved further.
    const room = (s) => 6 - (view.skillSteps[s] - (e.entry.skill === s ? 1 : 0)) > 2
    return SKILLS.filter((s) => !used.has(s) && room(s)).map((s) => ({ value: s, label: `${cap(s)} (${view.skills[s]}+)` }))
  }
  if (spec.kind === 'attack') {
    const taken = new Set()
    if (spec.unique) same.forEach((x) => taken.add(x.entry[spec.key]))
    if (PROWESS.has(e.def.id)) {
      view.entries.filter((x) => PROWESS.has(x.def.id) && x.def.id !== e.def.id).forEach((x) => taken.add(x.first.attack))
    }
    const names = [...new Set(view.attackOptions.filter((a) => attackMatches(a, spec.filter)).map((a) => a.name))]
    return names.filter((n) => !taken.has(n)).map((n) => ({ value: n, label: n }))
  }
  if (spec.kind === 'characteristic') {
    const used = new Set(same.map((x) => x.entry.characteristic))
    return CHARACTERISTICS.filter((c) => !used.has(c) && view.characteristics[c] < 6).map((c) => ({ value: c, label: `${cap(c)} (${view.characteristics[c]})` }))
  }
  if (spec.kind === 'formula') {
    const taken = new Set(view.formulas)
    return (view.sub.formulas ?? []).filter((f) => !taken.has(f.name) || f.name === e.entry.formula).map((f) => ({ value: f.name, label: f.name }))
  }
  if (spec.kind === 'favoredTag') {
    return view.entries.filter((x) => x.def.id === 'favored-enemy' && x.entry.enemy).map((x) => ({ value: x.entry.enemy, label: x.entry.enemy }))
  }
  const options = spec.options ?? []
  if (!spec.unique) return options
  const used = new Set(same.map((x) => x.entry[spec.key]))
  return options.filter((o) => !used.has(o.value))
}

function Choice({ spec, e, view, patch }) {
  const value = choiceValue(spec, e.entry, e.first)
  if (spec.sticky && e.rank > 1) {
    return <div className="small"><span className="muted">{spec.label}:</span> {value || '—'} <span className="muted">(set at Rank I)</span></div>
  }
  if (spec.kind === 'text') {
    return (
      <label className="field">
        {spec.label}
        <input value={value} maxLength={120} onChange={(ev) => patch({ [spec.key]: ev.target.value })} />
      </label>
    )
  }
  if (spec.kind === 'radio') {
    const name = `${spec.key}-${e.tier}-${e.index}`
    return (
      <div className="field">
        {spec.label}
        <div className="radio-pair">
          {spec.options.map((o) => (
            <label className="choice" key={o.value}>
              <input type="radio" name={name} checked={value === o.value} onChange={() => patch({ [spec.key]: o.value })} />{o.label}
            </label>
          ))}
        </div>
      </div>
    )
  }
  const options = [...optionsFor(spec, e, view)]
  // Keep a value saved before this was a drop-down (or no longer offered) visible instead of silently blanking it.
  if (spec.kind === 'select' && value && !options.some((o) => o.value === value)) options.push({ value, label: value })
  const hint = spec.kind === 'select' ? spec.options?.find((o) => o.value === value)?.hint : null
  return (
    <label className="field">
      {spec.label}
      <select value={value} onChange={(ev) => patch({ [spec.key]: ev.target.value })} className={!value ? 'needs-choice' : ''}>
        {!spec.default && <option value="">Choose…</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint && <span className="small muted">{hint}</span>}
      {!options.length && <span className="small bad">No eligible choice available. Equip a matching weapon or pick a spell first.</span>}
    </label>
  )
}

function SlotDetail({ e, view, update, onRemove }) {
  const patch = (changes) =>
    update((c) => {
      // Sticky choices live on the Rank I entry; later ranks read them from there.
      const target = c.talents[e.tier][e.index]
      const stickyKeys = new Set(choiceSpecs(e.def).filter((s) => s.sticky).map((s) => s.key))
      const own = Object.fromEntries(Object.entries(changes).filter(([k]) => !stickyKeys.has(k)))
      const shared = Object.fromEntries(Object.entries(changes).filter(([k]) => stickyKeys.has(k)))
      const talents = { ...c.talents, [e.tier]: c.talents[e.tier].map((x) => (x === target ? { ...x, ...own } : x)) }
      if (Object.keys(shared).length) {
        const first = view.entries.find((x) => x.def.id === e.def.id && x.rank === 1)
        talents[first.tier] = talents[first.tier].map((x, i) => (i === first.index ? { ...x, ...shared } : x))
      }
      return { talents }
    })
  return (
    <section className="panel">
      <div className="summary-top">
        <div>
          <h2>{titleOf(e)} <span className="muted small">Tier {e.tier} · {TIER_COST[e.tier]} XP</span><span className={`tag kind-tag kind-${talentKind(e.def)}`}>{TALENT_KINDS.find((k) => k.id === talentKind(e.def)).label}</span></h2>
          <div className="muted small">{[e.def.category, e.def.type, e.def.cost].filter(Boolean).join(' · ')}</div>
        </div>
        <button className="danger" onClick={() => onRemove(e)}>Remove</button>
      </div>
      <p>{e.text}</p>
      {e.def.prerequisite && <p className="muted small">Requires {e.def.prerequisite}.</p>}
      {choiceSpecs(e.def).map((spec) => <Choice key={spec.key} spec={spec} e={e} view={view} patch={patch} />)}
    </section>
  )
}

function Picker({ tier, view, character, update, onDone, xpBudget = null }) {
  const [q, setQ] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [tier])
  const list = availableTalents(view.pool, tier, character.talents).filter((t) => `${t.name} ${t.effect}`.toLowerCase().includes(q.toLowerCase()))
  const general = list.filter((t) => t.category !== view.cls.name)
  const classTalents = list.filter((t) => t.category === view.cls.name)
  const add = (def) => {
    if (xpBudget != null && view.points.spent + TIER_COST[tier] > xpBudget) return
    update((c) => ({ talents: { ...c.talents, [tier]: [...c.talents[tier], { id: def.id }] } }))
    onDone(character.talents[tier].length)
  }
  const row = (t) => (
    <li key={t.id} className={`kind-${talentKind(t)}`}>
      <div className="picker-main">
        <strong>{t.name}</strong>{' '}
        <span className="muted small">
          {[t.ranked ? `Rank ${ROMAN[view.entries.filter((x) => x.def.id === t.id).length + 1]}` : null, t.type, t.cost].filter(Boolean).join(' · ')}
        </span>
        <div className="small">{t.effect}</div>
      </div>
      <button className="primary" disabled={xpBudget != null && view.points.spent + TIER_COST[tier] > xpBudget} onClick={() => add(t)}>{xpBudget != null && view.points.spent + TIER_COST[tier] > xpBudget ? "Not enough XP" : "Take"}</button>
    </li>
  )
  return (
    <section className="panel" ref={ref}>
      <h2>Choose a Tier {tier} talent <span className="muted small">{TIER_COST[tier]} XP</span></h2>
      <input className="search" placeholder="Search talents…" value={q} onChange={(e) => setQ(e.target.value)} />
      {!list.length && <p className="muted small">No talents available for this slot{q ? ' matching your search' : ''}. Ranked talents move up a tier with each rank.</p>}
      <div className="picker-cols">
        <div>
          <h3 className="picker-heading">General talents</h3>
          {!general.length && <p className="muted small">None available.</p>}
          {[...new Set(general.map((t) => t.category))].map((cat) => (
            <div key={cat} className="group">
              <div className="group-label">{cat}</div>
              <ul className="picker one-col">{general.filter((t) => t.category === cat).map(row)}</ul>
            </div>
          ))}
        </div>
        <div>
          <h3 className="picker-heading">{view.cls.name} talents</h3>
          {!classTalents.length && <p className="muted small">None available.</p>}
          <ul className="picker one-col">{classTalents.map(row)}</ul>
        </div>
      </div>
    </section>
  )
}

export default function TalentPyramid({ character, view, update, xpBudget = null }) {
  const [selected, setSelected] = useState(null)
  const { talents } = character
  const total = allEntries(talents).length

  const remove = (e) => {
    const without = { ...talents, [e.tier]: talents[e.tier].filter((_, i) => i !== e.index) }
    const next = normalizeTalents(without, view.pool)
    const dropped = total - 1 - allEntries(next).length
    if (dropped > 0 && !window.confirm(`Removing ${titleOf(e)} also removes ${dropped} dependent talent${dropped > 1 ? 's' : ''}. Continue?`)) return
    update({ talents: next })
    setSelected(null)
  }

  const selectedEntry = selected?.index != null ? view.entries.find((x) => x.tier === selected.tier && x.index === selected.index) : null

  return (
    <div className="talent-wrap">
    <div className="talent-layout">
      <section className="panel talent-main">
        <h2>Talent Pyramid <span className="muted">({total} / 20 · {view.points.spent} / {xpBudget ?? 250} XP)</span></h2>
        <p className="muted small">
          Each tier holds 6 / 5 / 4 / 3 / 2 talents. To own <em>k</em> talents in a tier you need <em>k</em> + 1 in the tier below.
          Ranked talents take a slot at each successive tier. Changes appear on the Stats and Sheet tabs immediately.
        </p>
        <div className="talent-legend small">{TALENT_KINDS.map((k) => <span key={k.id} className={`tag kind-tag kind-${k.id}`}>{k.label}</span>)}</div>
        <div className="pyramid">
          {[...TIERS].reverse().map((tier) => {
            const state = slotState(tier, talents)
            return (
              <div key={tier} className="pyramid-row">
                <div className="pyramid-label">
                  <strong>Tier {tier}</strong>
                  <span className="muted small">{talents[tier].length}/{TIER_CAP[tier]} · {TIER_COST[tier]} XP</span>
                </div>
                <div className="pyramid-slots">
                  {Array.from({ length: TIER_CAP[tier] }, (_, i) => {
                    const filled = view.entries.find((x) => x.tier === tier && x.index === i)
                    const active = selected?.tier === tier && selected?.index === i
                    if (filled) {
                      const incomplete = view.checks.some((c) => !c.ok && c.label === 'Talent choices' && c.detail.includes(filled.def.name))
                      return (
                        <button key={i} className={`talent-slot filled kind-${talentKind(filled.def)} ${active ? 'active' : ''} ${incomplete ? 'incomplete' : ''}`} onClick={() => setSelected({ tier, index: i })}>
                          <strong>{titleOf(filled)}</strong>
                          <span className="muted small">{[filled.def.type, filled.def.cost].filter(Boolean).join(' · ') || filled.def.category}</span>
                          {incomplete && <span className="bad small">Needs a choice</span>}
                        </button>
                      )
                    }
                    if (i === talents[tier].length && state.open && (xpBudget == null || view.points.spent + TIER_COST[tier] <= xpBudget)) {
                      return (
                        <button key={i} className={`talent-slot add ${selected?.tier === tier && selected.index == null ? 'active' : ''}`} onClick={() => setSelected({ tier, index: null })}>
                          + Add talent
                        </button>
                      )
                    }
                    return <div key={i} className="talent-slot locked" title={i === talents[tier].length ? state.reason : 'Fill the earlier slots first'}>{i === talents[tier].length ? state.reason : ''}</div>
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>
      <div className="talent-side">
      {!selectedEntry && (
        <section className="panel">
          <h2>Talent details</h2>
          <p className="muted small">
            {selected && selected.index == null
              ? `Choose a Tier ${selected.tier} talent from the lists below the pyramid.`
              : 'Select a talent to see its effect and make its choices, or click + Add talent on an open slot to browse what you can take.'}
          </p>
        </section>
      )}
      {selectedEntry && <SlotDetail key={`${selectedEntry.tier}-${selectedEntry.index}-${selectedEntry.def.id}`} e={selectedEntry} view={view} update={update} onRemove={remove} />}
      </div>
    </div>
    {selected && selected.index == null && (
      <Picker tier={selected.tier} view={view} character={character} update={update} xpBudget={xpBudget} onDone={(index) => setSelected({ tier: selected.tier, index })} />
    )}
    </div>
  )
}
