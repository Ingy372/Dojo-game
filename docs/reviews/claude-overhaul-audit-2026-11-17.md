# Claude's overhaul audit (Nov 17, 2026)

Jay handed the whole project to Claude Code on Nov 17 ("you are taking over completely"), after the Grok bot team paused at #547. This is what Claude found when reviewing everything the team built, and the order of work agreed with Jay.

## State of the game

- Builds for the live link and the beta. 1,614 automated checks pass.
- Built since October: story tutorial floor, the Path screen, the faith layer (FAITH DOES banner, verse scrolls, Creed), the Book, the earned-coin looks shop, Class Chests and the best-streak aura, Seal stages and the Lock hold, Guided start for ages 6–9, grown-up belt entry, kid-safety items (grown-up gate, wipe data, "saved on this phone"), the Capacitor phone-app wrapper, Orange (tier 3) art and Guardian, and the seven belt Guardians' enemy files.
- The foundation is good. The game needs holes patched, a polish pass and the beta finished, not a rebuild.

## Holes found

| # | Hole | Fix | Status |
|---|---|---|---|
| 1 | On Windows, 16 checks failed because files got Windows line endings. | `.gitattributes`: Linux line endings everywhere. | Fixed Nov 17 |
| 2 | The type check failed on `main` (`Array.at()` in one test). | Plain index instead. | Fixed Nov 17 |
| 3 | Nothing on GitHub checked changes before they were merged. | `.github/workflows/checks.yml`: tests, type checks, both builds on every push. | Fixed Nov 17 |
| 4 | A long time away could add 200 gear pieces to the bag at once. | At most 5 gear pieces per visit; every chest still pays coins and Dojo pieces. | Fixed Nov 17 |
| 5 | `GameScene.ts` (~3,800 lines) and `HomeScene.ts` (~2,800 lines) are hard to change safely, and many checks scan source wording instead of testing behaviour. | Split them step by step during the polish. | Open |
| 6 | The built game is about 59 MB; the plan says keep it small and load art per belt. | Measure what loads at start; load per tier. | Open |
| 7 | Many marked placeholders (Lock names, Guardian lines, Seal stage words and rings, kata powers, chest words). | Replace during the polish, with Jay's OK on words. | Open |
| 8 | About 400 leftover bot branches on GitHub; the task board on `main` stopped at Oct 25. | New board (Nov 17). Branch clean-up only with Jay's OK. | Board done; branches open |
| 9 | Progress lives only on the phone until the DojoForge connection (L12, needs Nic). | Known; beta families are told in the parent note. | Open (launch) |

## Beta (Dec 15) status

- Done: belt entry, kid safety, menus, Orange tier, phone-app wrapper (not yet built in the cloud).
- Blocked: neither Apple nor Google developer account exists yet (Nov 17), so cloud builds, TestFlight and Play testing can't start. The web link works today and is the fallback.
- Still to do: Jay's accounts, lawyer and tester families; Claude's cloud builds, store test uploads and a full beta test pass.
