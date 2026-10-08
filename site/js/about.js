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
      <h2>数据来源与许可</h2>
      <p>本站全部条目数据抓取自
        <a href="https://www.conanpedia.com/" target="_blank" rel="noopener"><b>柯南百科</b></a>
        （银色子弹 SBSUB 出品）的 MediaWiki 接口，按下表逐项署名：</p>
      <ul>
        <li>原作漫画章节表 — 来源：<a href="https://www.conanpedia.com/%E5%90%8D%E4%BE%A6%E6%8E%A2%E6%9F%AF%E5%8D%97%E5%8E%9F%E4%BD%9C%E6%BC%AB%E7%94%BB" target="_blank" rel="noopener">名侦探柯南原作漫画</a>，含刊号、标题与事件清单</li>
        <li>电视动画集数表 — 来源：<a href="https://www.conanpedia.com/%E5%90%8D%E4%BE%A6%E6%8E%A2%E6%9F%AF%E5%8D%97%E7%94%B5%E8%A7%86%E5%8A%A8%E7%94%BB" target="_blank" rel="noopener">名侦探柯南电视动画</a>，含集数、标题、首播日期与收视率</li>
        <li>剧场版作品表 — 来源：<a href="https://www.conanpedia.com/%E5%90%8D%E4%BE%A6%E6%8E%A2%E6%9F%AF%E5%8D%97%E5%89%A7%E5%9C%BA%E7%89%88" target="_blank" rel="noopener">名侦探柯南剧场版</a>，含导演、编剧、时长与日本票房</li>
        <li>角色名录 — 来源：<a href="https://www.conanpedia.com/%E5%90%8D%E4%BE%A6%E6%8E%A2%E6%9F%AF%E5%8D%97%E8%A7%92%E8%89%B2" target="_blank" rel="noopener">名侦探柯南角色</a>，按常驻角色所属阵营分组，附声优信息</li>
        <li>音乐条目 — 来源：<a href="https://www.conanpedia.com/%E5%90%8D%E4%BE%A6%E6%8E%A2%E6%9F%AF%E5%8D%97%E9%9F%B3%E4%B9%90" target="_blank" rel="noopener">名侦探柯南音乐</a>，主题曲与剧场版主题的原名及演唱者</li>
      </ul>
      <p>上述内容依
        <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>
        授权使用（署名 — 非商业 — 相同方式共享），本站已注明来源并标明做过格式转换与筛选。
        详细条款见原站
        <a href="https://www.conanpedia.com/%E6%9F%AF%E5%8D%97%E7%99%BE%E7%A7%91:%E7%89%88%E6%9D%83" target="_blank" rel="noopener">柯南百科:版权</a>。</p>
      <p style="color:#98a0ac;font-size:.86rem">
        <b>不在授权范围内的内容：</b>本站 159 张角色头像版权归<b>青山刚昌</b>老师及相关权利方所有，
        背景图与精选条目图版权归银色子弹所有，均不适用 CC 协议。
        《名侦探柯南》原作©青山刚昌／小学馆；动画及剧场版版权归各权利方所有。
        本站为非官方粉丝站，仅作资料整理与学习交流；如权利方认为使用不妥，请联系删除。</p>
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