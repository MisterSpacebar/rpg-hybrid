import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { loadCatalog } from './catalog.js'
import { buildArmyView, migrateUnitConfig, rebalanceSlots } from './engine.js'
import { getSavedSnapshot, loadLocalArmy, saveLocalArmy, setSavedSnapshot } from './storage.js'

export function useArmy() {
  const [catalog, setCatalog] = useState(null)
  const [army, setArmyRaw] = useState(loadLocalArmy)
  const [snapshot, setSnapshot] = useState(getSavedSnapshot)
  const catalogRef = useRef(null)
  catalogRef.current = catalog

  // Every change to the army passes through here, so Units that fit several Recruitment Slots can roll into the open ones.
  const setArmy = useCallback((next) => {
    setArmyRaw((prev) => {
      const value = typeof next === 'function' ? next(prev) : next
      return catalogRef.current ? rebalanceSlots(value, catalogRef.current) : value
    })
  }, [])

  useEffect(() => {
    loadCatalog().then(setCatalog)
  }, [])

  // An army opened from storage may predate the catalog, so settle its slots once the rules data is ready.
  useEffect(() => {
    if (catalog) setArmy((a) => ({ ...a, units: a.units.map((cfg) => {
      const entry = catalog.unitsByKey[cfg.key]
      return entry ? migrateUnitConfig(entry, cfg) : cfg
    }) }))
  }, [catalog, setArmy])

  useEffect(() => {
    saveLocalArmy(army)
  }, [army])

  const view = useMemo(() => (catalog ? buildArmyView(army, catalog) : null), [army, catalog])

  // Called after the army is saved to the account; records the cloud id and resets the unsaved-changes flag.
  const markSaved = (cloudId) => {
    const next = { ...army, cloudId }
    setArmy(next)
    setSavedSnapshot(next)
    setSnapshot(JSON.stringify(next))
  }

  const dirty = JSON.stringify(army) !== snapshot
  return { catalog, army, setArmy, view, dirty, markSaved }
}