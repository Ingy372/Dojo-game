# Dojo Ascent — Work Board

Last updated: 2026-11-25 by Claude Code.

**What this file is:** the one list of open work. Each item has an ID, an owner and what it waits on. If this file and `docs/decisions.md` disagree, `docs/decisions.md` wins.

**Owners (from Nov 17):** Jay · Claude Code · Nic (DojoForge, outside this repository). The Grok bot team is retired. Their last board (items up to #547) is on the `bot-manager` branch and in this file's git history.

---

## 1. Jay

| ID | What | Unblocks |
|---|---|---|
| B-ACCT | Create the Apple Developer and Google Play Console accounts: step by step in `docs/store-accounts.md` (Nov 22). | Phone app builds, TestFlight, Play testing |
| B-LAW | Book the lawyer; show them `drafts/planning/BETA-parent-note.md` and `BETA-privacy-page.md`. | Store builds |
| B-TESTERS | Pick 5–10 families; each parent's Apple or Google email and their OK. | Beta invites |
| J13 | The after-work curriculum list (self-defense #36–40, kick combos 8–12, kata character lines, Lock group names, founding story). Not blocking. | Kata powers, Seals #36–40, quests |
| J-ART | Look at Claude's art attempts as they come. | New art in the game |

## 2. Claude Code: first week (Nov 17–23)

| ID | What | Status |
|---|---|---|
| CW-1 | Line endings, the type-check error, automatic checks on GitHub, Class Chest gear limit. | Done (branch `claude/first-week-fixes`) |
| CW-2 | CLAUDE.md, this board, decisions and progress updated for the hand-over. | Done |
| CW-3 | Full hands-on playthrough on small and large phone sizes (new student, White, Yellow, Orange profiles); list every bug and rough spot. | Done Nov 22: `docs/reviews/playtest-2026-11-22.md` (8 fixes on branch `claude/playthrough-fixes`, 7 polish items for Jay) |
| CW-4 | Measure the download and what loads at start; load art per belt if it isn't already. | Next |

## 2a. Jay's overnight list (Nov 17-18)

| ID | What | Status |
|---|---|---|
| N1 | Dojo as the main hub; training station for run stats, gear and style. | Done |
| N2 | Walk south out of the dojo into a walkable town, and back. | Done |
| N3 | Premium Equipment screen. | Done |
| N4 | Desktop (Windows) and tablet support. | Done |
| N5 | Full playtest; yellow-! notes and weak spots, to discuss. | Notes ready: `docs/reviews/playtest-notes-2026-11-18.md` |
| N6 | Art clean-up of the weakest art. | Station art approved and in the game (top-right corner); tatami turned down |

## 2b. Jay's tutorial playtest (Nov 18)

| ID | What | Status |
|---|---|---|
| T1 | Story reason for the falling stones. | Building |
| T2 | Stones: 5 waves (1, 3, 3, 4, 5), one always on the player. | Building |
| T3 | The bow happens on a mat at the Tower door, facing it. | Building |
| T5 | The Opening (fix A) and a small "!" (fix C). Then Jay playtests again; monster wind-up animations may need a redesign after. | Building |
| T6 | Full tutorial from start to finish, Home Tour, First Week: `docs/tutorial-design.md`. | Draft, waits on Jay's OK |

## 2c. PINNED: Blender art upgrades for later (Jay, Nov 18)

Jay has a few more visuals to list here.

| ID | What | Status |
|---|---|---|
| ART-CHEST | Treasure chest: redo in Blender so it feels special (Jay: "bland and boring"). | Chest v2 built Nov 18 and in the game (new Blender chest, coins, charge ring, reveal card); waiting for Jay to look at it on a phone (Nov 22) |

## 2d. Visual overhaul (Jay, Nov 22; branch `claude/visual-overhaul`)

| ID | What | Status |
|---|---|---|
| VO-1 | Hero v2 look (all animations, both bodies) | Done, on `main` (Jay OK'd Nov 23) |
| VO-2 | Skins: 10 outfits, 9 hats, 5 back pieces | Done, on `main` (Jay OK'd Nov 23) |
| VO-3 | Shop redesign, 10 auras, 6 pets | Done, on `main` (Jay OK'd Nov 23) |
| VO-4 | Boss forms: Inferno Hearth, Warden Unbound, the final Guardian's 3 forms | Done, on `main` (Jay OK'd Nov 23) |
| VO-5 | 16 shop decorations, 10 achievement trophies | Done, on `main` (Jay OK'd Nov 23) |


## 2e. Pro shop, social town and coins (Jay, Nov 23; branch `claude/shop-hub`)

| ID | What | Status |
|---|---|---|
| SH-1 | Shop at the Action Zone pro shop counter; Miss Hannah behind it | Built; Hannah's name and lines wait on Jay's OK |
| SH-2 | Staff art for Jay, Hannah, Michael (hero v2 style) | Built; waits on Jay's OK; where Jay and Michael stand is Jay's call |
| SH-3 | Sell tab (Hannah buys gear) | Built |
| SH-4 | Phrases (15, draft) and parties in town | Built with pretend classmates; real players need the game server (later) |
| SH-5 | Coin economy and the Wish (docs/economy.md) | Built; numbers wait on playtesting |

## 2f. Grok playtest (Nov 23 report; branch `claude/playtest-fixes`)

| ID | What | Status |
|---|---|---|
| GP-1 | Batch 1: live link hides Testing, grown-up check, invites Off, tap fixes, shop decor to storage, Home Dojo fixes | Built Nov 24; waits on Jay's phone test and OK for `main` |
| GP-2 | Defeat screen | Jay, Nov 24: no change |
| GP-3 | No automatic blocking (Mash guard off; Guided enemies 0.7) | Built Nov 24; waits on Jay's phone test |
| GP-4 | Town mini map and door signs with pictures (no Home button, Jay) | Built Nov 24; icons wait on Jay's OK |
| GP-5 | Kata Watch first (voice) and Hint (pays 3 coins) | Built Nov 24; words wait on Jay's OK |
| GP-6 | Re-measure the coin table with BALANCE=1 (fights changed) | Next |

## 3. Claude Code: beta (freeze Dec 4, families Dec 15)

| ID | What | Waits on |
|---|---|---|
| B-FIX | Fix every blocker found in CW-3. | CW-3 |
| B-CI | Cloud builds: signed iPhone build (GitHub macOS runner) and Android build. | B-ACCT |
| B-BETAREV | First build to TestFlight external testing and Play internal testing. | B-CI, B-LAW |
| B-WEB | Beta web link as the fallback: a beta build at its own address, with the "Add to Home Screen" steps for parents. | Jay's OK to publish |
| B-QA | Final beta pass, small and large phones; report READY. | B-FIX |

## 4. Claude Code: polish (Jay, Nov 17: "a polish on most of the game")

Order to be agreed with Jay after CW-3. Candidates:
- Replace the marked placeholder words, rings and icons.
- Split `GameScene.ts` and `HomeScene.ts` into smaller pieces; turn source-wording checks into behaviour tests.
- Game feel and menus, screen by screen, from the CW-3 notes.
- Art attempts (Jay asked Claude to try), starting small.

## 4a. Tool Belt (Nov 24)

| ID | What | Status |
|---|---|---|
| TB-1 | Stage 1: tools #1–15, KATA button (3 kata moves), pockets, damage shift | Built on `claude/tool-belt`; waits on Jay's preview and OK |
| TB-2 | Stage 2: tools #16–40, kicks 4–7, second kick button, 6 more kata moves | Waits on TB-1 OK; content draft for Jay first |
| TB-3 | Blender art: kata moves, Jumping Spins and Butterfly Kick, kicks 4–7 | Waits on Jay |

## 5. After the beta, toward the April launch

From `drafts/planning/R-OVERHAUL-LAUNCH.md`: L11 belts 4–10 in the Tower (floor sets are built but switched off), L12 the DojoForge connection and server saves (needs Nic; asks collected in `drafts/planning/NIC-ASKS.md`), L9 Sensei's Trials, L17 Street Smarts (Jay approves each script), L19 voice on cards, L2b Stars, kata powers through Nahanchi, L15 gear looks, L18 technique videos, L3 chapters.

## 4c. Yellow Guardian: the Loom Keeper (Jay, Nov 25; branch `claude/yellow-guardian`)

| ID | What | Status |
|---|---|---|
| YG-1 | Thread and cloth attacks, the Loom Keeper, the 8 Sunrise Garden rooms, balance | Built Nov 25, then redesigned the same day (Jay: not like the tutorial boss): distance fighter, Spool Toss, sticky threads, loom phase with Spool Pegs; waits on Jay's phone test and OK of the loom-phase line |
| YG-2 | Blender model and animations (replaces the grey-lilac stand-in) | Built Nov 25 and in the game on the branch; waits on Jay's OK (`incoming-art/claude-guardians/loom-keeper/review-sheet.png`) |
| YG-3 | Monster Journal trophy for the Loom Keeper | With YG-2 (needs a picture) |
| YG-5 | Blender art for the Spool Pegs (gold practice dummy for now) | Waits on Jay |
| YG-4 | Miss Ada (draft name) and her shop reopening in town; the blanket at the Yellow Gate | With the story chapters (SC-3 and later) |
