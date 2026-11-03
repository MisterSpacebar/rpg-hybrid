# Rules Data (JSON)

This folder contains structured JSON conversions of the "data-like" content in
[rulebooks/](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks) —
units, factions, talents, gear, campaign cards, etc. — as opposed to the
procedural/explanatory rules text, which remains authoritative in the Markdown
chapters under `rulebooks/`.

**The Markdown rulebook is always the source of truth.** These JSON files are a
derived, machine-readable view intended for tools, apps, or quick lookups. If a
JSON file and its source Markdown ever disagree, the Markdown wins unless a
`knownIssues` entry says otherwise (see below).

## Status

Converted so far:

- [units/generic/](units/generic) — based on
  [01_generic_units.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/02_wargame/01_generic_units.md).
- [pc/](pc) — PC species (Ancestries), Classes/Subclasses, and Talents, based on
  [04_ancestries.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/01_rpg/04_ancestries.md),
  [05_classes.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/01_rpg/05_classes.md),
  [13_talents.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/01_rpg/13_talents.md), and
  [03_experience_and_advancement.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/01_rpg/03_experience_and_advancement.md)
  (Talent tier/XP table).
- [equipment/](equipment) — weapons, armor, shields, magical foci, magical
  equipment (weapons/armor/shields/arcane-and-divine-foci/general-artifacts/
  relics), enchantment components, command-imprinted equipment, and crafting,
  based on
  [11_equipment_and_crafting.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/01_rpg/11_equipment_and_crafting.md).
- [spells/](spells) — spell acquisition rules, starting Spell Attacks, and the
  learnable Spell Catalogue, based on
  [06_spells_and_equipment.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/01_rpg/06_spells_and_equipment.md) and
  [12_spell_catalogue.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/01_rpg/12_spell_catalogue.md).
- [bestiary/](bestiary) — NPC Unit profiles (Common NPCs, Common Creatures,
  Unusual Creatures, Large Monsters), the generic Monster upgrade reference,
  Elite/Alpha creature rules, and Animal Companions, based on
  [17_bestiary.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/01_rpg/17_bestiary.md).
- [factions/](factions) — the 12 Core Factions' rules, Faction Commands,
  Signature Core Units, Captains/Specialists, Large Assets, and Faction
  Leaders, plus the Roster Distribution Summary and Balance and Design Notes,
  based on
  [02_core_factions.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/02_wargame/02_core_factions.md).
  Also includes a convenience cross-faction reference file,
  `15_all_faction_rules_and_commands.json`, consolidating every faction's
  `factionRule` and `factionCommands` in one place for quick lookup (derived
  from the 12 individual faction files, not separately sourced from Markdown).
- [doctrines/](doctrines) — the General Rules (Command Usage, Movement and
  Positioning, Defensive Effects, Surges and Blunders, Recruitment Slots) and
  all 16 Non-Faction Doctrines (Foundation Recruitment Slot, Strategy, five
  Commands, Doctrine Identity, plus extra sub-sections for Horde, Grinding,
  Deep Strike, and Gambit), the Doctrine Summary table, and Playtesting
  Priorities, based on
  [03_non_faction_doctrines.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/02_wargame/03_non_faction_doctrines.md).
- [missions/](missions) — both Missions chapters: `matched_play/` (the eight
  D8 Matched Play Missions, their VP scoring, and setup rules), based on
  [01_matched_play_missions.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/03_missions/01_matched_play_missions.md),
  and `campaign/` (the six Primary Mission archetypes P1–P6, the 18 numbered
  Secondary Objectives plus the Narrative Secondary, the eight optional
  Special Rules, Campaign Stakes and Consequences, and four worked examples),
  based on
  [02_campaign_missions.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/03_missions/02_campaign_missions.md).
