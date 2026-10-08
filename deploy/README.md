# 部署到腾讯云 1Panel

「柯南的世界」是纯静态站，**只需要 OpenResty，不需要 Node 运行时、不需要数据库**。

## 前置

- 1Panel 已装（截图里的 v2.3.2 可以）
- **应用商店 → 装 OpenResty**（截图显示还没装，必须先装，否则建不了网站）
- 腾讯云安全组放行 **80**（想直接 IP 访问再放 **443**）
- 域名的话，**在腾讯云 DNS 先把 A 记录指到服务器公网 IP**，解析生效再往下走

## 步骤

### 1. 建站点

**网站 → 创建网站 → 静态网站**

| 字段 | 值 |
|---|---|
| 主域名 | 先填 `服务器公网IP` 测通，之后再改域名 |
| 别名 | `keNan`（决定目录名） |
| 监听 IPv6 | 随便，不影响 |
| 创建 FTP | 不用 |
| 开启 HTTPS | 先不开，HTTP 测通再弄证书 |

建完 1Panel 会自动生成目录和 Nginx 配置，**不用手写任何配置文件**。

### 2. 传文件

根目录一般在 `/opt/1panel/www/sites/<别名>/index`（面板里点站点 →「根目录」按钮能直接看到实际路径）。

**方式 A（推荐）：面板上传**
1. **文件** → 进到上面那个 `index` 目录
2. 上传 `keNan-site.zip`（本仓库根目录已打好）
3. 右键 zip → **解压**，选「解压到当前目录」

⚠️ 解压后要确认 `index.html` 直接躺在 `index` 目录里。如果多了一层 `site/` 之类的嵌套，选中那层的内容**上移**一级。

**方式 B：scp（快，适合大文件）**
```bash
scp D:/Gcodeprojects/KeNan/keNan-site.zip root@服务器IP:/opt/1panel/www/sites/keNan/index/
# 服务器上解压
cd /opt/1panel/www/sites/keNan/index && unzip -o keNan-site.zip && rm keNan-site.zip
```

**方式 C：Git 拉取（后续更新最省事）**
```bash
cd /opt/1panel/www/sites/keNan/index
git init && git remote add origin https://github.com/xiaoleng-ros/KeNan.git
git pull origin main
```
> 仓库根目录还有 `tools/`、`deploy/` 等开发文件，**只把 `site/` 里的内容复制到站点根目录**。
> 仓库已配 `.gitignore`，`shots/`、`_old/`、`keNan-site.zip` 这些过程产物不会出现在 clone 出来的仓库里。
>
> 更省事的做法（服务器上装个 sparse-checkout，只拉 site）：
> ```bash
> git clone --filter=blob:none --sparse https://github.com/xiaoleng-ros/KeNan.git
> cd KeNan && git sparse-checkout set site
> cp -r site/* /opt/1panel/www/sites/keNan/index/
> ```

### 3. 加 Nginx 优化（可选但建议）

**网站 → 你的站点 → 配置文件**，把 `deploy/nginx-1panel.conf` 里的片段贴进 `server {}` 内。

最关键的是 **gzip**：`data/` 有 512KB JSON，不开压缩传输体积差 4 倍多。

### 4. 验证

浏览器打开 `http://服务器IP`，逐项确认：

- [ ] 首页 12 宫格正常显示
- [ ] 点进「角色」→ 头像出来了（`assets/avatars/` 159 张）
- [ ] 打开 F12 Network，看 `data/characters.json` **状态码是 200**（不是 404 / 200 但 JSON 报错）
- [ ] 直接输 `http://IP/manga.html` 能打开（验证多页路由）

> 最后一条特别重要：站点靠 `fetch('data/xxx.json')` 加载数据，如果 `.json` 请求被 404 了，页面框架会出来但内容一片空白 —— 这是最容易踩的坑。

### 5. 绑域名 + HTTPS

1. 腾讯云 DNS 加 A 记录 → 公网 IP
2. 1Panel 站点设置里改主域名为你的域名
3. **申请证书**（Let's Encrypt 免费，1Panel 可自动续期）→ 开启 HTTPS + 强制 HTTPS

## 排错

| 现象 | 原因 / 解法 |
|---|---|
| 页面有样式但内容空白 | F12 看 `data/*.json` 请求。404 = 文件没传上去；`no-store` 之类 = 权限，看目录是不是 644 |
| 直接开 IP 正常、绑域名后白屏 | 站点里有**硬编码的绝对路径**。本项目全用相对路径，若出现此问题检查 Nginx `root` 是否配错 |
| 访问 502 | OpenResty 没装或没启动，去应用商店确认 |
| 头像不显示 | `assets/avatars/` 没传全，回面板核对文件数应为 159 |
| 页面样式乱 | CSS 没加载，`/css/main.css` 是否 200 |
| 502 / 超时但文件都在 | 腾讯云**安全组**没放行 80。控制台 → 安全组 → 入站规则 |

## 更新流程

改完本地代码后：

```bash
# 1. 重新打包
cd D:/Gcodeprojects/KeNan && python -c "import zipfile,os; zipfile.ZipFile('keNan-site.zip','w',zipfile.ZIP_DEFLATED).write(...)"  # 或用打包脚本
# 2. 传到服务器覆盖（方式 A/B 任选）
# 3. 网站 → 重载
```

覆盖时**只覆盖网站目录，不要删目录重建** —— 1Panel 生成的 Nginx 配置和证书信息存在数据库里，删目录不影响，但重传更省事。
