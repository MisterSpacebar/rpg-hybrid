import { formatProfile, formatWard, statDash } from '../../builder/format.js'
import { CHARACTERISTICS, cap } from '../../character/engine.js'

const FIELDS = { M: 'move', W: 'wounds', Arm: 'armor', Eva: 'evade', Ward: 'ward' }

// Stats changed by purchased upgrades are highlighted, with the printed value in the tooltip.
export function StatStrip({ stats, impact, models, big, changed = [], base, factionChanged = [], factionRule }) {
  if (!stats) return null
  const items = [
    ['M', stats.move], ['W', stats.wounds], ['Arm', stats.armor], ['Eva', stats.evade], ['Ward', stats.ward],
    impact ? ['Impact', impact] : null,
    models > 1 ? ['Models', models] : null,
  ].filter(Boolean)
  return (
    <div className={`stat-strip ${big ? 'big' : ''}`}>
      {items.map(([label, value]) => {
        const field = FIELDS[label]
        const isChanged = field && changed.includes(field)
        const fromFaction = field && factionChanged.includes(field)
        const tip = fromFaction ? `Faction rule: ${factionRule}` : isChanged ? `Printed: ${statDash(base?.[field])}` : label === 'W' ? 'Wounds per Model' : label === 'Ward' && value && formatWard(value) !== String(value) ? `Ward as printed: ${value}` : undefined
        return (
          <div key={label} className={`stat ${isChanged ? 'changed' : ''} ${fromFaction ? 'faction' : ''} ${label === 'Ward' ? 'ward' : ''}`} title={tip}>
            <span className="stat-label">{label}</span>
            <span className="stat-value">{label === 'Ward' ? formatWard(value) : statDash(value)}</span>
          </div>
        )
      })}
    </div>
  )
}

export function PhaseTag({ phase }) {
  return <span className={`phase-tag phase-${phase}`}>{phase}</span>
}

export function AttackLines({ attacks }) {
  if (!attacks?.length) return null
  return (
    <ul className="attack-lines">
      {attacks.map((a, i) => (
        <li key={i}>
          <PhaseTag phase={a.phase} /> <strong>{a.name}{a.modified && <span className="mod-mark" title="Modified by upgrades"> ▲</span>}</strong>{' '}
          <span className="muted">{formatProfile(a)}</span>
          {a.factionKeywords?.length > 0 && <span className="fac-mark" title={`Faction rule: ${a.factionKeywords.join(', ')}`}> ◆ {a.factionKeywords.join(', ')}</span>}
        </li>
      ))}
    </ul>
  )
}
// Combat profile first, then the Characteristics in their own labelled, differently coloured row.
export function CharacterStatGroups({ view }) {
  const { characteristics, stats, printedStats, changed, ancestry, size } = view
  return (
    <>
      <div className="stat-group-label">Combat profile</div>
      <StatStrip big stats={stats} changed={changed} base={printedStats} />
      {view.defenses.length > 0 && (
        <div className="defenses small"><span className="muted">Defenses:</span> {view.defenses.map((d) => <span key={d} className="tag tag-spell">{d}</span>)}</div>
      )}
      <div className="stat-group-label">Characteristics</div>
      <div className="stat-strip big chars">
        {CHARACTERISTICS.map((c) => (
          <div key={c} className={`stat ${characteristics[c] !== ancestry.characteristics[c] ? 'changed' : ''}`} title={`${cap(c)}: ${ancestry.name} starts at ${ancestry.characteristics[c]}`}>
            <span className="stat-label">{c}</span>
            <span className="stat-value">{characteristics[c]}</span>
          </div>
        ))}
        <div className="stat size" title="Size"><span className="stat-label">Size</span><span className="stat-value">{size}</span></div>
      </div>
    </>
  )
}

// Abilities a generic Support Unit has at no extra cost (Corrosive Preparation, Triage, ...); the effect is in the tooltip.
export function AbilityLines({ entry }) {
  if (entry.source !== 'generic' || !entry.abilities?.length) return null
  return (
    <ul className="attack-lines ability-lines">
      {entry.abilities.map((a) => (
        <li key={a.name} title={a.effect}>
          <span className="phase-tag phase-ability">{a.cost ? 'Command' : 'Passive'}</span> <strong>{a.name}</strong>{' '}
          <span className="muted">{[a.cost, a.timing].filter(Boolean).join(' · ')}</span>
        </li>
      ))}
    </ul>
  )
}