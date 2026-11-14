# OV-T2: Orange report plus White kid-bot Guided win rate

## Delivery Note

| | |
|---|---|
| **ITEM** | OV-T2 (board section 000, `docs/work-board.md` on `bot-manager`). Owner: Dojo-Ascent Game Logic/systems Tester. |
| **WHAT** | Numbers only, no tuning: re-measure the White kid bot on Guided against a target of about 7 in 10 floor clears, and re-run the R-PREMIUM-e belt × difficulty table to report why Orange “wins everything.” |
| **WHY** | Fable review B8 + B3 (`docs/reviews/fable-progression-overhaul.md`). R-PREMIUM-e asked for a report, not a retune, after the Oct 26 audit table showed White Standard 4/20 and Orange 20/20 on every setting including Challenge. |
| **DECIDE** | White Guided already meets (and is above) the about-7-in-10 target: **19/20**. The old “Orange wins 20 of 20 even on Challenge” result is **not reproduced** on current main (Orange Challenge **6/20**). No balance numbers should be changed on the back of the stale 20/20 figure. |
| **NEXT** | Manager reviews this docs-only PR and merges it if the numbers are enough. No retune, and no further QA loops from this item. |

**Written:** 2026-11-14, 1:50 PM America/New_York; publish pass 1:53 PM America/New_York. Docs-only PR to `drafts/qa/`. No game-code edits.

