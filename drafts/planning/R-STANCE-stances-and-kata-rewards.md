# R-STANCE: Stances, and new kata rewards

- **ITEM:** R-STANCE. From Jay (Oct 25): "forms should be called stances… each stance will provide a different benefit (horse stance is rooted stance)… katas should give a different power or even a passive."
- **In short:** Forms become **Stances**. Each stance unlocks by its own **Sensei sign-off** (Jay, J2), not from a kata. Each kata gives its own **power or passive** instead. Real sign-offs still unlock everything, and stats still come from training.
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
| **Fighting stance** | `docs/self-defense.md` #13–14 ("Jump to a fighting stance") | **Guard up:** blocks take less damage, Focus fills faster | **Dash goes a little shorter** (no attack-speed loss, Jay J1) |
| **Horse stance** | **Not in the repo.** Only Jay's message | **Rooted:** while standing still, hit much harder and shrug off pushes | Can't move while rooted (moving ends it) |

**Fighting trade-off (Jay J1):** no attack-speed loss. I picked **a slightly shorter Dash** because a guarded, planted stance makes sense with shorter steps. It also leaves damage alone, so the balance bands and other stances aren't affected (Cat already has "softer hits"). It still counts as a real trade-off, since Dash is how kids escape lane attacks. "None" isn't safe: Fighting would then beat Ready in every way.

**How stances unlock (Jay J2):** each stance is its own **technique sign-off**, which works like kata, self-defense and kick-combo sign-offs today (`docs/core-design.md`, technique sign-off row and "The standard never changes"). The student watches the video and logs practice, then taps "Ready to show Sensei". An instructor watches it in class and taps **OK** or **Not yet**. The stance unlocks in the game the same day, with a reward moment naming it. Ready is there from the start. Students who already passed a belt get the legacy grant (core-design "Existing students get the legacy grant"): every stance taught at their past belts counts as signed off. Stance sign-offs are **extra** to the belt Gate locks, so the Gates stay exactly as `docs/curriculum.md` lists them. **DojoForge (Nic) needs a sign-off item per stance.**

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
- **P-MENU2-d/e loadout:** the slot is already called "Stance", so the UI barely changes. The saved `form` key needs a migration. Stances unlock by their own Sensei sign-off (J2), so DojoForge needs 4 new sign-off items (Cat, Front, Fighting, Horse).
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
| R-STANCE-d | Programmer (+ Nic for the DojoForge feed) | Stance sign-off items in the progress feed and fixtures, each unlocking its stance through the normal sign-off cascade and reward moment; then kata→reward data and effects (after the beta, per J5) | A fixture with a "Cat stance" sign-off shows Cat unlocked with its reward moment, and one without shows "Learn this at the dojo"; the legacy grant unlocks past-belt stances; Gate locks unchanged; tests pass |
| R-STANCE-e | Learning Designer + Jay | Steps and one-line character for Pinon 1–3, Nahanchi, Possi; the dojo stance list | Files in `drafts/content/katas/`; the Researcher fills the reward gaps |

## 5. DECIDE (for Jay)
- **J1. DECIDED (Jay, Oct 25):** the 5 stances are approved. Fighting keeps full attack speed; its trade-off is now a shorter Dash (above).
- **J2. DECIDED (Jay):** stances unlock by Sensei sign-off, the same way as other technique sign-offs.
- **J3. OPEN:** kata reward picks. Jay reviews them tonight.
- **J4. OPEN:** is Horse = Rooted ("can't move, hits hard") OK, with a cap?
- **J5. OPEN (placeholder in use):** rename only for the beta, kata rewards after.
