/* ===========================================================
   柯南的世界 — 本站说明
   =========================================================== */
(async () => {
  const root = document.getElementById('pageRoot');
  const [manga, anime, movies, music, chars] = await Promise.all([
    loadData('manga'), loadData('anime'), loadData('movies'), loadData('music'), loadData('characters'),
  ]);

  const n = {
    manga: manga?.rows?.length || 0,
    anime: anime?.eps?.length || 0,
    movies: movies?.regular?.length || 0,
    music: music?.songs?.length || 0,
    chars: chars?.length || 0,
  };
  const total = Object.values(n).reduce((a, b) => a + b, 0);

  root.innerHTML = `
    <div class="about-card">
      <h2>关于本站</h2>
      <p><b>柯南的世界</b>是一个名侦探柯南资料站，收录原作漫画、电视动画、剧场版、角色与音乐五大板块的资料，
      全部条目支持关键词检索与筛选浏览。</p>
      <p>本站为个人学习用途的资料整理站点，界面与交互参照公开百科的设计思路重新实现。</p>
      <div class="stat-grid">
        <div class="stat-box"><div class="num">${n.manga}</div><div class="lbl">漫画话数</div></div>
        <div class="stat-box"><div class="num">${n.anime}</div><div class="lbl">动画集数</div></div>
        <div class="stat-box"><div class="num">${n.movies}</div><div class="lbl">剧场版</div></div>
        <div class="stat-box"><div class="num">${n.chars}</div><div class="lbl">角色</div></div>
        <div class="stat-box"><div class="num">${n.music}</div><div class="lbl">音乐条目</div></div>
        <div class="stat-box"><div class="num">${total}</div><div class="lbl">合计条目</div></div>
      </div>
    </div>

    <div class="about-card">
      <h2>板块导航</h2>
      <ul>
        <li><a href="manga.html">原作漫画</a> — 按年份分组的完整话列表，含标题、分卷编号、发表时间与对应动画。</li>
        <li><a href="anime.html">电视动画</a> — 集数、标题、首播日期与收视率，可按类型筛选与排序。</li>
        <li><a href="movies.html">剧场版</a> — 编号、导演、编剧、时长、观影人次与日本票房。</li>
        <li><a href="characters.html">角色名录</a> — 按阵营分组的角色卡片，含头像、声优与简介。</li>
        <li><a href="music.html">音乐</a> — 片头曲、片尾曲、剧场版主题与原声集。</li>
        <li><a href="search.html">站内搜索</a> — 一次检索全部五个板块。</li>
      </ul>
    </div>

    <div class="about-card" id="source">
      <h2>数据来源</h2>
      <p>本站数据整理自公开的百科资料页面，条目结构与内容以原始资料为准：</p>
      <ul>
        <li>原作漫画章节表 — 依据《周刊少年Sunday》刊号与事件清单整理</li>
        <li>电视动画集数表 — 含原版集数、拆分版集数与首播收视率</li>
        <li>剧场版作品表 — 含导演、编剧、时长与日本票房统计</li>
        <li>角色名录 — 按常驻角色所属阵营分组，附声优信息</li>
        <li>音乐条目 — 主题曲与剧场版主题的原名及演唱者</li>
      </ul>
      <p style="color:#98a0ac;font-size:.86rem">《名侦探柯南》原作©青山刚昌／小学馆。动画及剧场版版权归各权利方所有。本站仅作资料整理与学习交流。</p>
    </div>

    <div class="about-card">
      <h2>技术说明</h2>
      <ul>
        <li>纯静态站点，无需后端，直接用任意静态服务器托管即可</li>
        <li>数据以 JSON 形式存放于 <code>data/</code>，页面按需异步加载</li>
        <li>角色头像与站点图形资源均已本地化，离线可用</li>
        <li>响应式布局，适配桌面与移动端</li>
      </ul>
    </div>`;
})();