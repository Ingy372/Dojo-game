# Delivery Note: B-T3-TUNE-2b Hearth Cook guardian art

**ITEM:** B-T3-TUNE-2b. Hearth Cook "lid up" look, boss-bar lid icon, and three wind-ups (P1 pin, P2 pin, P3 bonk). The plan is from #284 and these replace the #285 stand-ins.

**WHAT:**
- A lid overlay for P2 and P3 that matches every #247 sheet frame for frame, plus a lid layer in the new attack sheets.
- `icon-lid` in 24, 32, 48 and 64 px, each with an @2x version.
- New sheets: windup_pin and pin for P1 and P2 (13f and 17f @10fps), and windup_bonk and bonk for P3 (10f and 13f @10fps).
- GIFs and a phone sheet in `preview/`, plus a README with import notes. Everything is in `incoming-art/hearth-cook-2b/`. No game code was changed.

**WHY:**
- Each wind-up gets a large, readable pose before it hits. For the pin, the cook leans back with the pin in both mitts. For the bonk, the pin is raised at the side.
- The lid shows that the boss can't be hurt without adding new rules: it is a clear "shield up" shape for ages 6+.
- On the P3 bonk (body leans far back), the lid sits edge-on at the left hip in every direction, so it never covers the face or eyes. I checked all 8 directions and all 23 frames.
- Red check: 0 px outside telegraph layers. Nothing goes above the head, and the faces and eyes are the original #247 ones.

**DECIDE (Jay):**
1. Lid colour and look: a steel-blue lid (#c3c8de) with an amber knob.
2. The P3 bonk uses the rolling pin as a club, so phase 3 keeps one prop. Would you rather it be the ladle?
3. The P1/P2 prop swap: the ladle is put away while the pin is in use. Is that OK?
4. The icon is a dome lid with an indigo outline. Does this design work?
5. Telegraph tint for the pin. The previews use purple for the pin and red for the bonk, and the game sets the real tint.
6. Names: `hearth-cook-pN-pin`, `hearth-cook-p3-bonk` and `hearth-cook-pN_lid_*`.

**NEXT:** If you approve, wire the sheets into the client in place of STAND_INS and the code lid. That is a separate item; I haven't started it.
