# R-INSIGHT-BAL-c: Insight card text for the balance changes

Source: `drafts/planning/R-INSIGHT-BAL.md` sections 4a and 9. Ages 6-9, hopeful, no pressure. Cards are about 210 px wide at 16 px, so each text is one to four short lines. These words go in `content/insights/insights.json` under R-INSIGHT-BAL-a. The Virtue cards (Calm Breath, Steady Start) wait until after the beta.

Paste-ready JSON, same shape as `insights.json`: [`R-INSIGHT-BAL-c.json`](R-INSIGHT-BAL-c.json).

| id | name | text | number it must match (plan 4a) |
|---|---|---|---|
| iron-skin | Iron Skin | Blocks bounce the hit back at the enemy, with a little extra. | `blockReflect` 1.2 (reflects 120% of the hit) |
| wind-step | Wind Step | Every 7 combo hits gives a 3-second burst of speed, and you swing faster too! | 0.3 burst, every 7 hits, 3 s, plus rule tweak A (basic attacks also get half the burst bonus) |
| quick-hands | Quick Hands | Your basic attacks are 20% faster. | `attackSpeed` 0.2 |
| press-the-advantage | Press the Advantage | Enemies that are dizzy, winded or just swung take 30% more damage. | `staggerBonus` 0.3, plus rule tweak B (also applies in the winded and recover modes) |
| shield-breaker | Shield Breaker | Any hit breaks shields, and breaking one gives you a little Focus. | rule tweak C (7 Focus when a hit breaks a shield) |
| rally | Rally | Hang in there! Focus fills 75% faster when your health is below half. | `lowHealthFocus` 0.75 (x1.75) |

## Notes

- **Unchanged cards:** Ripple Counter (1.2), Double Strike (0.2) and Heavy Hands keep their current text. Double Strike's text has no number, so the drop from 0.6 to 0.2 needs no new words. Only the effect numbers change.
- **Press the Advantage:** the plan's wording was "Staggered, winded or recovering". Kids see dizzy stars on a staggered enemy and "huff... huff..." on a winded one, and "recovering" is the pause after an enemy swing. The card says "dizzy, winded or just swung" so it matches what they see. If the Manager prefers the plan's words, swap them in; the rule is the same.
- **Iron Skin:** the plan's "and then some" is replaced with "with a little extra" (1.2 is 20% extra) and "attacker" with "enemy". Shorter words for 6 to 9.
- **Wind Step:** the plan's text left out the second part of tweak A (swinging faster during the burst). The new line says it, so the card does not under-promise.
- **Rally:** "Hang in there!" is a kind nudge. It does not ask the player to get hurt on purpose. The rule still reads "below half" like before.
- **Quick Hands, Shield Breaker:** the plan's approved wording, unchanged.
- **No pressure words.** No "perfect", no "only", no "must". Nothing is lost or missed by skipping a card.
- **Shield Breaker JSON:** the `effect` stays `{ "type": "shieldBreaker" }`. The 7 Focus value is a code change for the Programmer, so I did not invent a field name.
- **Tests:** no test reads these strings (checked `packages/sim/test`). Text lengths run 34 to 77 characters.
