# P-MENU2: Training Board redesign (Last run, Abilities, Gear)

Status: plan for Jay, the Artist and the Programmer. No game code or work board changed.
Labels: **[CODE]** read from main today, **[PLAN]** proposed, **[GUESS]** needs a phone test.

## Delivery Note
- **ITEM:** P-MENU2, Jay's Oct 25 ask: "This menu is jumbled and hard to read... The ability menu needs a total overhaul, the gear menu kinda does too. It needs to feel more special and interactive."
- **WHAT:** A layout for a landscape phone for three tabs, an art list with 3 first samples, 9 board items (P-MENU2-a to i), 3 mood mock-ups and 6 DECIDE items.
- **WHY:** Today Abilities is one long paged list of same-looking text cards. Nothing says "you earned this in real life", and there is nothing to pick. Gear and Last run are text-heavy.
- **DECIDE:** D1 to D6, at the end.
- **NEXT:** Jay picked mood A, warm dojo wood (D1, decided). The Artist makes the 3 samples. The Programmer starts P-MENU2-a/b after P-MENU-d lands.

## 0. What's there today, and how this builds on P-MENU (#225)
**[CODE]** `apps/client/src/scenes/HomeScene.ts`:
- **Shell:** the left column is ≤300 px or 38% of width. On the right are 4 tabs (Last run, Abilities, Gear, Gate), each 34 px tall.
- **`renderRun` (449):**
  - headline, then 30×30 room chips
  - one stats line at 14 px, an XP line, a decorations line
  - an item list at 14 px with lines 19 px apart
  - personal bests at 12 px
- **`renderAbilities` (532):**
  - one card per Virtue, kata, Form, Strike and Seal, with text at 11–13 px
  - locked cards are dim with 🔒 and "Show Sensei … to unlock"
  - paged with ◀ ▶
  - no choices
- **`renderGear` (702):**
  - 3 worn cards, then a 2-column bag grid, a bottom sheet and pages
  - already moved to P-MENU-d
- **Sim:**
  - Forms are switched **during** a fight (`world.ts:69-74`).
  - Strikes and Seals are always on.
  - The Virtue taken into a fight is **picked automatically**: highest rank, then the latest (`training.ts:207`).
  - **So there is no loadout today.** P-MENU2 adds a small one.

