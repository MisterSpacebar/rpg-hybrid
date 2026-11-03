# APPENDIX M — OPTIONAL DICE TABLES AND RANDOMIZED CARD SELECTION

## Campaign Mode v4.4 — Consolidated Dice Reference

This appendix provides optional methods for replacing randomized campaign card draws with ordinary six-sided dice.

These methods apply to randomized campaign components such as Agendas, Political Task selection, Neutral Opportunities, Discoveries, and Development rewards.

They do not replace the strategic selection of Company Orders or Faction Maneuver cards.

Players and the GM still choose those cards according to the normal campaign rules.



---



# M.1 Dice Randomization Methods

There are two supported methods.

## Exact Positional 2D6

Use two distinguishable D6 to generate a uniformly distributed result from 1 to 36.

This method can select from a numbered list of up to 36 remaining entries.

It supports exact draws without replacement.

Use this method when preserving the physical deck's depletion and probabilities matters.

## Quick 2D6 Tables

Roll two D6 and add their values.

The result ranges from 2 to 12.

Different sums have different probabilities.

Quick tables deliberately assign more common results to more numerous reward categories.

These tables are convenient but ordinarily represent draws with replacement, unless additional tracking is used.

**Recommended Default:** Use Exact Positional 2D6 for Task selection, Discoveries, and unique cards. Use the Quick Development table when simplified reward generation is preferred.



---



# M.2 Exact Positional 2D6

Use two distinguishable D6.

Designate one die as **A** and the other as **B**.

Roll both dice and calculate:

**R = 6 × (A − 1) + B**

This generates an equally likely integer from 1 to 36.

Every result has an equal **1-in-36** probability.

## M.2.1 Quick Positional Table

| **Die A** | **Die B = 1** | **2** | **3** | **4** | **5** | **6** |
| --------- | ------------- | ----- | ----- | ----- | ----- | ----- |
| 1         | 1             | 2     | 3     | 4     | 5     | 6     |
| 2         | 7             | 8     | 9     | 10    | 11    | 12    |
| 3         | 13            | 14    | 15    | 16    | 17    | 18    |
| 4         | 19            | 20    | 21    | 22    | 23    | 24    |
| 5         | 25            | 26    | 27    | 28    | 29    | 30    |
| 6         | 31            | 32    | 33    | 34    | 35    | 36    |

This is an ordered roll.

Rolling A = 2 and B = 5 produces 11.

Rolling A = 5 and B = 2 produces 26.

The two results are different.



---



# M.3 Drawing from a Numbered List

Suppose a deck or eligible pool contains **N remaining entries**, where N is between 1 and 36.

Number the remaining entries from 1 to N.

Use the following procedure.

## Step 1 — Determine the Acceptance Limit

Calculate the Acceptance Limit:

**L = N × (36 ÷ N, rounded down to a whole number)**

## Step 2 — Roll

Generate R using Exact Positional 2D6.

If R is greater than L, reroll both dice.

## Step 3 — Determine the Selected Entry

Calculate:

**I = 1 + ((R − 1) mod N)**

Select entry I.

Every remaining entry has the same probability of being selected.

## Step 4 — Remove the Selected Entry

For a draw without replacement, remove the selected entry from the numbered list.

Renumber the remaining entries from 1 to N−1.

Use the same procedure for the next draw.

If the draw's rules return the selected entry to the pool, retain it instead.

### Common Acceptance Limits

| **Remaining Entries N** | **Accept Results 1 Through** | **Reroll Results** |
| ----------------------- | ---------------------------- | ------------------ |
| 3                       | 36                           | None               |
| 4                       | 36                           | None               |
| 5                       | 35                           | 36                 |
| 6                       | 36                           | None               |
| 7                       | 35                           | 36                 |
| 8                       | 32                           | 33–36              |
| 9                       | 36                           | None               |
| 10                      | 30                           | 31–36              |
| 11                      | 33                           | 34–36              |
| 12                      | 36                           | None               |
| 13                      | 26                           | 27–36              |
| 14                      | 28                           | 29–36              |
| 15                      | 30                           | 31–36              |
| 16                      | 32                           | 33–36              |
| 17                      | 34                           | 35–36              |
| 18                      | 36                           | None               |

For one or two remaining entries, the same method works without rejection.



---



# M.4 Example — Drawing from Seven Tasks

A Standard Campaign Act uses seven Task cards.

The cards are numbered 1–7.

The acceptance limit is:

