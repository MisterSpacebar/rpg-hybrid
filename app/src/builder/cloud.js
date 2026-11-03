import {
  addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'

const armies = (uid) => collection(db, 'users', uid, 'armies')

// Firestore rejects undefined values, so the army is round-tripped through JSON first.
const plain = (army) => JSON.parse(JSON.stringify({ ...army, cloudId: null }))

export async function listArmies(uid) {
  const snap = await getDocs(query(armies(uid), orderBy('updatedAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Creates the army, or updates it when it already has a cloud id. Returns the id.
export async function saveArmy(uid, army, summary) {
  const data = {
    name: (army.name || 'Untitled Army').slice(0, 80),
    factionId: army.factionId ?? null,
    points: summary.points,
    unitCount: army.units.length,
    army: plain(army),
    updatedAt: serverTimestamp(),
  }
  if (army.cloudId) {
    await setDoc(doc(armies(uid), army.cloudId), data, { merge: true })
    return army.cloudId
  }
  const ref = await addDoc(armies(uid), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function duplicateArmy(uid, saved) {
  const ref = await addDoc(armies(uid), {
    name: `${saved.name} (copy)`.slice(0, 80),
    factionId: saved.factionId ?? null,
    points: saved.points,
    unitCount: saved.unitCount,
    army: { ...saved.army, name: `${saved.name} (copy)`.slice(0, 80) },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export const deleteArmy = (uid, id) => deleteDoc(doc(armies(uid), id))
