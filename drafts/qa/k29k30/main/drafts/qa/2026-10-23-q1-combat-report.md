# Dojo Ascent: Q1 Full Combat Test (Oct 23, 2026)

## Delivery Note
- **ITEM:** Q1, the full combat test.
- **WHAT:** Bugs, a playability report, ideas for more varied and rewarding combat, and 5 things to try on a real phone. I tested main on the live link and in a computer simulator: 3 difficulties × 3 test profiles, every room, and the boss, with 200 runs per setup.
- **WHY:** Combat has to work for a 6-year-old before we add anything new. Right now it doesn't for a child who never presses Counter.
- **DECIDE (Jay):**
  1. Should a guided first Counter be the top fix? The game would slow down and show the child when to press Counter, the first few times.
  2. Should Training Yard and the boss be easier for new players? For example, no Brute in Training Yard's first wave, and a softer boss on Standard.
  3. After losing to the boss, should a player restart at the boss instead of from room 1?
  4. Should Guided also make enemies weaker? Today Guided only gives a longer Counter window.
- **NEXT:** Jay plays the 5 "Needs a real phone" checks. The Programmer reviews the bugs. I retest after the fixes.

> **Important:** The live browser was too laggy for real-time fighting, so most combat numbers come from the game's own simulator with computer "players". **The simulator results stand in for live play.** They are not real kids. The live checks I did manage are marked "(live)".

---

## Bugs (most serious first)

### 1. A child who never counters can't clear any room. BLOCKS PLAY
- **What I did:** I ran a "masher" player: it walks at the nearest enemy and presses Strike, and never counters, blocks, or dashes. Most 6-year-olds will play this way at first. I ran it 200 times on each difficulty with each profile, plus every room on its own.
- **What happened:** It won 0 times. It dies in room 1 after 10–15 seconds, even as a Yellow Belt and even on Guided. A version that pressed Counter at random also won 0 times. About 80% of the damage comes from crowds of swarmers. This matches the quick room-1 loss I saw live on Oct 12.
- **What should have happened:** A new 6-year-old should be able to clear room 1 on Guided, or be taught Counter before they need it.
- **Severity:** BLOCKS PLAY (ages 6 and up).

### 2. Nothing teaches Counter or the "!" warning. BLOCKS PLAY
- Still true on main, carried over from Oct 18. There's no tutorial, no first-Counter moment, and nothing explaining the "!" cue. This is the root cause of Bug 1. Players who do counter win Guided 95–100% of the time.

### 3. The boss (Keeper's Hall) ends most runs above Guided. ANNOYING
- **What I did:** Simulated full runs and boss-only fights.
- **What happened:** For a new player on Standard, 42–44% of boss fights end in a loss, and 74–77% on Challenge. Fought alone at full health, a new player wins 31% on Standard and 1% on Challenge. A loss sends you all the way back to the start.
- **What should have happened:** The boss should feel hard but beatable, and losing should not erase the whole run.
- **Severity:** ANNOYING.

### 4. Training Yard has a Brute in its first wave. ANNOYING
- **What happened:** Training Yard can be the first room. It's the only battle room with a Brute in wave 1, and it's the hardest normal room for players who stand still (31% loss rate on Standard; other rooms are 11–18%). (Live, Standard: in Room 1, wave 1 had 2 swarmers and wave 2 had 4 swarmers plus a Brute.)
- **What should have happened:** The first room a new player can get should be the gentlest one.
- **Severity:** ANNOYING.

### 5. Guided doesn't make the game easier for a child who doesn't counter. ANNOYING
- Guided only makes the Counter window longer (10 ticks vs 6 on Standard). Enemies have the same health and damage, and swing only about ¼ second slower. A child who doesn't counter gets no help at all.

### 6. The Bow prompt appears at every entry and every floor. ANNOYING
- Still true (live, carried over from Oct 18). It's nice the first time, but a chore by the tenth.

### 7. An existing save showed 4 screens before play. SMALL (needs a check)
- **(Live)** Loading a "Sam T., Yellow Belt" save showed Welcome back → Promotion → Gate → Congratulations before I could play. **I couldn't check whether this happens on every load.** If it does, raise it to ANNOYING.

### 8. An unknown `?room=` value starts a random room. SMALL
- **What I did:** Opened a test link with a room name that doesn't exist (`?room=nope`).
- **What happened:** It quietly started a random room and still marked the run as a test, so personal bests aren't saved.
- **What should have happened:** Show "room not found", or ignore the parameter and play a normal run.

### 9. `?room=training` and `training-room` don't match. SMALL
- The title screen sends `room=training` to the practice room. If the Tower starts while that parameter is still in the address, the Tower looks for a room called "training", but the real name is `training-room`. It then falls into Bug 8.

