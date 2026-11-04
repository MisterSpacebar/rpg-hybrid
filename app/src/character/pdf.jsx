import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { s } from '../builder/pdf.jsx'
import { CHARACTERISTICS, SKILLS, attackTone, cap, gearTone, sheetCommands, sheetTalents, talentDetail, talentTitle } from './engine.js'

const ink = '#1d1f24'
const muted = '#5b6270'
const accent = '#8a5a12'
const improved = '#1f7a3a'
const TONE = { melee: '#b3261e', ranged: '#1f7a3a', armor: '#2456a6' }
const line = '#c9ccd3'

const st = StyleSheet.create({
  page: { padding: 28, fontFamily: 'Helvetica', fontSize: 9, color: ink },
  head: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#efe6d2', padding: 8, borderTopWidth: 4, borderColor: ink, marginBottom: 8 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  pts: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: accent },
  muted: { color: muted },
  h: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: accent, marginTop: 8, marginBottom: 3, letterSpacing: 0.6 },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2 },
  stat: { minWidth: 42, alignItems: 'center', borderWidth: 1, borderColor: line, paddingVertical: 3, paddingHorizontal: 4, marginRight: 4, marginBottom: 4 },
  statLabel: { fontSize: 6.5, color: muted },
  statVal: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap' },
  skill: { width: '33.3%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1.5, paddingRight: 10, borderBottomWidth: 0.5, borderColor: line },
  tableRow: { flexDirection: 'row', paddingVertical: 1.5, borderBottomWidth: 0.5, borderColor: line },
  th: { fontSize: 7, color: muted, fontFamily: 'Helvetica-Bold' },
  bold: { fontFamily: 'Helvetica-Bold' },
  cols: { flexDirection: 'row' },
  col: { flex: 1 },
  block: { marginBottom: 4 },
  foot: { marginTop: 10, fontSize: 7, color: muted },
})

const cell = (w) => ({ width: w })

function Stat({ label, value, changed, round }) {
  return (
    <View style={[st.stat, round && { borderRadius: 14, borderColor: '#3b63b8', backgroundColor: '#eef3fc', minWidth: 54 }, changed && { borderColor: improved, borderWidth: 1.5 }]}>
      <Text style={st.statLabel}>{s(label).toUpperCase()}</Text>
      <Text style={[st.statVal, changed && { color: improved }]}>{s(value ?? '-')}</Text>
    </View>
  )
}

const Entry = ({ title, meta, text, color }) => (
  <View style={st.block} wrap={false}>
    <Text>
      <Text style={[st.bold, color && { color }]}>{s(title)}</Text>
      {meta ? <Text style={st.muted}>{s(`  ${meta}`)}</Text> : null}
    </Text>
    {text ? <Text>{s(text)}</Text> : null}
  </View>
)

