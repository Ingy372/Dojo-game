# C-STORY-TRY: go-home Sensei line

The guided-loss `retry` line ("That's okay. Try again whenever you're ready.") points to a Try again button that is gone. After a loss the player goes home (decisions.md, #292).

- **A:** "Nice work today. Let's rest at the dojo." (echoes #292's "Let's rest at the dojo.")
- **B:** "You learned a lot. Home we go!" (echoes #292's "You learned this room!")

Target: `lesson-counter-guided.retry`. The same string is the `retry` in 10 other lessons; the Programmer may swap all of them at once. No word "perfect", no guilt, no new mechanics.

## Decided (Oct 26)

Jay picked **A: "Nice work today. Let's rest at the dojo."** everywhere the old string appears (t513u, via the Manager).

**Correction:** the old string is in exactly 10 lessons. `lesson-counter-guided.retry` is "So close! Let's try again." (the in-practice line during the slowdown), so it is not in the swap.

### Programmer handoff
File: `content/tutorial/first-session-lessons.json`, field `retry`, old "That's okay. Try again whenever you're ready." to new "Nice work today. Let's rest at the dojo.", in these lessons:
- `lesson-warning`
- `lesson-counter-hint-2`
- `lesson-counter-hint-3`
- `lesson-strike`
- `lesson-dash`
- `lesson-insights`
- `lesson-decorating`
- `lesson-perfect`
- `lesson-block`
- `lesson-step-out`
