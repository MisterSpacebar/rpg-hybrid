import { useEffect, useMemo, useState } from 'react'
import { loadCharacterData } from './data.js'
import { derive, emptyCharacter, normalizeCharacter } from './engine.js'
import { getCharacterSnapshot, loadLocalCharacter, saveLocalCharacter, setCharacterSnapshot } from './storage.js'

export function useCharacter() {
  const [data, setData] = useState(null)
  const [stored, setStored] = useState(loadLocalCharacter)
  const [snapshot, setSnapshot] = useState(getCharacterSnapshot)

  useEffect(() => {
    loadCharacterData().then(setData)
  }, [])

  // Every edit goes through normalization, so class changes and removed talents can never leave an illegal sheet behind.
  const character = useMemo(() => (data ? normalizeCharacter(stored, data) : stored), [stored, data])
  const update = (patch) =>
    setStored((c) => {
      const base = data ? normalizeCharacter(c, data) : c
      return { ...base, ...(typeof patch === 'function' ? patch(base) : patch) }
    })
  const reset = () => setStored(emptyCharacter())

  useEffect(() => {
    saveLocalCharacter(character)
  }, [character])

  const view = useMemo(() => (data ? derive(character, data) : null), [character, data])

  // Called after the character is saved to the account; records the cloud id and resets the unsaved-changes flag.
  const markSaved = (cloudId) => {
    const next = { ...character, cloudId }
    setStored(next)
    setCharacterSnapshot(next)
    setSnapshot(JSON.stringify(next))
  }

  const dirty = JSON.stringify(character) !== snapshot
  return { data, character, update, reset, view, dirty, markSaved }
}
