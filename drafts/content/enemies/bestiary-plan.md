# C13 Bestiary plan (PLAN ONLY, milestone 10)

Every enemy and Guardian for the 10 belt tiers, plus the dash-only attack. Text only; ids are proposals (Programmer may adjust). Not in launch scope. Machine-readable copy: `bestiary-plan.json`.

## Ground rules

- **Tone (ages 6+):** every enemy is a Tower creature the shadow confused or made mischievous. Nobody is evil or hurt. Defeated means *calmed* or *freed*: a soft puff, a smile, and the light returns (lore bible).
- **Floor bands:** each tier has 5 floors and a Guardian (core-design §12-13). Bands are **F1-2** (new enemies one at a time), **F3-4** (mixed rooms, the tier's dash-only enemy), **F5** (the Guardian floor: everything, then the Guardian).
- **Ranks** (core-design §12): normal, elite (from the 4th belt, `content/elites/elites.json`), boss (the Floor Keeper on floors 1-4), Guardian (floor 5).
- **Scaling** (balance-research.md System 2, recommendation a): stats = base × `ENEMY_SCALE[tier]`, tuned so hits-to-beat stays in band (Swarmer 2-4, Brute 10-20, Floor Keeper 40-80). Floor 1 ≈ 50% of tier max PR → floor 5 ≈ 85% → Guardian ≈ 90%. Challenge ×1.3 (research; see DECIDE). **Wind-up ticks never scale** (≥ 10). Difficulty grows by *more kinds and bigger groups*, not faster tells.
- **C12 tips still hold everywhere:** COUNTER the red circle, clear the small ones first, keep space, DASH out of crowds. Every tier has one swarm-type enemy so 'little ones first' keeps working.

## Dash-only attacks

Jay's idea (docs/decisions.md, 'Dodge-only attacks'): an attack that can't be COUNTERed or Blocked, only DASHed (or walked) out of.

- **Look:** purple-and-white diagonal **stripes on the floor**, shaped as a **lane, an arc, or a ring with a gap**. Never a circle, never red. A double **'!!'** above the enemy (the red circle has one '!'). A rising *whoosh* sound, not the drum. This follows the decisions.md example (striped purple, '!!') rather than yellow/blue, so it can't be mixed up with Calm Mind's aqua or gold loot glows.
- **Button hint:** while stripes show, COUNTER dims and DASH pulses (first 3 times only, like the C12 nudges).
- **Fair timing:** wind-up is never shorter than the blockable tell. Minimum 20 ticks (the Brute's red circle is 16); tiers 1-3 use 26-30. Ticks never scale with tier or difficulty.
- **No stacking early:** tiers 1-3 never show stripes and a red circle at the same moment (other wind-ups wait). From tier 4, they may overlap only with ≥ 10 ticks between them, and never on Guided.
- **Taught first:** White tier, **floor 4**, in a calm practice room with the **Sleepy Sentry** (a drowsy statue). Health never drops below 1 in that room, like the tutorial floor. It's a new Sensei's Lesson (one per session rule applies).
- **Lines** (one sentence per screen, under 12 words):
  - Lesson screen 1: "Purple stripes can't be COUNTERed."
  - Lesson screen 2: "DASH out of the stripes!"
  - Practice: "DASH out of the purple stripes."
  - Success: "Quick feet! You read the stripes."
  - Retry: "That's okay. The stripes will come again."
  - Sensei after (reflects): "Red circle, COUNTER. Purple stripes, DASH. You knew both."
  - Proposed C12 tutorial tip (only if DECIDE 2 moves it there): "Purple stripes? DASH out of them."

## Enemies by tier

### White: The Lantern Halls

| Name | Role | Band | Behaviour | Tell | Counterplay | Scaling |
|---|---|---|---|---|---|---|
| Swarmer *(existing)* | swarm | F1-2 | Small, fast, comes in groups; jabs. | Red circle (12 ticks). | Clear them first (C12 tip), or COUNTER. | Health and power by ENEMY_SCALE; group size grows by band, not speed. |
| Brute *(existing)* | heavy | F1-2 | Big and slow; gets winded after chasing 4 s. | Red circle (16 ticks). | COUNTER, or hit it while it's winded. | ENEMY_SCALE on health/power; winded timing never scaled. |
| Shield Guard *(existing)* | guard | F3-4 | Basic hits bounce off its shield. | Red circle (14 ticks); shield shines. | STRIKE or a Perfect Counter breaks the shield. | Shield regrow time fixed at 6 s. |
| Wick Wisp | flier | F1-2 | A tiny lost candle flame that drifts in a wavy line and bumps you. | Flickers bright, then a small red circle. | Punch it or COUNTER the bump. | Weakest enemy; health only. |
| Dust Bunny | charger | F1-2 | A fluffy dust ball that rolls straight at you, then sneezes. | Wiggles in place, then a red circle at its front. | Step aside or COUNTER. | Roll speed fixed; health/power by ENEMY_SCALE. |
| Lantern Moth | ranged | F3-4 | Flutters at a distance and tosses soft glow pebbles. | Red circle where the pebble lands. | Step out of the circle, then close in. | Pebble count 1 → 2 at F5; never faster. |
| Sleepy Sentry **[dash-only]** | dash-teacher | F4 (practice floor) | A drowsy stone statue. It yawns and stomps a long purple stripe. | Dash-only: purple stripe lane + '!!', 30 ticks. | DASH out of the stripe. It can't be COUNTERed. | Used only to teach; stays easy at every tier. |

### Yellow: The Sunrise Garden

| Name | Role | Band | Behaviour | Tell | Counterplay | Scaling |
|---|---|---|---|---|---|---|
| Bouncy Bopper *(existing)* | bonker | F1-2 | Bonks with a padded foam staff. | Raises the staff and glows; red circle. | COUNTER; a Perfect Counter disarms it (staff hidden). | Stats TODO (Researcher). |
| Buzzy Bee | swarm | F1-2 | Busy little bees in groups of 3-4 that zip in and out. | Short hover, then red circle. | Clear them first; DASH out if they crowd you. | Group size grows by band. |
| Thorn Sprout | turret | F1-2 | A grumpy sprout that stays put and spits seeds. | Puffs its cheeks; red circle where the seed lands. | Walk around the seeds and calm it up close. | Rooted; fire rate fixed. |
| Shellback Snail | guard | F3-4 | Slow snail that hides in its shell when hit too often. | Red circle before its head-bump. | Wait for it to peek out, or STRIKE the shell. | Hide time fixed; health by ENEMY_SCALE. |
| Vine Sweeper **[dash-only]** | dash-only | F3-4 | A tangle of vines that swings one long sweep. | Dash-only: purple striped arc + '!!', 28 ticks. | DASH out of the arc. | Arc width fixed; never paired with a red circle in tiers 1-3. |

### Orange: The Ember Kitchens

| Name | Role | Band | Behaviour | Tell | Counterplay | Scaling |
|---|---|---|---|---|---|---|
| Spark Sprite | swarm | F1-2 | Tiny warm sparks that dart around the ovens. | Blink, then red circle. | Clear first; they're quick but weak. | Group size grows by band. |
| Dough Blob | splitter | F1-2 | A wobbly dough ball. When calmed it splits into two Doughlings. | Squishes down; red circle. | Calm the little Doughlings fast. | Split count stays 2. |
| Ladle Lobber | ranged | F3-4 | Flings soft soup splats from the back. | Red circle where it lands. | Step out, then reach it behind the others. | Splat count 1 → 2 at F5. |
| Rolling Pin **[dash-only]** | dash-only | F3-4 | A giant rolling pin that rolls down a lane. | Dash-only: purple stripe lane + '!!', 26 ticks. | DASH out of the lane. | Lane count 1 → 2 at F5 (never together early). |

### Green: The Giant's Steps

| Name | Role | Band | Behaviour | Tell | Counterplay | Scaling |
|---|---|---|---|---|---|---|
| Pebble Pal | swarm | F1-2 | Little pebbles that hop after you. | Hop, then red circle. | Clear first. | Elites from this tier (elites.json). |
| Cliff Goat | charger | F1-2 | Lowers its horns and charges in a line. | Stamps, then a long red circle at the line's end. | COUNTER at the end, or step aside. | Charge speed fixed. |
| Stack Golem | heavy | F3-4 | A tower of stones; each hit knocks one off and it shrinks. | Wobbles; red circle. | Keep hitting; it gets smaller and faster. | Stone count by band (3 → 5). |
| Boulder Roller **[dash-only]** | dash-only | F3-4 | Pushes a big round boulder down a stripe. | Dash-only: purple stripe lane + '!!', 24 ticks. | DASH out of the lane. | From here a stripe may overlap a red circle, offset ≥ 10 ticks (never on Guided). |

### Blue: The Quiet River

| Name | Role | Band | Behaviour | Tell | Counterplay | Scaling |
|---|---|---|---|---|---|---|
| Puddle Frog | hopper | F1-2 | Hops in an arc and lands with a splash. | Red circle where it will land. | Step out, then calm it while it blinks. | Hop count by band. |
| Mist Wisp | sneak | F1-2 | Fades into mist, then reappears nearby. | Always shimmers before it appears; red circle. | Watch the shimmer, then COUNTER. | Never fully invisible. |
| Side Crab | guard | F3-4 | Holds up its big claw and walks sideways. | Claw snap: red circle. | Hit it from the back or side. | Guard by ENEMY_SCALE. |
| Splash Wave **[dash-only]** | dash-only | F3-4 | A rolling wave across a lane of the river. | Dash-only: purple striped wave lane + '!!', 24 ticks. | DASH out. | Lane count by band. |

### Red: The Forge of Courage

| Name | Role | Band | Behaviour | Tell | Counterplay | Scaling |
|---|---|---|---|---|---|---|
| Coal Cub | swarm | F1-2 | Warm, playful little coal pups that pounce. | Wiggle, then red circle. | Clear first. | Group size by band. |
| Anvil Imp | heavy | F1-2 | A small strong worker who taps a big hammer. | Hammer up; red circle. | COUNTER the tap. | Health/power by ENEMY_SCALE. |
| Bellows Puff | pusher | F3-4 | Huffs gusts that nudge you across the room. | Inflates; a pale gust arrow (no damage). | Stand side-on, or use the push to escape. | Push strength fixed; never into a hazard. |
| Forge Sweeper **[dash-only]** | dash-only | F3-4 | A big glowing broom that sweeps a wide arc. | Dash-only: purple striped arc + '!!', 22 ticks. | DASH out of the arc. | Arc 120° → 180° at F5. |

### Red/Black: The Hall of Echoes

| Name | Role | Band | Behaviour | Tell | Counterplay | Scaling |
|---|---|---|---|---|---|---|
| Masklet | swarm | F1-2 | Little floating masks that giggle and gather. | Spin, then red circle. | Clear first. | Group size by band. |
| Copycat Shade | mirror | F1-2 | Copies your last move a moment later. | Your move's shape in red, then it hits. | Do something different; COUNTER its copy. | Copy delay fixed. |
| Hush Guard | guard | F3-4 | Silent shield-bearer who turns to face you. | Red circle; shield turns. | Circle round, or STRIKE. | Turn speed fixed. |
| Echo Bell **[dash-only]** | dash-only | F3-4 | A bell that rings a purple striped ring outward with one gap. | Dash-only: striped ring + '!!', 22 ticks; gap glows. | DASH through the gap or out of the room edge. | Ring count 1 → 2 at F5. |

### Brown: The Root Library

| Name | Role | Band | Behaviour | Tell | Counterplay | Scaling |
|---|---|---|---|---|---|---|
| Page Flutter | swarm | F1-2 | Loose pages that flap like birds. | Rustle, then red circle. | Clear first. | Group size by band. |
| Bookworm | burrower | F1-2 | Tunnels under the floor and pops up. | A dirt bump moves toward you; red circle. | Step off the bump; calm it when it pops up. | Tunnel speed fixed. |
| Ink Blot | zoner | F3-4 | Leaves sticky ink puddles that slow you (no damage). | Puddle drawn as a dark blue blot. | Keep space; fight on clean floor. | Puddle count by band; max 3. |
| Root Snapper **[dash-only]** | dash-only | F3-4 | Roots poke up along a line, one after another. | Dash-only: purple stripe lane + '!!', 20 ticks. | DASH out. | Line length by band. |

### Brown/Black: The Storm Stair

| Name | Role | Band | Behaviour | Tell | Counterplay | Scaling |
|---|---|---|---|---|---|---|
| Cloud Puff | swarm | F1-2 | Fluffy clouds; a big one splits into two small ones. | Puff up, then red circle. | Clear small ones first. | Split count stays 2. |
| Gust Sprite | pusher | F1-2 | Spins and blows you sideways. | Spins; pale gust arrow (no damage). | Brace side-on or use it to escape. | Never pushes into a hazard. |
| Thunder Drum | turret | F3-4 | Beats a steady rhythm: boom, boom, BOOM. | Three red circles in a beat. | Learn the beat; COUNTER the big one. | Beat tempo fixed. |
| Zap Kite **[dash-only]** | dash-only | F3-4 | A kite that drags a zig-zag lightning stripe. | Dash-only: purple zig-zag stripe + '!!', 20 ticks. | DASH across or out. | Zig-zag count by band. |

### Black: The Summit

| Name | Role | Band | Behaviour | Tell | Counterplay | Scaling |
|---|---|---|---|---|---|---|
| Storm Wisp | swarm | F1-2 | Quick storm-cloud wisps. | Crackle, then red circle. | Clear first. | Top of ENEMY_SCALE; soft-cap ×1.5. |
| Rumble Brute | heavy | F1-2 | A big storm-wrapped brute; gets winded like a Brute. | Red circle (16 ticks). | COUNTER, or hit while winded. | Health/power by ENEMY_SCALE. |
| Echo Knight | guard | F3-4 | Remembers every guard trick: shield, turn and copy. | Red circle; shield shines. | STRIKE, circle round, change your move. | Mixes three tells; each stays readable. |
| Sky Sweeper **[dash-only]** | dash-only | F3-4 | A gust that sweeps an arc, then a lane. | Dash-only: arc then lane, each + '!!', 20 ticks. | DASH twice. | Two in a row, never at the same time. |

Floor Keeper *(existing boss rank)* guards floors 1-4 of every tier. Proposal: one tier-skinned Floor Keeper per tier, same moves plus that tier's swarm as helpers (see DECIDE).

## Guardians (outline only)

One per tier, on floor 5, Guardian rank (≈ 90% of tier max PR). Names and lines from `drafts/content/lore/guardians-and-relics.json`, unchanged. Each phase starts at a health mark (100%, 66%, 33%) with a short breath where nothing attacks. Every Guardian has at least one dash-only attack, using the tier's stripe shape.

### The Lamp Keeper (White, The Lantern Halls)

- **Story:** Once it kept the Tower's first lamp lit. The shadow made it forget, but it never stopped hoping.
- **Signature:** Wick Wake
- **Phase 1:** Lantern sway: swings its lamp in a red circle
- **Phase 2:** Wick wake: lamps light one by one
- **Phase 3:** Dim stripe (dash-only, 30 ticks): one slow purple lane
- **Freed (lore line):** "A spark... I had forgotten how warm it feels."

### The Sun Gardener (Yellow, The Sunrise Garden)

- **Story:** A tall, gentle gardener made of vines. The shadow wrapped it in thorns, but its roots still reach for the sun.
- **Signature:** Seed Rain
- **Phase 1:** Thorn whip: red circle
- **Phase 2:** Seed rain: red circles fall
- **Phase 3:** Vine sweep (dash-only): purple arc
- **Freed (lore line):** "The thorns are gone. My flowers can open again."

### The Hearth Cook (Orange, The Ember Kitchens)

- **Story:** A big, round cook with a ladle. The shadow made it guard the cold ovens alone.
- **Signature:** Hot Pot Rush
- **Phase 1:** Ladle bonk: red circle
- **Phase 2:** Hot pot rush: Spark Sprites join
- **Phase 3:** Rolling pin lane (dash-only)
- **Freed (lore line):** "Is it supper time? I would love some company."

### The Stone Giant (Green, The Giant's Steps)

- **Story:** Very tall and very loud. Inside, it is only a pile of stones the shadow stacked up.
- **Signature:** Rock Slide
- **Phase 1:** Giant stomp: big red circle
- **Phase 2:** Stone toss: red circles
- **Phase 3:** Rock slide (dash-only): two lanes, one after the other
- **Freed (lore line):** "I was only stones and worry. Thank you for not running away."

### The River Watcher (Blue, The Quiet River)

- **Story:** A heron made of water. The shadow muddied its eyes, so it cannot see who is friend or foe.
- **Signature:** River Wave
- **Phase 1:** Beak peck: red circle
- **Phase 2:** Muddy splash: puddles
- **Phase 3:** River wave (dash-only): striped wave lane
- **Freed (lore line):** "The water is clear. I can see you now, friend."

### The Ember Knight (Red, The Forge of Courage)

- **Story:** A knight of glowing metal. The shadow told it to protect the forge from everyone.
- **Signature:** Spark Shield
- **Phase 1:** Knight's swing: red circle
- **Phase 2:** Spark shield: STRIKE to break
- **Phase 3:** Forge sweep (dash-only): striped arc
- **Freed (lore line):** "I was guarding the wrong thing. Shields are for helping."

### The Echo Mask (Red/Black, The Hall of Echoes)

- **Story:** A floating mask that copies your moves. Under the mask, it is lonely.
- **Signature:** Copy Strike
- **Phase 1:** Copy strike: copies your move
- **Phase 2:** Echo crowd: Masklets join
- **Phase 3:** Echo ring (dash-only): striped ring with a gap
- **Freed (lore line):** "I only copied what I heard. I would like to hear kind words now."

### The Root Keeper (Brown, The Root Library)

- **Story:** A wise old tree who reads every book. The shadow made it forget how to share them.
- **Signature:** Root Line
- **Phase 1:** Branch tap: red circle
- **Phase 2:** Flying pages: Page Flutters join
- **Phase 3:** Root line (dash-only): striped lane
- **Freed (lore line):** "Take a book, little one. Your story belongs here too."

### The Storm Herald (Brown/Black, The Storm Stair)

- **Story:** A tall figure of wind and lightning. It shouts the storm louder so no one hears the calm.
- **Signature:** Zig-Zag Bolt
- **Phase 1:** Thunder clap: red circle
- **Phase 2:** Gust push
- **Phase 3:** Zig-zag bolt (dash-only)
- **Freed (lore line):** "The wind is still. Listen. Someone is calling from the top."

### The Lost Lightbearer (Black, The Summit)

- **Story:** The traveler, wrapped in storm clouds. They are tired from holding the last piece.
- **Signature:** Echoes of the Climb
- **Phase 1:** Storm swing: red circle
- **Phase 2:** Shadow echoes of earlier Guardians, one move each
- **Phase 3:** Storm sweep (dash-only): arc then lane
- **Freed (lore line):** "You came all this way to help? Now we can finish together."

## Faith tie-ins (optional Action Zone layer)

Jay's standing story rule: "For our dojo's version of this game, tie in Christianity in the story whenever possible. Nothing fabricated, but don't force it. I want the story to be fun and an adventure for the students to uncover."

- **Kept apart:** core enemy and Guardian text above stays neutral. Tie-ins live in a keyed overlay (`faithOverlay`, `schoolId: action-zone`), built on `drafts/content/faith/` and `docs/faith-and-creed.md`, so other dojos can swap it out.
- **Accurate:** references only in this plan. Any verse text in later PRs is KJV, copied word for word from `creed-and-verses.json` or checked against the source, with the reference in a comment. Nothing invented.
- **Discovered, not taught:** a hidden scroll or relic near each Guardian, read after the Guardian is freed. Sensei reflects in one short line; no lectures, no quizzes, no locks.
- **Anchor:** the school motto "More than a conqueror" (Romans 8:37) and light overcoming darkness, which already match the lore.

| Guardian | Tier's promotion verse (school sign) | Theme reference | Idea | Where it's found |
|---|---|---|---|---|
| The Lamp Keeper | John 3:16 | John 1:5 | Light shining in the dark | A hidden scroll in the Lantern Halls |
| The Sun Gardener | Romans 3:10 | Galatians 5:22-23 | Good fruit grows slowly | A scroll under a garden bench |
| The Hearth Cook | Romans 3:23 | Acts 2:46 | Sharing a meal together | A scroll tucked by the supper table |
| The Stone Giant | Romans 6:23 | 1 Samuel 17 | David and Goliath, the tier's own form | A sling-stone relic on the Giant's Steps |
| The River Watcher | Romans 5:8 | Psalm 23:2 | Still waters and seeing clearly | A scroll in the reeds |
| The Ember Knight | 1 John 1:9 | Joshua 1:9 | Courage without fear | A scroll on the forge anvil |
| The Echo Mask | John 3:17 | Hebrews 13:5 | Never alone | A scroll that echoes back kindly |
| The Root Keeper | John 3:3 | Psalm 1:3 | A tree planted by the water | A book on the Library's top shelf |
| The Storm Herald | John 3:5-8 | Mark 4:39 | Calm in the storm | A scroll that stays still in the wind |
| The Lost Lightbearer | John 6:40 | Romans 8:37; Matthew 5:14-16 | More than a conqueror; light of the world | The last piece of light, found together |

## Proposed PR split

1. **C13 plan** (this PR).
2. **C13-1:** tiers 1-3 enemy JSON in `drafts/content/enemies/`, same shape as `content/enemies/*.json` (id, name, notes, color, maxHealth, power, guard, radius, moveSpeedTilesPerSecond, sightRange, attack{…}, parSeconds) plus a proposed `dashOnly` attack block. Stats as TODO for the Researcher.
3. **C13-2:** tiers 4-6 enemy JSON.
4. **C13-3:** tiers 7-10 enemy JSON.
5. **C13-F:** faith overlay file for the Guardians (`drafts/content/faith/`), verse text checked word for word.
6. **C13-4:** dash-only Sensei's Lesson in the first-session-lessons.json format.
7. **C13-5 to C13-6:** Guardian boss files in `drafts/content/bosses/` (tiers 1-5, then 6-10), phases and lines.
8. **Researcher:** ENEMY_SCALE table and per-enemy stats; **Artist:** stripe tell and creature art.