**L = 7 × (36 ÷ 7, rounded down) = 7 × 5 = 35**

The GM rolls A = 6 and B = 6.

This generates R = 36.

Because 36 exceeds 35, reroll.

The next roll is A = 3 and B = 5.

**R = 6 × (3 − 1) + 5 = 17**

The selected index is:

**I = 1 + ((17 − 1) mod 7) = 3**

Select Task 3.

Remove it from the available list.

Six Tasks remain.

The next draw uses N = 6, which requires no rejection.



---



# M.5 Randomizing Act Agendas

Each Act has exactly three possible Agendas.

Roll one D6.

| **D6** | **Select**    |
| ------ | ------------- |
| 1–2    | First Agenda  |
| 3–4    | Second Agenda |
| 5–6    | Third Agenda  |

Use the three Agendas belonging to the current Act.

| **Act** | **First**         | **Second**      | **Third**           |
| ------- | ----------------- | --------------- | ------------------- |
| I       | Whispers of War   | Broken Accord   | Forgotten Frontier  |
| II      | Charter Wars      | Foundry Compact | Harvest Accords     |
| III     | Border Ascendancy | Pact of Cities  | Great Survey        |
| IV      | Grand Council     | Final Siege     | Reckoning of Crowns |

Each Agenda has an equal one-third chance of selection.

The two unselected Agendas are not used during that Act.



---



# M.6 Randomizing Political Task Pools

Task selection must preserve the required classification quotas.

| **Campaign** | **Open** | **Sponsored** | **Exclusive** | **Total** |
| ------------ | -------- | ------------- | ------------- | --------- |
| Local        | 2        | 2             | 1             | 5         |
| Standard     | 3        | 2             | 2             | 7         |
| Long     | 3        | 3             | 3             | 9         |
| Grand        | 3        | 4             | 4             | 11        |

## Task Pool Procedure

1. Prepare the eligible Open Task list.
2. Prepare the eligible Sponsored Task list.
3. Prepare the eligible Exclusive Task list.
4. Remove Tasks that cannot legally apply to the campaign.
5. Use Exact Positional 2D6 to select the required number from each classification.
6. Remove selected Tasks from their respective eligible lists.
7. Combine the selected Tasks into the Act pool.
8. Randomize their order.
9. Reveal the first three to form the Task Display.

When the Active Task resolves, remove it and reveal the next Task from the Act pool.

The GM may use the positional method to select among the remaining Act-pool entries rather than physically shuffling the selected Tasks.

### Important Restrictions

Only Tasks associated with participating Grand Factions are eligible.

Do not use this procedure to select the Active Stake itself.

The Council Influence holder chooses the Active Stake from the available Task Display.

Task randomization determines what becomes available, not what the PCs or GM choose to pursue.



---



# M.7 Scheduling Neutral Opportunities

Every Act contains one Treasury Opportunity.

Additional Special Opportunities depend on campaign length.

| **Campaign** | **Treasury** | **Special** | **Total** |
| ------------ | ------------ | ----------- | --------- |
| Local        | 1            | 0           | 1         |
| Standard     | 1            | 1           | 2         |
| Long     | 1            | 1           | 2         |
| Grand        | 1            | 2           | 3         |

## Scheduling Procedure

1. Number the Turns within the Act.
2. Randomly select one Turn for the Treasury Opportunity.
3. Remove that Turn from the available schedule.
4. Randomly select each required Special Opportunity Turn from the remaining Turns.
5. Record the results privately.

Use Exact Positional 2D6 when the number of eligible Turns is greater than six.

No Turn receives two scheduled Neutral Opportunities under the normal procedure.

## Selecting Treasury Cards

There are four Treasury cards.

Number them F-T1 through F-T4.

Use the positional method with N = 4, or roll a D6 and reroll 5–6.

Draw without replacement across the campaign until the four Treasury cards have been used.

Every Treasury Opportunity provides the same reward:

**2 Gold per PC.**

The card determines the objective's narrative form.

## Selecting Special Cards

There are eight Special Opportunity cards.

Number them F-S1 through F-S8.

Use Exact Positional 2D6 with N = 8.

Accept results 1–32.

Reroll 33–36.

Select one of the eight entries uniformly.

Remove that card from the remaining Special Opportunity catalog.

A Grand Campaign uses all eight Special cards across its four Acts.

Standard and Long Campaigns normally use four of the eight Special cards.

Local Campaigns use none.



---



# M.8 Exact Discovery Draws

