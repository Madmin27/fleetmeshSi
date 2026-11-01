import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateMessage} from '../src/explorer/engine.mjs';
import {parseMessage,pointer,MAX_BYTES} from '../src/explorer/parse.mjs';
import {examples,messageNames} from '../src/explorer/examples.mjs';
import {createAjv} from '../scripts/compile-schemas.mjs';
const check=(value,topic='order')=>validateMessage(JSON.stringify(value),topic);
for(const topic of messageNames)test(`${topic}: illustrative message passes official schema`,()=>assert.equal(check(examples[topic],topic).valid,true));
test('nested type error has full pointer and exact editor offset',()=>{
  const value=structuredClone(examples.order);value.nodes[0].nodePosition.x='wrong';
  const text=JSON.stringify(value,null,2),result=validateMessage(text,'order');
  const error=result.errors.find(e=>e.path==='/nodes/0/nodePosition/x');
  assert(error);assert.equal(text.slice(error.offset,error.offset+error.length),'"wrong"');
});
test('required property error points at missing member',()=>{
  const value=structuredClone(examples.order);delete value.nodes[0].nodePosition.x;
  assert(check(value).errors.some(e=>e.path==='/nodes/0/nodePosition/x'&&e.keyword==='required'));
});
test('format, enum and uint32 constraints are active',()=>{
  assert.equal(check({...examples.order,timestamp:'not-a-date'}).valid,false);
  assert.equal(check({...examples.connection,connectionState:'BOGUS'},'connection').valid,false);
  assert.equal(check({...examples.responses,headerId:4294967296},'responses').valid,false);
});
test('values are not coerced and input remains unchanged',()=>{
  const value={...examples.order,headerId:'1'},before=JSON.stringify(value);
  assert.equal(check(value).valid,false);assert.equal(JSON.stringify(value),before);
});
test('malformed, empty and ambiguous JSON are not schema failures',()=>{
  for(const text of ['{"x":1,}','{/*comment*/"x":1}','{"x":'])assert.equal(validateMessage(text,'order').kind,'syntax');
  assert.equal(validateMessage('','order').kind,'empty');
  assert.equal(validateMessage('{"a":1,"a":2}','order').kind,'input');
  assert.equal(parseMessage('{"a/b~c":1,"a/b~c":2}').errors[0].path,'/a~1b~0c');
  assert.equal(pointer(['nodes',0,'x']),'/nodes/0/x');
});
test('unsupported versions and unknown topics are separate scope errors',()=>{
  assert.equal(check({...examples.order,version:'2.0.0'}).kind,'version');
  assert.equal(check(examples.order,'toString').kind,'tool-error');
});
test('local size, depth and numeric precision guards',()=>{
  assert.equal(parseMessage(' '.repeat(MAX_BYTES+1)).kind,'input-limit');
  assert.equal(parseMessage('['.repeat(110)+'0'+']'.repeat(110)).kind,'input-limit');
  assert.equal(parseMessage('{"x":9007199254740993}').kind,'input');
  assert.equal(parseMessage('{"x":1e400}').kind,'input');
});
test('Draft 2020-12 prefixItems and unevaluatedProperties are enforced',()=>{
  const ajv=createAjv();
  const tuple=ajv.compile({$schema:'https://json-schema.org/draft/2020-12/schema',type:'array',prefixItems:[{type:'string'}],items:false});
  assert(tuple(['a']));assert(!tuple([1]));assert(!tuple(['a',2]));
  const object=ajv.compile({$schema:'https://json-schema.org/draft/2020-12/schema',type:'object',allOf:[{properties:{a:{type:'integer'}}}],unevaluatedProperties:false});
  assert(object({a:1}));assert(!object({a:1,b:2}));
});
test('vendored source bytes match the pinned manifest',async()=>{
  const dir=new URL('../src/vendor/vda-5050/',import.meta.url),manifest=JSON.parse(await readFile(new URL('manifest.json',dir),'utf8'));
  assert.equal(manifest.commit,'0b2ae43154bcd1ab2be4e2445df8b406dcad77b2');
  for(const [name,record] of Object.entries(manifest.files))assert.equal(createHash('sha256').update(await readFile(new URL(name,dir))).digest('hex'),record.sha256);
});
