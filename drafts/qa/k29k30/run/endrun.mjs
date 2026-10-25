import { chromium } from 'playwright';
import fs from 'fs';
const [NAME,PORT,W,H]=[process.argv[2],process.argv[3],+process.argv[4],+process.argv[5]];
const tag=`k29-${NAME}-${W}`;
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,hasTouch:true});
await ctx.addInitScript(()=>{if(!sessionStorage.getItem('x')){localStorage.clear();sessionStorage.setItem('x',1);}localStorage.setItem('dojo-ascent-test-student','4-green-belt');localStorage.setItem('dojo.reducedMotion','on');});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
await pg.goto(`http://localhost:${PORT}/?room=training&difficulty=standard`);
await pg.waitForFunction(()=>window.game?.scene?.getScenes?.(true).length);
await pg.waitForTimeout(6000);await pg.mouse.click(W/2,H/2);await pg.waitForTimeout(2500);
if(await pg.evaluate(()=>window.game.scene.getScenes(true).some(s=>s.scene.key==='Create'))){await pg.mouse.click(W*0.84,H*0.9);}
await pg.waitForFunction(()=>window.game.scene.getScenes(true).some(s=>s.scene.key==='Game'),null,{timeout:30000});
await pg.waitForTimeout(1500);
// grade popup: fixed args. 1056 ticks = 60 real s on k29
await pg.evaluate(()=>{const s=window.game.scene.getScene('Game');s.showGrade('A',3,0,1056,true);});
await pg.waitForTimeout(1200);
const gradeTxt=await pg.evaluate(()=>window.game.scene.getScene('Game').children.list.filter(c=>c.text!==undefined&&c.visible).map(c=>c.text).filter(t=>/Perfect|time/.test(t)));
await pg.screenshot({path:`/workspace/qa/k29k30/${tag}-grade.png`});
// end-of-run screen with a fixed lastRun
await pg.evaluate(async()=>{const u=performance.getEntriesByType('resource').map(e=>e.name).find(n=>n.includes('/game/save.ts'));const m=await import(u);
 const p=m.loadSave();
 const R=(id,kind,grade,ticks,per,dmg,inTime)=>({roomId:id,name:id,kind,grade,ticks,perfects:per,damageTaken:dmg,inTime});
 p.lastRun={summary:{result:'cleared',roomsCleared:3,totalRooms:3,results:[R('bamboo-hall','battle','S',700,4,0,null),R('stone-garden','challenge','A',1056,2,1,true),R('keepers-hall','boss','B',2000,1,3,null)],items:[],perfects:7,bestCombo:5,ticks:3756,sGrades:1,insights:[],decorations:[],decorationColours:[],defeated:['brute'],test:false,tier:4,tutorial:false},newBests:['fastestClearTicks']};
 p.bests={...(p.bests||{}),fastestClearTicks:3756,mostPerfects:7,longestCombo:5,mostSGrades:1};
 m.writeSave(p);
 window.game.scene.getScenes(true).forEach(s=>s.scene.stop());window.game.scene.start('Home',{fromRun:false});});
await pg.waitForTimeout(3000);
const homeTxt=await pg.evaluate(()=>{const s=window.game.scene.getScene('Home');const out=[];const walk=l=>l.forEach(c=>{if(c.text!==undefined&&c.visible)out.push(c.text);if(c.list)walk(c.list)});walk(s.children.list);return out;});
await pg.screenshot({path:`/workspace/qa/k29k30/${tag}-home.png`});
fs.writeFileSync(`/workspace/qa/k29k30/${tag}.json`,JSON.stringify({gradeTxt,homeTxt,errs},null,1));
console.log(tag,JSON.stringify(gradeTxt),errs.length);await b.close();
