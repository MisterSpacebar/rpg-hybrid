# Bestiary

*Integrated rulebook v7 · NPC Unit profiles are separate from the PC weapon and spell catalogues. Costs remain provisional unless otherwise stated.*

## General Bestiary Rules

Each Bestiary profile lists Points, number of Models, **per-Model** Wounds and Saves, and its native Attack profiles. Models in a Unit contribute their eligible Attacks to that Unit's combined pool; different target pools are resolved independently. **These are NPC attacks** and use their own Unit profiles rather than PC Equipment Catalogue values. **v5 Damage-output rebalance:** every native Damage 1 Attack profile below gained **+1 Attack**, and every Damage 2+ profile gained a thematic **Anti-[Type] 2**. Damage 0 profiles are unchanged. Point costs are unchanged pending playtesting.

All eligible Units Charge using the same rules: in **Structured Combat**, roll 2D6 and move up to **both dice + CHARGE X** (Move is not added); upon a successful Charge, inflict a **single Impact pool equal to the highest die + printed Impact X − target's Brace X** (minimum zero). In **Narrative Combat**, Charging is success-based, with highest-die Impact on success. Impact is **Physical Damage 1 automatic Hits**, allowing **Armor and Ward, never Evade** unless another rule expressly permits it. Printed `Impact 1/2/3` is an **additional bonus**, not the complete Impact pool. Unit Model count does not multiply the Impact.

**Critical X** converts up to X failed Attack dice into Critical Hits after rerolls without requiring a Surge; only abilities explicitly granting Critical **on Surge** require one. Attack rolls may generate multiple Surges from complete pairs of natural sixes. Ordinary Skill Checks, Charges, and Command checks normally generate one maximum. Creature **Commands** cost the indicated CP from the controlling side's pool, used during that Unit's own phase activation (or at their Reaction trigger). **Doctrine cards are not required** unless an applicable campaign or faction rule explicitly imposes them.

### Tags

**Battlefield tags** describe battlefield role and roster permissions (*Infantry, Cavalry, Mobile, Elite, Support, Wizard, Monster, Hero*, etc.). **Creature types** identify targets for traits and Anti-[Type] (*Humanoid, Beast, Undead, Construct, Elemental, Spirit, Plant, Swarm*, etc.). Some Units qualify for several tags. Armored and Unarmored are explicit Traits, not deductions from Armor Save, hide, or appearance. A creature's datasheet must explicitly grant them. Flying likewise appears as an explicit tag on units whose abilities grant flight; this tag alone does not provide movement rules.

### Shared Special Effects

- Slow X only reduces Move. Conditions that skip one eligible phase activation use the **provisional Stagger** keyword, not Slow.
- A whole-Unit radius effect qualifies when at least half the Unit's current Models (rounded up) lie within the area; resolve Hits **once per qualifying Unit**.
- Elemental descriptors (Fire, Frost, Lightning, etc.) do not modify Saves on their own. **Fire Damage** means unsaved Damage from a Fire-attribute Attack.
- Flying traverses terrain and Models, but must finish legally; **Blink** separately ignores intervening obstacles without ignoring elevation restrictions.
- Damage 0 attacks inflict no Wounds, but may apply explicitly Hit-triggered conditions even if Saves would prevent ordinary Damage; any special protective Save is stated on the effect itself.

### Multiple Attack Profiles

A creature with more than one Attack profile normally selects one eligible profile for its ordinary activation. A rule such as the Hydra's Many Heads or the Kraken's multiple Models may expressly distribute dice among targets; this does not generate extra activations. On-Damage effects only trigger after unsaved Damage is inflicted. When a special ability replaces a Hit with Direct Damage, remove the replaced Hit from ordinary Save resolution.

## 1. Common NPCs

Ordinary opposition, mercenaries, and minor magical adversaries.

### 1.1 Profiles

| Unit | Points / Models | Model profile | Attack profiles |
| --- | ---: | --- | --- |
| **Civilians** (*Humanoid*) | 30 / 5 | M3" / W1 / Arm 6+ / Eva 6+ | Improvised Weapons: Engaged / 2 / 6+ / 1 |
| **Thugs** (*Humanoid*) | 55 / 5 | M3" / W1 / Arm 6+ / Eva 6+ | Clubs and Knives: Engaged / 3 / 6+ / 1 |
| **Bandits** (*Humanoid*) | 75 / 5 | M4" / W1 / Arm 6+ / Eva 5+ | Hand Weapons: Engaged / 2 / 5+ / 1; Shortbows: 6" / 2 / 5+ / 1 |
| **Cultists** (*Humanoid*) | 60 / 5 | M3" / W1 / Arm 6+ / Eva 6+ | Ritual Blades: Engaged / 3 / 6+ / 1 |
| **Acolytes** (*Wizard, Humanoid*) | 85 / 3 | M3" / W2 / Arm 6+ / Eva 6+ / Ward 6+ Magic | Ceremonial Weapons: Engaged / 2 / 5+ / 1; Minor Bolt: 6" / 3 / 5+ / 1 / Magic |
| **Veteran Guard** (*Infantry, Elite, Humanoid*) | 120 / 4 | M3" / W2 / Arm 5+ / Eva 5+ | Veteran Weapons: Engaged / 3 / 5+ / 1 |
| **Assassin** (*Mobile, Elite, Humanoid*) | 100 / 1 | M5" / W4 / Arm 6+ / Eva 4+ | Daggers: Engaged / 5 / 4+ / 1 / Accurate 1, Critical 1 |
| **Hedge Mage** (*Wizard, Elite, Humanoid*) | 105 / 1 | M3" / W3 / Arm 6+ / Eva 6+ / Ward 6+ Magic | Arcane Bolt: 8" / 4 / 5+ / 1 / Magic; Staff: Engaged / 2 / 6+ / 1 |
| **Ogre Mercenary** (*Monster, Elite, Humanoid*) | 120 / 1 | M4" / W6 / Arm 5+ / Eva 6+ | Heavy Club: Engaged / 4 / 5+ / 2 / Anti-Armored 2 |

### 1.2 Abilities and Upgrades

#### Civilians

**Noncombatants — Passive**: Civilians cannot voluntarily Charge unless a scenario or another ability permits it.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Ordinary Civilians | +0 | Five Models with Improvised Weapons and Noncombatants. |
| Additional Civilian | +5 each | Add one Model, maximum 10. |

#### Thugs

**Dirty Fighting — Passive**: Gain Accurate 1 when attacking an enemy already Engaged with another friendly Unit.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Ordinary Thugs | +0 | Five Models with Clubs and Knives. |
| Additional Thug | +10 each | Add one Model, maximum 10. |

#### Bandits

**Ambushers — Passive**: Begin Concealed if deployed in suitable terrain. Concealed ends when this Unit Attacks, enters Engagement, or leaves that terrain.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Ordinary Bandits | +0 | Five Models with Hand Weapons and Shortbows. |
| Additional Bandit | +15 each | Add one Model, maximum 8. |
| Longbows | +15 | Replace Shortbows with 10" / 2 / 5+ / 1 / Long Range 3. Attacks beyond 10" lose 1 Attack die for a single-model Unit or 3 for a multi-model Unit (minimum 1). |
| Experienced Ambushers | +20 | The Unit's first ranged Attack of the battle gains Accurate 1. |

#### Cultists

**Fanatic — Passive**: Once per Round, the Unit may suffer 1 Damage to gain Accurate 1 on its next Attack that Round.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Ordinary Cultists | +0 | Five Models with Ritual Blades. |
| Additional Cultist | +12 each | Add one Model, maximum 10. |
| Sacrificial Daggers | +15 | Ritual Blades gain Critical 1 on their next Attack after the Unit voluntarily suffers Damage through Fanatic, provided the Attack generates a Surge. |

