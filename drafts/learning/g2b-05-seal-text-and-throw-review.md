# G2B-05: seal text learning review and Throw lesson

## Delivery Note

- **ITEM:** G2B-05 (board id `R-G2B-05` in `drafts/planning/R-GREEN-TO-BLACK.md`). Review the G2B-02 kid text for seals #11–#15, and the Throw idea in open PR #457, for ages 6+ and for overwhelm. Write the Sensei lesson line for Throw.
- **WHAT:** A pass, pass-with-changes, or hold for each reviewed string, with the exact words, the reading load, and a replacement where the words and the fight disagree. One primary Throw lesson sentence, two labeled alternates, a try-it-now line, and a class line. Design only. No game code, no content JSON, no new technique, no launch-scope change.
- **WHY:** Orange is the first time a Great Counter can knock an enemy down. That is one new result on a button the child already knows. The proposed sentences add extra names, a second idea, or a real-class step. A 6-year-old meets one new thing at a time (core-design section 13).
- **DECIDE:** Jay, through the Manager: the taste check at the end (primary line or an alternate, and the five card replacements). The Manager questions are listed under "Questions for the Manager". Nothing in here picks a new mechanic, a new name, or a slot count.
- **NEXT:** After that taste check, the Content Designer can put the chosen card sentences into the seal draft. The Programmer wires the lesson only after the equip, picture, and old "Throw" card questions are answered. Lock and Break Free stay where G2B-11 put them, after the beta.

## What was read

Reviewed on 2026-11-08.

| Source | What it is |
|---|---|
| `docs/framework.md`, `docs/core-design.md` section 13, `docs/progress.md`, `docs/decisions.md`, `docs/work-board.md` | Rules. Progress and decisions win where they disagree with the design docs. Section 13 wins inside core-design. |
| `docs/curriculum.md`, `docs/self-defense.md` | #11 and #12 are the Orange takedowns. The class result is "Thrown to the ground" (#11) and "Thrown, then finished on the ground" (#12). #13 and #14 kick a weapon aside. #15 is a step aside and a double punch. |
| `drafts/content/abilities/seals-11-15-text.json` | G2B-02 kid sentences. Merged as PR #402, head `81eef6b82b553b55fa27d1e2cf863b68fd05666d`. |
| `drafts/content/abilities/seal-name-clashes-1-10.md` | G2B-02 clash list. Proposals, not renamed here. |
| `drafts/content/abilities/seal-families-text.json` | PB-06 family and rank sentences. #11 and #12 match G2B-02. The Throw family sentence does not. |
| `content/abilities/seal-families.json` on main `ba1a9db5` | Same #11 and #12 sentences, effects empty, Throw `live: false`. #15's sentence is a different line from G2B-02. |
| `content/abilities/abilities.json` | Trophy Case list still has a seal named Throw: "Great Counter hits are 25% stronger." |
| PR #457, open, head `4875d8c0b34c893702a50dc37849b8b03ae8dc51`, branch `bot-code/G2B-04` | Not merged. Read from that head. Throw becomes live. #11 is `counterThrow` 30. #12 is `downBonus` 0.25 only. |
| `packages/sim/test/g2b-04-throw.test.ts` on that head | The behavior the lesson is allowed to describe. |
| `drafts/learning/g2b-11-lock-breakfree-welcome-week.md` | Lesson shape, Welcome Week item 8, equip tip, Scroll. |
| `content/tutorial/first-session-lessons.json` | Live lesson pattern: one sentence a screen, kind retry, Scroll. |
| `drafts/planning/R-PROGRESSION-BETA.md`, `drafts/planning/power-and-progression-redesign.md`, `drafts/planning/R-G2B-seal-families-16-40.md` | Current progression plan, including Jay's Nov 8 notes on main `ba1a9db5`. |

`explicit-tutorial-lessons.md` is not in the repo at main `ba1a9db5`. Wording follows G2B-11 and `first-session-lessons.json`.

`drafts/content/abilities/J27-audit.md` is named in the Nov 8 plan as the name list. That file is not in the repo. No name in this note was filled in from it.

Word counts below are a mechanical split on spaces after removing `.` `,` `!` and `:`. Character counts include the punctuation. The 8-word cap is the lesson-screen cap from G2B-11. Seal cards use the existing one-sentence, under-80-character rule. Where an 8-word cut would drop the meaning, the longer card line is the one recommended, and the count is shown.

