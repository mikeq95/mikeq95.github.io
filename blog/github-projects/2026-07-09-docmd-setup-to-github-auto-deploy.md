---
slug: 2026/07/09/docmd-setup-to-github-auto-deploy
title: "docmd 笔记站从零配置到 GitHub 自动部署全记录"
date: 2026-07-09
tags:
  - github
description: "记录 docmd 笔记站的完整搭建过程：从零配置模式导致首页 404 排查、用 docmd init 生成正式配置，到用 wrangler CLI 部署到 Cloudflare Pages 挂自定义域名，再到接入 GitHub 实现 push 自动部署。"
---

本地跑 docmd，因为项目根目录下没建配置文件，直接进了"零配置(auto)模式"，结果首页直接 404——记录一下这次从排查原因到用 `docmd init` 生成正式配置、把笔记迁移进 `docs/` 目录的完整过程。

{/* truncate */}

---

## 背景：为什么首页会 404

最初直接运行 `npx @docmd/core dev`，因为项目根目录下没有配置文件，docmd 会进入"零配置(auto)模式"，自动扫描当前目录的 Markdown 文件来生成站点。

但零配置模式有一个规则（来自 docmd 内部的 `auto-router.js`）：**只有当源目录里存在 `index.md` 或 `README.md` 时，才会生成根路径的 `index.html`**。

当时目录下只有两篇普通命名的笔记：

- `01-slash command.md`
- `2026-07-05-claude-slash-command-notes.md`

没有 `index.md`/`README.md`，所以 `site/` 里没有生成根 `index.html`，访问 `http://127.0.0.1:3000/` 就会 404（终端当时也提示了 `Root index.html not found. Build may be incomplete.`）。

解决办法：不再依赖零配置模式，用 `docmd init` 生成正式配置，并规范源文件目录结构。以下是完整的六步操作。

---

## 第 1 步：删除旧的构建产物

```bash
rm -rf site
```

只删除 `site/` 这个生成的静态站点输出目录，不会影响任何 Markdown 笔记内容。

---

## 第 2 步：生成正式配置

```bash
npx @docmd/core init
```

这一步会自动创建：

- `package.json`
- `docmd.config.json` —— 正式配置文件（之前没有这个文件，才会跑"零配置自动模式"）
- `docs/` 目录，里面带一个示例首页 `docs/index.md`
- `assets/` 目录（css/js/images 基础结构）
- `SKILL.md`

---

## 第 3 步：把笔记迁移到 docs/ 目录

```bash
mv "01-slash command.md" "2026-07-05-claude-slash-command-notes.md" docs/
```

docmd 的源目录（`src`）默认是 `docs`，所以原本放在项目根目录的两篇笔记需要挪进 `docs/`，才能被识别为文档页面并生成路由。

迁移后可以用 `ls docs/` 确认，应该能看到：

```
01-slash command.md
2026-07-05-claude-slash-command-notes.md
index.md
```

至此，笔记文件已经全部迁移到位。

---

## 第 4 步：安装依赖

```bash
npm install
```

根据 `package.json` 把 `@docmd/core` 等依赖装到 `node_modules/`。

---

## 第 5 步：修改 docmd.config.json

`docmd init` 生成的默认配置里带有一个 `navigation` 数组，指向的是 docmd 官网的示例链接（Getting Started / GitHub），如果不处理，侧边栏会显示这些无关内容，而不是我们自己的两篇笔记。

解决方式：整个替换配置文件内容，**去掉 `navigation` 字段**，让 docmd 自动根据 `docs/` 目录结构生成导航；同时把标题改成实际站点名称。

```bash
cat > docmd.config.json << 'EOF'
{
  "title": "Kris 的笔记",
  "url": "https://docs.myproject.com",
  "src": "docs",
  "out": "site",
  "engine": "js",
  "layout": {
    "spa": true,
    "header": { "enabled": true },
    "sidebar": { "collapsible": true, "defaultCollapsed": false },
    "optionsMenu": {
      "position": "sidebar-top",
      "components": { "search": true, "themeSwitch": true }
    },
    "footer": {
      "style": "minimal",
      "content": "© 2026 Kris 的笔记.",
      "branding": true
    }
  },
  "theme": { "name": "default", "appearance": "system", "codeHighlight": true },
  "minify": true,
  "autoTitleFromH1": true,
  "copyCode": true,
  "pageNavigation": true,
  "plugins": {
    "git": { "commitHistory": true, "maxCommits": 5 },
    "seo": { "defaultDescription": "Documentation built with docmd." }
  }
}
EOF
```

