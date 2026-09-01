---
slug: 2026/07/21/awesome-design-md-github-project
title: awesome-design-md，把大厂设计系统喂给 AI 编程助手的 DESIGN.md 合集
date: 2026-07-21
tags:
  - github
description: "awesome-design-md 收录了 73+ 个知名品牌网站的 DESIGN.md 设计系统文档，扔进项目根目录就能让 Claude Code 这类编程 Agent 生成风格统一的界面。这篇记录一下 DESIGN.md 是什么、怎么用。"
---

## DESIGN.md 是什么

`DESIGN.md` 是一份纯文本的 Markdown 设计系统文档。README 里的原话是：「就是个 Markdown 文件，没有 Figma 导出，没有 JSON schema，不需要特殊工具。」

里面写清楚了色板、字体层级、组件状态、间距规则、布局原则这些设计规范。AI 编程 Agent 读完之后，生成的界面会更贴品牌调性，而不是「能用但没设计感」的默认输出。

## 这个仓库收录了什么

[awesome-design-md](https://github.com/VoltAgent/awesome-design-md) 把 **73+** 个知名网站的 `DESIGN.md` 分析整理出来，按类别分好了：

- **AI / LLM**：Claude、OpenAI、Mistral、xAI
- **开发者工具**：Cursor、Vercel、Warp、Raycast
- **数据库 / DevOps**：MongoDB、Supabase、Sentry
- **SaaS**：Linear、Notion、Zapier
- **设计工具**：Figma、Framer、Webflow
- **金融**：Stripe、Coinbase
- **消费电子**：苹果、Spotify
- **怀旧系列**：比如 1996 年的 Dell 官网、2001 年的任天堂官网

每份 `DESIGN.md` 内部结构统一，一般分成九段：

1. 视觉氛围
2. 带语义角色的色板
3. 完整字体层级规则
4. 组件样式说明
5. 布局原则
6. 层次 / 阴影系统
7. 设计边界（guardrails）
8. 响应式断点
9. 给 Agent 用的提示词指南

每个条目除了 `DESIGN.md` 本体，还配了 `preview.html` 和 `preview-dark.html` 两个预览文件，能直接看到色板、字号层级和交互组件的效果。选主题之前，建议先打开预览瞅一眼。

## 怎么用

用法很直接，三步就够：

1. 打开仓库，找到你想要的品牌目录
2. 把对应的 `DESIGN.md` 复制到**项目根目录**
3. 在给 AI 编程 Agent 的指令里，明确告诉它参考这份文件来生成界面

举个真实一点的例子：你想做 Linear 风格的界面，就把仓库里 Linear 那份 `DESIGN.md` 丢进项目根目录，然后跟 Claude Code 说：

> 参考项目根目录的 `DESIGN.md` 来写这个页面，颜色、字号、间距都按里面的规范来，不要自己发挥。

注意，**只复制文件还不够**——你得在对话里点名让 Agent 读它。不说的话，它大概率还是按自己的默认审美来。

至此，日常用法已经够用了。

## 配套网站 getdesign.md

仓库背后还有个配套站：[getdesign.md](https://getdesign.md/)。定位类似「市场 + 定制请求平台」——既能浏览现成的 `DESIGN.md`，也能针对某个具体网站（包括私有站点）付费定制，提取一份专属的设计系统文档。

平时随便挑风格够用；真要复刻某个特定站的视觉，再考虑走定制。

## 总结

如果平时用 Claude Code、Cursor 这类工具让 AI 直接写界面，又不想每次从零描述设计规范，从 awesome-design-md 里挑一份风格相近的 `DESIGN.md` 扔进项目，是成本很低、见效也明显的做法。

想完全自定义的话，也可以照着上面那九段结构，自己写一份专属的。
