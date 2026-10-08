/**
 * 头像瘦身：角色头像原图为高分辨率 PNG（平均 58KB / 最大 331KB），
 * 而页面最大显示仅 84px（Retina 需 168px），存在大量冗余。
 * 本脚本把所有头像转为 WebP 并限宽 176px（2x 于最大显示尺寸），画质无损感知。
 *
 * 流程：原 PNG 备份到 _old/avatars-png/ → 转 WebP → 更新 avatars.json 映射
 *       → 校验全部可读 → 保留备份（可随时回滚）
 *
 * 用法：node tools/optimize_avatars.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', 'site');
const DIR = path.join(ROOT, 'assets/avatars');
const BACKUP = path.join(__dirname, '..', '_old/avatars-png');
const MAP = path.join(ROOT, 'data/avatars.json');
const WIDTH = 176;   // 页面最大显示 84px，2x 屏留足余量
const QUALITY = 82;

(async () => {
  if (!fs.existsSync(BACKUP)) fs.mkdirSync(BACKUP, { recursive: true });

  const map = JSON.parse(fs.readFileSync(MAP, 'utf8'));
  const entries = Object.entries(map).filter(([, rel]) => rel.includes('avatars/'));
  console.log(`待处理 ${entries.length} 张头像\n`);

  let before = 0, after = 0, ok = 0, fail = 0, backup = 0;

  for (const [name, rel] of entries) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) { console.log(`MISS  ${name}`); fail++; continue; }

    const size = fs.statSync(abs).size;
    before += size;

    const outRel = rel.replace(/\.png$/i, '.webp');
    const outAbs = path.join(ROOT, outRel);

    // 已是 webp 则跳过
    if (/\.webp$/i.test(abs)) { after += size; ok++; continue; }

    try {
      // 先备份原 PNG
      const bakAbs = path.join(BACKUP, path.basename(abs));
      if (!fs.existsSync(bakAbs)) { fs.copyFileSync(abs, bakAbs); backup++; }

      // 读成 Buffer 再交给 sharp，规避 Windows 文件句柄占用
      const buf = fs.readFileSync(abs);
      const meta = await sharp(buf).metadata();

      const out = await sharp(buf)
        .resize({ width: WIDTH, withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: QUALITY, effort: 5 })
        .toBuffer();

      // 只有确实更小才替换，避免小图被"优化"后变大
      if (out.length >= size) {
        console.log(`SKIP  ${name}  ${(size / 1024).toFixed(0)}KB 原图已足够小`);
        after += size;
        continue;
      }

      fs.writeFileSync(outAbs, out);
      fs.rmSync(abs, { force: true, maxRetries: 5, retryDelay: 100 });
      map[name] = outRel;
      after += out.length;
      ok++;

      const arrow = `${(size / 1024).toFixed(0)}KB→${(out.length / 1024).toFixed(1)}KB`;
      console.log(`${String(name).padEnd(8, '　')} ${meta.width}x${meta.height}  ${arrow}`);
    } catch (e) {
      after += size;
      fail++;
      console.log(`ERR   ${name}  ${e.message}`);
    }
  }

  fs.writeFileSync(MAP, JSON.stringify(map, null, 0), 'utf8');

  // 校验：所有映射指向的文件都必须存在且可解码
  let broken = [];
  for (const [name, rel] of Object.entries(map)) {
    if (!rel.includes('avatars/')) continue;
    const abs = path.join(ROOT, rel);
    try {
      const b = fs.readFileSync(abs);
      await sharp(b).metadata();
    } catch {
      broken.push(name);
    }
  }

  console.log(`\n完成：${ok} 成功 / ${fail} 失败，备份 ${backup} 张原图`);
  console.log(`体积：${(before / 1048576).toFixed(2)}MB → ${(after / 1048576).toFixed(2)}MB`
    + `（降 ${(100 - after / before * 100).toFixed(0)}%）`);
  console.log(`校验：损坏 ${broken.length} 个 ${broken.length ? '→ ' + broken.join(', ') : '✓'}`);
})();
