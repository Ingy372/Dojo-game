import { chromium } from 'playwright';
import fs from 'fs';
const [NAME,PORT,W,H,RM]=[process.argv[2],process.argv[3],+process.argv[4],+process.argv[5],process.argv[6]];
const tag=`k30-${NAME}-rm${RM}-${W}`;
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,hasTouch:true});
await ctx.addInitScript(k=>{localStorage.clear();localStorage.setItem('dojo-ascent-test-student','4-green-belt');localStorage.setItem('dojo.reducedMotion',k);},RM);
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
await pg.goto(`http://localhost:${PORT}/?room=keepers-hall&difficulty=standard`);
await pg.waitForFunction(()=>window.game?.scene?.getScenes?.(true).length);
await pg.waitForTimeout(6000);await pg.mouse.click(W/2,H/2);await pg.waitForTimeout(2500);
if(await pg.evaluate(()=>window.game.scene.getScenes(true).some(s=>s.scene.key==='Create'))){await pg.mouse.click(W*0.84,H*0.9);}
await pg.waitForFunction(()=>window.game.scene.getScenes(true).some(s=>s.scene.key==='Game'),null,{timeout:30000});
await pg.waitForTimeout(1500);await pg.mouse.click(W/2,H*0.66);await pg.waitForTimeout(600);await pg.mouse.click(W/2,H*0.66);await pg.waitForTimeout(1500);
await pg.evaluate(()=>{const s=window.game.scene.getScene('Game');window.__S=[];window.__bang=[];
 const DS=window.game.scale.displayScale.x;
 const toScr=(cam,r)=>({l:((r.left-cam.worldView.x)*cam.zoom+cam.x)/DS,r:((r.right-cam.worldView.x)*cam.zoom+cam.x)/DS,t:((r.top-cam.worldView.y)*cam.zoom+cam.y)/DS,b:((r.bottom-cam.worldView.y)*cam.zoom+cam.y)/DS});
 const ov=(a,c)=>!(a.r<c.l||a.l>c.r||a.b<c.t||a.t>c.b);
//.bind(s);s.floatText=(at,txt,...r)=>{const o=of(at,txt,...r);if(txt==='!'){const boss=s.world.enemies.find(e=>e.def.boss);window.__bang.push({at:{x:+at.x.toFixed(2),y:+at.y.toFixed(2)},boss:boss?{x:+boss.pos.x.toFixed(2),y:+boss.pos.y.toFixed(2),r:boss.def.radius}:null});}return o};
 const ow=s.windupCueSpot.bind(s);s.windupCueSpot=(x,y,top,r)=>{const o=ow(x,y,top,r);const boss=s.world.enemies.find(e=>e.def.boss);const v=boss&&s.enemyViews.get(boss.id);if(v&&Math.abs(v.container.x-x)<1&&window.__bang.length<200){const head=y-top;window.__bang.push({cueX:+(o.x-x).toFixed(1),cueY_vs_headTop:+(o.y-head).toFixed(1),top:+top.toFixed(1),r:+r.toFixed(1),label:s.doorViews.filter(d=>d.label.text==='HOME').map(d=>{const b=d.label.getBounds();return !(b.right<o.x-22||b.left>o.x+22||b.bottom<o.y-22||b.top>o.y+22)})[0]});}return o};
 s.events.on('postupdate',()=>{const cam=s.cameras.main,ui=s.uiCamera;const boss=s.world.enemies.find(e=>e.def.boss&&e.mode!=='defeated');if(!boss)return;const v=s.enemyViews.get(boss.id);
  const home=s.doorViews.filter(d=>d.label.text==='HOME').map(d=>toScr(cam,d.label.getBounds()));
  const sp=v.sprite?.container?.getBounds?v.sprite.container.getBounds():v.container.getBounds();
  const R=boss.def.radius*48;const headW={left:v.container.x-R,right:v.container.x+R,top:v.container.y-v.top,bottom:v.container.y-v.top*0.4};
  const head=toScr(cam,headW);
  const bars=[v.hpBack,v.hpFill].filter(Boolean).map(o=>toScr(cam,o.getBounds()));
  const name=s.bossName.visible?toScr(ui,s.bossName.getBounds()):null;
  const W=window.game.scale.width/DS;const w=Math.max(140,Math.min(300,window.game.scale.width/DS*0+((s.scale.width)/ (s.cameras.main.zoom?1:1))-450));
  for(const h of home){const hit={head:ov(h,head),bar:bars.some(x=>ov(h,x)),name:name?ov(h,name):false};window.__S.push({h,head,bar:bars[0],name,hit});}
 });});

