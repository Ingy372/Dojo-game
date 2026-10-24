# A2 Form stances (SAMPLES): technical sheet

**Status: 3 SAMPLES, do not wire yet.** These are stance idles for the two Forms that already exist (`content/abilities/abilities.json`): Rooted Form and Flowing Form. Rooted Form has two options, so Jay can pick one.

- **The same player rig, frames and layers** as `../player-custom/`. The frame is 128 × 160 px, the feet anchor is (64, 136.96), and there are 8 directions and all 32 layers. The gi stays tinted, the belt stays on its own neutral layers, and face and hair are still pick-one groups.
- `sprites/body-a/player-a.json` and `sprites/body-b/player-b.json` hold only the three new animations, with the same layer list, palettes and belt styles. Merge their `animations` into the existing player JSONs.
- All three loop, and the feet never move, so there is no `groundMotion`.

| Animation | Frames | fps | Loop | What it is |
| --- | --- | --- | --- | --- |
| `stance_rooted` | 12 | 8 | 1.5 s | **Rooted Form, option A.** A low, wide fighting stance. The feet are about two shoulder-widths apart and a long step front to back. The knees are bent out over the toes, the hips are sunk, the back is upright, the weight is even and the guard is compact. It breathes slowly. |
| `stance_rooted_back` | 12 | 8 | 1.5 s | **Rooted Form, option B.** A back stance (kokutsu-dachi). About 70% of the weight is on the bent back leg. The front foot points forward, the back foot is turned out, the hips are side-on and the lead hand is forward. It breathes slowly. |
| `stance_flowing` | 8 | 10 | 0.8 s | **Flowing Form.** A light, shorter stance on the balls of the feet, more bladed. It makes two small springy bounces and a gentle rock forward and back, with a loose guard, and the eyes stay on the opponent. |

## How it's built
`source/add_stances.py` adds the three actions to a copy of `player_custom_<a|b>.blend`. Nothing else in the rig changes. Every channel starts from the approved guard idle.
```bash
for B in a b; do
  blender -b incoming-art/player-custom/source/player_custom_$B.blend -P incoming-art/form-stances-a2/source/add_stances.py -- --out /tmp/stances_$B.blend
  blender -b /tmp/stances_$B.blend -P incoming-art/tools/render_sprites.py -- --out incoming-art/form-stances-a2/sprites/body-$B \
      --name player-$B --height 160 --anchor-y 0.856 --anims stance_rooted,stance_rooted_back,stance_flowing
done
python3 incoming-art/form-stances-a2/source/make_stances_preview.py
```

## Previews (review these first)
- `preview/review-1-guard-vs-stances-8dir.png`: the rows are the guard idle, Rooted A, Rooted B and Flowing, in all 8 directions (body A, white gi).
- `preview/review-2-technique-3x.png`: S, SE, E and W at 3× with a ground line, for judging the stance like a student's.
- `preview/review-3-body-b-blue-gi.png`: body B in a blue gi and orange belt, which shows the tint and belt layers still work.
- `preview/<stance>_body-<a|b>.gif`: each loop, with S, SE and E side by side.
