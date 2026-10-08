/**
 * 用柯南头像生成全套站点图标（favicon / 导航 logo / 侧栏 logo / 首页头像）
 *
 * 背景：原站 favicon、导航栏 logo、侧栏 logo、首页圆形头像共 4 类图标位，
 *      分别指向原站 logo.png / brand.svg / nav.png（水印剪影，白底几乎不可见）。
 *      现统一改为「江户川柯南」头像，与角色页头像同源。
 *
 * 产物：
 *   assets/img/conan.png          导航栏 / 侧栏 / 首页通用头像（透明底 PNG）
 *   assets/img/logo.svg           favicon 矢量版（内嵌裁剪后的头像 + 蓝底圆角）
 *   favicon.ico                   多尺寸 ICO（16/32/48）
 *   favicon-16/32/48.png          各尺寸 PNG，供 <link rel="icon"> 显式声明
 *   apple-touch-icon.png          180×180（iOS 需不透明底）
 *
 * 用法：NODE_PATH=<sharp路径> node tools/make_icons.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const IMG = path.join(SITE, 'assets/img');
const BACKUP = path.join(ROOT, '_old/avatars-png');

/** 柯南头像原图（优化前的 PNG 备份，373×373） */
function findSource() {
  const name = fs.readdirSync(BACKUP).find(f => f.includes('江户川柯南'));
  if (!name) throw new Error('找不到柯南头像原图备份：' + BACKUP);
  return path.join(BACKUP, name);
}

/**
 * 把头像裁成正方形并保留透明
 * 头像为半身像，裁中心偏上可保留脸部
 */
async function square(buf, size) {
  const img = sharp(buf);
  const m = await img.metadata();
  const side = Math.min(m.width, m.height);
  const left = Math.round((m.width - side) / 2);
  // 半身像：重心略上移，避免裁掉头顶
  const top = Math.round((m.height - side) * 0.42);
  return sharp(buf)
    .extract({ left, top, width: side, height: side })
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

(async () => {
  const src = findSource();
  const raw = fs.readFileSync(src);   // 读成 Buffer 再交给原生库，规避 Windows 句柄占用
  const base = await square(raw, 512);
  console.log('源图:', path.basename(src), '→ 512×512 基准头像');

  /* 1. 通用透明头像（导航栏 / 侧栏 / 首页圆形头像）
        导航栏最大显示 48px，侧栏 56px，首页圆形 42px → 128px 足够覆盖 2x 屏 */
  const conan128 = await sharp(base).resize(128, 128, { fit: 'cover' })
    .png({ compressionLevel: 9, quality: 88 }).toBuffer();
  fs.writeFileSync(path.join(IMG, 'conan.png'), conan128);
  console.log('assets/img/conan.png        ', (conan128.length / 1024).toFixed(1) + 'KB (128×128)');

  /* 2. favicon PNG（16/32/48）与 apple-touch-icon（180）
        iOS 的 apple-touch-icon 不支持透明，需垫品牌蓝底 */
  for (const s of [16, 32, 48]) {
    const b = await sharp(base).resize(s, s, { fit: 'cover' })
      .png({ compressionLevel: 9, palette: true }).toBuffer();
    const out = `favicon-${s}.png`;
    fs.writeFileSync(path.join(SITE, out), b);
    console.log((out + '                     ').slice(0, 24), b.length + 'B');
  }

  const atInner = await sharp(base).resize(180, 180, { fit: 'cover' }).png().toBuffer();
  const atIcon = await sharp({
    create: { width: 180, height: 180, channels: 4, background: '#4a66c2' },
  }).composite([{ input: atInner, left: 0, top: 0 }])
    .png({ compressionLevel: 9, palette: true }).toBuffer();
  fs.writeFileSync(path.join(SITE, 'apple-touch-icon.png'), atIcon);
  console.log('apple-touch-icon.png       ', (atIcon.length / 1024).toFixed(1) + 'KB (180×180)');

  /* 3. favicon.svg —— 蓝底圆角方块 + 矢量柯南特征（眼镜 + 领结）
     不用内嵌位图：512px PNG base64 会让 svg 膨胀到 200KB+，
     而 favicon 在 16–48px 显示，矢量特征已足够辨识。 */
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4a66c2"/>
      <stop offset="100%" stop-color="#7a86d6"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="13" ry="13" fill="url(#bg)"/>
  <!-- 柯南特征：眼镜 + 领结 -->
  <g fill="none" stroke="#fff" stroke-width="4.2">
    <circle cx="23" cy="28" r="9.5"/>
    <circle cx="43" cy="28" r="9.5"/>
    <path d="M32.5 28h1.5M13.5 25.5L9.5 22.5M52.5 25.5l4-3" stroke-linecap="round"/>
  </g>
  <path d="M27 45c-3.4 4.4-9.2 4.4-12.6 0 3.4-4.4 9.2-4.4 12.6 0z" fill="#e34e4e"/>
  <path d="M37 45c3.4-4.4 9.2-4.4 12.6 0-3.4 4.4-9.2 4.4-12.6 0z" fill="#e34e4e"/>
  <circle cx="32" cy="45" r="4" fill="#fff"/>
</svg>`;
  fs.writeFileSync(path.join(IMG, 'logo.svg'), faviconSvg, 'utf8');
  console.log('assets/img/logo.svg         ', (faviconSvg.length / 1024).toFixed(1) + 'KB (矢量)');

  /* 4. favicon.ico（16/32/48 三合一） */
  const icoSizes = [16, 32, 48];
  const pngs = [];
  for (const s of icoSizes) {
    pngs.push(await sharp(base).resize(s, s, { fit: 'cover' }).png().toBuffer());
  }
  const ico = buildIco(pngs, icoSizes);
  fs.writeFileSync(path.join(SITE, 'favicon.ico'), ico);
  console.log('favicon.ico                 ', (ico.length / 1024).toFixed(1) + 'KB');

  /* 5. site.webmanifest（PWA） */
  const manifest = {
    name: '柯南的世界',
    short_name: '柯南',
    icons: [
      { src: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    theme_color: '#4a66c2',
    background_color: '#ffffff',
    display: 'standalone',
  };
  fs.writeFileSync(path.join(SITE, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('site.webmanifest            ok');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });

/** 由多个 PNG 组装 ICO */
function buildIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // reserved
  header.writeUInt16LE(1, 2);      // type = icon
  header.writeUInt16LE(count, 4);

  const entries = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  let p = 0;
  pngBuffers.forEach((buf, i) => {
    const s = sizes[i];
    entries[p] = s >= 256 ? 0 : s;         // width
    entries[p + 1] = s >= 256 ? 0 : s;     // height
    entries[p + 2] = 0;                    // 调色板数
    entries[p + 3] = 0;                    // reserved
    entries.writeUInt16LE(1, p + 4);       // color planes
    entries.writeUInt16LE(32, p + 6);      // bits per pixel
    entries.writeUInt32LE(buf.length, p + 8);
    entries.writeUInt32LE(offset, p + 12);
    offset += buf.length;
    p += 16;
  });
  return Buffer.concat([header, entries, ...pngBuffers]);
}
