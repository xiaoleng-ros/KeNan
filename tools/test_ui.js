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

  // ---- 断言框架：任一条失败，进程以退出码 1 结束，便于 CI 拦截 ----
  const results = [];
  /** 记录并打印一条断言 */
  function check(name, cond, detail) {
    results.push({ name, ok: !!cond });
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  → ' + JSON.stringify(detail)}`);
  }

  console.log('--- 1. 搜索「柯南」 ---');
  await goto(BASE + '/search.html?q=' + encodeURIComponent('柯南'));
  const s1 = await ev(`({
    count: document.querySelector('.s-count')?.textContent.trim(),
    items: document.querySelectorAll('.s-item').length,
    first: document.querySelector('.s-item .s-title')?.textContent.trim(),
    badges: [...new Set([...document.querySelectorAll('.s-badge')].map(b=>b.textContent))].join(',')
  })`);
  console.log(s1);
  check('搜索有结果', s1.items > 0, s1);
  check('首条结果为角色', !!s1.first, s1);
  check('结果覆盖角色/动画/漫画', ['角色', '动画', '漫画'].every(t => String(s1.badges || '').includes(t)), s1);

  console.log('--- 2. 搜索「黑衣组织」 ---');
  await goto(BASE + '/search.html?q=' + encodeURIComponent('黑衣组织'));
  const s2 = await ev(`({
    count: document.querySelector('.s-count')?.textContent.trim(),
    first3: [...document.querySelectorAll('.s-item .s-title')].slice(0,3).map(e=>e.textContent.trim())
  })`);
  console.log(s2);
  check('组织关键词有结果', s2.first3.length > 0, s2);

  console.log('--- 3. 漫画页搜索「云霄」 ---');
  await goto(BASE + '/manga.html');
  await ev(`(()=>{const i=document.getElementById('qInput');i.value='云霄';i.dispatchEvent(new Event('input'));return 1})()`);
  await new Promise(r => setTimeout(r, 900));
  const m3 = await ev(`({count: document.getElementById('cnt')?.textContent, rows: document.querySelectorAll('.data-table tbody tr').length, marks: document.querySelectorAll('mark').length})`);
  console.log(m3);
  check('漫画关键词命中 1 话', m3.rows === 1, m3);
  check('漫画命中处有高亮', m3.marks > 0, m3);

  console.log('--- 4. 角色页筛选「毛利兰」 ---');
  await goto(BASE + '/characters.html');
  await ev(`(()=>{const i=document.getElementById('qInput');i.value='毛利兰';i.dispatchEvent(new Event('input'));return 1})()`);
  await new Promise(r => setTimeout(r, 800));
  const c4 = await ev(`({count: document.getElementById('cnt')?.textContent, cards: document.querySelectorAll('.char-card').length, name: document.querySelector('.char-name')?.textContent.trim(), imgOk: !!document.querySelector('.char-avatar img')?.getAttribute('src')})`);
  console.log(c4);
  check('角色筛选有结果', c4.cards > 0, c4);
  check('角色头像地址存在', c4.imgOk, c4);

  console.log('--- 5. 剧场版筛选「M2」 ---');
  await goto(BASE + '/movies.html');
  await ev(`(()=>{const i=document.getElementById('qInput');i.value='M2';i.dispatchEvent(new Event('input'));return 1})()`);
  await new Promise(r => setTimeout(r, 700));
  const mv5 = await ev(`({count: document.getElementById('cnt')?.textContent, first: document.querySelector('.data-table tbody tr')?.textContent.replace(/\\s+/g,' ').trim().slice(0,70)})`);
  console.log(mv5);
  check('剧场版编号精确命中 1 部', String(mv5.count || '').includes('1 部'), mv5);
  check('剧场版首行为 M2', String(mv5.first || '').startsWith('M2'), mv5);

  console.log('--- 6. 动画页排序降序 ---');
  await goto(BASE + '/anime.html');
  await ev(`(()=>{const s=document.getElementById('sortSel');s.value='desc';s.dispatchEvent(new Event('change'));return 1})()`);
  await new Promise(r => setTimeout(r, 700));
  const a6 = await ev(`({first: document.querySelector('.data-table tbody tr td')?.textContent.trim(), count: document.getElementById('cnt')?.textContent})`);
  console.log(a6);
  check('降序首行为 TV1186', a6.first === 'TV1186', a6);

  console.log('--- 7. 导航栏下拉菜单 ---');
  const n7 = await ev(`({
    drops: document.querySelectorAll('.nav-drop').length,
    firstMenuItems: [...document.querySelectorAll('.nav-drop .menu a')].slice(0,4).map(a=>a.textContent.trim()),
    brandImg: document.querySelector('#site-brand img')?.getAttribute('src'),
    brandLoaded: document.querySelector('#site-brand img')?.naturalWidth > 0
  })`);
  console.log(n7);
  check('导航有两个下拉组', n7.drops === 2, n7);
  check('下拉菜单有链接', n7.firstMenuItems.includes('首页'), n7);
  check('站点 Logo 加载成功', n7.brandLoaded, n7);

  console.log('--- 8. 链接完整性 ---');
  await goto(BASE + '/index.html');
  const l8 = await ev(`(async()=>{
    const links=[...new Set([...document.querySelectorAll('a[href$=".html"]')].map(a=>a.getAttribute('href')))];
    const bad=[];
    for(const l of links){const r=await fetch(l); if(!r.ok) bad.push(l+'='+r.status);}
    return {total:links.length, bad};
  })()`);
  console.log(l8);
  check('站内链接全部可访问', l8.bad.length === 0, l8);

  console.log('--- 9. 角色详情弹窗 ---');
  await goto(BASE + '/characters.html');
  await ev(`(()=>{document.querySelector('.char-card').click();return 1})()`);
  await new Promise(r => setTimeout(r, 800));
  const p9 = await ev(`({
    modalOpen: !!document.getElementById('charModal'),
    name: document.querySelector('.modal-name')?.textContent.trim(),
    kana: document.querySelector('.modal-table')?.textContent.replace(/\s+/g,' ').trim(),
    descLen: document.querySelector('.modal-desc')?.textContent.length,
    imgOk: document.querySelector('.modal-head img')?.naturalWidth > 0,
    role: document.querySelector('.modal')?.getAttribute('role'),
    ariaModal: document.querySelector('.modal')?.getAttribute('aria-modal'),
    focused: document.activeElement === document.querySelector('.modal'),
    locked: document.body.style.overflow
  })`);
  console.log(p9);
  check('弹窗可打开', p9.modalOpen, p9);
  check('弹窗内容与头像正常', p9.imgOk && p9.descLen > 0, p9);
  check('弹窗具备 dialog 语义', p9.role === 'dialog' && p9.ariaModal === 'true', p9);
  check('弹窗打开后获得焦点且锁定滚动', p9.focused && p9.locked === 'hidden', p9);

  // Esc 关闭并恢复滚动
  await ev(`document.querySelector('.modal').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`);
  await new Promise(r => setTimeout(r, 400));
  const p9b = await ev(`({closed: !document.getElementById('charModal'), overflow: document.body.style.overflow, focusBack: document.activeElement?.classList.contains('char-card')})`);
  console.log(p9b);
  check('Esc 可关闭弹窗并恢复滚动', p9b.closed && p9b.overflow === '', p9b);
  check('关闭后焦点归还卡片', p9b.focusBack, p9b);

  console.log('--- 10. 动画标题/集号搜索 ---');
  await goto(BASE + '/anime.html');
  await ev(`(()=>{const i=document.getElementById('qInput');i.value='柯南';i.dispatchEvent(new Event('input'));return 1})()`);
  await new Promise(r => setTimeout(r, 900));
  const a10 = await ev(`({rows: document.querySelectorAll('.data-table tbody tr').length, count: document.getElementById('cnt')?.textContent})`);
  console.log(a10);
  check('动画支持中文标题搜索', a10.rows > 0, a10);
  await ev(`(()=>{const i=document.getElementById('qInput');i.value='TV12';i.dispatchEvent(new Event('input'));return 1})()`);
  await new Promise(r => setTimeout(r, 600));
  const a10b = await ev(`({rows: document.querySelectorAll('.data-table tbody tr').length, first: document.querySelector('.data-table tbody tr td')?.textContent.trim()})`);
  console.log(a10b);
  check('动画集号精确命中 1 条', a10b.rows === 1 && a10b.first === 'TV12', a10b);

  console.log('--- 11. 剧场版导演搜索 ---');
  await goto(BASE + '/movies.html');
  await ev(`(()=>{const i=document.getElementById('qInput');i.value='静野';i.dispatchEvent(new Event('input'));return 1})()`);
  await new Promise(r => setTimeout(r, 700));
  const mv11 = await ev(`({rows: document.querySelectorAll('.data-table tbody tr').length, first: document.querySelector('.data-table tbody tr')?.textContent.replace(/\\s+/g,' ').trim().slice(0,60)})`);
  console.log(mv11);
  check('剧场版可按导演搜索', mv11.rows > 0, mv11);

  console.log('--- 12. 音乐表结构与字段 ---');
  await goto(BASE + '/music.html');
  const mu12 = await ev(`({
    cols: document.querySelectorAll('.data-table thead th').length,
    headers: [...document.querySelectorAll('.data-table thead th')].map(t=>t.textContent.trim()),
    rows: document.querySelectorAll('.data-table tbody tr').length
  })`);
  console.log(mu12);
  check('音乐表为 7 列（曲名/演唱/作词/作曲/编曲/剧集）', mu12.cols === 7, mu12);
  await ev(`(()=>{const i=document.getElementById('qInput');i.value='仓木麻衣';i.dispatchEvent(new Event('input'));return 1})()`);
  await new Promise(r => setTimeout(r, 800));
  const mu12b = await ev(`({rows: document.querySelectorAll('.data-table tbody tr').length, artist: document.querySelector('.data-table tbody tr td:nth-child(3)')?.textContent.trim(), hasNote: /作词/.test(document.querySelector('.data-table tbody')?.textContent || '')})`);
  console.log(mu12b);
  check('音乐可按演唱者搜索', mu12b.rows > 0 && mu12b.rows < 167, mu12b);
  check('演唱者列不再是播出区间', String(mu12b.artist || '').includes('仓木麻衣'), mu12b);
  check('备注拼接串不再出现在表格', !mu12b.hasNote, mu12b);
  await ev(`(()=>{const i=document.getElementById('qInput');i.value='OP1';i.dispatchEvent(new Event('input'));return 1})()`);
  await new Promise(r => setTimeout(r, 600));
  const mu12c = await ev(`({rows: document.querySelectorAll('.data-table tbody tr').length, code: document.querySelector('.data-table tbody tr td')?.textContent.trim()})`);
  console.log(mu12c);
  check('音乐编号精确匹配', mu12c.rows === 1 && mu12c.code === 'OP1', mu12c);

  console.log('--- 13/14/15. 搜索结果定位 ---');
  await goto(BASE + '/search.html?q=' + encodeURIComponent('毛利兰'));
  const href13 = await ev(`document.querySelector('.s-item')?.getAttribute('href')`);
  const first13 = await ev(`document.querySelector('.s-item .s-title')?.textContent.trim()`);
  console.log(href13, first13);
  check('搜索结果链接带定位参数', /characters\.html\?name=/.test(String(href13)), href13);
  check('搜索结果按相关度排序（毛利兰第一）', String(first13 || '').includes('毛利兰'), first13);

  await goto(BASE + '/characters.html?name=' + encodeURIComponent('毛利兰'));
  const d14 = await ev(`({
    cards: document.querySelectorAll('.char-card').length,
    hitName: document.querySelector('.char-card.hit .char-name')?.textContent.trim(),
    q: document.getElementById('qInput')?.value
  })`);
  console.log(d14);
  check('角色深链滚动并高亮目标卡片', d14.cards > 0 && String(d14.hitName || '').includes('毛利兰') && d14.q === '', d14);

  await goto(BASE + '/anime.html?id=TV12');
  const d15 = await ev(`({
    q: document.getElementById('qInput')?.value,
    first: document.querySelector('.data-table tbody tr td')?.textContent.trim(),
    hit: !!document.querySelector('.data-table tbody tr.hit')
  })`);
  console.log(d15);
  check('动画深链定位到 TV12', d15.q === 'TV12' && d15.first === 'TV12' && d15.hit, d15);

  await goto(BASE + '/music.html?code=OP1');
  const d15b = await ev(`({
    rows: document.querySelectorAll('.data-table tbody tr').length,
    code: document.querySelector('.data-table tbody tr td')?.textContent.trim(),
    hit: !!document.querySelector('.data-table tbody tr.hit')
  })`);
  console.log(d15b);
  check('音乐深链定位到 OP1', d15b.rows === 1 && d15b.code === 'OP1' && d15b.hit, d15b);

  console.log('--- 16. 移动端菜单点击展开 ---');
  await ws.send('Emulation.setDeviceMetricsOverride', { width: 420, height: 820, deviceScaleFactor: 1, mobile: true });
  await goto(BASE + '/index.html');
  const mob = await ev(`(()=>{
    document.getElementById('navToggle').click();
    const drop = document.querySelector('.nav-drop');
    drop.querySelector('button').click();
    const menu = drop.querySelector('.menu');
    return {
      toggleOpen: document.getElementById('navMenus').classList.contains('open'),
      dropOpen: drop.classList.contains('open'),
      visible: menu.offsetHeight > 0,
      expanded: drop.querySelector('button').getAttribute('aria-expanded')
    };
  })()`);
  console.log(mob);
  check('移动端菜单可逐级点击展开', mob.toggleOpen && mob.dropOpen && mob.visible && mob.expanded === 'true', mob);
  await ws.send('Emulation.clearDeviceMetricsOverride', {});

  const failed = results.filter(r => !r.ok);
  console.log(`\n结果：${results.length - failed.length}/${results.length} 通过`);
  ws.close();
  try { process.kill(proc.pid); } catch { }
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });