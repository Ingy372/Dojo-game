# Dojo Ascent — Work Board

Last updated: 2026-11-18 by Claude Code.

**What this file is:** the one list of open work. Each item has an ID, an owner and what it waits on. If this file and `docs/decisions.md` disagree, `docs/decisions.md` wins.

**Owners (from Nov 17):** Jay · Claude Code · Nic (DojoForge, outside this repository). The Grok bot team is retired. Their last board (items up to #547) is on the `bot-manager` branch and in this file's git history.

---

## 1. Jay

| ID | What | Unblocks |
|---|---|---|
| B-ACCT | Create the Apple Developer and Google Play Console accounts (steps in the Nov 17 session summary; see also decisions.md, Nov 17). | Phone app builds, TestFlight, Play testing |
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
| ART-CHEST | Treasure chest: redo in Blender so it feels special (Jay: "bland and boring"). The chest's code effects stay as they are until then. | Later |


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

## 5. After the beta, toward the April launch

From `drafts/planning/R-OVERHAUL-LAUNCH.md`: L11 belts 4–10 in the Tower (floor sets are built but switched off), L12 the DojoForge connection and server saves (needs Nic; asks collected in `drafts/planning/NIC-ASKS.md`), L9 Sensei's Trials, L17 Street Smarts (Jay approves each script), L19 voice on cards, L2b Stars, kata powers through Nahanchi, L15 gear looks, L18 technique videos, L3 chapters.
