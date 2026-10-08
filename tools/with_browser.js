/**
 * 启动无头 Edge（CDP 端口 9222），执行完毕后自动关闭。
 * 解决「detached 子进程随父进程退出而消失」的问题。
 *
 * 用法：node tools/with_browser.js <要执行的脚本> [传给脚本的参数...]
 */
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const EXE_CANDIDATES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];

const ROOT = path.join(__dirname, '..');
const PROFILE = path.join(ROOT, '.workbuddy/edge-profile');
const PORT = 9222;

const script = process.argv[2];
if (!script) {
  console.error('用法：node tools/with_browser.js <脚本> [参数...]');
  process.exit(1);
}

const exe = EXE_CANDIDATES.find(p => fs.existsSync(p));
if (!exe) {
  console.error('未找到 Edge / Chrome 可执行文件');
  process.exit(1);
}

fs.mkdirSync(PROFILE, { recursive: true });

const proc = spawn(exe, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--remote-allow-origins=*',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-features=Translate,MediaRouter',
  `--user-data-dir=${PROFILE}`,
  'about:blank',
], { detached: true, stdio: 'ignore' });
proc.unref();

// 等端口就绪
const net = require('net');
function probe() {
  return new Promise(res => {
    const s = net.connect(PORT, '127.0.0.1');
    s.setTimeout(1200);
    s.on('connect', () => { s.destroy(); res(true); });
    s.on('error', () => res(false));
    s.on('timeout', () => { s.destroy(); res(false); });
  });
}

(async () => {
  for (let i = 0; i < 20; i++) {
    if (await probe()) break;
    await new Promise(r => setTimeout(r, 500));
  }

  const abs = path.isAbsolute(script) ? script : path.join(ROOT, script);
  if (!fs.existsSync(abs)) {
    console.error('脚本不存在:', abs);
    cleanup();
    process.exit(1);
  }

  let code = 0;
  try {
    execFileSync(process.execPath, [abs, ...process.argv.slice(3)], { stdio: 'inherit' });
  } catch (e) {
    code = e.status === undefined ? 1 : e.status;
  }
  cleanup();
  process.exit(code);
})();

function cleanup() {
  try { execFileSync('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'ignore' }); }
  catch { try { process.kill(proc.pid); } catch {} }
}
