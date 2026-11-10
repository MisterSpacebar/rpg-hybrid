import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { SLOT_ORDER } from './engine.js'
import { collectCommandCards, formatWard, splitOptions } from './format.js'

const SLOT_NAMES = { H: 'Headquarters', C: 'Core', E: 'Elite', R: 'Ranged', V: 'Vanguard', S: 'Specialist', A: 'Asset' }

// The built-in PDF fonts only cover Latin-1 plus a few typographic marks; map or drop everything else.
const REPLACEMENTS = { '\u2212': '-', '\u2264': '<=', '\u2265': '>=', '\u2192': '->', '\u2033': '"', '\u2032': "'", '\u00A0': ' ' }
const ALLOWED_EXTRA = new Set('\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026\u2122\u20AC')
export const s = (text) =>
  String(text ?? '')
    .replace(/[\u2212\u2264\u2265\u2192\u2033\u2032\u00A0]/g, (c) => REPLACEMENTS[c])
    .replace(/[^\u0000-\u00FF]/g, (c) => (ALLOWED_EXTRA.has(c) ? c : '?'))

const ink = '#1d1f24'
const muted = '#5b6270'
const accent = '#8a5a12'
const line = '#c9ccd3'

const st = StyleSheet.create({
  page: { padding: 28, fontFamily: 'Helvetica', fontSize: 9, color: ink },
  h1: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  h2: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: accent, marginTop: 12, marginBottom: 4 },
  muted: { color: muted },
  row: { flexDirection: 'row' },
  pair: { flexDirection: 'row', marginBottom: 8 },
  card: { flex: 1, borderWidth: 1, borderColor: ink, borderRadius: 4, padding: 7, marginRight: 8 },
  cardLast: { marginRight: 0 },
  cmdCard: { height: 184, borderLeftWidth: 5, marginBottom: 0 },
  wide: { flexGrow: 0, flexBasis: 'auto', marginRight: 0, marginBottom: 8 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: line, paddingBottom: 3, marginBottom: 4 },
  cardTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', flexShrink: 1 },
  pts: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: accent },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 3 },
  stat: { flexShrink: 0, minWidth: 34, alignItems: 'center', borderWidth: 1, borderColor: line, paddingVertical: 2, paddingHorizontal: 3, marginRight: 3, marginBottom: 3 },
  statLabel: { fontSize: 6.5, color: muted },
  statVal: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  th: { fontSize: 7, color: muted, fontFamily: 'Helvetica-Bold' },
  phaseLabel: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: accent, marginTop: 3, marginBottom: 1 },
  label: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: accent, marginTop: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 1 },
  bold: { fontFamily: 'Helvetica-Bold' },
  checkOk: { color: '#2d7a3e' },
  checkBad: { color: '#b3261e' },
  slotBox: { width: 56, alignItems: 'center', borderWidth: 1, borderColor: line, paddingVertical: 3, marginRight: 4 },
  sheet: { borderWidth: 1, borderColor: ink, borderTopWidth: 4, borderRadius: 4, padding: 7, marginBottom: 8 },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#efe6d2', margin: -7, marginBottom: 6, padding: 7 },
  sheetTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold' },
  sheetPts: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: accent },
  sheetBody: { flexDirection: 'row' },
  sheetBodyStack: { flexDirection: 'column', flexShrink: 0 },
  sheetCompact: { flex: 1, height: 268, marginBottom: 0, marginRight: 8, overflow: 'hidden' },
  ruleBox: { marginTop: 5, padding: 4, backgroundColor: '#f4f1ea', borderLeftWidth: 2, borderLeftColor: accent, fontSize: 8 },
  keywords: { marginTop: 4, fontSize: 6.5, color: muted },
  listRow: { flexDirection: 'row', paddingVertical: 2, borderBottomWidth: 0.5, borderColor: line },
})

const cell = (w, extra) => ({ width: w, ...extra })

const FACTION_COLOR = '#14877f'
const STAT_FIELDS = { MOVE: 'move', 'WOUNDS/MDL': 'wounds', ARMOR: 'armor', EVADE: 'evade', WARD: 'ward' }

