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

## Jay's answers (Oct 26)

Relayed by the Manager (t513u).

1. **Shadow:** "Not crazy dark but most of these kids have read the bible. Keep things age appropriate but also still appealing to ages 12-14."
2. **Faith layer:** "It can be as clear as you want it to be but it can also have under-tones or a message that has to be interpreted."
3. **Sign wording vs KJV:** not answered. **PLACEHOLDER - awaiting Jay:** the faith layer uses KJV. The school's sign wording (`docs/faith-and-creed.md`) is noted as the alternative.
4. **Lightbearer and the dojo:** "Yours to decide." See writer decision W1.
5. **When the ending is guessable:** "Yours to decide." See writer decision W2.
6. **Town vs smaller sign:** still open. The Manager is re-asking Jay in plain words.
7. **Black belt form:** "a whole separate thing to cover. Let's worry about building up to black belt." Black belt and summit work is **out of scope** for now.
8. **Place names:** not answered. **PLACEHOLDER - awaiting Jay:** keep the proposed names (Lantern Halls, Ember Kitchens, Giant's Steps and so on).

### Writer decisions (Jay: "Yours to decide")

- **W1. Sensei once knew the Lost Lightbearer.** They trained together long ago, before the storm night. Sensei doesn't say so early on, only small hints (a quiet pause, an old lantern in the dojo). It is revealed late, after Brown, as a hopeful moment: Sensei never stopped hoping they would come home. No blame, no guilt, and no real names.
- **W2. Attentive older players can guess the ending around Brown.** Clues through Green add new facts without giving away the "who". From Brown, the clues line up for a careful 12-14 reader, while a 6-year-old still enjoys the surprise. The reveal is still at the top of the climb.

## Proposed fixes (board items, final)

Status key: **Unblocked** = can start now. **Waiting** = needs Jay or the Manager first. **Out of scope** = not for now.

| ID | Item | Owner | Status | Done when |
|---|---|---|---|---|
| **C-STORY-a** | Fix Chapter 1's John 1:5 line: plain story line in the main text, the exact KJV verse in the faith layer (KJV is a placeholder until Jay answers on sign wording). | Content Writer | Unblocked | `story/chapter-1.json` screen 15 has no paraphrased verse; the KJV John 1:5 line lives only in `drafts/content/faith/`; the faith checker passes; Jay approves. |
| **C-STORY-b** | Spread the mystery out: each tier adds one *new* fact. Following W2, the "who" can be guessed around Brown, not before. | Content Writer | Unblocked | `lore/00-index.md` clue table rewritten as a draft; no two clues repeat a fact; the "who" isn't guessable before Brown; Jay approves. |
| **C-STORY-c** | Give the shadow a stronger presence for older kids: still not a person, freed or overcome at the end, never evil forever. Add Bible-echo undertones teens can pick up on (for example darkness that can't overcome light, a storm that's stilled, fear that loses to love), kept age-appropriate and "not crazy dark". One deeper line per tier in the Relics or Bestiary. | Content Writer | Unblocked | One "older reader" line per tier (White to Brown) in the drafts, marked as Bestiary or Relic text; any echoed verse is KJV with a reference in `drafts/content/faith/`; no gore or terror; Jay approves the tone. |
| **C-STORY-d** | Make every Guardian feel different: each gets its own small want and a different way of being freed. | Content Writer | Unblocked | All 10 `drafts/content/bosses/*.json` "when freed" beats are different in kind; reviewed against the lore pages. |
| **C-STORY-e** | Write a short Gate scene (3–4 screens) for each tier up to Brown, each saying one visible thing that changes. The Black/summit scene is out of scope for now. | Content Writer, then Programmer to wire | Unblocked (visible change waits on C-STORY-f) | Gate scene drafts for each tier through Brown in `drafts/content/story/`; each names one change the game can show; Jay approves. |
| **C-STORY-f** | Show the "world gets brighter" payoff. A real town is a **post-launch proposal** unless Jay says otherwise. | Manager to decide (with Jay), Programmer to build | Waiting on Jay (town vs smaller sign) | Jay answers the plain-words question; the pick is recorded in decisions.md; the core-design town line matches it. |
| **C-STORY-g** | Deeper Bestiary entries (a kid line plus an older-reader line unlocked by belt) for Tier 1–3 enemies first; older lines may carry faith undertones. | Content Writer | Unblocked | Bestiary text in drafts for every Tier 1–3 enemy; no invented technique; reading level checked. |
| **C-STORY-h** | Tie the dojo characters to the Tower story following W1: small Sensei hints early, the reveal after Brown. No new systems. | Content Writer | Unblocked | Hint lines drafted in `dialogue/` for at least 3 tiers plus one late reveal scene draft; no real names; hopeful, no guilt; Jay approves. |
| **C-STORY-i** | Let freed Guardians show up again in a small way (cheering line or cameo in Relic text). Dojo visits are a **post-launch proposal**. | Content Writer | Unblocked | Each tier from 2 up has one text nod to an earlier Guardian; no new code needed. |
| **C-STORY-j** | Clear up the "ten pieces" count and name the summit piece. | Content Writer | **Out of scope** (Black belt deferred by Jay) | Revisit when Black belt work starts. |
| **C-STORY-k** | Get the story into the game: plan which drafts go first (Chapter 1, White Relics, the Lamp Keeper's freed line). | Manager to plan, Programmer to build | Unblocked (after C-STORY-a) | A board item exists for wiring Chapter 1, with the Jay approvals listed. |
| **C-STORY-l** | A light personal arc: Sensei's reflections across the belts follow one thread, from "you only have to begin" to "look how far you have come". Through Brown for now. | Content Writer | Unblocked | One Sensei reflection per Gate through Brown forms a readable path in the drafts; no lectures; Jay approves. |

## Still open for Jay

- **Town vs smaller sign** (plain words for Jay): "When kids earn a belt, should they see a whole town light up, or is it enough for now that something small gets brighter, like the dojo window?"
- **PLACEHOLDER - awaiting Jay:** place names (proposed names kept).
- **PLACEHOLDER - awaiting Jay:** promotion verses use KJV; the school's sign wording is the alternative.
