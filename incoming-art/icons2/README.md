# icons2: Forms, Strikes and Virtues icons (3 samples)

This is the follow-up to the menu2 seal icons (`incoming-art/icons`, shown at 64 in `menu2/sprites/icons64`). It uses the same flat medallion: a dark edge, a cream rim, a coloured family ring, a cream face and flat ink symbols. Labels are drawn by the game as text; nothing is baked in.

```
python3 incoming-art/icons2/source/build_icons2.py   # sprites/*.png + sprites/icons2.json
python3 incoming-art/icons2/source/make_preview.py   # preview/icons2-preview-667x375(.png, @2x)
```

| Sprite | Group | Name (from content/abilities/abilities.json) | Ring |
|---|---|---|---|
| `icon-rooted-form-64` | Forms | Rooted Form | jade green |
| `icon-follow-up-kick-64` | Strikes | Follow-up Kick | violet |
| `icon-beginners-stance-64` | Forms | Beginner's Stance | jade green |
| `icon-flowing-form-64` | Forms | Flowing Form | jade green |
| `icon-quick-combo-64` | Strikes | Quick Combo | violet |
| `icon-second-wind-64` | Virtues | Second Wind | gold |
| `icon-perfect-discipline-64` | Virtues | Perfect Discipline | gold |
| `icon-shield-of-respect-64` | Virtues | Shield of Respect | gold (gold face wash) |

- **Sizes:** each icon is 64×64 at 1x, with a 128×128 @2x. The anchor is the centre. The art sits inside a 45 px radius on the 64 grid.
- **Ink** is clipped to the face circle so nothing touches the ring.
- **Technique checks** (also in the code docstrings):
  - **Rooted Form:** a wide, even, symmetric horse-style stance, seen from the front. The feet are about two shoulder-widths apart, parallel and flat. Both knees are bent equally and pushed out over the toes, with the hips low and level. The back is straight and the guard is up: both fists are at chin height with the elbows down.
  - **Follow-up Kick:** Kick Combo 1 is front kick, front kick, inside kick, outside kick, spin kick (Jay; `docs/curriculum.md`). The icon shows the front kick, which reads best at 64. It's a front kick. The support leg is slightly bent with the foot flat. The kicking leg is extended at chest height, striking with the ball of the foot (toes pulled back), and the guard stays up. A soft ghost of the first, lower kick sits behind it, with a curved arrow rising to the second.
  - **Shield of Respect:** a standing bow (rei) on a gold shield. Heels are together and the legs straight. The student bends about 30° at the waist with a straight back, hands flat at the sides of the thighs and eyes down.
- **Colour:** there's no red; the red check finds 0 px.

**Strikes ring colour:** violet (Jay, 2026-10-25). It's distinct from the Seal blue, Forms green and Virtue gold, and it isn't amber or red.

**The other 5 icons (techniques):**
- **Beginner's Stance:** the ready stance, front view. Feet shoulder-width apart and parallel, knees soft, back straight, both fists closed in front of the belt.
- **Flowing Form:** a light fighting stance, side view. Weight on the balls of the feet with the back heel raised, knees bent, lead hand forward, rear hand by the chin. Soft wavy lines behind show the movement.
- **Quick Combo** (Kick Combo 2 is Combo 1 plus 3 jumping spin kicks): a middle round kick striking with the instep. The body leans back for balance and the guard stays up. A sweeping arc shows the kick's path and soft chevrons show speed.
- **Second Wind** (Great Effort): rising from one knee. The back knee is down, the front foot is flat with the knee over the ankle, the back is straight, and one hand presses the front knee. Rising swirls show the energy coming back.
- **Perfect Discipline** (Self-Discipline): kneeling in seiza. The student sits on the heels with a straight back and hands flat on the thighs, with small calm sparkles beside them (none above the head).
