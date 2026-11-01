import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { pages as authored } from '../src/pages.mjs';
import { referencePages } from '../src/reference/pages.mjs';
import { changelogPage } from '../src/changelog.mjs';
const pages=[...authored,changelogPage,...referencePages()];

const base=process.env.TEST_BASE || 'http://127.0.0.1:3186';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',headless:true,args:['--no-sandbox',...(process.env.TEST_HOST ? [`--host-resolver-rules=MAP ${process.env.TEST_HOST} 127.0.0.1`,'--no-proxy-server'] : [])]});
await mkdir('artifacts',{recursive:true});
const failures=[];
try {
  for(const width of [320,390,768,1440,1920]) {
    const context=await browser.newContext({viewport:{width,height:width<700?844:1000}});
    const page=await context.newPage();
    page.on('pageerror', e=>failures.push(e.message));
    page.on('console', msg=>{if(msg.type()==='error') failures.push(msg.text());});
    for(const entry of pages) {
      const response=await page.goto(base+entry.path,{waitUntil:'networkidle'});
      assert.equal(response.status(),200,entry.path);
      assert(await page.locator('h1').isVisible());
      const layout=await page.evaluate(()=>({
        overflow:document.documentElement.scrollWidth>innerWidth+1,
        images:[...document.images].filter(i=>getComputedStyle(i).display!=='none').every(i=>i.complete&&i.naturalWidth>0),
        tinyLinks:[...document.querySelectorAll('header a')].filter(a=>a.checkVisibility()).some(a=>a.getBoundingClientRect().width<20),
        contentHeight:document.querySelector('main').getBoundingClientRect().height
      }));
      assert(!layout.overflow,`${entry.path} overflow at ${width}`);
      assert(layout.images,`${entry.path} broken image at ${width}`);
      assert(!layout.tinyLinks);
      assert(layout.contentHeight>100);
      if(width===390||width===1440) await page.screenshot({path:`artifacts/${entry.path==='/'?'home':entry.path.split('/').filter(Boolean).join('-')}-${width}.png`,fullPage:true});
      if(width<700) {
        await page.locator('.mobile-nav summary').click();
        assert(await page.locator('.mobile-nav a[href="/standards/"]').isVisible());
        await page.locator('.mobile-nav a[href="/standards/"]').click();
        assert(new URL(page.url()).pathname==='/standards/');
      }
    }
    await page.goto(base+'/standards/vda-5050/');
    await page.locator('.toc a[href="#messages"]').click();
    assert.equal(new URL(page.url()).hash,'#messages');
    await page.goto(base+'/');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').textContent(),'Skip to content');
    await page.keyboard.press('Enter');
    assert.equal(new URL(page.url()).hash,'#main');
    await context.close();
  }
  assert.equal(failures.length,0,failures.join('\n'));
  const result={pages:pages.length,widths:[320,390,768,1440,1920],consoleErrors:failures,checks:['HTTP status','horizontal overflow','images','navigation','article anchors','keyboard skip link'],base};
  await writeFile('artifacts/browser-results.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
