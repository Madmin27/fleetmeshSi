import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { writeFile } from 'node:fs/promises';
const chrome=await launch({chromePath:'/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage','--no-proxy-server','--host-resolver-rules=MAP fleetmesh.si 127.0.0.1']});
try {
  for(const [name,path] of [['home','/'],['massrobotics','/standards/massrobotics/'],['explorer','/tools/message-explorer/'],['reference','/reference/vda-5050/state/']]) {
    const result=await lighthouse((process.env.TEST_BASE||'https://fleetmesh.si')+path,{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']});
    await writeFile(`artifacts/lighthouse-live-${name}.json`,result.report);
    const summary={page:path,categories:Object.fromEntries(Object.entries(result.lhr.categories).map(([key,value])=>[key,Math.round(value.score*100)])),metrics:Object.fromEntries(['largest-contentful-paint','cumulative-layout-shift','total-blocking-time'].map(key=>[key,result.lhr.audits[key].displayValue]))};
    console.log(JSON.stringify(summary));
  }
} finally { await chrome.kill(); }
