/**
 * 一站式回归：启动静态服务器 → 在无头 Edge 中跑指定脚本 → 关浏览器 → 关服务器
 *
 * 用法：node tools/regress.js [脚本...]      默认跑 test_ui.js
 */
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const PORT = parseInt(process.env.SITE_PORT, 10) || 4174;
const SITE = path.join(ROOT, 'site');

const EXE_CANDIDATES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];

const argv = process.argv.slice(2);
const scripts = argv.filter(a => a.endsWith('.js'));
if (!scripts.length) scripts.push('tools/test_ui.js');
/** 首个脚本之后的参数原样透传（如 shoot.js index --mobile） */
const passArgs = argv.slice(argv.indexOf(scripts[0]) + 1).filter(a => !a.endsWith('.js'));

const exe = EXE_CANDIDATES.find(p => fs.existsSync(p));
if (!exe) { console.error('未找到 Edge / Chrome'); process.exit(1); }

const PROFILE = path.join(ROOT, '.workbuddy/edge-profile');
fs.mkdirSync(PROFILE, { recursive: true });

const srv = spawn(process.execPath, [path.join(SITE, 'serve.js'), String(PORT)], {
  cwd: SITE, stdio: 'ignore',
});

const browser = spawn(exe, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--remote-allow-origins=*',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-features=Translate,MediaRouter',
  `--user-data-dir=${PROFILE}`,
  'about:blank',
], { detached: true, stdio: 'ignore' });
browser.unref();

function probe(port) {
  return new Promise(res => {
    const s = net.connect(port, '127.0.0.1');
    s.setTimeout(1200);
    s.on('connect', () => { s.destroy(); res(true); });
    s.on('error', () => res(false));
    s.on('timeout', () => { s.destroy(); res(false); });
  });
}

async function waitFor(port, tries = 30) {
  for (let i = 0; i < tries; i++) {
    if (await probe(port)) return true;
    await new Promise(r => setTimeout(r, 400));
  }
  return false;
}

function cleanup() {
  try { srv.kill(); } catch {}
  try { execFileSync('taskkill', ['/PID', String(browser.pid), '/T', '/F'], { stdio: 'ignore' }); }
  catch { try { process.kill(browser.pid); } catch {} }
}

(async () => {
  if (!await waitFor(PORT)) { console.error('服务器未启动'); cleanup(); process.exit(1); }
  if (!await waitFor(9222)) { console.error('浏览器未启动'); cleanup(); process.exit(1); }
  console.log(`[regress] 服务器 :${PORT} | 浏览器 :9222 就绪\n`);

  let code = 0;
  for (const s of scripts) {
    console.log(`\n===== ${s} =====`);
    const abs = path.isAbsolute(s) ? s : path.join(ROOT, s);
    try {
      execFileSync(process.execPath, [abs, ...passArgs], { stdio: 'inherit', env: { ...process.env, SITE_PORT: String(PORT), SITE_BASE: `http://127.0.0.1:${PORT}` } });
    } catch (e) {
      code = e.status === undefined ? 1 : e.status;
    }
  }
  cleanup();
  process.exit(code);
})();
