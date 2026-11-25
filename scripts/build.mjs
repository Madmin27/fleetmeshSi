import { mkdir, rm, writeFile, readFile, cp, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pages as authoredPages } from '../src/pages.mjs';
import {presentPage} from '../src/design/presentation.mjs';
import {compileSchemas} from './compile-schemas.mjs';
import {referencePages} from '../src/reference/pages.mjs';
import {changelog,changelogPage} from '../src/changelog.mjs';
import {build} from 'esbuild';

const origin = 'https://fleetmesh.si';
const LAUNCH='2026-10-08';
const allPages=[...authoredPages,changelogPage,...referencePages()].map(page=>({date:LAUNCH,modified:LAUNCH,...page,...(page.path==='/'?{modified:'2026-11-25'}:{})}));
const pages=allPages.map(presentPage);
export const sitePages=pages;
const out = new URL('../dist/', import.meta.url);
const esc = text => String(text).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const longDate=iso=>new Date(iso+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(new URL('../src/assets/', import.meta.url), new URL('assets/', out), { recursive: true });
const {manifest,massManifest}=await compileSchemas();
await cp(new URL('../src/vendor/vda-5050/',import.meta.url),new URL(`schemas/vda-5050/${manifest.commit}/`,out),{recursive:true});
await mkdir(new URL('schemas/massrobotics/',out),{recursive:true});
await writeFile(new URL('schemas/massrobotics/manifest.json',out),JSON.stringify(massManifest,null,2)+'\n');
async function bundle(entry,name,define={}) {
  const result=await build({entryPoints:[new URL(`../src/explorer/${entry}`,import.meta.url).pathname],bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,write:false,legalComments:'eof',define});
  const bytes=result.outputFiles[0].contents;
  const filename=`${name}.${createHash('sha256').update(bytes).digest('hex').slice(0,12)}.js`;
  await writeFile(new URL(`assets/${filename}`,out),bytes);
  return `/assets/${filename}`;
}
const workerUrl=await bundle('worker.mjs','explorer-worker');
const appUrl=await bundle('app.mjs','explorer',{__WORKER_URL__:JSON.stringify(workerUrl)});
const runtimePackages=['ajv','ajv-formats','codemirror','jsonc-parser','lucide','@codemirror/autocomplete','@codemirror/commands','@codemirror/lang-json','@codemirror/language','@codemirror/lint','@codemirror/search','@codemirror/state','@codemirror/view','@lezer/common','@lezer/highlight','@lezer/lr','@lezer/json','crelt','@marijn/find-cluster-break','style-mod','w3c-keyname'];
let notices='FleetMesh Message Explorer - bundled third-party licenses\n\n';
for(const name of runtimePackages) {
  const dir=new URL(`../node_modules/${name}/`,import.meta.url);
  const files=(await readdir(dir)).filter(f=>/^licen[sc]e(?:\.|$)/i.test(f));
  if(!files.length)throw Error(`Missing license notice for ${name}`);
  const pkg=JSON.parse(await readFile(new URL('package.json',dir),'utf8'));
  notices+=`${name} ${pkg.version}\n${await readFile(new URL(files[0],dir),'utf8')}\n\n`;
}
await writeFile(new URL('THIRD-PARTY-NOTICES.txt',out),notices);
const css=(await Promise.all(['tokens','system','console','reference'].map(name=>readFile(new URL(`../src/design/${name}.css`,import.meta.url),'utf8')))).join('\n');
const styleName = `style.${createHash('sha256').update(css).digest('hex').slice(0, 12)}.css`;
await writeFile(new URL(`assets/${styleName}`, out), css);
const navItems = ['Standards', 'Reference', 'Orchestration', 'Architecture', 'Resources', 'Explorer', 'About'];
const nav = section => navItems.map(name => `<a href="${name==='Explorer'?'/tools/message-explorer/':`/${name.toLowerCase()}/`}"${section === name ? ' aria-current="page"' : ''}>${name}</a>`).join('');
const brand = `<a class="brand" href="/" aria-label="FleetMesh home"><img src="/assets/mark.svg" width="30" height="30" alt="">FleetMesh</a>`;
const header = section => `<a class="skip" href="#main">Skip to content</a><header class="site-header"><div class="wrap header-inner">${brand}<nav class="nav desktop-nav" aria-label="Primary">${nav(section)}</nav><details class="mobile-nav"><summary>Menu</summary><nav class="nav" aria-label="Mobile">${nav(section)}</nav></details></div></header>`;
const footer = `<footer class="site-footer"><div class="wrap"><div class="footer-top"><div>${brand}<p>Independent resources for autonomous fleet engineering.</p></div><nav class="footer-links" aria-label="Footer"><a href="/reference/">Field reference</a><a href="/resources/">Sources</a><a href="/changelog/">Changelog</a><a href="/feed.xml">Atom feed</a><a href="https://github.com/Madmin27/fleetmeshSi">Source on GitHub</a><a href="/about/">About &amp; editorial approach</a></nav></div><div class="footer-bottom"><span>&copy; 2026 FleetMesh</span><span>Independent of VDA, VDMA, MassRobotics and robot manufacturers.</span></div></div></footer>`;

function document(page) {
  const canonical = origin + page.path;
  const published=`${page.date}T00:00:00+03:00`,modified=`${page.modified}T00:00:00+03:00`;
  const author={ '@type': 'Organization', name: 'FleetMesh', url: `${origin}/about/`, description: 'Independent technical initiative' };
  const schema = page.article||page.reference ? {
    '@context': 'https://schema.org', '@type': page.reference?'TechArticle':'Article', headline: page.heading,
    description: page.description, inLanguage: 'en', datePublished: published, dateModified: modified,
    mainEntityOfPage: canonical, image: `${origin}/assets/social.png`, author,
    ...(page.reference?{isBasedOn:page.standardId==='vda-5050'?`https://github.com/VDA5050/VDA5050/tree/${manifest.commit}`:massManifest.upstream,about:`${page.standardId==='vda-5050'?'VDA 5050':'MassRobotics AMR Interoperability Standard'} ${page.topic} message`}:{})
  } : page.path === '/' ? {
    '@context': 'https://schema.org', '@type': 'WebSite', name: 'FleetMesh', url: origin + '/', description: page.description, inLanguage: 'en'
  } : null;
  const crumbs=page.article?`<a href="/standards/">Standards</a><span aria-hidden="true">/</span><span>${page.breadcrumb||'VDA 5050'}</span>`:page.reference?`<a href="/reference/">Reference</a><span aria-hidden="true">/</span><span>${esc(page.breadcrumb)}</span>`:`<span>${page.section}</span>`;
  const metaLine=page.article?`<p class="meta"><span>By <a href="/about/">FleetMesh</a></span><span>Published <time datetime="${page.date}">${longDate(page.date)}</time></span>${page.modified!==page.date?`<span>Updated <time datetime="${page.modified}">${longDate(page.modified)}</time></span>`:''}<span>${page.versionLabel||'Version 3.0.0'}</span></p>`:page.reference?`<p class="meta"><span>Generated from pinned schema</span><span>Build <time datetime="${page.modified}">${longDate(page.modified)}</time></span></p>`:'';
  const head = page.heading ? `<div class="page-head"><div class="wrap"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span>${crumbs}</nav><p class="eyebrow">${page.eyebrow}</p><h1>${page.heading}</h1><p class="lede">${page.intro}</p>${metaLine}</div></div>` : '';
  const discovery=['/','/standards/','/resources/'].includes(page.path)?`<section class="section"><div class="wrap"><p class="eyebrow">Guides and tools</p><h2>Read the interface. Inspect the message.</h2><ul class="resource-list"><li><h3><a href="/reference/">Message field reference</a></h3><p>574 fields across VDA 5050 v3.0.0 and MassRobotics, extracted from pinned official schemas.</p></li><li><h3><a href="/standards/massrobotics/">MassRobotics practical guide</a></h3><p>Identity, state sharing and the boundary of coordination.</p></li><li><h3><a href="/standards/vda-5050-vs-massrobotics/">VDA 5050 vs MassRobotics</a></h3><p>Eight comparison axes, with responsibilities kept explicit.</p></li><li><h3><a href="/tools/message-explorer/">Message Explorer</a></h3><p>VDA 5050 and MassRobotics structural validation with shareable links. JSON stays in your browser.</p></li></ul></div></section>`:'';
  const recent=page.path==='/'?`<section class="section recent-changes"><div class="wrap"><div class="section-title"><div><p class="eyebrow">Site record</p><h2>Recent changes</h2></div><a class="text-link" href="/changelog/">Full changelog</a></div><ul class="change-list">${changelog.slice(0,3).map(entry=>`<li><time datetime="${entry.date}" class="mono">${longDate(entry.date)}</time><div><h3>${entry.title}</h3><p>${entry.items[0]}</p></div></li>`).join('')}</ul></div></section>`:'';
  const content = (page.article||page.reference ? `<div class="wrap article-layout${page.reference?' reference-layout':''}"><aside class="toc" aria-label="Table of contents"><p>${page.reference?'ON THIS PAGE':'IN THIS GUIDE'}</p><nav aria-label="On this page">${page.toc.map(([id, title]) => `<a href="#${id}">${title}</a>`).join('')}</nav>${page.reference?`<p class="toc-note">Other ${page.standardId==='vda-5050'?'VDA 5050':'MassRobotics'} messages</p><nav aria-label="Sibling messages">${pages.filter(p=>p.reference&&p.standardId===page.standardId&&p.path!==page.path).map(p=>`<a href="${p.path}">${p.topic}</a>`).join('')}</nav>`:''}</aside><article class="prose${page.reference?' reference-article':''}" aria-label="${esc(page.heading)}">${page.body}${page.article?`<p class="source related-reference">Field-level detail for this standard: <a href="${/massrobotics/.test(page.path)?'/reference/massrobotics/':'/reference/vda-5050/'}${/massrobotics/.test(page.path)?'statusreport':'order'}/">message field reference</a>, generated from the pinned official schema.</p>`:''}</article></div>` : page.body)+discovery+recent;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#111313"><title>${esc(page.title)}</title><meta name="description" content="${esc(page.description)}"><link rel="canonical" href="${canonical}"><link rel="icon" href="/assets/mark.svg" type="image/svg+xml"><link rel="alternate" type="application/atom+xml" title="FleetMesh changelog" href="/feed.xml"><link rel="stylesheet" href="/assets/${styleName}"><meta property="og:type" content="${page.article||page.reference ? 'article' : 'website'}"><meta property="og:site_name" content="FleetMesh"><meta property="og:locale" content="en_US"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${origin}/assets/social.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="FleetMesh: Open intelligence for autonomous fleets"><meta name="twitter:card" content="summary_large_image">${page.article||page.reference ? `<meta property="article:published_time" content="${published}"><meta property="article:modified_time" content="${modified}">` : ''}${schema ? `<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>` : ''}</head><body>${header(page.section)}<main id="main">${head}${content}</main>${footer}</body></html>\n`;
}
for (const page of pages) {
  const fallback=page.tool?'<noscript><link rel="stylesheet" href="/assets/console-noscript.css"></noscript>':'';
  const dir = new URL(page.path.slice(1), out);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('index.html', dir), document(page).replace('</head>',`${fallback}<link rel="preload" href="/assets/fonts/geist-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous"><link rel="preload" href="/assets/fonts/ibm-plex-mono-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous"></head>`).replace('</body>',`${page.tool?`<script type="module" src="${appUrl}"></script>`:''}</body>`));
}
await writeFile(new URL('404.html', out), document({path:'/404.html',title:'Page Not Found | FleetMesh',section:'Resources',eyebrow:'Page not found',heading:'This route is not in the library.',intro:'Browse the published guides and source materials below.',body:'<div class="wrap reading"><a class="button" href="/resources/">Browse resources</a></div>',description:'This FleetMesh page could not be found.',date:LAUNCH,modified:LAUNCH}).replace('<meta name="theme-color"', '<meta name="robots" content="noindex"><meta name="theme-color"'));
await writeFile(new URL('robots.txt', out), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile(new URL('sitemap.xml', out), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p => `<url><loc>${origin}${p.path}</loc><lastmod>${p.modified}</lastmod></url>`).join('')}</urlset>\n`);
const feedUpdated=`${changelog[0].date}T00:00:00+03:00`;
await writeFile(new URL('feed.xml',out),`<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>FleetMesh changelog</title><subtitle>Changes to FleetMesh guides, reference pages and the Message Explorer.</subtitle><link href="${origin}/feed.xml" rel="self"/><link href="${origin}/changelog/"/><id>${origin}/changelog/</id><updated>${feedUpdated}</updated><author><name>FleetMesh</name></author>${changelog.map((entry,i)=>`<entry><title>${esc(entry.title)}</title><link href="${origin}/changelog/#${entry.date}-${i}"/><id>${origin}/changelog/#${entry.date}-${i}</id><updated>${entry.date}T00:00:00+03:00</updated><summary>${esc(entry.items.join(' '))}</summary></entry>`).join('')}</feed>\n`);
const llms=`# FleetMesh\n\n> Independent, vendor-neutral engineering resources for autonomous fleet interoperability: VDA 5050 and MassRobotics guides, a schema-derived field reference and a browser-only message validator. Not affiliated with VDA, VDMA, MassRobotics or any manufacturer. Official publications are normative; FleetMesh pages are commentary or mechanical extractions from pinned official schemas.\n\n## Guides\n${pages.filter(p=>p.article).map(p=>`- [${p.heading}](${origin}${p.path}): ${p.description}`).join('\n')}\n\n## Field reference (generated from pinned schemas)\n${pages.filter(p=>p.reference).map(p=>`- [${p.heading}](${origin}${p.path}): ${p.description}`).join('\n')}\n\n## Tools\n- [Message Explorer](${origin}/tools/message-explorer/): local JSON Schema validation for VDA 5050 v3.0.0 (commit ${manifest.commit}) and MassRobotics AMR Interop (commit ${massManifest.commit}). Schema-valid does not mean compliant.\n\n## Site\n${pages.filter(p=>!p.article&&!p.reference&&!p.tool).map(p=>`- [${p.heading||p.title}](${origin}${p.path}): ${p.description}`).join('\n')}\n- [Changelog](${origin}/changelog/) and [Atom feed](${origin}/feed.xml)\n`;
await writeFile(new URL('llms.txt',out),llms);
console.log(`Built ${pages.length} pages, a 404 page, static assets, robots.txt, sitemap.xml, feed.xml and llms.txt.`);
