// Walks a JSON Schema and returns a flat list of field rows.
// Everything in a row is taken from the schema itself; nothing is paraphrased.
const LOCAL_REF=/^#\/(.+)$/;
export function resolveRef(root,ref) {
  const match=LOCAL_REF.exec(ref);
  if(!match) throw Error(`Unsupported $ref ${ref}`);
  let node=root;
  for(const part of match[1].split('/')) node=node?.[part.replaceAll('~1','/').replaceAll('~0','~')];
  if(!node) throw Error(`Unresolved $ref ${ref}`);
  return node;
}
function typeOf(schema,root) {
  if(schema.$ref) return typeOf(resolveRef(root,schema.$ref),root);
  if(schema.enum&&!schema.type) return 'enum';
  if(Array.isArray(schema.type)) return schema.type.join(' | ');
  if(schema.type) return schema.type;
  for(const key of ['oneOf','anyOf']) if(schema[key]) return schema[key].map(s=>typeOf(s,root)).join(' | ');
  if(schema.allOf) return typeOf(schema.allOf[0],root);
  if(schema.properties) return 'object';
  if(schema.items) return 'array';
  return 'any';
}
function constraints(schema) {
  const out=[];
  if(schema.format) out.push(`format: ${schema.format}`);
  if(schema.pattern) out.push(`pattern: ${schema.pattern}`);
  if(schema.const!==undefined) out.push(`const: ${JSON.stringify(schema.const)}`);
  for(const key of ['minimum','maximum','exclusiveMinimum','exclusiveMaximum','multipleOf','minLength','maxLength','minItems','maxItems','minProperties','maxProperties']) if(schema[key]!==undefined) out.push(`${key}: ${schema[key]}`);
  if(schema.uniqueItems) out.push('uniqueItems');
  if(schema.default!==undefined) out.push(`default: ${JSON.stringify(schema.default)}`);
  if(schema.additionalProperties===false) out.push('additionalProperties: false');
  if(schema.unevaluatedProperties===false) out.push('unevaluatedProperties: false');
  return out;
}
export function walkSchema(root,{maxDepth=12}={}) {
  const rows=[];
  function visit(schema,path,pointer,required,stack,depth) {
    if(depth>maxDepth) return;
    let resolved=schema,refName=null;
    if(schema.$ref) {
      refName=schema.$ref;
      if(stack.includes(refName)) {
        rows.push({path,pointer,type:'object',required,constraints:[],description:schema.description||'',recursive:refName.replace(/^#\/(definitions|\$defs)\//,'')});
        return;
      }
      resolved={...resolveRef(root,refName),...Object.fromEntries(Object.entries(schema).filter(([k])=>k!=='$ref'))};
    }
    const composed=[];
    for(const key of ['allOf','oneOf','anyOf']) for(const sub of resolved[key]||[]) composed.push(sub.$ref?{...resolveRef(root,sub.$ref),...sub,$ref:undefined}:sub);
    const merged={...resolved};
    for(const sub of composed) {
      if(sub.properties) merged.properties={...(merged.properties||{}),...sub.properties};
      if(sub.required) merged.required=[...(merged.required||[]),...sub.required];
      if(sub.items&&!merged.items) merged.items=sub.items;
      if(sub.enum) merged.enum=[...(merged.enum||[]),...sub.enum];
    }
    if(path.length) rows.push({path,pointer,type:typeOf(schema,root),required,constraints:constraints(merged),enum:merged.enum,examples:merged.examples,description:merged.description||'',title:merged.title,definition:refName?refName.replace(/^#\/(definitions|\$defs)\//,''):null,oneOf:resolved.oneOf?resolved.oneOf.map(s=>typeOf(s,root)):null});
    const nextStack=refName?[...stack,refName]:stack;
    const req=new Set(merged.required||[]);
    for(const [name,sub] of Object.entries(merged.properties||{})) visit(sub,[...path,name],`${pointer}/properties/${name}`,req.has(name),nextStack,depth+1);
    if(merged.items&&typeof merged.items==='object'&&!Array.isArray(merged.items)) visit(merged.items,[...path,'[]'],`${pointer}/items`,false,nextStack,depth+1);
    for(const [i,sub] of (merged.prefixItems||[]).entries()) visit(sub,[...path,`[${i}]`],`${pointer}/prefixItems/${i}`,false,nextStack,depth+1);
  }
  visit(root,[],'#',false,[],0);
  return rows;
}
export const anchorFor=path=>'f-'+path.map(p=>p.replace(/[^A-Za-z0-9]+/g,'')).filter(Boolean).join('-')+(path.length&&path.at(-1)==='[]'?'-item':'');
export const displayPath=path=>path.map((p,i)=>p.startsWith('[')?p:(i?'.':'')+p).join('');