### 10. The testing screen doesn't match its notes. SMALL
- Still true, carried over from Oct 18. Tapping the Home Dojo title 5 times opens "Dojo testing", not the profile screen the notes describe. The profile screen is on the Training Board title.

### 11. Leftover character creation details. SMALL
- The character creation points from Oct 18 still apply on main.

### 12. The tidy-up counter isn't explained. SMALL
- Still true, carried over from Oct 18. Nothing tells a child what it counts or why.

### 13. The test robot almost never picks rest or treasure doors. SMALL (tool only, not the game)
- The balance bot changes its door choice every tick, so it took rest or treasure rooms only 9 times in 1,600 rooms. The Oct 18 balance report therefore counted too many fights and too few rest and treasure rooms. The fix: pick a door once per room.

### Fixed since Oct 18 ✅
- Promotion is now 3 screens (it was 8).
- There's now a "Good effort!" card after a loss (it still needs a phone check).
- Mouse clicks work on desktop.
- The welcome line is fixed.
- Power Rating shows only on the testing screen (live). That's correct.

### Checked and OK
- The Counter window matches the settings on all 3 difficulties.
- No crashes and no broken numbers in 7,200 simulated runs. Three rooms ran very long, but all three still finished.
- A valid `?room=` link drops you straight into that room. `?room=keepers-hall` goes straight to the boss.

---

## Playability Report

**First minutes**
- *6-year-old:* Taps Strike, gets swarmed, and loses in about 15 seconds. Doesn't know why, and doesn't know what "!" means. Likely to give up.
- *12-year-old:* Figures out Counter after a loss or two, then wins Guided easily.
- *Adult:* Notices the Bow prompt repeating and the several screens before play.

**Fun**
- Once you counter, fights are snappy and the Perfect Counter count climbs fast, so it feels powerful. Winded Brutes are a good "aha" moment, but nothing points them out.

**Load (how much a child has to take in)**
- There's only one key skill, which is good. But it's hidden, so the load is "guess the secret". Several screens before play is too many for a 6-year-old.

**Coming back**
- Losers get almost nothing: about 0.1 items per run for a masher vs 11–17 for a winner. A child who loses has nothing to show for it. The "Good effort!" card helps, but there's no reward behind it.

**Balance**
- The big gap is between "counters" and "doesn't counter", not between difficulties. If you counter, Guided is nearly 100%. If you don't, you win 0%.
- Belt strength matters a lot. On Standard, a new player wins 34% as a fresh White Belt, 87% with 3 sign-offs, and 100% as a Yellow Belt. A Yellow Belt who counters finds even Challenge easy.
- Won runs take about 1.5–2.7 minutes in the simulator, under the 5–7 minute target. Rooms take 16–38 seconds each.

**Design rules**
- No purchases, ads, chat, loot boxes, or streak punishment seen. ✅
- No guilt messages seen in combat. ✅
- Pressure: losing at the boss and restarting from room 1 may feel like pressure to a young child. See DECIDE 3.

---

## What would make combat more varied and more rewarding?
*Ideas only. Nothing here is added to launch unless Jay says so.*

**Thinking like a 6-year-old**
- "Show me the button!" A slow-motion first Counter with a big glowing button.
- Fewer swarmers at once in the first rooms.
- Something every time, even when I lose: a sticker, a star, or one item.
- Big, silly hit effects and a cheer on a Perfect Counter.

**Thinking like a 12-year-old**
- Enemies that feel different. Today all four hit the same way and differ only in numbers.
- Rooms built around one idea: an all-Brute "wait for winded" room, a shield ring, or a one-on-one duel with no swarmers.
- A second boss attack pattern, so the boss isn't always the same fight.
- Combos or a streak meter that rewards chaining Perfect Counters (no punishment for breaking it).

**Thinking like an adult**
- Teach each mechanic once, with a short hint: winded Brute, shield break, "!" warning.
- Let Guided also soften enemy damage or crowd size, so it helps every child.
- Restart at the boss after a loss there.
- Scale rewards to effort, so a child who tries gets some progress.
- Make rest and treasure rooms feel special. They're offered often but don't change combat.

---

## Needs a real phone (for Jay)
1. **Perfect Counter feel:** does the timing feel fair and clear on a touchscreen?
2. **Boss fairness:** can you beat Keeper's Hall on Standard as a fresh White Belt?
3. **"Good effort!" card:** lose on purpose. Is it kind, clear, and quick?
4. **A Gauntlet:** play one and check that it's hard but fair.
5. **First 2 minutes as a new player:** start fresh and only press Strike. Does a child learn anything?

*Sources: simulator results (/workspace/qa/q1-sim/results.md), live checks on Oct 23, and Oct 18 findings rechecked against main.*
