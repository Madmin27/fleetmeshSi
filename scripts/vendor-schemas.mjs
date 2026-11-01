import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const commit='0b2ae43154bcd1ab2be4e2445df8b406dcad77b2';
const dir=new URL('../src/vendor/vda-5050/',import.meta.url);
const names=['order','instantActions','state','visualization','factsheet','connection','zoneSet','responses'];
const manifest={version:'3.0.0',commit,sourceBranch:'main',snapshotDate:'2026-10-08',draft:'2020-12',upstream:'https://github.com/VDA5050/VDA5050',files:{}};
await mkdir(dir,{recursive:true});
for(const file of [...names.map(n=>`json_schemas/${n}.schema`),'LICENSE.txt','README.md']) {
  const url=`https://raw.githubusercontent.com/VDA5050/VDA5050/${commit}/${file}`;
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok) throw Error(`${response.status}: ${file}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(file.endsWith('.schema')) {
    const schema=JSON.parse(bytes);
    if(schema.$schema!=='https://json-schema.org/draft/2020-12/schema') throw Error(`Unexpected dialect: ${file}`);
  }
  const name=file.split('/').at(-1);
  await writeFile(new URL(name,dir),bytes);
  manifest.files[name]={sha256:createHash('sha256').update(bytes).digest('hex'),source:url};
}
await writeFile(new URL('manifest.json',dir),JSON.stringify(manifest,null,2)+'\n');
console.log(`Vendored ${names.length} unmodified schemas at ${commit}`);
