#!/bin/bash
# Builds and renders the new Guardian forms at the Hearth Cook's game settings (256 px, 3.2 tiles). From the repo root.
set -e
B="/c/Program Files/Blender Foundation/Blender 5.3/blender.exe"
G=incoming-art/claude-guardians
W=$(cygpath -w "$PWD")
for spec in "hearth-cook 2 2 inferno-p2" "hearth-cook 2 3 inferno-p3" "lightbearer 1 1 lightbearer-f1" "lightbearer 2 2 lightbearer-f2" "lightbearer 3 3 lightbearer-f3"; do
  set -- $spec
  "$B" -b -P $G/source/build_guardian_forms.py -- --enemy hearth-cook --design $1 --form $2 --phase $3 --out "$W/$G/source/blend/$4.blend"
  "$B" -b $G/source/blend/$4.blend -P incoming-art/tools/render_sprites.py -- --out "$W/$G/$4/sprites" --name $4 --size 256 --ortho 3.2 --anchor-y 0.85
done
echo FORMS_RENDERED
