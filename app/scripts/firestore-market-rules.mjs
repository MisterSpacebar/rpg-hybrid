import assert from 'node:assert/strict'
import fs from 'node:fs'
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, getDoc, runTransaction, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'

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
  console.log('PASS Firestore market: ordinary purchases, patron recruitment and paid owned-item enchanting; arbitrary asset modifications denied')
} finally {
  await env.cleanup()
}
