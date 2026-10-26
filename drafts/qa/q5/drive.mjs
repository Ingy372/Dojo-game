// Q5 tutorial driver. args: W H idleSteps(comma list of step ids or 'none') tag [query]
import { chromium } from 'playwright';
import fs from 'fs';
const W=+process.argv[2],H=+process.argv[3];const IDLE=new Set((process.argv[4]||'none').split(','));const tag=process.argv[5]||'run';const q=process.argv[6]||'';
const IDLE_MS=+(process.env.IDLE_MS||31000);
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:3,hasTouch:true});
await ctx.addInitScript(k=>{if(!sessionStorage.getItem('x')){localStorage.clear();localStorage.setItem('dojo-ascent-test-student',k);sessionStorage.setItem('x','1')}},'1-white-belt-new');
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
const t0=Date.now();await pg.goto('http://localhost:5250/'+q);await pg.waitForFunction(()=>window.game?.scene.getScenes(true).length);
const info=()=>pg.evaluate(()=>{const g=window.game;const act=g.scene.getScenes(true).map(s=>s.scene.key);const texts=[];
 for(const s of g.scene.getScenes(true)){const walk=l=>{for(const o of l){if(o.visible===false||(o.alpha??1)<0.05)continue;if(o.list)walk(o.list);if(o.type==='Text'&&o.text){const bb=o.getBounds();texts.push({t:o.text,x:bb.centerX,y:bb.centerY})}}};walk(s.children.list)}
 const gs=g.scene.getScene('Game');let w=null;
 if(act.includes('Game')&&gs.world){const Wd=gs.world,cam=gs.cameras.main,T=48;const raw=v=>({x:(v.x*T-cam.worldView.x)*cam.zoom,y:(v.y*T-cam.worldView.y)*cam.zoom});const sc=v=>{const r=raw(v);return{x:Math.min(Math.max(r.x,60),innerWidth-60),y:Math.min(Math.max(r.y,45),innerHeight-45)}};
  const pl=Wd.players.p1;const live=Wd.enemies.filter(e=>e.mode!=='defeated');const foe=live[0];
  const st=gs.senseiText?.active?gs.senseiText.getBounds():null;const gb=gs.gotItBtn?.active?gs.gotItBtn.getBounds():null;
  const f=gs.tflow;
  w={tick:Wd.tick,step:f?['tutorial-bow','tutorial-walk','tutorial-space','tutorial-brute','tutorial-tip-warning','tutorial-tip-swarmers','tutorial-tip-tough','tutorial-tip-space','tutorial-tip-dash','tutorial-insight','tutorial-chest','tutorial-boss','tutorial-door'][f.index]??'done':null,phase:f?.phase,room:gs.room.id,
   sensei:st?{t:gs.senseiText.text,x0:st.left,x1:st.right,y0:st.top,y1:st.bottom,bg:gs.senseiText.style.backgroundColor}:null,gotIt:gb?{x:gb.centerX,y:gb.centerY,x0:gb.left,x1:gb.right,y0:gb.top,y1:gb.bottom}:null,
   hero:raw(pl.pos),heroSc:sc(pl.pos),doorsRaw:(gs.doorViews||[]).map(d=>raw({x:d.at.x,y:d.at.y+0.5})),chestRaw:gs.room.chest?raw(gs.room.chest):null,
   waiting:!!Wd.guide?.waiting,goal:Wd.goal&&!Wd.goal.reached?sc(Wd.goal.pos):null,foe:foe?{...sc(foe.pos),mode:foe.mode}:null,live:live.map(e=>e.def.id),hp:pl.health,focus:pl.focus,
   chest:gs.room.chest&&!Wd.progress.chestOpened&&Wd.progress.cleared?sc(gs.room.chest):null,doors:Wd.progress.doorsOpen?gs.doorViews.map(d=>sc({x:d.at.x,y:d.at.y+0.5})):[],menu:gs.menuOpen,walked:gs.walked};}
 return {act,texts,w};});
