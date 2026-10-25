import { chromium } from 'playwright';
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:667,height:375},deviceScaleFactor:2});
await ctx.addInitScript(()=>{localStorage.setItem('dojo-ascent-test-student','1-white-belt-new')});
const pg=await ctx.newPage();await pg.goto('http://localhost:5321/');await pg.waitForFunction(()=>window.game?.scene?.getScenes?.(true).length);await pg.waitForTimeout(3000);
console.log(await pg.evaluate(()=>{const s=window.game.scene.getScenes(true)[0];return {key:s.scene.key,sw:s.scale.width,sh:s.scale.height,ds:s.scale.displayScale.x,cw:s.cameras.main.width,z:s.cameras.main.zoom}}));await b.close();
