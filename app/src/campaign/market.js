import { resolveCraft } from './economy.js'

// A published Company offer is an ongoing permission to acquire an item or
// recruit a standard formation. It does not require a per-purchase GM decision.
// Gold cost is GM-set for equipment/materials and rules-derived for formations.
export const MARKET_KINDS = ['equipment', 'unit', 'craft', 'enchant']

export const publishableOffer = (offer) => {
  if (!MARKET_KINDS.includes(offer?.kind)) throw new Error('Invalid offer type')
  if (!Number.isInteger(offer.price) || offer.price < 1 || offer.price > 1000) throw new Error('Market Gold price must be 1–1000')
  if (offer.kind === 'unit' && (!offer.config?.key || !Number.isInteger(offer.points) || offer.points < 1)) {
    throw new Error('A formation offer requires a resolved profile and its Points')
  }
  if (['equipment', 'craft'].includes(offer.kind) && (!offer.item?.kind || !offer.item.name)) throw new Error('Choose the equipment profile')
  if (offer.kind === 'enchant' && (!offer.enchantKey || !['melee', 'ranged', 'armor', 'shield'].includes(offer.targetKind))) throw new Error('Select a compatible enchantment recipe')
  if (['craft', 'enchant'].includes(offer.kind) && (!Number.isInteger(offer.difficulty) || offer.difficulty < 1 || offer.difficulty > 5)) {
    throw new Error('Choose a crafting Difficulty from 1–5')
  }
  return true
}

export const priceForFormation = (points) => {
  if (!Number.isInteger(points) || points < 1) throw new Error('Unresolved Points')
  return Math.ceil(points / 25)
}

export function craftRoll(dice, threshold, difficulty) {
  if (!Array.isArray(dice) || dice.length < 1 || dice.length > 6 ||
    !dice.every((d) => Number.isInteger(d) && d >= 1 && d <= 6) ||
    !Number.isInteger(threshold) || threshold < 2 || threshold > 6) {
    throw new Error('Invalid crafting dice or Skill threshold')
  }
  const successes = dice.filter((die) => die >= threshold).length
  const surges = dice.filter((die) => die === 6).length >= 2 ? 1 : 0
  const blunders = dice.filter((die) => die === 1).length >= 2 ? 1 : 0
  return { dice, successes, surges, blunders, difficulty, ...resolveCraft({ difficulty, successes, surges, blunders }) }
}

export function eligibleOffer(offer, campaign) {
  if (!offer?.enabled || campaign?.status === 'completed') return false
  if (offer.kind === 'unit') {
    return campaign.act >= 2 && !!campaign.patronFactionId &&
      (!offer.factionId || offer.factionId === campaign.patronFactionId)
  }
  return true
}
