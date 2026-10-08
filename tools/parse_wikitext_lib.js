/**
 * wikitext -> JSON 解析器
 * 抓取 conanpedia 的 wikitext 源，解析成结构化数据供站点使用
 */
const fs = require('fs');

const API = 'https://www.conanpedia.com/api.php';
const UA = { 'User-Agent': 'Mozilla/5.0 (KeNan site builder)' };

async function getWikitext(title) {
  const u = `${API}?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&format=json&formatversion=2`;
  const r = await fetch(u, { headers: UA });
  const j = await r.json();
  return (j?.parse?.wikitext || '').replace(/\r/g, '');
}

/** 去掉 wiki 标记，返回纯文本 */
function plain(s) {
  if (!s) return '';
  let t = s.replace(/\r/g, '');

  // 剥离模板：{{jp|文本}} / {{tt|提示|显示}} 一律保留最后一个参数（显示文本）
  for (let i = 0; i < 10; i++) {
    const before = t;
    t = t.replace(/\{\{([^{}|]*)\|([^{}]*)\}\}/g, (all, name, args) => {
      const parts = args.split('|');
      const last = parts[parts.length - 1];
      // {{tt|说明|显示}} 取显示；{{示亡号|X}} 这类单层无名模板取内容
      return parts.length > 1 ? last : last;
    });
    t = t.replace(/\{\{([^{}|]*)\}\}/g, '$1');
    if (t === before) break;
  }

  return t
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/\[https?:\/\/[^\s\]]+\s*([^\]]*)\]/g, '$1')
    .replace(/'''?/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 去掉单元格属性残留，如 style="..." rowspan="4"，以及切分残留的管道符 */
function cleanCell(s) {
  return (s || '')
    .replace(/\|\s*(rowspan|colspan|style|class|width|align|valign|scope|rel|bgcolor|border)\s*=\s*("[^"]*"|'[^']*'|[^|\s]*)/gi, '')
    .replace(/^\s*(rowspan|colspan|style|class|width|align|valign|scope|rel|bgcolor|border)\s*=\s*("[^"]*"|'[^']*'|[^|\s]*)/i, '')
    .replace(/^\|+\s*/, '')
    .replace(/\|+$/, '')
    .trim();
}

/** 链接目标 */
function linkTarget(s) {
  if (!s) return '';
  const m = s.match(/\[\[([^\]|]*)\|/);
  return m ? m[1] : (s.match(/\[\[([^\]]*)\]\]/) || [])[1] || '';
}

/**
 * 把 wikitable 正文解析成二维数组（raw 单元格，保留 wikitext）。
 * 正确处理：表头 ! 行、数据 | 行、属性行 |-、单元格属性、模板与链接内的管道符。
 */
const ATTR_NAME = 'rowspan|colspan|style|class|width|align|valign|scope|rel|bgcolor|border';
const ATTR_FULL = new RegExp(`^\\s*(?:${ATTR_NAME})\\s*=\\s*("[^"]*"|'[^']*'|[^|\\s]*)\\s*$`, 'i');
const ATTR_PREFIX = new RegExp(`^\\s*((?:${ATTR_NAME})\\s*=\\s*(?:"[^"]*"|'[^']*'|[^|\\s]*)\\s*)+\\|?`, 'i');
/** 取属性文本本身（保留 rowspan= 值） */
function ATTR_PART(buf) {
  const m = buf.match(ATTR_PREFIX);
  return m ? m[0].replace(/\|\s*$/, '') + '|' : '';
}

function parseTable(tableSrc) {
  const lines = tableSrc.replace(/\r/g, '').split('\n');
  const rows = [];
  let cur = null;
  const endRow = () => { if (cur && cur.length) rows.push(cur); cur = null; };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*\|\}/.test(line)) break;                 // 表结束
    const trimmed = line.trim();

    if (/^\|-/.test(trimmed)) { endRow(); continue; } // 行分隔
    if (!trimmed) continue;

    const isHeaderLine = trimmed[0] === '!';
    const isDataLine = trimmed[0] === '|';
    if (!isHeaderLine && !isDataLine) {
      // 续行：追加到当前最后一个单元格
      if (cur && cur.length) cur[cur.length - 1] += '\n' + line;
      continue;
    }

    // 表头行独占一行时作为一个单元格；若同行混排（!a||b）也逐个切开
    const cells = splitCells(line, isHeaderLine);
    if (!cur) cur = [];
    for (const c of cells) cur.push(c);
    if (isHeaderLine) endRow();
  }
  endRow();
  return rows;
}

/** 把一行按顶层分隔符切成单元格 */
function splitCells(line, isHeader) {
  const sep = isHeader ? '!' : '|';
  const parts = [];
  let buf = '';
  let depth = 0;
  let started = false; // 首字符是分隔符，从第二个字符开始扫描
  for (let k = 0; k < line.length; k++) {
    const ch = line[k];
    if (!started) {
      // 跳过行首的分隔符与空白
      if (k === 0 || /\s/.test(ch)) continue;
      started = true;
    }
    const two = line.slice(k, k + 2);
    if (two === '{{' || two === '[[') { depth++; buf += two; k++; continue; }
    if (two === '}}' || two === ']]') { depth--; buf += two; k++; continue; }
    if (ch === sep && depth === 0) {
      // 管道符左侧若整段是属性赋值，它是单元格的修饰而非分隔符。
      // 保留属性文本（供 expandRowspans 读取 rowspan），但不产生独立单元格。
      if (ATTR_FULL.test(buf)) { buf = ATTR_PART(buf) + '|'; continue; }
      parts.push(buf); buf = ''; continue;
    }
    buf += ch;
  }
  parts.push(buf);
  return parts.map(p => p.trim());
}
function c3(s, i) { return s.slice(i, i + 3); }
const c1 = (s, i) => s[i];
const c = c1;

/** 提取所有 wikitable */
function extractTables(wt) {
  const tables = [];
  const re = /^\{\|[^\n]*$/gm;
  let m;
  while ((m = re.exec(wt)) !== null) {
    const start = m.index;
    const end = wt.indexOf('\n|}', start);
    if (end < 0) continue;
    tables.push(wt.slice(start, end + 3));
  }
  return tables;
}

function rowspanOf(cell) {
  const m = (cell || '').match(/rowspan\s*=\s*"?(\d+)/i);
  return m ? parseInt(m[1], 10) : 1;
}

/**
 * 按 rowspan 展开表格，使每行列数一致。
 * 被 rowspan 覆盖的位置填入占位符 '__SPAN__'，由调用方决定沿用上一行还是留空。
 */
function expandRowspans(rows) {
  const out = [];
  // pending[col] = 剩余占用行数；pendingVal[col] = 原始单元格
  const pending = [];
  for (const row of rows) {
    const res = [];
    let col = 0;
    for (const cell of row) {
      while (pending[col] > 0) { res.push('__SPAN__'); col++; }
      res.push(cell);
      const rs = rowspanOf(cell);
      if (rs > 1) { pending[col] = rs - 1; pendingVal[col] = cell; }
      col++;
    }
    const maxLen = Math.max(res.length, ...pending.map((v, i) => (v > 0 ? i + 1 : 0)), 0);
    while (res.length < maxLen) res.push('');
    out.push(res);
    // 递减
    for (let i = 0; i < pending.length; i++) if (pending[i] > 0) pending[i]--;
  }
  return out;
}
/** 把 __SPAN__ 用上一行同列的值向下填充（合并单元格沿用） */
function fillSpans(rows) {
  const out = rows.map(r => r.slice());
  for (let i = 0; i < out.length; i++) {
    for (let j = 0; j < out[i].length; j++) {
      if (out[i][j] === '__SPAN__') {
        let k = i - 1;
        while (k >= 0 && out[k][j] === '__SPAN__') k--;
        out[i][j] = k >= 0 ? out[k][j] : '';
      }
    }
  }
  return out;
}

/** 供 expandRowspans 使用的值表 */
const pendingVal = [];

/** 先清属性再取纯文本 */
function pc(s) { return plain(cleanCell(s)); }

/** 判断是否为表头行（含 ! 标记） */
function isHeaderRow(cells) {
  return cells.some(x => /^\s*!/.test(x));
}

// ============ 剧场版 ============
async function parseMovies() {
  const wt = await getWikitext('名侦探柯南剧场版');
  const out = { regular: [], compilation: [], other: [], intro: '' };

  const secIdx = wt.indexOf('===作品列表===');
  const tables = extractTables(secIdx >= 0 ? wt.slice(secIdx) : wt);
  if (tables[0]) {
    for (const raw of fillSpans(expandRowspans(parseTable(tables[0])))) {
      if (isHeaderRow(raw) || raw.length < 3) continue;
      const cells = raw.map(cleanCell);
      const id = pc(cells[0]);
      if (!/^M\d+$/i.test(id)) continue;
      out.regular.push({
        id,
        titleZh: pc(cells[1]),
        titleJa: pc(cells[2]),
        date: (pc(cells[3]) || '').split(/\s|\n/)[0],
        director: pc(cells[4] || ''),
        writer: pc(cells[5] || ''),
        duration: pc(cells[6] || ''),
        viewers: pc(cells[7] || ''),
        boxOffice: pc(cells[8] || ''),
        rank: pc(cells[9] || ''),
      });
    }
  }

  const grab = (header, bucket) => {
    const i = wt.indexOf(header);
    if (i < 0) return;
    const t = extractTables(wt.slice(i));
    if (!t[0]) return;
    for (const raw of fillSpans(expandRowspans(parseTable(t[0])))) {
      if (isHeaderRow(raw) || raw.length < 3) continue;
      const cells = raw.map(cleanCell);
      const id = pc(cells[0]);
      if (!id) continue;
      out[bucket].push({
        id,
        titleZh: pc(cells[1]),
        titleJa: pc(cells[2]),
        date: (pc(cells[3]) || '').split(/\s|\n/)[0],
        extra: pc(cells.slice(4).join(' | ')),
      });
    }
  };
  grab('===编译剧场版===', 'compilation');
  grab('===其他剧场版===', 'other');

  out.intro = plain(wt.slice(0, secIdx < 0 ? 900 : secIdx)).replace(/^导航图\s*/, '');
  return out;
}

// ============ 原作漫画 ============
async function parseManga() {
  const wt = await getWikitext('名侦探柯南原作漫画');
  const years = [];
  const re = /^===\s*(\d{4})年（([^）]*)）\s*===\s*$/gm;
  let m;
  while ((m = re.exec(wt)) !== null) {
    years.push({ title: m[1], range: m[2], idx: m.index, len: m[0].length });
  }

  const rows = [];
  const caseMap = [];
  for (let i = 0; i < years.length; i++) {
    const start = years[i].idx + years[i].len;
    const end = i + 1 < years.length ? years[i + 1].idx : wt.length;
    const seg = wt.slice(start, end);
    const t = extractTables(seg);
    if (!t[0]) continue;
    let currentCase = '';
    let caseNo = '';
    for (const raw of fillSpans(expandRowspans(parseTable(t[0])))) {
      if (isHeaderRow(raw) || raw.length < 7) continue;
      const cells = raw.map(cleanCell);
      const fileId = pc(cells[3]);
      if (!/^File\.\d+/i.test(fileId)) continue;

      // 案件序号与案件名出现在该案件首条 File 所在行的第 0、1 列；
      // 后续 File 行因 rowspan 填充会重复同样的值，故只在序号变化时更新。
      const link = linkTarget(cells[1]);
      const no = pc(cells[0]).replace(/'/g, '');
      if (/^Case\./i.test(link) && no !== caseNo) {
        currentCase = pc(cells[1]);
        caseNo = no;
      }
      rows.push({
        year: years[i].title,
        caseNo: caseNo || '',
        caseName: currentCase,
        volume: pc(cells[2]),
        file: fileId,
        titleZh: pc(cells[4]),
        titleJa: pc(cells[5]),
        date: pc(cells[6]),
        magazine: pc(cells[7]),
        anime: (pc(cells[8]) || '').replace(/\s*\n\s*/g, ' / ').trim(),
      });
    }
  }
  const introEnd = wt.indexOf('==章节列表==');
  return {
    intro: plain(wt.slice(0, introEnd < 0 ? 1500 : introEnd)).replace(/^导航图\s*/, ''),
    years: years.map(y => y.title),
    rows,
  };
}

// ============ 电视动画 ============
async function parseAnime() {
  const wt = await getWikitext('名侦探柯南电视动画');
  const out = { eps: [] };
  for (const t of extractTables(wt)) {
    for (const raw of fillSpans(expandRowspans(parseTable(t)))) {
      if (isHeaderRow(raw) || raw.length < 5) continue;
      const cells = raw.map(cleanCell);
      const raw0 = pc(cells[0]);
      const id = /^(TV|SPTV)\d+$/i.test(raw0) ? raw0.toUpperCase()
        : (/^\d+$/.test(raw0) ? 'TV' + raw0 : '');
      if (!id) continue;
      out.eps.push({
        id,
        splitNo: pc(cells[1]),
        titleZh: pc(cells[2]),
        titleJa: pc(cells[3]),
        date: (pc(cells[4]) || '').split(/\s|\n/)[0],
        rating: pc(cells[5] || ''),
        manga: pc(cells[6] || ''),
        note: pc(cells[7] || ''),
      });
    }
  }
  // 去重（同一集可能在多个表出现）
  const seen = new Set();
  out.eps = out.eps.filter(e => !seen.has(e.id) && seen.add(e.id));
  return out;
}

// ============ 音乐 ============
async function parseMusic() {
  const wt = await getWikitext('名侦探柯南音乐');
  const out = { songs: [] };
  for (const t of extractTables(wt)) {
    for (const raw of fillSpans(expandRowspans(parseTable(t)))) {
      if (isHeaderRow(raw) || raw.length < 3) continue;
      const cells = raw.map(cleanCell);
      const code = pc(cells[0]);
      if (!/^(OP|ED|MT|SPTM|SPC|OSCM|OST)\d+/i.test(code)) continue;
      out.songs.push({
        code,
        titleJa: pc(cells[1]),
        artist: pc(cells[2]),
        note: pc(cells.slice(3).join(' | ')),
      });
    }
  }
  const seen = new Set();
  out.songs = out.songs.filter(s => !seen.has(s.code + s.titleJa) && seen.add(s.code + s.titleJa));
  return out;
}

module.exports={parseTable,expandRowspans,fillSpans,getWikitext,plain,cleanCell,pc,linkTarget,extractTables,rowspanOf};