- [campaign/](campaign) — the card/data-driven appendices of the Campaign
  chapter: Company Order Cards (Appendix A), Grand Faction Maneuver Cards
  (Appendix B), Act Agendas (Appendix C), General Political Tasks
  (Appendix D), Grand Faction Political Tasks (Appendix E), Neutral
  Opportunities (Appendix F), Exploration and Discoveries (Appendix G),
  Development Rewards (Appendix H), Grand Faction Charters (Appendix I),
  Quick Reference Sheets (Appendix L), Optional Dice Tables and Randomized
  Card Selection (Appendix M), and the Tri-Hex Atlas and Territorial
  Development (Appendix O — the strategic map, its eleven Tri-Hex tiles,
  political control, regional resources, Local Authorities, exploration
  Sites, and territorial Improvements), based on
  [Appendix_A.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/04_campaign/Appendix_A.md)
  through
  [Appendix_I.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/04_campaign/Appendix_I.md),
  [Appendix_L.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/04_campaign/Appendix_L.md),
  [Appendix_M.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/04_campaign/Appendix_M.md), and
  [Appendix_O.md](/c:/Users/yibin/OneDrive/Documents/GitHub/rpg-hybrid/rulebooks/chapters/04_campaign/Appendix_O.md).
  By design, this does **not** cover the core campaign rules file
  (`00_campaign_core_rules.md`) or the remaining procedural/reference
  appendices (J, K, N, P, Q: Component Inventory and Setup, Campaign
  Examples, Campaign Council and Turn Procedure, Legacy Captains, and
  Campaign Records/Tracking Sheets), which remain Markdown-only per the
  user's scoping decision.

Still to convert: nothing further is currently planned — the remaining
Campaign appendices (core rules plus J, K, N, P, Q) were intentionally left
out of this JSON conversion effort as primarily procedural/reference
material rather than card-like or map-like data.

## Folder Layout

```
rules_data_json/
  units/
    generic/
      00_general_rules.json
      01_infantry.json
      02_cavalry_and_mobile_troops.json
      03_captains.json
      04_wizards.json
      05_support_units.json
      06_artillery.json
      07_large_assets.json
      08_generic_upgrade_reference.json
      09_general_point_scale.json
      10_design_notes_and_playtest_priorities.json
  pc/
    index.json
    ancestries.json
    classes/
      index.json
      00_overview.json
      warrior.json
      rogue.json
      mage.json
      priest.json
      artificer.json
    talents/
      index.json
      00_talent_system.json
      generic_talents.json
      critical_specialization.json
      social_specialization.json
      animal_companion_talents.json
      warrior_talents.json
      rogue_talents.json
      mage_talents.json
      priest_talents.json
      artificer_talents.json
  equipment/
    index.json
    00_overview.json
    01_melee_weapons.json
    02_ranged_weapons.json
    03_armor_and_shields.json
    04_magical_foci.json
    05_learning_spells.json
    06_magical_weapons.json
    07_magical_armor.json
    08_magical_shields.json
    09_arcane_and_divine_foci.json
    10_general_artifacts.json
    11_relics.json
    12_enchantment_components.json
    13_command_imprinted_equipment.json
    14_crafting.json
  spells/
    index.json
    00_overview.json
    starting_spells.json
    mage_spells.json
    priest_spells.json
  bestiary/
    index.json
    00_general_bestiary_rules.json
    01_common_npcs.json
    02_common_creatures.json
    03_unusual_creatures.json
    04_large_monsters.json
    05_common_monster_upgrades.json
    06_elite_and_alpha_creatures.json
    07_animal_companions.json
    08_encounter_and_army_integration.json
    09_balance_priorities.json
  factions/
    index.json
    00_general_roster_rules.json
    01_free_realms.json
    02_sacred_orders.json
    03_iron_holds.json
    04_wild_courts.json
    05_warclans.json
    06_underclans.json
    07_death_legions.json
    08_blood_courts.json
    09_spirit_hosts.json
    10_infernal_hosts.json
    11_arcane_orders.json
    12_titan_clans.json
    13_roster_distribution_summary.json
    14_balance_and_design_notes.json
    15_all_faction_rules_and_commands.json
  doctrines/
    index.json
    00_general_rules.json
    01_combined_arms.json
    02_objective_play.json
    03_elite.json
    04_counter_strike.json
    05_castling.json
    06_firing_line.json
    07_mobility.json
    08_control.json
    09_alpha_strike.json
    10_horde.json
    11_grinding.json
    12_deep_strike.json
    13_slingshot.json
    14_gambit.json
    15_heavy_support.json
    16_breakthrough.json
    17_doctrine_summary.json
  missions/
    index.json
    matched_play/
      00_overview_and_setup.json
      01_mission_list.json
      02_mp1_domination.json
      03_mp2_frontlines.json
      04_mp3_breakthrough.json
      05_mp4_recover_the_relics.json
      06_mp5_supply_requisition.json
      07_mp6_sabotage.json
      08_mp7_seek_and_destroy.json
      09_mp8_arcane_supremacy.json
      10_mission_actions_and_scoring.json
      11_format_scaling_and_design_principles.json
    campaign/
      00_overview_and_mission_construction.json
      01_primary_missions_overview.json
      02_p1_confrontation.json
      03_p2_defense.json
      04_p3_expedition.json
      05_p4_extraction.json
      06_p5_passage.json
      07_p6_negotiation.json
      08_secondary_objectives.json
      09_special_rules.json
      10_campaign_stakes_and_consequences.json
      11_example_assembled_missions.json
      12_mission_preparation_checklist.json
  campaign/
    index.json
    01_company_order_cards.json
    02_grand_faction_maneuver_cards.json
    03_act_agendas.json
    04_general_political_tasks.json
    05_grand_faction_political_tasks.json
    06_neutral_opportunities.json
    07_exploration_and_discoveries.json
    08_development_rewards.json
    09_grand_faction_charters.json
    10_quick_reference_sheets.json
    11_optional_dice_tables.json
    12_tri_hex_atlas_and_territorial_development.json
```

