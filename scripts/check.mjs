import { readFile, access } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import assert from 'node:assert/strict';
import { pages as authored } from '../src/pages.mjs';
import { referencePages } from '../src/reference/pages.mjs';
import { changelogPage } from '../src/changelog.mjs';
const pages=[...authored,changelogPage,...referencePages()];

const root = new URL('../dist/', import.meta.url);
const titles=new Set(), descriptions=new Set(), sources=new Set();
let links=0;
for(const page of pages) {
  const html=await readFile(new URL(page.path.slice(1)+'index.html',root),'utf8');
  const document=new JSDOM(html).window.document;
  assert.equal(document.querySelectorAll('h1').length,1,`${page.path}: exactly one H1`);
  assert.equal(document.querySelector('link[rel=canonical]').href,`https://fleetmesh.si${page.path}`);
  const description=document.querySelector('meta[name=description]').content;
  assert(!titles.has(document.title)); titles.add(document.title);
  assert(!descriptions.has(description)); descriptions.add(description);
  assert(!/coming soon|stay tuned|lorem ipsum|new chapter is on the horizon/i.test(html));
  for(const field of ['og:title','og:description','og:url','og:image']) assert(document.querySelector(`meta[property="${field}"]`)?.content);
  for(const script of document.querySelectorAll('script')) {
    if(page.tool && script.type==='module') {assert(/^\/assets\/explorer\.[a-f0-9]+\.js$/.test(script.getAttribute('src')));continue;}
    assert.equal(script.type,'application/ld+json','No executable client JavaScript');
    const data=JSON.parse(script.textContent);
    assert(['Article','TechArticle','WebSite'].includes(data['@type']));
    if(page.article||page.reference) assert.equal(data.mainEntityOfPage,`https://fleetmesh.si${page.path}`);
  }
  for(const el of document.querySelectorAll('[href],[src]')) {
    const value=el.getAttribute('href') || el.getAttribute('src');
    const url=new URL(value,`https://fleetmesh.si${page.path}`);
    if(url.origin !== 'https://fleetmesh.si') { sources.add(url.href.split('#')[0]); continue; }
    const target=url.pathname.slice(1)+(url.pathname.endsWith('/')?'index.html':'');
    await access(new URL(target,root)); links++;
    if(url.hash && !(url.pathname==='/tools/message-explorer/' && /^#s=/.test(url.hash))) {
      const targetDoc=new JSDOM(await readFile(new URL(target,root),'utf8')).window.document;
      assert(targetDoc.getElementById(decodeURIComponent(url.hash.slice(1))),`Broken fragment ${value}`);
    }
  }
  assert(document.querySelector('a.skip'));
  assert(document.querySelector('main#main'));
}
const sitemap=await readFile(new URL('sitemap.xml',root),'utf8');
for(const page of pages) assert(sitemap.includes(`<loc>https://fleetmesh.si${page.path}</loc>`));
assert.equal((sitemap.match(/<loc>/g)||[]).length,pages.length);
if(process.argv.includes('--external')) {
  for(const url of sources) {
    const response=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'FleetMesh-link-check/0.1'}});
    assert(response.ok,`${response.status} ${url}`);
    console.log(`Source OK: ${url}`);
    await response.body?.cancel();
  }
}
console.log(`${pages.length} pages: metadata, structured data, sitemap, ${links} internal references and fragments passed. ${sources.size} unique external sources${process.argv.includes('--external')?' checked':'; run with --external to check network status'}.`);
