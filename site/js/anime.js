/* ===========================================================
   柯南的世界 — 电视动画
   =========================================================== */
(async () => {
  const root = document.getElementById('pageRoot');
  const d = await loadData('anime');
  if (!d || !d.eps) { root.innerHTML = '<p>数据加载失败。</p>'; return; }

  const eps = d.eps;
  const state = { q: '', kind: 'all', sort: 'asc' };

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
        <span class="count" id="cnt"></span>
      </div>
      <div class="table-wrap wide"><table class="data-table">
        <thead><tr>
          <th>集号</th><th>拆分版</th><th>中文标题</th><th>日文标题</th><th>首播时间</th><th>收视率</th><th>对应漫画</th>
        </tr></thead>
        <tbody id="tbody"></tbody>
      </table></div>`;

    const tbody = document.getElementById('tbody');
    const cnt = document.getElementById('cnt');

    function draw() {
      const q = state.q.trim();
      const s = q.toLowerCase();
      // 集号精确匹配：搜 TV12 只应命中 TV12，不含 TV120+
      const exactIds = new Set(
        q.split(/[\s,，、]+/).filter(t => /^(?:s?p)?tv\d+$/i.test(t)).map(t => t.toUpperCase().replace(/^TV/, 'TV'))
      );
      let items = eps.filter(e => {
        if (state.kind === 'SPTV' ? !e.id.startsWith('SPTV') : (state.kind === 'TV' && e.id.startsWith('SPTV'))) return false;
        if (!s) return true;
        if (/^(?:SP)?TV\d+$/i.test(e.id)) return exactIds.has(e.id.toUpperCase());
        return [e.id, e.titleZh, e.titleJa].some(v => String(v || '').toLowerCase().includes(s));
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
})();