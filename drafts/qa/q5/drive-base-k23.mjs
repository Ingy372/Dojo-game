import { chromium } from 'playwright';
import fs from 'fs';
const p=process.argv[2];const W=+process.argv[3]||667,H=+process.argv[4]||375;const q=process.argv[5]||'';
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:3,hasTouch:true});
await ctx.addInitScript(k=>{if(!sessionStorage.getItem('x')){localStorage.clear();localStorage.setItem('dojo-ascent-test-student',k);sessionStorage.setItem('x','1')}},p);
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
const t0=Date.now();await pg.goto('http://localhost:5240/'+q);await pg.waitForFunction(()=>window.game?.scene.getScenes(true).length);
const info=()=>pg.evaluate(()=>{const g=window.game;const act=g.scene.getScenes(true).map(s=>s.scene.key);const texts=[];
 for(const s of g.scene.getScenes(true)){const cam=s.cameras.main;const walk=(l,fixed)=>{for(const o of l){if(o.visible===false||(o.alpha??1)<0.05)continue;const fx=fixed||o.scrollFactorX===0||cam.ignore&&false;if(o.list)walk(o.list,fx);if(o.type==='Text'&&o.text){const bb=o.getBounds();texts.push({t:o.text,x:bb.centerX,y:bb.centerY})}}};walk(s.children.list,false)}
 const gs=g.scene.getScene('Game');let w=null;
 if(act.includes('Game')&&gs.world){const Wd=gs.world,cam=gs.cameras.main,T=48,sc=v=>({x:Math.min(Math.max((v.x*T-cam.worldView.x)*cam.zoom,60),innerWidth-60),y:Math.min(Math.max((v.y*T-cam.worldView.y)*cam.zoom,45),innerHeight-45)});const pl=Wd.players.p1;const foe=Wd.enemies.find(e=>e.mode!=='defeated');
  w={waiting:!!Wd.guide?.waiting,goal:Wd.goal&&!Wd.goal.reached?sc(Wd.goal.pos):null,foe:foe?{...sc(foe.pos),mode:foe.mode}:null,hp:pl.health,focus:pl.focus,chest:gs.room.chest&&!Wd.progress.chestOpened&&Wd.progress.cleared?sc(gs.room.chest):null,doors:Wd.progress.doorsOpen?gs.doorViews.map(d=>sc({x:d.at.x,y:d.at.y+0.5})):[],menu:gs.menuOpen};}
 return {act,texts,w};});
const tb=(I,re)=>I.texts.find(t=>re.test(t.t));
let firstPC=null,log=[],shot=0,lastScene='',tutorialDone=null,seen=new Set();
while(Date.now()-t0<+(process.env.T||300000)){let I;try{I=await info();}catch(e){errs.push('probe '+e.message);break;}
 const key=I.act.join('+');for(const t of I.texts)seen.add(t.t);
 if(key!==lastScene){lastScene=key;log.push([((Date.now()-t0)/1000).toFixed(1),key]);await pg.screenshot({path:`drive-${p}-${W}-${String(shot++).padStart(2,'0')}-${key||'blank'}.png`});}
 if(tb(I,/^Room clear!/)&&!globalThis.rc){globalThis.rc=1;await pg.waitForTimeout(1500);const J=await info();await pg.screenshot({path:`k-${W}-roomclear.png`});log.push(['rc',J.texts.map(t=>t.t).filter(t=>/COMBO|Room clear|Sensei/.test(t)).join(' | ')]);}
 if(tb(I,/PERFECT/i)&&firstPC===null){firstPC=(Date.now()-t0)/1000;await pg.screenshot({path:`drive-${p}-${W}-first-perfect.png`});}
 if(I.act.includes('Title'))await pg.mouse.click(W/2,H/2);
 else if(I.act.includes('Create')){const g=tb(I,/Let's go/);if(g)await pg.mouse.click(g.x,g.y);}
 else if(I.w){const w=I.w;const C=tb(I,/^COUNTER$/),S=tb(I,/^STRIKE$/),bow=tb(I,/^Bow$/);
  if(bow)await pg.mouse.click(bow.x,bow.y);
  else if(w.menu){const c=I.texts.filter(t=>t.y>H*0.3);const x=c[Math.floor(c.length/2)];if(x)await pg.mouse.click(x.x,x.y);}
  else if(w.waiting&&C)await pg.mouse.click(C.x,C.y);
  else if(w.goal)await pg.mouse.click(w.goal.x,w.goal.y);
  else if(w.foe){if(w.foe.mode==='windup'&&C)await pg.mouse.click(C.x,C.y);else if(w.focus>=30&&S)await pg.mouse.click(S.x,S.y);else await pg.mouse.click(w.foe.x,w.foe.y);}
  else if(w.chest)await pg.mouse.click(w.chest.x,w.chest.y);
  else if(w.doors.length){const d=w.doors[0];await pg.mouse.click(d.x,d.y);}
 } else if(log.some(l=>l[1].split('+').includes('Game'))){tutorialDone=(Date.now()-t0)/1000;await pg.waitForTimeout(2500);await pg.screenshot({path:`drive-${p}-${W}-after.png`});const I2=await info();const c=tb(I2,/^Continue$/);if(c){await pg.mouse.click(c.x,c.y);await pg.waitForTimeout(1500);await pg.screenshot({path:`k-${W}-home2.png`});const L=tb(await info(),/^Last run$/);if(L){await pg.mouse.click(L.x,L.y);await pg.waitForTimeout(800);await pg.screenshot({path:`k-${W}-lastrun.png`});}}log.push(['after',I2.act.join('+'),I2.texts.map(t=>t.t).join(' | ').slice(0,600)]);break;}
 await pg.waitForTimeout(80);}
fs.appendFileSync('drive.jsonl',JSON.stringify({p,W,q,firstPC,tutorialDone,log,errs,seen:[...seen]})+'\n');console.log(JSON.stringify({p,W,firstPC,tutorialDone,log,errs}).slice(0,1500));await b.close();
