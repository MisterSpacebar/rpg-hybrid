import assert from 'node:assert/strict'
import test from 'node:test'
import { campaignSlots, allowedDoctrineCommands, deploymentCap, detachmentView, baseXp, advanceTurn, bonusXp } from './limits.js'

test('XP follows completed turns and Act advancement', () => {
  assert.equal(baseXp('standard', 1, 1), 0)
  assert.equal(baseXp('standard', 1, 4), 15)
  assert.equal(baseXp('standard', 2, 1), 4 * 5 + 5)
  assert.equal(baseXp('standard', 4, 9), (4 + 5 + 7 + 8) * 5 + 15)
})

test('advanceTurn rolls over Acts and ends the campaign', () => {
  assert.deepEqual(advanceTurn({ format: 'local', act: 1, turn: 3 }), { act: 2, turn: 1, status: 'active' })
  assert.deepEqual(advanceTurn({ format: 'local', act: 4, turn: 6 }), { act: 4, turn: 7, status: 'completed' })
  assert.equal(bonusXp({ format: 'local', act: 2, turn: 1, xpTotal: 20 }), 0)
  assert.equal(bonusXp({ format: 'local', act: 2, turn: 1, xpTotal: 30, bonusXp: 10 }), 10)
})

const catalog = {
  factions: [
    { id: 'sacred-orders', name: 'Sacred Orders', foundationSlots: ['E', 'H'] },
    { id: 'warclans', name: 'Warclans', foundationSlots: ['C', 'C'] },
  ],
  doctrines: [
    { id: 'combined-arms', name: 'Combined Arms', foundationSlot: 'S',
      commands: [{ name: 'Screen and Advance', slot: 'V' }, { name: 'Crossfire', slot: 'R' }, { name: 'Coordinated Orders', slot: 'H' }] },
  ],
  unitsByKey: {},
}
const campaign = (act, format = 'standard', sponsor = 'sacred-orders') => ({
  id: 'campaign-test', act, format, patronFactionId: sponsor,
})

test('deployment limits are per PC and scale by campaign length and Act', () => {
  assert.equal(deploymentCap(campaign(1)), null)
  assert.equal(deploymentCap(campaign(2)), 250)
  assert.equal(deploymentCap(campaign(3, 'long')), 475)
  assert.equal(deploymentCap(campaign(4, 'grand')), 750)
})

test('Patron slots are the normal faction foundation slots including H', () => {
  const sacred = campaignSlots(campaign(2), {}, {}, catalog)
  assert.equal(sacred.slots.H, 2)
  assert.equal(sacred.unitSlots.H, 1) // the PC Hero occupies only the reserved H
  assert.equal(sacred.unitSlots.E, 1)
  assert.equal(sacred.total, 3)
  const warclans = campaignSlots(campaign(2, 'standard', 'warclans'), {}, {}, catalog)
  assert.equal(warclans.unitSlots.C, 2)
  assert.equal(warclans.unitSlots.H, 0)
})

test('Each PC Doctrine grants its own foundation and selected commands only when unlocked', () => {
  const det = { doctrineId: 'combined-arms', commands: ['Screen and Advance', 'Crossfire'] }
  const act2 = campaignSlots(campaign(2), {}, det, catalog)
  assert.equal(act2.unitSlots.S, 0)
  const act3 = campaignSlots(campaign(3), {}, det, catalog)
  assert.equal(act3.unitSlots.S, 1)
  assert.equal(act3.unitSlots.V, 1)
  assert.equal(act3.unitSlots.R, 0)
  const act4 = campaignSlots(campaign(4), {}, det, catalog)
  assert.equal(act4.unitSlots.R, 1)
  assert.equal(allowedDoctrineCommands(campaign(4, 'grand'), { grandThirdCommand: true }), 3)
  assert.equal(allowedDoctrineCommands(campaign(4, 'grand'), {}), 2)
})

test('Every slot records the kind of source it came from', () => {
  const det = { doctrineId: 'combined-arms', commands: ['Screen and Advance'] }
  const kinds = campaignSlots(campaign(3), { flexSlots: ['C'] }, det, catalog).sources.map((s) => s.kind)
  assert.equal(kinds[0], 'hero')
  assert.ok(kinds.includes('patron') && kinds.includes('doctrine') && kinds.includes('command') && kinds.at(-1) === 'flex')
})

test('Flex slots cannot replace Hero slot, and point cap includes approved Hero', () => {
  const state = detachmentView(campaign(2), { flexSlots: ['C', 'H'] }, { doctrineId: null, commands: [], selections: [] }, [], catalog, 251)
  assert.equal(state.slots.unitSlots.C, 1)
  assert.equal(state.slots.unitSlots.H, 1) // the faction H, not Flex
  assert.equal(state.legal, false)
  assert(state.errors.some((x) => x.includes('250-point')))
  const good = detachmentView(campaign(2), {}, { doctrineId: null, commands: [], selections: [] }, [], catalog, 150)
  assert(good.legal)
})

test('Ordinary campaign deploy does not require matched-play two Doctrines or three Core units', () => {
  const result = detachmentView(campaign(3), {}, { doctrineId: 'combined-arms', commands: ['Crossfire'], selections: [] }, [], catalog, 150)
  assert.equal(result.legal, true)
  assert.equal(result.slots.unitSlots.R, 1)
})
