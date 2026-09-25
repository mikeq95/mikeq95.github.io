---
slug: 2026/08/28/blume-github-project
title: Blume
date: 2026-08-28
tags: [markdown, open-source, llm, Ai-friendly]
description: Blume 是一个基于 Astro 和 Vite 的开源文档框架，维护一个 Markdown 文件夹就能生成带本地搜索、AI-ready 输出和组件库的静态文档站，不用自己搭一个 React 项目。
---

**来源**：[GitHub - haydenbleasel/blume](https://github.com/haydenbleasel/blume)

# 是什么

Blume 是 Hayden Bleasel 做的开源文档框架（MIT），把一文件夹 Markdown / MDX 变成可上线的文档站。底层用 Astro + Vite 生成隐藏项目 `.blume/`，你不用自己维护站点脚手架。同类里，Mintlify 是托管平台，Docusaurus / Fumadocs / Nextra 要自己养一套应用；Blume 主张「内容即站点」。需要 Node.js 22.12+。

# 核心功能 / 亮点

- **零配置起步**：目录结构推断导航；搜索、主题、OG 图默认可用，配置按需加 `blume.config.ts`（TypeScript + schema）。
- **组件免 import**：MDX 里直接用 cards、steps、tabs、accordions、code groups、file trees、diffs 等。
- **搜索**：默认本地 Orama；也可切 FlexSearch、Pagefind、Algolia、Typesense、Orama Cloud、Mixedbread。
- **给 AI 用**：自动出 `llms.txt` / `llms-full.txt`，任意页面有 `.md` 原文，可开 Ask AI、MCP server，并带 agent skills。
- **内容源**：本地文件可混远程 MDX、GitHub Releases、Notion、Sanity 或自定义后端。
- **API 文档**：OpenAPI / AsyncAPI 经 Scalar 做成带 playground 的参考页。
- **其它**：i18n、JSON-LD / sitemap / RSS、页面导出 PDF/EPUB、`blume eject` 变成独立 Astro 项目。

CLI 还包括 `add`、`sync`、`check`、`validate`、`doctor`、`audit`、`eval`（用文档答题验收）、`translate`、`version`。

# 怎么用

仓库与文档：[github.com/haydenbleasel/blume](https://github.com/haydenbleasel/blume)、[useblume.dev/docs/quickstart](https://useblume.dev/docs/quickstart)

```bash
npm install blume
npx blume init
blume dev
blume build
```

`init` 会生成 `docs/` 和 `blume.config.ts`。`build` 默认出静态站到 `dist/`，可丢到 Vercel、Netlify、Cloudflare Pages、GitHub Pages、S3。Ask AI / MCP 这类运行时能力要改成 server 输出，适配器有 Vercel、Netlify、Node、Cloudflare。

# 相关

- [官方站点 useblume.dev](https://useblume.dev/)
- [组件文档](https://useblume.dev/docs/content/components)
- [CLI 参考](https://useblume.dev/docs/reference/cli)
- [npm 包 blume](https://www.npmjs.com/package/blume)

