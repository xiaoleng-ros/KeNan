/* ===========================================================
   柯南的世界 — 电视动画
   =========================================================== */
(async () => {
  const root = document.getElementById('pageRoot');
  const d = await loadData('anime');
  if (!d || !d.eps) { root.innerHTML = '<p>数据加载失败。</p>'; return; }

  const eps = d.eps;
  // 支持从搜索结果直接定位：anime.html?id=TV12
  const deepId = new URLSearchParams(location.search).get('id') || '';
  const state = { q: deepId, kind: 'all', sort: 'asc' };

  function render() {
    root.innerHTML = `
      <div class="table-tools">
        <input type="search" id="qInput" placeholder="搜索集号 / 标题" value="${esc(state.q)}" style="width:230px">
        <select id="kindSel">
          <option value="all">全部类型</option>
          <option value="TV" ${state.kind === 'TV' ? 'selected' : ''}>常规集</option>
          <option value="SPTV" ${state.kind === 'SPTV' ? 'selected' : ''}>特别篇</option>
        </select>
        <select id="sortSel">
          <option value="asc" ${state.sort === 'asc' ? 'selected' : ''}>按集号升序</option>
          <option value="desc" ${state.sort === 'desc' ? 'selected' : ''}>按集号降序</option>
          <option value="date" ${state.sort === 'date' ? 'selected' : ''}>按首播日期</option>
        </select>
        <span class="count" id="cnt" aria-live="polite"></span>
      </div>
      <div class="table-wrap wide"><table class="data-table">
        <thead><tr>
          <th scope="col">集号</th><th scope="col">拆分版</th><th scope="col">中文标题</th><th scope="col">日文标题</th><th scope="col">首播时间</th><th scope="col">收视率</th><th scope="col">对应漫画</th>
        </tr></thead>
        <tbody id="tbody"></tbody>
      </table></div>`;

    const tbody = document.getElementById('tbody');
    const cnt = document.getElementById('cnt');

    function draw() {
      const q = state.q.trim();
      const s = q.toLowerCase();
      // 集号精确匹配：搜 TV12 只应命中 TV12，不含 TV120+
      // 只有带 TV/SPTV 前缀的词才算集号，裸数字（如 12）按普通关键词处理
      const isIdToken = t => /^(?:s?p)?tv\d+$/i.test(t);
      const tokens = q.split(/[\s,，、]+/).filter(Boolean);
      const exactIds = new Set(tokens.filter(isIdToken).map(t => t.toUpperCase()));
      const keywords = tokens.filter(t => !isIdToken(t)).map(t => t.toLowerCase());

      // 标题关键词命中：多个关键词需同时命中（单关键词等价于 includes）
      const titleHit = e => keywords.length > 0 && keywords.every(k =>
        [e.titleZh, e.titleJa].some(v => String(v || '').toLowerCase().includes(k))
      );
      // 编号 + 标题的模糊命中，仅在没有输入集号时使用
      const fuzzyHit = e => keywords.length > 0 && keywords.every(k =>
        [e.id, e.titleZh, e.titleJa].some(v => String(v || '').toLowerCase().includes(k))
      );

      let items = eps.filter(e => {
        if (state.kind === 'SPTV' ? !e.id.startsWith('SPTV') : (state.kind === 'TV' && e.id.startsWith('SPTV'))) return false;
        if (!s) return true;
        // 输入了集号：编号只认精确匹配，同时允许标题关键词命中（如「TV12 柯南」）
        if (exactIds.size) return exactIds.has(e.id.toUpperCase()) || titleHit(e);
        return fuzzyHit(e);
      });

      const num = e => parseInt(e.id.replace(/\D/g, ''), 10) || 0;
      items = items.slice().sort((a, b) => {
        if (state.sort === 'desc') return num(b) - num(a);
        if (state.sort === 'date') return (a.date || '').localeCompare(b.date || '');
        return num(a) - num(b);
      });

      tbody.innerHTML = items.map(e => `
        <tr>
          <td class="num">${mark(e.id, q)}</td>
          <td class="num">${esc(e.splitNo)}</td>
          <td>${mark(e.titleZh, q)}</td>
          <td class="ja">${mark(e.titleJa, q)}</td>
          <td class="num">${esc(e.date)}</td>
          <td class="num">${esc(e.rating)}</td>
          <td class="num">${esc(e.manga)}</td>
        </tr>`).join('') || '<tr><td colspan="7" style="color:#8d949f">没有匹配的记录。</td></tr>';

      cnt.textContent = `共 ${items.length} 集`;
    }

    document.getElementById('qInput').addEventListener('input', e => { state.q = e.target.value; draw(); });
    document.getElementById('kindSel').addEventListener('change', e => { state.kind = e.target.value; draw(); });
    document.getElementById('sortSel').addEventListener('change', e => { state.sort = e.target.value; draw(); });
    draw();
  }

  render();

  // 深链定位：高亮并滚动到命中的集数行
  if (deepId) {
    const row = document.querySelector('.data-table tbody tr');
    if (row && row.children.length > 1) {
      row.classList.add('hit');
      row.scrollIntoView({ block: 'center' });
    }
  }
})();