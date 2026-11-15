#!/bin/bash
# usage: ovp5run.sh CARDS MODE TAG  -> /tmp/ovp5/TAG-MODE.json (merged over 10 belts, parallel)
CARDS=$1; M=$2; TAG=$3; mkdir -p /tmp/ovp5; cd /tmp/dojo-lp
for b in 1 2 3 4 5 6 7 8 9 10; do CARDS=$CARDS OVMODE=$M BELTS=$b SEEDS=${SEEDS:-150} DIFF=${DIFF:-standard} HELD=$HELD OUT=/tmp/ovp5/$TAG-$M-b$b.json npx vitest run -c drafts/planning/OV-P5-sim/vitest.ov-p5.config.ts >/dev/null 2>&1 & 
  while [ $(jobs -r | wc -l) -ge 8 ]; do sleep 0.5; done; done; wait
python3 - "$TAG" "$M" <<'PY'
import json,sys
tag,m=sys.argv[1:]; out={}
for b in range(1,11):
  d=json.load(open(f'/tmp/ovp5/{tag}-{m}-b{b}.json'))
  for k,v in d.items():
    if isinstance(v,list) and k!='belts': out.setdefault(k,[]).extend(v)
  seeds=d['seeds']
json.dump({'seeds':seeds,**out},open(f'/tmp/ovp5/{tag}-{m}.json','w'))
for k,v in out.items():
  p=[100*x/seeds for x in v]; print(f"{tag} {k:16s} mean {sum(p)/len(p):5.1f}  belts {' '.join(f'{x:.0f}' for x in p)}")
PY
