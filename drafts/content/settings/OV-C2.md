# OV-C2: Blessing-in-runs and belt-entry words

Words only, for the Programmer (OV-B5 and OV-B7). Written Nov 14, 2026 (America/New_York) by the Content Writer. Nothing in `content/` was changed.

## Blessing in runs (`drafts/content/settings/blessing-in-runs.json`)

A class adds **5** runs. The Blessing holds at most **10**. No hours and no countdown, so a child who has class at 6 pm and a bedtime never sees time ticking away (review 8.6). Missing class takes nothing away.

| Use | Line | Words |
|---|---|---|
| Title | Dojo Blessing! | 2 |
| After a class, celebration (replaces "Dojo Blessing for 48 hours") | Dojo Blessing for your next runs! | 6 |
| Home card, 2 or more (replaces "Blessing +50% XP · {hours}h left") | Blessing on for {n} more runs. | 6 |
| Home card, 1 left | Blessing on for one more run. | 6 |
| Just after class | Class time helps your next five runs! | 7 |
| At the cap of 10 | Blessing ready for ten Tower runs. | 6 |

Staff test line: "Dojo Blessing: on ({n} runs)".

## Belt entry (`drafts/content/settings/belt-entry-parent.json`)

**Who may enter it:** a grown-up, not the student. That is the parent note.

**Fix path (behind the grown-up gate):** "Fix a mistake". A wrong belt can be corrected; it does not only go up. Confirm with "Change the saved belt to {entry}?" / "Yes, fix it" / "Not yet".

The saved-belt lines already in `content/settings/belt-entry.json` are kept ("Saved: {belt}…") and are 8 words or fewer.

## DECIDE
- A parent-set PIN is in the review (8.2 #1) but not in OV-B7's Done when. Should the Programmer add one now, or keep the current grown-up sum question?
- Remove belt entry when the DojoForge feed arrives (review 8.2 #1). Later work; not in this file.

Check: `python3 drafts/content/tools/check-ov-c2-words.py`.
