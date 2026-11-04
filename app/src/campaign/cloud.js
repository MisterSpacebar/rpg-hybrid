import {
  addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp,
  setDoc, updateDoc, deleteDoc, where,
} from 'firebase/firestore'
import { db } from '../firebase.js'

const root = collection(db, 'campaigns')
const campaignRef = (id) => doc(db, 'campaigns', id)
const membersRef = (id) => collection(db, 'campaigns', id, 'joinRequests')
const heroesRef = (id) => collection(db, 'campaigns', id, 'heroes')
const approvedRef = (id, uid) => doc(db, 'campaigns', id, 'approvedHeroes', uid)

export const FORMATS = {
  local: [3, 4, 5, 6],
  standard: [4, 5, 7, 9],
  long: [5, 6, 8, 10],
  grand: [6, 7, 9, 11],
}

export async function createCampaign(uid, name, format = 'standard') {
  if (!FORMATS[format]) throw new Error('Invalid campaign format')
  const ref = await addDoc(root, {
    name: name.trim().slice(0, 80),
    format,
    gmUid: uid,
    memberUids: [uid],
    act: 1,
    turn: 1,
    xpTotal: 0,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function listMyCampaigns(uid) {
  const snap = await getDocs(query(root, where('memberUids', 'array-contains', uid)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function loadCampaign(id) {
  const snap = await getDoc(campaignRef(id))
  if (!snap.exists()) throw new Error('Campaign not found or access denied')
  return { id: snap.id, ...snap.data() }
}

// Joining is a request; only the GM may add a member. A campaign ID serves as a shareable invite identifier.
export async function requestToJoin(id, uid, displayName) {
  await setDoc(doc(membersRef(id), uid), {
    uid, displayName: (displayName || 'Player').slice(0, 40),
    createdAt: serverTimestamp(),
  })
}

export async function listJoinRequests(id) {
  const snap = await getDocs(membersRef(id))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function approveJoin(campaign, uid) {
  if (!uid || campaign.memberUids.includes(uid)) return
  await updateDoc(campaignRef(campaign.id), {
    memberUids: [...campaign.memberUids, uid],
    updatedAt: serverTimestamp(),
  })
  await deleteDoc(doc(membersRef(campaign.id), uid))
}

export async function rejectJoin(campaignId, uid) {
  await deleteDoc(doc(membersRef(campaignId), uid))
}

export async function updateCampaignProgress(campaign, patch) {
  const permitted = ['xpTotal', 'act', 'turn', 'status']
  const update = Object.fromEntries(Object.entries(patch).filter(([key]) => permitted.includes(key)))
  await updateDoc(campaignRef(campaign.id), { ...update, updatedAt: serverTimestamp() })
}

export async function listCampaignHeroes(id) {
  const snap = await getDocs(heroesRef(id))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function saveHeroDraft(id, uid, sheet) {
  // Each user owns one hero draft for the campaign; replacing a retired hero can be added later.
  const data = JSON.parse(JSON.stringify({ ...sheet, cloudId: null, xpEarned: null }))
  await setDoc(doc(heroesRef(id), uid), {
    ownerUid: uid, sheet: data, updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function loadApprovedHero(id, uid) {
  const snap = await getDoc(approvedRef(id, uid))
  return snap.exists() ? snap.data() : null
}

export async function approveHero(id, uid, sheet) {
  await setDoc(approvedRef(id, uid), {
    ownerUid: uid, sheet: JSON.parse(JSON.stringify(sheet)),
    approvedAt: serverTimestamp(),
  })
}