字段说明：

- `title`：站点标题，展示在页面 meta 和 header 里。
- `url`：暂时用占位符，只影响 sitemap / SEO / OKF 这几个插件的输出，不影响本地开发预览。等有正式部署域名之后再改成真实地址。
- `src` / `out`：源目录 `docs`、输出目录 `site`，保持默认。
- 去掉了默认的 `navigation` 数组：不写这个字段，docmd 会在构建时自动扫描 `docs/` 目录生成侧边栏导航，无需手动维护链接。

---

## 第 6 步：启动开发服务器验证

```bash
npx @docmd/core dev
```

打开浏览器访问 `http://127.0.0.1:3000/`，确认：

✅ 正常：首页正常显示，不再是 404，侧边栏能看到两篇笔记

❌ 异常：还是 404，回头检查 `docs/` 目录下是否真的有 `index.md`

---

## 以后怎么添加新笔记

以后新增笔记，只要把 `.md` 文件放进 `docs/` 目录，docmd 就会在下次构建/热更新时自动：

- 根据文件名生成访问路径（空格会被转成短横线，例如 `我的笔记.md` → `/我的笔记/`）
- 自动加入侧边栏导航（因为 `docmd.config.json` 里没有手写 `navigation` 字段）

不需要手动改配置文件。

---

