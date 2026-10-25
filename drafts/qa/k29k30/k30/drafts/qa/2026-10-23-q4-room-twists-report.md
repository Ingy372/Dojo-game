# Q4: Room twists check (PR #22)

## Delivery Note
- **ITEM:** Q4. Room twists: banner fit on a phone, novice win rate, Slippery Floor slide.
- **WHAT:** Tested main at `5594095`, which includes PR #22. I ran 200 simulated runs per cell with twists on, twists off, and the slide set to 1.3x and 1.0x. I also drew each twist banner at two phone sizes and took screenshots.
- **WHY:** The Manager saw smart novices on Standard drop from 50% to 42% and asked whether Slippery Floor's slide should go from 1.6x down to 1.3x.
- **DECIDE (Jay):**
  1. Keep the 1.6x slide for now? I recommend yes.
  2. Move or shorten the twist banner so it stops covering the room name? I recommend yes.
- **NEXT:** Play one twist room on a real phone to check how far the slide feels and whether the banner is easy to read. Then the Programmer fixes the banner overlap.

## Bugs (most serious first)

**1. The twist banner covers the room name and the challenge goal**
- What I did: I drew the banner and the room-start message the way the game places them. The banner sits at y=92. The message sits at 40% of the screen height.
- What happened: The two overlap in 10 of the 12 cases I checked. On a 667x375 phone, Lantern Dark and Bell Room wrap to 3 lines, and the box covers the room name ("Gauntlet" is hidden). In challenge rooms on both sizes, the goal line ("Clear the room in 2 minutes...") runs into the banner. They overlap for about 2 seconds, until the message fades. Screenshot: `qa/q4/667x375-bell-room-challenge.png`.
- What should have happened: The banner and the room name should both be readable. Some fixes: move the message lower when a twist is showing, show the banner after the message fades, or shorten the banner text.
- Severity: ANNOYING. Challenge rooms are worst, because the time goal is the part a player needs.

**2. A Strike-only player never sees a twist**
- What I did: I ran the masher bot (Strike only, no Counter, like a 6-year-old) for 200 runs on each difficulty.
- What happened: It lost in room 1 every time. Room 1 never has a twist, so it saw 0 twists.
- What should have happened: This isn't a twist bug. It's the room 1 problem from Q1. But it means the youngest players never see this feature. The guided first Counter (G1) is the fix to watch.
- Severity: SMALL for twists, but BLOCKS PLAY for the youngest kids overall (already reported in Q1).

**3. You can't open a twist on purpose for testing**
- What I did: I looked for a URL setting such as `?twist=`.
- What happened: There isn't one. A twist only shows up by chance (50% per eligible room, never in room 1, and Slippery Floor only from room 4 on). So I couldn't open each banner directly in the live game.
- What should have happened: A testing-only `?twist=<id>` would let Jay and QA check each twist quickly.
- Severity: SMALL (testing only).

## Win rates (bare white belt, seeds 1000-1199, 200 runs per cell)

| difficulty | bot | twists OFF | twists ON (1.6x) | slide 1.3x | slide 1.0x |
|---|---|---|---|---|---|
| guided | typical/smart | 100% | 100% | 100% | 100% |
| guided | novice/smart | 99.0% | 100% | 100% | 100% |
| guided | novice/stand | 93.5% | 95.5% | 95.5% | 96.5% |
| guided | masher | 0% | 0% | 0% | 0% |
| standard | typical/smart | 96.0% | 96.0% | 96.5% | 98.5% |
| standard | **novice/smart** | **47.0%** | **46.5%** | 48.5% | 48.5% |
| standard | novice/stand | 24.5% | 24.0% | 24.0% | 24.0% |
| standard | masher | 0% | 0% | 0% | 0% |
| challenge | typical/smart | 53.0% | 52.0% | 51.0% | 51.5% |
| challenge | novice/smart | 13.5% | 12.5% | 13.5% | 14.0% |
| challenge | novice/stand | 8.5% | 4.5% | 4.0% | 4.0% |
| challenge | masher | 0% | 0% | 0% | 0% |

