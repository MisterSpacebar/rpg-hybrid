import { campaignSlots } from './limits.js'

// A Patron provides access to its signature Core profiles, not to its entire
// faction army list. The three signature choices are not free formations.
export function patronCoreProfiles(catalog, campaign) {
  if (!catalog || campaign?.act < 2) return []
  const faction = catalog.factions.find((f) => f.id === campaign.patronFactionId)
  return faction?.units.filter((u) => u.isCore && u.source === 'faction') ?? []
}

// Generic profiles are available only if at least one active PC has a legal
// recruitment slot. This is a Company-wide eligibility union; purchased units
// still need a slot and Points in the PC's actual deployed detachment.
export function partyRecruitmentSlots(catalog, campaign, entitlements = {}, detachments = []) {
  if (!catalog || !campaign || campaign.act < 2) return new Set()
  const members = (campaign.memberUids ?? []).filter((uid) => uid !== campaign.gmUid)
  const unlocked = new Set()
  for (const uid of members) {
    const detachment = detachments.find((d) => d.ownerUid === uid) ?? {}
    const { unitSlots } = campaignSlots(campaign, entitlements[uid] ?? {}, detachment, catalog)
    for (const [slot, count] of Object.entries(unitSlots)) if (count > 0) unlocked.add(slot)
  }
  return unlocked
}

export function standardRecruitmentProfiles(catalog, campaign, entitlements = {}, detachments = []) {
  const factionCore = patronCoreProfiles(catalog, campaign)
  const slots = partyRecruitmentSlots(catalog, campaign, entitlements, detachments)
  const generic = (catalog?.generic ?? []).filter((unit) =>
    unit.slots.some((slot) => slots.has(slot)))
  return { factionCore, generic, slots, all: [...factionCore, ...generic] }
}

// Auto-published offers remain server-validated by the existing Firestore
// market rules. This is a deterministic catalog identity, not a free unit grant.
export const standardOfferId = (key) => 'patron-' + key.replace(/[^a-z0-9-]/gi, '_')
