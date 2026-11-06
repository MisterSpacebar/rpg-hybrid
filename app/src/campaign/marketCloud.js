import {
  collection, doc, getDoc, onSnapshot, runTransaction, serverTimestamp, setDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { craftRoll, eligibleOffer, priceForFormation, publishableOffer } from './market.js'
import { newUnitConfig, resolveUnit } from '../builder/engine.js'
import { patronCoreProfiles, standardOfferId } from './recruitmentAccess.js'
import { standardOffers } from './defaultShop.js'
import { standardEnchantOffers } from './defaultEnchantShop.js'
import { standardWorkshopOffers } from './defaultWorkshop.js'
import { MAX_WORK_EVENTS, validateQualityPlan, eligibleDeteriorations, repairOptions } from './qualityEngine.js'

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
    ...(['craft', 'enchant', 'improve', 'repair'].includes(input.kind) ? { difficulty: input.difficulty,
      check: input.check, materials: input.materials ?? '' } : {}),
    ...(input.kind === 'enchant' ? { enchantKey: input.enchantKey, targetKind: input.targetKind } : {}),
    ...(['improve','repair'].includes(input.kind) ? { targetKind: input.targetKind } : {}),
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

export async function purchaseOffer(id, uid, offerId, craft = null, targetItemId = null, work = null, data = null) {
  const offerRef = doc(offers(id), offerId)
  const companyRef = company(id)
  const purchaseRef = doc(purchases(id))
  const assetRef = doc(owned(id), purchaseRef.id)
  const ledgerRef = doc(ledger(id), purchaseRef.id)
  const targetRef = targetItemId ? doc(owned(id), targetItemId) : null

  await runTransaction(db, async (tx) => {
    const [campSnap, offerSnap, targetSnap] = await Promise.all([
      tx.get(companyRef), tx.get(offerRef), targetRef ? tx.get(targetRef) : Promise.resolve(null),
    ])
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
    if (['enchant','improve','repair'].includes(offer.kind)) {
      if (!targetSnap?.exists() || targetSnap.data().kind !== 'equipment' || targetSnap.data().item?.kind !== offer.targetKind) throw new Error('Choose compatible Company equipment')
      if (!targetItemId || (offer.kind === 'enchant' && !offer.enchantKey)) throw new Error('Missing item or project')
      if (offer.kind === 'enchant' && (targetSnap.data().enchants ?? []).some((e) => e.key === offer.enchantKey)) throw new Error('Already enchanted with this effect')
      if (offer.kind === 'enchant' && (targetSnap.data().enchants ?? []).length >= 3) throw new Error('Item has reached its normal enchantment capacity')
      if (targetSnap.data().ownerUid && targetSnap.data().ownerUid !== uid) throw new Error('Item is reserved for another PC')
    }
    if (['craft', 'enchant', 'improve', 'repair'].includes(offer.kind)) {
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
    // Only a specific owned item can acquire permanent rank/defect history.
    // All work is applied in the same atomic Gold-and-purchase transaction.
    let workshop = null
    if (crafting && data) {
      const base = offer.kind === 'craft'
        ? { ...offer.item, workshopEvents: [], enchants: [] }
        : { ...targetSnap?.data()?.item, enchants: targetSnap?.data()?.enchants ?? [],
            workshopEvents: targetSnap?.data()?.workshopEvents ?? [] }
      if (offer.kind === 'enchant' && crafting.success) {
        base.enchants = [...base.enchants, { key: offer.enchantKey }]
      }
      const plan = Array.isArray(work?.plan) ? work.plan : []
      const repair = work?.repair ?? null
      const flaw = work?.flaw ?? null
      if (offer.kind === 'repair') {
        if (plan.length) throw new Error('Repairs cannot also purchase new Qualities')
        if (crafting.success && !repairOptions(base, data).includes(repair)) {
          throw new Error('Select a damaged item statistic to restore')
        }
      } else {
        if (repair) throw new Error('Only Repair projects can remove deterioration')
        validateQualityPlan(base, data, crafting, plan, {
          magical: offer.check?.toLowerCase().includes('mysticism'),
        })
      }
      if (flaw && (!crafting.blunders || (offer.kind === 'craft' && !crafting.success) ||
          !eligibleDeteriorations(base, data, crafting.success ? plan : []).includes(flaw))) {
        throw new Error('The Blunder must affect a valid, reducible item statistic')
      }
      if (crafting.blunders && (offer.kind !== 'craft' || crafting.success) && !flaw) {
        throw new Error('A Blunder must deteriorate an eligible equipment stat')
      }
      if (!crafting.success && plan.length) throw new Error('Failed projects cannot grant Qualities')
      if (!crafting.success && repair) throw new Error('Unsuccessful repairs cannot remove deterioration')
      if ((base.workshopEvents?.length ?? 0) >= MAX_WORK_EVENTS) {
        throw new Error('The item has reached its recorded work history limit')
      }
      workshop = { kind: offer.kind, plan, repair: crafting.success ? repair : null,
        flaw, purchaseId: purchaseRef.id }
    } else if (crafting && work?.plan?.length) {
      throw new Error('Equipment rules data required for permanent improvements')
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
      ...(['enchant','improve','repair'].includes(offer.kind) ? { targetItemId } : {}),
      ...(workshop ? { workshop } : {}),
    })
    tx.set(ledgerRef, {
      actorUid: uid, delta: -offer.price, balanceAfter: balance,
      reason: `Market: ${offer.label}`, kind: 'market', purchaseId: purchaseRef.id,
      createdAt: serverTimestamp(),
    })
    if (['enchant','improve','repair'].includes(offer.kind)) {
      const next = {}
      if (offer.kind === 'enchant' && crafting?.success) {
        next.enchants = [...(targetSnap.data().enchants ?? []), { key: offer.enchantKey }]
        next.lastEnhancementId = purchaseRef.id
      }
      if (workshop) {
        next.workshopEvents = [...(targetSnap.data().workshopEvents ?? []), workshop]
        next.lastWorkshopId = purchaseRef.id
      }
      if (Object.keys(next).length) tx.update(targetRef, { ...next, updatedAt: serverTimestamp() })
    }
    if (offer.kind === 'unit' || offer.kind === 'equipment' ||
      (offer.kind === 'craft' && crafting?.success)) {
      tx.set(assetRef, {
        kind: offer.kind === 'unit' ? 'unit' : 'equipment',
        ...(offer.kind === 'unit' ? { config: offer.config, factionId: offer.factionId ?? null }
          : { item: offer.item, ownerUid: null }),
        purchaseId: purchaseRef.id, createdAt: serverTimestamp(),
        ...(crafting ? { crafting } : {}),
        ...(workshop ? { workshopEvents: [workshop], lastWorkshopId: purchaseRef.id } : {}),
      })
    }
  })
}

// A one-time entitlement unlock makes standard recruitment available without
// the GM publishing each profile. Seed every generic template up front so
// newly acquired personal Doctrine/Flex slots work without another GM action.
// The UI filters generic profiles by the current Company's usable slot union.
export async function seedStandardRecruitmentOffers(id, uid, campaign, catalog) {
  if (!catalog || campaign.act < 2 || !campaign.patronFactionId) return 0
  const faction = catalog.factions.find((f) => f.id === campaign.patronFactionId)
  if (!faction) throw new Error('Unknown Company Patron faction')
  const options = [...patronCoreProfiles(catalog, campaign), ...catalog.generic]
  const prepared = options.flatMap((entry) => {
    const config = newUnitConfig(entry, entry.slots[0])
    const factionId = entry.source === 'faction' ? faction.id : null
    const resolved = resolveUnit(entry, config, factionId)
    if (resolved.pointsVary || (resolved.missingTags ?? []).length ||
        !Number.isInteger(resolved.points) || resolved.points < 1) return []
    return [{ entry, config, points: resolved.points, factionId }]
  })
  const missing = await Promise.all(prepared.map(async (item) => {
    const ref = doc(offers(id), standardOfferId(item.entry.key))
    const old = await getDoc(ref)
    return old.exists() ? null : { ref, item }
  }))
  // Do not overwrite existing offers: a GM may intentionally disable them.
  // Existing campaigns can run this idempotently whenever GM opens Company.
  for (const offer of missing.filter(Boolean)) {
    const { item, ref } = offer
    await setDoc(ref, {
      kind: 'unit', label: item.entry.name, price: priceForFormation(item.points),
      enabled: true, config: item.config, points: item.points,
      factionId: item.factionId, standardAccess: true,
      createdBy: uid, createdAt: serverTimestamp(),
    })
  }
  return missing.filter(Boolean).length
}

// Stable, pre-priced everyday gear. The GM does not approve individual sales.
// Auto-seeding is idempotent; existing offers are never overwritten, so a GM
// can intentionally disable a standard item for a particular campaign.
export async function seedDefaultEquipmentOffers(id, uid, data) {
  const choices = standardOffers(data)
  let created = 0
  for (const choice of choices) {
    const ref = doc(offers(id), choice.offerId)
    if ((await getDoc(ref)).exists()) continue
    try {
      await setDoc(ref, {
        kind: 'equipment', label: choice.label, item: choice.item, price: choice.price,
        enabled: true, standardEquipment: true, createdBy: uid,
        createdAt: serverTimestamp(),
      })
      created++
    } catch (error) {
      if (!(await getDoc(ref)).exists()) throw error
    }
  }
  return created
}

// Routine Minor Enchantments use fixed standard recipes. Unlocks from quests
// may add other offers, but no GM action is needed for these basic options.
export async function seedDefaultEnchantOffers(id, uid, data) {
  const choices = standardEnchantOffers(data)
  let created = 0
  for (const choice of choices) {
    const ref = doc(offers(id), choice.offerId)
    if ((await getDoc(ref)).exists()) continue
    try {
      await setDoc(ref, {
        kind: 'enchant', label: choice.label, price: choice.price,
        enabled: true, enchantKey: choice.enchantKey, targetKind: choice.targetKind,
        difficulty: choice.difficulty, check: choice.check, standardEnchant: true,
        createdBy: uid, createdAt: serverTimestamp(),
      })
      created++
    } catch (error) {
      // Concurrent PCs may both initialize the same deterministic listing.
      if (!(await getDoc(ref)).exists()) throw error
    }
  }
  return created
}

// A starting item belongs to the Hero already, but until now it had no
// persistent Company inventory identity. Register the *approved* original once
// under a deterministic ID, without purchasing or duplicating the item.
// The registered record is an enhancement anchor, not another carryable copy.
export const starterRecordId = (uid, gearUid) => `starter-${uid}-${gearUid}`
export async function registerStartingGear(id, uid, item) {
  if (!item?.uid || !item?.kind || !item?.name || item.inventoryId) {
    throw new Error('Choose an unregistered starting item')
  }
  const approvedRef = doc(db, 'campaigns', id, 'approvedHeroes', uid)
  const inventoryRef = doc(owned(id), starterRecordId(uid, item.uid))
  await runTransaction(db, async (tx) => {
    const [approval, existing] = await Promise.all([tx.get(approvedRef), tx.get(inventoryRef)])
    if (existing.exists()) return
    const original = approval.exists()
      ? (approval.data().sheet?.gear ?? []).find((g) => g.uid === item.uid && !g.inventoryId)
      : null
    if (!original || original.kind !== item.kind || original.name !== item.name) {
      throw new Error('Approve this character and its starting equipment before registering an enchantment target')
    }
    tx.set(inventoryRef, {
      kind: 'equipment',
      item: { kind: original.kind, name: original.name },
      ownerUid: uid, starterOwnerUid: uid, starterGearUid: original.uid,
      starterOriginal: original, createdAt: serverTimestamp(),
    })
  })
}

// Reusable fixed workshop recipes; ordinary PCs may seed only these exact
// whitelisted offers while quest/reward recipes remain GM-published.
export async function seedStandardWorkshopOffers(id, uid) {
  let created = 0
  for (const choice of standardWorkshopOffers()) {
    const ref = doc(offers(id), choice.offerId)
    if ((await getDoc(ref)).exists()) continue
    try {
      await setDoc(ref, {
        kind: choice.kind, label: choice.label, price: choice.price,
        enabled: true, targetKind: choice.targetKind,
        difficulty: choice.difficulty, check: choice.check, standardWorkshop: true,
        createdBy: uid, createdAt: serverTimestamp(),
      })
      created++
    } catch (error) {
      if (!(await getDoc(ref)).exists()) throw error
    }
  }
  return created
}
