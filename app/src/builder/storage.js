import { emptyArmy } from './engine.js'

// The army being edited lives in the browser so it survives reloads and works signed out.
const KEY = 'rpg-hybrid.army.v1'
const SNAP = 'rpg-hybrid.army.saved.v1'

export function loadLocalArmy() {
  try {
    return { ...emptyArmy(), ...JSON.parse(localStorage.getItem(KEY)) }
  } catch {
    return emptyArmy()
  }
}

export const saveLocalArmy = (army) => localStorage.setItem(KEY, JSON.stringify(army))

// The snapshot is the army as it was last saved to (or opened from) the account, used to detect unsaved changes.
export const setSavedSnapshot = (army) => localStorage.setItem(SNAP, JSON.stringify(army))
export const getSavedSnapshot = () => localStorage.getItem(SNAP)

export const hasUnsavedWork = (army) =>
  army.units.length > 0 && JSON.stringify(army) !== getSavedSnapshot()
