/* ===========================================================
   柯南的世界 — 音乐
   =========================================================== */
(async () => {
  const root = document.getElementById('pageRoot');
  const d = await loadData('music');
  if (!d || !d.songs) { root.innerHTML = '<p>数据加载失败。</p>'; return; }

  const songs = d.songs;
  // 支持从搜索结果直接定位：music.html?code=OP1
  const deepCode = new URLSearchParams(location.search).get('code') || '';
  const state = { q: deepCode, kind: 'all' };

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
        <input type="search" id="qInput" placeholder="搜索曲名 / 演唱者 / 编号" value="${esc(state.q)}" style="width:230px">
        <select id="kindSel">
          <option value="all">全部类型</option>
          <option value="OP">片头曲 OP</option>
          <option value="ED">片尾曲 ED</option>
          <option value="MT">剧场版主题 MT</option>
          <option value="SPTM">特别篇主题</option>
          <option value="OST">原声集</option>
          <option value="other">其他</option>
        </select>
        <span class="count" id="cnt" aria-live="polite"></span>
      </div>
      <div class="table-wrap wide"><table class="data-table">
        <thead><tr>
          <th scope="col">编号</th><th scope="col">曲名</th><th scope="col">演唱者</th>
          <th scope="col">作词</th><th scope="col">作曲</th><th scope="col">编曲</th><th scope="col">对应剧集</th>
        </tr></thead>
        <tbody id="tbody"></tbody>
      </table></div>`;

    const tbody = document.getElementById('tbody');
    const cnt = document.getElementById('cnt');

    function draw() {
      const q = state.q.trim().toLowerCase();
      // 编号 token（OP12 / ED7）精确匹配，避免 OP1 命中 OP10-OP19
      const isCodeToken = t => /^(?:OP|ED|MT|SPTM|SPC|OSCM|OST)\d+$/i.test(t);
      const tokens = q.split(/[\s,，、]+/).filter(Boolean);
      const exactCodes = new Set(tokens.filter(isCodeToken).map(t => t.toUpperCase()));
      const keywords = tokens.filter(t => !isCodeToken(t));

      // 多个关键词需同时命中（单关键词等价于 includes）
      const textHit = s => keywords.length > 0 && keywords.every(k =>
        [s.titleJa, s.titleZh, s.artist, s.lyricist, s.composer, s.arranger, s.range]
          .some(v => String(v || '').toLowerCase().includes(k))
      );
      const fuzzyHit = s => keywords.length > 0 && keywords.every(k =>
        [s.code, s.titleJa, s.titleZh, s.artist]
          .some(v => String(v || '').toLowerCase().includes(k))
      );

      const items = songs.filter(s => {
        if (state.kind !== 'all' && kindOf(s.code) !== state.kind) return false;
        if (!q) return true;
        if (exactCodes.size) return exactCodes.has(s.code.toUpperCase()) || textHit(s);
        return fuzzyHit(s);
      });

      tbody.innerHTML = items.map(s => `
        <tr>
          <td class="num"><b>${mark(s.code, q)}</b></td>
          <td>${mark(s.titleJa, q)}${s.titleZh ? `<div class="ja">${mark(s.titleZh, q)}</div>` : ''}</td>
          <td>${mark(s.artist, q)}</td>
          <td>${mark(s.lyricist, q)}</td>
          <td>${mark(s.composer, q)}</td>
          <td>${mark(s.arranger, q)}</td>
          <td>${mark(s.range, q)}</td>
        </tr>`).join('') || '<tr><td colspan="7" style="color:#8d949f">没有匹配的记录。</td></tr>';

      cnt.textContent = `共 ${items.length} 首`;
    }

    document.getElementById('qInput').addEventListener('input', e => { state.q = e.target.value; draw(); });
    document.getElementById('kindSel').addEventListener('change', e => { state.kind = e.target.value; draw(); });
    draw();

    // 深链定位：高亮并滚动到命中的曲目行
    if (deepCode) {
      const row = tbody.querySelector('tr');
      if (row && row.children.length > 1) {
        row.classList.add('hit');
        row.scrollIntoView({ block: 'center' });
      }
    }
  }

  render();
})();
