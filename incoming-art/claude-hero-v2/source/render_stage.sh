#!/bin/bash
# The shop's big preview (Nov 22, Jay: "everything looks too pixelated" there): the idle facing the camera, at twice
# the game's resolution, for the hero (every face and hair), every skin, and every pet. From the repository root.
set -e
B="/c/Program Files/Blender Foundation/Blender 5.3/blender.exe"
S=incoming-art/claude-hero-v2/source
W=$(cygpath -w "$PWD")
for BODY in a b; do
  "$B" -b $S/player_hero2_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites-stage/body-$BODY" --name player-$BODY \
    --size 256 --height 320 --anchor-y 0.856 --anims idle --directions S
  LAYERS=$("$B" -b $S/player_hero2_skins_$BODY.blend --python-expr "import bpy;print('LAYERS='+','.join(c.name[2:] for c in bpy.data.collections if c.get('sprite_group') in ('outfit','hat','back')))" 2>/dev/null | grep '^LAYERS=' | cut -d= -f2)
  "$B" -b $S/player_hero2_skins_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites-stage-skins/body-$BODY" --name player-$BODY \
    --size 256 --height 320 --anchor-y 0.856 --anims idle --directions S --layers "$LAYERS"
done
for PET in baby-dragon little-turtle lucky-koi red-panda spirit-fox wise-owl; do
  "$B" -b incoming-art/claude-pets/source/blend/$PET.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-pets/sprites-stage/$PET" --name pet-$PET \
    --size 192 --ortho 1.2 --anchor-y 0.8 --anims idle --directions SW
done
echo STAGE_RENDERED
