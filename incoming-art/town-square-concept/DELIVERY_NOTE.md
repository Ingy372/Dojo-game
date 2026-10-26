# Delivery Note: A4 town square concept

**ITEM:** A4 (docs/work-board.md §9). One concept picture of the dojo town square, for Jay to approve.

**WHAT:** `concept/town-square-concept-932x430.png` plus @2x (day), and an optional golden-hour variant `-dusk`. Built with the Blender toon_kit pipeline and the 35° three-quarter camera. Source is in `source/`.

**WHY:**
- core-design.md: the town is at the base of the Tower and gets brighter as its light returns. Student of the Month is a statue in the town square. Multiplayer step 1 is visiting classmates' dojos.
- The scene shows all three on one screen: the statue in the middle, the dojo doors along the back, and the Tower in the distance with its first light fragment.
- Second pass: the Tower was first lost behind the hills because the ortho camera has no depth. I rebuilt it as a hazed far layer. I removed the corner dojos that looked like blank blocks and added a hedge line and more trees.
- Red check: 0 px.

**DECIDE:**
1. Scale: the concept is 40 ppt at 1x (zoomed out) and the game is 48 ppt. Should the real square scroll, or be laid out to fit one screen?
2. Statue: the concept uses a faceless gold-stone figure in the ready stance. Should the statue show the actual Student of the Month's avatar, the same generic figure every month, or a generic figure with their belt colour or name shown in the UI (not baked in)?
3. Dojo doors: how many classmates' dojos does the square show (here, 3)? Does the noren colour come from each classmate's choice? Teal and violet are reused from the Rest and Challenge door colours. Is that OK, or do those colours need to stay reserved for tower doors?
4. What's missing from the square that the docs mention: classmate echoes, the Featured Dojo of the Week, the Hall of Masters, the quest board, the crafting workshop and the Tower entrance. Should they be in the square, or elsewhere on the town map?
5. The Tower as a distant backdrop with one light fragment at its top. Should it grow brighter as fragments return? It could also be a gate inside the square instead.
6. Variant: is golden hour wanted as a real time-of-day feature, or should it stay day only?

**NEXT:** Once Jay picks a direction, do the layout at game scale (48 ppt), then work on separate tile and prop sprites.

---
## UPDATE A4-2
ITEM: A4-2, town square revision from Jay's feedback (same branch / PR #301).
WHAT: The left dojo stays as the main dojo, untouched. The middle building is now a friendly shop with no prices and no text. The right building is a neutral placeholder. The Tower is bigger and clearer. Dusk is darker and cozier, with warm windows, lanterns and a glowing Tower light. The statue is unchanged. Red check: 0 px across 7 files.
WHY: Jay wants the main dojo modelled on the real Action Zone building (photos pending), plus a shop, a stand-in third building, a more visible goal Tower, and a cozier evening.
DECIDE:
- Which slot is the main dojo. I used the left one; it could swap with the shop.
- The shop's look: the awning colours (gold/cream), what it sells (the baskets and jars are generic), and whether the round sign carries a picture icon.
- The placeholder is plain massing on purpose. What goes there is open.
- Tower size: about 1.9x the A4 size. Bigger or smaller?
- How dark dusk should be, and whether the Tower glow should be stronger.
- Not decided here (per brief): layout, scrolling, door count.
NEXT: Remodel the main dojo when the Action Zone photos arrive. Then Jay picks the shop and placeholder direction.

---
## UPDATE A4-3
ITEM: A4-3, town square, day livelier and evening cozier (same branch / PR #301).
WHAT: Day: a river with an arched bridge, koi, lily pads and sparkle; a busy background with hills and paths, a waterfall, a footbridge, a windmill, a lighthouse, cherry trees, banners, a village glimpse, kites and birds. Dusk: ground light pools, river reflections and fireflies. Red check: 0 px.
WHY: Jay wants kids to think "WOW, I'd love to explore over there", and wants an even cozier evening.
DECIDE:
- Whether the river stays in the square and where it runs. It sits between the statue and the placeholder, and it cuts into walkable space.
- Whether the windmill and lighthouse stay with the Tower, or compete with it.
- Which background landmarks should become real areas.
- How many fireflies.
- Not decided here: layout, scrolling, door count.
NEXT: Remodel the main dojo when the Action Zone photos arrive.
