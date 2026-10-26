# R-STANCE-READY-NUM: Open Leg Stance numbers

Open Leg Stance (Ready, id `ready-stance`) unlocks when a teacher signs it off, but all 11 of its numbers are 0, the same as Beginner's Stance. This doc proposes a small all-rounder bonus that fits **"Steady and even, ready for anything."** Beginner's Stance stays at 0 on purpose.

## The 11 fields (current → proposed)
| Field | Now | Proposed | Why |
|---|---|---|---|
| powerScale | 0 | **+0.03** | A little harder hits. Front is +0.08. |
| dashCooldownScale | 0 | **−0.10** (30 → 27 ticks) | Slightly quicker feet. Cat is −0.25. |
| blockCut | 0 | **+0.05** (blocks let 45% through, down from 50%) | Slightly firmer blocks. Fighting is +0.15. |
| focusGain | 0 | **+0.08** | Slightly faster Focus. Fighting is +0.20. |
| counterWindow | 0 | 0 | The smallest step is 1 tick, which would equal Cat, not be weaker. |
| attackSpeed | 0 | 0 | No stance changes it. |
| moveSpeed | 0 | 0 | No downside needed. |
| guardScale | 0 | 0 | Not used by any stance. |
| dashScale | 1 | 1 | Full Dash length. |
| stillPower / rootTicks | 0 / 0 | 0 / 0 | Horse's thing. |

No downsides. Nothing lowers power or guard, and nothing touches wind-ups.

## Compared with each specialist
| Vs | Open Leg | Specialist | Weaker? |
|---|---|---|---|
| Cat | dash recharge −10%, no counter bonus | dash recharge −25%, counter window +1 (blocks softer) | Yes |
| Front | power +3% | power +8%, push 0.5 tiles (move −10%) | Yes |
| Fighting | blocks let 45% through, Focus +8% | blocks let 35% through, Focus +20% (dash 2.0 tiles) | Yes |
| Horse | nothing while standing still | +10% after 0.5 s still (move −20%) | Yes |

**Cap check:** +3% power plus the R-KATA-POWERS (#302) kata maximum of +4% comes to +7%, under the +12% cap. That leaves 5 points of room.

## Test status
- **Band test (`r-bal-12-bands.test.ts`):** passes 293/293 with Ready's numbers applied to the default stance (a probe in `NO_STANCE`, reverted). **But this test is pure math at base player power and does not read stance numbers, so this result says nothing about Ready.**
- **Related coverage:** R-STANCE-c's stance-aware copy of the band math passed for power from +0% to +12%. +3% (or +7% with a kata) falls inside that range, but it was not re-run here.
- **Sims (smart / kid / masher bots):** untested. Run them in R-STANCE-d before shipping.
- **Rest of the suite:** with the probe in place, 9 tests failed. Without the probe, all tests pass (826 passed, 2 skipped). I did not check which 9 failed. They are most likely the golden-run and stance tests reacting to the changed default stance, but that is unconfirmed.

## Delivery Note
- **ITEM:** R-STANCE-READY-NUM
- **WHAT:** Open Leg Stance numbers: power +3%, dash recharge −10%, blocks +5%, Focus +8%. No downsides, and each is weaker than the matching specialist.
- **WHY:** a teacher sign-off should unlock something, not a copy of Beginner's Stance.
- **DECIDE:**
  1. Keep all 4 small bonuses, or only 2 or 3 (for example, drop power and leave the power room to katas)?
  2. Is "no downside" OK, given that the specialists have trade-offs?
- **NEXT:** the Programmer adds `ready-stance` with these numbers to `content/abilities/abilities.json` and updates the stance tests. Then the band test and smart, kid and masher sims run at every belt.
