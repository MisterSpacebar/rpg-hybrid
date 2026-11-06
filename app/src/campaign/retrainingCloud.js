import {
  collection, doc, onSnapshot, runTransaction, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { developOrderId, RETRAINING_GOLD, checkRetraining, replacedTalents } from './retraining.js'
import { committedTalentIssues } from './talentCommitment.js'

const campaignRef = (id) => doc(db, 'campaigns', id)
const heroRef = (id, uid) => doc(db, 'campaigns', id, 'heroes', uid)
const requestRef = (id, requestId) => doc(db, 'campaigns', id, 'retrainingRequests', requestId)
const goldRef = (id, requestId) => doc(db, 'campaigns', id, 'goldLedger', requestId)
const approvalRef = (id, uid) => doc(db, 'campaigns', id, 'approvedHeroes', uid)
export const retrainingRequestId = (uid, orderId) => `retrain-${uid}-${orderId}`

export const watchRetrainingRequests = (id, cb, fail) =>
  onSnapshot(collection(db, 'campaigns', id, 'retrainingRequests'),
    (snap) => cb(snap.docs.map((x) => ({ id: x.id, ...x.data() }))), fail)

export async function openDevelopOrder(id, gmUid) {
  await runTransaction(db, async (tx) => {
    const ref = campaignRef(id)
    const snap = await tx.get(ref)
    if (!snap.exists() || snap.data().gmUid !== gmUid) throw new Error('GM permission required')
    const campaign = snap.data()
    if (campaign.status === 'completed') throw new Error('Campaign already completed')
    const order = developOrderId(campaign)
    if (campaign.retrainOrderUsed === order) throw new Error('The Retraining opportunity was already used this Turn')
    tx.update(ref, { activeDevelopOrder: order, updatedAt: serverTimestamp() })
  })
}

export async function submitRetraining(id, uid, data, tier, index, newTalent) {
  const orderRef = campaignRef(id)
  const hero = heroRef(id, uid)
  await runTransaction(db, async (tx) => {
    const [campaignSnap, heroSnap] = await Promise.all([tx.get(orderRef), tx.get(hero)])
    if (!campaignSnap.exists() || !(campaignSnap.data().memberUids ?? []).includes(uid) ||
        campaignSnap.data().gmUid === uid) throw new Error('You are not a participating PC')
    const campaign = campaignSnap.data()
    const order = developOrderId(campaign)
    if (campaign.activeDevelopOrder !== order || campaign.retrainOrderUsed === order) {
      throw new Error('Retraining is available only when the GM plays Develop for the current Turn')
    }
    if (!heroSnap.exists()) throw new Error('Save your Character before Retraining')
    const sheet = heroSnap.data().sheet
    const legal = checkRetraining(sheet, data, tier, index, newTalent)
    if (!legal.ok) throw new Error(legal.error)
    const ref = requestRef(id, retrainingRequestId(uid, order))
    const old = await tx.get(ref)
    if (old.exists()) throw new Error('You already submitted a Retraining request this Develop Order')
    tx.set(ref, {
      ownerUid: uid, orderId: order, status: 'requested', tier, index,
      newTalent, createdAt: serverTimestamp(),
    })
  })
}

export async function resolveRetraining(id, requestId, gmUid, data, approve) {
  const ref = requestRef(id, requestId)
  const company = campaignRef(id)
  const ledger = goldRef(id, requestId)
  await runTransaction(db, async (tx) => {
    const [campSnap, requestSnap] = await Promise.all([tx.get(company), tx.get(ref)])
    if (!campSnap.exists() || campSnap.data().gmUid !== gmUid) throw new Error('GM permission required')
    if (!requestSnap.exists() || requestSnap.data().status !== 'requested') throw new Error('Request is no longer pending')
    const campaign = campSnap.data()
    const req = requestSnap.data()
    const hero = heroRef(id, req.ownerUid)
    const heroSnap = await tx.get(hero)
    if (!heroSnap.exists()) throw new Error('Hero no longer exists')
    if (!approve) {
      tx.update(ref, { status: 'declined', resolvedBy: gmUid, resolvedAt: serverTimestamp() })
      return
    }
    if (campaign.activeDevelopOrder !== req.orderId ||
        developOrderId(campaign) !== req.orderId ||
        campaign.retrainOrderUsed === req.orderId) throw new Error('This Develop Order is no longer available')
    if ((campaign.goldBalance ?? 0) < RETRAINING_GOLD) throw new Error('The Company treasury needs 2 Gold')
    const sheet = heroSnap.data().sheet
    const result = checkRetraining(sheet, data, req.tier, req.index, req.newTalent)
    if (!result.ok) throw new Error(result.error)
    const gold = campaign.goldBalance - RETRAINING_GOLD
    tx.update(company, {
      goldBalance: gold, retrainOrderUsed: req.orderId, updatedAt: serverTimestamp(),
    })
    tx.set(ledger, {
      delta: -RETRAINING_GOLD, balanceAfter: gold,
      actorUid: gmUid, reason: `Develop Talent Retraining: ${req.ownerUid}`,
      kind: 'retraining', retrainingId: requestId, createdAt: serverTimestamp(),
    })
    tx.update(ref, {
      status: 'approved', resolvedBy: gmUid, resolvedAt: serverTimestamp(),
      proposedTalents: result.candidate.talents,
      originalTalents: sheet.talents,
      paid: RETRAINING_GOLD,
    })
  })
}

export async function finalizeRetraining(id, requestId, gmUid, data) {
  const ref = requestRef(id, requestId)
  await runTransaction(db, async (tx) => {
    const campaign = campaignRef(id)
    const [campSnap, requestSnap] = await Promise.all([tx.get(campaign), tx.get(ref)])
    if (!campSnap.exists() || campSnap.data().gmUid !== gmUid) throw new Error('GM permission required')
    if (!requestSnap.exists() || requestSnap.data().status !== 'approved') throw new Error('Retraining was not approved or already applied')
    const req = requestSnap.data()
    if (developOrderId(campSnap.data()) === req.orderId) {
      throw new Error('Retraining takes effect only after the current Turn has ended')
    }
    const hero = heroRef(id, req.ownerUid)
    const approved = approvalRef(id, req.ownerUid)
    const [heroSnap, approvedSnap] = await Promise.all([tx.get(hero), tx.get(approved)])
    if (!heroSnap.exists()) throw new Error('Hero no longer exists')
    const sheet = heroSnap.data().sheet
    if (committedTalentIssues(sheet.talents, req.originalTalents).length ||
        committedTalentIssues(req.originalTalents, sheet.talents).length) {
      throw new Error('Hero Talents changed since the Retraining was paid for; GM reconciliation required')
    }
    const result = checkRetraining(sheet, data, req.tier, req.index, req.newTalent)
    if (!result.ok) throw new Error(result.error)
    // All other saved Character choices remain unchanged.
    tx.update(hero, {
      sheet: { ...sheet, talents: req.proposedTalents },
      lastRetrainingId: requestId,
      updatedAt: serverTimestamp(),
    })
    tx.update(ref, { status: 'applied', appliedAt: serverTimestamp() })
    if (approvedSnap.exists()) tx.delete(approved)
  })
}
