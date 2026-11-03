# NON-FACTION DOCTRINES

## Consolidated Rules — Playtest Draft v5

### General Rules

Non-Faction Doctrines represent the military strategies, tactics, and battlefield philosophies available to different armies.

In **2,000-point matched play**, each army selects two distinct Doctrines. Every faction may choose **any** two; Favored and Compatible labels are recommendations, not restrictions. Other army formats may use different numbers of Doctrines or none at all.

Each Doctrine grants one Foundation Recruitment Slot and provides five Command options. The player selects three Commands from each chosen Doctrine, gaining the Recruitment Slot listed beside each selected Command.

A Doctrine Command may affect any eligible Unit unless its effect specifies otherwise. Recruitment Slots determine army composition; they do not restrict who may benefit from a Command.

### Command Usage

In standard **2,000-point** matched play, the six selected Doctrine Commands and two selected Faction Commands together form an **eight-card repertoire**. CP and card exhaustion are **the same expenditure**, not cumulative costs: a printed Doctrine Command costs its listed CP and exhausts its selected card, while an eligible Unit Command instead exhausts an available selected card as the physical marker of the CP spent. A 2 CP Command requires two available cards but resolves only once. A 0 CP ability exhausts none. All exhausted cards and CP refresh at the beginning of the next Round. The full repertoire remains available, representing **8 CP for the matched-play army per Round**; there is no separate two-card preparation step.

- Each selected Command costs 1 CP unless otherwise stated. A selected card cannot be used again until refreshed.
- Phase Commands are activated while the controlling side has **activation priority** during the indicated Movement, Assault, or Combat Phase. Personal Unit Commands instead occur during that Unit's own activation.
- Reactions are used at their specified triggers regardless of activation priority. End Step Commands use their explicitly printed timing.
- Commands do not grant additional Unit activations or Attacks unless explicitly stated.
- Bonuses to Attacks add dice to **one Attack made by the entire Unit**, not to each Model, unless explicitly written **per Model**. Unit-wide Accurate, Critical, Tough, Cover, and Brace ranks do not multiply by Model count; compatible additional ranks are additive.
- An effect applying to one Attack expires when that Attack is fully resolved.
- Effects lasting a Phase expire at the end of that Phase.
- Effects lasting a Round expire during that Round's End Step.
- An effect referring to a Unit's next Attack or activation remains available until that event occurs or its stated duration expires.
- Multiple applications of the same Command do not stack on one Unit.

**RPG/campaign exception:** A campaign party may have 2 abstract CP per player and **no physical cards at all**. The eight-card Doctrine repertoire is a matched-play army-construction feature, not a prerequisite for personal Commands. The controlling GM uses the encounter-specific allocation (normally max(2, 2 × number of PCs − 1)).

### Movement and Positioning

Charge X: Add X inches to the final Charge distance after rolling. Standard Units roll 2D6, add the results, and compare the total (plus X) to the distance needed to Engage; the Unit's Move is not added. The highest die still sets base Charge Impact. Charge X does not modify the dice themselves or the Charge's Impact. Multiple Charge X effects do not stack; use the highest value. The normal 12" maximum distance for declaring a Charge still applies.

Blink X: An unengaged Unit may reposition up to X inches without traversing intervening terrain, subject to normal elevation restrictions. For multi-model Units, move a lead Model up to X inches from its original position, then place each remaining Model no more than X inches from its own original position while maintaining Coherency. Every Model must end legally, and no Model may finish Engaged. Blink is not a Charge.

Holding Position: Where an ability requires a Unit to have remained in position, its wording specifies the applicable period. A Unit that voluntarily Moved, Disengaged, Charged, or Blinked during that period does not qualify. Enemy-forced movement does not count unless specifically stated.

No separate Stationary keyword is used.

### Defensive Effects

Accurate X: Reroll up to X natural 1s during a Hit roll.

Tough X: Reroll up to X natural 1s during an Armor Save roll.

Brace X: Subtract X from the total **automatic Charge Impact Hits** suffered by the defender, to a minimum of zero. Brace does **not** grant retaliatory Attack dice.

Hit Cancellation: When an ability discards a successful non-6 Hit die, resolve it after Hit rerolls but before saves. Natural 6s, automatic Hits, and Charge Impact cannot be discarded this way.

Attack Reduction: When an ability removes an Attack die, remove it before the Hit roll. An Attack cannot be reduced below one die unless an ability explicitly allows it.

### Surges and Blunders

A normal Skill Check or Charge roll generates at most one Surge (two or more natural 6s) and one Blunder (two or more natural 1s), determined after rerolls, unless specified otherwise. An **Attack roll** generates **one Surge per complete pair** of natural 6s and one Blunder per complete pair of natural 1s. An effect phrased "when this Attack Surges" normally triggers once per Attack; "for each Surge" explicitly scales.

