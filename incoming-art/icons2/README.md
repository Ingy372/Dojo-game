# icons2: Forms, Strikes and Virtues icons (3 samples)

This is the follow-up to the menu2 seal icons (`incoming-art/icons`, shown at 64 in `menu2/sprites/icons64`). It uses the same flat medallion: a dark edge, a cream rim, a coloured family ring, a cream face and flat ink symbols. Labels are drawn by the game as text; nothing is baked in.

```
python3 incoming-art/icons2/source/build_icons2.py   # sprites/*.png + sprites/icons2.json
python3 incoming-art/icons2/source/make_preview.py   # preview/icons2-preview-667x375(.png, @2x)
```

| Sprite | Group | Name (from content/abilities/abilities.json) | Ring |
|---|---|---|---|
| `icon-rooted-form-64` | Forms | Rooted Form | jade green |
| `icon-follow-up-kick-64` | Strikes | Follow-up Kick | seal blue |
| `icon-shield-of-respect-64` | Virtues | Shield of Respect | gold (gold face wash) |

- **Sizes:** each icon is 64×64 at 1x, with a 128×128 @2x. The anchor is the centre. The art sits inside a 45 px radius on the 64 grid.
- **Ink** is clipped to the face circle so nothing touches the ring.
- **Technique checks** (also in the code docstrings):
  - **Rooted Form:** a wide, even, symmetric horse-style stance, seen from the front. The feet are about two shoulder-widths apart, parallel and flat. Both knees are bent equally and pushed out over the toes, with the hips low and level. The back is straight and the guard is up: both fists are at chin height with the elbows down.
  - **Follow-up Kick:** a front kick. The support leg is slightly bent with the foot flat. The kicking leg is extended at chest height, striking with the ball of the foot (toes pulled back), and the guard stays up. A soft ghost of the first, lower kick sits behind it, with a curved arrow rising to the second.
  - **Shield of Respect:** a standing bow (rei) on a gold shield. Heels are together and the legs straight. The student bends about 30° at the waist with a straight back, hands flat at the sides of the thighs and eyes down.
- **Colour:** there's no red; the red check finds 0 px.
