# Classes

Classes represent a character's primary training, capabilities, and battlefield role. Each Player Character chooses one Base Class and one of its Subclasses. A Base Class establishes the character's starting combat profile and grants a shared Class Ability. A Subclass provides a Signature Ability or equivalent always-prepared feature, additional capabilities, and suggested equipment. Class Abilities are always available unless otherwise specified. Subclass Signature Commands and the Artificer's Field Specialty are always prepared and do not count against the character's four optional prepared Command Ability slots.

### STARTING EQUIPMENT

Characters begin at **100 base Points**. Their final Point Value is **max(100, spent Talent XP) + Equipment Points + other explicit costs**; see [Advancement](03_experience_and_advancement.md).

The following conventions apply to equipment listed under each Class:

- Standard: The recommended primary weapon for that Subclass. It is not mandatory or automatically free.
- Included: Equipment that adds 0 Points to the character's value.
- Optional: Additional suggested equipment that may be acquired normally.
- Starting Spells: Automatically known Spell Attacks included in the Base Character Value unless a specific optional spell states an additional cost.

**Cost rule:** Select a recommended or permitted weapon and pay its listed price from the Equipment Catalogue. A Class/Subclass provides access and recommendations, not a second version of the weapon or a price discount. For learned spells outside the granted starting set, use the assigned Points from the Spell Catalogue.

A character may normally equip one primary melee weapon, one ranged weapon, and reasonable backup weapons. Known Spell Attacks do not occupy physical weapon slots. Only equipped weapons contribute their listed Equipment Points. Armor, Shields, and magical foci are purchased separately. The [Equipment Catalogue](11_equipment_and_crafting.md) is the **authoritative source** for PC weapon Attack profiles **and their Point costs**. For convenience, this chapter repeats the relevant weapon and starting spell profiles directly beneath each Class and Subclass. These are reference copies, **not** different versions or free equipment; if a profile is later revised, the Class tables must be synchronized. Starting Spell Attacks are also maintained in [Starting Spells](06_spells_and_equipment.md); Characters know the spells granted by their Class/Subclass at the stated included or optional cost. Class weapon suggestions use those exact Attack profiles and Point costs; the Class tables were synchronized with the Equipment Catalogue (including the **v5 Damage-output rebalance** Anti-[Type] changes) and the Spell profiles. NPC Unit Attack profiles are separate.

### ATTACK PROFILES

PC Attack profiles use the following columns. **A** is the number of Attack dice the Character rolls using the listed weapon or spell before specifically granted modifications (such as Prowess or Commands). Use each printed profile directly; apply only specific modifiers from Talents, Commands, or equipment.

| Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | --- | --- | --- | --- |
| Attack Range | Attack dice | Hit target | Damage | Special properties | Equipment cost |

Assault Phase: Ranged Weapon Attacks and ranged Spell Attacks.

Combat Phase: Melee Weapon Attacks and Spell Attacks with an Engaged Range.

Characters may acquire weapons for either phase, regardless of their Subclass’s suggested equipment. A Class without a starting Assault Attack may still participate in that phase through other eligible actions and may acquire ranged weapons later. Charging remains a standard **Assault action** available to eligible Units, using universal 2D6 (plus Charge X) in Structured Combat or success-based Charging in Narrative Combat. A Charge's base Impact equals the highest Charge die, with Impact X adding to it.

**Example:** A Berserker choosing the standard Longsword pays its listed **10 Equipment Points** and uses **Engaged / A 4 / Hit 5+ / Dmg 1** as printed in the Equipment Catalogue. It does not become A 5 merely because a PC or Warrior equips it. An explicit +1 Attack die from a Talent or Command would increase it to A 5 for the specified Attack.

## WARRIOR

*Role: Martial combat, durability, direct confrontation*

*This Class gains the Armored tag*

| Move | Wounds | Armor | Evade | Ward |
| --- | --- | --- | --- | --- |
| 4" | 5 | 5+ | 6+ | — |

### Class Ability — Overpower

**Passive**

When the Warrior Surges on an attack or charge, for each Surge, reduce the target's Tough by X, where X is the number of Surges.

### BERSERKER

Berserkers sacrifice their own safety for bursts of speed and overwhelming aggression.

#### Frenzy

**1 CP — Movement**

Suffer 2 Damage that cannot be saved or prevented.