Reckless Roll: A roll designated Reckless cannot benefit from any rerolls. Its Surges and Blunders resolve normally, and any listed Gambit Blunder consequence applies in addition to other applicable effects.

### Recruitment Slots

| Slot | Recruitment Category    |
| ---- | ----------------------- |
| H    | Headquarters (including non-Hero Captains) |
| C    | Generic Line Infantry or designated faction Core |
| E    | Elite                   |
| R    | Ranged Infantry         |
| V    | Vanguard / Cavalry      |
| S    | Generic non-Elite Support or faction Wizard / Support |
| A    | Large Asset / Artillery |

All existing recruitment limits, Hero caps, Asset caps, and faction-specific Core classifications remain unchanged.



---



# 1. Combined Arms

Foundation Recruitment Slot: C

Strategy: Coordinate different battlefield roles to improve the performance of ordinary troops, specialists, and supporting formations.

| Command            | Slot | Timing          | Effect                                                                                                                                                                                           |
| ------------------ | ---- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Screen and Advance | V    | Movement        | Choose one friendly Unit within 2" of a different friendly Unit. It gains +2" Move on its next normal Move this Round. This bonus cannot be used for a Charge.                                   |
| Crossfire          | R    | Assault         | One friendly Unit gains Accurate 2 and Pinpoint on its next ranged Attack against an enemy already attacked by a different friendly Unit this Round.                                             |
| Coordinated Orders | H    | Movement        | Choose two different friendly Units within Short of the same friendly Headquarters. Remove one temporary Hit or Move penalty from one. The other gains Accurate 1 on its next Attack this Round. |
| Interlocking Lines | E    | Combat Reaction | When a friendly Unit within 2" of a different friendly Unit is attacked in Engagement, the defender gains Tough 2 against that Attack.                                                           |
| Forward Observers  | A    | Assault         | One friendly Unit gains Accurate 1 and **reduces the target's effective Cover X by 1 (minimum 0)** on its next ranged Attack this Phase, provided a different friendly Unit can see the target.                             |

Doctrine Identity: Cooperation between multiple Units.

Combined Arms rewards keeping formations close enough to support each other without requiring specific recruitment categories.



---



# 2. Objective Play

Foundation Recruitment Slot: C

Strategy: Capture, contest, and maintain control of valuable battlefield positions.

| Command            | Slot | Timing                  | Effect                                                                                                                                                                                                        |
| ------------------ | ---- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Seize the Opening  | V    | Movement                | One unengaged friendly Unit within Short of an objective may immediately Move up to 2" toward that objective, ending legally and unengaged.                                                                   |
| Dig In             | C    | Assault/Combat Reaction | When a friendly Unit within 2" of an objective is attacked, it gains Tough 2 against that Attack. If the Attack is a Charge, also gain **Brace 1 before resolving Impact**.                                     |
| Deny the Ground    | R    | Assault                 | If one friendly Unit inflicts unsaved Damage with a ranged Attack against an enemy within 2" of an objective, that enemy cannot count as more than one Unit for objective control until the end of the Round. |
| Supply Point       | S    | Movement                | Choose one friendly Unit within 2" of an objective. Either Heal 2 accumulated Damage from it or remove Withdrawn from it.                                                                                     |
| Clear the Position | A    | Assault/Combat          | One friendly Unit gains +2 Attacks on its next Attack this Phase against an enemy contesting an objective.                                                                                                    |

Doctrine Identity: Scenario scoring and battlefield positioning.

Objective Play does not need to be particularly effective at destroying enemies, provided its commands create meaningful opportunities to score or deny Victory Points.



---



# 3. Elite

Foundation Recruitment Slot: E

Strategy: Achieve superior performance through disciplined attacks, careful execution, and technical proficiency.

| Command           | Slot | Timing                  | Effect                                                                                                                                                                                  |
| ----------------- | ---- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Veteran Spearhead | E    | Combat                  | One friendly Unit gains +1 Attack and Accurate 2 on its next Engagement Attack this Phase.                                                                                              |
| Find the Opening  | H    | Assault/Combat          | Choose one visible enemy Unit. Worsen its Evade by one step against the next friendly Attack targeting it this Phase. If the target has no Evade, that Attack gains Accurate 1 instead. |
| Perfect Technique | E    | Assault/Combat Reaction | After one friendly Unit rolls to Hit, reroll up to two failed Hit dice. Dice already rerolled cannot be selected.                                                                       |
| Combat Training   | S    | Movement                | Choose one friendly Unit. Its next Attack this Round gains Accurate 2 and ignores one step of Hit worsening caused by a temporary condition.                                            |
| Knightly Order    | V    | Assault                 | One friendly Unit gains Charge 1 on its next Charge this Phase. If the Charge succeeds, its first Engagement Attack against that enemy this Round gains Accurate 2.                     |

