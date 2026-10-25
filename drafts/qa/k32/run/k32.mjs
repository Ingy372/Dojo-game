import { chromium } from 'playwright';
import fs from 'fs';
const [W,H,RM]=[+process.argv[2],+process.argv[3],process.argv[4]];const tag=`rm${RM}-${W}`;const OUT='/workspace/qa/k32/rerun';
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:2,hasTouch:true});
await ctx.addInitScript(k=>{if(!sessionStorage.getItem('x')){localStorage.clear();localStorage.setItem('dojo-ascent-test-student','1-white-belt-new');localStorage.setItem('dojo.reducedMotion',k);sessionStorage.setItem('x','1');}},RM);
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text())});
await pg.goto('http://localhost:5321/');await pg.waitForFunction(()=>window.game?.scene?.getScenes?.(true).length);
const acts=()=>pg.evaluate(()=>window.game.scene.getScenes(true).map(s=>s.scene.key));
const texts=()=>pg.evaluate(()=>{const o=[];for(const s of window.game.scene.getScenes(true)){const w=l=>{for(const c of l){if(c.list)w(c.list);if(c.type==='Text'&&c.visible){const bb=c.getBounds();o.push({s:c.text,x:bb.centerX,y:bb.centerY});}}};w(s.children.list);}return o;});
for(let i=0;i<60;i++){const a=await acts();if(a.includes('Game'))break;if(a.includes('Title'))await pg.mouse.click(W/2,H/2);if(a.includes('Create')){const g=(await texts()).find(t=>/Let's go/.test(t.s));if(g)await pg.mouse.click(g.x,g.y);}await pg.waitForTimeout(400);}
await pg.waitForTimeout(2500);
// all real items: every base x every rarity, built with the game's own makeItem
const items=await pg.evaluate(async()=>{const urls=performance.getEntriesByType('resource').map(e=>e.name);const lu=urls.find(n=>/sim\/src\/loot\.ts/.test(n)),cu=urls.find(n=>/game\/content\.ts/.test(n));const L=await import(lu.split('?')[0]),C=await import(cu.split('?')[0]);
 const T=(C.CONTENT||C.default).loot;const out=[];for(const base of T.bases)for(const r of ["common","uncommon","rare","epic","legendary"]){out.push(L.makeItem([1,2,3,4],{...T,bases:[base]},r,`q-${base.id}-${r}`));}window.__RN=T.rarityNames;return out;}).catch(e=>({err:String(e)}));
if(items.err){console.log('ITEMS ERR',items.err);process.exit(1);}
const key=it=>`gear:${it.slot}:${it.rarity}`;
const scan=(scene)=>pg.evaluate((scene)=>{const s=window.game.scene.getScene(scene);const all=[];const w=(l,vis)=>{for(const c of l){const v=vis&&c.visible&&(c.alpha??1)>0.05;if(c.list)w(c.list,v);else if(v&&(c.type==='Text'||c.type==='Rectangle'||(c.type==='Image'&&/^gear:/.test(c.texture.key))))all.push(c);}};w(s.children.list,true);
 const bb=c=>{const g=c.getBounds();return{l:g.left,t:g.top,r:g.right,b:g.bottom}};
 return {vw:s.scale.width/s.cameras.main.zoom,vh:s.scale.height/s.cameras.main.zoom,icons:all.filter(c=>c.type==='Image').map(c=>({k:c.texture.key,...bb(c),size:Math.round(c.displayWidth)})),
  texts:all.filter(c=>c.type==='Text').map(c=>({s:c.text,...bb(c),fs:parseFloat(c.style.fontSize),ww:c.style.wordWrapWidth||0,lines:c.getWrappedText().length})),
  rects:all.filter(c=>c.type==='Rectangle'&&c.fillColor===0x221d2e).map(c=>({...bb(c),stroke:c.strokeColor}))};},scene);
const ov=(a,c)=>Math.min(a.r,c.r)-Math.max(a.l,c.l)>1&&Math.min(a.b,c.b)-Math.max(a.t,c.t)>1;
const R={tag,items:items.length,places:{},errs};
const prob=(place,m)=>{(R.places[place]??={probs:[],checks:0}).probs.push(m)};const chk=place=>{(R.places[place]??={probs:[],checks:0}).checks++};
const generic=(place,sc,label)=>{for(const ic of sc.icons){if(ic.l<-1||ic.t<-1||ic.r>sc.vw+1||ic.b>sc.vh+1)prob(place,`${label} icon offscreen ${ic.k}`);for(const t of sc.texts)if(ov(ic,t))prob(place,`${label} icon ${ic.k} overlaps "${t.s.slice(0,30)}"`);}
 for(const t of sc.texts){if(t.s.includes('…'))prob(place,`${label} ellipsis "${t.s}"`);if(t.r>sc.vw+1||t.l<-1)prob(place,`${label} text offscreen "${t.s.slice(0,30)}"`);}};
const ms=a=>a.slice().sort().join(',');
// LOOT popup: 15 batches of 3
for(let i=0;i<items.length;i+=3){const batch=items.slice(i,i+3);
 await pg.evaluate(its=>{const gs=window.game.scene.getScene('Game');const p=gs.world.players[gs.me]?.pos??gs.world.players.p1.pos;its.forEach((it,k)=>gs.showLoot(it,{x:p.x+k*0.3,y:p.y}));},batch);
 await pg.waitForTimeout(800);const sc=await scan('Game');chk('loot');
 const got=sc.icons.map(x=>x.k),exp=batch.map(key);if(ms(got)!==ms(exp))prob('loot',`batch ${i/3}: icons ${ms(got)} expected ${ms(exp)}`);
 const RN=await pg.evaluate(()=>window.__RN);for(const it of batch){const want=`${RN[it.rarity]}: ${it.name}`;const t=sc.texts.find(t=>t.s===want);if(!t){prob('loot',`no text "${want}"`);continue;}const ic=sc.icons.find(x=>Math.abs((x.t+x.b)/2-(t.t+t.b)/2)<6&&x.r<=t.l+1&&t.l-x.r<20);if(!ic)prob('loot',`no icon beside "${want}"`);else if(ic.k!==key(it))prob('loot',`wrong icon ${ic.k} beside "${want}"`);else (R.lootGap??=new Set()).add(Math.round(t.l-ic.r)+'/'+ic.size);}
 generic('loot',sc,'loot b'+i/3);if([0,7,14].includes(i/3))await pg.screenshot({path:`${OUT}/${tag}-loot-${i/3}.png`});
 await pg.waitForTimeout(3200);}
// HOME
await pg.evaluate(()=>{const g=window.game;g.scene.getScenes(true).forEach(s=>g.scene.stop(s.scene.key));g.scene.start('Home');});await pg.waitForTimeout(2500);
const setup=(tab,worn,bag,last)=>pg.evaluate(([tab,worn,bag,last])=>{const hs=window.game.scene.getScene('Home');hs.children.list.filter(c=>c!==hs.ui&&c.depth>=40).forEach(c=>c.destroy());const p=hs.profile;
 p.inventory=[...worn,...bag];p.equipped={};worn.forEach(w=>p.equipped[w.slot]=w.uid);
 p.lastRun={summary:{...(p.lastRun?.summary??{}),result:'cleared',roomsCleared:3,totalRooms:3,results:[],items:last,perfects:2,bestCombo:5,ticks:3000,sGrades:1,insights:[],decorations:[],tutorial:false},newBests:[]};
 hs.tab=tab;hs.page=0;hs.selected=null;hs.render();},[tab,worn,bag,last]);
const by=(s,r)=>items.filter(i=>i.slot===s&&(!r||i.rarity===r));
// GEAR worn: 15 combos (rarity x base index) -> every item worn once; bag = all others
const RAR=['common','uncommon','rare','epic','legendary'];
for(const r of RAR)for(let bi=0;bi<3;bi++){const worn=['hands','gi','charm'].map(s=>by(s,r)[bi]);const bag=items.filter(i=>!worn.includes(i));
 await setup('gear',worn,bag,[]);await pg.waitForTimeout(350);const sc=await scan('Home');chk('worn');
 const sizes=sc.rects.slice(0,3);
 for(const w of worn){const ic=sc.icons.find(x=>x.k===key(w)&&x.size>=38);if(!ic){prob('worn',`${r}/${bi}: no 40px icon for ${w.name} ${w.rarity}`);continue;}
  if(ic.size!==40)prob('worn',`icon size ${ic.size}`);
  const nt=sc.texts.find(t=>t.s===w.name&&t.ww>0);if(!nt){prob('worn',`name text missing ${w.name}`);continue;}
  const box=sc.rects.find(x=>ic.l>=x.l&&ic.r<=x.r&&ic.t>=x.t);if(!box)prob('worn','icon outside box');
  if(nt.lines>2)prob('worn',`${w.name} wraps ${nt.lines} lines`);if(box&&(nt.r>box.r-2||nt.b>box.b||nt.l<box.l))prob('worn',`${w.name} name outside box`);if(nt.t<ic.b-1)prob('worn',`${w.name} name not below icon`);
  (R.wornFs??=new Set()).add(nt.fs+'px/'+nt.lines+'l:'+w.name);}
 generic('worn',sc,`worn ${r}/${bi}`);
 // bag pages: union of icons must equal all bag items
 if(r==='common'&&bi===0||r==='legendary'&&bi===2){const got=[];let pages=0;for(let pgn=0;pgn<20;pgn++){await pg.evaluate(n=>{const hs=window.game.scene.getScene('Home');hs.page=n;hs.render();},pgn);await pg.waitForTimeout(150);const s2=await scan('Home');const pi=await pg.evaluate(()=>window.game.scene.getScene('Home').page);if(pi!==pgn)break;pages++;
   const bagIcons=s2.icons.filter(x=>x.size<38);got.push(...bagIcons.map(x=>x.k));generic('bag',s2,`bag p${pgn}`);chk('bag');
   for(const ic of bagIcons){const t=s2.texts.filter(t=>Math.abs((t.t+t.b)/2-(ic.t+ic.b)/2)<20&&t.l>=ic.r-1&&t.l-ic.r<12);if(!t.length)prob('bag',`icon ${ic.k} has no text beside`);}
   if(pgn<2)await pg.screenshot({path:`${OUT}/${tag}-gear-${r}${bi}-p${pgn}.png`});}
  if(ms(got)!==ms(bag.map(key)))prob('bag',`bag icons ${got.length} vs ${bag.length} items mismatch`);R.bagPages=pages;
  // selected
  await pg.evaluate(u=>{const hs=window.game.scene.getScene('Home');hs.page=0;hs.selected=u;hs.render();},bag[0].uid);await pg.waitForTimeout(300);const s3=await scan('Home');generic('bag-selected',s3,'sel');chk('bag-selected');await pg.screenshot({path:`${OUT}/${tag}-gear-${r}${bi}-selected.png`});}
 if(bi===0||r==='legendary')await pg.screenshot({path:`${OUT}/${tag}-worn-${r}${bi}.png`});}
// RESULTS lines: all 45 shown via chunks
for(let i=0;i<items.length;i+=3){const last=items.slice(i,i+3);await setup('run',[],[],last);await pg.waitForTimeout(300);const sc=await scan('Home');chk('results');
 const lines=sc.texts.filter(t=>/^(Common|Uncommon|Rare|Epic|Legendary|[A-Z][a-z]+): /.test(t.s)&&last.some(it=>t.s.includes(it.name)));
 if(lines.length<last.length){const more=sc.texts.find(t=>/more in your Gear/.test(t.s));prob('results',`chunk ${i/3}: ${lines.length}/${last.length} lines${more?' ('+more.s+')':''}`);}
 for(const ln of lines){const ic=sc.icons.find(x=>Math.abs((x.t+x.b)/2-(ln.t+ln.b)/2)<8&&x.r<=ln.l+1);const it=last.find(it=>ln.s.includes(it.name)&&ln.fs);if(!ic)prob('results',`no icon for "${ln.s}"`);else{const cand=last.filter(it=>ln.s.includes(it.name)).map(key);if(!cand.includes(ic.k))prob('results',`wrong icon ${ic.k} for "${ln.s}"`);}(R.resFs??=new Set()).add(ln.fs);}
 generic('results',sc,`results ${i/3}`);if(i%15===0)await pg.screenshot({path:`${OUT}/${tag}-results-${i/3}.png`});}
// FIRST-FLOOR card: each item as best
await setup('run',[],[],[]);
for(const it of items){await pg.evaluate(it=>{const hs=window.game.scene.getScene('Home');hs.children.list.filter(c=>c!==hs.ui&&c.depth>=40).forEach(c=>c.destroy());hs.ui.removeAll(true);hs.profile.lastRun.summary.items=[it];hs.firstFloorCard(()=>{});},it);await pg.waitForTimeout(250);
 const sc=await scan('Home');chk('firstfloor');const t=sc.texts.find(t=>t.s===`You found: ${it.name}`);const ic=sc.icons.filter(x=>x.k===key(it)&&t&&Math.abs((x.t+x.b)/2-(t.t+t.b)/2)<6);
 if(!t)prob('firstfloor',`no line for ${it.name}`);else if(!ic.length)prob('firstfloor',`no/wrong icon for ${it.name} ${it.rarity}: ${sc.icons.map(x=>x.k).join()}`);
 if(t){for(const x of ic)if(ov(x,t))prob('firstfloor','icon overlaps line');const c=(t.l+t.r)/2;if(ic[0]){const pl=Math.min(ic[0].l,t.l),pr=Math.max(ic[0].r,t.r);if(Math.abs((pl+pr)/2-sc.vw/2)>4)(R.ffOffCentre??=[]).push(Math.round((pl+pr)/2-sc.vw/2));}
  const other=sc.icons.filter(x=>!ic.includes(x));for(const x of other)if(ov(x,t))prob('firstfloor',`other icon ${x.k} under line`);if(t.l<0||t.r>sc.vw)prob('firstfloor','line offscreen '+it.name);}
 if(['cloth-wraps','padded-gi','crane-charm'].includes(it.base)&&['common','legendary'].includes(it.rarity))await pg.screenshot({path:`${OUT}/${tag}-firstfloor-${it.base}-${it.rarity}.png`});}
const summ=Object.fromEntries(Object.entries(R.places).map(([k,v])=>[k,{checks:v.checks,problems:v.probs.length,uniq:[...new Set(v.probs.map(p=>p.replace(/^\S+ \S+ /,'')))].slice(0,12)}]));
R.wornFs=[...(R.wornFs||[])];R.lootGap=[...(R.lootGap||[])];R.resFs=[...(R.resFs||[])];
fs.writeFileSync(`${OUT}/${tag}.json`,JSON.stringify({...R,summ},null,1));
console.log(tag,'items',items.length,JSON.stringify(summ),'bagPages',R.bagPages,'ffOff',JSON.stringify(R.ffOffCentre||[]),'errs',errs.length,JSON.stringify(errs.slice(0,3)));
await b.close();
