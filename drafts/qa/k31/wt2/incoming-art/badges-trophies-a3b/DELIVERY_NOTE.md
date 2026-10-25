# Delivery Note: A3b (branch `bot-art-a3b`, 2026-10-24)
**Base:** branched off `main` after #146 was merged (20:07 UTC = 4:07 PM EDT).
**What:** 29 certified trophies (every S6 ID with a CT reward) and 57 badges (all other S6 groups, plus the non-CT Dojo tiers). The bow badges already exist from A3. Per-layer files and a `static.json` are included. See README.md.
**Previews:**
- `review-1-certified-set-1x.png`: the whole certified set on 3 shelves;
- `review-2-categories-phone-half-size.png`: one trophy of each category at half size, with the default seal on top and Action Zone colours below;
- `review-3-badges-all.png`: every badge;
- `review-4-badges-phone-48px.png`: every badge at 48 px;
- `greyscale-1/2/3`: greyscale versions.

**Second pass:**
- Weeks and signoffs now take their tier from their position in the whole S6 family. Weeks 50/100 were coming out bronze and silver; they are now gold, and signoffs 1 → bronze, 50 → gold + gem.
- Stripes trophies show 1–4 tape bands by tier, so 4 identical columns no longer appear.
- Pips are bigger.
- Checked: the 7 categories read apart at half size and in greyscale.

**Known weak spots:**
- The stairs on `tower-floors` and the pips on the trophy plinth are small at 48 px. The metal and rays still carry the tier.

**DECIDE:**
1. **The Red and Red/Black belt bands use the belt palette `#d8352a`.** The existing `beltStyles` rule says the belt always shows the honest rank, and the Guardian gems follow the same rule. This is the only red. If red must not appear at all, use the `-TINT` mask with another colour, but that would misstate the rank.
2. Weeks 5/10/20 and signoffs 10/25 are badges, not CT, because S6 gives them aura or GT rewards. Should they get certified trophies too?
3. The accolade, journal-master and smarts-location pieces are single templates, with the name written by the game (C6). Do we want a unique piece for Student of the Month?
4. White Guardian gem: uses the white-belt fallback tan `#d2a878` (existing rule).

No outside assets. No baked text or numbers.

---
## Student of the Month (branch `bot-art-a3b-sotm`, 2026-10-24)
- **New:**
  - `source/make_sotm.py`;
  - `sprites/trophies/ct-accolade-student-of-the-month.png`, baked with the Action Zone seal backing and the default star mark;
  - `layers/ct-accolade-student-of-the-month-topper.png`, `layers/stand-pips0.png` and `layers/halo-pips0-gem.png`;
  - a `static.json` entry for `ach.dojo.accolade.student-of-the-month`.
- **Top piece:** a gold crescent moon (the month) holding a big star (the student), with a sky-blue gem on the post. It is the only curved, open silhouette in the set, so it reads apart from the cup, column, star, goblet, ring, scroll and shield.
- **Seal:** Action Zone backing (indigo, paper-warm and gold, from #146) with the default star until the logo arrives.
- **Previews:**
  - `review-5-sotm-vs-categories-1x/2x.png`: next to one of each category, all with the AZ seal;
  - `review-6-sotm-phone-half-size.png`, plus a greyscale version;
  - `review-7-sotm-closeup-AZ-default-grey.png`.
- **Second pass:**
  - shrank the crescent so its tip no longer crowds the seal or the canvas edge;
  - made the post longer so the moon reads as being on a stand;
  - fixed the greyscale close-up, which was losing transparency.
- **DECIDE:**
  - ~~The slug `student-of-the-month` is assumed.~~ **Decided (Manager, 2026-10-24):** the id `student-of-the-month` is confirmed.
  - ~~One trophy per month or one with a count?~~ **Decided (Manager, 2026-10-24):** one trophy, with the win count drawn under it.
