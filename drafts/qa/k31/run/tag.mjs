import { chromium } from 'playwright';
import fs from 'fs';
const [W,H,RM,COMBO]=[+process.argv[2],+process.argv[3],process.argv[4],process.argv[5]==='1'];
const tag=`k31-rm${RM}-${W}-combo${COMBO?1:0}`;
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,hasTouch:true});
await ctx.addInitScript(k=>{localStorage.clear();localStorage.setItem('dojo-ascent-test-student','4-green-belt');localStorage.setItem('dojo.reducedMotion',k);},RM);
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
await pg.goto(`http://localhost:5311/?room=keepers-hall&difficulty=standard`);
await pg.waitForFunction(()=>window.game?.scene?.getScenes?.(true).length);
await pg.waitForTimeout(6000);await pg.mouse.click(W/2,H/2);await pg.waitForTimeout(2500);
if(await pg.evaluate(()=>window.game.scene.getScenes(true).some(s=>s.scene.key==='Create'))){await pg.mouse.click(W*0.84,H*0.9);}
await pg.waitForFunction(()=>window.game.scene.getScenes(true).some(s=>s.scene.key==='Game'),null,{timeout:30000});
await pg.waitForTimeout(1500);await pg.mouse.click(W/2,H*0.66);await pg.waitForTimeout(600);await pg.mouse.click(W/2,H*0.66);await pg.waitForTimeout(1500);
await pg.evaluate((COMBO)=>{const s=window.game.scene.getScene('Game');s.world.guide=undefined;s.guideSpeed=()=>1;
 const DS=window.game.scale.displayScale.x;const SW=window.game.scale.width/DS,SH=window.game.scale.height/DS;
 const toScr=(cam,r)=>({l:((r.left-cam.worldView.x)*cam.zoom+cam.x)/DS,r:((r.right-cam.worldView.x)*cam.zoom+cam.x)/DS,t:((r.top-cam.worldView.y)*cam.zoom+cam.y)/DS,b:((r.bottom-cam.worldView.y)*cam.zoom+cam.y)/DS});
 const ov=(a,c,m=0)=>!(a.r+m<=c.l||a.l-m>=c.r||a.b+m<=c.t||a.t-m>=c.b);
 const boss=s.world.enemies.find(e=>e.def.boss);const p=s.world.players[s.me];
 window.__park=null;window.__F=[];
 s.events.on('preupdate',()=>{p.health=p.maxHealth;if(COMBO)p.combo=12;boss.health=boss.def.maxHealth;if(window.__park){const cam=s.cameras.main;boss.pos.x=(cam.worldView.x+window.__park.fx*cam.worldView.width)/48;boss.pos.y=(cam.worldView.y+window.__park.fy*cam.worldView.height)/48;}});
 s.events.on('postupdate',()=>{if(!window.__park)return;const cam=s.cameras.main,ui=s.uiCamera;const v=s.enemyViews.get(boss.id);if(!v||boss.mode==='defeated')return;
  const name=toScr(ui,s.bossName.getBounds());const bar=toScr(cam,v.hpBack.getBounds());
  const cue0=s.windupCueSpot(v.container.x,v.container.y,v.top,boss.def.radius*48);const cue=toScr(cam,{left:cue0.x-21,right:cue0.x+21,top:cue0.y-21,bottom:cue0.y+21});
  const home=s.doorViews.filter(d=>d.label.visible).map(d=>toScr(cam,d.label.getBounds()));
  const pbars={l:13,r:209,t:13,b:51};
  const bw=Math.max(140,Math.min(300,SW-450));const topbar={l:SW/2-bw/2-3,r:SW/2+bw/2+3,t:13,b:29};
  const combo=[s.comboText,s.comboBonusText].filter(c=>c.visible&&c.alpha>0.05&&c.text).map(c=>toScr(ui,c.getBounds()));
  const on=r=>r.l>=0&&r.t>=0&&r.r<=SW&&r.b<=SH;
  const iss=[];
  if(!on(name))iss.push('name-offscreen');if(!on(bar))iss.push('bar-offscreen');
  if(ov(name,bar))iss.push('name-bar');
  for(const [k,x] of [['pbars',pbars],['topbar',topbar],...combo.map(c=>['combo',c]),...home.map(h=>['home',h])]){if(ov(name,x))iss.push('name-'+k);if(ov(bar,x))iss.push('bar-'+k);}
  if(ov(name,cue))iss.push('name-cue');if(ov(bar,cue))iss.push('bar-cue');
  const pairDx=Math.round(((name.l+name.r)/2-(bar.l+bar.r)/2));const gap=Math.round(bar.t-name.b);const below=name.t>((v.container.y-cam.worldView.y)*cam.zoom/DS)-5;
  window.__F.push({iss,pairDx,gap,below,name,bar,cue,combo:combo.length,mode:boss.mode});});
},COMBO);
const fxs=[0,0.03,0.1,0.25,0.5,0.75,0.9,0.97,1],fys=[0,0.04,0.1,0.18,0.3,0.5,0.7,0.85,0.95,1];
const res=[];
for(const fy of fys)for(const fx of fxs){
 await pg.evaluate(([fx,fy])=>{window.__park={fx,fy};window.__F=[];},[fx,fy]);await pg.waitForTimeout(260);
 const r=await pg.evaluate(()=>{const F=window.__F.slice(3);const iss={};F.forEach(f=>f.iss.forEach(i=>iss[i]=(iss[i]||0)+1));const last=F[F.length-1];return {n:F.length,iss,dx:[...new Set(F.map(f=>f.pairDx))],gap:[...new Set(F.map(f=>f.gap))],below:last?.below,last};});
 res.push({fx,fy,...r});
 if(Object.keys(r.iss).length||[0,4,40,85,89].includes(res.length-1)) await pg.screenshot({path:`/workspace/qa/k31/${tag}-${fx}_${fy}.png`});
}
fs.writeFileSync(`/workspace/qa/k31/${tag}.json`,JSON.stringify({res,errs},null,1));
const bad=res.filter(r=>Object.keys(r.iss).length);const agg={};bad.forEach(r=>Object.keys(r.iss).forEach(k=>agg[k]=(agg[k]||0)+1));
console.log(tag,'spots',res.length,'badSpots',bad.length,JSON.stringify(agg),'dx',[...new Set(res.flatMap(r=>r.dx))].join(','),'gap',[...new Set(res.flatMap(r=>r.gap))].join(','),'below',res.filter(r=>r.below).length,'errs',errs.length);
await b.close();
