---
slug: 2026/07/05/claude-slash-command-notes
title: Claude 的 slash command 个人总结
date: 2026-07-05
tags:
  - Claude Code
description: "记录自己在实际使用 Claude Code 过程中逐个搞懂的 slash command 用法和容易搞混的地方，陆续更新，目前整理了 /add-dir、/agents。"
---

Claude Code 里的 slash command 有 60 多个，很多平时压根没细究过具体怎么用。边用边记录一下每个命令的用法和容易踩的坑，方便自己以后查，这篇会陆续更新。

{/* truncate */}

---

## `/add-dir <path>` 

官方解释： Add a new working directory

我举个例子好了： 你有两个文件，一个是后缀为.md的文档，在'documents'里面，另外一个是图片，在'pictures'里面。
你现在想法是：我想写一个markdown格式的文档，用来写“我的攒钱计划”，图片上的是我在iPad上用手写笔写的一个大概计划。
你现在要参考这个图片来写你的名为“我的攒钱计划”的文档，但是这两个不在同一个directory里面，这时候你可以用`/add-dir <path>`来写提示词。
提示词大概是这样：（假设目前你当前目录是你要写的markdown文档里面）

```bash

/add-dir /User/xxx/Pictures/ My-handwritten-savings-plan。png 参考这个，帮我写好我的攒钱计划，要求：详细，跟图片内容基本一致。

```

---


## `/cd <path>` 

官方解释： Move this session to a new working directory


把整个会话的主工作目录换掉，同时不破坏 prompt cache。



---

## `/chrome` 与 `/claude-in-chrome` ——



- **`/chrome`** —— 配置 Chrome 
- **`/claude-in-chrome`** ——  操作Chrome 浏览器 



---

后续会陆续补充其他 slash command 的使用记录。