Doctrine Identity: Reliable, high-quality combat performance.

Elite emphasizes making existing Attacks more effective. Alpha Strike produces larger opening attacks, while Counter Strike and Castling provide more dedicated defensive tools.



---



# 4. Counter Strike

Foundation Recruitment Slot: S

Strategy: Respond to enemy aggression through timely defense and retaliation.

| Command              | Slot | Timing                  | Effect                                                                                                                                                                              |
| -------------------- | ---- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Measured Retaliation | E    | Combat Reaction         | After a friendly Unit survives an enemy Engagement Attack, its next Engagement Attack against that attacker gains +2 Attacks. The benefit expires after its next Combat activation. |
| Parry and Return     | C    | Combat Reaction         | One friendly Unit gains Tough 2 against an incoming Engagement Attack. If it suffers no unsaved Damage, its next Engagement Attack against that attacker gains Accurate 1.          |
| Countermand          | H    | Assault/Combat Reaction | When an enemy attacks a friendly Unit within Short of friendly Headquarters, discard one successful non-6 Hit die from that Attack after Hit rerolls and before saves.              |
| Return Volley        | R    | Assault Reaction        | After a friendly Unit survives a ranged Attack, its next ranged Attack against the attacker gains Accurate 2 and Pinpoint. The effect expires after its next Assault activation.    |
| Emergency Screen     | A    | Assault/Combat Reaction | When a friendly Unit within 2" of a different friendly Unit is attacked, reduce the incoming Attack by one Attack die, minimum one, before rolling to Hit.                          |

Doctrine Identity: Defensive reactions followed by opportunities to retaliate.

Unlike Castling, Counter Strike does not require advance preparation or holding a position.



---



# 5. Castling

Foundation Recruitment Slot: C

Strategy: Establish defensive formations, prepared firing positions, and mutually supporting strongpoints.

| Command               | Slot | Timing           | Effect                                                                                                                                                                                                                |
| --------------------- | ---- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hold Formation        | H    | Combat           | Choose one friendly Unit that has not voluntarily Moved, Disengaged, Charged, or Blinked this Round. It gains Tough 2 until the end of the Combat Phase.                                                              |
| Layered Defense       | C    | Assault Reaction | When a friendly Unit that did not voluntarily Move or Disengage during the preceding Movement Phase receives a Charge, it gains **Brace 2 against that Charge's Impact pool**. |
| Fortified Emplacement | A    | Assault Reaction | When a friendly Unit that has not voluntarily Moved or Blinked this Round is attacked at range, it gains Tough 3 against that Attack.                                                                                 |
| Prepared Firing Lanes | R    | Assault          | One friendly Unit that has not voluntarily Moved, Disengaged, or Blinked this Round gains Accurate 2 and +1 Attack on its next ranged Attack against an enemy that Moved this Round.                                  |
| Maintain Positions    | S    | Movement         | Choose one friendly Unit. Remove Withdrawn, Slow, or one temporary Hit penalty from it. If it has not voluntarily Moved or Blinked this Round, it also gains Brace 1 against the next Charge it receives this Round.  |

Doctrine Identity: Defensive preparation and positional advantage.

Castling is more predictable than Counter Strike but requires giving up movement or anticipating an enemy's approach.



---



# 6. Firing Line

Foundation Recruitment Slot: R

Strategy: Maintain ranged superiority through coordinated shooting, accuracy, and fire discipline.

| Command              | Slot | Timing           | Effect                                                                                                                                                                             |
| -------------------- | ---- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Concentrated Fire    | R    | Assault          | One friendly Unit that has not voluntarily Moved, Disengaged, or Blinked this Round gains +2 Attacks on its next ranged Attack this Phase.                                         |
| Marked Fire Lane     | R    | Assault          | One friendly Unit gains Pinpoint and Accurate 2 on its next ranged Attack this Phase.                                                                                              |
| Artillery Correction | A    | Assault          | One friendly Unit making a Heavy ranged Attack gains Accurate 2 and **reduces the target's effective Cover X by 1 (minimum 0)** against its target.                                                           |
| Veteran Gunners      | E    | Assault          | One friendly Unit gains +1 Attack and Accurate 1 on its next ranged Attack against an enemy that was already attacked at range by a different friendly Unit this Round.            |
| Screening Fire       | V    | Assault Reaction | When an enemy within range of a friendly Unit's ranged weapon declares a Charge, the enemy worsens Hit by one step on its first Engagement Attack during the ensuing Combat Phase. |