#### Acolytes

**Chant — 1 CP, Movement**: One friendly Unit within Short gains Ward 6+ against Magic until the beginning of the next Round. An existing better Magic Ward is not worsened.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Ordinary Acolytes | +0 | Three Models with Minor Bolt and Chant. |
| Additional Acolyte | +25 each | Add one Model, maximum 4. |
| Stronger Chant | +20 | Chant instead improves the target's existing Magic Ward by one step, or grants Ward 6+ if it has none. |

#### Veteran Guard

**Disciplined — Passive**: Veteran Weapons gain Accurate 1.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Ordinary Veterans | +0 | Four W2 Models with Veteran Weapons. |
| Crossbows | +15 | Gain Crossbows: 8" / 2 / 4+ / 1 / Heavy. |
| Shields | +20 | Improve Armor to 4+. |
| Additional Veteran | +30 | Add one Model, maximum 5. Add +5 for each paid equipment package. |

#### Assassin

**Hidden Killer — Passive**: Begins Concealed when deployed in suitable terrain.

**Vanish — 1 CP, Movement**: If not Engaged, gain Concealed until the Assassin Attacks, enters Engagement, or the Round ends.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Assassin | +0 | Daggers with Accurate 1 and Critical 1. |
| Throwing Knives | +10 | Gain 6" / 4 / 5+ / 1 / Pinpoint. |
| Master Assassin | +25 | Increase Wounds to W5 and Daggers to five Attacks. |

#### Hedge Mage

Minor Arcana: Choose one magical Command when creating the Mage.

| Arcana | Cost | Effect |
| --- | --- | --- |
| Ward | +0 | 1 CP, Movement: Grant Ward 6+ against Magic to one friendly Unit within Short until the end of the Round. |
| Hex | +0 | 1 CP, Assault: Worsen one visible enemy's Armor or Evade by one step until the end of the Round. |
| Haste | +0 | 1 CP, Movement: One friendly Unit within Short gains +2" Move during its next Move this Round. |

| Upgrade | Cost | Description |
| --- | --- | --- |
| One Minor Arcana | +0 | Know one Arcana from the table. |
| Additional Arcana | +15 each | Learn another Minor Arcana. |

#### Ogre Mercenary

**Impact 1 — Passive:** Add 1 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Massive — Passive**: Counts as two Units for objective control where appropriate.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Heavy Club | +0 | Engaged / 4 / 5+ / 2 / Anti-Armored 2. |
| Heavy Armor | +20 | Improve Armor to 4+. |
| Crushing Maul | +20 | Replace Heavy Club with Engaged / 3 / 5+ / 3 / Anti-Armored 2. |
| Throwing Stones | +10 | Gain 6" / 1 / 5+ / 2 / Anti-Cavalry 2. |

## 2. Common Creatures

Wilderness predators, environmental hazards, packs and swarms.

### 2.1 Profiles

| Unit | Points / Models | Model profile | Attack profiles |
| --- | ---: | --- | --- |
| **Giant Rats** (*Beast*) | 45 / 6 | M5" / W1 / Arm 6+ / Eva 5+ | Bites: Engaged / 2 / 5+ / 1 |
| **Rat Swarm** (*Horde, Beast, Creature, Swarm*) | 40 / 1 Swarm | M4" / W4 / Arm 6+ / Eva 5+ | Gnawing Swarm: Engaged / 5 / 6+ / 1 |
| **Wolves** (*Beast*) | 75 / 3 | M6" / W1 / Arm 6+ / Eva 5+ | Bite: Engaged / 3 / 5+ / 1 |
| **Giant Bats** (*Beast, Creature, Flying*) | 65 / 3 | M7" / W1 / Arm 6+ / Eva 5+ | Bite: Engaged / 3 / 6+ / 1 |
| **Giant Spiders** (*Beast*) | 80 / 3 | M5" / W1 / Arm 6+ / Eva 5+ | Fangs: Engaged / 3 / 5+ / 1 |
| **Wild Boars** (*Beast*) | 80 / 2 | M5" / W2 / Arm 5+ / Eva 6+ | Tusks: Engaged / 3 / 5+ / 1 |
| **Giant Snake** (*Beast*) | 70 / 1 | M5" / W4 / Arm 6+ / Eva 5+ | Fangs: Engaged / 4 / 5+ / 1 |
| **Crocodile** (*Beast*) | 90 / 1 | M4" / W5 / Arm 4+ / Eva 6+ | Bite: Engaged / 3 / 5+ / 2 / Anti-Infantry 2 |
| **Bear** (*Beast*) | 110 / 1 | M5" / W6 / Arm 5+ / Eva 6+ | Claws: Engaged / 5 / 5+ / 1; Bite: Engaged / 2 / 5+ / 2 / Anti-Armored 2 |
| **Dire Wolf** (*Beast*) | 105 / 1 | M7" / W5 / Arm 5+ / Eva 5+ | Bite: Engaged / 5 / 5+ / 1 / Critical 1 |
| **Giant Scorpion** (*Beast*) | 120 / 1 | M5" / W6 / Arm 4+ / Eva 6+ | Claws: Engaged / 4 / 5+ / 1; Stinger: Engaged / 2 / 5+ / 2 / Anti-Armored 2 |
| **Giant Centipedes** (*Beast*) | 65 / 4 | M4" / W1 / Arm 6+ / Eva 5+ | Venomous Bite: Engaged / 3 / 5+ / 1 |
| **Cave Toads** (*Beast*) | 85 / 2 | M4" / W3 / Arm 5+ / Eva 6+ | Bite: Engaged / 3 / 5+ / 1; Sticky Tongue: 6" / 1 / 5+ / 0 |
| **Hunting Raptors** (*Beast*) | 110 / 3 | M6" / W2 / Arm 6+ / Eva 5+ | Talons: Engaged / 3 / 5+ / 1 |

### 2.2 Abilities and Upgrades

#### Giant Rats

**Swarm the Weak — Passive**: Gain Accurate 1 if the Unit has more remaining Models than the target Unit.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Pack | +0 | Six Models. |
| Additional Rat | +7 each | Add one Model, maximum 10. |
| Alpha Rat | +25 | One Model gains +2 Wounds and one eligible Alpha trait. |

#### Rat Swarm

**Swarm — Passive**: May Move through other Models, but must finish legally. Cannot control objectives alone.

The Swarm Base is a single Model with four Wounds and five Gnawing Swarm Attacks; individual rats are not removed as casualties.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Ordinary Swarm | +0 | W4 with five Gnawing Swarm Attacks. |
| Larger Swarm | +15 | Increase Wounds to W6. |
| Ravenous Swarm | +15 | Gnawing Swarm gains Anti-Armored 1. |

#### Wolves

**Pack Hunter — Passive**: Gain Accurate 1 against enemies Engaged with another friendly Beast Unit.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Pack | +0 | Three Models with Bite. |
| Additional Wolf | +25 each | Add one Model, maximum 5. |
| Alpha Wolf | +25 | One Model gains +2 Wounds and one eligible Alpha trait. |

#### Giant Bats

**Flying — Passive**: Ignore intervening Models and terrain during movement, finishing legally.

**Echolocation — Passive**: Ignore Concealed when targeting enemies within Short.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Flock | +0 | Three Models with Flying and Echolocation. |
| Additional Bat | +20 each | Add one Model, maximum 5. |
| Blood Bats | +20 | Gain Accurate 1 against damaged Units. |

#### Giant Spiders

**Climber — Passive**: Vertical terrain costs normal movement rather than additional movement.

