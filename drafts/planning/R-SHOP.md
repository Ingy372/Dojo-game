# R-SHOP: an earned-coin shop, and a later code-card option

## Delivery Note
- **ITEM:** R-SHOP (research and plan, docs only).
- **WHAT:** a plan for a coin shop in the town. Kids earn coins only by playing. They can sell spare gear for coins. The shop sells looks and fun items only, never gear power. Includes the numbers (coins per run, sell prices, shop prices), how it fits crafting and the Hall of Masters, the doc lines that must change, board items, and a separate verdict on selling cosmetics later as a **physical code card** in the dojo pro shop.
- **WHY:** Jay asked for a shop that replaces "Let go" when the bag is full, keeps coins earned, and leaves room for a parent-gated paid store later without a rebuild.
- **DECIDE:** the taste calls in section 9. The biggest: does the shop ship at launch (April 2027) or later, and do we pursue the code card at all.
- **NEXT:** if Jay approves, the Manager boards the items in section 8 and applies the doc edits in section 7. No game code and no board edits are in this PR.

**Read this first (the short version)**
1. **Beta (Dec 15, 2026): no shop.** The town is still a picture and the shop building cannot be tapped. The bag has no size limit in code, so "bag full" does not exist yet. The beta pages tell parents "no purchases". Scope risk: a coin counter with nothing to buy would feel broken. An optional tiny "beta-lite" is in section 8, and I recommend against it.
2. **Launch (April 2027): a small shop is realistic.** 38 permanent items plus 4 one-run sparkles, about 28,000 coins in total.
3. **The numbers [PROPOSED on MEASURED data].** A run pays **60 coins whether you win or lose**, +3 per fight room cleared, +10 for a boss room, +10 for a win. Sold gear adds 1 / 2 / 5 / 12 coins at belt 1 (common / uncommon / rare / epic), rising to x1.5 at belt 10. Result across belts 1–10, all three difficulties, and the kid, newer and careful bots: **84 to 155 coins a run, a spread of 1.84x (target: 2x or less)**. Neighbouring belts differ by at most 1.13x. Selling is at most 35% of income. A kid who sells nothing still gets at least 74 coins a run.
4. **Shop price bands double each step:** 100 / 200 / 400 / 800 / 1,600 / 3,200. A 200 item takes 1.3–2.4 runs, a 3,200 showpiece takes 21–38 runs (3–5 weeks at 8 runs a week).
5. **Power items are cut.** The PE 12 kata reserve is already spoken for, so there is no room for a one-run power item. Zero-power sparkles stay.
6. **Code card verdict (section 10).** A custom card with our own server codes: **not allowed on Apple** (guideline 3.1.1 names license keys), **not allowed on Google outside the US**, and **allowed with conditions in the US only**. A card that carries a **store-issued code** (Apple offer code, Google Play promo code): **allowed with conditions** on both, with limits that make shelf stock awkward (Apple codes expire in at most 6 months, Google promo codes are 500 per app per quarter and unused ones are lost). Whether a store lets a third party *sell* those codes is **not in the sources I found, so unsourced**. Do not build it before asking App Review.

All numbers are tagged: **[MEASURED]** from the bot sim, **[PROPOSED]** my choice, **[CODE]** read from the repo, **[SOURCE]** from a cited page, **[UNSOURCED]** my observation or a gap.

---

## 1. Where coins come from, and where they go

### 1.1 Honest note about the sim
The game sim has **no coins** today. I did not change game code. I added a measuring test **locally only** (not committed to game code): `drafts/planning/R-SHOP-sim/zz-coins.test.ts.txt`. It plays the real bots (`kid`: kid style, novice; `newer`: smart, typical; `careful`: smart, sharp) through belts 1–10 on Guided, Standard and Challenge, 100 seeds per cell (9,000 runs), and records rooms cleared, win or loss, and every piece of gear dropped (with rarity). `drafts/planning/R-SHOP-sim/coins.py` then applies the **[PROPOSED]** payout rules to those rows and prints the table. Re-run it with the commands in section 11. Same convention as `R-INSIGHT-BAL-sim`.

Challenge is locked until the 4th belt **[CODE]**, so Challenge at belts 1–3 is shown for information and left out of pass or fail.

### 1.2 Sources (what earns coins)
| Source | Coins | Why |
|---|---|---|
| Finishing a run, win **or lose** | 60 | A bad run still pays. No punishment for losing. This flat base is what keeps the bots close together. |
| Each fight room cleared | +3 | Small reward for doing well, not enough to separate bots much. |
| Boss room cleared | +10 | |
| Run won | +10 | |
| Selling gear (section 2) | 1–18 each | A bonus on top, never the main income. |

Coins are **never** bought, never expire, never decay, and no run gives a "double coins" boost. No streaks and no daily bonus.

### 1.3 Sinks (what spends coins)
Only the shop (section 3). Coins cannot buy gear power, belts, stripes, certified trophies, Hall of Masters plaques or frames, or materials. Materials are the workshop's currency and only the workshop spends them (section 5).

### 1.4 Balance table
Method: `/home/box/agent-data/workflows/balance-check/SKILL.md`. Tiers = belts 1–10. For every belt and difficulty and every bot, compute total coins per run, then runs needed to afford each price band. Targets I fixed **before** searching numbers [PROPOSED]:
- Every live cell pays at least the flat base, and the lowest cell is within **2x** of the highest.
- A neighbouring belt differs by at most **2x** (skill rule B7).
- The cheapest shelf item takes 1–3 runs. The dearest takes at most 40.
- Selling is at most about 40% of a cell's income.

**Per belt, coins per run (mean of 100 seeds; the kid sells every item found):**

| Belt | Items found per run (kid / newer / careful, Standard) | Guided (kid / newer / careful) | Standard | Challenge | Win % kid, Standard |
|---|---|---|---|---|---|
| 1 | 6.4 / 14.2 / 13.9 | 121 / 132 / 131 | 99 / 132 / 131 | 83* / 132* / 130* | 55 |
| 2 | 6.1 / 14.2 / 14.6 | 122 / 131 / 130 | 99 / 133 / 134 | 79* / 131* / 130* | 60 |
| 3 | **3.6 / 6.7 / 7.1** | 116 / 120 / 120 | 98 / 120 / 121 | 85* / 120* / 120* | 68 |
| 4 | 5.5 / 13.9 / 14.2 | 121 / 134 / 132 | 94 / 134 / 137 | 84 / 133 / 133 | 45 |
| 5 | 5.8 / 13.7 / 14.5 | 123 / 134 / 132 | 98 / 134 / 138 | 88 / 132 / 133 | 58 |
| 6 | 5.7 / 13.6 / 14.5 | 127 / 140 / 138 | 100 / 140 / 144 | 89 / 138 / 139 | 56 |
| 7 | 5.4 / 14.0 / 14.5 | 126 / 142 / 140 | 99 / 142 / 146 | 86 / 139 / 141 | 55 |
| 8 | 5.6 / 13.9 / 14.5 | 127 / 142 / 140 | 101 / 142 / 147 | 88 / 140 / 141 | 55 |
| 9 | 5.8 / 14.0 / 14.5 | 127 / 142 / 140 | 103 / 143 / 147 | 88 / 140 / 142 | 59 |
| 10 | 5.6 / 13.9 / 14.4 | 131 / 150 / 147 | 104 / 151 / 155 | 90 / 148 / 150 | 56 |

`*` = Challenge locked before belt 4 (information only). Every row and every one of the 90 cells is in `R-SHOP-sim/table.md`, with play coins, sell coins, win %, items per run, runs to afford each band, and PASS or FAIL.

**Result [MEASURED + PROPOSED]:**
- Lowest live cell: Challenge, kid, belt 4 = **84** coins a run. Highest: Standard, careful, belt 10 = **155**. **Ratio 1.84 (pass).**
- Biggest neighbour-belt jump: **x1.13** (Standard, careful, belt 3 to 4). Pass.
- Biggest sell share: **35%**. Play-only floor (sell nothing): **74** coins a run.
- Cells outside target (live): **0**. The only FAIL row in the file is Challenge, kid, belt 2, which is locked in the real game.
- **Why the kid bot is lowest:** it wins less (45–68% vs about 100% for the smart bots) and finds fewer items (about 6 vs about 14 a run). The flat 60 base is what stops the gap being 3x to 5x. My first try paid only per cleared room and produced exactly that 3x–5x spread, which fails, so I dropped it.

**Runs to afford a price band (live cells, selling everything):**

| Band | Price | Fastest cell | Slowest cell | At 8 runs a week |
|---|---|---|---|---|
| XS (one-run sparkle) | 100 | 0.6 runs | 1.2 runs | under a day |
| S | 200 | 1.3 | 2.4 | 2 or 3 days |
| M | 400 | 2.6 | 4.8 | about a week |
| L | 800 | 5.2 | 9.5 | 1 to 1.5 weeks |
| XL | 1,600 | 10 | 19 | 1.5 to 2.5 weeks |
| Showpiece | 3,200 | 21 | 38 | 3 to 5 weeks |

"8 runs a week" is the planning figure in R-BAL-9 [CODE-doc]. It is not measured from kids. If real kids play less, every wait stretches in proportion, so these are the numbers to test with students.

### 1.5 Findings you should know
1. **Belt 3 finds about half as many items** (3.6 / 6.7 / 7.1 against about 14). The Ember Kitchens enemies have no drop chance in `content/loot/drops.json`. That is a roughly 2x neighbour jump in *items*, not coins. Coins stay within 1.13x only because the 60 base carries the income. If someone later raises coin income by selling more, this gap will show. Fix belongs in loot content (board item SHOP-BAL-01).
2. **There is no bag cap in code.** Jay's "when the bag is full" trigger needs a defined size first. Until then Sell can only be a button on the bag screen.
3. **No pup exists** in any doc or code, so "pup looks" cannot be built yet. See section 3.

---

## 2. Sell prices by rarity and belt [PROPOSED]
Ladder at belt 1: common 1, uncommon 2, rare 5, epic 12. Drop weights are 70 / 22 / 7 / 1 **[CODE]**, so the ladder pays for what is common and rarely pays for the epic. Higher belts pay up to x1.5 at belt 10 (linear in between), rounded half up, minimum 1.

| Rarity | B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8 | B9 | B10 |
|---|---|---|---|---|---|---|---|---|---|---|
| common | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 2 |
| uncommon | 2 | 2 | 2 | 2 | 2 | 3 | 3 | 3 | 3 | 3 |
| rare | 5 | 5 | 6 | 6 | 6 | 6 | 7 | 7 | 7 | 8 |
| epic | 12 | 13 | 13 | 14 | 15 | 15 | 16 | 17 | 17 | 18 |

Rules for Sell:
- Per item, with the same two-tap confirm as "Let go" **[CODE-doc, decisions.md line 84]**. No undo, so the confirm shows the coin amount.
- A worn item cannot be sold. The last item in a slot can be sold only if another one is worn.
- Selling never removes an earned look. Looks stay in `ownedLooks` forever (S10 line 15).
- No "Sell all" button at launch. One tap that empties the bag invites regret. Listed as a taste call.
- Selling a "perfect" duplicate and keeping the better one is the intended play. The shop never buys back what it sold.

---

## 3. The shop catalog and prices [PROPOSED]
Shop rules:
- **Fixed stock. Always there.** No rotation, no daily deals, no timers, no "only N left", no "new today" banners.
- **The kid always sees exactly what they get** (a preview of the exact item). No random boxes of any kind.
- **Shelves open with promotion** (Poké Mart style: stock grows with badges; see section 6). A shelf, once open, stays open. This ties growth to real training, which fits how the town opens districts with each promotion (core-design line 641).
- **Zero power.** Every item has `power: 0`, and a test proves the Power Rating is unchanged when it is owned or worn.
- **No overlap with earned things.** Nothing here copies an S10 look, an S7 decoration, a certified trophy, a Hall plaque or frame, a stripe, or a belt. The belt is never customizable (hard rule).

| Shelf | What | Count | Band and price | Sub-total | Opens | Notes |
|---|---|---|---|---|---|---|
| Gi dyes | Solid gi colours (body only, never the belt) | 8 | S, 200 | 1,600 | belt 1 | Needs a gi colour layer in the art. I did not check that the current sprites support it; the Artist confirms. |
| Gi dyes | Two-tone gi colours | 4 | M, 400 | 1,600 | belt 2 | |
| Bag skins | Look of the bag screen | 4 | M, 400 | 1,600 | belt 1 | Screen look only. No bag size change. |
| Banners | Plain dojo wall banners, no text, no belt names | 6 | M, 400 | 2,400 | belt 2 | |
| Banners | Larger banners | 4 | L, 800 | 3,200 | belt 4 | |
| Shop dojo set | Decor made only for the shop (its own style tag) | 6 | L, 800 | 4,800 | belt 3 | Not S7 pieces. |
| Shop dojo set | Bigger pieces | 4 | XL, 1,600 | 6,400 | belt 5 | |
| Shop dojo set | Showpieces | 2 | Showpiece, 3,200 | 6,400 | belt 7 | |
| Run sparkles | One-run zero-power effects: cherry-blossom trail, confetti win, drum-roll finish, lantern glow | 4 | XS, 100 each use | n/a | belt 1 | Used up when the run ends. Cosmetic only. |
| **Total permanent** | | **38** | | **28,000** | | |

**What 28,000 means.** It takes 181 runs (about 23 weeks) at the fastest cell (155) and 333 runs (about 42 weeks) at the slowest (84), at 8 runs a week. That is a long shelf, and the shelves open belt by belt, so nobody empties the shop in the first week. More shelves can be added with later belts, with no expiry.

**Not at launch:**
- **Emotes** (8 at S, 200 = 1,600): preset emotes only make sense with the live town square, which is a second-release feature (core-design section 13). Add with that release.
- **Pup looks:** there is no pup in any doc. Either a pup is designed first, or this is cut. Do not price what does not exist.
- **Power consumables: CUT.** Why: the budget rules leave no room. The PE 12 reserve is held back for the kata power (R-INSIGHT-BAL B8, section 6 reserve). The single-card range is PE 12–26, the pair cap is PE 50, and the kata ceilings are 38 / 62 / 67 **[CODE-doc]**. A one-run "extra damage" item would have to fit inside the reserve, which the kata power already uses, or break a ceiling. So it is cut, not shrunk. If Jay's final kata powers use less than 12, the Content Designer can re-check this, but I would still keep power out of the shop (Jay's rule: never sells gear power).
- **Zero-power one-run sparkles stay.** They change no number in the sim. The Tester proves it.

**Buying confirm:** the kid sees the item, the price, and their coins before and after. One confirm tap. No timer. No "you could earn more by...". Spending can't take coins below 0.

---

## 4. Future-proofing for a parent-gated paid store (build none of it now)
Design the data now so a paid store can be added without a rebuild:
- **Two separate wallets that never convert.** `coins` (earned by playing) and `entitlements[]` (things unlocked by something else, empty at launch). No function turns coins into an entitlement or the reverse. Never sell coins for money. Google's Families policy lists "Not providing a distinction between the use of virtual game coins versus real-life money to make in-app purchases" as prohibited ([Families, Ads and Monetization](https://support.google.com/googleplay/android-developer/answer/9893335)), so a clear label and screen split between earned coins and any paid item is also a store rule, and the same page bans "shocking or emotionally manipulative tactics" to encourage in-app purchases.
- **Catalog entries carry** `id`, `kind`, `band`, `priceCoins`, `shelfBelt`, `art`, `power: 0`, and an optional `store: null`. A later paid item sets `store` (a store product id) and has **no** coin price. A paid item is never also sold for coins in the same release (no confusion about which one you bought).
- **A validator rejects** any item with power, any coin price outside the bands, any field that looks like a timer or stock count, and any item that is both coin-priced and store-priced.
- **Everything behind a parental gate:** any link out, any purchase, any code entry. The app already has a grown-up question in Settings (BETA-testflight-text line 47), so that component exists.
- **Real-money cosmetics are post-launch, only if kids ask,** cosmetic only, price shown up front.

---

## 5. How it fits crafting and the Hall of Masters
**Crafting and materials (core-design lines 215, 219, S2 lines 51 and 56).**
- Today "Let go" turns an item into the tier's material (common 1, uncommon 2, rare 4, epic 8, "guess" in S2). At launch materials only collect; spending them comes with crafting after launch.
- **Per item, either or: Sell (coins) or Break down (materials). Never both for the same item. No double pay.**
- At launch the bag screen shows both words. "Break down" is the old "Let go". Materials collect and do nothing yet (S2 line 56). Sell is the one that does something, which is also why the launch bag needs it.
- Same ladder shape for both (1 / 2 / 5 / 12 coins vs 1 / 2 / 4 / 8 materials), so neither wins every time.
- **One currency, one family of sinks.** Coins go to the shop only. Materials go to the workshop only. Training Points go to seal upgrades only (S4). Nothing converts. Gear power only ever comes from the workshop, never the shop.

**Hall of Masters (core-design line 454).**
- The Hall shows only earned things: certified trophies, plaques, frames. **Coins cannot buy any of it**, and shop items are never shown in the Hall.
- Shop banners and decor go in the Home Dojo only, and carry the "shop" style tag, so a visitor can tell an earned piece from a bought one. This keeps S7's rule that earned decor means something.
- The shop never sells a copy of an earned look's art. The one S7 question left for Jay is in section 9.

---

## 6. Research (what other games did, with links)
Where a source is a fan wiki, it says so. Anything not in a source is marked as observation.

**Pokémon, the Poké Mart.** [Bulbapedia: Poké Mart](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9_Mart) (fan wiki)
- Marts sell items and "will also buy many items from customers, usually at half their normal sale price" [SOURCE]. Our sell prices are tiny next to shop prices (1 to 18 coins against 100 to 3,200), because play, not selling, is the main income. That is a deliberate difference. Observation.
- Stock grows with the player's Badges in some games [SOURCE]. We copy this idea: shelves open with belts.
- Observation: the Mart sells things that help you win. Ours must not.

**Club Penguin, catalog and coins.** [Wikipedia: Club Penguin](https://en.wikipedia.org/wiki/Club_Penguin), [Club Penguin Wiki: Penguin Style](https://clubpenguinwiki.info/wiki/Penguin_Style) (fan wiki), [Club Penguin Wiki: Coin](https://clubpenguin.fandom.com/wiki/Coin) (fan wiki), and the existing `drafts/planning/R-TOWN-CLUBPENGUIN.md`. **Note:** the two fan-wiki pages block automatic fetching, so I read their facts from search summaries and did not open the pages directly. Treat the coin-share and price-range numbers below as secondary-source facts.
- Coins were earned playing mini-games and spent on clothing, furniture and igloos [SOURCE, Wikipedia]. The fan wiki says a mini-game score paid about a tenth in coins. Fan wiki, not checked against Disney.
- The catalog came out monthly with new items [SOURCE, fan wiki]. We do not copy monthly rotation because "new this month" is the pressure pattern we have banned.
- Most money came from paid membership. Members got items and rooms non-members could not use, and critics described a caste system [SOURCE, Wikipedia, R-TOWN-CLUBPENGUIN point 4]. We never lock a shelf behind money.
- Items in the fan wiki's example catalogs ranged from about 20 to 1,200 coins [SOURCE, fan wiki, July 2008 and November 2012 pages]. Our band range is 100 to 3,200, a similar spread.

**Animal Crossing, Nook's Cranny, bells, selling.** [Nookipedia: Nook's Cranny](https://nookipedia.com/wiki/Nook%27s_Cranny), [Nookipedia: Bell](https://nookipedia.com/wiki/Bell) (fan wiki)
- You can sell items to the shop, and bells are earned many ways (selling, favours, finding them) [SOURCE].
- In the first game, shop tools unlocked as you spent and sold bells, and the shop upgraded after 25,000 bells in total [SOURCE]. Same idea as our shelves opening as you go.
- Some stock "cycles in or out daily" [SOURCE]. That is the rotation we are not using.
- Observation (not in my fetched pages): in New Horizons, selling pays a fraction of the buy price. I did not get a clean source for the fraction, so I don't use it.

**What we take and what we leave** (all observation, built on the sources above):
Take: sell spare things for coins; a big, always-there shelf; stock that grows with progress. Leave: monthly or daily rotation, paid memberships, locked-for-money shelves, and anything that sells power.

**Rules for a future parent-gated store** (details and verdicts in section 10):
- Apple App Review Guidelines: [1.3 Kids Category, 3.1, 5.1.4](https://developer.apple.com/app-store/review/guidelines/)
- Google Play: [Payments](https://support.google.com/googleplay/android-developer/answer/9858738), [Families](https://support.google.com/googleplay/android-developer/answer/9893335)
- FTC COPPA: [16 CFR Part 312 on eCFR](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312), [2025 final rule, Federal Register](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule)

---

## 7. Doc lines that must change
All lines were re-read at HEAD `5d168db8`. **I did not edit any of them.** The Manager applies these after Jay approves. A line only changes at **launch**, when the shop ships, unless it is marked "now".

| # | File : line | Current text | Proposed text |
|---|---|---|---|
| 1 | `CLAUDE.md:107` | `- **No purchases, ads, loot boxes, or anything bought.**` | `- **No real-money purchases, ads, or loot boxes. The only shop uses coins earned by playing (never bought). It sells looks and fun items, never gear power, and the kid always sees exactly what they get.**` |
| 2 | `docs/core-design.md:57` | `...Used only inside the game, never for anything bought, with bad-luck protection (section 5)` | `...Used only inside the game, never for anything paid for with real money and never in the coin shop (the shop shows exactly what you get), with bad-luck protection (section 5)` |
| 3 | `docs/core-design.md:215` | `Duplicates and unwanted gear break down into materials, so nothing a player finds is ever worthless.` | `Duplicates and unwanted gear can be sold for coins or broken down into materials (the player picks, per item, never both), so nothing a player finds is ever worthless.` |
| 4 | `docs/core-design.md:302` | `...never by pressure, fear of missing out, or anything bought.**` | `...never by pressure, fear of missing out, or anything bought with real money. The coin shop has no timers, no "only N left" and no random items.**` |
| 5 | `docs/core-design.md:485` | `Every decoration is earned, in the Tower or through real achievements. Nothing is ever bought.` | `Every decoration is earned, in the Tower or through real achievements, or bought in the coin shop with coins earned by playing. Real money never buys one.` |
| 6 | `docs/core-design.md:751` | `- **Extra looks are earned, never bought:** headbands, hand wraps, gi trims, and auras from the Tower, Challenge mode, and real milestones.` | `- **Extra looks are earned or bought with earned coins:** headbands, hand wraps, gi trims, and auras from the Tower, Challenge mode, and real milestones are earned. The coin shop sells its own separate looks (gi dyes, bag skins, banners, decor). Real money never buys a look, and no belt, stripe or trophy is ever sold.` |
| 7 | `docs/framework.md:25` | `- **No purchases, ads, loot boxes, or gambling mechanics.** It's included with the school's membership.` | `- **No real-money purchases, ads, loot boxes, or gambling mechanics.** It's included with the school's membership. Coins are earned only by playing.` |
| 8 | `docs/framework.md:40` | `\| **Cost to families** \| Included with membership: no purchases, no ads \|` | `\| **Cost to families** \| Included with membership: no real-money purchases, no ads \|` |
| 9 | `docs/framework.md:251` | `...Decorations come from three places, and none are ever bought:` | `...Decorations come from three places, none ever bought with real money, plus a coin shop that takes only earned coins:` (then add a fourth bullet: `- **The coin shop:** its own decor set, separate from the three above.`) |
| 10 | `docs/framework.md:493` | `- **No purchases, loot boxes, or ads,** ever.` | `- **No real-money purchases, loot boxes, or ads,** ever. Coins are earned by playing and never sold.` |
| 11 | `docs/decisions.md:382` | `- **Cosmetics (J5, Jay, 2026-10-23):** cosmetics come from gear, in-game achievements and dojo achievements, and are never bought.` | `- **Cosmetics (J5, Jay, 2026-10-23):** cosmetics come from gear, in-game achievements and dojo achievements, and are never bought with real money.` and add a new line: `- **Coin shop (R-SHOP, Jay, 2026-11-01):** earned coins only, sell spare gear, looks and fun items only, no power, no random boxes, no timers. Launch, not beta.` |
| 12 | `docs/decisions.md:84` | `- **"Let go":** unwanted gear can be removed from the bag (two taps to confirm). When crafting arrives (after launch), this becomes "break down into materials".` | `- **"Let go":** unwanted gear can be removed from the bag (two taps to confirm). At launch the bag offers "Sell for coins" or "Break down into materials" (per item, never both).` |
| 13 | `drafts/planning/S2-item-system.md:51` | `...The words are "Let go", never "salvage" or "sell".` | `...At launch the words are "Sell" (coins) and "Break down" (materials). "Let go" stays only in the beta.` |
| 14 | `drafts/planning/S2-item-system.md:64` | `- **No look is ever bought** (decisions.md line 382).` | `- **No look is ever bought with real money** (decisions.md line 382).` |
| 15 | `drafts/planning/S2-item-system.md:138` | `- No screen shows prices, a shop or anything to buy (word check).` | `- Until the shop ships (launch), no screen shows prices, a shop or anything to buy (word check).` |
| 16 | `drafts/planning/S7-decoration-sources.md:17` | `- **Earned, never bought** (core-design.md line 485). No shop, no paid currency, no ads.` | `- **Earned, or bought only with earned coins** (core-design.md line 485). The coin shop has its own decor set, not S7 pieces. No paid currency, no ads.` |
| 17 | `drafts/planning/S10-cosmetic-unlocks.md:15` | `- **Never:** purchases, loot boxes, timers, days-in-a-row rules, "last chance" or expiry.` | `- **Never:** real-money purchases, loot boxes, timers, days-in-a-row rules, "last chance" or expiry. Shop looks are separate from S10 looks.` |
| 18 | `content/dojo/decorations.json:2` (notes) | `Every decoration is earned, never bought.` | `Every decoration is earned, or bought with earned coins at the shop (shop pieces live in their own file).` |
| 19 | `content/settings/safety.json:7` | `There are no accounts, no ads, no purchases, no chat and no tracking tools.` | **Beta: no change** (still true). At launch: `...no ads, no real-money purchases, no chat...` |
| 20 | `drafts/planning/BETA-privacy-page.md:11`, `BETA-testflight-text.md:18` and `:47` | `no ads, purchases, chat or accounts` | **Beta: no change.** At launch: `no ads, real-money purchases, chat or accounts` |
| 21 | `docs/work-board.md:78` and `:97` (J5) | `...earned only and never bought...` / `...are never bought.` | Manager updates the wording, and adds the section 8 items. I did not touch this file. |

Two more to watch (not line edits):
- **If the code card is ever built,** `BETA-DEC15-plan.md:76` ("no server") and the privacy page must change, because a redemption server is a server.
- **Parent-facing promises** should say "no real-money purchases", not "no purchases". A coin shop is a purchase to a child's ear, even with earned coins.

---

## 8. Board items
Item IDs follow the work-board style. One owner each. Sizes are my guesses, not measured.

| ID | Owner | What | Done when | Waits on | When |
|---|---|---|---|---|---|
| SHOP-DOC-01 | Content Designer | Apply the doc edits in section 7. | Every line in the table reads as proposed. A word check finds no "never bought" without "with real money" in docs and parent text. | Jay approves section 9. | Launch |
| SHOP-BAL-01 | Content Designer | Add drop chances to the belt 3 Ember Kitchens enemies in `content/loot/drops.json`. | Re-run of `R-SHOP-sim` shows belt 3 items per run within 2x of belt 2 and 4 for every bot. | Nothing. Can go in beta if loot is open. | Beta or launch |
| SHOP-COIN-01 | Programmer | Add `coins` to the profile and the run payout (60 base, +3 per fight room, +10 per boss, +10 win) and the sell ladder. Old saves start at 0. | Sim test reproduces `R-SHOP-sim/table.md` within 1 coin. Spread across live cells is 2x or less. Losing a run still pays 60. | Jay locks the numbers (section 9). | Launch |
| SHOP-BAGCAP-01 | Programmer | Define the bag size and what happens at the limit. There is none in code today. | A full bag shows Sell and Break down, never loses an item, and never blocks a run. | Jay picks the size (section 9). Related to MENU-BAG-01 (bag screen). | Launch (beta only with beta-lite) |
| SHOP-SELL-01 | Programmer | "Sell" and "Break down" on the bag screen, per item, two-tap confirm, no sell on worn items. | Selling gives exactly the table price. Break down and Sell never both pay. Earned looks stay in `ownedLooks`. | SHOP-COIN-01, SHOP-BAGCAP-01. | Launch |
| SHOP-DATA-01 | Programmer | The data shape in section 4: separate `coins` and `entitlements[]`, catalog schema, validator. | Validator rejects power, off-band prices, timers or stock counts, and items with both a coin price and a store id. No code path converts coins to entitlements. | SHOP-COIN-01. | Launch |
| SHOP-CAT-01 | Content Designer | `content/shop/catalog.json`: the 38 items in section 3 with shelves and belts. | Passes the validator. Total is 28,000 or Jay's edited total. No item copies an S7 or S10 look. | SHOP-DATA-01, Jay's catalog calls. | Launch |
| SHOP-ART-01 | Artist | A tappable shop building (the town art has one that is not tappable), a counter scene, 8+4 gi dye swatches, 4 bag skins, 10 banners, 12 decor props, 4 sparkle effects. | All art in the style guide, one preview per item, nothing resembles a belt, trophy or plaque. | SHOP-CAT-01. | Launch (the biggest scope risk) |
| SHOP-UI-01 | Programmer | The shop screen: shelves, exact preview, price, coins before and after, one-tap confirm, owned list. Opens from the town shop building. | A kid can buy, see, wear and re-buy nothing twice. No timers. No "N left". Works with no network. | SHOP-ART-01, SHOP-CAT-01. | Launch |
| SHOP-LEARN-01 | Learning & Engagement Designer | Words and an ethics read: kid-readable copy, no pressure words, a regret check for Sell (does a kid ever sell something they wanted?), and the wording that coins are "earned". | A word list passes. A short student session finds no kid confused about what they get or what they gave up. | SHOP-UI-01 draft. | Launch |
| SHOP-TEST-01 | Tester | Balance regression and rule tests: re-run the coin table, prove each shop item changes no Power Rating, run the word check, check the gate on every link-out. | All pass. Table spread is 2x or less. Zero shop items change Power Rating. | SHOP-COIN-01, SHOP-CAT-01. | Launch |
| SHOP-LITE-01 (optional) | Programmer | Beta-lite: coins and Sell only, no shop. | Same as SHOP-COIN-01 and SHOP-SELL-01 for beta. | Jay says yes, and the beta bag cap exists. | Beta (**not recommended**) |

**Beta vs launch.** My recommendation: **launch**. Reasons: the town shop building is art you can't tap; the catalog needs about 42 pieces of new art; the bag has no cap; and beta families are told "no purchases". **Scope risk:** SHOP-ART-01 is the long pole. If launch is tight, ship the first shelf only (the belt 1 shelf: 8 gi dyes, 4 bag skins and 4 sparkles, 12 permanent items, 3,200 coins) and add shelves with later belts.

**Beta-lite warning.** Coins that buy nothing would read as a broken feature and invite "what are these for?" questions from beta families. I recommend against it, but it is available if Jay wants Sell in beta.

---

## 9. Taste calls for Jay
Each has my recommendation.
1. **Ship the shop at launch (April 2027), not beta.** Recommended: launch, and if it is tight, first shelf only.
2. **Where Sell shows.** Recommended: on the bag screen for any unworn gear at all times (not only when full), with the confirm. The "when the bag is full" rule then becomes just the moment the bag asks you to pick.
3. **Bag size.** There is none. I have no sourced number. The Content Designer can propose one after a student session.
4. **Does Challenge pay more?** Recommended: no, flat. The two smart bots win 100% of Challenge runs from belt 4 up, while the kid bot wins only 25–36%, so a Challenge bonus would widen the gap between bots. It would also push kids toward the hardest mode.
5. **A loss pays 60.** Recommended: keep (no punishment).
6. **Shop sells an S7 decoration?** Recommended: no. Keep earned decor earned.
7. **Sparkles in or out.** One-run zero-power effects at 100 coins. Recommended: in. They give a reason to keep spending without any gear effect. If you feel repeat-buying is a habit loop, cut them.
8. **Open shelves by belt, or all at once.** Recommended: by belt.
9. **Pup looks.** Recommended: cut until a pup is designed.
10. **Emotes.** Recommended: with the live town square (second release).
11. **A "Sell all duplicates" button.** Recommended: no at launch.
12. **Beta-lite Sell.** Recommended: no.
13. **Coin name and art.** "Coins" is placeholder. Recommended: pick a dojo-flavoured name with the Artist.
14. **Code card (section 10).** Recommended: do not build before kids ask. If you do, use store-issued codes first and ask App Review before printing anything.
15. **Revenue split for white-label dojos.** Section 10.5. I have no sourced split.

---

## 10. Code card sold in the dojo pro shop (post-launch, only if kids ask)

**The idea (Jay):** a parent buys a card at the dojo pro shop. The kid redeems it at home. No in-app purchase button, no account, no student data.

### 10.1 Verdicts, per store

| Route | Apple (App Store) | Google Play |
|---|---|---|
| **A. Our own printed single-use codes, validated by our Cloudflare server, unlocking cosmetics** | **NOT ALLOWED.** 3.1.1 says to unlock features or functionality "you must use in-app purchase" and "Apps may not use their own mechanisms to unlock content or functionality, such as license keys, augmented reality markers, QR codes". Cosmetics are digital content. | **NOT ALLOWED outside the US.** The Payments policy says an app may not lead users to a payment method other than Google Play billing, except under Sections 3, 8 or 9 (which are the alternative billing and external-links programs). **ALLOWED WITH CONDITIONS in the US only:** enroll in the external content links program, which limits links to US users, requires a parental-controls integration, support, refunds, reporting and, from Oct 1, 2026, service fees. Whether a card sold in a shop (not through a link) counts for the fee: **UNSOURCED.** |
| **B. A card carrying a store-issued code** (Apple offer code, Google Play promo code) | **ALLOWED WITH CONDITIONS.** Offer codes are an official, documented way to give free or discounted access to an in-app purchase, redeemable in the App Store, by URL or in the app. Conditions: see 10.2. Whether a store allows a third party to *sell* the card is **UNSOURCED** (Apple's docs describe giving codes to attendees and winners). | **ALLOWED WITH CONDITIONS.** Google's promo-code page names "distribute cards with promo codes at an event" as a use, and codes can be redeemed in the Play Store or in the app. Conditions: see 10.2. Selling the card is **UNSOURCED.** |
| **C. Mention or link in the app to where to buy** | **ALLOWED WITH CONDITIONS, US only.** 3.1.1(a) says buttons and links to other purchase methods are allowed on the **US storefront** without the entitlement. Elsewhere, no. 1.3 still says Kids Category apps must not include links out or purchasing opportunities unless reserved for a designated area behind a parental gate, so any such text must sit behind the gate. Reading 1.3 and 3.1.1(a) together is my interpretation. | **ALLOWED WITH CONDITIONS, US only,** via the external content links program (and the October 2025 US injunction, which says Google will not prohibit developers from telling US users about availability or pricing outside Play). Elsewhere, the Payments policy forbids in-app links, buttons, messaging or calls to action to other payment methods. |
| **D. Telling families in person or on paper at the dojo, outside the app** | **ALLOWED.** 3.1.3 says developers can send communications outside the app to their user base about other purchasing methods. | **ALLOWED** [UNSOURCED for this exact case; the Payments policy limits in-app leading only. The injunction page says developers can talk about it]. |

### 10.2 Conditions for route B (store-issued codes)
- **Apple** [SOURCE: [Create offer codes for In-App Purchases](https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/create-offer-codes-for-in-app-purchases)]:
  - The app and the IAP must be live and approved before codes work.
  - One-time-use codes are unique, random, redeemable once each. Batches are 100 to 25,000 codes.
  - **Codes expire within 6 months at most.** That is a hard problem for cards that sit on a shelf.
  - Each customer can redeem one code per offer. Each app has up to 10 active offers, and up to 1 million codes per app per quarter. So each card type needs its own offer, and at most 10 card types can be live at once.
  - Redeeming in the app needs iOS 16.3 or later and the right StoreKit call.
- **Google** [SOURCE: [Promo codes](https://developer.android.com/google/play/billing/promo)]:
  - One-time-use codes are redeemable only once. For one-time products, **500 promo codes per app per quarter**. **Unused codes are lost** at quarter end. Promotions last up to one year.
  - The code gives the item "at no cost", in the Play Store or in the app.
- **Both:** in a Kids or Families app the IAP and the code entry sit behind a parental gate. Apple 1.3 requires it for "purchasing opportunities" (my reading is that code redemption counts). For Google, the Families policy did not mention a gate for purchases in the text I read, so a gate on Google is **UNSOURCED but recommended**.
- **The store still processes the "purchase".** The dojo takes cash for the card at the shop. Whether Apple or Google take a cut of a free code, and whether they allow a dojo to charge for it, is **UNSOURCED**. Ask them.

### 10.3 Questions Jay asked
1. **Can an app in the Kids Category or Families program redeem codes for content bought outside the app?**
   - Apple: **only with Apple's own offer codes** (allowed with conditions). A custom code is not allowed (3.1.1).
   - Google: **promo codes allowed with conditions.** A custom code is allowed with conditions in the US only.
2. **Does redemption need a parent gate?** Apple: **yes, by 1.3** for purchasing opportunities (my reading). Google: **not stated in what I read; recommended.** FTC COPPA does not require a gate for a purchase. It requires verifiable parental consent before collecting personal information from a child unless an exception applies (see 10.4). The Apple page itself says the Kids parental gate "is generally not the same" as COPPA consent [SOURCE, 5.1.4].
3. **Can the app mention or link to where to buy?** See row C. **US: yes with conditions. Elsewhere: no.** In person at the dojo: yes.

### 10.4 How a dojo issues single-use codes with no student data (COPPA-safe design)
This is for route A (our codes, **US only**, not on Apple) or as the base for a US-only web store. It is a design, not legal advice. Have a lawyer read it before launch.
- **Pre-printed random codes.** Each code is 12 characters from a 32-letter set (60 bits) plus a check letter. Printed on the card under a scratch-off cover. Guessing one is not realistic.
- **No account, no name, no email.** The kid types the code. The app calls one Cloudflare Worker endpoint with **only the code**.
- **The server stores** `hash(code)`, `batch`, `itemId`, `status`. **It does not store** names, emails, device IDs, ages or IP addresses. D1 holds only that table.
- **The answer is a signed token** (`itemId`, `batch`), checkable offline. The app keeps the token on the phone and unlocks the cosmetic locally. No account needed.
- **Restore:** with no account, a new phone needs the code again. Proposal [PROPOSED]: the same code can be re-entered on up to 3 phones. This is a taste call.
- **What COPPA says** [SOURCE: [16 CFR 312.2](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312)]: a **persistent identifier**, including an IP address or a device ID, is "personal information". So the server must not keep one. There is an exception: no parental consent needed when "an operator collects a persistent identifier and no other personal information and such identifier is used for the sole purpose of providing support for the internal operations" and gives the required notice (312.5(c)(7)). "Support for internal operations" includes protecting security and integrity, so short-lived rate limiting on failed attempts fits. The 2025 amendments are published ([Federal Register](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule)). A web summary I read gives April 22, 2026 as the compliance date and says it has passed. **Please have counsel confirm that date and the retention rules.**
- **Cloudflare as a "third party" under Apple 1.3** ("Kids Category apps may not send personally identifiable information or device information to third parties"): **UNSOURCED.** COPPA's own definition of "third party" excludes a provider that only supports internal operations and uses nothing for other purposes. Whether Apple reads it the same way is not stated. Ask App Review.
- **Cloudflare's own log retention** (does Cloudflare keep IPs, for how long): **UNSOURCED.** Check the account's settings before launch.
- **Privacy page** must change: the beta page promises there is no server. A redemption server needs its own sentence (BETA-privacy-page.md).

### 10.5 How other dojos could sell their own cards
- **White-label batches per dojo.** Each card has a dojo id in the code prefix and a dojo logo on the card. The code unlocks the same shop item in any dojo's app. Optionally, a dojo-specific banner that carries only that dojo's logo and no text. This follows the existing white-label item on the board (J10, WAFU). I did not research that item further.
- **Revenue split: UNSOURCED.** I found no store-approved model to copy, so I give no number. Options for Jay: the dojo keeps the whole card price and we charge a flat fee per batch printed; or we keep a fixed percentage. For route B, the stores' own fees would also apply and are **UNSOURCED** here.
- **Fraud and abuse limits** (all [PROPOSED]):
  - Codes are single-use and checked by the server. Scratch cover shows tampering.
  - Cards are inactive until the dojo activates a batch range in a register (serial ranges, sale date, no buyer names). A lost box of cards can be voided by range.
  - Failed-attempt limits per code prefix and per short time window. Do not block by IP alone: a dojo's shared wifi would block everyone.
  - Per-batch caps and a per-dojo monthly cap.
  - Refund rule: an unscratched card is refunded by the dojo that sold it. A redeemed code is final.
  - Counterfeits: guessing is infeasible at 60 bits. A reseller could sell one code twice, which the server stops.

### 10.6 What I recommend
1. Do **not** build any card path before launch, and only add one if kids ask.
2. If Jay still wants it, start with **route B** (store-issued codes), US and non-US alike, but only after asking **Apple App Review and Google Play support** (a) whether a dojo may charge for a card carrying a store code, (b) whether a card on a shelf can use codes that expire within 6 months (Apple) or a quarter (Google), and (c) what the store takes.
3. Keep route A (our own codes) as a **US-only web or Google-only** idea. It is **not allowed on Apple**, so it cannot be the main path for kids on iPhones.
4. Whatever is chosen, the coin wallet stays separate, the card sells **cosmetics only**, the price is printed on the card, and a parent gate guards every redemption.

### 10.7 What I could not source
- Whether Apple or Google allow a third party to **sell** a store-issued code for money, and what they take.
- Whether Google requires a parent gate for promo-code redemption in a Families app.
- Whether Cloudflare counts as a "third party" under Apple's Kids rules.
- Cloudflare's IP log retention.
- Whether physical-card sales fall under Google's external content links fee.
- The exact COPPA compliance date (the Federal Register page is linked; counsel confirms).
- Any sourced revenue split.
- Apple's own page on parental gates (the 1.3 link names it but I did not read it).

---

## 11. Files in this PR
- `drafts/planning/R-SHOP.md` (this file).
- `drafts/planning/R-SHOP-sim/coins.py`: applies the proposed rules to measured rows and prints the table.
- `drafts/planning/R-SHOP-sim/zz-coins.test.ts.txt`: the measuring test (a `.txt` copy, same convention as `R-INSIGHT-BAL-sim`). To run it, copy it to `packages/sim/test/balance/zz-coins.test.ts` and run `COINS=1 SEEDS=100 OUT=/tmp/coins.json npx vitest run test/balance/zz-coins.test.ts` in `packages/sim`, then `python3 coins.py /tmp/coins.json > table.md`. Delete the copy afterward.
- `drafts/planning/R-SHOP-sim/table.md`: all 90 cells.

**Sources** (opened on Nov 1, 2026, except the two Club Penguin fan-wiki pages, see section 6)
- Apple: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (1.3, 3.1.1, 3.1.1(a), 3.1.3, 5.1.4); [offer codes](https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/create-offer-codes-for-in-app-purchases)
- Google: [Payments](https://support.google.com/googleplay/android-developer/answer/9858738); [Families](https://support.google.com/googleplay/android-developer/answer/9893335); [Promo codes](https://developer.android.com/google/play/billing/promo); [External content links (US)](https://support.google.com/googleplay/android-developer/answer/16470497); [US policy update](https://support.google.com/googleplay/android-developer/answer/15582165)
- FTC: [16 CFR 312 (eCFR)](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312); [Federal Register, April 22, 2025](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule)
- Games: [Bulbapedia Poké Mart](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9_Mart); [Nookipedia Nook's Cranny](https://nookipedia.com/wiki/Nook%27s_Cranny); [Nookipedia Bell](https://nookipedia.com/wiki/Bell); [Wikipedia Club Penguin](https://en.wikipedia.org/wiki/Club_Penguin); [Club Penguin Wiki Penguin Style](https://clubpenguinwiki.info/wiki/Penguin_Style); [Club Penguin Wiki Coin](https://clubpenguin.fandom.com/wiki/Coin)