Doctrine Identity: Offensive ranged combat.

Firing Line is especially effective with conventional archers, gun lines, and artillery but remains usable by any Unit possessing a ranged weapon.



---



# 7. Mobility

Foundation Recruitment Slot: V

Strategy: Gain positional advantages through movement, evasion, and battlefield maneuvering.

| Command             | Slot | Timing   | Effect                                                                                                                                                                              |
| ------------------- | ---- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Flanking Run        | V    | Movement | One friendly Unit gains +3" Move and ignores the first 2" of Difficult Terrain during its next normal Move this Round.                                                              |
| Mobile Fire Support | R    | Movement | One friendly Unit may use a Heavy ranged Attack after moving during the preceding Movement Phase, worsening Hit by one step. Applies to its next eligible ranged Attack this Round. |
| Rapid Footwork      | C    | Movement | One unengaged friendly Unit may immediately Move up to 2", ending legally and unengaged.                                                                                            |
| Evasive Shift       | E    | Movement | One unengaged friendly Unit immediately resolves Blink 2.                                                                                                                           |
| Pathfinders         | S    | Movement | One friendly Unit ignores Difficult Terrain penalties on its next normal Move this Round and gains Tough 1 against its next ranged Attack this Round.                               |

Doctrine Identity: Independent maneuverability and flexible positioning.

Mobility improves movement without generally making Charges more damaging.



---



# 8. Control

Foundation Recruitment Slot: S

Strategy: Restrict enemy actions, interfere with movement, and suppress tactical advantages.

| Command          | Slot | Timing                  | Effect                                                                                                                                                                                             |
| ---------------- | ---- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lockdown         | C    | Assault Reaction        | When an enemy within Medium of a friendly Unit declares a Charge, reduce its final Charge distance by 1", minimum 0". Charge Impact is unchanged.                                                  |
| Interdiction     | V    | Movement Reaction       | When an enemy begins a normal Move within Short of a friendly Unit, reduce its Move distance by 2", minimum 1".                                                                                    |
| Disrupt Orders   | H    | Assault/Combat Reaction | When an enemy within Medium of friendly Headquarters receives an Attack bonus, remove Accurate 1 from that Attack. If it has no Accurate bonus, reduce its bonus Attacks by one die instead.       |
| Suppressing Fire | R    | Assault                 | If one friendly Unit inflicts unsaved Damage with its next ranged Attack this Phase, the target suffers Slow 2 and cannot receive positive Move bonuses from Commands during its next normal Move. |
| Jamming Field    | A    | Assault                 | Choose one enemy within Short of a friendly Unit. That enemy cannot use Reactions against the next Attack it suffers this Phase.                                                                   |

Doctrine Identity: Reducing the opponent's tactical options.

Control focuses on denying movement and effective responses rather than dealing additional damage.



---



# 9. Alpha Strike

Foundation Recruitment Slot: V

Strategy: Deliver powerful opening attacks and exploit the first moments of an Engagement.

| Command             | Slot | Timing  | Effect                                                                                                                                                   |
| ------------------- | ---- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First Strike Orders | H    | Assault | One friendly Unit within Short of friendly Headquarters gains Accurate 2 on its next Attack against an enemy it has not previously attacked this battle. |
| Opening Volley      | R    | Assault | One friendly Unit gains +3 Attacks on its first ranged Attack of the battle.                                                                             |
| Shock Assault       | E    | Combat  | One friendly Unit that Charged this Round gains +2 Attacks on its first Engagement Attack this Combat Phase.                                             |
| Opening Barrage     | A    | Assault | One friendly Unit gains +2 Attacks on its first Attack against a target it has not previously attacked this battle.                                      |
| Ferocious Opening   | C    | Combat  | One friendly Unit gains Accurate 2 and Critical 1 on its first Engagement Attack against a target it has not previously attacked this battle.            |

Doctrine Identity: Front-loaded damage and decisive first contact.

Alpha Strike is less effective during prolonged engagements because many of its bonuses depend on making initial attacks.



---



# 10. Horde

Foundation Recruitment Slot: C

Strategy: Use large formations, overlapping engagements, and numerical superiority.

A formation containing four or more surviving Models qualifies for the standard numerical requirements of this doctrine.

| Command           | Slot | Timing                  | Effect                                                                                                                                                                                                              |
| ----------------- | ---- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Endless Ranks     | C    | Movement                | One friendly Unit with at least four surviving Models counts as one additional Unit for objective control until the end of the Round.                                                                               |
| Massed Volley     | R    | Assault                 | One friendly Unit with at least four surviving Models gains +2 Attacks on its next ranged Attack this Phase. If another friendly Unit with at least four surviving Models is within Short, gain +3 Attacks instead. |
| Mob Tactics       | E    | Combat                  | One friendly Unit gains +2 Attacks on its next Engagement Attack against an enemy also Engaged by a different friendly Unit with at least four surviving Models.                                                    |
| Pack Coordination | S    | Assault/Combat Reaction | When a friendly Unit within Short of another friendly Unit with at least four surviving Models is attacked, it gains Tough 2 against that Attack.                                                                   |
| Encirclement      | V    | Combat                  | One friendly Unit attacking an enemy also Engaged by a different friendly Unit with at least four surviving Models causes that enemy to worsen Evade by one step against the Attack.                                |

Doctrine Identity: Numerical advantage and coordinated formations.

Standard generic Line Infantry and Ranged Infantry qualify without reinforcement. Larger hordes remain more reliable because they retain their model-count requirements after suffering casualties.



---



# 11. Grinding

Foundation Recruitment Slot: C

Strategy: Outlast opponents through endurance, attrition, battlefield repairs, and reorganizing damaged forces.

Grinding combines the former Grinding and Recursion doctrines. Its commands may emphasize either surviving prolonged engagements or becoming increasingly effective as the battle continues.

| Command             | Slot | Timing         | Effect                                                                                                                                                                                                                    |
| ------------------- | ---- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unbroken Line       | C    | Reaction       | When a friendly Unit that has already suffered an Attack this Phase is attacked again, it gains Tough 2 against the incoming Attack.                                                                                      |
| Wear Them Down      | H    | Combat         | Choose one enemy Engaged with a friendly Unit that was already attacked by a different friendly Unit this Round. Reduce its next Engagement Attack by one Attack die, minimum one, before the end of its next activation. |
| Reform and Recover  | S    | Movement       | Choose one friendly Unit. Either Heal 2 accumulated Damage from it, or remove Withdrawn and one temporary Hit, Move, or Evade penalty from it. Defeated Models are not restored.                                          |
| Attrition Engine    | A    | Assault/Combat | One friendly Unit gains Accurate 2 on its next Attack against an enemy that has already suffered unsaved Damage from a different friendly Unit this Round.                                                                |
| Relentless Veterans | E    | Combat         | One friendly Unit gains Accurate 2 and Critical 1 on its next Engagement Attack against an enemy it attacked during an earlier Round.                                                                                     |

### Doctrine Identity

Grinding focuses on endurance and cumulative advantage.

Its commands support three approaches:

- Endurance: Unbroken Line and Reform and Recover help Units withstand damage and maintain effectiveness.
- Attrition: Wear Them Down and Attrition Engine reward applying sustained pressure to enemy formations.
- Prolonged Engagements: Relentless Veterans improves a Unit's performance against opponents it has already fought.

A player can lean toward defensive durability, offensive attrition, or a combination of both depending on which three Commands are selected.

Grinding does not restore defeated Models or Units. Those effects remain available through faction-specific abilities and other exceptional rules.

### Distinction from Other Doctrines

- Castling: Rewards holding defensive positions and preparing for attacks.
- Counter Strike: Rewards reactions and retaliation against enemy attacks.
- Grinding: Rewards enduring damage, reorganizing forces, and repeatedly engaging the same enemies.
- Horde: Rewards maintaining large formations and overwhelming enemies numerically.





---



# 12. Deep Strike

Foundation Recruitment Slot: S

Strategy: Deploy reserve formations into unexpected battlefield positions, launch flanking attacks, and establish forward landing zones.

Deep Strike provides alternative deployment opportunities rather than simply granting additional normal movement.

## Deep Strike Deployment

### Deep Strike Reserve

During initial deployment, an army with Deep Strike may designate purchased Units as Deep Strike Reserves **within the normal Reserves limit** described in Structured Combat. Deep Strike does not grant an additional Reserve allowance.

These Units:

- Count toward the normal combined Reserve Point Value limit.
- Are included in the army's normal Points, Recruitment Slot, and composition limits.
- Begin the battle off the battlefield.
- Cannot perform actions or use abilities while in Reserve unless explicitly permitted.
- May enter the battlefield through selected Deep Strike Commands beginning in Round 2.

At least one Headquarters Unit must deploy normally.

Large Assets may enter Deep Strike Reserve only if the army has selected a Command that explicitly permits their deployment.

### Arriving from Deep Strike Reserve

When a Command deploys a Unit from Deep Strike Reserve:

