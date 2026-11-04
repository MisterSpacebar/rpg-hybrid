# Equipment and Crafting

Equipment represents weapons, armor, magical implements, artifacts, and other possessions used by Player Characters. A character's equipment influences their battlefield capabilities and contributes to their total Points value. Equipment may be purchased, found, crafted, improved, exchanged, or awarded during play.

## EQUIPMENT AND CHARACTER VALUE

PC Point Value follows [Experience and Advancement](03_experience_and_advancement.md): **max(100, XP spent on Talents) + Equipment Points + other explicit Points**. Equipment does **not** cost XP. Equipped weapons, armor, shields, foci, and artifacts add their listed Points. Replacing or removing equipment adjusts battlefield value. Permanently learned additional spells contribute their assigned Points as described in [Spell Catalogue](12_spell_catalogue.md).

**PC Attack profiles:** The Attack value (`A`) shown for every weapon in this catalogue is the **complete Attack dice value when a PC uses that weapon**, before specific modifiers from Talents, Commands, Keywords, or equipment. Classes use these exact profiles and pay their listed Point costs. NPCs, allied generic Units, Thralls, and Companions use their own Unit Attack profiles instead of inheriting PC equipment/spell profiles.

**v4 Damage-output rebalance:** Following playtesting that found combat took too long to inflict meaningful damage, Damage 1 weapon profiles below gained **+1 Attack** from their previously listed values. Damage 2 and Heavy profiles instead kept their listed Attacks and gained a thematic **Anti-[Type] 1** (or, where one already existed, it increased to **Anti-[Type] 2**), matching the equivalent policy applied to Generic Units. Point costs are unchanged pending further playtesting.

**v5 Damage-output rebalance (second pass):** The same policy was applied once more to every weapon profile in this catalogue, to the Spell Attacks in the [Spell Catalogue](12_spell_catalogue.md) and [Starting Spells](06_spells_and_equipment.md), and to the Bestiary. Damage 1 profiles gained a further **+1 Attack**. Damage 2 and Heavy profiles instead raised their **Anti-[Type]** to **2** (an existing Anti-[Type] 1 rose to 2); the Warhammer, which already had Anti-Armored 2, gained **+1 Attack** instead. Damage 0 profiles are unchanged. The [Classes](05_classes.md) reference tables, which had not received the v4 Attack increase, were synchronized to these catalogue profiles. The Handgun was removed as redundant with the Pistol, the Pistol and Carbine were then trimmed by 1 Attack each, and the Mace now costs 15 Points. Other Point costs are unchanged pending further playtesting.

**Provisional growth rebalance:** Compared with the earlier catalogue, weapon/spell profiles formerly showing 2–3 Attacks were reduced by 1 die, profiles with 4 or more by 2 dice, and profiles with only 1 remain at 1. The minimum is 1 Attack die. **These revised Attack values already include all baseline PC attack capacity**. Equipment and spell Point costs are temporarily unchanged pending playtesting. This lowers starting PC attack volume while leaving room for Prowess and other advances.

### Equipment Slots

A character may normally equip:

| Equipment | Limit |
| --- | --- |
| Primary melee weapon | 1 |
| Ranged weapon | 1 |
| Backup weapons | Reasonable number |
| Armor | 1 set |
| Shield or off-hand equipment | 1 |
| Magical Focus | 1 |
| General Artifacts | 2 |

These limits describe equipment available for normal battlefield use rather than everything a character may physically carry. An enchanted weapon occupies its normal weapon slot, not an Artifact slot. Enchanted armor and shields follow the same principle. Magical foci occupy the Focus slot. A magical staff may also function as a mundane Staff weapon where appropriate, but equipping it does not grant additional weapon activations. A character cannot normally benefit from multiple Shields, armor sets, or magical foci simultaneously.

### Using Weapons

Assault Phase: Ranged Weapon Attacks and ranged Spell Attacks.

Combat Phase: Melee Weapon Attacks and Spell Attacks with an Engaged Range.

A character normally chooses one eligible Attack profile when making an Attack. Equipping multiple weapons does not grant additional Attacks or activations. All weapon profiles use: Range / Attacks / Hit / Damage / Keywords

## WEAPON KEYWORDS

Equipment uses the standard Keywords described in the Combat Rules.

