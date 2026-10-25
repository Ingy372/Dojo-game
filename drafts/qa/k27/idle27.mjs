import { chromium } from 'playwright';
import fs from 'fs';
const p=process.argv[2];const W=+process.argv[3],H=+process.argv[4];const IDLE=+(process.env.IDLE||32000);const q=process.argv[5]||'';
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:2,hasTouch:true});
await ctx.addInitScript(k=>{if(!sessionStorage.getItem('x')){localStorage.clear();localStorage.setItem('dojo-ascent-test-student',k[0]);if(k[1])localStorage.setItem('dojo.reducedMotion',k[1]);sessionStorage.setItem('x','1')}},[p,process.env.RM||'']);
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const t0=Date.now();await pg.goto('http://localhost:5260/'+q);await pg.waitForFunction(()=>window.game?.scene?.getScenes?.(true).length);console.error('RMVAL',await pg.evaluate(()=>localStorage.getItem('dojo.reducedMotion')));
const info=()=>pg.evaluate(()=>{const g=window.game;const act=g.scene.getScenes(true).map(s=>s.scene.key);const texts=[];const DS=g.scale.displayScale.x;
 for(const s of g.scene.getScenes(true)){const walk=l=>{for(const o of l){if(o.visible===false||(o.alpha??1)<0.05)continue;if(o.list)walk(o.list);if(o.type==='Text'&&o.text){const bb=o.getBounds();texts.push({t:o.text,x:bb.centerX,y:bb.centerY})}}};walk(s.children.list)}
 const gs=g.scene.getScene('Game');let w=null;
 if(act.includes('Game')&&gs.world){const Wd=gs.world,cam=gs.cameras.main,T=48,raw=v=>({x:(v.x*T-cam.worldView.x)*cam.zoom/DS,y:(v.y*T-cam.worldView.y)*cam.zoom/DS}),sc=v=>{const r=raw(v);return{x:Math.min(Math.max(r.x,60),innerWidth-60),y:Math.min(Math.max(r.y,45),innerHeight-45)}};const pl=Wd.players.p1;const live=Wd.enemies.filter(e=>e.mode!=='defeated');const foe=live[0];
  const st=gs.senseiText?.active?gs.senseiText.getBounds():null;const gb=gs.gotItBtn?.active?gs.gotItBtn.getBounds():null;
  const hero=raw(pl.pos);const r=T*cam.zoom/DS;
  const ov=(a,b)=>a&&b&&a.x0<b.x1&&a.x1>b.x0&&a.y0<b.y1&&a.y1>b.y0;
  const box=st?{x0:st.left,x1:st.right,y0:st.top,y1:(gb?gb.bottom:st.bottom)}:null;
  const prot=gs.protectedBoxes(false).map(b=>({x0:b.x0/DS,x1:b.x1/DS,y0:b.y0/DS,y1:b.y1/DS}));
  w={step:gs.tflow?(gs.tflow.index!=null?gs.tflow.index:null):null,stepId:gs.tflow?(()=>{try{return gs.tflow.steps?gs.tflow.steps[gs.tflow.index]:null}catch{return null}})():null,phase:gs.tflow?.phase??null,tflow:gs.tflow?JSON.stringify(gs.tflow).slice(0,200):null,
   sensei:gs.senseiText?.active?gs.senseiText.text:null,gotIt:gb?{x:gb.centerX,y:gb.centerY}:null,
   coverHero:ov(box,{x0:hero.x-r,x1:hero.x+r,y0:hero.y-r,y1:hero.y+r}),coverProt:prot.some(p=>ov(box,p)),nprot:prot.length,
   waiting:!!Wd.guide?.waiting,goal:Wd.goal&&!Wd.goal.reached?sc(Wd.goal.pos):null,foe:foe?{...sc(foe.pos),mode:foe.mode}:null,nlive:live.length,kinds:live.map(e=>e.def.id).join(','),wave:Wd.wave,
   epos:live.map(e=>e.pos.x.toFixed(2)+','+e.pos.y.toFixed(2)).join(';'),hp:pl.health,ppos:pl.pos.x.toFixed(2)+','+pl.pos.y.toFixed(2),
   chest:gs.room.chest&&!Wd.progress.chestOpened&&Wd.progress.cleared?sc(gs.room.chest):null,doors:Wd.progress.doorsOpen?gs.doorViews.map(d=>sc({x:d.at.x,y:d.at.y+0.5})):[],menu:gs.menuOpen,room:gs.room.id,cwin:!!gs.counterWindowOpen,wind:live.filter(e=>e.mode==='windup').map(e=>e.windupTotal-e.modeTicks+'/'+e.windupTotal).join(','),dashPulse:!!gs.buttons?.dashPulsing};}
 return {act,texts,w};});
