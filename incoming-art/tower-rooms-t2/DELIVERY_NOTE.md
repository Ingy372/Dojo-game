# Delivery Note: A0 - Batch 9 Yellow belt Tower kit (Bamboo Garden Hall), 2026-10-24

**ITEM:** A0 (work board): Batch 9, the Yellow belt (Tier 2) Tower room kit, full build in theme B (Bamboo Garden Hall).

**WHAT**
- `sprites/` (one `static.json`, same format and anchors as `tower-rooms/` + `boss-door/`, 80 px per tile, 35 degree camera):
  - floors `floor-big`, `floor-quad`, `floor-worn`; walls `wall-face`, `wall-block`; `pillar`.
  - doors, closed (frame 0) and open (frame 1), all re-themed with bamboo surround (no blue-grey stone left): `door-battle`, `door-challenge`, `door-treasure`, `door-rest`, plus `icon-<kind>`.
  - boss stone gate `door-boss` (closed/open), `door-boss-glow` (8 frames), `icon-boss` - same geometry and timing as Batch 5, re-coloured cream / bamboo green / warm wood.
  - `chest-closed` / `chest-open` / `chest-opened` (Tier 1 chest, same layers and timing), `shrine` + glow (green thatch roof).
  - decor: `decor-lantern`, `decor-bamboo-pot`, `decor-basin` (new, optional).
- `preview/`: tiled 9x6 room, boss room, doors 2x, chest/shrine/decor 2x, Tier 1 vs Tier 2 compare, GIFs (chest open, shrine glow, boss glow, boss open).
- `proposals/`: the earlier A/B/C theme samples (kept for reference, not for the game).

**WHY**
- Jay picked B. Warm cream floor stays calm, so the red danger circle, gold star and dark swarmer read clearly; green bamboo makes the tier change obvious at a glance.

**DECIDE (Jay)**
1. The chest is the Tier 1 chest unchanged (it already fits the warm wood). OK, or re-colour?
2. The 3 decor pieces are my own additions (not in the brief). Keep, or drop?
3. Does the Tier 2 Tower need an in-game name? "Bamboo Garden Hall" is only a working label.
4. Delete `proposals/` once the theme is final?

**NEXT:** Claude Code wires `sprites/static.json` for Tier 2 rooms (same code path as Tier 1).
