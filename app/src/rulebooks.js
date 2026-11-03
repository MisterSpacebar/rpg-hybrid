import { useEffect, useState } from 'react'

// Rulebook Markdown is read straight from /rulebooks; each chapter is its own lazy chunk.
const modules = import.meta.glob('../../rulebooks/chapters/**/*.md', {
  query: '?raw',
  import: 'default',
})

const BOOK_TITLES = {
  '01_rpg': 'RPG Rules',
  combat: 'Combat',
  '02_wargame': 'Wargame',
  '03_missions': 'Missions',
  '04_campaign': 'Campaign',
  '05_reference': 'Reference',
}

// Appendix sidebar groups are titled per-book-folder rather than lumped under one label, since not every
// appendix is Campaign-specific (e.g. the Battlefield Layout reference applies to matched play too).
const APPENDIX_GROUP_TITLES = {
  '04_campaign': 'Campaign Appendices',
  '05_reference': 'Battlefield Layouts',
}

// The full combat rules are pulled out of the RPG book into their own group; the summaries stay in the RPG book.
const COMBAT_ORDER = ['01_rpg/15_narrative_combat', '01_rpg/16_structured_combat']

// Per-chapter display extras: an intro shown under the title, plus (for the condensed combat chapters)
// a title override and a pointer to the full rules.
export const CHAPTER_META = {
  '01_rpg/15_narrative_combat': {
    intro:
      'Narrative Combat is the streamlined system for ordinary encounters, minor bosses, smaller skirmishes, and theatre-of-the-mind play. It uses the same mechanics as Structured Combat, but sides take turns and exact distances are replaced with Range Bands, so no tabletop or miniatures are needed.',
  },
  '01_rpg/16_structured_combat': {
    intro:
      'Structured Combat is the tactical tabletop system for major encounters and larger battles where exact positioning and battlefield control matter. It uses miniatures, terrain, six-sided dice, and objective markers, with Units alternating activations within shared Phases.',
  },
  '01_rpg/08_narrative_combat_quick_reference': {
    title: 'Narrative Combat Summary',
    intro: `
**What is combat?** When a fight breaks out, the game moves from describing what happens to a set of rules for it. Characters and enemies take turns moving, attacking, and defending, and dice decide who hits and how much Damage is dealt. A character is Defeated once their accumulated Damage reaches their Wounds.

**Why are there two kinds of combat?** Not every fight needs a battle map. The game has two combat systems that share the same core mechanics (Attacks, Wounds, Armor, Evade, Ward, Command Points, Talents, and Keywords), so what you learn in one carries over to the other.

- **Narrative Combat** is the quick option. It needs no miniatures or measuring and suits ordinary encounters, minor bosses, and smaller skirmishes.
- **Structured Combat** is the tabletop option, with miniatures and exact distances for major encounters and larger battles. See the [Structured Combat Summary](09_structured_combat_quick_reference.md).

An encounter can start as Narrative Combat and switch to Structured Combat when positioning starts to matter.

**How does Narrative Combat work?** Each Round, the players take a turn and then the GM takes a turn. A turn has three Phases (Movement, Assault, and Combat), and each Unit on the acting side acts once per Phase in whatever order that side chooses. Instead of measuring, positions are loose Range Bands: Engaged (within melee reach), Short, Medium, and Long.

**What is this page for?** It is a table-side reminder of the essentials, so you can keep play moving without opening the full chapter. It is not a replacement for the full rules.
`,
    fullRules: { slug: '01_rpg/15_narrative_combat', label: 'Narrative Combat' },
  },
  '01_rpg/09_structured_combat_quick_reference': {
    title: 'Structured Combat Summary',
    intro: `
**What is combat?** When a fight breaks out, the game moves from describing what happens to a set of rules for it. Characters and enemies take turns moving, attacking, and defending, and dice decide who hits and how much Damage is dealt. A character is Defeated once their accumulated Damage reaches their Wounds.

**Why are there two kinds of combat?** Not every fight needs a battle map. The game has two combat systems that share the same core mechanics (Attacks, Wounds, Armor, Evade, Ward, Command Points, Talents, and Keywords), so what you learn in one carries over to the other.

- **Narrative Combat** is the quick option, with no miniatures or measuring, for ordinary encounters and smaller skirmishes. See the [Narrative Combat Summary](08_narrative_combat_quick_reference.md).
- **Structured Combat** is the tabletop option, for major encounters and larger battles where exact positioning and control of the battlefield matter. It is also the system used for wargame battles and campaign play.

An encounter can start as Narrative Combat and switch to Structured Combat when positioning starts to matter.

**How does Structured Combat work?** You set up miniatures and terrain on a table and deploy into your side's Deployment Zone. Each Round follows the same sequence: Priority, Movement, Assault, Combat, Scoring, and End Step. Within a Phase, the two sides alternate activating one Unit at a time, distances are measured exactly, and battles are fought over objectives that score Victory Points.

**What is this page for?** It is a table-side reminder of the essentials, so you can keep play moving without opening the full chapter. It is not a replacement for the full rules.
`,
    fullRules: { slug: '01_rpg/16_structured_combat', label: 'Structured Combat' },
  },
}
const GROUP_ORDER = ['01_rpg', 'combat', '02_wargame', '03_missions', '04_campaign', '05_reference']

