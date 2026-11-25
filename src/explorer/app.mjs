import {basicSetup} from 'codemirror';
import {EditorView} from '@codemirror/view';
import {json} from '@codemirror/lang-json';
import {HighlightStyle,syntaxHighlighting} from '@codemirror/language';
import {tags} from '@lezer/highlight';
import {undo,redo,undoDepth,redoDepth,isolateHistory} from '@codemirror/commands';
import {createIcons,ShieldCheck,FileJson,Check,FolderOpen,Braces,Undo2,Redo2,Copy,Download,Link} from 'lucide';
import {exampleFor} from './examples.mjs';
import {parseMessage,MAX_BYTES} from './parse.mjs';
import {standards,standardIds} from './standards.mjs';
import {encodeShare,decodeShare} from './share.mjs';

const $=id=>document.getElementById(id);
let dirty=false,revision=0,worker,timer,ready=false,request=0,pendingReplace,standard='vda-5050';
const current=()=>standards[standard];
const topic=()=>$('message-type').value;
const notice=text=>{$('tool-notice').textContent=text;};
function summary(title,message,badge='Not validated',state='') {
  $('result-badge').textContent=badge;
  $('result-badge').className=`result-badge ${state}`;
  $('result-badge').dataset.state=state==='success'?'valid':state==='failure'?'invalid':'';
  const heading=document.createElement('h3'),paragraph=document.createElement('p');
  heading.textContent=title;paragraph.textContent=message;
  $('result-summary').replaceChildren(heading,paragraph);
  $('error-list').replaceChildren();$('result-detail').textContent='';
}
function stale() {
  revision++;clearTimeout(timer);$('validate').disabled=!ready;
  summary('Not validated','The current message and selected schema have not been validated.');
}
const initial=$('json-fallback').value;
$('json-fallback').remove();
const darkSyntax=HighlightStyle.define([{tag:tags.propertyName,color:'#c5cdc8'},{tag:tags.string,color:'#9fc3e3'},{tag:tags.number,color:'#d8c39a'},{tag:tags.bool,color:'#e8c47a'},{tag:tags.null,color:'#e8c47a'},{tag:tags.punctuation,color:'#aeb7b5'}]);
const editor=new EditorView({doc:initial,parent:$('editor'),extensions:[basicSetup,json(),EditorView.lineWrapping,EditorView.theme({'&':{color:'#f0f1eb',backgroundColor:'#0c0e0e'}},{dark:true}),syntaxHighlighting(darkSyntax),
  EditorView.contentAttributes.of({'aria-label':'JSON message',spellcheck:'false','aria-describedby':'payload-privacy'}),
  EditorView.updateListener.of(update=>{
    if(update.docChanged){dirty=true;stale();$('document-status').textContent='Edited in this tab';}
    $('undo').disabled=!undoDepth(update.state);$('redo').disabled=!redoDepth(update.state);
    $('document-size').textContent=`${new TextEncoder().encode(update.state.doc.toString()).length.toLocaleString('en-US')} / 262,144 bytes`;
  })]});
