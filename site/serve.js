/**
 * 本地静态服务器（开发预览用）
 * 用法：node serve.js [端口]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = parseInt(process.argv[2], 10) || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

http.createServer((req, res) => {
  let p;
  try {
    p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400); return res.end('bad request');
  }
  if (p === '/' || p.endsWith('/')) p += 'index.html';

  const root = path.resolve(ROOT);
  const file = path.resolve(root, '.' + p);
  // 目录逃逸校验：必须以站点根目录 + 分隔符开头，避免 /../ 读到站外文件
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 forbidden');
  }

  fs.readFile(file, (err, buf) => {
    if (err) {
      // 本地预览也返回自定义 404 页，便于验证样式
      fs.readFile(path.join(root, '404.html'), (e2, page) => {
        if (e2) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('404 Not Found: ' + p);
        }
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(page);
      });
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(buf);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('柯南的世界 → http://127.0.0.1:' + PORT);
});