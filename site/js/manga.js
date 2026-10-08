/* ===========================================================
   柯南的世界 — 原作漫画
   =========================================================== */
(async () => {
  const root = document.getElementById('pageRoot');
  const d = await loadData('manga');
  if (!d || !d.rows) { root.innerHTML = '<p>数据加载失败。</p>'; return; }

  const rows = d.rows;
  // 按年份分组
  const byYear = new Map();
  for (const r of rows) {
    if (!byYear.has(r.year)) byYear.set(r.year, []);
    byYear.get(r.year).push(r);
  }

  const state = { year: 'all', q: '' };

  function render() {
    const years = [...byYear.keys()].sort((a, b) => b - a);
    const opts = ['<option value="all">全部年份</option>']
      .concat(years.map(y => `<option value="${y}" ${state.year === y ? 'selected' : ''}>${y} 年（${byYear.get(y).length} 话）</option>`))
      .join('');

    const html = `
      <div class="table-tools">
        <select id="yearSel">${opts}</select>
        <input type="search" id="qInput" placeholder="搜索标题 / 案件名 / 编号" value="${esc(state.q)}" style="width:230px">
        <span class="count" id="cnt"></span>
      </div>
      <div id="list"></div>`;
    root.innerHTML = html;

    const list = document.getElementById('list');
    const cnt = document.getElementById('cnt');

    function draw() {
      const q = state.q.trim().toLowerCase();
      const yearsToShow = state.year === 'all' ? years : [state.year];
      let total = 0;
      const parts = [];

      for (const y of yearsToShow) {
        let items = byYear.get(y);
        if (q) {
          items = items.filter(r => [r.titleZh, r.titleJa, r.caseName, r.file, r.volume, r.caseNo]
            .some(v => String(v || '').toLowerCase().includes(q)));
        }
        if (!items.length) continue;
        total += items.length;

        const trs = items.map(r => `
          <tr>
            <td class="num">${esc(r.file)}</td>
            <td class="num">${esc(r.date)}</td>
            <td>${mark(r.caseName, q)}<div style="color:#98a0ac;font-size:.82em">案件 ${esc(r.caseNo)}</div></td>
            <td>${mark(r.titleZh, q)}<div class="ja">${esc(r.titleJa)}</div></td>
            <td class="num">${esc(r.volume)}</td>
            <td class="num">${esc(r.anime)}</td>
          </tr>`).join('');

        parts.push(`
          <div class="year-group">
            <div class="year-title">${y} 年<span class="cnt">${items.length} 话</span></div>
            <div class="table-wrap">
              <table class="data-table">
                <thead><tr>
                  <th>编号</th><th>发表时间</th><th>所属事件</th><th>标题</th><th>分卷</th><th>对应动画</th>
                </tr></thead>
                <tbody>${trs}</tbody>
              </table>
            </div>
          </div>`);
      }

      list.innerHTML = parts.join('') || '<p style="color:#8d949f">没有匹配的记录。</p>';
      cnt.textContent = `共 ${total} 话`;
    }

    document.getElementById('yearSel').addEventListener('change', e => { state.year = e.target.value; draw(); });
    const qi = document.getElementById('qInput');
    let timer;
    qi.addEventListener('input', e => {
      clearTimeout(timer);
      timer = setTimeout(() => { state.q = e.target.value; draw(); }, 200);
    });
    draw();
  }

  render();
})();