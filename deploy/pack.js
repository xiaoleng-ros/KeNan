#!/usr/bin/env node
/**
 * 打包 site/ 为可上传到 1Panel 的 zip
 *
 * 用法：
 *   node deploy/pack.js            → keNan-site.zip
 *   node deploy/pack.js out.zip    → 指定输出文件名
 *
 * 排除项：
 *   serve.js   仅本地开发用，服务器上由 OpenResty 托管
 *   *.log/.DS_Store  垃圾文件
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const OUT = path.resolve(ROOT, process.argv[2] || 'keNan-site.zip');

const EXCLUDE_NAMES = new Set(['serve.js', '.DS_Store', 'Thumbs.db']);
const EXCLUDE_EXT = new Set(['.log', '.tmp']);

// 最小 zip 写入器：deflate 原始数据 + 自己拼中央目录，省掉 archiver 依赖
function crc32(buf) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function collect(dir, base = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_NAMES.has(e.name)) continue;
    if (EXCLUDE_EXT.has(path.extname(e.name).toLowerCase())) continue;
    const full = path.join(dir, e.name);
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...collect(full, rel));
    else out.push({ full, rel });
  }
  return out;
}

if (!fs.existsSync(SITE)) {
  console.error('✗ 找不到 site/ 目录');
  process.exit(1);
}

const files = collect(SITE);
const local = [];
const central = [];
let offset = 0;

for (const f of files) {
  const raw = fs.readFileSync(f.full);
  const comp = zlib.deflateRawSync(raw, { level: 9 });
  // 压不动（已压缩过）就存原始
  const useDeflate = comp.length < raw.length;
  const data = useDeflate ? comp : raw;
  const method = useDeflate ? 8 : 0;
  const nameBuf = Buffer.from(f.rel, 'utf8');
  const crc = crc32(raw);

  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4);          // version needed
  localHeader.writeUInt16LE(0x0800, 6);      // flag: UTF-8 filename
  localHeader.writeUInt16LE(method, 8);
  localHeader.writeUInt16LE(0, 10);          // mod time
  localHeader.writeUInt16LE(0x21, 12);       // mod date (1996-01-01, 固定值保证可复现)
  localHeader.writeUInt32LE(crc, 14);
  localHeader.writeUInt32LE(data.length, 18);
  localHeader.writeUInt32LE(raw.length, 22);
  localHeader.writeUInt16LE(nameBuf.length, 26);
  localHeader.writeUInt16LE(0, 28);

  local.push(localHeader, nameBuf, data);

  const cd = Buffer.alloc(46);
  cd.writeUInt32LE(0x02014b50, 0);
  cd.writeUInt16LE(20, 4);           // version made by
  cd.writeUInt16LE(20, 6);           // version needed
  cd.writeUInt16LE(0x0800, 8);
  cd.writeUInt16LE(method, 10);
  cd.writeUInt16LE(0, 12);
  cd.writeUInt16LE(0x21, 14);
  cd.writeUInt32LE(crc, 16);
  cd.writeUInt32LE(data.length, 20);
  cd.writeUInt32LE(raw.length, 24);
  cd.writeUInt16LE(nameBuf.length, 28);
  cd.writeUInt16LE(0, 30);           // extra
  cd.writeUInt16LE(0, 32);           // comment
  cd.writeUInt16LE(0, 34);           // disk number
  cd.writeUInt16LE(0, 36);           // internal attrs
  cd.writeUInt32LE(0o644 << 16, 38);  // external attrs
  cd.writeUInt32LE(offset, 42);
  central.push(cd, nameBuf);

  offset += localHeader.length + nameBuf.length + data.length;
}

const centralBuf = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(0, 4);
end.writeUInt16LE(0, 6);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(centralBuf.length, 12);
end.writeUInt32LE(offset, 16);
end.writeUInt16LE(0, 20);

fs.writeFileSync(OUT, Buffer.concat([...local, centralBuf, end]));

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`✓ ${path.relative(ROOT, OUT)}  ${files.length} 个文件  ${kb} KB`);
console.log('  上传到 1Panel 网站根目录后解压即可');
