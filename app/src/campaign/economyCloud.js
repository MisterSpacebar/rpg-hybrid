import {
  addDoc, collection, doc, getDoc, onSnapshot, runTransaction, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import {
  validateRequestInput, resolveCraft, goldForRecruitment, goldForFlex,
  affordable, FLEX_SLOTS,
} from './economy.js'

const campaignRef = (id) => doc(db, 'campaigns', id)
const requests = (id) => collection(db, 'campaigns', id, 'acquisitionRequests')
const entries = (id) => collection(db, 'campaigns', id, 'goldLedger')
const inventory = (id) => collection(db, 'campaigns', id, 'inventory')
const entitlement = (id, uid) => doc(db, 'campaigns', id, 'entitlements', uid)
const unwrap = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }))

export const watchAcquisitionRequests = (id, cb, fail) =>
  onSnapshot(requests(id), (snap) => cb(unwrap(snap)), fail)
export const watchGoldLedger = (id, cb, fail) =>
  onSnapshot(entries(id), (snap) => cb(unwrap(snap).sort((a, b) =>
    (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))), fail)

export async function submitAcquisition(id, uid, fields) {
  const input = { ...fields, ownerUid: uid, note: fields.note ?? '' }
  validateRequestInput(input)
  const payload = {
    kind: input.kind, ownerUid: uid, status: 'pending', note: input.note,
    createdAt: serverTimestamp(),
  }
  if (['craft', 'equipment'].includes(input.kind)) payload.item = {
    kind: input.item.kind, name: input.item.name,
  }
  if (input.kind === 'craft') {
    payload.check = input.check
    payload.materials = input.materials
  }
  if (input.kind === 'recruit') {
    payload.config = JSON.parse(JSON.stringify(input.config))
    payload.factionId = input.factionId ?? null
  }
  if (input.kind === 'flex') payload.slot = input.slot
  return (await addDoc(requests(id), payload)).id
}

export async function rejectAcquisition(id, requestId, gmUid, note = '') {
  const ref = doc(requests(id), requestId)
  await runTransaction(db, async (tx) => {
    const [campaignSnap, requestSnap] = await Promise.all([
      tx.get(campaignRef(id)), tx.get(ref),
    ])
    if (!campaignSnap.exists() || campaignSnap.data().gmUid !== gmUid) throw new Error('GM permission required')
    if (!requestSnap.exists() || requestSnap.data().status !== 'pending') throw new Error('Request already resolved')
    tx.update(ref, { status: 'rejected', resolutionNote: String(note).slice(0, 500),
      resolvedBy: gmUid, resolvedAt: serverTimestamp() })
  })
}

export async function awardGold(id, gmUid, amount, reason) {
  if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 1000) throw new Error('Enter a nonzero whole Gold amount (up to 1,000)')
  if (!reason?.trim() || reason.length > 150) throw new Error('Enter a reason for the treasury transaction')
  const account = campaignRef(id)
  const ledgerEntry = doc(entries(id))
  await runTransaction(db, async (tx) => {
    const snapshot = await tx.get(account)
    if (!snapshot.exists() || snapshot.data().gmUid !== gmUid) throw new Error('GM permission required')
    const balance = snapshot.data().goldBalance ?? 0
    if (!Number.isInteger(balance) || balance + amount < 0) throw new Error('Insufficient Company Gold')
    tx.update(account, { goldBalance: balance + amount, updatedAt: serverTimestamp() })
    tx.set(ledgerEntry, {
      delta: amount, balanceAfter: balance + amount, reason: reason.trim(),
      actorUid: gmUid, createdAt: serverTimestamp(), kind: 'adjustment',
    })
  })
}

