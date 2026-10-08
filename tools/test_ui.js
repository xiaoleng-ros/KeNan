/** 交互测试：搜索、筛选、切换 */
const http = require('http');
const os = require('os');
const path = require('path');
const net = require('net');
const crypto = require('crypto');

/** 站点基地址：默认 4173，可用环境变量 SITE_BASE 覆盖 */
const BASE = process.env.SITE_BASE || 'http://127.0.0.1:4173';

function httpGet(port, path) {
  return new Promise((res, rej) => {
    http.get({ host: '127.0.0.1', port, path }, r => {
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
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('timeout ' + method)); } }, 40000);
    });
  }
  close() { try { this.sock.end(); } catch { } }
}

(async () => {
  const { spawn } = require('child_process');
  const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--user-data-dir=' + path.join(os.tmpdir(), 'kenan-edge-profile-test'), '--remote-debugging-port=9224', 'about:blank'],
    { detached: true, stdio: 'ignore' });
  proc.unref();
  for (let i = 0; i < 40; i++) {
    try { await httpGet(9224, '/json/version'); break; } catch { await new Promise(r => setTimeout(r, 500)); }
  }
  const targets = await httpGet(9224, '/json/list');
  const page = targets.find(t => t.type === 'page');
  const ws = new WS(page.webSocketDebuggerUrl);
  await ws.ready;
  await ws.send('Page.enable');
  await ws.send('Runtime.enable');

  const errors = [];
  ws.send('Runtime.exceptionThrown', {}).catch(() => { });
  const ev = async (expr) => {
    const r = await ws.send('Runtime.evaluate', { returnByValue: true, expression: expr, awaitPromise: true });
    if (r.exceptionDetails) return { __err: r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || '') };
    return r.result.value;
  };
  const goto = async (u) => { await ws.send('Page.navigate', { url: u }); await new Promise(r => setTimeout(r, 3200)); };

  console.log('--- 1. 搜索「柯南」 ---');
  await goto(BASE + '/search.html?q=' + encodeURIComponent('柯南'));
  console.log(await ev(`({
    count: document.querySelector('.s-count')?.textContent.trim(),
    items: document.querySelectorAll('.s-item').length,
    first: document.querySelector('.s-item .s-title')?.textContent.trim(),
    badges: [...new Set([...document.querySelectorAll('.s-badge')].map(b=>b.textContent))].join(',')
  })`));

  console.log('--- 2. 搜索「黑衣组织」 ---');
  await goto(BASE + '/search.html?q=' + encodeURIComponent('黑衣组织'));
  console.log(await ev(`({
    count: document.querySelector('.s-count')?.textContent.trim(),
    first3: [...document.querySelectorAll('.s-item .s-title')].slice(0,3).map(e=>e.textContent.trim())
  })`));

  console.log('--- 3. 漫画页搜索「云霄」 ---');
  await goto(BASE + '/manga.html');
  await ev(`(()=>{const i=document.getElementById('qInput');i.value='云霄';i.dispatchEvent(new Event('input'));return 1})()`);
  await new Promise(r => setTimeout(r, 900));
  console.log(await ev(`({count: document.getElementById('cnt')?.textContent, rows: document.querySelectorAll('.data-table tbody tr').length, marks: document.querySelectorAll('mark').length})`));

  console.log('--- 4. 角色页筛选「毛利兰」 ---');
  await goto(BASE + '/characters.html');
  await ev(`(()=>{const i=document.getElementById('qInput');i.value='毛利兰';i.dispatchEvent(new Event('input'));return 1})()`);
  await new Promise(r => setTimeout(r, 800));
  console.log(await ev(`({count: document.getElementById('cnt')?.textContent, cards: document.querySelectorAll('.char-card').length, name: document.querySelector('.char-name')?.textContent.trim(), imgOk: !!document.querySelector('.char-avatar img')?.getAttribute('src')})`));

  console.log('--- 5. 剧场版筛选「M2」 ---');
  await goto(BASE + '/movies.html');
  await ev(`(()=>{const i=document.getElementById('qInput');i.value='M2';i.dispatchEvent(new Event('input'));return 1})()`);
  await new Promise(r => setTimeout(r, 700));
  console.log(await ev(`({count: document.getElementById('cnt')?.textContent, first: document.querySelector('.data-table tbody tr')?.textContent.replace(/\\s+/g,' ').trim().slice(0,70)})`));

  console.log('--- 6. 动画页排序降序 ---');
  await goto(BASE + '/anime.html');
  await ev(`(()=>{const s=document.getElementById('sortSel');s.value='desc';s.dispatchEvent(new Event('change'));return 1})()`);
  await new Promise(r => setTimeout(r, 700));
  console.log(await ev(`({first: document.querySelector('.data-table tbody tr td')?.textContent.trim(), count: document.getElementById('cnt')?.textContent})`));

  console.log('--- 7. 导航栏下拉菜单 ---');
  console.log(await ev(`({
    drops: document.querySelectorAll('.nav-drop').length,
    firstMenuItems: [...document.querySelectorAll('.nav-drop .menu a')].slice(0,4).map(a=>a.textContent.trim()),
    brandImg: document.querySelector('#site-brand img')?.getAttribute('src'),
    brandLoaded: document.querySelector('#site-brand img')?.naturalWidth > 0
  })`));

  console.log('--- 8. 链接完整性 ---');
  await goto(BASE + '/index.html');
  console.log(await ev(`(async()=>{
    const links=[...new Set([...document.querySelectorAll('a[href$=".html"]')].map(a=>a.getAttribute('href')))];
    const bad=[];
    for(const l of links){const r=await fetch(l); if(!r.ok) bad.push(l+'='+r.status);}
    return {total:links.length, bad};
  })()`));

  console.log('--- 9. 角色详情弹窗 ---');
  await goto(BASE + '/characters.html');
  await ev(`(()=>{document.querySelector('.char-card').click();return 1})()`);
  await new Promise(r => setTimeout(r, 800));
  console.log(await ev(`({
    modalOpen: !!document.getElementById('charModal'),
    name: document.querySelector('.modal-name')?.textContent.trim(),
    kana: document.querySelector('.modal-table')?.textContent.replace(/\s+/g,' ').trim(),
    descLen: document.querySelector('.modal-desc')?.textContent.length,
    imgOk: document.querySelector('.modal-head img')?.naturalWidth > 0
  })`));
  // 关闭
  await ev(`(()=>{document.querySelector('.modal-x').click();return 1})()`);
  await new Promise(r => setTimeout(r, 400));
  console.log('closed:', await ev(`!document.getElementById('charModal')`));

  ws.close();
  try { process.kill(proc.pid); } catch { }
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });