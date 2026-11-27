/**
 * wikitext -> JSON 解析器（命令行入口）
 * 抓取 conanpedia 的 wikitext 源，解析成结构化数据供站点使用
 *
 * 通用解析逻辑（表结构、rowspan 展开、模板剥离）都在 parse_wikitext_lib.js 里，
 * 这里只保留四个数据集各自的字段映射与写盘流程，避免两份实现静默漂移。
 *
 * 用法：
 *   node tools/parse_wikitext.js              # 全量重抓四个数据集
 *   node tools/parse_wikitext.js movies       # 只重抓指定数据集
 */
const fs = require('fs');
const {
  getWikitext, plain, cleanCell, pc, linkTarget,
  extractTables, parseTable, expandRowspans, fillSpans,
  isHeaderRow, cleanIntro,
} = require('./parse_wikitext_lib.js');

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

  out.intro = cleanIntro(wt.slice(0, secIdx < 0 ? 900 : secIdx));
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
    intro: cleanIntro(wt.slice(0, introEnd < 0 ? 1500 : introEnd)),
    years: years.map(y => y.title),
    rows,
  };
}

// ============ 电视动画 ============
/**
 * 根据表头识别动画表的列索引。
 * 常规集数表为「原版集数/拆分版集数/中文标题/日文标题/首播时间/首播家庭收视率/对应漫画/备注」；
 * 特别篇表（SPTV）为「编号/中文标题/日文标题/首播时间/首播档期/播出时长/首播家庭收视率/备注」，
 * 少了「拆分版集数」，按固定列位会让标题、日期、收视率整体前移一列。
 * @param {string} tableSrc 单张表的 wikitext 源码
 * @returns {Object|null} 列索引映射；必需列识别不全时返回 null，由调用方回退
 */
function animeColumns(tableSrc) {
  const heads = tableSrc.replace(/\r/g, '').split('\n')
    .filter(line => /^\s*!/.test(line))
    .map(line => pc(line.replace(/^\s*!/, '')));
  if (heads.length < 4) return null;

  const find = (...keys) => heads.findIndex(h => keys.some(k => h.includes(k)));
  const cols = {
    id: find('原版集数', '编号'),
    splitNo: find('拆分版'),
    titleZh: find('中文标题'),
    titleJa: find('日文标题'),
    date: find('首播时间'),
    rating: find('收视率'),
    manga: find('对应漫画'),
    note: find('备注'),
  };
  // 编号、双语标题、首播时间缺一不可；拆分版/收视率/漫画/备注允许缺列（SPTV 表没有拆分版与对应漫画）
  const required = ['id', 'titleZh', 'titleJa', 'date'];
  return required.every(k => cols[k] >= 0) ? cols : null;
}

async function parseAnime() {
  const wt = await getWikitext('名侦探柯南电视动画');
  const out = { eps: [] };
  for (const t of extractTables(wt)) {
    // 优先按表头定位；识别失败时回退到旧版固定列位，保证仍然可用
    const cols = animeColumns(t) || {
      id: 0, splitNo: 1, titleZh: 2, titleJa: 3, date: 4, rating: 5, manga: 6, note: 7,
    };
    for (const raw of fillSpans(expandRowspans(parseTable(t)))) {
      if (isHeaderRow(raw) || raw.length < 3) continue;
      const cells = raw.map(cleanCell);
      // 按映射取列；缺列时返回空串
      const at = key => (cols[key] >= 0 ? pc(cells[cols[key]] || '') : '');
      const raw0 = at('id');
      const id = /^(TV|SPTV)\d+$/i.test(raw0) ? raw0.toUpperCase()
        : (/^\d+$/.test(raw0) ? 'TV' + raw0 : '');
      if (!id) continue;
      out.eps.push({
        id,
        splitNo: at('splitNo'),
        titleZh: at('titleZh'),
        titleJa: at('titleJa'),
        date: (at('date') || '').split(/\s|\n/)[0],
        rating: at('rating'),
        manga: at('manga'),
        note: at('note'),
      });
    }
  }
  // 去重（同一集可能在多个表出现）
  const seen = new Set();
  out.eps = out.eps.filter(e => !seen.has(e.id) && seen.add(e.id));
  return out;
}

// ============ 音乐 ============
/**
 * 根据表头文本识别音乐表的列索引。
 * 背景：上游表格实际列为「编号/曲名/对应剧集/主创、演唱/作词/作曲/编曲」，
 * 旧版按固定列位取 cells[2] 当演唱者，实际取到的是「对应剧集」，导致字段整体错位。
 * 改为按表头关键词定位后，上游插入新列也不会再静默错位。
 * @param {string} tableSrc 单张表的 wikitext 源码
 * @returns {Object|null} 列索引映射；关键列识别不全时返回 null，由调用方回退
 */