| Keyword | Effect |
| --- | --- |
| Accurate X | Reroll up to X natural 1s on the Attack's Hit roll |
| Tough X | Reroll up to X natural 1s on Armor Saves |
| Critical X | After rerolls, convert up to X failed Hit dice into Critical Hits; no inherent Surge prerequisite |
| Anti-[Category] X | Gain +X Attack dice against the indicated category |
| Heavy | Subject to normal Heavy movement restrictions |
| Brace X | Reduce incoming Charge Impact Hits by X, minimum 0 |
| Long Range X | Extend maximum Range by X"; attacking beyond normal Range worsens Hit by 1 step |
| Rapid-Fire X | Gain +X Attacks against targets within half the weapon's normal Range |
| Instant | Cannot be responded to with Command Abilities |
| Pinpoint | Ignore the Hit penalty for attacking enemies Engaged with another Unit |
| Magic | The Attack counts as Magic rather than Physical |

For full timing, stacking, and saves use [Keywords](10_keywords.md). A weapon’s keywords normally apply only to its own Attack.

## MELEE WEAPONS

Melee weapons normally attack during the Combat Phase.

### Simple Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | --- | --- | --- | --- | --- |
| Staff | Engaged 2" | 3 | 6+ | 1 | — | 0 |
| Club | Engaged | 3 | 6+ | 1 | — | 0 |
| Dagger | Engaged | 3 | 5+ | 1 | Accurate 1 | 0 |
| Whip | Engaged 2" | 3 | 5+ | 1 | — | 5 |

Simple weapons require little specialized training and are commonly available.

### Martial Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | --- | --- | --- | --- | --- |
| Shortsword | Engaged | 4 | 6+ | 1 | Accurate 1 | 5 |
| Longsword | Engaged | 4 | 5+ | 1 | — | 10 |
| Axe | Engaged | 5 | 6+ | 1 | — | 10 |
| Spear | Engaged 2" | 3 | 5+ | 1 | Brace 1 | 10 |
| Mace | Engaged | 4 | 6+ | 1 | Anti-Armored 1, Surge: Slow 1 | 15 |
| Warhammer | Engaged | 2 | 5+ | 2 | Anti-Armored 2 | 15 |
| Rapier | Engaged | 4 | 5+ | 1 | Critical 1 | 25 |

**Anti-Armored X** checks for the **Armored** Trait tag, not a target's Armor Save characteristic (see Unit Tags). The Rapier's increased cost reflects its unconditional Critical 1, which converts one failed Hit die after rerolls even without a Surge. As always, Critical Hits bypass Armor/Evade but allow Ward.

### Heavy Melee Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | --- | --- | --- | --- | --- |
| Greatsword | Engaged | 1 | 5+ | 2 | Heavy, Anti-Armored 2 | 15 |
| Greataxe | Engaged | 2 | 5+ | 2 | Heavy, Anti-Monster 2 | 20 |
| Maul | Engaged | 1 | 4+ | 2 | Heavy, Surge: Stagger, Anti-Armored 2 | 20 |
| Halberd | Engaged 2" | 1 | 5+ | 2 | Heavy, Brace 1, Anti-Cavalry 2 | 20 |

Heavy weapons follow the normal Heavy restrictions. A Heavy Attack cannot normally be used if the Unit voluntarily Moved or performed a Movement Action during the previous Movement Phase. Abilities explicitly overriding Heavy restrictions take precedence.

## RANGED WEAPONS

Ranged weapons normally attack during the Assault Phase.

### Thrown and Simple Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | --- | --- | --- | --- | --- |
| Sling | 6" | 3 | 6+ | 1 | — | 0 |
| Throwing Knives | 6" | 3 | 5+ | 1 | — | 5 |
| Javelins | 6" | 3 | 5+ | 1 | — | 5 |

Javelins — Combat Profile

| Weapon | Range | A | Hit | Dmg | Keywords |
| --- | --- | --- | --- | --- | --- |
| Javelin | Engaged | 3 | 5+ | 1 | — |

Purchasing Javelins grants both profiles. Their Point cost is counted only once.

### Bows

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | --- | --- | --- | --- | --- |
| Shortbow | 6" | 4 | 6+ | 1 | — | 5 |
| Longbow | 9" | 4 | 6+ | 1 | Long Range 3 | 10 |
| Heavy Bow | 9" | 1 | 5+ | 2 | Heavy, Anti-Armored 2 | 15 |

Long Range increases the Longbow's maximum effective distance to 12", but Attacks beyond 9" worsen Hit by one step.

### Crossbows

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | --- | --- | --- | --- | --- |
| Crossbow | 8" | 3 | 5+ | 1 | Heavy | 10 |
| Repeating Crossbow | 8" | 4 | 6+ | 1 | — | 15 |
| Heavy Crossbow | 10" | 1 | 5+ | 2 | Heavy, Anti-Elite 2 | 15 |

### Firearms