export function CharacterDocument({ character, view }) {
  const { stats, changed, attacks } = view
  const commands = sheetCommands(view)
  const equipped = view.gear.filter((g) => g.equipped)
  const talents = sheetTalents(view.entries)
  return (
    <Document title={s(character.name || 'Character')}>
      <Page size="A4" style={st.page}>
        <View style={st.head}>
          <View>
            <Text style={st.title}>{s(character.name || 'Unnamed Character')}</Text>
            <Text style={st.muted}>{s(`${view.ancestry.name} ${view.cls.name} | ${view.sub.name} | Size ${view.size}`)}</Text>
          </View>
          <Text style={st.pts}>{view.points.total} pts</Text>
        </View>

        <Text style={st.h}>COMBAT PROFILE</Text>
        <View style={st.statRow}>
          <Stat label="Move" value={stats.move} changed={changed.includes('move')} />
          <Stat label="Wounds" value={stats.wounds} changed={changed.includes('wounds')} />
          <Stat label="Armor" value={stats.armor} changed={changed.includes('armor')} />
          <Stat label="Evade" value={stats.evade} changed={changed.includes('evade')} />
          <Stat label="Ward" value={stats.ward} changed={changed.includes('ward')} />
        </View>
        {view.defenses.length > 0 && <Text style={[st.muted, { fontSize: 8, marginBottom: 2 }]}>{s(`Defenses: ${view.defenses.join(', ')}`)}</Text>}

        <Text style={st.h}>CHARACTERISTICS</Text>
        <View style={st.statRow}>
          {CHARACTERISTICS.map((c) => <Stat key={c} label={c} value={view.characteristics[c]} changed={view.characteristics[c] !== view.ancestry.characteristics[c]} round />)}
        </View>

        <Text style={st.h}>SKILLS</Text>
        <View style={st.skillRow}>
          {SKILLS.map((k) => (
            <View key={k} style={st.skill}>
              <Text>{cap(k)}</Text>
              <Text style={[st.bold, view.skills[k] < 6 && { color: improved }]}>{view.skills[k]}+</Text>
            </View>
          ))}
        </View>

        {attacks.length > 0 && (
          <View>
            <Text style={st.h}>ATTACKS</Text>
            <View style={st.tableRow}>
              <Text style={[st.th, { flex: 1.3 }]}>ATTACK</Text>
              <Text style={[st.th, cell(50)]}>RANGE</Text>
              <Text style={[st.th, cell(16)]}>A</Text>
              <Text style={[st.th, cell(24)]}>HIT</Text>
              <Text style={[st.th, cell(24)]}>DMG</Text>
              <Text style={[st.th, { flex: 1.2 }]}>KEYWORDS</Text>
            </View>
            {attacks.map((a) => (
              <View key={a.name} style={st.tableRow} wrap={false}>
                <Text style={[{ flex: 1.3 }, st.bold, { color: TONE[attackTone(a)] }]}>{s(a.name)}{a.modified ? ' *' : ''}</Text>
                <Text style={cell(50)}>{s(a.range)}</Text>
                <Text style={cell(16)}>{s(a.attacks)}</Text>
                <Text style={cell(24)}>{s(a.hit)}</Text>
                <Text style={cell(24)}>{s(a.damage)}</Text>
                <Text style={{ flex: 1.2 }}>{s([a.phase, ...a.damageTypes, ...a.keywords].join(', '))}</Text>
              </View>
            ))}
          </View>
        )}

        {view.thrall && (
          <View wrap={false}>
            <Text style={st.h}>{s(view.thrall.name.toUpperCase())} UNIT</Text>
            <Text style={st.muted}>{s(`Starts with ${view.thrall.startingModels} Models (max ${view.thrall.maxModels}). Move, Armor, Evade and Hit follow the Necromancer's Athletics, Medicine, Stealth and Mysticism skills.`)}</Text>
            <View style={st.tableRow}>
              <Text style={st.th}>MOVE {s(view.thrall.stats.move)}   WOUNDS {s(view.thrall.stats.wounds)} per Model   ARMOR {s(view.thrall.stats.armor)}   EVADE {s(view.thrall.stats.evade)}   WARD {s(view.thrall.stats.ward ?? '-')}</Text>
            </View>
            <View style={st.tableRow}>
              <Text style={[{ flex: 1.3 }, st.bold, { color: TONE.melee }]}>{s(view.thrall.attack.name)}</Text>
              <Text style={cell(50)}>{s(view.thrall.attack.range)}</Text>
              <Text style={cell(16)}>{s(view.thrall.attack.attacks)}</Text>
              <Text style={cell(24)}>{s(view.thrall.attack.hit)}</Text>
              <Text style={cell(24)}>{s(view.thrall.attack.damage)}</Text>
              <Text style={{ flex: 1.2 }}>{s([...view.thrall.attack.damageTypes, ...view.thrall.attack.keywords].join(', '))}</Text>
            </View>
            <Entry title={view.thrall.passive.name} meta="Passive" text={view.thrall.passive.effect} />
          </View>
        )}

        <View style={st.cols}>
          <View style={[st.col, { marginRight: 14 }]}>
            <Text style={st.h}>TRAITS</Text>
            {view.traits.map((t, i) => <Entry key={i} title={t.name} meta={`${t.source}${t.timing ? ` | ${t.timing}` : ''}`} text={t.text} />)}
            {view.formulaList.length > 0 && <Text style={st.h}>FORMULAS</Text>}
            {view.formulaList.map((f) => (
              <Entry
                key={f.name}
                title={f.name}
                meta={`${f.timing}${f.specialty ? ' | FIELD SPECIALTY' : f.prepared ? ' | Prepared' : ''}`}
                text={`${f.effect}${f.attack ? ` Attack: ${f.attack.range}, ${f.attack.attacks}A, ${f.attack.hit}, D${f.attack.damage}${f.attack.keywords.length ? `, ${f.attack.keywords.join(', ')}` : ''}.` : ''}`}
              />
            ))}            {commands.length > 0 && <Text style={st.h}>PREPARED COMMANDS</Text>}
            {commands.map((c) => <Entry key={c.key} title={c.name} meta={`${c.source} | ${c.timing}`} text={c.effect} />)}
          </View>
          <View style={st.col}>
            {view.entries.length > 0 && <Text style={st.h}>{`TALENTS | ${view.points.spent} XP`}</Text>}
            {talents.abilities.map((e) => <Entry key={`${e.tier}-${e.index}`} title={talentTitle(e)} meta={`Tier ${e.tier}${talentDetail(e) ? ` | ${talentDetail(e)}` : ''}`} text={e.text} />)}
            {talents.other.length > 0 && <Text style={[st.muted, { fontSize: 8, marginBottom: 4 }]}>{s(`Applied above, or available as Commands: ${talents.other.map((e) => talentTitle(e)).join(', ')}`)}</Text>}
            <Text style={st.h}>EQUIPMENT</Text>
            {!equipped.length && <Text style={st.muted}>Nothing equipped.</Text>}
            {equipped.map((g) => (
              <View key={g.uid}>
                <Entry title={g.name} meta={`${g.kind === 'custom' ? g.points || 0 : g.def.points} pts`} color={TONE[gearTone(g)]} />
                {g.enchantList?.map((e) => (
                  <Text key={e.key} style={{ marginLeft: 8, marginBottom: 2, fontSize: 8 }}>
                    <Text style={st.bold}>{s(`+ ${e.entry.name}${e.choice ? ` (${e.choice})` : ''} `)}</Text>
                    <Text style={st.muted}>{s(`+${e.points}  `)}</Text>
                    <Text>{s(`${e.entry.effect ?? e.cmdText ?? ''}${e.entry.command || e.cmdName ? ` Command: ${e.entry.command?.name ?? e.cmdName}.` : ''}`)}</Text>
                  </Text>
                ))}
              </View>
            ))}
            {character.miscGear.length > 0 && <Text style={st.h}>ADVENTURING GEAR</Text>}
            {character.miscGear.map((i) => <Entry key={i.uid} title={`${i.name}${i.qty > 1 ? ` x${i.qty}` : ''}`} meta={i.note} />)}
          </View>
        </View>

        {(character.background || character.notes) && (
          <View>
            <Text style={st.h}>NOTES</Text>
            {character.background ? <Text>{s(character.background)}</Text> : null}
            {character.notes ? <Text style={st.muted}>{s(character.notes)}</Text> : null}
          </View>
        )}
        <Text style={st.foot}>{s(view.tags.join(' | '))}</Text>
      </Page>
    </Document>
  )
}

export async function downloadCharacterPdf(character, view) {
  const blob = await pdf(<CharacterDocument character={character} view={view} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(character.name || 'character').replace(/[^\w-]+/g, '-').toLowerCase()}.pdf`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
