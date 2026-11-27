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

  /**
   * 角色目录分类：把细分组归入大类。
   * 数组顺序即目录章节顺序，最后一项兜底「其他」。
   */
  const CATEGORY_RULES = [
    { name: '常驻角色', test: /主要角色|工藤家|妃法律事务所|波洛咖啡厅|伊吕波寿司店/ },
    { name: '黑衣组织', test: /黑衣组织/ },
    { name: '情报机构', test: /^(FBI|CIA|MI6)/ },
    { name: '警察与司法', test: /警视厅|警察厅|检察厅|府警|县警|道警|警察学校/ },
    { name: '学校', test: /高中|小学/ },
    { name: '职场与团体', test: /财团|医院|拉面店|书店|珠宝店|将棋手|足球运动员|魔术师|艺人|知名人士/ },
    { name: '亲友与其他', test: /亲属与友人|宠物|虚构角色/ },
    { name: '其他', test: /[\s\S]*/ },
  ];

  /** group -> { no: '1.1', catIndex, catName } */
  const groupMeta = new Map();
  {
    let catIndex = -1;
    let sub = 0;
    for (const g of groups) {
      const idx = CATEGORY_RULES.findIndex(r => r.test.test(g));
      const safe = idx >= 0 ? idx : CATEGORY_RULES.length - 1;
      if (safe !== catIndex) { catIndex = safe; sub = 0; }
      sub += 1;
      groupMeta.set(g, { catIndex, catName: CATEGORY_RULES[catIndex].name, no: `${catIndex + 1}.${sub}` });
    }
  }

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
                   alt="${esc(c.nameZh)}" loading="lazy" width="76" height="76"
                   onerror="this.src='assets/img/placeholder.svg'">
            </div>
            <div class="char-info">
              <div class="char-name">${mark(c.nameZh, q)}<span class="ja">${esc(c.nameJa)}</span></div>
              <div class="char-voice">声优：${mark(c.voice, q)}</div>
              <div class="char-desc">${mark(c.desc, q)}</div>
            </div>
          </div>`).join('');

        const gi = groups.indexOf(g);
        const meta = groupMeta.get(g);
        parts.push(`
          <div class="char-group-title" id="g-${gi}"><span class="gno">${meta.no}</span>${esc(g)}<span class="cnt">${items.length} 人</span></div>
          <div class="char-grid">${cards}</div>`);
      }

      list.innerHTML = parts.join('') || '<p style="color:#8d949f">没有匹配的角色。</p>';
      cnt.textContent = `共 ${total} 名角色`;
      bindCards(list);
    }

    /**
     * 生成左侧编号目录：大类 1..N，细分组 1.1..。
     * 点击条目清空筛选并滚动到对应分组。
     */
    function buildToc(tries = 0) {
      const old = document.getElementById('charToc');
      if (old) old.remove();
      const side = document.getElementById('sidebar');
      // 侧栏由 site.js 在 DOMContentLoaded 渲染，未就绪时短暂重试
      if (!side || !side.children.length) {
        if (tries < 5) setTimeout(() => buildToc(tries + 1), 60);
        return;
      }

      let lastCat = -1;
      const rows = [];
      for (let i = 0; i < groups.length; i++) {
        const g = groups[i];
        const m = groupMeta.get(g);
        const n = chars.filter(c => c.group === g).length;
        if (m.catIndex !== lastCat) {
          lastCat = m.catIndex;
          rows.push(`<li class="toc-cat"><a href="#g-${i}" data-index="${i}">${m.catIndex + 1} ${esc(m.catName)}</a></li>`);
        }
        rows.push(`<li><a class="toc-sub" href="#g-${i}" data-index="${i}">${m.no} ${esc(g)}<span class="toc-n">${n}</span></a></li>`);
      }

      const wrap = document.createElement('div');
      wrap.id = 'charToc';
      wrap.innerHTML = `<div class="side-title">角色目录</div><ul class="side-nav toc">${rows.join('')}</ul>`;
      side.appendChild(wrap);

      wrap.addEventListener('click', e => {
        const a = e.target.closest('a[data-index]');
        if (!a) return;
        e.preventDefault();
        const idx = Number(a.dataset.index);
        // 目录定位需要看到全部分组：清空搜索与分组筛选
        state.q = '';
        state.group = 'all';
        document.getElementById('qInput').value = '';
        document.getElementById('groupSel').value = 'all';
        draw();
        const title = document.getElementById('g-' + idx);
        if (title) {
          title.scrollIntoView({ behavior: 'smooth', block: 'start' });
          title.classList.add('active');
        }
        wrap.querySelectorAll('a.active').forEach(x => x.classList.remove('active'));
        a.classList.add('active');
      });
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

      /**
       * iOS sheet 的下滑关闭：在关闭按钮/遮罩之外的空白处按下拖动。
       * 只在手指向下且超过阈值时关闭，避免误触；松手回弹。
       */
      let dragStartY = null;
      box.addEventListener('touchstart', e => {
        if (e.target.closest('.modal-x') || e.target.closest('a')) return;
        // 弹窗内部已滚到底还要继续下拉时，才接管手势
        if (modal.scrollTop > 0) return;
        dragStartY = e.touches[0].clientY;
        modal.style.transition = 'none';
      }, { passive: true });
      box.addEventListener('touchmove', e => {
        if (dragStartY == null) return;
        const dy = e.touches[0].clientY - dragStartY;
        if (dy <= 0) { modal.style.transform = ''; return; }
        // 阻尼：越往下拉越沉，符合 iOS 的橡皮筋手感
        modal.style.transform = `translateY(${dy * 0.55}px)`;
      }, { passive: true });
      box.addEventListener('touchend', e => {
        if (dragStartY == null) return;
        const dy = (e.changedTouches[0] || {}).clientY - dragStartY;
        modal.style.transition = '';
        if (dy > 120) { modal.style.transform = ''; close(); return; }
        modal.style.transform = '';
        dragStartY = null;
      }, { passive: true });

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
    buildToc();
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