**Venom — Passive**: When Fangs generate a Surge, gain Critical 1 for that Attack, converting one failed Hit die after rerolls.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Nest | +0 | Three Models with Fangs and Venom. |
| Web Spit | +15 | Gain 6" / 1 / 5+ / 0. If the Attack scores a Hit, the target suffers Slow 2. |
| Additional Spider | +25 each | Add one Model, maximum 5. |

#### Wild Boars

**Impact 1 — Passive:** Add 1 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Headlong Charge — Passive**: If at least one Impact Hit causes Damage after saves, increase the Damage inflicted by one such Hit from 1 to 2.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Pair | +0 | Two Models with Impact 1 and Headlong Charge. |
| Additional Boar | +35 | Add one Model, maximum 3. |
| Armored Hide | +15 | Gain Tough 1. |

#### Giant Snake

**Venom — Passive**: When Fangs generate a Surge, convert one successful Hit into Direct Damage 1. Applicable Ward Saves still apply.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Snake | +0 | W4 with Venomous Fangs. |
| Constrictor | +15 | Gain Constrict: Engaged / 3 / 5+ / 1. If it inflicts Damage, the target suffers Slow 1. |
| Giant Constrictor | +20 | Increase Wounds to W6. |

#### Crocodile

**Impact 1 — Passive:** Add 1 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Aquatic — Passive**: Ignore ordinary swimming movement penalties.

**Death Roll — Passive**: Bite gains Critical 1 against enemies with accumulated Damage.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Crocodile | +0 | W5, Bite, Death Roll, Aquatic. |
| Armored Scales | +20 | Gain Tough 1. |
| Greater Crocodile | +25 | Increase Wounds to W7 and Bite to four Attacks. |

#### Bear

**Impact 1 — Passive:** Add 1 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Fury — Passive**: When reduced to three or fewer remaining Wounds, Claws gain +1 Attack.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Bear | +0 | W6 with Claws, Bite, and Fury. |
| Greater Bear | +20 | Increase Wounds to W8. |
| Savage Bear | +20 | Claws gain Accurate 1 while Fury is active. |

#### Dire Wolf

**Impact 1 — Passive:** Add 1 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Predator — Passive**: Bite gains Accurate 1 against Units with accumulated Damage.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Dire Wolf | +0 | W5, Critical 1 Bite, Predator. |
| Alpha Predator | +20 | Increase Impact to 2. |
| Dire Alpha | +20 | Increase Wounds to W7. |

#### Giant Scorpion

**Venom — Passive**: When Stinger generates a Surge, convert one successful Hit into Direct Damage 2. Applicable Ward Saves still apply.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Scorpion | +0 | Claws, Stinger, Venom. |
| Armored Carapace | +20 | Gain Tough 1. |
| Crushing Claws | +20 | Claws gain +1 Damage. |

#### Giant Centipedes

**Venomous Swarm — Passive**: When Venomous Bite generates a Surge, the target suffers Slow 1.

**Tunnel Crawlers — Passive**: Ignore the first 2" of Difficult Terrain movement penalties from rubble, earth, and similar terrain.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Colony | +0 | Four Models with Venomous Bite. |
| Additional Centipede | +15 each | Add one Model, maximum 6. |
| Toxic Venom | +15 | Surge inflicts Slow 2 instead of Slow 1. |

#### Cave Toads

**Amphibious — Passive**: Ignore ordinary swimming penalties and movement penalties from shallow water.

Sticky Tongue: If this Damage 0 Attack scores a Hit, the target suffers Slow 1. Saves against Damage do not cancel this condition unless specifically permitted.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Pair | +0 | Two W3 Models with Bite and Sticky Tongue. |
| Giant Bullfrogs | +20 | Increase each Model's Wounds to W4. |
| Crushing Jaws | +15 | Bite gains +1 Damage. |

#### Hunting Raptors

**Impact 1 — Passive:** Add 1 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Pack Ambush — Passive**: If the Unit begins its Charge within natural Cover, increase its Impact to 2 for that Charge.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Pack | +0 | Three W2 Models with Pack Ambush. |
| Additional Raptor | +30 each | Add one Model, maximum 5. |
| Alpha Hunter | +20 | Gain Accurate 1 against damaged Units. |

## 3. Unusual Creatures

Creatures relying on deception, mutation, unusual movement, and supernatural control.

### 3.1 Profiles

| Unit | Points / Models | Model profile | Attack profiles |
| --- | ---: | --- | --- |
| **Mimic** (*Monster, Elite*) | 100 / 1 | M3" / W5 / Arm 5+ / Eva 6+ | Bite: Engaged / 5 / 5+ / 1 / Critical 1 |
| **Ooze** (*Elite, Ooze*) | 100 / 1 | M2" / W8 / Arm 6+ / Eva — | Acidic Mass: Engaged / 6 / 5+ / 1 / Anti-Armored 1 |
| **Lesser Elementals** (*Elite, Elemental*) | 120 / 2 | M5" / W3 / Arm 5+ / Eva 6+ / Ward 6+ Magic | Elemental Strike: Engaged / 4 / 5+ / 1 / Magic |
| **Cockatrice** (*Monster, Elite, Beast, Flying*) | 130 / 1 | M6" / W5 / Arm 6+ / Eva 5+ | Beak and Talons: Engaged / 4 / 5+ / 1 / Critical 1 |
| **Basilisk** (*Monster, Elite, Beast*) | 175 / 1 | M4" / W8 / Arm 4+ / Eva 6+ | Fangs: Engaged / 3 / 5+ / 2 / Anti-Unique 2; Petrifying Gaze: 8" / 2 / 5+ / 0 / Magic |
| **Rust Eater** (*Monster, Elite, Beast*) | 135 / 1 | M5" / W7 / Arm 5+ / Eva 5+ | Corrosive Mandibles: Engaged / 4 / 5+ / 1 / Anti-Construct 1 |
| **Phase Stalker** (*Monster, Elite, Beast*) | 160 / 1 | M6" / W6 / Arm 6+ / Eva 4+ / Ward 6+ Magic | Phase Claws: Engaged / 5 / 5+ / 1 / Magic |
| **Will-o'-Wisps** (*Elite, Spirit*) | 110 / 3 | M7" / W1 / Arm 6+ / Eva 4+ / Ward 5+ Magic | Ghostlight: 8" / 3 / 5+ / 1 / Magic; Spark: Engaged / 2 / 6+ / 1 / Magic |
| **Shambling Mound** (*Monster, Elite, Plant*) | 185 / 1 | M3" / W10 / Arm 4+ / Eva 6+ | Crushing Vines: Engaged 2" / 4 / 5+ / 2 / Anti-Infantry 2 |
| **Gargoyles** (*Construct, Elite, Flying*) | 155 / 3 | M5" / W2 / Arm 4+ / Eva 5+ | Stone Claws: Engaged / 3 / 5+ / 1 |

### 3.2 Abilities and Upgrades

#### Mimic

**Perfect Disguise — Passive**: Cannot normally be identified as a creature before moving or attacking without a successful Awareness Check or another appropriate detection effect.

**Ambush — Passive**: The Mimic's first Attack of the encounter gains Accurate 2.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Mimic | +0 | W5, Bite, Perfect Disguise, Ambush. |
| Adhesive Grip | +15 | If Bite inflicts Damage, the target suffers Slow 1. |
| Greater Mimic | +25 | Increase Wounds to W7 and gain Impact 1. |

#### Ooze

**Amorphous — Passive**: Cannot make Evade Saves and ignores effects that forcibly reposition it. May flow through sufficiently large openings.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Ooze | +0 | W8, Acidic Mass, Amorphous. |
| Split | +30 | Once per battle, at 4 or fewer remaining Wounds, replace this Model with a single Unit of two Lesser Oozes. Distribute its remaining Wounds between them, maximum W2 each. The resulting Unit retains its activation status and cannot gain an additional activation from splitting. |
| Corrosive Body | +20 | Once per activation, when an enemy inflicts Damage on the Ooze in Engagement, that enemy suffers one automatic Physical Hit at Damage 1. |

