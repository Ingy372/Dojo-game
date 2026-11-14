# SIMPLICITY-PASS: few buttons in a fight, deeper choices between fights

**For:** Jay and the Manager. **From:** Researcher & Planner. **Written:** Nov 8, 2026.
**Docs only.** No game code. `docs/work-board.md` was not edited.
**Labels:** **[FACT]** is in the repo or on a page I opened. **[PROPOSED]** is the plan. **[DECIDE]** needs Jay. **[GUESS]** is my estimate.

**Read this with:** `docs/core-design.md` section 13 (it wins when the design docs disagree), `docs/framework.md` (the four fight buttons and "assist options for young kids"), `docs/decisions.md`, `docs/progress.md`, `docs/work-board.md`, `drafts/planning/R-PROGRESSION-BETA.md`, `drafts/planning/power-and-progression-redesign.md`, and `drafts/planning/R-SHOP.md`.

The ten belts, in order **[FACT, `docs/curriculum.md`]:** White, Yellow, Orange, Green, Blue, Red, Red/Black, Brown, Brown/Black, Black.

---

## Delivery Note

- **ITEM:** SIMPLICITY-PASS
- **WHAT:** A list of every button, menu, screen, and choice a player meets from White through Black, marked built or planned, plus a belt-by-belt reveal, an Easy controls setting that is on at the start, and a rule that new depth goes into choices between fights.
- **WHY:** A 6-year-old has to play from the first minute, and a teenager still needs real choices. The fight corner is already about to grow (Stance, Virtue, and the new Strike, Seal, and kata slots). This plan keeps the fight small and puts the new depth on the Board, between runs.
- **DECIDE:** Eight taste calls in section 10. The one that changes the build is whether any of this is allowed before the Dec 4 freeze. My recommendation is no.
- **NEXT:** Jay answers the taste calls. The Manager puts SIM-01 to SIM-08 on the board only after that, and not ahead of the Dec 15 loadout work.

---

## 1. Plain words

A new White Belt already fights with three buttons: **COUNTER**, **STRIKE**, and **DASH**, plus a finger to walk. That is the right size.

The crowd is everywhere else. The Home Dojo puts **Board, Decorate, Look, Settings, Town**, and often **Scroll** on the screen at once. A student with a stripe and a kata also grows a **VIRTUE** button and a **STANCE** button in the fight. The approved slot plan (Strike, Kata, Seals) is the right kind of depth, and it must stay on the Training Board. It must not become more buttons in the corner.

**Easy controls** is the assist the framework already promised ("assist options for young kids"). It starts **on**. It uses Virtue, holds the Stance you picked, fills empty Seal slots, and gives a small aim nudge. It never taps COUNTER or DASH for the child. A player or a parent turns it off in Settings.

New systems still appear as the belt climbs. Each one gets a short happy intro, one new thing in a session, and a replay from Sensei's Scroll. A real promotion stays the biggest celebration.

---

## 2. What a player can touch today

"Built" means the button or choice is in the game on `main` as of Nov 8, 2026. "Planned" means a design or a draft exists and the player cannot use it yet.

### 2.1 The fight (every belt that can enter the Tower)

The same fight controls exist at every belt. What changes is whether Stance and Virtue are on the screen.

