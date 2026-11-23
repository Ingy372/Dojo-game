#!/bin/bash
# Nov 23 re-render (no chest patch, 18 hairs): every hero sheet from the current hero v2 models, then the staff.
# The models already have add_hairs.py applied (render_all.sh does that step when rebuilding from scratch).
set -e
B="/c/Program Files/Blender Foundation/Blender 5.3/blender.exe"
S=incoming-art/claude-hero-v2/source
W=$(cygpath -w "$PWD")
for BODY in a b; do
  "$B" -b $S/player_hero2_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites/body-$BODY" --name player-$BODY --height 160 --anchor-y 0.856 \
    --anims bow,celebrate,counter,dash,defeat,hit,idle,jab,straighten,strike,sweep,walk,wipe
  echo "BASE_DONE $BODY"
  "$B" -b $S/player_hero2_kata_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites-kata/body-$BODY" --name player-$BODY --height 160 --anchor-y 0.856 \
    --anims kata_backfist,kata_break_hold,kata_break_hold_finish,kata_front_kick_stacked,kata_front_kick_stacked_left,kata_high_block,kata_inside_block,kata_low_block,kata_open_leg,kata_punch,kata_rear_leg_front_kick,kata_rear_leg_front_kick_left,kata_reverse_inside_block,kata_reverse_punch,kata_spear_hand,kata_special_turn,stance_cat,stance_front,stance_horse
  echo "KATA_DONE $BODY"
done
# skins sit over the chest, so only their model is rebuilt (the stances are made from it)
for BODY in a b; do "$B" -b $S/player_hero2_$BODY.blend -P $S/build_skins.py -- --save "$W/$S/player_hero2_skins_$BODY.blend"; done
echo SKINS_MODEL_DONE
bash $S/render_stances.sh && echo STANCES_DONE
for BODY in a b; do
  "$B" -b $S/player_hero2_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites-stage/body-$BODY" --name player-$BODY \
    --size 256 --height 320 --anchor-y 0.856 --anims idle --directions S
done
echo STAGE_DONE
bash incoming-art/claude-staff/source/render_staff.sh
echo ALL_NOV23_RENDERED