Until the end of the Round:

- Gain +X" Move.
- Add X Attacks to your next attack

Where X is half your Body characteristic, rounded up.

The additional Attack dice are consumed when the Attack is resolved.

#### Combat Phase — Suggested Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Longsword (standard)** | Engaged | 4 | 5+ | 1 | — | 10 |
| Greataxe | Engaged | 2 | 5+ | 2 | Heavy, Anti-Monster 2 | 20 |
| Maul | Engaged | 1 | 4+ | 2 | Heavy, Surge: Stagger, Anti-Armored 2 | 20 |


Assault Phase: The Berserker has no default ranged weapon. Ranged equipment may be acquired normally.

### KNIGHT

Knights specialize in holding positions, controlling Engagements, and resisting enemy advances.

*This Subclass also gains the Infantry tag*

#### Hold the Line

**1 CP — Reaction**

When targeted by an Attack or Charge, gain Tough X against that Attack or its Charge Impact, where X is half your Body characteristic, rounded up. Additionally, ignore any forced movement caused by the triggering Attack or Charge.

#### Combat Phase — Suggested Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Shortsword (standard)** | Engaged | 4 | 6+ | 1 | Accurate 1 | 5 |
| Spear | Engaged 2" | 3 | 5+ | 1 | Brace 1 | 10 |
| Warhammer | Engaged | 2 | 5+ | 2 | Anti-Armored 2 | 15 |


Optional Shield: 15 Points; improves Armor by one step when the equipment restrictions permit it.

Assault Phase: The Knight has no default ranged weapon. Ranged equipment may be acquired normally.

### FIGHTER

Fighters rely on disciplined technique, versatility, and consistent weapon performance.

*This Subclass also gains the Mobile tag*

#### Finesse

**1 CP — Assault or Combat**

Once per Round, when making one Weapon Attack, gain Accurate X, where X is your Agility characteristic. If the rerolled dice Surges, the attack gains Critical 1.

#### Assault Phase — Suggested Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| Shortbow | 6" | 4 | 6+ | 1 | — | 5 |
| Crossbow | 8" | 3 | 5+ | 1 | Heavy | 10 |


#### Combat Phase — Suggested Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Rapier (standard)** | Engaged | 4 | 5+ | 1 | Critical 1 | 25 |
| Greatsword | Engaged | 1 | 5+ | 2 | Heavy, Anti-Armored 2 | 15 |
| Shortsword | Engaged | 4 | 6+ | 1 | Accurate 1 | 5 |


The Fighter does not begin with a default ranged weapon, but its Finesse ability may be used with eligible ranged Weapon Attacks.

## ROGUE

*Role: Mobility, precision, exploiting weaknesses*

*This Class gains the Mobile tag*

| Move | Wounds | Armor | Evade | Ward |
| --- | --- | --- | --- | --- |
| 4" | 4 | 6+ | 5+ | — |

### Class Ability — Exploit Opening

**Passive**

Whenever this Character Surges during a Weapon Attack, generate 1 additional normal Hit for each Surge. These additional Hits are subject to Armor, Evade, and Ward saves as normal.

### ASSASSIN

Assassins exploit concealment and favorable positioning to eliminate vulnerable enemies.

#### Ambush

**1 CP — Assault**

When making a Weapon Attack or Charge from Concealed this Phase, that Attack gains Attacks +2 or Impact +2, whichever applies.

#### Assault Phase — Optional Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| Throwing Knives | 6" | 3 | 5+ | 1 | — | 5 |
| Crossbow | 8" | 3 | 5+ | 1 | Heavy | 10 |


#### Combat Phase — Suggested Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Dagger (standard)** | Engaged | 3 | 5+ | 1 | Accurate 1 | 0 |
| Shortsword | Engaged | 4 | 6+ | 1 | Accurate 1 | 5 |
| Rapier | Engaged | 4 | 5+ | 1 | Critical 1 | 25 |


The Assassin may use Ambush with either ranged or melee Weapon Attacks.

### RANGER

Rangers specialize in precision shooting, target selection, and exploiting favorable firing positions.

#### Hunter's Eye

When the Ranger Surges on a ranged attack, for each Surge, reduce the target's Cover by X, where X is the number of Surges.