All Firearms possess Instant in addition to their listed Keywords.

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | --- | --- | --- | --- | --- |
| Pistol | 6" | 2 | 5+ | 1 | Firearm, Instant | 10 |
| Carbine | 8" | 3 | 6+ | 1 | Firearm, Instant | 15 |
| Musket | 10" | 1 | 4+ | 2 | Firearm, Heavy, Instant, Anti-Character 2 | 20 |
| Blunderbuss | 6" | 4 | 6+ | 1 | Firearm, Rapid-Fire 2, Instant | 20 |

Firearm identifies the Attack as a firearm for rules and Talent interactions. Firearm Attacks remain Physical unless another rule grants Magic. Instant prevents the Attack from being responded to with Command Abilities. Rapid-Fire 2 grants two additional Attack dice when the target is within half the weapon's normal Range. Firearms generally have strong immediate effectiveness but are harder to improve through Talents that specifically benefit bows and other non-Firearm ranged weapons.

## SHIELDS

| Equipment | Points | Effect |
| --- | --- | --- |
| Shield | 15 | Improve Armor by 1 step |

A Shield may normally be combined with a one-handed melee weapon, Spear, Pistol, or another appropriate one-handed item. A character cannot benefit from more than one Shield at a time. Shields improve the Armor characteristic after the effects of worn armor are determined.

## ARMOR

Armor provides a base Armor Save. When wearing armor, use its Armor value if it is better than the character's existing Armor. Armor does not add another Save; it replaces the Armor characteristic when beneficial.

### Armor Types

| Armor | Armor | Points | Additional Rule |
| --- | --- | --- | --- |
| Light Armor | 5+ | 10 | — |
| Medium Armor | 4+ | 20 | — |
| Heavy Armor | 3+ | 35 | Move −1" |

Light Armor: Leather, gambeson, reinforced clothing, and light mail.

Medium Armor: Mail, brigandine, breastplates, and scale armor.

Heavy Armor: Full plate, heavy lamellar, and similarly protective equipment.

Heavy Armor reduces Move by 1" unless an applicable Class, Talent, ancestry ability, or other rule allows the character to ignore that penalty.

### Armor and Shields

A Shield improves the final Armor characteristic by one step. Examples:

| Equipment | Final Armor | Equipment Points |
| --- | --- | --- |
| Warrior, no armor | 5+ | 0 |
| Medium Armor | 4+ | 20 |
| Medium Armor + Shield | 3+ | 35 |
| Heavy Armor + Shield | 2+ | 50 |

Armor cannot normally improve beyond 2+.

### Class Armor Access

The following are standard equipment access guidelines:

| Class | Normal Armor Access |
| --- | --- |
| Warrior | Light, Medium, Heavy, Shields |
| Rogue | Light, Medium, appropriate Shields |
| Mage | Light |
| Priest | Light, Medium, Shields |
| Artificer | Light, Medium |

These restrictions may be expanded by Class features, Talents, ancestry abilities, specialized equipment, or the GM.

## MAGICAL FOCI

A character may normally equip one magical focus. Magical foci improve Spell Attacks or provide supernatural benefits.

| Focus | Points | Effect |
| --- | --- | --- |
| Arcane Focus | 10 | Choose one Spell Attack; +1" Range |
| Channeling Focus | 15 | Once per Round, reroll one natural 1 on a Spell Attack |
| Protective Focus | 20 | Gain Ward 6+ against Magic |

Focus improvements apply while the item is equipped. A magical focus does not grant additional Spell Attacks unless explicitly stated.

## LEARNING SPELLS

Spell Attacks are permanently learned through appropriate magical training, scrolls, books, or other sources.

### Starting Spells

Characters begin knowing the Spell Attacks granted by their Base Class and Subclass. These spells are included in the character's Base Character Value. Starting spells do not occupy prepared Command Ability slots.

### Additional Spells

Additional Spell Attacks may be learned from appropriate magical scrolls or other sources. For now, use the following provisional costs for newly learned spells:

| Spell Category | Points | Typical Examples |
| --- | --- | --- |
| Basic Spell | 10 | Ordinary single-target attack |
| Specialized Spell | 20 | Attack with control, support, or limited area effects |
| Powerful Spell | 30 | Especially strong, broad, or unusual Attack |

These values are guidelines until the full Spell Catalogue is finalized. A newly learned Spell Attack adds its listed Points to the character's battlefield value as permanent spell knowledge. Reading or studying the scroll grants the spell permanently when its learning requirements are met. The scroll is normally consumed or otherwise expended during this process. The character does not need to continue carrying the original scroll.

Known Spell Attacks:

- May be used during their appropriate combat phase.
- Do not occupy Command Ability preparation slots.
- May be improved through Prowess or Spell Prowess.
- Remain known unless a special rule removes access to them.

Additional Spell Attacks do not grant additional activations.

## MAGICAL EQUIPMENT

