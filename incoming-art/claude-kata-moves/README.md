# Claude's kata moves and stances draft (2026-11-20, Jay's notes applied Nov 21). NOT in the game yet

Jay asked (Nov 20, overnight job): research every technique he named, then animate them in Blender, along with the
front, horse and cat stances. **Nothing here is approved or wired into the game.** The game still uses stand-ins
(`content/dojo/kata-moves.json`).

## What's here

| Animation | Frames, fps | What it shows |
| --- | --- | --- |
| `kata_open_leg` | 12 at 8, loop | **Open Leg Stance** (kata ready stance): feet about shoulder width, toes out a little, fists out in front of the belt, a little away from the body, slow breathing |
| `stance_front` | 12 at 8, loop | **Front stance**: left foot forward, front knee over the ankle, back leg nearly straight, back foot turned out; lead fist forward, rear fist at the hip |
| `stance_horse` | 12 at 8, loop | **Horse stance**: feet wide (a touch wider, Jay Nov 21) and parallel, knees bent and pushed out, hips sunk, back upright, fists chambered at the hips |
| `stance_cat` | 12 at 8, loop | **Cat stance**: nearly all the weight on the bent back leg, front foot on its ball with the heel up, forward guard |
| `kata_low_block` | 10 at 20 | **Low Block**: fist starts by the opposite ear, sweeps down to stop above the front knee; other fist to the hip |
| `kata_inside_block` | 10 at 20 | **Inside Block** (outside to inside, Jay Nov 21): fist starts out by the same-side ear, forearm swings across to stop upright just past the other cheek, away from the face |
| `kata_reverse_inside_block` | 10 at 20 | **Reverse Inside Block**: the same block with the rear hand, hips square |
| `kata_high_block` | 10 at 20 | **High Block** (Jay's drawing): forearm slopes up across the front of the face, elbow out and lower by the cheek, fist just above the opposite eyebrow |
| `kata_break_hold` | 11 at 20 | **Break the Hold**, David and Goliath step 2 (was "Knife Hand Blocks"): from attention, open hands rise up the middle, cross, and open out to head height, palms forward |
| `kata_punch` | 9 at 20 | **Punch**: front-side fist from the hip to the middle of the chest; other fist pulls back to the hip |
| `kata_reverse_punch` | 9 at 20 | **Reverse Punch**: rear fist to the middle as the hips turn square |
| `kata_backfist` | 10 at 20 | **Backfist**: loads up at the opposite shoulder, elbow up, swings out to stop just outside the hero's own cheek with the arm nearly straight, knuckles leading |
| `kata_spear_hand` | 10 at 20 | **Palm Down / Spear Hand** (Pinon 1): rear open hand presses down palm down, tucked close under the front elbow, while the front open hand thrusts out at the solar plexus, palm down |
| `kata_rear_leg_front_kick` | 15 at 20 | **Rear Leg Front Kick** (no wasted movement): hands catch at the hip, the standing foot stays planted, the back knee lifts high, kicks out and back, and lands one step ahead as the new front stance. The hero travels 0.56 tiles; drawn centred (see `travel` in the JSON) |
| `kata_rear_leg_front_kick_left` | 15 at 20 | The same kick with the **left** leg, from a right front stance (a real render, mirrored in Blender) |
| `kata_front_kick_stacked` | 15 at 20 | **Front kick, hands stacked** (Jay, Nov 21): the same legs, but both fists stack one over the other at the right hip (the kicking side) through the kick, then finish like the regular kick |
| `kata_front_kick_stacked_left` | 15 at 20 | The stacked-hands kick with the **left** leg, fists stacked at the left hip through the kick, then finish like the regular kick |
| `kata_break_hold_finish` | 13 at 20 | **Break the Hold**, David and Goliath step 12 (end of the kata): left foot draws in (heels together), arms go up above the head, then drop sharply, hands crossing in front of the face, to finish palms down outside the hips |

- **Techniques are one-shots that end on the finished pose** (`holdLastFrame`), so the game can hold each move until the next tap.
- **Every move is drawn with the left foot forward** (the kicks also come as real left-leg renders). For the other moves the right side is the same picture mirrored. The game can flip the sprite and use the mirrored direction row, so one render covers both sides of a kata.
- **Same model, rig, layers and camera** as the approved hero (`player-custom/source/player_custom_a|b.blend`), so the moves match the rest of the hero's art, every gi, belt, face and hair.
- **One rig addition:** a small `hand.L` / `hand.R` bone at each wrist, with the fist meshes hanging from it. It lets the hand open into a knife hand or spear hand (stretched and flattened) and turn palm up or down. The older animations don't use it, so they're unchanged.

## Previews (look at these first)

- `preview/game/all-moves-final-pose.png`: **start here.** The finished pose of every stance and move (the kick at full extension), in the game's real look (white gi, yellow belt), from the front, the corner and both sides.
- `preview/game/<animation>.gif`: each one playing at game speed, from the same four views (moves hold their finished pose, then replay).
- `preview/stances.png` and `preview/<move>.png`: quick pose-check pictures (plain white, bigger), every frame from the front (S), corner (SE) and side (E).

## Rebuild

```bash
blender -b incoming-art/player-custom/source/player_custom_a.blend -P incoming-art/claude-kata-moves/source/make_kata_moves.py -- --save incoming-art/claude-kata-moves/source/player_kata_a.blend
blender -b incoming-art/claude-kata-moves/source/player_kata_a.blend -P incoming-art/tools/render_sprites.py -- --out incoming-art/claude-kata-moves/sprites/body-a --name player-a --height 160 --anchor-y 0.856 --anims kata_open_leg,stance_front,...
# quick pose check pictures (not game quality):
blender -b .../player_kata_a.blend -P incoming-art/claude-kata-moves/source/quick_stills.py -- --out <dir> --anims kata_low_block --frames all --dirs S,SE,E
python incoming-art/claude-kata-moves/source/make_sheet.py <dir> <out.png>
# game-look GIFs (one face and hair, tinted):
python incoming-art/claude-kata-moves/source/make_kata_gifs.py --sheets incoming-art/claude-kata-moves/sprites/body-a --out incoming-art/claude-kata-moves/preview/game
```

Only body A is rendered (`sprites/body-a`). Body B is built (`source/player_kata_b.blend`) and renders the same way once Jay approves.

## Questions for Jay

Answered by Jay on Nov 21 (`docs/kata-technique-reference.md`). In the game data, David and Goliath steps 2 and 12 both use the Break the Hold button; step 2 plays `kata_break_hold`, step 12 `kata_break_hold_finish`.
