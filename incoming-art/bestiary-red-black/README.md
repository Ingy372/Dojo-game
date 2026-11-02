# Bestiary Red/Black: Masklet, Hush Guard, Echo Bell (R-G2B-35, SAMPLES, WORKING)

Three Red/Black-belt enemies from `drafts/planning/R-GREEN-TO-BLACK.md` (R-G2B-35). One model render each: idle, wind-up and attack in 8 directions. Not full sets: no move, hit or defeat animation yet. Copycat Shade is left for the full set. Same rig, eye style, layers (body / glow / telegraph / light), render script and camera as Blue and Red (#429, #432). Nothing is imported into the game.

| Folder | Data file | Look | Shape | Colours |
|---|---|---|---|---|
| `masklet/` | `drafts/content/enemies/masklet.json` | a small floating theatre mask: an oval lilac plate with a gold rim, dark eye holes with glowing cream eyes, a smile, lavender cheeks, a little nose, two teal ribbon ties that act as arms. No feet, it floats | small, flat oval | lilac `#b9a6dc`, belly `#e6dcf5`, gold rim `#e8c872`, teal ties `#6fcfc4` (data colour `#c7b8e0`) |
| `hush-guard/` | `hush-guard.json` | a quiet round shield-bearer: slate-violet body, a soft rounded hood with a lighter face, a silver scarf, felt slippers, stub arms with mitts, and a big round silver-rimmed shield on the left arm | small, round | slate-violet `#6f7391`, hood `#575b7a`, silver `#d6d9ea` (data colour `#6c6f8a`) |
| `echo-bell/` | `echo-bell.json` | a friendly brass bell: one smooth bell shape with two bronze bands, a rolled lip, a small flush top button, dark eye sockets with cream eyes, a smile, little felt feet, stub arms with round hands, and a ring of twelve lit studs round the lip | wide, squat bell | brass `#c2a548`, bronze `#8a6c2a`, studs `#fff3b8` (data colour `#b8a04a`) |

No teeth, points or spikes. No red or orange in any sprite (red is only the game-tinted telegraph layer, shown red in the previews; the Echo Bell's is shown house purple `#8a4fe6`, because it is dash-only). Glow sources: the Echo Bell's lit studs; the Masklet and Hush Guard have only the soft rim.

## What was made
- Idle (8 frames), wind-up and attack in 8 directions, 4 layers each, 160 px frames at `--ortho 2.0`, `--anchor-y 0.74` (feet at y 118 of 160).
- Frame counts: Masklet wind-up 7 / attack 10; Hush Guard 9 / 11; Echo Bell 11 / 17 (data wind-ups 14, 18, 22 ticks; recovers 16, 18, 24).
- **Masklet (bump).** Wind-up: one full spin on the spot, rising a little, ribbons flying. Attack: a quick bump forward. The red circle is drawn by the game.
- **Hush Guard (shield push).** Wind-up: the shield swings round on its own bone to face you, and trembles. Attack: a slow, soft shove forward with the shield. The red circle is drawn by the game.
- **Echo Bell (dash-only ring with a gap).** Wind-up: draws back and swells tall with the arms out, shivering. Attack: a 5-frame swing and ring that wobbles, then a recover. The purple ring with a gap and '!!' are drawn by the game (`incoming-art/dash-telegraph`).

## Previews (`preview/`)
- `lineup.png`: the three next to the player, Swarmer, Shield Guard, Brute, Floor Keeper and Pebble Pal on one ground line, in-game size (x0.6), 1x and 2x.
- `<enemy>_moves.png`: player, Brute, idle, wind-up (last frame) and attack (impact) in S, SE, E, N at 2x.
- `echo-bell_ring.png` / `.gif`: the wind-up inside the purple dash ring with a gap and the '!!' at the game's tile size, with the player at the gap.

## Rebuild (repo root; at most 2 Blender at once)
    blender -b -P incoming-art/bestiary-red-black/source/build_rb.py -- --enemy masklet --out incoming-art/bestiary-red-black/source/br_masklet.blend
    blender -b incoming-art/bestiary-red-black/source/br_masklet.blend -P incoming-art/tools/render_sprites.py -- \
        --out incoming-art/bestiary-red-black/masklet/sprites --name masklet --size 160 --ortho 2.0 --anchor-y 0.74 --anims idle,windup,attack
    # hush-guard, echo-bell: same (always render ALL the anims; a partial list overwrites the json)
    python3 incoming-art/bestiary-red-black/source/make_rb_lineup.py   # also: lineup | moves | ring

`source/build_rb.py` is built from the Red build script with the three new types.

## Grounding
Idle is constant per direction. The Masklet floats on purpose (it has no feet); the game draws its shadow. The Hush Guard's and Echo Bell's attack lunges toward the camera are ground travel, not floating. No frame touches the edge of its 160 px frame.
