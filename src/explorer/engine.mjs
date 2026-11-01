import {validators} from '../generated/validators.bundle.mjs';
import { parseMessage, pointer } from './parse.mjs';
import { findNodeAtLocation } from 'jsonc-parser';
import {standards} from './standards.mjs';
function locate(tree,parts) {
  let node=tree;
  for(const part of parts) node=node && findNodeAtLocation(node,[node.type==='array'?Number(part):part]);
  return node;
}
export function validateMessage(text,topic,standard='vda-5050') {
  const set=Object.hasOwn(validators,standard)?validators[standard]:null;
  const definition=standards[standard];
  if(!set||!definition||!definition.messages.includes(topic)||!Object.hasOwn(set,topic)) return {kind:'tool-error',valid:false,errors:[{path:'',message:'Unknown message type.'}]};
  const parsed=parseMessage(text);
  if(!parsed.ok) return {kind:parsed.kind,valid:false,errors:parsed.errors};
  const {data,tree}=parsed;
  if(definition.versionField && data && typeof data==='object' && typeof data.version==='string' && data.version!==definition.versionField) return {kind:'version',valid:false,errors:[{path:'/version',message:`This Explorer only targets ${definition.label} ${definition.versionField}. Version mismatch is a tool scope check; schema validation was not run.`,offset:findNodeAtLocation(tree,['version'])?.offset}]};
  const validate=set[topic];
  const valid=validate(data);
  const all=validate.errors||[];
  const errors=all.slice(0,100).map(error=>{
    const parts=error.instancePath?error.instancePath.slice(1).split('/').map(p=>p.replaceAll('~1','/').replaceAll('~0','~')):[];
    let node=locate(tree,parts);
    if(error.keyword==='required') parts.push(error.params.missingProperty);
    if(error.keyword==='additionalProperties') {parts.push(error.params.additionalProperty);node=locate(tree,parts)||node;}
    const allowed=error.params.allowedValues;
    return {path:pointer(parts),field:parts.filter(p=>!/^\d+$/.test(p)),message:error.message+(allowed?` (${allowed.join(', ')})`:''),keyword:error.keyword,schemaPath:error.schemaPath,offset:node?.offset,length:node?.length};
  });
  return {kind:'schema',valid,errors,total:all.length};
}
