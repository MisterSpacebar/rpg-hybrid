import ArmyBuilder from './ArmyBuilder.jsx'
import CommandCards from './CommandCards.jsx'
import Datasheets from './Datasheets.jsx'
import { useArmy } from '../builder/useArmy.js'

const PAGES = [
  { id: 'build', label: 'Build', href: '#/builder' },
  { id: 'datasheets', label: 'Datasheets', href: '#/builder/datasheets' },
  { id: 'commands', label: 'Command Cards', href: '#/builder/commands' },
]

export default function ArmySection({ hash }) {
  const { catalog, army, setArmy, view, dirty, markSaved } = useArmy()
  const page = hash.startsWith('#/builder/datasheets') ? 'datasheets' : hash.startsWith('#/builder/commands') ? 'commands' : 'build'

  return (
    <div className="builder-wrap">
      <nav className="subtabs">
        {PAGES.map((p) => (
          <a key={p.id} href={p.href} className={p.id === page ? 'active' : ''}>{p.label}</a>
        ))}
      </nav>
      {!catalog || !view ? (
        <p className="muted">Loading rules data…</p>
      ) : page === 'datasheets' ? (
        <Datasheets view={view} />
      ) : page === 'commands' ? (
        <CommandCards view={view} />
      ) : (
        <ArmyBuilder catalog={catalog} army={army} setArmy={setArmy} view={view} dirty={dirty} markSaved={markSaved} />
      )}
    </div>
  )
}