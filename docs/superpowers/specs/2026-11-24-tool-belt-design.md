# The Tool Belt: combat progression redesign

Date: 2026-11-24. Agreed with Jay in conversation the same day. Replaces the Technique Seal system.

## Why

Jay's words: the Seal system is "murky". Kids can't tell what a Seal does, the effects are hidden number tweaks, and from green belt up almost nothing new arrives (kick combos 4–7 give nothing, 17 of 40 techniques give nothing, kata powers are empty). The four buttons never change from day 1 to black belt.

What it should feel like instead:

- **Self-defense = tools in your tool belt.** Action Zone already says this in class: every technique is a new tool, and you feel better equipped. In class it's fun because you *see yourself doing something cool* on a partner. In the game, every new tool must be a move the kid *sees* their hero do.
- **Kata is the headline.** It's what the school pushes hardest and what kids struggle with most (memory). A kata sign-off gets the biggest reward in combat: the kind of thing a kid rushes home to try.
- **Self-defense rewards are smaller but frequent.** There are 40 of them, so each one is less of an event than a kata, but a kid should still want to see "what does my new tool do?"
- **Kids optimize, and learn by optimizing.** Choosing which tools to bring should make kids look at the techniques, think about them and remember them better. Kids who don't want to manage anything never have to.
- **Feel:** busy, satisfying, a bit chaotic, like roguelites such as Brotato or Archero 2, but never so much on screen that you can't follow it.

## Goals

1. Every self-defense sign-off gives a **tool**: a visible move the hero performs by itself during a fight, called out with its real number and name.
2. Every kata sign-off gives a **signature move** on a **Kata button** and **one more pocket** on the tool belt.
3. Every kick combo sign-off (1–7) gives a new **kick** for the Strike button, each with a different job. From green belt there is a **second kick button**.
4. Higher belts play noticeably differently: more buttons, more tools, more choices.
5. Auto attack weaker, Great Counter stronger (see "Damage change").

## Non-goals (for now)

- Insights levelling up tools during a run (Brotato style). A good later idea; keep the tool data able to take a "level", but don't build it.
- Changing Stances or Virtues. They stay as they are (pre-run Stance pick; Virtue pops up when Focus is full).
- New enemies or rooms built around the tools.
- Anything after launch from CLAUDE.md's "do not build" list.

## Anti-goals (a failure even if it works)

- **The hero plays itself.** Tools must never replace the auto attack, Counter or moving. A kid standing still should not win because tools fire on their own.
- **Visual soup.** Too many effects at once to follow what's happening.
- **Another system to learn.** Kata rewards and kicks reuse existing slots and buttons; no new meters or currencies.
- **Breaking the hard rules:** the game never affects real rank, power stays capped by real rank, every enemy attack stays telegraphed, outcomes stay kid-safe (see `docs/self-defense.md`, "Rules for using these in the game"), Power Rating never shown.

## Constraints

- Game effects must match what each real technique does (`docs/self-defense.md`). Callouts use the real number and a short kid-safe subtitle ("Self-Defense #17! Arm Bar"). "Injured" status only from #31–40.
- Training sign-offs carry 40% of a tier's max Power (CLAUDE.md, architecture rule 10). That 40% is now shared by tools, kicks, kata moves and pockets. All numbers live in the tuning file (`packages/sim/src/config.ts`) and content files.
- Rules stay in `packages/sim` (deterministic, 20 ticks per second, no randomness outside the seeded generator). Tools, kicks and kata moves are data in `content/`.
- Phone first, landscape: about 5–6 thumb buttons fit around the right thumb. Must also work with keyboard (new keys for the new buttons).
- All tool names, tool texts, kata move names and effects are new game writing: **Jay approves them before they ship.** All new art: Jay approves.
- One milestone per session; Jay names which stage is built when.

## Approaches considered