1. Select an eligible purchased Unit in Deep Strike Reserve.
2. Activate it during the Movement Phase.
3. Spend the Command's listed CP (represented by exhausting its selected card in matched play).
4. Place its Models in the location permitted by the Command.
5. The Unit's Movement activation ends.

Unless a Command says otherwise, the arriving Unit must be placed:

- Wholly more than 9" from every enemy Model.
- Outside the enemy deployment zone.
- In legal positions with normal Unit coherency.
- Without becoming Engaged.

### Arrival Restrictions

A Unit arriving through Deep Strike:

- Counts as having voluntarily Moved during that Movement Phase.
- Cannot make additional Moves, Charge, Disengage, or Blink during the Round in which it arrives.
- Cannot control or contest objectives until the following Round.
- May make otherwise eligible ranged or Spell Attacks during the Assault Phase.
- Cannot use a Heavy Attack that requires it not to have Moved, unless an ability explicitly permits otherwise.

Only one Unit may arrive through Deep Strike Commands per Round.

An army is not required to place any Units in Deep Strike Reserve.

If a legal position is unavailable, the Unit cannot be deployed using that Command and remains in Reserve. An illegal placement cannot be declared.



---



## Deep Strike Commands

| Command            | Slot | Timing   | Effect                                                                                                                                                                                                                                                                             |
| ------------------ | ---- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Forward Insertion  | C    | Movement | Deploy one eligible Unit from Deep Strike Reserve using the normal Deep Strike placement rules. It may be placed anywhere on the battlefield that satisfies those rules.                                                                                                           |
| Landing Fire       | R    | Assault  | One friendly Unit that arrived through Deep Strike this Round gains Accurate 2 and Pinpoint on its next ranged Attack this Phase. This Command does not override Heavy restrictions.                                                                                               |
| Flanking Insertion | V    | Movement | Deploy one eligible Unit from Deep Strike Reserve wholly within 3" of any battlefield edge and more than 6" from every enemy Model. It may enter the enemy deployment zone. All other arrival restrictions apply.                                                                  |
| Heavy Descent      | A    | Movement | Deploy one eligible Unit, including a Large Asset, from Deep Strike Reserve using the normal Deep Strike placement rules. The Unit gains Tough 2 against the first Attack it suffers before the beginning of its next Movement activation.                                         |
| Signal Beacon      | H    | Movement | Choose one friendly Unit already on the battlefield. During this Movement Phase, the next friendly Unit arriving through Deep Strike within Short of that Unit may be placed more than 6" from enemy Models instead of 9". It must still satisfy all other placement restrictions. |

### Command Clarifications

Forward Insertion: Provides the basic ability to deploy purchased reserve Units into the center of the battlefield or another legal forward position.

Landing Fire: Improves ranged attacks by recently deployed Units. It is usable by any arriving Unit with an eligible ranged weapon, not only Ranged Infantry.

Flanking Insertion: Allows Units to appear behind or beside enemy formations, but requires placement near the battlefield edge. It is particularly useful for threatening exposed support Units.

Heavy Descent: Allows a Large Asset to arrive through Deep Strike and provides temporary protection for the arriving Unit. It does not allow the Unit to bypass movement restrictions on Heavy weapons.

Signal Beacon: Rewards first establishing a forward presence before inserting reinforcements nearby. It must be activated before the deployment it modifies.

Signal Beacon does not deploy a Unit itself; another selected Deep Strike Command must perform the deployment.

### Doctrine Identity

Deep Strike focuses on reinforcements, deployment flexibility, and unexpected battlefield positioning.

It gives up the immediate battlefield presence of reserve Units in exchange for the ability to introduce them at important locations later in the battle.

Unlike ordinary movement abilities, Deep Strike permits Units to arrive from off the battlefield and bypass the intervening distance and terrain.

### Distinction from Other Doctrines

- Mobility: Improves the movement of Units already on the battlefield.
- Slingshot: Uses friendly Units to create additional movement opportunities.
- Alpha Strike: Enhances attacks during first contact.
- Deep Strike: Changes where and when purchased Units enter the battle.





---



# 13. Slingshot

Foundation Recruitment Slot: V

Strategy: Use one formation to create movement or attack opportunities for another formation.

