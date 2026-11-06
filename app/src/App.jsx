import { useEffect, useState } from 'react'
import ArmySection from './components/army/ArmySection.jsx'
import CharacterSection from './components/character/CharacterSection.jsx'
import MyLibrary from './components/shared/MyLibrary.jsx'
import CampaignSection from './campaign/CampaignSection.jsx'
import UserMenu from './components/shared/UserMenu.jsx'
import RulesPage from './components/rules/RulesPage.jsx'

// Hash routing keeps the app host-agnostic; swap for react-router when more pages (login, armies) arrive.
function useHash() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

const TABS = [
  { id: 'rules', label: 'Rules' },
  { id: 'appendices', label: 'Appendices' },
  { id: 'builder', label: 'Army Builder' },
  { id: 'character', label: 'Characters' },
  { id: 'campaign', label: 'Campaigns' },
  { id: 'library', label: 'My Library' },
]

export default function App() {
  const hash = useHash()
  const [, tab = 'rules'] = hash.match(/^#\/([^/]+)/) ?? []
  // #/armies was the old name of the library tab; keep old links working.
  const route = tab === 'armies' ? 'library' : tab
  const activeTab = TABS.some((t) => t.id === route) ? route : 'rules'
  return (
    <div className="app">
      <header className="topbar">
        <a href="#/rules" className="brand">RPG Hybrid</a>
        <nav>
          {TABS.map((t) => (
            <a key={t.id} href={`#/${t.id}`} className={t.id === activeTab ? 'active' : ''}>
              {t.label}
            </a>
          ))}
        </nav>
        <div className="topbar-user"><UserMenu /></div>
      </header>
      {activeTab === 'builder' && <ArmySection hash={hash} />}
      {activeTab === 'character' && <CharacterSection hash={hash} />}
      {activeTab === 'library' && <MyLibrary hash={hash} />}
      {activeTab === 'campaign' && <CampaignSection hash={hash} />}
      {(activeTab === 'rules' || activeTab === 'appendices') && <RulesPage key={activeTab} tab={activeTab} hash={hash} />}
    </div>
  )
}