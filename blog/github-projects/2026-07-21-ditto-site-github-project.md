 ---
slug: 2026/07/21/ditto-site-github-project
title: ditto.site，把任意公开网页"编译"成可运行 TypeScript 项目的工具
date: 2026-07-21
tags:
  - github
description: "ditto.site 通过 Playwright 抓取网页真实渲染结果，走确定性的 capture-to-code 流水线生成 Next.js/Vite 项目，而不是靠 AI 现场瞎编页面。这篇记录一下它的原理、安装方式和使用场景。"
---

想把一个公开网站的界面搬过来做二次开发，通常要么找不到源码，要么对方压根没开源。翻到 [ditto.site](https://github.com/ion-design/ditto.site) 这个项目——MIT 协议，专门解决这个问题，思路和常见的"AI 生成页面"不太一样，用下来觉得值得写一篇。

{/* truncate */}

---

## 它是什么

ditto.site 是一个把任意公开 URL "编译"成可运行 TypeScript 项目的工具。关键区别在于它不是让 AI 看着截图现场编代码，而是先用浏览器真实抓取页面渲染出来的一切——DOM 结构、计算后的样式、布局、静态资源、字体、截图、交互状态，甚至 robots 文件、sitemap、JSON-LD、llms.txt 这些元数据，都会被捕获下来，再走一套确定性流水线生成代码。

官方把这个流程叫 "capture-to-code"：浏览器抓取 → 归一化的中间表示（IR）→ 确定性推断 → 生成应用。因为是确定性的，同一份抓取快照永远会生成一模一样的代码，不会像 AI 现场生成那样每次结果都不一样。

需要说明的是，它明确不会还原页面背后跑不到的逻辑，比如登录鉴权、支付流程、第三方 JS 脚本——生成的是页面的呈现层，不是后端业务逻辑。

---

## 安装和使用

本地 CLI 用法：

```bash
git clone https://github.com/ion-design/ditto.site.git
cd ditto.site
npm ci && npx playwright install chromium
npm run clone -- https://example.com/ --out=./output
```

需要 Node.js 20 及以上，底层浏览器自动化用的是 Playwright（Chromium）。

不想本地跑的话，也提供托管的 REST API（去 `ditto.site/api-key` 申请密钥，用 Bearer Token 调用）和 MCP Server（`https://api.ditto.site/mcp`），可以直接接进 Claude Code 这类支持 MCP 的编程 Agent 里用。

如果要跑完整的本地服务（而不只是 CLI），需要 Docker Compose 起 Postgres 和 MinIO 这些依赖；也有一个不依赖这些外部服务的 inline 模式方便先试用。

---

## 生成的项目长什么样

输出可以选 Next.js App Router 或者 Vite + React，样式可以选 Tailwind CSS 或者原生 CSS。生成结果里还带了 `AGENTS.md` 和 `ARCHITECTURE.md` 两份交接文档，方便后续再丢给 AI 编程 Agent 继续改。支持单页模式和多页模式（多页可以设路由数量上限），数据库用 Drizzle ORM 接 Postgres，静态资源存本地或者兼容 S3/R2 的对象存储。

---

## 总结

如果需要把一个公开网站的界面迁移、存档，或者快速拿一个现成设计做原型，ditto.site 的"确定性抓取再生成"思路比单纯让 AI 看图编代码要可靠——同一个输入必然得到同一份代码，方便复现和排查问题。但它解决的是"呈现层还原"，登录、支付这类真实业务逻辑还是得自己另外实现。
