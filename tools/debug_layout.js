/** 调试指定页面的元素计算样式与盒模型 */
const http = require('http');
const net = require('net');
const crypto = require('crypto');

const HOST = '127.0.0.1', PORT = 9222;
function httpGet(path) {
  return new Promise((res, rej) => {
    http.get({ host: HOST, port: PORT, path }, r => {
      let d = ''; r.on('data', c => (d += c)); r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
}
class WS {
  constructor(url) {
    const u = new URL(url);
    this.id = 0; this.pending = new Map(); this.buf = Buffer.alloc(0); this.headerDone = false;
    this.key = crypto.randomBytes(16).toString('base64');
    this.ready = new Promise((res, rej) => { this.onopen = res; this.onerror = rej; });
    this.sock = net.connect(parseInt(u.port, 10), u.hostname, () => {
      this.sock.write(`GET ${u.pathname}${u.search} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${this.key}\r\nSec-WebSocket-Version: 13\r\n\r\n`);
    });
    this.sock.on('data', c => this.onData(c));
    this.sock.on('error', e => this.onerror && this.onerror(e));
  }
  onData(chunk) {
    this.buf = Buffer.concat([this.buf, chunk]);
    if (!this.headerDone) {
      const i = this.buf.indexOf('\r\n\r\n');
      if (i < 0) return;
      if (!/101/.test(this.buf.slice(0, i).toString().split('\r\n')[0])) { this.onerror(new Error('hs fail')); return; }
      this.buf = this.buf.slice(i + 4); this.headerDone = true; if (this.onopen) this.onopen();
    }
    while (this.buf.length >= 2) {
      const opcode = this.buf[0] & 0x0f;
      let len = this.buf[1] & 0x7f, off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      if (this.buf.length < off + len) return;
      const payload = this.buf.slice(off, off + len);
      this.buf = this.buf.slice(off + len);
      if (opcode === 1) {
        try {
          const m = JSON.parse(payload.toString('utf8'));
          if (m.id && this.pending.has(m.id)) {
            const { resolve, reject } = this.pending.get(m.id); this.pending.delete(m.id);
            m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
          }
        } catch { }
      } else if (opcode === 8) this.sock.end();
    }
  }
  send(method, params = {}) {
    const id = ++this.id;
    const payload = Buffer.from(JSON.stringify({ id, method, params }), 'utf8');
    const mask = crypto.randomBytes(4);
    const m = Buffer.from(payload);
    for (let i = 0; i < m.length; i++) m[i] ^= mask[i % 4];
    let header;
    if (payload.length < 126) header = Buffer.from([0x81, 0x80 | payload.length]);
    else if (payload.length < 65536) { header = Buffer.alloc(4); header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(payload.length, 2); }
    else { header = Buffer.alloc(10); header[0] = 0x81; header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(payload.length), 2); }
    this.sock.write(Buffer.concat([header, mask, m]));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('timeout')); } }, 40000);
    });
  }
  close() { try { this.sock.end(); } catch { } }
}

(async () => {
  const { spawn } = require('child_process');
  const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--user-data-dir=D:/Gcodeprojects/KeNan/.edgeprofile2', '--remote-debugging-port=9223', 'about:blank'],
    { detached: true, stdio: 'ignore' });
  proc.unref();
  for (let i = 0; i < 40; i++) {
    try { await new Promise((res, rej) => http.get({ host: HOST, port: 9223, path: '/json/version' }, r => { r.resume(); res(); }).on('error', rej)); break; }
    catch { await new Promise(r => setTimeout(r, 500)); }
  }
  const targets = await (async () => {
    return new Promise((res, rej) => http.get({ host: HOST, port: 9223, path: '/json/list' }, r => {
      let d = ''; r.on('data', c => (d += c)); r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej));
  })();
  const page = targets.find(t => t.type === 'page');
  const ws = new WS(page.webSocketDebuggerUrl);
  await ws.ready;
  await ws.send('Page.enable');
  await ws.send('Runtime.enable');
  await ws.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

  const page_ = process.argv[2] || 'index';
  const sel = process.argv[3] || '.card';
  await ws.send('Page.navigate', { url: `http://127.0.0.1:4173/${page_}.html` });
  await new Promise(r => setTimeout(r, 3500));

  const r = await ws.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const out = [];
      document.querySelectorAll(${JSON.stringify(sel)}).forEach((el, i) => {
        const cs = getComputedStyle(el);
        const b = el.getBoundingClientRect();
        out.push({
          i, tag: el.tagName, cls: el.className,
          text: (el.textContent||'').replace(/\\s+/g,' ').trim().slice(0,60),
          box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)],
          display: cs.display, visibility: cs.visibility, opacity: cs.opacity,
          overflow: cs.overflow, fontSize: cs.fontSize, color: cs.color,
          bg: cs.backgroundColor,
          parentCls: el.parentElement ? el.parentElement.className : '',
          parentBox: el.parentElement ? (r=>[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)])(el.parentElement.getBoundingClientRect()) : null
        });
      });
      return out;
    })()`,
  });
  console.log(JSON.stringify(r.result.value, null, 1));
  ws.close();
  try { process.kill(proc.pid); } catch { }
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });