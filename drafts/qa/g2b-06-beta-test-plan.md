# G2B-06: Batch 1 beta test plan

## Delivery Note

- **ITEM:** G2B-06 (board id `R-G2B-06` in `drafts/planning/R-GREEN-TO-BLACK.md`). Write the beta test plan for Batch 1.
- **WHAT:** 24 numbered cases below. Each has steps and a pass line. Cases that need R-G2B-01 (Strike order) or R-G2B-04 (Throw) are marked **run now** — both are on main (`#455` / strikes data, `#457` Throw). Docs only. No game code, no commit, no push.
- **WHY:** Dec 15 beta is White–Orange for 5–10 families. Batch 1 changes Strike order, old-save load, Throw on Perfect Counter, on-screen callouts, and how those feel on Guided / Standard / Challenge and with Reduced motion. This plan is what Tester runs before we hand phones to families.
- **DECIDE:** Jay, through the Manager: (1) Is 24 cases enough, or do you want a shorter smoke list for parents? (2) Callouts still live under `drafts/`; which on-screen names should the beta show for #1–10 after J27? (3) Lock stays `live: false` for the beta — confirm.
- **NEXT:** Tester runs the **run now** cases on a phone-sized build (667×375 and 844×390). Mark each pass/fail in a copy of this file. Cases tagged **wait** stay parked until their build lands.

**Written:** 2026-11-09 (America/New_York). Against `origin/main` `bbd00271`. File: `drafts/qa/g2b-06-beta-test-plan.md` on `bot-qa`.

## How to run

- Use a throwaway profile per belt unless the case says otherwise.
- Phone sizes: 667×375 and 844×390. Reduced motion: set the real setting, read it back, then capture.
- Pass = the pass line is true. Fail = write what you saw. Do not "almost" pass.

## Cases

### Strike order (R-G2B-01) — run now

1. **White Strike default.** New White profile. Open Strike slot. **Pass:** only Spin Kick is earned/default; Jumping Spins and Butterfly Flow are locked.
2. **Yellow earns Jumping Spins.** Yellow profile with kick combo #2 signed. **Pass:** Jumping Spins is earned; Butterfly Flow still locked.
3. **Orange earns Butterfly Flow.** Orange profile with kick combo #3 signed. **Pass:** Spin Kick, Jumping Spins, and Butterfly Flow are all earned; equipping Butterfly Flow works.
4. **Yellow cannot equip Butterfly Flow.** Yellow profile. Try to equip Butterfly Flow. **Pass:** equip is refused / locked; loadout unchanged.
5. **Jumping Spins feels like three hits.** In a room, equip Jumping Spins, spend Focus, land it on a brute. **Pass:** three hits land; first hit is lighter than Spin Kick’s single hit (feel check; numbers are still placeholders).

### Old save — run now

6. **Legacy Strike id loads.** Load a save that still has Strike id `quick-combo` (or seed one). **Pass:** it resolves to Jumping Spins; no crash; Strike slot shows Jumping Spins.
7. **Legacy `follow-up-kick` loads.** Same idea for `follow-up-kick`. **Pass:** resolves to Spin Kick; run continues.
8. **Pre-Throw profile.** Load a White/Yellow save from before #457. Enter a room, Perfect Counter a brute. **Pass:** no throw unless #11 is equipped; no soft-lock; Health/Focus sane.

### Throw state (R-G2B-04) — run now

9. **#11 throws a brute.** Orange (or any) profile with Outside Reap (#11) equipped. Perfect Counter a brute on the red circle. **Pass:** brute enters thrown, tumbles about 1 tile, stays down ~30 ticks, then gets up; event/feel matches kid Throw card.
10. **#12 bonus while down.** Equip Reap and Finish (#12). Hit a thrown enemy while down. **Pass:** damage is clearly higher than the same hit on a standing enemy (~+25%).
11. **Never throw a Guardian.** Floor Keeper / Hearth Cook room with #11 equipped. Perfect Counter the Guardian. **Pass:** Guardian is never thrown (stagger/other only).
12. **Never throw an elite.** Challenge/elite room with #11. **Pass:** elite is never thrown.
13. **Swarmer throws.** Perfect Counter a swarmer with #11. **Pass:** swarmer throws like a brute.
14. **Reduced motion Throw look.** Settings → Reduced motion ON (read back). Throw a brute. **Pass:** tumble/lie/get-up does not rely on motion the setting turns off (snaps / steady frames OK); still readable at 667×375.

