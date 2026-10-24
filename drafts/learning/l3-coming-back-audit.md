# L3: Coming-back audit (white belt)

## Delivery Note

- **ITEM:** L3, coming-back audit (docs/work-board.md).
- **WHAT:** I checked the five loops in core-design §3 against what's built on `main` as of Oct 24, 2026, using progress.md, decisions.md, and a read-only look at the game code and data. For each loop: is it built, what's a good no-pressure reason to come back, what makes it fun, and what the risks are. Then a ranked list of what's missing for a white belt.
- **WHY:** We want kids to *want* to play a few times a week because it's fun and ties to class, never because of guilt, streaks, or fear of missing out (core-design §8).
- **DECIDE (for Jay, via the Manager):**
  1. Should the run summary show one "closest goal" line (for example "1 more chest decoration to fill your wall")? This is Must #1 below.
  2. Attendance streaks are in launch scope (§13) and the data feed already carries `streak.weeks`. Can we agree on a rule: streaks only ever count up or pause, are never "lost," and are never shown as a warning?
  3. White belts don't get a quest board or Missions yet. Should the first Mission (a technique sign-off) be the white belt's weekly "thing to do," as §13 allows?
- **NEXT:** After Jay's answers, I can write short specs for the Must items so the Content Designer and Programmer can pick them up. No game code was touched.

---

## The short version

A white belt today has a **fun reason to play once** (good combat, loot, cleaning and decorating) and a **real-life reason after class** (the Dojo Blessing). What's thin is the **reason for the 2nd and 3rd visit in a week**: there's no "closest goal" on screen, no weekly board, and nothing changes in the Tower between visits. The good news: the safe pieces are already there. It mostly needs small hooks that point at things that already exist.

**Top 3 findings**
1. **"Always show the closest goal" isn't built.** The run summary shows grades, Perfect Counters, time and personal bests, but no single "almost there" goal. This is the cheapest, biggest win.
2. **The week loop is only half built for white belts.** The Blessing works, but the quest board, Missions, Training Point spending, and the Shifted Floor don't exist yet. So between classes there is one floor and nothing new.
3. **Streaks are a risk to settle now.** They're in launch scope and in the data feed but not shown. If they show up as "don't lose your streak," that breaks our own rules. A count-up-only design fixes it.

---

## Loop by loop