一直用 [docmd](https://docmd.io) 写点私人笔记，本地 `docmd build` 出来的静态站点一直躺在硬盘里没上线。这次把它部署到 Cloudflare Pages，挂上 `notes.mikeq95blog.uk` 这个独立子域名，记录一下整个过程。

---

## 第一步：本地构建

docmd 项目结构很简单，`docmd.config.json` 里配好 `src`（Markdown 源码目录）和 `out`（构建产物目录）就行：

```json
{
  "src": "docs",
  "out": "site"
}
```

跑一次构建：

```bash
cd ~/Desktop/lalala
npm run build
```

构建产物是纯静态 HTML，输出到 `site/` 目录，本地用 `npm run preview` 能直接预览。

---

## 第二步：用 wrangler 部署到 Cloudflare Pages

不需要在 Cloudflare 后台手动新建项目，`wrangler pages deploy` 会自动创建：

```bash
npx wrangler login
```

第一次跑会弹出浏览器窗口做 OAuth 授权，登录你的 Cloudflare 账号即可，终端里看到 `Successfully logged in` 就说明通过了。

然后直接部署 `site/` 目录：

```bash
npx wrangler pages deploy site --project-name=docmd-notes
```

第一次跑会问项目不存在要不要创建，选创建，再问一下生产分支名称（默认 `production` 直接回车）。跑完终端会打印一个 `https://<hash>.docmd-notes.pages.dev` 的预览地址，项目正式的域名是 `https://docmd-notes.pages.dev`。

⚠️ 踩过的坑：`cd` 命令如果带了多余的换行符或反斜杠会导致目录切换失败，`wrangler` 会在错误的目录下找不到 `site` 文件夹报 `ENOENT`。确认 `pwd` 输出的是项目目录再跑部署命令。

---

## 第三步：挂自定义域名

进 Cloudflare Dashboard → **Workers & Pages** → 对应项目 → **Custom domains** → **Set up a custom domain**，填入子域名，比如 `notes.mikeq95blog.uk`。

只要这个域名的 DNS 也托管在同一个 Cloudflare 账号下，点 **Continue** 后它会直接列出即将创建的 DNS 记录，确认无误后点 **Activate domain**：

| Type | Name | Content |
|---|---|---|
| CNAME | notes | docmd-notes.pages.dev |

不需要自己去 DNS 页面手动加记录，Cloudflare 会自动创建、自动打开代理（Proxied）。状态会先显示 `Initializing`，官方说最多等 48 小时全网生效，实际测下来通常几分钟到几十分钟就能访问。

---

## 验证

DNS 记录生效后，直接访问确认：

```bash
curl -sI https://notes.mikeq95blog.uk | head -5
```

看到 `HTTP/2 200` 就说明子域名已经指向新部署的站点了。

---

## FAQ

**每次更新笔记都要重新走一遍这些步骤吗？**
不用，日常更新只需要重跑 `npm run build` + `npx wrangler pages deploy site --project-name=docmd-notes` 这两条命令，项目和自定义域名只需要设置一次。

**为什么不直接用 GitHub 仓库连接自动部署？**
docmd 这类小型笔记项目本地改动频率不高，`wrangler` 直传省去了配 CI 的开销，几秒钟就能上线一次。

**pages.dev 的默认域名会失效吗？**
不会，`docmd-notes.pages.dev` 和自定义域名 `notes.mikeq95blog.uk` 会同时生效，两个地址都能访问同一个部署。

---

## 总结

| 步骤 | 命令/操作 |
|---|---|
| 构建 | `npm run build` |
| 登录 Cloudflare | `npx wrangler login` |
| 部署 | `npx wrangler pages deploy site --project-name=<项目名>` |
| 挂自定义域名 | Dashboard → Custom domains → 填域名 → Activate |
| 验证 | `curl -sI https://<你的域名>` |

整个流程下来最省心的部分是自定义域名这一步——只要域名和 Pages 项目在同一个 Cloudflare 账号下，DNS 记录完全不用手动配。

---

docmd 笔记站最早是用 `wrangler pages deploy` 直传部署的，每次改完笔记都要手动跑一遍"构建 + 上传"两条命令，跟平时 `git push` 就能更新的博客比起来总觉得多了一步。这次把它接上 GitHub，改成推送自动部署，记录一下步骤。

---

## 第一步：把项目变成 git 仓库

进项目目录，先排除不该进 git 的文件——`node_modules` 是依赖，`site` 是构建产物，交给 Cloudflare 自己在云端构建：

```bash
cd ~/Desktop/lalala
printf "node_modules/\nsite/\n" > .gitignore
```

初始化并提交：

```bash
git init
git add .
git commit -m "Initial commit: docmd notes site"
```

> 注意，macOS 会自动生成 `.DS_Store` 文件，第一次 `git add .` 很容易把它一起提交进去。不影响部署，但顺手也加进 `.gitignore` 更干净。

至此，本地仓库已经建好。

---

## 第二步：建 GitHub 仓库并推上去

装了 `gh` CLI 并登录过账号的话，一条命令就能建仓库 + 推送：

```bash
gh repo create docmd-notes --private --source=. --remote=origin --push
```

✅ 正常：终端打印出仓库地址（比如 `https://github.com/你的用户名/docmd-notes`），并提示 `Pushed commits to ...`

❌ 异常：提示未登录，先跑 `gh auth login` 走一遍授权

---

## 第三步：在 Cloudflare 里接上这个仓库

现有的 Pages 项目（用 `wrangler` 直传创建的）不用删掉重建，直接后补连 Git 仓库就行：

1. Cloudflare Dashboard → **Workers & Pages** → 对应项目 → **Settings → Build**
2. 找到 **Git repository** 这一行，点 **Connect**
3. 如果是第一次连 GitHub，会跳转到 GitHub 走一次 Cloudflare App 的安装/授权，选择只授权目标仓库（不用给全部仓库权限）
4. 选中刚才建的仓库、分支选 `main`
5. 构建配置填：
   - **Build command**：`npm run build`
   - **Build output directory**：`site`
6. 保存

---

## 验证

保存后 Cloudflare 会立刻拿最新一次提交跑一次构建，回到项目的 **Deployments** 页面看：

✅ 正常：顶部出现 **Automatic deployments enabled**，Production 下有一条新记录，Source 显示分支名和 commit 哈希，Status 是绿色对勾

❌ 异常：Status 显示失败，点进 **Details** 看构建日志，多半是构建命令或输出目录填错了

之后随便改一篇笔记，`git add` → `git commit` → `git push`，几十秒后回 Deployments 页面刷新，就能看到新的一次自动构建。

---

## 以后的日常流程

```bash
# 改完 docs/ 下的笔记之后
git add .
git commit -m "更新笔记"
git push
```

不用再记 `wrangler pages deploy` 那一长串命令，也不用手动跑 `npm run build`——Cloudflare 会在云端自己构建，构建成功后自动替换线上版本，跟博客的更新方式完全一致了。
