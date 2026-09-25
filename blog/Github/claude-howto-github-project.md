---
slug: 2026/07/04/claude-howto-github-project
title: claude-howto：Claude Code教程
date: 2026-07-04
tags:
  - github
description: "claude-howto 用 10 个模块和自测 Skill，把 Slash Commands、Memory、Skills、Hooks、MCP、Subagents 串成一条学习路径。"
---

## 它是什么

[claude-howto](https://github.com/luongnv89/claude-howto) 不是要跑的程序，是一套 Markdown 教程加模板。10 个模块从 Slash Commands、Memory、CLI 讲到 Skills、Hooks、MCP、Subagents，再到 Checkpoints、Plugins。官方估计全部学完 11–13 小时，也可以跳着学。中文在 `zh/`。

## 怎么开始

```bash
cd ~/Documents
git clone https://github.com/luongnv89/claude-howto.git
cd claude-howto
claude
```

进去输入 `/self-assessment`，它会按你的水平给学习路线。文档看 `zh/README.md`。

想先试一个命令，把模板拷进自己的项目：

```bash
mkdir -p ~/Documents/MyBlog/my-blog/.claude/commands
cp ~/Documents/claude-howto/01-slash-commands/optimize.md \
  ~/Documents/MyBlog/my-blog/.claude/commands/
```

在博客项目里跑 `claude`，输入 `/optimize`。

## 怎么学

顺序看 `LEARNING-ROADMAP.md`，不完全等于目录编号 01→10。每个模块走三步：读该模块 `README.md`（中文在 `zh/`），把模板拷到自己的项目里跑一遍，再回到仓库用 `/lesson-quiz <模块名>` 自测。

已经在用 Claude Code、但还停在打字提问的话，按这 10 个模块过一遍，就能把这些功能串成实际工作流。