Magical equipment provides abilities beyond those of mundane equipment. A magical weapon, armor, or shield normally uses the profile of its mundane equivalent, with the listed additional properties. Unless stated otherwise, magical equipment costs are added to the base equipment cost. For example, a magical Longsword with a +20 Point enchantment costs: 10 + 20 = 30 Points. Magical equipment may also provide Item Commands.

### Artifact Categories

| Category | Typical Points | Function |
| --- | --- | --- |
| Minor Artifact | 10–20 | Small passive improvement or limited utility |
| Major Artifact | 25–40 | Strong combat improvement or specialized Command |
| Relic | 50+ | Powerful, distinctive capabilities |

Relics are usually earned through adventures or important story events rather than purchased normally.

### Item Commands

Some equipment grants a Command Ability while equipped.

Item Commands:

- Are available while the item remains equipped.
- Do not occupy the character's four optional prepared Command slots.
- Cost CP normally.
- Follow the normal once-per-Turn rule unless stated otherwise.
- Cannot be used when the equipment is unavailable or disabled.

## MAGICAL WEAPONS

Magical Weapon Enchantments modify an existing weapon. Their Point costs are additional to the base weapon cost.

| Enchantment | Added Points | Primary Benefit |
| --- | --- | --- |
| Flamebrand | 20 | Magic, Anti-Regeneration 1, Surge Damage |
| Frostbite | 20 | Magic, Slow 1, Freezing Strike |
| Stormcaller | 25 | Magic, nearby Direct Damage on Surge |
| Duelist's Edge | 30 | Critical 1, Perfect Form |
| Giantslayer | 25 | Anti-Monster 2, better Hit against large creatures |
| Witch-Hunter's Weapon | 35 | Anti-Magic 1, Critical against Ward users |
| Vampiric Weapon | 30 | Healing after removing models. |
| Weapon of Returning | 15 | Returning thrown weapon, extended Range |

### Flamebrand — +20 Points

The weapon gains **Magic, Fire**, and Anti-Regeneration 1. Anti-Regeneration grants +1 Attack die against Units possessing a Regeneration ability. When the weapon's Attack Surges, one successful Hit deals +1 Damage.

### Frostbite — +20 Points

The weapon gains Magic. When this weapon deals Damage, the target suffers Slow 1 until the end of its next Movement activation.

### Freezing Strike — 1 CP, Assault or Combat

Before making an Attack with this weapon, empower its slowing effect. If the Attack deals Damage, increase the resulting Slow from 1 to 2.

### Stormcaller — +25 Points

The weapon gains Magic. Once per Round, when its Attack Surges, choose another enemy Unit within 2" of the original target. That Unit suffers Direct Damage 1. Ward applies.

### Duelist's Edge — +30 Points

The weapon gains Critical 1. If the weapon already possesses Critical, increase its Critical value by 1 instead. An item may only receive Duelist's Edge once.

### Perfect Form — 1 CP, Combat

Before making an Melee Attack with this weapon, gain Accurate 2 for that Attack.

### Giantslayer — +25 Points

The weapon gains Anti-Monster 2. Against a Monster or single Model possessing a Wounds characteristic of 6 or more, improve Hit by 1 step. Anti-Monster 2 grants +2 Attack dice against Monster-tagged Units.

### Witch-Hunter's Weapon — +35 Points

The weapon gains Anti-Magic 1. Anti-Magic applies against Units possessing Spell Attacks or magical abilities. Against a target possessing an applicable Ward, the weapon gains Critical 1. This Critical stacks with existing Critical.

### Vampiric Weapon — +30 Points

Once per Round, after this weapon Surges or removes at least one model from a unit, Heal 1 Wound to the wielder. This cannot increase the wielder above their normal maximum Wounds.

### Weapon of Returning — +15 Points

Choose one thrown Weapon Attack. Increase its Range by 3". After resolving the Attack, the weapon returns immediately to its wielder. The weapon remains available for subsequent eligible Attacks.

## MAGICAL ARMOR

Magical Armor uses the normal Armor value of its base equipment unless otherwise specified.

| Enchantment | Added Points | Effect |
| --- | --- | --- |
| Armor of Resilience | 20 | Gain Tough 1 |
| Spellguard Armor | 20 | Gain or improve Ward against Magic |
| Armor of the Bastion | 25 | Improve Armor while stationary |
| Armor of Endurance | 25 | +1 Wound and Direct Damage protection |
| Shadow Armor | 25 | Improved Evade and Concealment |

### Armor of Resilience — +20 Points

Gain Tough 1 while wearing this armor.

### Spellguard Armor — +20 Points

Gain Ward 6+ against Magic. If you already possess an applicable Ward against Magic, improve it by 1 step instead.

