import {readFileSync} from 'node:fs';
import {walkSchema,anchorFor,displayPath} from './walk.mjs';
import {standards} from '../explorer/standards.mjs';
const esc=text=>String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const vdaDir=new URL('../vendor/vda-5050/',import.meta.url),massDir=new URL('../vendor/massrobotics/',import.meta.url);
const vdaManifest=JSON.parse(readFileSync(new URL('manifest.json',vdaDir),'utf8'));
const massManifest=JSON.parse(readFileSync(new URL('manifest.json',massDir),'utf8'));
const massSchema=JSON.parse(readFileSync(new URL('AMR_Interop_Standard.json',massDir),'utf8'));
const REFERENCE_DATE='2026-11-01';
function fieldTable(rows,{standard,topic}) {
  const body=rows.map(row=>{
    const id=anchorFor(row.path);
    const depth=row.path.length-1;
    const facts=[...row.constraints];
    if(row.enum) facts.unshift(`enum: ${row.enum.map(v=>JSON.stringify(v)).join(', ')}`);
    if(row.oneOf) facts.unshift(`oneOf: ${row.oneOf.join(' | ')}`);
    if(row.recursive) facts.push(`recursive: see ${row.recursive}`);
    if(row.examples) facts.push(`examples: ${row.examples.map(v=>JSON.stringify(v)).join(', ')}`);
    return `<tr id="${id}" data-depth="${depth}"><td><a class="field-anchor" href="#${id}"><code>${esc(displayPath(row.path))}</code></a>${row.definition?`<span class="definition-ref">${esc(row.definition)}</span>`:''}</td><td><code>${esc(row.type)}</code></td><td>${row.required?'<span class="req">required</span>':'<span class="opt">optional</span>'}</td><td>${facts.length?`<ul class="facts">${facts.map(f=>`<li><code>${esc(f)}</code></li>`).join('')}</ul>`:''}</td><td class="field-description">${row.description?esc(row.description):'<span class="no-description">No description in schema.</span>'}</td></tr>`;
  }).join('');
  return `<p class="table-note">${rows.length} fields extracted from the pinned ${esc(standard.label)} <code>${esc(standard.schemaFile(topic))}</code>. "required" is relative to the enclosing object; an optional parent makes its required children conditional.</p><div class="table-scroll reference-scroll"><table class="field-table"><caption class="visually-hidden">${esc(topic)} fields</caption><thead><tr><th scope="col">Field</th><th scope="col">Type</th><th scope="col">Presence</th><th scope="col">Schema constraints</th><th scope="col">Description (verbatim from schema)</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function enumSection(rows) {
  const enums=rows.filter(r=>r.enum&&r.enum.length);
  if(!enums.length) return '';
  return `<h2 id="enumerations">Enumerations</h2><p>Every <code>enum</code> keyword in this schema. Values outside these lists fail validation. Some fields describe themselves as extensible enumerations in prose but carry no <code>enum</code> keyword; those are not listed here because the schema does not constrain them.</p><dl class="enum-list">${enums.map(r=>`<div><dt><a href="#${anchorFor(r.path)}"><code>${esc(displayPath(r.path))}</code></a></dt><dd>${r.enum.map(v=>`<code>${esc(JSON.stringify(v))}</code>`).join(' ')}</dd></div>`).join('')}</dl>`;
}
function requiredSummary(rows) {
  const top=rows.filter(r=>r.path.length===1);
  return `<h2 id="top-level">Top-level members</h2><div class="top-level-grid">${top.map(r=>`<a href="#${anchorFor(r.path)}" class="top-level-item${r.required?' is-required':''}"><code>${esc(r.path[0])}</code><span>${esc(r.type)}</span><span class="mono">${r.required?'REQUIRED':'OPTIONAL'}</span></a>`).join('')}</div>`;
}
function referencePage({standard,topic,schema,fileRecord,extra='',subtopic}) {
  const rows=walkSchema(schema);
  const required=rows.filter(r=>r.required).length;
  const title=schema.title||topic;
  const explorer=`/tools/message-explorer/#s=${standard.id}&t=${topic}`;
  return {
    path:`${standard.reference}${topic.toLowerCase()}/`,section:'Reference',reference:true,standardId:standard.id,topic,
    date:REFERENCE_DATE,modified:REFERENCE_DATE,
    breadcrumb:`${standard.label} / ${topic}`,
    title:`${standard.id==='vda-5050'?'VDA 5050':'MassRobotics'} ${topic} fields | FleetMesh Reference`,
    heading:`${topic}`,eyebrow:`${standard.label} ${standard.version} / field reference`,
    description:`Every field of the ${standard.label} ${standard.version} ${topic} message: ${rows.length} fields, ${required} required, types, enums and constraints extracted from the pinned official JSON Schema.`,
    intro:schema.description?esc(schema.description):`Field-by-field reference generated from the official ${standard.label} schema.`,
    fieldCount:rows.length,requiredCount:required,
    toc:[['provenance','Provenance'],['top-level','Top-level members'],['fields','All fields'],...(rows.some(r=>r.enum)?[['enumerations','Enumerations']]:[]),['usage','How to read this page']],
    body:`<div class="reference-meta mono"><span>FIELDS ${rows.length}</span><span>REQUIRED ${required}</span><span>DIALECT ${esc(standard.dialect)}</span>${subtopic?`<span>MQTT SUBTOPIC ${esc(subtopic)}</span>`:''}</div>
<section id="provenance" class="provenance-block"><h2>Provenance</h2><p>Generated at build time from <a href="${standard.schemaLink(topic)}"><code>${esc(standard.schemaFile(topic))}</code></a> at commit <a href="${standard.repo}"><code>${standard.commit}</code></a> (snapshot ${esc(standard.id==='vda-5050'?vdaManifest.snapshotDate:massManifest.snapshotDate)}, SHA-256 <code>${fileRecord.sha256.slice(0,16)}…</code>). Descriptions are quoted verbatim; nothing is paraphrased. The <a href="${standard.normative.href}">${esc(standard.normative.label)}</a> is normative: if it differs from the schema, the publication wins.</p><p><a class="button" href="${explorer}">Validate ${esc(topic)} JSON locally</a> <a class="text-link" href="${standard.guide}">Read the ${esc(standard.label)} guide</a></p>${extra}</section>
${requiredSummary(rows)}
<h2 id="fields">All fields</h2>${fieldTable(rows,{standard,topic})}
${enumSection(rows)}
<h2 id="usage">How to read this page</h2><ul><li><code>a.b[].c</code> means member <code>c</code> of each element of array <code>b</code> inside object <code>a</code>.</li><li>"required" comes from the schema's <code>required</code> keyword of the enclosing object only. The schema does not express conditional requirements between siblings.</li><li>Schema constraints are the validation keywords present in the schema. Prose rules in the description (for example "should" or "must" sentences) are not enforced by schema validation.</li><li>This page documents message structure. It says nothing about timing, state machines, safety or behavior, which the standard defines in prose.</li></ul>`
  };
}
export function referencePages() {
  const pages=[];
  const vda=standards['vda-5050'];
  for(const topic of vda.messages) {
    const file=`${topic}.schema`;
    const schema=JSON.parse(readFileSync(new URL(file,vdaDir),'utf8'));
    pages.push(referencePage({standard:vda,topic,schema,fileRecord:vdaManifest.files[file],subtopic:schema.subtopic}));
  }
  const mass=standards['massrobotics'];
  for(const topic of mass.messages) {
    const schema={...massSchema[topic],definitions:massSchema.definitions,title:topic,description:massSchema[topic].description};
    const extra=`<div class="note"><p><strong>Observed in the snapshot</strong></p><p>The repository's own example files <code>examples/${topic}1.json</code> use uppercase hexadecimal UUIDs, while the schema's <code>pattern</code> for <code>uuid</code>${topic==='statusReport'?' and <code>location.planarDatum</code>':''} only admits lowercase <code>[0-9a-f]</code>. Validating the official example against the official schema therefore reports a pattern error. The Explorer reproduces this; it is reported, not corrected. The repository contains no LICENSE file, so the schema is not redistributed here as a download.</p></div>`;
    pages.push(referencePage({standard:mass,topic,schema,fileRecord:massManifest.files['AMR_Interop_Standard.json'],extra}));
  }
  const index={
    path:'/reference/',section:'Reference',date:REFERENCE_DATE,modified:REFERENCE_DATE,
    title:'Message Field Reference: VDA 5050 and MassRobotics | FleetMesh',
    heading:'Message field reference',eyebrow:'Reference / generated from pinned official schemas',
    description:'Field-level reference for all VDA 5050 v3.0.0 message families and MassRobotics AMR Interop reports, extracted from pinned official JSON Schemas with provenance hashes.',
    intro:'Every field, type, presence rule, enum and constraint, extracted mechanically from the official schemas and linked to a local validator. Descriptions are quoted verbatim.',
    body:`<div class="wrap reading reference-index">${Object.values(standards).map(s=>`<section class="standard-summary"><p class="eyebrow">${esc(s.label)} ${esc(s.version)} <span aria-hidden="true">/</span> ${esc(s.dialect)}</p><h2>${esc(s.label)} messages</h2><p>Pinned commit <a href="${s.repo}"><code>${s.short}</code></a>. ${s.download?'Schema files are served with SHA-256 manifest.':'No LICENSE file upstream; schema used for validation and reference only.'}</p><ul class="resource-list">${pages.filter(p=>p.standardId===s.id).map(p=>`<li><h3><a href="${p.path}">${esc(p.topic)}</a></h3><p>${esc(p.intro)}</p><small>${p.fieldCount} fields, ${p.requiredCount} required</small></li>`).join('')}</ul></section>`).join('')}<section class="standard-summary"><h2>Method</h2><p>A build step walks each pinned schema, resolves local <code>$ref</code> definitions, merges <code>allOf</code>/<code>oneOf</code>/<code>anyOf</code> members for display and records the validation keywords present on each field. The same schema bytes compile the Explorer's validators, so what the reference shows and what the validator enforces cannot drift apart. Generated pages are regenerated from scratch on every build; corrections go to the upstream repositories, not here.</p></section></div>`
  };
  return [index,...pages];
}
