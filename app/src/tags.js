// Shared tag vocabulary and matching rules for the Army and Character builders.
// Tags remain explicitly assigned: these helpers do not infer creature type from faction.
export const FACTION_TAGS = {
  'free-realms': 'Free Realms',
  'sacred-orders': 'Sacred Orders',
  'iron-holds': 'Iron Holds',
  'wild-courts': 'Wild Courts',
  warclans: 'Warclans',
  underclans: 'Underclans',
  'death-legions': 'Death Legions',
  'blood-courts': 'Blood Courts',
  'spirit-hosts': 'Spirit Hosts',
  'infernal-hosts': 'Infernal Hosts',
  'arcane-orders': 'Arcane Orders',
  'titan-clans': 'Titan Clans',
}

// Legacy compound role names continue to match their constituent categories.
// Only the explicitly named compound is expanded, never inferred from weapons or saves.
export const COMPOUND_TAGS = {
  'Elite Infantry': ['Elite', 'Infantry'],
  'Ranged Infantry': ['Ranged', 'Infantry'],
  'Elite Ranged Infantry': ['Elite', 'Ranged', 'Infantry'],
  'Elite Cavalry': ['Elite', 'Cavalry'],
  'Infiltrating Infantry': ['Infiltrator', 'Infantry'],
  'Horde Infantry': ['Horde', 'Infantry'],
}

export function canonicalTags(tags = [], factionId = null) {
  const result = new Set()
  for (const tag of tags ?? []) {
    if (!tag) continue
    result.add(tag)
    for (const part of COMPOUND_TAGS[tag] ?? []) result.add(part)
  }
  const faction = FACTION_TAGS[factionId]
  // A faction choice identifies allegiance, not whether a Unit is Undead, Fey, etc.
  if (faction) {
    for (const existing of Object.values(FACTION_TAGS)) result.delete(existing)
    result.add(faction)
  }
  return [...result]
}

export const ANTI_TAGS = [
  ...Object.values(FACTION_TAGS),
  'Artillery', 'Beast', 'Cavalry', 'Character', 'Construct', 'Creature',
  'Elite', 'Hero', 'Infantry', 'Monster', 'Support', 'Vehicle',
  'Armored', 'Unarmored', 'Mortal', 'Undead', 'Spirit', 'Infernal', 'Fey',
  'Humanoid', 'Mechanical', 'Flying', 'Elemental', 'Plant', 'Swarm',
  'Giant', 'Ooze', 'Demon',
  'Core', 'Officer', 'Wizard', 'Ranged', 'Mobile', 'Infiltrator', 'Horde',
  'Headquarters', 'Large Asset',
  'Human', 'Elf', 'Dwarf', 'Orc', 'Goblin', 'Kobold', 'Halfling',
  'Gnome', 'Beastfolk', 'Tiefling',
].filter((tag, i, tags) => tags.indexOf(tag) === i)

// All applicable Anti ranks are checked against the target; only the highest
// matching value adds dice to a combined Attack pool (never once per Model).
export function antiBonus(keywords = [], targetTags = []) {
  const targets = new Set(canonicalTags(targetTags))
  return keywords.reduce((best, keyword) => {
    const match = /^Anti-(.+?)\s+(\d+)$/i.exec(keyword)
    return match && targets.has(match[1])
      ? Math.max(best, Number(match[2]))
      : best
  }, 0)
}