function musicColumns(tableSrc) {
  // 表头由多行 "!列名" 组成，逐行取纯文本（已去掉 style 属性与模板）
  const heads = tableSrc.replace(/\r/g, '').split('\n')
    .filter(line => /^\s*!/.test(line))
    .map(line => pc(line.replace(/^\s*!/, '')));
  if (heads.length < 4) return null;

  // 返回第一个命中关键词的列下标，找不到返回 -1
  const find = (...keys) => heads.findIndex(h => keys.some(k => h.includes(k)));
  const cols = {
    code: find('编号'),
    title: find('曲名', '歌名'),
    range: find('对应剧集', '剧集'),
    artist: find('主创', '演唱'),
    lyricist: find('作词'),
    composer: find('作曲'),
    arranger: find('编曲'),
  };
  // 编号、曲名、演唱者、三项创作信息缺一不可，否则回退到旧列位
  const required = ['code', 'title', 'artist', 'lyricist', 'composer', 'arranger'];
  return required.every(k => cols[k] >= 0) ? cols : null;
}

/**
 * 拆分原始表格里的「日文原名 + 中文译名」混排标题。
 * 规则：从第 2 个词开始，找到第一个「含汉字且不含假名」的词作为中文译名起点。
 * @param {string} raw 混排标题
 * @returns {{titleJa:string,titleZh:string}}
 */
function splitMusicTitle(raw) {
  const s = String(raw || '').trim();
  const toks = s.split(/\s+/);
  const hasHan = w => /[\u4e00-\u9fff]/.test(w);
  const hasKana = w => /[\u3040-\u30ff]/.test(w);
  for (let i = 1; i < toks.length; i++) {
    if (hasHan(toks[i]) && !hasKana(toks[i])) {
      return { titleJa: toks.slice(0, i).join(' '), titleZh: toks.slice(i).join(' ') };
    }
  }
  return { titleJa: s, titleZh: '' };
}

async function parseMusic() {
  const wt = await getWikitext('名侦探柯南音乐');
  const out = { songs: [] };
  for (const t of extractTables(wt)) {
    // 优先按表头定位；识别失败时回退到旧版固定列位，保证仍然可用
    const cols = musicColumns(t) || {
      code: 0, title: 1, range: 2, artist: 3, lyricist: 4, composer: 5, arranger: 6,
    };
    for (const raw of fillSpans(expandRowspans(parseTable(t)))) {
      if (isHeaderRow(raw) || raw.length < 3) continue;
      const cells = raw.map(cleanCell);
      const code = pc(cells[cols.code]);
      if (!/^(OP|ED|MT|SPTM|SPC|OSCM|OST)\d+/i.test(code)) continue;

      const { titleJa, titleZh } = splitMusicTitle(pc(cells[cols.title]));
      out.songs.push({
        code,
        titleJa,
        titleZh,
        artist: pc(cells[cols.artist] || ''),
        range: pc(cells[cols.range] || ''),
        lyricist: pc(cells[cols.lyricist] || ''),
        composer: pc(cells[cols.composer] || ''),
        arranger: pc(cells[cols.arranger] || ''),
      });
    }
  }
  const seen = new Set();
  out.songs = out.songs.filter(s => !seen.has(s.code + s.titleJa) && seen.add(s.code + s.titleJa));
  return out;
}

(async () => {
  fs.mkdirSync('site/data', { recursive: true });
  const jobs = { movies: parseMovies, manga: parseManga, anime: parseAnime, music: parseMusic };
  // 支持只重跑指定数据集：node tools/parse_wikitext.js movies
  // 不传参数时全量重抓（抓到什么写什么，会覆盖 site/data/）。
  const only = process.argv.slice(2).filter(a => jobs[a]);
  const targets = only.length
    ? Object.entries(jobs).filter(([name]) => only.includes(name))
    : Object.entries(jobs);
  for (const [name, fn] of targets) {
    try {
      const d = await fn();
      fs.writeFileSync(`site/data/${name}.json`, JSON.stringify(d));
      const n = d.regular?.length || d.rows?.length || d.eps?.length || d.songs?.length;
      console.log('OK', name, 'items =', n);
    } catch (e) {
      console.log('ERR', name, e.message);
    }
  }
})();