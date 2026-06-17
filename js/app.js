/**
 * 角色页面 - 严格复刻柯南百科截图布局
 * 左侧：目录列表 | 右侧：角色内容
 */
const App = {
  init() {
    this.renderToc();
    this.renderContent();
    this.bindNav();
    this.fixRemoteImages();
  },

  /** 子分组定义（与左侧目录一一对应，严格对标柯南百科） */
  getSubGroups() {
    return [
      { key: 'main', label: '主要角色' },
      { key: 'kudo_family', label: '工藤家' },
      { key: 'kisaki_law', label: '妃法律事务所' },
      { key: 'cafe_poirot', label: '波洛咖啡厅' },
      { key: 'sushi_iroha', label: '伊吕波寿司店' },
      { key: 'black_org', label: '黑衣组织' },
      { key: 'fbi', label: 'FBI（美国联邦调查局）' },
      { key: 'cia', label: 'CIA（美国中央情报局）' },
      { key: 'mi6', label: 'MI6（英国军事情报六局）' },
      { key: 'tokyo_exec', label: '警视厅刑事部高层' },
      { key: 'tokyo_s1', label: '警视厅刑事部搜查一课' },
      { key: 'tokyo_s2', label: '警视厅刑事部搜查二课' },
      { key: 'tokyo_s3', label: '警视厅刑事部搜查三课' },
      { key: 'tokyo_forensic', label: '警视厅刑事部鉴识课' },
      { key: 'tokyo_traffic', label: '警视厅交通部' },
      { key: 'tokyo_security', label: '警视厅公安部' },
      { key: 'national_police', label: '警察厅' },
      { key: 'prosecutor', label: '检察厅' },
      { key: 'osaka', label: '大阪府警' },
      { key: 'kyoto', label: '京都府警' },
      { key: 'nagano', label: '长野县警' },
      { key: 'gunma', label: '群马县警' },
      { key: 'shizuoka', label: '静冈县警' },
      { key: 'kanagawa', label: '神奈川县警' },
      { key: 'hokkaido', label: '北海道警' },
      { key: 'police_academy', label: '警视厅警察学校' },
      { key: 'teitan_high', label: '帝丹高中' },
      { key: 'haido_high', label: '杯户高中' },
      { key: 'ekoda_high', label: '江古田高中' },
      { key: 'kyoto_seishin', label: '京都泉心高中' },
      { key: 'teitan_elem', label: '帝丹小学' },
      { key: 'suzuki_group', label: '铃木财团' },
      { key: 'araide_hospital', label: '新出医院' },
      { key: 'ramen_ogura', label: '小仓拉面店' },
      { key: 'tamaki_books', label: '玉木书店' },
      { key: 'kaneko_jewelry', label: '金子珠宝店' },
      { key: 'shogi_player', label: '将棋手' },
      { key: 'soccer_player', label: '足球运动员' },
      { key: 'magician', label: '魔术师' },
      { key: 'entertainer', label: '艺人' },
      { key: 'celebrity', label: '知名人士' },
      { key: 'family_friend', label: '亲属与友人' },
      { key: 'pet', label: '宠物' },
      { key: 'fictional', label: '虚构角色' },
    ];
  },

  /** 渲染左侧目录 */
  renderToc() {
    const nav = document.getElementById('tocList');
    if (!nav) return;

    const groups = this.getSubGroups();
    let html = '';

    // 一级：常驻角色
    html += `<div class="toc-item level-1"><a href="#section-常驻角色">1 常驻角色</a></div>`;

    // 二级：所有子分组
    groups.forEach((g, i) => {
      const chars = characterData.filter(c => c.factionKey === g.key);
      if (chars.length === 0) return;
      html += `<div class="toc-item level-2"><a href="#sub-${g.label}">1.${i + 1} ${g.label}</a></div>`;
    });

    nav.innerHTML = html;
  },

  /** 渲染右侧内容 */
  renderContent() {
    const container = document.getElementById('mainContent');
    if (!container) return;

    const groups = this.getSubGroups();
    let html = '';
    let charIndex = 0;

    // 简介段落
    html += `
      <div class="intro-text">
        <p>角色是剧情中的人物，与剧情相辅相成。角色的行为推动剧情的发展，剧情的发展丰富角色的形象。</p>
        <p>柯南百科重点介绍《名侦探柯南》常驻角色，亦为《名侦探柯南》所有的"<a href="#">多次登场角色与部分重要的单次登场角色</a>"设置了角色条目。</p>
        <p>柯南百科介绍的《<a href="#">名侦探柯南</a>》<b>角色</b>（Character）指《名侦探柯南》<a href="#">原作漫画</a>、<a href="#">动画</a>、<a href="#">真人版</a>、部分<a href="#">番外作品</a>相结合的剧情中的人物，相关基础概念见【<a href="#">柯南百科:角色基础概念</a>】。</p>
      </div>

      <h2 class="section-heading" id="section-常驻角色">常驻角色</h2>
    `;

    // 遍历每个子分组
    groups.forEach(group => {
      const characters = characterData.filter(c => c.factionKey === group.key);
      if (characters.length === 0) return;

      // 子标题
      html += `<h3 class="subsection-heading" id="sub-${group.label}">${group.label}</h3>`;

      // 每个角色
      characters.forEach(char => {
        html += this.renderChar(char, charIndex);
        charIndex++;
      });
    });

    container.innerHTML = html;
  },

  /** 将远程图片URL转为代理URL（解决跨域ORB问题） */
  proxyUrl(url) {
    if (!url || url.startsWith('/proxy?')) return url;
    if (url.includes('conanpedia.com') || url.includes('doubaocdn.com')) {
      return '/proxy?url=' + encodeURIComponent(url);
    }
    return url;
  },

  /** 渲染单个角色条目（与截图格式一致） */
  renderChar(char, index) {
    // 头像（通过代理加载，解决跨域问题）
    const avatarUrl = this.proxyUrl(char.avatar);
    const thumbHtml = avatarUrl
      ? `<img src="${avatarUrl}" alt="${char.nameZh}" onerror="this.parentElement.innerHTML='<div class=\\'char-thumb-placeholder\\'>👤</div>'" />`
      : `<div class="char-thumb-placeholder"></div>`;

    // 第一个角色右侧浮动纪念图（100卷封面）
    let floatImg = '';
    if (index === 0) {
      floatImg = `
        <div class="float-image">
          <img src="${this.proxyUrl('https://aka.doubaocdn.com/s/H9bK1wbZcA')}" alt="100卷纪念图" onerror="this.parentElement.style.display='none'" />
          <div class="caption">《周刊少年Sunday》2021-46/47可拼合封面<br>包含16名主要角色的原作漫画100卷纪念图</div>
        </div>
      `;
    }

    return `
      ${floatImg}
      <div class="char-item">
        <div class="char-thumb">${thumbHtml}</div>
        <div class="char-detail">
          <div class="char-name-row">
            <a href="#" class="char-name-link">${char.nameZh}</a><span class="char-name-jp">（${char.nameJa}）</span>
          </div>
          <div class="char-voice-row"><strong>声优：</strong>${char.voiceActorJa || '——'}</div>
          <div class="char-desc-row">${char.desc || ''}</div>
        </div>
      </div>
    `;
  },

  /** 绑定导航点击事件 */
  bindNav() {
    document.querySelectorAll('.toc-list a').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const el = document.getElementById(targetId);
        if (!el) return;

        // 移除其他标题和目录的高亮
        document.querySelectorAll('.subsection-heading').forEach(h => h.classList.remove('active'));
        document.querySelectorAll('.toc-list a').forEach(a => a.classList.remove('active'));

        // 给当前跳转目标和左侧目录添加高亮
        if (el.classList.contains('subsection-heading')) {
          el.classList.add('active');
        }
        link.classList.add('active');

        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  },

  /** 修复HTML中硬编码的远程图片URL（如侧边栏头像） */
  fixRemoteImages() {
    document.querySelectorAll('img[src*="conanpedia.com"], img[src*="doubaocdn.com"]').forEach(img => {
      img.src = this.proxyUrl(img.src);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
