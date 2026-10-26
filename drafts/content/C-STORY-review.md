# C-STORY Review: Is the Dojo Ascent story working?

Written by the Content Writer for Jay (task t482u, Oct 26 2026). This is a review only. No shipped or drafted text was changed.

**What I read:** `docs/core-design.md` (section 13 wins), `docs/framework.md`, `docs/decisions.md`, `docs/progress.md`, `docs/faith-and-creed.md`, everything in `drafts/content/` (story, lore, bosses, enemies, guardian form shifts, faith overlay, bestiary, rooms, quests, dialogue, katas), `content/`, and the game code's on-screen text (read only).

## The story in one breath (as it stands)

God gave the town a great light at the top of the Tower. A storm broke it into pieces, and shadow crept in. Each belt tier has a Guardian holding one piece, confused by the shadow. Beat the Guardian to free it; earn the real belt to bring the piece home. At the top, you find the brave student who tried to save the light, and you finish the job together. No one is to blame. (`drafts/content/lore/00-index.md`, `docs/core-design.md` section 1 "The story that ties it together")

---

## What's strong

1. **Real training drives the story.** The light only comes back when a real belt opens the Gate, not when you beat a boss (`drafts/content/lore/00-index.md` "Rules this lore keeps"; `story/chapter-1.json` screen 14). That's rare and it's the heart of the game.
2. **Nobody is evil.** Every Guardian is a Tower helper the shadow confused, and beating it frees it (`lore/00-index.md`). That's great for a 6-year-old and leaves no fear or guilt.
3. **The ending is kind and surprising.** You win by bringing someone home, not by destroying them, and it matches the school motto "More Than a Conqueror" (Romans 8:37) (`lore/10-black.md`; `lore/00-index.md` "Faith thread"; `docs/faith-and-creed.md` section 1).
4. **Each Guardian teaches one feeling.** Fear is "only stones and worry" (Stone Giant, `lore/04-green.md`), shields are for helping (Ember Knight, `lore/06-red.md`), choosing your own words over the echoes (Echo Mask, `lore/07-red-black.md`). Each is easy for kids to take home.
5. **A mystery that grows with your belts.** One clue per tier, three Relics each, with the full answer at black belt (`lore/00-index.md` table). That's a built-in reason to keep climbing for years.
6. **The faith layer is gentle and swappable.** Each Guardian has an accurate KJV verse revealed through discovery (`drafts/content/faith/guardian-faith-overlay.json`, checked by `tools/check-faith-overlay.py`), and the Guardian form shifts give each fight a visible "turning back to good" moment (`enemies/guardian-form-shifts.md`).
7. **Short and easy to read.** One sentence per screen, read aloud for young readers (`story/chapter-1.json` notes; `docs/core-design.md` section 13 "Street Smarts format").

## What's weak

### 1. Players can't see the story yet
None of the story is in the game. The game code has no chapter, lore or Relic text. The only story hook is the Orange floor's Guardian fight (`apps/client/src/scenes/GameScene.ts:1706`). `story/chapter-1.json` and `lore/*.md` are still drafts. Today a child just sees fights, the dojo, and loot.

### 2. Stakes: the town is promised but missing
The design says each returned piece makes "the town brighter, new shops and characters return" (`docs/core-design.md` section 1). But there's no town in the game or in the content data. The Home Dojo is the only home place (`docs/decisions.md`, "The Home Dojo is now a room you walk around in"). Without something to see, "bring the light home" is just words. Kids need to *see* what they're saving.

### 3. Villain and mystery: soft, and guessed too early
- **No face for the danger.** The shadow is "many little fears, all stacked together" (`lore/04-green.md` clue). That's lovely for young kids, but teens have nothing to push against.
- **The answer comes out too soon.** By Orange (tier 3) we already know "one student left supper and ran up the Tower to help" (`lore/03-orange.md`). Tiers 5 to 9 then keep repeating "the traveler held on" (`lore/05-blue.md` through `09-brown-black.md`). A teen will guess the ending around Green, and the middle belts, which take the longest in real life, add very little that's new.
- **A small number mix-up.** The story says the light broke into **ten** pieces (`lore/00-index.md`), but there are 9 Guardians plus the summit, where the traveler holds the last piece (`lore/10-black.md`). It works, but we should say it on purpose.

