import assert from 'node:assert/strict'
import fs from 'node:fs'
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, deleteDoc, getDoc, runTransaction, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'

const env = await initializeTestEnvironment({
  projectId: 'demo-rpg-market',
  firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') },
})
const campaignPath = 'campaigns/test-campaign'
const cid = (suffix) => `${campaignPath}/${suffix}`
const pc = env.authenticatedContext('player-1').firestore()
const admin = env.authenticatedContext('gm-1').firestore()

async function setup() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, campaignPath), {
      gmUid: 'gm-1', memberUids: ['gm-1', 'player-1'],
      name: 'Market test', format: 'standard',
      act: 2, turn: 1, xpTotal: 25, bonusXp: 0, patronFactionId: 'warclans',
      status: 'active', goldBalance: 10,
    })
    await setDoc(doc(db, cid('marketOffers/regular-weapon')), {
      enabled: true, kind: 'equipment', label: 'Dagger', price: 2,
      createdBy: 'gm-1', item: { kind: 'melee', name: 'Dagger' },
    })
    await setDoc(doc(db, cid('marketOffers/craft-weapon')), {
      enabled: true, kind: 'craft', label: 'Longsword', price: 3,
      createdBy: 'gm-1', item: { kind: 'melee', name: 'Longsword' },
      check: 'Mind + Craft', difficulty: 2,
    })
  })
}

async function spend({ id, offer, price, balance, kind, item, config, factionId = null, crafting, includeItem = true }) {
  const campaign = doc(pc, campaignPath)
  const listing = doc(pc, cid(`marketOffers/${offer}`))
  const receipt = doc(pc, cid(`marketPurchases/${id}`))
  const ledger = doc(pc, cid(`goldLedger/${id}`))
  const inventory = doc(pc, cid(`inventory/${id}`))
  return runTransaction(pc, async (tx) => {
    const c = await tx.get(campaign)
    const o = await tx.get(listing)
    assert(c.exists() && o.exists())
    const remaining = balance ?? c.data().goldBalance - price
    tx.update(campaign, {
      goldBalance: remaining,
      lastPurchaseId: id, lastPurchaseOfferId: offer,
      lastPurchaseUid: 'player-1', updatedAt: serverTimestamp(),
    })
    tx.set(receipt, {
      offerId: offer, ownerUid: 'player-1', kind, price,
      balanceAfter: remaining, status: 'completed', createdAt: serverTimestamp(),
      ...(crafting ? { crafting } : {}),
    })
    tx.set(ledger, {
      actorUid: 'player-1', delta: -price, balanceAfter: remaining,
      reason: 'Market test', kind: 'market', purchaseId: id,
      createdAt: serverTimestamp(),
    })
    if (includeItem) {
      tx.set(inventory, kind === 'unit' ? {
        kind: 'unit', config, factionId, purchaseId: id,
        createdAt: serverTimestamp(),
      } : {
        kind: 'equipment', item, ownerUid: null, purchaseId: id,
        createdAt: serverTimestamp(),
        ...(crafting ? { crafting } : {}),
      })
    }
  })
}

