import { chromium } from 'playwright';
const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:667,height:375}})).newPage();
pg.on('pageerror',e=>console.log('ERR',e.message));pg.on('console',m=>console.log(m.type(),m.text().slice(0,200)));
await pg.goto('http://localhost:5250/');await pg.waitForTimeout(6000);console.log(await pg.evaluate(()=>typeof window.game+' '+!!window.game?.scene));await b.close();