const FENCE = /^\s*(```|~~~)/
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/

function titleCase(s) {
  const letters = s.replace(/[^A-Za-z]/g, '')
  if (!letters || letters !== letters.toUpperCase()) return s
  return s.toLowerCase().replace(/(^|[\s(\-—/])([a-z])/g, (_, p, c) => p + c.toUpperCase())
}

function plain(s) {
  return s.replace(/[*_`]/g, '').trim()
}

export function slugify(s) {
  return plain(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Splits a chapter into a title, an always-visible preamble, and collapsible sections.
// Sections are split at the shallowest heading level below the chapter title (H1 if repeated, usually H2).
export function parseChapter(text) {
  const lines = text.split(/\r?\n/)
  const headings = []
  let inFence = false
  lines.forEach((line, i) => {
    if (FENCE.test(line)) inFence = !inFence
    if (inFence) return
    const m = line.match(HEADING)
    if (m) headings.push({ line: i, level: m[1].length, text: m[2] })
  })

  const first = headings[0]
  const title = first ? titleCase(plain(first.text)) : ''
  const levels = headings.slice(1).map((h) => h.level)
  const sectionLevel = levels.length ? Math.min(...levels) : 2

  const bounds = headings.filter((h, i) => i > 0 && h.level === sectionLevel)
  const bodyStart = first ? first.line + 1 : 0
  const preambleEnd = bounds.length ? bounds[0].line : lines.length
  const used = new Set()
  const sections = bounds.map((h, i) => {
    const end = i + 1 < bounds.length ? bounds[i + 1].line : lines.length
    let id = slugify(h.text) || `section-${i + 1}`
    for (let n = 2; used.has(id); n++) id = `${slugify(h.text)}-${n}`
    used.add(id)
    return { id, title: plain(h.text), body: lines.slice(h.line + 1, end).join('\n') }
  })

  return { title, preamble: lines.slice(bodyStart, preambleEnd).join('\n'), sections }
}

const chapters = Object.keys(modules).map((path) => {
  const [, book, file] = path.match(/chapters\/([^/]+)\/([^/]+)\.md$/)
  const slug = `${book}/${file}`
  return {
    slug,
    book,
    group: COMBAT_ORDER.includes(slug) ? 'combat' : book,
    file,
    tab: /^Appendix_/i.test(file) ? 'appendices' : 'rules',
    load: modules[path],
  }
})

const sortKey = (c) => (COMBAT_ORDER.includes(c.slug) ? COMBAT_ORDER.indexOf(c.slug) : 0)
chapters.sort(
  (a, b) => sortKey(a) - sortKey(b) || a.slug.localeCompare(b.slug, undefined, { numeric: true }),
)

export const chapterBySlug = Object.fromEntries(chapters.map((c) => [c.slug, c]))

export function bookGroups(tab) {
  const ids = [...new Set(chapters.filter((c) => c.tab === tab).map((c) => c.group))]
  ids.sort((a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b))
  return ids.map((id) => ({
    id,
    title: tab === 'appendices' ? (APPENDIX_GROUP_TITLES[id] ?? BOOK_TITLES[id] ?? id) : (BOOK_TITLES[id] ?? id),
    chapters: chapters.filter((c) => c.tab === tab && c.group === id),
  }))
}

let libraryPromise
function loadLibrary() {
  libraryPromise ??= Promise.all(
    chapters.map(async (c) => {
      const parsed = parseChapter(await c.load())
      const meta = CHAPTER_META[c.slug]
      return [c.slug, meta?.title ? { ...parsed, title: meta.title } : parsed]
    }),
  ).then(Object.fromEntries)
  return libraryPromise
}

// Parsed chapters (title, preamble, sections) keyed by slug; null until loaded.
export function useLibrary() {
  const [library, setLibrary] = useState(null)
  useEffect(() => {
    let live = true
    loadLibrary().then((l) => live && setLibrary(l))
    return () => {
      live = false
    }
  }, [])
  return library
}