// Stats changed by upgrades get an accent border and value.
function StatBlock({ stats, impact, charge, models, changed = [], factionChanged = [] }) {
  if (!stats) return null
  const items = [
    ['MOVE', stats.move], ['WOUNDS/MDL', stats.wounds], ['ARMOR', stats.armor],
    ['EVADE', stats.evade], ['WARD', stats.ward], charge != null ? ['CHARGE', `+${charge}`] : null, impact ? ['IMPACT', impact] : null, models > 1 ? ['MODELS', models] : null,
  ].filter(Boolean)
  return (
    <View style={st.statRow}>
      {items.map(([label, value]) => {
        const fac = factionChanged.includes(STAT_FIELDS[label])
        const mod = fac || changed.includes(STAT_FIELDS[label])
        const color = fac ? FACTION_COLOR : accent
        const shown = label === 'WARD' ? formatWard(value) : value
        return (
          <View key={label} style={[st.stat, mod && { borderColor: color, borderWidth: 1.5 }]}>
            <Text style={st.statLabel}>{label}</Text>
            <Text style={[st.statVal, String(shown).length > 6 && { fontSize: 7 }, mod && { color }]}>{s(shown ?? '-')}</Text>
          </View>
        )
      })}
    </View>
  )
}

const PHASES = [
  { id: 'Assault', label: 'ASSAULT PHASE - RANGED & SPELLS' },
  { id: 'Combat', label: 'COMBAT PHASE - MELEE' },
]

function Attacks({ attacks }) {
  if (!attacks.length) return null
  return (
    <View>
      <View style={st.tableRow}>
        <Text style={[st.th, { flex: 1.3 }]}>ATTACK</Text>
        <Text style={[st.th, cell(44)]}>RANGE</Text>
        <Text style={[st.th, cell(14)]}>A</Text>
        <Text style={[st.th, cell(22)]}>HIT</Text>
        <Text style={[st.th, cell(24)]}>DMG</Text>
        <Text style={[st.th, { flex: 1 }]}>KEYWORDS</Text>
      </View>
      {PHASES.map(({ id, label }) => {
        const rows = attacks.filter((a) => a.phase === id)
        if (!rows.length) return null
        return (
          <View key={id}>
            <Text style={st.phaseLabel}>{label}</Text>
            {rows.map((a, i) => (
              <View key={i} style={st.tableRow}>
                <Text style={[{ flex: 1.3 }, st.bold, a.modified && { color: accent }]}>{s(a.name)}{a.modified ? ' *' : ''}</Text>
                <Text style={cell(44)}>{s(a.range)}</Text>
                <Text style={cell(14)}>{s(a.attacks)}</Text>
                <Text style={cell(22)}>{s(a.hit)}</Text>
                <Text style={cell(24)}>{s(a.damage)}</Text>
                <Text style={{ flex: 1 }}>
                  {(a.keywords ?? []).map((k, i) => (
                    <Text key={k} style={a.factionKeywords?.includes(k) ? { color: FACTION_COLOR } : null}>{s(`${i > 0 ? ', ' : ''}${k}${a.factionKeywords?.includes(k) ? ' (F)' : ''}`)}</Text>
                  ))}
                </Text>
              </View>
            ))}
          </View>
        )
      })}
    </View>
  )
}
const SLOT_COLORS = { H: '#d4a34a', C: '#5b8def', E: '#a56cf0', R: '#4fb477', V: '#e8894a', S: '#3fb8b0', A: '#d9605a' }

