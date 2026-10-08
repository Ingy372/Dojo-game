# Dojo Ascent — Prompts for Claude Code

Copy and paste these into Claude Code, one milestone at a time. Start each milestone in a **fresh session**, so Claude Code begins clean and doesn't waste credit on old conversation.

---

## The plan at a glance

12 milestones over 6 months, launching by early April 2027:

| Month | Milestones |
| --- | --- |
| 1: Oct 6 – Nov 4 (cloud credit) | 0–4 |
| 2: November | 5–7 |
| 3: December | 8 |
| 4: January | 9 |
| 5: February | 10–11 |
| 6: March | 12 (launch) |

---

## Before you start (one time)

1. **Create a new GitHub repository** named `dojo-ascent` (private).
2. **Download both design docs as Markdown** from their doc pages:
   - Dojo Ascent — Game Design Framework, saved as `framework.md`
   - Dojo Ascent — Core Game Design, saved as `core-design.md`
3. **Add these files to the repository:**
   - `CLAUDE.md` in the main folder
   - `framework.md` and `core-design.md` inside a folder named `docs`
   - this file (`MILESTONE_PROMPTS.md`) inside `docs` too, so it's always handy
4. **Connect Claude Code to the repository.** Setup guide: https://docs.claude.com/en/docs/claude-code/overview
5. **Have a Cloudflare account ready** (free). Claude Code will walk you through connecting it in milestone 0. Never paste passwords or keys into the chat; enter them yourself where it tells you.
6. **Before milestone 8 (not needed yet),** you'll need developer accounts to publish the apps: an **Apple Developer Program** membership (about $99 a year) and a **Google Play Console** account (about $25, one time). Check the current prices when you sign up. If Tarnished Labs already has these for DojoForge, use those.

---

## How every session works

1. Paste the milestone prompt.
2. Read the plan Claude Code gives you. If it makes sense, reply **"Approved, go ahead."** If not, say what's wrong in plain words.
3. Test what it builds on your phone using the preview link.
4. When the milestone's **"Done when"** check passes, paste the **end-of-session prompt** (at the bottom of this file).
5. Check how much credit you've used before starting the next milestone.

---

## Milestone 0 — Setup

```
Read CLAUDE.md and everything in the docs folder.

We're starting milestone 0: Setup. Please:
- Set up the repository layout described in CLAUDE.md.
- Create a blank Phaser 3 + TypeScript game with Vite in apps/client that shows a title screen saying "Dojo Ascent", in landscape, filling the phone screen and respecting safe areas.
- Set it up so it can be wrapped as iOS and Android apps with Capacitor later (see "Platforms" in CLAUDE.md), but don't build the apps yet.
- Create an empty packages/sim with a working test setup (Vitest) and one passing test.
- Create docs/decisions.md and docs/progress.md.
- Walk me step by step through connecting Cloudflare Pages so every change I approve gets a link I can open on my phone.

Show me your plan in plain language first and wait for my approval.
```

**Done when:** you open the link on your phone and see the "Dojo Ascent" title screen.

---

## Milestone 1 — Movement

```
Read CLAUDE.md, docs/progress.md, and docs/decisions.md.

We're doing milestone 1: Movement. Build one room where my character can move by tapping where to go, or with an on-screen stick. Add walls the character can't walk through. Use simple placeholder shapes for now.

Put movement rules in packages/sim using the 20-ticks-per-second rule in CLAUDE.md, and have the Phaser client only draw what the rules decide.

Show me your plan first and wait for my approval.
```

**Done when:** moving around feels smooth and natural on your phone, with both tap-to-move and the stick.

---

## Milestone 2 — Combat core

This is the most important milestone. Take your time testing it.

```
Read CLAUDE.md, docs/progress.md, docs/decisions.md, and section 4 of docs/core-design.md.

We're doing milestone 2: Combat core. Build:
- One brute enemy that telegraphs its attacks clearly before striking.
- Automatic basic attacks against the nearest enemy.
- A Strike button and a Counter button.
- The Perfect Counter, Block, and Hit results with the starting numbers in CLAUDE.md.
- Health, Focus, the combo counter, and defeat (return to the start of the room).
- Strong game feel: hit flashes, a short pause on impact, small screen shake, and clear sounds (simple generated sounds are fine).

Keep all combat rules in packages/sim with tests, and all numbers in one config file.

Show me your plan first and wait for my approval.
```

