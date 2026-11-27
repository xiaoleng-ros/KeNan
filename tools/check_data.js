/**
 * 数据完整性校验（不需要浏览器，直接读 site/data/*.json）
 *
 * 用法：node tools/check_data.js      失败时退出码 1
 *
 * 起因：剧场版表格大量使用 rowspan 合并单元格，
 * 旧的 expandRowspans 在每个 rowspan 上少填一行，导致后续行的
 * 导演/编剧/时长/人次整体前移一列，且 rowspan 跨行越多、错位越深。
 * 这类错位不会让页面报错，只会让表格静默显示成「编剧：100分钟」。
 * 这里用字段形状断言把它钉死。
 */
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'site', 'data');
const load = name => {
  const p = path.join(DATA, name + '.json');
  if (!fs.existsSync(p)) throw new Error('缺少数据文件：' + p);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
};

const isDate = v => /^\d{4}\/\d{2}\/\d{2}$/.test(String(v || ''));
const isDuration = v => /^\d+分钟$/.test(String(v || ''));
const isPeople = v => /^\d+(\.\d+)?万$/.test(String(v || ''));
const isMoney = v => /^\d+(\.\d+)?亿$/.test(String(v || ''));

const problems = [];
/** 记录一条问题；同一文件同类问题合并输出，避免刷屏 */
function bad(file, id, field, value, hint) {
  problems.push({ file, id, field, value: JSON.stringify(value), hint });
}

// ---------- 剧场版：rowspan 错位重灾区 ----------
function checkMovies() {
  const d = load('movies');
  const rows = d.regular || [];
  if (rows.length < 20) bad('movies', '-', 'regular', rows.length, '常规剧场版条数异常偏少');

  for (const m of rows) {
    if (!/^M\d+$/.test(m.id)) bad('movies', m.id, 'id', m.id, '编号格式应为 M+数字');
    if (!m.titleZh) bad('movies', m.id, 'titleZh', m.titleZh, '中文标题为空');
    if (!m.titleJa) bad('movies', m.id, 'titleJa', m.titleJa, '日文标题为空');
    if (!isDate(m.date)) bad('movies', m.id, 'date', m.date, '日期应为 YYYY/MM/DD');

    // 这些字段一旦互相"串门"，就是 rowspan 又少填了一行
    if (isDuration(m.writer)) bad('movies', m.id, 'writer', m.writer, '编剧字段拿到了时长 → rowspan 错位');
    if (isPeople(m.writer)) bad('movies', m.id, 'writer', m.writer, '编剧字段拿到了观影人次 → rowspan 错位');
    if (isPeople(m.duration)) bad('movies', m.id, 'duration', m.duration, '时长字段拿到了观影人次 → rowspan 错位');
    if (isMoney(m.duration)) bad('movies', m.id, 'duration', m.duration, '时长字段拿到了票房 → rowspan 错位');
    if (isDuration(m.viewers)) bad('movies', m.id, 'viewers', m.viewers, '观影人次字段拿到了时长 → rowspan 错位');
    if (isDuration(m.boxOffice)) bad('movies', m.id, 'boxOffice', m.boxOffice, '票房字段拿到了时长 → rowspan 错位');

    // 已上映（首映时间早于今天）的剧场版必须有时长与人次
    if (isDate(m.date) && m.date < '2026/11/27') {
      if (!isDuration(m.duration)) bad('movies', m.id, 'duration', m.duration, '已上映剧场版时长缺失或格式异常');
      if (!isPeople(m.viewers)) bad('movies', m.id, 'viewers', m.viewers, '已上映剧场版观影人次缺失或格式异常');
      if (!isMoney(m.boxOffice)) bad('movies', m.id, 'boxOffice', m.boxOffice, '已上映剧场版票房缺失或格式异常');
    }
  }

  // 编号连续：M1..Mn 不能缺号
  const nums = rows.map(m => parseInt(String(m.id).slice(1), 10)).filter(n => !isNaN(n)).sort((a, b) => a - b);
  const missing = [];
  for (let i = 1; i <= nums[nums.length - 1]; i++) if (!nums.includes(i)) missing.push('M' + i);
  if (missing.length) bad('movies', '-', 'id', missing.join(','), '剧场版编号不连续');
}

// ---------- 漫画 ----------
function checkManga() {
  const d = load('manga');
  const rows = d.rows || [];
  if (rows.length < 500) bad('manga', '-', 'rows', rows.length, '漫画条数异常偏少');

  for (const r of rows) {
    if (!/^File\.\d+$/i.test(r.file || '')) bad('manga', r.file, 'file', r.file, 'File 编号格式异常');
    if (!r.titleZh) bad('manga', r.file, 'titleZh', r.titleZh, '中文标题为空（多为 rowspan 错位后被整行跳过）');
    if (!r.titleJa) bad('manga', r.file, 'titleJa', r.titleJa, '日文标题为空');
    if (!isDate(r.date)) bad('manga', r.file, 'date', r.date, '日期应为 YYYY/MM/DD');
    if (!r.caseName) bad('manga', r.file, 'caseName', r.caseName, '案件名为空 → 案件分组断裂');
    if (/^TV\d/.test(r.caseName || '')) bad('manga', r.file, 'caseName', r.caseName, '案件名拿到了动画编号 → 列错位');
  }

  // 同一个案件序号只能对应一个案件名；反过来不成立
  // （案件会跨年连载，年末那一话记在上一年，所以同名案件对应多组 year#caseNo 是正常的）
  const noToName = new Map();
  for (const r of rows) {
    if (!r.caseNo || !r.caseName) continue;
    if (!noToName.has(r.caseNo)) noToName.set(r.caseNo, new Set());
    noToName.get(r.caseNo).add(r.caseName);
  }
  for (const [no, set] of noToName) {
    if (set.size > 1) bad('manga', 'Case.' + no, 'caseName', [...set].join(' / '), '同一案件序号对应了多个案件名 → 分组塌陷');
  }

  // 案件号必须能连成 1..N，缺号说明有案件整组被跳过了
  const caseNos = [...new Set(rows.map(r => r.caseNo).filter(Boolean))]
    .map(n => parseInt(String(n), 10)).filter(n => !isNaN(n)).sort((a, b) => a - b);
  if (caseNos.length) {
    const miss = [];
    for (let i = 1; i <= caseNos[caseNos.length - 1]; i++) if (!caseNos.includes(i)) miss.push(i);
    if (miss.length) bad('manga', '-', 'caseNo', miss.slice(0, 20).join(','), '案件序号不连续（共 ' + miss.length + ' 处）');
  }
}

