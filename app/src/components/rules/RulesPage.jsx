import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import RulesIntro from './RulesIntro.jsx'
import AppendicesIntro from './AppendicesIntro.jsx'
import { bookGroups, CHAPTER_META, chapterBySlug, useLibrary, factionRosterMarkdown } from '../../rulebooks.js'

// Route shape: #/<tab>/<book>/<chapter>[/<sectionId>]
function parseRoute(hash, tab) {
  const [, , book, file, section] = hash.split('/').map(decodeURIComponent)
  const slug = book && file ? `${book}/${file}` : null
  return { slug: slug && chapterBySlug[slug]?.tab === tab ? slug : null, section: section ?? null }
}

const hrefFor = (tab, slug, section) => `#/${tab}/${slug}${section ? `/${section}` : ''}`

const chapterByFile = Object.fromEntries(Object.values(chapterBySlug).map((c) => [c.file, c]))

// Rulebook cross-references are written as relative .md links; point them at the matching in-app chapter.
function RuleLink({ href, children }) {
  const m = href?.match(/(?:^|\/)([\w-]+)\.md$/)
  const target = m && chapterByFile[m[1]]
  return <a href={target ? hrefFor(target.tab, target.slug) : href}>{children}</a>
}

function FactionStrong({ children }) {
  const label = String(children)
  const isUnit = /—\s*\d+\s*(?:pts|Points)\b/i.test(label)
  return <strong className={isUnit ? 'faction-roster-unit-name' : undefined}>{children}</strong>
}

function Md({ children, factionRoster = false }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, [factionRosterMarkdown, { enabled: factionRoster }]]}
      components={{ a: RuleLink, ...(factionRoster ? { strong: FactionStrong } : {}) }}
    >
      {children}
    </ReactMarkdown>
  )
}

function Sidebar({ tab, library, slug, section }) {
  const groups = useMemo(() => bookGroups(tab), [tab])
  const [open, setOpen] = useState(() => new Set())

  // Keep the active book and chapter expanded as the route changes.
  useEffect(() => {
    if (!slug) return
    setOpen((prev) => new Set(prev).add(`book:${chapterBySlug[slug].group}`).add(`ch:${slug}`))
  }, [slug])

  const toggle = (key) =>
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  return (
    <aside className="rules-nav">
      {groups.map((book) => {
        const bookKey = `book:${book.id}`
        const bookOpen = open.has(bookKey) || groups.length === 1
        return (
          <details key={book.id} open={bookOpen}>
            <summary
              onClick={(e) => {
                e.preventDefault()
                toggle(bookKey)
              }}
            >
              {book.title}
            </summary>
            <ul>
              {book.chapters.map((c) => {
                const parsed = library?.[c.slug]
                const chKey = `ch:${c.slug}`
                const active = c.slug === slug
                return (
                  <li key={c.slug}>
                    <details open={open.has(chKey)}>
                      <summary
                        className={active ? 'active' : ''}
                        onClick={(e) => {
                          e.preventDefault()
                          toggle(chKey)
                          if (!active) window.location.hash = hrefFor(tab, c.slug)
                        }}
                      >
                        {parsed?.title ?? c.file}
                      </summary>
                      <ul className="sections">
                        {parsed?.sections.map((s) => (
                          <li key={s.id}>
                            <a
                              href={hrefFor(tab, c.slug, s.id)}
                              className={active && s.id === section ? 'active' : ''}
                            >
                              {s.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                )
              })}
            </ul>
          </details>
        )
      })}
    </aside>
  )
}

function Chapter({ parsed, slug, section }) {
  const [openIds, setOpenIds] = useState(() => new Set())
  const contentRef = useRef(null)
  const meta = CHAPTER_META[slug]
  const full = meta?.fullRules

  // Open and scroll to the requested section; otherwise start at the top with everything collapsed.
  useEffect(() => {
    setOpenIds(section ? new Set([section]) : new Set())
    const el = section && document.getElementById(`sec-${section}`)
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }))
    else contentRef.current?.closest('.rules-content')?.scrollTo(0, 0)
  }, [slug, section])

  const toggle = (id, isOpen) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      isOpen ? next.add(id) : next.delete(id)
      return next
    })

  return (
    <article className="markdown" ref={contentRef}>
      <h1>{parsed.title}</h1>
      {meta?.intro && <div className="intro"><Md>{meta.intro}</Md></div>}
      {full && (
        <p className="blurb">
          This is a condensed version. See the full <a href={hrefFor('rules', full.slug)}>{full.label}</a>{' '}
          rules for complete details.
        </p>
      )}
      <Md>{parsed.preamble}</Md>
      {parsed.sections.length > 0 && (
        <div className="section-controls">
          <button onClick={() => setOpenIds(new Set(parsed.sections.map((s) => s.id)))}>Expand all</button>
          <button onClick={() => setOpenIds(new Set())}>Collapse all</button>
        </div>
      )}
      {parsed.sections.map((s) => (
        <details
          key={s.id}
          id={`sec-${s.id}`}
          className="section"
          open={openIds.has(s.id)}
          onToggle={(e) => toggle(s.id, e.currentTarget.open)}
        >
          <summary>{s.title}</summary>
          <Md factionRoster={slug === '02_wargame/02_core_factions' && /^\d+\.\s/.test(s.title)}>{s.body}</Md>
        </details>
      ))}
    </article>
  )
}

export default function RulesPage({ tab, hash }) {
  const library = useLibrary()
  const { slug, section } = parseRoute(hash, tab)
  const parsed = slug && library ? library[slug] : null

  return (
    <div className="rules">
      <Sidebar tab={tab} library={library} slug={slug} section={section} />
      <main className="rules-content">
        {!slug && tab === 'appendices' && <AppendicesIntro library={library} />}
        {!slug && tab !== 'appendices' && <RulesIntro />}
        {slug && !parsed && <p className="muted">Loading…</p>}
        {parsed && <Chapter parsed={parsed} slug={slug} section={section} />}
      </main>
    </div>
  )
}