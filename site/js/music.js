/* ===========================================================
   柯南的世界 — 音乐
   =========================================================== */
(async () => {
  const root = document.getElementById('pageRoot');
  const d = await loadData('music');
  if (!d || !d.songs) { root.innerHTML = '<p>数据加载失败。</p>'; return; }

  const songs = d.songs;
  const state = { q: '', kind: 'all' };

  // 分类：片头曲 OP / 片尾曲 ED / 剧场版主题 MT / 其他
  function kindOf(code) {
    const c = code.toUpperCase();
    if (c.startsWith('OP')) return 'OP';
    if (c.startsWith('ED')) return 'ED';
    if (c.startsWith('MT')) return 'MT';
    if (c.startsWith('SPTM')) return 'SPTM';
    if (c.startsWith('OSCM') || c.startsWith('OST')) return 'OST';
    return 'other';
  }

  function render() {
    root.innerHTML = `
      <div class="table-tools">
        <input type="search" id="qInput" placeholder="搜索曲名 / 演唱者" value="" style="width:230px">
        <select id="kindSel">
          <option value="all">全部类型</option>
          <option value="OP">片头曲 OP</option>
          <option value="ED">片尾曲 ED</option>
          <option value="MT">剧场版主题 MT</option>
          <option value="SPTM">特别篇主题</option>
          <option value="OST">原声集</option>
          <option value="other">其他</option>
        </select>
        <span class="count" id="cnt"></span>
      </div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>编号</th><th>曲名</th><th>演唱者</th><th>备注</th></tr></thead>
        <tbody id="tbody"></tbody>
      </table></div>`;

    const tbody = document.getElementById('tbody');
    const cnt = document.getElementById('cnt');

    function draw() {
      const q = state.q.trim().toLowerCase();
      const items = songs.filter(s => {
        if (state.kind !== 'all' && kindOf(s.code) !== state.kind) return false;
        if (!q) return true;
        return [s.code, s.titleJa, s.artist, s.note].some(v => String(v || '').toLowerCase().includes(q));
      });

      tbody.innerHTML = items.map(s => `
        <tr>
          <td class="num"><b>${mark(s.code, q)}</b></td>
          <td>${mark(s.titleJa, q)}</td>
          <td>${mark(s.artist, q)}</td>
          <td style="color:#8d949f;font-size:.9em">${mark(s.note, q)}</td>
        </tr>`).join('') || '<tr><td colspan="4" style="color:#8d949f">没有匹配的记录。</td></tr>';

      cnt.textContent = `共 ${items.length} 首`;
    }

    document.getElementById('qInput').addEventListener('input', e => { state.q = e.target.value; draw(); });
    document.getElementById('kindSel').addEventListener('change', e => { state.kind = e.target.value; draw(); });
    draw();
  }

  render();
})();