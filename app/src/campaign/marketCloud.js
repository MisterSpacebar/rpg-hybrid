import {
  collection, doc, getDoc, onSnapshot, runTransaction, serverTimestamp, setDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { craftRoll, eligibleOffer, priceForFormation, publishableOffer } from './market.js'

const company = (id) => doc(db, 'campaigns', id)
const offers = (id) => collection(db, 'campaigns', id, 'marketOffers')
const purchases = (id) => collection(db, 'campaigns', id, 'marketPurchases')
const owned = (id) => collection(db, 'campaigns', id, 'inventory')
const ledger = (id) => collection(db, 'campaigns', id, 'goldLedger')

export const watchMarketOffers = (id, cb, fail) => onSnapshot(offers(id), (snap) =>
  cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), fail)
export const watchMarketPurchases = (id, cb, fail) => onSnapshot(purchases(id), (snap) =>
  cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), fail)

// Publishing offers is the only GM action required for normal market purchases.
// Its price/eligibility and the inventory template are locked as GM-owned data.
export async function publishMarketOffer(id, uid, input) {
  publishableOffer(input)
  const ref = doc(offers(id))
  const docData = {
    kind: input.kind,
    label: input.label,
    price: input.price,
    enabled: true,
    ...(input.item ? { item: input.item } : {}),
    ...(input.config ? { config: input.config, points: input.points,
      factionId: input.factionId ?? null } : {}),
    ...(input.kind === 'craft' ? { difficulty: input.difficulty,
      check: input.check, materials: input.materials ?? '' } : {}),
    createdBy: uid,
    createdAt: serverTimestamp(),
  }
  await setDoc(ref, docData)
  return ref.id
}

export async function setMarketOfferEnabled(id, offerId, enabled) {
  const ref = doc(offers(id), offerId)
  // Firestore rules allow GM to toggle availability only; price changes
  // require a new offer so historical purchases remain auditable.
  const { updateDoc } = await import('firebase/firestore')
  await updateDoc(ref, { enabled })
}

export async function purchaseOffer(id, uid, offerId, craft = null) {
  const offerRef = doc(offers(id), offerId)
  const companyRef = company(id)
  const purchaseRef = doc(purchases(id))
  const assetRef = doc(owned(id), purchaseRef.id)
  const ledgerRef = doc(ledger(id), purchaseRef.id)

  await runTransaction(db, async (tx) => {
    const [campSnap, offerSnap] = await Promise.all([tx.get(companyRef), tx.get(offerRef)])
    if (!campSnap.exists() || !campSnap.data().memberUids.includes(uid)) throw new Error('You are not a campaign member')
    if (!offerSnap.exists()) throw new Error('This listing is no longer available')
    const campaign = campSnap.data()
    const offer = offerSnap.data()
    if (!eligibleOffer(offer, campaign)) throw new Error('The listing is not available at this campaign stage')
    if (!Number.isInteger(offer.price) || offer.price < 1 ||
      (campaign.goldBalance ?? 0) < offer.price) throw new Error('Insufficient Company Gold')

    if (offer.kind === 'unit' && priceForFormation(offer.points) !== offer.price) {
      throw new Error('The formation is not priced according to the current rules')
    }
    let crafting = null
    if (offer.kind === 'craft') {
      if (!craft || !Array.isArray(craft.dice) || !Number.isInteger(craft.threshold)) {
        throw new Error('Roll your crafting dice before buying')
      }
      const calculated = craftRoll(craft.dice, craft.threshold, offer.difficulty)
      if (craft.successes !== calculated.successes || craft.surges !== calculated.surges ||
        craft.blunders !== calculated.blunders) {
        throw new Error('Recorded crafting results do not match the dice')
      }
      crafting = calculated
    }

    const balance = (campaign.goldBalance ?? 0) - offer.price
    tx.update(companyRef, {
      goldBalance: balance,
      lastPurchaseId: purchaseRef.id,
      lastPurchaseOfferId: offerId,
      lastPurchaseUid: uid,
      updatedAt: serverTimestamp(),
    })
    tx.set(purchaseRef, {
      offerId, ownerUid: uid, kind: offer.kind, price: offer.price,
      balanceAfter: balance, status: 'completed', createdAt: serverTimestamp(),
      ...(crafting ? { crafting } : {}),
    })
    tx.set(ledgerRef, {
      actorUid: uid, delta: -offer.price, balanceAfter: balance,
      reason: `Market: ${offer.label}`, kind: 'market', purchaseId: purchaseRef.id,
      createdAt: serverTimestamp(),
    })
    if (offer.kind === 'unit' || offer.kind === 'equipment' ||
      (offer.kind === 'craft' && crafting?.success)) {
      tx.set(assetRef, {
        kind: offer.kind === 'unit' ? 'unit' : 'equipment',
        ...(offer.kind === 'unit' ? { config: offer.config, factionId: offer.factionId ?? null }
          : { item: offer.item, ownerUid: null }),
        purchaseId: purchaseRef.id, createdAt: serverTimestamp(),
        ...(crafting ? { crafting } : {}),
      })
    }
  })
}
