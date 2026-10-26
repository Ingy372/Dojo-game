W=$1;H=$2;RM=$3
node k28.mjs 1-white-belt-new $W $H standard $RM '' &
node k28.mjs 4-green-belt $W $H standard $RM '' &
node k28.mjs 4-green-belt $W $H guided $RM '' &
node k28.mjs 4-green-belt $W $H challenge $RM '' &
node k28.mjs 4-green-belt $W $H standard $RM brown &
node k28.mjs 1-white-belt-new $W $H guided $RM brown &
wait
