# Hearth Cook guardian (B-ART3 group B)

This guardian follows the #211 concept and `drafts/content/bosses/hearth-cook.json`, which has three phases.

| Phase | id | Sprites |
|---|---|---|
| p1 | ladle (100%) | `hearth-cook/p1/sprites` |
| p2 | rush (66%) | `hearth-cook/p2/sprites` |
| p3 | pin (33%) | `hearth-cook/p3/sprites`; defeat is in this phase only |

- **Build:** `source/build_hearth_cook.py`, then the shared `render_sprites.py` at 256 / 3.2.
- **Previews:** `preview/p1`, `preview/p2`, `preview/p3`, made with `tools/make_creature_preview.py --sheets`.
- **Look:** the body is a round pot-belly. The head is merged into the body, the cap sits low, and the mitts are amber. The ladle and pin are held at the side or low, and nothing goes above the head. There is no red: the warm colours are amber and orange.
- **Red check (PIL HSV, telegraph layers skipped):** p1 18 px, p2 28 px, p3 0 px. These are anti-aliased edge pixels of 3–8 px per sprite, not red areas.
- **Red in the previews:** the windup previews show red because the preview tool tints the telegraph layer.