| Command             | Slot | Timing           | Effect                                                                                                                                                                                    |
| ------------------- | ---- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anchor and Launch   | C    | Movement         | Choose one friendly Unit that has not voluntarily Moved or Blinked this Round. A different unengaged friendly Unit within 2" may immediately Move up to 3", ending legally and unengaged. |
| Exploit the Opening | E    | Combat           | If a different friendly Unit inflicted unsaved Damage on the target this Round, one friendly Unit gains Critical 1 on its next Engagement Attack against that target this Round.          |
| Create the Gap      | R    | Assault Reaction | After a friendly Unit inflicts unsaved Damage with a ranged Attack, a different unengaged friendly Unit within Short of the enemy may immediately Move up to 2", ending unengaged.        |
| Launch Platform     | A    | Movement         | One unengaged friendly Unit within 2" of a friendly Asset immediately resolves Blink 2.                                                                                                   |
| Relay Maneuver      | S    | Movement         | Choose one friendly Unit. A different unengaged friendly Unit within Short of it immediately resolves Blink 3.                                                                            |

Doctrine Identity: Sequential cooperation and transferring tactical opportunities between Units.

Unlike Mobility, Slingshot typically requires two different friendly Units working together.



---



# 14. Gambit

Foundation Recruitment Slot: C

Strategy: Accept dangerous, unreliable outcomes in exchange for powerful attacks, desperate defense, and risky maneuvers.

Gambit uses Reckless Rolls, additional dice, and unusually consequential failures.

| Command            | Slot | Timing                  | Effect                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------ | ---- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Double Down        | C    | Assault/Combat Reaction | When a friendly Unit makes Armor Saves against one Attack, roll twice the normal number of Armor Save dice. Each successful Save cancels one Hit normally, to a maximum of the incoming Hits. Excess successful Saves have no effect. These dice cannot be rerolled. Backlash: After resolving the Attack, suffer 1 unpreventable Damage for each natural 1 rolled.                             |
| Risky Calculations | S    | Assault                 | One friendly Unit gains +2 Attacks on its next ranged or Spell Attack this Phase. Its Hit roll is Reckless. Blunder: The attacking Unit suffers Direct Damage 1.                                                                                                                                                                                                                                |
| No Quarter         | E    | Combat                  | One friendly Unit gains +1 Attack and Critical 2 on its next Engagement Attack this Phase. Its Hit roll is Reckless. Blunder: The Unit cannot use Reactions for the remainder of the Round.                                                                                                                                                                                                     |
| Expend the Reserve | A    | Assault/Combat          | One friendly Unit gains +3 Attacks on its next Attack this Phase. Its Hit roll is Reckless. Blunder: The Unit suffers Direct Damage 2.                                                                                                                                                                                                                                                          |
| All or Nothing     | V    | Assault                 | Declare a Charge against an eligible enemy at least 6" away. Gain Charge 1 and Impact +1 for that Charge. If the Charge succeeds, resolve it normally. If it fails, the Unit must move its modified rolled Charge distance toward the target as far as legally possible, stopping without becoming Engaged, and then suffers 1 unpreventable Damage. Normal Charge Blunder effects still apply. |

### Double Down Clarification

Double Down does not roll pairs and keep the highest. All additional dice contribute to a single Armor Save pool.

For example, if an Attack produces three Hits, the defender rolls six Armor Save dice. Up to three successful Saves cancel the three Hits. Every natural 1 among all six dice causes 1 unpreventable Backlash Damage after the Attack is resolved.

Backlash applies to every natural 1, not merely when the roll generates a normal Blunder.

### All or Nothing Clarification

The declared target must be an otherwise legal Charge target, within the normal 12" declaration limit and at least 6" away.

If the Charge fails because of insufficient distance or an illegal path, move along a legal path toward the target as far as the modified Charge distance permits without entering Engagement. If no legal movement is possible, the Unit remains in place and still suffers the failed-Charge Damage.

The failed movement does not generate Charge Impact.

Doctrine Identity: High-risk, high-reward dice manipulation.

Unlike Alpha Strike, Gambit accepts substantial uncertainty. Unlike Breakthrough, its Charge enhancement can leave the attacking Unit stranded and damaged.



---



# 15. Heavy Support

Foundation Recruitment Slot: A

Strategy: Coordinate powerful battlefield assets, artillery, heavy attacks, and conventional forces providing support.

| Command          | Slot | Timing   | Effect                                                                                                                                                                                |
| ---------------- | ---- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Armored Advance  | C    | Movement | One friendly Unit gains +2" Move during its next normal Move this Round and Tough 1 against its next ranged Attack this Round.                                                        |
| Fire Control     | H    | Assault  | Choose one visible enemy Unit. The next Attack made against it by each of up to two different friendly Units this Phase gains Accurate 1.                                             |
| Battering Attack | A    | Combat   | One friendly Unit gains +1 Attack, Anti-Armored 1, and Anti-Monster 1 on its next Engagement Attack this Phase. Anti bonuses only apply against their respective target categories.   |
| Shock Support    | V    | Assault  | One friendly Unit gains Charge 1 on its next Charge this Phase. If it begins that Charge within Short of a friendly Large Asset, it gains Charge 2 instead.                           |
| Spotter's Call   | S    | Assault  | One friendly Unit gains Accurate 2 and **reduces the target's effective Cover X by 1 (minimum 0)** on its next ranged Attack this Phase. If the attacker is Artillery or a Large Asset, it also gains +1 Attack. |

