# G2B-44 — Strike icon samples

Draft. Not approved. Not exported into the game.

**ITEM.** Strike icons #1 and #3 through #7, in the approved medallion style, for one review.

**WHAT.**

| # | File | Status |
| --- | --- | --- |
| 1 | `preview/spin-kick-full.png` | Kept. Standing spinning outside kick. |
| 3 | `preview/butterfly-flow-full.png` | Redrawn. Jay: show the butterfly kick (via Manager). Body near horizontal, in the air, legs scissoring. |
| 4 | `preview/side-kick-drive-full.png` | Kept. |
| 5 | `preview/hook-kick-full.png` | Kept. Returning heel enlarged. |
| 6 | `preview/lunge-full.png` | New. Jumping front kick, other knee up, both feet off the ground. |
| 7 | `preview/spinning-finisher-full.png` | New. A hooking leg inside a ring. |

Sheet: `preview/sheet-g2b44-samples.png`. Approved Jumping Spins and the Strike slot picture sit beside these six. Each is shown large, then in colour and in grey at 128, 96, 64, 40, and 30.

The earlier upright Butterfly Flow picture is in `superseded/sample-2-unconfirmed/`. The first three drafts are in `superseded/sample-1/`.

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

1. #6 Lunge: confirmation required. The line says a chambered jumping front kick. It does not say whether the knee is still bent or the leg is already straight. This picture is the literal reading: in the air, one leg out in a front kick, the other knee up.
2. #7 Spinning Finisher: confirmation required. The finish is a spinning hook kick, and the redesign adds a ring of hits. The limb angle is not in the doc. The ring is the part that reads at 30 px.

**NEXT.** Wait for a look at this sheet. No sprite export until then. G2B-40, then G2B-41, then G2B-42 are a later batch and are not in this pull request.

Redraw with:

```
python3 incoming-art/icons-strikes/source/strike_icons.py
```
