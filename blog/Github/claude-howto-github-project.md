---
slug: 2026/07/04/claude-howto-github-project
title: claude-howto：一个周末学完 Claude Code 的教程项目
date: 2026-07-04
tags:
  - github
description: "claude-howto 用 10 个模块 + 自带的自测 Skill，把 Slash Commands、Memory、Skills、Hooks、MCP、Subagents 等 Claude Code 功能串成一条学习路径，记录一下怎么上手。"
---

[claude-howto](https://github.com/luongnv89/claude-howto)，一个面向 Claude Code 学习者的结构化教程 + 配置模板库，包含 10 个学习模块，从基础的 Slash Commands 到高级的 Subagents、MCP、Hooks 逐层深入（⭐ 39.2k，MIT 开源）。

{/* truncate */}

---

## 它是什么

不是一个要"运行"的程序，就是一套纯 Markdown 教程 + 模板库。核心是 **10 个模块**，从入门（Slash Commands、Memory、CLI 基础）到进阶（Checkpoints、Skills、Hooks、MCP、Subagents），再到高阶（Advanced Features、Plugins），每个模块都配教程和现成模板。官方预估全部学完 **11-13 小时**，也可以按自己的水平跳着学。文档中英双语。

---

## 怎么跑起来

不需要装依赖，先进到 `~/Documents`（或者你习惯放代码的任何目录），clone 下来看：

```bash
cd ~/Documents
git clone https://github.com/luongnv89/claude-howto.git
cd claude-howto
```

仓库自带中文翻译（`zh/` 目录），不用啃英文原版。接下来这样做：

**第一步：看文档**

```bash
open ~/Documents/claude-howto/zh/README.md
```

想看英文原版：

```bash
open ~/Documents/claude-howto/README.md
```

如果你更喜欢图形化界面操作，可以这样：打开 Finder，`command + shift + G` 唤出路径输入框，粘贴 `~/Documents/claude-howto`，回车定位过去，双击 `README.md` 打开。

**第二步：体验仓库自带的 skill**

`.claude/skills/` 下带了 `lesson-quiz` 和 `self-assessment` 两个 skill，但它们是项目级的，只有 `claude` 的工作目录是这个仓库时才能触发：

```bash
cd ~/Documents/claude-howto
claude
```

进入交互界面后输入 `/self-assessment`，它会问几个问题，帮你判断当前水平，给出个性化学习路线——这是官方推荐的第一步。

**第三步：把第一个 slash command 搬到自己的项目里试效果**

```bash
mkdir -p ~/Documents/MyBlog/my-blog/.claude/commands
cp ~/Documents/claude-howto/01-slash-commands/optimize.md ~/Documents/MyBlog/my-blog/.claude/commands/
```

```bash
ls ~/Documents/MyBlog/my-blog/.claude/commands/
```

✅ 正常：能看到 `optimize.md`

❌ 异常：提示 `No such file or directory`，先确认上一步 `claude-howto` 是否 clone 成功

然后在博客项目里跑 `claude`，输入 `/optimize` 试试效果。

---

## 实际学习节奏

跟着 `LEARNING-ROADMAP.md`（或中文版）给出的顺序学——注意官方推荐的学习顺序不完全等于目录编号 01→10，比如 `08-checkpoints` 实际排在 `03-skills` 前面，具体顺序看文档里的表格。跑了几个模块下来，比较顺的节奏是这三步循环：

1. **读教程** —— 对应模块的 `README.md`（有中文版看 `zh/` 下同名文件）
2. **动手做** —— 把模板复制到自己的真实项目里跑一遍，而不是在教程仓库里空转
3. **自测** —— 回 `claude-howto` 目录跑 `/lesson-quiz <模块名>`，查漏补缺

比起对着文档纯看，这样过一遍模块，记忆会深很多。

---

## 总结

如果已经用过 Claude Code 但只停留在"打字提问"层面，想系统了解 Slash Commands、Skills、Hooks、Subagents、MCP 这些功能怎么组合成实际工作流，claude-howto 是个挺合适的起点——不用装任何环境，克隆下来跟着 10 个模块过一遍就行。
