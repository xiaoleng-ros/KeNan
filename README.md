# 柯南的世界

参照 [conanpedia.com](https://www.conanpedia.com/) 的信息架构与视觉风格复刻的名侦探柯南资料站，
站名为「柯南的世界」（原站为「柯南百科」）。

**纯静态站点** —— HTML + 原生 JS + JSON 数据，无框架、无构建步骤、无后端依赖，
所有图片已本地化，可完全离线运行。

---

## 快速开始

```bash
cd site
node serve.js
# 打开 http://127.0.0.1:4173
```

只需要 Node.js（v18+），`site/` 目录下没有任何 npm 依赖。
直接把 `site/` 整个目录扔到任意静态托管（EdgeOne Pages、Vercel、GitHub Pages、Nginx）也能跑，
但由于使用了 `fetch()` 加载 JSON，**不能用 `file://` 直接打开**，需经 HTTP 访问。

---

## 页面一览

| 页面 | 文件 | 内容 | 数据量 |
|---|---|---|---|
| 首页 | `index.html` | 12 宫格导航 + 双栏资讯 + 精选条目 | 6 张资讯卡 |
| 原作漫画 | `manga.html` | 按年份分组的话数表，含案件名 | 799 话 / 30 个年份 |
| 电视动画 | `anime.html` | 集数表，可排序筛选 | 1194 集 |
| 剧场版 | `movies.html` | 剧场版档案表 | 29 部 |
| 角色名录 | `characters.html` | 44 个分组卡片，点击看详情 | 162 名角色 |
| 音乐 | `music.html` | 主题曲 / 片尾曲 / 插曲等 | 167 首 |
| 搜索 | `search.html` | 跨 5 个数据集统一检索 | — |
| 关于 | `about.html` | 站点说明与数据统计 | — |

**合计 2351 条真实条目**，全部来自原站 MediaWiki 内容，非虚构。

---

## 目录结构

```
.
├── site/                     # 站点本体（可直接部署）
│   ├── *.html                # 8 个页面
│   ├── serve.js              # 本地静态服务器
│   ├── css/main.css          # 全部样式（约 20KB）
│   ├── js/
│   │   ├── site.js           # 站点常量 + 导航/侧栏/页脚渲染
│   │   ├── home.js  manga.js  anime.js  movies.js
│   │   ├── characters.js  music.js  search.js  about.js
│   ├── data/*.json           # 内容数据（7 个文件，512KB）
│   ├── favicon.ico           # 多尺寸 ICO（16/32/48）
│   ├── favicon-16/32/48.png   # 各尺寸 PNG
│   ├── apple-touch-icon.png   # iOS 180×180（不透明蓝底）
│   ├── site.webmanifest       # PWA 清单
│   └── assets/
│       ├── avatars/          # 159 张角色头像（WebP）
│       └── img/              # conan.png 站标 / logo.svg favicon / bg.jpg / featured.jpg
│
├── tools/                    # 数据管线与验证工具
│   ├── parse_wikitext.js        # 抓取解析漫画/动画/剧场版/音乐 → JSON
│   ├── parse_wikitext_lib.js    # 公共解析函数
│   ├── parse_characters.js      # 解析角色页 {{角色}} 模板
│   ├── download_avatars.js      # 批量下载头像
│   ├── optimize_avatars.js      # 头像转 WebP 瘦身（依赖 sharp）
│   ├── make_icons.js            # 生成全套站点图标（依赖 sharp）
│   ├── extract_home.js          # 提取首页资讯数据
│   ├── regress.js               # 一站式回归：起服务 + 起浏览器 + 跑脚本
│   ├── with_browser.js          # 仅启动无头 Edge 执行 CDP 脚本
│   ├── shoot.js                 # 页面截图 + 渲染断言
│   ├── check_icons.js           # 图片加载状态检查
│   ├── test_ui.js               # 9 项交互回归测试
│   ├── debug_layout.js          # 元素盒模型调试
│   └── shrink_avatars.js        # 旧方案（该站未开放缩略图，已弃用）
│
└── deploy/                   # 部署
    ├── README.md              # 1Panel + OpenResty 部署步骤与排错表
    ├── nginx-1panel.conf      # gzip / 缓存 / 静态资源片段
    └── pack.js                # 打包 site/ 为 zip
```

> `shots/`（截图）、`_old/`（旧半成品）、`keNan-site.zip`、`.workbuddy/`（本地记忆与浏览器 profile）
> 都是过程产物，已在 `.gitignore` 中排除，不进仓库。

---

## 部署

`deploy/README.md` 有完整的 1Panel + OpenResty 部署步骤，要点：

- 纯静态站，**只需 OpenResty**，不需要 Node 运行时和数据库
- **必须开 gzip** —— `data/` 有 512KB JSON，不压缩传输体积差 4 倍多
- 传完先验证 `data/characters.json` 是否 200。若 404，页面框架会出来但内容一片空白（最容易踩的坑）
- 服务器上拉仓库的话用 sparse-checkout 只取 `site/`：

```bash
git clone --filter=blob:none --sparse https://github.com/xiaoleng-ros/KeNan.git
cd KeNan && git sparse-checkout set site
cp -r site/* /opt/1panel/www/sites/keNan/index/
```

---

## 数据来源与许可

本项目**全部条目数据抓取自 [柯南百科](https://www.conanpedia.com/)（银色子弹 SBSUB 出品）**，
经其 MediaWiki API 导出后做格式转换与筛选。原始内容著作权归原站及各自权利人所有。

### 逐项署名

> 按原站 [柯南百科:版权](https://www.conanpedia.com/%E6%9F%AF%E5%8D%97%E7%99%BE%E7%A7%91:%E7%89%88%E6%9D%83)
> 的要求，此处逐项注明来源条目页 URL 与改动情况。

| 本站数据 | 条目数 | 来源（柯南百科） | 本项目的改动 |
|---|---|---|---|
| 原作漫画 | 799 话 / 30 年 | [名侦探柯南原作漫画](https://www.conanpedia.com/%E5%90%8D%E4%BE%A6%E6%8E%A2%E6%9F%AF%E5%8D%97%E5%8E%9F%E4%BD%9C%E6%BC%AB%E7%94%BB) | 解析 wikitable、展开 rowspan、剥离属性、提取案件名 |
| 电视动画 | 1194 集 | [名侦探柯南电视动画](https://www.conanpedia.com/%E5%90%8D%E4%BE%A6%E6%8E%A2%E6%9F%AF%E5%8D%97%E7%94%B5%E8%A7%86%E5%8A%A8%E7%94%BB) | 同上，补全 TV/SPTV 编号 |
| 剧场版 | 29 部 | [名侦探柯南剧场版](https://www.conanpedia.com/%E5%90%8D%E4%BE%A6%E6%8E%A2%E6%9F%AF%E5%8D%97%E5%89%A7%E5%9C%BA%E7%89%88) | 同上 |
| 角色名录 | 162 名 / 44 组 | [名侦探柯南角色](https://www.conanpedia.com/%E5%90%8D%E4%BE%A6%E6%8E%A2%E6%9F%AF%E5%8D%97%E8%A7%92%E8%89%B2) | 解析 `{{角色}}` 模板为结构化字段 |
| 音乐 | 167 首 | [名侦探柯南音乐](https://www.conanpedia.com/%E5%90%8D%E4%BE%A6%E6%8E%A2%E6%9F%AF%E5%8D%97%E9%9F%B3%E4%B9%90) | 解析 wikitable |

- 首页资讯（`site/data/home.json`）抓自 [柯南百科首页](https://www.conanpedia.com/) 的渲染后 HTML
- 角色头像（159 张）取自各角色条目的 File 资源，**见下方「不适用授权的内容」**

**改动说明**：以上内容均经历了机器解析（表格结构 → JSON）、字段筛选与重新排版，
与原站表格不再是逐字一致的形式。原站条目本身可能继续被修订，本仓库数据是
2026-10 抓取的快照。

### 许可协议

本仓库的**文字与代码**按 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 授权，
全文见 [`LICENSE`](LICENSE)。三项条件：

- **署名** —— 必须注明来自柯南百科并给出原始条目页 URL（见上表）
- **非商业** —— 不得用于商业目的
- **相同方式共享** —— 衍生作品须以同一协议分发

### 不适用授权的内容

以下内容**不在** CC BY-NC-SA 4.0 范围内，本项目作者无权对其再许可：

| 内容 | 权利人 |
|---|---|
| `site/assets/avatars/` 159 张角色头像 | **青山刚昌** 老师及相关权利方 |
| `site/assets/img/bg.jpg`（背景图） | 银色子弹 SBSUB |
| `site/assets/img/featured.jpg`（精选条目图） | 银色子弹 SBSUB |
| 作品名、角色名等专有名称 | 各权利方 |

原站明确声明：

> 「柯南百科」「银色子弹」标志、网页样式及其他可独立于编辑者而应归属银色子弹组织的内容
> 均受知识产权保护，且不适用 CC BY-NC-SA 4.0 协议。

如权利方认为使用不当，请联系删除。

### 抓取方式

通过 MediaWiki API 读取条目原始 wiki 文本：

- `action=parse&prop=wikitext` —— 取条目原始 wiki 文本
- `action=query&prop=imageinfo` —— 取图片 URL 与元信息
- `action=query&prop=info&inprop=url` —— 取规范条目页 URL（用于上表署名）

`tools/parse_wikitext.js` 负责把 wiki 文本转成结构化 JSON，处理了三个核心难点：

1. **`rowspan` 单元格合并** —— 剧场版表格大量使用合并单元格，需展开为等宽矩阵并向下填充
2. **模板保留** —— `{{jp|時計じかけの摩天楼}}` 这类模板要保留最后一个参数作为显示文本
3. **属性剥离** —— `rowspan=` / `style=` 等属性不能被当作单元格内容

> 注意：该站未开放 MediaWiki 缩略图生成接口（`iiurlwidth` 被忽略、`/thumb/` 路径返回 404），
> 因此图片处理只能在本地进行。

### 已知数据边界

- 漫画章节表覆盖 `File.1` – `File.1120`，2024 年起原作改用新编号体系，原站表格本身未收录
- 剧场版共 29 部（`compilation` / `other` 分类原站为空）
- 头像 159 张全部获取成功，其余角色在原站未配图
- 数据为 2026-10 的快照，原站后续修订不会同步

---

## 性能

| 项 | 优化前 | 优化后 |
|---|---|---|
| 站点总体积 | 10.01 MB | **2.02 MB** |
| 角色头像 | 6.53 MB / 159 张 PNG | 1.09 MB / 159 张 WebP |

头像原图最大 1170×1079，而页面最大显示仅 84px（Retina 需 168px），
故统一转为 WebP 并限宽 176px，视觉无损感知，体积降 83%。
（该站未开放 MediaWiki 缩略图生成接口，`iiurlwidth` 被忽略、`/thumb/` 路径 404，故走本地 sharp 处理。）

页面按需 `fetch()` 对应 JSON，并做 `_dataCache` 缓存，切页不重复请求。

---

## 验证

```bash
# 一站式回归（自动起服务 + 无头浏览器，跑完自动关闭）
node tools/regress.js tools/test_ui.js

# 截图（桌面 / 移动端）
node tools/regress.js tools/shoot.js index
node tools/regress.js tools/shoot.js characters --mobile
```

`regress.js` 会在 4174 端口起临时服务器、在 9222 拉起无头 Edge，
把 `SITE_BASE` 环境变量传给被测脚本，结束后自动关闭两者 —— 无需手动管理端口与进程。

单独调试时也可以手动来：

```bash
cd site && node serve.js        # 起服务
node tools/with_browser.js tools/test_ui.js   # 跑脚本（自动开关浏览器）
```

当前状态：8 个页面全部 HTTP 200，链接完整性 `bad: []`，
9 项交互测试全通过，桌面（1440px）与移动（420px）双端布局验证通过。

---

## 视觉还原要点

对照原站 hibiki 皮肤的关键特征：

- 固定全屏背景图（`bg.jpg`，原站 `Hibiki-bg.jpg`）
- 半透明白色卡片 `--bg-card: rgba(252,252,252,.62)`，配毛玻璃模糊
- 卡片标题下方彩色下划线（`u-green` / `u-yellow` / `u-red` / `u-blue` / `u-purple` / `u-black`）
- 首页 12 宫格导航，上方圆形柯南头像
- 首页资讯双栏布局 `grid-template-columns: 1fr 268px`
- 左侧固定侧栏 + sticky 顶部导航 + 悬停下拉菜单
- 响应式断点 1100px / 900px，移动端汉堡菜单 + 单列堆叠

品牌标识全部改用「江户川柯南」头像，与角色页头像同源：

| 图标位 | 文件 | 说明 |
|---|---|---|
| 导航栏 logo | `assets/img/conan.png` | 38px 圆形头像 + 「柯南的世界」文字 |
| 侧栏 logo | `assets/img/conan.png` | 52px 圆形头像 |
| 首页顶部 | `assets/img/conan.png` | 58px 圆形头像 + 站名 |
| 首页宫格上方 | `assets/img/conan.png` | 46px 圆形头像 |
| favicon | `favicon.ico` / `favicon-{16,32,48}.png` | 真实头像位图 |
| favicon（矢量） | `assets/img/logo.svg` | 0.8KB，蓝底 + 矢量眼镜/领结 |
| iOS 主屏 | `apple-touch-icon.png` | 180×180，垫品牌蓝底（iOS 不支持透明） |

原站的 `logo.png`（favicon）与 `Top-conan-icon.png`（白色水印剪影，白底上几乎不可见）
均已移除，`tools/make_icons.js` 可一键重新生成全套图标。

---

## 免责声明

「柯南的世界」是个人学习与前端技术演示性质的**非官方粉丝站**，与原站及各权利方无任何关联。

### 权利归属

| 内容 | 权利人 |
|---|---|
| 站点条目数据（作品名、集数、日期、票房、制作人员等） | [柯南百科](https://www.conanpedia.com/) / 银色子弹 SBSUB（CC BY-NC-SA 4.0） |
| 角色头像 159 张 | **青山刚昌** 老师及相关权利方 |
| 背景图 `bg.jpg`、精选条目图 `featured.jpg` | 银色子弹 SBSUB |
| 《名侦探柯南》原作（漫画、动画、剧场版、角色形象、音乐） | **青山刚昌** 老师及小学馆、集英社等权利方 |
| 作品名、角色名等专有名称 | 各权利方 |

### 使用限制

- 本站**非商业用途**，不得用于任何商业目的
- 本站内容按 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 授权，
  衍生作品须以相同协议分发并保留署名
- 角色头像与背景图**不在** CC 授权范围内，本项目作者无权对其再许可

### 免责

- 本站内容为技术演示，不保证准确性、完整性或时效性
- 数据为 2026-10 抓取的快照，原站后续修订不会同步
- 如权利方认为本站使用不妥，请通过 GitHub Issues 或
  `1873048956@qq.com` 联系，将立即移除相关内容
- 本站作者不承担因使用本站内容而产生的任何责任

本站名「柯南的世界」与原站「柯南百科」无关联。原站的标志、样式与组织标识
均受其知识产权保护，本站未予使用。
