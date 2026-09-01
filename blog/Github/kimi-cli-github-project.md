---
slug: 2026/08/28/kimi-cli-github-project
title: Kimi CLI：正在被 Kimi Code CLI 取代的 Moonshot 终端编程 Agent
date: 2026-08-28
tags:
  - github
  - AI
  - llm
  - open-source
  - Ai-friendly
description: Kimi CLI 是 Moonshot AI 做的终端 AI 编程 Agent，能读写代码、执行 Shell 命令并接入 MCP、ACP 编辑器协议，项目目前已被官方标注为逐步停止维护，建议新用户直接使用继任项目 Kimi Code CLI。
---

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

## 介绍

仓库 README 顶部有一条用 `[!IMPORTANT]` 标出来的提示，写得很直白：[Kimi CLI](https://github.com/MoonshotAI/kimi-cli) 正在演进为 [Kimi Code CLI](https://github.com/MoonshotAI/kimi-code)，同一个团队做的下一代终端 Agent。装 Kimi Code CLI 会自动迁移原来的配置和会话，Kimi CLI 这边则会逐步停止维护，文档和已经装好的版本还能继续用，只是不再是官方推荐的路线。看这篇文章之前，这条信息比后面任何一个功能点都重要。

抛开这条提示，Kimi CLI 本身能读写代码、执行 Shell 命令、搜索和抓取网页，并根据执行反馈自主规划下一步该做什么。它在 GitHub 上的 star 数已经过万，写这篇文章时是 11,279。项目最新一次发版是 1.49.0（2026 年 7 月），CHANGELOG 里能看到迭代还在继续，只是节奏比之前慢了一些，最近一次代码提交停在 8 月初。

它不只是一个对话框式的编程助手，同时还兼任 Shell。按一下 `Ctrl-X`，就能在"AI 智能体"模式和"原生终端"模式之间切换，不用退出 Kimi CLI 另开一个窗口跑普通命令。不过 `cd` 这类 Shell 内建命令目前还不支持，官方文档给的绕开办法是用 `--work-dir` 参数指定目录，或者干脆退出重开一次会话。装上官方的 zsh-kimi-cli 插件，还能把这个切换习惯带进日常用的 Zsh 里。

编辑器这一侧，Kimi CLI 提供了一个 VS Code 扩展，把 CLI 接进编辑器界面；对 Zed、JetBrains 这类支持 Agent Client Protocol（ACP）的编辑器，它可以作为外部 Agent 直接接入，一套协议通用，不用为每个编辑器单独写适配。扩展能力上，`kimi mcp` 子命令组管理 MCP 服务器的增删查和 OAuth 授权，也支持用配置文件做一次性接入。除了终端界面，`kimi web` 命令还能起一个本地网页版，默认只监听 `127.0.0.1`，想在局域网内用需要显式加 `--network` 或指定 `--host`。

## 安装环境

跑起来需要 Python 3.12 到 3.14，官方推荐 3.13。最简单的方式是用官方安装脚本，它会先装好 `uv`（一个 Python 包管理器），再用 `uv` 装 Kimi CLI：

```bash
# Linux / macOS
curl -LsSf https://code.kimi.com/install.sh | bash
```

```powershell
# Windows (PowerShell)
Invoke-RestMethod https://code.kimi.com/install.ps1 | Invoke-Expression
```

如果本机已经装了 `uv`，也可以直接指定 Python 版本装包：

```bash
uv tool install --python 3.13 kimi-cli
```

装完用 `kimi --version` 确认一下。1.x 是这里说的 Kimi CLI（Python 打包，PyPI 分发），如果看到 0.x，说明装到的是继任项目 Kimi Code CLI（TypeScript 写的，npm 分发，单文件二进制）——两者都会装出一个叫 `kimi` 的命令，容易混。

登录这一步大概率要花钱。首次运行时执行 `/login`，可以选 Kimi Code 平台走浏览器 OAuth 授权，也可以手动填 Moonshot AI Open Platform（moonshot.cn 或 moonshot.ai）的 API Key。官方文档的 FAQ 里专门有一条"会员到期或额度用尽"的排查项，指向 `/usage` 命令和续费页面，说明免费额度大概率撑不了太久；第三方实测博客也记录过免费账号直接调用会触发 402 错误，正式订阅从每月 49 元起。这篇文章不打算实际开通付费账号验证这一步。

## 运行

装好并登录之后，在想让它工作的项目目录下执行 `kimi`，就会进入交互式会话：

```bash
cd your-project
kimi
```

首次进入项目，可以执行 `/init` 让它自己分析代码库、生成一份 `AGENTS.md`，帮它记住项目结构和约定；`/help` 能看到全部 slash 命令。

`Ctrl-X` 随时在 Agent 模式和 Shell 模式之间切换，Shell 模式下直接跑原生命令，不用退出程序。想要图形界面，`kimi web` 会在本地起一个网页版，默认地址是 `http://127.0.0.1:5494`，端口被占用会自动往后找，最多试到 5503。

接编辑器走 ACP 协议的话，先在终端里跑 `/login` 完成登录，再把编辑器配置成用 `kimi acp` 启动 Agent Server，比如 Zed 的 `~/.config/zed/settings.json`：

```json
{
  "agent_servers": {
    "Kimi CLI": {
      "type": "custom",
      "command": "kimi",
      "args": ["acp"],
      "env": {}
    }
  }
}
```

MCP 服务器用 `kimi mcp` 管理，比如加一个走 HTTP 的服务器：

```bash
kimi mcp add --transport http context7 https://mcp.context7.com/mcp --header "CONTEXT7_API_KEY: your-key"
```

`kimi mcp list` 看已经加了哪些，`kimi mcp remove <名字>` 删掉。不想用这套管理命令，也可以直接传一个 MCP 配置文件：

```bash
kimi --mcp-config-file /path/to/mcp.json
```

至此，从命令行到编辑器再到 MCP 扩展，这几条常见路径都跑通了。

## 效果展示

这一节的内容整理自官方文档和第三方评测，不是本地实测的结果。按计划要跑通完整流程需要一个付费的 Kimi 或 Moonshot 账号，这篇文章没有去开通。

文档自带的演示素材能看出个大概。README 里的 Shell 模式动图展示的是命令行输出直接切换成普通终端提示符的过程，VS Code 扩展截图能看到 Agent 面板嵌在编辑器侧边栏，ACP 集成的动图演示了在 Zed 里新建一个 Kimi CLI 会话的流程。（此处插入截图：以上任一场景的实际运行画面）

第三方实测方面，[知乎一篇上手指南](https://zhuanlan.zhihu.com/p/2003206943536326314)详细记录了配置 API、切换模式的过程；[wangruofeng007.com 的中文评测](https://wangruofeng007.com/blog/2026-01/kimi-code-cli-review/)花 4.99 元买了 7 天体验套餐，实测了分析陌生代码库、生成项目架构文档、复刻一个 React、TypeScript、Vite、Tailwind、Framer Motion 技术栈的博客网站这几个场景，结论是"整体体验接近 Claude Code"。这些都是使用者自己的记录，不是这篇文章验证过的结果。

## 相关项目和评价

### 同类产品

终端编程 Agent 这个赛道不止 Kimi CLI 一家。[Claude Code](https://github.com/anthropics/claude-code) 是社区评测里最常被拿来对比的对象，多数评测认为它在编辑器集成、可靠性和生态成熟度上更强，比如原生支持 CLAUDE.md 持久化项目记忆、企业级的 Bedrock/Vertex/Foundry 路由，代价是按 token 计费明显更贵。[OpenCode](https://github.com/anomalyco/opencode) 走的是另一条路，本身不绑定模型，Reddit 上不少人直接把 Kimi K2.5/K2.6 接进 OpenCode 用，算是运行 Kimi 模型的另一种方式。[Codex CLI](https://github.com/openai/codex) 是 OpenAI 做的同类产品，包含在 ChatGPT Plus/Pro/Business 订阅里，原生支持子代理并行任务。[Gemini CLI](https://github.com/google-gemini/gemini-cli) 是这几个里免费额度最宽松的一个，个人 Google 账号每天能跑 1000 次请求，只是暂时还没有文档化的子代理功能。

### 深度评测

英文独立博客 [andrew.ooo 的一篇评测](https://andrew.ooo/posts/kimi-code-cli-review-moonshot-terminal-agent/)明确点出 Kimi CLI 正在被 Kimi Code CLI 取代，同时对官方跑分持怀疑态度，原话是"standout scores are vendor-run"，认为这套生态目前还比 Claude Code 年轻，卖点集中在用类似 Claude Code 的工作流、但 token 成本更低。中文这边，前面提到的 wangruofeng007.com 评测之外，还有一篇更早的[上手指南](https://www.vibesparking.com/zh-cn/blog/ai/kimi/kimi-cli/2025-10-24-kimi-cli-terminal-agent-guide/)，写于项目刚发布不久的 2025 年 10 月，那会儿还没有 Kimi Code CLI 这个继任者，内容聚焦在 Shell/Agent 模式切换、Zsh 插件安装、ACP 接入 Zed 这些具体操作上。

### 社区讨论

[知乎的一篇入门指南](https://zhuanlan.zhihu.com/p/2003206943536326314)写得比较细，直接提到"首次启动需要配置 API，需要在 kimi 官网购买包月套餐"，给出的对比数据是"Kimi-CLI 与 Claude Code 套餐相比 1/7 价格的情况下可以获得 3x 用量"，也提到了 `--yolo` 这种类似 Claude Code 的免确认模式。

Reddit 上的评价没有那么一致。[一个帖子](https://www.reddit.com/r/kimi/comments/1rth36f/incredible_trick_w_k25/)里有用户直接说"kimi-cli is very barebones"，具体的抱怨是权限控制做得比较糙，原话是"it did not have a proper access control implementation. Either allow all commands or keep approving all commands"，还有评论认为"The Claude Code harness far outperforms Kimi CLI"。[另一个帖子](https://www.reddit.com/r/kimi/comments/1r7dn7v/how_to_see_usage_of_kimi/)记录的是实际开通付费套餐、拿折扣、在 kimi.com/code/console 生成 API Key、再接到第三方工具里用的完整流程，可以当作理解 Kimi 付费和取号流程的参考。

## 给 AI 编程助手的提示词

```text
## 目标
在当前机器上装好 Kimi CLI，配置好登录信息，跑通一次基本的 Agent 对话。

## 步骤
1. 确认本机 Python 版本在 3.12 到 3.14 之间。
2. 用官方脚本安装：curl -LsSf https://code.kimi.com/install.sh | bash（Windows 用对应的 PowerShell 命令），或者已有 uv 的话用 uv tool install --python 3.13 kimi-cli。
3. 跑 kimi --version 确认装的是 1.x 版本的 Kimi CLI，不是 0.x 的 Kimi Code CLI。
4. 询问用户是否已有 Kimi Code 或 Moonshot AI Open Platform 的账号、API Key，这一步大概率涉及付费，不要替用户决定要不要开通。
5. 在一个测试项目目录下运行 kimi，执行 /login 完成登录配置。
6. 登录成功后，用一句简单任务验证是否正常工作，比如让它列出当前目录结构或者读一个文件。

## 核查结果
把 kimi --version 的输出和 /login 后 Agent 实际回复的内容贴给用户，确认登录成功、能正常读取项目文件并给出回应。

具体命令、细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/08/28/kimi-cli-github-project
```

## 卸载和下次运行

卸载对应装的两块东西：Kimi CLI 本身，还有它在 `~/.kimi/` 目录下攒的所有数据，包括配置、会话、登录凭证和日志。

```bash
uv tool uninstall kimi-cli
rm -rf ~/.kimi
```

只想清掉某一类数据，不用整个删掉。登录凭证在 `~/.kimi/credentials/`，也可以直接执行 `/logout`；MCP 配置在 `~/.kimi/mcp.json`；会话记录在 `~/.kimi/sessions/`。

下次想用，不用重新走一遍安装流程，确认登录还有效直接起：

```bash
kimi
```

如果登录信息过期了，重新跑一次 `/login` 就行。

## 总结

Kimi CLI 面向的是想在终端里用 Kimi 系列模型跑编程任务、又不想为了这个单独学一套新工具的场景，Shell 融合、ACP 接编辑器、MCP 扩展这几个方向都做得比较完整。真正需要提前想清楚的是两件事。一是它已经被官方标注为逐步停止维护，新装之前值得先看看继任项目 Kimi Code CLI 是不是更合适；二是免费额度大概率不够用，`/login` 这一步几乎肯定要接一个付费账号或者充值过的 API Key。社区反馈里，权限控制"要么全放行要么全确认"的问题目前也没有更细粒度的方案，这些取舍在动手装之前最好先心里有数。
