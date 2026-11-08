# Delivery Note — J16 Ember Knight shifted form, draft B

**Jay approved the effects ("much better"). Ready for the Manager to merge. Not imported. Do not copy into the game yet.**

**ITEM:** J16 — draft B, revised after the Manager failed the subtle effects.

**WHAT:** Same eyes and same outer shape as the last B. The metal is now dark cool armour with copper shoulders, bar, and shield rim, and orange-gold seams. Effects are stronger and are separate transparent layers. The stable label is **Ember Knight — shifted form**. **Warm Shield** is still a placeholder. No sprite sheets. No game code.

**WHY:** The subtle steam did not show at 125 px. The Manager set a new review direction. That direction replaces, for this draft only, the earlier limits of copper-only plates, no particles, and no floor glow. Jay has not approved these details.

**DECIDE:**

1. Is this stronger draft ready to show Jay?
2. Is the placeholder name **Warm Shield** okay?
3. Is the Sensei line okay? "Look. The armor cooled."
4. Reduced Motion keeps the seams, the core, the rim, and the ground pool, and turns off drift and pulse. Is that the right stillness?

**NEXT:** The Manager can merge this art folder. It is not imported. The Programmer handoff is `HANDOFF.md` and `sprites/ember-knight-shift.json`. The picture is the one in commit `8acf72fd`. This export does not change it.

## Direction change (not a Jay approval)

The still brief painted every plate copper `#c9824a` and said no sparks, no flame, and no glow on the floor. This review draft does not follow that. It uses:

| Part | Hex | Where the light comes from |
| --- | --- | --- |
| Cool armour | `#4a5a72` | The metal itself. Deep shadow, cool shine. Not a new gameplay stat. |
| Copper accents (shoulders, bar, shield rim) | `#c9824a` | The accent metal. |
| Seams | `#ffc14d`, halo `#ffd08a` | Glowing lines on the armour. Smooth lines, not wounds. |
| Shield core | `#fff1b8` inside `#ffd08a` | The heated centre of the shield. |
| Rim light | `#ffe08a` and `#ffc14d` | A ring in the shield's plane, from the core. |
| Ground pool | `#ffb25a` and `#ffd08a` | Light on the floor under the shield, from that core. Not the red attack circle (`#ff3b30`). |
| Steam | `#fff6e0`, `#ffe08a` | One puff off the core during the settle. |
| Embers | `#ffe7a8` | Three dots rising from the shield and the chest seam. |
| 1 second shift glow | `#fff4cf`, halo `#ffecaa` | The same white-gold as the other four shifts. |

## Timing

- **0.00–1.00 s.** The existing white-gold transition. It still lasts 1 second. It does not flash or strobe. At the end of that second the tint is about 60% of the way to `#fff4cf`, so the shape is still in the glow.
- **1.00–1.50 s.** A settle accent, half a second, after the 1 second glow. One gold ring grows once and fades. One steam puff rises off the core. It does not repeat.
- **Idle.** The core's lit area grows and shrinks. Two or three embers drift up. The ground pool stays.
- **Reduced Motion.** The 1 second is a quieter crossfade. After that, the picture does not change: seams, core, rim, and ground pool only. No ring, no steam drift, no embers, no pulse.
- The older form-shift sample's 0.15 second flash is not used.

## What stayed the same

- Eye meshes, helm, shoulders, shield, and bar are in the same places. The outer silhouette pixels match the previous B exactly (alpha overlap 1.000, 0 pixels added, 0 removed).
- The black visor stays off. Eyes are still `#ffe2c0` with a white shine.

## Measured at 125 px

The still is 512 px across 2.6 tiles. At 48 px per tile that picture is 125 px. Numbers from `preview/quality-check-vfx.txt`:

- Gold-orange pixels: **701** on the phase-3 knight, **1129** on the new form at 1.25 s. The armour is darker, and the bright parts cover more of the picture.
- Steam-only gold box: **34 by 22 px**, 72 pixels. That is a cloud, not a speck.
- Shield window, pixels brighter than luminance 200: **250** at the low core, **342** at the high core. The peak stays **251** because the gold is already near its ceiling. The pulse grows the lit area by about 37%. It does not turn the centre white.
- Danger-red pixels: **0**. Nearest frame edge: **38 px** (the check fails under 8 px).

## Honest limits

- At 125 px the eyes are still only a few pixels tall. They stay visible on the dark helm. They are not as large as the phase-3 face, because that face has the black visor behind the eyes.
- The third ember can sit in the chest seam, so a quick look may count two dots above the shield rather than three.
- The ground pool is a soft gold oval under the shield. It is not the red danger circle. A child could still wonder if a glow on the floor is a warning. That is the trade for the new direction.
- The 1 second glow does cover the old form while it lasts. Once the new form is in, the face stays clear of the steam.

The 125 px check above is the phone-size check. The strip shows the same frames larger. Reduced Motion's last frames are the same picture. The near-white pixels in the check are the eye shine, already on the phase-3 knight.

## Kept, not thrown away

- `superseded/pass-1/` — first try, honey lines were dots.
- `superseded/pass-2-three-way/` — the three-idea review (A, B, C).
- `superseded/pass-3-contrast/` — B after the outline pass, before the eye sockets.
- `superseded/pass-4-static-b/` — the still B review, before steam and the core pulse.
- `superseded/pass-5-subtle-fx/` — the subtle effects the Manager failed.
- A and C Blender files and stills are still in `source/` and `renders/`.
