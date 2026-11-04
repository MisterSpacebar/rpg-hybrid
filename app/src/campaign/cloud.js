import {
  addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp,
  setDoc, updateDoc, deleteDoc, where,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { FORMATS, baseXp, bonusXp } from './limits.js'

const root = collection(db, 'campaigns')
const campaignRef = (id) => doc(db, 'campaigns', id)
const membersRef = (id) => collection(db, 'campaigns', id, 'joinRequests')
const heroesRef = (id) => collection(db, 'campaigns', id, 'heroes')
const approvedRef = (id, uid) => doc(db, 'campaigns', id, 'approvedHeroes', uid)

export { FORMATS }

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
    bonusXp: 0,
    status: 'active',
    patronFactionId: null,
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
  const next = { ...campaign, ...patch }
  if (!FORMATS[next.format] || next.turn < 1) throw new Error('Invalid campaign position')
  const bonus = Number.isInteger(patch.bonusXp) ? patch.bonusXp : bonusXp(campaign)
  if (bonus < 0) throw new Error('Bonus XP cannot be negative')
  const xpTotal = baseXp(next.format, next.act, next.turn) + bonus
  if (xpTotal < campaign.xpTotal) throw new Error('Campaign XP cannot decrease; progress only moves forward')
  const update = {
    act: next.act, turn: next.turn, status: next.status ?? 'active',
    patronFactionId: next.patronFactionId || null, bonusXp: bonus, xpTotal: Math.min(xpTotal, 250),
  }
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

export async function listApprovedHeroes(id) {
  const snap = await getDocs(collection(db, 'campaigns', id, 'approvedHeroes'))
  return snap.docs.map((d) => ({ ownerUid: d.id, ...d.data() }))
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

// Campaigns the user belongs to, with their own campaign character where one exists.
export async function listMyCampaignsWithHeroes(uid) {
  const campaigns = await listMyCampaigns(uid)
  return Promise.all(campaigns.map(async (c) => {
    const snap = await getDoc(doc(heroesRef(c.id), uid))
    return { ...c, role: c.gmUid === uid ? 'GM' : 'PC', hero: snap.exists() ? snap.data().sheet : null }
  }))
}

// Removal helpers. Subdocuments are deleted before the parent because security rules look up the campaign document.
const removeDocs = async (refs) => { await Promise.all(refs.map((ref) => deleteDoc(ref))) }

// A player deleting their own character also releases their reserved formations and equipment.
export async function deleteMyHero(id, uid) {
  await removeDocs([doc(heroesRef(id), uid), detachmentRef(id, uid)])
}

// Revoking an approval leaves the player's draft in place so they can be re-approved after edits.
export async function revokeApproval(id, uid) {
  await deleteDoc(approvedRef(id, uid))
}

export async function removePlayer(campaign, uid) {
  if (uid === campaign.gmUid) throw new Error('The GM cannot be removed')
  await removeDocs([
    doc(heroesRef(campaign.id), uid), approvedRef(campaign.id, uid),
    detachmentRef(campaign.id, uid), entitlementsRef(campaign.id, uid), doc(membersRef(campaign.id), uid),
  ])
  await updateDoc(campaignRef(campaign.id), {
    memberUids: campaign.memberUids.filter((m) => m !== uid), updatedAt: serverTimestamp(),
  })
}

export async function deleteCampaign(id) {
  for (const name of ['heroes', 'approvedHeroes', 'detachments', 'entitlements', 'inventory', 'joinRequests']) {
    const snap = await getDocs(collection(db, 'campaigns', id, name))
    await removeDocs(snap.docs.map((d) => d.ref))
  }
  await deleteDoc(campaignRef(id))
}

// Live listeners: each returns an unsubscribe function.
export const watchMyCampaigns = (uid, cb, onError) => onSnapshot(
  query(root, where('memberUids', 'array-contains', uid)),
  (snapshot) => cb(docs(snapshot)), onError,
)

const docs = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }))
const owned = (snap) => snap.docs.map((d) => ({ ownerUid: d.id, ...d.data() }))
export const watchCampaign = (id, cb, onError) => onSnapshot(
  campaignRef(id), { includeMetadataChanges: true },
  (snapshot) => cb(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null, {
    fromCache: snapshot.metadata.fromCache,
    hasPendingWrites: snapshot.metadata.hasPendingWrites,
  }), onError,
)
export const watchHeroes = (id, cb, onError) => onSnapshot(heroesRef(id), (s) => cb(docs(s)), onError)
export const watchInventory = (id, cb, onError) => onSnapshot(inventoryRef(id), (s) => cb(docs(s)), onError)
export const watchDetachments = (id, cb, onError) => onSnapshot(collection(db, 'campaigns', id, 'detachments'), (s) => cb(owned(s)), onError)
export const watchApprovedHeroes = (id, cb, onError) => onSnapshot(collection(db, 'campaigns', id, 'approvedHeroes'), (s) => cb(owned(s)), onError)
export const watchJoinRequests = (id, cb, onError) => onSnapshot(membersRef(id), (s) => cb(docs(s)), onError)
export const watchEntitlements = (id, cb, onError) => onSnapshot(collection(db, 'campaigns', id, 'entitlements'), (s) => cb(Object.fromEntries(s.docs.map((d) => [d.id, d.data()]))), onError)

// Subscribe to Library campaign rows and the current user's character in each.
// Both membership changes and character edits are reflected without a reload.
export function watchMyCampaignsWithHeroes(uid, onChange, onError) {
  let campaigns = []
  const heroes = new Map()
  const listeners = new Map()
  let active = true
  const emit = () => {
    if (!active) return
    onChange(campaigns.map((c) => ({
      ...c, role: c.gmUid === uid ? 'GM' : 'PC', hero: heroes.get(c.id) ?? null,
    })))
  }
  const stopCampaigns = watchMyCampaigns(uid, (list) => {
    campaigns = list
    const ids = new Set(list.map((c) => c.id))
    for (const [id, stop] of listeners) {
      if (!ids.has(id)) { stop(); listeners.delete(id); heroes.delete(id) }
    }
    for (const c of list) {
      if (listeners.has(c.id)) continue
      listeners.set(c.id, onSnapshot(doc(heroesRef(c.id), uid), (snap) => {
        heroes.set(c.id, snap.exists() ? snap.data().sheet : null)
        emit()
      }, onError))
    }
    emit()
  }, onError)
  return () => {
    active = false
    stopCampaigns()
    for (const stop of listeners.values()) stop()
    listeners.clear()
  }
}
