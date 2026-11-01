import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.TEST_BASE||'http://127.0.0.1:3186';
const browser=await chromium.launch({executablePath:'/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',headless:true,args:['--no-sandbox',...(process.env.TEST_HOST?[`--host-resolver-rules=MAP ${process.env.TEST_HOST} 127.0.0.1`,'--no-proxy-server']:[])]});
await mkdir('artifacts',{recursive:true});
const report=[];
try {
  for(const width of [320,390,768,1024,1440,1920]) {
    const page=await browser.newPage({viewport:{width,height:900}});
    for(const [name,path] of [['home','/'],['standards','/standards/'],['vda','/standards/vda-5050/'],['console','/tools/message-explorer/']]) {
      await page.goto(base+path,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
      const overflow=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)&&!el.closest('.table-scroll,pre,.cm-scroller')}).map(el=>({tag:el.tagName,class:el.className?.baseVal??el.className,text:el.textContent.slice(0,80),width:el.getBoundingClientRect().width})));
      report.push({width,name,overflow});
      if([390,1440].includes(width)){await page.screenshot({path:`artifacts/redesign-${name}-${width}.png`,fullPage:true});if(name==='home')await page.screenshot({path:`artifacts/redesign-home-viewport-${width}.png`});}
    }
    await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(base+'/tools/message-explorer/');await page.waitForFunction(()=>!document.getElementById('validate').disabled);
  await page.click('#tab-messages');assert(await page.locator('#panel-messages').isVisible());assert(!await page.locator('#panel-json').isVisible());
  await page.click('[data-message="state"]');assert.equal(await page.locator('#message-type').inputValue(),'state');
  await page.click('#load-example');assert(await page.locator('#panel-json').isVisible());
  await page.click('#validate');await page.waitForFunction(()=>document.querySelector('.explorer-wrap').dataset.activePanel==='validation');
  assert.equal(await page.locator('#result-badge').textContent(),'Schema-valid');
  await page.locator('#tab-validation').focus();await page.keyboard.press('Home');assert(await page.locator('#panel-messages').isVisible());await page.keyboard.press('ArrowRight');assert(await page.locator('#panel-json').isVisible());
  await page.locator('.cm-content').click();await page.keyboard.press('ControlOrMeta+a');await page.keyboard.insertText('{"version":"3.0.0"}');await page.click('#validate');await page.waitForFunction(()=>document.getElementById('result-badge').textContent==='Invalid');await page.locator('#error-list button').first().click();assert(await page.locator('#panel-json').isVisible());
  await page.setViewportSize({width:1440,height:1000});assert(await page.locator('#panel-messages').isVisible());assert(await page.locator('#panel-validation').isVisible());
  page.on('dialog',dialog=>dialog.accept());await page.goto(base+'/');
  const before=await page.locator('.topology-desktop .data-flow').first().evaluate(el=>getComputedStyle(el).strokeDashoffset);await page.waitForTimeout(150);const after=await page.locator('.topology-desktop .data-flow').first().evaluate(el=>getComputedStyle(el).strokeDashoffset);assert.notEqual(before,after);
  await page.uncheck('#topology-motion');assert.equal(await page.locator('.data-flow').first().evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.data-flow').first().evaluate(el=>getComputedStyle(el).animationName),'none');
  await writeFile('artifacts/redesign-checks.json',JSON.stringify({base,report,tabs:'passed',motion:'passed',reducedMotion:'passed'},null,2));
  console.log(JSON.stringify({checks:report.length,overflow:report.filter(x=>x.overflow.length),tabs:'passed',motion:'passed',reducedMotion:'passed'}));
}finally{await browser.close();}
