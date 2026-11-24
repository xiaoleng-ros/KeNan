/* ===========================================================
   柯南的世界 — 站内搜索
   =========================================================== */
(async () => {
  const root = document.getElementById('pageRoot');

  const q = new URLSearchParams(location.search).get('q') || '';
  const sub = document.getElementById('pageSub');
  if (sub) sub.textContent = q ? `“${q}” 的搜索结果` : '输入关键词，检索角色、动画、漫画、剧场版与音乐。';

  const state = { q, type: 'all', shown: 60 };
  let store = null;
  let loading = null;

  /**
   * 按需加载：没有关键词时不请求任何 JSON，
   * 首次检索时才并行拉取，减少空白搜索页的 520KB 流量。
   */
  function ensureData() {
    if (store) return Promise.resolve(store);
    if (!loading) {
      loading = Promise.all([
        loadData('manga'), loadData('anime'), loadData('movies'), loadData('music'), loadData('characters'),
      ]).then(([manga, anime, movies, music, chars]) => {
        store = { manga, anime, movies, music, chars };
        return store;
      });
    }
    return loading;
  }

  if (q) await ensureData();

  const TYPES = [
    { key: 'all', label: '全部' },
    { key: 'char', label: '角色' },
    { key: 'anime', label: '动画' },
    { key: 'manga', label: '漫画' },
    { key: 'movie', label: '剧场版' },
    { key: 'music', label: '音乐' },
  ];

  /** 执行检索，返回分组结果 */
  function run(query) {
    const s = query.trim().toLowerCase();
    if (!s) return [];
    const has = (...vals) => vals.some(v => String(v || '').toLowerCase().includes(s));
    const { chars, anime, manga, movies, music } = store || {};
    const res = [];

    if (state.type === 'all' || state.type === 'char') {
      for (const c of (chars || [])) {
        if (has(c.nameZh, c.nameJa, c.voice, c.desc)) {
          res.push({ type: 'char', title: c.nameZh, sub: c.nameJa, extra: `${c.group} · 声优 ${c.voice}`, href: 'characters.html?name=' + encodeURIComponent(c.nameZh) });
        }
      }
    }
    if (state.type === 'all' || state.type === 'anime') {
      for (const e of (anime?.eps || [])) {
        if (has(e.id, e.titleZh, e.titleJa)) {
          res.push({ type: 'anime', title: `${e.id} ${e.titleZh}`, sub: e.titleJa, extra: `首播 ${e.date}`, href: 'anime.html?id=' + encodeURIComponent(e.id) });
        }
      }
    }
    if (state.type === 'all' || state.type === 'manga') {
      for (const m of (manga?.rows || [])) {
        if (has(m.file, m.titleZh, m.titleJa, m.caseName)) {
          res.push({ type: 'manga', title: `${m.file} ${m.titleZh}`, sub: m.titleJa, extra: `${m.year} · ${m.caseName}`, href: 'manga.html?file=' + encodeURIComponent(m.file) });
        }
      }
    }
    if (state.type === 'all' || state.type === 'movie') {
      for (const m of (movies?.regular || [])) {
        if (has(m.id, m.titleZh, m.titleJa, m.director, m.writer)) {
          res.push({ type: 'movie', title: `${m.id} ${m.titleZh}`, sub: m.titleJa, extra: `${m.date} · 导演 ${m.director}`, href: 'movies.html?id=' + encodeURIComponent(m.id) });
        }
      }
    }
    if (state.type === 'all' || state.type === 'music') {
      for (const s2 of (music?.songs || [])) {
        if (has(s2.code, s2.titleJa, s2.titleZh, s2.artist)) {
          res.push({
            type: 'music',
            title: `${s2.code} ${s2.titleZh || s2.titleJa}`,
            sub: s2.titleZh ? s2.titleJa : '',
            extra: `演唱 ${s2.artist}`,
            href: 'music.html?code=' + encodeURIComponent(s2.code),
          });
        }
      }
    }
    // 相关度排序：标题完全匹配 > 标题前缀 > 标题包含 > 副标题包含 > 仅正文命中
    const rank = r => {
      const t = String(r.title || '').toLowerCase();
      if (t === s) return 0;
      if (t.startsWith(s)) return 1;
      if (t.includes(s)) return 2;
      if (String(r.sub || '').toLowerCase().includes(s)) return 3;
      return 4;
    };
    return res
      .map((r, i) => ({ r, i, k: rank(r) }))
      .sort((a, b) => a.k - b.k || a.i - b.i)
      .map(x => x.r);
  }

  const TYPE_LABEL = { char: '角色', anime: '动画', manga: '漫画', movie: '剧场版', music: '音乐' };
  const MAX = 60;

  function render() {
    const tabs = TYPES.map(t => `
      <button class="s-tab ${state.type === t.key ? 'on' : ''}" data-k="${t.key}">${t.label}</button>`).join('');

    root.innerHTML = `
      <form id="sForm" style="display:flex;gap:10px;margin-bottom:14px">
        <input type="search" id="sInput" value="${esc(state.q)}" placeholder="搜索关键词…"
               style="flex:1;padding:11px 16px;font-size:1rem;border:1px solid #dfe3e9;border-radius:10px;background:#fff;outline:none">
        <button type="submit" style="padding:11px 26px;font-size:1rem;border:0;border-radius:10px;background:var(--brand);color:#fff;cursor:pointer">搜索</button>
      </form>
      <div class="s-tabs">${tabs}</div>
      <div id="sOut"></div>`;

    const out = document.getElementById('sOut');

    function draw() {
      if (!state.q.trim()) {
        out.innerHTML = '<p style="color:#8d949f">输入关键词开始搜索。</p>';
        return;
      }
      if (!store) {
        out.innerHTML = '<p style="color:#8d949f">正在载入资料…</p>';
        ensureData().then(draw);
        return;
      }
      const res = run(state.q);
      if (!res.length) {
        out.innerHTML = `<p style="color:#8d949f">没有找到与“${esc(state.q)}”相关的内容。</p>`;
        return;
      }
      // 按类型分组统计
      const counts = {};
      for (const r of res) counts[r.type] = (counts[r.type] || 0) + 1;

      const items = res.slice(0, state.shown).map(r => `
        <a class="s-item" href="${r.href}">
          <span class="s-badge s-${r.type}">${TYPE_LABEL[r.type]}</span>
          <span class="s-body">
            <span class="s-title">${mark(r.title, state.q)}</span>
            ${r.sub ? `<span class="s-sub">${mark(r.sub, state.q)}</span>` : ''}
          </span>
          ${r.extra ? `<span class="s-extra">${mark(r.extra, state.q)}</span>` : ''}
        </a>`).join('');

      const summary = Object.entries(counts).map(([k, v]) => `${TYPE_LABEL[k]} ${v}`).join(' · ');
      const rest = res.length - state.shown;

      out.innerHTML = `
        <p class="s-count">共 ${res.length} 条结果（${summary}）</p>
        <div class="s-list">${items}</div>
        ${rest > 0 ? `<div class="s-more-wrap"><button type="button" id="moreBtn" class="s-more">加载更多（剩余 ${rest} 条）</button></div>` : ''}`;

      const more = document.getElementById('moreBtn');
      if (more) more.addEventListener('click', () => { state.shown += MAX; draw(); });
    }

    document.getElementById('sForm').addEventListener('submit', e => {
      e.preventDefault();
      state.q = document.getElementById('sInput').value;
      state.shown = MAX;
      const u = new URL(location.href);
      u.searchParams.set('q', state.q);
      history.replaceState(null, '', u);
      const sub = document.getElementById('pageSub');
      if (sub) sub.textContent = state.q ? `“${state.q}” 的搜索结果` : '输入关键词检索。';
      draw();
    });

    out.parentElement.querySelectorAll('.s-tab').forEach(b => {
      b.addEventListener('click', () => {
        state.type = b.dataset.k;
        state.shown = MAX;
        out.parentElement.querySelectorAll('.s-tab').forEach(x => x.classList.toggle('on', x === b));
        draw();
      });
    });

    draw();
  }

  render();
})();