| What the player touches | When it shows | Built or planned | Where it lives |
|---|---|---|---|
| Walk by tapping the floor, or hold the stick in the bottom-left | Every fight and the Home Dojo | Built | `apps/client/src/input/TouchControls.ts`. The first lesson is "Tap where you want to go, or use the stick." |
| Basic punches and kicks, with no button | Every fight. They go toward the nearest enemy | Built | `docs/framework.md` section 4: "Basic attacks happen automatically against the nearest enemy." |
| **COUNTER** | Every fight | Built | `apps/client/src/input/ActionButtons.ts` |
| **STRIKE** | Every fight. Fills as Focus builds | Built | same file |
| **DASH** | Every fight | Built | same file. Jay added it so a player can leave overlapping attacks (`docs/decisions.md`, milestone 2). |
| **VIRTUE** | Only after a character stripe is earned | Built | `GameScene.ts` creates it when the player has a Virtue |
| **STANCE** | Only after a second stance is signed off (everyone already has Beginner's Stance) | Built | `GameScene.ts`: the button exists when `stances.length > 1` |
| A Seal button | Never | Not planned. Seals are passive once a slot plan is on screen | `packages/sim/src/progression.ts` reads equipped Seal families. There is no Seal button in `ActionButtons.ts` |
| A kata-power button | Never | Planned as passive only for the beta (`R-PROGRESSION-BETA.md`) | Kata power list in the rules is still empty (`loadout.ts`, `kataPowers: []`) |
| Health, Focus, combo, room name ("Room 3 of 8") | Every fight. These are readouts, not buttons | Built | `GameScene.ts` |
| **◀ Home** | Practice room only | Built | `GameScene.ts` |
| Door: walk up to **BATTLE**, **CHALLENGE**, **TREASURE**, **REST**, **BOSS**, or **HOME** | After a room clears, when the doors open | Built | Door words in `GameScene.ts`. The hint is "The door is open!" or "The doors are open! Pick one." |
| **Choose an Insight**: tap 1 of 3 cards. "It lasts for this run." | After a battle or challenge room, including the tutorial | Built, at White | `apps/client/src/ui/InsightPicker.ts`. Nine Insights in `content/insights/insights.json` |
| Sensei's lesson box: one sentence, then try it | First time each lesson comes up | Built | `content/tutorial/first-session-lessons.json` |
| Twist banner (one line from Sensei, plus a small icon) | Twist rooms only | Built | `docs/decisions.md`, S1 change 4 |
| **Head home** after a knock-out | One button. "You kept everything you found!" | Built | `content/settings/knockout.json` |
| **Bow** at the start of a Tower floor | One big button. Enemies wait until the bow | Built | `apps/client/src/ui/bow.ts` |

**What a brand-new White Belt, with no sign-off and no stripe, sees in a fight today [FACT]:** stick or tap, COUNTER, STRIKE, DASH. That is three buttons. Virtue and Stance are absent until real training earns them.

**What an Orange Belt with a stripe and a kata sees in a fight today [FACT]:** those three, plus VIRTUE, plus STANCE. Five round buttons in the bottom-right. That is the crowd this plan removes while Easy controls is on.

There is no separate fight layout per belt. Elites (from Green) and named monsters (from Yellow) add no button. A dash-only attack, planned for later tiers, is a different warning on the floor, not a new button (`docs/decisions.md`, milestone 3).

### 2.2 Before the dojo

| Screen | Choices | Built or planned | Where |
|---|---|---|---|
| Title | Tap anywhere to start. First launch also shows "Saved on this phone" and **OK** | Built | `TitleScene.ts`, `content/settings/screens.json`, `content/settings/safety.json` |
| Make a look (first time, or later from **Look**) | **Boy / Girl**, Eyes arrows, Hairstyle arrows, Skin swatches, Hair colour swatches, Gi swatches, then **Let's go!** (first time) or **Done** | Built | `CreateScene.ts`. The belt is never a choice |
| Turn-sideways note | Portrait only. Not a menu | Built | Milestone 0 |

### 2.3 Home Dojo

The play-mode row is drawn in `DojoScene.ts` (`renderUi`).

| Button or choice | Who sees it | Built or planned | Where |
|---|---|---|---|
| **Bow** ("Bow as you enter your dojo") | Everyone, on entry | Built | `ui/bow.ts` |
| **Board** | Everyone. Opens the Training Board | Built | `DojoScene.ts`. The button is 32 px tall |
| **Decorate** | Everyone, from the first visit | Built | same. The decorating lesson is session 4, but the button is already there |
| **Look** | Everyone | Built | Opens `CreateScene` |
| **Settings** | Everyone. The word on the button is "Settings" | Built | `content/settings/difficulty.json` (`button`) |
| **Scroll** | White and up, once the schedule says it is open | Built | `content/settings/unlock-schedule.json` (`scroll`, minTier 1) |
| **Street Smarts** | Yellow and up, after the intro if this is an existing student | Built | `content/street-smarts/ui.json` (`unlockTier: 2`) |
| **Journal** | Yellow and up, same intro rule | Built | `content/named/named.json` (`minBeltTier: 2`, button "Journal") |
| **Town** | Everyone, every belt. A note in the code calls it a placeholder until a real door exists | Built | `DojoScene.ts`. Leads to `TownScene.ts` |
| Walk the room | Everyone | Built | Stick or tap |
| Sweep dust by walking over it | When the dojo is messy | Built | `packages/sim/src/dojo.ts` (`sweepAt`). No button |
| **Wipe** on a scuffed mat, **Straighten** on the rack | When you stand next to one | Built | `DojoScene.ts` draws the word over the spot |
| "Tidy up: N left" / "Spotless" | A readout | Built | `DojoScene.ts` |
| Welcome card, welcome-back card, real reward moments | First visit, return after time away, or a new sign-off | Built | `DojoScene.ts` |

**Decorate mode [FACT, built]:** **Done**, **Move: Tap** or **Move: Arrows** (asked the first time), **Put away** when something is picked, arrow buttons **▲ ◀ ▶ ▼** in arrow mode, and a tray of decorations to place. Hint text tells you the next tap.

**Town, outside, inside [FACT, built, no fight]:** **Home** on the town picture. Tap the Action Zone building. Walk the path. Tap the doors to go inside. Walk back out. Spots inside do nothing yet (`InsideScene.ts`: "The walk-up spots do nothing yet").

**Hidden testing screen [FACT]:** tapping the "Home Dojo" title five times opens profile tools, including Power Rating. Beta builds skip it (`DojoScene.ts`: `if (BETA) return`). Players in the beta never need it. Power Rating stays off every player screen (section 13).

### 2.4 Settings (the screen behind the Settings button)

| Choice | Who | Built or planned | Where |
|---|---|---|---|
| **Done** | Everyone | Built | `DojoScene.ts` |
| **Guided** ("More time to COUNTER while you learn.") | Everyone | Built | `content/settings/difficulty.json` |
| **Steady** ("The usual pace.") | Everyone. This is the start for every new profile | Built | same file. `docs/decisions.md` M7-P1. (An older progress note said Guided starts on for ages 6–9. The decision and the file say Steady.) |
| **Challenge** | Card is on screen at every belt. Below Green it is locked: "Opens when you earn your {belt}!" A tap does not select it | Built | `difficulty.json`, `profile.ts` `challengeUnlocked` (tier 4 and up), `content/elites/elites.json` `minBeltTier: 4` |
| Offer after two lost runs: **Try it** / **No thanks** | At most once a day. It never switches by itself | Built | `difficulty.json` `offer` |
| **Music − / +**, **Sound − / +** | Everyone. Not behind the grown-up question | Built | `content/settings/audio.json`, `ui/VolumeRow.ts` |
| **Reduced motion: On / Off** | Everyone. On at the start if the phone asks for less motion | Built | `content/settings/motion.json` |
| **For grown-ups** | Opens a sum ("what is a + b?") with four answers and **Back** | Built | `content/settings/play-time.json`, `ui/grownUpGate.ts` |
| Play time: **Off**, **15 min**, **30 min**, **45 min**, **60 min**, **Done** | After the sum. Starts on Off | Built | `play-time.json` |
| **Belt & stripes** | After the sum. Pick a belt and stripes. It can only go up. **Save**, **Back**, then **Yes, save** / **Not yet** | Built | `content/settings/belt-entry.json` |
| **Erase progress**, then **Erase** / **Keep** | After the sum | Built | `safety.json` |
| Easy controls | Not on this screen | **Proposed in section 5** | — |

### 2.5 Training Board (the **Board** button)

Left side, every belt **[FACT, `HomeScene.ts`]:** the student's name and belt, level line, experience bar, **ENTER THE TOWER**, **Practice room**, and the Path card (the next real step). **◀ Dojo** goes back. A Blessing line shows for 48 hours after class. No button buys anything.

Right side, four tabs:

| Tab | What you can tap | Built or planned |
|---|---|---|
| **Last run** | **Bests**, found-item arrows, a found item (opens a sheet with **Close**), **Again!** | Built. Words in `content/settings/last-run.json` |
| **Gear (count)** | Filter **Hands / Gi / Charm**, a worn slot, **Bag**, a gear card, then **Wear** or **Take off**, **Let go** (then **Yes** / **Keep**), **Details** / **Hide** | Built. Words in `content/loot/gear-board.json`. Arrows say stronger, weaker, or about the same. Numbers sit behind Details |
| **Abilities** | **Trophy Case** or **Fighting Style** | Built. Words in `content/abilities/trophy-case.json` |
| **Gate** or **Gate ✦** | Locks you can look at. Sensei's Seal. No "why you were not approved" | Built |

**Trophy Case [FACT, built]:** shelves for katas, kick combos, self-defense, and stripes. Tap a cubby. A sheet shows the real technique name, who signed it off, or "Learn this at the dojo." **Close**.

**Fighting Style [FACT, built as two picks]:** two cards, **Stance** and **Virtue**. Tap a card, then tap a pick. Hint: "Tap a card, then tap a pick." A row labeled **Your Strike** shows the Strike the save is using. You cannot tap that row to change it. Empty Virtue says "Your first stripe."

**The five-slot Board the redesign asks for [planned, not on screen]:** Stance, Virtue, Strike, Kata, Seal 1, Seal 2, and Seal 3 at Orange (Seal 4 from Red). Spec: `R-PROGRESSION-BETA.md` section 5 and `power-and-progression-redesign.md`. The save and the fight rules already have the slots (`packages/sim/src/profile.ts` `Loadout`, `loadout.ts`). The screen still only offers Stance and Virtue (`fightingStyle.ts` lines 1–2 and 67–73). A one-time note ("Your Seals now go in slots") is in the save rules and is not drawn.

Seal slots in the rules **[FACT, `config.ts` `SEAL_SLOTS_BY_TIER`]:**

| Belt | Slots in the rules | Families a full student could own | Player can pick them on screen? |
|---|---|---|---|
| White, Yellow | 2 | a few, from #1–10 | No. The first open of an old save fills the slots. After that the player cannot change them |
| Orange, Green, Blue | 3 | more | No |
| Red, Red/Black, Brown, Brown/Black, Black | 4 | 6 families exist in `content/abilities/seal-families.json` (escape, counter, guard, throw, disarm, lock). Lock has no beta ranks | No |

Strikes in the game file **[FACT, `content/abilities/strikes.json`]:** Spin Kick, Jumping Spins, Butterfly Flow. Kick combos 4–7 are drafts only (`drafts/content/abilities/strikes-4-7-text.json`).

### 2.6 Street Smarts (Yellow and up)

One built scene, "Separated in a store" **[FACT]:**

| Choice | Where |
|---|---|
| **✕** leave, **Sound on / Sound off** | `StreetSmartsScene.ts` |
| Who you are with: **Mom** or **Dad** | `content/street-smarts/ui.json` |
| **Next**, or 2–4 big choice buttons (the script) | scene file. A weaker choice gets another try. No health loss |
| **Play again**, **Back to the dojo** | scene file |
| Stars line at the end | scene file |

Read-aloud starts on for ages 6–9. The player's own on/off sticks (`StreetSmartsScene.ts`). More locations are launch scope in section 13 (2–3 places for ages 6–9 and 10–13) and are not built. No script ships until Jay approves it.

### 2.7 Other cards that are not menus

| Card | Buttons | Built or planned |
|---|---|---|
| Your next goals (one Tower goal, one collection goal, one real-dojo goal) | None. "Tap to continue." At most once a day | Built. `ui/GoalsCard.ts` |
| Pick up your climb? (the app was closed mid-run) | **Keep climbing** / **Rest for now** | Built. `content/settings/run-resume.json` |
| Play-time rest | The Tower door says the dojo is resting. Nothing is taken | Built. `play-time.json` |
| Sensei's Scroll list | One row per lesson already seen, **↻ Replay the tutorial floor**, **Close** | Built. `DojoScene.ts` `openScroll` |
| Monster Journal | Pages, arrows. No fight | Built from Yellow. Deeper bestiary lore by belt is planned (Jay, work-board item 3: Bestiary is launch scope). Section 13 still lists the Bestiary with "later systems" and again under "after launch." See taste call 4 |

### 2.8 Planned choices the player cannot make yet

These are in the design or in drafts. None of them should become a fight button.

| Choice | When the design shows it | Where the plan lives |
|---|---|---|
| Pick a Strike, a kata power, and which Seal families to bring | Between runs, on Fighting Style. Slots grow by belt (table above) | `R-PROGRESSION-BETA.md`, the redesign |
| Unlock card when a sign-off arrives, then one short Sensei's Trial room | The next time the game opens after a real sign-off | Redesign, "Making new moves exciting." Board items PB-13 to PB-15. Not built |
| Life-lesson quests and Honor | 3rd belt (Orange) | Section 13. Quest drafts exist under `drafts/content/quests/`. Not built |
| Missions: watch, log practice, **Ready to show Sensei** | When the first mission exists. Any belt | Section 13. Not built. A video that leaves the app stays behind the grown-up question (existing rule) |
| Training Points spent on upgrades | After the beta, in the redesign's "after the beta" list | Not built |
| Shop: look, confirm a coin price, buy | Shelves open by belt if the shop is approved. Not a beta item | `R-SHOP.md` section 3.8. Not built. No purchases |
| Challenge-only cosmetics, certified trophies | Green and up for Challenge | Section 12 and S6. Trophies are partly built as art and cubbies; the full wall is later |
| Path Perks, crafting, Sensei's Scrolls (the collectible kind, not the lesson Scroll) | Section 13 puts them at "5th belt and up" and also under **after launch** | Do not build for April 2027 |
| Endless Ascent, Mentor play, live town square, co-op | Black belt, after launch | Section 13 |
| Injured and Pinned | After launch | `docs/work-board.md` S4c-P1 |
| Bow recall question ("What's this one called?", 3 picture choices, skip allowed) | At most one a day | Decided (work-board item 1). Not built as the daily question |
| Real-life quests, Visitor's Pass | After launch | Section 13 |

---

## 3. Belt by belt: what I propose the player meets

**[PROPOSED.]** The fight buttons do not grow. Easy controls (section 5) keeps the corner at three buttons even after a stripe and a kata. New belts add one new *place to make a choice*, with a two-screen intro, then a safe try. One new system in a session. The lesson can be replayed from the Scroll. This is the same shape as Welcome Week (`content/settings/unlock-schedule.json`), stretched across belts instead of only across three dojo systems.

A real promotion ceremony stays bigger than any of these intros (hard rule). The intro is two short sentences and a bow, not a second ceremony.

| Belt | New thing they meet | Fight buttons while Easy controls is on | The new choice, between fights | Intro (two screens, then a try) |
|---|---|---|---|---|
| **White** | Move, the red circle, COUNTER, STRIKE, DASH, a chest, wearing gear, the dojo, the bow, the Path card, the Gate | Stick or tap, COUNTER, STRIKE, DASH | Which door. Which gear to wear. Which Insight to keep for this run (taste call 2) | Already built: the tutorial floor and Sensei's lessons. Session 1 is move, the warning, COUNTER, and STRIKE. DASH, Insights, and decorating follow, one a session |
| **Yellow** | Street Smarts. The Journal. A second Strike if kick combo 2 is signed off | Same three | A Street Smarts scene (big choices, no fight buttons). Journal pages to read. On the Board, a second Strike to bring, once that screen exists | Already drafted in `unlock-schedule.json`: "Something new in your dojo: Street Smarts!" and the Journal lines. Play the scene, or open the Journal, in a quiet moment. No timer |
| **Orange** | A third Seal slot. Life-lesson stories and Honor, when those quests are approved. Kata power for Keon, when Jay's power exists | Same three | Which 3 families to bring, out of the ones earned. A quest step on the Path card, not a new fight button | "Orange belt opens one more Seal slot." Then a safe room where the equipped Seals are already on. The life-lesson story gets its own later session, not the same day |
| **Green** | Challenge. Elite enemies (a glow and a lesson, no button) | Same three | The Challenge card in Settings unlocks. The reason to pick it stays the one already written: faster enemies, less time to COUNTER, plus the rewards section 12 already lists | The locked card already says it opens at this belt. First elite: one Sensei line, then the fight. The player still taps COUNTER themselves |
| **Blue** | The Journal grows a deeper page for enemies already met (the launch Bestiary, if taste call 4 says it lives here) | Same three | Read a page. No new button on the dojo row: it is still **Journal** | "Your Journal has more to say about old rivals." Open one page |
| **Red** | A fourth Seal slot. Kick combo 6's Strike, when that Strike exists | Same three | Pick 4 families out of 6. The choice gets sharper because two families stay home | "Red belt: you can bring one more Seal." Change it on the Board before the next climb |
| **Red/Black** | The last kick-combo Strike (combo 7), when it exists | Same three | One more Strike on the Board | The usual sign-off unlock card (PB-13), not a new system |
| **Brown** | Further Seal ranks from the later self-defense list. No new slot | Same three | The same 4 slots. Ranks change how a family feels. The family name on the card uses the real technique | The sign-off card only |
| **Brown/Black** | Possi on the Trophy Case. No new kick combo (curriculum) | Same three | None new | None new |
| **Black** | At launch, the same three fight buttons and the same Board. Endless Ascent and Mentor play stay after launch (section 13) | Same three | None at launch | The promotion ceremony is the moment. No extra system on day one |

**White's dojo row, proposed [PROPOSED]:** **Board** and **Settings** on the first visit. **Decorate** appears with the decorating lesson (it is already taught in session 4; the button should not sit there for three sessions first). **Look** appears the session after character creation, with one line: "You can change your look any time." **Scroll** appears after the first lesson is stored, which the schedule already says. **Town** waits until Yellow (taste call 3). **Street Smarts** and **Journal** stay at Yellow, as built.

**Existing students [FACT, already the rule]:** a student who is already above White, or who already has a real sign-off, keeps every earned power on day one and meets the dojo systems one per day (Welcome Week). This plan does not take those powers away. It only delays the *button* for a system they have not been shown. Easy controls starts on for them too, until they or a parent turn it off.

---

## 4. The first-time intro

**[PROPOSED.]** Copy the lesson shape that is already built. Do not invent a second teacher.

- Two screens. One sentence each. The words are already the right length in `unlock-schedule.json` ("Something new in your dojo: Street Smarts!").
- Then one safe try: a quiet room, a scene, or a Board tap. They cannot lose the try.
- One new system in a session. A sign-off celebration does not also spend that session. If both want the same day, the sign-off plays and the new system waits until tomorrow. Welcome Week already works this way (`unlocks.ts`: one new thing a day, shared by lessons and systems).
- The Scroll lists it after they have seen it. **↻ Replay** stays.
- No countdown, no "you missed a day," no badge with a number of unread systems. A single soft "New" on the one new button is enough, and it clears when they open it. `R-PROGRESSION-BETA.md` already asked for that dot on a new slot.
- Reduced motion: the card fades. It does not bounce.

Content for the lines is SIM-06. The Programmer wires them into the schedule that already exists (SIM-08). No new art is required for the words. A picture can wait.

---

## 5. Easy controls

**[PROPOSED.]** One setting. Name on screen: **Easy controls**. It starts **on** for every new save. It stays where the player or the parent puts it. Ranking up never flips it. Missing a day never flips it.

The framework already says basic attacks fire on their own so young kids are never stuck, and that the game has assist options for young kids (`docs/framework.md` sections 2 and 4). Easy controls is that assist. Guided, Steady, and Challenge stay a separate choice. Easy controls is not a difficulty. A child can be on Challenge with Easy controls on, or on Guided with Easy controls off.

### 5.1 What it handles

| Extra | Easy controls on | Easy controls off |
|---|---|---|
| **Virtue** | No VIRTUE button. When Focus is full, the equipped Virtue fires at a sensible moment: a shield Virtue when a hit is about to land, a heal Virtue when Health is low, otherwise when an enemy is close. The rules live in `packages/sim`, on the tick clock, so a fight can be replayed exactly | The VIRTUE button returns, and only if they have a stripe. The player taps it. The game does not fire it |
| **Stance** | No STANCE button. The Stance picked on the Board stays for the whole fight. Beginner's Stance if they never picked | The STANCE button returns, and only if they have a second stance. They can switch during the fight, which is what the framework describes for older players |
| **Seals** | No button, ever. Before a run, empty Seal slots fill up to the belt's number, oldest earned families first. One line: "I brought Throw and Escape. Change them on the Board." A family the player already picked is left alone | No button, ever. Empty slots stay empty. The fight still runs (Spin Kick, no Seals), which the slot plan already requires |
| **Strike** | No extra button. An empty Strike slot gets the newest Strike they have earned. A Strike they already picked is left as they picked it. A newly earned Strike gets a "New" dot on the Board. Spin Kick if the slot is still empty. The one-room trial (PB-13) can still put the new Strike on for that room only, then put their pick back | The last pick stays, including empty (which plays as Spin Kick). A new Strike waits on the Board with a "New" dot |
| **Kata power** | Same rule as Strike. It stays passive. There is no button. Until Jay's powers exist, the card can say "Power coming soon" (already approved Nov 1) | The last pick stays, including empty |
| **Aim help** | STRIKE turns a little toward the nearest enemy already in front of the hero, inside about one tile of the way they are facing. It does not press STRIKE. The automatic basic attack already aims at the nearest enemy; that part stays | STRIKE goes exactly where the hero is facing. Basic attacks still aim at the nearest enemy, as they do today |
| **COUNTER** | The player taps it. The guided first COUNTER (slow circle, "Tap COUNTER... now!") stays as it is. Mash guard stays as it is: after three Great Counters in a room it steps back (`content/settings/mash-guard.json`). Easy controls does not replace either one | Same |
| **DASH** | The player taps it. A dodge-only warning is still the player's job | Same |
| Doors, Insights, Wear, Street Smarts, cleaning, decorating, the bow | The player chooses. These are the depth | Same |

**What "a sensible moment" must not become [PROPOSED, for the Programmer]:** the Virtue rule is a short checklist in the sim (full Focus, then one condition). It is not a smart opponent. If two conditions are true, the list order decides. No random. No reading the future past the current telegraph. A test can force the situation and expect the same tick every time.

**Aim help must not become auto-play.** It does not step the hero out of a red circle. It does not dash. It does not hold block. A child who never taps COUNTER still has to learn COUNTER. That is the game.

**Power stays the same.** Easy controls does not add damage, health, or a hidden Power Rating bonus, and it does not take any away when it is turned off. Mario Kart's Smart Steering blocks the best mini-turbo while it is on (section 7). We do not copy that. Off only means "you tap Virtue and Stance yourself."

### 5.2 How a player or a parent turns it off

1. Home Dojo.
2. Tap **Settings** (the button that is already there).
3. Under the three training cards, a row: **Easy controls**, with two big buttons, **On** and **Off**. On is lit for a new student.
4. One sentence under the row: "On: the game uses your Virtue and keeps your Stance. Off: you tap them yourself."
5. Tap **Off**. One card asks "Turn off Easy controls?" with **Not yet** and **Turn it off**. That card is there so a stray tap does not change it. It is not a math question.
6. The fight's next room shows VIRTUE and STANCE when they have been earned.

Turning it back **On** is one tap. No second card.

A parent can set the same switch from **For grown-ups**, on the play-time page, under the minute buttons. It is the same saved value, not a second switch. The math question stays on that page because the page also has erase and belt entry. The child's own Settings row does not ask the math question, so a 10-year-old who wants the Stance button can reach it.

The choice is saved on the phone with the rest of the profile. It survives a restart. Wipe progress (the erase button that already exists) clears it with everything else, and a fresh start is On again.

**First time it is turned off:** after the confirm card, one Sensei line, then the buttons. "You'll tap VIRTUE and STANCE yourself now." That line is a lesson they can replay. It does not spend a second session.

---

## 6. Depth lives between fights

**[PROPOSED.]** This is the rule for every later system, including the ones already approved.

The moment of the fight stays: read the warning, tap COUNTER, spend Focus on STRIKE, DASH out of a crowd. Framework section 4's four buttons (Strike, Counter, Form, Virtue) plus Jay's DASH are the full manual set, and only when Easy controls is off. Seals, kata powers, gear, and Insights never get a fight button.

The choices that grow with the belt:

1. **Loadout, on the Board, before ENTER THE TOWER.** Which Stance, which Virtue, which Strike, which kata power, which Seals. White has little to pick. Red has 4 Seal slots and 6 families, so two stay home. That is the depth. `R-PROGRESSION-BETA.md` section 5 already specifies tap a card, then tap a pick, and a swap question when Seal slots are full. Build that screen (it is PB-05). Do not add a sixth fight button to "show" it.
2. **Insights, after a room.** Keep 1 of 3. It is already the between-fight choice. Do not add a fourth card. Do not auto-pick, even with Easy controls on.
3. **Doors.** Battle, challenge, treasure, rest. Already a choice. No new door type for this pass.
4. **Gear.** Wear or leave it, from arrows, not from a stat screen. Already built.
5. **A new sign-off.** The unlock card and one short trial room (PB-13) show the move once, auto-equipped for that room only, then the Board goes back to what they picked. After that, the move lives in a slot. Easy controls fills the slot only when it was empty. It does not swap out a Strike, a kata power, or a Seal they already chose.

**Shop, if it is ever built (`R-SHOP.md`):** one button on the Board, not on the dojo's front row and not in a fight. Shelves open by belt, as that draft already says. Easy controls never buys anything. Coins are never asked for during a fight. I am not asking to build the shop in this pass. Section 9 says why it can wait.

**Quests and missions:** the next step stays on the Path card. "Ready to show Sensei" is one button on that card when a mission is actually complete. It does not sit on the fight screen, and it does not sit on the dojo row "just in case."

---

## 7. How other kid action games keep controls simple

I opened the pages below on Nov 8, 2026. A line is a fact only when that page says it. "For us" is my suggestion.

### Mario Kart 8 Deluxe

- Nintendo's own support page says the Switch version adds an optional Smart Steering feature that "makes it easier for kids and novice players to stay on the track, even at 200cc." [Nintendo UK Support](https://www.nintendo.com/en-gb/Support/Purchases-Subscriptions/Games/What-Is-the-Difference-Between-the-Wii-U-and-Nintendo-Switch-Versions-Mario-Kart-8-Mario-Kart-8-Deluxe--1515611.html)
- A beginner article published on Nintendo's site (written by GameWith, not by a Nintendo manual) says Smart Steering slows the kart and steers it when you would go off the course, and Auto-Accelerate keeps the kart moving when you are not holding the accelerate button. The same page says the strongest mini-turbo cannot be used while Smart Steering is on, and that you turn Smart Steering off once you can race steadily. [Beginner Basics for Mario Kart 8 Deluxe, on nintendo.com](https://www.nintendo.com/jp/ichikara/aabpa/index_en.html)

**For us:** an assist that does the busy part (Virtue, Stance, empty slots, a small aim nudge) while the player keeps the skill (COUNTER). Do not copy the part where the assist blocks the best technique. Our Off switch should be easier to find than Mario Kart's, which hides the toggles on the kart screen. Ours is a row in Settings, with the words written out.

### New Super Mario Bros. Wii, Super Guide

- In an Iwata Asks interview on Nintendo's site, the director explains Super Guide: some players could not beat a boss and stopped. The team wanted the game to clear that course for them, the way a better player in the house would, and also to show a recording that makes you think "I get it" and try again. The staff were told to play the recording "considerately": slowly, without fancy tricks, so a watching player would not lose hope. [Iwata Asks: The Peer-Evaluated Super Guide](https://www.nintendo.com/en-gb/Iwata-Asks/Iwata-Asks-New-Super-Mario-Bros-Wii/Volume-3/4-The-Peer-Evaluated-Super-Guide/4-The-Peer-Evaluated-Super-Guide-219590.html)

**For us:** the kindness is right. The "the game beats the boss for you" part is wrong for this game. The skill is the COUNTER. Easy controls helps with extras. It does not clear the room. Our guided first COUNTER already does the teaching job, in the player's own hands.

### Kirby and the Forgotten Land

- A review on The Verge describes Kirby games as built so that almost every action is one button: inhale, or use the copied ability. That is a reviewer's description of the Switch 2 expansion, not a Nintendo manual. [The Verge, Aug 28, 2025](https://www.theverge.com/games-review/767427/kirby-and-the-forgotten-land-star-crossed-world-review-switch-2)
- The Family Gaming Database, an accessibility write-up, says the game lets you opt for Auto Swallow, offers two control layouts, lets you change difficulty later, and highlights the button you need when you walk up to something. It lists the skill rating as 7 and up. [Family Gaming Database](https://www.familygamingdatabase.com/en-au/accessibility/Kirby+and+the+Forgotten+Land)

**For us:** one main verb in the fight (COUNTER), with STRIKE and DASH beside it. Copied powers in Kirby are still that same button doing a new thing. Our Seals and kata powers should behave like that: they change the COUNTER you already have. They do not add a button. I could not find an official Nintendo page that says Auto Swallow starts on. See section 8.

### Minecraft

- Minecraft's own controls article says a phone uses a joypad in the bottom-left, plus buttons for jump, sprint, sneak, inventory, and more, and that you can change the control mode in settings. [Minecraft Controls, minecraft.net, June 5, 2023](https://www.minecraft.net/en-us/article/minecraft-controls)
- Minecraft Education's support page says Auto Jump "is a great feature to reduce repetitive button/key presses," and that it is a toggle on the touch controls screen. [Minecraft Education accessibility](https://edusupport.minecraft.net/hc/en-us/articles/360061503031-Accessibility-Features)

**For us:** we already avoided Minecraft's hotbar. Keep it that way. Auto Jump is the right *kind* of assist (one repeated action, a switch in settings, off when you want precision). Our aim help is that kind of assist. A row of extra fight buttons would be the hotbar we refused.

### What we already decided, in our own docs

- Basic attacks are automatic so a young child is never stuck (`docs/framework.md` section 4).
- Four ability buttons were the original manual set: Strike, Counter, Form, Virtue. DASH was added later because overlapping attacks needed a way out (`docs/decisions.md`).
- Section 13: systems arrive when they first matter, one new system in a session, replay from the Scroll, Welcome Week for students who already train.
- No screen in the first session has more than one sentence (`docs/core-design.md` section 7).

---

## 8. What I could not source

I am not using these as facts.

- **Kirby Auto Swallow starts on.** A wiki search result said it does. The Family Gaming Database page I opened says you can opt in. It does not say the default. I found no Nintendo manual page for it.
- **The exact Super Guide rule** ("lose five lives on a course, then Luigi clears it"). A search showed that sentence in Nintendo's New Super Mario Bros. U electronic manual. When I tried to open the PDF, the site returned an error. The Iwata Asks page I did open explains the idea and does not give the five-lives number. So the number is not confirmed here.
- **Mario Kart assists start on for every player, and only player 1's choice is saved.** A search showed a Japanese Nintendo support answer that says this. When I tried to open that page, it returned an error. I am not using it. The pages I did open are enough: Smart Steering is optional, it is for kids and novices, and it changes what the best drivers can do.
- **A research paper that says children of a certain age can handle only N buttons.** I did not find one in this pass. I am not claiming a number from science. The number three (COUNTER, STRIKE, DASH) comes from what this game already teaches in the first sessions, not from a study.
- **Pokémon Let's Go, LEGO games, and Animal Crossing** are often named in this kind of note. I did not open a page for them in this pass, so they are not evidence here. S8 (`drafts/planning/S8-similar-games.md`) already covers Animal Crossing and Pokémon for other reasons, with its own links.

---

## 9. Board items

One owner each. Nothing here edits `docs/work-board.md`. The Manager copies a row onto the board only after Jay answers section 10.

These wait behind the Dec 15 loadout work on purpose. See section 10, taste call 1. "Done when" is the test, not a date.

| ID | Owner | What | Done when | Waits on |
|---|---|---|---|---|
| **SIM-01** | Programmer | The Easy controls value on the save. Default on. A row on the Settings screen and the same switch on the grown-up page. The confirm card when turning off. The choice survives a restart. Wipe clears it | A new profile is On. Turning Off and On in either place changes the same value. A test reloads the save and reads it back. Both buttons are at least 44 pt. Reduced motion shows no bounce | Jay's yes on taste calls 5 and 6. Not before the Dec 4 freeze unless Jay pulls it forward |
| **SIM-02** | Programmer | While On, hide VIRTUE and STANCE. Fire the equipped Virtue from a fixed checklist in `packages/sim`. While Off, show the buttons as they work today and do not fire Virtue | A test with a stripe: On has no Virtue button and the Virtue happens on the checklist's tick. Off shows the button and does not fire it. COUNTER and DASH tests are unchanged. The same inputs always give the same fight | SIM-01 |
| **SIM-03** | Programmer | Aim help: a small turn toward an enemy already in front, only while On. It never presses a button and never moves the hero out of a telegraph | A test: On, STRIKE's facing shifts toward a nearby enemy inside the one-tile cone. Off, facing stays. A hero who never taps COUNTER still gets hit | SIM-01 |
| **SIM-04** | Programmer | While On, fill empty slots only: Seal slots up to the belt's number, oldest families first; an empty Strike slot gets the newest earned Strike; an empty kata slot gets the newest earned power. One line names what was filled. A pick already in a slot is never replaced. While Off, empty stays empty | A test: an empty White loadout with two families becomes those two only when On. A Strike the player already picked is still there after a newer Strike is earned. The line shows once per fill, not every room | The Fighting Style slot screen (PB-05 in `R-PROGRESSION-BETA.md`). If that screen slips past the beta, SIM-04 slips with it |
| **SIM-05** | Programmer | White's dojo row: Board and Settings first. Decorate appears with its lesson. Look appears the next session. Town waits until the belt Jay picks (taste call 3). Street Smarts and Journal stay at Yellow. Every remaining dojo button is at least 44 pt (the top row is 32 px today) | A brand-new White profile's first dojo visit shows Board and Settings, and not Decorate, Town, Street Smarts, or Journal. Decorate is there on the decorating lesson. A phone-size check shows no button under 44 pt | Taste calls 2 and 3 |
| **SIM-06** | Content Designer | Two sentences for each new system: Street Smarts (can reuse the schedule), Journal, the third Seal slot, Challenge, the first elite, the fourth Seal slot, Easy controls turned off. One sentence per screen. No numbers, no pressure | A draft file under `drafts/content/`. The Learning Designer has reviewed it | Taste calls |
| **SIM-07** | Learning & Engagement Designer | Read this plan for overwhelm, ages 6 and up, and for anything that plays the fight for the child | A short pass or change note. It names any line that should not ship | This file |
| **SIM-08** | Programmer | Play SIM-06's lines through the unlock schedule that already exists. One new system in a session. Replay from the Scroll. A promotion ceremony still plays first if both happen the same day | A Yellow test profile sees the Street Smarts intro once, can replay it from the Scroll, and does not see it and a second new system on the same day | SIM-05, SIM-06, and the Learning note |

No art item. The Settings row can use the cards the difficulty screen already draws. If Jay later wants a small icon, that is a separate art request.

---

## 10. The Dec 15 beta (freeze Dec 4)

**[FACT.]** The beta is 5–10 tester families, White through Orange, freeze Friday Dec 4, invites Dec 7 (`docs/work-board.md` section 0, `drafts/planning/BETA-DEC15-plan.md`). Today in this note is Nov 8. The loadout plan's own critical path runs through PB-05 (the Fighting Style screen) and a test pass before that freeze (`R-PROGRESSION-BETA.md` section 11).

**Risk if this pass is built before the freeze: high. [GUESS, from that path, not from a new schedule.]**

- SIM-02 touches the fight buttons. PB-05 touches the Board. Both want the same weeks. The beta's job is the slot change Jay already approved. This pass is the next tidy-up, not a second build racing the same freeze.
- A bug in auto-Virtue or aim help is a combat bug. Tester families should meet the fight the team has already playtested.
- A brand-new White Belt in the beta already has three fight buttons. The five-button corner shows up for a tester who has a stripe and a kata. That is real, and it is not bad enough to cut in front of the loadout.

**Recommendation [PROPOSED]:** no code from SIM-01 through SIM-08 before Dec 4. Testers play today's buttons. The Manager does not put these rows ahead of PB-01 to PB-15.

**If Jay wants one thing in the beta anyway:** SIM-01 and SIM-02 only (the switch, and hide Virtue and Stance while it is on). No aim help, no dojo-row hide, no new celebration lines. Even that waits until PB-05 is in a tester's hands, and it drops if the freeze week is for fixes only. The fallback is the sentence in the beta notes: "A stripe adds a Virtue button. A kata adds a Stance button. Both are optional taps."

**What the beta already does right, so we do not redo it:** Guided is a choice, not a trap. Challenge is locked until Green. Street Smarts and the Journal wait until Yellow. Welcome Week already drips systems for existing students. Knock-out is one button, "Head home," and nothing is lost.

---

## 11. Scope, against the April 2027 launch

Section 13's launch list is already full: every belt's Tower, Forms, Strikes, Seals, Virtues, loot, Insights, Challenge, the Gate, the Path, the ceremony, Welcome Week, the Home Dojo, lessons, a small set of Street Smarts, a few quests, and parent controls.

**Flags. Do not let this pass smuggle these in.**

| Idea | Why it is a creep risk | What to do |
|---|---|---|
| **The shop** (`R-SHOP.md`, 148 items, new pictures, a buy screen) | A new button and a new place to get lost. That draft already flags the art load for April 2027. A shop button on the White dojo row fights this plan | Not in this pass. If it ships later, one Board button, shelves by belt, never in a fight, never bought with real money. Easy controls never spends coins |
| **A separate Bestiary button** | Jay has said the Bestiary is launch scope. Section 13 still also lists it after launch. A second book next to Journal is two buttons for one idea | One button: Journal. Deeper pages unlock with the belt. No new dojo button |
| **Path Perks, crafting, the collectible Sensei's Scrolls** | Section 13 puts them after launch, and also mentions them at the 5th belt. The 5th-belt line is how they sneak into the launch | After launch. Blue's new thing is a Journal page, not a workshop |
| **Endless Ascent, Mentor, live town, co-op** | After launch, on purpose | Black belt at launch looks like Brown/Black plus the ceremony. The Town *picture* that is already built can stay behind the Yellow Town button. It is not the live town |
| **Mid-fight buttons for Seals or kata powers** | The redesign's whole point is slots, not stacks, and not more taps | Passive. The Board is where you choose |
| **Auto-COUNTER or auto-DASH as a "kids mode"** | Removes the skill the game is for. Also fights "every attack is telegraphed" by making the telegraph optional | Refused. Easy controls does not do this |
| **A power bonus for leaving Easy controls on, or a penalty for turning it off** | A hidden tax. Also too close to Mario Kart blocking the best turbo | Refused. Same strength either way |
| **More than one new system on promotion day** | Breaks "one new system in a session" and makes a real promotion share its day with a menu tutorial | The ceremony wins the day. The new system waits |
| **Showing Power Rating so players can judge Easy controls** | Section 13 hides it | Still hidden. The player sees the buttons, the belt, and the gear arrows |

This pass itself, done as SIM-01 to SIM-08 after the beta, fits the launch. It adds one settings row and it hides buttons. It does not add a mode, a currency, or a screen.

---

## 12. Taste calls for Jay

Short answers are enough. A "leave it" is a fine answer.

1. **Before the freeze?** I recommend none of this is built before Dec 4. The loadout screen is the beta work. Say if you want the small version (hide Virtue and Stance behind the new switch) in the beta anyway.
2. **Insights at White.** They are built, the tutorial teaches one, and they are a choice between rooms, which is the depth we want. Section 13 says Insights unlock at the 2nd belt. Section 13 wins over the older "first Insight at minute 4" line, unless you say otherwise. I recommend **keep Insights at White**, and later change that one line in section 13, because taking them away makes White thinner in the place we want choices.
3. **Town button.** It is on every belt today, and the code calls it a placeholder. I recommend it appears at **Yellow**, with a one-line intro, so White's row is Board and Settings. The walk to the real dojo building stays in the game.
4. **Bestiary.** You have said it is part of the launch. Section 13 still lists it after launch. I recommend it grows inside **Journal**, with deeper pages from Blue up, and no second button. Say if you want a separate book.
5. **Who may turn Easy controls off.** I recommend the child can, from Settings, with one confirm card, and a parent can too, from the grown-up page. Say if Off should be behind the math question for everyone.
6. **The name.** "Easy controls" is plain. "Helpful hands" is warmer. I recommend **Easy controls**, with the sentence under it doing the explaining. Say if you want the warmer name.
7. **Stance in a fight.** The framework says older players switch stance mid-fight. I recommend that returns only when Easy controls is off. While it is on, you pick the Stance on the Board and it stays. Say if you want the Stance button even while Easy controls is on.
8. **White's first dojo visit.** I recommend only **Board** and **Settings**, then Decorate with its lesson, then Look. Say if Look should stay on day one, since they just made a character and may want to fix it.

Nothing else in this note needs a decision before the Programmer can build it later. The seal families, the slot counts, and "Power coming soon" stay as you approved them on Nov 1.

---

## 13. Files I used, and files I did not change

Read for this note: `docs/core-design.md` (section 13 used where it disagrees with earlier sections), `docs/framework.md`, `docs/decisions.md`, `docs/progress.md`, `docs/work-board.md`, `docs/curriculum.md`, `drafts/planning/R-PROGRESSION-BETA.md`, `drafts/planning/power-and-progression-redesign.md`, `drafts/planning/R-SHOP.md`, `drafts/planning/BETA-DEC15-plan.md`.

Player-facing code and content checked on Nov 8: `apps/client/src/scenes/` (Title, Create, Dojo, Home, Game, Street Smarts, Town, Outside, Inside), `apps/client/src/input/ActionButtons.ts`, `TouchControls.ts`, `apps/client/src/ui/` (Insight picker, bow, goals, fighting style), `packages/sim/src/loadout.ts`, `unlocks.ts`, `profile.ts`, `config.ts`, and the settings files named in the tables.

Not changed: every file under `apps/`, `packages/`, `content/`, and `docs/`, including `docs/work-board.md`.
