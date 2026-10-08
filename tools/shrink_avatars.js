/**
 * 压缩过大的角色头像：重新请求 MediaWiki 缩略图（指定更小宽度）
 * 用法：node tools/shrink_avatars.js [阈值KB]
 */
const fs = require('fs');
const path = require('path');

const API = 'https://www.conanpedia.com/api.php';
const UA = { 'User-Agent': 'Mozilla/5.0 (KeNan site builder)' };
const LIMIT_KB = parseInt(process.argv[2], 10) || 90;
const WIDTH = 160;

async function thumbUrl(title, width) {
  const u = `${API}?action=query&titles=${encodeURIComponent('File:' + title)}`
    + `&prop=imageinfo&iiprop=url&iiurlwidth=${width}&format=json&formatversion=2`;
  const r = await fetch(u, { headers: UA });
  const j = await r.json();
  const page = j?.query?.pages?.[0];
  if (!page || page.missing) return null;
  return page.imageinfo?.[0]?.thumburl || null;
}

(async () => {
  const root = path.join(__dirname, '..', 'site');
  const chars = JSON.parse(fs.readFileSync(path.join(root, 'data/characters.json'), 'utf8'));
  const map = JSON.parse(fs.readFileSync(path.join(root, 'data/avatars.json'), 'utf8'));
  const dir = path.join(root, 'assets/avatars');

  let before = 0, after = 0, changed = 0, failed = 0;

  for (const c of chars) {
    const rel = map[c.nameZh];
    if (!rel || !rel.includes('avatars')) continue;
    const abs = path.join(root, rel);
    let size = 0;
    try { size = fs.statSync(abs).size; } catch { continue; }
    before += size;
    if (size <= LIMIT_KB * 1024) { after += size; continue; }

    try {
      // 按内存读取再覆盖，规避 Windows 文件句柄占用
      const buf = fs.readFileSync(abs);
      const url = await thumbUrl(c.image, WIDTH);
      if (!url) { after += size; failed++; continue; }
      const r = await fetch(url, { headers: { ...UA, Referer: 'https://www.conanpedia.com/' } });
      if (!r.ok) { after += size; failed++; continue; }
      const nb = Buffer.from(await r.arrayBuffer());
      if (nb.length < size) {
        fs.writeFileSync(abs, nb);
        after += nb.length;
        changed++;
        console.log(`${c.nameZh}: ${(size / 1024).toFixed(0)}KB → ${(nb.length / 1024).toFixed(0)}KB`);
      } else {
        after += size;   // 新的反而更大，保留原图
      }
      void buf;
    } catch (e) {
      after += size;
      failed++;
      console.log('ERR', c.nameZh, e.message);
    }
  }

  console.log(`\n压缩完成：${changed} 张更新，${failed} 张跳过`);
  console.log(`总体积：${(before / 1024 / 1024).toFixed(2)}MB → ${(after / 1024 / 1024).toFixed(2)}MB`);
})();