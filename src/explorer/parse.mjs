import { parseTree, printParseErrorCode, getNodePath } from 'jsonc-parser';
export const MAX_BYTES=262144;
export const pointer=parts=>parts.length?'/'+parts.map(p=>String(p).replaceAll('~','~0').replaceAll('/','~1')).join('/'):'';
export function parseMessage(text) {
  if(new TextEncoder().encode(text).length>MAX_BYTES) return {ok:false,kind:'input-limit',errors:[{path:'',message:'Message exceeds the 256 KiB local input limit.'}]};
  if(!text.trim()) return {ok:false,kind:'empty',errors:[{path:'',message:'Enter a JSON message.'}]};
  const errors=[];
  let tree;
  try { tree=parseTree(text,errors,{allowTrailingComma:false,disallowComments:true}); }
  catch { return {ok:false,kind:'input-limit',errors:[{path:'',message:'JSON nesting exceeds the parser limit.'}]}; }
  if(errors.length || !tree) return {ok:false,kind:'syntax',errors:errors.slice(0,100).map(e=>({path:'',message:printParseErrorCode(e.error),offset:e.offset,length:e.length}))};
  const pending=[[tree,0]], problems=[];
  while(pending.length) {
    const [node,depth]=pending.pop();
    if(depth>100) return {ok:false,kind:'input-limit',errors:[{path:'',message:'JSON nesting exceeds the 100-level local input limit.'}]};
    if(node.type==='object') {
      const names=new Set();
      for(const property of node.children||[]) {
        const key=property.children[0];
        if(names.has(key.value)) problems.push({path:pointer([...getNodePath(node),key.value]),message:'Duplicate property name; remove ambiguity before validation.',offset:key.offset,length:key.length});
        names.add(key.value);
      }
    }
    if(node.type==='number' && (!Number.isFinite(node.value) || (Number.isInteger(node.value)&&!Number.isSafeInteger(node.value)))) problems.push({path:pointer(getNodePath(node)),message:'Number cannot be represented safely by this browser validator.',offset:node.offset,length:node.length});
    for(const child of node.children||[]) pending.push([child,depth+1]);
  }
  if(problems.length) return {ok:false,kind:'input',errors:problems.slice(0,100)};
  return {ok:true,data:JSON.parse(text),tree};
}
