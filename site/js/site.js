/* ===========================================================
   柯南的世界 — 站点公共逻辑
   =========================================================== */

/** 站点信息 */
const SITE = {
  name: '柯南的世界',
  tagline: 'CONAN WORLD',
};

/** 导航结构 */
const NAV = [
  {
    label: '导航',
    items: [
      { text: '首页', href: 'index.html' },
      { text: '原作漫画', href: 'manga.html' },
      { text: '电视动画', href: 'anime.html' },
      { text: '剧场版', href: 'movies.html' },
      { text: '角色', href: 'characters.html' },
      { text: '音乐', href: 'music.html' },
    ],
  },
  {
    label: '关于',
    items: [
      { text: '本站说明', href: 'about.html' },
      { text: '数据来源', href: 'about.html#source' },
    ],
  },
];

/** 侧栏分组（与原站导航一致） */
const SIDEBAR_SECTIONS = [
  {
    title: '作品',
    links: [
      { text: '首页', href: 'index.html', key: 'index' },
      { text: '原作漫画', href: 'manga.html', key: 'manga' },
      { text: '电视动画', href: 'anime.html', key: 'anime' },
      { text: '剧场版', href: 'movies.html', key: 'movies' },
      { text: '音乐', href: 'music.html', key: 'music' },
    ],
  },
  {
    title: '资料',
    links: [
      { text: '角色名录', href: 'characters.html', key: 'characters' },
      { text: '本站说明', href: 'about.html', key: 'about' },
    ],
  },
];

/** 页脚链接 */
const FOOTER_LINKS = [
  { text: '首页', href: 'index.html' },
  { text: '原作漫画', href: 'manga.html' },
  { text: '电视动画', href: 'anime.html' },
  { text: '剧场版', href: 'movies.html' },
  { text: '角色名录', href: 'characters.html' },
  { text: '音乐', href: 'music.html' },
  { text: '本站说明', href: 'about.html' },
];

/** HTML 转义 */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** 当前页面 key */
function currentKey() {
  const f = location.pathname.split('/').pop() || 'index.html';
  return f === '' ? 'index.html' : f;
}

/** 渲染顶部导航 */
function renderNavbar() {
  const el = document.getElementById('navbar');
  if (!el) return;
  const menus = NAV.map(g => `
    <div class="nav-drop">
      <button type="button">${esc(g.label)}</button>
      <ul class="menu">
        ${g.items.map(i => `<li><a href="${i.href}">${esc(i.text)}</a></li>`).join('')}
      </ul>
    </div>`).join('');

  el.innerHTML = `
    <div class="nav-left">
      <div class="nav-menus" id="navMenus">${menus}</div>
      <a id="site-brand" href="index.html" title="${esc(SITE.name)}">
        <img src="assets/img/conan.png" alt="">
        <span class="txt">${esc(SITE.name)}</span>
      </a>
      <button class="nav-toggle" id="navToggle" aria-label="菜单">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5c636e" stroke-width="2" stroke-linecap="round">
          <path d="M3 6h18M3 12h18M3 18h18"/>
        </svg>
      </button>
    </div>
    <div class="nav-right">
      <form id="search-form" autocomplete="off">
        <input type="search" id="search-input" placeholder="搜索柯南的世界…" aria-label="站内搜索">
        <button type="submit" aria-label="搜索">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
          </svg>
        </button>
      </form>
    </div>`;

  const toggle = document.getElementById('navToggle');
  const menuBox = document.getElementById('navMenus');
  if (toggle && menuBox) toggle.addEventListener('click', () => menuBox.classList.toggle('open'));

  const form = document.getElementById('search-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const q = document.getElementById('search-input').value.trim();
    if (q) location.href = 'search.html?q=' + encodeURIComponent(q);
  });
}

/** 渲染侧栏 */
function renderSidebar() {
  const el = document.getElementById('sidebar');
  if (!el) return;
  const cur = currentKey();
  const sections = SIDEBAR_SECTIONS.map(sec => `
    <div class="side-title">${esc(sec.title)}</div>
    <ul class="side-nav">
      ${sec.links.map(l => `<li><a href="${l.href}" class="${l.href === cur ? 'active' : ''}">${esc(l.text)}</a></li>`).join('')}
    </ul>`).join('');
  el.innerHTML = `
    <div class="side-logo"><a href="index.html"><img src="assets/img/conan.png" alt="${esc(SITE.name)}"></a></div>
    ${sections}`;
}

/** 渲染页脚 */
function renderFooter() {
  const el = document.getElementById('footer');
  if (!el) return;
  el.innerHTML = `
    <div class="brand-big">${esc(SITE.name)}</div>
    <div class="flinks">
      ${FOOTER_LINKS.map(l => `<a href="${l.href}">${esc(l.text)}</a>`).join('')}
    </div>
    <div class="credit">
      本站为名侦探柯南资料站复刻作品，<strong>非官方粉丝站</strong>，仅供学习交流。<br>
      条目数据整理自 <a href="https://www.conanpedia.com/" target="_blank" rel="noopener">柯南百科</a>
      （银色子弹 SBSUB 出品），依
      <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a> 授权。<br>
      角色头像版权归<strong>青山刚昌</strong>老师及相关权利方所有，不在 CC 授权范围内。<br>
      如权利方认为使用不妥，请联系删除。
    </div>`;
}

/** 页面初始化 */
function initPage() {
  renderNavbar();
  renderSidebar();
  renderFooter();
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

/** 加载 JSON 数据（带缓存，避免重复请求） */
const _dataCache = {};
async function loadData(name) {
  if (_dataCache[name]) return _dataCache[name];
  try {
    const r = await fetch(`data/${name}.json`);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    _dataCache[name] = await r.json();
  } catch (e) {
    console.error('数据加载失败:', name, e);
    _dataCache[name] = null;
  }
  return _dataCache[name];
}

/** 高亮匹配文本 */
function mark(text, q) {
  if (!q) return esc(text);
  const safe = esc(text);
  const needle = esc(q);
  if (!needle) return safe;
  const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return safe.replace(re, m => `<mark>${m}</mark>`);
}

document.addEventListener('DOMContentLoaded', initPage);