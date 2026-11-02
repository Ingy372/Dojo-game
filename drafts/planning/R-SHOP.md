# R-SHOP: an earned-coin shop (code card shelved)

## Delivery Note
- **ITEM:** R-SHOP (research and plan, docs only). This is round 2, after Jay's calls of Nov 1, 2026.
- **WHAT:** a plan for a coin shop in the town. Kids earn coins only by playing. They can sell spare gear for coins. The shop sells looks and fun items only, never gear power. Round 2 widens the catalog from 38 to **148 permanent items plus 6 one-run sparkles (96,800 coins)** across character looks, effects and shop-only decor for the player's space, and re-runs the balance check on the bigger catalog. Includes the numbers (coins per run, sell prices, shop prices), how it fits crafting and the Hall of Masters, the doc lines that must change, board items, and the art load against April 2027. The code card (section 10) is **shelved by Jay** and kept only for reference.
- **WHY:** Jay asked for a shop that replaces "Let go" when the bag is full, keeps coins earned, and leaves room for a parent-gated paid store later without a rebuild. On Nov 1 he said: the shop ships at the April 2027 launch, the code card is shelved, sparkles are in, my other picks stand, and the shop may sell its own decor as long as decor earned in S7 is never sold.
- **DECIDE:** the new taste calls 16 to 22 in section 9. The biggest: whether to accept the art load (90 new pictures, 24 of them character layers) with a staged fallback, and what to do about the shop running dry at belt 7.
- **NEXT:** if Jay approves, the Manager boards the items in section 8 and applies the doc edits in section 7. No game code and no board edits are in this PR.