### Armor of the Bastion — +25 Points

If you did not Move during the Movement Phase, improve Armor by 1 step until your next Movement activation.

### Armor of Endurance — +25 Points

Gain +1 maximum Wound. Once per Round, reduce the first instance of Direct Damage you suffer by 1, to a minimum of 0.

### Shadow Armor — +25 Points

Improve Evade by 1 step. After Disengaging, gain Concealed until you Attack, enter Engagement, or the Round ends.

## MAGICAL SHIELDS

Magical Shields provide the normal Shield benefit in addition to their enchantments.

| Shield | Added Points | Additional Benefit |
| --- | --- | --- |
| Mirror Shield | 20 | Magical Ward and reflection |
| Shield of the Guardian | 20 | Ally interception |
| Spellbreaker Shield | 25 | Magical Command protection |

### Mirror Shield — +20 Points

Gain Ward 6+ against Magic.

### Reflect — 1 CP, Reaction

After passing a Ward Save against a non-Instant Magic Attack, roll one D6. On 5+, the attacker suffers Direct Damage 1. Ward applies normally.

### Shield of the Guardian — +20 Points

### Interpose — 1 CP, Reaction

When an ally within 2" is targeted by an Attack or Charge, move up to 2" toward that ally. If you finish within 2", redirect one incoming Hit or Charge Impact Hit to yourself before Saves are rolled. Resolve your own Saves against the redirected Hit.

### Spellbreaker Shield — +25 Points

### Nullify — 1 CP, Reaction

When targeted by a non-Instant magical Command Ability, roll one D6. On 4+, the ability fails against you. Other targets are affected normally.

## ARCANE AND DIVINE FOCI

These magical implements occupy the Focus slot.

| Focus | Points | Benefit |
| --- | --- | --- |
| Wand of Precision | 15 | Accurate 1 on a Spell Attack once per Round |
| Staff of Reach | 15 | +2" Range to one Spell Attack |
| Staff of Echoes | 25 | Echo Spell Command |
| Orb of Channeling | 25 | Spell reroll and Overchannel Command |
| Holy Reliquary | 20 | +1 Heal once per Round |
| Icon of Protection | 20 | Nearby allied protection against Magic |

### Wand of Precision — 15 Points

Once per Round, one Spell Attack gains Accurate 1.

### Staff of Reach — 15 Points

Choose one Spell Attack. Increase its Range by 2".

### Staff of Echoes — 25 Points

### Echo Spell — 1 CP, Assault — Once per Round

After resolving a Spell Attack, resolve one additional normal Hit against the same target. The target makes its applicable Saves. This additional Hit cannot generate a Surge or Blunder.

### Orb of Channeling — 25 Points

Once per Round, reroll one natural 1 on a Spell Attack.

### Overchannel — 1 CP, Assault

Your next Spell Attack this Turn gains +1 Attack die.

### Holy Reliquary — 20 Points

Once per Round, when one of your abilities Heals a Unit, increase the amount Healed by 1.

### Icon of Protection — 20 Points

Friendly Units within 2" gain Ward 6+ against Magic. This does not improve an already applicable Ward.

## GENERAL ARTIFACTS

A character may normally equip up to two General Artifacts.

| Artifact | Points | Benefit |
| --- | --- | --- |
| Ring of Accuracy | 15 | Accurate 1 once per Round |
| Ring of Fortitude | 15 | Tough 1 once per Round |
| Boots of Swiftness | 15 | +1" Move |
| Boots of Leaping | 10 | Ignore 2" of Difficult Terrain each Move |
| Cloak of Shadows | 20 | Concealed while unengaged until attacking |
| Cloak of Displacement | 25 | Improve applicable Evade once per Round |
| Amulet of Warding | 20 | Ward 6+ against Physical or Magic |
| Charm of Second Chances | 20 | Reroll one die once per Round |
| Commander's Horn | 20 | Sound the Advance Command |
| Banner of Defiance | 25 | Nearby allies ignore a temporary penalty |
| Hourglass of Haste | 30 | Borrowed Time Command |

### Ring of Accuracy — 15 Points

Once per Round, before making an Attack, gain Accurate 1 for that Attack.

### Ring of Fortitude — 15 Points

Once per Round, when making Armor Saves, gain Tough 1 for that Save pool.

### Boots of Swiftness — 15 Points

Increase Move by 1".

### Boots of Leaping — 10 Points

Ignore the first 2" of Difficult Terrain during each Move.

### Cloak of Shadows — 20 Points

If you begin the Round outside Engagement, gain Concealed until you Attack or enter Engagement.

### Cloak of Displacement — 25 Points

