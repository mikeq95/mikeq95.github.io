---
slug: 2026/07/09/docmd-deploy-cloudflare-pages
title: 把 docmd 笔记站部署到 Cloudflare Pages，挂上自己的子域名
date: 2026-07-09
tags:
  - cloudflare
  - docmd
description: "记录一下怎么把本地用 docmd 写的笔记站，通过 wrangler CLI 部署成 Cloudflare Pages 项目，再挂上 notes.mikeq95blog.uk 这样的自定义子域名。"
---

一直用 [docmd](https://docmd.io) 写点私人笔记，本地 `docmd build` 出来的静态站点一直躺在硬盘里没上线。这次把它部署到 Cloudflare Pages，挂上 `notes.mikeq95blog.uk` 这个独立子域名，记录一下整个过程。

{/* truncate */}

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