The win-rate table was measured on `fecfdb60131ddb15f6adfd9c6e9a088fb4ffc2fe`. This PR is based on current main `403e7d1e1b220b4312a2891ae429ebf50470bc27`, which is two later docs-only commits (#479 OV-C2, #480 OV-L1) and does not change the sim or kid bot.

---

## Board text (quoted from `bot-manager` `docs/work-board.md`, section 000)

**What:** B8 + B3 numbers: report why Orange wins everything (R-PREMIUM-e), and measure the White kid bot on Guided against a target of about 7 in 10 floor clears.

**Done when:** `drafts/qa/` note with the numbers and a short fix list. No tuning applied.

**Waits on:** —

**Linked files used:**

- `drafts/planning/R-PREMIUM-audit.md` — item **R-PREMIUM-e**: “Balance follow-up from the table: why White belt kids win only 20% on Standard, and why belt 3 wins 20/20 even on Challenge. Report only, no numbers changed.” Done when: “A short report explains both, with a re-run of the table above.” The audit table was measured on main `66c503f`.
- `docs/reviews/fable-progression-overhaul.md` — B3 (Guided default + White Guided target of about 7 in 10; then “the kid bot manages 5 in 10 on Guided and 2 in 10 on Standard”); B8 (“Finish R-PREMIUM-e (why Orange wins everything)”); 8.5 #2 (“Orange is an outlier (kid bot wins 20 of 20 even on Challenge)”).
- Official kid bot: `packages/sim/test/balance/bot.ts` (`playRun`, style `'kid'`, `SKILLS.novice`) and `packages/sim/test/b-masher-kid.test.ts` (seeds `1000 + i`, `ARTISTS.typical[tier-1]` stats, `{ tier }`). Shared stats: `packages/sim/test/r-bal-12-artists.ts`.
- `/workspace/R-G2B-green-baseline.md` is a Green play baseline, not this win-rate table. Earlier Orange UI shots under `/workspace/evidence/Orange_*` were reused as “do not re-shoot”; they are Fighting Style / Settings stills and are **not** win-rate evidence.

`playRun` does not load `fixtures/1-white-belt-new.json` or `fixtures/5-white-belt-age-6-9.json` (DojoForge feed files, no combat stats). The White profile used here is the official kid-bot White row: typical belt-average stats plus `tier: 1`.

---

## Measurement

**Commit:** `fecfdb60131ddb15f6adfd9c6e9a088fb4ffc2fe` (`origin/main`, “G2B-31: cap endless scaling at floor 13 (docs only) (#473)”). Author time 1:46 PM America/New_York, 2026-11-14.

**Bot (unchanged):** style `kid`, skill `novice` (`reactTicks` 8, `timingSd` 4), `KID_RANDOM_PRESS` 0.12. Seeds **1000–1019** (the same 20 seeds as `b-masher-kid.test.ts`). Student stats from `ARTISTS.typical[tier-1]` (White / belt 1: health 146.96, power 17.02, guard 9.34; Orange / belt 3: health 332.79, power 45.85, guard 33.53).

**Exact command** (throwaway shallow clone at `/workspace/dojo-qa-ovt2`, later deleted; runner lived outside the repo at `/workspace/dojo-qa-notes/ovt2-kid-table.test.ts` and only called `playRun` as in the official test; no game file was edited or committed):

```bash
cd /workspace/dojo-qa-ovt2/packages/sim
OVT2_SEEDS=20 OVT2_BELTS=1,2,3,4,5,6,7,8,9,10 \
OVT2_DIFFS=guided,standard,challenge \
OVT2_OUT=/workspace/dojo-qa-notes/ovt2-kid-table.json \
OVT2_SHA=fecfdb60131ddb15f6adfd9c6e9a088fb4ffc2fe \
npx vitest run test/ovt2-kid-table.test.ts --silent=false
```

The vitest path was an untracked symlink to that external file, removed after the run. Raw totals: `/workspace/dojo-qa-notes/ovt2-kid-table.json`. Duration about 5.5 s. No game numbers were changed.

### White kid bot, Guided (the OV-T2 target)

| | |
|---|---|
| **Wins / runs** | **19 / 20** |
| **Rate** | **95%** |
| **Target** | about 7 in 10 (14 / 20) |
| **Vs target** | **Meets, and is above, the target** |
| **Room-1 KOs** | 0 |
| **Elites** | 0 (elites start at belt 4) |
| **Lost seed** | 1006 only (died in `w-narrow-bridge`) |
| **Floor** | White Dojo rooms (`w-lantern-room`, `w-bamboo-hall`, `w-keepers-hall`, …) |

For context on the same seeds, White Standard is **12 / 20** (60%) and White Challenge is **7 / 20** (35%). Those are not the OV-T2 target, but they update the old audit’s White Standard 4/20 (20%).

### Full kid-bot table (R-PREMIUM-e re-run)

Wins out of 20 seeds per belt. Totals are out of 200.

| Difficulty | B1 White | B2 Yellow | B3 Orange | B4 Green | B5 | B6 | B7 | B8 | B9 | B10 | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Guided | **19** | 19 | 19 | 18 | 19 | 19 | 19 | 19 | 19 | 19 | 189/200 (94.5%) |
| Standard | 12 | 8 | 14 | 7 | 14 | 13 | 12 | 14 | 14 | 14 | 122/200 (61.0%) |
| Challenge | 7 | 6 | **6** | 3 | 8 | 7 | 5 | 6 | 5 | 5 | 58/200 (29.0%) |

Audit table on main `66c503f` (Oct 26), for comparison only — not current:

| Difficulty | B1 | B2 | B3 | B4 | … | B10 | Total |
|---|---|---|---|---|---|---|---|
| Guided | 10 | 17 | **20** | 14 | … | 11 | 69.5% |
| Standard | **4** | 12 | **20** | 10 | … | 10 | 56.5% |
| Challenge | 3 | 6 | **20** | 3 | … | 3 | 23.0% |

---

## Why Orange “wins everything” — current main

**It does not, on this SHA.** Orange Challenge is 6/20, in line with Yellow (6/20) and a little above Green (3/20). Orange Guided is 19/20, the same as White and Yellow. The Fable / R-PREMIUM-e “20 of 20 even on Challenge” figure is stale.

What still stands in the source, and still shows up as a **smaller Standard bump** (Orange 14/20 vs Yellow 8/20 and Green 7/20):

1. **Orange plays its own floor.** Belt 3 is the only measured belt on Ember Kitchens (`ember-pantry`, `oven-row`, `pin-lanes`, `long-table-hall`, boss `great-hearth`). White plays the White Dojo `w-*` set. Yellow and Green play the shared Tower rooms (`bamboo-hall`, `gauntlet`, `keepers-hall`, …).
2. **Elites start at belt 4.** `content/elites/elites.json` `minBeltTier` is 4. White, Yellow, and Orange had **0** elite rooms in this run. Green Standard already had 15 elite-room appearances (11 swift, 4 guarding) in 20 seeds. That matches the source rule; it is not a new bug.
3. **Challenge at Orange is sim-only.** The UI locks Challenge until belt 4 (`CHALLENGE_FROM_TIER`, `r-challenge-p6-belt4-lock.test.ts`). `playRun` / a `?difficulty=challenge` link still runs it, which is how the audit table was built. Live Orange testers would not be offered Challenge.

Player vs enemy scale is not a unique Orange spike (White typical power 17.02 / enemy power scale 1.19; Orange 45.85 / 3.14; Green 65.62 / 4.32 — about 14–15 in each case). The leftover Standard bump lines up more with “own easier-feeling kitchen floor + no elites” than with a broken scale row. I did **not** bisect which commit after `66c503f` moved Orange off 20/20; that cause is unverified.

Orange Fighting Style / Settings shots in `/workspace/evidence/Orange_*` were not re-shot and do not speak to these win rates.

---

## Fix list (log only, no retune)

1. Do **not** retune Orange on the old “wins 20/20 even on Challenge” claim. That result is not on current main.
2. No raise is needed for the White Guided win-rate target: **19/20** already meets about 7 in 10.
3. If “about 7 in 10” is meant as a band rather than a floor, Guided at **94.5%** across belts 1–10 is high. That is an observation only; no numbers were changed here.
4. Leftover Orange Standard **14/20** vs Yellow **8**, Green **7** — logged only, no retune per Manager. The floor-set + elite-tier split is the lead explanation, not a new defect filed here.
5. Keep reporting Challenge-at-Orange as a sim table, not as live UI, until belt 4.

---

## Unverifiable / out of scope

- Which commit(s) after `66c503f` changed the rates — not bisected.
- A real 6–9 year-old’s Guided win rate. This is the scripted kid bot (random button presses, novice timing, typical White stats), not a live child or a saved fixture profile.
- Loading `fixtures/*.json` into `playRun` — the function has no such input.
- Human play, UI, or a full verify-ui-shots pass. Passed Orange UI cases were not rerun.