## How a line was judged

These are design judgments, tied to rules already in the docs. This note adds no new research claim.

- One new idea on a screen. The known idea is a Great Counter (tap COUNTER as the red circle fills). Throw adds one result.
- The practice try cannot be lost, has no timer, and uses the existing retry "Nice work. Let's keep practicing."
- A line matches the fight it describes. Class steps stay in class and in the technique video.
- Real training stays the source of the power. The seal appears because Sensei signed the technique off.
- No pressure, guilt, injury, or failure words. No claim that landing it in the game means the child can throw a person.

Ages 6+ reading: short concrete words, one clause when the line is a lesson. "Brute", "Swarmer", "damage", and "window" each ask the child to learn a label or a game term on top of the new idea.

## Verdicts

| Item | Verdict |
|---|---|
| #11 Outside Reap card | **Pass with changes** |
| #12 Reap and Finish card | **Pass with changes** |
| #13 Kick the Weapon card | **Pass with changes** |
| #14 Kick and Spin card | **Pass with changes** |
| #15 Slip and Double card | **Pass with changes** |
| Throw family sentence in PR #457 | **Pass with changes** |
| Throw lesson (the new lines below) | **Pass with changes** — text is ready; showing it waits on the three blockers under the lesson |
| G2B-02 name-clash note | **Pass** (staff note, not a kid string) |
| Live Trophy Case card named Throw | **Hold** — see below; the lesson waits while this card still says Throw |

## #11 Outside Reap

**Verdict: pass with changes.**

Exact string in `drafts/content/abilities/seals-11-15-text.json` and in `content/abilities/seal-families.json`:

> A Great Counter tumbles a brute or swarmer to the ground for a moment.

14 words, 70 characters. One sentence. It names the right button (Great Counter) and the right shape of the result (down, then back up).

Reading load: "brute" and "swarmer" are file names. The enemy files label them Brute and Swarmer. A first Orange fight also has shields, a Bopper, and a Floor Keeper. Two species names in the sentence are a second lesson. "Tumbles" is a less common word than "knocks down" for age 6 (judgment).

Game, from PR #457's test, not from main: a Great Counter with Throw equipped knocks a Brute or a Swarmer 1 tile away and keeps it down for 30 ticks (1.5 seconds at 20 ticks a second). It does not move or start an attack. Then it gets up and chases. Walls stop the slide. A Guardian, a boss, or an elite is never thrown. Any other enemy is staggered, the same as today. With Throw not equipped, the same Great Counter staggers. The client on that PR draws the thrown enemy like a stagger, and the delivery note says tumble art is still to come. A child may see a slightly longer stumble and a small slide, which is a thin picture for the word "tumbles" (judgment).

Class: #11's result in `docs/self-defense.md` is "Thrown to the ground." The steps stay in class. The card keeps the result and leaves the steps out.

Replacement (card):

> A Great Counter knocks some enemies down for a moment.

10 words, 54 characters. "Some" matches the Brute and Swarmer limit. "For a moment" matches the get-up. "Brute" and "Swarmer" can stay in the staff note. They do not need to be in the sentence.

## #12 Reap and Finish

**Verdict: pass with changes.**

Exact string (same two files):

> Enemies you tumble take extra damage while they are on the ground.

12 words, 66 characters.

Reading load: "damage" is an abstract game word. The sentence has no button in it, so it reads as something that happens by itself. That part is fair: once the enemy is down, the harder hits are the hits already landing, including the automatic basic hits. It is a lot to put on the same day as the first knock-down. The lesson below does not teach this line. The card can carry it after the knock-down is known.

Game, from the PR #457 test: #12 adds one effect, `downBonus` 0.25. A thrown enemy takes about 25% more from the same hits. The test does not give #12 its own throw. On main, rank effects are the union of the signed-off techniques in that family (PB-02). A child who has both #11 and #12, with Throw equipped, gets the knock-down and the harder hits. A sign-off of #12 alone adds the bonus and does not knock anyone down.

Nov 8 says each seal works alone and does not need another seal equipped. That sentence is about a second family. It does not say #12 throws by itself. This note does not decide that.

Class: #12's result is "Thrown, then finished on the ground." The game's harder hits are the stand-in for that finish. The card does not describe the class steps.

Replacement (card), for a child who already has the knock-down:

