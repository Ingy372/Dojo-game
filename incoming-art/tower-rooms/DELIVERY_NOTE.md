# Delivery Note: Batch 4 (Tower rooms), 2026-10-16

**WHAT**
- A tileable stone kit: 3 floor tiles, the wall face, a wall block and a pillar.
- A door for each room type, closed and open, each with a clear icon (also available as separate icon sprites):
  - battle: gloves
  - challenge: star
  - treasure: chest
  - rest: leaf
- A chest: closed, a 7-frame opening sequence, and an open still.
- The rest shrine with a gentle 8-frame glow loop.
- Everything is script-built (`source/build_tower.py`); previews come from the new `tools/make_tower_preview.py`.

**WHY**
- Cool grey stone sets the Tower apart from the warm wooden Home Dojo.
- Each door has its own colour and a simple icon, so a 6-year-old can tell them apart before reading anything.
- The icons are friendly: gloves instead of weapons, a leaf for rest.

**DECIDE (Jay)**
1. Approve the stone look and the door colours.
2. Approve the icons. Battle uses sparring gloves; crossed fists read as a blob at this size.
3. Should the open door glow warm (as now) or match its room colour?

**NEXT**
- Everything on the list is done.
- Not started, as instructed: full customization, icons/portraits and Street Smarts scenes.
- After approval, Claude Code wires this art in.

**Doc conflicts / notes:**
- The room files (`content/rooms/*.json`) put every door slot `D` in the top wall, one tile wide. The doors are built for exactly that (1-tile opening, anchor on the wall's foot line).
- The docs also have a **boss door** (`keepers-hall.json`, "before the boss there's only the boss door"). It wasn't on the list, so it isn't made. Say if you want one (e.g. a bigger door with a crown icon).
- Chest spots `C` and shrine spots `S` are 1 tile, and the chest and shrine anchor on the bottom-centre of that tile.

**Review these first:**
- `preview/review-1-tiled-room.png`
- `preview/review-2-doors-2x.png`
- `preview/review-3-chest-and-shrine-2x.png`
