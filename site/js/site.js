/* ===========================================================
   柯南的世界 — 站点公共逻辑
   =========================================================== */

/** 站点信息 */
const SITE = {
  name: '柯南的世界',
  tagline: 'CONAN WORLD',
};

/**
 * 站点页面单一数据源：顶部导航、侧栏、页脚均由这里派生，
 * 新增页面只改这一处，避免文案/链接四处不同步。
 */
const PAGES = [
  { key: 'index', text: '首页', href: 'index.html', section: '作品', nav: true },
  { key: 'manga', text: '原作漫画', href: 'manga.html', section: '作品', nav: true },
  { key: 'anime', text: '电视动画', href: 'anime.html', section: '作品', nav: true },
  { key: 'movies', text: '剧场版', href: 'movies.html', section: '作品', nav: true },
  { key: 'music', text: '音乐', href: 'music.html', section: '作品', nav: true },
  { key: 'characters', text: '角色', sideText: '角色名录', footerText: '角色名录', href: 'characters.html', section: '资料', nav: true },
  { key: 'about', text: '本站说明', href: 'about.html', section: '资料', nav: false },
];

/** 导航结构（由 PAGES 派生） */
const NAV = [
  {
    label: '导航',
    items: PAGES.filter(p => p.nav).map(p => ({ text: p.text, href: p.href })),
  },
  {
    label: '关于',
    items: [
      { text: '本站说明', href: 'about.html' },
      { text: '数据来源', href: 'about.html#source' },
    ],
  },
];

/** 侧栏分组（由 PAGES 派生，与原站导航一致） */
const SIDEBAR_SECTIONS = ['作品', '资料'].map(title => ({
  title,
  links: PAGES.filter(p => p.section === title)
    .map(p => ({ text: p.sideText || p.text, href: p.href })),
}));

/** 页脚链接（由 PAGES 派生） */
const FOOTER_LINKS = PAGES.map(p => ({ text: p.footerText || p.text, href: p.href }));

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
      <button type="button" aria-haspopup="true" aria-expanded="false">${esc(g.label)}</button>
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
  if (toggle && menuBox) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      const open = menuBox.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // 下拉菜单：桌面点击/键盘聚焦均可展开，移动端点击逐级展开
  const drops = [...el.querySelectorAll('.nav-drop')];
  /** 关闭除 except 之外的菜单，并同步 aria-expanded */
  function closeDrops(except) {
    for (const d of drops) {
      if (d === except) continue;
      d.classList.remove('open');
      const b = d.querySelector('button');
      if (b) b.setAttribute('aria-expanded', 'false');
    }
  }
  for (const d of drops) {
    const btn = d.querySelector('button');
    if (!btn) continue;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = d.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      closeDrops(d);
    });
    d.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      d.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    });
  }
  document.addEventListener('click', () => closeDrops());

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
  el.setAttribute('role', 'navigation');
  el.setAttribute('aria-label', '站点导航');
  const sections = SIDEBAR_SECTIONS.map(sec => `
    <div class="side-title">${esc(sec.title)}</div>
    <ul class="side-nav">
      ${sec.links.map(l => `<li><a href="${l.href}" class="${l.href === cur ? 'active' : ''}">${esc(l.text)}</a></li>`).join('')}
    </ul>`).join('');
  el.innerHTML = `
    <div class="side-logo"><a href="index.html"><img src="assets/img/conan.png" width="52" height="52" alt="${esc(SITE.name)}"></a></div>
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

/** 加载 JSON 数据（成功才缓存，失败不缓存以便重试） */
const _dataCache = {};
async function loadData(name) {
  if (_dataCache[name]) return _dataCache[name];
  try {
    const r = await fetch(`data/${name}.json`, { cache: 'no-cache' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    _dataCache[name] = await r.json();
    return _dataCache[name];
  } catch (e) {
    // 失败不写入缓存：刷新或再次进入页面时可以重新请求
    console.error('数据加载失败:', name, e);
    return null;
  }
}

/**
 * 防抖：停止触发 wait 毫秒后执行，统一全站输入筛选节奏。
 * @param {Function} fn 目标函数
 * @param {number} wait 等待毫秒数
 * @returns {Function} 包装后的函数
 */
function debounce(fn, wait = 180) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/**
 * 高亮匹配文本。
 * 先按原文切分再逐段转义，避免对已转义的 HTML 实体（如 &amp;）内部再次匹配。
 * @param {*} text 原文
 * @param {string} q 关键词
 * @returns {string} 可插入 innerHTML 的 HTML
 */
function mark(text, q) {
  const src = String(text == null ? '' : text);
  const needle = String(q == null ? '' : q).trim();
  if (!needle) return esc(src);

  const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(src)) !== null) {
    // 空匹配时手动前进，防止正则死循环
    if (m[0] === '') { re.lastIndex++; continue; }
    out += esc(src.slice(last, m.index)) + '<mark>' + esc(m[0]) + '</mark>';
    last = m.index + m[0].length;
  }
  return out + esc(src.slice(last));
}

document.addEventListener('DOMContentLoaded', initPage);