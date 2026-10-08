/**
 * 从首页渲染后的 HTML 提取资讯数据 -> site/data/home.json
 * 首页用的是模板渲染，直接解析成品 HTML 比解析 wikitext 更可靠。
 */
const fs = require('fs');
const path = require('path');
const h = fs.readFileSync(path.join(__dirname,'..','_old','conan_page.html'),'utf8');

/** 去标签取纯文本，保留链接 */
function stripTags(s) {
  return s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

const out = {};

// ---- 日期问候 ----
const dm = h.match(/top-header-date[^>]*>[\s\S]*?top-header-date-day">(\d+)<\/span>\s*<span class="top-header-date-month">(\w+)<\/span>/);
out.day = dm ? dm[1] : '';
out.month = dm ? dm[2] : '';

// ---- 问候语（含链接） ----
const greet = h.match(/top-header-greeting">([\s\S]*?)<\/div>/);
out.greeting = greet ? greet[1].replace(/<br\s*\/?>/gi, ' ').trim() : '';

// ---- 资讯卡片 ----
const cardRe = /<div class="top-news-(\w+) top-card">([\s\S]*?)<div class="top-card-content">([\s\S]*?)<\/div><\/div>/g;
const seen = new Set();
let cm;
while ((cm = cardRe.exec(h)) !== null) {
  const key = cm[1];
  if (seen.has(key)) continue;   // 宽屏/窄屏各渲染一份，取第一份
  seen.add(key);
  const body = cm[3];

  const titleM = cm[2].match(/top-card-title">([^<]*)</);
  const linkM = cm[2].match(/top-card-link[^>]*>\s*<a href="([^"]+)"/);
  const item = {
    key,
    title: titleM ? titleM[1].trim() : '',
    link: linkM ? decodeURIComponent(linkM[1]) : '',
    lines: [],
    bullets: [],
  };

  // news-line 结构
  const lineRe = /<div class="(news-line[^"]*)">([\s\S]*?)<\/div>/g;
  let lm;
  while ((lm = lineRe.exec(body)) !== null) {
    const inner = lm[2];
    const d = inner.match(/news-date">([^<]*)</);
    const lc = inner.match(/news-lc">([\s\S]*?)<\/span>/);
    const left = inner.match(/news-left[^"]*">([\s\S]*?)<span class="news-right/);
    const right = inner.match(/news-right[^"]*">([\s\S]*?)<\/span>/);
    item.lines.push({
      cls: lm[1].replace(/^news-line\s*/, ''),
      date: d ? d[1] : '',
      tag: lc ? stripTags(lc[1]) : '',
      left: left ? stripTags(left[1]) : '',
      right: right ? stripTags(right[1]) : '',
      today: /news-today/.test(lm[1]),
      week: /news-week/.test(lm[1]),
    });
  }

  // <ul><li> 结构
  const liRe = /<li>([\s\S]*?)<\/li>/g;
  let im;
  while ((im = liRe.exec(body)) !== null) {
    item.bullets.push(stripTags(im[1]));
  }

  const noteM = body.match(/<small>([\s\S]*?)<\/small>/);
  if (noteM) item.note = stripTags(noteM[1]);

  out[key] = item;
}

// ---- 你知道吗 ----
const dyk = h.match(/<div class="top-dyk">([\s\S]*?)<\/div><div class="top-star">/);
if (dyk) {
  const t = dyk[1];
  const titleM = t.match(/top-title[^>]*>[\s\S]*?>([^<]*)</);
  const lis = [...t.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => stripTags(m[1]));
  out.dyk = { title: titleM ? titleM[1].trim() : '你知道吗', items: lis };
}

// ---- 精选条目 ----
const star = h.match(/<div class="top-star">([\s\S]*?)<\/div><\/div><\/div>/);
if (star) {
  const t = star[1];
  const imgM = t.match(/data-src="([^"]+)"/);
  const pM = t.match(/<p>([\s\S]*?)<\/p>/);
  const qM = t.match(/<td>([\s\S]*?)<\/td>\s*<\/tr><\/tbody>/);
  const titleM = t.match(/top-title[^>]*>[\s\S]*?>([^<]*)</);
  out.star = {
    title: titleM ? titleM[1].trim() : '精选条目',
    img: imgM ? 'https://www.conanpedia.com' + imgM[1] : '',
    text: pM ? stripTags(pM[1]) : '',
    quote: qM ? stripTags(qM[1]) : '',
  };
}

// ---- 加入我们 ----
const wel = h.match(/<div class="top-welcome">([\s\S]*?)<\/div><\/div>/);
if (wel) {
  out.welcome = {
    title: (wel[1].match(/top-title[^>]*>[\s\S]*?>([^<]*)</) || [])[1] || '',
    text: stripTags(wel[1]),
  };
}

// ---- 常用链接 ----
const linkCols = [...h.matchAll(/<div class="top-link">([\s\S]*?)<\/div><\/div>/g)].map(m => {
  const t = m[1];
  const title = (t.match(/top-link-title">[\s\S]*?<\/span>([^<]*)</) || [])[1] || '';
  const icon = (t.match(/material-icons-round">([^<]*)</) || [])[1] || '';
  const items = [...t.matchAll(/<li><a href="([^"]+)"[^>]*>([^<]*)</g)].map(x => ({
    href: decodeURIComponent(x[1]),
    text: x[2].trim(),
  }));
  return { icon, title: title.trim(), items };
});
out.linkCols = linkCols;

fs.writeFileSync('site/data/home.json', JSON.stringify(out, null, 1));

console.log('cards:', [...seen].join(','));
console.log('day/month:', out.day, out.month);
console.log('manga lines:', out.manga?.lines.length, '| anime lines:', out.anime?.lines.length);
console.log('music lines:', out.music?.lines.length);
console.log('movie bullets:', out.movie?.bullets.length);
console.log('dyk items:', out.dyk?.items.length);
console.log('star:', out.star?.title, '|', (out.star?.text || '').slice(0, 40));
console.log('linkCols:', linkCols.map(c => c.title + '(' + c.items.length + ')').join(', '));
console.log('welcome:', (out.welcome?.text || '').slice(0, 80));