await pg.evaluate(()=>{const s=window.game.scene.getScene('Game');s.world.guide=undefined;s.guideSpeed=()=>1;});
await pg.keyboard.down('w');await pg.waitForTimeout(6000);await pg.keyboard.up('w');
await pg.screenshot({path:`/workspace/qa/k29k30/${tag}-walk.png`});
// sweep: park boss at spots under the HOME door, one frame each
const grid=[];for(const dy of [0.4,0.8,1.2,1.6,2.0,2.4])for(const dx of [-1.2,-0.6,0,0.6,1.2])grid.push([dx,dy]);
const sweep=[];let k=0;
for(const [dx,dy] of grid){
 await pg.evaluate(([dx,dy])=>{const s=window.game.scene.getScene('Game');const d=s.doorViews.find(d=>d.label.text==='HOME');const boss=s.world.enemies.find(e=>e.def.boss);const T=48;window.__park={x:d.at.x+dx,y:Math.max(d.label.y,d.at.y*T)/T+dy};if(!window.__parkOn){window.__parkOn=1;s.events.on('preupdate',()=>{if(window.__park){boss.pos.x=window.__park.x;boss.pos.y=window.__park.y;boss.mode=boss.mode==='defeated'?'defeated':boss.mode;boss.health=boss.def.maxHealth;}});}window.__S=[];},[dx,dy]);
 await pg.waitForTimeout(350);
 const r=await pg.evaluate(()=>({n:window.__S.length,bad:window.__S.filter(x=>x.hit.head||x.hit.bar||x.hit.name).length,last:window.__S[window.__S.length-1],cont:(()=>{const s=window.game.scene.getScene('Game');const boss=s.world.enemies.find(e=>e.def.boss);const v=s.enemyViews.get(boss.id);return [Math.round(v.container.x),Math.round(v.container.y),boss.pos.x.toFixed(2),boss.pos.y.toFixed(2),boss.mode]})()}));
 sweep.push({dx,dy,...r});
 if(r.bad||[0,12,17].includes(k))await pg.screenshot({path:`/workspace/qa/k29k30/${tag}-park-${dx}_${dy}.png`});k++;
}
fs.writeFileSync(`/workspace/qa/k29k30/${tag}-sweep.json`,JSON.stringify(sweep,null,1));
console.log(tag,'sweep bad spots',sweep.filter(x=>x.bad).map(x=>`${x.dx},${x.dy}:${JSON.stringify(x.last.hit)}`).join(' '));
await pg.evaluate(()=>{window.__park=null});
const r=await pg.evaluate(()=>({n:window.__S.length,hits:window.__S.filter(x=>x.hit.head||x.hit.bar||x.hit.name).length,hitKinds:window.__S.reduce((a,x)=>{for(const k in x.hit)if(x.hit[k])a[k]=(a[k]||0)+1;return a},{}),first:window.__S[0],worst:window.__S.find(x=>x.hit.head||x.hit.bar||x.hit.name)||null,bang:window.__bang.slice(0,2),bangN:window.__bang.length,bangOnHome:window.__bang.filter(b=>b.label).length}));
fs.writeFileSync(`/workspace/qa/k29k30/${tag}.json`,JSON.stringify({...r,errs},null,1));
console.log(tag,JSON.stringify({n:r.n,hits:r.hits,kinds:r.hitKinds,bang:r.bang[0],bangN:r.bangN,bangOnHome:r.bangOnHome,errs:errs.length}));await b.close();
