import { chromium } from 'playwright';
const [PORT,W,H]=[process.argv[2],+process.argv[3],+process.argv[4]];
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,hasTouch:true});
await ctx.addInitScript(()=>{localStorage.clear();localStorage.setItem('dojo-ascent-test-student','4-green-belt');localStorage.setItem('dojo.reducedMotion','on');});
const pg=await ctx.newPage();
await pg.goto(`http://localhost:${PORT}/?room=keepers-hall&difficulty=standard`);
await pg.waitForFunction(()=>window.game?.scene?.getScenes?.(true).length);
await pg.waitForTimeout(6000);await pg.mouse.click(W/2,H/2);await pg.waitForTimeout(2500);
if(await pg.evaluate(()=>window.game.scene.getScenes(true).some(s=>s.scene.key==='Create'))){await pg.mouse.click(W*0.84,H*0.9);}
await pg.waitForFunction(()=>window.game.scene.getScenes(true).some(s=>s.scene.key==='Game'),null,{timeout:30000});
await pg.waitForTimeout(1500);await pg.mouse.click(W/2,H*0.66);await pg.waitForTimeout(600);await pg.mouse.click(W/2,H*0.66);await pg.waitForTimeout(1000);
console.log(await pg.evaluate(()=>{const s=window.game.scene.getScene('Game');const cam=s.cameras.main;const d=s.doorViews.map(d=>({t:d.label.text,at:d.at,lx:d.label.x,ly:d.label.y}));const boss=s.world.enemies.find(e=>e.def.boss);const v=s.enemyViews.get(boss.id);
return JSON.stringify({TILE:v.container.x/boss.pos.x,d,boss:{pos:boss.pos,mode:boss.mode,r:boss.def.radius},v:{x:v.container.x,y:v.container.y,top:v.top,vis:v.container.visible,keys:Object.keys(v)},cam:{wv:[cam.worldView.x,cam.worldView.y],zoom:cam.zoom,x:cam.x},DS:window.game.scale.displayScale.x,hp:v.hpBack&&[v.hpBack.x,v.hpBack.y]})}));
await b.close();
