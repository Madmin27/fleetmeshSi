import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {examples,messageNames,massExamples} from '../src/explorer/examples.mjs';
const base=process.env.TEST_BASE||'http://127.0.0.1:3186';
const browser=await chromium.launch({executablePath:'/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',headless:true,args:['--no-sandbox',...(process.env.TEST_HOST?[`--host-resolver-rules=MAP ${process.env.TEST_HOST} 127.0.0.1`,'--no-proxy-server']:[])]});
await mkdir('artifacts',{recursive:true});
const errors=[],traffic=[];
try {
  const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const response=await page.goto(base+'/tools/message-explorer/');
  await page.waitForFunction(()=>!document.getElementById('validate').disabled);
  const csp=response.headers()['content-security-policy'];
  assert(csp.includes("connect-src 'none'"));assert(!csp.includes('unsafe-eval'));
  page.on('request',r=>traffic.push({url:r.url(),method:r.method(),body:r.postData()}));
  page.on('websocket',ws=>errors.push(`Unexpected WebSocket ${ws.url()}`));
  async function validate(expected){await page.locator('#validate').click();await page.waitForFunction(v=>document.getElementById('result-badge').textContent===v,expected);}
  async function setText(text){await page.locator('.cm-content').click();await page.keyboard.press('ControlOrMeta+a');await page.keyboard.insertText(text);}
  for(const topic of messageNames){await page.selectOption('#message-type',topic);await page.click('#load-example');await validate('Schema-valid');}
  await page.selectOption('#message-type','order');await page.click('#load-example');
  const value=structuredClone(examples.order);value.nodes[0].nodePosition.x='PRIVATE_PAYLOAD_8391';
  await setText(JSON.stringify(value,null,2));await validate('Invalid');
  assert(await page.locator('#error-list').textContent().then(t=>t.includes('/nodes/0/nodePosition/x')));
  await page.getByRole('button',{name:'/nodes/0/nodePosition/x',exact:true}).click();
  await page.keyboard.insertText('');
  await page.screenshot({path:'artifacts/explorer-error-1440.png',fullPage:true});
  await setText('{"timestamp":');assert.equal(await page.locator('#result-badge').textContent(),'Not validated');
  await page.click('#validate');await page.waitForFunction(()=>document.getElementById('result-summary').textContent.includes('Input not validated'));
  await page.click('#load-example');assert(await page.locator('#replace-dialog').isVisible());
  await page.click('#replace-cancel');assert(await page.locator('.cm-content').textContent().then(t=>t.includes('timestamp')));
  await page.click('#load-example');await page.click('#replace-confirm');await validate('Schema-valid');
  await setText(JSON.stringify(examples.order));await page.click('#format');
  assert(await page.locator('.cm-line').count()>5);await page.click('#undo');assert.equal(await page.locator('.cm-line').count(),1);await page.click('#redo');
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),JSON.stringify(examples.order,null,2));
  const download=page.waitForEvent('download');await page.click('#download');assert.equal((await download).suggestedFilename(),'vda-5050-order.json');
  await page.locator('#file-input').setInputFiles({name:'local.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...examples.order,serialNumber:'PRIVATE_PAYLOAD_8391'}))});
  await page.click('#replace-confirm');await validate('Schema-valid');
  // Phase 2: MassRobotics standard switch, official vs adjusted example, field reference link
  await page.selectOption('#standard-select','massrobotics');
  assert.equal(await page.locator('#dialect-label').textContent(),'JSON Schema (no $schema declared; draft-07 semantics)');
  assert.equal(await page.locator('#message-type option').count(),2);
  assert.equal(await page.locator('[data-standard-group="massrobotics"]').getAttribute('data-active'),'true');
  assert.equal(await page.locator('[data-standard-group="vda-5050"]').getAttribute('data-active'),'false');
  await page.selectOption('#message-type','statusReport');
  await page.click('#load-example');assert(await page.locator('#example-dialog').isVisible());await page.click('#example-official');if(await page.locator('#replace-dialog').isVisible())await page.click('#replace-confirm');
  await validate('Invalid');
  assert(await page.locator('#error-list').textContent().then(t=>t.includes('/uuid')&&t.includes('/location/planarDatum')));
  const refHref=await page.locator('#error-list a.error-reference').first().getAttribute('href');
  assert.equal(refHref,'/reference/massrobotics/statusreport/#f-uuid');
  await page.click('#load-example');await page.click('#example-adjusted');if(await page.locator('#replace-dialog').isVisible())await page.click('#replace-confirm');
  await validate('Schema-valid');
  
  assert(await page.locator('#schema-download').isHidden(),'no MassRobotics download');
  // Share link: JSON must be in the fragment only, and decode in a fresh tab without any request carrying it
  await page.click('#share');await page.waitForFunction(()=>document.getElementById('tool-notice').textContent.startsWith('Share link copied'));
  const shared=await page.evaluate(()=>navigator.clipboard.readText());
  assert(/\/tools\/message-explorer\/#s=massrobotics&t=statusReport&m=[A-Za-z0-9_-]+$/.test(shared),shared);
  const tab2=await context.newPage();const tab2Requests=[];tab2.on('request',r=>tab2Requests.push(r.url()));
  await tab2.goto(shared);await tab2.waitForFunction(()=>document.getElementById('document-status').textContent.startsWith('Loaded from share link'));
  assert(tab2Requests.every(u=>!u.includes('&m=')&&!u.includes('#')),'fragment must not appear in any request URL: '+tab2Requests.join(','));
  assert.equal(await tab2.locator('#standard-select').inputValue(),'massrobotics');
  assert.equal(await tab2.locator('#message-type').inputValue(),'statusReport');
  await tab2.locator('#validate').click();await tab2.waitForFunction(()=>document.getElementById('result-badge').textContent==='Schema-valid');
  assert.equal(JSON.parse(await tab2.locator('.cm-content').evaluate(el=>el.cmView?el.cmView.view.state.doc.toString():el.textContent)).uuid,massExamples.statusReport.adjusted.uuid);
  await tab2.screenshot({path:'artifacts/explorer-shared-1440.png',fullPage:true});
  await tab2.close();
  // Back to VDA via sidebar button
  await page.click('[data-standard="vda-5050"][data-message="state"]');
  assert.equal(await page.locator('#standard-select').inputValue(),'vda-5050');assert.equal(await page.locator('#message-type').inputValue(),'state');
  await page.click('#load-example');if(await page.locator('#replace-dialog').isVisible())await page.click('#replace-confirm');await validate('Schema-valid');
  assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
  await page.waitForTimeout(250);
  // Chromium re-requests the favicon after history.replaceState; it carries no payload and no fragment.
  const favicon=traffic.filter(r=>r.url===new URL('/assets/mark.svg',base).href&&r.method==='GET'&&!r.body);
  assert.deepEqual(traffic.filter(r=>!favicon.includes(r)),[],'No network requests after initial assets loaded');
  assert(traffic.every(r=>!/PRIVATE_PAYLOAD|&m=|#/.test(r.url+String(r.body))));
  assert.deepEqual(errors,[]);
  await context.close();
  for(const width of [320,390]) {
    const mobile=await browser.newContext({viewport:{width,height:844}}),tab=await mobile.newPage();
    await tab.goto(base+'/tools/message-explorer/');
    await tab.waitForFunction(()=>!document.getElementById('validate').disabled);
    await tab.click('#validate');await tab.waitForFunction(()=>document.getElementById('result-badge').textContent==='Schema-valid');
    assert(await tab.locator('.schema-warning').isVisible());
    assert(await tab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await tab.screenshot({path:`artifacts/explorer-valid-${width}.png`,fullPage:true});await mobile.close();
  }
  const result={base,examples:8,checks:['Draft schema validation in worker','exact nested error path','stale result reset','syntax handling','replacement confirmation and cancel','format/undo/redo','clipboard','local download','local file read','no local/session storage','zero network requests during payload workflows','CSP connect-src none and no unsafe-eval','MassRobotics switch, official/adjusted examples, reference links','share link fragment-only round trip'],requestsAfterLoad:traffic,errors};
  await writeFile('artifacts/explorer-browser.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}
