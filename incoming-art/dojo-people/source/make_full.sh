#!/bin/bash
# Batch 7 FULL SET: 8-direction sheets for every animation, and the 512 px portraits in 4 expressions.
#   bash incoming-art/dojo-people/source/make_full.sh               (from the repo root; about 35 min with 2 Blender lanes)
#   ONLY="sensei founder" PARTS="sprites portraits" bash ...        (some characters / parts only)
# Sheets go to sprites/<id>/ (committed). Portrait renders go to $RAW/<id>-<expression>/ (not in the repo);
# make_people_full_preview.py turns them into portraits/<id>/ (flattened PNGs plus the layer PNGs and a JSON).
set -e
OUT=incoming-art/dojo-people/sprites; RAW=${RAW:-/workspace/r7/full/portraits}
R=incoming-art/tools/render_sprites.py; S=incoming-art/dojo-people/source
ONLY=${ONLY:-"sensei senpai kohai instructor-2 founder"}; PARTS=${PARTS:-"sprites portraits"}
want() { [[ " $ONLY " == *" $1 "* && " $PARTS " == *" $2 "* ]]; }
sprites() {   # who anims
  want $1 sprites || return 0
  blender -b $S/$1.blend -P $R -- --out $OUT/$1 --name $1 --anims $2 --height 160 --anchor-y 0.856 > $OUT/$1.log 2>&1
  touch $OUT/$1.DONE
}
portraits() {  # who rigScale headScale hairTop(rig z)
  want $1 portraits || return 0
  read O Y < <(python3 -c "
import math; s,h,t=$2,$3,$4; top=s*(0.95+(t-0.95)*h)+0.05*s; bot=s*0.565; o=top-bot; zc=(top+bot)/2
print(round(o,4), round(0.5+zc*math.cos(math.radians(5))/o,4))")
  for ex in neutral happy proud thinking; do
    PORTRAIT_EXPR=$ex blender -b $S/$1.blend -P $S/portrait_prep.py -P $R -- --out $RAW/$1-$ex --name $1_portrait --anims portrait_$ex \
        --directions S --size 512 --elevation 5 --ortho $O --anchor-y $Y --samples 32 > $RAW/$1-$ex.log 2>&1
  done
  touch $RAW/$1.DONE
}
mkdir -p $OUT $RAW
BASE=idle,walk,bow,talk,nod,point
( sprites sensei $BASE,demonstrate; sprites founder $BASE; sprites kohai $BASE; echo lane1 done ) &
( sprites senpai $BASE,demonstrate; sprites instructor-2 $BASE
  portraits sensei 1.28 0.80 1.33; portraits instructor-2 1.20 0.84 1.35; portraits founder 1.26 0.81 1.30
  portraits senpai 1.10 0.88 1.35; portraits kohai 0.84 1.06 1.37; echo lane2 done ) &
wait
echo ALL DONE
