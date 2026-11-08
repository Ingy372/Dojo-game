# G2B-44 — Strike icon samples, second look (still a draft)

Not approved. Not exported. Not pushed.

**ITEM.** Four sample Strike icons on one sheet, next to the two approved Strike pictures already on main. The first three drafts are kept in `superseded/sample-1/`.

**WHAT.**

| # | File | What changed |
| --- | --- | --- |
| 1 | `preview/spin-kick-full.png` | New. The finishing kick of combo 1. |
| 3 | `preview/butterfly-flow-full.png` | Same pixels as the first draft. Pose is not confirmed. |
| 4 | `preview/side-kick-drive-full.png` | Same pixels as the first draft. |
| 5 | `preview/hook-kick-full.png` | Returning heel is larger and sits in open space. |

Sheet: `preview/sheet-g2b44-samples.png`. Each column has the large picture, the source line, then true 40 and true 30 in colour and in grey. The bigger boxes are those same pixels enlarged.

Approved references on the sheet: `incoming-art/icons-slots/sprites/jumping-spins@2x.png` (Strike #2) and `strike@2x.png` (the slot picture, a front kick on a pad). The slot picture is not combo 1.

**WHY.** #1 was missing. #3 reads too close to #2, and the docs do not describe that pose, so it is marked for confirmation instead of being redrawn into a guess. #5's returning heel did not read at 30 px.

## What the docs say, and what they do not

### #1 Spin Kick — drawn from the named kick

Specified:

- `docs/curriculum.md:46` — combo 1 ends with "spinning outside kick (spin kick)", after two front kicks, an inside kick, and an outside kick.
- `docs/curriculum.md:47` — the jump belongs to combo 2 ("an additional 3 jumping spin kicks"). Combo 1 does not say jump.
- `content/abilities/strikes.json:5-16` — id `spin-kick`, name Spin Kick, text "One big spinning kick.", one hit.
- `drafts/planning/R-G2B-strikes-4-7.md:21` — one heavy hit, long reach, real combo ends with a spinning outside kick.
- `incoming-art/menu-catalog/sprites/moves-text.json:706-721` — the same five steps, last step "Spinning outside kick."

Not specified: the hip angle, the height, and which way the body turns. The picture shows one standing kick with the leg across at about chest height, and one spin arrow. That is so it is not the steep kick on Jumping Spins and not the front kick on the slot picture. The angle itself is not in the docs.

### #3 Butterfly Flow — confirmation required

Specified:

- `docs/curriculum.md:48` — combo 3 is combo 2 plus "an additional round kick and tornado kick (we call it butterfly kick)."
- `content/abilities/strikes.json:35-46` — id `butterfly-flow`, name Butterfly Flow, text "Spin the other way. It takes a moment to land, but it hits harder."
- `drafts/planning/R-G2B-strikes-4-7.md:12` — "spins the opposite way, hits harder, slower to land."
- `drafts/planning/R-G2B-strikes-4-7.md:23` — real combo ends with "round kick and butterfly kick."
- `incoming-art/menu-catalog/sprites/moves-text.json:738-750` — same sentence as the curriculum. `stepsNeedReview` is true on that entry.

Not specified: body upright or flat, which of the two added kicks to draw, which leg, the knee, or the height. The first-draft picture is still on the sheet and it reads too close to Jumping Spins. That picture is not claimed to be the right pose.

### #4 Side Kick Drive — unchanged

Specified: `docs/curriculum.md:49` begins with step-behind side kicks. The name Side Kick Drive is in `drafts/planning/R-G2B-strikes-4-7.md:24`. This icon was not redrawn.

### #5 Hook Kick — heel only

Specified:

- `docs/curriculum.md:50` — "step behind hook kick" twice, then three front kicks.
- `drafts/planning/R-G2B-strikes-4-7.md:25` — Jay, Nov 8 (J20), the name is Hook Kick. J19: it reaches around a guard.
- `incoming-art/menu-catalog/sprites/moves-text.json:766-776` — the curriculum sentence. The game name there is still empty.

The change is the size and the placement of the returning heel, so it stays a separate shape at 30 and 40. The angle is still not in the docs. The teal pad stands in for the guard. No new kick was added.

**Checks.** Dark ink outline, gold Strike rim, pine belt `#20705A` (the same placeholder already on Jumping Spins). One mitten fist. Toeless shoes. No red pixels. Canvas margin about 19 px on the 1024 drawing (about 2 px on the 128 file). #3 and #4 match the archived first drafts pixel for pixel.

**DECIDE.**

1. Butterfly Flow: the docs name a round kick and a butterfly kick (their word for a tornado kick) and say it spins the other way. They do not describe the pose. Which kick should the icon show, and what does that pose look like?
2. Spin Kick: is a standing kick across at chest height a fair picture of the spinning outside kick, or does the school draw that kick differently?
3. Hook Kick: is the larger returning heel clear enough at 30 px?

**NEXT.** After this look: #6 and #7 only if these four are accepted. Do not start G2B-40, G2B-41, or G2B-42 here. The queue order for those is 40, then 41, then 42. No export until you say so.
