# Claude's run cycle draft (2026-11-18) — NOT in the game yet

Jay asked for a better run for the hero ("what is in place is acceptable, so before we change anything I want to see what you create").

- **What changed:** the `walk` action only. Forward lean, fists up with bent elbows pumping opposite the feet, longer knee drive and heel kick-up, a moment in the air between steps, a bigger hip bob and shoulder counter-twist.
- **Same model, rig and camera** as the approved hero (`player-custom/source/player_custom_a|b.blend`), so it matches every other animation and every hair, face, gi and belt layer.
- **Timing:** 12 frames at 36 fps (was 10 at 30), the same 1.5 tiles per loop at 4.5 tiles/s, so the game's planted-feet speed match still works.
- **Previews:** `preview/run-compare.gif` (old above, new below; E, SE, S, NE) and `preview/run-compare-frames.png`.
- **Rebuild:** `source/make_run.py` (makes `source/player_run_a|b.blend` from the approved files), render with `tools/render_sprites.py --anims walk --height 160 --anchor-y 0.856`, then `source/make_run_compare.py`.
- **Only body A is rendered** (`sprites/body-a`, walk only). Body B is built (`player_run_b.blend`) and renders the same way once Jay approves.
- Not done: belt ends and hair don't flutter (the model has no bones for them).
