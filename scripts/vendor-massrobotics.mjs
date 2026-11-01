// Vendors the pinned MassRobotics schema and examples. The upstream repository has no LICENSE file,
// so these files are not committed to this repository: they are fetched at the pinned commit and
// hash-verified against manifest.json. Run: npm run vendor
import {readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir=new URL('../src/vendor/massrobotics/',import.meta.url);
const commit='f9357a423ecabc3f7112e6d10025a5231943ec50';
const sources={'AMR_Interop_Standard.json':'AMR_Interop_Standard.json','identityReport1.json':'examples/identityReport1.json','statusReport1.json':'examples/statusReport1.json'};
let manifest=null;
try{manifest=JSON.parse(await readFile(new URL('manifest.json',dir),'utf8'));}catch{}
const files={};
for(const [file,source] of Object.entries(sources)) {
  const url=`https://raw.githubusercontent.com/MassRobotics-AMR/AMR_Interop_Standard/${commit}/${source}`;
  let bytes;
  try{await access(new URL(file,dir));bytes=await readFile(new URL(file,dir));}
  catch{
    const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw Error(`${response.status} ${url}`);
    bytes=Buffer.from(await response.arrayBuffer());
    await writeFile(new URL(file,dir),bytes);
    console.log(`Fetched ${file} from pinned commit.`);
  }
  const sha256=createHash('sha256').update(bytes).digest('hex');
  if(manifest?.files?.[file]&&manifest.files[file].sha256!==sha256)throw Error(`Hash mismatch for ${file}: expected ${manifest.files[file].sha256}, got ${sha256}`);
  files[file]={sha256,source:url};
}
await writeFile(new URL('manifest.json',dir),JSON.stringify({standard:'MassRobotics AMR Interoperability Standard',documentVersion:'1.0 (PDF in repository)',commit,commitDate:'2021-10-08',sourceBranch:'main',snapshotDate:'2026-10-08',draft:'none declared ($schema absent); validated with JSON Schema draft-07 semantics',upstream:'https://github.com/MassRobotics-AMR/AMR_Interop_Standard',license:'No LICENSE file is present in the repository snapshot. The schema is used here for local validation and field reference only; it is not redistributed as a download.',files},null,2)+'\n');
console.log('MassRobotics manifest verified.');
