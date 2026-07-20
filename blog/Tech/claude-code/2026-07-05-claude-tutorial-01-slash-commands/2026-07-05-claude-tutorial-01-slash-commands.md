---
slug: 2026/07/05/claude-tutorial-01-slash-commands
title: Claude教程01-Slash command
image: 'https://cdn.mikeq95blog.uk/coverimage/01 Slash Commands.png'
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

个人理解： 一般情况下，Claude只能看到你启动时候所在的目录，如果项目狠多，用这个可以让你不用来回切换对虎就可以跨目录操作代码

用法： 我常见的用法就是，比如我在github上看到一个好的网站，我会把他的仓库克隆，然后我进我的项目，用`/add-dir <path>`新加一个工作目录，这样让Claude可以访问到，然后我就可以让Claude抄一下他的UI，看看某个动画怎么做的，最后用到我的项目里面。
你们也可以这样做，代码都是公开的大家随便"抄"，[我的博客网站仓库](https://github.com/mikeq95/mikeq95.github.io)

> 人人为我，我为人人 One for all, and all for one.

注意的点：
- **每个目录独立算路径**，比如两个仓库都有"config.js",你最好`@引用具体文件路径`,避免混淆。
- **git操作是分别进行的**。两个目录的各个git状态，commit,push都是独立的。`/add-dir`不会把它们变成一个仓库
- **只在当前对话有效**。重新打开Claude code需要重新`/add-dir`

---

## `/cd <path>` 

官方解释： Move this session to a new working directory

个人理解： 把整个会话的主工作目录换掉，同时不破坏 prompt cache。

---

## `/chrome` 与 `/claude-in-chrome` ——

- **`/chrome`** —— 配置 Chrome 
- **`/claude-in-chrome`** ——  操作Chrome 浏览器 

---

## `1btw <question>`

官方解释： Ask a quick side question without interrupting the main conversation、

btw 就是by the way（顺便问一下）的意思，当Claude code在对话时候，你可以`/btw 目前我们进展到哪里了？`问一下他。
note: 无论你问什么内容，都不会污染到主聊天，所以随便问。

---

## `/clear`

官方解释： Start a new session with empty context;
previous session stays on disk (resumable ..

我觉得日常中比较常用的情况是： 比如你有任务一和任务二，当你做完任务一，把代码commit + push了，这时候可以运行`/clear`来清空上下文窗口，这样Claude code会保持专注于下一个任务上，不会被搞混。

如果你要任务一，任务二一起做，有些时候，Claude code就会改不改改的代码，写出哪些看似正确，实则漏洞一大堆的方案。

> 即便是Claude code，也会存在幻觉，所以我觉得把/clear用的频繁一点比较好。

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
`/compact 保留关于数据库设计的所有决策`,而不是简短的`/compact`

---

## `/color`

改变Claude code cli终端里的颜色用的，

```bash
/color pink
```

> 如果你的工作流需要看很多Claude,那么你可以试一下换不同窗口中的Claude的主题色，这样会更好辨认。

---

## `/config`

官方解释： open setting

---

## `/comtext`

官方解释：`contexr`：用来查看当前会话的上下文窗口使用情况,是一个诊断/监控工具。

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

2， 如果 /context 显示自由空间掉到 30% 以下,但当前任务还没做完 → /compact(带上聚焦指令保留关键信息)
如果任务已经做完、准备切到新任务 → 直接 /clear

**不常用的场景:**短会话、单文件小改动这种,基本不需要看,任务做完直接 /clear 就行,没必要专门查一次。

总结一句:它更像是个"仪表盘",在你怀疑上下文出问题、或者想优化配置(MCP、记忆文件)的时候拿出来看,而不是日常必查项。日常监控其实靠状态栏(status line)上实时显示的百分比就够了。

---

## `/copy`

官方解释： Copy Claude's last response to clipboard (or /copy N for the Nth-latest)

---

## `/cost` 

官方解释： Show session cost, plan usage, and activity stats

---

## `/doctor`

官方解释： Diagnose and verify your Claude Code installation and settings 

![/doctor命令](https://cdn.mikeq95blog.uk/coverimage/doctor命令.png)

个人理解：就是Claude的专属护士，当你觉得你的Claude Code有啥问题的时候，`/doctor`叫护士来帮你给Claude做一次全面体检。

> 当然，在中国使用Claude可能还会有网络问题，😂cao

---

## `/effort`

官方解释： Set effort level for model usage

---

## `/export`

官方解释： Export the current conversation to a file or clipboard

/export 用来把当前会话的完整对话记录导出成文本文件,方便存档、写文档或者分享。

**基本用法**:
```bash
/export
```
不带参数的话,会弹出一个对话框,让你选择"复制到剪贴板"或"保存为文件"。
如果直接指定文件名:

```bash
/export session-notes.md
```
会直接把完整对话写成文件保存到当前位置,不弹窗、不确认。

---

## `/focus`

官方解释： Toggle focus view: just your prompt, summary, and response

---

## `/ide`

官方解释： Manage IDE integrations

---

## `/login & /logout`

官方解释： Switch Anthropic accounts & Sign out from your Anthropic account

---

## `/memory`

官方解释: Open a memory file in your editor

![memory命令使用](https://cdn.mikeq95blog.uk/coverimage/memory命令.png)

个人理解：管理你的记忆用的，不用把他理解台复杂，就是你在ChatGPT，Gemini中的设置中编辑命令是一样的，只不过这次是在CLI里面。

1. 第一个User memory一般空，有啥想让写进去的你可以写进去。这个需要你特意告诉Claude，比如：xxx(你的要求)写入CLaude.md中，或者你自己编辑Claude.md才会生效。
2. 第二个project memory一般空
3. 第三个open auto-memory folder,你会打开文件夹，看到这两个东西

![open auto-momory folder](https://cdn.mikeq95blog.uk/coverimage/openFolder.png)

然后你就可以用VS code编辑啦，推荐使用：VScode

note: 我建议是打开auto-memmory的，这样，Claude就能记住你的爱好，挺好☺️

---

## `/model`

官方解释：Set the AI model for Claude Code (currently Sonnet 5)

![model](https://cdn.mikeq95blog.uk/coverimage/model命令.png)

---

## `/permission`

官方解释： Manage allow and deny tool permission rules

---

## `/plan`

官方解释： enable plan mmode

---

## `/powerup`

官方解释：Discover Claude Code features through quick interactive lessons

个人理解：可以用这个命令学习CLaude Code的一些进阶技巧。当你输入这个命令，会出现这个：

![powerup命令](https://cdn.mikeq95blog.uk/coverimage/powerup命令.png)


---

## `/recap`

官方解释：Generate a one-line session recap now

个人理解：:让 Claude 生成当前会话的简要摘要,回答"我们做到哪了、接下来要干嘛"这类问题——专门解决"离开终端一段时间回来,忘了自己刚才在干什么"的场景。


---

## `/rename`

官方解释: Rename the current conversation

个人理解： 用`/rename`时候最好加上`<name>`,否则Claude就会自己编一个

---

## `/resume`

官方解释：Resume a previous conversation

个人理解： 这个可以帮你看历史对话。所以，我觉得一个用Claude Code的好习惯就是：一个对话只完成一个任务，然后名字最好起一个相关的，这样当你想`/resume <name>`继续做的话，会方便许多。

---

## `/rewind`

官方解释： Restore the code and/or conversation to a previous point

个人理解： 在输入框按两下ESC同样可以打开rewind。这个功能很好用，
\< 类似艾克的R😂，如果你玩英雄联盟的话，这样举例子是不是更好理解点？

选择恢复的时候可以选择要么恢复代码。要么恢复对话，要么代码对话一起恢复。如果 Claude 的实现思路是对的、只是执行翻车了,选"只恢复代码"更保险——保留对话上下文的同时把文件打回原状,不用重新解释目标;反过来如果 Claude 已经理解跑偏了但你的代码没问题,就选"只恢复对话"。

## `/theme`

官方解释： Change the theme

---

## 结尾

目前就先写这么多，等我遇到了新的，再去补充。
如果你有什么好的建议，欢迎留下你的评论。