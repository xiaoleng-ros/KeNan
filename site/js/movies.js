/* ===========================================================
   柯南的世界 — 剧场版
   =========================================================== */
(async () => {
  const root = document.getElementById('pageRoot');
  const d = await loadData('movies');
  if (!d) { root.innerHTML = '<p>数据加载失败。</p>'; return; }

  const list = d.regular || [];
  // 支持从搜索结果直接定位：movies.html?id=M2
  const deepId = new URLSearchParams(location.search).get('id') || '';
  const state = { q: deepId };

  const intro = d.intro ? `
    <div class="card">
      <p style="font-size:.92rem;line-height:1.8">${esc(d.intro)}</p>
    </div>` : '';

  root.innerHTML = `
    ${intro}
    <div class="table-tools">
      <input type="search" id="qInput" placeholder="搜索编号 / 标题 / 导演" value="${esc(state.q)}" style="width:240px">
      <span class="count" id="cnt" aria-live="polite"></span>
    </div>
    <div class="table-wrap wide"><table class="data-table">
      <thead><tr>
        <th scope="col">编号</th><th scope="col">中文标题</th><th scope="col">日文标题</th><th scope="col">首映时间</th><th scope="col">导演</th><th scope="col">编剧</th><th scope="col">时长</th><th scope="col">观影人次</th><th scope="col">日本票房</th>
      </tr></thead>
      <tbody id="tbody"></tbody>
    </table></div>`;

  const tbody = document.getElementById('tbody');
  const cnt = document.getElementById('cnt');

  function draw() {
    const q = state.q.trim();
    const s = q.toLowerCase();
    // 编号精确匹配：搜 M2 只应命中 M2，不含 M20-M29
    // 裸数字（如 2）沿用旧行为视作编号；其余文字按关键词处理
    const isIdToken = t => /^(?:m)?\d+$/i.test(t);
    const tokens = q.split(/[\s,，、]+/).filter(Boolean);
    // 裸数字补 M 前缀，保证「2」与「M2」等价
    const exactIds = new Set(tokens.filter(isIdToken).map(t => {
      const u = t.toUpperCase();
      return /^\d+$/.test(u) ? 'M' + u : u;
    }));
    const keywords = tokens.filter(t => !isIdToken(t)).map(t => t.toLowerCase());

    // 标题/导演/编剧关键词命中：多个关键词需同时命中
    const textHit = m => keywords.length > 0 && keywords.every(k =>
      [m.titleZh, m.titleJa, m.director, m.writer].some(v => String(v || '').toLowerCase().includes(k))
    );
    // 编号 + 文本的模糊命中，仅在没有输入编号时使用
    const fuzzyHit = m => keywords.length > 0 && keywords.every(k =>
      [m.id, m.titleZh, m.titleJa, m.director, m.writer].some(v => String(v || '').toLowerCase().includes(k))
    );

    const items = list.filter(m => {
      if (!s) return true;
      // 输入了编号：编号只认精确匹配，同时允许文本关键词命中（如「M2 静野」）
      if (exactIds.size) return exactIds.has(m.id.toUpperCase()) || textHit(m);
      return fuzzyHit(m);
    });

    tbody.innerHTML = items.map(m => `
      <tr>
        <td class="num"><b>${mark(m.id, q)}</b></td>
        <td>${mark(m.titleZh, q)}</td>
        <td class="ja">${mark(m.titleJa, q)}</td>
        <td class="num">${esc(m.date)}</td>
        <td>${mark(m.director, q)}</td>
        <td>${mark(m.writer, q)}</td>
        <td class="num">${esc(m.duration)}</td>
        <td class="num">${esc(m.viewers)}</td>
        <td class="num">${esc(m.boxOffice)}</td>
      </tr>`).join('') || '<tr><td colspan="9" style="color:#8d949f">没有匹配的记录。</td></tr>';

    cnt.textContent = `共 ${items.length} 部`;
  }

  document.getElementById('qInput').addEventListener('input', e => { state.q = e.target.value; draw(); });
  draw();

  // 深链定位：高亮并滚动到命中的剧场版行
  if (deepId) {
    const row = document.querySelector('.data-table tbody tr');
    if (row && row.children.length > 1) {
      row.classList.add('hit');
      row.scrollIntoView({ block: 'center' });
    }
  }
})();