- **A. Rebuild Seals in place (chosen by Jay).** Keep the working skeleton (sign-off unlocks, slot equip rules in `loadout.ts`, Sensei's Pick, Fighting Style screen, save migration) and change what goes in it: per-technique tools with a trigger, a cooldown and a visible move; slots become pockets; kata sign-offs add pockets. Least risk; old saves carry over.
- B. New Tool Belt system, delete Seals. Cleaner on paper, but rebuilds and re-tests working parts for the same result.
- C. Rename and re-skin only. Cheap, but keeps hidden bonuses, so it doesn't fix the murkiness. Dropped.

Delivered in two stages (Jay's pick), each testable on the phone.

## The design

### Tools (from self-defense sign-offs)

- **One tool per technique** (not per family). The Seal families go away as a thing the player sees. A tool card shows: the real number and name, a one-line reminder of the real technique, its **trigger**, and what it does in plain words. No numbers on the card (keep the "better or worse" style used elsewhere).
- **Triggers come from what the player does,** so a kid standing still gets nothing from tools. A small fixed set, shown as words on the card:
  - When you Great Counter
  - When you Block
  - When you Strike (kick)
  - When you Dash
  - When enemies crowd you (several close while you fight) *(this one depends on the situation, but still only while the player is fighting)*
  - When you get hit (a comeback move)
  *(Claude's call: no purely timed "every 10 seconds" tools, because of the anti-goal "the hero plays itself". Jay can overrule.)*
- **Each tool has a cooldown** (roughly 6–15 seconds, per tool, in the content file), shown as a small ring on the tool's icon in the corner of the screen. Tools must not fire so often that they replace the auto attack.
- **When a tool fires,** the hero visibly does the move (or a code-drawn effect plays over the hero), with a short callout: "#7 Palm Heel!". At most one tool callout on screen at a time; others queue or fire without text.
- **Effects match the technique** (trap, throw, push back, escape off the line, block-and-strike, disarm, and so on) using the outcomes allowed in `docs/self-defense.md`. Many current Seal effects can be reused as tool effects; the per-technique table in `docs/self-defense.md` ("current powers vs real techniques") shows which already fit.
- **Techniques that are mirror images** (like #1 and #2, the same move to each side) are still separate tools, but may be close cousins. The content draft decides, and Jay approves.

### The Tool Belt (pockets)

- Tools go in **pockets**. Only tools in pockets work in a run. The pocket count is the "5–10 techniques per run" limit.
- **Pockets: 3 to start, +1 per kata sign-off, 10 at most.** That reaches 10 at brown belt (7 katas signed off by then: Basic Form 1, Basic Form 2, Keon, David and Goliath, Pinon 1, 2 and 3). *(Claude's call on the starting number; Jay asked for 5–10 tools per run. A new white belt only has up to 5 tools anyway. Easy to change in the tuning file.)*
- **Sensei's Pick (already built) fills the pockets automatically,** newest tool first, so a kid who never opens the screen still gets the newest tools. Kids who want to can open the belt and swap tools.
- This replaces `SEAL_SLOTS_BY_TIER` (pockets now come from katas, not from belt tier).
- The Fighting Style screen's Seal section becomes the **Tool Belt** section. The word "Seal" disappears from what players see.

### Kata: the signature move and a pocket

- Every kata sign-off gives (1) a **signature move** for the **Kata button** and (2) **one more pocket**.
- The **Kata button** appears once the first kata (Basic Form 1) is signed off. The player equips **one** signature move per run (the existing Kata slot on the Fighting Style screen).
- The signature move is a big, controlled power the player triggers: for example a spinning sweep that knocks back everything around the hero. Each kata's move should feel clearly different and bigger than any tool.
- **It recharges on a timer, like Dash, but much longer** (about 20–30 seconds), shown as a ring on the button. *(Claude's call: no new meter. Focus already feeds Strike and Virtue.)*
- Nahanchi and Possi (past the 10-pocket cap) give signature moves only. Their moves should be the most impressive.
- The current `kata-powers.json` placeholders (passive bonuses) are replaced by these signature moves.

### Kicks (from kick combo sign-offs)

- Every kick combo 1–7 gives a new kick for the Strike button. Spin Kick, Jumping Spin Kicks and Butterfly Kick stay. Kicks 4–7 are new, built from Jay's descriptions in `docs/curriculum.md`.
- **Every kick does a different job,** so choosing one is a real decision. Starting set of jobs:
  - one huge hit (Spin Kick)
  - several quick hits (Jumping Spins)
  - a slow, heavy hit (Butterfly)
  - a spin that hits everyone around you
  - a flying kick that closes distance
  - a kick that launches an enemy into the others
  - one more for kick 7, decided in the content draft
- **Second kick button from green belt.** The player brings two kicks. Both cost Focus, so the choice is in the moment: which one is worth the Focus right now.
- The Opening (the free gold finisher after a Great Counter) works on either kick button.

### The screen over time

| When | Buttons (plus the move stick) |
|---|---|
| White, day 1 | Counter, Strike, Dash |
| First stripe | + Virtue (only while Focus is full) |
| First kata signed off | + Kata |
| Green belt | + second kick |

At most 6 buttons. Tools never get buttons, and their cooldown rings sit in a small row out of the thumb's way. Keyboard: new keys for Kata and the second kick, following the existing pattern (Space/K Counter, J Strike, L/Shift Dash, E Virtue).

### Teaching it (CLAUDE.md, architecture rule 11)

- Each new thing gets a short Sensei's Lesson when it first matters, one sentence per screen, at most one new system per session: the Tool Belt when the first tool is earned, the Kata button when the first kata is signed off, the second kick button at green belt. Existing students meet them through Welcome Week, as with other systems.
- A new tool's first appearance gets a small "New tool!" moment showing its card. It must stay smaller than the real sign-off celebration (hard rule: real achievements get the biggest celebrations).

### Damage change (folded into stage 1)

- Auto attack strength **1.0 → 0.6**. Great Counter hit **2× → 3.5× Power**.
- Measured with the balance bots (40 runs, Standard): a typical kid's damage goes about 8% down, a skilled player's about 13% up, a pure button-masher's about 21% down. Damage shifts from auto attack to Counter while staying about the same overall.
- CLAUDE.md's starting number ("counter hit for 2× Power") is updated, and the decision is logged.
- Tools that fire on Great Counters add more counter damage on top, so balance is re-measured after the tools go in, not just after this change.

### Power and balance

- The sign-off share of Power (40%) is spread across tools, kicks and kata moves. Each source has its own ceiling, as today. Exact split: the builder proposes, measured with the balance bots, kept in the tuning file.
- Balance targets that must still pass: white belt Guided (kid bot wins at least 75%), plus the existing balance checks.

### Old saves

- Old Seal picks convert to the matching tools. Every earned technique becomes its tool (the legacy grant still counts every requirement of a passed rank as signed off). Sensei's Pick fills the new pockets. Nobody loses anything they had.

## Stages

**Stage 1: white to orange (where today's students are)**
- Tool Belt for self-defense #1–15: tools, pockets, triggers, cooldowns, callouts, the Tool Belt section on the Fighting Style screen, Sensei's Pick, old-save conversion.
- Kata button and signature moves for Basic Form 1, Basic Form 2 and Keon. Kata pockets.
- The damage change.
- Kicks 1–3 unchanged except for any job tweak the content draft proposes.

**Stage 2: green to brown**
- Tools for #16–40, including the Injured status for #31–40.
- Kicks 4–7 and the second kick button.
- Signature moves for David and Goliath, Pinon 1–3, Nahanchi and Possi.

Before each stage's build: a content draft (tool names, one-line reminders, triggers, effects, kata move ideas, kick jobs), written from `docs/self-defense.md` and `docs/curriculum.md`, for Jay to approve.

## Art

- New Blender animations are needed for kata signature moves and kicks 4–7 (the hero has one kick animation today; Jumping Spins and Butterfly reuse it and should get their own).
- Tools mostly reuse existing motions (jab, counter, strike, dash) plus effects drawn in code and the callout, so 40 tools don't mean 40 animations. A few showcase tools may get their own animation later.
- Same Blender models and scripts as before (`incoming-art/tools/`); Jay approves all art.

## Left to the builder

- Exact cooldowns, damage numbers, Power split, and how often "enemies crowd you" counts as crowded.
- How the tool icon row and callout queue look and where they sit (within the phone safe areas).
- The data shape for tools in `content/` and its schema; reuse of `effects.ts` effect types.
- How the old-save conversion maps each Seal family pick to tools.
- Order of work inside a stage, and tests.

## Waiting on Jay

- Approval of the content draft for each stage (names, texts, effects).
- Approval of new art.
- Claude's calls marked above (3 starting pockets; no timed tools; kata move recharges on a timer) stand unless Jay changes them.
