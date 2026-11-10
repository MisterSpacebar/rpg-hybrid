import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveRush, rushTiles } from './rush.js'

const base = { printedCharge: null, printedImpact: null, picked: [], factionId: null, source: 'generic', mayCharge: true }

test('Printed cavalry values are tagged printed, and Impact +0 never shows a tile', () => {
  const light = resolveRush({ ...base, printedCharge: 3, printedImpact: 0 })
  assert.deepEqual([light.charge, light.impact, light.chargeSource, light.impactSource], [3, '+0', 'printed', 'printed'])
  assert.deepEqual(rushTiles(light).map((t) => t[0]), ['Charge'])
  assert.deepEqual(rushTiles({ charge: 2, impact: '+1' }).map((t) => t[1]), ['+2', '+1'])
  assert.deepEqual(rushTiles({ charge: null, impact: null }), [])
})

test('Upgrade text gives Charge (highest only) and Impact (added), flagged as upgrade-sourced', () => {
  const drill = { name: 'Charge Drill', effect: 'Gain Charge 1. Adds 1" to final Charge distance, not to Charge Impact.' }
  const shock = { name: 'Shock Training', effect: 'Gain Impact 1 on successful Charges. It increases the Unit\'s one shared Impact pool, not Impact per Model.' }
  const r = resolveRush({ ...base, picked: [drill, shock] })
  assert.deepEqual([r.charge, r.impact, r.chargeSource, r.impactSource], [1, '+1', 'upgrade', 'upgrade'])
  const mounted = { name: 'Mounted', effect: 'Increase Move to M6", gain +1 Wound and Charge 3. Loses Infantry tag and gains Cavalry.' }
  assert.equal(resolveRush({ ...base, picked: [drill, mounted] }).charge, 3)
  const cls = { id: 'cavalryClass:Light', effect: 'Charge 3; Impact +0 on successful Charges' }
  assert.equal(resolveRush({ ...base, printedCharge: 2, printedImpact: 1, picked: [cls] }).impact, '+1')
})

test('Warclans Charge never stacks and is faction-sourced only when it raises the value', () => {
  const w = (extra) => resolveRush({ ...base, factionId: 'warclans', ...extra })
  assert.deepEqual([w({}).charge, w({}).chargeSource], [1, 'faction'])
  assert.deepEqual([w({ source: 'faction' }).charge, w({ source: 'faction' }).chargeSource], [2, 'faction'])
  assert.deepEqual([w({ source: 'faction', printedCharge: 3 }).charge, w({ source: 'faction', printedCharge: 3 }).chargeSource], [3, 'printed'])
  const drill = { name: 'Charge Drill', effect: 'Gain Charge 1.' }
  assert.deepEqual([w({ picked: [drill] }).charge, w({ picked: [drill] }).chargeSource], [1, 'upgrade'])
  assert.equal(w({ mayCharge: false }).charge, null)
})

test('Titan Clans Impact adds to printed and upgrade Impact and is faction-coloured', () => {
  const t = (extra) => resolveRush({ ...base, factionId: 'titan-clans', ...extra })
  assert.deepEqual([t({}).impact, t({}).impactSource], ['+1', 'faction'])
  assert.equal(t({ source: 'faction' }).impact, '+2')
  assert.equal(t({ source: 'faction', printedImpact: 4 }).impact, '+4')
  assert.equal(t({ printedImpact: 2 }).impact, '+3')
  assert.equal(t({ picked: [{ name: 'Shock Training', effect: 'Gain Impact 1 on successful Charges.' }] }).impact, '+2')
  assert.equal(t({ mayCharge: false }).impact, null)
})
