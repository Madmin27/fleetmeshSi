import {JSDOM} from 'jsdom';
import {fleetTopology,architectureDiagram,StatusBadge} from './diagrams.mjs';
import {standards,standardIds} from '../explorer/standards.mjs';

// Presentation transforms retain the authored technical copy and source links.
export function presentPage(page) {
  const dom=new JSDOM(`<body>${page.body}</body>`),doc=dom.window.document;
  for(const figure of doc.querySelectorAll('figure.diagram')) {
    figure.querySelectorAll('img').forEach(img=>img.remove());
    figure.insertAdjacentHTML('afterbegin',architectureDiagram()+architectureDiagram(true));
  }
  if(page.path==='/') {
    doc.querySelector('.tagline br')?.replaceWith(' ');
    const hero=doc.querySelector('.hero .wrap');
    const heading=doc.createElement('div');heading.className='hero-copy';
    while(hero.firstChild)heading.append(hero.firstChild);
    hero.append(heading);
    hero.insertAdjacentHTML('beforeend',`<div class="topology-workspace"><div class="topology-heading"><span class="mono">FLEET TOPOLOGY</span>${StatusBadge('ILLUSTRATIVE / NOT LIVE','amber')}</div><input type="checkbox" class="motion-toggle" id="topology-motion" checked><label class="motion-label" for="topology-motion">Motion</label><figure class="fleet-topology">${fleetTopology()}${fleetTopology(true)}<figcaption>Conceptual connections only. Protocol scope and support differ by system.</figcaption></figure></div>`);
    doc.querySelector('.hero-note').classList.add('hero-index');
    doc.querySelector('.grid-three').classList.add('engineering-bento');
    doc.querySelector('.topic-card').insertAdjacentHTML('beforeend','<div class="protocol-mini" aria-hidden="true"><span>CONTROLLER</span><span class="mini-line"></span><span>INTERFACE</span><span class="mini-line"></span><span>ROBOT</span></div>');
    const feature=doc.querySelector('.feature .wrap');
    feature.insertAdjacentHTML('beforeend','<a class="text-link explorer-entry" href="/tools/message-explorer/">Open Message Explorer <span aria-hidden="true">&#8599;</span></a>');
  }
  if(page.tool) {
    const wrap=doc.querySelector('.explorer-wrap'),panels=doc.querySelector('.explorer-panels');
    const navigation=doc.createElement('aside');navigation.className='message-navigation';navigation.id='panel-messages';navigation.setAttribute('aria-label','Messages and schemas');
    const total=standardIds.reduce((n,id)=>n+standards[id].messages.length,0);
    navigation.innerHTML=`<div class="panel-heading"><h2>Messages</h2><span class="mono">${String(total).padStart(2,'0')}</span></div>${standardIds.map(id=>`<div class="message-nav-group" data-standard-group="${id}" data-active="${id==='vda-5050'}"><p class="message-group-label mono">${standards[id].label} ${standards[id].version}</p><div class="message-nav-list" role="group" aria-label="${standards[id].label} message schema">${standards[id].messages.map((name,i)=>`<button type="button" class="message-nav-item" data-standard="${id}" data-message="${name}" aria-pressed="${id==='vda-5050'&&i===0}" disabled><span class="message-glyph" aria-hidden="true">{ }</span><span>${name}</span><span class="message-extension">${id==='vda-5050'?'.schema':'.json'}</span></button>`).join('')}</div></div>`).join('')}<div class="nav-schema-meta"><span class="eyebrow">Schema dialect</span><p class="mono" id="nav-dialect">JSON Schema<br>Draft 2020-12</p></div>`;
    navigation.append(doc.querySelector('.message-field'),doc.querySelector('#load-example'));
    panels.prepend(navigation);
    const toolbar=doc.querySelector('.explorer-toolbar');
    doc.querySelector('.editor-panel').id='panel-json';doc.querySelector('.result-panel').id='panel-validation';
    doc.querySelector('.editor-panel').prepend(toolbar);
    toolbar.prepend(doc.querySelector('.editor-tools'));
    doc.querySelector('.editor-panel .panel-heading').insertAdjacentHTML('beforeend','<span class="mono file-label">order.json</span>');
    const result=doc.querySelector('.result-panel');result.append(doc.querySelector('.schema-provenance'));
    wrap.insertAdjacentHTML('afterbegin','<div class="console-tabs" role="tablist" aria-label="Console view"><button type="button" id="tab-messages" role="tab" aria-controls="panel-messages" aria-selected="false" tabindex="-1" data-panel="messages">Messages</button><button type="button" id="tab-json" role="tab" aria-controls="panel-json" aria-selected="true" tabindex="0" data-panel="json">JSON</button><button type="button" id="tab-validation" role="tab" aria-controls="panel-validation" aria-selected="false" tabindex="-1" data-panel="validation">Validation</button></div>');
    wrap.dataset.activePanel='json';
    const intro=doc.querySelector('.explorer-intro');intro.insertAdjacentHTML('beforeend','<a class="top-schema-source" href="#schema-source">Source: VDA5050 / 0b2ae43</a>');intro.querySelector('.standard-field')?.classList.add('mono');
    wrap.insertAdjacentHTML('beforeend','<aside class="console-compliance" aria-label="Compliance boundary"><span class="status-square" aria-hidden="true"></span>Schema-valid does not imply robot, protocol, behavioral or safety compliance.</aside>');
    panels.after(doc.querySelector('.console-compliance'));
  }
  return {...page,body:doc.body.innerHTML};
}
