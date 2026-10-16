# Sources and licenses

Everything in `incoming-art/` that wasn't made from scratch by the Art Director bot is listed here with its license, so it's all safe to use in a commercial app.

| What | Where it's used | Source | License |
| --- | --- | --- | --- |
| (nothing yet) | | | |

Notes:
- **character-test/**: the model, rig, animations, materials and scripts were all made from scratch in Blender with Python. No Mixamo, no downloaded models, no textures, no fonts.
- **player-character/** (Batch 1): built by the same scripts (`character-test/source/build_character.py --profile player`, `tools/`). Also made from scratch; nothing outside the project was used. The belt and bow revision and the rest of Batch 1 (dash, hit flinch, cleaning with the broom and cloth props, celebrate) are the same: script changes only.
- **Blender 4.2 LTS** was the tool used to make them. Blender is free software (GPL), and the GPL does not cover the art you make with it, so the renders and `.blend` files belong to the project.
- The labels in the preview pictures use Pillow's built-in default font. The previews are only for review and don't go into the game.
