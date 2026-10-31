#!/bin/bash
# usage: run3.sh tag configs diffs seeds [bots]   (env from caller)
tag=$1; cfgs=$2; diffs=$3; seeds=$4; bots=${5:-kid newer careful}
cd /workspace/dg/packages/sim
for b in $bots; do
  CONFIGS=$cfgs BOTS=$b DIFFS=$diffs SEEDS=$seeds OUT=/tmp/insight-bal/$tag-$b.jsonl BALANCE=1 npx vitest run test/balance/zz-insight-bal.test.ts > /tmp/insight-bal/$tag-$b.log 2>&1 &
done
wait