**The 50% to 42% drop is not confirmed.**
- With the game's own balance bot (`test/balance/bot.ts`), smart novices on Standard win 50.0% with twists off and 45.0% with them on at its default 60 runs.
- At 200 runs, the same bot wins 47.0% off and 46.5% on.
- So the drop came from running too few games. At 60 runs, one game changes the result by about 1.7 points. Twists change the win rate by about half a point.
- The one gap worth watching is novice/stand on Challenge, at 8.5% off versus 4.5% on. But that's only 17 wins versus 9 out of 200, so it may also be chance.

**Deaths by twist (Standard, novice/smart, twists on): deaths / chance of dying per room entered**
| room twist | deaths | chance of dying per room |
|---|---|---|
| no twist | 77 | 8.7% |
| Lantern Dark | 11 | 6.8% |
| Slippery Floor | 5 | 6.9% |
| Bell Room | 14 | 8.4% |

No twist room is more deadly than a normal room. Important: Lantern Dark only changes how the room looks, so it can't make the bot weaker. The bot "sees" perfectly. A real child in a dim room may do worse, and only a phone test can show that.

## Slippery Floor: 1.6x or 1.3x?
- Win rate barely moves: Standard novice/smart is 46.5% at 1.6x, 48.5% at 1.3x and 48.5% at 1.0x. Every other cell is within about 1 point.
- Deaths in slippery rooms (Standard novice/smart): 5 at 1.6x (6.9% per room), 4 at 1.3x (5.6%) and 4 at 1.0x. That's too few to tell apart. On Challenge it's 11 / 10 / 12.
- **Recommendation: keep 1.6x.** The simulator finds no real cost. The longer slide is what makes the twist feel different and fun ("Whee!"). The bot doesn't overshoot by accident or slide into a warning circle the way a child might. So if Jay sees kids sliding into danger on a real phone, drop it to 1.3x then. It's a one-number change in `content/twists/twists.json`.

## Banner fit on a phone
- How I checked it: I drew the banners in headless Chromium with Phaser 3.90, using the game's own banner code and its sizes copied into a scratch page (`qa/q4/banner.html`). Then I took screenshots at 844x390 and 667x375 (12 images in `qa/q4/`). I did not use the live game, because twists can't be opened on purpose (bug 3). A stand-in health bar and the room-start message were placed where the game puts them.
- **Nothing is cut off at the edges.** The widest banner (Bell Room) is 615 px wide on 844 and 511 px on 667. Both fit with room to spare.
- **It overlaps the room message** (bug 1). On 667x375, Lantern Dark and Bell Room take 3 lines and the box is 91 px tall.
- **Text size:** 17 px bold. It's readable for adults, but small for a 6-year-old next to the 26-28 px room name. Each banner has two sentences plus a Sensei line, and it stays up for 4.2 seconds. That's too much to read for a new reader.
- **Long text:** The Bell Room line has 66 characters and uses "Perfect Counter", which a 6-year-old won't know. A shorter idea: "Bell Room: ring 3 bells for a prize!"
- Not checked: a real high-density phone screen. My 2x-density test page scaled wrong (a problem with my page, not the game), so Jay's phone is the real check.

## Twists from a player's point of view
- **6-year-old:** Probably never sees one, because they lose room 1 by mashing Strike. If they get there, the icon and Sensei's voice help more than the words. Lantern Dark could feel spooky, but the glowing red circles keep it fair. A slide that goes extra far is fun.
- **12-year-old:** Likes the surprise. Bell Room is the best one, because it gives a reason to time Counters and a prize to aim for. They'll want a bell counter they can see (the corner badge shows "1/3", which is good) and maybe more twists later.
- **Adult:** Twists add variety without making the game harder, and the numbers back that up. One fix needed: the banner covering the challenge goal. The twists are a good base to build on. Next could be a twist that adds a reward but not more danger.

## Files
- Report: `/workspace/qa/2026-10-23-q4-room-twists-report.md`
- Simulator tests (untracked, not committed): `packages/sim/test/q1/q4.test.ts`, `q4up.test.ts`. Raw data: `qa/q4/raw.json`. Analysis script: `qa/q4/an.py`.
- Banner page and screenshots: `qa/q4/banner.html`, `qa/q4/shot.mjs`, `qa/q4/*.png`.
