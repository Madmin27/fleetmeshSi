import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import standaloneCode from 'ajv/dist/standalone/index.js';
import { _ } from 'ajv/dist/compile/codegen/index.js';
import { build } from 'esbuild';
import formats from '../src/explorer/formats.cjs';

const options={allErrors:true,strict:false,strictNumbers:true,validateSchema:true,coerceTypes:false,useDefaults:false,removeAdditional:false,code:{source:true,esm:true,formats:_`require("../explorer/formats.cjs")`}};
export function createAjv() {
  const ajv=new Ajv2020(options);
  addFormats(ajv);
  ajv.addFormat('uint32',formats.uint32);
  return ajv;
}
// The MassRobotics schema declares no $schema. Ajv's default class applies draft-07 semantics.
export function createAjvDraft07() {
  const ajv=new Ajv(options);
  addFormats(ajv);
  return ajv;
}
async function verified(dir,manifest) {
  const bytes={};
  for(const [file,record] of Object.entries(manifest.files)) {
    bytes[file]=await readFile(new URL(file,dir));
    if(createHash('sha256').update(bytes[file]).digest('hex')!==record.sha256) throw Error(`Schema snapshot altered: ${file}`);
  }
  return bytes;
}
export async function loadVda() {
  const dir=new URL('../src/vendor/vda-5050/',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('manifest.json',dir),'utf8'));
  const bytes=await verified(dir,manifest);
  const schemas={};
  for(const file of Object.keys(bytes)) {
    if(!file.endsWith('.schema')) continue;
    const schema=JSON.parse(bytes[file]);
    if(schema.$schema!=='https://json-schema.org/draft/2020-12/schema') throw Error('Unexpected dialect');
    schemas[file.replace('.schema','')]=schema;
  }
  return {manifest,schemas};
}
export async function loadMass() {
  const dir=new URL('../src/vendor/massrobotics/',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('manifest.json',dir),'utf8'));
  const bytes=await verified(dir,manifest);
  const schema=JSON.parse(bytes['AMR_Interop_Standard.json']);
  if(schema.$schema) throw Error('MassRobotics schema now declares a dialect; review compile settings');
  const examples={identityReport:JSON.parse(bytes['identityReport1.json']),statusReport:JSON.parse(bytes['statusReport1.json'])};
  return {manifest,schema,examples};
}
export async function compileSchemas() {
  const output=new URL('../src/generated/',import.meta.url);
  await mkdir(output,{recursive:true});
  const vda=await loadVda();
  const ajv=createAjv();
  const vdaExports={};
  for(const [name,schema] of Object.entries(vda.schemas)) {ajv.addSchema(schema,name);vdaExports[name]=name;}
  await writeFile(new URL('validators-vda.mjs',output),standaloneCode(ajv,vdaExports));
  const mass=await loadMass();
  const ajv07=createAjvDraft07();
  ajv07.addSchema(mass.schema,'massrobotics');
  const massExports={};
  for(const name of ['identityReport','statusReport']) {ajv07.addSchema({$id:`massrobotics-${name}`,$ref:`massrobotics#/${name}`},`massrobotics-${name}`);massExports[name]=`massrobotics-${name}`;}
  await writeFile(new URL('validators-mass.mjs',output),standaloneCode(ajv07,massExports));
  await writeFile(new URL('validators.mjs',output),`import * as vda from './validators-vda.mjs';\nimport * as mass from './validators-mass.mjs';\nexport const validators={'vda-5050':vda,'massrobotics':mass};\n`);
  await build({entryPoints:[new URL('validators.mjs',output).pathname],outfile:new URL('validators.bundle.mjs',output).pathname,bundle:true,format:'esm',platform:'browser',minify:true});
  console.log(`Compiled ${Object.keys(vdaExports).length} Draft 2020-12 validators (VDA 5050) and ${Object.keys(massExports).length} draft-07 validators (MassRobotics); source hashes verified.`);
  return {ajv,manifest:vda.manifest,massManifest:mass.manifest,massExamples:mass.examples};
}
if(process.argv[1]===new URL(import.meta.url).pathname) await compileSchemas();