function Datasheet({ u, rule, compact }) {
  const { detailed: shown, applied } = splitOptions(u)
  const color = SLOT_COLORS[u.slot] ?? accent
  const keywords = [...u.tags, ...(u.isCore && !u.tags.includes('Core') ? ['Core'] : [])].join(' | ')
  return (
    <View style={[st.sheet, compact && st.sheetCompact, { borderTopColor: color }]} wrap={false}>
      <View style={st.sheetHead}>
        <View style={{ flexShrink: 1 }}>
          <Text style={st.sheetTitle}>{s(u.name)}</Text>
          <Text style={[st.muted, { fontSize: 8 }]}>
            {s([`Slot ${u.slot}`, u.category, u.isHero ? 'Hero' : null, u.doubled ? 'Double Formation' : null].filter(Boolean).join(' | '))}
          </Text>
        </View>
        <Text style={st.sheetPts}>{u.points} pts</Text>
      </View>

      <View style={compact ? st.sheetBodyStack : st.sheetBody}>
        <View style={compact ? { flexShrink: 0 } : { width: 215, marginRight: 10 }}>
          <StatBlock stats={u.stats} charge={u.charge} impact={u.impact} models={u.models} changed={u.changedStats} factionChanged={u.factionChanged} />
          <Attacks attacks={u.attacks} />
        </View>
        <View style={compact ? { flexShrink: 0 } : { flex: 1 }}>
          {u.abilities.length > 0 && <Text style={st.label}>ABILITIES</Text>}
          {u.abilities.map((a, i) => (
            <Text key={i} style={{ marginBottom: 2 }}>
              <Text style={st.bold}>{s(a.name)}</Text>
              <Text style={st.muted}>{s(` (${[a.type, a.cost ?? a.cpCost, a.timing, a.frequency].filter(Boolean).join(' | ')})`)}</Text>
              {s(`: ${a.effect}`)}
            </Text>
          ))}
          {shown.length > 0 && <Text style={st.label}>OPTIONS</Text>}
          {shown.map((o, i) => (
            <Text key={i} style={{ marginBottom: 2 }}>
              <Text style={st.bold}>{s(o.name)}</Text>
              <Text style={st.muted}>{s(` (${o.group}${o.points ? `, +${o.points}` : ''})`)}</Text>
              {o.effect ? s(`: ${o.effect}`) : ''}
            </Text>
          ))}
          {applied.length > 0 && <Text style={[st.muted, { marginTop: 2 }]}>{s(`Upgrades applied above: ${applied.join(', ')}.`)}</Text>}
          {u.note ? <Text style={[st.muted, { marginTop: 3 }]}>{s(`Note: ${u.note}`)}</Text> : null}
        </View>
      </View>

      {rule && (
        <View style={st.ruleBox}>
          <Text><Text style={st.bold}>{s(`Faction Rule - ${rule.name}: `)}</Text>{s(rule.effect)}{u.factionRule ? s(' (F) Applied to this unit.') : ''}</Text>
        </View>
      )}
      <Text style={st.keywords}>{s(keywords.toUpperCase())}</Text>
    </View>
  )
}
const pairs = (list) => Array.from({ length: Math.ceil(list.length / 2) }, (_, i) => list.slice(i * 2, i * 2 + 2))

// Eight cards fill an A4 page (2 columns x 4 rows).
function CommandCard({ c, last }) {
  const color = SLOT_COLORS[c.slot] ?? muted
  return (
    <View style={[st.card, st.cmdCard, last && st.cardLast, { borderLeftColor: color }]}>
      <View style={st.cardHead}>
        <Text style={st.cardTitle}>{s(c.name)}</Text>
        <Text style={st.pts}>{s(c.slot ? `Slot ${c.slot}` : '')}</Text>
      </View>
      <Text style={[st.muted, { fontSize: 7.5 }]}>{s(`${c.kind} | ${c.source}`)}</Text>
      <Text style={[st.muted, { fontSize: 7.5, marginBottom: 4 }]}>{s([c.timing, c.cost, c.frequency].filter(Boolean).join(' | '))}</Text>
      <Text style={{ fontSize: 10.5, lineHeight: 1.25 }}>{s(c.effect)}</Text>
    </View>
  )
}

