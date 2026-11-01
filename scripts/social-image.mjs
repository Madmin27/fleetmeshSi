import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
try {
  const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  const diagram=await readFile('src/assets/architecture.svg','utf8');
  await page.setContent(`<html><head><style>*{box-sizing:border-box}body{margin:0;background:#f2f5f4;color:#1d2829;font-family:Arial,sans-serif;padding:48px 60px}header{display:flex;justify-content:space-between;align-items:center;font-size:15px;color:#08685d}h1{font-size:66px;margin:26px 0 12px}p{font-size:29px;margin:0}svg{display:block;width:710px;height:auto;margin:20px auto 0}footer{position:absolute;bottom:24px;font-size:13px;color:#526367}</style></head><body><header><span>INDEPENDENT ENGINEERING RESOURCES</span><span>fleetmesh.si</span></header><h1>FleetMesh</h1><p>Open intelligence for autonomous fleets.</p>${diagram}<footer>Interoperability / Orchestration / Architecture</footer></body></html>`);
  await page.screenshot({path:'src/assets/social.png'});
} finally {await browser.close();}
