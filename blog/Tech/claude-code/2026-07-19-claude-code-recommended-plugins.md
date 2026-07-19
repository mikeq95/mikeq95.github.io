---
slug: 2026/07/19/claude-code-recommended-plugins
title: 推荐安装的 Claude Code 插件
date: 2026-07-19
# image: (封面图做好后填 CDN 链接，例如 https://cdn.mikeq95blog.uk/coverimage/xxx.png)
tags:
  - Claude Code
description: "结合官方文档和多方评测，整理几个跟 Next.js、Supabase、Vercel、Docusaurus/GitHub 技术栈契合的 Claude Code 插件，分官方/合作方和社区热门两类，附安装命令和优先级建议。"
---

Claude Code 的插件市场里插件不少，但不是每个都值得装——装太多权限范围大的插件，反而会拖慢速度、增加风险。这篇整理几个跟我自己技术栈（Next.js、Supabase、Vercel、Docusaurus/GitHub）比较契合的插件，分两类：官方/合作方出的（可信度高），和社区热门的（装之前得自己多留意）。

{/* truncate */}

---

## 官方 / 合作方插件

来源是 Anthropic 或对应厂商维护，可信度高，权限相对可控，推荐优先装这类。

### frontend-design

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

---

## 社区热门插件

社区插件权限范围和维护质量参差不齐，装之前最好先翻一下它的 GitHub 仓库，看看用了哪些 hooks、要什么权限。

### Context7

约 34.8 万安装。实时拉取最新版本的库文档，避免 Claude 用过时的 API 知识回答问题——像 Next.js App Router 这种版本迭代快的框架，特别容易出现"我记得的写法已经过时了"的情况，这个插件能缓解这个问题。

```bash
/plugin install context7@claude-plugins-official
```

### Superpowers

约 75 万安装，GitHub 25 万星。一整套"头脑风暴 → 写计划 → 测试 → 系统化调试"的工作流，适合做比较大的功能开发时用。因为覆盖的流程比较长、权限范围也比较大，建议先看清楚它的 hooks 具体做了什么再装。

> 社区插件的具体安装 slug 建议直接在 `/plugin` 的市场界面里搜索确认，命名会变，这里就不贴可能过期的命令了。

注意，社区插件不是不能装，只是权限一般给得比官方插件宽，装之前多花两分钟看一眼仓库，比出问题之后再排查划算。

---

## 怎么排优先级

日常工作量最大的地方是博客 UI 调整和后端项目的支付/库存逻辑，所以我自己的排序是：**frontend-design + commit-commands + Supabase/Vercel 官方插件**优先装，这四个跟日常工作关联最直接，风险也最低，都是官方/合作方来源。Superpowers 这类社区大插件先观望，等真的有大 功能要开发时再考虑装。

> 想确认自己装的插件有没有生效，可以在对话里问一句"你现在能用哪些插件"，Claude 会把当前会话加载到的插件列出来。
