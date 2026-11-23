#!/bin/bash
# Adds the skins to both v2 hero bodies and renders only the skin layers (every base animation). From the repo root.
set -e
B="/c/Program Files/Blender Foundation/Blender 5.3/blender.exe"
S=incoming-art/claude-hero-v2/source
W=$(cygpath -w "$PWD")
for BODY in a b; do
  "$B" -b $S/player_hero2_$BODY.blend -P $S/build_skins.py -- --save "$W/$S/player_hero2_skins_$BODY.blend"
  LAYERS=$("$B" -b $S/player_hero2_skins_$BODY.blend --python-expr "import bpy;print('LAYERS='+','.join(c.name[2:] for c in bpy.data.collections if c.get('sprite_group') in ('outfit','hat','back')))" 2>/dev/null | grep '^LAYERS=' | cut -d= -f2)
  "$B" -b $S/player_hero2_skins_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites-skins/body-$BODY" --name player-$BODY --height 160 --anchor-y 0.856 \
    --anims bow,celebrate,counter,dash,defeat,hit,idle,jab,straighten,strike,sweep,walk,wipe --layers "$LAYERS"
done
echo SKINS_RENDERED