The Discovery deck contains twelve unique cards.

Number them G-D1 through G-D12.

For the first Discovery draw, use N = 12.

All thirty-six positional 2D6 outcomes are accepted.

Each Discovery has probability 1/12.

After selecting the card, remove it from the available list.

The next draw uses N = 11.

Continue adjusting N as cards are removed.

## Explore Supremacy

When Explore Supremacy permits revealing two Discoveries:

1. Draw the first card using the current eligible pool.
2. Temporarily remove it.
3. Draw a second card from the remaining pool.
4. Choose one.
5. Permanently remove the chosen card.
6. Return the unchosen card to the eligible pool.

This produces two distinct eligible rewards.

If only one Discovery remains, resolve it normally.

The GM should not use two independent rolls that might select the same unique card when the effect specifically requires revealing two different cards.



---



## M.8.1 Fast Twelve-Discovery Lookup

For the **initial complete Discovery pool only**, players may use a simpler equally likely 2D6 lookup. The first die selects the left group when odd and the right group when even; the second die selects the row. This is an alternative to the positional calculation, not an additional draw.

| Second D6 | First D6 odd | First D6 even |
| --- | --- | --- |
| 1 | G-D1 Buried Arsenal | G-D7 Sealed Treasury |
| 2 | G-D2 Crystal Vein | G-D8 Fallen Banner |
| 3 | G-D3 Hidden Bazaar | G-D9 Shipwrecked Expedition |
| 4 | G-D4 Forgotten Granary | G-D10 Old Cartographer |
| 5 | G-D5 Ancient Observatory | G-D11 Guardian's Rest |
| 6 | G-D6 Lost Forge | G-D12 Hidden Waystone |

Each card has probability 1/12 on the first draw. For subsequent draws, either reroll results corresponding to removed cards or use the exact positional method among the remaining eligible entries. Rerolling used cards reproduces drawing without replacement while at least one remains eligible. **Do not** substitute the older *Hidden Settlement* card; the current twelfth Discovery is *The Hidden Waystone*.

---

# M.9 Exact Development Reward Draws

The Development deck contains eighteen physical cards.

Number all eighteen individual copies, including repeated copies of the same reward.

Use the following ordering:

| **Entry Numbers** | **Card**             | **Copies** |
| ----------------- | -------------------- | ---------- |
| 1–5               | War Chest            | 5          |
| 6–8               | Windfall             | 3          |
| 9–11              | Recruitment Contacts | 3          |
| 12–13             | Work Crews           | 2          |
| 14–15             | Informants           | 2          |
| 16–17             | Diplomatic Favor     | 2          |
| 18                | Field Preparations   | 1          |

Use Exact Positional 2D6 with N = 18.

Each individual entry is equally likely.

When a reward is drawn, remove that copy from the remaining list.

Keep held temporary rewards unavailable to the draw pool until used, discarded, or expired.

When the draw pool becomes empty, recycle the eligible discard pool according to Appendix H.

## Example

Suppose the dice show:

A = 5, B = 2.

**R = 6 × (5 − 1) + 2 = 26**

For eighteen cards:

**I = 1 + ((26 − 1) mod 18) = 8**

Entry 8 is Windfall.

The PC Company gains **2 Gold**.

Remove that copy of Windfall from the available Development list.

The next draw uses the remaining seventeen entries.

This procedure exactly reproduces physical card draws without replacement.



---



# M.10 Quick Development Reward Table

This table uses the ordinary **sum of 2D6**, not positional 2D6. It represents the current 18-card Appendix H deck with War Chest = 1 Gold and Windfall = 2 Gold.

It is designed so that the probability of each Development category exactly matches its initial proportion in the eighteen-card deck. It is an **optional with-replacement** alternative, not a substitute for tracking held or spent cards when finite-deck behavior matters.

| **2D6 Sum** | **Development Reward** | **PC Effect**                      |
| ----------- | ---------------------- | ---------------------------------- |
| 2           | Field Preparations     | One Battlefield Edge               |
| 3           | Diplomatic Favor       | One minor political concession     |
| 4           | Recruitment Contacts   | −1 Gold eligible acquisition       |
| 5           | Work Crews             | −1 Gold eligible Develop/Construct |
| 6           | War Chest              | +1 Gold                            |
| 7           | Windfall               | +2 Gold                            |
| 8           | War Chest              | +1 Gold                            |
| 9           | Informants             | Strategic intelligence             |
| 10          | Recruitment Contacts   | −1 Gold eligible acquisition       |
| 11          | Diplomatic Favor       | One minor political concession     |
| 12          | Field Preparations     | One Battlefield Edge               |