Once per Round, when targeted by an Attack against which you may use Evade, improve Evade by 1 step for that Attack.

### Amulet of Warding — 20 Points

Choose Physical or Magic when acquiring this Artifact. Gain Ward 6+ against that Attack type.

### Charm of Second Chances — 20 Points

Once per Round, reroll one die you have rolled. The new result must be kept. A die may only be rerolled once.

### Commander's Horn — 20 Points

### Sound the Advance — 1 CP, Movement

Choose one friendly Unit within Short Range. Move that Unit up to 2". This movement cannot enter Engagement.

### Banner of Defiance — 25 Points

Friendly Units within 2" may ignore the first temporary Hit or Move penalty applied to them each Round.

### Hourglass of Haste — 30 Points

### Borrowed Time — 1 CP, Movement — Once per Round

Choose yourself or one friendly Unit within Short Range. Increase its Move by 2" until the end of the Round.

## RELICS

Relics are exceptional magical items. They are normally acquired through major adventures, powerful enemies, ancient ruins, or important narrative events. Relic prices represent battlefield value rather than ordinary market availability.

### Blade of the Falling Star — 95 Points

Melee Weapon — Relic

| Range | A | Hit | Dmg | Keywords |
| --- | --- | --- | --- | --- |
| Engaged | 2 | 4+ | 2 | Magic, Critical 2, Anti-Elite 2 |

When the Attack Surges, one Critical Hit may deal +1 Damage. This is the weapon's complete Point cost, not an enchantment added to another weapon.

### Aegis of the First King — 50 Points

Shield — Relic Counts as a Shield. Improve Armor by 1 step. Gain Ward 5+ against Magic.

### Hold the Line — 1 CP, Reaction — Once per Round

When you or an ally within 2" is targeted by a non-Instant Attack, affected friendly Units within 2" of you gain Tough 2 against the triggering Attack.

### Crown of Command — 50 Points

Artifact — Relic Increase the Range of friendly-targeted Command Abilities by 2". Once per Round, reduce the CP cost of one Command Ability targeting an ally by 1, to a minimum of 0.

### Staff of the Archmage — 55 Points

Magical Focus — Relic Choose one Spell Attack.

That Attack gains:

- +2" Range.
- +1 Attack die.

Once per Round, when making a Spell Attack, replace one normal successful Hit with Direct Damage 1. Ward applies normally.

### Masterful Casting — 1 CP, Assault

Your next Spell Attack this Turn gains Accurate 2.

### Saint's Reliquary — 55 Points

Magical Focus — Relic Gain Ward 5+ against Magic. Once per Round, when Healing another Unit, Heal 1 Wound to yourself.

### Greater Miracle — 2 CP, Movement — Once per Battle

Choose up to three friendly Units within Short Range. Heal 1 Wound to each selected Unit. This cannot restore removed Models.

## ENCHANTMENT COMPONENTS

Rather than requiring every magical item to have its own unique rules, ordinary equipment may receive additional Enchantments. Enchantments increase the equipment's battlefield value by their listed Points. A normal item may receive multiple compatible Enchantments, provided the equipment and enchantments are narratively appropriate. An individual Enchantment cannot normally be applied more than once to the same item.

### Minor Enchantments

| Enchantment | Added Points |
| --- | ---: |
| Accurate 1 | 10 |
| Tough 1 | 15 |
| +1" Attack Range | 5 |
| +1" Move while equipped | 10 |
| Anti-[Category] 1 | 10 |
| Magic Attack keyword | 10 |

Minor Enchantments generally provide modest improvements or a narrow specialization.

### Major Enchantments

| Enchantment | Added Points |
| --- | ---: |
| Critical 1 | 30 |
| Ward 6+ against one type | 20 |
| +1 Maximum Wound | 15 |
| +1 Attack die on one profile | 15 |
| Improve Hit by 1 step | 20 |
| +1 Damage on one profile | 30 |
| Improve Armor by 1 step | 20 |
| Conditional Direct Damage 1 | 25 |
| Minor Item Command | 15–25 |

The GM may adjust the Points of unusual Enchantments based on their scope and interaction with other properties. Items still follow normal characteristic limits.

### Command-Imprinted Equipment

Some magical equipment enhances a Universal Command already known to the character. Because all PCs already possess Universal Commands, an item merely granting the same Command provides no additional benefit. Instead, an imprinted item may improve one aspect of that Command when used with the item. Examples:

### Blade of Focus — +15 Points

When using Focus with this weapon, increase its Accurate value from 2 to 3.

### Shield of Bracing — +15 Points

When using Brace while equipped with this Shield, increase Tough from 2 to 3.

### Boots of Quickening — +15 Points

