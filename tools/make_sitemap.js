/**
 * 生成 sitemap.xml（需要显式传入站点根地址）
 * 用法：node tools/make_sitemap.js --base https://example.com/
 * 也可用环境变量 SITE_BASE 传入。
 */
const fs = require('fs');
const path = require('path');

const SITE = path.resolve(__dirname, '..', 'site');
const args = process.argv.slice(2);
const baseArg = args.includes('--base') ? args[args.indexOf('--base') + 1] : process.env.SITE_BASE;
const base = String(baseArg || '').trim();

if (!/^https?:\/\/[^/]+/i.test(base)) {
  console.error('用法: node tools/make_sitemap.js --base https://你的域名/');
  process.exit(1);
}

// 统一补尾斜杠
const root = base.endsWith('/') ? base : base + '/';
const pages = fs.readdirSync(SITE)
  .filter(f => f.endsWith('.html') && f !== '404.html')
  .sort();

const urls = pages.map(f => {
  const stat = fs.statSync(path.join(SITE, f));
  const lastmod = stat.mtime.toISOString().slice(0, 10);
  return `  <url><loc>${root}${f}</loc><lastmod>${lastmod}</lastmod></url>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

fs.writeFileSync(path.join(SITE, 'sitemap.xml'), xml);
console.log(`已生成 site/sitemap.xml，共 ${pages.length} 个页面，站点根：${root}`);
