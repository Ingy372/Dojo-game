# R-INSIGHT-BAL-c: Insight card text for the balance changes

Source: `drafts/planning/R-INSIGHT-BAL.md` sections 4a and 9. Ages 6-9, hopeful, no pressure. Cards are at most 210 px wide with 16 px text and a 175 px card height (`InsightPicker.ts`), so the text box holds about two lines of 20 to 22 characters. There is no code limit; aim for about 40 characters or less (two lines). These words go in `content/insights/insights.json` under R-INSIGHT-BAL-a. The Virtue cards (Calm Breath, Steady Start) wait until after the beta.

Paste-ready JSON, same shape as `insights.json`: [`R-INSIGHT-BAL-c.json`](R-INSIGHT-BAL-c.json).

| id | name | text | number it must match (plan 4a) |
|---|---|---|---|
| iron-skin | Iron Skin | Blocks bounce the hit back at the enemy, with a little extra. | `blockReflect` 1.2 (reflects 120% of the hit) |
| wind-step | Wind Step | Every 5 combo hits gives you a 2-second burst of speed. | 0.3 burst, every 5 hits, 2 s (round 5 tune, plan 4a and 4f), plus rule tweak A |
| quick-hands | Quick Hands | Your basic attacks are 20% faster. | `attackSpeed` 0.2 |
| press-the-advantage | Press the Advantage | Hit dizzy or winded enemies 30% harder. | `staggerBonus` 0.3, plus rule tweak B (also applies in the winded and recover modes) |
| shield-breaker | Shield Breaker | Any hit breaks shields, and breaking one gives you a little Focus. | rule tweak C (7 Focus when a hit breaks a shield) |
| rally | Rally | Below half health? Focus fills 75% faster! | `lowHealthFocus` 0.75 (x1.75) |

## Notes

- **Unchanged cards:** Ripple Counter (1.2), Double Strike (0.2) and Heavy Hands keep their current text. Double Strike's text has no number, so the drop from 0.6 to 0.2 needs no new words. Only the effect numbers change.
- **Press the Advantage (shortened, c2):** "dizzy or winded" is what kids see (stars on a staggered enemy, "huff... huff..." on a winded one). "Just swung" (the enemy's recover pause) is dropped from the text to fit two lines; the rule (tweak B) still covers it. 30% is unchanged. "Harder" means more damage.
- **Iron Skin:** the plan's "and then some" is replaced with "with a little extra" (1.2 is 20% extra) and "attacker" with "enemy". Shorter words for 6 to 9.
- **Wind Step (c2):** the Manager's exact text for the round 5 tune (0.3 / every 5 hits / 2 s, plan 4a and 4f, and PR #389). It is about 3 lines at this card width.
- **Rally (shortened, c2):** keeps "below half" and 75%. The question opens with the condition and ends hopeful. It does not ask anyone to get hurt on purpose.
- **Quick Hands, Shield Breaker:** the plan's approved wording, unchanged.
- **No pressure words.** No "perfect", no "only", no "must". Nothing is lost or missed by skipping a card.
- **Shield Breaker JSON:** the `effect` stays `{ "type": "shieldBreaker" }`. The 7 Focus value is a code change for the Programmer, so I did not invent a field name.
- **Tests:** no test reads these strings (checked `packages/sim/test`). Text lengths: Quick Hands 34, Press 39, Rally 42, Wind Step 55, Iron Skin 61, Shield Breaker 66. A rough 16 px layout check puts Quick Hands, Press and Rally at two lines; Wind Step, Iron Skin and Shield Breaker are about three.
