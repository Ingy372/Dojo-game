# B-BELT re-run — PR #246 (head 2ccae23) — 2026-10-25

## Delivery Note
- ITEM: B-BELT re-run, PR #246 (head 2ccae23).
- WHAT: PASS. Changing the belt now resets stripes to 0. The "Are you sure?" card shows before every save, and nothing is written to storage until "Yes, save". The original done-when still holds: Yellow 2, the unlocks, the promotion, persistence after a restart, and greyed-out lower belts that do nothing. Checked at 667x375 and 844x390, Reduced motion off and on (stored as 'on'). No console errors.
- WHY: belts can only go up, so a fast or mistaken tap must not give a kid stripes they didn't earn.
- DECIDE: nothing new. The open choice from the first run still stands: should the promotion play right after Save, or on the next dojo visit (what it does now)?
- NEXT: nothing for the Programmer. Note: #246 is ALREADY MERGED into main (merge 3022b7b). origin/main at the time (d875e6a) was an ancestor of 2ccae23.

## Bugs (most serious first)
1. **SMALL: the confirm card's "no" button says "Back".** The belt screen behind it also has a "Back" button that means "leave without saving". Both are safe, but "No" or "Not yet" would be clearer. Evidence: b246-rmoff-667-confirm.png.
2. **SMALL (carried over): the promotion waits for the next dojo visit.** Unchanged since the first run, and still waiting on Jay's decision.

## Passed (all 4 runs: 667/844 x RM off/on)
- Stripe reset: Yellow 2 → Orange gives Orange 0. Orange 2 → Yellow gives Yellow 0. White gives White 0. Once Yellow 2 is saved, going Yellow → Orange → Yellow comes back at the floor (Yellow 2), not lower.
- Confirm card: "Are you sure? / Save Yellow Belt, 2 stripes? Belts here can only go up, so this can't be lowered later." with Back and Yes, save buttons (rounded, 44 px tall). The full-screen backdrop blocks taps on the chips behind it.
- Nothing is saved before Yes: localStorage beltEntry stays null while the card is open, after the card's Back (the belt screen stays open with the pick kept), and after reloading the page with the card still open.
- Yes, save (double tap): saved once, toast "Saved: Yellow Belt, 2 stripes", belt yellow, tier 2, stripes {yellow:2}, level cap 20, storage {"belt":"yellow","stripes":2}.
- Restart: PROMOTION → "Sam earned the Yellow Belt!" → "The Gate opens!" → the techniques list. It doesn't repeat on a 2nd reload. Yellow 2 persists.
- Lower belts: White and stripes 0 and 1 are at alpha 0.35 and not interactive. 10 taps on White plus 5 each on 0 and 1 changed nothing and played no sound.
- errors: [] in all runs.

## Playability: confirm card
- 6-year-old: won't get past the gate math, so they won't see it. If they did, "Are you sure?" plus a big green button might get tapped anyway. The gate is the real lock.
- 12-year-old: can read it and understands "can't be lowered". The card makes it a deliberate choice, not an accident, which is good.
- Adult: short, clear, and it says exactly what will be saved. It catches the fast-tap mistake from the first run. Would prefer "No" over "Back".

Evidence: /workspace/qa/batch1025b/b246-* (screenshots), run/rr.mjs and run/log-b246-*.txt.
