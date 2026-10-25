import { chromium } from 'playwright';
import fs from 'fs';
const [W,H,RM]=[+process.argv[2],+process.argv[3],process.argv[4]];const tag=`rm${RM}-${W}`;const OUT='/workspace/qa/pmenua';
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:2,hasTouch:true});
await ctx.addInitScript(k=>{window.__osc=0;const P=(window.AudioContext||window.webkitAudioContext).prototype;const o=P.createOscillator;P.createOscillator=function(){window.__osc++;return o.call(this)};
 if(!sessionStorage.getItem('x')){localStorage.clear();localStorage.setItem('dojo-ascent-test-student','1-white-belt-new');localStorage.setItem('dojo.reducedMotion',k);sessionStorage.setItem('x','1');}},RM);
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text())});
await pg.goto('http://localhost:5322/');await pg.waitForFunction(()=>window.game?.scene?.getScenes?.(true).length);
const acts=()=>pg.evaluate(()=>window.game.scene.getScenes(true).map(s=>s.scene.key));
const texts=()=>pg.evaluate(()=>{const o=[];for(const s of window.game.scene.getScenes(true)){const w=l=>{for(const c of l){if(c.list)w(c.list);if(c.type==='Text'&&c.visible){const bb=c.getBounds();o.push({s:c.text,x:bb.centerX,y:bb.centerY});}}};w(s.children.list);}return o;});
for(let i=0;i<60;i++){const a=await acts();if(a.includes('Game')||a.includes('Dojo'))break;if(a.includes('Title'))await pg.mouse.click(W/2,H/2);if(a.includes('Create')){const g=(await texts()).find(t=>/Let's go/.test(t.s));if(g)await pg.mouse.click(g.x,g.y);}await pg.waitForTimeout(400);}
await pg.waitForTimeout(1500);
await pg.evaluate(()=>{const g=window.game;g.scene.getScenes(true).forEach(s=>g.scene.stop(s.scene.key));g.scene.start('Home');});await pg.waitForTimeout(2500);
for(let i=0;i<4;i++){await pg.mouse.click(W/2,H-20);await pg.waitForTimeout(700);} // dismiss any card
const L=[];const log=s=>{L.push(s);console.log(s)};
// Home text scan for pressure words
const allT=(await texts()).map(t=>t.s).join(' | ');log('HOME TEXT: '+allT.replace(/\n/g,' '));
const bad=allT.match(/power rating|\bPR\b|buy|shop|\$|coins?|gems?|purchase|miss(ed)? you|don't leave|hurry|limited/gi);log('pressure-words: '+JSON.stringify(bad));
// gear for Wear/Let go/pager
await pg.evaluate(()=>{const hs=window.game.scene.getScene('Home');const p=hs.profile;const mk=(s,r,i)=>({uid:'pm-'+i,base:s==='hands'?'tiger-wraps':s==='gi'?'mountain-gi':'crane-charm',name:s==='hands'?'Tiger Stripe Wraps':s==='gi'?'Mountain Gi':'Crane Charm',slot:s,rarity:r,stats:{power:1,maxHealth:0,guard:0},effect:null,effectText:''});p.inventory=[];['hands','gi','charm'].forEach(s=>['common','uncommon','rare','epic'].forEach(r=>p.inventory.push(mk(s,r,p.inventory.length))));});
const R={tag,errs,controls:{}};
const views=[['run',0],['gate',0],['gear',1]];
for(const [tab,sel] of views){
 await pg.evaluate(([t,sel])=>{const hs=window.game.scene.getScene('Home');hs.tab=t;hs.page=0;hs.selected=sel?hs.profile.inventory[0].uid:null;hs.render();
  // stub actions so buttons stay put; count calls
  window.__act=0;for(const m of ['enterTower','goTo','backToDojo','setTab','turn','wear','letGo'])hs[m]=()=>{window.__act++;};},[tab,sel]);
 await pg.waitForTimeout(500);await pg.screenshot({path:`${OUT}/${tag}-${tab}.png`});
 const list=await pg.evaluate(()=>{const hs=window.game.scene.getScene('Home');const m=hs.cameras.main,d=window.devicePixelRatio;const out=[];const ui=hs.ui.list;
  ui.forEach((c,i)=>{if(c.type==='Container'&&c.list[0]?.type==='Graphics'&&c.list[2]?.type==='Text'){const z=ui[i+1];const zb=z.getBounds();const sx=v=>(v-m.scrollX)*m.zoom/d,sy=v=>(v-m.scrollY)*m.zoom/d;
   out.push({i,label:c.list[2].text,cx:sx(zb.centerX),cy:sy(zb.centerY),tw:zb.width*m.zoom/d,th:zb.height*m.zoom/d,vw:c.width*m.zoom/d,vh:c.height*m.zoom/d,zone:z.type});}});
  // other interactive things not using the new button
  const other=[];const w=l=>{for(const c of l){if(c.list)w(c.list);else if(c.input?.enabled&&c.type!=='Zone')other.push(c.type+':'+(c.text??c.fillColor?.toString(16)));}};w(hs.children.list);return {out,other};});
 log(`[${tab}] buttons=${list.out.length} other-interactive=${JSON.stringify(list.other)}`);
 for(const c of list.out){const key=`${tab}:${c.label}`;if(R.controls[c.label]&&tab!=='run'&&['◀ Dojo','ENTER THE TOWER','Practice room','Run','Gate','Gear'].some(x=>c.label.includes(x)))continue;
  const r={tap:[c.tw.toFixed(1),c.th.toFixed(1)],vis:[c.vw.toFixed(0),c.vh.toFixed(0)],ok:0,fail:[]};
  const st=()=>pg.evaluate(i=>{const hs=window.game.scene.getScene('Home');const v=hs.ui.list[i];return {s:v.scale,sh:v.list[1].alpha,a:window.__act,o:window.__osc}},c.i);
  for(let t=0;t<10;t++){
   // A: press/release inside
   const s0=await st();await pg.mouse.move(c.cx,c.cy);await pg.mouse.down();await pg.waitForTimeout(110);const s1=await st();
   await pg.mouse.up();await pg.waitForTimeout(60);const s2=await st();await pg.waitForTimeout(300);const s3=await st();
   const f=[];if(s1.a!==s0.a)f.push('acted-on-down');if(s2.a!==s0.a+1)f.push(`acts=${s2.a-s0.a}`);if(s1.o-s0.o<2)f.push('no-tap-sound');
   if(RM==='on'){if(s1.s!==1)f.push(`rm-scaled ${s1.s}`);if(Math.abs(s1.sh-0.1)>0.01)f.push(`rm-shine ${s1.sh}`);if(!(s2.sh>0.005&&s2.sh<0.1))f.push(`rm-fade@60ms ${s2.sh.toFixed(3)}`);}
   else{if(Math.abs(s1.s-0.96)>0.003)f.push(`press-scale ${s1.s.toFixed(3)}`);}
   if(Math.abs(s3.s-1)>0.002||s3.sh>0.002)f.push(`not-settled s=${s3.s.toFixed(3)} sh=${s3.sh.toFixed(3)}`);
   // B: slide off
   const b0=await st();await pg.mouse.move(c.cx,c.cy);await pg.mouse.down();await pg.waitForTimeout(80);await pg.mouse.move(c.cx,c.cy+c.th/2+30,{steps:6});await pg.waitForTimeout(40);const b1=await st();await pg.mouse.up();await pg.waitForTimeout(250);const b2=await st();
   if(b2.a!==b0.a)f.push('slide-off-acted');if(Math.abs(b2.s-1)>0.002)f.push(`slideoff-scale ${b2.s}`);
   // C: slide on (press outside, release on)
   const c0=await st();await pg.mouse.move(c.cx,Math.min(H-2,c.cy+c.th/2+30));await pg.mouse.down();await pg.mouse.move(c.cx,c.cy,{steps:6});await pg.mouse.up();await pg.waitForTimeout(150);const c1=await st();if(c1.a!==c0.a)f.push('slide-on-acted');
   // D: edge of tap area (2px inside the 44 box)
   const d0=await st();await pg.mouse.click(c.cx,c.cy-c.th/2+2);await pg.waitForTimeout(150);const d1=await st();if(d1.a!==d0.a+1)f.push('edge-miss');
   if(f.length)r.fail.push(`try${t}:`+f.join(','));else r.ok++;}
  if(t0shot(c))await pg.screenshot({path:`${OUT}/${tag}-crop-${c.label.replace(/\W+/g,'_')}.png`,clip:{x:Math.max(0,c.cx-c.vw/2-6),y:Math.max(0,c.cy-c.vh/2-6),width:c.vw+12,height:c.vh+12}});
  R.controls[c.label]=r;log(`${key} tap=${r.tap} vis=${r.vis} ok=${r.ok}/10 ${r.fail.slice(0,3).join(' | ')}`);}
}
function t0shot(c){return true}
// pressed screenshot
const e=await pg.evaluate(()=>{const hs=window.game.scene.getScene('Home');hs.tab='run';hs.render();return 1});await pg.waitForTimeout(300);
// Blessing glow
const g=await pg.evaluate(async()=>{const hs=window.game.scene.getScene('Home');hs.training={...hs.training,blessed:true};hs.render();await new Promise(r=>setTimeout(r,300));
 const glow=hs.ui.list.find(c=>c.type==='Arc'&&c.fillColor===0x6fb7ff);if(!glow)return {found:false};const s=[];const t0=performance.now();
 for(let k=0;k<26;k++){s.push([Math.round(performance.now()-t0),+glow.alpha.toFixed(3),+glow.scale.toFixed(3)]);await new Promise(r=>setTimeout(r,250));}return {found:true,s};});
await pg.screenshot({path:`${OUT}/${tag}-blessed.png`});
if(g.found){const al=g.s.map(x=>x[1]);const mn=Math.min(...al),mx=Math.max(...al);let pk=[];for(let k=1;k<al.length-1;k++){if(al[k]>=al[k-1]&&al[k]>al[k+1])pk.push(g.s[k][0]);}
 log(`GLOW alpha min=${mn} max=${mx} scales=${[...new Set(g.s.map(x=>x[2]))]} peaks@ms=${pk} samples=${JSON.stringify(g.s.map(x=>x[1]))}`);}else log('GLOW not found');
log('errors: '+JSON.stringify(errs));fs.writeFileSync(`${OUT}/run/log-${tag}.txt`,L.join('\n'));await b.close();
