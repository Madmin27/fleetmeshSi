import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import {gzipSync} from 'node:zlib';

const root = resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.schema':'application/json','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml','.txt':'text/plain'};
const server = http.createServer(async (req,res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  res.setHeader('Content-Security-Policy',path.startsWith('/tools/message-explorer/')?"default-src 'none'; script-src 'self'; worker-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'":"default-src 'none'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  const file = resolve(root, '.' + path + (path.endsWith('/') ? 'index.html' : ''));
  if(!file.startsWith(root + '/')) { res.writeHead(403); res.end(); return; }
  try { const data=await readFile(file); const compressed=/gzip/.test(req.headers['accept-encoding']||'')&&/\.(html|css|js|json|svg|txt)$/.test(file); res.writeHead(200,{'Content-Type':types[extname(file)] || 'application/octet-stream',...(compressed?{'Content-Encoding':'gzip','Vary':'Accept-Encoding'}:{})}); res.end(compressed?gzipSync(data):data); }
  catch { res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'}); res.end(await readFile(resolve(root,'404.html'))); }
});
server.listen(Number(process.env.PORT || 3186), '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${server.address().port}`));