Lesser Ooze: M2" / W2 / Arm 6+ / Eva —. Gnawing Acid: Engaged / 3 / 5+ / 1 / Anti-Armored 1. Retains Amorphous; cannot Split.

#### Lesser Elementals

**Elemental Nature — Passive**: Choose one element when creating the Unit.

| Element | Cost | Description |
| --- | --- | --- |
| Fire | +0 | Elemental Strike gains the **Fire** attribute. When it Surges, it gains Blast 1" for that Attack. |
| Ice | +0 | Elemental Strike gains the **Frost** attribute. When it Surges, its target suffers Slow 1. |
| Storm | +0 | Elemental Strike gains the **Lightning** attribute; increase Move to M6". |
| Stone | +0 | Improve Armor to 4+ but reduce Move to M4". |

| Additional Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Elementals | +0 | Two Models with the selected elemental form. |
| Additional Elemental | +55 | Add one matching Model, maximum 3. |

#### Cockatrice

**Flying — Passive**: May move over terrain and Models, finishing legally.

**Petrifying Venom — Passive**: If Beak and Talons inflicts an unsaved Hit, the target suffers Slow 1. If it also generated a Surge, apply Slow 2 instead.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Cockatrice | +0 | Flying, Critical 1, and Petrifying Venom. |
| Stonefeather | +15 | Improve Armor to 5+. |
| Greater Cockatrice | +25 | Increase Wounds to W7 and gain Impact 1. |
| Venomous Spurs | +15 | Beak and Talons gain Accurate 1. |

#### Basilisk

**Petrifying Glare — 1 CP, Movement — Once per Round (provisional).** Choose a visible enemy Unit within 8". Roll 2D6; each 5+ is one Success. On at least one Success, the target becomes **Staggered** (it forfeits one eligible phase activation). The target may negate the effect with one applicable **Magic Ward Save**, if any. This is a magical Command, not an ordinary Assault Attack. It does not also apply Slow.

**Petrifying Gaze — Passive**: Petrifying Gaze inflicts no ordinary Damage.

If it scores at least one Hit, its target suffers Slow 2. If the target was already under Slow 2 from this Basilisk before the Attack began, it also suffers Direct Damage 1. This additional Damage is applied only once per Attack.

**Stone Scales — Passive**: Temporary effects cannot worsen the Basilisk's Armor by more than one step during a single Round.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Basilisk | +0 | Fangs, Petrifying Gaze, Stone Scales. |
| Elder Basilisk | +30 | Increase Wounds to W10 and Gaze Range to 10". |
| Deathly Gaze | +25 | Petrifying Gaze gains Accurate 1. |
| Hardened Scales | +20 | Gain Tough 1. |

In Narrative Combat, full petrification may occur after sustained exposure, a special challenge, or a suitable encounter consequence. A single Hit does not permanently petrify a PC.

#### Rust Eater

**Corrosive Bite — Passive**: If Corrosive Mandibles inflicts an unsaved Hit against an Armored Unit or Construct, worsen its Armor by one step until the end of its next activation. This effect does not stack with itself.

**Scent of Iron — Passive**: Gain Accurate 1 when attacking Armored Units or Constructs.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Rust Eater | +0 | Corrosive Mandibles, Corrosive Bite, Scent of Iron. |
| Greater Corrosion | +25 | Corrosive Bite's Armor penalty lasts until the end of the next Round. |
| Armored Carapace | +20 | Improve Armor to 4+. |
| Iron Maw | +15 | Increase Corrosive Mandibles to four Attacks. |

Corrosion is normally temporary in Structured Combat. Permanent equipment destruction requires a separate narrative or scenario rule.

#### Phase Stalker

**Flicker — Passive**: Once per Round, when targeted by a ranged Attack, improve Evade from 4+ to 3+ against that Attack. Declare before the attacker rolls.

**Phase Step — 1 CP, Movement**: Move up to 4", ignoring intervening terrain and Models. Must finish legally and cannot finish Engaged. If originally Engaged, the Phase Stalker becomes Withdrawn.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Phase Stalker | +0 | Phase Claws, Flicker, Phase Step. |
| Ambush Predator | +20 | Its next Phase Claws Attack after Phase Step this Round gains Accurate 1. |
| Distorted Form | +20 | Increase Wounds to W8. |
| Greater Phasing | +15 | Increase Phase Step movement to 6". |

#### Will-o'-Wisps

**Incorporeal Movement — Passive**: Ignore intervening terrain and Models when moving, finishing legally.

**Luring Glow — Passive**: When Ghostlight generates a Surge, its target suffers Slow 1.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Lights | +0 | Three Models with Ghostlight and Luring Glow. |
| Additional Wisp | +30 each | Add one Model, maximum 5. |
| Blinding Flash | +20 | On a Ghostlight Surge, the target also worsens Hit by one step on its next Attack this Round. |

#### Shambling Mound

**Impact 1 — Passive:** Add 1 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Regrowth — Passive**: At the beginning of each Round, Heal 1 if within natural terrain. Regrowth does not trigger if the Mound suffered Fire Damage since its previous activation.

**Entangling Growth — Passive**: If Crushing Vines inflicts an unsaved Hit, its target suffers Slow 1.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Mound | +0 | W10, Regrowth, Entangling Growth, Impact 1. |
| Deep Roots | +20 | Improve Armor to 3+ while within natural terrain. |
| Grasping Tendrils | +20 | Increase Crushing Vines Range to Engaged 3". |
| Overgrown Mass | +25 | Increase Wounds to W12. |

#### Gargoyles

**Flying — Passive**: May move over terrain and Models, finishing legally.

**Stone Stillness — Passive**: Gain Concealed while stationary in suitable stone terrain, ending when the Unit Attacks, enters Engagement, or Moves.

**Unliving Stone — Passive**: Gain Tough 1 against Physical Attacks while stationary.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Guardians | +0 | Three Models with Flying and Stone Stillness. |
| Additional Gargoyle | +45 | Add one Model, maximum 4. |
| Razor Claws | +20 | Stone Claws gain Accurate 1. |
| Heavy Stone Wings | +15 | Gain Impact 1. |

## 4. Large Monsters

Boss encounters and potential Large Assets. All are single-model Units **except the four-model Abyssal Kraken**.

### 4.1 Profiles

