#!/bin/bash
# Batch 7 samples: renders the sample sheets (not committed; sprites/samples/ is git-ignored) and the 512 px portraits.
#   bash incoming-art/dojo-people/source/make_samples.sh        (from the repo root; about 15 minutes, 2 Blender jobs)
set -e
OUT=incoming-art/dojo-people/sprites/samples
R=incoming-art/tools/render_sprites.py; S=incoming-art/dojo-people/source
sprites() {   # who anims
  blender -b $S/$1.blend -P $R -- --out $OUT/$1 --name $1 --anims $2 --height 160 --anchor-y 0.856 > $OUT/$1.log 2>&1
}
portrait() {  # who rigScale headScale hairTop(rig z)
  read O Y < <(python3 -c "
import math; s,h,t=$2,$3,$4; top=s*(0.95+(t-0.95)*h)+0.05*s; bot=s*0.565; o=top-bot; zc=(top+bot)/2
print(round(o,4), round(0.5+zc*math.cos(math.radians(5))/o,4))")
  blender -b $S/$1.blend -P $S/portrait_prep.py -P $R -- --out $OUT/$1-portrait --name $1_portrait --anims portrait --directions S \
      --size 512 --elevation 5 --ortho $O --anchor-y $Y --samples 32 > $OUT/$1-portrait.log 2>&1
}
mkdir -p $OUT
( sprites sensei idle,bow,demonstrate; sprites kohai idle,bow; echo lane1 done ) &
( sprites senpai idle,bow; portrait sensei 1.28 0.80 1.33; portrait senpai 1.10 0.88 1.35; portrait kohai 0.84 1.06 1.37; echo lane2 done ) &
wait
echo ALL DONE