export async function resolveAcquisition(id, requestId, gmUid, approval) {
  const reqRef = doc(requests(id), requestId)
  const companyRef = campaignRef(id)
  const itemRef = doc(inventory(id))
  const ledgerRef = doc(entries(id))
  const cost = Number(approval.goldCost)
  const discount = Number(approval.discount ?? 0)
  if (!Number.isInteger(cost) || cost < 0 || cost > 1000 ||
      !Number.isInteger(discount) || discount < 0 || discount > cost)
    throw new Error('Gold costs and discounts must be whole nonnegative values')
  const paid = cost - discount
  const note = String(approval.note ?? '').slice(0, 500)
  const outcome = approval.crafting ?? null
  if (outcome) resolveCraft(outcome)

  await runTransaction(db, async (tx) => {
    const [companySnap, reqSnap] = await Promise.all([
      tx.get(companyRef), tx.get(reqRef),
    ])
    if (!companySnap.exists() || companySnap.data().gmUid !== gmUid) throw new Error('GM permission required')
    if (!reqSnap.exists() || reqSnap.data().status !== 'pending') throw new Error('Request already resolved')
    const request = reqSnap.data()
    const balance = companySnap.data().goldBalance ?? 0
    if (!affordable(balance, paid)) throw new Error('Insufficient Company Gold')
    if (request.kind === 'recruit') {
      if (companySnap.data().act < 2 || !companySnap.data().patronFactionId)
        throw new Error('Military recruitment is locked until Act II and a Patron is chosen')
      const points = Number(approval.formationPoints)
      if (!Number.isInteger(points) || points < 1 || goldForRecruitment(points) !== cost)
        throw new Error('Recruitment cost must match the resolved formation Points')
    }
    if (request.kind === 'flex') {
      if (cost !== goldForFlex()) throw new Error('Flex slot costs 2 Gold')
      if (!FLEX_SLOTS.includes(request.slot)) throw new Error('Invalid Flex slot')
    }
    if (request.kind === 'craft' && !outcome) throw new Error('GM must enter the crafting roll result')
    const crafted = outcome ? resolveCraft(outcome) : null
    let priorEntitlement
    if (request.kind === 'flex') {
      const entRef = entitlement(id, request.ownerUid)
      const entSnap = await tx.get(entRef)
      priorEntitlement = { ref: entRef, value: entSnap.exists() ? entSnap.data() : { flexSlots: [], grandThirdCommand: false } }
      if ((priorEntitlement.value.flexSlots ?? []).length >= 2) throw new Error('PC already has both Flex slots')
    }
    // All reads are complete; the following writes commit atomically.
    if (paid > 0) {
      tx.update(companyRef, { goldBalance: balance - paid, updatedAt: serverTimestamp() })
      tx.set(ledgerRef, {
        delta: -paid, balanceAfter: balance - paid,
        reason: `${request.kind} acquisition`, requestId, actorUid: gmUid,
        createdAt: serverTimestamp(), kind: 'acquisition',
      })
    }
    if (priorEntitlement) {
      const value = priorEntitlement.value
      tx.set(priorEntitlement.ref, {
        ...value, flexSlots: [...(value.flexSlots ?? []), request.slot],
        grandThirdCommand: value.grandThirdCommand === true,
      })
    }
    const producesItem = ['equipment', 'recruit'].includes(request.kind) ||
      (request.kind === 'craft' && crafted.success)
    if (producesItem) {
      if (request.kind === 'recruit') {
        tx.set(itemRef, {
          kind: 'unit', config: request.config, factionId: request.factionId ?? null,
          acquisitionRequestId: requestId, createdAt: serverTimestamp(),
        })
      } else {
        tx.set(itemRef, {
          kind: 'equipment', item: request.item,
          // Outcomes are recorded for GM review; quality bonuses are NOT silently
          // applied until their equipment effects and Points are supported.
          ...(crafted ? { crafting: { ...crafted, ...outcome, note } } : {}),
          ownerUid: null, acquisitionRequestId: requestId, createdAt: serverTimestamp(),
        })
      }
    }
    tx.update(reqRef, {
      status: 'approved', resolutionNote: note, resolvedBy: gmUid,
      resolvedAt: serverTimestamp(), goldCost: cost, discount, paid,
      ...(request.kind === 'recruit' ? { formationPoints: Number(approval.formationPoints) } : {}),
      ...(crafted ? { crafting: { ...crafted, ...outcome } } : {}),
    })
  })
}
