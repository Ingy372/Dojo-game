# S5: Difficulty review

Work board S5 asks three questions:

1. Review core-design §12: is there a clear reason, one a kid can understand, to choose Challenge?
2. Should young beginners be offered Guided automatically, given the novice win rate of about 41%?
3. What does the Endless Ascent give at black belt?

Author: Dojo-Ascent Researcher & Planner, 2026-10-24. Plan only; no game code or work-board edits. Numbers marked (guess) are mine. No learning-science claims; the Learning Designer reviews the wording and the offer.

## What exists

- **Settings** (`DIFFICULTY` in `packages/sim/src/config.ts`):

  | Setting | Counter window | Wind-up |
  | --- | --- | --- |
  | Guided | 10 ticks (0.5 s, Jay, 2026-10-06) | Normal speed |
  | Standard | 6 ticks | Normal speed |
  | Challenge | 4 ticks | Fill 0.8 |

  Default is `standard`.
- **Win rates** from the balance player in `docs/decisions.md`:

  | Player | Win rate | Source |
  | --- | --- | --- |
  | Novice, Standard (smart play) | 41–50%, latest 42–44% | lines 391, 410, 412 |
  | Novice, standing still | ~25% | lines 410, 412 |
  | Novice, Guided | 95–99% | lines 410, 412 |
  | Typical and sharp | ~93–100% | line 429 |

- core-design §12 (line 577) lists what Challenge gives: gear up to 100% of the cap, Challenge-only looks, certified "Challenge Clear" trophies, rare crafting materials, better loot odds, and faster Mastery.
- core-design line 56 already says Guided "adjusts after repeated defeats". This isn't built yet.
- Challenge unlocks at 4th belt (§13). The Endless Ascent is post-launch (line 736).

## 1. A clear reason to choose Challenge

**Finding:** the reasons exist, but they're a grown-up list. Two of them clash with later decisions:

- **"Better loot odds"** goes against S7-rev's rule that chance stays a small bonus, with odds kept out of kid view (Learning Designer, PR #71).
- **"Rare crafting materials"** has no use at launch, because materials only collect for now (Manager, Oct 24).

**Proposal:**

- **Kid-facing reasons, shown on the difficulty picker, one line each:**
  1. "Tougher monsters. Your timing has to be sharp!"
  2. "Earn Challenge medals and the silver gi trim." That's S7 source D, S6 `ach.tower.challenge.<n>` and S10 `look.trim.silver`.
  3. "Gear can be a little stronger." Challenge reaches 100% of the cap, Standard ~90% (S2).
- **Drop "better loot odds."** (Manager OK'd, Oct 24; removed from `docs/core-design.md` §12 in this PR.) Challenge chests already give 3 items and uncommon or better when cleared in time (`drops.json`). Changing the rarity odds isn't needed.
- **Keep "rare materials"** off the kid screen until crafting exists.
- **Keep the rule:** Challenge is never needed to progress. Belts, sign-offs and every real-training look never need Challenge.
- **Faster Mastery** stays as written. It's a parent-facing detail, not kid copy (guess).

## 2. Guided for young beginners

**Finding:** a novice on Standard loses more than half of runs. On Guided they win 95–99%, with the same loot and XP (§12). Losing a lot early is a quit risk, and §12 says young players are "never punished for needing help".

**Proposal (no automatic switching without a choice):**

1. **Starting setting (Manager call, Oct 24):** everyone starts on **Standard**. There is no age-band question, because we have no student data to base it on. A parent can pick **Steady** (Guided) any time in the parent settings screen.
2. **Sensei's offer (Manager OK'd, Oct 24):** after **2 losses on the same floor** (total, not in a row and not timed), Sensei kindly offers Steady:

   > "Want the monsters to wait a bit longer before they attack? You can change it back any time."

   - Buttons: "Yes, please" and "No thanks". They're the same size and colour, with no default.
   - The offer comes once per floor, at most one offer per session, and never during a run.
   - Saying no is remembered for that floor.
3. **No labels that shame.** On the kid screen the settings are **"Steady"** (Guided), **"Standard"** and **"Challenge"** (Manager OK'd "Steady", Oct 24). The code ID stays `guided`. Nothing says "easy" or "baby". No badge shows the setting to visitors.
4. **Moving up:** after 3 floor clears on Guided (guess), Sensei may say once: "You're getting quick! Want to try Standard? You can always come back." It's never automatic.
5. **Parent lock:** the parent can turn the offers off.

## 3. The Endless Ascent at black belt (post-launch)

**What core-design says:** an endless climb, each floor ~3% stronger (line 530), a personal-best floor, a milestone trophy every 10 floors, and no public ranking (line 451).

**Proposal, with new S6-style IDs:**

| ID | When | Reward |
| --- | --- | --- |
| `ach.endless.floor.<n>` (10, 20, 30 … then every 10) | Best floor reached | Game trophy plate with the floor number (one model, number changes) |
| `ach.endless.title.<n>` (25, 50, 100; guess) | Best floor | Title (C7 to name) |
| `look.aura.endless` (guess, new tint) | Floor 50 (guess) | Aura tint. This is the only game-earned aura, and it's black belt only |

- The best floor shows only on the student's own wall and run card ("New best: floor 23!"). No leaderboard, and no "world best".
- **No power, gear or materials.** Floors above the tier cap drop no new gear, only the trophy plates. This keeps it a pure skill test.
- Each run is its own climb, starting from floor 1. It has no timer, no energy and no daily entry.
- Losing ends the run but never lowers the best.

## Done-when

- The difficulty picker shows exactly the 3 kid lines for Challenge, and no odds or "rare" wording (word check).
- Removing "better loot odds": a seeded 10,000-chest test shows the same rarity weights on Standard and Challenge.
- **Guided offer (fixture tests):**
  - 2 losses on a floor shows the offer once
  - "No thanks" means it never shows again on that floor
  - nothing shows during a run
  - the parent lock hides it
- A new profile starts on Standard, and a parent can switch it to Steady in settings. Changing the setting never changes loot or XP (test against `rewards.ts` and chest results).
- No kid-facing text says "easy" or "Guided"; it says "Steady" (word check). Visitors can't see the setting.
- **Endless Ascent (when built):**
  - the best floor only goes up
  - trophies at every 10 floors
  - no gear above the cap
  - no ranking screen
  - balance player: floor N is ~3% harder than N−1

## Scope flags

- No age-band field (Manager, Oct 24). The parent settings screen needs the difficulty choice.
- New saved fields: the Guided-offer state per floor, and `endlessBest`.
- core-design §12: "better loot odds" is removed in this PR (Manager OK'd). "Rare crafting materials" now says "once crafting exists".
- The Endless Ascent is post-launch. Only its IDs and rules are fixed here.
- The Artist draws the endless trophy plate and maybe 1 aura tint.

## Decisions (answered Oct 24)

All five were answered by the Manager on Oct 24:

1. Remove "better loot odds": **yes** (done in core-design §12).
2. Age band: **no question**. Everyone starts on Standard; a parent can pick Steady.
3. Offer after 2 losses on the same floor: **yes**, said kindly.
4. "Steady" on the kid screen: **yes**.
5. Endless rewards (trophies, plus 1 aura at floor 50): **OK**.

Still open: point 4 under §2, "Moving up" after 3 Steady clears (guess).