| P-MENU item | P-MENU2 does |
|---|---|
| P-MENU-a tokens, `ui/button.ts` (done, #228) | **Keeps and uses** them. New tokens are only added, never changed. |
| P-MENU-b shell/panel split (#253) | **Keeps.** Each new tab draws inside `renderPanel`. |
| P-MENU-c left column (#254) | **Keeps.** No change. |
| P-MENU-d Gear | **Extends.** Keeps the sheet and the stable grid. Adds the paper-doll and compare (P-MENU2-f). |
| P-MENU-e Gate | No change. |
| P-MENU 3d "Last run and Abilities: shared rules only" | **Replaces** it with full redesigns (P-MENU2-b to e). |
| P-MENU-g phone check | **Extends** it to the new tabs (P-MENU2-i). |

## 1. The redesign (landscape phone)
Design size: **667×375** (small) to **932×430** (large) **[CODE: the P-MENU check sizes]**. The panel on the right is about 330–560 px wide.

All of P-MENU's rules apply:
- 8 pt grid
- 44 pt minimum tap size
- type 12/14/17/22, with nothing under 12
- `PRESS`/`RELEASE`/`SWAP`/`SHEET`/`POP` motion
- a Reduced motion path

### Readability rules for ages 6+ (why each choice)
- **One idea per card,** with **an icon first and words second.** Many 6-year-olds read slowly. A big picture plus 1–3 words beats a sentence.
- **Text sizes:**
  - names are 17 bold
  - effects are one short line at 14
  - longer text only goes in a detail sheet (tap to open)
  - this replaces today's 11 px descriptions
- **Never more than 8 things on screen in a group.** Pages show as dots, not as "3 / 7".
- **Colour is never the only signal.** Earned items also get a gold frame and a check-seal. Locked items get a paper outline and a lantern.
- **Read-aloud:** the 🔊 button on detail sheets uses the existing read-aloud setting. This is optional (D5).

### 1a. Last run: "Scroll of the Climb"
Layout, top to bottom, in panel coordinates:

| Part | Size | Content |
|---|---|---|
| Headline banner | full width × 44 | "Floor cleared!" (22, gold), or "You reached room 4 of 6" (22, cream). Never "failed" or "lost". |
| Room path | 36×36 chips, 8 gap | Today's chips, but joined by a dotted path line. The grade letter is 17 bold. |
| 3 stat tiles | 3 equal tiles, 64 tall | Big icon + number (22 bold) + label (12): **Perfect Counters**, **Best combo**, **Time**. A new best gets a gold ribbon "New best!" (`POP` once). |
| XP bar | full × 20 | Fills from the old to the new value over 600 ms. "Level up!" pops if a level was gained. |
| Found strip | 52×52 item tiles, scrolling sideways | Rarity frame + icon, sorted best first. Tap a tile to open the Gear sheet for it. "For your dojo" decorations go in the same strip, with a small house badge. |

- **Motion, once each time the tab opens after a run:**
  - the chips appear one by one, 60 ms apart
  - then the stat tiles count up over 400 ms
  - then the XP bar fills
  - a second visit shows everything instantly
  - Reduced motion: no counting, just a 120 ms fade
- **Why:** numbers in big tiles are read at a glance, while a list of 14 px lines is not. Found items as pictures can be read by kids who can't read the names yet.
- **Out:** the personal bests list moves to a small "Bests" button (44 tall) that opens a sheet. That way nothing gets crammed.

### 1b. Abilities: two parts, with a switch at the top
A **segmented switch** (2 × 120×44) at the top of the panel: **🏆 Trophy Case** | **⚔ Fighting Style**. It opens on Trophy Case after a new real-life unlock, and on Fighting Style otherwise **[PLAN]**.

#### Trophy Case: "what you earned at the dojo"
- **Belt ribbon** (full width × 40): one knot per belt in order. Earned belts are in full colour with their stripes. The current belt has a soft glow. Future belts are a paper outline.
- **Shelves**, one row per group, with up to 4 cubbies per row and pages as dots:
  - **Katas** (Forms)
  - **Kicks** (Strikes)
  - **Self-defense** (Seals)
  - **Character stripes** (Virtues)
- **Cubby:** 96×96 (small phone) or 112×112 (large), 8 gap.
  - **Earned:** a lit wood or paper card with a big icon (64) and the real technique name at 14 bold, cut to 2 lines. A small red seal stamp in the corner means "Signed by Sensei".
  - **Not yet:**
    - a cream paper card with the icon as a soft outline (30% alpha) and a lantern
    - the words "**Learn this at the dojo**" at 12
    - no lock icon, no grey and no count of how many are missing
- **Tap a cubby → detail sheet** (`SHEET`, half the height):
  - big icon (96) and real name, then what it does in the game in one line at 14
  - earned: "Signed at Yellow belt"
  - not yet: "Ask Sensei about this one" (D3)
  - the kata step arrows (today's S3-P1 row) live here
- **New unlock moment:**
  - the first time the tab opens after a sign-off, that cubby lights up: paper → wood, a gold sweep over 400 ms, then a `POP`
  - plays the existing bow bell (P-MENU-f), once
- **Why:**
  - It's a case of real trophies, so pride comes from the dojo. Real training stays the visible source of power.
  - Locked items read as "something to look forward to", never as missing. There are no counters, so there's nothing to feel behind on (R-BAL-12 rule: no nag or guilt).

#### Fighting Style: "your arsenal"
**[PLAN]** Small and honest, built on what the sim already has:

| Slot | What you pick | Sim today |
|---|---|---|
| **Stance** (starting Form) | which unlocked Form you start each room in | Forms exist and can be switched in a fight. **New:** a starting index. |
| **Virtue** | which earned character stripe you bring | Picked automatically today. **New:** a player choice, defaulting to today's pick. |
| **Strikes and Seals** | not picked. They show as a lit "Always with you" row | Always on, as today. |

- **Layout:**
  - left 55%: two big slot cards (each 140×120): an icon (64), the slot name (12), the item name (17 bold) and one effect line (14)
  - right 45%: a "Choose" tray with the unlocked options for the selected slot as 72×72 tiles, up to 6, with dots for more
  - bottom: the "Always with you" row of small 44×44 icons
- **Interaction: tap-to-equip first (D4).**
  - Tap a slot and it glows. Tap a tray tile and the tile flies into the slot (`SHEET` 220 ms), then the slot does a `POP` and plays the tap sound.
  - Drag also works: a tile follows the finger, and the slot glows when the tile is over it.
  - There is no "Save" button. A choice is saved at once.
- **Preview:** a long-press, or the small ▶ on a tile, opens a 160×100 card. It shows the Form's stance pose (existing player sprite + aura) and **one plain line**, for example "Faster feet, softer hits". No numbers by default (D6).
- **Why:** this is the "how will my character fight" moment Jay asked for. It's limited to 2 picks so a 6-year-old can't get lost. Every option comes from real sign-offs, so it shows off real training too.

### 1c. Gear: "Wear it, see it"
P-MENU-d's sheet and stable grid stay. Added on top:
- **Paper-doll** on the left of the panel (120 wide): the character sprite with 3 slot rings around it (head, body, charm), each 56×56 with a rarity frame. A ring glows when a bag card of that slot is picked.
- **Bag grid:**
  - 3 columns of 72×88 tiles (icon 48 + rarity frame + one stat chip at 12)
  - this replaces the 2 text-heavy columns
  - a filter row of 3 × 44×44 slot icons above it
- **Compare in the sheet:** next to the worn item, ↑ green or ↓ soft grey arrows per stat (never red). "Wear" sits in a big 52-tall button.
- **Wear moment:** the tile flies to its ring (220 ms), then the ring `POP`s and the doll flashes once.
- **Why:** the doll shows where gear goes without reading. Arrows answer "is this better?" for pre-readers.
- No shop, no prices, no "rare drop" teasers. Chests remain random **found** gear only.

## 2. Art for the Artist
Sizes are 1× with a 2× export. Webp atlases, as in `assets/art/`.

**Mood A look (Jay's pick for the beta):** warm dojo wood and paper, like the real Action Zone wall.
- **Wood:** honey/oak frames and shelves, mid `#B07A45`, dark grain and edges `#6B4423`, highlight `#D9A66B`.
- **Paper:** rice-paper panels and the not-yet outline, `#F3E9D2`, with a soft shadow `#D8C8A8`.
- **Ink:** text and outlines `#2B1D14` on paper (keeps contrast at 4.5:1 or better). Use white text only on dark wood.
- **Accents:** sensei-seal red `#B23A2E`, lantern/unlock gold `#E8B04B`. Belt colours stay as in content.
- **Light:** warm, soft, daytime. Glow effects become a warm gold sheen rather than neon.
- **[PLAN]** These hex values are starting points for the Artist. Final values go into `theme.ts` tokens with P-MENU2-a.

| # | Asset | Size (1×) | Notes |
|---|---|---|---|
| A1 | Panel frame, 9-slice (mood A skin) | 48×48 corners | Warm wood frame with a pale paper (shoji) inset |
| A2 | Cubby, earned and not-yet states | 112×112 | 9-slice friendly. The not-yet state is a paper outline + lantern |
| A3 | Belt ribbon knots ×10 colours + stripe mark | 40×40 each | Matches the belt colours in content |
| A4 | Sensei seal stamp | 24×24 | Red, simple, no text |
| A5 | Ability icons, 64 px versions of the existing icon set | 64×64 | 3 forms, 2 strikes, 10 seals, 3 virtues (18). Upscale or redraw from `icons.json` |
| A6 | Slot card frame (Stance, Virtue) + glow | 140×120 | Selected and normal states |
| A7 | Tray tile frame | 72×72 | Normal, selected and equipped states |
| A8 | Segmented switch, trophy + swords glyphs | 120×44 ×2 | Plus 32 px glyphs |
| A9 | Lantern (not-yet marker) | 24×32 | 2-frame flicker, optional |
| A10 | Stat tile icons: perfect, combo, clock, XP | 32×32 ×4 | |
| A11 | Gear rings, rarity frames ×4 | 56×56 | Common, uncommon, rare, epic |
| A12 | Paper-doll pose (idle front) | 96×128 | Reuses `player-a-big` if it fits |
| A13 | Gold sweep / unlock sparkle | 128×128, 8 frames | For the unlock moment |

**3 samples to make first for Jay:**
1. **A2 cubby**, earned (wood cubby) + not yet (paper outline + lantern), with one A5 icon, in mood A.
2. **A6 Stance slot card**, selected and normal.
3. **A1 + A3 together:** the wood panel frame with the belt ribbon (white, yellow, orange, the rest outlined).

These three set the look for the whole screen.

## 3. Board items for the Programmer (for the Manager to copy; the board is not edited here)
Beta freeze is **Dec 4**.
| ID | Owner | Work | Done when (a tester checks) | Waits on | Beta? |
|---|---|---|---|---|---|
| P-MENU2-a | Programmer | Tab skins: the mood A wood/paper frame on the panel, the segmented switch, new tokens (cubby, slot, tile sizes) in `theme.ts` | Abilities shows the 2-part switch. Both parts are 44 tall. Screenshots at 667×375 and 932×430 | P-MENU-b merged; D1; art A1, A8 (placeholder boxes OK) | **Beta** |
| P-MENU2-b | Programmer | Trophy Case: belt ribbon, shelves, earned/not-yet cubbies, dot pages, detail sheet with kata arrows | A White+2-stripe test profile shows earned cubbies with seals and not-yet ones with "Learn this at the dojo"; no lock icon, no counts; tapping opens the sheet | P-MENU2-a; A2, A3, A4, A5 (placeholders OK) | **Beta** |
| P-MENU2-c | Programmer | Unlock moment in the Trophy Case: paper→wood sweep + `POP` + bell, once per unlock (saved in `seen`) | After a new sign-off (B-BELT), the cubby lights up once; a reopen shows no replay; Reduced motion fades only | P-MENU2-b; B-BELT; A13 | **Beta if time**, else after |
| P-MENU2-d | Programmer (sim + client) | Fighting Style data: save the starting Form + chosen Virtue in the profile; sim uses them (default = today's behaviour); tests | Sim tests: the default profile fights exactly as today; a chosen Virtue/Form is used in the next run | — | **Beta** (small; risk below) |
| P-MENU2-e | Programmer | Fighting Style screen: slot cards, tray, tap-to-equip, drag, preview card, "Always with you" row | A 6-year-old (or tester acting as one) changes the Stance in 2 taps; drag also works; the choice survives a restart | P-MENU2-d; A6, A7 | **Beta** (drag + preview may slip to after) |
| P-MENU2-f | Programmer | Gear extends P-MENU-d: paper-doll rings, 3-column tiles, slot filter, compare arrows, fly-to-ring | Wearing an item flies it to its ring; arrows show ↑/↓ with no red; the grid never jumps | P-MENU-d merged; A11, A12 | **After beta** |
| P-MENU2-g | Programmer | Last run "Scroll of the Climb": banner, path chips, stat tiles, XP fill, found strip, Bests sheet | After a run, the tiles count up once; no text under 12; every found item is tappable | P-MENU-b; A10 | **After beta** (or beta if a–e finish early) |
| P-MENU2-h | Artist | A1–A13 in mood A (warm dojo wood); the 3 samples first | Jay approves the 3 samples; the atlases are in `incoming-art/` | D1 | Samples by **Nov 8**; rest after |
| P-MENU2-i | Tester | Phone pass: small and large, Reduced motion on and off, kid-tap test | No missed tap in 10 tries per control; no text under 12; no guilt words (checked against the R-BAL-12 rule) | b, e (+ f, g later) | **Beta** for b–e |

**Scope risk (honest):**
- The beta already has B-WRAP, B-CI, B-BELT, B-ART3/T3 and P-MENU-b to e queued before Dec 4. That's a lot for one Programmer.
- **Minimum beta set:** P-MENU2-a, b, d, e (tap only), using placeholder art if A-samples aren't approved by Nov 15.
- Gear (f) and Last run (g) move after the beta. P-MENU-d already makes Gear decent.
- P-MENU2-d changes the sim, so it is the riskiest. It must keep today's default exactly and be covered by tests.
- If B-BELT slips, c can't be tested with real sign-offs. Use the test profiles.
- **[GUESS]** a–e is about 6–9 Programmer days.

## 4. Moods (mock-ups, made with an image generator; not final art, no real people or student data)
| Mood | File | Feel | Note |
|---|---|---|---|
| A. Warm dojo wood and paper | `drafts/planning/P-MENU2-moods/mood-a-dojo-wood.jpg` | Cosy, real dojo, belts on a shelf | Closest to the real Action Zone wall. The silhouettes in the mock are only placeholder figures |
| B. Night temple, glowing scrolls | `drafts/planning/P-MENU2-moods/mood-b-night-temple.jpg` | Magical, "special", rewards glow | Matches today's dark UI colours, so it's the easiest step |
| C. Bright storybook | `drafts/planning/P-MENU2-moods/mood-c-storybook.jpg` | Cheerful sticker album | Most readable for the youngest kids; least "dojo" |

The generator invented words in the mock-ups ("Trophy Wall", names such as "Flame Burst", mottos). They are **not** proposed text. The real names come from content.

**Picked: A** (Jay). **Proposal, not launch scope:** after the beta, B (night temple) and C (storybook) could come back in an update as an optional "Board style" picker in Settings. That would only re-skin A1, A2, A6, A7 and A8 through `theme.ts` tokens, with no gameplay change. It needs its own art budget and approval.

## 5. DECIDE (for Jay). D1 decided; D2–D6 go with the recommendations below
- **D1. Which mood? DECIDED by Jay: A (warm dojo wood and paper)** for the beta. (I had recommended B.) A costs a bit more art change because it moves away from today's dark colours; the A1/A8 placeholders in P-MENU2-a cover that. B/C are a possible post-beta selectable style (proposal above).
- **D2. A loadout with 2 picks only (Stance + Virtue)?** I recommend **yes**. Strikes and Seals stay always-on. More slots would mean new combat rules and balance work.
- **D3. Wording for locked items:** "Learn this at the dojo" plus "Ask Sensei about this one" in the sheet? I recommend **yes**. No locks, no counts.
- **D4. Tap-to-equip first, drag as a bonus?** I recommend **yes**. Drag is hard for small hands, and tap always works.
- **D5. A 🔊 read-aloud button on the detail sheets?** I recommend **yes, after the beta** (it uses the existing read-aloud).
- **D6. Show numbers in the Fighting Style preview?** I recommend **no** (plain words), with numbers only behind a "Details" link in the sheet.
