import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
const server = createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  const candidate = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!candidate.startsWith(resolve(root) + sep)) { res.writeHead(403).end('Forbidden'); return; }
  try {
    const stat = statSync(candidate);
    if (!stat.isFile()) throw new Error('Not a file');
    res.writeHead(200, { 'Content-Type': types[extname(candidate)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; worker-src 'self'; connect-src 'none'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'" });
    createReadStream(candidate).pipe(res);
  } catch { res.writeHead(404).end('Not found'); }
});
const port = Number(process.env.PORT || 4173);
server.listen(port, '127.0.0.1', () => console.log(`RegexBench ready at http://127.0.0.1:${server.address().port}`));
