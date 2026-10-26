import { chromium } from 'playwright';
import fs from 'fs';
const tw=JSON.parse(fs.readFileSync('/workspace/dojo-game/content/twists/twists.json')).twists;
const msgs={battle:'Bamboo Hall',challenge:'Gauntlet\nClear the room in 2 minutes for a better chest!'};
const b=await chromium.launch();const out=[];
for(const [W,H] of [[844,390],[667,375]]){const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
 for(const t of tw)for(const [mk,m] of Object.entries(msgs)){
  await pg.goto(`file:///workspace/qa/q4/banner.html?t=${encodeURIComponent(JSON.stringify(t))}&m=${encodeURIComponent(m)}`);
  await pg.waitForFunction(()=>window.R);const r=await pg.evaluate(()=>window.R);
  await pg.screenshot({path:`/workspace/qa/q4/${W}x${H}-${t.id}-${mk}.png`});out.push({W,H,id:t.id,mk,...r,overlap:r.bottom>r.msgTop});}}
console.log(JSON.stringify(out,null,0).replace(/\},/g,'}\n'));await b.close();