File numbering mirrors the numbered sections of the source Markdown chapter so
the two stay easy to cross-reference. `pc/talents/` is organized by Talent
category/Class (matching the source headings) rather than by number, since the
source chapter itself isn't numbered.

## Schema Conventions

- **`sourceRef`** — every top-level entry carries `{ "file": "<path from repo root>", "section": "<heading path>" }` pointing back to the Markdown it was transcribed from.
- **Points costs** are plain numbers with no `+` sign. A field named `points` is additive on top of the unit's `basePoints` (or the relevant option group's base) unless the field is explicitly named `totalPoints`.
- **Stat blocks** use: `move` (string with trailing `"`, e.g. `"4\""`), `wounds` (number, or a string such as `"3 per Model"` when the source states it that way), `armor` / `evade` / `ward` (string like `"5+"`, or `null` when the source prints `—`).
- **Weapon/Attack profiles** are parsed from the `Range / Attacks / Hit / Damage / Keywords` notation into:
  ```json
  {
    "range": "Engaged" | "Engaged 2\"" | "8\"" | "...",
    "attacks": 2,
    "hit": "5+",
    "damage": 1,
    "damageTypes": ["Physical"],
    "keywords": ["Brace 1", "Heavy"]
  }
  ```
  `damageTypes` is only non-default when the source explicitly prints a type (e.g. `Magic`, `Radiant`). Per the core rules, an Attack with no printed type defaults to **Physical**, so `damageTypes` always contains at least `"Physical"` for transcribed profiles even when the source line omits it.