const chunk = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n))
export function ArmyDocument({ view, layout = 'portrait' }) {
  const { faction, doctrines, units } = view
  const sorted = [...units].sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot) || a.name.localeCompare(b.name))
  const commandCards = collectCommandCards(view)

  return (
    <Document title={s(view.name)}>
      <Page size="A4" style={st.page}>
        <Text style={st.h1}>{s(view.name || 'Army List')}</Text>
        <Text style={st.muted}>
          {s([faction?.name ?? 'No Faction', ...doctrines.filter(Boolean).map((d) => d.name)].join(' | '))}
        </Text>
        <Text style={{ marginTop: 3 }}>
          <Text style={st.bold}>{view.points} / {view.limits.maxPoints} points</Text>
          <Text style={st.muted}>  |  {units.length} Units  |  {view.slots.total} Recruitment Slots</Text>
        </Text>

        <Text style={st.h2}>Recruitment Slots</Text>
        <View style={st.row}>
          {SLOT_ORDER.map((slot) => (
            <View key={slot} style={st.slotBox}>
              <Text style={st.bold}>{slot}</Text>
              <Text style={[st.muted, { fontSize: 6.5 }]}>{SLOT_NAMES[slot]}</Text>
              <Text>{view.used[slot]} / {view.slots.available[slot]}</Text>
            </View>
          ))}
        </View>

        <Text style={st.h2}>Units</Text>
        {units.map((u) => (
          <View key={u.uid} style={st.listRow} wrap={false}>
            <Text style={[cell(22), st.bold]}>{u.slot}</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.bold}>{s(u.name)}{u.models > 1 ? s(` (${u.models} Models)`) : ''}</Text>
              {u.picks.length > 0 && (
                <Text style={[st.muted, { fontSize: 7.5 }]}>{s(u.picks.flatMap((p) => p.options.map((o) => o.name)).join(', '))}</Text>
              )}
            </View>
            <Text style={cell(50, { textAlign: 'right' })}>{u.points}</Text>
          </View>
        ))}

        <Text style={st.h2}>Army Checklist</Text>
        {view.checks.map((c) => (
          <Text key={c.id}>
            <Text style={c.ok ? st.checkOk : st.checkBad}>{c.ok ? '[x] ' : '[ ] '}</Text>
            {s(c.label)} <Text style={st.muted}>{s(c.detail)}</Text>
          </Text>
        ))}
      </Page>

      {units.length > 0 && layout === 'portrait' && chunk(sorted, 3).map((group, n) => (
        <Page key={`ds${n}`} size="A4" style={st.page}>
          {group.map((u) => <Datasheet key={u.uid} u={u} rule={faction?.rule} />)}
        </Page>
      ))}

      {units.length > 0 && layout === 'landscape' && chunk(sorted, 4).map((group, n) => (
        <Page key={`ds${n}`} size="A4" orientation="landscape" style={[st.page, { padding: 20 }]}>
          {pairs(group).map((row, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }} wrap={false}>
              {row.map((u) => <Datasheet key={u.uid} u={u} rule={faction?.rule} compact />)}
              {row.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          ))}
        </Page>
      ))}
      {faction && (
        <Page size="A4" style={st.page}>
          <Text style={st.h1}>Faction & Doctrine Cards</Text>
          <View style={[st.card, st.wide, { marginTop: 8 }]} wrap={false}>
            <View style={st.cardHead}>
              <Text style={st.cardTitle}>{s(faction.name)}</Text>
              <Text style={st.pts}>Foundation {faction.foundationSlots.join(' ')}</Text>
            </View>
            <Text style={st.label}>FACTION RULE</Text>
            <Text><Text style={st.bold}>{s(faction.rule.name)}: </Text>{s(faction.rule.effect)}</Text>
            <Text style={st.label}>SELECTED COMMANDS</Text>
            {view.factionCommands.map((c) => (
              <Text key={c.name} style={{ marginBottom: 2 }}>
                <Text style={st.bold}>{s(c.name)}</Text>
                <Text style={st.muted}>{s(` (Slot ${c.slot} | ${c.timing} | ${c.cost})`)}</Text>
                {s(`: ${c.effect}`)}
              </Text>
            ))}
          </View>
          {doctrines.map((d, i) => d && (
            <View key={d.id} style={[st.card, st.wide]} wrap={false}>
              <View style={st.cardHead}>
                <Text style={st.cardTitle}>{s(d.name)} Doctrine</Text>
                <Text style={st.pts}>Foundation {d.foundationSlot}</Text>
              </View>
              <Text style={st.muted}>{s(d.strategy)}</Text>
              <Text style={st.label}>SELECTED COMMANDS</Text>
              {view.doctrineCommands[i].map((c) => (
                <Text key={c.name} style={{ marginBottom: 2 }}>
                  <Text style={st.bold}>{s(c.name)}</Text>
                  <Text style={st.muted}>{s(` (Slot ${c.slot} | ${c.timing})`)}</Text>
                  {s(`: ${c.effect}`)}
                </Text>
              ))}
            </View>
          ))}
        </Page>
      )}

      {chunk(commandCards, 8).map((pageCards, n) => (
        <Page key={n} size="A4" style={st.page}>
          {pairs(pageCards).map((row, i) => (
            <View key={i} style={st.pair} wrap={false}>
              {row.map((c, j) => <CommandCard key={`${c.source}|${c.name}`} c={c} last={j === 1} />)}
              {row.length === 1 && <View style={{ flex: 1, marginLeft: 8 }} />}
            </View>
          ))}
        </Page>
      ))}    </Document>
  )
}

export async function downloadArmyPdf(view, { layout = 'portrait' } = {}) {
  const blob = await pdf(<ArmyDocument view={view} layout={layout} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(view.name || 'army').replace(/[^\w-]+/g, '-').toLowerCase()}.pdf`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}