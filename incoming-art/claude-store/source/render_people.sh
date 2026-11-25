#!/bin/bash
# Builds and renders the people in the Street Smarts store (Nov 24) from the hero v2 model, with the staff script's
# everyday clothes: Mom, Dad, the store worker, the cashier, a shopper and a stranger.
# Usage (repository root): bash incoming-art/claude-store/source/render_people.sh [who ...]
set -e
B="/c/Program Files/Blender Foundation/Blender 5.3/blender.exe"
S=incoming-art/claude-staff/source
D=incoming-art/claude-store/source
W=$(cygpath -w "$PWD")
WHO_LIST=${@:-"mom:b dad:a worker:a cashier:b shopper:a stranger:b"}
for spec in $WHO_LIST; do
  WHO=${spec%:*}; BODY=${spec#*:}
  "$B" -b incoming-art/claude-hero-v2/source/player_hero2_$BODY.blend -P $S/build_staff.py -- --who $WHO --save "$W/$D/people_$WHO.blend"
  "$B" -b $D/people_$WHO.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-store/people/$WHO" --name people-$WHO \
    --height 192 --anchor-y 0.88 --anims npc_idle,npc_wave,npc_walk
done
echo PEOPLE_RENDERED
