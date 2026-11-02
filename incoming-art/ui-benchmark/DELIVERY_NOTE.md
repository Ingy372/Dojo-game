# Delivery note: UI benchmark samples (B2 + B4)

**ITEM**
R-BENCHMARK: one paper-and-wood look for every Board tab (B2) and Tower Climb map icons (B4). Three samples, no game code.

**WHAT**
- `preview/01-board-panel-kit`: the kit (tabs, buttons, paper, ribbons, bars, seals, palette, four tabs side by side).
- `preview/02-board-gate-844x390`: a full Board screen, Gate tab, on wood with cream paper.
- `preview/03-climb-icons`: five room icons x three states on a sample map strip, plus a tiny-size test.
- `tokens.json`, `source/build_ui_benchmark.py`, and two reusable scripts in `incoming-art/tools/` (`board_ui_kit.py`, `climb_icons.py`).

**WHY**
- The Gear, Gate and Next-step panels were dark brown or navy; only Last run was paper. Now they are all the same paper in the same wood frame.
- The Climb map had no way to tell rooms apart. Five different shapes with five different colours read at 30 pt and in grey.
- Orange is kept for ENTER THE TOWER only, so the main button is easy to find.

**DECIDE**
1. **Door pick.** The code has `practice | battle | challenge | treasure | rest | boss`, and no "door pick" room. I drew a double-door icon. Does it mean the doors between rooms, the challenge room, or a mystery door? A sixth icon for the challenge room is easy to add.
2. **Guardian colour.** Purple, because red is for danger and orange is for ENTER. OK?
3. **Active tab.** Raised gold lacquer tab (shown), or a paper folder tab?
4. **Tab icons.** The four tab icons are placeholders for B3. OK to draw the final ones next?
5. **The 師 seal** on the Gate tab (Sensei's Seal): keep it, or use a plain star?
6. **Hero softness.** The hero at 100 pt is a 2x upscale and a little soft (B1). Leave for B1?
7. **Export.** After approval, should I export the icon sprites (PNG strips plus JSON) for the Programmer?

**NEXT**
After the decisions: export the icon sprites and kit sprites, then the G2 Insight picker re-skin (not started).
