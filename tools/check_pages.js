/**
 * 页面骨架一致性校验：所有 HTML 必须包含统一的 head 与容器，
 * 防止新增页面漏掉 noscript、样式或公共脚本。失败时退出码 1。
 */
const fs = require('fs');
const path = require('path');

const SITE = path.resolve(__dirname, '..', 'site');
const REQUIRED = [
  '<meta charset="UTF-8">',
  '<meta name="viewport"',
  '<link rel="stylesheet" href="css/main.css">',
  '<img id="bg"',
  '<noscript>',
  '<nav id="navbar"></nav>',
  '<aside id="sidebar"></aside>',
  '<main id="main">',
  '<footer id="footer"></footer>',
  '<script src="js/site.js"></script>',
];

const pages = fs.readdirSync(SITE).filter(f => f.endsWith('.html'));
const errors = [];

for (const f of pages) {
  const s = fs.readFileSync(path.join(SITE, f), 'utf8');
  for (const r of REQUIRED) {
    if (!s.includes(r)) errors.push(`${f} 缺少 ${r}`);
  }
  if (!/<title>[^<]+<\/title>/.test(s)) errors.push(`${f} 缺少非空 <title>`);
  if (!/<meta name="description" content="[^"]+"/.test(s)) errors.push(`${f} 缺少 description`);
}

console.log(`检查 ${pages.length} 个页面，发现 ${errors.length} 个问题`);
errors.forEach(e => console.log('  - ' + e));
process.exit(errors.length ? 1 : 0);