### 4. Character arcs: everyone has the same arc
- **The Guardians all follow one pattern:** confused, beaten, freed, says thank you (`lore/01-white.md` through `09-brown-black.md`). Ten in a row starts to feel like a template.
- **Freed Guardians never come back,** so making friends with them has no lasting payoff.
- **The player doesn't really change.** Sensei praises skills ("Watch, wait, then answer"), but the hero has no growing story of their own.
- **The dojo characters (Sensei, Senpai, Kohai) never meet the Tower story.** They live only in the dojo dialogue (`drafts/content/dialogue/milestone-6.json`). The Lost Lightbearer is "a student of this very Tower" (`lore/08-brown.md`), yet no one in the dojo seems to know them.

### 5. Pacing: long gaps between payoffs
- **Gates come months apart in real life** (`docs/core-design.md` section 9). Between them, the only story beats are the Guardian fight and 3 Relics per tier (`lore/00-index.md`).
- **Beating a Guardian gives "a spark and a trophy"** while the real reward waits for the belt (`lore/00-index.md`). That's right, but the fight still needs to *feel* like a story win.
- **Deeper Bestiary lore unlocks with each real belt,** and that's launch scope (`docs/decisions.md`, "The Bestiary is launch scope"), but few entries are written yet. Most enemy files have names and stats only (`drafts/content/enemies/*.json`).

### 6. Payoff per gate: the same every time
Every Gate plays the same beat: "the Gate opens, and the piece of light rises" (`story/chapter-1.json` screens 14–16). Only White has a full scene. The other nine tiers have no Gate scene, and no tier says what changes in the world.

### 7. Faith wording: two small problems
- **Chapter 1 doesn't quote the verse.** `story/chapter-1.json` screen 15 says "The light of Yeshua shines in the darkness, and the darkness cannot put it out." That's a paraphrase of John 1:5, not KJV. The faith overlay uses the true KJV: "And the light shineth in darkness; and the darkness comprehended it not." (`faith/guardian-faith-overlay.json`). Chapter 1 also puts faith in the main story text, not the swappable layer.
- **The school's verses aren't KJV.** The promotion verses come word for word from the school's signs, which don't always match the KJV (for example Romans 3:23, "falled short", `docs/faith-and-creed.md` section 3). That file says never to reword them, while our rule is accurate KJV. Jay needs to pick which wins where.

### 8. Gaps in the data
- **No Black belt form is named** (`lore/10-black.md`; `lore/00-index.md` table).
- **The place names are proposals.** Every place name except "Sunrise Garden" is still a proposal (`lore/00-index.md` PROPOSALS 1).

## Does it work for a 6-year-old and a teenager?

**For a 6-year-old: yes, mostly.** Bright helpers, a broken light, a kind Sensei, no one is bad. The words are short, and they're read aloud. The one gap: they need to *see* things change (weak point 2).

**For a teenager: not yet.** A Pokémon-style layer needs a simple surface ("catch them all" / "free every Guardian") plus deeper secrets for those who dig. We have the surface. The deeper layer (Bestiary lore, Relic clues, a real mystery) is thin and gives itself away (weak points 3 and 5). The good news: the setup already has the right slots (Relics, Bestiary entries unlocked by belt, form shifts). They just need deeper writing, not new systems.

---

## Proposed fixes (board items)

Owner is the Content Writer unless marked. Nothing here adds launch scope. Bigger ideas are marked **post-launch proposal**.