createIcons({icons:{ShieldCheck,FileJson,Check,FolderOpen,Braces,Undo2,Redo2,Copy,Download,Link}});
const mobile=matchMedia('(max-width: 900px)'),tabs=[...document.querySelectorAll('[data-panel]')];
function selectPanel(name,focus=false) {
  document.querySelector('.explorer-wrap').dataset.activePanel=name;
  for(const tab of tabs){const active=tab.dataset.panel===name;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
  for(const name of ['messages','json','validation']) {
    const panel=$(`panel-${name}`);
    if(mobile.matches){panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',`tab-${name}`);}
    else {panel.removeAttribute('role');if(name==='messages')panel.removeAttribute('aria-labelledby');else panel.setAttribute('aria-labelledby',name==='json'?'editor-title':'results-title');}
  }
  if(name==='json')editor.requestMeasure();
  if(focus&&mobile.matches)$(`tab-${name}`).focus();
}
for(const tab of tabs){
  tab.onclick=()=>selectPanel(tab.dataset.panel);
  tab.onkeydown=event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const index=event.key==='Home'?0:event.key==='End'?2:(tabs.indexOf(tab)+(event.key==='ArrowRight'?1:2))%3;
    selectPanel(tabs[index].dataset.panel,true);
  };
}
mobile.addEventListener('change',()=>selectPanel(document.querySelector('.explorer-wrap').dataset.activePanel));
selectPanel('json');
document.querySelector('.top-schema-source').onclick=()=>selectPanel('validation');
const referenceHref=(fieldParts)=>`${current().reference}${topic().toLowerCase()}/${fieldParts&&fieldParts.length?'#f-'+fieldParts.map(p=>p.replace(/[^A-Za-z0-9]+/g,'')).filter(Boolean).join('-'):''}`;
function display(result) {
  if(mobile.matches)selectPanel('validation',true);
  const isSchema=result.kind==='schema';
  summary(result.valid?'Schema-valid':isSchema?'Schema errors':result.kind==='version'?'Unsupported version':result.kind==='tool-error'?'Validation unavailable':'Input not validated',
    result.valid?'Message structure passes the selected schema. This is not a compliance result.':isSchema?`${result.total} structural error${result.total===1?'':'s'} found.`:'Schema validation was not completed. Resolve the issue below first.',
    result.valid?'Schema-valid':isSchema?'Invalid':'Not validated',result.valid?'success':'failure');
  for(const error of result.errors||[]) {
    const li=document.createElement('li'),button=document.createElement('button'),code=document.createElement('code'),message=document.createElement('p');
    button.type='button';button.className='error-path';
    code.textContent=error.path||'/ (document root)';button.append(code);
    const offset=Math.min(error.offset||0,editor.state.doc.length),line=editor.state.doc.lineAt(offset);
    button.title=`Go to line ${line.number}, column ${offset-line.from+1}`;
    button.addEventListener('click',()=>{selectPanel('json');editor.dispatch({selection:{anchor:offset},scrollIntoView:true});editor.focus();});
    message.textContent=error.message;li.append(button,message);
    if(error.keyword){const small=document.createElement('small');small.textContent=`${error.keyword} | ${error.schemaPath}`;
      if(isSchema&&error.field){const ref=document.createElement('a');ref.href=referenceHref(error.field);ref.textContent='field reference';ref.className='error-reference';small.append(' | ',ref);}
      li.append(small);}
    $('error-list').append(li);
  }
  if(result.total>100)$('result-detail').textContent=`Showing the first 100 of ${result.total} errors.`;
}
function startWorker() {
  ready=false;$('validate').disabled=true;worker?.terminate();
  worker=new Worker(__WORKER_URL__,{type:'module'});
  worker.onmessage=({data})=>{
    if(data.ready){ready=true;$('validate').disabled=false;return;}
    if(data.id!==request||data.id!==revision)return;
    clearTimeout(timer);$('validate').disabled=false;display(data.result);
  };
  worker.onerror=()=>{clearTimeout(timer);ready=false;worker.terminate();$('validate').disabled=false;summary('Validation unavailable','The local validator could not start. Validate again to retry; no message was sent to a server.');};
}
$('validate').addEventListener('click',()=>{
  if(!ready){startWorker();notice('Restarting the local validator.');return;}
  const text=editor.state.doc.toString();
  if(new TextEncoder().encode(text).length>MAX_BYTES){display(parseMessage(text));return;}
  request=++revision;$('validate').disabled=true;summary('Validating locally','Checking message structure in this browser.','Checking');
  worker.postMessage({id:request,text,topic:topic(),standard});
  timer=setTimeout(()=>{worker.terminate();ready=false;$('validate').disabled=false;summary('Validation timed out','The local check was stopped after 3 seconds. Reduce the input and validate again.');},3000);
});
function replace(text,label) {
  const apply=()=>{selectPanel('json');editor.dispatch({changes:{from:0,to:editor.state.doc.length,insert:text},annotations:isolateHistory.of('full')});dirty=false;$('document-status').textContent=label;notice('');};
  if(!dirty){apply();return;}
  pendingReplace=apply;$('replace-dialog').showModal();$('replace-cancel').focus();
}
$('replace-cancel').onclick=()=>{$('replace-dialog').close();pendingReplace=null;};
$('replace-confirm').onclick=()=>{pendingReplace?.();pendingReplace=null;$('replace-dialog').close();editor.focus();};
$('replace-dialog').addEventListener('cancel',()=>{pendingReplace=null;});
function loadExample(variant) {
  const label=standard==='massrobotics'?(variant==='adjusted'?'Repository example, UUIDs lowercased by FleetMesh':'Official repository example'):'FleetMesh structural example';
  replace(JSON.stringify(exampleFor(standard,topic(),variant),null,2),label);
}
$('load-example').onclick=()=>{if(standard==='massrobotics'){$('example-dialog').showModal();$('example-adjusted').focus();}else loadExample();};
$('example-official').onclick=()=>{$('example-dialog').close();loadExample('official');};
$('example-adjusted').onclick=()=>{$('example-dialog').close();loadExample('adjusted');};
function applyTopic() {
  const name=topic(),def=current();
  for(const button of document.querySelectorAll('[data-message]'))button.setAttribute('aria-pressed',String(button.dataset.message===name&&button.dataset.standard===standard));
  document.querySelector('.file-label').textContent=`${name}.json`;
  $('schema-link').href=def.schemaLink(name);$('schema-link').textContent=def.schemaFile(name);
  $('reference-link').href=referenceHref([]);
  if(def.download){$('schema-download').href=def.download(name);$('schema-download').hidden=false;}else $('schema-download').hidden=true;
}
function applyStandard(id,{silent=false}={}) {
  if(!standardIds.includes(id))return;
  standard=id;const def=current();
  $('standard-select').value=id;
  $('message-type').replaceChildren(...def.messages.map(n=>Object.assign(document.createElement('option'),{value:n,textContent:n})));
  $('dialect-label').textContent=def.dialect;$('nav-dialect').textContent=def.id==='vda-5050'?'JSON Schema Draft 2020-12':'No $schema declared; draft-07 semantics';
  $('provenance-standard').textContent=`${def.label} v${def.version} JSON Schema${def.id==='vda-5050'?'s':''}`;
  $('commit-link').href=def.repo;$('commit-text').textContent=def.commit;$('commit-note').textContent=def.id==='vda-5050'?'(official main snapshot)':'(repository main; last upstream change 2021-10-08)';
  $('normative-link').href=def.normative.href;$('normative-link').textContent=def.normative.label;
  document.querySelector('.top-schema-source').textContent=`Source: ${def.id==='vda-5050'?'VDA5050':'MassRobotics-AMR'} / ${def.short}`;
  for(const group of document.querySelectorAll('[data-standard-group]'))group.dataset.active=String(group.dataset.standardGroup===id);
  applyTopic();stale();
  if(!silent)notice(`Standard changed to ${def.label}. Current JSON retained.`);
}
$('standard-select').onchange=()=>applyStandard($('standard-select').value);
for(const button of document.querySelectorAll('[data-message]')) {
  button.disabled=false;button.onclick=()=>{if(button.dataset.standard!==standard)applyStandard(button.dataset.standard,{silent:true});$('message-type').value=button.dataset.message;$('message-type').dispatchEvent(new Event('change'));};
}
$('message-type').onchange=()=>{if(!current().messages.includes(topic()))return;applyTopic();stale();notice('Schema changed. Current JSON retained.');};
$('format').onclick=()=>{
  const result=parseMessage(editor.state.doc.toString());
  if(!result.ok){display(result);notice('Formatting skipped: input is not valid, unambiguous JSON.');return;}
  editor.dispatch({changes:{from:0,to:editor.state.doc.length,insert:JSON.stringify(result.data,null,2)},annotations:isolateHistory.of('full')});notice('JSON formatted locally.');
};
$('undo').onclick=()=>{undo(editor);editor.focus();};$('redo').onclick=()=>{redo(editor);editor.focus();};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(editor.state.doc.toString());notice('JSON copied to your clipboard.');}catch{notice('Clipboard access was unavailable. The JSON has not been copied.');}};
$('download').onclick=()=>{
  const url=URL.createObjectURL(new Blob([editor.state.doc.toString()],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=`${standard}-${topic()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  notice('Local JSON download requested.');
};
$('share').onclick=async()=>{
  try{
    const fragment=await encodeShare({standard,topic:topic(),text:editor.state.doc.toString()});
    if(fragment.length>8000){notice('Message too large for a share link (fragment would exceed 8,000 characters). Download it instead.');return;}
    const url=`${location.origin}${location.pathname}#${fragment}`;
    history.replaceState(null,'',`#${fragment}`);
    await navigator.clipboard.writeText(url);
    notice(`Share link copied (${url.length.toLocaleString('en-US')} characters). The JSON travels in the URL fragment only; no server receives it.`);
  }catch{notice('Share link could not be created or copied. The address bar fragment was not changed.');}
};
$('open-file').onclick=()=>$('file-input').click();
$('file-input').onchange=async event=>{
  const file=event.target.files[0];event.target.value='';if(!file)return;
  if(file.size>MAX_BYTES){notice('File exceeds the local 256 KiB limit. Current JSON retained.');return;}
  const before=revision;
  try{const text=await file.text();if(before!==revision){notice('The editor changed while the file was read. Open the file again.');return;}replace(text,`Local file: ${file.name}`);}catch{notice('The local file could not be read.');}
};
for(const id of ['standard-select','message-type','load-example','open-file','format','copy','download','share'])$(id).disabled=false;
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
startWorker();
(async()=>{
  const hash=location.hash.slice(1);
  if(!hash)return;
  try{
    const shared=await decodeShare(hash);
    if(!shared)return;
    if(shared.standard&&standardIds.includes(shared.standard))applyStandard(shared.standard,{silent:true});
    if(shared.topic&&current().messages.includes(shared.topic)){$('message-type').value=shared.topic;applyTopic();}
    if(typeof shared.text==='string'){
      if(new TextEncoder().encode(shared.text).length>MAX_BYTES){notice('Shared link content exceeds the 256 KiB local limit and was not loaded.');return;}
      editor.dispatch({changes:{from:0,to:editor.state.doc.length,insert:shared.text},annotations:isolateHistory.of('full')});
      dirty=false;$('document-status').textContent='Loaded from share link (decoded locally)';
      notice('JSON decoded from the URL fragment in this browser. Review it before validating.');
    }
  }catch{notice('The URL fragment could not be decoded as a share link. The default example is shown.');}
})();