try {
  await setup()
  // Saving a valid talent choice commits it, but earning XP may append ranks.
  const emptyPyramid = { '1': [], '2': [], '3': [], '4': [], '5': [] }
  const heroRef = doc(pc, cid('heroes/player-1'))
  const initialSheet = {
    talents: { ...emptyPyramid, '1': [{ id: 'combat-prowess', attack: 'Longsword', skill: 'craft', mode: 'attacks' }] },
    gear: [], xpEarned: null, name: 'Talent test',
  }
  await assertSucceeds(setDoc(heroRef, {
    ownerUid: 'player-1', sheet: initialSheet, updatedAt: serverTimestamp(),
  }))
  await assertFails(updateDoc(heroRef, {
    sheet: { ...initialSheet, talents: { ...initialSheet.talents, '1': [] } },
    updatedAt: serverTimestamp(),
  }))
  await assertFails(updateDoc(heroRef, {
    sheet: { ...initialSheet, talents: { ...initialSheet.talents,
      '1': [{ id: 'combat-prowess', attack: 'Dagger', skill: 'craft', mode: 'attacks' }],
    } },
    updatedAt: serverTimestamp(),
  }))
  await assertSucceeds(updateDoc(heroRef, {
    sheet: { ...initialSheet, talents: { ...initialSheet.talents,
      '1': [initialSheet.talents['1'][0], { id: 'mobility-training', skill: 'athletics' }],
    } },
    updatedAt: serverTimestamp(),
  }))
  await assertFails(updateDoc(heroRef, {
    sheet: { ...initialSheet, talents: { ...initialSheet.talents,
      '1': [{ id: 'mobility-training', skill: 'athletics' }, initialSheet.talents['1'][0]],
    } },
    updatedAt: serverTimestamp(),
  }))
  await assertFails(deleteDoc(heroRef))
  // Standard shop initialization is self-service and price-locked.
  await assertSucceeds(setDoc(doc(pc, cid('marketOffers/standard-basic-dagger')), {
    kind: 'equipment', label: 'Dagger', price: 1, enabled: true,
    item: { kind: 'melee', name: 'Dagger' }, standardEquipment: true,
    createdBy: 'player-1', createdAt: serverTimestamp(),
  }))
  await assertFails(setDoc(doc(pc, cid('marketOffers/standard-basic-musket')), {
    kind: 'equipment', label: 'Musket', price: 1, enabled: true,
    item: { kind: 'ranged', name: 'Musket' }, standardEquipment: true,
    createdBy: 'player-1', createdAt: serverTimestamp(),
  }))
  await assertSucceeds(setDoc(doc(pc, cid('marketOffers/standard-enchant-accurate-melee')), {
    kind: 'enchant', label: 'Accurate 1', price: 2, enabled: true,
    enchantKey: 'minor:Accurate 1', targetKind: 'melee',
    difficulty: 2, check: 'Mind + Mysticism', standardEnchant: true,
    createdBy: 'player-1', createdAt: serverTimestamp(),
  }))
  await assertFails(setDoc(doc(pc, cid('marketOffers/standard-enchant-cheap-fake')), {
    kind: 'enchant', label: 'Critical 3', price: 1, enabled: true,
    enchantKey: 'major:Critical 3', targetKind: 'melee',
    difficulty: 2, check: 'Mind + Mysticism', standardEnchant: true,
    createdBy: 'player-1', createdAt: serverTimestamp(),
  }))
  const originalStarter = { uid: 'starter-a1', kind: 'melee', name: 'Dagger', equipped: true }
  await assertSucceeds(setDoc(doc(admin, cid('approvedHeroes/player-1')), {
    ownerUid: 'player-1', sheet: { gear: [originalStarter] },
  }))
  await assertSucceeds(setDoc(doc(pc, cid('inventory/starter-player-1-starter-a1')), {
    kind: 'equipment', item: { kind: 'melee', name: 'Dagger' },
    ownerUid: 'player-1', starterOwnerUid: 'player-1',
    starterGearUid: 'starter-a1', starterOriginal: originalStarter,
    createdAt: serverTimestamp(),
  }))
  await assertFails(setDoc(doc(pc, cid('inventory/starter-player-1-starter-fake')), {
    kind: 'equipment', item: { kind: 'melee', name: 'Dagger' },
    ownerUid: 'player-1', starterOwnerUid: 'player-1',
    starterGearUid: 'starter-fake',
    starterOriginal: { ...originalStarter, uid: 'starter-fake' },
    createdAt: serverTimestamp(),
  }))
  await assertFails(updateDoc(doc(pc, campaignPath), { goldBalance: 100 }))
  await assertFails(setDoc(doc(pc, cid('inventory/unearned')), {
    kind: 'equipment', item: { kind: 'melee', name: 'Dagger' },
    purchaseId: 'unearned', ownerUid: null, createdAt: serverTimestamp(),
  }))
  await assertSucceeds(spend({
    id: 'purchase-1', offer: 'regular-weapon', price: 2,
    kind: 'equipment', item: { kind: 'melee', name: 'Dagger' },
  }))
  assert.equal((await getDoc(doc(pc, campaignPath))).data().goldBalance, 8)
  assert((await getDoc(doc(pc, cid('inventory/purchase-1')))).exists())

  await assertFails(spend({
    id: 'purchase-cheat', offer: 'regular-weapon', price: 1,
    kind: 'equipment', item: { kind: 'melee', name: 'Dagger' },
  }))
  await assertFails(updateDoc(doc(pc, campaignPath), {
    goldBalance: 6, lastPurchaseId: 'purchase-1',
    lastPurchaseOfferId: 'regular-weapon', lastPurchaseUid: 'player-1',
    updatedAt: serverTimestamp(),
  }))

  const crafted = {
    dice: [6, 6, 3, 2], threshold: 4, difficulty: 2,
    successes: 2, surges: 1, blunders: 0,
    success: true, qualities: 0, flaws: 0, complications: false,
  }
  await assertSucceeds(spend({
    id: 'craft-1', offer: 'craft-weapon', price: 3,
    kind: 'craft', item: { kind: 'melee', name: 'Longsword' }, crafting: crafted,
  }))
  assert.equal((await getDoc(doc(pc, campaignPath))).data().goldBalance, 5)
  await assertFails(spend({
    id: 'craft-cheat', offer: 'craft-weapon', price: 3,
    kind: 'craft', item: { kind: 'melee', name: 'Longsword' },
    crafting: { ...crafted, difficulty: 1, qualities: 1 },
  }))
  const patronConfig = { key: 'faction:warclans:core-1', slot: 'C', models: 8, doubled: false, picks: {} }
  await assertSucceeds(setDoc(doc(admin, cid('marketOffers/patron-core')), {
    enabled: true, kind: 'unit', label: 'Patron Core', price: 3,
    points: 75, createdBy: 'gm-1', standardAccess: true,
    config: patronConfig, factionId: 'warclans', createdAt: serverTimestamp(),
  }))
  await assertSucceeds(spend({
    id: 'patron-1', offer: 'patron-core', price: 3, kind: 'unit',
    config: patronConfig, factionId: 'warclans',
  }))
  assert.equal((await getDoc(doc(pc, campaignPath))).data().goldBalance, 2)
  assert.equal((await getDoc(doc(pc, cid('inventory/patron-1')))).data().kind, 'unit')
  // A published enchantment recipe can be applied to the *existing* Company
  // item only alongside a real paid purchase/ledger entry.
  await assertSucceeds(setDoc(doc(admin, cid('marketOffers/sharpen-recipe')), {
    enabled: true, kind: 'enchant', label: 'Accurate 1', price: 1,
    createdBy: 'gm-1', createdAt: serverTimestamp(),
    difficulty: 2, check: 'Mind + Mysticism',
    targetKind: 'melee', enchantKey: 'minor:Accurate 1',
  }))
  await assertFails(updateDoc(doc(pc, cid('inventory/purchase-1')), {
    enchants: [{ key: 'minor:Accurate 1' }],
  }))
  await assertSucceeds(runTransaction(pc, async (tx) => {
    const camp = doc(pc, campaignPath)
    const owned = doc(pc, cid('inventory/purchase-1'))
    const [c, item] = await Promise.all([tx.get(camp), tx.get(owned)])
    const result = { ...crafted, qualities: 0 }
    tx.update(camp, {
      goldBalance: c.data().goldBalance - 1, lastPurchaseId: 'enchant-1',
      lastPurchaseOfferId: 'sharpen-recipe', lastPurchaseUid: 'player-1',
      updatedAt: serverTimestamp(),
    })
    tx.set(doc(pc, cid('marketPurchases/enchant-1')), {
      offerId: 'sharpen-recipe', ownerUid: 'player-1', kind: 'enchant',
      price: 1, balanceAfter: c.data().goldBalance - 1, status: 'completed',
      targetItemId: 'purchase-1', crafting: result, createdAt: serverTimestamp(),
    })
    tx.set(doc(pc, cid('goldLedger/enchant-1')), {
      actorUid: 'player-1', delta: -1, balanceAfter: c.data().goldBalance - 1,
      reason: 'Enchantment', kind: 'market', purchaseId: 'enchant-1',
      createdAt: serverTimestamp(),
    })
    tx.update(owned, {
      enchants: [...(item.data().enchants ?? []), { key: 'minor:Accurate 1' }],
      lastEnhancementId: 'enchant-1', updatedAt: serverTimestamp(),
    })
  }))
  assert.equal((await getDoc(doc(pc, campaignPath))).data().goldBalance, 1)
  assert.deepEqual((await getDoc(doc(pc, cid('inventory/purchase-1')))).data().enchants, [{ key: 'minor:Accurate 1' }])
  await assertFails(updateDoc(doc(pc, cid('inventory/purchase-1')), { enchants: [] }))
  // The original free starter has an enhancement anchor, not a duplicate
  // equipment pool item. Players can still pay to enchant that exact item.
  await assertSucceeds(runTransaction(pc, async (tx) => {
    const camp = doc(pc, campaignPath)
    const starter = doc(pc, cid('inventory/starter-player-1-starter-a1'))
    const [c, item] = await Promise.all([tx.get(camp), tx.get(starter)])
    tx.update(camp, {
      goldBalance: c.data().goldBalance - 1, lastPurchaseId: 'enchant-starter-1',
      lastPurchaseOfferId: 'sharpen-recipe', lastPurchaseUid: 'player-1',
      updatedAt: serverTimestamp(),
    })
    tx.set(doc(pc, cid('marketPurchases/enchant-starter-1')), {
      offerId: 'sharpen-recipe', ownerUid: 'player-1', kind: 'enchant',
      price: 1, balanceAfter: c.data().goldBalance - 1,
      status: 'completed', targetItemId: starter.id,
      crafting: crafted, createdAt: serverTimestamp(),
    })
    tx.set(doc(pc, cid('goldLedger/enchant-starter-1')), {
      actorUid: 'player-1', delta: -1, balanceAfter: c.data().goldBalance - 1,
      reason: 'Starting Dagger enchant', kind: 'market',
      purchaseId: 'enchant-starter-1', createdAt: serverTimestamp(),
    })
    tx.update(starter, {
      enchants: [...(item.data().enchants ?? []), { key: 'minor:Accurate 1' }],
      lastEnhancementId: 'enchant-starter-1', updatedAt: serverTimestamp(),
    })
  }))
  assert.equal((await getDoc(doc(pc, campaignPath))).data().goldBalance, 0)
  assert.deepEqual(
    (await getDoc(doc(pc, cid('inventory/starter-player-1-starter-a1')))).data().enchants,
    [{ key: 'minor:Accurate 1' }],
  )
  // A declared Develop Order permits one paid Retraining. A PC may propose
  // an exact one-slot replacement but cannot modify committed Talents directly.
  const retrainOrder = 'act-2-turn-1'
  const retrainId = 'retrain-player-1-' + retrainOrder
  const retrain = doc(pc, cid('retrainingRequests/' + retrainId))
  await assertSucceeds(updateDoc(doc(admin, campaignPath), {
    activeDevelopOrder: retrainOrder, goldBalance: 5, updatedAt: serverTimestamp(),
  }))
  await assertSucceeds(setDoc(retrain, {
    ownerUid: 'player-1', orderId: retrainOrder, act: 2, turn: 1,
    status: 'requested', tier: 1, index: 0,
    newTalent: { id: 'toughened', skill: 'craft' },
    createdAt: serverTimestamp(),
  }))
  await assertFails(setDoc(doc(pc, cid('retrainingRequests/forged-free-retrain')), {
    ownerUid: 'player-1', orderId: retrainOrder, act: 2, turn: 1,
    status: 'approved', tier: 1, index: 0,
    newTalent: { id: 'toughened' }, createdAt: serverTimestamp(),
  }))
  await assertSucceeds(runTransaction(admin, async (tx) => {
    const camp = doc(admin, campaignPath)
    const hero = doc(admin, cid('heroes/player-1'))
    const req = doc(admin, cid('retrainingRequests/' + retrainId))
    const [c, h] = await Promise.all([tx.get(camp), tx.get(hero)])
    const prior = h.data().sheet.talents
    const proposal = { ...prior, '1': [{ id: 'toughened', skill: 'craft' }, prior['1'][1]] }
    tx.update(camp, {
      goldBalance: c.data().goldBalance - 2, retrainOrderUsed: retrainOrder,
      updatedAt: serverTimestamp(),
    })
    tx.set(doc(admin, cid('goldLedger/' + retrainId)), {
      delta: -2, balanceAfter: c.data().goldBalance - 2,
      actorUid: 'gm-1', reason: 'Develop Talent Retraining',
      kind: 'retraining', retrainingId: retrainId, createdAt: serverTimestamp(),
    })
    tx.update(req, {
      status: 'approved', resolvedBy: 'gm-1', resolvedAt: serverTimestamp(),
      proposedTalents: proposal, originalTalents: prior, paid: 2,
    })
  }))
  assert.equal((await getDoc(doc(admin, campaignPath))).data().goldBalance, 3)
  const attemptedApply = async () => runTransaction(admin, async (tx) => {
    const hero = doc(admin, cid('heroes/player-1'))
    const req = doc(admin, cid('retrainingRequests/' + retrainId))
    const [h, q] = await Promise.all([tx.get(hero), tx.get(req)])
    tx.update(hero, { sheet: { ...h.data().sheet, talents: q.data().proposedTalents },
      lastRetrainingId: retrainId, updatedAt: serverTimestamp() })
    tx.update(req, { status: 'applied', appliedAt: serverTimestamp() })
  })
  await assertFails(attemptedApply())
  await assertSucceeds(updateDoc(doc(admin, campaignPath), {
    turn: 2, xpTotal: 30, updatedAt: serverTimestamp(),
  }))
  await assertSucceeds(attemptedApply())
  assert.equal((await getDoc(heroRef)).data().sheet.talents['1'][0].id, 'toughened')
  assert.equal((await getDoc(retrain)).data().status, 'applied')
  await assertFails(updateDoc(heroRef, {
    sheet: { ...initialSheet, talents: initialSheet.talents },
    updatedAt: serverTimestamp(),
  }))
  console.log('PASS Firestore: Develop Retraining costs 2 Gold, cannot be forged, and only applies after Turn advancement')
  console.log('PASS Firestore market: self-service ordinary shop, default Minor recipes, approved starter registration and paid enchantment')
} finally {
  await env.cleanup()
}
