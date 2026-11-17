# L15-A: gear rarity on the character in a fight (3 samples)

Launch-plan row L15 (drafts/planning/R-OVERHAUL-LAUNCH.md): "a rare item looks different in a fight".
These are samples for the Manager's art gate, then Jay. Nothing here is imported.

Rarity colours are the game's own `RARITY_COLOR` (same as the gear-drop icons):
Everyday #d8d2c4, Special #5cd65c, Rare #4ea3ff, Epic #b46cff, Legendary #ffb02e. No red anywhere (checked: 0 danger-red pixels).

| Sample | What changes | How the game would draw it |
|---|---|---|
| A. The gear itself | The gi trim (gi slot) and hand wraps (hands slot) take the item's rarity colour. Everyday = no trim, plain cloth wraps | `gi-trim` and `wraps` layers, multiply tint (layers already exist from cosmetics A1; strike + idle rendered here) |
| B. Coloured outline | A 2-3 px outline in the rarity colour around the whole student. Epic and Legendary add a soft glow; Legendary adds a few twinkles. Everyday = none | Made in code from the player's own silhouette (or baked per animation like the aura) |
| C. Hit spark | Only when a hit lands: the impact spark at the fist is the rarity colour and grows with rarity. Epic adds a halo; Legendary a halo + twinkles. The student looks the same otherwise | One small spark sprite per rarity, played at the strike's impact frame (`keyFrames.impact`) |

Files
- `preview/sample-<A|B|C>-fight-667x375.png`: a fight at real phone size (48 px tiles), wearing Legendary gear.
- `preview/sample-<A|B|C>-rarities-1x.png` / `-3x.png` / `-grey.png`: all 5 rarities side by side at game size, enlarged 3x, and in greyscale.
- `preview/overview-3-samples-1x.png`: all three on one sheet.
- `sprites/body-a/`: gi-trim, wraps-cloth and aura layers for `strike` and `idle` (body A, 128x160, anchor (64, 136.96), 8 directions; same layout as player-custom). Only for the samples; the chosen option gets the full set.
- `source/make_l15_samples.py`: rebuilds every preview (run from `incoming-art/`).

Rebuild the layers:
```
blender -b player-custom/source/player_custom_a.blend -P cosmetics-a1/source/build_cosmetics.py -- --out /tmp/pc_a.blend
blender -b /tmp/pc_a.blend -P tools/render_sprites.py -- --out <this folder>/sprites/body-a --name player-a --height 160 --anchor-y 0.856 --anims strike,idle --layers wraps-cloth,gi-trim
python3 cosmetics-a1/source/make_aura.py --anims strike,idle --out <this folder>/sprites/body-a
```
