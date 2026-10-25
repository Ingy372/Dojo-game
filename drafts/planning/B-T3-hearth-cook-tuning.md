# B-T3: Hearth Cook tuning (tier 3 Guardian, Orange)

- **ITEM:** B-T3 follow-up. Is the Hearth Cook too easy? (PR #278 probe: 40/40 wins in every case)
- **WHAT:** Re-ran #278's sim with Guardian comparisons, a 6-year-old "masher" check and 12 tuning variants.
- **DECIDE:** see the end.

## 1. What the sim actually shows
40 seeds, bot `smart` (`packages/sim/test/balance/bot.ts`), Orange typical Artist (H 332.79, P 45.85, G 33.53). Tier 1/2 use the White/Yellow typical Artists. Probe: `drafts/planning/b-t3-probe/hearth-cook-probe.test.ts` (drop into `packages/sim/test/` on the #278 branch).

| Guardian | Std typical | Std novice | Chal typical | Chal novice |
|---|---|---|---|---|
| Floor-keeper, tier 1 | 40/40, 13.2 s, 6% | 40/40, 14.4 s, 17% | 40/40, 13.5 s, 13% | 40/40, 13.5 s, 23% |
| Floor-keeper, tier 2 | 40/40, 12.3 s, 5% | 40/40, 13.1 s, 13% | 40/40, 12.8 s, 12% | 40/40, 12.6 s, 20% |
| **Hearth Cook now** (H543 P16) | 40/40, 10.7 s, 7% | 40/40, 12.3 s, 14% | 40/40, 10.7 s, 10% | 40/40, 12.2 s, 18% |

What this tells us:
1. **Every Guardian is 40/40 for the smart bot.** It's not just a Hearth Cook problem. The bot Counters very well, and Counters do most of the damage: it lands only 5–9 Strikes in a fight that the static model counts as about 50 hits.
2. **The Hearth Cook is a bit easier than the tier 1/2 Guardians**: about 2 s shorter and about the same damage taken. A tier 3 boss should be a step up, not a step down.
3. **For the youngest players it is not easy.** The `masher` bot (a 6-year-old who never Counters) beats it 36/37 on Standard but only 24/33 on Challenge, taking about 45% damage. (37 and 33 are the runs that reached the Guardian.)
4. **The R-BAL band caps the health.** Static check at Orange (×3.19 Health, ×3.14 Power; wind-ups never scale): H543 gives 50 hits to beat on Standard and 75 on Challenge, with 9/6 hits to knock out the player. Challenge must stay at 80 or below for the typical student, so **base health can go to about 575 at most** (79). H600 gives 83 and H700 gives 96, both out of band.

## 2. Recommendation
| Stat | Old | New | Why |
|---|---|---|---|
| maxHealth (White base) | 543 | **575** | The most the band allows: 53/79 hits to beat (Challenge at most 80) |
| power (White base) | 16 | **20** | Knock-out goes from 9/6 to 8/5 hits, still at least 5. Mistakes now hurt |
| guard | 30 | 30 | Unchanged |
| Wind-ups (telegraphTicks) | 20/22/26 | **unchanged** | Kid readability; the rule says wind-ups don't scale. Shorter ones barely moved the smart bot (Section 3) |
| Recover ticks, summon count | 22/26/30, 2 | **unchanged** | Cutting recovery or adding a 3rd Spark mostly hurt novice/masher players, not the smart bot |

Also: the trainsMore Challenge exception (`CHALLENGE_TOP_EXCEPTIONS`) is still needed and goes slightly higher. The Manager has already accepted it for Guardians.

## 3. Before → after (40 seeds)
| Case | Before (H543 P16) | After (H575 P20) |
|---|---|---|
| Std typical | 40/40, 10.7 s, 7% | 40/40, 11.0 s, 10% |
| Std novice | 40/40, 12.3 s, 14% | 40/40, 12.7 s, 18% |
| Chal typical | 40/40, 10.7 s, 10% | 40/40, 11.5 s, 12% |
| Chal novice | 40/40, 12.2 s, 18% | 40/40, 12.8 s, 24% |
| Masher Std | 36/37, 45% | 32/37, 52% |
| Masher Chal | 24/33, 45% | 19/33, 53% |

Other variants tried (smart bot, Std typical / Chal novice):
- H575 P22: 10.8 s, 10% / 29%. Masher Std 30/37. Knock-out 7/5.
- P24: Challenge knock-out drops to 4, **out of band**.
- Recovery 16/20/24, with or without 3 Sparks: no time change. Masher Std falls to 27/37.
- H700 P20: 12.9 s / 26%, which matches the tier 1 time, but it's **out of band** (96 Challenge hits). Masher Std 28/37.
- H800 P22: 14.6 s / 30%, out of band.

**Honest limit:** within the band, stat changes can't make the smart bot lose. It will stay 40/40 at every Guardian. The change makes the Hearth Cook hit harder, so careless play costs more, while the youngest players still win most Standard fights.

## 4. DECIDE
- **D1 (Manager, routine):** apply H575 P20 in `content/enemies/hearth-cook.json` (Programmer). I recommend **yes**.
- **D2 (Jay, taste):** should the tier 3 Guardian fight last as long as the tier 1 one (about 13 s)? That needs H about 700 and a written **band exception** (Challenge about 96 hits). I recommend **no for the beta**: the masher drops to 76% on Standard. Let beta testers tell us whether it feels like a boss.
- **D3 (Manager, proposal):** the "real boss feel" probably comes from the phases (sparks, the rolling-pin lane), not from health. After the beta, consider a short phase-change pause plus a Sensei line to make phases 2 and 3 feel bigger. That's design only; no numbers change.
