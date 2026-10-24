# S1: Combat depth proposal

**For:** Jay · **From:** Researcher & Planner bot · **Date:** 2026-10-23
**Status:** Proposal only. Nothing gets built until you say yes in your Claude chat. The Learning Designer checks it first (L4), and Claude Code's balance player checks the numbers (K3).

## The short version

Combat works. You said brute pace is right, winded brutes feel "perfect", and waves fixed the crowding. What's missing is **variety** (rooms start to feel the same) and **reward** (a great fight doesn't feel very different from an OK one).

Here are 6 changes, best fun-for-the-effort first. Every one keeps the main skill the same: **see the warning, then answer it.** None adds button-mashing, purchases, ads, chat, loot boxes, or streak pressure. Real training stays the main source of power.

| # | Change | Cost | Launch risk |
| --- | --- | --- | --- |
| 1 | Enemy mixes that need different answers | S | None. Uses enemies we have |
| 2 | Perfect Counter chain | S | None |
| 3 | Elite enemies (2 traits first) | M | Low. Already in launch plan |
| 4 | Room twists | M | Low |
| 5 | Form-switch moments | S–M | Waits on S3 Forms |
| 6 | Risk-or-rest door choice | M | **Medium. Extra, not in launch list** |

Cost means programmer effort: **S** = about a day of Claude Code work, **M** = a few days, **L** = a week or more.

