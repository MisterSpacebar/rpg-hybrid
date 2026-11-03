import {
  addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'

const characters = (uid) => collection(db, 'users', uid, 'characters')

// Firestore rejects undefined values, so the character is round-tripped through JSON first.
const plain = (character) => JSON.parse(JSON.stringify({ ...character, cloudId: null }))

export async function listCharacters(uid) {
  const snap = await getDocs(query(characters(uid), orderBy('updatedAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Creates the character, or updates it when it already has a cloud id. Returns the id.
export async function saveCharacter(uid, character, summary) {
  const data = {
    name: (character.name || 'Unnamed Character').slice(0, 80),
    ancestry: summary.ancestry,
    classId: character.classId,
    subclassId: character.subclassId,
    points: summary.points,
    character: plain(character),
    updatedAt: serverTimestamp(),
  }
  if (character.cloudId) {
    await setDoc(doc(characters(uid), character.cloudId), data, { merge: true })
    return character.cloudId
  }
  const ref = await addDoc(characters(uid), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function duplicateCharacter(uid, saved) {
  const name = `${saved.name} (copy)`.slice(0, 80)
  const ref = await addDoc(characters(uid), {
    name,
    ancestry: saved.ancestry,
    classId: saved.classId,
    subclassId: saved.subclassId,
    points: saved.points,
    character: { ...saved.character, name },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export const deleteCharacter = (uid, id) => deleteDoc(doc(characters(uid), id))