| Unit | Points / Models | Model profile | Attack profiles |
| --- | ---: | --- | --- |
| **Ogre** (*Monster, Elite, Humanoid*) | 145 / 1 | M4" / W7 / Arm 5+ / Eva 6+ | Club: Engaged / 4 / 5+ / 2 / Anti-Armored 2 |
| **Troll** (*Monster, Elite, Humanoid*) | 170 / 1 | M4" / W8 / Arm 5+ / Eva 6+ | Claws: Engaged / 4 / 5+ / 2 / Anti-Infantry 2 |
| **Minotaur** (*Monster, Elite, Beast*) | 180 / 1 | M5" / W8 / Arm 5+ / Eva 6+ | Great Axe: Engaged / 4 / 5+ / 2 / Anti-Armored 2; Horns: Engaged / 2 / 5+ / 2 / Anti-Cavalry 2 |
| **Clockwork Horror** (*Construct, Monster, Elite*) | 205 / 1 | M5" / W9 / Arm 4+ / Eva 5+ | Blades: Engaged / 7 / 5+ / 1 / Critical 1 |
| **Manticore** (*Monster, Elite, Beast, Flying*) | 220 / 1 | M7" / W9 / Arm 5+ / Eva 5+ | Claws: Engaged / 4 / 5+ / 2 / Anti-Infantry 2; Tail Spikes: 8" / 5 / 5+ / 1 |
| **Griffon** (*Monster, Elite, Beast, Flying*) | 235 / 1 | M8" / W9 / Arm 5+ / Eva 5+ | Talons: Engaged / 6 / 5+ / 1 / Critical 1; Beak: Engaged / 2 / 5+ / 2 / Anti-Cavalry 2 |
| **Wyvern** (*Monster, Elite, Beast, Flying*) | 295 / 1 | M8" / W11 / Arm 4+ / Eva 5+ | Bite: Engaged / 6 / 5+ / 2 / Anti-Infantry 2; Venomous Tail: Engaged / 4 / 5+ / 2 / Anti-Armored 2 |
| **Young Dragon** (*Monster, Elite, Beast, Flying*) | 395 / 1 | M8" / W12 / Arm 4+ / Eva 5+ / Ward 6+ Magic | Claws: Engaged / 6 / 4+ / 2 / Anti-Armored 2; Bite: Engaged / 3 / 4+ / 3 / Anti-Elite 2; One Breath Weapon |
| **Hydra** (*Monster, Elite, Beast*) | 365 / 1 | M4" / W15 / Arm 5+ / Eva 6+ / Ward — | Many-Headed Bites: Engaged 2" / 2 per functional head (max 10 at W15) / 5+ / 2 / Anti-Infantry 2 |
| **Chimera** (*Monster, Elite, Beast, Flying*) | 330 / 1 | M7" / W11 / Arm 4+ / Eva 5+ | Claws and Fangs: Engaged / 5 / 4+ / 2 / Anti-Mobile 2; Fire Maw: 8" / 5 / 5+ / 1 / Magic, Blast 1" |
| **Roc** (*Monster, Elite, Beast, Flying*) | 315 / 1 | M9" / W11 / Arm 5+ / Eva 4+ | Great Talons: Engaged / 6 / 5+ / 2 / Anti-Cavalry 2 |
| **Stone Giant** (*Monster, Elite, Giant, Armored*) | 285 / 1 | M4" / W12 / Arm 3+ / Eva 6+ | Stone Fists: Engaged / 4 / 4+ / 2 / Anti-Armored 2; Hurled Boulder: 10" / 2 / 4+ / 2 / Anti-Infantry 2 |
| **Cave Wurm** (*Monster, Elite, Beast*) | 360 / 1 | M4" / W13 / Arm 4+ / Eva 6+ | Devouring Maw: Engaged / 6 / 4+ / 2 / Anti-Armored 2 |
| **Abyssal Kraken** (*Monster, Elite, Beast · **4-model Unit***) | 460 / 4 | **Body:** M5" / W10 / Arm 4+ / Eva 5+ / Ward 6+ Magic; **3 Tentacles:** M5" / W2 each / same Saves | **Body:** Abyssal Jet 10" / 4 / 5+ / 2 / Anti-Infantry 2; **each Tentacle:** Titanic Tentacles Engaged 3" / 2 / 4+ / 2 / Anti-Armored 2 |

### 4.2 Abilities and Upgrades

#### Ogre

**Impact 1 — Passive:** Add 1 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

The Ogre is a straightforward Monster emphasizing strong melee Damage rather than exotic abilities.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Ogre | +0 | W7, Club, Impact 1. |
| Heavy Armor | +20 | Improve Armor to 4+. |
| Throwing Rocks | +15 | Gain 6" / 2 / 5+ / 2 / Anti-Cavalry 2. |
| Crushing Blows | +20 | Club gains Accurate 1 against Armored Units. |

#### Troll

**Regeneration — Passive**: At the beginning of each Round, Heal 1. Regeneration does not trigger if the Troll suffered **unsaved Fire Damage** since its previous activation.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Troll | +0 | W8, Claws, Regeneration 1. |
| Thick Hide | +20 | Improve Armor to 4+. |
| Greater Regeneration | +35 | Heal 2 instead of 1 when Regeneration triggers. |
| Hulking Troll | +25 | Increase Wounds to W10. |

#### Minotaur

**Impact 2 — Passive:** Add 2 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Bull Rush — Passive**: Increase Impact by 1 when this Unit successfully Charges, giving it Impact 3 before other modifiers.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Minotaur | +0 | Great Axe, Horns, Impact 2, Bull Rush. |
| Heavy Horns | +20 | Bull Rush grants +2 Impact instead of +1. |
| Frenzied Assault | +25 | Great Axe gains Accurate 1 on its first Attack after Charging. |
| Armored Hide | +20 | Improve Armor to 4+. |

#### Clockwork Horror

**Construct — Passive**: Counts as a Construct for abilities that reference Constructs.

**Impact 1 — Passive:** Add 1 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Overdrive — 1 CP, Assault / Combat**: Gain +3 Attacks on the next Blades Attack this activation. After resolving the Attack, suffer 1 Damage.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Horror | +0 | W9, Blades, Impact 1, Overdrive. |
| Reinforced Chassis | +25 | Increase Wounds to W11. |
| Rotary Blades | +30 | Increase Blades to eight Attacks. |
| Improved Targeting | +20 | Blades gain Accurate 1. |

#### Manticore

**Flying — Passive**: May Move over terrain and Models, finishing legally.

**Impact 1 — Passive:** Add 1 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Predatory Dive — Passive**: Increase Impact by 1 when successfully Charging after beginning the Round outside Engagement.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Manticore | +0 | Claws, Tail Spikes, Flying, Impact 1, Predatory Dive. |
| Barbed Tail | +20 | Tail Spikes gain Anti-Armored 1. |
| Greater Wings | +20 | Increase Move to M9". |
| Savage Claws | +20 | Claws gain Accurate 1. |

#### Griffon

**Flying — Passive**: May Move over terrain and Models, finishing legally.

**Impact 1 — Passive:** Add 1 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Diving Charge — Passive**: Its first Melee Attack after successfully Charging gains Accurate 1.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Griffon | +0 | Talons, Beak, Flying, Impact 1, Diving Charge. |
| Armored Griffon | +20 | Improve Armor to 4+. |
| Savage Talons | +25 | Talons gain Accurate 1 even when it has not Charged. |
| Crushing Dive | +20 | Increase Impact to 2. |

#### Wyvern

**Flying — Passive**: May Move over terrain and Models, finishing legally.

**Impact 2 — Passive:** Add 2 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Venom — Passive**: When Venomous Tail generates a Surge, convert one successful Hit into Direct Damage 2. Applicable Ward Saves still apply.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Wyvern | +0 | Bite, Tail, Flying, Impact 2, Venom. |
| Hardened Scales | +20 | Gain Tough 1. |
| Greater Venom | +25 | On a Tail Surge, convert up to two successful Hits into Direct Damage 2 each. |
| Armored Wyvern | +25 | Improve Armor to 3+. |

#### Young Dragon

**Flying — Passive**: May Move over terrain and Models, finishing legally.

**Impact 3 — Passive:** Add 3 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Draconic Breath — Passive**: Choose one Breath Weapon at creation. It may be used once per Round as the Dragon's normal Attack, rather than as an additional Attack.

Breath Weapon Options

| Breath | Cost | Profile and Effect |
| --- | --- | --- |
| Fire Breath | +0 | 8" / 5 / 5+ / 1 / Magic, Fire, Blast 1". Generates one automatic secondary Hit against other Units within 1" of the target when the primary Attack scores a Hit. |
| Frost Breath | +0 | 8" / 5 / 5+ / 1 / Magic, Frost. When the Attack generates a Surge, its target suffers Slow 2. |
| Lightning Breath | +0 | 10" / 3 / 4+ / 2 / Magic, Lightning, Instant, Anti-Armored 2. Cannot normally be responded to with Reactions. |

