# Delivery Note: Batch 7, dojo people, FULL SET, 2026-10-17

**WHAT:** the full Batch 7 set for all five characters: `sensei`, `senpai`, `kohai`, `instructor-2` and `founder`.

- **Sheets** (`sprites/<id>/`): 8 directions, 128 × 160 px frames, feet anchor (64, 136.96), in the same JSON format as `player.json`.
  - Every character has `idle`, `walk`, `bow`, `talk`, `nod` and `point`.
  - Sensei and Senpai also have `demonstrate`.
  - `walk` is a calm walk at about 2 tiles/s, with `groundMotion` (stride and design speed), like the player's walk.
  - `point` holds its last frame.
- **Portraits** (`portraits/<id>/`): 512 × 512 transparent, in 4 expressions (`neutral`, `happy`, `proud`, `thinking`), with the belt at the bottom edge.
  - Flattened PNGs use the default colours: `<id>_portrait_<expression>.png`.
  - The layers and a JSON are there too, so the game can tint the gi and belt like the sprites.
- **Layers:**
  - `body` (real colours);
  - `gi` (tinted);
  - the player's belt set (tinted with `beltStyles`);
  - for the founder only, an optional `headband` overlay, **off by default**.
- **Default colours:**

| Id | Gi | Belt |
| --- | --- | --- |
| `sensei` | charcoal `#4a4a55` | Black |
| `senpai` | white | Brown/Black |
| `kohai` | white | White |
| `instructor-2` | blue `#3f7fd0` | Black |
| `founder` | white | Black |

- **instructor-2's new ponytail** (her request): her hair is her natural dark brown, pulled back into a low ponytail tied at the back of the head. The ponytail itself is purple.
  - It's clearly unlike Senpai's high ponytail, which is tied on the crown and swings out behind.
  - It sweeps behind her left shoulder, so the purple shows from the front as well as from the side and back.
  - It hangs from the chest bone, so it follows her in the bow.
- **The closed gi collar** is on every character: no skin shows at the neck.
- **Portrait gi:** less puffy than in the samples (less smoothing on the gi).
- **Previews** (in `preview/`):
  - `lineup-S-3x.png`: everyone next to the player, facing you;
  - `lineup-8dir.png`: the line-up in all 8 directions;
  - `portrait-sheet.png`: all 20 portraits (rows: Sensei, instructor-2, founder, Senpai, Kohai; columns: neutral, happy, proud, thinking);
  - `instructor-2-ponytail-3x.png`: the ponytail in 8 directions, idle and mid-bow;
  - `founder-headband.png`: the optional headband, switched on;
  - `gif/<id>_<animation>.gif`: a GIF of every animation, all 8 directions.

**WHY:** Jay approved samples 3. This is the full set the brief asks for, with his decisions applied:
- the idle personality touches stay;
- the shared body shape stays;
- the portrait direction stays, with less gi puffiness;
- the collar is closed on every new character;
- the Batch 6 player's neck oval stays as it is for now.

**DECIDE**
1. **Names:** the names and how each character is introduced come from the Content Writer. The files use the ids above.
2. **Demonstrate for instructor-2 and the founder:** the brief gives `demonstrate` to Sensei and Senpai only. Should instructor-2 and the founder get it too? It's the same approved block and punch, and about 5 minutes of rendering each.
3. **Where the two extra characters appear** (instructor-2 and the founder) is for Jay and Claude Code. Their art works anywhere the other dojo people do.
4. **The player's neck oval** (Batch 6) is left as it is (Jay). It would be a future patch, only if it's noticeable in the game. That's about 3 hours of rendering.

**NEXT:** Batch 8, when Jay says go.