| ID | Goal | Owner | Done when |
| --- | --- | --- | --- |
| **C-STORY-a** | Fix Chapter 1's John 1:5 line: plain story line in the main text, the exact KJV verse in the faith layer. | Content Writer | `story/chapter-1.json` screen 15 has no paraphrased verse; the KJV John 1:5 line lives only in `drafts/content/faith/`; the faith checker passes; Jay approves. |
| **C-STORY-b** | Spread the mystery out so the ending can't be guessed by Green. Each tier adds one *new* fact, not "the traveler held on" again. | Content Writer | `lore/00-index.md` clue table rewritten as a draft; no two clues repeat a fact; the "who" isn't clear before Brown; Jay approves. |
| **C-STORY-c** | Give the shadow a clearer shape for older kids (still made of fears, not a person, never evil forever), with one deeper line per tier in the Relics or Bestiary. | Content Writer, after Jay's Q1 | One "older reader" line per tier in the drafts, marked as Bestiary or Relic text; Jay approves the tone. |
| **C-STORY-d** | Make every Guardian feel different: each gets its own small want and a different way of being freed (not just thank you). | Content Writer | All 10 `drafts/content/bosses/*.json` "when freed" beats are different in kind; reviewed against the lore pages. |
| **C-STORY-e** | Write a short Gate scene (3–4 screens) for each tier, each saying one visible thing that changes. | Content Writer, then Programmer to wire | 9 Gate scene drafts in `drafts/content/story/`; each names one change the game can show with what already exists (dojo or Tower look); Jay approves. |
| **C-STORY-f** | Show the "world gets brighter" payoff using what we already have (for example a window in the Home Dojo or the Tower art by tier, `docs/decisions.md` "Tower art by belt tier"). A real town is a **post-launch proposal**. | Manager to decide, Programmer to build | The Manager picks one in-scope option; the core-design town line is marked post-launch or matched to the pick in decisions.md. |
| **C-STORY-g** | Write deeper Bestiary entries (a kid line plus an older-reader line unlocked by belt) for the Tier 1–3 enemies first. | Content Writer | Bestiary text in drafts for every Tier 1–3 enemy; no invented technique; reading level checked. |
| **C-STORY-h** | Tie the dojo characters to the Tower story with one or two lines (for example, Sensei remembers the storm night) and no new systems. | Content Writer, after Jay's Q4 | Lines drafted in `dialogue/` and the lore pages; no real names; Jay approves. |
| **C-STORY-i** | Let freed Guardians show up again in a small way (for example, a cheering line or a cameo in a later tier's Relic text). Visiting Guardians in the dojo is a **post-launch proposal**. | Content Writer | Each tier from 2 up has one text nod to an earlier Guardian; no new code needed. |
| **C-STORY-j** | Clear up the "ten pieces" count and name what the summit piece is. | Content Writer | `lore/00-index.md` and `lore/10-black.md` agree on the count, written on purpose. |
| **C-STORY-k** | Get the story into the game: plan which drafts go first (Chapter 1, White Relics, the Lamp Keeper's freed line). | Manager to plan, Programmer to build | A board item exists for wiring Chapter 1, with the Jay approvals listed. |
| **C-STORY-l** | Give the player a light personal arc: Sensei's reflections across the belts follow one thread (from "you only have to begin" to "look how far you have come"). | Content Writer | One Sensei reflection per Gate forms a readable path in the drafts; no lectures; Jay approves. |

## Questions for Jay (your call on tone)

1. **How dark can the shadow be?** Should it stay "many little fears" with no face, or can older kids meet a stronger presence (still not a person, still freed in the end)?
2. **How clear should the faith layer be?** Should verses only appear in the faith layer (Relics, Sensei after a fight), or can the main story say "Yeshua" and "God" out loud like Chapter 1 does now?
3. **Which verse wording wins?** For the school's promotion verses, should the game use the exact sign wording (`docs/faith-and-creed.md`) or the KJV?
4. **Who is the Lost Lightbearer to the dojo?** Should Sensei or Senpai have known them, or should it stay a stranger the player discovers alone?
5. **When should older players be able to guess the ending?** Around Brown, or should it stay hidden until the summit?
6. **Is a real town in the plan?** Is a visible town a must for launch, or is a smaller "brighter" sign (like a dojo window) enough until later?
7. **What's the Black belt form?** What's its name, so the summit page can use it?
8. **Do you approve the place names?** Do the proposed names (Lantern Halls, Ember Kitchens, Giant's Steps and so on) work, or do you want different ones?
