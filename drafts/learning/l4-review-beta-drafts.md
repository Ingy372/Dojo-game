# L4 review: beta drafts (parent note, privacy page, TestFlight/Play text)

## Delivery Note
- **ITEM:** L4, a tone and accuracy review of `drafts/planning/BETA-parent-note.md`, `BETA-privacy-page.md` and `BETA-testflight-text.md` (merged in #236).
- **WHAT:** A verdict for each draft, plus fixes ranked must / should / nice. Each fix quotes the exact line and gives a suggested rewrite. I did not edit the drafts.
- **WHY:** Parents of children aged 6 and up get these first. They need to be plain, warm and honest, and to match `docs/decisions.md` and `docs/progress.md`.
- **DECIDE:** (1) Should the parent note tell families about the faith content (verses, creed, read-aloud)? I say yes. (2) Is the scripture read-aloud (J9) built yet? The privacy page has to name it if it is. (3) The privacy wording questions in section 4 go to the Researcher & Planner or the lawyer, not to me.
- **NEXT:** The owner of drafts/planning applies the must-fixes before the lawyer looks on Dec 7. I can re-check after that if asked.

## Verdicts
| Draft | Verdict | Why |
|---|---|---|
| Parent note | **Pass with changes** | Warm, with no pressure ("Play when your child wants to, or not at all" is excellent). It never mentions the faith content, and it doesn't describe the play-time limit. |
| Privacy page | **Pass with changes (tone only)** | Clear short version. It shows code words to parents and names read-aloud for Street Smarts only. |
| TestFlight / Play text | **Change** | The review notes describe the grown-up gate wrongly ("multiplication"). The decided gate is a sum. |

The good parts: no hype, FOMO, urgency or guilt in any draft. "No ads, purchases, chat or accounts" matches the rules. Tagging planned items (B-BELT, B-SAFE) is honest.

## 1. Must-fix
**M1. TestFlight review notes: the gate is described wrongly.**
Line: "Settings is behind a math question that a young child is unlikely to answer (for example, a multiplication)."
decisions.md (M7-P9 update): the gate is a sum, "Grown-ups: what is a + b?" (a is 12 to 19, b is 6 to 9), with 4 choices.
Rewrite: "Settings is behind a grown-up question: an addition sum such as 14 + 7, with four choices. A wrong answer quietly goes back."

**M2. Parent note: the faith content is never mentioned.**
Action Zone teaches Yeshua's Ryu, and the game will show belt verses (KJV, exactly as on the dojo sign), the Class Creed and the FAITH DOES life words. Per J9, the phone's voice reads the verses aloud. Parents shouldn't learn this by surprise. Add this under "Good to know":
> "Like class at Action Zone, the game includes our faith lessons. At each promotion, your child sees the same Bible verse, covenant and life word that are on the dojo wall, word for word. The phone's built-in voice can read them aloud. There are no quizzes or scores on them."
(Leave out any part that isn't in build 1. See Q2.)

**M3. Privacy page: read-aloud covers only Street Smarts.**
Line: "**Read-aloud:** Street Smarts stories can be read aloud using the device's built-in voice (the Web Speech API)."
If the verses are spoken too (J9), the line has to say so. Rewrite: "**Read-aloud:** stories and Bible verses can be read aloud by the phone's built-in voice." The bracketed UNKNOWN about online voice processing stays with the lawyer and the Programmer.

## 2. Should-fix
**S1. Parent note: say how the play-time limit works.** Line: "In Settings you can also set a daily play-time limit." Add: "Pick 15, 30, 45 or 60 minutes (it's off unless you turn it on). When time is up, your child finishes the room they're in, everything they found is kept, and the game rests until midnight." This is honest and reassuring, and it matches M7-P9.

**S2. Parent note: "behind a grown-up question" is vague.** Rewrite: "behind a quick grown-up question (an addition sum) in Settings".

**S3. Parent note: "the game follows what they're learning in real class".** Real class data (DojoForge) isn't connected until milestone 9, and in the beta the parent enters the belt. Rewrite: "and once you enter your child's belt, the game matches what they're learning in real class."

**S4. Say plainly that real training is the main way to get stronger.** This is the game's core promise, and parents will like it. Parent note, after line 7: "The biggest boosts come from real training: new belts and stripes from class unlock new moves in the game."

**S5. Privacy page: code words a parent won't know.** "(browser `localStorage`)", "(the Web Speech API)", and "Monster Journal" with no explanation. Rewrite: "in the phone's own storage for this app". Move the technical names to the lawyer section.

**S6. Privacy page: "which grown-up (Mom or Dad) appears".** This may worry families with other grown-ups at home. Tone question only: "which grown-up appears in Street Smarts stories". Whether "Mom or Dad" is the actual game setting is the Content Designer's call.

**S7. Parent note: "Each test version stops working after 90 days."** It reads a little alarming. Rewrite: "Each test version lasts 90 days. We'll send a new one before then, and your child's progress stays."
(Question for the Programmer: does progress survive a new TestFlight build? It should, but please confirm it before we promise it.)

## 3. Nice-to-have
- **N1.** Parent note: "Some things may look rough or break, and that's okay." Good. Maybe add "If something breaks, it isn't anything your child did."
- **N2.** Store text: "beat friendly monsters" is fine and gentle. Keep it.
- **N3.** Play release notes: "First beta for Action Zone families!" One exclamation mark is fine. Don't add more.
- **N4.** Parent note: "magic Tower" is fine for kids. For parents, "a Tower adventure" reads a little calmer, which may suit faith-minded families. This is a taste call for the Content Designer.
- **N5.** Chests give random gear (decisions.md, Loot). Not paid and nothing to buy, so it isn't a loot box. If a parent asks, "Chests give gear you find by playing; nothing is ever bought" answers it. Optional FAQ line.

## 4. For the Researcher & Planner / Manager (not answered here)
- Q1. The operator name ("Tarnished Labs? / Action Zone?") and how long feedback data is kept (D-B2) are legal calls.
- Q2. Which faith screens are in build 1 (promotion screen, Belt Gate, Creed Wall, spoken verses)? I couldn't confirm them from progress.md. M2 and M3 should list only what is built.
- Q3. Is "collects nothing about your child" still true if the device voice processes text online? The text is game script, but the lawyer should confirm the wording.
- Q4. B-BELT and the B-SAFE wipe button aren't built yet. The drafts tag them correctly, but they must be filled in or removed before invites go out.

Sources: docs/decisions.md (M7-P9 update, Loot, read-aloud), docs/progress.md, docs/work-board.md (J9, B-BELT, B-SAFE), docs/faith-and-creed.md.
