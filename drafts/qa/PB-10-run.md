# PB-10 run (prepare + STATIC)

## Delivery Note

- **ITEM:** PB-10 run prep after #472 merged into `main` as `5cefad05`. Plan: `/workspace/dojo-qa-notes/R-PROGRESSION-test-plan.md` (24 cases; G2B-06 reused by reference). Also fold in G2B-06 cases 1–4, 9–14 and 21–22 that were waiting on PB-05.
- **WHAT:** Each listed case is labeled COVERED, STATIC, or NEEDS-PLAY. STATIC cases were run read-only on a disposable shallow clone of `main` at `5cefad053f7fa617368bf1a82ee4697e814bcb1a` (deleted after). Live production and a Workers pin for this SHA were identified. No one was messaged. No game code was edited. Passed cases were not replayed.
- **WHY:** Usage is tight. Play only what is still unproven. PB-05 (picker, Old save row, contrast/note layout) is now on `main`.
- **DECIDE:** None in this file. Fixture gap, logged only: `6-orange-typical` has Kick Combo 3 **unsigned**, so it cannot prove G2B-06 case 3 / the Orange half of PB-10 case 15. `4-green-belt` is the stock fixture that already has Butterfly Flow earned.
- **NEXT:** Leftover play is finished. Overall verdict **PASS**. Parent can take the 2-line Manager summary. Do not publish unless asked.

