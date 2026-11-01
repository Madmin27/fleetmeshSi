import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateMessage} from '../src/explorer/engine.mjs';
import {exampleFor,massExamples} from '../src/explorer/examples.mjs';
import {encodeShare,decodeShare} from '../src/explorer/share.mjs';
import {walkSchema,anchorFor,displayPath} from '../src/reference/walk.mjs';
import {referencePages} from '../src/reference/pages.mjs';
import {standards} from '../src/explorer/standards.mjs';
test('MassRobotics official examples fail only on the UUID pattern; lowercase variants pass',()=>{
  for(const topic of ['identityReport','statusReport']) {
    const official=validateMessage(JSON.stringify(massExamples[topic].official),topic,'massrobotics');
    assert.equal(official.valid,false);
    assert(official.errors.every(e=>e.keyword==='pattern'&&/uuid|planarDatum/.test(e.path)),JSON.stringify(official.errors));
    assert.equal(validateMessage(JSON.stringify(massExamples[topic].adjusted),topic,'massrobotics').valid,true);
  }
});
test('MassRobotics: enum, additionalProperties and range constraints are enforced with draft-07 semantics',()=>{
  const base=massExamples.statusReport.adjusted;
  assert.equal(validateMessage(JSON.stringify({...base,operationalState:'flying'}),'statusReport','massrobotics').valid,false);
  assert.equal(validateMessage(JSON.stringify({...base,extra:1}),'statusReport','massrobotics').valid,false);
  assert.equal(validateMessage(JSON.stringify({...base,batteryPercentage:101}),'statusReport','massrobotics').valid,false);
  assert.equal(validateMessage(JSON.stringify({...base,version:'2.0.0'}),'statusReport','massrobotics').kind,'schema','no version scope check for MassRobotics');
});
test('standards cannot validate each other\'s topics',()=>{
  assert.equal(validateMessage('{}','order','massrobotics').kind,'tool-error');
  assert.equal(validateMessage('{}','statusReport','vda-5050').kind,'tool-error');
  assert.equal(validateMessage('{}','statusReport','nope').kind,'tool-error');
});
test('errors carry field parts without array indices for reference anchors',()=>{
  const value=structuredClone(exampleFor('vda-5050','order'));value.nodes[0].nodePosition.x='x';
  const error=validateMessage(JSON.stringify(value),'order').errors[0];
  assert.deepEqual(error.field,['nodes','nodePosition','x']);
  assert.equal(anchorFor(['nodes','[]','nodePosition','x']),'f-nodes-nodePosition-x');
  assert.equal(anchorFor(['nodes','[]']),'f-nodes-item');
});
test('share links round-trip and never contain the JSON outside the fragment',async()=>{
  const text=JSON.stringify(exampleFor('vda-5050','state'),null,2);
  const fragment=await encodeShare({standard:'vda-5050',topic:'state',text});
  assert(/^s=vda-5050&t=state&m=[A-Za-z0-9_-]+$/.test(fragment));
  assert.deepEqual(await decodeShare(fragment),{standard:'vda-5050',topic:'state',text});
  assert.equal(await decodeShare('unrelated=1'),null);
  await assert.rejects(decodeShare('s=vda-5050&t=order&m=!!!notbase64'));
});
test('reference pages cover every registered message with verbatim descriptions',async()=>{
  const pages=referencePages();
  for(const [id,s] of Object.entries(standards)) for(const topic of s.messages) {
    const page=pages.find(p=>p.standardId===id&&p.topic===topic);
    assert(page,`${id}/${topic}`);assert(page.fieldCount>0);
  }
  const order=JSON.parse(await readFile(new URL('../src/vendor/vda-5050/order.schema',import.meta.url),'utf8'));
  const rows=walkSchema(order);
  const node=rows.find(r=>displayPath(r.path)==='nodes[].nodeId');
  assert.equal(node.description,order.definitions.node.properties.nodeId.description);
  assert.equal(node.required,true);
  const blocking=rows.find(r=>displayPath(r.path)==='nodes[].actions[].blockingType');
  assert.deepEqual(blocking.enum,['NONE','SOFT','SINGLE','HARD']);
  assert.equal(new Set(rows.map(r=>anchorFor(r.path))).size,rows.length,'anchors unique');
});
test('MassRobotics vendored bytes match manifest and declare no license file',async()=>{
  const dir=new URL('../src/vendor/massrobotics/',import.meta.url),manifest=JSON.parse(await readFile(new URL('manifest.json',dir),'utf8'));
  assert.equal(manifest.commit,'f9357a423ecabc3f7112e6d10025a5231943ec50');
  assert(/No LICENSE file/.test(manifest.license));
  for(const [name,record] of Object.entries(manifest.files))assert.equal(createHash('sha256').update(await readFile(new URL(name,dir))).digest('hex'),record.sha256);
});