#### Assault Phase — Suggested Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Shortbow (standard)** | 6" | 4 | 6+ | 1 | — | 5 |
| Longbow | 9" | 4 | 6+ | 1 | Long Range 3 | 10 |
| Heavy Bow | 9" | 1 | 5+ | 2 | Heavy, Anti-Armored 2 | 15 |


#### Combat Phase — Suggested Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Shortsword (standard)** | Engaged | 4 | 6+ | 1 | Accurate 1 | 5 |
| Dagger | Engaged | 3 | 5+ | 1 | Accurate 1 | 0 |
| Spear | Engaged 2" | 3 | 5+ | 1 | Brace 1 | 10 |


### BARD

Bards support allies through encouragement, performance, improvisation, and battlefield coordination. Their support improves ordinary Skill Checks and the reliability of allied Weapon Attacks rather than creating equipment enchantments.

*The Bard also gains the Support tag.*

#### Inspire

**1 CP — Movement**

Choose another friendly Unit within Short.

That Unit gains one of the following benefits:

- +1D6 on its next Skill Check this Round.
- Choose one Tag possessed by an enemy Unit on the battlefield. The friendly Unit gains Anti-[Chosen Tag] X for its next Weapon or Spell Attack this Round, where X equals half the Bard's Spirit, rounded up.

The chosen benefit is consumed when its eligible roll resolves. The benefit expires if unused at the end of the Round.

#### Assault Phase — Suggested Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Shortbow (standard)** | 6" | 4 | 6+ | 1 | — | 5 |
| Crossbow | 8" | 3 | 5+ | 1 | Heavy | 10 |
| Sling | 6" | 3 | 6+ | 1 | — | 0 |


#### Combat Phase — Suggested Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Staff (standard)** | Engaged 2" | 3 | 6+ | 1 | — | 0 |
| Shortsword | Engaged | 4 | 6+ | 1 | Accurate 1 | 5 |
| Dagger | Engaged | 3 | 5+ | 1 | Accurate 1 | 0 |


## MAGE

*Role: Offensive magic, arcane utility, battlefield manipulation*

*This Class gains the Wizard tag*

| Move | Wounds | Armor | Evade | Ward |
| --- | --- | --- | --- | --- |
| 3" | 3 | 6+ | 6+ | — |

### Base Spell Attacks — Assault Phase

All Mages begin knowing both Spell Attacks.

| Spell | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | --- |
| Magic Missile | 6" | 3 | 5+ | 1 | Magic, Pinpoint | Included |
| Force Bolt | 8" | 3 | 5+ | 1 | Magic, Surge: Push 1" | Included |


These Spell Attacks are included in the Base Character Value and do not occupy prepared Command Ability slots.

### ELEMENTALIST

Elementalists manipulate the properties of their magic to produce powerful attacks, elemental effects, and area damage.

#### Infusion

**1 CP — Assault**

During your own Assault activation, choose one Spell Attack you make as your chosen Assault action this activation. Apply one of the following modifications:

#### Empower

Gain +1 Attack die.

#### Extend

Increase Range by +3". Ignore Cover.

#### Unleash

On Surge, choose one:

- Gain Direct Damage 1.
- Gain Blast 1", or increase an existing Blast radius by 1".

Only one Infusion may be applied to an Attack.

#### Assault Phase — Subclass Spell Attacks

In addition to the Mage's Base Spell Attacks, pick one of the below:

| Spell | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | --- |
| Fireball | 6" | 3 | 5+ | 1 | Magic, Fire, Blast 1" | Included (choose one) |
| Spark | 6" | 3 | 6+ | 1 | Magic, Lightning, Surge: Instant | Included (choose one) |
| Ice Shard | 6" | 3 | 5+ | 1 | Magic, Frost, Surge: Slow 2 | Included (choose one) |


#### Combat Phase — Suggested Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Staff (standard)** | Engaged 2" | 3 | 6+ | 1 | — | 0 |
| Dagger | Engaged | 3 | 5+ | 1 | Accurate 1 | 0 |


### NECROMANCER

Necromancers specialize in reanimation, attrition, and sustaining themselves through stolen vitality.

#### Raise Thrall

**1 CP — Movement**

If you do not currently control a Thrall Unit, create one engaged with this character containing X Models, where X equals your Mind characteristic. A newly raised Thrall Unit cannot activate during the Round in which it was created. If you already control a Thrall Unit, you may instead target one summoned Thrall unit you control and add one Model to that Unit, provided it is not Engaged with an enemy. New Models must be placed within 3" of another Model in the same Unit, following normal placement rules.