> While they are down, your hits land harder.

8 words, 43 characters.

If a child can hold #12 without #11, this sentence describes a tumble the seal does not cause. That case is a Manager question, not a second sentence from this note.

## #13 Kick the Weapon

**Verdict: pass with changes.**

Exact string:

> A Great Counter kicks the weapon aside, so their next hit is weaker.

13 words, 68 characters. Two clauses.

The second clause matches the fight. In `packages/sim/src/world.ts`, a Great Counter with Disarm weakens that enemy's next hit. A Bouncy Bopper (the padded-staff enemy, already in `content/enemies/bopper.json`) uses a weaker push for that hit. The G2B-02 flag says the seal waits for a padded-staff enemy and until then works on every enemy. The Bopper is already in content, and the weaken still applies to every enemy, including a Brute with no weapon.

The first clause describes a kick at a weapon. On a Brute or Swarmer there is no weapon to kick. It also reads close to a class instruction. The real kick stays in class and in the video. The card can keep the name Kick the Weapon as the label.

Replacement (card):

> A Great Counter makes their next hit weaker.

8 words, 44 characters.

## #14 Kick and Spin

**Verdict: pass with changes.**

Exact string:

> Your kick lasts longer: their next two hits are weaker.

10 words, 55 characters. The colon is a second idea. "Your kick" can mean the STRIKE kick. The effect is not the child's kick lasting longer. With Disarm equipped, `disarmAttacks` 2 means the weaken covers two hits (`world.ts`). The amount of the weaken comes from #13. #14's own effect does not set that amount. Signed off alone, the current fight does not weaken anything. The Nov 8 family map still lists a different recast ("Disarm cuts more") as a proposal. This note keeps the built two-hit effect and does not pick the recast.

Class: #14 is the weapon kick plus a spin kick. The card stays on the two weaker hits.

Replacement (card), for a child who has both #13 and #14:

> A Great Counter makes their next two hits weaker.

9 words, 49 characters. The 8-word cut "A Great Counter weakens their next two hits." is shorter and stiffer. The 9-word line is the one to use. Same lone-rank question as #12: if #14 can be signed off alone, this line waits until the fight matches it.

## #15 Slip and Double

**Verdict: pass with changes.**

Two sentences are in play.

G2B-02 and PB-06:

> Great Counters add a third quick punch and give you a little more time.

14 words, 71 characters.

Built card in `content/abilities/seal-families.json`:

> Off the Line adds a third punch, and the Great Counter window is a little longer.

16 words, 81 characters. That is over the 80-character card rule, and it would fail `drafts/content/tools/check-seals-text.py`.

Reading load: each sentence teaches two things, an extra hit and more time. "Third" is true only when #1's two hits are also on. #1 in the built file is `counterHits` with 2 hits; #15 adds 1 hit and 1 tick of counter window. PB-02 adds the hits together, so both signed-off techniques make three hits. #15 on its own adds one hit. "Off the Line" names another technique inside the sentence. "Window" is a staff word. One tick is 1/20 of a second. A child is not being shown a change they can see (judgment). The lesson for Throw should not also explain this.

The Nov 8 family map still proposes moving #15 to Counter and dropping the extra punch. That cell is marked as the planner's proposal. PB-02 on main, which wins for what is built, keeps #15 on Escape with both effects. This note does not move it.

Class: #15's result is the attack missing, then two punches. "Third punch" and "double punch" are easy to mix up. The card says what this rank adds.

Replacement (card), true with or without #1:

> A Great Counter adds another quick hit.

7 words, 39 characters.

The extra time stays off the card until a child can feel it. That is a wording recommendation, not a change to the 1 tick.

## Throw family sentence (PR #457)

**Verdict: pass with changes.**

Main today (`live: false`):

> Take the attacker to the ground. Coming later.

8 words, 46 characters, two sentences.

PB-06 draft:

> Great Counters can tumble enemies to the ground.

8 words, 48 characters. "Enemies" reads as every enemy. The fight throws Brutes and Swarmers.

PR #457 replaces the main line with:

> Take the attacker to the ground.

6 words, 32 characters, and sets `live: true`. "Take the attacker to the ground" has no button in it and sounds like a class takedown. Dropping "Coming later" tells the child the seal is here. On main, until the equip screen (PB-05), a student cannot pick a Seal, and a family earned after the one-time seed is not put in a slot (PB-02). Orange has 3 slots and, by the beta map, five families once #11 and #13 are signed off. The seed fills the slots with the families earned first, so Throw is not one of those three. A live flag with no way to put the seal in a slot leaves the new sentence ahead of the screen.

