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
├── shots/                    # 各页桌面版 / 移动端截图
└── _old/                     # 归档：旧半成品、实验脚本、原图备份
```

---

## 数据来源

所有内容抓取自 [conanpedia.com](https://www.conanpedia.com/) 的 MediaWiki 接口：

- `action=parse&prop=wikitext` —— 取条目原始 wiki 文本
- `action=query&prop=imageinfo` —— 取图片 URL 与元信息
- 首页资讯由渲染后的 HTML 提取

`tools/parse_wikitext.js` 负责把 wiki 文本转成结构化 JSON，处理了三个核心难点：

1. **`rowspan` 单元格合并** —— 剧场版表格大量使用合并单元格，需展开为等宽矩阵并向下填充
2. **模板保留** —— `{{jp|時計じかけの摩天楼}}` 这类模板要保留最后一个参数作为显示文本
3. **属性剥离** —— `rowspan=` / `style=` 等属性不能被当作单元格内容

### 已知数据边界

- 漫画章节表覆盖 `File.1` – `File.1120`，2024 年起原作改用新编号体系，原站表格本身未收录
- 剧场版共 29 部（`compilation` / `other` 分类原站为空）
- 头像 159 张全部下载成功，其余角色在原站未配图

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

本站为个人学习性质的**非官方粉丝站**，与原站及版权方无任何关联。

- 数据内容版权归 [conanpedia.com](https://www.conanpedia.com/) 及各原始权利方所有
- 《名侦探柯南》原作版权归 **青山刚昌** 老师及小学馆、集英社等权利方所有
- 动画及剧场版版权归各权利方所有
- 本站仅作技术演示用途，如权利方认为不妥请联系删除

本站名「柯南的世界」与原站「柯南百科」无关联。