// ---------- 动画 ----------
function checkAnime() {
  const d = load('anime');
  const eps = d.eps || [];
  if (eps.length < 1000) bad('anime', '-', 'eps', eps.length, '动画条数异常偏少');

  const seen = new Set();
  for (const e of eps) {
    if (seen.has(e.id)) bad('anime', e.id, 'id', e.id, '集数编号重复');
    seen.add(e.id);
    if (!/^(TV|SPTV)\d+$/.test(e.id || '')) bad('anime', e.id, 'id', e.id, '编号应为 TVn / SPTVn');
    if (!e.titleZh) bad('anime', e.id, 'titleZh', e.titleZh, '中文标题为空');
    if (!e.titleJa) bad('anime', e.id, 'titleJa', e.titleJa, '日文标题为空');
    if (!isDate(e.date)) bad('anime', e.id, 'date', e.date, '首播日期应为 YYYY/MM/DD');
    // 收视率列错位时整格会变成「备注」文本；源站偶尔会在同一格附注说明，故只要求以百分比开头
    if (e.rating && e.rating !== '/' && !/^[\d.]+%/.test(e.rating)) {
      bad('anime', e.id, 'rating', e.rating, '收视率格式异常 → 可能列错位');
    }
  }

  const tv = eps.filter(e => e.id.startsWith('TV')).map(e => parseInt(e.id.slice(2), 10)).sort((a, b) => a - b);
  if (tv.length) {
    const missing = [];
    for (let i = 1; i <= tv[tv.length - 1]; i++) if (!tv.includes(i)) missing.push(i);
    if (missing.length) bad('anime', '-', 'id', missing.slice(0, 20).join(','), 'TV 集数不连续（共 ' + missing.length + ' 处）');
  }
}

// ---------- 音乐 ----------
function checkMusic() {
  const d = load('music');
  const songs = d.songs || [];
  if (songs.length < 100) bad('music', '-', 'songs', songs.length, '曲目条数异常偏少');

  for (const s of songs) {
    if (!/^(OP|ED|MT|SPTM|SPC|OSCM|OST)\d+/i.test(s.code || '')) bad('music', s.code, 'code', s.code, '编号格式异常');
    if (!s.titleJa) bad('music', s.code, 'titleJa', s.titleJa, '曲名为空');
    // 演唱者列曾整体拿到「对应剧集」列
    if (/^TV\d|^M\d|对应剧集/.test(s.artist || '')) bad('music', s.code, 'artist', s.artist, '演唱者拿到了剧集列 → 列错位');
    if (/作词|作曲|编曲/.test(s.composer || '')) bad('music', s.code, 'composer', s.composer, '作曲拿到了备注串 → 列错位');
  }
}

// ---------- 站点通用 ----------
function checkCommon() {
  // characters.json 是扁平数组：[{ group, nameZh, nameJa, kana, roman, voice, desc }, ...]
  const chars = load('characters');
  const list = Array.isArray(chars) ? chars : (chars.list || []);
  if (!list.length) { bad('characters', '-', 'list', 0, '角色数据为空'); return; }
  if (list.length < 100) bad('characters', '-', 'list', list.length, '角色条数异常偏少');

  const names = new Set();
  for (const c of list) {
    if (!c.nameZh) bad('characters', c.nameJa || '?', 'nameZh', c.nameZh, '中文名为空');
    if (!c.nameJa) bad('characters', c.nameZh || '?', 'nameJa', c.nameJa, '日文名为空');
    if (!c.group) bad('characters', c.nameZh || '?', 'group', c.group, '角色分组为空');
    if (c.nameZh && names.has(c.nameZh)) bad('characters', c.nameZh, 'nameZh', c.nameZh, '角色重名');
    if (c.nameZh) names.add(c.nameZh);
  }
}

for (const [name, fn] of Object.entries({
  movie: checkMovies, manga: checkManga, anime: checkAnime, music: checkMusic, common: checkCommon,
})) {
  try { fn(); } catch (e) { bad(name, '-', 'EXCEPTION', e.message, '校验过程中抛异常'); }
}

if (problems.length) {
  console.error('数据校验失败，共 ' + problems.length + ' 处：');
  for (const p of problems.slice(0, 60)) {
    console.error(`  [${p.file}] ${p.id} → ${p.field} = ${p.value}\n      ${p.hint}`);
  }
  if (problems.length > 60) console.error('  …… 其余 ' + (problems.length - 60) + ' 处省略');
  process.exit(1);
} else {
  console.log('数据校验通过：movies / manga / anime / music / characters 无异常');
}