Replacement, for the day the child can equip it:

> A Great Counter knocks some enemies down.

7 words, 41 characters. Same idea as the lesson, so the slot and the lesson agree.

The rank sentences in the PR are the G2B-02 #11 and #12 lines, with effects filled in. They take the card replacements above. The PR also caps Lock holds and a Seal bonus. Those are outside this item. No lesson line is written for them.

## The old card named Throw

**Verdict: hold.**

Exact live string in `content/abilities/abilities.json` (`throw`), still the seal list used by `apps/client/src/ui/lockedHints.ts`:

> Great Counter hits are 25% stronger.

6 words, 36 characters. The name on that card is Throw.

G2B-02's clash note already says this power is not a throw, and that the first real throw is #11. PB-02 parks that stronger hit on Palm Heel (#7). The Trophy Case name was not changed. A child who reads "Throw" there, then reads the new lesson, has two meanings for one word. The Sensei lesson waits until that card no longer uses the name Throw. What to call the old card is Jay's, through the Manager. This note does not invent a name. The clash note's suggestion list can stay the menu.

The clash note itself is a **pass**. It is for staff. It correctly flags #9's Throw name, and it keeps osotogari out of the kid line.

## Throw lesson

**Verdict: pass with changes.** The sentences below are the lesson. Showing them waits on three blockers: the child can equip Throw, the downed enemy is visible as down (the PR still draws a stagger), and the old Trophy Case card has stopped calling a stronger hit Throw.

One new system, one sentence, then a try. It does not use `ignoresSessionLimit`, so it cannot stack on the same session as another new lesson. Great Counter, Block, and Step-out do ignore that limit; Throw should not. It is G2B-11 Welcome Week item 8, after the Scroll and before Lock and Break Free. Those two stay after the beta, as G2B-11 already says. Later Throw ranks (shields, elites, longer down time) are a later idea. This lesson does not mention them.

The button is the Great Counter the child already has. The new part is the result. The practice room holds one Brute or one Swarmer, so the try can succeed. A Guardian cannot be the practice enemy. Health stays at least 1, the same rule as the tutorial floor. A quiet try gets the existing nudge, "Take your time. Tap the glowing COUNTER button!" (8 words, two sentences, already shipped). A miss gets the existing retry. No new failure line. If the move never happens, nothing appears.

Proposed ids, for the Programmer to confirm: `lesson-throw` / `firstThrow`. Fires the first time an equipped Throw seal knocks an enemy down. Unequipped, it waits, with no nag, the same as G2B-11. Scroll: `scroll` true. One screen, then the practice line.

### Primary (the lesson screen)

> A Great Counter knocks some enemies down.

7 words, 41 characters. One sentence.

### Alternate A

Use only if Jay confirms that students call the technique Outside Reap. That name is in the G2B-02 card. It is not in `docs/self-defense.md` or `docs/curriculum.md`.

> Your Outside Reap knocks some enemies down.

7 words, 43 characters.

### Alternate B

For the fight, when the enemy is on screen. "Them" has nobody to point at on the Lesson Scroll, so the Scroll keeps the primary.

> A Great Counter knocks them down.

6 words, 33 characters.

### Try it now

> Make a Great Counter on this one.

7 words, 33 characters. "This one" is the single practice enemy.

### In class too

> Sensei showed you this in class.

6 words, 32 characters. It points at class. It does not say the game knock-down is the real throw, and it does not use an unconfirmed name.

If Jay confirms the class name, the G2B-11 pattern is available: "You learned Outside Reap in class." (6 words, 34 characters).

### After the try

> That one went down!

4 words, 19 characters. The subject is the enemy, so it is hard to hear as the child falling.

Retry, unchanged from the other lessons:

> Nice work. Let's keep practicing.

5 words, 33 characters.

### Word counts

| Line | Role | Words | Characters |
|---|---|---|---|
| A Great Counter knocks some enemies down. | Primary lesson | 7 | 41 |
| Your Outside Reap knocks some enemies down. | Alternate A | 7 | 43 |
| A Great Counter knocks them down. | Alternate B | 6 | 33 |
| Make a Great Counter on this one. | Try it now | 7 | 33 |
| Sensei showed you this in class. | In class too | 6 | 32 |
| That one went down! | After the try | 4 | 19 |
| Nice work. Let's keep practicing. | Retry, existing | 5 | 33 |