A Necromancer may control only one Thrall Unit through Raise Thrall at a time.

#### Assault Phase — Subclass Spell Attacks

In addition to the Mage's Base Spell Attacks:

| Spell | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | --- |
| Life Drain | 4" | 3 | 5+ | 1 | Magic, On Damage: Heal 1 | Included |


#### Combat Phase — Suggested Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Dagger (standard)** | Engaged | 3 | 5+ | 1 | Accurate 1 | 0 |
| Staff | Engaged 2" | 3 | 6+ | 1 | — | 0 |
| Shortsword | Engaged | 4 | 6+ | 1 | Accurate 1 | 5 |


#### Summoned Unit — Thrall

| Move | Wounds | Armor | Evade | Ward |
| --- | --- | --- | --- | --- |
| 3" | 1/Model | 6+ | 6+ | — |

#### Combat Phase — Thrall Attack

| Attack | Range | A | Hit | Dmg | Keywords |
| --- | --- | --- | --- | --- | --- |
| Claws | Engaged | 2 | 6+ | 1 | — |

#### Reanimated — Passive

At the end of the Round, if this Unit still contains at least one Model and lost Models during that Round, roll one D6 for each Model lost. For each natural 6, return one Model to the Unit following normal placement rules. A completely destroyed Thrall Unit cannot benefit from Reanimated.

### ILLUSIONIST

Illusionists manipulate perception, disrupt enemy attacks, and protect allies through deception. This Subclass also gains the Support tag.

#### Phantasm

**1 CP — Movement**

Summon one Phantasm token (32mm base) within Short of this Unit and at least 3" away from any enemy Units. The Illusion counts as a temporary friendly Unit for enemy movement, Charge declarations, and Attacks. Enemy Units declaring a Charge against a friendly Unit within 3" of the Illusion reduce their total Charge distance by X after rolling for Charge, where X is half of the Illusionist's Mind characteristic.

#### Assault Phase — Subclass Spell Attacks

In addition to the Mage's Base Spell Attacks:

| Spell | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | --- |
| Mind Spike | 6" | 3 | 5+ | 1 | Magic, Surge: Weaken Hit | Included |


#### Combat Phase — Spell and Weapon Attacks

**Optional Spell Attack:**

| Spell | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | --- |
| Psychic Blade | Engaged | 3 | 5+ | 1 | Magic | 10 (optional) |

**Suggested melee weapons:**

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Dagger (standard)** | Engaged | 3 | 5+ | 1 | Accurate 1 | 0 |
| Shortsword | Engaged | 4 | 6+ | 1 | Accurate 1 | 5 |

Psychic Blade is optional and costs its printed 10 Points; the standard Dagger remains an equipment choice, not an additional free Attack.

## PRIEST

*Role: Support magic, protection, healing, supernatural intervention*

*This Class gains the Support tag*

| Move | Wounds | Armor | Evade | Ward |
| --- | --- | --- | --- | --- |
| 3" | 5 | 6+ | 6+ | — |

### Class Ability — Divine Ward

**1 CP — Movement**

Choose yourself or one friendly Unit within 6".

Until the beginning of your next activation:

- If the Unit has no Ward, grant Ward 6+.
- If the Unit already possesses Ward, improve its Ward by 1 step.

Repeated applications refresh the duration rather than stacking.

### Base Spell Attacks — Assault Phase

All Priests begin knowing both Spell Attacks.

| Spell | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | --- |
| Radiant Bolt | 6" | 3 | 5+ | 1 | Magic, Radiant | Included |
| Sacred Brand | 3" | 3 | 6+ | 1 | Magic, Surge: Accurate 1 | Included |


These Spell Attacks are included in the Base Character Value and do not occupy prepared Command Ability slots.

### CLERIC

Clerics specialize in healing, restoration, and protecting allies from supernatural threats.

#### Mend

**1 CP — Assault**

Choose yourself or one friendly Unit within 6". Heal X, where X equals your Spirit characteristic. If you choose yourself, you lose your activation for the Phase.

Mend cannot restore removed Models.

#### Assault Phase — Subclass Spell Attacks

