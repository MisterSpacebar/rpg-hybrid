# Keywords

Keywords modify Attacks, Saves, positioning, and other rules. **Each die may be rerolled only once**, even when multiple abilities would permit rerolls. Whenever a rule says **Hit**, resolve any listed applicable defenses before applying Damage.

## Accurate X

When rolling this Attack's Hit dice, reroll up to X **natural 1s**. Resolve these rerolls **before** Surge/Blunder results and Critical conversions are finalized.

## Tough X

When rolling Armor Saves, reroll up to X natural 1s.

## Suppressing Tough (corrosive effects)

Certain explicitly printed effects (such as an Alchemist's **Corrosive Flask**) suppress the defender's Tough. While suppression lasts, **all applicable Tough X values count as 0**, including permanent Tough and Tough granted after the effect was applied. The affected Unit cannot reroll Armor Save natural 1s through Tough. Suppression expires when specified; it does not remove printed abilities permanently. There is **no universal Acid keyword** or automatic Armor penalty. For an effect that triggers on scoring a Hit, suppression begins after Hit determination and before Armor Saves if its description says so.

## Cover X

When rolling Evade Saves, reroll up to X natural 1s. Cover and elevation can grant Evade against eligible ranged Attacks, as specified in the combat rules. Applicable Cover X sources may stack, but a die cannot be rerolled twice.

## Critical X

After any Hit-die rerolls (including Accurate) and after identifying Surges, **convert up to X failed Hit dice into successful Critical Hits**. Converted dice are treated as meeting the Attack's Hit target; their original faces do not change, and converting a die does not generate a new Surge or Blunder.

**Critical X does not require a Surge** unless its source explicitly says *on Surge*. Critical Hits **ignore Armor and Evade**, but applicable **Ward** Saves still apply. Critical Hits retain the Attack's normal Damage and type. Different sources of Critical add together, including bonuses granted on a Surge. The maximum number converted is the number of eligible failed dice in that Attack pool.

**Example — Accurate then Critical:** With a 4+ Hit target, an Attack rolls `1, 2, 3, 4, 5, 6` and has Accurate 1, Critical 2. The 1 is rerolled into a 3, leaving failures `2, 3, 3`. Critical 2 converts two of those three failures into Critical Hits. The result is three normal Hits, two Critical Hits, and one remaining failure.

**Example — Surge bonus:** A pool `2, 2, 3, 3, 6, 6` against 4+ generates a Surge. With inherent Critical 2 and Rank II of Critical Prowess granting **Critical +2 on Surge**, all four failures convert to Critical Hits, alongside the two ordinary Hits.

## Blast X

If this Attack scores at least one Hit, each **other Unit** qualifying within X inches of the target suffers one automatic Hit at the Attack's printed Damage and type. Apply the [Area Effects Against Units](#area-effects-against-units) threshold to determine which secondary Units qualify: at least half of their current Models must be within the Blast radius. A qualifying Unit takes **one secondary Hit**, not one Hit per Model within the radius. Secondary Blast Hits cannot trigger additional Blast or Surges/Blunders. Resolve applicable Armor and Ward as usual; friendly Units can be affected unless specified otherwise.

## Anti-[Type] X

Gain X additional Attack dice against Units with the listed category or tag (for example, Anti-Undead 1, Anti-Monster 2, Anti-Armored 1). This does **not** raise Damage.

## Concealed

A Concealed Unit cannot normally be chosen as an Attack target unless the attacker is Engaged with it or wholly within 4". Concealed ends when an effect specifies, usually when the Unit Attacks or enters Engagement.

## Pinpoint

Ignore the normal Hit penalty when targeting an enemy Engaged with another Unit. Defenses are unaffected.

## Heal X

Remove up to X accumulated Damage, without exceeding the target's Wounds characteristic or restoring removed Models unless an ability states otherwise. Ordinary healing does not undo Critical Injuries or automatically return Defeated PCs to combat.

## Instant

This Attack or Ability cannot normally be responded to using Reaction Command Abilities or other Reaction effects unless an exception explicitly permits a response to Instant.

## Heavy

The Attack or Ability may be used only if its Unit did not voluntarily move during its preceding Movement Phase. Significant repositioning or changing Range Bands counts as moving.

## Firearm

A Firearm Attack automatically gains Instant. It remains Physical unless another rule grants Magic.

## Long Range X

Extend printed maximum Range by X inches. When attacking beyond the printed Range, worsen Hit by one step.

## Rapid-Fire X

Against a target within half the Attack's printed Range, add X Attack dice. Long Range does not change the distance used to determine Rapid-Fire.

## Brace X

When this Unit is successfully Charged, **subtract X from the Charge's final Impact pool**, to a minimum of zero. Brace does not provide retaliatory Attacks. Example: highest Charge die 5 + printed Impact 1 − Brace 2 = **4 automatic Hits**.

## Blink X

A Unit may Blink only when **not Engaged**. Choose a **leading Model**, as for a normal Move, and reposition it up to X inches from its original location. Then reposition the other Models, with each Model moving no more than X inches from its own starting location, so the entire Unit ends in legal Coherency.

Blink ignores **intervening terrain and obstacles**, but **does not ignore elevation**: vertical displacement and any elevation restrictions still apply. Every final Model position must be legal. The Unit must end outside Engagement and cannot be placed in impassable or otherwise prohibited destinations. Blink is repositioning, not a normal Move or Charge.

## Slow X

Reduce the affected Unit's **Move by X inches** during its next Movement activation, to a minimum of 0"; then remove Slow. Slow does **not** change Attacks, Hit, or other characteristics. Multiple concurrent Slow effects do not stack: use the highest applicable X. In Narrative Combat, apply the reduced Move when determining allowed movement or changes in Range Band.

## Impact X

When this Unit successfully Charges, add **X** to its base Charge Impact pool. Every successful Charge already inflicts a number of automatic Physical Hits (Damage 1) equal to the **highest Charge die**. Apply printed Impact X and other modifiers, then subtract any Brace X (minimum zero). **Armor → Ward → Damage; no Evade.** An ordinary Charge creates one Impact pool for the charging Unit; multiple Models do not multiply the Hits.

## Charge X

In Structured Combat, add **X inches** to the Unit's final **2D6** Charge distance (Move is not added). It does not change the dice rolled, highest die used for Impact, or normal 12" declaration limit. Multiple Charge X effects do not stack; use the highest. In Narrative Combat, Charge X indicates greater effective reach and can permit a plausible longer Charge but does not itself award Skill Check Successes.

## Area Effects Against Units

For an ability that affects **Units within a measured area or radius** (rather than selecting individual Models), determine whether each Unit qualifies when the effect resolves:

- Count the Models **currently present** in that Unit, including only Models with at least part of their base within the area.
- A Unit qualifies when **at least half** of its Models are within the area (round the required number of Models up).
- Each qualifying Unit suffers the listed effect **once**, irrespective of how many of its Models are inside the area. If the effect inflicts **X Hits**, that is X Hits against the Unit in total, **not X Hits per qualifying Model**.
- Resolve the Unit's normal Saves and Damage allocation for those Hits. The Models counted to establish eligibility do **not** individually roll a separate pool or restrict normal Damage allocation.
- Check eligibility **at the time the effect resolves**. For delayed effects, this may be after eligible Units have moved away from the area.

**Example:** A six-Model Unit with three Models within a marker's radius qualifies; a five-Model Unit requires at least three Models. A one-Model Unit qualifies when its sole Model is in the area.

This is a rule for **area effects applied to Units**, including Blast secondary targets and delayed area damage. It does not replace the normal rules for actual movement through terrain, physical obstruction, line of sight, or effects explicitly targeting individual Models.

## Delayed Automatic Hits

An ability that explicitly creates **delayed automatic Hits** (for example, Arcane Storm) uses **Armor → Ward → Damage**, like Impact, without Evade **unless its text specifically permits Evade**. When the effect covers a radius, determine the affected Units using [Area Effects Against Units](#area-effects-against-units), then resolve the printed number of automatic Hits **once against each qualifying Unit**. Its stated attack type (Magic or Physical) applies. Do not multiply Hits or Save rolls by the Unit's number of Models. This is not a blanket rule for ordinary ranged Spell Attacks or other effects that do not specify delayed automatic Hits.

## Direct Damage X

Inflict X Damage without Armor or Evade. Applicable Ward Saves still apply. Direct Damage is not normally a Hit unless another rule says otherwise.

## Attack Types and Elemental Attributes

**Primary Attack types** determine eligible Wards: **Physical** and **Magic**. An Attack without an explicit Magic keyword is normally Physical. Some attacks carry supplementary **elemental attributes**, which do not independently change saves or grant damage bonuses:

| Attribute | Typical use |
| --- | --- |
| **Fire** | Burning spells, breath weapons and other attacks that can suppress Fire-sensitive Regeneration |
| **Frost** | Ice effects and movement-control spells |
| **Lightning** | Electricity, sparks, and lightning attacks |
| **Radiant** | Sacred or sun-derived effects |
| **Nature** | Vines, thorns, and natural magic |

Attributes only matter when a rule refers to them. **Fire Damage** occurs only when an Attack with Fire actually inflicts unsaved Damage. Merely targeting or hitting a regenerating creature with a Fire Attack does not disable Regeneration. A source may possess multiple descriptors (for example, *Magic, Fire, Blast 1"*). Future elemental interactions must be printed explicitly.

## Creature Types and Battlefield Tags

Units may have **battlefield tags** (Infantry, Cavalry, Mobile, Elite, Support, Wizard, Monster, Hero, etc.) and separate **creature types** (Humanoid, Beast, Undead, Construct, Elemental, Spirit, Plant, Swarm, etc.). Different tags may coexist. Anti-[Type] X refers to matching named tags or types. **Armored** remains a provisional tag pending the generic and faction roster review; do not automatically assign it merely from an Armor Save value until the roster standard is settled.

## Stagger (provisional control keyword)

A **Staggered** Unit forfeits one eligible activation: if it has not yet activated in the current Phase, it forfeits that activation; otherwise it forfeits its next eligible phase activation. Remove Stagger after forfeiting one activation. Repeated applications do not stack. The Unit may still make eligible Reactions unless a separate rule prohibits them. If a Unit has no eligible activation in the current Phase, carry Stagger forward to its next eligible Phase. This is a **provisional playtest rule**, used by certain proposed Monster Commands, and is not automatically applied to abilities that currently cause Slow.