const tb=(I,re)=>I.texts.find(t=>re.test(t.t));
const inBox=(p,bx,pad=20)=>p&&bx&&p.x>bx.x0-pad&&p.x<bx.x1+pad&&p.y>bx.y0-pad&&p.y<bx.y1+pad;
const tips=[];const idled=new Set();let minHp=999,lastScene='',shot=0,corner=0,log=[];
while(Date.now()-t0<+(process.env.T||290000)){let I;try{I=await info();}catch(e){errs.push('probe '+e.message);break;}
 const key=I.act.join('+');if(key!==lastScene){lastScene=key;log.push([((Date.now()-t0)/1000).toFixed(1),key]);}
 if(I.act.includes('Title')){await pg.mouse.click(W/2,H/2);}
 else if(I.act.includes('Create')){const g=tb(I,/Let's go/);if(g)await pg.mouse.click(g.x,g.y);}
 else if(I.w){const w=I.w;minHp=Math.min(minHp,w.hp);
  if(w.gotIt&&w.sensei){
   const rec={step:w.step,room:w.room,text:w.sensei.t,box:w.sensei,bg:w.sensei.bg,heroUnder:inBox(w.hero,w.sensei,0),doorsUnder:w.doorsRaw.filter(d=>inBox(d,w.sensei,0)).length,chestUnder:inBox(w.chestRaw,w.sensei,0),gotItUnderHero:inBox(w.hero,w.gotIt,0)};
   const name=`${tag}-${W}-tip-${String(tips.length).padStart(2,'0')}-${w.step}`;await pg.screenshot({path:name+'.png'});rec.shot=name+'.png';
   if(IDLE.has(w.step)&&!idled.has(w.step+':tip')){idled.add(w.step+':tip');const a=w;await pg.waitForTimeout(IDLE_MS);const J=(await info()).w;rec.idleTip={ms:IDLE_MS,stepBefore:a.step,stepAfter:J.step,phaseBefore:a.phase,phaseAfter:J.phase,tickBefore:a.tick,tickAfter:J.tick,stillGotIt:!!J.gotIt};}
   tips.push(rec);const g=(await info()).w.gotIt;await pg.mouse.click(g.x,g.y);await pg.waitForTimeout(300);continue;}
  if(w.phase==='trying'&&IDLE.has(w.step)&&!idled.has(w.step+':try')){idled.add(w.step+':try');const a=w;await pg.waitForTimeout(IDLE_MS);const J=(await info()).w;const r=tips.findLast(t=>t.step===a.step);const o={ms:IDLE_MS,stepBefore:a.step,stepAfter:J.step,phaseAfter:J.phase,hpAfter:J.hp,live:J.live};if(r)r.idleTry=o;else tips.push({step:a.step,idleTry:o});await pg.screenshot({path:`${tag}-${W}-idletry-${a.step}.png`});continue;}
  const C=tb(I,/^COUNTER$/),S=tb(I,/^STRIKE$/),D=tb(I,/^DASH$/),bow=tb(I,/^Bow$/);
  if(bow){await pg.screenshot({path:`${tag}-${W}-bow.png`});tips.push({step:'tutorial-bow',text:'(bow prompt)'});await pg.mouse.click(bow.x,bow.y);}
  else if(w.menu){const c=I.texts.filter(t=>t.y>H*0.3);const x=c[Math.floor(c.length/2)];if(x)await pg.mouse.click(x.x,x.y);}
  else if(w.waiting&&C){await pg.screenshot({path:`${tag}-${W}-guided-counter.png`});await pg.mouse.click(C.x,C.y);}
  else if(w.goal)await pg.mouse.click(w.goal.x,w.goal.y);
  else if(w.step==='tutorial-space'&&w.phase==='trying'){const cs=[[0.2,0.35],[0.8,0.35],[0.8,0.75],[0.2,0.75]][corner++%4];await pg.mouse.click(W*cs[0],H*cs[1]);await pg.waitForTimeout(700);}
  else if(w.step==='tutorial-tip-dash'&&w.phase==='trying'&&D){await pg.screenshot({path:`${tag}-${W}-dash-try.png`});await pg.mouse.click(D.x,D.y);}
  else if(w.foe){if(w.foe.mode==='windup'&&C)await pg.mouse.click(C.x,C.y);else if(w.focus>=30&&S)await pg.mouse.click(S.x,S.y);else await pg.mouse.click(w.foe.x,w.foe.y);}
  else if(w.chest)await pg.mouse.click(w.chest.x,w.chest.y);
  else if(w.doors.length){const d=w.doors[0];await pg.mouse.click(d.x,d.y);}
 } else if(log.some(l=>l[1].split('+').includes('Game'))){await pg.waitForTimeout(2000);await pg.screenshot({path:`${tag}-${W}-after.png`});log.push(['after',key]);break;}
 await pg.waitForTimeout(80);}
const out={tag,W,H,idle:[...IDLE],minHp,secs:(Date.now()-t0)/1000,tips,log,errs};fs.appendFileSync('drive.jsonl',JSON.stringify(out)+'\n');
console.log(JSON.stringify({tag,W,minHp,secs:out.secs,steps:tips.map(t=>t.step+(t.idleTip?` [tipIdle ${t.idleTip.stepAfter===t.idleTip.stepBefore&&t.idleTip.phaseAfter===t.idleTip.phaseBefore&&t.idleTip.stillGotIt?'held':'MOVED'} ticks ${t.idleTip.tickBefore}->${t.idleTip.tickAfter}]`:'')+(t.idleTry?` [tryIdle ->${t.idleTry.stepAfter}/${t.idleTry.phaseAfter}]`:'')+(t.heroUnder||t.doorsUnder||t.chestUnder?` OVERLAP h${+!!t.heroUnder} d${t.doorsUnder} c${+!!t.chestUnder}`:'')),errs}));
await b.close();
