import { chromium } from 'playwright';
import fs from 'fs';
// node k28.mjs PROFILE W H DIFF RM(on|off) BELT(''|brown) ROOM
const [p,W,H,D,RM,BELT,ROOM]=[process.argv[2],+process.argv[3],+process.argv[4],process.argv[5],process.argv[6],process.argv[7]||'',process.argv[8]||'brute-and-swarm'];
const tag=`${ROOM}-${p}-${BELT||'own'}-${D}-rm${RM}-${W}`;
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,hasTouch:true});
await ctx.addInitScript(k=>{localStorage.clear();localStorage.setItem('dojo-ascent-test-student',k[0]);localStorage.setItem('dojo.reducedMotion',k[1]);},[p,RM]);
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
const q=ROOM==='training'?`room=training`:`room=${ROOM}&named=old-thumper`;
await pg.goto(`http://localhost:5287/?${q}&difficulty=${D}`);
await pg.waitForFunction(()=>window.game?.scene?.getScenes?.(true).length);
if(BELT) await pg.evaluate(async(belt)=>{const u=performance.getEntriesByType('resource').map(e=>e.name).find(n=>n.includes('/game/student.ts'));const m=await import(u);m.FAKE_PROFILES.forEach(f=>f.feed.rank.currentBelt=belt);},BELT);
await pg.waitForTimeout(7000);await pg.mouse.click(W/2,H/2);await pg.waitForTimeout(2500);
if(await pg.evaluate(()=>window.game.scene.getScenes(true).some(s=>s.scene.key==='Create'))){await pg.mouse.click(W*0.84,H*0.9);}
await pg.waitForFunction(()=>window.game.scene.getScenes(true).some(s=>s.scene.key==='Game'),null,{timeout:30000});
await pg.waitForTimeout(1500);
const bow=await pg.evaluate(()=>{const s=window.game.scene.getScene('Game');const DS=window.game.scale.displayScale.x;const t=s.children.list.find(c=>c.text==='Bow'||c.list?.some?.(x=>x.text==='Bow'));if(!t)return null;const m=t.getWorldTransformMatrix?t.getWorldTransformMatrix():null;return {x:(m?m.tx:t.x)/DS,y:(m?m.ty:t.y)/DS}});
await pg.mouse.click(W/2,H*0.66);await pg.waitForTimeout(600);await pg.mouse.click(W/2,H*0.66);
await pg.waitForTimeout(2500);
await pg.evaluate(async()=>{const s=window.game.scene.getScene('Game');const cam=s.cameras.main;const L=window.__log={shake:[],impact:[],windup:[],warn:[],frames:0,off:0,maxOff:0,diff:s.world?.difficulty,named:!!s.run?.named,tier:null};
 try{L.tier=s.shakeScale?[s.shakeScale('hurt'),s.shakeScale('windup'),s.shakeScale('block')]:null}catch(e){L.tier=String(e)}
 if(s.world)s.world.guide=undefined;s.guideSpeed=()=>1;
 const os=cam.shake.bind(cam);cam.shake=(d,i,...r)=>{L.shake.push({t:Math.round(performance.now()),d,i:+(i*cam.width).toFixed(2)});return os(d,i,...r)};
 const oi=s.impact.bind(s);s.impact=(f,sc)=>{L.impact.push({t:Math.round(performance.now()),hurt:f===s.constructor.FEEL?.hurt,f:JSON.stringify(f).slice(0,60),sc});return oi(f,sc)};
 const u=performance.getEntriesByType('resource').map(e=>e.name).find(n=>n.includes('/audio/Sfx.ts'));const m=await import(u);const ow=m.sfx.windup.bind(m.sfx);m.sfx.windup=(sec)=>{L.windup.push({t:Math.round(performance.now()),sec});return ow(sec)};
 const ws=s.warnings.set.bind(s.warnings);s.warnings.set=(k,v)=>{L.warn.push({t:Math.round(performance.now()),ms:Math.round(v.until-s.time.now)});return ws(k,v)};
 s.events.on('postupdate',()=>{const e=cam.shakeEffect;const o=Math.hypot(e._offsetX||0,e._offsetY||0);L.frames++;if(e.isRunning)L.off++;L.maxOff=Math.max(L.maxOff,o)});});
const t0=Date.now();let shots=0;
while(Date.now()-t0<30000){await pg.waitForTimeout(300);
 const n=await pg.evaluate(()=>window.__log.shake.length+window.__log.windup.length);
 if(n>0&&shots<2&&W){await pg.screenshot({path:`/workspace/qa/k28/${tag}-${shots}.png`});shots++;}}
const log=await pg.evaluate(()=>window.__log);
await pg.screenshot({path:`/workspace/qa/k28/${tag}-end.png`});
const out={tag,diff:log.diff,named:log.named,scales:log.tier,impacts:log.impact.length,impactScales:[...new Set(log.impact.map(x=>x.sc))],shakeCalls:log.shake,windup:log.windup.slice(0,4),warn:log.warn.slice(0,4),framesShaking:log.off,frames:log.frames,maxOffsetPx:+log.maxOff.toFixed(2),errs};
fs.writeFileSync(`/workspace/qa/k28/${tag}.json`,JSON.stringify(out,null,1));
console.log(JSON.stringify({...out,shakeCalls:log.shake.length}));
await b.close();
