/* ===========================================================
   柯南的世界 — 站内搜索
   =========================================================== */
(async () => {
  const root = document.getElementById('pageRoot');
  const [manga, anime, movies, music, chars] = await Promise.all([
    loadData('manga'), loadData('anime'), loadData('movies'), loadData('music'), loadData('characters'),
  ]);

  const q = new URLSearchParams(location.search).get('q') || '';
  const sub = document.getElementById('pageSub');
  if (sub) sub.textContent = q ? `“${q}” 的搜索结果` : '输入关键词，检索角色、动画、漫画、剧场版与音乐。';

  const state = { q, type: 'all' };

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
    const res = [];

    if (state.type === 'all' || state.type === 'char') {
      for (const c of (chars || [])) {
        if (has(c.nameZh, c.nameJa, c.voice, c.desc)) {
          res.push({ type: 'char', title: c.nameZh, sub: c.nameJa, extra: `${c.group} · 声优 ${c.voice}`, href: 'characters.html' });
        }
      }
    }
    if (state.type === 'all' || state.type === 'anime') {
      for (const e of (anime?.eps || [])) {
        if (has(e.id, e.titleZh, e.titleJa)) {
          res.push({ type: 'anime', title: `${e.id} ${e.titleZh}`, sub: e.titleJa, extra: `首播 ${e.date}`, href: 'anime.html' });
        }
      }
    }
    if (state.type === 'all' || state.type === 'manga') {
      for (const m of (manga?.rows || [])) {
        if (has(m.file, m.titleZh, m.titleJa, m.caseName)) {
          res.push({ type: 'manga', title: `${m.file} ${m.titleZh}`, sub: m.titleJa, extra: `${m.year} · ${m.caseName}`, href: 'manga.html' });
        }
      }
    }
    if (state.type === 'all' || state.type === 'movie') {
      for (const m of (movies?.regular || [])) {
        if (has(m.id, m.titleZh, m.titleJa, m.director, m.writer)) {
          res.push({ type: 'movie', title: `${m.id} ${m.titleZh}`, sub: m.titleJa, extra: `${m.date} · 导演 ${m.director}`, href: 'movies.html' });
        }
      }
    }
    if (state.type === 'all' || state.type === 'music') {
      for (const s2 of (music?.songs || [])) {
        if (has(s2.code, s2.titleJa, s2.artist)) {
          res.push({ type: 'music', title: `${s2.code} ${s2.titleJa}`, sub: s2.artist, extra: '', href: 'music.html' });
        }
      }
    }
    return res;
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
      const res = run(state.q);
      if (!res.length) {
        out.innerHTML = `<p style="color:#8d949f">没有找到与“${esc(state.q)}”相关的内容。</p>`;
        return;
      }
      // 按类型分组统计
      const counts = {};
      for (const r of res) counts[r.type] = (counts[r.type] || 0) + 1;

      const items = res.slice(0, MAX).map(r => `
        <a class="s-item" href="${r.href}">
          <span class="s-badge s-${r.type}">${TYPE_LABEL[r.type]}</span>
          <span class="s-body">
            <span class="s-title">${mark(r.title, state.q)}</span>
            ${r.sub ? `<span class="s-sub">${mark(r.sub, state.q)}</span>` : ''}
          </span>
          ${r.extra ? `<span class="s-extra">${mark(r.extra, state.q)}</span>` : ''}
        </a>`).join('');

      const summary = Object.entries(counts).map(([k, v]) => `${TYPE_LABEL[k]} ${v}`).join(' · ');

      out.innerHTML = `
        <p class="s-count">共 ${res.length} 条结果（${summary}）${res.length > MAX ? `，显示前 ${MAX} 条` : ''}</p>
        <div class="s-list">${items}</div>`;
    }

    document.getElementById('sForm').addEventListener('submit', e => {
      e.preventDefault();
      state.q = document.getElementById('sInput').value;
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
        out.parentElement.querySelectorAll('.s-tab').forEach(x => x.classList.toggle('on', x === b));
        draw();
      });
    });

    draw();
  }

  render();
})();