When using Quick Step while wearing these Boots, increase its movement by 1". These improvements do not grant additional Command uses.

## CRAFTING

Crafting allows characters to create, repair, and improve equipment using materials, tools, training, and appropriate facilities. Crafting uses the normal Characteristic + Skill rules. A character does not require a separate crafting progression system. A skilled character with improved Craft or Mysticism naturally becomes more capable of producing exceptional equipment.

### Crafting a New Item

To craft an item:

- Choose the equipment being created.
- Obtain appropriate materials, tools, and any necessary recipe.
- Determine the item's Crafting Difficulty.
- Roll the appropriate Characteristic + Skill.
- Compare the number of successes to the item's Difficulty.
- Resolve any excess successes, Surges, and Blunders.

### Crafting Difficulty

Unlike Skill-scaled Commands, crafting is a task with an explicit Difficulty representing the complexity of the work.

| Difficulty | Successes Required | Typical Equipment |
| --- | --- | --- |
| Simple | 1 | Clubs, simple tools, ordinary supplies |
| Standard | 2 | Martial weapons, bows, shields, Light Armor |
| Complex | 3 | Heavy weapons, firearms, mechanical equipment, Medium Armor |
| Advanced | 4 | Heavy Armor, intricate machinery, minor magical equipment |
| Exceptional | 5 | Major magical equipment, advanced constructs, exceptional enchantments |

Relics generally require unique materials, specialized knowledge, and significant narrative effort rather than being available through ordinary crafting alone. The GM may adjust Difficulty to reflect unusual designs or circumstances.

### Crafting Checks

The default Skill is Craft, paired with whichever Characteristic best represents the work being performed.

| Approach | Suggested Check |
| --- | --- |
| Forging and metalworking | Body + Craft |
| Fine mechanisms and delicate work | Agility + Craft |
| Engineering, design, and assembly | Mind + Craft |
| Magical enchantment | Mind + Mysticism |
| Sacred or spiritual enchantment | Spirit + Mysticism |

The GM chooses the most appropriate pairing. A character must have access to reasonable tools and materials for the proposed item.

### Crafting Success

If the Check generates successes equal to or greater than the Difficulty, the item is completed. It receives its normal equipment profile and battlefield Point value. For every success beyond the required Difficulty, gain one Crafting Quality. For example: A character attempts to craft a Longsword, Difficulty 2. They roll four successes. The Longsword is completed with two Crafting Qualities available.

### Crafting Surge

If the Crafting Check generates a Surge, gain one additional Crafting Quality on a successful craft. This is in addition to any Qualities earned through excess successes. A Surge on an unsuccessful craft may instead preserve valuable materials, reveal a better technique, or provide another reasonable narrative benefit.

### Crafting Blunder

A Crafting Blunder creates a complication. A successful craft may still Blunder. If the item is completed despite the Blunder, it gains one Flaw. If the craft fails and Blunders, the GM may instead introduce wasted materials, damaged tools, additional work, or another appropriate setback. A Check may generate both a Surge and a Blunder. Resolve both independently.

## CRAFTING QUALITIES

Crafting Qualities represent superior workmanship. They may improve an item's performance, durability, handling, or other appropriate characteristics. Unspent Qualities may instead represent exceptional appearance, craftsmanship, or narrative value.

### Common Qualities

| Quality | Qualities Required | Added Points |
| --- | --- | --- |
| Balanced — Accurate 1 | 1 | 10 |
| Extended — +1" Range | 1 | 5 |
| Specialized — Anti-[Category] 1 | 1 | 10 |
| Reinforced — Tough 1 on Armor | 1 | 15 |
| Swift — +1" Move while equipped | 1 | 10 |
| Deadly — +1 Attack die | 2 | 15 |
| Precise — Improve Hit by 1 step | 2 | 20 |
| Destructive — +1 Damage | 2 | 30 |
| Protective — Improve Armor by 1 step | 2 | 20 |

A Quality may only be applied to compatible equipment. For example: Balanced and Deadly apply to Weapon Attacks. Reinforced applies to Armor. Protective applies to Armor or appropriate protective equipment. Extended applies to ranged or extended-reach weapons. Swift applies to equipment suitable for improving movement. A named Quality may normally be applied only once per item. Crafting Qualities providing magical effects require appropriate supernatural materials and magical craftsmanship.

Magical Enchantments remain subject to their normal crafting requirements.

### Qualities and Equipment Points

The Points value of crafted equipment is: Base Equipment Points + Added Quality Points + Enchantment Points Crafting does not make improved equipment free for battlefield balance purposes. A masterwork weapon may cost little XP to create, but its superior effectiveness still contributes to its owner's final battlefield value.

## CRAFTING FLAWS