The primary, both alternates, the try, and the class line are each one sentence and at most 8 words.

Callout, if the fight already shows one for other seals: "Self-Defense #11!" with the subtitle Jay confirms. That callout is a separate popup. It should not sit on top of this lesson card in the same moment. Whether the engine waits for the GREAT popup is a Programmer question (Jay's Nov 8 note already asks the GREAT popup to get smaller after the first one in a room).

## Fit with G2B-11, the Scroll, and the beta

- Item 8 in the G2B-11 order is this lesson. Items 9 and 10 (Lock, Break Free) stay after the beta. This note does not pull them forward and does not add a day.
- One new thing per session, shared with the system cards (K17, K19). A lesson that is waiting does not block the next item. That is G2B-11's assumption; the Programmer still owns the check.
- The Scroll replays the one screen and ends on the practice line, which is how K17 replays a lesson. Auto-equip for that replay is the same open question as G2B-11 item 5. Sensei's Trial runs only for new unlocks (Jay, Nov 1), so it is not the replay path.
- Equipping stays on the G2B-11 equip tip. Throw does not get a second tip. The tip is usable once the slot screen exists.
- A Brown belt has 4 slots and 6 families, so Throw may be unequipped. The lesson waits. Nothing is taken away.
- Post-beta gates in G2B-11 (Pinned, Release, Injured, and the later Throw ranks) stay post-beta. No launch scope added.

## Questions for the Manager

1. When can a child put Throw in a slot? Until that screen exists, the family line should keep a coming-later sense, and the lesson should not fire.
2. Is the stagger drawing in PR #457 enough for a child to see a knock-down, or does the lesson wait for tumble art?
3. The Trophy Case card `throw` is still named Throw and says "Great Counter hits are 25% stronger." The lesson waits until that name is cleared. What should that old card be called? Jay's choice; the G2B-02 clash list has the candidates. No name is picked here.
4. Can #12 or #14 be signed off without the earlier technique in the same family? PR #457's #12 only adds harder hits on an enemy that is already down. #14 only extends a weaken that #13 sets. If a lone sign-off must work, those two card lines wait.
5. Which single text shows on the first knock-down: this lesson card, the "Self-Defense #11!" callout, or the GREAT popup? One of them, then the others after.
6. Does Scroll replay auto-equip Throw for that practice room? Same open point as G2B-11 item 5.
7. #15 stays on Escape in the built file. The Nov 8 map still proposes Counter, and still proposes dropping the extra hit. Which map should the card follow? The replacement above follows the built file.
8. `J27-audit.md` is cited as the name source and is not in the repo. Are Outside Reap, Reap and Finish, Kick the Weapon, Kick and Spin, and Slip and Double the names students use?

## Taste check for Jay (through the Manager)

1. Primary lesson line, or Alternate A, or Alternate B?
2. Card replacements for #11, #12, #13, #14, and #15, yes or a different short line?
3. Class line: "Sensei showed you this in class." or, if the class name is Outside Reap, "You learned Outside Reap in class."?

## Handoffs

Only after the taste check and the blockers above. No launch scope added.

| Owner | Work | Done when |
|---|---|---|
| Content Designer | Put Jay's chosen card sentences into the seal draft. Leave the staff notes (who can be knocked down, the 30 ticks, the 25% hits) out of the kid line. | The draft sentences match the chosen lines, one sentence each, under 80 characters, with no injury words and no class steps. |
| Programmer | Add `lesson-throw` to the lesson file the way G2B-11 describes, after equip, the visible knock-down, and the old Throw name are settled. Practice enemy is a Brute or a Swarmer. `ignoresSessionLimit` false. Scroll on. | One new lesson that session, one per room. It does not fire while Throw is unequipped. The Scroll replays the one screen and the practice line. |

## Evidence

No new study. The one-new-thing rule is already a decision in core-design section 13 and in K17. The word and overload calls above are design judgments, marked as judgments where the size of the effect is the reason (the stagger picture, the 1-tick window, "tumbles" versus "knocks down"). G2B-11 already sourced the pacing research it uses; this note does not repeat those citations and does not add any from memory.
