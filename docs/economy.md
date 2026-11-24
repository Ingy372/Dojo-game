# Coin economy (Nov 23, 2026)

Jay's goal: coins should keep kids playing **and learning**, the way ABC Mouse ties rewards to lessons. Coins should feel earned, exciting to spend, and worth being a little choosy about. Action Zone's motto applies everywhere: **Hard work = Reward**.

All numbers are in one place, `EARN`, `COINS` and `SELL_PRICE` in `packages/sim/src/config.ts`, so they're easy to tune after playtesting.

## The order of rewards

The more real the effort, the bigger the coins. That's the whole design.

| Rank | Where coins come from | Coins | Notes |
|---|---|---|---|
| 1 | **Real promotion** (new belt) | 1,000 | The biggest coin gift in the game, always (a test checks it). |
| 2 | **Real stripe** | 300 | |
| 3 | **Approved to test** | 250 | |
| 4 | **Real sign-off** (a technique passed in class) | 150 each | |
| 5 | **Class Chest** (every real class) | 150 | Already existed. |
| 6 | **Street Smarts, first finish** | 100 + 40 per star | Each *new* star on a replay pays 40 (a better choice found). Replays with no new star pay 10, twice a day. |
| 7 | **Kata, first clean run** (no mistakes) | 250, once per kata | Jay, Nov 23: a nice one-time payout for each kata. |
| 8 | **Kata practice** | 30 every clean run / 3 with mistakes | No daily limit (Jay, Nov 23). |
| 9 | **Tower run** | 60 + 3 per fight room + 10 boss + 10 win | Full pay for the first 6 runs a day, then half. |
| 10 | **Selling gear to Miss Hannah** | 5 / 15 / 40 / 100 / 250 by rarity | Common to Legendary. Helps, but never beats playing. |

Real training is paid the first time the dojo screen sees it, on a "Hard work pays off!" card **after** the real celebration (which stays the biggest moment). The first time the game ever looks, it only notes what was already earned, so a long history doesn't pour in at once (the Class Chests already welcome returning students).

## Why "full pay for the first few a day"

Playing the same Tower floor over and over is not much more learning, so the first 6 Tower runs pay full each day and after that half. Kata practice has no daily limit (Jay, Nov 23): every clean kata is real practice. Nothing is ever taken away, nothing expires, and there are no streaks to lose (kids rules).

## Making spending feel good (and a little choosy)

- **Prices stay where they are:** 300 to 4,000 coins. A 1,500-coin outfit is about 2 weeks of a normal student's play plus classes, so it feels earned.
- **The Wish:** in the shop, tap **☆ Wish** on any look you don't have. A bar under your coins fills up as you earn, and "Wish: 620 / 1500" shows beside it. When you have enough it says "You can get your Wish!". Saving up toward one thing teaches choosing.
- **Looks that wait for a belt** ("Comes with a new belt!") can be wished for too, which points kids back to real training.

## Ideas for later (not built)

- Show the Wish bar on the run-over card and the kata result card.
- A small coin "jingle" and coins flying to the counter when a big amount lands.
- Seasonal shelves (new looks each month), so there's always something new to save for.
- Parents see a weekly "coins earned from training" line in the parent view.
