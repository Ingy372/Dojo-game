# Walk research: what makes a top-down walk feel natural

Why this exists: Jay picked Arms 1 but rated it 6.5/10. These notes say what real games and animation guides do, so the
next samples are based on sources and not on guesses. Every number below comes from the linked source. Where I could not
find a reliable number, the notes say so.

## What the games do (verified only)
| Game | What I could verify | Source |
|---|---|---|
| Stardew Valley | The farmer walk plays frames 0,1,0,2 at 200 ms each, so 2 drawn step poses with a neutral pose in between | https://stardewvalleywiki.com/Modding:Farmer_sprite |
| CrossCode | The player walk loops 0,1,2,1 (a weak source: a Reddit modding comment). The sheets are in `assets/media/entity/player/move.png` | r/CrossCode kimono-mod thread; https://wiki.c2dl.info |
| Sea of Stars | Characters are drawn in 4–8 angles with about 60 navigation animations each. No per-cycle frame count is published | Nintendo Life interview with Sabotage; Sabotage LinkedIn post |
| Eastward | Animated frame by frame by hand in Aseprite. No frame counts are published | gamedeveloper.com (Pixpil interview) |
| Zelda: Minish Cap | **Not verified.** Only ripped sheets exist (The Spriters Resource). I found no reliable frame count or timing | n/a |

## General guides
- Pixeli, top-down rules: the head and torso drop 1 px on the step frames. The hand opposite the leading leg sits 1 px lower. A walk uses 4 frames at 100–200 ms, or 6, 8 or 12 frames at about 100 ms for a smoother walk. The bob should "bounce, not sine". The N view moves less. https://pixeli.pebbly.space/knowledge/rules/47-top-down-animation
- Polygon Treehouse, walk part 2: offset the arms 1–2 frames from the legs, and let the forearm drag behind the upper arm. https://www.polygon-treehouse.com/blog/2019/2/1/walk-pt2
- Motion Design School: the hands trail the legs by 2–3 frames and move in arcs, not straight lines. https://motiondesign.school/blog/7-walk-cycles-mistakes/
- SIGGRAPH walking exercise: the hips and shoulders counter-rotate, and the hips tilt at the passing pose. https://education.siggraph.org/static/HyperGraph/animation/character_animation/walking/walking_excercise.htm
- Williams / Lango, summarised: "drag". At each change of direction the hand still favours the pose it just left. https://tryingtobeananimator.wordpress.com/2016/10/04/arm-movement-during-walk-cycles/
- Lifebe pixel tutorial: dip the torso 1 px on the weight frames, using a 6-frame cycle. https://lifebe.com.au/artistic/pixel-art-tutorial-walking-ii/
- SLYNYRD Pixelblog 22: a 4-frame walk and an 8-frame run for top-down sprites. https://www.slynyrd.com/blog/2019/10/21/pixelblog-22-top-down-character-sprites

## Takeaways for our walk (10 frames at 30 fps)
1. **Arms should trail the legs.** Several guides independently say the arms should run 1–3 frames behind the legs (Polygon Treehouse, Motion Design School). Arms 1 uses a lag already; the next step is a lag that differs between the upper arm and the forearm.
2. **Drag and arcs, not a pendulum.** The forearm and hand follow the upper arm, linger on the pose they just left, and move in an arc that is slightly higher at the end of the swing (Williams/Lango, Polygon Treehouse, Motion Design School). A plain sine swing looks mechanical.
3. **A small body bob sells the weight.** Pixel guides use a 1 px head and torso drop on the contact/weight frames, shaped as a "bounce, not sine" (Pixeli, Lifebe). At our 160 px height, 1 px is a very small change.
4. **Counter-rotation.** The shoulders twist against the hips (SIGGRAPH). In side and diagonal views this shows as the chest turning slightly with the forward arm. Keep it smaller in the N view (Pixeli: the N view moves less).
5. **Frame count is not the problem.** The games and guides use 3–4 drawn poses (Stardew 0,1,0,2; CrossCode 0,1,2,1; SLYNYRD 4) up to 6–12 for smooth walks (Pixeli, Lifebe). Our 10 frames are already in the smooth range, so the gain comes from timing and offsets, not from adding frames.

## DECIDE
- Whether a 1 px body bob (sample R2) is wanted in the game, or whether the legs and body must stay exactly as they are.
