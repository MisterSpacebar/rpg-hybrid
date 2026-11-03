# Artificer Formulas

Formulas are the Artificer's **learned personal Command Abilities**, representing prepared mixtures, tools, traps, and short-lived inscriptions. An Artificer knows **two Formulas** from their chosen Subclass at creation and may learn others through **Formula Study**. Choose one known Formula as a **Field Specialty**: it is always prepared and occupies the Artificer's Subclass Signature slot. Other known Formulas must occupy one of the four optional prepared Command slots to be used. A Formula from a different Subclass can be learned only through **Cross-Discipline** or an explicit exception.

## Formula activation

- Unless a Formula explicitly says otherwise, it costs **1 CP** and is used during the Artificer's **own Unit activation** in its indicated phase. It may target other eligible Units without activating those Units' personal Commands.
- **Formula Attacks** are identified as **Assault — Attack action**. They consume the Artificer's one Assault action *in addition to* their CP cost, so they cannot accompany an ordinary Assault Move or Charge.
- Non-Attack Formulas cost CP but do not replace the normal phase action unless stated otherwise.
- A Formula's range, Attack dice, and effects are complete as printed; they do not receive free Attack dice. Formula Attacks use the listed type rather than the currently equipped weapon's profile.
- Formulas do not create free, permanent, tradable items. Permanent potions, enchanted weapons, crafted gear, and similar inventory use the separate [Equipment and Crafting](11_equipment_and_crafting.md) rules, including their Point costs.
- Formula effects that use a radius are resolved **once per eligible Unit**, not per Model. At least half the Unit's current Models must qualify as described in [Keywords](10_keywords.md#area-effects-against-units). A single Model can trigger a trap if its movement enters the trap's radius; the trap then affects its Unit once.
- An Artificer starts with no additional Formula-related Point costs. Formulas are Class/Talent capabilities, funded through CP and the existing advancement system.

### Formula Skill Checks

Some Formulas require a listed **Characteristic + Skill** Check as part of their Command. Roll D6 equal to the Characteristic; every die meeting the Skill rating is one success. **At least one success is required** for the Formula to take effect. Otherwise, its CP is spent and the effect fails. There is no separate Difficulty requirement. Where a Formula has an `X` or scaling amount, count the successes, subject to its printed cap. These are ordinary Skill Checks: a maximum of one Surge or Blunder each, regardless of dice count.

**Refined Technique**, an improvement from Formula Prowess, adds **one effective success** to an already successful Formula Skill Check for determining the Formula's variable effects. It does not turn a failed roll into a success or generate an additional Surge. The effect may still be limited by its printed cap.

## Alchemist Formulas

Alchemists use volatile ingredients, practical medicine, fumes, and other prepared chemical techniques. Flask Attacks are **Physical**, even when they have an additional elemental attribute.

| Formula | Timing | Effect |
| --- | --- | --- |
| **Quick Tonic** | 1 CP · Movement | Choose a friendly Unit within 3". Make a **Mind + Craft** Check. On success, it gains +X" Move on its next Move this Round, where **X = min(4, 1 + successes)**. |
| **Restorative Draught** | 1 CP · Movement | Choose a friendly Unit within 3". Make a **Mind + Craft** Check. On success, **Heal X** accumulated Damage to one surviving Model in that Unit, where **X = min(2, successes)**. Cannot return defeated Models or remove Critical Injuries. |
| **Smoke Vial** | 1 CP · Movement | Place a **2"-radius smoke marker** within 6". Until the end of the Round, Units qualifying for the smoke area gain **Cover 1** against eligible ranged Attacks. It does not block movement or independently block Line of Sight. |
| **Corrosive Flask** | 1 CP · Assault — **Attack action** | **Physical:** 6" / A 3 / Hit 5+ / Damage 1. After determining Hits, if any Hit was scored, suppress the target's **Tough** before its Armor Saves against this Attack and until the end of the Round. |
| **Volatile Flask** | 1 CP · Assault — **Attack action** | **Physical, Fire:** 6" / A 3 / Hit 5+ / Damage 1 / Blast 1". Use normal Blast and Unit-area rules. Damage that gets through Saves counts as Fire Damage. |

**Corrosive Flask and Tough:** While suppressed, the Unit's applicable Tough X is treated as **0** from all sources, including newly gained Tough, for the stated duration. No Tough rerolls may be used against the triggering Flask. The keyword is not permanently erased. This is an explicitly printed suppression effect, **not** a universal `Acid` keyword.

## Machinist Formulas