**Done when:** landing a Perfect Counter feels satisfying, and a student can play for two minutes without help.

**Good feedback to give:** "The counter window feels too short / too long," "I can't tell when he's about to attack," "Hits don't feel strong enough."

---

## Before milestone 3 — Choose the art

Bring this back to your regular Claude chat: "Help me choose a pixel-art asset pack for Dojo Ascent." Once you've bought one, add it to the `assets` folder and ask Claude Code:

```
Read CLAUDE.md. I've added the art pack to the assets folder. Please write docs/style-guide.md (sprite size, palette, fonts) based on it, then swap the placeholder shapes in the movement room and combat for the real art. Show me your plan first.
```

---

## Milestone 3 — A full floor

```
Read CLAUDE.md, docs/progress.md, docs/decisions.md, and sections 3, 5, and 6 of docs/core-design.md.

We're doing milestone 3: A full floor. Build:
- A floor of 5 to 8 rooms with door choices (battle, treasure, challenge, rest shrine).
- Three enemy types: swarmer, brute, and shield, with only two attacking at once.
- Insight choices after battle rooms (pick 1 of 3), starting with about 9 Insights.
- Room grades (S, A, B).
- A floor boss.
- Loot drops with the rarity shares in CLAUDE.md and bad-luck protection.
- A simple Home Dojo screen to return to, with a run summary showing items found and personal bests.

Put rooms, enemies, Insights, and loot tables in content/ as data files.

Show me your plan first and wait for my approval.
```

**Done when:** a full run takes 10 to 15 minutes and feels complete from start to finish.

---

## Milestone 4 — Training link (fake data)

Talk to Nic before this one so the fake data matches what DojoForge will really send.

```
Read CLAUDE.md, docs/progress.md, docs/decisions.md, sections 3, 5, and 6 of docs/framework.md, and section 9 of docs/core-design.md.

We're doing milestone 4: Training link with fake data. Build:
- Three fake student profiles in fixtures/, shaped like the progress feed in section 14 of docs/framework.md: a brand-new white belt, a white belt with 3 sign-offs and a stripe, and a yellow belt.
- A way for me to switch between the fake profiles while testing.
- Abilities that unlock from the profile: Forms from kata, Strikes from kick combos, Technique Seals from self-defense, Virtues from stripes.
- The character's belt color matching the profile.
- The level cap for the belt tier.
- The Gate, with one lock per requirement, a time-in-rank sundial, and Sensei's Seal, all lit from the profile.
- The Dojo Blessing.
- Reward moments when new progress appears ("Sensei Jay signed off Self-Defense #3!").
- The promotion ceremony when the profile's belt goes up.
- The Path card showing the next real step.
- The Power Rating calculation from section 12 of docs/core-design.md. Players must never see it; add a hidden testing screen so I can check the numbers.

Show me your plan first and wait for my approval.
```

**Done when:** switching the fake profile from white belt to yellow belt visibly changes the character, plays the ceremony, and opens the Gate.

---

## Milestone 5 — Home Dojo basics

```
Read CLAUDE.md, docs/progress.md, docs/decisions.md, and section 7 of docs/framework.md.

We're doing milestone 5: Home Dojo basics. Build:
- A small room the player can decorate by placing and moving about ten decorations.
- Dust and mess that slowly build while the player is away, capped at about a week, never damaging anything.
- A quick, satisfying cleaning routine (sweep, wipe mats, straighten the weapon rack), and the Calm Mind bonus for a clean dojo.
- The bow when entering the Home Dojo and each Tower floor.
- A warm welcome-back message.

For testing, give me a way to fast-forward time so I can see mess build up.

Show me your plan first and wait for my approval.
```

**Done when:** a student decorates and cleans their dojo without help.

---

## Milestone 6 — Story and Street Smarts sample