### Probability Distribution

| **Reward**           | **Outcomes out of 36** | **Probability** |
| -------------------- | ---------------------- | --------------- |
| War Chest            | 10                     | 27.78%          |
| Windfall             | 6                      | 16.67%          |
| Recruitment Contacts | 6                      | 16.67%          |
| Work Crews           | 4                      | 11.11%          |
| Informants           | 4                      | 11.11%          |
| Diplomatic Favor     | 4                      | 11.11%          |
| Field Preparations   | 2                      | 5.56%           |
| **Total**            | **36**                 | **100%**        |

These are precisely the proportions of the eighteen-card Development deck before any cards are removed.

### Expected Gold Value

War Chest contributes 1 Gold, and Windfall contributes 2 Gold.

The expected direct Gold from a fresh reward draw is:

**E[Gold] = (5 × 1 + 3 × 2) ÷ 18 = 11 ÷ 18 ≈ 0.611 Gold.**

Other Development rewards are not included in this direct Gold expectation.

### Important Limitation

The Quick Development table reproduces the deck's **initial category probabilities**, but does not automatically reproduce its changing composition after cards have been drawn.

Repeated 2D6 sum rolls allow the same reward category to appear indefinitely.

Therefore:

- Use the Quick table for a simplified with-replacement reward system.
- Use Exact Positional 2D6 with a remaining-card list for exact no-replacement draws.

Do not claim the Quick table reproduces physical deck depletion without maintaining and adjusting the remaining category probabilities.



---



# M.11 Randomizing Other Small Lists

The positional method may also be used for a list of legal, equally appropriate alternatives.

Examples include:

- Selecting a random unresolved Site from a list.
- Determining which of several equally suitable locations receives an incidental event.
- Randomizing an eligible Neutral Opportunity.
- Selecting among equally plausible minor complications.

Always identify the legal list before rolling.

The result cannot select an ineligible action or unavailable target.

The exact positional method is valid for list sizes up to thirty-six.

For larger lists, divide the entries into suitable subsets or use an appropriate larger randomizer.



---



# M.12 When Not to Roll

Do not randomize decisions that belong to players, the GM, or established faction interests.

The following remain intentional choices:

| **Decision**                  | **Controlled By**                                   |
| ----------------------------- | --------------------------------------------------- |
| Company Order                 | PCs                                                 |
| Company mission target        | PCs, subject to eligibility                         |
| Active Stake selection        | Council Influence holder                            |
| Stake's primary target        | Council Influence holder                            |
| Designated Lead               | Council Influence holder                            |
| Principal Opposition Maneuver | GM                                                  |
| Directed independent Maneuver | Council Influence holder or valid Political Mandate |
| Ordinary independent Maneuver | Public faction interests and obligations            |
| Army deployment               | Controlling player or GM                            |
| Political agreement terms     | Actual negotiation or scenario result               |

The purpose of optional dice tables is to replace randomized deck draws, not remove strategic agency.

Independent faction decisions may use a fair random selection only when several legal options remain genuinely equivalent after applying the faction's established priorities.



---



# M.13 Dice Procedure Quick Reference

| **Randomized Element**      | **Recommended Method**                               |
| --------------------------- | ---------------------------------------------------- |
| Act Agenda, three choices   | D6: 1–2 / 3–4 / 5–6                                  |
| Political Task pool         | Positional 2D6, drawing within classification quotas |
| Task Display order          | Positional 2D6 among remaining Act Tasks             |
| Neutral Opportunity Turn    | Positional 2D6 among available Turn positions        |
| Treasury card               | Positional 2D6, N = remaining Treasury cards         |
| Special Opportunity         | Positional 2D6, N = remaining Special cards          |
| Discovery                   | Positional 2D6, or fast odd/even lookup with rejection |
| Development reward, exact   | Positional 2D6, N = remaining physical card copies   |
| Development reward, quick   | Sum of 2D6 table                                     |
| Company Order               | Never randomized by default                          |
| Faction Maneuver commitment | Never randomized by default                          |

**Positional 2D6:**

**R = 6 × (A − 1) + B**

**Uniform index for N remaining entries:**

**I = 1 + ((R − 1) mod N)**

Reroll results above the highest multiple of N that does not exceed 36.

*End of Appendix M — consolidated from the two prior Appendix M drafts.*
