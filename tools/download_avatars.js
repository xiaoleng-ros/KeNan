/**
 * 下载角色头像到 site/assets/avatars/
 * 通过 MediaWiki API 查询每个 File: 的真实 URL
 */
const fs = require('fs');
const path = require('path');

const API = 'https://www.conanpedia.com/api.php';
const UA = { 'User-Agent': 'Mozilla/5.0 (KeNan site builder)' };

async function imageUrl(title) {
  const u = `${API}?action=query&titles=${encodeURIComponent('File:' + title)}&prop=imageinfo&iiprop=url&iiurlwidth=200&format=json&formatversion=2`;
  const r = await fetch(u, { headers: UA });
  const j = await r.json();
  const page = j?.query?.pages?.[0];
  if (!page || page.missing) return null;
  return page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url || null;
}

(async () => {
  const chars = JSON.parse(fs.readFileSync('site/data/characters.json', 'utf8'));
  const dir = 'site/assets/avatars';
  fs.mkdirSync(dir, { recursive: true });

  const manifest = {};
  let ok = 0, miss = 0;

  // 并发受限地抓取
  const queue = chars.filter(c => c.image);
  const CONC = 6;
  let idx = 0;

  async function worker() {
    while (idx < queue.length) {
      const c = queue[idx++];
      const safe = c.image.replace(/[\\/:*?"<>|]/g, '_');
      const dest = path.join(dir, safe);
      if (fs.existsSync(dest) && fs.statSync(dest).size > 500) {
        manifest[c.nameZh] = 'assets/avatars/' + safe;
        ok++; continue;
      }
      try {
        const url = await imageUrl(c.image);
        if (!url) { miss++; console.log('MISS', c.nameZh, c.image); continue; }
        const r = await fetch(url, { headers: { ...UA, Referer: 'https://www.conanpedia.com/' } });
        if (!r.ok) { miss++; console.log('HTTP', r.status, c.image); continue; }
        const buf = Buffer.from(await r.arrayBuffer());
        fs.writeFileSync(dest, buf);
        manifest[c.nameZh] = 'assets/avatars/' + safe;
        ok++;
      } catch (e) {
        miss++;
        console.log('ERR', c.nameZh, e.message);
      }
      if ((ok + miss) % 20 === 0) console.log('  ...', ok + miss, '/', queue.length);
    }
  }

  await Promise.all(Array.from({ length: CONC }, worker));

  // 无图的角色用占位图
  for (const c of chars) if (!manifest[c.nameZh]) manifest[c.nameZh] = 'assets/img/placeholder.svg';

  fs.writeFileSync('site/data/avatars.json', JSON.stringify(manifest, null, 1));
  console.log('完成：成功', ok, '失败', miss, '总计', chars.length);
})();