- **Choice groups** (e.g. "choose one melee weapon package") use `{ "chooseCount": 1, "options": [...] }`. Each option has at minimum `name`, `points`, and either `profile` (a weapon/attack profile object) or `effect`/`notes` (free text) — never both a profile and conflicting free-text stats.
- **`knownIssues`** — an optional array on an entry, used when the source Markdown contains an internal contradiction (e.g. a worked numeric example that doesn't match the table above it). Each entry is a plain-language description of the discrepancy and states which value was treated as canonical for this JSON (normally the table, as the more prominent/current figure). These are flags for a future rulebook cleanup pass, not silent corrections — the JSON still only encodes one canonical number, it never guesses a "fixed" one.
- Free-text rules that don't reduce cleanly to fields (e.g. multi-sentence design rationale) are kept as string arrays (one rule/sentence per array entry) rather than a single prose blob, so each statement stays independently referenceable.

### PC-specific conventions (`pc/`)

- **Talents**: `tier` is a number, or a string like `"1+"` for Ranked Talents (open-ended tier floor). `cost` holds the CP cost when the Talent grants an active Command Ability; Passive Talents omit it. `type` holds the activation timing (`Movement`, `Assault`, `Reaction`, `Passive`, etc.) as printed. `effect` is a string, a string array (multi-clause effects), or an object with `narrative` / `structuredCombat` (and occasionally `narrativeCombat`) keys when a Talent's effect explicitly differs between modes.
- **Classes**: each Subclass's weapon-choice tables use the same `{chooseCount, options}` pattern as generic units; each option additionally carries a `standard: true/false` flag marking the Markdown's **bold "(standard)"** recommended weapon (not mandatory — see `startingEquipmentConventions`).
- Weapon/Spell Attack prices in `pc/classes/*.json` were cross-checked against the Equipment Catalogue (`11_equipment_and_crafting.md`) at time of conversion and found consistent; unlike the generic-units pilot, no pricing drift was found here.

### Equipment-specific conventions (`equipment/`)

- **Enchantments/artifacts that grant a Command Ability** (most magical weapons, armor, shields, foci, general artifacts, and relics) use a nested `command: { "name", "cost", "timing", "effect" }` object alongside the item's own `name`/`addedPoints` (or `points`)/passive `effect` fields, e.g. Frostbite → Freezing Strike, Mirror Shield → Reflect, Staff of the Archmage → Masterful Casting. Some items (e.g. Shield of the Guardian, Hourglass of Haste) are Command-only with no separate passive effect — `effect` is `null` in those cases rather than omitted, to make the absence explicit.
- **Relics** (`11_relics.json`) are a mix of complete standalone equipment (Blade of the Falling Star is a full weapon `profile`, not an enchantment added to a base item) and artifact-style passive/Command entries — check each entry's shape rather than assuming all Relics share one pattern.
- Equipment prices/effects were re-verified line-by-line against a fresh read of `11_equipment_and_crafting.md` during conversion (the source had been edited since the PC/Talents pass); no drift was found except the Markdown table-formatting issue noted below.

### Spells-specific conventions (`spells/`)

- Starting Spell Attacks (Mage/Priest Base and Subclass spells known at character creation) are intentionally captured once more in `spells/starting_spells.json`, even though they're already fully present in `pc/classes/mage.json` and `pc/classes/priest.json` — the source Markdown itself states this content is deliberately duplicated across `06_spells_and_equipment.md` and `05_classes.md` for character-creation convenience, so the JSON mirrors that. `spells/mage_spells.json` and `spells/priest_spells.json` cover only the separately-learnable Spell Catalogue (`12_spell_catalogue.md`), which is distinct content.
- Every Catalogue spell was checked against the Basic/Specialized/Powerful (10/20/30 point) design guidelines in `00_overview.json`; no cost/profile drift was found.

### Bestiary-specific conventions (`bestiary/`)

- Each creature entry uses `tags` (combined battlefield + creature-type tags, since the source prints them together per-Unit, e.g. `*Monster, Elite, Beast*`), `points`, `models` (a number, or a string like `"1 Swarm"` / `"4-model Unit"` for non-standard Unit compositions), `modelProfile` (`move`/`wounds`/`armor`/`evade`/`ward`, `ward` is `null` when the source prints `—`), `attackProfiles` (array of named weapon/ability profiles using the standard Range/Attacks/Hit/Damage/Keywords shape), `abilities` (Passive or Command, with `cost`/`timing` for Commands), and `upgrades` (`{name, cost, description}`).
- **Multi-Model Units with non-uniform parts** (Abyssal Kraken's Body + 3 Tentacles, each with separate stats/attacks) nest a `body`/`tentacles` breakdown inside `modelProfile` instead of forcing a single flat profile.
- **Degrading/scaling Units** (the Hydra's heads-vs-Wounds relationship) get a dedicated `headThresholds` array rather than trying to encode the scaling rule as a single attack profile.
- **Preconfigured named variants printed as a complete worked stat line** (e.g. Cave Wurm's "Elder Wurm — 425 Points" paragraph, distinct from the Elder Wurm *upgrade* option) are captured under a `preconfiguredVariant` key with a cross-check note confirming the printed total matches base + upgrade cost.
- One `knownIssues` entry was recorded in `04_large_monsters.json`: the Hydra prints no Ward (`Ward —`) while most comparable Elite Large Monsters have a Magic Ward — flagged as a likely-intentional balance outlier rather than a drafting omission, since it wasn't contradicted elsewhere in the source.
- Every section's content was cross-checked against the Encounter and Army Integration profile counts (9/14/10/14/15) and found consistent.

### Faction-specific conventions (`factions/`)

- Each faction file uses: `doctrines` (array of two generic Doctrine names the faction can select from, cross-referencing the not-yet-converted `rulebooks/chapters/02_wargame/03_non_faction_doctrines.md`), `factionRule` (`{name, effect}`), `factionCommands` (`{name, timing, cost, effect}`), `signatureCoreUnits`, `captainAndSpecialists`, `largeAssets`, and `factionLeader` — all four of the latter use the shared `{points, tags, models?, modelProfile, attackProfiles, abilities}` shape carried over from the Bestiary conventions above.
- `abilities` entries are `{name, type: "Passive"|"Command", cost, timing, frequency, effect}`; only the fields present in the source are included (e.g. a Passive has no `cost`/`timing`).
- `upgrades` (an optional array on Captains/Specialists/Large Assets) captures priced options such as the Marshal's Tactical Withdrawal or the Great Bombard's Airburst Bombardment, using `{name, cost, type, commandCost, timing, effect, rosterNote}`.
- Three `knownIssues` were recorded where a Faction Leader's entry deviates from the pattern of its peers without an apparent in-source explanation: the Pale Monarch (Spirit Hosts) and the Overtyrant (Titan Clans) print no Impact value despite being melee-oriented Heroes, and the Archfiend (Infernal Hosts) prints no Unit-type tags at all. A fourth `knownIssues` entry notes that Free Realms' own Faction Rule and the generic Doctrine both happen to be named "Combined Arms" but have unrelated effects.
- `14_balance_and_design_notes.json` records two additional cross-check notes: the design-notes' "8 Model Count → Expendable infantry hordes" row doesn't match any transcribed signature Unit (Choppa Mob is 10, Corpse Horde is 9), and the stated Wizard/Support price band (135–210) is undercut by nothing but exceeded by the Master Arcanist at 240 — both flagged as possibly stale guidance from an earlier balance pass, not corrected.
- The non-faction Doctrines referenced by each faction's `doctrines` field (their Command tables) are now covered separately in `doctrines/` (see below).

### Doctrine-specific conventions (`doctrines/`)

- Each doctrine file uses: `foundationRecruitmentSlot` (one of the `H/C/E/R/V/S/A` letters defined in `00_general_rules.json`), `strategy` (one-sentence summary), `commands` (always exactly five, `{name, slot, timing, effect}`), and `doctrineIdentity` (free text, or an object with `summary`/`approaches`/`flexibility`/`limitation` keys for Grinding's longer breakdown).
- A few doctrines carry extra keys beyond the common shape, mirroring extra sub-sections in the source: Horde has `qualificationNote` (the "four or more surviving Models" threshold); Grinding and Deep Strike have `distinctionFromOtherDoctrines` (array of `{doctrine, distinction}`, comparing the doctrine against others); Deep Strike additionally has the full `deepStrikeDeployment` sub-chapter (Reserve rules, Arrival procedure/restrictions) and `commandClarifications`; Gambit has `doubleDownClarification` and `allOrNothingClarification` (each with a worked example, as prose strings).
- `17_doctrine_summary.json` holds the Doctrine Summary table (`{doctrine, foundation, primaryStrength}` for all 16) plus a `crossCheck` note confirming every doctrine's summary-table Foundation Recruitment Slot matches its own file — no discrepancies were found — and the Playtesting Priorities / Draft Status text.
- One shared `knownIssues` note (recorded in both `doctrines/index.json` and `doctrines/01_combined_arms.json`) flags that Doctrine 1 "Combined Arms" shares its name with the Free Realms Faction Rule "Combined Arms" despite unrelated effects — cross-referencing the existing Factions-domain note on the same collision.

### Mission-specific conventions (`missions/`)

- `missions/index.json` is a two-part manifest with separate `matchedPlay` and `campaign` sub-objects (each with its own `sourceRef` and `files` list), since the two source files are largely independent chapters sharing only a folder.
- **Matched Play** (`matched_play/`): each of the 8 Mission files (`02_mp1_domination.json`–`09_mp8_arcane_supremacy.json`) uses `primaryObjective`, `tacticalObjective: {name, effect}`, `specialRules`, and `designNotes`; a few (Breakthrough, Recover the Relics, Arcane Supremacy) nest extra structured detail under `primaryObjective` or `specialRules` where the source's own prose is more elaborate than a single sentence (e.g. Breakthrough's `breakthroughPoints`/`breakThroughEligibility`/`resolution`/`cap` keys).
- **Campaign** (`campaign/`): each of the 6 Primary Mission files (`02_p1_confrontation.json`–`07_p6_negotiation.json`) uses `defaultDuration`, `setup`, a victory-condition block (shape varies per Mission, e.g. `openBattleRules`/`targetedConfrontationRules` for Confrontation, `captureRules`/`victory` for Defense), `recommendedSecondaries` (array of Secondary names), and `campaignNotes`. The 18 Secondary Objectives (`08_secondary_objectives.json`) are grouped into the source's own six thematic categories (`treasureAndDiscovery`, `rescueAndRelationships`, etc.) plus a `narrativeSecondaries` array for the one GM-judged entry (Eliminate Officer); each Secondary uses `{id, name, setup, objective, rules, completion, opposition, campaignNotes}`.
- A `crossCheck` note in `08_secondary_objectives.json` confirms every `recommendedSecondaries` entry across all 6 Primary Mission files resolves to an actual defined Secondary — no dangling references — while also noting that S14 (Contain Threat) and S18 (Seal Breach) aren't recommended by any Primary, treated as a non-issue since the recommended lists are explicitly non-exhaustive.
- A `knownIssues` entry in `missions/index.json` (and in `matched_play/04_mp3_breakthrough.json`) flags that Matched Play Mission MP3 "Breakthrough" shares its name with Doctrine 16 "Breakthrough" despite being unrelated mechanics.

### Campaign-specific conventions (`campaign/`)

- This folder covers the nine card/data-driven appendices of the Campaign chapter (Appendices A–I) plus three further data/reference appendices (L, M, O). The core campaign rules file and the remaining procedural appendices (J, K, N, P, Q: Component Inventory and Setup, Campaign Examples, Campaign Council and Turn Procedure, Legacy Captains and Hero Conversion, Campaign Records/Tracking Sheets) were intentionally left as Markdown-only, per the user's scoping decision — `campaign/index.json` documents this boundary explicitly.
- `01_company_order_cards.json` (Appendix A): the seven numbered Company Orders (`orders` array) each use `{number, name, role, normalAction, supremacy, restrictions}`; Order 3 (Develop) nests its Minor/Major Project sub-tables under `normalAction`. `orderReferenceCards` mirrors the source's own condensed summary table.
- `02_grand_faction_maneuver_cards.json` (Appendix B): covers deck construction, the political "trick" procedure (Following/Pivoting/Leading Off-Suit), Local Influence, winner determination with tie-breaking order, the four suits' common basic actions, the five Grand Factions' full 12-card decks (`grandFactionDecks.decks`), the independent-faction AI decision procedure, Council Influence/Political Mandates, preparation/future objectives, a worked trick example, and the faction card quick reference table.
- `03_act_agendas.json` (Appendix C): one entry per Act (I–IV), each with 3 Agendas using `{id, name, theme, campaignSituation, suggestedConflicts, victoryBenefit|victoryConsequence}` (Acts I–III use `victoryBenefit`; Act IV — whose rewards apply to the campaign epilogue rather than the next Act — uses `victoryConsequence`), plus the consolidated `actAgendaReference` table.
- `04_general_political_tasks.json` (Appendix D) and `05_grand_faction_political_tasks.json` (Appendix E): both use the same per-Task shape (`{id, name, suit, eligibleTarget, companyOrders/eligibleCompanyOrders, stakeObjective, materialConsequence}`), varying only in their classification-specific field (`npcEligibility`/`claimantRequirement` for Open, `requiredSponsor` for Sponsored, `exclusiveBeneficiary` for Exclusive). Appendix E's 30 faction Tasks are grouped under a `factions` array (one block per Grand Faction, 6 Tasks each); both files end with their own ID/name/category/suit reference table.
- `06_neutral_opportunities.json` (Appendix F): `treasuryOpportunities` (4 cards, uniform 2-Gold-per-PC payout) and `specialOpportunities` (8 unique cards, each with a `specialReward: {name, effect}` and a `persistentResult`), plus the campaign-scaling Treasury/Special-per-Act table and the consolidated quick reference.
- `07_exploration_and_discoveries.json` (Appendix G): the exploration procedure (Site selection through Discovery depletion/ownership rules) followed by all 12 Discovery cards (`discoveryCards.cards`), each `{id, name, discoveryType, flavor, reward, notes}`; several cards (Ancient Observatory, Guardian's Rest) carry extra fields (`revealOptions`, etc.) for their more elaborate source text.
- `08_development_rewards.json` (Appendix H): the 18-card deck composition table, all 7 Development cards with both a `companyEffect` and an `npcEquivalent` (reflecting the source's explicit PC/NPC dual resolution via support credits rather than a separate NPC Gold treasury), and the NPC-specific sub-rules (named support/military recovery, construction credits, unusable rewards).
- `09_grand_faction_charters.json` (Appendix I): general Charter rules (receiving a Charter, passives, shared Charter commands and their default properties) followed by all 5 Charters (`charters` array), each `{faction, charterName, companyIdentity, passive, sharedCommand, strategicCharacter}`, plus the charter command reference table and a worked example.
- `10_quick_reference_sheets.json` (Appendix L): 17 condensed reference sections (`L1`–`L17`) covering campaign length/turn structure, Company Order and Develop Project quick tables, Hero Point/XP/deployment-limit tables, Gold income, formation cost/recovery, territory/resource/improvement summaries, Political Stake and NPC Maneuver quick references, the Principal Opposition's slot/CP tables, the GM campaign checklist, Battlefield Edge quick reference, and PC detachment/Charter slot progression — these largely restate fuller rules from other appendices in condensed form, so a `knownIssues` entry notes it assumes the Foundation Recruitment Slot letters (H/C/E/R/V/S/A) are already defined in `doctrines/00_general_rules.json`.
- `11_optional_dice_tables.json` (Appendix M): optional dice-based replacements (`M1`–`M13`) for randomized campaign card draws — the Exact Positional 2D6 method (`R = 6×(A−1)+B`) and its uniform-index formula, acceptance-limit tables for drawing without replacement, and per-component application to Act Agendas, Political Task pools, Neutral Opportunity scheduling, Discovery draws, and Development reward draws (both exact and "quick" 2D6-sum variants), plus a "when not to roll" table of decisions that remain intentional (not randomized) choices. A `knownIssues`/`designNotes` entry (in both this file and `campaign/index.json`) flags that M.5's Act Agenda names don't match the Agenda names transcribed from Appendix C in `03_act_agendas.json` — both are faithful transcriptions of inconsistent source material, not resolved here.
- `12_tri_hex_atlas_and_territorial_development.json` (Appendix O — the strategic **map**): sections `O1`–`O16` covering the Tri-Hex structure (H/A/B hex designations), map sizes by campaign format, all 5 Capital tiles (one per Grand Faction), all 3 Developed Frontier tiles and all 3 Wild Frontier tiles (11 tiles total, matching the "eleven available Tri-Hex tiles" the appendix advertises), Local Authorities, political control/Provinces/dividends, Political Influence markers, regional resources (Stone/Supply/Influence) and access rules, Roads/Bridges/Ports, the 9-entry Strategic Improvements table with per-Improvement rules, construction/territorial requirements, Exploration Sites, the Map Setup Procedure, a worked Stonebridge Development example, and the Map Rules Quick Reference table. Each tile uses a uniform `{id, name/classification, grandFaction/localAuthority, theme, hexes: [{hex, location, resources, startingControl, explorationSite?}], ...}` shape.
- **Design note:** the five "Grand Factions" used throughout Appendices B, E, I, and O (Unbound, Conclave, Wayfarers, Legions, Concord) are a distinct campaign-layer concept from the twelve army-list factions in `factions/` (Free Realms, Iron Holds, etc.) — not a naming collision, just two separate rosters operating at different scales. This is documented in `campaign/index.json`'s `designNotes`.