Dragon Upgrades

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Young Dragon | +0 | W12, Flying, Impact 3, one Breath Weapon. |
| Ancient Scales | +25 | Improve Armor to 3+. |
| Greater Wings | +20 | Increase Move to M9". |
| Greater Dragon | +50 | Increase Wounds to W15 and Impact to 4. |

#### Hydra

**Five Heads — Passive.** Begin at W15 with five functioning heads. Each **3 remaining Wounds, rounded up**, corresponds to one head; each functioning head contributes **2 Attack dice** to Many-Headed Bites. Restore Attack dice when healing crosses a head threshold.

| Remaining Wounds | Functioning Heads | Bite Attacks |
| --- | ---: | ---: |
| 13–15 | 5 | 10 |
| 10–12 | 4 | 8 |
| 7–9 | 3 | 6 |
| 4–6 | 2 | 4 |
| 1–3 | 1 | 2 |

**Many Heads — Passive.** Divide the available Bite dice among up to three enemy Units in Engaged 2" range, declaring allocations before rolling. Roll each target's dice as a separate Attack pool with its own Surges, Critical conversions and Saves. This still uses one Combat activation.

**Regrowth — Passive.** At the start of each Round, Heal 1. Regrowth is suppressed if the Hydra suffered **unsaved Fire Damage** since its previous activation. Healing may restore Bite Attacks by restoring a functioning head.

**Impact 1 — Passive.** Add one automatic Impact Hit to the normal highest Charge die.

| Upgrade | Added Points | Effect |
| --- | ---: | --- |
| **Additional Head** | +45 | +3 maximum Wounds and one more functional head (up to +2 Bite Attacks); revise head thresholds accordingly |
| **Venomous Heads** | +30 | When a Bite Attack Surges, replace one successful Hit with Direct Damage 2 (Ward applies) |
| **Accelerated Regrowth** | +35 | Regrowth heals 2 instead of 1 when it triggers |
| **Armored Scales** | +20 | Gain Tough 1 |

**Base cost:** 365 Points (provisional). Reassess after testing degraded damage output and Fire suppression.

#### Chimera

**Flying — Passive**: May Move over terrain and Models, finishing legally.

**Impact 1 — Passive:** Add 1 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Threefold Predator — Passive**: When Claws and Fangs generate a Surge, the target suffers Slow 1.

Fire Maw is a normal ranged Magic Attack and may be used after moving, subject to the normal ranged Attack rules.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Chimera | +0 | Claws and Fangs, Fire Maw, Flying, Impact 1. |
| Venomous Serpent Tail | +20 | On a Claws and Fangs Surge, also inflict Direct Damage 1. |
| Greater Flame | +30 | Fire Maw gains +1 Attack. |
| Hardened Hide | +25 | Gain Tough 1. |

#### Roc

**Flying — Passive**: May Move over terrain and Models, finishing legally.

**Impact 2 — Passive:** Add 2 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Swooping Predator — Passive**: Increase Impact by 1 when successfully Charging after beginning the Round outside Engagement.

**Snatch Prey — Passive**: When Great Talons inflicts an unsaved Hit on an Infantry or Cavalry Unit, the Roc may reposition one non-Character Model from the target Unit up to 2". The Model must finish legally and maintain Unit coherency.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Roc | +0 | W11, Flying, Impact 2, Swooping Predator, Snatch Prey. |
| Greater Roc | +35 | Increase Wounds to W14. |
| Razor Talons | +25 | Great Talons gain Accurate 1. |
| Armored Feathers | +20 | Improve Armor to 4+. |

#### Stone Giant

**Impact 2 — Passive:** Add 2 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Earthshaking Blows — Passive**: If Stone Fists inflicts an unsaved Hit, the target suffers Slow 1.

**Mountain Strider — Passive**: Ignore movement penalties from rocky and mountainous Difficult Terrain.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Stone Giant | +0 | Stone Fists, Hurled Boulder, Impact 2, Earthshaking Blows. |
| Greater Strength | +30 | Increase Stone Fists Damage to 3. |
| Mountain Armor | +25 | Gain Tough 1. |
| Ancient Giant | +40 | Increase Wounds to W15. |

#### Cave Wurm

**Impact 3 — Passive:** Add 3 automatic Physical Hit(s) to the normal highest-die Charge Impact (before Brace).

**Burrower — Passive**: May move through suitable natural earth, sand, loose rock, and similar underground terrain. Must finish legally.

Subterranean Ambush — Once per Battle: During its Movement activation, move up to 8" through suitable ground, ignoring intervening terrain and Models. Emerge at a legal position. The Wurm cannot finish Engaged or Charge during the Round in which it uses this ability.

**Tremorsense — Passive**: Ignore Concealed when targeting grounded enemy Units within Short.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Cave Wurm | +0 | W13, Devouring Maw, Impact 3, Burrower, Ambush, Tremorsense. |
| Armored Plates | +25 | Improve Armor to 3+. |
| Crushing Mandibles | +35 | Increase Devouring Maw Damage to 3. |
| Seismic Charge | +25 | Increase Impact to 4. |
| Elder Wurm | +65 | Increase Wounds to W17 and Impact to 4. Cannot combine with Seismic Charge. |

Elder Wurm — **425 Points**: M4" / W17 / Arm 4+ / Eva 6+. Devouring Maw: Engaged / 6 / 4+ / 2 / Anti-Armored 2. Impact 4, Burrower, Subterranean Ambush, Tremorsense.

#### Abyssal Kraken

**Four-Model Unit — Special Coherency.** The Kraken consists of one **Body Model (W10)** and three **Tentacle Models (W2 each)**. All share the printed Armor, Evade and Ward. A Tentacle may be positioned and move independently within **6" (Short Range)** of the Body, instead of the usual 3" Coherency rule. Every Model remains part of **one Unit**: it receives one Movement, one Assault and one eligible Combat activation, not one activation per Model.

**Many Tentacles — Passive.** Each surviving Tentacle contributes its own **Engaged 3" / A2 / Hit 4+ / Dmg 2 / Anti-Armored 2** attack, targeting enemies it can reach. Separate target pools if Tentacles attack different eligible Units. The Body uses **Abyssal Jet** (10" / A4 / 5+ / 2 / Anti-Infantry 2), as its eligible ranged Assault profile.

**Damage allocation — Exception.** Attacks that can reach only a Tentacle allocate Hits and Damage among the eligible Tentacles, not to the distant Body. Attacks targeting the Body allocate to the Body. Destroyed Tentacles are removed and cease contributing Attacks. If the Body is Defeated, remove the entire Kraken Unit. Ordinary area effects use the usual half-of-current-Models threshold: with all four Models present, **two** must lie in the radius.

**Aquatic — Passive.** Ignore swimming penalties; on land, the Unit's Move is M2".

**Grasping Limbs — Passive.** After a Tentacle Attack inflicts unsaved Damage, its target suffers Slow 1.

**Ink Cloud — 1 CP, Reaction.** When targeted by a non-Instant ranged Attack while in water, become Concealed until the end of the Phase; use normal Reaction timing.

**Grasping Tentacles — 1 CP, Combat — Once per Round.** After one of this Unit's Tentacle Attacks deals Damage, reposition one non-Hero target Model up to 2" within legal placement. The target Unit must still maintain Coherency. This is forced movement and does not grant an extra Attack.

| Upgrade | Added Points | Effect |
| --- | ---: | --- |
| **Elder Kraken** | +50 | Increase Body Wounds to 14 (total Unit Wounds 20) |
| **Crushing Tentacles** | +35 | Titanic Tentacles gain Accurate 1 |
| **Armored Hide** | +25 | Improve shared Armor to 3+ |
| **Abyssal Horror** | +30 | Abyssal Jet gains Blast 1" |

