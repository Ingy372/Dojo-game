# G2B-44 — Strike icons

**Exported. Ready for the Manager to review. Not imported.** Jay approved the six pictures on Nov 10. The Manager relayed his words: "Both the strike icons and the Ember Knight look good." Sprites are in `sprites/` (128 and @2x). The note is `DELIVERY_NOTE.md`. The Programmer note is `PROGRAMMER_HANDOFF.md`. No game file was changed.

**ITEM.** Strike icons #1 and #3 through #7, in the approved medallion style, for one review.

**WHAT.**

| # | File | Status |
| --- | --- | --- |
| 1 | `preview/spin-kick-full.png` | Kept. Standing spinning outside kick. |
| 3 | `preview/butterfly-flow-full.png` | Jay: butterfly kick (via Manager). Body horizontal, arm on the shoulder, both legs from the hip. Inside the rim. |
| 4 | `preview/side-kick-drive-full.png` | Kept. |
| 5 | `preview/hook-kick-full.png` | Kept. Returning heel enlarged. |
| 6 | `preview/lunge-full.png` | Jumping front kick. Torso slightly back, kicking leg straight at chest height, other knee tucked high, arrow behind the body. |
| 7 | `preview/spinning-finisher-full.png` | Spinning hook kick. Standing leg straight, heel at head height, ring behind the figure. |

Sheet: `preview/sheet-g2b44-samples.png`. Approved Jumping Spins and the Strike slot picture sit beside these six. Each is shown large, then in colour and in grey at 128, 96, 64, 40, and 30.

`preview/sheet-g2b44-compare-2.png` puts the previous #1, #4, and #5 beside this pass, large, plus true 40, 36, and 30. Those three older pictures are in `superseded/sample-5/`. #3 and #6 were not redrawn. #7 only lost the skin patch on the back of the head.

#1 is turned mid-spin (back and shoulder). #4 is side-on. #5 is one hook and one standing leg, with the arms in guard. #6 holds the fists at the chest. #7 is seen from the back. #3 is the same horizontal scissor, drawn larger. Every figure in this pass stays inside the gold ring.

**WHY.** #3 was waiting on Jay's pose. He answered: draw the butterfly kick, body flat, legs scissoring, not another Jumping Spins. #6 and #7 are the last two Strikes in the live list.

Sources:

- #1 `docs/curriculum.md:46` spinning outside kick (spin kick). The jump is combo 2, line 47. `content/abilities/strikes.json:5-16`.
- #3 `docs/curriculum.md:48` round kick and tornado kick (we call it butterfly kick). Pose: Jay, via the Manager, 2:33 PM ET. `content/abilities/strikes.json:35-46` names Butterfly Flow and says it spins the other way.
- #4 `docs/curriculum.md:49` step-behind side kick. Name Side Kick Drive: `drafts/planning/R-G2B-strikes-4-7.md:24`.
- #5 `docs/curriculum.md:50` step-behind hook kick. Name Hook Kick, and it reaches around a guard: `drafts/planning/R-G2B-strikes-4-7.md:25`.
- #6 `docs/curriculum.md:51` ends "Step back twice and lunge forward with a chambered jumping front kick." Shape name Lunge: `drafts/planning/R-G2B-strikes-4-7.md:26`. Not in `strikes.json`.
- #7 `docs/curriculum.md:52` ends with a spinning hook kick. Shape: multi-hit spin around you, hits in a ring: `drafts/planning/R-G2B-strikes-4-7.md:27`. Not in `strikes.json`.

**Checks.** Gold Strike rim, dark ink, pine belt `#20705A`. One mitten fist. Toeless shoes. No red pixels. Canvas margin 17 px or more on the 1024 drawing. #1, #4, and #5 match the previous commit pixel for pixel.

**DECIDE.**

The three poses just redrawn follow the review: #6 is the jumping front kick with the knee tucked, #7 is the spinning hook with the heel at head height, #3 keeps the horizontal scissor. Nothing else is waiting on a pose answer in this set.

**NEXT.** Wait for a look at this sheet. No sprite export until then. G2B-40, then G2B-41, then G2B-42 are a later batch and are not in this pull request.

Redraw with:

```
python3 incoming-art/icons-strikes/source/strike_icons.py
```
