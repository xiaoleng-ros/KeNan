/* ===========================================================
   柯南的世界 — 角色名录
   =========================================================== */
(async () => {
  const root = document.getElementById('pageRoot');
  const [chars, avatars] = await Promise.all([loadData('characters'), loadData('avatars')]);
  if (!chars) { root.innerHTML = '<p>数据加载失败。</p>'; return; }

  // 支持从搜索结果直接定位：characters.html?name=毛利兰
  const deepName = new URLSearchParams(location.search).get('name') || '';
  const state = { q: '', group: 'all' };

  // 保持原站分组顺序
  const groups = [];
  for (const c of chars) if (!groups.includes(c.group)) groups.push(c.group);

  function render() {
    const opts = ['<option value="all">全部分组</option>']
      .concat(groups.map(g => `<option value="${esc(g)}" ${state.group === g ? 'selected' : ''}>${esc(g)}</option>`))
      .join('');

    root.innerHTML = `
      <div class="table-tools">
        <input type="search" id="qInput" placeholder="搜索角色名 / 声优" value="${esc(state.q)}" style="width:220px">
        <select id="groupSel">${opts}</select>
        <span class="count" id="cnt" aria-live="polite"></span>
      </div>
      <div id="list"></div>`;

    const list = document.getElementById('list');
    const cnt = document.getElementById('cnt');

    function draw() {
      const q = state.q.trim().toLowerCase();
      const groupsToShow = state.group === 'all' ? groups : [state.group];
      let total = 0;
      const parts = [];

      for (const g of groupsToShow) {
        let items = chars.filter(c => c.group === g);
        if (q) {
          items = items.filter(c => [c.nameZh, c.nameJa, c.voice, c.desc].some(v => String(v || '').toLowerCase().includes(q)));
        }
        if (!items.length) continue;
        total += items.length;

        const cards = items.map(c => `
          <div class="char-card" data-name="${esc(c.nameZh)}" role="button" tabindex="0"
               title="点击查看完整资料">
            <div class="char-avatar">
              <img src="${esc((avatars && avatars[c.nameZh]) || 'assets/img/placeholder.svg')}"
                   alt="${esc(c.nameZh)}" loading="lazy"
                   onerror="this.src='assets/img/placeholder.svg'">
            </div>
            <div class="char-info">
              <div class="char-name">${mark(c.nameZh, q)}<span class="ja">${esc(c.nameJa)}</span></div>
              <div class="char-voice">声优：${mark(c.voice, q)}</div>
              <div class="char-desc">${mark(c.desc, q)}</div>
            </div>
          </div>`).join('');

        parts.push(`
          <div class="char-group-title">${esc(g)}<span class="cnt">${items.length} 人</span></div>
          <div class="char-grid">${cards}</div>`);
      }

      list.innerHTML = parts.join('') || '<p style="color:#8d949f">没有匹配的角色。</p>';
      cnt.textContent = `共 ${total} 名角色`;
      bindCards(list);
    }

    // 角色详情弹窗
    function openDetail(name, trigger) {
      const c = chars.find(x => x.nameZh === name);
      if (!c) return;
      const old = document.getElementById('charModal');
      if (old) old.remove();
      // 记录打开前的焦点，关闭后归还，避免键盘用户丢失位置
      const prevFocus = trigger || document.activeElement;
      const box = document.createElement('div');
      box.id = 'charModal';
      box.className = 'modal-mask';
      box.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="charModalName" tabindex="-1">
          <button class="modal-x" aria-label="关闭">×</button>
          <div class="modal-head">
            <img src="${esc((avatars && avatars[c.nameZh]) || 'assets/img/placeholder.svg')}" alt="${esc(c.nameZh)}"
                 onerror="this.src='assets/img/placeholder.svg'">
            <div>
              <div class="modal-name" id="charModalName">${esc(c.nameZh)}<span class="ja">${esc(c.nameJa)}</span></div>
              <div class="modal-group">${esc(c.group)}</div>
            </div>
          </div>
          <table class="modal-table">
            ${c.kana ? `<tr><th>日文读音</th><td>${esc(c.kana)}</td></tr>` : ''}
            ${c.roman ? `<tr><th>罗马音</th><td>${esc(c.roman)}</td></tr>` : ''}
            <tr><th>声优</th><td>${esc(c.voice) || '——'}</td></tr>
          </table>
          <p class="modal-desc">${esc(c.desc)}</p>
        </div>`;
      document.body.appendChild(box);
      document.body.style.overflow = 'hidden';

      const modal = box.querySelector('.modal');
      modal.focus();

      /** 关闭弹窗：移除节点、恢复滚动、归还焦点 */
      const close = () => {
        box.remove();
        document.body.style.overflow = '';
        if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus();
      };

      box.addEventListener('click', e => {
        if (e.target === box || e.target.classList.contains('modal-x')) close();
      });

      // 键盘监听绑在弹窗节点上：节点移除即失效，不会在 document 上累积
      box.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.preventDefault(); close(); return; }
        if (e.key !== 'Tab') return;
        // 焦点陷阱：Tab / Shift+Tab 在弹窗内循环
        const items = [...modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }

    function bindCards(scope) {
      scope.querySelectorAll('.char-card').forEach(el => {
        const open = () => openDetail(el.dataset.name, el);
        el.addEventListener('click', open);
        el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
      });
    }

    document.getElementById('groupSel').addEventListener('change', e => { state.group = e.target.value; draw(); });
    const qi = document.getElementById('qInput');
    let timer;
    qi.addEventListener('input', e => {
      clearTimeout(timer);
      timer = setTimeout(() => { state.q = e.target.value; draw(); }, 180);
    });
    draw();
  }

  render();

  // 深链定位：在全部角色中滚动并高亮命中卡片（不过滤，保留上下文）
  if (deepName) {
    const card = [...document.querySelectorAll('.char-card')].find(el => el.dataset.name === deepName);
    if (card) {
      card.classList.add('hit');
      card.scrollIntoView({ block: 'center' });
    }
  }
})();