The Kraken has no printed Impact bonus; like any ordinary eligible Unit it still generates the normal highest-die Impact on a successful Charge. Tentacles do not each generate separate Impact pools.

## 5. Common Monster Upgrades

This table provides **reference prices** for GM-designed variants, not a universally available shopping list. A monster normally takes no more than two optional upgrades, each once, unless its entry permits otherwise.

| Upgrade | Reference Cost | Effect |
| --- | --- | --- |
| No Upgrade | +0 | Retain the creature's standard profile. |
| +1 Wound | +15 | Increase a single Monster's maximum Wounds by 1. |
| +1" Move | +10 | Increase Movement by 1". |
| Improve Armor | +20 | Improve Armor by one step. |
| Improve Evade | +15 | Improve Evade by one step. |
| Specialized Ward 6+ | +15 | Gain Ward 6+ against one specified Damage type. |
| Broad Ward 6+ | +25 | Gain Ward 6+ against all applicable Damage types. |
| Accurate 1 | +10–15 | Add Accurate 1 to one Attack profile, allowing up to one natural 1 to be rerolled. |
| Tough 1 | +15–20 | Gain Tough 1 when making Armor Saves. |
| Critical 1 | +15–20 | One selected Attack gains **Critical 1** unconditionally, converting one failed Hit die after rerolls. |
| +2 Attacks | +30–40 | Increase one Attack profile by two Attacks. |
| +1 Damage | +35–45 | Increase one Attack profile's Damage by 1. |
| Gain Impact 1 | +20–25 | Gain printed Impact 1, adding one automatic Hit to the normal highest-die Impact. |
| +1 Impact | +20–25 | Increase printed Impact X by 1, adding one Hit to the usual highest-die base. |
| Flying | +30–50 | Ignore intervening terrain and Models during movement, finishing legally. |
| Climber | +10 | Climb vertical terrain at normal movement cost. |
| Aquatic | +5 | Ignore ordinary swimming penalties. |
| Regeneration 1 | +30 | Heal 1 at the beginning of each Round, subject to applicable weaknesses. |
| Minor Ranged Attack | +15–25 | Gain one modest ranged Attack profile. |
| Minor Command Ability | +15–25 | Learn one additional limited Command Ability. Requires its printed CP expenditure; Doctrine cards only if an applicable campaign/faction rule explicitly demands them. |

Restrictions: A Monster normally takes a maximum of two optional upgrades, each once, unless its entry states otherwise.

Additional Damage and Attacks should be more expensive on high-output weapons. Flying, Wards, and Regeneration are particularly valuable on Monsters with many Wounds.

## 6. Elite and Alpha Creatures

Eligible multi-model Beast Units may designate one Alpha, using the existing +25 Point package. Its +2 maximum Wounds apply only to the chosen Model; a single Unit may contain only one Alpha. Alpha granted Unit-wide effects end if that Model is removed. Printed Impact bonuses add to normal highest-die Charge Impact.

Some ordinary Beast Units can be upgraded to include an unusually large or dominant member of their species.

Alpha — +25 Points

Choose one Model in an eligible multi-model Beast Unit.

That Model gains +2 maximum Wounds.

Then choose one Alpha trait:

| Alpha Trait | Cost | Description |
| --- | --- | --- |
| Pack Leader | +0 | While this Model remains alive, the Unit's Melee Attacks gain Accurate 1. |
| Armored Alpha | +0 | The Alpha Model gains Tough 2. |
| Savage Alpha | +0 | The Alpha Model's primary Engagement weapon gains +1 Attack. |
| Charging Alpha | +0 | While the Alpha remains alive, the Unit gains Impact 1. If it already has Impact X, increase X by 1 instead. |
| Swift Alpha | +0 | While the Alpha remains alive, increase the Unit's Move by 1". |

A Unit may normally contain only one Alpha.

The Alpha's additional Wounds and personal defenses apply only to that Model. Any Unit-wide benefits end when the Alpha is removed.

Single-model Monsters generally use their own upgrade tables instead.

## 7. Animal Companions

