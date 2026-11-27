#!/bin/bash
# The opening cutscene's catch-and-tuck (Jay approved Nov 27): only the 'tuck' animation, facing the camera (S),
# every layer (each face and hair). The game uses a one-direction sheet for every direction. From the repository root.
set -e
B="/c/Program Files/Blender Foundation/Blender 5.3/blender.exe"
S=incoming-art/claude-hero-v2/source
W=$(cygpath -w "$PWD")
for BODY in a b; do
  "$B" -b $S/player_hero2_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites-intro/body-$BODY" --name player-$BODY \
    --height 160 --anchor-y 0.856 --anims tuck --directions S &
done
wait
echo INTRO_RENDERED
