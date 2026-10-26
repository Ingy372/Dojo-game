# Audit: combat, progression, and Home Dojo (milestones 0–4, plus 5's dojo)

Learning & Engagement Designer, 2026-10-12. Based on `docs/core-design.md`, `docs/progress.md`, `docs/decisions.md`, `content/abilities/abilities.json`, and the unlock schedule in `docs/core-design.md` section 13 ("Systems unlock gradually"). Note: `framework.md` section 13 is now about art; the unlock schedule lives in core-design section 13.

These are suggestions for Jay to review, not instructions.

**Evidence ratings:** STRONG = replicated, widely accepted. MODERATE = some good studies. WEAK = early, mixed, or popular but not well proven.

## Top flags (most important first)

1. **Too much at once for a 6-year-old.** The unlock schedule says Insights wait until the 2nd belt and only one new system per session. Today a brand-new white belt gets Insights (pick 1 of 3, text cards, 5–7 times a run), plus Strike, Counter, Dash, Focus, combo, grades, doors, gear, and (when earned) Form and Virtue buttons. Sensei's Lessons aren't built yet (planned for milestone 7). Children hold far less in working memory than adults (Gathercole et al., 2004, *Developmental Psychology*; MODERATE–STRONG). Suggest: hide Insights for 1st-belt players (or auto-pick for Guided) until the unlock schedule is built.
2. **Real technique names are hidden from play.** In fights, buttons and effects use game names (Rooted Form, Sweep, Steady Breath). The real names (Basic Form 1, Self-Defense #3, Kick Combo 1) live only in the Abilities tab. Kids won't learn names they don't see while using them. (See proposals 1 and 2.)
3. **Rewards for going to class could backfire if framed as pay.** The Dojo Blessing (+50% XP after class) and XP for sign-offs are expected rewards tied to doing a task. A large meta-analysis found expected, tangible, task-tied rewards lower kids' own interest more than adults' (Deci, Koestner & Ryan, 1999, *Psychological Bulletin*; STRONG, though game rewards aren't exactly "tangible"). Keep the framing as celebration and information ("Sensei saw your hard work"), never "go to class to get XP."
4. **Some design claims rest on weak research.** The docs lean on the Zeigarnik effect, the Hook Model, and "juice." A 2025 meta-analysis found **no** reliable memory boost for unfinished tasks (Ghibellini & Meier, *Humanities & Social Sciences Communications*); only the urge to resume holds up. The Hook Model (Eyal) is a business book, not research. One small juiciness study found players *liked* juicy feedback more but *scored worse* (Juul & Begy, 2016, DiGRA/FDG). None of these are wrong to use, but they shouldn't be treated as proven.
5. **Random loot is the one place to watch.** Variable rewards keep behavior going (operant research; STRONG in labs). Loot-box spending is linked to problem gambling in adults (Zendle & Cairns, 2018, *PLOS ONE*; MODERATE, correlational). Here nothing is bought and bad-luck protection exists, which is good. Keep it that way: no spinning or slot-like reveals, no paid anything, ever.

## 1. Combat

**What's built:** auto basic attacks; Strike (30 Focus); Counter with Perfect (0.3 s Standard / 0.5 s Guided / 0.2 s Challenge), Block, Hit; Dash; Focus and combo bonus; red danger circles with "!" and sound; only two attackers at once; Swarmer, Shield Guard, Brute (gets winded), Floor Keeper boss; waves; room grades S/A/B; defeat sends you home keeping everything; Forms, Seals, Virtues from real sign-offs.

**What it teaches**
- Reading an opponent: every attack is telegraphed, so players learn to watch for the cue.
- Timing: Perfect Counter rewards waiting for the right moment, not mashing.
- Decisions: counter, block, dash, or run. Overlapping attacks force a real choice.
- Planning: pull swarmers away from the slow brute, chase winded brutes, save Focus to break a shield.

**What makes it fun**
- The Perfect Counter moment (flash, freeze, "PERFECT!"). Mastery you can feel.
- Clear enemy roles: each enemy is a small puzzle.
- Jay's playtests: waves and winded brutes made fights "much cleaner"; running to separate enemies now pays off.

**Research behind it**
| Claim | Source | Rating |
| --- | --- | --- |
| Experts read cues earlier and decide faster; this is a learnable skill | Mann, Williams, Ward & Janelle (2007), meta-analysis, *J. Sport & Exercise Psychology* | STRONG (for expert vs novice differences) |
| Whether *game* cue-reading carries over to real sparring | No direct study found | WEAK / unknown. Say so honestly. |
| Clear, informative feedback helps learning | Wisniewski, Zierer & Hattie (2020), meta-analysis of 435 studies, *Frontiers in Psychology* | STRONG |
| Feeling competent keeps people playing | Ryan, Rigby & Przybylski (2006), *Motivation and Emotion* | MODERATE–STRONG |
| Challenge matched to skill (flow) keeps players engaged | Csikszentmihalyi's flow research | MODERATE (well known, hard to measure in games) |
| "Juicy" effects make a game feel better | Juul & Begy (2016) | WEAK (one small study; juicy version hurt scores) |
| Kung fu circle (two attackers) keeps fights readable | Game design practice; no research found | WEAK (but common sense and Jay's playtest support it) |

**Flags**
- **Five buttons for a young child** (Strike, Counter, Dash, Form, Virtue) plus a stick. Fine for 10+. For 6–8, consider showing Form and Virtue buttons only after their Sensei's Lesson.
- **Overlapping attacks + no dash protection** is a judgement test that suits older kids. For Guided, consider a tiny dash safety moment. The computer player shows novice Standard players win only 41% (Guided 99%), so Guided as the default for young kids matters a lot.
- **Too many effects at once** (sparks, numbers, shake, combo, banners) may hide the telegraph for young kids (Juul & Begy's cognitive-load point). Keep the danger circle the brightest thing on screen.
- **Ability names are game names, not real names** (flag 2 above).

## 2. Progression (floors, Insights, loot, levels, the Gate, Path card)

**What's built:** 8-room floors with door choices; 9 Insights (pick 1 of 3); gear with rarity, chimes, and bad-luck protection; personal bests with "NEW!"; levels capped at 10 per belt, double XP below the expected level; the Gate (a lock per real requirement, sundial, Sensei's Seal); Path card (next technique, next class, test day); the Dojo Blessing; reward moments sized by importance; the 4-step promotion ceremony.

**What it teaches**
- Doors and Insights: planning and trade-offs ("rest now or fight for a chest?").
- The Gate and Path card: what the real next step is, and that it happens in the dojo.
- Ceremony and reward sizing: real achievements matter most.

**What makes it fun**
- Choice (doors, Insights), surprise (loot colors and chimes), visible growth (levels, bests).
- The white → yellow ceremony is the biggest moment, tied to the biggest real moment.

**Research behind it**
| Claim | Source | Rating |
| --- | --- | --- |
| Meaningful choice raises motivation | Patall, Cooper & Robinson (2008), meta-analysis, *Psychological Bulletin* | MODERATE (helps most with a few options, which 1-of-3 fits) |
| Effort rises as a goal gets close (goal gradient) | Kivetz, Urminsky & Zheng (2006), *J. Marketing Research* | MODERATE |
| Head-start progress raises completion (endowed progress: the legacy unlock cascade) | Nunes & Drèze (2006), *J. Consumer Research* | MODERATE |
| Unfinished goals stick in memory (Zeigarnik) | Ghibellini & Meier (2025) meta-analysis found no reliable memory effect; the urge to *resume* did hold | WEAK for memory, MODERATE for resuming |
| Knowing a gap exists sparks curiosity (the visible Gate) | Loewenstein (1994), *Psychological Bulletin* | MODERATE |
| Variable rewards keep behavior going | Operant conditioning research | STRONG (labs); see flag 5 for kids and loot |
| Expected rewards for real tasks can lower kids' own interest | Deci, Koestner & Ryan (1999) | STRONG |
| Kids quit sports mostly from low enjoyment and low sense of competence | Crane & Temple (2015), systematic review of 43 studies, *European Physical Education Review* | MODERATE (mostly teen boys, mostly cross-sectional) |

**Flags**
- **Insights before 2nd belt** (flag 1). The cards are text-heavy for non-readers.
- **Gate details** ("classes until test" assumes 2 classes a week, still open in decisions). A wrong countdown could make a child feel behind. Show it softly, or only the locks and Sensei's Seal for young players.
- **Room grades and personal bests** are self-comparison only, which is good. Keep them that way: never leaderboards for young kids.
- **Run summary has many numbers** (rooms, grades, counters, combo, time, items). For a 6-year-old, lead with one big highlight and one next goal.
- **Power Rating stays hidden** (only on the testing screen). Correct.

## 3. Home Dojo

**What's built (milestone 5):** walk-around room; the bow (+15 Focus); warm welcome cards; slow mess while away (none for 4 hours, full at a week, then stops; never removes anything or blocks play); sweep, wipe, straighten; Calm Mind (Focus 20% faster for 3 runs); 11 decorations from starter gifts and chests; gear and the Training Board.

**What it teaches**
- Respect for the training space and the bow as a ritual.
- Small responsibility, without guilt.
- Pride in something you built.

**What makes it fun**
- Ownership: it's your room, arranged your way.
- Quick, satisfying cleaning with puffs and sparkles.
- New decorations from the Tower give runs a second purpose.

**Research behind it**
| Claim | Source | Rating |
| --- | --- | --- |
| People value what they build themselves | Norton, Mochon & Ariely (2012), *J. Consumer Psychology* (IKEA effect) | MODERATE (adult studies) |
| Autonomy and ownership feed long-term play | Ryan, Rigby & Przybylski (2006) | MODERATE–STRONG |
| A trigger + routine helps habits form | Lally et al. (2010), *European J. Social Psychology* (habit formation took a median of 66 days, with wide range) | MODERATE |
| Hook Model (trigger, action, variable reward, investment) | Eyal (2014), a business book | WEAK (not tested research) |

**Flags**
- **The mess timer is the one thing that could feel like pressure.** The guardrails (slow, capped, never removes, warm welcome) are exactly right. Keep "mess" cosmetic only. Calm Mind is a small bonus for cleaning, not a penalty for being away, which is good.
- **The bow before every floor** is a strong ritual. Make sure it never becomes a chore (one tap, short).
- **Decorating with tiny phone controls** was hard at first; already fixed with tap-to-place and big arrows.

## Pacing check (reason to come back a few times a week)

- **Good reasons exist:** class gives the Blessing; new sign-offs unlock abilities; decorations to place; bests to beat; the Gate shows the next real step.
- **No daily pressure found.** No streak that breaks, no "you missed out" messages.
- **Watch:** once Missions and Training Points arrive, keep caps so the game never competes with real practice time.
