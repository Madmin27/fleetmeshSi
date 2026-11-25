import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
try {
  const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  const diagram=await readFile('src/assets/architecture.svg','utf8');
  await page.setContent(`<html><head><style>*{box-sizing:border-box}body{margin:0;background:#111313;color:#f0f1eb;font-family:Arial,sans-serif;padding:48px 60px}header{display:flex;justify-content:space-between;align-items:center;font-size:15px;color:#9fc3e3;font-family:Consolas,monospace}h1{font-size:66px;margin:26px 0 12px}p{font-size:29px;margin:0;color:#aeb7b5}svg{display:block;width:710px;height:auto;margin:20px auto 0}footer{position:absolute;bottom:24px;font-size:13px;color:#969f9d;font-family:Consolas,monospace}</style></head><body><header><span>Independent engineering resources</span><span>fleetmesh.si</span></header><h1>FleetMesh</h1><p>Open intelligence for autonomous fleets.</p>${diagram}<footer>VDA 5050 and MassRobotics guides, field reference, local message validator</footer></body></html>`);
  await page.screenshot({path:'src/assets/social.png'});
} finally {await browser.close();}
