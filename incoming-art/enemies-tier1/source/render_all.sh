#!/usr/bin/env bash
# Dojo Ascent - build and render every Tier 1 enemy (Art Director bot, Batch 2). Run from the repository root.
#   bash incoming-art/enemies-tier1/source/render_all.sh [swarmer shield brute keeper]
set -euo pipefail
D=incoming-art/enemies-tier1
T=incoming-art/tools
for E in "${@:-swarmer shield brute keeper}"; do
  for e in $E; do
    SIZE=128; ORTHO=1.6
    if [ "$e" = keeper ]; then SIZE=256; ORTHO=3.2; fi      # bigger frame, same 80 px per tile
    if [ "$e" = brute ]; then SIZE=208; ORTHO=2.6; fi       # the wide Brute, his big fists and rims need room
    blender -b -P $D/source/build_enemy.py -- --enemy $e --out $PWD/$D/source/$e.blend
    rm -rf /tmp/enemy_$e
    blender -b $D/source/$e.blend -P $T/render_sprites.py -- --out /tmp/enemy_$e --name $e --size $SIZE --ortho $ORTHO > /tmp/enemy_$e.log
    if [ "$e" = shield ]; then   # broken-shield variant: same rig, only the shield-broken layer
      blender -b -P $D/source/build_enemy.py -- --enemy shield --broken --out $PWD/$D/source/shield_broken.blend
      rm -rf /tmp/enemy_shieldb
      blender -b $D/source/shield_broken.blend -P $T/render_sprites.py -- --out /tmp/enemy_shieldb --name shield \
        --layers shield-broken > /tmp/enemy_shieldb.log
      cp /tmp/enemy_shieldb/shield_shield-broken_*.png /tmp/enemy_$e/
    fi
    rm -rf $D/$e/sprites && mkdir -p $D/$e && cp -r /tmp/enemy_$e $D/$e/sprites
    W=""; [ "$e" = shield ] && W="--with shield"
    python3 $T/make_creature_preview.py --sheets $D/$e/sprites --out $D/$e/preview $W
  done
done