**Read this first (the short version)**
1. **Beta (Dec 15, 2026): no shop.** The town is still a picture and the shop building cannot be tapped. The bag has no size limit in code, so "bag full" does not exist yet. The beta pages tell parents "no purchases". An optional tiny "beta-lite" is in section 8, and I recommend against it.
2. **Launch (April 2027): the shop ships (Jay's call).** **148 permanent items** (Looks 58, Effects 28, Space 62) **plus 6 one-run sparkles**. Total **96,800 coins**. Every item is looks only: power 0, no randomness, no timers, ages 6+, dojo-respectful, no text, nothing that looks like a belt or a rank.
3. **The numbers [PROPOSED on MEASURED data]. The payout and the price bands do not change.** A run pays **60 coins whether you win or lose**, +3 per fight room cleared, +10 for a boss room, +10 for a win. Sold gear adds 1 / 2 / 5 / 12 coins at belt 1 (common / uncommon / rare / epic), rising to x1.5 at belt 10. Result across belts 1–10, all three difficulties, and the kid, newer and careful bots: **84 to 155 coins a run, a spread of 1.84x (target: 2x or less)**. Neighbouring belts differ by at most 1.13x. Selling is at most 35% of income. A kid who sells nothing still gets at least 74 coins a run. The sim rows are the same as round 1, so these figures did not move.
4. **Own everything: 624 to 1,151 runs, 78 to 144 weeks** at 8 runs a week (fastest and slowest live cell). Both fall inside the targets I fixed before computing (at least 52 weeks, at most 156). A Standard-difficulty kid-bot average is 122 weeks. At 4 runs a week the slowest cell is 288 weeks (5.5 years), so the 8-runs-a-week figure matters. It is a planning number, not measured from kids.
5. **The catch: the shop runs dry at belt 7.** The journey is 72 months. At the planning pace a Standard kid-bot owns everything in **month 29 (belt 8)**, the fastest cell in month 21 (belt 6). Belts 8, 9 and 10 are 45 of the 72 months and have **no shelf at launch**. Post-launch shelves (SHOP-CAT-02) are the answer, not a payout change.
6. **Art is the risk for April.** The catalog needs **90 new pictures** (24 character layers, 16 shared effect shapes, 49 still pictures for decor and bag skins, 1 tintable wall), against "about 42" in round 1. 47 more items are only colour entries. A staged ship order puts the cheapest art first: **Stage 1 (54 items, 22,400 coins) needs no new pictures beyond 16 small shapes and 1 wall.** Details and the fallback are in section 8.
7. **Power items are cut.** The PE 12 kata reserve is already spoken for, so there is no room for a one-run power item. Zero-power sparkles stay (Jay: in).
8. **Code card: shelved (Jay).** Section 10 stays as reference only. Nothing in sections 3 to 9 depends on it.

All numbers are tagged: **[MEASURED]** from the bot sim or the repo, **[PROPOSED]** my choice, **[CODE]** read from the repo, **[SOURCE]** from a cited page, **[UNSOURCED]** my observation or a gap.

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

### 1.4b Round 2: the bigger catalog on the same table
The payout is unchanged, so the 90 cells above are the same coins per run. What changed is the **total to own** (28,000 became 96,800) and the shelf schedule. I added three checks, with targets fixed **before** computing [PROPOSED]:
- **Own everything:** in every live cell it takes at least **52 weeks** and at most **156 weeks** (3 years) at 8 runs a week. Too fast and the shop is empty in a year. Too slow and a kid never finishes.
- **Shelves:** each belt's shelf is within **2x** of its neighbour (belts 1–7), and each of belts 1–7 opens at least 2 small items (S or M) so there is always something near to buy.
- **Gi dyes:** every dye is at least 15 away (CIEDE2000) from every belt colour of the school, and at least 12 from every free gi swatch (section 3).

**Result [MEASURED + PROPOSED]** (`R-SHOP-sim/table.md`, `catalog.md`, `contrast.md`):
- **Own everything:** fastest live cell (Standard, careful, belt 10) **624 runs = 78 weeks**. Slowest (Challenge, kid, belt 4) **1,151 runs = 144 weeks (2.8 years)**. All 90 cells have the new "own all" columns. **89 PASS. The one FAIL is the same locked row as before** (Challenge, kid, belt 2: a Showpiece takes 40.6 runs, over the 40 limit; Challenge is locked at belt 2 in the real game).
- The slowest cell passes by only 12 weeks (144 of 156). If Jay adds more than about 8,000 coins of items, that cell breaks the 3-year target.
- **Shelves:** biggest neighbour jump in shelf value **x1.47** (pass). Smallest count of small items on a belt 1–7 shelf: **2** (pass).
- **Gi dyes:** all 12 pass. Six candidates were rejected by the rule (Coral, Gold, Sunflower, Tangerine, Cocoa, Navy grey), so the rule does work.

| Runs a week | Fastest cell (weeks) | Standard / kid average over belts (weeks) | Slowest cell (weeks) |
|---|---|---|---|
| 4 | 156 | 243 | 288 |
| 8 | 78 | 122 | 144 |
| 12 | 52 | 81 | 96 |

**The journey belt by belt** (planning pace 34.8 runs a month = 8 runs a week x 4.35 weeks, from `config.ts` [CODE]; months in rank from the school's belt list, 3 / 3 / 3 / 3 / 3 / 6 / 6 / 9 / 12 / 24 = 72 months [CODE]). "Owned" = the smaller of coins earned so far and shelf value open so far, assuming the kid spends as soon as something is affordable. Fast and slow are the best and worst live cells of each belt, so they are envelopes, not one real kid.

| Belt | Months | Std kid coins a run | Earned in belt (std kid) | Shelf value open (cumulative) | Owned: std kid | Owned: fast | Owned: slow |
|---|---|---|---|---|---|---|---|
| 1 | 3 | 99 | 10,284 | 11,200 | 11% | 12% | 11% |
| 2 | 3 | 99 | 10,340 | 20,800 | 21% | 21% | 21% |
| 3 | 3 | 98 | 10,230 | 33,600 | 32% | 35% | 32% |
| 4 | 3 | 94 | 9,849 | 46,400 | 42% | 48% | 41% |
| 5 | 3 | 98 | 10,259 | 65,200 | 53% | 67% | 50% |
| 6 | 6 | 100 | 20,941 | 81,600 | 74% | 84% | 70% |
| 7 | 6 | 99 | 20,761 | 96,800 | 96% | 100% | 88% |
| 8 | 9 | 101 | 31,567 | 96,800 | 100% | 100% | 100% |
| 9 | 12 | 103 | 42,837 | 96,800 | 100% | 100% | 100% |
| 10 | 24 | 104 | 87,095 | 96,800 | 100% | 100% | 100% |

- Through belts 1–5 the shelf is never the limit for the std kid: a kid who earns 10,000 coins in a belt has 11,000+ new coins of shelf to look at. A fast kid is held by the shelf from belt 1 (13,765 coins earned against 11,200 of shelf), so some coins carry over. That is fine, and it makes saving for a Showpiece natural.
- Std kid owns everything in **month 29 (belt 8)**, the fastest cell in **month 21 (belt 6)**, the slowest in **month 31 (belt 8)**. From then on coins have nothing to buy. **This is the real finding of round 2.** The payout is not the problem. The kid earns about 100 coins a run for 72 months and the shelf holds 96,800 coins. Fixing it by cutting the payout would make every early item twice as slow (an S item would take 3 to 5 runs), which breaks the "a first item in 1–3 runs" target. So **I keep the payout and the bands** and plan more shelves for belts 8–10 (SHOP-CAT-02).
- **The numbers move with how often kids play.** At 4 runs a week the std kid owns everything after about 243 weeks (4.7 years, month 56, belt 10). Test it with students before trusting either figure.

**Do the bands need to change? No.** Every band still takes the same number of runs as the table above (S 1.3–2.4, M 2.6–4.8, L 5.2–9.5, XL 10–19, Showpiece 21–38). The bands were set against the payout, not the catalog size, so a bigger catalog does not move them.

### 1.5 Findings you should know
1. **Belt 3 finds about half as many items** (3.6 / 6.7 / 7.1 against about 14). The Ember Kitchens enemies have no drop chance in `content/loot/drops.json`. That is a roughly 2x neighbour jump in *items*, not coins. Coins stay within 1.13x only because the 60 base carries the income. If someone later raises coin income by selling more, this gap will show. Fix belongs in loot content (board item SHOP-BAL-01).
2. **There is no bag cap in code.** Jay's "when the bag is full" trigger needs a defined size first. Until then Sell can only be a button on the bag screen.
3. **No pup exists** in any doc or code, so "pup looks" cannot be built yet. See section 3.
4. **(Round 2) The shop runs dry.** With 148 items and 96,800 coins, a Standard kid owns everything in month 29 of the 72-month journey, and belts 8 to 10 have no shelf. This is a catalog-size question, not a payout question (section 1.4b).

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

## 3. The shop catalog (148 permanent items, 96,800 coins, plus 6 sparkles)

The full list is built by `R-SHOP-sim/catalog.py` (output in `R-SHOP-sim/catalog.md`). Every item is a **look or a fun effect**. None changes a number in the sim. Prices use the six bands from section 1.5.

### 3.1 The rules every item must pass [PROPOSED]
Jay's brief: looks and fun only, ages 6+, dojo-respectful, no power, no randomness, no time pressure.
- **Power 0.** Nothing here touches HP, damage, speed, loot, XP, kata, drops or difficulty. The sim never reads a shop id (test in SHOP-TEST-01: the sim hash is the same with and without every item equipped).
- **Fixed stock, always there.** No rotation, no daily deals, no timers, no "only N left", no "new today" banners, no countdowns. A price never changes. Coins never expire.
- **No randomness.** You pick what you buy. No boxes, no bundles with hidden contents, no "surprise" items.
- **Ages 6+ and dojo-respectful.** No weapons, blood, skulls, fire that burns things, scary or mean faces, brand marks, team marks, flags or logos. No text on any item (the school may later add a name through the school settings, not the shop).
- **Nothing that looks like a rank.** The belt is never customizable (`docs/core-design.md:750`). So the shop sells no belts, no waist sashes, no sleeve or leg stripes, no belt-end tape, no belt-coloured bands at the waist, and no solid gold, white or belt-coloured trophies. The belt stays the top layer on every outfit and gi print, and the Tester checks that the belt is visible in all 13 animations.
- **Certified trophies stay certified.** Nothing here looks like a trophy or a medal. (Hall rules, `drafts/planning/S6-*` and the Hall of Masters stay untouched.)
- **Kid-safe buying.** The existing "tap to confirm" step (section 3.10) for every purchase, and no real money anywhere in the shop (row 6 in section 7).

### 3.2 The catalog

| Category | Group | Price | Items | Sub-total | Opens at belt | Art |
|---|---|---|---|---|---|---|
| Looks | Gi dyes (solid) | 200 | 12 | 2,400 | 1 (6), 2 (6) | tint |
| Looks | Fun hair dyes | 200 | 8 | 1,600 | 1 (4), 2 (4) | tint |
| Looks | Patterned headbands | 400 | 8 | 3,200 | 1 (2), 2 (3), 3 (3) | char, 4 pictures |
| Looks | Hair accessories | 400 | 6 | 2,400 | 1 (2), 2 (2), 3 (2) | char, 3 pictures |
| Looks | Gi prints | 400 | 6 | 2,400 | 3 (3), 4 (3) | char, 3 pictures |
| Looks | Scarves | 400 | 4 | 1,600 | 4 (2), 5 (2) | char, 2 pictures |
| Looks | Glasses (clear lenses) | 400 | 4 | 1,600 | 5 (2), 6 (2) | char, 2 pictures |
| Looks | Back items | 800 | 4 | 3,200 | 5 (4) | char, 4 pictures |
| Looks | Outfits (belt stays on top) | 1,600 | 6 | 9,600 | 6 (3), 7 (3) | char, 6 pictures |
| Effects | Walk trails | 400 | 10 | 4,000 | 1 (3), 2 (2), 3 (2), 4 (1), 5 (1), 6 (1) | fx |
| Effects | Dash puffs | 200 | 4 | 800 | 1 (4) | fx |
| Effects | Hit pops | 800 | 8 | 6,400 | 2 (1), 3 (2), 4 (2), 5 (2), 6 (1) | fx |
| Effects | Victory bursts | 800 | 6 | 4,800 | 2 (1), 3 (1), 4 (1), 5 (1), 6 (2) | fx |
| Space | Bag skins | 400 | 4 | 1,600 | 1 (4) | ui, 4 pictures |
| Space | Wall paint | 400 | 6 | 2,400 | 1 (3), 2 (3) | tint |
| Space | Floor patterns | 800 | 4 | 3,200 | 3 (2), 4 (2) | decor, 4 pictures |
| Space | Wall hangings | 400 | 8 | 3,200 | 1 (3), 2 (2), 3 (1), 7 (2) | decor, 4 pictures |
| Space | Large wall hangings | 800 | 4 | 3,200 | 4 (2), 5 (2) | decor, 2 pictures |
| Space | Wall pieces | 800 | 8 | 6,400 | 3 (2), 4 (2), 5 (2), 6 (2) | decor, 8 pictures |
| Space | Small floor pieces | 400 | 10 | 4,000 | 1 (4), 2 (3), 3 (3) | decor, 9 pictures |
| Space | Medium floor pieces | 800 | 8 | 6,400 | 3 (2), 4 (2), 5 (2), 6 (2) | decor, 8 pictures |
| Space | Large floor pieces | 1,600 | 6 | 9,600 | 4 (1), 5 (2), 6 (1), 7 (2) | decor, 6 pictures |
| Space | Showpieces | 3,200 | 4 | 12,800 | 5 (1), 6 (1), 7 (2) | decor, 4 pictures |
| Run sparkles | One-run effects, 100 coins each use | 100 | 6 | n/a | 1 | fx |
| **Total permanent** | | | **148** | **96,800** | | |

**Counts by category:** Looks **58** items (28,000 coins), Effects **28** (16,000), Space **62** (52,800). **148 permanent, 96,800 coins.** Plus **6 run sparkles** at 100 coins per use (not counted in the total, they are used up).

### 3.3 Every item
In brackets is the belt where the item opens. Colourways of one picture (for example "Dots, pink" and "Dots, teal") share art.

| Group | Price | Items (belt it opens at in brackets) |
|---|---|---|
| Gi dyes (solid) | 200 | Rose [1]; Peach [1]; Mint [1]; Aqua [1]; Lilac [1]; Sage [1]; Plum [2]; Teal [2]; Pine [2]; Mauve [2]; Bubblegum [2]; Lime [2] |
| Fun hair dyes | 200 | Bubblegum [1]; Mint [1]; Lilac [1]; Peach [1]; Aqua [2]; Sunset [2]; Silver [2]; Rose gold [2] |
| Patterned headbands | 400 | Dots, pink [1]; Dots, teal [1]; Stars, yellow [2]; Stars, sky [2]; Waves, blue [2]; Waves, mint [3]; Checks, plum [3]; Checks, orange [3] |
| Hair accessories | 400 | Bow, pink [1]; Bow, sky [1]; Hair clips, yellow [2]; Hair clips, mint [2]; Flower, rose [3]; Flower, lilac [3] |
| Gi prints | 400 | Clouds, sky [3]; Clouds, rose [3]; Waves, ocean [3]; Waves, teal [4]; Leaves, sage [4]; Leaves, plum [4] |
| Scarves | 400 | Knit scarf, mint [4]; Knit scarf, rose [4]; Bandana, dots [5]; Bandana, stars [5] |
| Glasses (clear lenses) | 400 | Round frames, blue [5]; Round frames, pink [5]; Star frames, yellow [6]; Star frames, mint [6] |
| Back items | 800 | Little backpack [5]; Folded kite [5]; Satchel [5]; Paper umbrella [5] |
| Outfits (belt stays on top) | 1,600 | Festival jacket [6]; Summer tee and shorts [6]; Snow-day jacket [6]; Garden overalls [7]; Rainbow track suit [7]; Starry pajamas [7] |
| Walk trails | 400 | Cherry petals [1]; Maple leaves [1]; Ink swish [1]; Star dust [2]; Bubbles [2]; Paper confetti [3]; Fireflies [3]; Snow sparkle [4]; Ribbon swirl [5]; Little hearts [6] |
| Dash puffs | 200 | Dust cloud [1]; Leaf puffs [1]; Star puffs [1]; Snow puffs [1] |
| Hit pops | 800 | Star pop [2]; Petal burst [3]; Ink splash [3]; Leaf burst [4]; Drum ring [4]; Firework pop [5]; Bubble pop [5]; Paper-bits burst [6] |
| Victory bursts | 800 | Lantern rise [2]; Petal rain [3]; Confetti fall [4]; Fireworks [5]; Paper stars [6]; Ribbon streamers [6] |
| Bag skins | 400 | Sunrise [1]; Night sky [1]; Garden [1]; Ocean [1] |
| Wall paint | 400 | Sunrise [1]; Seafoam [1]; Lavender [1]; Sand [2]; Sky [2]; Rose [2] |
| Floor patterns | 800 | Wood plank [3]; Woven floor [3]; Stone path [4]; Pastel tiles [4] |
| Wall hangings | 400 | Wave, blue [1]; Wave, rose [1]; Mountain, green [1]; Mountain, grey [2]; Moon, indigo [2]; Moon, yellow [3]; Sun, orange [7]; Sun, pink [7] |
| Large wall hangings | 800 | Koi, orange [4]; Koi, blue [4]; Sakura, pink [5]; Sakura, white [5] |
| Wall pieces | 800 | Moonlit window [3]; Sakura window [3]; Mountain window [4]; Rainy window [4]; Bell wind chime [5]; Shell wind chime [5]; Star mobile [6]; Paper boat mobile [6] |
| Small floor pieces | 400 | Round rug, blue [1]; Round rug, rose [1]; Low tea table [1]; Shoe cubby [1]; Sunflower pot [2]; Umbrella stand [2]; Cat basket [2]; Book stack [3]; Fish bowl [3]; Plush toy bin [3] |
| Medium floor pieces | 800 | Bookshelf [3]; Rock garden [3]; Fish tank [4]; Water fountain [4]; Stepping stones [5]; Hammock [5]; Craft table [6]; Toy chest [6] |
| Large floor pieces | 1,600 | Koi pond [4]; Cherry tree [5]; Gazebo [5]; Tea house nook [6]; Big round rug [7]; Play loft [7] |
| Showpieces | 3,200 | Moon garden [5]; Cherry grove [6]; Waterfall garden [7]; Giant kite display [7] |
| Run sparkles (one run each) | 100 | Cherry-blossom trail; Confetti win; Drum-roll finish; Lantern glow; Star shower; Bubble pop (all at belt 1) |

### 3.4 Character looks (Looks, 58 items)
- **How they are drawn [CODE-doc].** The player art is layers. The gi and hair are tinted from palettes, and the belt is its own top layer (`incoming-art/player-custom/README.md`). Gi dyes and hair dyes are therefore **new palette entries, no new picture**. Headbands, hair accessories, gi prints, scarves, glasses, back items and outfits are **new character layers**, each rendered for 13 animations x 8 directions x 2 bodies at 128x160. That is why art for them is a separate, bigger job (section 8).
- **Gi dyes (12, 200 each).** Solid gi colours, **body only, never the belt**. These are the "gi colours that don't clash with real rank". The rule is a number, not a feeling [PROPOSED]: every dye is at least **15** away from every belt colour of the school, and at least **12** from every free gi swatch, using CIEDE2000 (a standard colour-distance measure; 2.3 is "just noticeable", 15+ is clearly different). The 8 belt colours are at least 21.6 apart from each other.

| Dye | Colour | Closest belt colour | Closest free swatch | Result |
|---|---|---|---|---|
| Rose | #e8a0b4 | 27.8 (white) | 24.6 | PASS |
| Peach | #f5c6a8 | 17.4 (white) | 13.7 | PASS |
| Mint | #a8dcc4 | 19.8 (white) | 19.6 | PASS |
| Aqua | #6fd0d8 | 24.9 (white) | 17.2 | PASS |
| Lilac | #b9a2dc | 27.5 (blue) | 18.0 | PASS |
| Sage | #9db59a | 17.6 (green) | 18.4 | PASS |
| Plum | #6a3a7a | 27.2 (blue) | 17.1 | PASS |
| Teal | #2e8c8c | 23.9 (green) | 19.4 | PASS |
| Pine | #2f5d48 | 26.5 (black) | 12.1 | PASS |
| Mauve | #9b6b8a | 27.2 (red) | 19.8 | PASS |
| Bubblegum | #f08fc0 | 31.7 (white) | 25.2 | PASS |
| Lime | #b6d94c | 16.7 (yellow) | 22.7 | PASS |
| Coral | #e86f5c | 12.9 (red) | 18.8 | FAIL (not shipped) |
| Gold | #c9a227 | 12.8 (yellow) | 24.1 | FAIL (not shipped) |
| Sunflower | #f2e07a | 7.9 (yellow) | 16.6 | FAIL (not shipped) |
| Tangerine | #f7a35c | 7.1 (orange) | 22.2 | FAIL (not shipped) |
| Cocoa | #5b4636 | 10.4 (brown) | 15.9 | FAIL (not shipped) |
| Navy grey | #3c4a6b | 18.8 (blue) | 7.4 | FAIL (not shipped) |

  Six candidates failed and are not sold (Coral, Gold, Sunflower, Tangerine, Cocoa, Navy grey). **A per-school check is needed** (SHOP-CHAR-01): schools set their own belt colours, so the shop is built per school and a dye that fails that school's list is simply not stocked there. The 12 above are checked against this repo's belt colours only.
- **Fun hair dyes (8, 200 each).** Colours outside the 10 free hair swatches: Bubblegum, Mint, Lilac, Peach, Aqua, Sunset, Silver, Rose gold. Hair is not a rank signal, so there is no belt check, but the head clearance (27 px, hair-12) stays.
- **Patterned headbands (8, 400).** Dots, stars, waves, checks, each in two colours. **Always patterned, never solid.** S10's earned headbands are plain colours (gold, mint, sky, white); the shop never sells a plain one, so an earned headband still reads as earned.
- **Hair accessories (6), glasses (4), scarves (4).** Bows, clips, flowers; round and star frames with clear lenses (no mirrored, dark or "cool guy" lenses, no face covering); knit scarves and bandanas (no mask look: the scarf stays below the chin).
- **Gi prints (6, 400).** Soft clouds, waves and leaves on the gi jacket body, **not on the edges**, because S10's earned gi trims are edge colours. The prints never touch the belt layer.
- **Back items (4, 800).** Little backpack, folded kite, satchel, paper umbrella. No weapons on the back (no swords, no staffs, no bows), no bags that read as a school uniform of another school.
- **Outfits (6, 1,600).** Festival jacket, summer tee and shorts, snow-day jacket, garden overalls, rainbow track suit, starry pajamas. These are the biggest and last looks, only at belts 6 and 7. **The belt stays on top and visible on every outfit.** Whether pajamas and overalls feel dojo-respectful is a taste call for Jay (section 9, call 19). If cut, the total drops by 3,200 (two XL items).
- **Not sold, on purpose:** belts, belt colours, stripes, waist sashes, headbands/wraps/trims/auras that S10 gives as rewards, hairstyles (S10/base art own them), face paint, tattoos, masks, hats that hide hair-12.

### 3.5 Effects (28 permanent + 6 sparkles)
Effects are **recipes in data** (shape, colour, count, speed, lifetime) drawn by one small renderer from **16 shared particle shapes** (petal, leaf, ink stroke, star, bubble, confetti bit, soft dot, four-point sparkle, ribbon, heart, soft puff, ink blob, ring, spark line, lantern orb, firework burst). No frame animations are needed, so the 28 effects cost 16 small shapes and one renderer (SHOP-FX-01), not 28 pictures.
- **Walk trails (10, 400).** Cherry petals, maple leaves, ink swish, star dust, bubbles, paper confetti, fireflies, snow sparkle, ribbon swirl, little hearts. One slot: a trail behind the feet while walking in town and in runs.
- **Dash puffs (4, 200).** Dust cloud, leaf puffs, star puffs, snow puffs. One slot: the puff at a dash.
- **Hit pops (8, 800).** Star pop, petal burst, ink splash, leaf burst, drum ring, firework pop, bubble pop, paper-bits burst. One slot: a small picture where the player's hit lands, **added to** the existing hit flash, pause, damage number and sound, never instead of them.
- **Victory bursts (6, 800).** Lantern rise, petal rain, confetti fall, fireworks, paper stars, ribbon streamers. One slot: on a win screen and at a boss win, up to 3 seconds.
- **Run sparkles (6, 100 per use, belt 1):** cherry-blossom trail, confetti win, drum-roll finish, lantern glow, star shower, bubble pop. A sparkle is a one-run version that plays on top of the equipped effects for one run, then is used up. Jay: in. It changes no number.
- **Safety rules for every effect [PROPOSED]:**
  1. **Reduced motion.** When `reducedMotion()` is on (it already exists in the client) an effect becomes one still picture for under half a second, or nothing. No kid is forced to see motion.
  2. **No flashing.** No more than 3 flashes in any 1 second, and never a full-screen flash, which is the rule in [WCAG 2.2, Three Flashes or Below Threshold (2.3.1)](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) [SOURCE]. Firework effects use soft shapes that fade, not white flashes.
  3. **Never hide the fight.** Effects draw **below** enemy telegraphs, health bars and damage numbers, and never cover the player's own position. A test spawns every effect over a telegraph and checks the telegraph stays fully visible.
  4. **Small and short.** At most 24 particles alive per effect, trails fade in 0.8 s, hit pops in 0.4 s, victory bursts in 3 s. The Tester measures the frame rate on the oldest phone the app supports [UNSOURCED: no device list exists yet].
  5. **No body glow.** The aura is S10's earned look, so the shop has no effect that wraps the character.
  6. **No new sound.** Effects are silent or use the existing sounds.
  7. **Equipped, not stacked.** One of each slot (trail, puff, hit pop, victory burst) plus one sparkle. Every slot has "none" and the default is always free and always selectable.

### 3.6 Space: shop-only decor for the player's space (Space, 62 items)
The Home Dojo is the player's space. **Jay's exception (Nov 1): the shop may sell its own decor. Decor earned in S7 is never sold and stays earned.** To keep the two clearly apart:
- **Own file, own style tag.** Shop decor lives in `content/shop/decor.json`, never in `content/dojo/decorations.json` (S7's earned set, 41 ids). Every shop piece carries the "shop" style tag, so a visitor sees which are bought and which are earned. A validator rejects a shop id that exists in `decorations.json`, and the S7 earned file may not list a shop id.
- **No shape overlap.** I read the S7 set (`content/dojo/decorations.json`, `drafts/planning/S7-decoration-sources.md`). The shop does **not** sell lanterns, bonsai, banners or pennants, scrolls, mats, cushions, statues, trophies or trophy-like shelves, folding screens, crane motifs, or anything shaped for the Hall of Masters. Shop decor uses everyday things instead: rugs, low tables, plants, pets' baskets, windows, hangings, mobiles, ponds, trees.
- **Sellable groups:** wall paint (6, a tint on the Home Dojo wall mask; needs 1 wall picture), floor patterns (4), bag skins (4, the bag screen's look, no size change), wall hangings (8) and large wall hangings (4), wall pieces (8: windows, wind chimes, mobiles), small floor pieces (10), medium floor pieces (8), large floor pieces (6), showpieces (4: moon garden, cherry grove, waterfall garden, giant kite display).
- **Placed in the Home Dojo only.** Never in the Hall, the Tower or the town. Whether the Home Dojo has a wall tint and a floor pattern slot is **not checked by me** (the S7 code has the pieces, I did not read a floor pattern slot) and is listed as a risk in SHOP-ART-02.
- **Wall hangings and large hangings are pictures of nature** (wave, mountain, moon, sun, koi, sakura). No text, no calligraphy, no belt or rank signs.

### 3.7 No overlap with earned looks [PROPOSED]
| Earned thing (source) | What the shop does |
|---|---|
| S10 headbands (plain gold, mint, sky, white) | Shop headbands are all patterned. No plain colour is sold. |
| S10 hand wraps | None in the shop. |
| S10 gi trims (edge colours) | Shop gi prints sit on the jacket body, never the edges. |
| S10 auras (warm white, mint, lavender) | None. No effect wraps the body. |
| S10 base looks (free gi and hair swatches) | Dyes are at least 12 away from the free gi swatches and outside the free hair swatches, so nothing is a repaint of a free one. |
| S7 earned decor (41 ids) | Shop decor is in its own file with its own tag, with none of the S7 shapes. S7 pieces are never for sale. |
| Certified trophies, Hall plaques and frames | Nothing in the shop looks like one. |
| Belts and ranks | Not sold, not copied, not hinted (section 3.1). |

### 3.8 The shelf per belt (what opens at promotion)
Shelves open with promotion and stay open. I sized each belt's shelf to about **9,600 to 18,800 coins** of items so a Standard kid is not held at the gate through belt 5 (50,963 coins earned by the end of belt 5 against 65,200 of shelf; a fast kid is held and carries coins over), and every shelf has at least 2 small items (S or M). The shop is 100% open at belt 7. **Belts 8 to 10 (45 months) have no launch shelf**, which is SHOP-CAT-02. The 35 items that open at belt 1 should be grouped by category in the UI (looks, effects, space), not shown as one long list.

| Belt | Months in rank | Items opening | Coins opening | Cumulative coins open | Cumulative share | Small items (S or M) |
|---|---|---|---|---|---|---|
| 1 | 3 | 35 | 11,200 | 11,200 | 12% | 35 |
| 2 | 3 | 27 | 9,600 | 20,800 | 21% | 25 |
| 3 | 3 | 23 | 12,800 | 33,600 | 35% | 14 |
| 4 | 3 | 18 | 12,800 | 46,400 | 48% | 6 |
| 5 | 3 | 21 | 18,800 | 65,200 | 67% | 5 |
| 6 | 6 | 15 | 16,400 | 81,600 | 84% | 3 |
| 7 | 6 | 9 | 15,200 | 96,800 | 100% | 2 |
| 8 | 9 | 0 | 0 | 96,800 | 100% | 0 |
| 9 | 12 | 0 | 0 | 96,800 | 100% | 0 |
| 10 | 24 | 0 | 0 | 96,800 | 100% | 0 |

Biggest neighbour jump in shelf value, belts 1 to 7: x1.47. Smallest shelf with small items: 2 (belts 1 to 7).

### 3.9 Ship order and art (for April 2027)
| Bucket | Count | What |
|---|---|---|
| New character layers | 24 | each rendered for 13 animations x 8 directions x 2 bodies |
| Colour entries, no new picture | 47 | gi and hair dyes, wall paints, and the extra colourways of a picture |
| Effect and decor pictures | 66 | 16 shared particle shapes + 49 still pictures + 1 tintable wall |
| Effect recipes (data) | 28 + 6 sparkles | 28 permanent effects and 6 sparkles, all built from the shapes above |

New pictures in total: 90. Character layers need about 1,190 renders per body each (80 min per body for 32 layers on 8 cores, incoming-art/player-custom/README.md), so all 24 take about 1.0 hours per body of machine time. The slow parts are the modelling and Jay approving each picture.

| Stage | Items | Coins | Pictures needed | Fallback value |
|---|---|---|---|---|
| Stage 1: no new pictures (colour entries and effect recipes) | 54 | 22,400 | 16 small shapes + 1 wall (+ the effect renderer) | Belts 1 to 6 still have 20 / 17 / 5 / 4 / 4 / 4 items (5,200 / 5,600 / 3,200 / 2,800 / 2,800 / 2,800 coins). 145 to 267 runs of coins (18 to 33 weeks at 8 a week). |
| Stage 2: still pictures (decor and bag skins) | 56 | 50,400 | 49 still pictures | Stage 1 + 2 = 110 items, 72,800 coins, a full shelf for belts 1 to 7. |
| Stage 3: character layers | 38 | 24,000 | 24 character layers | Can ship in the first update after launch. |

A shelf with art that is not ready simply does not list that item (the validator checks that every listed item has art), so a partial catalog is a smaller catalog, not a broken one.

### 3.10 Buying
The kid sees the item (a preview of exactly what they get), the price, and their coins before and after. One confirm tap. No timer. No "you could earn more by...". Spending can't take coins below 0. A bought look is equipped from the same screen.

### 3.11 Not at launch
- **Emotes** (8 at S, 200 = 1,600): preset emotes only make sense with the live town square, which is a second-release feature (core-design section 13). Add with that release.
- **Pup looks:** there is no pup in any doc. Either a pup is designed first, or this is cut. Do not price what does not exist.
- **Power consumables: CUT.** Why: the budget rules leave no room. The PE 12 reserve is held back for the kata power (R-INSIGHT-BAL B8, section 6 reserve). The single-card range is PE 12-26, the pair cap is PE 50, and the kata ceilings are 38 / 62 / 67 **[CODE-doc]**. A one-run "extra damage" item would have to fit inside the reserve, which the kata power already uses, or break a ceiling. So it is cut, not shrunk. If Jay's final kata powers use less than 12, the Content Designer can re-check this, but I would still keep power out of the shop (Jay's rule: never sells gear power).
- **Code card: shelved (Jay, Nov 1).** Section 10 is reference only.
- **Real-money cosmetics:** post-launch only, built as nothing now (section 4).

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
- Shop decor goes in the Home Dojo only, lives in its own file, and carries the "shop" style tag, so a visitor can tell an earned piece from a bought one. This keeps S7's rule that earned decor means something. Jay's call (Nov 1): the shop may sell its own decor, and S7 earned decor is never sold.
- The shop never sells a copy of an earned look's or earned decor's art (section 3.7). The S7 question is settled by Jay's Nov 1 call (section 9, call 6).

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
| 5 | `docs/core-design.md:485` | `Every decoration is earned, in the Tower or through real achievements. Nothing is ever bought.` | `Every decoration is earned, in the Tower or through real achievements. The coin shop also sells its own separate decor, bought only with coins earned by playing, and earned decor is never sold. Real money never buys one.` |
| 6 | `docs/core-design.md:751` | `- **Extra looks are earned, never bought:** headbands, hand wraps, gi trims, and auras from the Tower, Challenge mode, and real milestones.` | `- **Extra looks are earned, or bought with earned coins:** headbands, hand wraps, gi trims, and auras from the Tower, Challenge mode, and real milestones are earned. The coin shop sells its own separate looks (gi dyes, hair dyes, patterned headbands, hair accessories, gi prints, scarves, glasses, back items, outfits), effects (trails, dash puffs, hit pops, victory bursts, sparkles) and decor for the Home Dojo. Real money never buys a look, and no belt, stripe or trophy is ever sold.` Also widen line 752 ("Every option is available to every player from the start except earned items") to: `...except earned items and shop items bought with earned coins.` |
| 7 | `docs/framework.md:25` | `- **No purchases, ads, loot boxes, or gambling mechanics.** It's included with the school's membership.` | `- **No real-money purchases, ads, loot boxes, or gambling mechanics.** It's included with the school's membership. Coins are earned only by playing.` |
| 8 | `docs/framework.md:40` | `\| **Cost to families** \| Included with membership: no purchases, no ads \|` | `\| **Cost to families** \| Included with membership: no real-money purchases, no ads \|` |
| 9 | `docs/framework.md:251` | `...Decorations come from three places, and none are ever bought:` | `...Decorations come from three places, none ever bought with real money, plus a coin shop that takes only earned coins:` (then add a fourth bullet: `- **The coin shop:** its own decor set, separate from the three above.`) |
| 10 | `docs/framework.md:493` | `- **No purchases, loot boxes, or ads,** ever.` | `- **No real-money purchases, loot boxes, or ads,** ever. Coins are earned by playing and never sold.` |
| 11 | `docs/decisions.md:382` | `- **Cosmetics (J5, Jay, 2026-10-23):** cosmetics come from gear, in-game achievements and dojo achievements, and are never bought.` | `- **Cosmetics (J5, Jay, 2026-10-23):** cosmetics come from gear, in-game achievements and dojo achievements, and are never bought with real money.` and add a new line: `- **Coin shop (R-SHOP, Jay, 2026-11-01):** earned coins only, sell spare gear, looks, effects and shop decor only, no power, no random boxes, no timers. Ships at the April 2027 launch, not beta. S7 earned decor is never sold. The code card is shelved.` |
| 12 | `docs/decisions.md:84` | `- **"Let go":** unwanted gear can be removed from the bag (two taps to confirm). When crafting arrives (after launch), this becomes "break down into materials".` | `- **"Let go":** unwanted gear can be removed from the bag (two taps to confirm). At launch the bag offers "Sell for coins" or "Break down into materials" (per item, never both).` |
| 13 | `drafts/planning/S2-item-system.md:51` | `...The words are "Let go", never "salvage" or "sell".` | `...At launch the words are "Sell" (coins) and "Break down" (materials). "Let go" stays only in the beta.` |
| 14 | `drafts/planning/S2-item-system.md:64` | `- **No look is ever bought** (decisions.md line 382).` | `- **No look is ever bought with real money** (decisions.md line 382).` |
| 15 | `drafts/planning/S2-item-system.md:138` | `- No screen shows prices, a shop or anything to buy (word check).` | `- Until the shop ships (launch), no screen shows prices, a shop or anything to buy (word check).` |
| 16 | `drafts/planning/S7-decoration-sources.md:17` | `- **Earned, never bought** (core-design.md line 485). No shop, no paid currency, no ads.` | `- **Earned, or bought only with earned coins** (core-design.md line 485). The coin shop has its own decor set, not S7 pieces, and S7 earned decor is never sold. No paid currency, no ads.` |
| 17 | `drafts/planning/S10-cosmetic-unlocks.md:15` | `- **Never:** purchases, loot boxes, timers, days-in-a-row rules, "last chance" or expiry.` | `- **Never:** real-money purchases, loot boxes, timers, days-in-a-row rules, "last chance" or expiry. Shop looks are separate from S10 looks.` |
| 18 | `content/dojo/decorations.json:2` (notes) | `Every decoration is earned, never bought.` | `Every decoration is earned, or bought with earned coins at the shop (shop pieces live in their own file).` |
| 19 | `content/settings/safety.json:7` | `There are no accounts, no ads, no purchases, no chat and no tracking tools.` | **Beta: no change** (still true). At launch: `...no ads, no real-money purchases, no chat...` |
| 20 | `drafts/planning/BETA-privacy-page.md:11`, `BETA-testflight-text.md:18` and `:47` | `no ads, purchases, chat or accounts` | **Beta: no change.** At launch: `no ads, real-money purchases, chat or accounts` |
| 21 | `docs/work-board.md:78` and `:97` (J5) | `...earned only and never bought...` / `...are never bought.` | Manager updates the wording, and adds the section 8 items. I did not touch this file. |

Two more to watch (not line edits):
- **If the code card is ever built (it is shelved),** `BETA-DEC15-plan.md:76` ("no server") and the privacy page must change, because a redemption server is a server.
- **Parent-facing promises** should say "no real-money purchases", not "no purchases". A coin shop is a purchase to a child's ear, even with earned coins.

---

## 8. Board items
Item IDs follow the work-board style. One owner each. Sizes are my guesses, not measured. **Round 2 changes** are marked "(round 2)". I did not edit `docs/work-board.md`. The Manager adds these after Jay approves.

| ID | Owner | What | Done when | Waits on | When |
|---|---|---|---|---|---|
| SHOP-DOC-01 | Content Designer | Apply the doc edits in section 7. | Every line in the table reads as proposed. A word check finds no "never bought" without "with real money" in docs and parent text. | Jay approves section 9. | Launch |
| SHOP-BAL-01 | Content Designer | Add drop chances to the belt 3 Ember Kitchens enemies in `content/loot/drops.json`. | Re-run of `R-SHOP-sim` shows belt 3 items per run within 2x of belt 2 and 4 for every bot. | Nothing. Can go in beta if loot is open. | Beta or launch |
| SHOP-COIN-01 | Programmer | Add `coins` to the profile and the run payout (60 base, +3 per fight room, +10 per boss, +10 win) and the sell ladder. Old saves start at 0. | Sim test reproduces `R-SHOP-sim/table.md` within 1 coin. Spread across live cells is 2x or less. Losing a run still pays 60. | Jay locks the numbers (section 9). | Launch |
| SHOP-BAGCAP-01 | Programmer | Define the bag size and what happens at the limit. There is none in code today. | A full bag shows Sell and Break down, never loses an item, and never blocks a run. | Jay picks the size (section 9). Related to MENU-BAG-01 (bag screen). | Launch (beta only with beta-lite) |
| SHOP-SELL-01 | Programmer | "Sell" and "Break down" on the bag screen, per item, two-tap confirm, no sell on worn items. | Selling gives exactly the table price. Break down and Sell never both pay. Earned looks stay in `ownedLooks`. | SHOP-COIN-01, SHOP-BAGCAP-01. | Launch |
| SHOP-DATA-01 (round 2) | Programmer | The data shape in section 4: separate `coins` and `entitlements[]`, catalog schema with `group`, `art` kind (`tint`, `char`, `fx`, `decor`, `ui`), `stage` (1 to 3), `shelfBelt`, validator. | Validator rejects power, off-band prices, timers or stock counts, items with both a coin price and a store id, **a shop id that exists in `content/dojo/decorations.json` or the S10 look list, an item with no art, and an effect over the caps in section 3.5**. No code path converts coins to entitlements. | SHOP-COIN-01. | Launch |
| SHOP-CAT-01 (round 2) | Content Designer | `content/shop/catalog.json` (looks, effects, sparkles) and `content/shop/decor.json` (Space): the **148 permanent items and 6 sparkles** in section 3 with shelves and belts. | Passes the validator. Total is **96,800** or Jay's edited total. Re-run of `R-SHOP-sim` keeps every live cell inside "own everything 52 to 156 weeks" and each belt 1 to 7 shelf within 2x of its neighbour. No item copies an S7 or S10 look. | SHOP-DATA-01, Jay's catalog calls. | Launch |
| SHOP-ART-01 (round 2) | Artist | The shop's own screens and shared shapes: a tappable shop building (the town art has one that is not tappable), a counter scene, **4 bag skins, 16 shared particle shapes**. | All art in the style guide, one preview per item, nothing resembles a belt, trophy or plaque. | SHOP-CAT-01. | Launch |
| SHOP-ART-02 (new, round 2) | Artist | **Shop decor: 45 still pictures + 1 tintable wall picture** (floor patterns 4, wall hangings 4, large hangings 2, wall pieces 8, small floor 9, medium floor 8, large floor 6, showpieces 4), each in the "shop" style tag. | One preview per item. No S7 shapes (section 3.6). The Programmer confirms the Home Dojo can take a wall tint and a floor pattern. | SHOP-CAT-01. | Launch (Stage 2) |
| SHOP-ART-03 (new, round 2) | Artist | **24 character layers**: 4 headband patterns, 3 hair accessories, 3 gi prints, 2 scarves, 2 glasses, 4 back items, 6 outfits. Each for 13 animations x 8 directions x 2 bodies, belt layer on top and visible. | Belt visible in every animation on every layer. Jay approves each look. The Programmer reports the added download size (section 8, size flag). | SHOP-CAT-01, SHOP-CHAR-01. | Stage 3: launch if it fits, else the first update |
| SHOP-CHAR-01 (new, round 2) | Programmer | Gi dye and hair dye palette entries, equip slots for the new character layers, the belt as top layer on every outfit, and the **per-school belt-colour check** (section 3.4). | A dye that is closer than 15 to any belt colour of that school is not stocked there. The build prints the check table. Equipping any item never changes the belt layer. | SHOP-CAT-01. | Launch |
| SHOP-FX-01 (new, round 2) | Programmer | One effect renderer: data recipes drawn from the 16 shapes, 5 slots (trail, puff, hit pop, victory burst, sparkle), reduced motion, caps in section 3.5. | Effects honour `reducedMotion()`, never exceed 3 flashes a second, draw below telegraphs, stay within 24 particles, and the sim hash is identical with and without them. | SHOP-ART-01 (shapes). | Launch |
| SHOP-CAT-02 (new, round 2) | Content Designer | **Shelves for belts 8, 9 and 10** (45 of the 72 months have none today), plus a plan to keep adding shelves after launch. | A Standard kid always has something new to buy within one belt. Total shelf per belt is chosen with Jay (section 9, call 20). | SHOP-CAT-01 shipped. | Post-launch |
| SHOP-UI-01 (round 2) | Programmer | The shop screen: shelves **grouped by category** (looks, effects, space; 35 items open at belt 1), exact preview (effects play for a moment), price, coins before and after, one-tap confirm, owned list, equip. Opens from the town shop building. | A kid can buy, see, wear and re-buy nothing twice. No timers. No "N left". Works with no network. Reduced motion respected. | SHOP-ART-01, SHOP-CAT-01. | Launch |
| SHOP-LEARN-01 | Learning & Engagement Designer | Words and an ethics read: kid-readable copy, no pressure words, a regret check for Sell (does a kid ever sell something they wanted?), the wording that coins are "earned", and a check that no look reads as rank or unfair "better". | A word list passes. A short student session finds no kid confused about what they get or what they gave up. | SHOP-UI-01 draft. | Launch |
| SHOP-TEST-01 (round 2) | Tester | Balance regression and rule tests: re-run the coin table and the own-everything check, prove each shop item changes no Power Rating and no sim hash, the word check, the gate on every link-out, **dye contrast, no id overlap with S7 and S10, belt visible on every outfit, each effect over a telegraph, effect caps and flash rate, reduced motion**. | All pass. Table spread is 2x or less. Zero shop items change Power Rating. | SHOP-COIN-01, SHOP-CAT-01, SHOP-FX-01. | Launch |
| SHOP-LITE-01 (optional) | Programmer | Beta-lite: coins and Sell only, no shop. | Same as SHOP-COIN-01 and SHOP-SELL-01 for beta. | Jay says yes, and the beta bag cap exists. | Beta (**not recommended**) |

### 8.1 Art load against April 2027 (flag)
**Beta vs launch.** Jay's call: **launch**. The shop building is still art you can't tap, the bag has no cap, and beta families are told "no purchases", so nothing here belongs in the Dec 15 beta.

**The load (round 2) is much bigger than round 1 [PROPOSED]:** **90 new pictures** (round 1: about 42). They are 24 character layers, 16 shared effect shapes, 49 still pictures (45 decor, 4 bag skins) and 1 tintable wall. Another 47 items are only colour entries and need no new picture. The 28 effects and 6 sparkles are data recipes.

**Pace evidence [MEASURED from git]:** 43 art folders were first committed between Oct 8 and Oct 30, 2026, 31 of them on Oct 24 and 25. A folder can hold one picture or the whole 416-file player set, so I cannot turn this into pictures a week. [UNSOURCED] There are about 5 months to April, and the Dec 15 beta needs art too.

**Size flag.** One finished character is about 18 MB at 80 px per tile before the 0.6x shrink (`incoming-art/player-custom/README.md`). Using the README's measured layer sizes as a proxy, the 24 new layers are about 46 MB per body before shrink. Both bodies would about double that, and I do not know whether the app ships both bodies or one. [UNSOURCED] SHOP-ART-03 must report the real added size before it ships.

**Fallback ladder (section 3.9).**
1. **Stage 1 (54 items, 22,400 coins):** dyes, hair dyes, wall paint and all 28 effects. No new pictures beyond 16 small shapes and 1 wall, plus the effect renderer. That is 18 to 33 weeks of coins at 8 runs a week. **The shop can honestly ship with this alone.**
2. **Stage 2 (+56 items, 50,400 coins):** still pictures for decor and bag skins. Stage 1 + 2 = 110 items and 72,800 coins, a full shelf through belt 7.
3. **Stage 3 (+38 items, 24,000 coins):** the 24 character layers. First update after launch if they are late.

My advice: set the launch gate at **Stage 1 complete and Stage 2 partly done**, and treat Stage 3 as a bonus. If even Stage 1 is late, the smallest honest shop is the belt 1 shelf only (20 items, 5,200 coins in Stage 1), with the rest added belt by belt.

**Beta-lite warning.** Coins that buy nothing would read as a broken feature and invite "what are these for?" questions from beta families. I recommend against it, but it is available if Jay wants Sell in beta.

---

## 9. Taste calls for Jay
**Jay's calls, Nov 1, 2026 (recorded):**
- **#1 Ship the shop at launch: DECIDED, the April 2027 launch.** Not beta. If art is tight, use the staged ship order in section 8.1.
- **#6 Shop and S7 decor: DECIDED, with an exception.** The shop may sell **its own decor**, but **decor earned in S7 stays earned and is never sold.** The two sets are kept apart by file, tag and shape (section 3.6, 3.7).
- **#7 Sparkles: DECIDED, in.** Six one-run sparkles at 100 coins per use.
- **#14 Code card: DECIDED, shelved.** Section 10 is reference only. Do not build it.
- **Everything else: Jay said my picks stand.** Calls 2, 4, 5, 8, 9, 10, 11, 12 and 13 below keep my recommendation. Call 3 (bag size) had no pick and is still open for the Content Designer. Call 15 is moot while the code card is shelved.

**Standing picks (recommended, Jay: stand):**
2. **Where Sell shows.** On the bag screen for any unworn gear at all times (not only when full), with the confirm. The "when the bag is full" rule then becomes just the moment the bag asks you to pick.
3. **Bag size.** There is none. I have no sourced number. The Content Designer can propose one after a student session. **Still open.**
4. **Does Challenge pay more?** No, flat. The two smart bots win 100% of Challenge runs from belt 4 up, while the kid bot wins only 25 to 36%, so a Challenge bonus would widen the gap between bots. It would also push kids toward the hardest mode.
5. **A loss pays 60.** Keep (no punishment).
8. **Open shelves by belt, or all at once.** By belt.
9. **Pup looks.** Cut until a pup is designed.
10. **Emotes.** With the live town square (second release).
11. **A "Sell all duplicates" button.** No at launch.
12. **Beta-lite Sell.** No.
13. **Coin name and art.** "Coins" is placeholder. Pick a dojo-flavoured name with the Artist.
15. **Revenue split for white-label dojos.** Moot, the code card is shelved.

**New calls from round 2 (each has my recommendation):**
16. **Fun hair dyes and many looks beside the free basics.** The core design says "every option is available to every player from the start except earned items" (core-design line 752). Shop looks are neither. I kept the free basics free and sell only distinct extras (patterned, not plain). Recommended: yes, and word row 6 in section 7 as written.
17. **Free gi swatches that are already close to a belt.** The free white, blue, red and cream gi swatches are only 3.5, 5.3, 6.9 and 7.2 from a belt colour (`R-SHOP-sim/contrast.md`). That is today's design, not the shop's, but a white gi next to a white belt hides the belt. Recommended: ask the Artist whether those swatches stay, and keep the belt on top and outlined.
18. **Gi dye rule.** At least 15 from every belt colour, at least 12 from the free swatches. Recommended: accept. The numbers came from looking at the table, so they are a starting rule. A school with unusual belt colours loses the dyes that clash, which makes its shop a little smaller.
19. **Outfits and dojo respect.** Six outfits at 1,600 each (9,600 coins): festival jacket, summer tee and shorts, snow-day jacket, garden overalls, rainbow track suit, starry pajamas. Recommended: keep the first four and the track suit, and **ask Jay about the pajamas** (the one most likely to feel un-dojo). If cut, remove 1,600. Belt stays on top on every outfit.
20. **Shelves for belts 8 to 10.** A Standard kid owns everything in month 29 of 72 at the planning pace. Recommended: ship the 148 now, then add a shelf per later belt (SHOP-CAT-02). I would not raise prices or cut the payout, because that makes the first items slow.
21. **How much art is too much for April.** 90 new pictures and 24 character layers. Recommended: gate the launch on Stage 1, partly Stage 2, and ship Stage 3 as the first update (section 8.1).
22. **The 8-runs-a-week planning figure.** Everything in weeks depends on it, and it is not measured from kids. Recommended: ask the dojo to log real runs a week during the beta.

---

## 10. Code card sold in the dojo pro shop (SHELVED by Jay, Nov 1, 2026)

> **SHELVED.** Jay shelved the code card on Nov 1, 2026. Do not build it, board it or edit docs for it. Nothing in sections 1 to 9 depends on it. This section stays only as reference in case it comes back. Everything below is the original round 1 text, unchanged.

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
- `drafts/planning/R-SHOP-sim/coins.py`: applies the proposed rules to measured rows and prints the table. Round 2 adds the own-everything columns, the 4 / 8 / 12 runs a week check and the belt-by-belt journey. The payout constants are unchanged.
- `drafts/planning/R-SHOP-sim/catalog.py` and `catalog.md` (round 2): the 148-item catalog, the shelf per belt, the art buckets and the ship order. Run `python3 catalog.py > catalog.md`.
- `drafts/planning/R-SHOP-sim/contrast.py` and `contrast.md` (round 2): the CIEDE2000 dye check against the belt colours and the free gi swatches. Run `python3 contrast.py > contrast.md`.
- `drafts/planning/R-SHOP-sim/zz-coins.test.ts.txt`: the measuring test (a `.txt` copy, same convention as `R-INSIGHT-BAL-sim`). To run it, copy it to `packages/sim/test/balance/zz-coins.test.ts` and run `COINS=1 SEEDS=100 OUT=/tmp/coins.json npx vitest run test/balance/zz-coins.test.ts` in `packages/sim`, then `python3 coins.py /tmp/coins.json > table.md`. Delete the copy afterward.
- `drafts/planning/R-SHOP-sim/table.md`: all 90 cells plus the own-everything and journey sections. Regenerate with `python3 coins.py /tmp/coins.json > table.md` after the measuring run.

**Sources** (opened on Nov 1, 2026, except the two Club Penguin fan-wiki pages, see section 6)
- Apple: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (1.3, 3.1.1, 3.1.1(a), 3.1.3, 5.1.4); [offer codes](https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/create-offer-codes-for-in-app-purchases)
- Google: [Payments](https://support.google.com/googleplay/android-developer/answer/9858738); [Families](https://support.google.com/googleplay/android-developer/answer/9893335); [Promo codes](https://developer.android.com/google/play/billing/promo); [External content links (US)](https://support.google.com/googleplay/android-developer/answer/16470497); [US policy update](https://support.google.com/googleplay/android-developer/answer/15582165)
- FTC: [16 CFR 312 (eCFR)](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312); [Federal Register, April 22, 2025](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule)
- Accessibility: [WCAG 2.2, 2.3.1 Three Flashes or Below Threshold](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold)
- Games: [Bulbapedia Poké Mart](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9_Mart); [Nookipedia Nook's Cranny](https://nookipedia.com/wiki/Nook%27s_Cranny); [Nookipedia Bell](https://nookipedia.com/wiki/Bell); [Wikipedia Club Penguin](https://en.wikipedia.org/wiki/Club_Penguin); [Club Penguin Wiki Penguin Style](https://clubpenguinwiki.info/wiki/Penguin_Style); [Club Penguin Wiki Coin](https://clubpenguin.fandom.com/wiki/Coin)