### Callouts on screen — run now (names may still be draft)

15. **Seal callout on earn/equip.** Equip a live seal (#1–10 or #11). Trigger its callout. **Pass:** one short on-screen line; no injury words; no “break” outside Break Free; readable at 667×375.
16. **J27 name check (staff).** For seals #1–10, compare on-screen name to `drafts/content/abilities/J27-seal-renames` / curriculum. **Pass:** list mismatches; do not fail the build—report for Manager/Jay.
17. **Throw lesson line (if wired).** If G2B-05 lesson is live, clear it once. **Pass:** one new idea (Great Counter can knock down); ≤8 words on the lesson screen; retry is kind. If not wired: mark **wait** and skip.

### Difficulty — run now

18. **Guided Throw room.** Guided, #11 equipped, brute room. **Pass:** wind-ups stay readable; throw still needs a real Perfect Counter; Guided does not auto-throw.
19. **Standard Throw room.** Same on Standard. **Pass:** same throw rules; pace feels fair for age 6+.
20. **Challenge / elite room.** Green+ or Challenge flag on. **Pass:** #11 still never throws elites/Guardians; Challenge patterns still use purple !! for dash-only; no new red-on-purple confusion.

### Reduced motion (general) — run now

21. **RM ON boot.** Turn Reduced motion ON, kill app, reopen. **Pass:** setting stuck ON; boss zoom-out does not run; Throw look still OK (case 14).
22. **RM OFF animations.** Turn OFF, confirm Strike / Counter flash / telegraph pulse still play. **Pass:** motion returns; no stuck blank frames.
23. **Both phone sizes.** Repeat cases 9 and 15 at 844×390 and 667×375. **Pass:** tap targets ≥44×44; nothing clipped under HUD; Throw pose and callout clear on both.

### Smoke for parents (optional short path)

24. **Parent smoke (10 min).** New Yellow profile → one floor → equip Jumping Spins → one Perfect Counter without Throw → note confusion. Then Orange + #11 one throw. **Pass:** parent can say in one sentence what Strike and Throw did; no rage-quit; no pressure/purchase prompt.

## Playability watch (every session, by age)

Watch a 6-8, a 9-12 and a teen/adult student. Don't help unless they're stuck for more than a minute.
- [ ] **First minutes:** they start a room and fight with no help. Write down where they stopped or asked.
- [ ] **Fun:** their best moment (smile, "whoa", or showing a friend) and anything they called boring or slow.
- [ ] **Load:** too many new things at once? Did anything show up before their belt is ready?
- [ ] **Coming back:** ask "Would you play again this week? Why?" A goal or curiosity is good. "I have to" is a flag.
- [ ] **Balance:** too hard, too easy, or too slow to earn, on their difficulty.
- [ ] **Design rules:** no Power Rating shown, nothing for sale, no chat, no guilt, and real training still matters most.

Log bugs as what you did, what happened, what should have happened, and how bad it is (BLOCKS PLAY / ANNOYING / SMALL).
**Beta passes when** no BLOCKS PLAY bugs are open, every **run now** case passes, and at least two of the three age groups want to come back for a good reason.

Note: case names use today's main. If #460 (J27 renames) merges first, read Jumping Spins as Jumping Spin Kicks, Butterfly Flow as Butterfly Kick, and Outside Reap as Osotogari.

## Out of scope for this plan

- Lock / Break Free (G2B-09/11, after beta).
- Zap Kite zig-zag import (#444 art only).
- Green+ room sets and new enemy stats.
- Paying, ads, chat, leaderboards.

## Run log (fill in when testing)

| Case | Size | RM | Result | Note |
|---|---|---|---|---|
| | | | | |
