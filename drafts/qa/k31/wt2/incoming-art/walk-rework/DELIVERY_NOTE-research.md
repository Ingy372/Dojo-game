# Delivery Note: walk research and samples R1 / R2

Jay picked Arms 1 and rated it 6.5/10. **Arms 1 stays as the fallback and is unchanged.**

- `WALK-RESEARCH.md`: cited notes on Stardew Valley, CrossCode, Sea of Stars, Eastward and Minish Cap, plus general animation guides, with 5 takeaways. For Minish Cap I found no reliable source, and the file says so.
- `source/research_samples.py` builds both samples on top of Arms 1 (`ARMS=1 ... -P arms.py -P research_samples.py`).
  - **Sample R1 (arms only).** The legs are identical to the current walk: the script's LEGS_IDENTICAL check passes, and the leg rows have 0 pixels different from Arms 1. Compared with Arms 1, R1 adds:
    - a lag of about 1 frame (0.65 rad instead of 0.50);
    - drag: the hands ease out of each extreme;
    - an arc: the hands are slightly higher at both ends of the swing.
  - **Sample R2 = R1 plus a 1 px body bob. ⚠ THIS SAMPLE CHANGES THE BODY/LEGS.** The hips dip about 1 px on the two contact frames (5 and 10) and come back up over 1 frame, shaped as a "bounce, not sine" (Pixeli, Lifebe). The feet stay planted, so the knees bend slightly more.
- Previews (current walk / Arms 1 / sample, S/E/N/SE, same size, layout and 30 fps as #175):
  - `preview/compare-sample-r1.gif`, `strip-sample-r1.png`;
  - `preview/compare-sample-r2.gif`, `strip-sample-r2.png`.
- `make_walk_compare.py` has a new optional `--mid` row. Its 2-row output is unchanged.
- Eyes: these are the original eyes from the restored `player_custom_a.blend`. The eyes were not touched.
- Body A only, walk only. No game code was changed.

**Second pass:**
- Re-read every cited number against its source.
- Checked that all 80 frames per sample (10 frames × 8 directions) are present, with no empty cells.
- R1 leg rows diff to 0 against Arms 1. R2 leg rows differ, as expected and as labelled.

DECIDE: R1 or R2, or stay on Arms 1. Should a 1 px body bob go into the game?
