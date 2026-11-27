#!/bin/bash
# Hero v3 for the game (Jay approved Nov 27): applies hero_v3.py (upright jog, cuffs and hems, belt-tail sway) to both
# v2 bodies and their kata models, rebuilds the skins and stances from them, then renders every hero sheet at 1.5x
# (--size 192 --height 240, was 128 x 160) so the hero is as sharp on screen as the Brute. From the repository root.
# The game draws these packs at 1/1.5 ("res": 1.5 in tools/art-import/approved.json), so the hero keeps his size.
set -e
B="/c/Program Files/Blender Foundation/Blender 5.3/blender.exe"
S=incoming-art/claude-hero-v2/source
V=incoming-art/claude-hero-v3/source
W=$(cygpath -w "$PWD")
R="--size 192 --height 240 --anchor-y 0.856"
BASE=bow,celebrate,counter,dash,defeat,hit,idle,jab,straighten,strike,sweep,walk,wipe
KATA=kata_backfist,kata_break_hold,kata_break_hold_finish,kata_front_kick_stacked,kata_front_kick_stacked_left,kata_high_block,kata_inside_block,kata_low_block,kata_open_leg,kata_punch,kata_rear_leg_front_kick,kata_rear_leg_front_kick_left,kata_reverse_inside_block,kata_reverse_punch,kata_spear_hand,kata_special_turn,stance_cat,stance_front,stance_horse
skin_layers() { "$B" -b $S/player_hero2_skins_$1.blend --python-expr "import bpy;print('LAYERS='+','.join(c.name[2:] for c in bpy.data.collections if c.get('sprite_group') in ('outfit','hat','back')))" 2>/dev/null | grep '^LAYERS=' | cut -d= -f2; }

body() {
  local BODY=$1
  if [ "$SKIP_MODEL" != 1 ]; then
    "$B" -b $S/player_hero2_$BODY.blend -P $V/hero_v3.py -- --save "$W/$S/player_hero2_$BODY.blend" | grep -E "HERO_V3|Error"
    "$B" -b $S/player_hero2_kata_$BODY.blend -P $V/hero_v3.py -- --save "$W/$S/player_hero2_kata_$BODY.blend" | grep -E "HERO_V3|Error"
    "$B" -b $S/player_hero2_$BODY.blend -P $S/build_skins.py -- --save "$W/$S/player_hero2_skins_$BODY.blend" > /dev/null
    "$B" -b $S/player_hero2_skins_$BODY.blend -P $S/add_stances_b5.py -- --out "$W\incoming-art\claude-hero-v2\source\hero2_stances_$BODY.blend" > /dev/null
    echo "MODEL_DONE $BODY"
  fi
  "$B" -b $S/player_hero2_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites/body-$BODY" --name player-$BODY $R --anims $BASE > /dev/null
  echo "BASE_DONE $BODY"
  "$B" -b $S/player_hero2_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites-intro/body-$BODY" --name player-$BODY $R --anims tuck --directions S > /dev/null
  echo "INTRO_DONE $BODY"
  "$B" -b $S/player_hero2_kata_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites-kata/body-$BODY" --name player-$BODY $R --anims $KATA > /dev/null
  echo "KATA_DONE $BODY"
  "$B" -b $S/player_hero2_skins_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites-skins/body-$BODY" --name player-$BODY $R --anims $BASE --layers "$(skin_layers $BODY)" > /dev/null
  echo "SKINS_DONE $BODY"
  "$B" -b "$W\incoming-art\claude-hero-v2\source\hero2_stances_$BODY.blend" -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites-stances/body-$BODY" --name player-$BODY $R --anims stance_rooted,stance_flowing > /dev/null
  echo "STANCES_DONE $BODY"
  "$B" -b $S/player_hero2_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites-stage/body-$BODY" --name player-$BODY --size 256 --height 320 --anchor-y 0.856 --anims idle --directions S > /dev/null
  "$B" -b $S/player_hero2_skins_$BODY.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-hero-v2/sprites-stage-skins/body-$BODY" --name player-$BODY --size 256 --height 320 --anchor-y 0.856 --anims idle --directions S --layers "$(skin_layers $BODY)" > /dev/null
  echo "STAGE_DONE $BODY"
}
body a & body b & wait
find incoming-art/claude-hero-v2 -type d -name frames -prune -exec rm -rf {} +
echo ALL_V3_RENDERED
