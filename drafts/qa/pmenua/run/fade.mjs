import { chromium } from 'playwright';
const [W,H]=[844,390];const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:2,hasTouch:true});
await ctx.addInitScript(()=>{if(!sessionStorage.getItem('x')){localStorage.clear();localStorage.setItem('dojo-ascent-test-student','1-white-belt-new');localStorage.setItem('dojo.reducedMotion','on');sessionStorage.setItem('x','1');}});
const pg=await ctx.newPage();await pg.goto('http://localhost:5322/');await pg.waitForFunction(()=>window.game?.scene?.getScenes?.(true).length);await pg.waitForTimeout(3000);
await pg.evaluate(()=>{const g=window.game;g.scene.getScenes(true).forEach(s=>g.scene.stop(s.scene.key));g.scene.start('Home');});await pg.waitForTimeout(2500);
for(let i=0;i<4;i++){await pg.mouse.click(W/2,H-20);await pg.waitForTimeout(700);}
const c=await pg.evaluate(()=>{const hs=window.game.scene.getScene('Home');for(const m of ['enterTower','goTo','backToDojo','setTab'])hs[m]=()=>{};const ui=hs.ui.list;const i=ui.findIndex(c=>c.list?.[2]?.text==='Practice room');const zb=ui[i+1].getBounds();const m=hs.cameras.main,d=devicePixelRatio;
 window.__w=()=>new Promise(res=>{const v=ui[i].list[1];const t0=performance.now();const s=[];const f=()=>{s.push([Math.round(performance.now()-t0),+v.alpha.toFixed(3),ui[i].scale]);if(v.alpha<=0.001&&s.length>2||s.length>60)res(s);else requestAnimationFrame(f)};f();});
 return {x:zb.centerX*m.zoom/d,y:zb.centerY*m.zoom/d};});
for(let t=0;t<10;t++){await pg.mouse.move(c.x,c.y);await pg.mouse.down();await pg.waitForTimeout(150);const p=pg.evaluate(()=>window.__w());await pg.mouse.up();const s=await p;const z=s.find(x=>x[1]<=0.001);console.log(`try${t}: start=${s[0][1]} zero@${z?.[0]}ms scale=${[...new Set(s.map(x=>x[2]))]}`);await pg.waitForTimeout(200);}
await b.close();
