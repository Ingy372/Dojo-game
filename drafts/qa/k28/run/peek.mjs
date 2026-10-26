import { chromium } from 'playwright';
const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:667,height:375}})).newPage();
await pg.addInitScript(()=>{localStorage.setItem('dojo-ascent-test-student','4-green-belt')});
await pg.goto('http://localhost:5270/?'+process.argv[2]);await pg.waitForTimeout(8000);await pg.mouse.click(333,187);await pg.waitForTimeout(3000);
console.log(await pg.evaluate(()=>window.game.scene.getScenes(true).map(s=>s.scene.key)));await pg.screenshot({path:'/workspace/qa/k28/peek.png'});await b.close();
