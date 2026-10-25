W=$1;H=$2;RM=$3
for c in "1-white-belt-new guided" "1-white-belt-new standard" "1-white-belt-new challenge" "4-green-belt standard" "4-green-belt brown guided" "4-green-belt brown standard"; do
 set -- $c; P=$1; if [ "$2" = brown ]; then B=brown; D=$3; else B=""; D=$2; fi
 timeout 150 node shake.mjs $P $W $H $D "$RM" "$B" > /dev/null 2>>err.log &
done; wait