```
Read CLAUDE.md, docs/progress.md, docs/decisions.md, sections 8 and 9 of docs/framework.md, and section 13 of docs/core-design.md.

We're doing milestone 6: Story and Street Smarts sample. Build:
- A dialogue and choice system, with dialogue stored as data files.
- Sensei and Kohai characters.
- One dojo manners quest and one life-lesson quest with a meaningful choice and Honor.
- One Street Smarts scenario for ages 6 to 9 (getting separated from a parent in a store) in the illustrated story scene format from section 13 of docs/core-design.md: one picture, 1 to 3 short sentences, and 2 to 4 big choice buttons per scene, branching choices, text-to-speech narration on by default, plus Awareness and Get-help moments. Score it with up to 3 stars and end with Sensei's reflection. Use placeholder pictures until the real illustrations are made.

Before building the scenario, write its full script in plain language for me to approve. Nothing about the scenario gets built until I approve the script.

Show me your plan first and wait for my approval.
```

**Done when:** you approve the scenario, and a student completes it and can explain what they would do in real life.

---

## Milestone 7 — Playtest ready

```
Read CLAUDE.md, docs/progress.md, and docs/decisions.md.

We're doing milestone 7: Playtest ready. Build:
- Guided mode (wider counter window, slower telegraphs), on by default for the youngest fake profile.
- The first 30 minutes as described in section 7 of docs/core-design.md, including the cascade of unlocks from real training.
- The Sensei's Lessons system from section 13 of docs/core-design.md: short hands-on lessons, never more than one new system per session, and a Lesson Scroll in the Home Dojo to replay them. Build lessons for every first-session system, and set up the gradual unlock schedule so later systems can plug in.
- Sound effects and music on all main actions and screens.
- A play-time limit setting that ends play gracefully after the current room.
- Fix anything from my notes in docs/progress.md.

Show me your plan first and wait for my approval.
```

**Done when:** it's ready to hand to 3 to 5 students at the dojo. Then follow the playtest steps in section 16 of the framework, and bring your notes back to your regular Claude chat.

---

## Milestone 8 — iPhone and Android apps

You'll need the Apple and Google developer accounts from the setup checklist. Do this milestone right after milestone 7, so the playtest can use real installed apps if you'd like.

```
Read CLAUDE.md, docs/progress.md, and docs/decisions.md.

We're doing milestone 8: iPhone and Android apps. Please:
- Wrap the game with Capacitor for iOS and Android.
- Set up GitHub Actions to build the iOS app on a macOS runner (I'm on Windows with no Mac) and the Android app, and to send test builds to TestFlight and Google Play internal testing.
- Make sure the app pauses when it goes to the background, works in landscape, respects safe areas, and handles a lost connection gracefully.
- Check the app against App Store Kids Category and Google Play Families rules, and give me a plain-language list of anything I need to fill out (privacy details, age rating, store listing).
- Walk me step by step through anything I have to do myself in Apple's and Google's websites. I'll enter all passwords and keys myself.

Show me your plan first and wait for my approval.
```

**Done when:** the game installs and plays on both an iPhone and an Android phone through TestFlight and Google Play internal testing.

**Before publishing publicly:** have a lawyer review children's privacy compliance (COPPA), as noted in the framework.

---

## Milestone 9 — Real DojoForge connection (with Nic)

Nic needs to have the progress feed, the request endpoint, and the "Ready for review" queue ready in DojoForge first.

```
Read CLAUDE.md, docs/progress.md, docs/decisions.md, section 14 of docs/framework.md, and section 13 of docs/core-design.md.

We're doing milestone 9: Real DojoForge connection. Nic has built the progress feed and request endpoint in DojoForge; I'll give you the details he provided. Please:
- Replace the fake profiles with the real progress feed, keeping the fake profiles for testing.
- Add student login with their DojoForge account.
- Save game progress on the game server (Cloudflare Workers + D1).
- Build Missions: written steps for every real-world goal, and send "Ready to show Sensei" requests to DojoForge when a mission's steps are complete.
- Add the legacy grant and Welcome Week for existing students.

Show me your plan first and wait for my approval.
```

**Done when:** a real Action Zone student logs in, sees their real belt and sign-offs, and a completed mission shows up in your queue in DojoForge.

---

## Milestone 10 — Every belt tier and Sensei's Lessons

```
Read CLAUDE.md, docs/progress.md, docs/decisions.md, and sections 10, 12, and 13 of docs/core-design.md.

We're doing milestone 10: Every belt tier. Please:
- Build a Tower tier for every rank in the school's belt list, using remixed rooms and elite enemy traits so content stays manageable, with a Guardian for each tier.
- Apply the Power Rating scale and experience pacing from sections 12 and 13.
- Finish the gradual unlock schedule and a Sensei's Lesson for every system in the launch scope.
- Add Challenge mode.

Show me your plan first and wait for my approval.
```