**Written:** 2026-11-14, about 7:26 PM America/New_York. `origin/main` verified at `5cefad053f7fa617368bf1a82ee4697e814bcb1a` (“PB-05: pick Strikes, Seals and Kata from Fighting Style (#472)”, merge 2026-11-14 7:19:54 PM America/New_York). Parent of the merge: `8849fbf2`. The last PR head `2d7a639fd3863687e9836124ab617ffe7b921eff` (“Merge branch 'main' into bot-code/pb-05”) shares the same tree `d16fdc13` as the merge commit.

## Live build and pins

Live: https://dojo-ascent.jay-lindemuth.workers.dev/

- HTML has no git SHA. The index bundle is `./assets/index-C42Fx_Sv.js`.
- That JS has no git SHA either. The title-screen label is `Version: ${i}` with `i = new Date('2026-11-15T00:20:55.023Z').toLocaleString(..., { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })`. In America/New_York that is **Version: Nov 14, 7:20 PM**.
- Cloudflare Workers check **Workers Builds: dojo-ascent** on `5cefad05` concluded success at 2026-11-14 7:21:18 PM America/New_York. Version ID: `bd5d4cde-f694-4901-8ece-155462089fba`.
- **A pin for this production version exists and is byte-identical to live:** https://bd5d4cde-dojo-ascent.jay-lindemuth.workers.dev/ (same `index-C42Fx_Sv.js`, sha256 `7edc731735251180f7f86dd196965239b9393fc2f8eb04b72e26f6b531cf4e57`, same `__BUILD_TIME__` `2026-11-15T00:20:55.023Z`). Play either URL.
- The #472 preview table’s latest branch pin is https://ee580ead-dojo-ascent.jay-lindemuth.workers.dev/ for `2d7a639` (same tree, BUILD_TIME `2026-11-15T00:19:23.131Z`, different hashed chunks). That is **not** a `5cefad05` pin. The older #472 pins (`f3393634` = `c430d454`, `eb6242ab` = `f695ff43`) are prior heads.

**URL to play:** https://dojo-ascent.jay-lindemuth.workers.dev/ (frozen alias: https://bd5d4cde-dojo-ascent.jay-lindemuth.workers.dev/).

## Counts

**PB-10 (24):** COVERED **13** · STATIC **7** · NEEDS-PLAY **4**

| Label | Cases |
|---|---|
| COVERED | 1, 3, 5, 6, 7, 8, 10, 11, 12, 13, 21, 22, 23 |
| STATIC | 2, 4, 9, 14, 16, 17, 24 |
| NEEDS-PLAY | 15, 18, 19, 20 |

**G2B-06 fold-in (12: cases 1–4, 9–14, 21–22):** COVERED **1** · STATIC **6** · NEEDS-PLAY **5**

| Label | Cases |
|---|---|
| COVERED | 1 |
| STATIC | 9, 10, 11, 12, 13, 14 |
| NEEDS-PLAY | 2, 3, 4, 21, 22 |

Already-passed G2B-06 cases 6–8 (legacy Strike ids and pre-Throw) were not rerun as play. Their sim tests were part of the STATIC suite on `5cefad05` and still pass. G2B-06 5, 15–20, 23–24 were not in this fold-in list.

## STATIC results (run on main `5cefad05`)

One shallow clone at `/tmp/dojo-pb10-static`, then deleted. Vitest reused the existing `/workspace/pb05/node_modules` (read-only). No files in the game repo were edited. The kata tray count was a temporary probe file that was deleted before the clone was removed.

**10 files, 99 tests, all PASS** at 7:24:58 PM America/New_York, duration 1.09s:

`p-prog-a-loadout-save.test.ts` (8), `p-prog-f-migration.test.ts` (12), `p-prog-b-seal-slots.test.ts` (15), `p-prog-d-strike.test.ts` (23), `p-prog-g-style-screen.test.ts` (12), `p-prog-h-no-pressure-words.test.ts` (1), `b-safe.test.ts` (8), `r-challenge-p6-belt4-lock.test.ts` (6), `g2b-04-throw.test.ts` (9), `g2b-04-thrown-look.test.ts` (5).

| Case | Result | Evidence (this run / source) |
|---|---|---|
| PB-10 2 Old `{ form }` save | **PASS** | `p-prog-a`: “an old { form } save loads (the R-STANCE-a shape) and keeps its fixture shape”; junk / missing fields are not an error. No Testing fixture for this shape, so this stays STATIC. |
| PB-10 4 Odd ids (and G2B-06 6–7 mapping) | **PASS** | `p-prog-a`: odd ids dropped, never an error. `p-prog-d` / `p-prog-b`: `quick-combo` → Jumping Spins, `follow-up-kick` → Spin Kick / empty default. The Strike *card* showing the resolved name was not photographed; no easy Testing row seeds those legacy ids. Rules are proven; the card visual is not a NEEDS-PLAY item because there is no supported seed path on the deployed Testing list. |
| PB-10 9 Unearned / over-cap cleanup | **PASS** | `p-prog-b` normalizeLoadout: unearned picks dropped, extras past `sealSlots` dropped from the end, Yellow 2 / Orange 3. |
| PB-10 14 Lock is “Coming later” | **PASS** | `p-prog-g` on White, Yellow and Orange: `trays.seal` id `lock` has `line === 'Coming later'` and `comingLater === true`. Equip filter skips `comingLater`. Shipped string is in `content/abilities/fighting-style.json`. No evidence PNG of the painted tray line was in `/workspace/evidence/`; this is still STATIC, not a play rerun. |
| PB-10 16 White kata placeholder | **PASS** | PB-04 wait is **lifted** on this main: White tray is one earned pick, `basic-form-1` / “Basic Form 1” / line **“Power coming soon”**. `p-prog-g`: equipping it does not change fight `effects` or `strike`. Empty card pick is allowed (default `pick` is null). |
| PB-10 17 Orange up to three kata | **PASS** | Probe on `5cefad05` (not a committed test): Orange tray is **3** earned picks — Basic Form 1, Basic Form 2, Keon — each with “Power coming soon”. One Kata card only, so only one can be equipped. Yellow has 2; Green has 4 (after beta, not required). |
| PB-10 24 Wipe clears the loadout | **PASS** | `b-safe`: wipe removes every `dojo-ascent-` key, including `dojo-ascent-profile-v1` (the v2 loadout lives there), then confirm + `wipeAllData()` + reload. Other-app keys are left alone. |
| G2B-06 9–13 Throw rules | **PASS** | `g2b-04-throw`: #11 throws a brute 1 tile, down 30 ticks, then up; #12 +25% while down; no throw without #11; Guardian and elite never thrown; only brutes and swarmers are throwable. These were waiting on the picker for a play pass; the sim already proves the pass lines, so they were not sent to the browser. |
| G2B-06 14 RM Throw look | **PASS** | `g2b-04-thrown-look`: Reduced motion — no tumble or slide, lying from the first frame, snaps back up; GameScene turns the art (not the health bar) and reads the setting. |

Supporting STATIC facts also used by COVERED cases (not replayed): `p-prog-f` seed is once-only, stance/virtue kept, first-N seals, kata empty, Power/Health unchanged, note dismissed stays dismissed; `p-prog-g` 2/2/3 Seal cards, ≤3-tap equip (arrows still not counted in that unit test), swap + Cancel, 44 pt on both phone sizes, no digits except the live Self-Defense #4 label; `p-prog-h` no pressure/timer/price words; `r-challenge-p6` Challenge locked below tier 4; `p-prog-d` White has no earned extra Strike, Yellow has Jumping Spins, a locked Strike changes nothing, an earned Strike is the one the fight uses.

## COVERED cases (do not replay)

Evidence builds: #472 heads `8092ca9b` / `891757c4` / `f695ff43` under `/workspace/evidence/`; later head `c430d454` under `/workspace/evidence/c430/` and `/workspace/pb05-handoff/c430d454-shots/` (harness log `board-oldsave.txt`, 56 PASS / 0 FAIL at both sizes, RM on and off). Those #472 commits are in the squash that became `5cefad05`. Contrast fix and note-inside-panel from `f695ff43`, Testing-beside-Practice and Old save row from `c430d454`.

| Case | Why it is already proven | Exact evidence (build) |
|---|---|---|
| PB-10 1 Old `{stance, virtue}` save | Seed rules in `p-prog-f` (just confirmed). Deployed Old save row now reaches the real `seedLoadout`. Orange note + three filled Seals seen at both sizes. “Start a room” was not photographed; fight-setup tests already say a seeded Strike is the one the fight uses. Not sent back to the browser. | `/workspace/evidence/c430/B_Orange_old-save-note_{667x375,844x390}_r3.png`, `B_Orange_help_after_gotit_844x390_r3.png`, `B_Orange_after_reload_844x390_r3.png` (`c430d454`). Harness: `/workspace/pb05-handoff/c430d454-shots/board-oldsave.txt` and `note-*.png` / `after-got-it-*.png`. |
| PB-10 3 Seed is once-only | `p-prog-f`: seed twice is a no-op; dismissed note stays away after reload. After Got it, the note is gone; after reload it stays gone and a later help line shows instead. | Same c430d454 files as case 1. After Got it: help “Tap a slot, then pick a Seal.” After reload: “Tap a card, then tap a pick.” Note does not return. |
| PB-10 5 First-N Seals + note wording | Shipped line is exact plan text. Seen at 667×375 and 844×390, Got it on screen, no “you lost power.” Harness seed on Orange: `seals=["escape","counter","advancing"]`. | Same `B_Orange_old-save-note_*` shots. Words: “Your Seals now go in slots. We picked your first ones. Change them any time!” |
| PB-10 6 White: two Seal slots | Two open Seal cards; third is a quiet “Orange Belt” lock (same lock picture as the Lock family — already noted, not a new bug). | `/workspace/evidence/White_667x375_{StrikeEquipped,SealPage2,SealSwapCancel}.png` (`8092ca9b`); White FirstVisitHelp / Escape shots (`f695ff43`). |
| PB-10 7 Yellow: still two slots | Third Seal card reads “Orange Belt”; not an open third slot. | `/workspace/evidence/Yellow_844x390_LockedSeal.png` (`891757c4`); `/workspace/evidence/c430/C_Yellow_new-dots_667x375_r3.png` (`c430d454`, third card still the lock). |
| PB-10 8 Orange: three Seal slots | Three open Seal cards on FS and on the Old save note shots. Fourth requires a swap (tests + earlier Orange swap report). | `/workspace/evidence/Orange_{667x375,844x390}_FS_RM{off,on}.png` (`f695ff43`); c430d454 Old save note shots. |
| PB-10 10 Free slot, ≤3 taps, no numbers | White page-1 picks in 2 taps; Orange page-2 earned picks in 3 actions; cards show name/picture; D6 no numbers on the preview (also `p-prog-g` / `p-prog-h`). | White `StrikeEquipped` / `SealPicker` / `StancePersisted` (`8092ca9b`); Yellow FS / EquippedSeal (`891757c4`); Orange FS (`f695ff43`). |
| PB-10 11 Full slots ask before swap | “Swap with which one?” (or shipped equivalent) + no silent add. Designed Guard→Counter after a slot tap is a targeted swap, not a silent replace. | `/workspace/evidence/White_667x375_SealSwapCancel.png` (`8092ca9b`); `p-prog-g` swap test. |
| PB-10 12 Cancel swap | Cancel leaves the loadout unchanged. Painted Cancel fill 70×42 at (566,241)–(635,282); source-inferred hit 72×44 (PNG does not prove the pad). | Same `White_667x375_SealSwapCancel.png`. |
| PB-10 13 Remove + persist | White Escape Take out, then empty after reload. Painted Take out fill 70×42 / stroke-incl 74×46 on `White_844x390_EscapeTakeout.png`; source-inferred 72×44. | `/workspace/evidence/White_844x390_EscapeTakeout.png`, `White_844x390_EscapeRemovedAfterReload.png` (`f695ff43`). |
| PB-10 21 RM ON, Fighting Style | Setting read back ON; FS still works; RM on skips the New-dot pulse (dots stay). Prior Orange FS both sizes RM on. | `/workspace/evidence/Orange_{667x375,844x390}_FS_RMon.png`, `Yellow_844x390_NewDots_RMon.png`, Settings `*_RMon.png` (`f695ff43`); `/workspace/evidence/c430/D_RM_on_844x390_r3.png` and `frame01–03` (`c430d454`). G2B-06 boot / boss zoom is a different case (below). |
| PB-10 22 RM OFF | Setting read back OFF; motion allowed; FS still works. | `/workspace/evidence/Orange_{667x375,844x390}_FS_RMoff.png`, `Yellow_844x390_NewDots_RMoff_{start,mid,end}.png` (`f695ff43`); `/workspace/evidence/c430/D_RM_off_844x390_r3.png` and `frame01–08`. Pulse *timing* on the 844 New-dot set is still unverified; the case does not require a timed phase proof. |
| PB-10 23 Both sizes, 44 pt, no numbers | Equip / swap / layout already walked at 667×375 and 844×390. Tray tiles, arrows (stroke-incl 46×46), switch, Take out / Cancel measured. New dots now also at 667 (`C_Yellow_*667x375*`). `p-prog-g` keeps cards/tray ≥44 pt; `p-prog-h` has no pressure digits on the new lines. | Combined `#472` evidence folders above, plus `/workspace/evidence/c430/C_Yellow_FS_new-markers_667x375_r3.png`, `C_Yellow_new-dots_667x375_r3.png`, `C_Yellow_Stance_opened_dot-cleared_844x390_r3.png`. |
| G2B-06 1 White Strike default | Open Strike: Spin Kick selected; Jumping Spin Kicks and Butterfly Kick are in the tray; Butterfly Kick opens the lock sheet (“Learn this at the dojo” / “Ask Sensei about this one” / Close). Documented #460 names (Jumping Spin Kicks / Butterfly Kick), not a fail. | `/workspace/evidence/White_667x375_StrikeEquipped.png`, `White_667x375_ButterflyLock.png` (`8092ca9b`). |

Challenge *lock* below the 4th belt (part of PB-10 20) is already proven and must not be replayed on White/Yellow/Orange: `/workspace/evidence/Orange_667x375_RM_ON.png` shows a locked Challenge card, “Opens when you earn your Green Belt!” (shipped `difficulty.json` `locked.challenge`), Steady selected. `r-challenge-p6` PASS on this main. Only the Green unlock + room leftover is NEEDS-PLAY.

## NEEDS-PLAY leftovers (do not rerun COVERED / STATIC work)

| Case | What is still unproven | Profile |
|---|---|---|
| G2B-06 2 | Yellow Strike card: Jumping Spin Kicks earned; Butterfly Kick still locked. No Yellow Strike-tray PNG in the earlier set (Yellow shots were Stance / Seals). | `3-yellow-belt` |
| G2B-06 4 | On that same Yellow open, try Butterfly Kick; equip is refused / sheet only; loadout unchanged. | `3-yellow-belt` (same visit as 2) |
| G2B-06 3 + PB-10 15 leftover | Equip Butterfly Kick, survive a reload, and have the fight use it. **`6-orange-typical` cannot do this** (Kick Combo 3 is unsigned; earlier #472 Orange UI correctly showed Butterfly locked). Stock fixture with Butterfly Flow earned: `4-green-belt`. Log the fixture gap; do not invent a signed Orange. Yellow Jumping Spins persist was already reported on `891757c4` — do not rerun that half except the tray check in G2B-06 2. | `4-green-belt` |
| PB-10 18 | Guided, equipped loadout, one **ordinary** room (not a Throw check). Loadout is in the fight; Guided does not auto-equip or auto-swap; wind-ups stay readable. | `3-yellow-belt` after the Strike tray check |
| PB-10 19 | Same loadout on Steady (internal `standard`). Difficulty change does not reset slots; enter a room once. | same Yellow profile |
| PB-10 20 leftover | From the 4th belt, pick Challenge, keep a filled loadout, enter a room; no purchase / pressure prompt. Do **not** recheck the below-Green lock. | `4-green-belt` |
| G2B-06 21 | RM ON, **kill the tab / reopen**, setting still ON, **boss zoom-out does not run**. Throw look is already STATIC (`g2b-04-thrown-look`). Do not retest the Fighting Style tray. | any; Settings is global |
| G2B-06 22 | RM OFF, read back, in a room confirm Strike / Counter flash / telegraph pulse still play; nothing stuck blank. | same session after 21 |

OV-T2 kid-bot rates (`/workspace/dojo-qa-notes/OV-T2-orange-white-guided.md`, SHA `fecfdb60`) are **not** used as proof that a human loadout appears in a room.

## Browser brief (NEEDS-PLAY only)

Play URL: https://dojo-ascent.jay-lindemuth.workers.dev/ (or the pin https://bd5d4cde-dojo-ascent.jay-lindemuth.workers.dev/). Confirm the title **Version: Nov 14, 7:20 PM**.

**Keep the game tab focused. Wait for the tab art to paint before tapping.** Sizes **667×375** and **844×390**. Save everything to **`/workspace/evidence/pb10/`** with case, profile, size, and RM in the filename.

Do **not** redo Old save / Got it, Seal slot caps, swap, Cancel, Take out, Help, New dots, White Spin Kick, FS Reduced motion, the Challenge lock below Green, wipe, kata placeholders, or Throw-rule rooms.

**Profiles (Testing sits beside Practice room, non-beta build):**

- `3-yellow-belt` (Sam) — G2B-06 2 and 4, then PB-10 18–19.
- `4-green-belt` — G2B-06 3 + PB-10 15 leftover (Butterfly Kick), then PB-10 20. Do not use `6-orange-typical` for Butterfly.

**Steps, 667×375 first, then the same leftovers at 844×390:**

1. Title → Dojo / Training Board. Wait for the board and tab art to paint. Testing (beside Practice) → `3-yellow-belt`.
2. Home → Fighting Style → Strike card. Confirm **Jumping Spin Kicks** is earned. Tap **Butterfly Kick**: lock sheet, Close, loadout still Jumping Spin Kicks (G2B-06 2, 4). One shot of the open tray, one of the lock sheet.
3. Settings → **Guided**, read it back. Enter the Tower or Practice, **ordinary** room. Confirm the equipped loadout is in the fight, Guided does not auto-swap, wind-ups stay readable (PB-10 18). One in-room shot.
4. After the room, Settings → **Steady**, confirm the same Strike / Seals are still equipped, enter a room once (PB-10 19).
5. Testing → `4-green-belt`. Fighting Style → Strike → equip **Butterfly Kick**. Reload (keep the tab focused; wait for tab art). Confirm it is still equipped, then enter a room and confirm that Strike is the one used (G2B-06 3, PB-10 15).
6. Still on Green: Settings → **Challenge** should be unlocked. Pick it, keep the filled loadout, enter a room. No purchase or pressure prompt (PB-10 20).
7. Settings → **Reduced motion On**, read it back. Kill the game tab, reopen the same URL, keep it focused, wait for tab art. Confirm RM is still On. Enter a boss room and confirm the boss zoom-out does **not** run (G2B-06 21).
8. Settings → **Reduced motion Off**, read it back. In a room, confirm Strike / Counter flash / telegraph pulse still play; no stuck blank frames (G2B-06 22).

Pass = the leftover pass line is true. Fail = write what you saw; do not almost-pass. Use shipped names (Jumping Spin Kicks / Butterfly Kick) without failing the documented rename.
## Scripted leftover play (finished 2026-11-14, 10:11 PM America/New_York)

Read-only Playwright on live main. Hook does **not** wipe `localStorage` on a later page in the same context. Settings was opened only after the Home Dojo was in `mode === 'play'` (the known stuck-HUD bug if Settings is opened during arrival). No game code was edited. No one was messaged. COVERED / STATIC rows and already-PASS leftovers (Yellow Strike tray, 667 Steady / Butterfly / Challenge) were not replayed.

### Build played

- **URL:** https://dojo-ascent.jay-lindemuth.workers.dev/
- **Title:** **Version: Nov 14, 10:03 PM** at both 667×375 and 844×390 (`lo-667x375-title.png`, `lo-844x390-title.png`).
- **Bundle:** `./assets/index-DqhWhEQF.js`, `__BUILD_TIME__` `2026-11-15T03:03:33.687Z` = 10:03:33 PM America/New_York.
- **Matches current `origin/main`:** `4302658f4c4fc7ac8ccd3be5da8359552da60d4c` (“OV-B7: grown-up belt fix behind the gate (#498)”), committed 2026-11-15 10:02:33 PM America/New_York.

Earlier leftover attempts on Version: Nov 14, 9:26 PM (`2bb3046c`) and a stopped follow-up on 9:31 PM (`83cb6c1e`) are superseded by this finish pass for the leftover rows below. The 7:20 PM / `5cefad05` pin was not the build played.

### Leftovers finished

| Item | Status | Evidence |
|---|---|---|
| (a) PB-10 18: Guided wind-ups readable after Bow, one ordinary room | **PLAY: PASS** at 667×375 | Settings → Guided opened in play mode. After Bow, `training-yard` (`kind=battle`, not tutorial) used `guided` and `jumping-spins`; loadout unchanged. 44 wind-up samples; telegraph alpha 0.25–1. Shot `lo-667x375-guided-windup.png`: Sensei “Look! A red circle.”, a red danger circle, and a “!” cue, all readable. Loadout + Guided difficulty were already PASS at 844 on the earlier pass. |
| (b) 844 Steady room | **PLAY: PASS** | Settings → Steady (`standard`). After Bow, `bamboo-hall` used `jumping-spins` and the same Yellow loadout (`counter` / `guard`). `lo-844x390-steady-room.png`. Completes PB-10 19 (667 was already PASS). |
| (b) 844 Green Butterfly fight | **PLAY: PASS** | Testing → Green (`4-green-belt`). Equipped Butterfly Kick (`butterfly-flow`). After Bow, `lantern-room` used `setup.strike.id=butterfly-flow`. `lo-844x390-bfly-room.png`. Completes G2B-06 3 / PB-10 15 (667 was already PASS). |
| (b) 844 Challenge entry | **PLAY: PASS** | Challenge unlocked and picked; Butterfly loadout kept. After Bow, `pillar-court` ran at `difficulty=challenge` with `butterfly-flow`. No purchase / price / “buy now” words. `lo-844x390-challenge-room.png`. Completes PB-10 20 (667 was already PASS). Below-Green lock was not rechecked. |
| (c) G2B-06 21: RM On persists after close/reopen; keepers-hall zoom-out does not run | **PLAY: PASS** at 667×375 | Settings → **Reduced motion: On**, `dojo.reducedMotion=on`. Closed the page and opened a new one in the **same context** (storage kept): key still `on`, Settings still read “Reduced motion: On” (`lo-667x375-rm-persist-settings.png`). `?room=keepers-hall` after Bow: Floor Keeper present. A first sample left the Keeper off-camera (`bossSeen=false`) — not enough on its own. A walk brought the Keeper into view (`bossSeen=true`, `inView=true`, chase). **`bossZoom` stayed 1** for 60 samples (min=1 max=1); held room zoom was a flat 1.0417, not the intro dip. `fx-keepers-late.png` shows the Floor Keeper on screen with RM On. |
| (d) G2B-06 22: RM Off; Strike / Counter flash and telegraph pulse (measured across frames) | **PLAY: PASS** at 667×375 | Settings → **Reduced motion: Off**, `ls=off`. A first Practice-room try did not catch a wind-up (the dummy was still off-screen for most of the window); that was a script miss, not a product fail. Retry in ordinary `narrow-bridge` after Bow: 96 wind-up samples, 111 telegraph-alpha readings, range **0.25–1**, **37 rises and 36 falls**. In the Counter window the layer oscillated **0.7 / 1.0**, which is the shipped in-window pulse (`sin(now/45)`). `flashPlayed=true`. COUNTER fill varied `[3110099, 7317759, 3030101]`. Shot `fx-off-windup.png`: red circle, “!” cue, Sensei “Look! A red circle.” |

Evidence folder: `/workspace/evidence/pb10/scripted/` (`pb10-leftovers.mjs`, `leftover-results.txt`, `pb10-leftovers-fx.mjs`, `leftover-fx-results.txt`, and the `lo-*` / `fx-*` PNGs).

No leftover is a product **FAIL**. No BLOCKS PLAY / ANNOYING / SMALL bug is filed from this finish pass.

### PB-10 24-case fold-in

| Case | Kind | Status |
|---|---|---|
| 1 Old `{stance, virtue}` save | COVERED | PASS |
| 2 Old `{ form }` save | STATIC | PASS |
| 3 Seed is once-only | COVERED | PASS |
| 4 Odd ids | STATIC | PASS |
| 5 First-N Seals + note wording | COVERED | PASS |
| 6 White: two Seal slots | COVERED | PASS |
| 7 Yellow: still two slots | COVERED | PASS |
| 8 Orange: three Seal slots | COVERED | PASS |
| 9 Unearned / over-cap cleanup | STATIC | PASS |
| 10 Free slot, ≤3 taps, no numbers | COVERED | PASS |
| 11 Full slots ask before swap | COVERED | PASS |
| 12 Cancel swap | COVERED | PASS |
| 13 Remove + persist | COVERED | PASS |
| 14 Lock is “Coming later” | STATIC | PASS |
| 15 Butterfly Kick persist + used in fight (Green leftover) | PLAY | **PASS** (667 earlier; 844 fight this pass) |
| 16 White kata placeholder | STATIC | PASS |
| 17 Orange up to three kata | STATIC | PASS |
| 18 Guided ordinary room, loadout kept, readable wind-ups | PLAY | **PASS** (667 after Bow this pass; loadout + Guided difficulty already at both sizes) |
| 19 Steady, same loadout, one room | PLAY | **PASS** (667 earlier; 844 room this pass) |
| 20 Green Challenge unlocked, keep loadout, enter, no purchase prompt | PLAY | **PASS** (667 earlier; 844 enter this pass). Below-Green lock remains COVERED, not replayed. |
| 21 RM ON, Fighting Style | COVERED | PASS |
| 22 RM OFF, Fighting Style | COVERED | PASS |
| 23 Both sizes, 44 pt, no numbers | COVERED | PASS |
| 24 Wipe clears the loadout | STATIC | PASS |

### G2B-06 fold-in (cases 1–4, 9–14, 21–22)

| Case | Kind | Status |
|---|---|---|
| 1 White Strike default | COVERED | PASS |
| 2 Yellow Strike tray: Jumping Spin Kicks earned, Butterfly locked | PLAY | **PASS** (both sizes, earlier leftover pass) |
| 3 Equip Butterfly Kick, reload, fight uses it | PLAY | **PASS** (667 earlier; 844 fight this pass) |
| 4 Yellow Butterfly lock sheet, Close, loadout unchanged | PLAY | **PASS** (both sizes, earlier leftover pass) |
| 9–13 Throw rules | STATIC | PASS |
| 14 RM Throw look | STATIC | PASS |
| 21 RM On persist after tab close; keepers-hall zoom-out does not run | PLAY | **PASS** (persist + in-view Floor Keeper, `bossZoom` stayed 1) |
| 22 RM Off: Strike / Counter flash and telegraph pulse still play | PLAY | **PASS** (pulse measured across frames: 0.7/1.0 in the Counter window; hit flash played) |

### Overall verdict

**PASS.** All 24 PB-10 cases and the listed G2B-06 fold-in cases are PASS (COVERED, STATIC, or PLAY). No product FAIL.
