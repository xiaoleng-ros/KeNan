/**
 * 用 CDP 驱动 Edge 无头浏览器做渲染断言（可选截图）。
 * 前置：已用 --remote-debugging-port=9222 启动 Edge，或直接用 tools/regress.js
 *
 * 默认只做 DOM 断言，**不写任何文件到项目目录**。
 * 需要截图时显式加 --shot，此时图片写到系统临时目录（os.tmpdir），
 * 并打印完整路径，不污染仓库。
 *
 * 用法：
 *   node tools/shoot.js index
 *   node tools/shoot.js index --mobile
 *   node tools/shoot.js index --shot          # 截图到临时目录
 *   node tools/shoot.js index --shot=./out    # 显式指定输出目录
 */
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const net = require('net');

const HOST = '127.0.0.1';
const PORT = 9222;
/** 站点基地址：默认 4173，可用环境变量 SITE_BASE 覆盖 */
const BASE = process.env.SITE_BASE || 'http://127.0.0.1:4173';

function httpGet(path) {
  return new Promise((res, rej) => {
    http.get({ host: HOST, port: PORT, path }, r => {
      let d = '';
      r.on('data', c => (d += c));
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
}

/** 极简 WebSocket 客户端（够用即可） */
class WS {
  constructor(url) {
    const u = new URL(url);
    this.id = 0;
    this.pending = new Map();
    this.buf = Buffer.alloc(0);
    this.ready = new Promise((resolve, reject) => {
      this.onopen = resolve;
      this.onerror = reject;
    });
    this.key = crypto.randomBytes(16).toString('base64');
    this.sock = net.connect(parseInt(u.port, 10), u.hostname, () => {
      const req =
        `GET ${u.pathname}${u.search} HTTP/1.1\r\n` +
        `Host: ${u.host}\r\n` +
        `Upgrade: websocket\r\nConnection: Upgrade\r\n` +
        `Sec-WebSocket-Key: ${this.key}\r\nSec-WebSocket-Version: 13\r\n\r\n`;
      this.sock.write(req);
    });
    this.sock.on('data', chunk => this.onData(chunk));
    this.sock.on('error', e => this.onerror && this.onerror(e));
  }

  onData(chunk) {
    this.buf = Buffer.concat([this.buf, chunk]);
    // 头部
    if (!this.headerDone) {
      const idx = this.buf.indexOf('\r\n\r\n');
      if (idx < 0) return;
      const head = this.buf.slice(0, idx).toString();
      if (!/101/.test(head.split('\r\n')[0])) {
        if (this.onerror) this.onerror(new Error('handshake failed: ' + head.split('\r\n')[0]));
        return;
      }
      this.buf = this.buf.slice(idx + 4);
      this.headerDone = true;
      if (this.onopen) this.onopen();
    }
    // 帧
    while (this.buf.length >= 2) {
      const opcode = this.buf[0] & 0x0f;
      let len = this.buf[1] & 0x7f;
      let off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      if (this.buf.length < off + len) return;
      const payload = this.buf.slice(off, off + len);
      this.buf = this.buf.slice(off + len);
      if (opcode === 1) {
        try {
          const msg = JSON.parse(payload.toString('utf8'));
          if (msg.id && this.pending.has(msg.id)) {
            const { resolve, reject } = this.pending.get(msg.id);
            this.pending.delete(msg.id);
            msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
          }
        } catch { /* ignore */ }
      } else if (opcode === 8) { this.sock.end(); }
    }
  }

  send(method, params = {}) {
    const id = ++this.id;
    const payload = Buffer.from(JSON.stringify({ id, method, params }), 'utf8');
    const mask = crypto.randomBytes(4);
    const masked = Buffer.from(payload);
    for (let i = 0; i < masked.length; i++) masked[i] ^= mask[i % 4];

    let header;
    if (payload.length < 126) {
      header = Buffer.from([0x81, 0x80 | payload.length]);
    } else if (payload.length < 65536) {
      header = Buffer.alloc(4);
      header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(payload.length, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x81; header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(payload.length), 2);
    }
    this.sock.write(Buffer.concat([header, mask, masked]));

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('timeout: ' + method)); }
      }, 45000);
    });
  }

  close() { try { this.sock.end(); } catch { } }
}

