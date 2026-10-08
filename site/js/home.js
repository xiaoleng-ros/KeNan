/* ===========================================================
   柯南的世界 — 首页
   =========================================================== */

/** 12 个栏目入口（对应原站首页导航块） */
const ENTRIES = [
  { text: '原作漫画', href: 'manga.html' },
  { text: '电视动画', href: 'anime.html' },
  { text: '剧场版', href: 'movies.html' },
  { text: 'OVA', href: 'movies.html' },
  { text: '真人版', href: 'movies.html' },
  { text: '角色', href: 'characters.html' },
  { text: '音乐', href: 'music.html' },
  { text: '制作人员', href: 'about.html' },
  { text: '配音演员', href: 'characters.html' },
  { text: '游戏', href: 'about.html' },
  { text: '番外作品', href: 'manga.html' },
  { text: '关联作品', href: 'about.html' },
];

/** 卡片配色 */
const CARD_STYLE = {
  manga: 'u-green',
  anime: 'u-yellow',
  movie: 'u-red',
  music: 'u-blue',
  oom: 'u-purple',
  other: 'u-black',
};

/** 资讯行 HTML */
function renderLine(l) {
  const cls = [
    l.week ? 'news-week' : '',
    l.today ? 'news-today' : '',
  ].filter(Boolean).join(' ');
  const left = l.date
    ? `<span class="news-date">${esc(l.date)}</span>${l.tag ? ' <span class="news-lc">' + esc(l.tag) + '</span>' : ''}`
    : esc(l.left);
  return `
    <div class="news-line ${cls}">
      <span class="news-left">${left}</span>
      <span class="news-right">${esc(l.right)}</span>
    </div>`;
}

/** 单个卡片 HTML */
function renderCard(c) {
  if (!c) return '';
  const body = c.lines && c.lines.length
    ? c.lines.map(renderLine).join('')
    : `<ul>${(c.bullets || []).map(b => `<li>${esc(b)}</li>`).join('')}</ul>`;
  const note = c.note ? `<div class="note">${esc(c.note)}</div>` : '';
  const arrow = c.link ? `<a class="card-arrow" href="${c.link}" title="${esc(c.title)}">→</a>` : '';
  return `
    <div class="card">
      <span class="card-title ${CARD_STYLE[c.key] || ''}">${esc(c.title)}</span>
      ${arrow}
      ${body}${note}
    </div>`;
}

(async () => {
  const root = document.getElementById('homeRoot');
  const d = await loadData('home');
  if (!d) { root.innerHTML = '<p>首页数据加载失败。</p>'; return; }

  // 左侧资讯：漫画 / 剧场版 / 关联作品
  const leftCards = ['manga', 'movie', 'oom'].map(k => renderCard(d[k])).join('');
  // 右侧资讯：动画 / 音乐 / 出版物
  const rightCards = ['anime', 'music', 'other'].map(k => renderCard(d[k])).join('');

  const entries = ENTRIES.map(e => `<a href="${e.href}">${esc(e.text)}</a>`).join('');

  const dyk = d.dyk ? `
    <div class="top-link-col">
      <p class="top-link-title">${esc(d.dyk.title)}</p>
      <ul>${d.dyk.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>` : '';

  const star = d.star ? `
    <div class="top-link-col">
      <p class="top-link-title">${esc(d.star.title)}</p>
      <img class="top-featured-img" src="assets/img/featured.jpg" alt="精选条目" loading="lazy">
      <div style="font-size:.88rem">${esc(d.star.text)}</div>
      ${d.star.quote ? `<div class="top-quote">${esc(d.star.quote)}</div>` : ''}
    </div>` : '';

  const linkCols = (d.linkCols || []).map(c => `
    <div class="top-link-col">
      <p class="top-link-title">${esc(c.title)}</p>
      <ul>${c.items.map(i => `<li><a href="${i.href}">${esc(i.text)}</a></li>`).join('')}</ul>
    </div>`).join('');

  root.innerHTML = `
    <div class="top-logo">
      <img src="assets/img/conan.png" alt="江户川柯南">
      <span>柯南的世界</span>
    </div>

    <div class="top-header">
      <div class="top-date"><span class="day">${esc(d.day)}</span> ${esc(d.month)}</div>
      <div class="top-greeting"><a href="${esc(d.greetingLink || 'anime.html')}">${esc(d.greetingText || '')}</a></div>
    </div>

    <div class="top-grid">
      <div class="top-nav-col">
        <div class="top-nav-inner">
          <div class="top-nav-circle"><img src="assets/img/conan.png" alt="柯南"></div>
          <div class="top-nav-blocks">${entries}</div>
        </div>
      </div>

      <div class="top-news-col">
        <div class="top-news-flex">
          <div class="top-news-left">${leftCards}</div>
          <div class="top-news-right">${rightCards}</div>
        </div>
      </div>

      <div class="top-side-col">
        <div class="top-welcome">
          <span class="card-title u-blue">${esc(d.welcome?.title || '关于本站')}</span>
          <div style="margin-top:6px;font-size:.88rem">${esc(d.welcome?.text || '')}</div>
        </div>
        <div class="top-side">${dyk}${star}${linkCols}</div>
      </div>
    </div>`;
})();