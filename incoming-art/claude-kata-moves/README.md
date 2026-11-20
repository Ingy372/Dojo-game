# Claude's kata moves and stances draft (2026-11-20). NOT in the game yet

Jay asked (Nov 20, overnight job): research every technique he named, then animate them in Blender, along with the
front, horse and cat stances. **Nothing here is approved or wired into the game.** The game still uses stand-ins
(`content/dojo/kata-moves.json`).

## What's here

| Animation | Frames, fps | What it shows |
| --- | --- | --- |
| `kata_open_leg` | 12 at 8, loop | **Open Leg Stance** (kata ready stance): feet about shoulder width, toes out a little, fists in front of the belt, slow breathing |
| `stance_front` | 12 at 8, loop | **Front stance**: left foot forward, front knee over the ankle, back leg nearly straight, back foot turned out; lead fist forward, rear fist at the hip |
| `stance_horse` | 12 at 8, loop | **Horse stance**: feet wide and parallel, knees bent and pushed out, hips sunk, back upright, fists chambered at the hips |
| `stance_cat` | 12 at 8, loop | **Cat stance**: nearly all the weight on the bent back leg, front foot on its ball with the heel up, forward guard |
| `kata_low_block` | 10 at 20 | **Low Block**: fist starts by the opposite ear, sweeps down to stop above the front knee; other fist to the hip |
| `kata_inside_block` | 10 at 20 | **Inside Block** (drawn inside to outside: see questions): fist under the opposite armpit, forearm swings out upright in front of the shoulder |
| `kata_reverse_inside_block` | 10 at 20 | **Reverse Inside Block**: the same block with the rear hand, hips square |
| `kata_high_block` | 10 at 20 | **High Block** (rising block): forearm rises across the face to above the forehead, elbow out |
| `kata_knife_hand_blocks` | 11 at 20 | **Knife Hand Blocks** (David and Goliath step 2): from attention, open hands rise up the middle, cross, and open out to head height, palms forward |
| `kata_punch` | 9 at 20 | **Punch**: front-side fist from the hip to the middle of the chest; other fist pulls back to the hip |
| `kata_reverse_punch` | 9 at 20 | **Reverse Punch**: rear fist to the middle as the hips turn square |
| `kata_backfist` | 10 at 20 | **Backfist**: fist by the opposite shoulder, elbow up, snaps out to face height, knuckles leading |
| `kata_spear_hand` | 10 at 20 | **Palm Down / Spear Hand** (Pinon 1): rear open hand presses down palm down under the front elbow while the front open hand thrusts out at the solar plexus, palm down |
| `kata_rear_leg_front_kick` | 15 at 20 | **Rear Leg Front Kick**: hands catch at the hip, back knee lifts high, leg snaps out and back, foot lands in front (ends in the other front stance) |
| `kata_break_hold` | 12 at 20 | **Break the Hold** (David and Goliath step 12): left foot draws in (heels together), arms rise palms up in a half circle, then come down sharply palms down outside the hips |

- **Techniques are one-shots that end on the finished pose** (`holdLastFrame`), so the game can hold each move until the next tap.
- **Every move is drawn with the left foot forward.** The right side is the same picture mirrored. The game can flip the sprite and use the mirrored direction row, so one render covers both sides of a kata.
- **Same model, rig, layers and camera** as the approved hero (`player-custom/source/player_custom_a|b.blend`), so the moves match the rest of the hero's art, every gi, belt, face and hair.
- **One rig addition:** a small `hand.L` / `hand.R` bone at each wrist, with the fist meshes hanging from it. It lets the hand open into a knife hand or spear hand (stretched and flattened) and turn palm up or down. The older animations don't use it, so they're unchanged.

## Previews (look at these first)

- `preview/stances.png`: the four stances, side by side in five directions.
- `preview/<move>.png`: each move, every frame, seen from the front (S), the corner (SE) and the side (E).
- `preview/<move>.gif`: each move playing at game speed.

## Rebuild

```bash
blender -b incoming-art/player-custom/source/player_custom_a.blend -P incoming-art/claude-kata-moves/source/make_kata_moves.py -- --save incoming-art/claude-kata-moves/source/player_kata_a.blend
blender -b incoming-art/claude-kata-moves/source/player_kata_a.blend -P incoming-art/tools/render_sprites.py -- --out incoming-art/claude-kata-moves/sprites/body-a --name player-a --height 160 --anchor-y 0.856 --anims kata_open_leg,stance_front,...
# quick pose check pictures (not game quality):
blender -b .../player_kata_a.blend -P incoming-art/claude-kata-moves/source/quick_stills.py -- --out <dir> --anims kata_low_block --frames all --dirs S,SE,E
python incoming-art/claude-kata-moves/source/make_sheet.py <dir> <out.png>
```

Only body A is rendered (`sprites/body-a`). Body B is built (`source/player_kata_b.blend`) and renders the same way once Jay approves.

## Questions for Jay

See `docs/kata-technique-reference.md`, section "Questions for Jay".