Doctrine Identity: Concentrated force and coordination around powerful weapons or battlefield assets.

Heavy Support is useful even without multiple Large Assets, but its additional A slots and selected bonuses reward armies investing in them.



---



# 16. Breakthrough

Foundation Recruitment Slot: V

Strategy: Reach resistant positions, overcome defenders, and maintain pressure after entering Engagement.

| Command            | Slot | Timing          | Effect                                                                                                                                                                                                                      |
| ------------------ | ---- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Breach Guard       | E    | Combat          | One friendly Unit that successfully Charged this Round gains Accurate 2 on its next Engagement Attack against an Armored target. If the target had Brace during that Charge, also gain +1 Attack.                           |
| Momentum Drive     | V    | Assault         | One friendly Unit gains Charge 2 when declaring its next Charge this Phase. Charge Impact is unchanged.                                                                                                                     |
| Siege Breaker      | A    | Assault/Combat  | One friendly Unit gains Anti-[Target Type] 1 on its next Attack against an Armored Unit, Monster, Vehicle, War Machine, or Fortification this Phase. Against a Structure or Fortification, the Attack also gains +1 Damage. |
| Press the Breach   | C    | Combat          | After a friendly Unit inflicts unsaved Damage in Engagement, the target loses one bonus Unit of objective-control counting until the end of the Round, to a minimum of its normal count.                                    |
| Command the Breach | H    | Combat Reaction | When a friendly Unit within Short of friendly Headquarters that successfully Charged this Round is attacked in Engagement, grant it Tough 2 against that Attack.                                                            |

Doctrine Identity: Charge reliability and overcoming defended positions.

Breakthrough differs from Alpha Strike by concentrating on reaching and penetrating targets rather than maximizing immediate Attack volume.



---



# Doctrine Summary

| Doctrine       | Foundation | Primary Strength                         |
| -------------- | ---------- | ---------------------------------------- |
| Combined Arms  | C          | Coordinating different Units             |
| Objective Play | C          | Objectives and scoring                   |
| Elite          | E          | Precision and reliable attacks           |
| Counter Strike | S          | Reactions and retaliation                |
| Castling       | C          | Prepared defensive positions             |
| Firing Line    | R          | Ranged combat                            |
| Mobility       | V          | Independent movement and Blink           |
| Control        | S          | Disruption and denial                    |
| Alpha Strike   | V          | Opening attack power                     |
| Horde          | C          | Numerical superiority                    |
| Grinding       | C          | Endurance and attrition                  |
| Deep Strike    | S          | Unexpected Reserve arrivals and positioning |
| Slingshot      | V          | Sequential unit cooperation              |
| Gambit         | C          | Reckless dice and consequential failures |
| Heavy Support  | A          | Heavy weapons and battlefield assets     |
| Breakthrough   | V          | Charge reliability and penetration       |

## Playtesting Priorities

The following effects should be monitored particularly closely.

Gambit — Double Down: Evaluate its performance against both low-Damage attacks and high-Damage attacks. Backlash is independent of Armor quality, so heavily armored Units may benefit disproportionately.

Gambit — Expend the Reserve: Three additional Attack dice can generate substantial damage with powerful single-model weapons. Its lack of rerolls and Blunder penalty should be evaluated against this upside.

Heavy Support — Fire Control: Two friendly Attacks gaining Accurate 1 may be efficient, particularly when one attacks with a large dice pool.

Breakthrough — Momentum Drive: Charge 2 on standard 2D6 Charges substantially improves reliability while extending their maximum reach. Monitor its effects on the frequency of successful Engagements.

Horde — Massed Volley: Standard four-model generic Ranged Infantry now qualify. Test whether its conditional +3 Attacks creates too much ranged output when paired with inexpensive formations.

Castling — Hold Formation: Tough 2 over an entire Combat Phase can prevent considerable damage if one Unit is attacked multiple times. Compare it against one-Attack defensive Reactions.

General Command Targeting: Most commands are usable by any suitable Unit, regardless of its recruitment category. Monitor whether certain expensive Characters and high-Damage Assets consistently become the optimal recipients of generic offensive buffs.

Draft Status: All sixteen doctrines and eighty selectable commands are included. Existing recruitment-slot distributions are preserved. Numerical balance remains provisional pending tabletop testing.


