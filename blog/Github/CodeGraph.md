---
slug: 2026/06/03/codegraph-claude-code-knowledge-graph
title: CodeGraph：让 Claude Code 节省许多token
date: 2026-06-03
image: https://cdn.mikeq95blog.uk/coverimage/codegraph-en-cn.png
tags:
  - github
description: "CodeGraph 把代码库预建成知识图谱供 Claude Code 直接查询，实测减少 58% 工具调用次数、节省约 16% token 费用。"
---

## 为什么？

用Claude Code久了，你总会发现，诶？为什么额度这么快就没啦？我还什么都没做呢？Claude Code浪费Token主要因为它按”工程师“思维去跑--先探索、再循环、再把过程全部记住。
> 我觉得，这也是有时候Claude Code会把一个小问题盲目夸大的原因

[CodeGraph](https://github.com/colbymchenry/codegraph) 的思路是：把这些探索工作提前做好，索引成本地 SQLite 数据库，Claude Code 直接查——一次工具调用返回相关符号的源码、调用图、依赖关系，不用再扫文件。

## 安装

```bash
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh
```

> 先新开一个终端再跑，因为刚才装完 PATH 在当前 shell 里可能还没生效。

```bash
# 若刚才那条刚跑完，先开新终端，确认命令在
codegraph --version
```

```bash
# 给编辑器 / Agent 配 MCP
codegraph install
```

> 它会自动检测你装了哪些 AI 工具（Claude Code、Cursor、Gemini CLI 等），选 Claude Code 就行，其他的不用勾。

## 运行

cd 你的项目 && codegraph init，每个仓库都跑一次，会创建``codegraph`然后完整建图。之后文件一改，MCP服务也会增量同步.

## 卸载

1. 只从AI工具里拆掉：
···bash
codegraph uninstall
# 如果不提问的话，后面加上参数 “--yes”
```

2.，只是删除某个项目的索引

```bash
cd yourproject
codegraph uninit
# 不想确认就加 "--force"
```
3.删除CLi

```bash
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh -s -- --uninstall
```