Companions are **independent friendly Units** acquired through the [Animal Companion Talents](13_talents.md#animal-companion-talents). **They have their own Movement, Assault, and eligible Combat activations**, rather than acting alongside their owner's activation for free. Companions cannot independently control objectives or generate CP; they usually remain within Short Range of the owner. They **may use specifically printed or acquired CP Commands** from the owner's CP pool during their own activation. All companions use the NPC Unit attack profiles below, never the owner’s PC equipment attack profiles. Their listed Points are **additional** to the PC’s base Talent XP-derived battlefield value.

**Tier 2** grants one unmodified Small/Standard companion. **Tier 4** grants either two different Training upgrades to the existing companion or a second Small/Standard companion with one Training upgrade on each animal. Large companions and mounts require specific acquisition/permission and are not automatically granted by either Talent.

### 7.1 Small Companions

| Unit | Points / Models | Model profile | Attack profiles |
| --- | ---: | --- | --- |
| **Rat / Ferret** (*Companion, Creature, Beast*) | 5 / 1 | M5" / W1 / Arm 6+ / Eva 4+ | Bite: Engaged / 2 / 6+ / 1 |
| **Cat** (*Companion, Creature, Beast*) | 5 / 1 | M6" / W1 / Arm 6+ / Eva 4+ | Claws: Engaged / 2 / 6+ / 1 |
| **Raven** (*Companion, Creature, Beast, Flying*) | 10 / 1 | M7" / W1 / Arm 6+ / Eva 4+ | Peck: Engaged / 2 / 6+ / 1 |
| **Hawk / Owl** (*Companion, Creature, Beast, Flying*) | 10 / 1 | M8" / W1 / Arm 6+ / Eva 4+ | Talons: Engaged / 2 / 5+ / 1 |
| **Snake** (*Companion, Creature, Beast*) | 10 / 1 | M4" / W1 / Arm 6+ / Eva 5+ | Bite: Engaged / 2 / 5+ / 1 |

| Companion | Special Rule | Description |
| --- | --- | --- |
| Rat / Ferret | Small | Cannot control objectives or meaningfully block larger Models. Can retrieve small objects and enter narrow spaces. |
| Cat | Graceful | Ignore the first 2" of Difficult Terrain movement penalties each Move. |
| Raven | Flying, Keen Eyes | Fly over terrain and Models. Once per scene, grant +1D6 to an appropriate Awareness Check involving observation. |
| Hawk / Owl | Flying, Scout | Fly over terrain and Models. Once per scene, grant +1D6 to an Awareness or Survival Check involving observation. |
| Snake | Venom | When Bite generates a Surge, the target suffers Slow 1. |

Small companions have no standard combat upgrades. Narrative variations may be granted appropriate utility traits.

#### Optional Bird Command — Spot Prey

**10 Points per eligible companion · 1 CP · Assault · Once per Round.** Raven, Hawk and Owl only. During **that bird's Assault activation**, choose one visible enemy Unit within Medium Range (12"). Against the **next friendly ranged Attack** targeting that Unit this Round, reduce its applicable **Cover X by 1**, to a minimum of zero. This affects the total Cover value from terrain, elevation and other sources; it does not affect Armor or Ward. If no remaining rule permits Evade, the target cannot Evade against that Attack. The bird may still choose one of its normal Assault actions. Multiple Spot Prey effects do not stack on the same Attack.

### 7.2 Standard Companions

| Unit | Points / Models | Model profile | Attack profiles |
| --- | ---: | --- | --- |
| **Dog** (*Companion, Creature, Beast*) | 15 / 1 | M6" / W2 / Arm 6+ / Eva 5+ | Bite: Engaged / 3 / 5+ / 1 |
| **War Hound** (*Companion, Creature, Beast*) | 30 / 1 | M6" / W3 / Arm 5+ / Eva 5+ | Bite: Engaged / 4 / 5+ / 1 |
| **Wolf** (*Companion, Creature, Beast*) | 20 / 1 | M6" / W2 / Arm 6+ / Eva 5+ | Bite: Engaged / 3 / 5+ / 1 |
| **Boar** (*Companion, Creature, Beast*) | 30 / 1 | M5" / W3 / Arm 5+ / Eva 6+ | Tusks: Engaged / 3 / 5+ / 1 |
| **Giant Lizard** (*Companion, Creature, Beast*) | 30 / 1 | M5" / W3 / Arm 5+ / Eva 6+ | Bite: Engaged / 4 / 5+ / 1 |
| **Giant Spider** (*Companion, Creature, Beast*) | 35 / 1 | M5" / W3 / Arm 6+ / Eva 5+ | Fangs: Engaged / 3 / 5+ / 1 |

| Companion | Special Rule | Description |
| --- | --- | --- |
| Dog | Keen Senses | Grant +1D6 to the owner when assisting scent-based Awareness or Survival Checks. |
| War Hound | Protective | Gain Accurate 1 against an enemy Engaged with its owner. |
| Wolf | Pack Hunter | Gain Accurate 1 against enemies Engaged with its owner. |
| Boar | Impact 1 | Add one Hit to the highest-die Charge Impact pool. |
| Giant Lizard | Adapted | Choose Climber or Aquatic when acquired. |
| Giant Spider | Climber, Venom | Climb vertical terrain at normal movement cost. When Fangs Surge, convert one successful Hit into Direct Damage 1. |

#### Optional Companion Commands

| Eligible animals | Command | Points | Effect |
| --- | --- | ---: | --- |
| Dog, Wolf, War Hound | **Harry — 1 CP, Combat** | +10 | Choose an enemy Engaged with this companion; the next friendly Melee Attack against it this Round gains Accurate 1 |
| Giant Spider | **Entangling Web — 1 CP, Assault** | +10 | Choose a visible enemy within Short; roll 2D6, and on at least one 4+, apply Slow 2 until its next Movement activation |

These Commands are **optional, separately purchased** creature-profile improvements, not free Tier 2 benefits. Using a Command does not replace the animal's ordinary Phase action unless its description says otherwise.

### 7.3 Large Companions

| Unit | Points / Models | Model profile | Attack profiles |
| --- | ---: | --- | --- |
| **Dire Hound** (*Companion, Creature, Beast*) | 45 / 1 | M7" / W4 / Arm 5+ / Eva 5+ | Bite: Engaged / 4 / 5+ / 1 / Critical 1 |
| **Bear Companion** (*Companion, Creature, Beast*) | 55 / 1 | M5" / W5 / Arm 5+ / Eva 6+ | Claws: Engaged / 4 / 5+ / 1; Bite: Engaged / 2 / 5+ / 2 / Anti-Armored 2 |
| **Riding Horse** (*Companion, Creature, Beast*) | 35 / 1 | M8" / W3 / Arm 6+ / Eva 5+ | Hooves: Engaged / 2 / 6+ / 1 |
| **Warhorse** (*Companion, Creature, Beast*) | 55 / 1 | M7" / W4 / Arm 5+ / Eva 5+ | Hooves: Engaged / 3 / 5+ / 1 |

| Companion | Special Rule | Description |
| --- | --- | --- |
| Dire Hound | Savage Predator | When Bite Surges, gain **Critical +1 for that Attack**, stacking with its printed Critical 1. |
| Bear Companion | Powerful Companion | May physically obstruct narrow passages more effectively than smaller companions, but cannot independently control objectives. |
| Riding Horse | Mount, Charge 3 | Used primarily for transportation. While mounted, the rider uses the mount's Move under the mounting rules and gains **Charge 3**. |
| Warhorse | War Mount, Charge 3, Impact 1 | While mounted, the rider gains **Charge 3**. A Warhorse has printed **Impact 1**, added to the highest Charge die. A qualified mounted rider may receive this bonus through mounted rules instead; it is never counted twice. |

### Companion Upgrades

Companions normally do not purchase generic Monster upgrades.

| Upgrade | Cost | Description |
| --- | --- | --- |
| Standard Companion | +0 | Retain the listed companion profile and abilities. |
| Trained Companion | +10 | Improve one Attack's Hit characteristic by one step, maximum 4+. |
| Durable Companion | +15 | Increase Wounds by 1. |
| Specialized Training | +10 | Gain one appropriate noncombat utility ability, subject to GM approval. |

A companion may normally purchase only one of these upgrades.

### Mount Restrictions

Mount Wounds do not automatically increase the rider's Wounds.

A ridden mount does not make its own Hooves Attack unless an appropriate Talent or ability permits it.

Characters who already purchased a Mounted upgrade do not receive the same benefit twice by acquiring a separate mount.

Dismounting, targeting mounts, and mount defeat use the campaign's normal mounted-combat rules.

## 8. Encounter and Army Integration

Bestiary Points approximate Structured Combat cost and are useful as a baseline for Narrative encounters. Creature type does not automatically grant faction allegiance; the army's list-building and scenario rules establish when creatures may join a faction.

- **Common NPCs:** 9 profiles. **Common Creatures:** 14. **Unusual Creatures:** 10. **Large Monsters:** 14. **Animal Companions:** 15.
- Companion Point Values contribute separately to their bonded PC's battlefield value, including both animals when the Tier 4 Talent grants a second one.
- The large-monster increases in v5 are provisional: **Wyvern 295 (Bite A6), Roc 315 (Talons A6), Chimera 330 (Claws and Fangs A5), Cave Wurm 360 (Maw A6), Young Dragon 395 (Claws A6)**.
- **Hydra 365** gains W15 and up to A10 while fully healthy but degrades with Damage. **Kraken 460** is a four-Model Unit (Body W10 + three Tentacles W2).
- Fire-sensitive Regeneration stops only after unsaved **Fire** Damage. Fire, Frost, Lightning, Radiant, Nature remain secondary Attack descriptors, not new saves.

## 9. Balance Priorities

The bestiary's Point costs are **provisional**. Test universal highest-die Charge Impact (particularly when combined with printed Impact 2–4), multiple Surges on combined Attack pools, creatures with unconditional Critical, the Hydra's attack degradation, Kraken's distributed Models, and extra action economy from bonded companions. Test a bird's Cover reduction before pricing it as a universal support feature. Monster movement/control Commands—especially Stagger—need scenario-level testing against both solo PCs and larger parties.

---

## v0.7 Bestiary Tag Classification

Small independent animal Units formerly listed solely with the **Beast** trait gain **Creature** as a battlefield Unit Type, without automatically becoming Monsters. Ordinary Humanoid NPCs gain **Humanoid, Mortal**, and foot-form NPCs qualify as **Infantry** where their profile permits. Monster remains a separate Unit Type. All tags are descriptive classifications and do not independently grant movement or combat abilities. Creature-specific Anti-tags check actual traits on the datasheet, and multiple matching Anti bonuses never stack.


## Canonical Bestiary Profile Corrections

This standards-alignment pass does not change creature Points, Attacks, or abilities. It fixes contradictory profile text (Rat Swarm's five Attacks and the Kraken's four Models), adds explicit **Flying** tags where flight is already printed, and assigns **Creature, Beast** to the companion animals (plus Flying for birds). **Companion** remains their roster designation; the extra tags do not award recruitment slots or new abilities. All such tags are targetable by applicable Anti-[Type] effects.
