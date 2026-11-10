import { canonicalTags, normalizeTag } from '../tags.js'
export { ANTI_TAGS } from '../tags.js'

// Applies purchased upgrades to a unit's printed stats, attacks, and tags.
// Upgrades are described in prose in the rules data, so each rule below matches a known phrasing.

const STEP = /^(\d)\+(.*)$/
const stepUp = (v) => {
  const m = String(v ?? '').match(STEP)
  return m ? `${Math.max(2, Number(m[1]) - 1)}+${m[2]}` : v
}

// Only upgrades with no CP cost, timing, or weapon profile alter the stat line; Commands and weapons do not.
const passive = (o) => !o.cpCost && !o.timing && !o.profile

export const attackPhase = (a) => (/engaged/i.test(a.range ?? '') ? 'Combat' : 'Assault')

export function modifyStats(base, options) {
  if (!base) return { stats: base, changed: [] }
  const stats = { ...base }
  const changed = new Set()
  const set = (key, value) => {
    if (value !== stats[key]) {
      stats[key] = value
      changed.add(key)
    }
  }

  for (const o of options.filter(passive)) {
    const t = o.effect ?? ''
    let m
    if ((m = t.match(/Armor and Evade become (\d\+)/i))) {
      set('armor', m[1])
      set('evade', m[1])
    } else {
      if ((m = t.match(/Armor from \d\+ to (\d\+)/i))) set('armor', m[1])
      else if (/improve (?:the Unit's )?Armor (?:one step|by 1 step)/i.test(t)) set('armor', stepUp(stats.armor))
      if (/improve Evade one step/i.test(t)) set('evade', stepUp(stats.evade))
    }
    if ((m = t.match(/Increase Move by (\d+)"/i)) && /^\d+"?$/.test(String(stats.move))) {
      set('move', `${parseInt(stats.move, 10) + Number(m[1])}"`)
    } else if ((m = t.match(/Increase Move (?:from \d+" )?to M?(\d+)"/i))) {
      set('move', `${m[1]}"`)
    }
    if (typeof stats.wounds === 'number' && (m = t.match(/increase Wounds by (\d+)|\+(\d+) (?:maximum )?Wounds?\b/i))) {
      set('wounds', stats.wounds + Number(m[1] ?? m[2]))
    }
    if (/Ward improves by 1/i.test(t)) set('ward', stepUp(stats.ward))
  }
  return { stats, changed: [...changed] }
}

const isMelee = (a) => attackPhase(a) === 'Combat'

// Picks the single weapon a specific upgrade applies to: the chosen package first, then the unit's default weapon.
function targetOf(attacks, text) {
  const preferPicked = (fn) => attacks.find((a) => a.origin === 'pick' && fn(a)) ?? attacks.find(fn)
  if (/Arcana|Arcane Bolt/i.test(text)) return attacks.find((a) => a.name === 'Arcane Bolt')
  if (/Spell Attack|Casting/i.test(text)) return preferPicked((a) => (a.keywords ?? []).some((k) => /^Magic\b/i.test(k)) || /spell|arcane|bolt/i.test(a.name ?? ''))
  if (/ranged|Long Range|Range by/i.test(text)) return preferPicked((a) => !isMelee(a))
  if (/melee/i.test(text)) return preferPicked(isMelee)
  return preferPicked(isMelee) ?? attacks[0]
}

function addKeyword(a, keyword, rank) {
  const keywords = [...(a.keywords ?? [])]
  const i = keywords.findIndex((k) => k.startsWith(`${keyword} `))
  if (i >= 0) keywords[i] = `${keyword} ${parseInt(keywords[i].slice(keyword.length), 10) + rank}`
  else keywords.push(`${keyword} ${rank}`)
  a.keywords = keywords
}

// Upgrades that name a weapon ("selected", "chosen", "primary", "one weapon") change only that weapon;
// unspecific ones, such as the Cavalry Veterans upgrade, change every weapon the unit has.
const SPECIFIC = /\b(selected|chosen|primary)\b|\bone (?:selected |melee |ranged |offensive )?(?:weapon|Arcana|Spell Attack)\b|Arcane Bolt/i

function applyTo(a, t) {
  let m
  if (/\+1 Attack|Increase Attacks by 1/i.test(t)) a.attacks = Number(a.attacks) + 1
  if (/improves?\b[^.]*\bHit|Hit\b[^.]*\bimproves/i.test(t)) a.hit = stepUp(a.hit)
  if ((m = t.match(/Range by (\d+)"/i)) && /^\d+"$/.test(a.range)) a.range = `${parseInt(a.range, 10) + Number(m[1])}"`
  if ((m = t.match(/gains? (Accurate|Critical|Anti-Monster) (\d)/i))) addKeyword(a, m[1], Number(m[2]))
  if (/\bgains? Pinpoint\b/i.test(t) && !a.keywords.includes('Pinpoint')) a.keywords.push('Pinpoint')
  if ((m = t.match(/Gain Long Range (\d)"/i))) {
    const i = a.keywords.findIndex((k) => /^Long Range/.test(k))
    if (i >= 0) a.keywords[i] = `Long Range ${parseInt(a.keywords[i].slice(11), 10) + 1}"`
    else a.keywords.push(`Long Range ${m[1]}"`)
  }
  a.modified = true
}

// allWeapons: names of upgrades that apply to every weapon even though their rules text says "selected" (generic infantry Veterans).
export function modifyAttacks(attacks, options, { allWeapons = [], weaponTargets = {} } = {}) {
  const list = attacks.map((a) => ({ ...a, keywords: [...(a.keywords ?? [])] }))
  for (const o of options.filter(passive)) {
    const t = o.effect ?? ''
    const touches =
      /\+1 Attack|Increase Attacks by 1/i.test(t) ||
      /improves?\b[^.]*\bHit|Hit\b[^.]*\bimproves/i.test(t) ||
      /Range by \d+"/i.test(t) ||
      /gains? (Accurate|Critical|Anti-Monster) \d/i.test(t) ||
      /\bgains? Pinpoint\b/i.test(t) ||
      /Gain Long Range \d"/i.test(t)
    if (!touches) continue
    if (!allWeapons.includes(o.name) && (SPECIFIC.test(t) || /Range by|Long Range/i.test(t))) {
      const a = list.find((attack) => attack.name === weaponTargets[o.id]) ?? targetOf(list, t)
      if (a) applyTo(a, t)
    } else {
      list.forEach((a) => applyTo(a, t))
    }
  }
  return list
}
export function modifyTags(tags, options) {
  let out = [...tags]
  for (const o of options.filter(passive)) {
    const t = o.effect ?? ''
    let m
    if ((m = t.match(/gain(?:s)? (?:the )?(Armored|Mobile)\b/i)) && !out.includes(m[1])) out.push(m[1])
    if ((m = t.match(/Loses (\w+) tag and gains (\w+)/i))) out = [...out.filter((x) => x !== m[1]), m[2]]
    if ((m = t.match(/\blose(?:s)? (\w+)(?: tag)?\b/i))) out = out.filter((x) => x !== m[1])
  }
  // Armored and Unarmored are mutually exclusive even when an upgrade omits
  // the explicit phrase 'lose Unarmored'.
  if (out.includes('Armored')) out = out.filter((tag) => tag !== 'Unarmored')
  return canonicalTags(out)
}

// True when an upgrade's whole effect is already shown in the stat line, attack table or tags
// (probed against the same rules that modify them), so a datasheet need not repeat its text.
const PROBE_STATS = { move: '4"', wounds: 2, armor: '6+', evade: '6+', ward: '5+' }
const PROBE_ATTACK = { name: 'Probe', range: '12"', attacks: 1, hit: '4+', keywords: [], origin: 'entry' }
export function appliedToProfile(o) {
  if (!passive(o)) return false
  if (o.tagChoice || o.stats) return true
  if (modifyStats(PROBE_STATS, [o]).changed.length) return true
  if (modifyAttacks([PROBE_ATTACK], [o]).some((a) => a.modified)) return true
  const tags = ['Infantry', 'Unarmored']
  return modifyTags(tags, [o]).join() !== canonicalTags(tags).join()
}

// ---------- chosen Anti-[Type] (Hunters, Master Hunter, Weapon Specialization) ----------

// Battlefield tags and creature types an Anti-[Type] upgrade can name (Keywords: Creature Types and Battlefield Tags).


// An upgrade whose text says "Anti-[chosen tag] N" or "Anti-[Type] N" lets the player pick the tag.
// "This unit gains ..." applies to every weapon; otherwise it applies to one selected weapon.
export function tagChoiceOf(effect) {
  const m = String(effect ?? '').match(/Anti-\[(?:selected tag|chosen tag|Type)\]\s*(\d+)/i)
  if (!m) return null
  return { rank: Number(m[1]), scope: /\bother friendly units\b/i.test(effect) ? 'aura' : /\b(?:this|the) unit gains\b|unit-wide/i.test(effect) ? 'unit' : 'weapon' }
}

// Anti-[Type] sources never stack on the same target: only the higher value counts.
function setAnti(a, tag, rank) {
  const keywords = [...(a.keywords ?? [])]
  const i = keywords.findIndex((k) => new RegExp(`^Anti-${tag}\\s+\\d+`, 'i').test(k))
  if (i >= 0) keywords[i] = `Anti-${tag} ${Math.max(rank, parseInt(keywords[i].replace(/\D+/g, ''), 10) || 0)}`
  else keywords.push(`Anti-${tag} ${rank}`)
  a.keywords = keywords
  a.modified = true
}

// choices: { [optionId]: { tag, weapon } }. Returns the changed attacks plus, per option, what it was applied to.
export function applyTagChoices(attacks, options, choices = {}) {
  const list = attacks.map((a) => ({ ...a, keywords: [...(a.keywords ?? [])] }))
  const applied = {}
  for (const o of options) {
    if (!o.tagChoice) continue
    const { tag: selectedTag, weapon } = choices?.[o.id] ?? {}
    if (!selectedTag) continue
    const tag = normalizeTag(selectedTag)
    if (o.tagChoice.scope === 'aura') {
      applied[o.id] = null
      continue
    }
    if (!list.length) continue
    if (o.tagChoice.scope === 'unit') {
      list.forEach((a) => setAnti(a, tag, o.tagChoice.rank))
      applied[o.id] = null
    } else {
      const target = list.find((a) => a.name === weapon) ?? targetOf(list, o.effect ?? '')
      if (target) {
        setAnti(target, tag, o.tagChoice.rank)
        applied[o.id] = target.name
      }
    }
  }
  return { attacks: list, applied }
}