| Loop | Built on main? | Good no-pressure reason to come back | What makes it fun | Risks |
| --- | --- | --- | --- | --- |
| **Moment** (seconds) | **Yes.** Counter / Perfect Counter, Strike, Dash, chains ("PERFECT x3"), hit effects, the guided first Counter (G1). | "I'm getting better." Perfect Counters and combos are personal bests. | Clear warnings, big "PERFECT!", sounds, screen shake. | Low. Main risk is frustration if Guided is still too hard (tester reports went to the Programmer). |
| **Run** (5–7 min) | **Yes.** 8-room floor, door choices, grades, chests, rest shrine, boss, twists, loot with bad-luck protection. Insights too, though §13 says they unlock at 2nd belt. | A short, complete adventure that fits a phone session. | Picking doors, chests, the boss, room twists, rare drops. | **Insights show at white belt** but §13 schedules them for 2nd belt (overwhelm, see my M0–4 audit). "Try again" button after a loss is fine, as long as nothing auto-starts the next run (it doesn't). Random loot is in-game only, never bought. OK. |
| **Session** (20–60 min) | **Partly.** Home Dojo, the bow, cleaning, Calm Mind, 11 decorations, gear, look changes. No quest board, no crafting (after launch), no Training Point spending, no Street Smarts yet (milestone 6 work in progress). | "My dojo is mine." Bring something home and place it. | Sweeping sparkles, decorating, wearing new gear. | Mess builds while away. It's capped at one week, never removes anything, never blocks play, and the welcome-back card is warm. Good. Watch that mess never reads as "you neglected your dojo." **No "time for a break" suggestion found** in the summary (§8 asks for one). |
| **Week** (days) | **Partly.** Dojo Blessing (48 h after class: +50% XP, better loot, glow, nothing shown when not blessed). Path card shows next technique, next class day, test day. Training Points counted but not spendable. No quest board, no class events, no Missions. | "I went to class, so tonight is a great night to play." | The glow, better loot. | Blessing is good: it rewards training, not logging in. Risk: if the Blessing is the *only* weekly hook, a kid who misses class has nothing new. That's OK (no punishment), but there should be *something* gentle. Streaks: see finding 3. |
| **Journey** (months–years) | **Partly.** Belts, stripes, the Gate tab, promotion ceremony, abilities from real sign-offs, level caps per belt, Tier 2 art. Tower story/light restoration and Guardians per belt not built yet. | "My real belt shows up in the game." | Ceremony, new abilities with real technique names. | Level caps and catch-up double XP stop endless grinding. Good. Real training stays the main source of power. Good. |

---

## What's missing at white belt (ranked)

| # | Rank | What | Cost | System | Launch? |
| --- | --- | --- | --- | --- | --- |
| 1 | **Must** | **One "closest goal" line** on the run summary and Home Dojo, picked from things that exist (decoration count, a personal best within reach, next technique on the Path card). | S | Run summary / Home Dojo | In scope (§2 rule) |
| 2 | **Must** | **Streak rule:** if streaks are shown, they count up and pause, never reset to zero on screen, never warn. Celebrate milestones ("10 weeks of class!") only. | S | Week loop / rewards | In scope (fixes a scheduled feature) |
| 3 | **Must** | **Hold Insights until 2nd belt** as §13 says, or confirm the change in decisions.md. | S | Run | In scope |
| 4 | **Must** | **Break suggestion** after a long session (§8 wording already exists). | S | Run summary | In scope |
| 5 | **Should** | **First Mission for white belts** (a technique sign-off) as the weekly "thing to do" that ends in class. | M | Missions | In scope (§13) |
| 6 | **Should** | **Spend Training Points** at white belt so home practice shows up in the game. | M | Training / abilities | In scope |
| 7 | **Should** | **Something small that's new each week** (for example a "Sensei's pick" door or a changed room order), with no "gone forever" rewards. | M | Run / week loop | Check vs. Shifted Floor scope |
| 8 | **Nice** | **Practice room drills** (Read & React, from proposals-top5) as a 2-minute "quick visit" option. | M | Practice room | Proposal |
| 9 | **Nice** | **Creed Wall letters** (L5) as a slow, calm collection that grows with real class. | M | Home Dojo | In launch (per Manager) |
| 10 | **Nice** | **Hint of the Tower story** (one line about the shattered light after the first boss) to spark curiosity. | S | Story | Proposal; Content Designer owns |

Proposals only. Nothing here changes launch scope without Jay.

---

## Evidence

| Claim | Source | Rating | Note |
| --- | --- | --- | --- |
| Kids keep doing things that make them feel capable, free to choose, and connected. Pressure and controlling rewards hurt that. | Ryan & Deci, Self-Determination Theory (2000, *American Psychologist*); Ryan, Rigby & Przybylski (2006), *Motivation and Emotion*, on games | STRONG | From memory, **please check** exact citations. |
| Tangible rewards given *for doing* an enjoyable task can lower interest in it. | Deci, Koestner & Ryan (1999) meta-analysis, *Psychological Bulletin* | STRONG | **Please check.** Supports keeping rewards informational and tied to real training. |
| Kids stay in sport mostly because it's fun, and drop out when it stops being fun or feels pressured. | Youth sport dropout research, e.g. Crane & Temple (2015) review, *European Physical Education Review*; Visek et al. (2015) "FUN MAPS," *J. Physical Activity & Health* | MODERATE | **Please check** both. |
| Effort rises as a goal gets close. | Kivetz, Urminsky & Zheng (2006), *Journal of Marketing Research* | MODERATE | **Please check.** Adult study; supports Must #1. |
| Habits form through repeating a behavior in a steady context; missing one day doesn't hurt much. | Lally et al. (2010), *European Journal of Social Psychology* | MODERATE | **Please check.** Supports "no streak loss." |
| Streak-loss / loss-aversion designs push play through worry. | Design-ethics view; core-design §8 already bans daily streaks | WEAK as evidence, firm as our rule | No study cited. |

---

## Questions for the Manager

1. Is the Insights-at-white-belt choice deliberate (decisions.md), or should it follow §13?
2. Who owns the streak display rule: me (as a proposal) or the Researcher & Planner (systems)?
3. Is the Shifted Floor in launch scope? It isn't in the §13 launch list, but §8 names it as part of the weekly rhythm.
