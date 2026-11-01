// Share links keep the whole message in the URL fragment. Fragments are never sent in HTTP requests.
// Format: s=<standard>&t=<topic>[&m=<base64url(deflate-raw(utf8 json))>]
const b64=bytes=>btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const unb64=text=>Uint8Array.from(atob(text.replaceAll('-','+').replaceAll('_','/').padEnd(Math.ceil(text.length/4)*4,'=')),c=>c.charCodeAt(0));
async function pipe(bytes,Stream,mode) {
  const stream=new Blob([bytes]).stream().pipeThrough(new Stream(mode));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
export async function encodeShare({standard,topic,text}) {
  const compressed=await pipe(new TextEncoder().encode(text),CompressionStream,'deflate-raw');
  return `s=${encodeURIComponent(standard)}&t=${encodeURIComponent(topic)}&m=${b64(compressed)}`;
}
export async function decodeShare(fragment) {
  const params=new URLSearchParams(fragment);
  if(!params.has('s')&&!params.has('t')&&!params.has('m'))return null;
  const out={standard:params.get('s'),topic:params.get('t')};
  if(params.has('m')) out.text=new TextDecoder().decode(await pipe(unb64(params.get('m')),DecompressionStream,'deflate-raw'));
  return out;
}
