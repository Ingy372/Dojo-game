# R-STANCE: Stances, and new kata rewards

- **ITEM:** R-STANCE. From Jay (Oct 25): "forms should be called stances… each stance will provide a different benefit (horse stance is rooted stance)… katas should give a different power or even a passive."
- **In short:** Forms become **Stances**. Stances stop coming from katas. Each kata gives its own **power or passive** instead. Real sign-offs still unlock everything, and stats still come from training.
- **DECIDE:** J1–J5 at the end.

## 1. Rename Forms → Stances (what it touches)
| Area | Files | What changes |
|---|---|---|
| Content | `content/abilities/abilities.json` (`forms` list, `Rooted Form`, `Flowing Form`), `content/abilities/fighting-style.json` (`rooted-form`/`flowing-form` lines), `content/katas/basic-form-1.json`, `basic-form-2.json`, `keon.json`, `david-and-goliath.json` (the `form` field), `content/dojo/decorations.json` | `forms`→`stances`; ids `rooted-form`→`rooted-stance`, `flowing-form`→`flowing-stance` (or new ids, Section 2). Katas lose `form` and gain `reward` |
| Sim | `packages/sim/src/abilities.ts`, `katas.ts`, `profile.ts` (saved `loadout.form`), `world.ts`, `training.ts`, `progression.ts`, `rewards.ts`, `config.ts` | Rename only. **The saved key `loadout.form` needs a migration** (read the old key, write `stance`) |
| Client UI | `apps/client/src/ui/fightingStyle.ts`, `ui/trophyCase.ts`, `input/ActionButtons.ts`, `art/player.ts`, `art/art.ts`, `scenes/HomeScene.ts`, `scenes/GameScene.ts` | Any "Form" text becomes "Stance". The Fighting Style slot is already called **Stance** (`fighting-style.json`) |
| Tests and fixtures | `packages/sim/test/abilities`, `katas`, `training`, `p-menu2-d-loadout`, `p-menu2-e-style`, `art-links`, `cascade`, `combat`, `mixed-signoffs`, `golden-capture` tests; `fixtures/golden/p-menu2-d-default-run.json`; `fixtures/1-`, `2-`, `3-`, `5-*.json` | Same ids renamed; golden run re-captured (behaviour unchanged) |
| Art and icons | `tools/art-import/approved.json`; **#277** icons `icon-rooted-form` and `icon-flowing-form` (PR still open); `incoming-art/form-stances-a2/` (`stance_rooted`, `stance_flowing` idles) | Rename the sprite keys. The idle animations stay (they already are stances) |
| Docs | `docs/curriculum.md` line 36 ("Kata unlocks a Form"), `docs/framework.md`, `docs/core-design.md`, `docs/decisions.md`, `docs/progress.md` | Wording. Work-board lines are for the Manager to change |

Not touched: the kata *names* "Basic Form 1/2" (real curriculum names), and the hair art files that only match "form" inside other words.

## 2. Stances found in the curriculum
Only these stances appear in the repo. Each gets one benefit and one trade-off.
| Stance | Where it appears | Benefit | Trade-off |
|---|---|---|---|
| **Ready / Attention** (today's Beginner's Stance) | `drafts/content/katas/moves.json` (`stance.attention`); every kata's `finish` ("ready stance") | Balanced: good at everything | No special strength |
| **Cat stance** | `moves.json` `stance.cat`; Basic Form 1/2, Keon, David and Goliath | **Quick feet:** dash recharges faster, longer Perfect Counter window | Hits a little softer |
| **Front stance** | `moves.json` `stance.front`; Keon | **Strong push:** Strikes hit harder and push the enemy back | Turns a little slower |
| **Fighting stance** | `docs/self-defense.md` #13–14 ("Jump to a fighting stance") | **Guard up:** blocks take less damage, Focus fills faster | Slightly slower to Strike |
| **Horse stance** | **Not in the repo.** Only Jay's message | **Rooted:** while standing still, hit much harder and shrug off pushes | Can't move while rooted (moving ends it) |

**Gaps for Jay to fill:** the repo only has 4 real stances, plus Horse from Jay. Kata write-ups exist for only 4 of 9 katas. Pinon 1–3, Nahanchi and Possi have no steps in the repo, so any stances they use (for example back stance) are unknown. **Jay: list the stances taught at the dojo, and at which belt.**

