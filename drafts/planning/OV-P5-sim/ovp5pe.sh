#!/bin/bash
# usage: ovp5pe.sh CARDS TAG "id,id,..."   -> PE per card for kid (100 seeds) newer, careful (50 seeds); one process per card per bot, 8 at a time
CARDS=$1; TAG=$2; IDS=$3; cd /tmp/dojo-lp; mkdir -p /tmp/ovp5
for bot in kid newer careful; do s=50; [ $bot = kid ] && s=100
 for id in ${IDS//,/ }; do CARDS=$CARDS OVMODE=pe BOT=$bot SEEDS=$s HELD=$id OUT=/tmp/ovp5/$TAG-pe-$bot-$id.json npx vitest run -c drafts/planning/OV-P5-sim/vitest.ov-p5.config.ts >/dev/null 2>&1 &
  while [ $(jobs -r | wc -l) -ge 8 ]; do sleep 0.5; done; done; done; wait
python3 - "$TAG" "$IDS" <<'PY'
import json,sys
tag,ids=sys.argv[1],sys.argv[2].split(',')
print(f"{tag:6s} {'card':22s} kid   newer careful")
for i in ids:
  v=[json.load(open(f'/tmp/ovp5/{tag}-pe-{b}-{i}.json'))[f'pe:{i}'] for b in ('kid','newer','careful')]
  flag=' FAIL' if v[0]<12 or v[0]>26 or max(v)>26 else ''
  print(f"{tag:6s} {i:22s} {v[0]:5.1f} {v[1]:5.1f} {v[2]:5.1f}{flag}")
PY
