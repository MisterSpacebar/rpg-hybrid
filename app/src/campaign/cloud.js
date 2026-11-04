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

const inventoryRef = (id) => collection(db, 'campaigns', id, 'inventory')
const detachmentRef = (id, uid) => doc(db, 'campaigns', id, 'detachments', uid)
const entitlementsRef = (id, uid) => doc(db, 'campaigns', id, 'entitlements', uid)

export async function listInventory(id) {
  const snap = await getDocs(inventoryRef(id))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Only the GM can grant items or recruit permanent formations.
// Point values must be calculated from the catalogue, never trusted from saved data.
export async function grantEquipment(id, kind, name, ownerUid = null) {
  if (!['melee', 'ranged', 'armor', 'shield', 'focus', 'artifact', 'relic'].includes(kind)) throw new Error('Invalid equipment category')
  const ref = await addDoc(inventoryRef(id), {
    kind: 'equipment', item: { kind, name }, ownerUid: ownerUid || null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}
export async function grantFormation(id, config, factionId = null) {
  const ref = await addDoc(inventoryRef(id), {
    kind: 'unit', config: JSON.parse(JSON.stringify(config)), factionId,
    createdAt: serverTimestamp(),
  })
  return ref.id
}
export async function removeInventoryItem(id, itemId) {
  await deleteDoc(doc(inventoryRef(id), itemId))
}
export async function loadEntitlement(id, uid) {
  const snap = await getDoc(entitlementsRef(id, uid))
  return snap.exists() ? snap.data() : { patronSlots: [], flexSlots: [], grandThirdCommand: false }
}
export async function setEntitlement(id, uid, data) {
  await setDoc(entitlementsRef(id, uid), {
    patronSlots: (data.patronSlots ?? []).slice(0, 2),
    flexSlots: (data.flexSlots ?? []).slice(0, 2),
    grandThirdCommand: data.grandThirdCommand === true,
  })
}
export async function listDetachments(id) {
  const snap = await getDocs(collection(db, 'campaigns', id, 'detachments'))
  return snap.docs.map((d) => ({ ownerUid: d.id, ...d.data() }))
}
export async function saveDetachment(id, uid, data) {
  await setDoc(detachmentRef(id, uid), {
    ownerUid: uid,
    doctrineId: data.doctrineId ?? null,
    commands: data.commands ?? [],
    selections: data.selections ?? [],
    updatedAt: serverTimestamp(),
  })
}