In addition to the Priest's Base Spell Attacks:

| Spell | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | --- |
| Smite | 6" | 3 | 6+ | 1 | Magic, Radiant, Anti-Undead 1 | Included |


#### Combat Phase — Suggested Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Mace (standard)** | Engaged | 4 | 6+ | 1 | Anti-Armored 1, Surge: Slow 1 | 15 |
| Staff | Engaged 2" | 3 | 6+ | 1 | — | 0 |
| Dagger | Engaged | 3 | 5+ | 1 | Accurate 1 | 0 |


### DRUID

Druids manipulate the natural environment, restrict enemy movement, and shape the battlefield. This Subclass also gains the Wizard tag.

#### Overgrowth

**1 CP — Movement**

Choose a point within 6". Create a 2" radius area of Obstructing Terrain until the end of the round. Units may treat the area to be counted as being in Cover. This applies to friendly and enemy Units equally.

#### Assault Phase — Subclass Spell Attacks

In addition to the Priest's Base Spell Attacks:

| Spell | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | --- |
| Thorn Lash | 6" | 3 | 6+ | 1 | Magic, Nature, Surge: Slow 2 | Included |


#### Combat Phase — Suggested Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Axe (standard)** | Engaged | 5 | 6+ | 1 | — | 10 |
| Staff | Engaged 2" | 3 | 6+ | 1 | — | 0 |
| Dagger | Engaged | 3 | 5+ | 1 | Accurate 1 | 0 |


### ORACLE

Oracles specialize in foresight, changing outcomes, and interfering with enemy intentions.

#### Foretell

**1 CP — Reaction**

Once per Round, After a Unit within Medium of this Character rolls a dice pool, including any rerolls, but before resolving its effects, choose one:
- Favorable Omen: If the Unit is friendly, cancel X Blunders generated by that roll.
- Ill Omen: If the Unit is an enemy, cancel X Surges generated by that roll.
Where X is the Oracle's Mind characteristic. Canceling a Surge or Blunder does not change the dice results, Hits, Successes, or other effects triggered independently by individual dice.

#### Assault Phase — Subclass Spell Attacks

In addition to the Priest's Base Spell Attacks:

| Spell | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | --- |
| Omen Bolt | 6" | 3 | 5+ | 1 | Magic, Surge: Instant | Included |


#### Combat Phase — Suggested Weapons

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Dagger (standard)** | Engaged | 3 | 5+ | 1 | Accurate 1 | 0 |
| Shortsword | Engaged | 4 | 6+ | 1 | Accurate 1 | 5 |
| Staff | Engaged 2" | 3 | 6+ | 1 | — | 0 |



## ARTIFICER

*Role: Field preparation, invention, equipment utility, and adaptable tactical support*

*This Class gains the Support tag.*

| Move | Wounds | Armor | Evade | Ward |
| --- | --- | --- | --- | --- |
| 4" | 4 | 6+ | 6+ | — |

### Class Ability — Field Formulae

Choose one of the three Artificer Subclasses below, then learn **two Formulas** from that Subclass's five listed Formulas. Designate one known Formula as your **Field Specialty**: it is always prepared and fills the Artificer's Subclass Signature slot. The other is known but must occupy one of your **four optional prepared Command slots** to be used in battle. Whenever you prepare Commands outside combat, you may designate a different known Formula from your own Subclass as your Field Specialty.

