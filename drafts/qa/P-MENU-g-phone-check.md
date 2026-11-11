# P-MENU-g — before/after phone check

## Delivery Note

| | |
|---|---|
| **ITEM** | P-MENU-g (`docs/work-board.md`) |
| **WHAT** | Before/after phone check of menus touched by P-MENU-c/d/e (hub left column, Gear, Gate + shared rounded `button()`), small + large phones, Reduced motion on/off. |
| **WHY** | Board Done when: *Notes posted; no tap missed by a 6-year-old in 10 tries per control.* Manager pass line: centre + seeded ±10 CSS px, 10 tries. |
| **DECIDE** | **PASS** the pass line on **after**. No control missed 0/10 under ±10 once `tapArea` ≥ 44×44 is applied (P-MENU-a already grew hits; c/d/e raise the *drawn* size to match). |
| **NEXT** | Optional polish: Dojo top chips still *draw* at 32 pt tall (hit is 44); Gate lock labels stay tight on 667. Not blockers for P-MENU-g. |

**SHAs:** before = `3cbc0b3f` (main parent of #254 P-MENU-c merge); after = `51f2fc5e` (current `origin/main`).  
**Live:** matches **after** (byte-identical normalized `index-*.js`, len 642379).  
**Serves:** `/tmp` worktrees, vite preview `:4173` before / `:4174` after.  
**Shots:** `/workspace/qa-pmenu-g-shots/` (54 files). This note → Manager commits to `drafts/qa/P-MENU-g-phone-check.md`.

---

## Verdict

# **PASS**

No 6-year-old miss in 10 tries (±10 CSS px from centre) on any listed control **after** P-MENU-c/d/e. Same geometric result **before** for controls that already used `tapArea()` (hit box already ≥44). The win from c/d/e is **visible targets now match the hit box** (Practice was drawn 30 pt before; Gate READY no longer blinks forever).

---

## Per-control table (misses / 10)

Method: hit box = `tapArea(w,h)` = grow drawn size to ≥ `MIN_TAP` 44 (`tokens.ts`). Ten taps: centre + seeded ±10 CSS px. Miss = point outside hit box (would not fire). Playwright confirmed Board/Gear/Gate/Settings open at 667×375, 844×390, 932×430; RM read back from `dojo.reducedMotion` before shots (`0`/`1`).

| Control | Drawn before → after | Hit before → after | Misses before | Misses after | ≥44 hit? | Pass |
|---|---|---|---|---|---|---|
| ENTER THE TOWER | 280×46 → 280×52 (short: ×44) | 280×46 → 280×52 | 0/10 | 0/10 | yes | **PASS** |
| Practice room | **280×30** → **280×44** | 280×44 → 280×44 | 0/10 | 0/10 | yes | **PASS** |
| ◀ Dojo | **84×30** → **96×44** | 84×44 → 96×44 | 0/10 | 0/10 | yes | **PASS** |
| Board tabs (h 34) | 80×34 → 80×34 | 80×44 → 80×44 | 0/10 | 0/10 | yes | **PASS** |
| Gear card | 48×48 → **56×56** | 48×48 → 56×56 | 0/10 | 0/10 | yes | **PASS** |
| Wear / Let go | ~120×40 → 120×44 | 120×44 → 120×44 | 0/10 | 0/10 | yes | **PASS** |
| Gear page arrow | 36×36 → **44×44** | 44×44 → 44×44 | 0/10 | 0/10 | yes | **PASS** |
| Settings difficulty / RM | ~200×40 → 200×44 | 200×44 → 200×44 | 0/10 | 0/10 | yes | **PASS** |
| CreateScene primary | ~160×36 → 160×44 | 160×44 → 160×44 | 0/10 | 0/10 | yes | **PASS** |
| Dojo Board / Settings chips | 80×32 → 80×32 | 80×44 → 80×44 | 0/10 | 0/10 | yes | **PASS** |
| Gate READY chip | text blink → **one pop, still** | display-only (not a tap) | — | — | n/a | **PASS** (P-MENU-e: no endless blink) |

---

## verify-ui-shots

| Check | Result | Evidence |
|---|---|---|
| Sizes 667×375 (DPR2), 844×390 (DPR2), 932×430 (DPR3), landscape touch | Done | `*-667x375-*`, `*-844x390-*`, `*-932x430-*` |
| Reduced motion ON and OFF; value read back | Done | `rmRead` `0`/`1` from `dojo.reducedMotion` before each board shot |
| Tap ≥44×44 CSS px | **PASS** after (hit); drawn now ≥44 on hub/Practice/Create/Settings | `button()` + `tapArea` |
| Padding ≥8 px | **PASS** on Board chrome (S2=8 tokens) | `after-667x375-rmOFF-gate.png` |
| Contrast ≥4.5:1 | **PASS** body/title on dark wood | Gate / Board shots |
| Nothing clipped / overlapping | **PASS** on Gate after; celebration overlay can cover Board until dismissed | `after-667x375-rmOFF-gate.png` vs board with overlay |
| Crowding >80% | **Flag** Gate lock row on 667 (7 locks + 3-line labels) — readable, tight | `after-667x375-rmOFF-gate.png` |
| Anim start / mid / end | Tab swap + RM fade | `after-667x375-anim-tab-{0,mid,end}.png`, `*-rmON-*` |

---

## Bugs

| What I did | What happened | Expected | Severity |
|---|---|---|---|
| Seeded Green profile without a full `seen` snapshot, opened Board | Sign-off celebration overlay covered the Training Board until dismissed | Clean Board for menu QA (or auto-skip when `seen` set) | **SMALL** (test seed); not a P-MENU-c/d/e regression |
| Compared Dojo top Board/Settings chips after | Still **drawn** 32 pt tall (hit 44 via `tapArea`) | Drawn ≥44 would match finger aim better | **SMALL** / polish |
| Watched Gate READY before vs after | Before: endless alpha blink; after: one pop then still | P-MENU-e Done when | Fixed (PASS) |

No BLOCKS PLAY. No wrong-control fires under ±10 on shared `button()` hits.

---

## Playability notes

| | |
|---|---|
| **6yo** | After: Practice / Dojo / Create look big enough to aim at; ENTER is obvious. Gate locks are small pictures but not the main taps. Celebration “tap anywhere” is easy. |
| **12yo** | Gear 56 cards and Wear sheet feel fine; tabs easy. Lock labels on 667 are the only cramped bit. |
| **Adult** | RM on: tab swap is a short fade (120 ms), READY doesn’t pulse forever — calmer. Left column on 375 fits without clipping ENTER. |

---

## Setup log

- Worktrees: `/tmp/pmenug-before@3cbc0b3f`, `/tmp/pmenug-after@51f2fc5e` (removed after run).
- Builds: `npm run build -w @dojo/client`; preview 4173/4174.
- Live confirmed = after.
