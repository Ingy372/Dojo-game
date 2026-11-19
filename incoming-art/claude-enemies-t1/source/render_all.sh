#!/usr/bin/env bash
# Shades v2 (Claude Code, Nov 18 2026): build and render every Tier 1 monster at 160 px per tile (twice the bot's 80),
# every animation and direction, into incoming-art/claude-enemies-t1/<enemy>/sprites. Run from the repository root.
#   BLENDER=/path/to/blender bash incoming-art/claude-enemies-t1/source/render_all.sh [swarmer shield brute keeper]
set -euo pipefail
B="${BLENDER:-blender}"
D=incoming-art/claude-enemies-t1
T=incoming-art/tools
TMP="${TMPDIR:-/tmp}/shades"
for e in ${@:-swarmer shield brute keeper}; do
  SIZE=256; ORTHO=1.6
  if [ "$e" = keeper ]; then SIZE=512; ORTHO=3.2; fi
  if [ "$e" = brute ]; then SIZE=416; ORTHO=2.6; fi
  "$B" -b -P $D/source/build_shades_v2.py -- --enemy $e --out "$PWD/$D/source/shades-v2/$e.blend"
  rm -rf "$TMP/$e"
  "$B" -b $D/source/shades-v2/$e.blend -P $T/render_sprites.py -- --out "$TMP/$e" --name $e --size $SIZE --ortho $ORTHO > "$TMP-$e.log"
  if [ "$e" = shield ]; then
    "$B" -b -P $D/source/build_shades_v2.py -- --enemy shield --broken --out "$PWD/$D/source/shades-v2/shield_broken.blend"
    rm -rf "$TMP/shieldb"
    "$B" -b $D/source/shades-v2/shield_broken.blend -P $T/render_sprites.py -- --out "$TMP/shieldb" --name shield \
      --size $SIZE --ortho $ORTHO --layers shield-broken > "$TMP-shieldb.log"
    cp "$TMP"/shieldb/shield_shield-broken_*.png "$TMP/$e/"
  fi
  rm -rf $D/$e/sprites && mkdir -p $D/$e && cp -r "$TMP/$e" $D/$e/sprites
done
