# Sources and licenses

Everything in `incoming-art/` that wasn't made from scratch by the Art Director bot is listed here with its license, so it's all safe to use in a commercial app.

| What | Where it's used | Source | License |
| --- | --- | --- | --- |
| **BIZ UDPMincho Bold** (font, by Morisawa Inc.) | `home-dojo/`: the kanji 心 on the Dojo Banner and 道 on the Calligraphy Scroll, turned into 3D text when the art is built (no font file ships with the art or the game) | [Google Fonts](https://fonts.google.com/specimen/BIZ+UDPMincho) | SIL Open Font License 1.1 (free, commercial use allowed) |

Notes:
- **character-test/**: the model, rig, animations, materials and scripts were all made from scratch in Blender with Python. No Mixamo, no downloaded models, no textures, no fonts.
- **player-character/** (Batch 1): built by the same scripts (`character-test/source/build_character.py --profile player`, `tools/`). Also made from scratch; nothing outside the project was used. The belt and bow revision and the rest of Batch 1 (dash, hit flinch, cleaning with the broom and cloth props, celebrate) are the same: script changes only.
- **enemies-tier1/** (Batch 2), **home-dojo/** (Batch 3) and **tower-rooms/** (Batch 4): built from scratch by scripts (`*/source/build_*.py`, `tools/toon_kit.py`, `tools/render_static.py`). No downloaded models or textures; the only outside thing is the kanji font above.
- **Blender 4.2 LTS** was the tool used to make them. Blender is free software (GPL), and the GPL does not cover the art you make with it, so the renders and `.blend` files belong to the project.
- The labels in the preview pictures use Pillow's built-in default font. The previews are only for review and don't go into the game.

**Batch 6 (customizable player): no outside assets.** All hair, faces and the second body are built from simple shapes by `player-custom/source/build_custom.py`. The textured-hair redesign was informed by public articles and guides, used as reference only, with nothing copied. The links are in `player-custom/research-textured-hair.md`. The full set (2026-10-16) is rendered from the same files, with no outside assets added.

**Batch 7 (dojo people, samples): no outside assets.** Built by `dojo-people/source/build_people.py` from the approved player models. Senpai and Kohai are made-up characters. From samples 2 (2026-10-17), Sensei, `instructor-2` and `founder` are friendly cartoon likenesses, based on reference photos provided by Jay (not stored in the repo). The full set (2026-10-17) is rendered from the same files, with no outside assets added; no photos are in the repo.

**Batch 8 (icons, full set) and Batch 9 (Yellow belt Tower kit, working label Sunrise Garden), 2026-10-24: no outside assets.** Built from scratch by `icons/source/build_icons.py`, `tower-rooms-t2/source/build_tower_t2.py` and `build_boss_door_t2.py` with `tools/`. **Elite aura samples (S1 #3):** drawn by code with Pillow (`elite-auras/source/make_auras.py`), no outside assets.

**S1 Guarding links + gold sparkle proposal (2026-10-24): no outside assets.** Drawn by code with Pillow (`elite-auras/source/make_guard_links.py`). Previews use only the project's own floor and enemy sprites.

**A1 earned cosmetics samples (2026-10-24): no outside assets.** The headband, wraps and gi trim are built from the approved player model by `cosmetics-a1/source/build_cosmetics.py`. The aura is drawn by code with Pillow (`make_aura.py`). The wrap colours come from the project's own gear icons.

**A5 padded-weapon enemy samples (2026-10-24): no outside assets.** Built by `enemy-padded-weapon/source/build_padded.py`, which is adapted from the Tier 1 enemy builder, with `tools/`.

**A7 QA fixes (2026-10-24): no outside assets.** These are edits to `player-custom/source/build_custom.py` and `dojo-people/source/build_people.py` only.

**A2 form stance samples (2026-10-24): no outside assets.** Built by `form-stances-a2/source/add_stances.py` on the approved player-custom blends, rendered with `tools/`.
**A5 padded-weapon enemy samples (2026-10-24): no outside assets.** Built by `enemy-padded-weapon/source/build_padded.py`, which is adapted from the Tier 1 enemy builder, with `tools/`. The full set (move, hit, stagger, defeat) comes from the same script, also with no outside assets.

**A6 decoration samples (2026-10-24): no outside assets.** Built by `decor-pool-a6/source/build_decor_a6.py` with helpers copied from the Home Dojo builder, rendered with `tools/`.

**A6 Tier 1 decoration set (2026-10-24): no outside assets.** Built by `decor-tier1-a6/source/build_decor_t1.py` (helpers from the Home Dojo builder; monster colours from `enemies-tier1/source`), rendered with `tools/`.

**S4c-A1 Injured status (2026-10-24): no outside assets in the sprites.** Drawn by `status-injured-s4c/source/make_injured.py` (PIL). The preview mock of the word uses the system Nunito font (SIL OFL); it is not shipped in any sprite.

**A3 badges and trophies (2026-10-24): no outside assets.** Drawn by `badges-trophies-a3/source/make_a3.py` (PIL). The wall preview reuses the decor-tier1-a6 Journal trophy. Preview labels use DejaVu Sans (Bitstream Vera licence) and are not in the sprites.

**A3 seal follow-up, school colours (2026-10-24).** Layers drawn by `badges-trophies-a3/source/make_a3_seal.py` (PIL), no outside images. The Action Zone seal palette uses only these values, copied exactly from the CSS custom properties on the public site https://actionzonecma.com/ (fetched 24 Oct 2026, ~4:10 PM EDT): `--color-indigo: #191a3e` (scallop), `--color-paper-warm: #efeadc` (seal face), `--color-gold: #c9a227` (face ring and ribbon tails). The same stylesheet also defines `--color-indigo-deep #0f1029`, `--color-gold-soft #e4c765`, `--color-gold-deep #80640e`, `--color-paper #faf9f5`, `--color-ink #1c1c17`, `--color-mist #67665b` (not used). **No logo is committed.** The site has a logo (`/_astro/logo-badge-no-figure.*.svg`, plus `favicon.svg`), but it was not downloaded or traced; the school mark is a clearly marked PLACEHOLDER layer until Jay supplies the logo file. Nothing in the repo (all branches, docs) contained an Action Zone logo or brand colours.
