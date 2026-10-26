import { chromium } from 'playwright';
import fs from 'fs';
// usage: node shake.mjs PROFILE W H DIFF RM(''|'1') BELT(''|'brown')
const [p,W,H,D,RM,BELT]=[process.argv[2],+process.argv[3],+process.argv[4],process.argv[5],process.argv[6]||'',process.argv[7]||''];
const tag=`${p}-${BELT||'own'}-${D}-${RM?'rm':'motion'}-${W}`;
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,hasTouch:true});
await ctx.addInitScript(k=>{localStorage.clear();localStorage.setItem('dojo-ascent-test-student',k[0]);if(k[1])localStorage.setItem('dojo.reducedMotion',k[1]);},[p,RM?'on':'off']);
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
await pg.goto(`http://localhost:5250/?room=training&difficulty=${D}`);
await pg.waitForFunction(()=>window.game?.scene?.getScenes?.(true).length);
if(BELT) await pg.evaluate(async(belt)=>{const u=performance.getEntriesByType('resource').map(e=>e.name).find(n=>n.includes('/game/student.ts'));const m=await import(u);window.__u=u;m.FAKE_PROFILES.forEach(f=>f.feed.rank.currentBelt=belt);},BELT);
await pg.waitForTimeout(800);await pg.mouse.click(W/2,H/2);
await pg.waitForFunction(()=>window.game.scene.getScenes(true).some(s=>s.scene.key==='Game'),null,{timeout:15000});
const rmVal=await pg.evaluate(async()=>{const m=await import('/src/game/motion.ts');return m.reducedMotion();});
await pg.evaluate(()=>{const s=window.game.scene.getScene('Game');const cam=s.cameras.main;window.__log={shake:[],impact:[],off:0,frames:0,maxOff:0,diff:s.world?.difficulty};
 s.world.guide=undefined;s.guideSpeed=()=>1;const os=cam.shake.bind(cam);cam.shake=(d,i,...r)=>{window.__log.shake.push({t:s.time.now,d,i});return os(d,i,...r)};
 const oi=s.impact.bind(s);s.impact=(f,sc)=>{window.__log.impact.push({t:s.time.now,f:JSON.stringify(f),sc});return oi(f,sc)};
 s.events.on('postupdate',()=>{const e=cam.shakeEffect;const o=Math.hypot(e._offsetX||0,e._offsetY||0);window.__log.frames++;if(e.isRunning)window.__log.off++;window.__log.maxOff=Math.max(window.__log.maxOff,o)});
 s.events.on('postupdate',()=>{});});
// find STRIKE button text and tap it repeatedly; idle otherwise so enemies hit us
const strike=await pg.evaluate(()=>{const s=window.game.scene.getScene('Game');const DS=window.game.scale.displayScale.x;const t=s.children.list.find(c=>c.text==='STRIKE');return t?{x:t.x/DS,y:t.y/DS}:null});
const shots=[];let n=0;const t0=Date.now();
while(Date.now()-t0<40000){
  if(strike&&n%3===0) await pg.touchscreen.tap(strike.x,strike.y);
  const before=(await pg.evaluate(()=>window.__log.impact.length));
  await pg.waitForTimeout(250);n++;
  const L=await pg.evaluate(()=>({i:window.__log.impact.slice(-1)[0],n:window.__log.impact.length}));
  if(L.n>before&&shots.length<4&&/hurt|block|"stopMs":(?!0)/.test(L.i.f)){const f=`/workspace/qa/k25/${tag}-${shots.length}`;await pg.screenshot({path:f+'a.png'});await pg.waitForTimeout(16);await pg.screenshot({path:f+'b.png'});shots.push(f);}
}
const log=await pg.evaluate(()=>window.__log);
await pg.screenshot({path:`/workspace/qa/k25/${tag}-end.png`});
const kinds={};for(const x of log.impact){const k=x.sc===undefined?'attack(default 0)':`scale ${x.sc}`;kinds[k]=(kinds[k]||0)+1}
const out={tag,rmVal,diff:log.diff,impacts:log.impact.length,kinds,shakeCalls:log.shake,framesShaking:log.off,frames:log.frames,maxOffsetPx:log.maxOff,errs};
fs.writeFileSync(`/workspace/qa/k25/${tag}.json`,JSON.stringify(out,null,1));
console.log(JSON.stringify({...out,shakeCalls:log.shake.length}));
await b.close();
