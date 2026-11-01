import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {pages} from '../src/pages.mjs';
import {presentPage} from '../src/design/presentation.mjs';
const text=element=>{const clone=element.cloneNode(true);clone.querySelectorAll('br').forEach(br=>br.replaceWith(' '));return clone.textContent.replace(/\s+/g,' ').trim();};
for(const page of pages)test(`Presentation retains technical copy and source links: ${page.path}`,()=>{
  const original=new JSDOM(page.body).window.document;
  const result=new JSDOM(presentPage(page).body).window.document;
  const body=text(result.body);
  for(const element of original.querySelectorAll('h1,h2,h3,p,li,figcaption,td,th'))assert(body.includes(text(element)),`Missing authored text: ${text(element)}`);
  for(const link of original.querySelectorAll('a[href]'))assert([...result.querySelectorAll('a[href]')].some(a=>a.getAttribute('href')===link.getAttribute('href')),`Missing link ${link.href}`);
  assert.equal(presentPage(page).title,page.title);assert.equal(presentPage(page).description,page.description);assert.equal(presentPage(page).path,page.path);
});
test('Topology is illustrative and includes all requested system classes',()=>{
  const doc=new JSDOM(presentPage(pages.find(p=>p.path==='/')).body).window.document;
  assert(text(doc.body).includes('ILLUSTRATIVE / NOT LIVE'));
  assert.equal(doc.querySelectorAll('.topology-desktop .system-node').length,6);
  assert.equal(doc.querySelectorAll('.topology-mobile .system-node').length,6);
  assert(doc.querySelector('#topology-motion'));
});
