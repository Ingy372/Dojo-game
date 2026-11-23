#!/bin/bash
# The two Stance idles (Rooted, Flowing) in the v2 look, every layer including the skins. From the repo root.
set -e
B="/c/Program Files/Blender Foundation/Blender 5.3/blender.exe"
S=incoming-art/claude-hero-v2/source
W=$(cygpath -w "$PWD")
T=$(cygpath -w "$TEMP")
for BODY in a b; do
  "$B" -b $S/player_hero2_skins_$BODY.blend -P incoming-art/form-stances-a2/source/add_stances.py -- --out "$T\hero2_stances_$BODY.blend"
  "$B" -b "$T\hero2_stances_$BODY.blend" -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites-stances/body-$BODY" --name player-$BODY --height 160 --anchor-y 0.856 --anims stance_rooted,stance_flowing
done
echo STANCES_RENDERED
