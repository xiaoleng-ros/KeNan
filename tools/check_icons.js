/** 一次性检查：首页各卡片的右上角图标是否真实加载成功 */
const http = require('http');
const net = require('net');
const crypto = require('crypto');
const fs = require('fs');

const HOST = '127.0.0.1', PORT = 9222;
const BASE = process.env.SITE_BASE || 'http://127.0.0.1:4173';
const URL_PAGE = process.argv[2] || BASE + '/index.html';
const EXPR = `JSON.stringify(Array.from(document.querySelectorAll('.card-icon img, .card img, img[src*="icons/"]')).map(i => ({
  src: i.getAttribute('src'),
  ok: i.complete && i.naturalWidth > 0,
  w: i.naturalWidth, h: i.naturalHeight,
  disp: Math.round(i.getBoundingClientRect().width) + 'x' + Math.round(i.getBoundingClientRect().height)
})))`;

function httpGet(p) {
  return new Promise((resolve, reject) => {
    http.get({ host: HOST, port: PORT, path: p }, r => {
      let d = ''; r.on('data', c => (d += c)); r.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}
class WS {
  constructor(url) {
    const u = new URL(url);
    this.id = 0; this.pending = new Map(); this.buf = Buffer.alloc(0); this.headerDone = false;
    this.key = crypto.randomBytes(16).toString('base64');
    this.ready = new Promise((resolve, reject) => { this.onopen = resolve; this.onerror = reject; });
    this.sock = net.connect(parseInt(u.port, 10), u.hostname, () => {
      this.sock.write(`GET ${u.pathname}${u.search} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${this.key}\r\nSec-WebSocket-Version: 13\r\n\r\n`);
    });
    this.sock.on('error', e => this.onerror && this.onerror(e));
    this.sock.on('data', c => this._data(c));
  }
  _data(c) {
    this.buf = Buffer.concat([this.buf, c]);
    if (!this.headerDone) {
      const i = this.buf.indexOf('\r\n\r\n');
      if (i < 0) return;
      this.headerDone = true; this.buf = this.buf.slice(i + 4); this.onopen();
    }
    while (this.buf.length >= 2) {
      const len0 = this.buf[1] & 127; let off = 2, len = len0;
      if (len0 === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len0 === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      if (this.buf.length < off + len) return;
      const payload = this.buf.slice(off, off + len).toString('utf8');
      this.buf = this.buf.slice(off + len);
      try {
        const m = JSON.parse(payload);
        if (m.id && this.pending.has(m.id)) { this.pending.get(m.id)(m); this.pending.delete(m.id); }
      } catch {}
    }
  }
  send(method, params) {
    const id = ++this.id;
    const data = Buffer.from(JSON.stringify({ id, method, params: params || {} }), 'utf8');
    const mask = crypto.randomBytes(4);
    const masked = Buffer.from(data.map((b, i) => b ^ mask[i % 4]));
    let head;
    if (data.length < 126) head = Buffer.from([0x81, 0x80 | data.length]);
    else if (data.length < 65536) { head = Buffer.alloc(4); head[0] = 0x81; head[1] = 0xfe; head.writeUInt16BE(data.length, 2); }
    else { head = Buffer.alloc(10); head[0] = 0x81; head[1] = 0xff; head.writeBigUInt64BE(BigInt(data.length), 2); }
    this.sock.write(Buffer.concat([head, mask, masked]));
    return new Promise(r => this.pending.set(id, r));
  }
  close() { try { this.sock.destroy(); } catch {} }
}

(async () => {
  const list = await httpGet('/json/list');
  const target = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
  const ws = new WS(target.webSocketDebuggerUrl);
  await ws.ready;
  await ws.send('Page.enable');
  await ws.send('Page.navigate', { url: URL_PAGE });
  await new Promise(r => setTimeout(r, 2600));
  const r = await ws.send('Runtime.evaluate', { expression: EXPR, returnByValue: true });
  const list2 = r.result?.result?.value ? JSON.parse(r.result.result.value) : r.result;
  console.log(JSON.stringify(list2, null, 2));
  ws.close();
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
