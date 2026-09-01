---
slug: 2026/08/28/blume-github-project
title: Blume，一个零配置的 AI-ready 文档框架
date: 2026-08-28
tags: [markdown, open-source, llm, Ai-friendly]
description: Blume 是一个基于 Astro 和 Vite 的开源文档框架，维护一个 Markdown 文件夹就能生成带本地搜索、AI-ready 输出和组件库的静态文档站，不用自己搭一个 React 项目。
---

{/* truncate */}

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

---

## 介绍

用惯 Fumadocs 或 [Docusaurus](https://docusaurus.io) 的人应该都懂那种感觉：先得自己搭一个 Next.js 或 React 项目，装好一堆依赖，配好路由和主题，才能开始写第一篇文档，后续这个应用还得跟着框架版本一起维护。[Blume](https://github.com/haydenbleasel/blume) 反过来做——你手上只有一个装 `.md`/`.mdx` 文件的文件夹，`blume` 的 CLI 在背后生成并驱动一个隐藏的 Astro 项目。导航和搜索都不用自己搭，主题也是内置好的，连分享用的 Open Graph 图片也会在构建时自动生成。哪天想要更细的控制权，跑一下 `blume eject` 就能把这层 Astro 项目导出来自己接管，不算是把路堵死。

配置文件 `blume.config.ts` 和每个目录下的 `meta.ts` 都是真的 TypeScript，用 `defineConfig`、`defineMeta` 写，编辑器能在构建之前就标出字段名拼错这类问题。MDX 里可以直接用卡片、分栏、步骤条、Tabs、手风琴、代码组这些组件，不用在每篇文档开头堆一长串 import。

核心主题不带客户端框架的 JS，页面走的是纯静态 HTML，Core Web Vitals 这类指标天然占优。搜索用内置的 Orama，本地跑索引，开发和生产环境都不用接第三方服务。SEO 这块也提前配好了：metadata 和 Open Graph 图片是构建时自动生成的，sitemap、robots.txt 这类常规文件也都有，不用自己另外拼。构建完我看了一眼输出，这几样确实都生成了。

给 AI 用的输出也是内置的：任意页面加 `.md` 后缀就能拿到这一页对应的纯 Markdown，站点构建完还会自动生成 `llms.txt` 和 `llms-full.txt`，页面上还带"复制为 Markdown"和"在 ChatGPT/Cursor 里打开"的按钮。再往前一步的托管 MCP 服务器和页面内置的 Ask AI 助手，要求把部署方式切到服务端渲染，Ask AI 还得自己配一个模型网关的 API key，默认走 Vercel AI Gateway，也能换成 OpenRouter 之类的。这两块需要付费 key 和服务端环境，我没有实测，如实说清楚。

`blume check` 用 `astro check` 做类型检查，`blume validate` 校验内部链接和资源，`blume doctor` 诊断配置和内容问题，这三个我本地都跑了一遍，输出很干净。`audit`、`validate --external`、`translate`、`eval` 这几个命令还能接本地装好的 Claude Code 或 Codex CLI，直接帮你把发现的问题改掉，不过这几个依赖本地 agent 环境，我没有连带测。部署到 Vercel、Netlify、Cloudflare Pages 基本不用自己配 adapter，会自动识别。

仓库建于 2026 年 6 月下旬，7 月 13 日发布 1.0，写这篇文章时 star 数已经过了 1350，8 月下旬还在提交代码。作者 Hayden Bleasel 之前做过 next-forge 和 Ultracite，走的也是"零配置、装完就能用"的路线，Blume 算是这条产品线上最新的一个。

---

## 安装环境

只需要 Node.js 22.12 及以上版本，不用提前准备任何内容文件——`blume init` 会自动帮你建好一个示例页面。新建一个空目录，跑初始化命令：

```bash
npx blume init
```

这一步是交互式的，会问项目位置、站点名、模板和内容目录；不想一路回答就加 `--yes` 直接用默认值：

```bash
npx blume init --yes
```

跑完会生成 `package.json`（写好了 `dev`、`build`、`doctor` 这几个 npm scripts）、`blume.config.ts`、`docs/index.mdx` 示例页面，`.gitignore` 也会自动补上 `node_modules/`、`.blume/`、`dist/`。装依赖：

```bash
npm install
```

---

## 运行

启动带热更新的开发服务器：

```bash
npm run dev
```

终端会打印本地地址，默认是 `http://localhost:4321/`。我这边访问首页返回 200，标题是 `docs/index.mdx` 里的 `title` 字段拼上站点名。给任意页面地址加 `.md` 后缀，比如 `http://localhost:4321/index.md`，能直接拿到这个页面对应的原始 Markdown，这是它"给 AI 读"能力里最直接的一环。

确认没问题之后跑构建，连本地搜索索引一起打进 `dist/`：

```bash
npm run build
```

这一步我这边也跑通了，输出目录里能看到 `llms.txt`、`llms-full.txt`、`robots.txt`、`blume-search.json`，`index.html` 是编译好的静态页面，扔到任何静态托管都能直接用。

---

## 效果展示

（此处插入截图：本地跑起来的文档站首页，左侧导航加右上角搜索框）

（此处插入截图：给页面地址加 `.md` 后缀后，浏览器里显示的纯 Markdown 内容）

本地实测跑通的一组命令输出可以参考：

```text
$ npm run dev
 astro  v7.2.9 ready in 4889 ms
┃ Local    http://localhost:4321/

$ curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/
200

$ npm run doctor
[blume] ℹ Pages: 1
[blume] ℹ Output: static
[blume] ℹ Search: orama
[blume] ✔ No problems found.
```

构建完成后的摘要面板：

```text
╭───────────────────────────────────────╮
│  Output     static                    │
│  Adapter    none                      │
│  Search     orama                     │
│  Robots     yes                       │
│  Agent JSON yes                       │
│  LLM files  yes                       │
│  Server features  none                │
╰───────────────────────────────────────╯
```

---

## 同类项目和评价

Blume 自己的 FAQ 页面点出了几个对标产品。[Mintlify](https://mintlify.com) 出效果快，但内容要写在它的托管系统里，部署也绑定在它的基础设施上，核心闭源。[Fumadocs](https://fumadocs.dev) 换了个方向，开源组件库，灵活度高，代价是给你一个要自己搭、自己长期维护的 Next.js 项目。Docusaurus 也被归进同一类：同样开源，同样需要你自己拥有并维护一个 React 应用。Blume 走的是第三条路——"框架即模板"，跑在 Astro 上，不需要额外维护一个应用。

[Winbuzzer 的一篇分析](https://winbuzzer.com/2026/07/16/blume-turns-markdown-folders-into-ai-ready-documentation-xcxwbn/)把 Blume 和 VitePress、MkDocs 放在一起横向比较，也提出了自己的疑问：Ask AI 和 MCP 这类交互功能还是要团队自己维护一个服务端 adapter，最终能不能省下 Blume 想帮你省掉的运维负担，得看实际部署情况。

Blume 是个刚发布一个半月的新项目（仓库建于 6 月下旬，7 月 13 日发布 1.0），星标涨得快，但在 X、Reddit、知乎上换了几组关键词都没搜到真正独立的社区讨论或使用体验，找到的大多是作者自己的发布推文和跟着发布节奏写的科技媒体介绍稿。作者 Hayden Bleasel 目前在 OpenAI 工作，之前做的 next-forge、Ultracite 走的也是同一种"零配置、开箱即用"路线，Blume 是这条产品线上最新的一个。

---

## 给 AI 编程助手的提示词

```text
## 目标
在当前目录下装好 Blume 文档框架，跑通开发服务器和静态构建。

## 步骤
确认 Node.js 版本 >= 22.12。在空目录里执行 `npx blume init --yes`（交互式初始化，加 --yes 跳过问答用默认值），会生成 package.json、blume.config.ts、docs/index.mdx。
注意：不要用 `npm create blume@latest` 或类似脚手架命令去初始化，这个包名不存在，会直接 404；官方方式就是先跑 `npx blume init`。
执行 `npm install` 装依赖，然后 `npm run dev` 启动开发服务器（默认 http://localhost:4321/），确认首页能正常访问。再执行 `npm run build`，确认 dist/ 目录生成，其中应包含 llms.txt、llms-full.txt、index.html。
Ask AI 助手和托管 MCP 服务器需要切换到服务端渲染部署，并且 Ask AI 还需要一个模型网关的 API key（默认 Vercel AI Gateway），这两项跳过，不用尝试配置。

## 核查结果
确认 npm run dev 起来后访问首页返回 200；确认 npm run build 无报错退出，且 dist/ 下确实生成了 llms.txt 和 index.html；把这两项结果汇报给我。

具体命令、代码细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/08/28/blume-github-project
```

---

## 卸载和下次运行

卸载：删掉 `blume` 依赖和它生成的配置、缓存、构建产物就行。

```bash
npm uninstall blume
rm -rf blume.config.ts .blume dist
```

`docs/` 目录留不留看情况——如果只是示例页面还没写自己的内容，可以一起 `rm -rf docs` 删掉；已经写了正式内容的话，这个目录不用动。

下次运行不用重新 init，直接：

```bash
npm run dev
# 或
npm run build
```

---

## 总结

Blume 想解决的是"写文档要先维护一个应用"这件事——Fumadocs、Docusaurus 都要求你拥有并升级一个 React 项目，Blume 把这层壳收进 CLI 里，你手上只剩一个 Markdown 文件夹。它才发布一个半月，社区讨论还很少，我在 X、Reddit 上换了几组关键词搜，能找到的基本是作者自己的发布动态和几家科技媒体跟着写的介绍稿，没看到带具体使用细节的独立帖子。如果你现在就在用 Docusaurus 或者自己攒的 MDX 方案写文档，又想要开箱即用的本地搜索和 AI-ready 输出，值得挑个小项目先试一版。
