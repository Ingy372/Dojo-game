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