const tb=(I,re)=>I.texts.find(t=>re.test(t.t));
const stages=[];let cueSt=null,cueN=0,cues=[];let shot=0,lastKey='',minHp=999;const snap=async n=>{const f=`q5-${process.env.TAG||''}${p}-${W}-${String(shot++).padStart(2,'0')}-${n}.png`;await pg.screenshot({path:f});return f};
while(Date.now()-t0<+(process.env.T||1500000)){let I;try{I=await info();}catch(e){errs.push('probe '+e.message);break;}
 if(I.act.includes('Title')){await pg.mouse.click(W/2,H/2);await pg.waitForTimeout(300);continue;}
 if(I.act.includes('Create')){const g=tb(I,/Let's go/);if(g)await pg.mouse.click(g.x,g.y);await pg.waitForTimeout(300);continue;}
 if(!I.w){if(stages.length){await pg.waitForTimeout(2500);await snap('after');stages.push({after:I.act.join('+'),texts:(await info()).texts.map(t=>t.t).join(' | ').slice(0,400)});break;}await pg.waitForTimeout(200);continue;}
 const w=I.w;
 if(process.env.CUE){cueSt??={};const wk=w.wind?(w.cwin?'gold':'red'):'';if(wk&&cueN<12&&wk!==cueSt.last){cueN++;const f=await snap('cue-'+wk);const J=(await info()).w;cues.push({wk,wind:w.wind,cwin:w.cwin,after:J?.wind,afterWin:J?.cwin,f});}cueSt.last=wk;}
 minHp=Math.min(minHp,w.hp);const bow=tb(I,/^Bow$/);
 const key=`${w.room}|${w.tflow}|${!!w.gotIt}|${w.waiting}|${w.wave}|${bow?'bow':''}`;
 if(key!==lastKey){lastKey=key;
  // new stage: idle and watch
  const a=w;const f=await snap(`${w.room}-${(w.sensei||'nosensei').replace(/[^a-z]/gi,'').slice(0,20)}`);
  let changed=null,hpLow=a.hp,moved=false;const ts=Date.now();
  while(Date.now()-ts<IDLE){await pg.waitForTimeout(500);const J=(await info()).w;if(!J)break;hpLow=Math.min(hpLow,J.hp);if(J.epos!==a.epos)moved=true;
   const k2=`${J.room}|${J.tflow}|${!!J.gotIt}|${J.waiting}|${J.wave}`;if(k2!==key.replace(/\|bow$|\|$/,'')&&!changed)changed={after:((Date.now()-ts)/1000).toFixed(1),to:k2};}
  const J=(await info()).w;
  stages.push({t:((Date.now()-t0)/1000).toFixed(0),room:a.room,tflow:a.tflow,sensei:a.sensei,gotIt:!!a.gotIt,waiting:a.waiting,wave:a.wave,kinds:a.kinds,coverHero:a.coverHero,coverProt:a.coverProt,nprot:a.nprot,bow:!!bow,
    idleChanged:changed,enemiesMovedWhileIdle:moved,hpStart:a.hp,hpLow,senseiAfterIdle:J?.sensei,shot:f});
  lastKey=`${J.room}|${J.tflow}|${!!J.gotIt}|${J.waiting}|${J.wave}|${tb(await info(),/^Bow$/)?'bow':''}`;
 }
 const I2=await info();const w2=I2.w;if(!w2)continue;const C=tb(I2,/^COUNTER$/),S=tb(I2,/^STRIKE$/),D=tb(I2,/^DASH$/),bw=tb(I2,/^Bow$/);
 if(bw)await pg.mouse.click(bw.x,bw.y);
 else if(w2.gotIt){await pg.mouse.click(w2.gotIt.x,w2.gotIt.y);}
 else if(w2.menu){const c=I2.texts.filter(t=>t.y>H*0.3);const x=c[Math.floor(c.length/2)];if(x)await pg.mouse.click(x.x,x.y);}
 else if(w2.waiting&&C)await pg.mouse.click(C.x,C.y);
 else if(w2.goal)await pg.mouse.click(w2.goal.x,w2.goal.y);
 else if(/"index":2,"phase":"trying"/.test(w2.tflow||'')&&!w2.chest&&!w2.doors.length){await pg.mouse.click(W*0.25+Math.random()*W*0.5,H*0.3+Math.random()*H*0.4);await pg.waitForTimeout(400);}
 else if(w2.foe){if(/"index":8/.test(w2.tflow||'')&&D&&Math.random()<0.3)await pg.mouse.click(D.x,D.y);else if(w2.foe.mode==='windup'&&C)await pg.mouse.click(C.x,C.y);else if(w2.hp>0&&S&&Math.random()<0.3)await pg.mouse.click(S.x,S.y);else await pg.mouse.click(w2.foe.x,w2.foe.y);}
 else if(w2.chest)await pg.mouse.click(w2.chest.x,w2.chest.y);
 else if(w2.doors.length){const d=w2.doors[0];await pg.mouse.click(d.x,d.y);}
 await pg.waitForTimeout(100);}
fs.writeFileSync(`idle-${process.env.TAG||''}${p}-${W}.json`,JSON.stringify({p,W,minHp,errs,cues,stages,last:await info().catch(()=>null)},null,1));console.log('done',W,stages.length,minHp,errs.length);await b.close();
