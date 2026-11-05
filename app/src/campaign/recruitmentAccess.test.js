import assert from 'node:assert/strict'
import test from 'node:test'
import {
  patronCoreProfiles, partyRecruitmentSlots, standardRecruitmentProfiles,
  eligibleStandardOffer, standardOfferId,
} from './recruitmentAccess.js'

const faction = {
  id: 'warclans', foundationSlots: ['C', 'R'],
  units: [
    ...['Brawlers', 'Archers', 'Raiders'].map((name, i) => ({
      source: 'faction', key: 'faction:warclans:core-' + i,
      name, slots: ['C'], isCore: true,
    })),
    { source: 'faction', key: 'faction:warclans:large-asset', name: 'War Machine', slots: ['A'], isCore: false },
  ],
}
const catalog = {
  factions: [faction],
  doctrines: [{ id: 'vanguard-doctrine', name: 'Vanguard', foundationSlot: 'V',
    commands: [{ name: 'Special Support', slot: 'S' }] }],
  generic: [
    { source: 'generic', key: 'generic:line', name: 'Line Infantry', slots: ['C'] },
    { source: 'generic', key: 'generic:archers', name: 'Archers', slots: ['R'] },
    { source: 'generic', key: 'generic:cavalry', name: 'Cavalry', slots: ['V'] },
    { source: 'generic', key: 'generic:artillery', name: 'Artillery', slots: ['A'] },
    { source: 'generic', key: 'generic:support', name: 'Support', slots: ['S'] },
  ],
}
const camp = (act) => ({
  act, patronFactionId: 'warclans',
  gmUid: 'gm', memberUids: ['gm', 'pc-a', 'pc-b'],
})

test('Act II unlocks exactly the three signature Patron Core profiles, not all faction units', () => {
  assert.deepEqual(patronCoreProfiles(catalog, camp(1)), [])
  assert.equal(patronCoreProfiles(catalog, camp(2)).length, 3)
  assert(!patronCoreProfiles(catalog, camp(2)).some((unit) => unit.name === 'War Machine'))
})

test('generic troop access uses the union of party recruitment slots', () => {
  const access = standardRecruitmentProfiles(catalog, camp(2))
  assert.deepEqual([...access.slots].sort(), ['C','R'])
  assert.deepEqual(access.generic.map((u) => u.key), ['generic:line', 'generic:archers'])
  assert.equal(access.all.length, 5)
})

test('individual Doctrine and Flex rights expand generic access company-wide', () => {
  const detachment = [{ ownerUid: 'pc-a', doctrineId: 'vanguard-doctrine',
    commands: ['Special Support'], selections: [] }]
  const rights = { 'pc-b': { flexSlots: ['A'] } }
  const access = standardRecruitmentProfiles(catalog, camp(4), rights, detachment)
  assert.deepEqual([...access.slots].sort(), ['A', 'C', 'R', 'S', 'V'])
  assert.equal(access.generic.length, 5)
})

test('published core offers remain selectable while unrelated specialists are not auto-granted', () => {
  const coreOffer = { standardAccess: true, config: { key: 'faction:warclans:core-0' } }
  const specialistOffer = { standardAccess: true, config: { key: 'faction:warclans:large-asset' } }
  const earlyCavalry = { standardAccess: true, config: { key: 'generic:cavalry' } }
  assert(eligibleStandardOffer(coreOffer, catalog, camp(2), {}, []))
  assert(!eligibleStandardOffer(specialistOffer, catalog, camp(2), {}, []))
  assert(!eligibleStandardOffer(earlyCavalry, catalog, camp(2), {}, []))
  assert.equal(standardOfferId('faction:warclans:core-0'), 'patron-faction_warclans_core-0')
})
