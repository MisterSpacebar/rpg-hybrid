import { emptyCharacter } from './engine.js'

// The character being edited lives in the browser so it survives reloads and works signed out.
const KEY = 'rpg-hybrid.character.v1'
const SNAP = 'rpg-hybrid.character.saved.v1'

export function loadLocalCharacter() {
  try {
    return { ...emptyCharacter(), ...JSON.parse(localStorage.getItem(KEY)) }
  } catch {
    return emptyCharacter()
  }
}

export const saveLocalCharacter = (c) => localStorage.setItem(KEY, JSON.stringify(c))

// The snapshot is the character as last saved to (or opened from) the account, used to detect unsaved changes.
export const setCharacterSnapshot = (c) => localStorage.setItem(SNAP, JSON.stringify(c))
export const getCharacterSnapshot = () => localStorage.getItem(SNAP)

export const hasUnsavedCharacter = (c) => JSON.stringify(c) !== getCharacterSnapshot() && JSON.stringify(c) !== JSON.stringify(emptyCharacter())