**Not picked:** "better hit feedback" (flashes, freeze, shake, sparks, sounds and the big PERFECT! are already built, see `docs/progress.md` milestone 2) and "combo finishers" (too close to button-mashing for little kids; the chain in #2 rewards the same skill without it). Small feedback polish can ride along with #2.

## What's built today (so we improve, not redo)

From `docs/progress.md`, `docs/decisions.md` and `packages/sim/src/config.ts`:

- Auto basic attacks, **Strike** (30 Focus), **Counter** (Perfect / Block / Hit), **Dash**.
- Perfect window: 10 / 6 / 4 ticks (Guided / Standard / Challenge). Perfect gives +25 Focus and a 1-second stagger.
- Combo bonus +5 / +10 / +15% at 10 / 20 / 30 hits.
- Enemies: brute (slow, gets winded), swarmer (fast), Shield Guard (only Strike or Perfect breaks the shield), Floor Keeper boss.
- 7-room floors from 10 rooms, door choices, room grades (S / A / B), Insights, loot.
- Forms: Rooted and Flowing so far (more coming in S3).
- Balance player: novices win only **41% on Standard** (99% on Guided).

The QA full combat test (Q1) hasn't landed yet. When it does, I'll update this list with what testers say.

---

## 1. Enemy mixes that need different answers — Cost S

**What it is.** Re-mix the rooms we have so each battle room asks one clear question. Examples:
- "Shield + swarmers": save Focus for a Strike on the shield, Dash away from the swarm.
- "Brute + swarmers": lead swarmers off first, then punish the winded brute.
- "Two shields": you need Perfect Counters, not Strikes, because Focus runs out.

Add 4–6 new room files using these mixes, from data only (`content/rooms/`).

**Why it's fun.** Each room feels like a little puzzle with a "I figured it out!" moment. You already found this yourself: leading swarmers away "works".

**Risks.** Could make Standard harder for novices (already 41%). Keep the hard mixes later in the floor.

**Waits on.** Nothing.

**Done when.** A tester plays 5 runs and sees at least 4 different enemy mixes. The balance player's novice win rate on Standard does not drop more than 3 points.

## 2. Perfect Counter chain — Cost S

**What it is.** Each Perfect Counter in a row (no Hit taken in between) lights up a small chain: ×2, ×3, ×4. Each step gives a bit more Focus (+25, then +30, +35, max +40). Taking a Hit ends the chain. A Block keeps it but doesn't add.

**Why it's fun.** It turns the best skill, reading the warning, into a "how long can I keep it going?" goal. A 6-year-old sees a growing number and a brighter glow. An older player chases a record. Add "longest chain" to personal bests.

**Risks.** Too much Focus means too many Strikes. Cap at +40 and test.

**Waits on.** Nothing.

**Done when.** On the live link, 3 Perfect Counters in a row show "×3" and fill Focus by 25 + 30 + 35. Taking a Hit resets it to zero. The balance report shows Strikes per room up by no more than 20%.

## 3. Elite enemies (start with 2 traits) — Cost M

**What it is.** Already in `docs/core-design.md` §6, and unlocked at 4th belt (§13). Start with only two traits:
- **Swift** (gold aura): wind-up 20% shorter on Standard. The Perfect window itself stays the same length.
- **Guarding** (blue aura): nearby enemies take half damage until it's defeated. It tells you who to go for first.

At most 1 elite per room. Elites drop slightly better loot.

**Why it's fun.** Lots of new variety with no new creature art, just an aura. Shielded and Splitting can come later.

**Risks.** Swift must never make the warning too short to read. Keep the full warning on Guided.

**Waits on.** Nothing to design. Needs aura art (small Art Director ask). Belt unlock means most kids won't see it at launch.

**Done when.** With the testing screen set to 4th belt, a tester sees both auras in a run. A Swift brute's warning still shows every time. The balance player wins within 5 points of a normal floor.

## 4. Room twists — Cost M

**What it is.** About 1 room in 4 gets a simple, friendly rule shown on a banner when you walk in. Starter ideas:
- **Lantern Dark:** the room is dim, but warning circles glow extra bright.
- **Slippery Floor:** Dash goes farther.
- **Bell Room:** each Perfect Counter rings a bell; ring 3 for a bonus chest.

Never more than one twist per room. Nothing that hides a warning.

**Why it's fun.** Surprise and a reason to talk about it at the dojo. This is the small, everyday cousin of the "Shifted Floor of the week" idea in §6.

**Risks.** Little kids may not read the banner. Use an icon plus Sensei saying it out loud (one line).

**Waits on.** Nothing. A Content Writer line per twist would help.

**Done when.** A tester sees a twist in about 1 of 4 rooms over 5 runs, with a banner and icon each time. In every twist room, every enemy attack still shows its warning.

## 5. Form-switch moments — Cost S–M

**What it is.** Some rooms are built so switching Form pays off. A swarm room rewards Flowing (speed). A brute-and-shield room rewards Rooted (bigger Perfect window). Switching at the right moment shows a small "Good choice!" glow. Never a penalty for not switching.

**Why it's fun.** It makes the kata-earned Forms matter in the moment, so real training feels useful in the game.

**Risks.** Kids with no kata signed off yet have no Forms. These rooms must still be fair without them.

**Waits on.** **S3 (Forms)**, which waits on J3 (kata lines).

**Done when.** A tester with 2 Forms clears the "swarm" room faster in Flowing and the "brute" room with fewer Hits in Rooted (balance player can check). A tester with no Forms can still clear both.

## 6. Risk-or-rest door choice — Cost M — ⚠️ extra, not in launch list

**What it is.** Before some rooms, choose: a **calm door** (normal room) or a **brave door** (one extra elite or a twist, plus a better chest). The doors show clearly what's behind them. No timers, no loss beyond a normal fight.

**Why it's fun.** A real choice that's yours. Older kids love "the brave door". Little kids can always pick calm.

**Risks.** This **is not on the launch list** in core-design §13 and adds to the April 2027 workload. Must not feel like "you chickened out". The calm door needs friendly art and words.

**Waits on.** #3 or #4 (needs something to put behind the brave door).

**Done when.** A tester sees the two-door choice at least once a floor. The brave door's chest is always better. A novice who picks only calm doors wins at the same rate as today.

---

## April 2027 launch check

- **#1, #2:** safe, small, use what exists.
- **#3:** elites and remixed rooms are already in launch scope (§13: "remixed rooms and enemy traits"). Keep it to 2 traits.
- **#4, #5:** low risk if kept small. #5 depends on S3 being done in time.
- **#6:** ⚠️ extra. I suggest saving it for after launch unless the build is ahead.

## Where ideas come from (sources)

- Dojo Ascent's own docs: `docs/core-design.md` §6 (elites, Shifted Floor) and §13 (launch scope); `docs/decisions.md` (numbers, 41% novice result); `docs/progress.md` (your playtest notes).
- Hit feedback is already done. For any polish, Phaser's built-in camera shake: https://docs.phaser.io/api-documentation/class/cameras-scene2d-effects-shake and cameras guide: https://docs.phaser.io/phaser/concepts/cameras
- Jan Willem Nijman (Vlambeer), "The art of screenshake" talk, 2013: https://www.youtube.com/watch?v=AJdEqssNZ-U (shows how small feedback touches make hits feel strong).

## Decisions for you, Jay

1. **Pick which to build** (I suggest #1 and #2 now, #3 and #4 next).
2. **Chain numbers OK?** +25 / +30 / +35 / +40 Focus, max ×4 steps of growth.
3. **Elites:** start with just Swift and Guarding?
4. **Twists:** about 1 room in 4, okay? Any of the three starter ideas you don't like?
5. **Brave door (#6):** save for after launch, or try it before April?
6. **Wait for Q1?** Should Claude Code start #1–#2 now, or wait for the QA combat report first?
