# L11-C1: room files for tiers 4-10

56 rooms, 8 per tier, one file each (**Nov 26: the 8 `t4-` Green rooms moved to `content/rooms/`, switched off, re-waved with art-ready monsters and a Floor Keeper stand-in boss; 48 remain here**), in the exact `content/rooms/` format. Ids are `t4-` to `t10-`; `minBeltTier` is the tier and `floorSet` is the place.

**Why they are here and not in `content/rooms/` yet:** `floorRooms` switches a tier to its own set as soon as one of its rooms is live, and each Guardian room names its Guardian (`stone-giant` ... `lost-lightbearer`), which L11-B1 still has to build. So for L11-B2, move a tier's 8 files into `content/rooms/` once that tier's Guardian file and art land.

- Layouts and enemy swaps follow L11-SPEC section 2, exactly as listed there.
- Each Guardian room uses the `keepers-hall` layout with the Guardian and 4 of that tier's helpers: 2 in wave 1, 2 in wave 2.
- Names and signs come from each tier's themed draft (`../<place>.json`). One sign was trimmed to 8 words.
- In the challenge rooms, the seconds stay as the source layout has them. The words are new and 8 words or fewer.
- To rebuild the rooms: `python3 drafts/content/tools/build-l11-rooms.py`
- To check them: `node --experimental-strip-types drafts/content/tools/check-l11-rooms.mjs`. The check uses the game's own `loadRoom`, `loadContent` (with stand-in Guardians) and `floorRooms`.
