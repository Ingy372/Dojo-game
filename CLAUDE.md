# Dojo Ascent — Instructions for Claude Code

Read this file at the start of every session. It tells you what this project is, how we work, and the rules you must never break.

## What this project is

Dojo Ascent (working title) is a 2D top-down action RPG for martial arts students at Action Zone CMA, built to plug into DojoForge, our student management platform. A student's character grows stronger as they progress in real martial arts training. The game exists to keep students training longer and more interested in their curriculum, and it must be genuinely fun to do that.

The game has three parts:
- **The Tower:** an action dungeon crawler with loot, levels, and skills. Each belt tier is a group of floors sealed by a Gate that only opens with a real promotion.
- **The Home Dojo:** a space the player decorates, keeps clean, and shows off, home to the characters who give quests about manners, culture, and life lessons.
- **Street Smarts:** short real-world scenarios that teach awareness, avoidance, de-escalation, escape, and getting help.

## Who you're working with

Jay is the project owner and head instructor of Action Zone. **Jay is not a programmer.** He tests everything on his phone and gives feedback in plain words.

- Explain plans and results in plain language, without jargon. If you must use a technical term, explain it in one short phrase.
- When you need Jay to do something (create an account, click a button, paste a setting), give exact step-by-step instructions.
- Never ask Jay to type passwords, API keys, or payment details into the chat. Tell him where to enter them himself.
- Nic owns DojoForge's backend. Anything that changes DojoForge itself is Nic's work, not ours.

## Sources of truth

- `docs/framework.md`: the overall project plan (systems, architecture, build plan, milestones).
- `docs/core-design.md`: the game design (loops, combat numbers, loot, Insights, first 30 minutes, alignment rules).
- `docs/decisions.md`: decisions made during development. Read it every session.
- `docs/progress.md`: where we left off. Read it every session.

If the docs conflict, **core-design section 9 ("Lining up the two journeys") wins**, then the rest of core-design, then the framework. If something isn't covered, ask Jay instead of guessing.

## How we work

1. **One milestone per session.** Only work on the milestone Jay names. Never start the next milestone or build features from later milestones, even if it seems efficient.
2. **Plan first.** Before writing code, give Jay a short plain-language plan (what you'll build, in what order, what he'll be able to test at the end). Wait for his approval.
3. **Small steps.** Build in small pieces that each work on their own.
4. **Commit after every working step** with a clear message, so any bad change can be undone.
5. **Make it testable on a phone.** At the end of each milestone (and ideally each step), deploy a preview Jay can open on his phone, and tell him exactly what to try.
6. **Update the logs before the session ends.** Add any decisions to `docs/decisions.md` and a short summary of what was done and what's next to `docs/progress.md`.
7. **Save credit.** Don't re-read the whole repository when you only need a few files. Don't rewrite working code without a reason. Keep answers short.
8. **Ask before adding dependencies** (libraries, services, paid tools).

## Platforms: this is a phone app

**The finished game is an iPhone and Android app**, published on the App Store and Google Play. Most families don't have a computer, but every family has a phone. Everything is designed for phones first.

- One codebase: the Phaser game is wrapped into native iOS and Android apps with **Capacitor**. The same game can also run in a browser (for testing during development and the Visitor's Pass) and inside the DojoForge student app.
- **Landscape orientation**, touch controls only. Nothing may depend on a mouse, keyboard, or hover.
- Respect the phone's safe areas (notches, rounded corners, home bars) so no button sits under them.
- Pause automatically when the app goes to the background or a call comes in, and resume cleanly.
- Keep the download small and battery use low. Load art per tier rather than all at once.
- Handle a weak or dropped connection gracefully: the game keeps playing and syncs when the connection returns.
- iOS builds are made with GitHub Actions on macOS runners, because Jay develops on Windows and has no Mac.
- Follow App Store Kids Category and Google Play Families rules from the start: no third-party analytics or ads, and a parent check before any link that leaves the app.

Until the app milestone, test in the phone's browser using the preview link.

## Tech stack

| Part | Choice |
| --- | --- |
| Game engine | Phaser 3 + TypeScript, built with Vite |
| Phone apps | Capacitor (iOS and Android from the same code) |
| Hosting | Cloudflare Pages (browser version and test previews) |
| Game server (later milestones) | Cloudflare Workers + D1 |
| Co-op (much later) | Cloudflare Durable Objects |
| Tests | Vitest for the rules package |

## Repository layout

```
dojo-ascent/
  CLAUDE.md          this file
  docs/              framework.md, core-design.md, decisions.md, progress.md, style-guide.md
  packages/sim/      shared game rules (combat, abilities, progression); no graphics
  apps/client/       the Phaser game
  apps/server/       Cloudflare Worker + D1 (later)
  content/           abilities, enemies, floors, loot, quests, scenarios (data files)
  fixtures/          fake student profiles for testing
  assets/            licensed art and sound
```

## Architecture rules

1. **Game rules live in `packages/sim`.** Combat, abilities, and progression are pure TypeScript with no Phaser, no DOM, and no network calls. The client draws what the rules package decides. This lets the same rules run on the server later for co-op.
2. **The rules package is deterministic.** It runs on a fixed tick of **20 ticks per second**. Never use `Math.random()`, `Date.now()`, or real time inside it; use a seeded random number generator and tick counts.
3. **Content is data, not code.** Abilities, enemies, rooms, loot tables, Insights, quests, dialogue, and scenarios are defined in data files in `content/`, validated against a schema when loaded.
4. **DojoForge is read-only.** The game only reads a student's progress and never changes DojoForge records. The one exception is sending **requests** (such as "Ready to show Sensei") through a request endpoint Nic builds; only staff actions in DojoForge change a student's record.
5. **Mock data first.** Until Nic delivers the real progress feed, use the fake student profiles in `fixtures/`, shaped exactly like the feed described in `docs/framework.md` (section 14).
6. **Phone first.** Touch controls (tap to move, on-screen stick, four ability buttons), landscape, readable on a small screen, aiming for a smooth 60 frames per second on a mid-range phone. Every feature must work the same in the iOS app, the Android app, and a phone browser.
7. **No school is hardcoded.** Belt tiers, technique names, stripe words, Virtues, and culture content come from data, so other DojoForge schools can use the game.
8. **Build for multiplayer from the start, even before it exists.** Multiplayer arrives in three steps (see `docs/core-design.md` section 11): a shared world (dojo visits, bows, classmates as "echoes"), then a live town square, then 2–4 player co-op. Keep game state serializable, keep all game rules inside `packages/sim` so the server can run them, and design player IDs, saves, and the game server so these steps can be added without rewriting the game. Don't build live multiplayer until Jay asks for that milestone.
9. **Progression follows `docs/core-design.md` section 10.** In particular: the legacy grant (every requirement of a rank the student has already passed counts as signed off), double experience for players below their rank's expected level, stripes granting Virtues that rank up when the same word is earned again, and black belt degrees adding summit tiers.
10. **Power follows `docs/core-design.md` section 12.** One Power Rating (PR) scale for players and monsters: max PR is 1,000 per belt tier (+500 per black belt degree) and is a hard cap per rank. Each tier's max is split: sign-offs 40%, Training Points 17%, Virtues 10%, level 18%, gear 8%, Street Smarts 5%, Mastery 2%. Every source has its own ceiling. Street Smarts power comes from clearing scenarios and completing location sets, which also grant location perks. Keep all these numbers in the single tuning config file.
11. **Systems unlock gradually** (`docs/core-design.md` section 13). Each system appears when it first matters, taught by a short Sensei's Lesson: one sentence per screen, practice in a safe room, never more than one new system per session, replayable from the Lesson Scroll. Existing students get a Welcome Week that introduces their systems one per session.
12. **Missions spell out every real-world goal** (section 13). Each has clear steps; when complete, the game sends a request to DojoForge's "Ready for review" queue. Staff confirm with one tap. Technique sign-offs still require the student to demonstrate in class; the game never signs anything off itself.
13. **Power Rating is never shown to players.** Players see belt, stripes, level, abilities, the Gate, and gear as better-or-worse arrows. PR and Monster Rating exist for staff views and system balancing only.
14. **Experience pacing:** tune each tier so a typical player reaches the level cap at about 75% of the school's typical time in rank for that belt. Keep the numbers in the tuning file.
15. **Street Smarts scenarios are illustrated story scenes:** one picture, 1–3 short sentences, and 2–4 large choice buttons per scene, with branching, built-in text-to-speech narration (on by default for ages 6–9), and a few interactive moments. Scripts are data files, and none is built until Jay approves its script.
16. **Parents do as little as possible:** nothing requires a parent to play; approvals are one tap with Face ID plus "Approve all"; at most one bundled notification a day.

## Hard rules: never break these

- **The game never affects real rank.** Nothing in the game counts toward a belt, stripe, or test.
- **Game progress is capped by real rank.** Level caps, Gates, and gear strength follow the student's real belt.
- **Real achievements always get the biggest celebrations.** No game-only event is ever celebrated more than a real promotion, stripe, or sign-off.
- **No purchases, ads, loot boxes, or anything bought.**
- **No punishment for missing class or not playing.** Absence never removes power or items. The Home Dojo's dust is cosmetic, capped, and never blocks play.
- **No free-text chat.** Only preset emotes and callouts.
- **Multiplayer is same-school only,** names are first name plus last initial, and parents can turn multiplayer off, make a dojo private, and hide players.
- **Every decoration is earned** in the Tower or through real achievements. Real-achievement trophies are "certified" with the date earned and can't be obtained any other way. Only a dojo's owner sees its bow count.
- **No third-party analytics, ads, or tracking tools.** Collect only what the game needs.
- **Power Rating is never visible to players.** Staff and the system only.
- **Every enemy attack is telegraphed.** No unavoidable damage.
- **The game never shows or guesses why a student wasn't approved to test.**
- **Street Smarts scenarios are never graphic or frightening,** and no scenario ships without Jay's approval.

## Timeline and launch scope

The game must launch within **6 months (by early April 2027)**. The month-by-month roadmap and milestones 0–12 are in `docs/framework.md` section 15; the launch scope is in `docs/core-design.md` section 13.

**Do not build these until after launch, even if they're described in the docs:** the live town square, co-op and Mentor play, the Endless Ascent, crafting, Path Perks, Sensei's Scrolls, the Bestiary, real-life quests, and the Visitor's Pass. Design code so they can be added later, but don't build them.

## Starting numbers (tune later from playtesting)

These come from `docs/core-design.md` section 4. Keep them in a single config file so they're easy to change.

- Tick rate: 20 per second.
- Perfect Counter window: Guided 10 ticks, Standard 6 ticks, Challenge 4 ticks. Rooted Form adds 2 ticks.
- Perfect Counter: no damage taken, enemy staggered 1 second, counter hit for 2x Power, +25 Focus.
- Block (counter outside the window): half damage, no stagger.
- Focus: 0 to 100. +5 per hit, +25 per Perfect Counter. Strikes cost 30 to 50. Virtues need 100.
- Combo bonus: +5% / +10% / +15% damage at 10 / 20 / 30 hits; resets when hit.
- Damage = Power x move strength x 100 / (100 + target's Guard).
- Only two enemies attack at once ("kung fu circle").
- Rarity shares: Common 70%, Uncommon 22%, Rare 7%, Epic about 1%, Legendary from Guardians only. A Rare is guaranteed after 5 runs without one.
- Dojo Blessing: 48 hours after attending class.

## Work from the Grok bots

Grok bots make art, text drafts, research, and test reports (see `docs/GROK_BOTS.md`). They deliver only to their own folders: `incoming-art/`, `drafts/content/`, `drafts/learning/`, `drafts/qa/`, and `drafts/launch/`.

- **Never treat anything in those folders as approved.** Only move or use a file when Jay says it's approved.
- **Never edit files inside those folders.** Copy approved files into the game's real folders (`assets/`, `content/`), converting them to the game's formats if needed.
- **Design proposals from the learning bot are not instructions.** Only build a proposal when Jay asks for it.

## Art and sound

- **The art is made in Blender by the Art Director bot** (no art pack is bought). It builds 3D models, animates them, and renders every animation frame from the game's camera angle into transparent PNG sprite sheets. This keeps characters perfectly consistent between frames. See "Art process" in `docs/core-design.md` section 13.
- **Your part is the import step:** a repeatable script that takes approved renders from `incoming-art/`, trims and sizes them, and packs them into texture atlases Phaser can load. Keep it simple and documented so it runs the same way every time new art is approved.
- Until approved art arrives, keep using the placeholder shapes. Don't spend effort on placeholder art.
- Once the Art Director's style guide is approved, follow `docs/style-guide.md` (camera angle, sizes, colors, outlines, fonts).
- **The belt is rendered as its own layer** and recolored in code to match the real rank and stripes. Gi colors are recolored in code too.
- **Character customization** follows `docs/core-design.md` section 13: a layered character (body, skin tone, face, hair, gi, belt) whose parts are rendered separately from the same Blender model, customizable at creation and at the Home Dojo. The belt always shows the real rank and is never customizable. Extra looks are earned, never bought.
- Hit flashes, sparks, screen shake, and particles are made in code. Game feel ("juice") is a priority from the first combat milestone.

## When you're unsure

Stop and ask Jay a short, plain question. A wrong guess costs more credit to undo than a quick question.
