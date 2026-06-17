/**
 * 静态文件服务器
 * 端口: 3000
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

const PORT = 3333;
const ROOT = __dirname;

// MIME 类型映射
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // 图片代理：解决跨域 ORB 问题
  if (req.url.startsWith('/proxy?url=')) {
    try {
      const targetUrl = decodeURIComponent(req.url.split('?url=')[1]);
      const parsed = new URL(targetUrl);

      const client = parsed.protocol === 'https:' ? https : http;
      client.get(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (proxyRes) => {
        const ext = path.extname(parsed.pathname).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'image/png';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=86400',
        });
        proxyRes.pipe(res);
      }).on('error', () => {
        res.writeHead(404);
        res.end('Image not found');
      });
    } catch (e) {
      res.writeHead(404);
      res.end('Image not found');
    }
    return;
  }

  // 解析请求路径（解码 URL 编码的中文文件名）
  const decodedUrl = decodeURIComponent(req.url === '/' ? '/index.html' : req.url);
  let filePath = path.join(ROOT, decodedUrl);

  // 获取文件扩展名
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // 读取文件
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // 文件不存在，返回 404
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 - 文件未找到');
      return;
    }

    // 设置响应头（添加缓存控制）
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });

    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器已启动: http://127.0.0.1:${PORT}`);
  console.log(`项目目录: ${ROOT}`);
});

// 防止进程崩溃退出
server.on('error', (err) => {
  console.error('服务器错误:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('未捕获异常:', err.message);
});