## 3. Kata rewards (one power or passive per kata)
Built from what the repo says each kata contains (`drafts/content/katas/*.json`). Most use existing effect types in `packages/sim/src/effects.ts`, so they're cheap to build.
| Kata (belt) | What's in it | **Pick** | Option 2 | Option 3 |
|---|---|---|---|---|
| Basic Form 1 (White→Yellow) | Low block, then 3 punches and a kiai | **Kiai!** (passive): every 3rd Strike in a row lands a little harder (`staggerBonus`/`everyHits`) | Low Block Guard: blocks take 10% less (`blockCut`) | Start each room with some Focus (`startFocus`) |
| Basic Form 2 (Yellow→Orange) | A catch, then reverse kicks and punches | **Catch and Return** (passive): a Block sends some damage back (`blockReflect`) | Reverse Kick: Strike adds a back kick (`strikeExtraHit`) | Combos flow faster (`comboSpeed`) |
| Keon (Orange→Green) | Cat→front stance, low block and punch, kiai at the end | **Step In** (power): after a Perfect Counter, the next Strike is free (`strikeCost`) | Strong finish: Perfect Counter hits harder (`counterStrength`) | Steady: +Focus on each Perfect Counter (`focusGain`) |
| David and Goliath (Green→Blue) | Many turns (front, back, sides), backfists, a choke break; the story of the small one beating the giant | **Small but Brave** (passive): deal more damage to big enemies (Brutes, Guardians) | Backfist: Counter also taps the enemy behind you (`rippleCounter`) | Courage: Focus fills faster when Health is low (`lowHealthFocus`) |
| Pinon 1, 2, 3; Nahanchi; Possi | **Names only in the repo** | **Gap.** Jay gives one line per kata ("slow and strong", "lots of turns"), then I propose picks | | |

Rules kept: no punishments, no "lose your streak". Every reward is a small plus. Numbers are set later inside the R-BAL bands.

## 4. Impact on what's built
- **P-MENU2-d/e loadout:** the slot is already called "Stance", so the UI barely changes. The saved `form` key needs a migration. Stances must unlock by something other than katas (J2).
- **abilities.json:** `forms` becomes `stances`. A new `kataRewards` list (9 entries) is added. Kata files point to `reward` instead of `form`.
- **#277 icons:** rename 2 icons. New icons are needed for each new stance (cat, front, fighting, horse) and for 4 kata rewards.
- **R-BAL bands:** stance and kata numbers aren't enemy stats, so the enemy band tests are untouched. But **Rooted (Horse) "hits hard"** raises player damage. Cap it so Guardians still need 40 or more hits while rooted, and re-run the sims (r-bal-12 / band test) before shipping.
- **Beta (freeze Dec 4):** the rename is small and safe. New stances and kata rewards are bigger. I suggest the rename for the beta, and the rewards after the beta (J5).

### Build order (for the Manager to put on the board)
| ID | Owner | Work | Done when |
|---|---|---|---|
| R-STANCE-a | Programmer | Rename Forms→Stances in content, sim, UI and tests; migrate the saved `loadout.form` | No "Form" text left in the UI (kata names excepted); an old save loads with its stance; all tests pass; golden run unchanged |
| R-STANCE-b | Artist | Rename the #277 icons; draw icons for cat, front, fighting and horse stances | Icons are in `incoming-art/` with stance ids |
| R-STANCE-c | Researcher | Numbers for the stances and the 4 kata rewards, with a sim inside the R-BAL bands | Sim passes the band tests; Rooted is capped |
| R-STANCE-d | Programmer | Kata→reward data and effects; stance unlocks per J2 | Signing off Basic Form 1 gives "Kiai!"; the stance unlocks as decided; tests pass |
| R-STANCE-e | Learning Designer + Jay | Steps and one-line character for Pinon 1–3, Nahanchi, Possi; the dojo stance list | Files in `drafts/content/katas/`; the Researcher fills the reward gaps |

## 5. DECIDE (for Jay)
- **J1.** Which stances are taught, and at which belt? I recommend the 5 above (Ready, Cat, Front, Fighting, Horse) for now.
- **J2.** How do stances unlock if not from katas? I recommend **by belt** (one new stance per belt, shown at the dojo). Alternatives: a stance sign-off by Sensei, or all open from the start.
- **J3.** Kata reward picks: Kiai!, Catch and Return, Step In, Small but Brave (or an option from the table)?
- **J4.** Horse = Rooted: OK that standing still "hits hard" but can't move? (Kids may stand still too much; the cap in R-STANCE-c keeps it fair.)
- **J5.** Beta scope: rename only for the beta, with rewards after? I recommend **yes**.