Formula Commands use their own CP costs, activation timing, and occasional Craft/Mysticism Skill Checks. Formula-based Assault Attacks replace your ordinary Assault action. New Formulas and improvements are gained through Artificer Talents, described in [Talents](13_talents.md#artificer-talents). See [Artificer Formulas](18_artificer_formulas.md) for the five complete Formula entries for each Subclass.

### Starting Equipment

Artificers may choose a **Pistol, Dagger, or Shortsword** when selecting starting weapons; they may equip one melee weapon and one ranged weapon normally, paying each selected weapon's listed Equipment Points. They may acquire other equipment later under the ordinary equipment rules. There are no free weapons or extra Point charges for starting Formulas.

#### Assault Phase — Starting Weapon Option

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Pistol** | 6" | 2 | 5+ | 1 | Firearm, Instant | 10 |

#### Combat Phase — Starting Weapon Options

| Weapon | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | ---: |
| **Dagger** | Engaged | 3 | 5+ | 1 | Accurate 1 | 0 |
| **Shortsword** | Engaged | 4 | 6+ | 1 | Accurate 1 | 5 |

Artificers may also use their known **Formula Attacks** as their selected Assault action, paying CP and satisfying the corresponding Formula's preparation requirements. Formula Attack profiles appear in the subclass tables below for convenience and are defined in [Artificer Formulas](18_artificer_formulas.md).

### ALCHEMIST

Alchemists create field remedies, smoke, corrosive mixtures, and volatile thrown flasks. Choose **two** of their five Formulas at creation.

| Formula | Timing | Summary |
| --- | --- | --- |
| Quick Tonic | Movement, 1 CP | **Mind + Craft**; next friendly Move bonus scales with successes, max +4" |
| Restorative Draught | Movement, 1 CP | **Mind + Craft**; Heal up to 2 on one surviving Model |
| Smoke Vial | Movement, 1 CP | Create a 2"-radius smoke area granting Cover 1 |
| Corrosive Flask | Assault Attack, 1 CP | Physical Attack; on Hit, suppress Tough before Armor and through the Round |
| Volatile Flask | Assault Attack, 1 CP | Physical, Fire Attack with Blast 1" |

#### Formula Attacks — Assault Phase

| Formula | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | --- |
| Corrosive Flask | 6" | 3 | 5+ | 1 | Physical; on Hit: suppress Tough | Included Formula |
| Volatile Flask | 6" | 3 | 5+ | 1 | Physical, Fire, Blast 1" | Included Formula |

### MACHINIST

Machinists specialize in deployable devices, positioning, and targeting. Choose **two** of their five Formulas at creation.

| Formula | Timing | Summary |
| --- | --- | --- |
| Proximity Charge | Movement, 1 CP | Trap marker: 2 automatic Physical Hits, Armor/Ward, no Evade |
| Snare Wire | Movement, 1 CP | **Agility + Craft**; trap inflicts Slow based on successes |
| Spotter Lens | Movement, 1 CP | Reduce target's effective Cover X by 1 against next allied ranged Attack |
| Winch Line | Movement, 1 CP | **Body + Craft**; reposition an allied Unit according to successes |
| Rivet Launcher | Assault Attack, 1 CP | Physical Attack with Accurate 1 |

#### Formula Attack — Assault Phase

| Formula | Range | A | Hit | Dmg | Keywords | Pts |
| --- | --- | ---: | --- | ---: | --- | --- |
| Rivet Launcher | 8" | 3 | 5+ | 1 | Physical, Accurate 1 | Included Formula |

### RUNESMITH

Runesmiths temporarily inscribe equipment to create elemental attacks and defensive safeguards. Choose **two** of their five Formulas at creation.

| Formula | Timing | Summary |
| --- | --- | --- |
| Ember Rune | Movement, 1 CP | Next friendly Physical Weapon Attack gains Fire and Accurate 1 |
| Frost Rune | Movement, 1 CP | Next friendly Physical Weapon Attack gains Frost; unsaved Damage inflicts Slow 1 |
| Hunter's Sigil | Movement, 1 CP | **Mind + Mysticism**; next friendly Weapon Attack gains Anti-[type] X based on successes |
| Warding Etching | Movement, 1 CP | Grant Ward 6+ against Magic for the Round |
| Anchor Rune | Movement, 1 CP | Grant Brace 2 for the Round |

A runed Physical Weapon Attack remains **Physical**, even when it receives Fire or Frost. Elemental attributes may be carried by Physical or Magic Attacks; they do not change defenses unless a specific rule states otherwise.

## Shared References

The tables repeated in this chapter are player-facing quick references, not alternate profiles. They must be updated whenever their source catalogue changes. Use the [Equipment Catalogue](11_equipment_and_crafting.md) for all PC weapon Attack dice and prices, [Starting Spell Attacks](06_spells_and_equipment.md) for Class/Subclass starting spell profiles, and [Spell Catalogue](12_spell_catalogue.md) for additional learned spells including **Flame Lance (Magic, Fire)**, and [Artificer Formulas](18_artificer_formulas.md) for the fifth Class. All personal CP Commands follow the active Unit timing in the [full combat chapters](16_structured_combat.md); spell Attacks use the chosen Assault Attack action, not a free Attack following an Assault Move.
