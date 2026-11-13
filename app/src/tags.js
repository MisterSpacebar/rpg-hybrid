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
  'Elite Ranged Infantry': ['Elite', 'Ranged', 'Infantry', 'Elite Infantry', 'Ranged Infantry'],
  'Elite Cavalry': ['Elite', 'Cavalry'],
  'Infiltrating Infantry': ['Infiltrator', 'Infantry'],
  'Horde Infantry': ['Horde', 'Infantry'],
}

// Legacy saved Character tags and Anti-Character selections resolve to Unique.
export const normalizeTag = (tag) => tag === 'Character' ? 'Unique' : tag

export function canonicalTags(tags = [], factionId = null) {
  const result = new Set()
  for (const tag of tags ?? []) {
    if (!tag) continue
    const normalized = normalizeTag(tag)
    result.add(normalized)
    for (const part of COMPOUND_TAGS[normalized] ?? []) result.add(part)
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
  ...Object.keys(COMPOUND_TAGS),
  'Artillery', 'Beast', 'Cavalry', 'Unique', 'Construct', 'Creature',
  'Elite', 'Hero', 'Infantry', 'Monster', 'Support', 'Vehicle',
  'Armored', 'Unarmored', 'Mortal', 'Undead', 'Summoned', 'Spirit', 'Infernal', 'Fey',
  'Humanoid', 'Mechanical', 'Flying', 'Elemental', 'Plant', 'Swarm',
  'Giant', 'Ooze', 'Demon',
  'Core', 'Officer', 'Wizard', 'Ranged', 'Mobile', 'Infiltrator', 'Horde',
  'Headquarters', 'Large Asset',
  'Human', 'Elf', 'Dwarf', 'Orc', 'Goblin', 'Kobold', 'Halfling',
  'Gnome', 'Beastfolk', 'Tiefling',
].filter((tag, i, tags) => tags.indexOf(tag) === i)

// Anti sources do not stack: use the highest applicable *total* dice. Weapon Anti
// applies per contributing Model; Unit Anti is added once to a combined pool.
export function antiBonus(keywords = [], targetTags = []) {
  const targets = new Set(canonicalTags(targetTags))
  return keywords.reduce((best, keyword) => {
    const match = /^Anti-(.+?)\s+(\d+)$/i.exec(keyword)
    return match && targets.has(normalizeTag(match[1]))
      ? Math.max(best, Number(match[2]))
      : best
  }, 0)
}

// Use this for resolved, model-aware attacks. Existing antiBonus() still returns the
// highest printed rank for backwards-compatible single-Model callers.
export function resolvedAntiBonus({ weaponKeywords = [], unitKeywords = [], targetTags = [], contributingModels = 1 } = {}) {
  const perWeapon = antiBonus(weaponKeywords, targetTags) * Math.max(0, contributingModels)
  const perUnit = antiBonus(unitKeywords, targetTags)
  return Math.max(perWeapon, perUnit)
}

export function canControlObjective({ startingModels = 1, survivingModels = 0, tags = [], withdrawn = false, inReserve = false, inRange = true } = {}) {
  if (withdrawn || inReserve || !inRange || survivingModels < 1) return false
  const isHorde = canonicalTags(tags).includes('Horde')
  return isHorde || survivingModels >= Math.ceil(startingModels / 2)
}

export function objectiveControlValue({ eligible = true, modifiers = [] } = {}) {
  return eligible ? Math.max(1, ...modifiers) : 0
}
