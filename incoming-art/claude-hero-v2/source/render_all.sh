#!/bin/bash
# Builds the v2 hero for both bodies and renders every animation (base set from the approved run model, kata set
# from the approved kata model). Usage: bash render_all.sh   (from the repository root)
set -e
B="/c/Program Files/Blender Foundation/Blender 5.3/blender.exe"
S=incoming-art/claude-hero-v2/source
W=$(cygpath -w "$PWD")
for BODY in a b; do
  "$B" -b incoming-art/claude-run/source/player_run_$BODY.blend -P $S/upgrade_hero.py -- --head 1.3 --save "$W/$S/player_hero2_$BODY.blend"
  "$B" -b incoming-art/claude-kata-moves/source/player_kata_$BODY.blend -P $S/upgrade_hero.py -- --head 1.3 --save "$W/$S/player_hero2_kata_$BODY.blend"
done
for BODY in a b; do
  "$B" -b $S/player_hero2_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites/body-$BODY" --name player-$BODY --height 160 --anchor-y 0.856 \
    --anims bow,celebrate,counter,dash,defeat,hit,idle,jab,straighten,strike,sweep,walk,wipe
  "$B" -b $S/player_hero2_kata_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites-kata/body-$BODY" --name player-$BODY --height 160 --anchor-y 0.856 \
    --anims kata_backfist,kata_break_hold,kata_break_hold_finish,kata_front_kick_stacked,kata_front_kick_stacked_left,kata_high_block,kata_inside_block,kata_low_block,kata_open_leg,kata_punch,kata_rear_leg_front_kick,kata_rear_leg_front_kick_left,kata_reverse_inside_block,kata_reverse_punch,kata_spear_hand,kata_special_turn,stance_cat,stance_front,stance_horse
done
echo ALL_RENDERED
