#!/usr/bin/env node
/**
 * 构建脚本 —— 纯静态站不需要编译，这里只做两件事：
 *
 * 1. 校验站点文件齐全（防止仓库里少了 data/ 或 assets/ 还照部署）
 * 2. 把 site/ 原样复制到 dist/，供托管平台直接托管
 *
 * 为什么需要它：
 * EdgeOne Pages 等平台默认执行 `npm run build`，再托管「输出目录」。
 * 本项目 site/ 本身就是成品目录，但仓库根目录还混着 tools/、deploy/、
 * README 等不该对外暴露的内容。复制到 dist/ 后，托管目录干净且可预测。
 *
 * 用法：
 *   node tools/build.js             → 输出到 dist/
 *   node tools/build.js out         → 指定输出目录
 *
 * 注意：没有任何第三方依赖，用 Node 内置模块即可，避免安装 sharp 这类
 * 只有数据管线才需要的重型包。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const OUT = path.resolve(ROOT, process.argv[2] || 'dist');

/** 必须存在的文件，缺一个就说明仓库状态不对，直接失败而不是部署半成品 */
const MUST = [
  'index.html',
  '404.html',
  'css/main.css',
  'js/site.js',
  'data/characters.json',
  'data/manga.json',
  'data/anime.json',
  'data/movies.json',
  'data/music.json',
  'data/home.json',
  'data/avatars.json',
  'assets/img/conan.png',
  'favicon.ico',
  'site.webmanifest',
];

function fail(msg) {
  console.error('✗ ' + msg);
  process.exit(1);
}

// ---- 1. 前置校验 ----
if (!fs.existsSync(SITE)) fail('找不到 site/ 目录，请在仓库根目录执行');

const missing = MUST.filter(rel => !fs.existsSync(path.join(SITE, rel)));
if (missing.length) fail('缺少必需文件：' + missing.join(', '));

// 头像目录即使为空也应有目录；数量异常通常意味着 assets 没拉全
const avatarDir = path.join(SITE, 'assets/avatars');
const avatarCount = fs.existsSync(avatarDir)
  ? fs.readdirSync(avatarDir).filter(f => /\.(webp|png|jpe?g)$/i.test(f)).length
  : 0;
if (avatarCount < 100) fail('角色头像只有 ' + avatarCount + ' 张，预期 150+，assets 可能不完整');

// ---- 2. 清理旧输出 ----
// 只删自己生成过的目录，避免把用户指定的无关目录清空
if (fs.existsSync(OUT)) {
  const isOurs = fs.existsSync(path.join(OUT, 'index.html'))
    || fs.readdirSync(OUT).length === 0;
  if (!isOurs) fail('输出目录 ' + OUT + ' 已存在且不像构建产物，拒绝覆盖');
  fs.rmSync(OUT, { recursive: true, force: true });
}

// ---- 3. 复制 ----
// serve.js 仅本地开发用，服务器上由平台或 Nginx 托管，不打进产物
const EXCLUDE = new Set(['serve.js']);

let files = 0, bytes = 0;
(function copy(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue;
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copy(s, d);
    else {
      fs.copyFileSync(s, d);
      files++;
      bytes += fs.statSync(s).size;
    }
  }
})(SITE, OUT);

// ---- 4. 产物自检 ----
const outIndex = path.join(OUT, 'index.html');
if (!fs.existsSync(outIndex)) fail('构建后找不到 index.html');

const outAvatars = fs.readdirSync(path.join(OUT, 'assets/avatars')).length;
console.log('✓ 构建完成');
console.log('  输出目录 ' + path.relative(ROOT, OUT));
console.log('  ' + files + ' 个文件  ' + (bytes / 1024 / 1024).toFixed(2) + ' MB  头像 ' + outAvatars + ' 张');
console.log('  托管平台把「输出目录」填成 ' + path.relative(ROOT, OUT) + ' 即可');