**Done when:** a white belt and a brown belt can each play their full rank and learn every system they've unlocked.

---

## Milestone 11 — Street Smarts and quests

Before this milestone, work through the scenario and quest scripts in your regular Claude chat and approve them. Make the scene illustrations with Grok.

```
Read CLAUDE.md, docs/progress.md, docs/decisions.md, and sections 8 and 9 of docs/framework.md and sections 12 and 13 of docs/core-design.md.

We're doing milestone 11: Street Smarts and quests. I've added the approved scripts and illustrations to the content and assets folders. Please:
- Build every approved Street Smarts scenario in the illustrated story scene format, grouped into locations on the town map.
- Add Street Smarts power and location perks from section 12.
- Build the approved manners quests and life-lesson stories, with Honor.

Only build scripts I've approved. Show me your plan first and wait for my approval.
```

**Done when:** students complete the scenarios and quests without help and can explain what they'd do in real life.

---

## Milestone 12 — Launch

```
Read CLAUDE.md, docs/progress.md, and docs/decisions.md.

We're doing milestone 12: Launch. Please:
- Add visiting classmates' dojos with bows (only the owner sees their count), certified trophies, and the Hall of Masters.
- Finish parent controls: multiplayer on or off, private dojo, hiding players, play limits, quiet hours, Street Smarts topics.
- Fix everything from my playtest notes in docs/progress.md.
- Prepare the App Store and Google Play releases, and give me a plain-language checklist of everything I need to submit.

Show me your plan first and wait for my approval.
```

**Done when:** the game is live for Action Zone families on both stores.

---

## End-of-session prompt (use at the end of every milestone)

```
Before we finish: commit everything, add any decisions we made to docs/decisions.md, and update docs/progress.md with what was done, what's left, and any problems I reported. Then tell me in two or three plain sentences where we are.
```

---

## Working with the Grok bots

The bots' directions are in `docs/GROK_BOTS.md`. They deliver drafts to their own folders through pull requests. After you've reviewed a bot's pull request and approved the work, merge it, then use one of these prompts in Claude Code.

**The one-character art test (when the Art Director delivers it):**
```
Read CLAUDE.md, docs/decisions.md, and "Art process" in section 13 of docs/core-design.md. The Art Director bot has delivered the one-character test in incoming-art/character-test/. On a separate test branch only: build the art import step (a repeatable script that trims, sizes, and packs the renders into a texture atlas for Phaser), then replace the placeholder circle with this character, using its idle, walk, strike, and counter animations in all 8 directions. Recolor the belt layer to match the profile's real rank. Give me a link to see it on my phone. Don't copy it onto main. Show me your plan first and wait for my approval.
```

**Moving approved bot work into the game:**
```
Read CLAUDE.md and docs/GROK_BOTS.md. I've approved these files from the Grok bots: [list the files or folder, for example "everything in incoming-art/enemies-tier1/"]. Please copy them into the game's real folders, run them through the art import step if they're art, and use them where they belong. Don't change anything inside the bot folders. Show me your plan first and wait for my approval.
```

**Character customization (after the full character is approved):**
```
Read CLAUDE.md, "Character customization" and "Art process" in section 13 of docs/core-design.md, and docs/decisions.md. I've approved the full customizable character in incoming-art/[folder] and the style guide. Move the style guide into docs/style-guide.md. Then build a character creation screen (body, skin tone, face, hair style, hair color, gi color) that can also be changed later at the Home Dojo. The belt layer must always show the real rank and stripes and is never customizable. Show me your plan first and wait for my approval.
```

---

## Helpful prompts when something goes wrong

**Something broke:**
```
Something that worked before is broken now: [describe what you see]. Please find what changed, explain it to me in plain words, and fix it without changing anything else.
```

**Going in circles:**
```
Let's stop and step back. Undo back to the last commit that worked, explain in plain words what went wrong, and give me a new, simpler plan.
```

**Too technical:**
```
Please explain that again in plain language for someone who isn't a programmer, and tell me exactly what you need me to do.
```

**Design question:** Don't spend credit on design debates in Claude Code. Bring the question back to your regular Claude chat, then add the decision to docs/decisions.md.
