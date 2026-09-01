---
slug: 2026/07/19/claude-code-recommended-plugins
title: 推荐安装的 Claude Code 插件
date: 2026-07-19
# image: (封面图做好后填 CDN 链接，例如 https://cdn.mikeq95blog.uk/coverimage/xxx.png)
tags:
  - Claude Code
description: "结合官方文档和多方评测，整理几个跟 Next.js、Supabase、Vercel、Docusaurus/GitHub 技术栈契合的 Claude Code 插件，分官方/合作方和社区热门两类，附安装命令和优先级建议。"
---

## 官方 / 合作方插件

来源是 Anthropic 或对应厂商维护，可信度高，权限相对可控，推荐优先装这类。

### [frontend-design](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/frontend-design)

官方一方插件，目前是官方市场里安装量最高的插件之一（近 83 万次安装）。给前端 UI/视觉设计提供指导，做导航栏、glassmorphism 样式这类工作时正好用得上。

```bash
/plugin install frontend-design@claude-plugins-official
```

### Supabase 官方插件

如果项目用 Supabase 做数据库，这个插件能让 Claude 直接读 schema、写查询，对付款状态机、库存锁这类逻辑会更懂上下文，不用每次都手动贴表结构。

```bash
/plugin install supabase@claude-plugins-official
```

### Vercel 官方插件

项目部署在 Vercel 上的话，这个插件能接入部署上下文、环境变量、构建日志，出问题时不用来回复制粘贴控制台信息。

```bash
/plugin install vercel@claude-plugins-official
```

### GitHub 官方插件

仓库托管在 GitHub 上，装了之后 Claude 能直接看 PR、issue、评论，省掉手动搬运的步骤。

```bash
/plugin install github@claude-plugins-official
```

### commit-commands

官方一方插件，打包了 `/commit`、自动生成符合规范的 commit message、一键创建 PR 这些功能，日常提交代码能省不少事。

```bash
/plugin install commit-commands@claude-plugins-official
```

至此，官方/合作方这一档的插件就介绍完了，风险都不高，看哪个跟自己技术栈对得上直接装就行。

## 社区热门插件

社区插件权限范围和维护质量参差不齐，装之前最好先翻一下它的 GitHub 仓库，看看用了哪些 hooks、要什么权限。

### Context7

约 34.8 万安装。实时拉取最新版本的库文档，避免 Claude 用过时的 API 知识回答问题——像 Next.js App Router 这种版本迭代快的框架，特别容易出现"我记得的写法已经过时了"的情况，这个插件能缓解这个问题。

```bash
/plugin install context7@claude-plugins-official
```

## 怎么排优先级

日常工作量最大的地方是博客 UI 调整和后端项目的支付/库存逻辑，所以我自己的排序是：**frontend-design + commit-commands + Supabase/Vercel 官方插件**优先装，这四个跟日常工作关联最直接，风险也最低，都是官方/合作方来源。Superpowers 这类社区大插件先观望，等真的有大 功能要开发时再考虑装。

> 想确认自己装的插件有没有生效，可以在对话里问一句"你现在能用哪些插件"，Claude 会把当前会话加载到的插件列出来。

## 补充：插件安装和使用的几个细节

装插件这件事本身有几个容易踩坑的点，单独补充一下。

### 装插件时的三个 scope 怎么选

`/plugin install` 装的时候会问装给谁用，三个选项分别写到不同文件里：

| 选项 | 写入文件 | 影响范围 |
|---|---|---|
| Install for you (user scope) | `~/.claude/settings.json`，全局 | 只影响你自己，但所有项目通用 |
| Install for all collaborators (project scope) | 仓库里的 `.claude/settings.json`，会提交进 git | 影响这个仓库的所有协作者 |
| Install for you, in this repo only (local scope) | 仓库里的 `.claude/settings.local.json`，默认 gitignore | 只影响你自己，且只在这个仓库里生效 |

个人博客这种没有协作者的项目，user scope 和 local scope 效果差不多，区别只在于换项目时这个插件还在不在。project scope 是留给团队协作用的。

### 装完不会立刻生效

安装成功后会提示：

```
Installed xxx. Run /reload-plugins to apply.
```

配置文件写好了，但当前会话还在用装之前的旧状态，得手动跑一次 `/reload-plugins` 才会真正加载进来（或者直接开个新会话）。

### 插件不是只有一种"用法"，分四类

装完发现"平常根本没感觉插件在起作用"，多半是没分清插件到底是哪一类：

- **MCP 服务**——自动接入外部数据源，不用手动调，比如 `context7`（查最新库文档）、`github`（读写 issue/PR）、`playwright`（浏览器自动化）。
- **Skill**——靠关键词自动触发，没有存在感，效果体现在生成结果的质量上而不是对话提示里，比如 `frontend-design`（做 UI 需求时自动套用设计原则）、`claude-code-setup`、`claude-md-improver`。
- **Slash command**——要显式敲命令才会用，比如 `claude-md-management` 插件自带的 `/revise-claude-md`。
- **Subagent**——需要主动请求才会跑，比如 `code-simplifier`，得说"帮我简化这段代码"才会触发。

> 想查自己到底装了哪些、开没开，直接看 `~/.claude/settings.json` 里的 `enabledPlugins` 字段就行，或者在对话里问 Claude。

### LSP 插件是什么

LSP（Language Server Protocol）插件是给 Claude 接入某种编程语言的 language server，让它拿到编译器级别的精确代码信息（跳转定义、引用查找、类型检查），而不是靠读文本、grep 猜。官方市场按语言分了一堆，比如 `typescript-lsp`、`pyright-lsp`、`rust-analyzer-lsp`、`gopls-lsp`。

这篇博客项目本身是 Docusaurus，主体是 Markdown 正文，配置和组件用 JS/TS 写的，所以对应装 `typescript-lsp` 就够：

```bash
/plugin install typescript-lsp@claude-plugins-official
```

Markdown 没有类型系统和符号引用这种结构化概念，LSP 用不上，纯文本理解就够了。
