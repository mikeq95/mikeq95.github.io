---
slug: 2026/07/05/claude-tutorial-01-slash-commands
title: Claude教程01-Slash command
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
## `/1btw <question>`

官方解释： Ask a quick side question without interrupting the main conversation、

btw 就是bu the way（顺便问一下）的意思，当Claude code在对话时候，你可以·/btw 目前我们进展到哪里了？·问一下他。
note: 无论你问什么内容，都不会污染到主聊天，所以随便问。

---

## `/clear`

官方解释： Start a new session with empty context;
previous session stays on disk (resumable ..

我觉得日常中比较常用的情况是： 比如你有任务一和任务二，当你做完任务一，把代码commit + push了，这时候可以运行`/clear`来清空上下文窗口，这样Claude code会保持专注于下一个任务上，不会被搞混。

如果你要任务一，任务二一起做，有些时候，Claude code就会改不改改的代码，写出哪些看似正确，实则漏洞一大堆的方案。

即便是Claude code，也会存在幻觉，所以我觉得把/clear用的频繁一点比较好。

如果你想在`/clear`之前保留这次对话内容怎么办？

具体操作： 
```bash
mkdir -p .claude/docs
```
然后跟Claude code说： "把我们刚才关于 XXX 的架构决策/调试结论,写一份 markdown 文件到 .claude/docs/xxx.md"

写完之后你就可以 /clear,下次需要时再让 Claude 读那个文件(比如 "读一下 .claude/docs/xxx.md 里的内容"),就能把关键结论重新带回上下文,而不用把整个旧对话都保留着。

---

## `/compact`

官方解释： Free up context by summarizing the conversation so far

/clear = 直接清空,零 token,但什么都不留
/compact = 有损压缩,把长对话总结成短摘要,继续用,但会丢细节和推理链条

最好还是带上instrucitons,就是在compact 后面写一点话，比如
/compact 保留关于数据库设计的所有决策

---

## `/color`

改变Claude code cli终端里的颜色用的，

比如
```bash
/color pink
```
emmmmm有啥用？我觉得要开多个窗口coding的话，这个可以帮你更好的区分吧呵呵呵😂。
---

## `/config`

官方解释： open setting

---

## `/comtext`

官方解释：

`contexr`：用来查看当前会话的上下文窗口使用情况,是一个诊断/监控工具。

输入`/context`,你会在终端看到类似的可视化输出

```bash
101k/200k tokens (51%)
⛁ System prompt: 3.1k (1.6%)
⛁ System tools: 19.8k (9.9%)
⛁ MCP tools: 26.5k (13.3%)
⛁ Memory files: 4.0k (2.0%)
⛁ Free space: 99k (49.4%)
```
**有啥用？**
1， 长会话进行到一半,感觉 Claude 表现变差
如果 Claude 开始:

跳过步骤、给出敷衍的回答
忘记你前面说过的某个细节
逻辑突然变得不连贯

这时候先跑一下 /context 看看是不是已经接近上限了,而不是直接怀疑模型"变笨"了——很多时候只是上下文快满,信息互相挤占导致的。

2，接了很多 MCP server,想知道谁在"偷"你的 token
之前提到过,一个 MCP server(比如 playwright-mcp)可能光是把工具挂上,不用都要占掉 7% 以上的窗口。如果你接了三四个 MCP,想知道哪个最占空间、值不值得关掉,/context 配合 /mcp 一起看很直接。

3， 开始一个大任务之前,先摸个底
比如你准备让 Claude 处理一个大改动(比如重构 CheapChina 的订单状态机),开始前先看一眼 /context,确认还有多少自由空间,心里有数——快满了就先 /clear 或 /compact 再开始,免得干到一半被打断
4， 怀疑 CLAUDE.md / 记忆文件写得太臃肿
如果你感觉每次开场就已经"损耗"了不少空间,/context 能直接看到 Memory files 那一项占了多少百分比,方便你回头精简 CLAUDE.md。
5. 决定该用 /compact 还是 /clear 的判断依据

如果 /context 显示自由空间掉到 30% 以下,但当前任务还没做完 → /compact(带上聚焦指令保留关键信息)
如果任务已经做完、准备切到新任务 → 直接 /clear

**不常用的场景:**短会话、单文件小改动这种,基本不需要看,任务做完直接 /clear 就行,没必要专门查一次。
总结一句:它更像是个"仪表盘",在你怀疑上下文出问题、或者想优化配置(MCP、记忆文件)的时候拿出来看,而不是日常必查项。日常监控其实靠状态栏(status line)上实时显示的百分比就够了。
---

## `/copy`

官方解释： Copy Claude's last response to clipboard (or /copy N for the Nth-latest)

---


---

## `/cost` 

官方解释： Show session cost, plan usage, and activity stats

---

## `/doctor`

官方解释： Diagnose and verify your Claude Code installation and settings 

## `/effort`

官方解释： Set effort level for model usage

## `/export`

官方解释： Export the current conversation to a file or clipboard

/export 用来把当前会话的完整对话记录导出成文本文件,方便存档、写文档或者分享。

**基本用法**:
···bash
/export
```
不带参数的话,会弹出一个对话框,让你选择"复制到剪贴板"或"保存为文件"。
如果直接指定文件名:

···bash
/export session-notes.md
```
会直接把完整对话写成文件保存到当前位置,不弹窗、不确认。

## `/focus`

官方解释： Toggle focus view: just your prompt, summary, and response

## `/ide`

官方解释： Manage IDE integrations

连接后能获得的功能:

实时看到你在编辑器里的操作——你在 VS Code 里打开哪个文件、选中了哪段代码,Claude Code 能感知到,不用你手动复制粘贴代码片段告诉它"我在看这个"
diff 直接在 VS Code 里显示——Claude 改代码时,不再是终端里输出一堆文本 diff,而是像正常 Git diff 一样在 VS Code 里高亮显示改动的地方,审查起来更直观
文件同步更及时——Claude 在终端里改了文件,VS Code 里打开的对应文件会自动刷新,不用你手动重新加载
选中代码直接当上下文——比如你在 VS Code 里选中一段有问题的函数,回到 Claude Code 直接问"这段有什么问题",它就知道你指的是哪段,不用你重新粘贴。
什么时候值得连:
如果你平时开发是"VS Code 开着项目,终端开着 Claude Code 来回切"这种工作流,连上 IDE 能省掉不少来回复制粘贴、手动刷新文件的动作。如果你更习惯纯终端里跟 Claude 对话、看 diff,不连也完全没问题,不影响核心功能。