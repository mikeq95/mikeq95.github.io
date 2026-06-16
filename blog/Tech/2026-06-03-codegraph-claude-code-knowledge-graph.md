---
slug: 2026/06/03/codegraph-claude-code-knowledge-graph
title: CodeGraph：让 Claude Code 少走弯路，token 省一半
date: 2026-06-03
image: https://cdn.mikeq95blog.uk/coverimage/codegraphCowerImage.png
tags:
  - github
  - AI
description: "CodeGraph 把代码库预建成知识图谱供 Claude Code 直接查询，实测减少 58% 工具调用次数、节省约 16% token 费用。"
---

今天看到一个 GitHub 项目——[CodeGraph](https://github.com/colbymchenry/codegraph)，⭐ 三万八千多，MIT 开源。核心思路：**把代码库预先建成知识图谱，让 Claude Code 直接查，而不是每次都 grep 扫文件**。装来试了试，平均省 16% 费用、减少 58% 工具调用次数。

{/* truncate */}

---

## 为什么 Claude Code 会"浪费" token

用 Claude Code 问一个架构问题，比如"这个请求是怎么到数据库的"，它会先开 Explore 子代理，跑一堆 grep/ls/Read 去找文件，找完才开始分析。**整个探索过程本身就在消耗 token**，而且很多时候读了一堆不相关的文件。

CodeGraph 的思路是：把这些探索工作提前做好，索引成本地 SQLite 数据库，Claude Code 直接查——一次工具调用返回相关符号的源码、调用图、依赖关系，不用再扫文件。

---

## 安装

**安装 CLI**（macOS/Linux，不需要 Node.js）：

```bash
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh
```

安装完记得**开新终端**，不然 `codegraph` 命令找不到。

**接入 Claude Code**：

```bash
codegraph install
```

它会自动检测你装了哪些 AI 工具（Claude Code、Cursor、Gemini CLI 等），选 Claude Code 就行，其他的不用勾。

**初始化项目**：

```bash
cd your-project
codegraph init -i
```

`-i` 是 `--index`，创建目录的同时顺手把代码建索引，省一步。以后代码有改动，文件监听会自动增量同步，不用手动管。

**怎么判断这个项目需不需要初始化？

```bash
ls your-project/.codegraph
```

有就是建过了，没有就跑一次 `codegraph init -i`。