Blunders may introduce defects or unexpected properties. The GM selects a Flaw appropriate to the item and the circumstances of its creation.

| Flaw | Effect |
| --- | --- |
| Unwieldy | Worsen the item's Hit by 1 step |
| Cumbersome | Reduce Move by 1" while equipped |
| Fragile | When an Attack using this item Blunders, the item becomes unusable until repaired |
| Unreliable | When an Attack using this item Blunders, the wielder becomes Off-Balance |
| Noisy | Using the item immediately ends the wielder's Concealed condition |
| Unstable | When the item's magical effect Blunders, its wielder suffers 1 Damage |
| Imperfect | One selected Crafting Quality remains inactive until the item is repaired |

Flaws should be selected based on the item's nature. For example, Cumbersome may be appropriate for poorly fitted armor, while Unreliable may suit a badly constructed firearm. A Blunder does not automatically negate an otherwise successful craft. Flaws generally do not reduce battlefield Points until they are deliberately incorporated into a separately balanced item profile.

## REPAIRING EQUIPMENT

Repairing an item normally requires appropriate tools, materials, and a Craft Check. The Difficulty is normally the same as crafting the original item. On success, remove one applicable Flaw or restore the item to normal use. Excess successes may reduce the time or materials required, or provide an appropriate narrative benefit. Repairs do not automatically grant new Crafting Qualities. A character may attempt to improve an existing item as a separate crafting project, using an appropriate Difficulty determined by the proposed improvement.

## CRAFTING EXAMPLE

A skilled Warrior wants to forge an exceptional Longsword. The Longsword normally costs 10 Points and has: Engaged / 4 / 5+ / 1 The GM assigns Difficulty 2. The Warrior has: Body 5 Craft 4+ The Warrior rolls five dice: 1, 4, 5, 6, 6 Four successes are generated, and the Check also Surges.

The result is:

- Two successes satisfy the Difficulty.
- Two excess successes grant two Qualities.
- The Surge grants one additional Quality.
- No Blunder occurs.

The Longsword receives three Crafting Qualities. The player chooses: Deadly — 2 Qualities +1 Attack die. Balanced — 1 Quality Accurate 1. The completed weapon becomes: Masterwork Longsword

| Range | A | Hit | Dmg | Keywords |
| --- | --- | --- | --- | --- |
| Engaged | 5 | 5+ | 1 | Accurate 1 |

Its battlefield value is:

| Component | Points |
| --- | --- |
| Longsword | 10 |
| Deadly | +15 |
| Balanced | +10 |
| Total | 35 |

A PC wielding this Masterwork Longsword rolls **5 Attack dice**, exactly as shown in its final profile, before any additional modifiers granted by Talents, Commands, or other applicable effects. This exceptional weapon is stronger than a mundane Longsword, and its Point value reflects the added Crafting Qualities.

## EQUIPMENT RULES SUMMARY

Equipment adds Points, not XP. **Printed Weapon profiles are complete PC Attack profiles.** Melee Attacks use the Combat Phase; ranged Attacks use the Assault Phase. Only equipped weapons and relevant equipment contribute their equipment Points. Starting spells are included in Base Character Value except when expressly optional with a separate cost. Additional learned spells have assigned Points values. Magical equipment may provide passive benefits or Item Commands. Item Commands do not occupy prepared Command slots.

Enchantments and Crafting Qualities add their listed Points. Crafting Difficulty determines whether an item is successfully produced. Excess crafting successes and Surges grant Qualities. Blunders may introduce Flaws. Repairs remove defects; equipment improvements are separate projects.


## Combat Timing and Elemental Equipment

Making an ordinary ranged Weapon Attack uses the Unit's **Assault Attack action**; it is not combined with an ordinary Assault Move. Weapon profiles are already final PC attack profiles and are unrelated to NPC Unit weapons. The normal Charge uses **2D6 + Charge X**, base Impact equal to the highest Charge die, and printed Impact X as an additional bonus. Enchanted weapons may gain **Fire, Frost, Lightning** or another elemental attribute in addition to Physical or Magic if their specific effect names that attribute; no attribute creates a separate Save.


## Artificer Formulae and Permanent Crafting

Artificer Formulas provide **temporary battlefield effects** and are learned through Class features and Talents; they do not require creating, carrying, or purchasing a permanent potion or device for each use. A lasting crafted item or enchanted weapon still follows the ordinary **Crafting Difficulty, Qualities, Flaws, Equipment Points, and slot rules** above. A Physical weapon temporarily granted Fire or Frost by a Runesmith keeps its primary Physical Attack type. See [Artificer Formulas](18_artificer_formulas.md) and [Keywords](10_keywords.md#attack-types-and-elemental-attributes).