(async () => {
  // 自动启动无头 Edge
  const { spawn } = require('child_process');
  const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const prof = 'D:/Gcodeprojects/KeNan/.edgeprofile';
  const proc = spawn(EDGE, [
    '--headless=new','--disable-gpu','--no-sandbox','--hide-scrollbars','--no-first-run',
    '--disable-extensions','--user-data-dir=' + prof, '--remote-debugging-port=9222', 'about:blank'
  ], { detached: true, stdio: 'ignore' });
  proc.unref();
  const cleanup = () => { try { process.kill(-proc.pid); } catch {} try { proc.kill(); } catch {} };
  process.on('exit', cleanup);

  // 等待 CDP 就绪
  for (let i = 0; i < 40; i++) {
    try { await httpGet('/json/version'); break; } catch { await new Promise(r => setTimeout(r, 500)); }
  }

  const MOBILE = process.argv.includes('--mobile');
  const VW = MOBILE ? 420 : 1440;
  const VH = MOBILE ? 900 : 1000;
  const MAXH = MOBILE ? 2400 : 5200;
  const pages = process.argv.slice(2).filter(a => !a.startsWith('--'));

  // 截图默认关闭；--shot 开启，--shot=DIR 指定输出目录（默认系统临时目录）
  const shotArg = process.argv.find(a => a === '--shot' || a.startsWith('--shot='));
  const SHOT = !!shotArg;
  const SHOT_DIR = shotArg && shotArg.includes('=')
    ? path.resolve(shotArg.split('=')[1])
    : path.join(os.tmpdir(), 'kenan-shots');

  const targets = await httpGet('/json/list');
  const page = targets.find(t => t.type === 'page');
  if (!page) throw new Error('no page target');

  const ws = new WS(page.webSocketDebuggerUrl);
  await ws.ready;

  await ws.send('Page.enable');
  await ws.send('Runtime.enable');
  await ws.send('Emulation.setDeviceMetricsOverride', {
    width: VW, height: VH, deviceScaleFactor: 1, mobile: MOBILE,
  });

  if (SHOT) fs.mkdirSync(SHOT_DIR, { recursive: true });

  for (const name of pages) {
    const url = `${BASE}/${name}.html`;
    await ws.send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 3500));

    // 抓取渲染后的关键信息
    const probe = await ws.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const q = s => document.querySelector(s);
        const txt = s => (q(s)?.textContent || '').replace(/\\s+/g,' ').trim();
        return {
          title: document.title,
          h1: txt('.page-head h1') || txt('.top-logo'),
          navbarLinks: document.querySelectorAll('#navbar a').length,
          sidebarLinks: document.querySelectorAll('#sidebar a').length,
          footerLinks: document.querySelectorAll('#footer a').length,
          cards: document.querySelectorAll('.card').length,
          rows: document.querySelectorAll('.data-table tbody tr').length,
          charCards: document.querySelectorAll('.char-card').length,
          tables: document.querySelectorAll('.data-table').length,
          count: txt('.count'),
          statNums: [...document.querySelectorAll('.stat-box .num')].map(e=>e.textContent),
          bodyLen: document.body.innerText.length,
          err: window.__err || null
        };
      })()`,
    });
    console.log('=== ' + name + ' ===');
    console.log(JSON.stringify(probe.result.value));

    if (!SHOT) continue;

    // 全页截图（仅 --shot 时）
    const metrics = await ws.send('Page.getLayoutMetrics');
    const h = Math.min(Math.ceil(metrics.cssContentSize.height), MAXH);
    await ws.send('Emulation.setDeviceMetricsOverride', {
      width: VW, height: h, deviceScaleFactor: 1, mobile: MOBILE,
    });
    await new Promise(r => setTimeout(r, 900));
    const shot = await ws.send('Page.captureScreenshot', { format: 'png' });
    const suffix = MOBILE ? '_m' : '';
    const out = path.join(SHOT_DIR, `${name}${suffix}.png`);
    fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
    console.log(`   shot: ${out} height=${h}`);
  }

  ws.close();
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });