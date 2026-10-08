/* ===========================================================
   柯南的世界 — 剧场版
   =========================================================== */
(async () => {
  const root = document.getElementById('pageRoot');
  const d = await loadData('movies');
  if (!d) { root.innerHTML = '<p>数据加载失败。</p>'; return; }

  const list = d.regular || [];
  const state = { q: '' };

  const intro = d.intro ? `
    <div class="card">
      <p style="font-size:.92rem;line-height:1.8">${esc(d.intro)}</p>
    </div>` : '';

  root.innerHTML = `
    ${intro}
    <div class="table-tools">
      <input type="search" id="qInput" placeholder="搜索编号 / 标题 / 导演" value="" style="width:240px">
      <span class="count" id="cnt"></span>
    </div>
    <div class="table-wrap wide"><table class="data-table">
      <thead><tr>
        <th>编号</th><th>中文标题</th><th>日文标题</th><th>首映时间</th><th>导演</th><th>编剧</th><th>时长</th><th>观影人次</th><th>日本票房</th>
      </tr></thead>
      <tbody id="tbody"></tbody>
    </table></div>`;

  const tbody = document.getElementById('tbody');
  const cnt = document.getElementById('cnt');

  function draw() {
    const q = state.q.trim();
    const s = q.toLowerCase();
    // 编号精确匹配：搜 M2 只应命中 M2，不含 M20-M29
    const exactIds = new Set(
      q.split(/[\s,，、]+/).filter(t => /^(?:m)?\d+$/i.test(t)).map(t => t.toUpperCase().replace(/^M/, 'M'))
    );
    const items = list.filter(m => {
      if (!s) return true;
      if (/^M\d+$/i.test(m.id)) return exactIds.has(m.id.toUpperCase());
      return [m.id, m.titleZh, m.titleJa, m.director, m.writer].some(v => String(v || '').toLowerCase().includes(s));
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
})();