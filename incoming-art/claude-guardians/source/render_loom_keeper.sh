#!/bin/bash
# The Loom Keeper (Yellow Guardian, Nov 25): builds and renders both forms at the Floor Keeper's settings
# (512 px, 3.2 tiles = 160 px per tile, like Shades v2). From the repo root.
set -e
B="/c/Program Files/Blender Foundation/Blender 5.3/blender.exe"
G=incoming-art/claude-guardians
W=$(cygpath -w "$PWD")
for f in 1 2; do
  name=loom-keeper; [ $f = 2 ] && name=loom-keeper-f2
  "$B" -b -P $G/source/build_loom_keeper.py -- --enemy keeper --form $f --out "$W/$G/source/blend/loom-keeper-f$f.blend"
  rm -rf $G/$name/sprites
  "$B" -b $G/source/blend/loom-keeper-f$f.blend -P incoming-art/tools/render_sprites.py -- --out "$W/$G/$name/sprites" --name $name --size 512 --ortho 3.2
done
echo LOOM_RENDERED
