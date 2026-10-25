# S3: Forms and kata plan (first 4 katas)

Manager item, Oct 24. The Manager called this "S5", but **S5 is already Difficulty** (`S5-difficulty.md`, #88). The board's **S3 Forms** item was waiting on these kata descriptions, so this is S3.

**Source:** the school's written descriptions (by Toni Kennerson) for Basic Form One, Basic Form Two, Keon and David and Goliath. They came as `.docx` files with `.md` copies and a direction key (`school-map.png`: Front at the top, Back at the bottom, Left and Right at the sides). The game spells Keon as **"Key On"** (`docs/curriculum.md`, settled 2026-10-19).

**What this plan does:** shows how the descriptions feed Forms, the Journal (S12) and kata powers, sets up a format that new katas can drop into, and lists the questions for Jay. It **does not fix** anything in the school's text. Possible typos are quoted below as questions.

**Rules kept:** no purchases, ads, loot boxes, FOMO, timers or streak punishment. Real training stays the main source of power: a kata is still unlocked only by an instructor's sign-off. No invented curriculum, and no step is added or changed. Numbers marked "(guess)" are not proven.

---

## 1. What the texts say (facts only, counted from the text)

| Kata (game name) | Belt it unlocks | Numbered steps | Kiai | Moves named in the text | Notes |
| --- | --- | --- | --- | --- | --- |
| Basic Form 1 | White → Yellow | 8 + bow out | #3, #6 | downward block, straight punch, 180° turns, "big special turn", cat stance | Same moves repeated to the left and right |
| Basic Form 2 | Yellow → Orange | 8 + bow out | #3, #6 | everything in BF1 plus chambering, reverse straight kick, reverse punch, "Catch" on the hip | Same layout as BF1, with a kick added |
| Key On | Orange → Green | 9 + bow out | #9 | adds reverse inside block, overhead block, front stance, "catch" then straight kick | |
| David and Goliath | Green → Blue | 12 (no bow-out line) | #3 | adds attention start, double knife-hand blocks, backfist, solar plexus punch, front kick | #2 and #12 are called out as "breaking a choke" |

What we take from this without guessing:

- The first three katas start almost the same way (step 1 and the "big special turn" in step 2).
- Each kata adds new moves to the ones before it. This fits the game's idea that Forms build on each other.
- The texts describe **steps and directions, not feel**. **J3** (one line on each kata's character, from Jay) is still needed before new Forms are designed. This plan does not guess how a kata feels.

## 2. Kata data format (easy to extend)

Every kata becomes one content file, `content/katas/<id>.json` (new folder, proposed). Adding a kata from the school means adding one file. **No code changes.**

```json
{
  "id": "basic-form-1",
  "name": "Basic Form 1",            // game spelling (curriculum.md)
  "schoolName": "Basic Form One",    // spelling on the school's sheet
  "source": "Toni Kennerson, school sheet (docx)",
  "approvedBy": null,                 // Jay fills in when he checks the steps
  "form": "rooted-form",             // the Form this kata unlocks (abilities.json)
  "steps": [
    {
      "n": 1,
      "text": "<the school's words, copied exactly>",
      "facing": ["L"],                 // map directions from school-map.png: F, B, L, R
      "moves": ["block.downward", "punch.straight"],
      "kiai": false,
      "question": null                 // id from section 6 while a step is open
    }
  ],
  "finish": "<the school's bow-out words>"
}
```

- **`text` is always copied word for word.** The game never rewrites the school's steps.
- **`moves` uses a shared list** (`content/katas/moves.json`) with names a kid can read, for example `block.downward` = "Low block" (guess at wording). New katas reuse it and add only new moves (Pinon 1 and later will need more).
- **`facing`** is only filled where the text says it clearly. Where a step is open (section 6), it stays empty and `question` points to the question.
- A test checks every file: steps numbered 1..N with none missing, every move in `moves.json`, `form` exists, and no `facing` on a step that has an open `question`.

## 3. Forms gameplay

The Form button, switch time (`formSwitchTicks: 10`, half a second) and the "up to 3 Forms plus Beginner's Stance" rule already exist (decisions.md, Forms). This plan keeps them.

| Kata | Form | Status |
| --- | --- | --- |
| Basic Form 1 | Rooted Form | Built. The text backs it (blocks, cat stance, planted turns). No change. |
| Basic Form 2 | Flowing Form | Built. The text backs it (stepping kicks and chambering between moves). No change. |
| Key On | **(to name)** | Waits on J3. Option to offer Jay: a Form that adds to **Catch** (both hands caught on the hip, then a kick), since that is the move Key On's text keeps adding. (guess) |
| David and Goliath | **(to name)** | Waits on J3. decisions.md already has "extra damage to big enemies and bosses" (the small one beats the giant). The text adds choke-break blocks at the start and end; that fits a defensive version. Both are options for Jay. (guess) |

Rules for every later Form (Pinon 1 through Possi):

1. One Form per kata, and **the list ends at Possi** (Jay, 2026-10-24).
2. The Form must come from the kata's real character line (J3) and its moves, never from a guess.
3. Each Form has **one** strength and, at most, **one** small cost. One sentence a 6-year-old can follow.
4. No Form may make a wind-up shorter than 10 ticks or change the difficulty counter windows (Guided 10, Standard 6, Challenge 4).

## 4. Kata practice and the Journal (S12)

S12 is a calm practice room opened from a **Monster Journal** page. Katas are not enemies, so they don't get a Journal page. This plan reuses S12's calm-room idea in the **Abilities tab** instead:

- **Kata card:** on each earned kata's Abilities card, show the kata name, its Form, the number of steps, which steps have a kiai, and a direction picture based on the school map.
- **"Practice" (calm, optional):** a short "follow the arrows" room. It shows one step at a time: a direction arrow (Front, Back, Left, Right), then the move icons. The kid taps along. No score, no timer and no fail. Like S12, it gives no loot and does not count toward the Journal. (guess at format)
- **The real kata is learned in class.** The card says "Practice your kata with your instructor." **Decision for Jay:** should the game show the school's full step text, or only names, step counts and arrows? (See D1.)
- **Home practice tie-in:** core-design already allows "log practice sessions" for kata (parent-approved). The card can link to that. Nothing new.

## 5. Kata powers and seals

- **No new kata seal.** A kata unlocks a **Form**; self-defense unlocks Seals (decisions.md, "Abilities map in curriculum order"). Keeping one ability type per kind stays simple for kids.
- **Choke-break link (note only):** D&G #2 and #12 are called "breaking a choke". If the D&G Form ends up defensive (section 3), it can say "from your kata" in its reason text. No seal is added.
- **Kiai moment (option, post-launch):** when the kid finishes a kata practice, the character does a kiai with a cheer pop-up. Cosmetic only. (guess)

## 6. Open questions for Jay (not fixed; the school's words quoted)

**Flagged by the Manager:**

| ID | Kata, step | Original text | Question |
| --- | --- | --- | --- |
| Q1 | Basic Form 1 #2 | "then LF step forward then LF straightforward punch" | Should it be **LH** (left hand) punch? |
| Q2 | Key On #2 | "LF step forward then LF straightforward punch" | Same: LH? |
| Q3 | David and Goliath #5 | "LF step forward then LF straightforward punch" | Same: LH? |
| Q4 | Basic Form 2 #4 | "With LF step (behind) 180-degrees now facing L w/LF forward, face L w/RF in rear, LH downward block" | Which way is the student facing at the end of #4? "face L w/RF in rear" looks copied from #1. |
| Q5 | Basic Form 2 #5 | "180- degree turn w/RF leading, end facing L w/RF forward" | After a 180° turn from facing L, should it end facing **R** (as in BF1 #5)? |
| Q6 | Basic Form 2 #8 | "180- degree turn w/RF leading, end facing L w/RF forward" | Same: facing R? |
| Q7 | Key On #4 | "Raise LH to L ear, then step w/RF, end facing R" | The other katas say "Raise LH fist (across body) to R ear." Is L ear right? |
| Q8 | Key On #5 | "Raise RH to R ear, look over L shoulder then 180- degree turn w/LF leading" | Is R ear right (others say across to the opposite ear)? Is "L shoulder" right? |

**Also found (same treatment, not fixed):**

| ID | Kata, step | Original text | Question |
| --- | --- | --- | --- |
| Q9 | Key On #4 | "then step w/RF, end facing R" | No turn size is given (other steps say "180-degree"). Which way is the student facing before this step? |
| Q10 | Key On #3 | "step forward w/LF into front stance, LH downward block (over LL) then RH straight forward punch." | BF1 and BF2 step forward with RF before the RH punch. Is there no step here? |
| Q11 | Key On #6 | "LF Step back into cat stance (now facing forward, then forward w/RF" | The bracket never closes. Where does "now facing forward" end? |
| Q12 | Basic Form 2 #3 and #6 | "RF reverse kick w/ RF landing forward" | #1 says "reverse straight forward kick". Are these the same kick? |
| Q13 | David and Goliath #8 | "Hide L fist behind head/raise to L ear" | Same-side ear, unlike "across body to the opposite ear" in other katas. Is that right? |
| Q14 | David and Goliath end | Ends at #12, then "END FORM" with no "move to attention & bow out" line | Is the bow out left out on purpose (#12 already ends at attention)? |
| Q15 | David and Goliath #4 | "Pivot on the balls of feet, face L w/RF in rear" | #3 moves forward toward the front. Is this a 90° pivot to the left side of the floor? |
| Q16 | David and Goliath, note after #11 | "1st Person point-if-view" | Small typo ("of"). Should we show the note in the game, or keep it only in the source text? |

Until Jay answers, the game data keeps the school's text exactly and leaves `facing` empty on these steps.

## 7. Proposed board items

| ID | Item | Owner | Done when | Waits on | Scope (launch April 2027) |
| --- | --- | --- | --- | --- | --- |
| S3-J1 | Answer Q1–Q16 | Jay | Every question has an answer written in `docs/curriculum.md` (Katas section) | Nothing | Launch (needed for K1) |
| S3-J2 | Kata character lines (J3) for Key On and David and Goliath | Jay | One line each in `curriculum.md` | Nothing | Launch only if those Forms are in launch scope (D3) |
| S3-K1 | Kata data files for the first 4 katas + `moves.json` + check test | Content | 4 files load; the test passes; every `text` matches the school sheet word for word; open steps have `question` set | S3-J1 for `facing` (files can start before) | Launch |
| S3-P1 | Load kata files and show the kata card on the Abilities tab | Programmer | An earned kata's card shows name, Form, step count, kiai steps and a direction picture; an unearned one shows what to sign off | S3-K1, D1 | Launch |
| S3-A1 | Direction picture + move icons (Low block, punch, kick, Catch, turn, kiai) | Artist | Icons for every move in `moves.json` for the first 4 katas, readable at phone size | S3-K1 | Launch |
| S3-D1 | Key On and David and Goliath Forms (name, effect, reason) | Researcher & Planner | Two rows added to the Forms table, each with one strength, at most one cost, and a one-line reason a kid can follow | S3-J2 | Milestone 10 unless D3 says launch |
| S3-P2 | Kata Practice room ("follow the arrows") | Programmer | Opens from an earned kata card; one step at a time; no score, timer, fail or loot; Done returns to the card | S3-P1, S3-A1, D2 | **After launch** (recommended) |
| S3-T1 | Check kata cards against the school sheets | Tester | Each card and practice step matches the source file; no step shown where a question is still open | S3-P1 | Launch |

New katas later: Jay sends the sheet → Content adds one file (S3-K1 pattern) → Researcher & Planner lists questions and drafts the Form → Jay approves. No code item needed.

## 8. Decisions needed

- **D1:** Show the school's full step text in the game, or only names, step counts and arrows? **Recommend:** names, counts and arrows, so the school's text stays the school's and kids learn the steps in class.
- **D2:** Is the Practice room wanted? **Recommend:** yes, but after launch (S3-P2).
- **D3:** Are the Key On and David and Goliath Forms launch scope? decisions.md places later-belt powers in milestone 10. **Recommend:** keep them in milestone 10. At launch, the cards say "arriving in a later update."
- **D4:** Board ID: confirm this is **S3** (not S5, which is Difficulty).