Machinists set devices, manipulate positioning, and support targeting. Deployable traps are removed upon triggering or at the end of the Round. A Machinist may have **one of each named trap** active unless specified otherwise.

| Formula | Timing | Effect |
| --- | --- | --- |
| **Proximity Charge** | 1 CP · Movement | Place a **25 mm marker** within 6". The first enemy Unit whose Model moves within 2" triggers **2 automatic Physical Hits at Damage 1** against that Unit. Resolve Armor → Ward, without Evade. Remove when triggered or at end of Round. |
| **Snare Wire** | 1 CP · Movement | Make an **Agility + Craft** Check. On success, place a **25 mm marker** within 6". The first enemy Unit whose Model moves within 2" suffers **Slow X**, where **X = min(3, 1 + successes)**. Remove when triggered or at end of Round. |
| **Spotter Lens** | 1 CP · Movement | Choose a visible enemy Unit within 10". Reduce its **effective Cover X by 1**, to a minimum of 0, against the next friendly ranged Attack targeting it this Round. Other applicable sources of Evade remain available. |
| **Winch Line** | 1 CP · Movement | Choose a friendly Unit within 3" and make a **Body + Craft** Check. On success, reposition that Unit up to **X"**, where **X = min(4, 1 + successes)**. Follow a legal path and preserve Coherency; cannot enter Engagement. This is ordinary repositioning, not Blink. |
| **Rivet Launcher** | 1 CP · Assault — **Attack action** | **Physical:** 8" / A 3 / Hit 5+ / Damage 1 / Accurate 1. This is a Formula Attack, not a permanent firearm or separately equipped weapon. |

**Trap triggers:** The first Model crossing into a trigger area triggers the trap against its Unit. Apply its damage or condition **once per Unit**, not per Model. In Narrative Combat, the GM establishes whether the Unit passes through the trap's stated location; one qualifying Unit triggers and expends the trap.

## Runesmith Formulas

Runesmiths temporarily inscribe or empower **equipment**, rather than permanently enchanting it. Unless expressly stated otherwise, runes affect the named Unit's **next Physical Weapon Attack** during the Round; they do not affect Spell Attacks. Elemental attributes may attach to **Physical** or **Magic** Attacks without changing their primary Attack type.

| Formula | Timing | Effect |
| --- | --- | --- |
| **Ember Rune** | 1 CP · Movement | One friendly Unit within 3" gains **Fire** and **Accurate 1** on its next Physical Weapon Attack this Round. The Attack remains Physical. |
| **Frost Rune** | 1 CP · Movement | One friendly Unit within 3" gains **Frost** on its next Physical Weapon Attack this Round. If it deals unsaved Damage, the target suffers **Slow 1**. The Attack remains Physical. |
| **Hunter's Sigil** | 1 CP · Movement | Choose a friendly Unit within 3" and name one creature type. Make a **Mind + Mysticism** Check. On success, its next Weapon Attack this Round gains **Anti-[chosen type] X**, where **X = min(2, successes)**. |
| **Warding Etching** | 1 CP · Movement | One friendly Unit within 3" gains **Ward 6+ against Magic** until the end of the Round, unless it already has a better applicable Magic Ward. |
| **Anchor Rune** | 1 CP · Movement | One friendly Unit within 3" gains **Brace 2** until the end of the Round, reducing incoming Charge Impact Hits, not other Attack Hits. |

## Formula growth and preparation

The canonical Artificer Talents are listed in [Talents](13_talents.md#artificer-talents): **Formula Study (Tier 2+), Formula Prowess (Tier 2+), Improvised Formula (Tier 3), and Cross-Discipline (Tier 5)**. No separate Grand Invention or fixed Subclass Signature device exists.

**Formula Study** adds a known Formula from the Artificer's own list; it doesn't automatically prepare it. **Formula Prowess** improves a *different* known Formula per rank. A rank grants **two different Minor Enhancements or one Major Enhancement**; Extended Delivery adds **1"**, not 2". **Improvised Formula** switches one prepared Formula once per battle for **0 CP** during the Artificer's Movement activation. **Cross-Discipline** grants one known Formula from another Subclass as an additional always-prepared Formula.

### Point values and attack profiles

An Artificer uses the printed [Equipment](11_equipment_and_crafting.md) weapon profiles and costs. Starting Formulas are not independent purchased equipment and do not add equipment Points. A Formula Attack already includes its printed attack dice, Hit value, Damage, and keywords. Optional weapons and other permanent crafted items still add their listed Points.
