import { chromium } from 'playwright';
const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:+process.argv[2],height:+process.argv[3]}})).newPage();
await pg.addInitScript(()=>{localStorage.clear();localStorage.setItem('dojo-ascent-test-student','1-white-belt-new')});
await pg.goto('http://localhost:5250/?room=training&difficulty=standard');await pg.waitForFunction(()=>window.game?.scene);await pg.waitForTimeout(800);await pg.mouse.click(100,100);
await pg.waitForFunction(()=>window.game.scene.getScenes(true).some(s=>s.scene.key==='Game'));
const r=await pg.evaluate(async()=>{const s=window.game.scene.getScene('Game');s.world.guide=undefined;s.guideSpeed=()=>1;const k=Object.keys(s.world).find(k=>/^tick/i.test(k));const t0=s.world[k],p0=performance.now();await new Promise(r=>setTimeout(r,10000));return {key:k,ticksPerSec:(s.world[k]-t0)/((performance.now()-p0)/1000),animTempo:s.animTempo,tweenScale:s.tweens.timeScale}});
console.log(JSON.stringify(r));await b.close();
