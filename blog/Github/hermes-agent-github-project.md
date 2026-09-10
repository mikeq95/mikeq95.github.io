---
slug: 2026/09/09/hermes-agent-github-project
title: Hermes Agent，Nous Research 出的会自我进化的终端 AI Agent
date: 2026-09-09
tags: [github, python, open-source, AI, Ai-friendly]
description: Hermes Agent 是 Nous Research 开源的一款终端 AI agent，带记忆系统、技能自我改进和消息平台网关，能接 Telegram、Discord、Slack 等渠道。本文基于官方 README 整理，因为安装脚本会向系统目录写入工具、且需要自备 LLM API Key，没有在本地实际跑起来验证；另外这个仓库的 star 数据有明显异常，文中做了说明。
---

{/* truncate */}

## 介绍

[Hermes Agent](https://github.com/NousResearch/hermes-agent) 是一个用 Python 写的终端 AI agent，MIT 协议开源。它不是简单套壳某个大模型 API 的聊天工具，README 里强调的核心是一套闭环学习机制：agent 会自己整理记忆、定期提醒自己沉淀知识、做完复杂任务后自动生成技能，这些技能之后还会在使用中持续改进，同时支持搜索自己过去的对话记录，跨会话建立起对使用者的理解。

> 这里要提醒一句：这个仓库的 star 数据有点反常。截至写这篇文章时，star 数是 24.3 万，但真正订阅关注仓库动态的只有 951 人，open issue 却有 4.1 万条——仓库是 2025 年 7 月才建的，一年多时间涨到这个体量，star 和订阅数之间的比例又差这么多倍，正常的自然增长很难长这样，看起来更像是被刷过星。这不代表项目本身不能用，但"star 很高"这件事在这里不适合当作项目质量或受欢迎程度的证据。

功能覆盖得比较广：内置一个功能完整的终端 UI（多行编辑、斜杠命令自动补全、对话历史、可以打断当前任务插话）；同时是个多平台网关，一套进程能同时接 Telegram、Discord、Slack、WhatsApp、Signal，语音留言还能自动转文字；执行环境不锁定在本机，支持本地、Docker、SSH、Singularity、Modal、Daytona、Vercel Sandbox 七种终端后端，其中 Daytona 和 Modal 这两个是无服务器的，agent 的运行环境空闲时会休眠，几乎不产生费用，理论上可以扔到一台 5 美元的 VPS 上跑，也能挂到 GPU 集群上；另外还带一个基于 cron 的定时任务系统，用自然语言描述"每天生成报告""每晚备份"这类周期性工作，可以委派给隔离的子 agent 并行处理多条工作流。模型这块不锁定供应商，Nous 自己的 Portal、OpenRouter、OpenAI 或者任何自定义端点都能接，用 `hermes model` 一条命令切换，不用改代码。

---

## 安装环境

> 这一节没有实际跑起来验证：官方安装脚本会往用户的真实系统目录（`~/.hermes`，Windows 上是 `%LOCALAPPDATA%\hermes`）安装 uv、Python 3.11、Node.js、ripgrep、ffmpeg 这些系统级工具，属于会改动本机环境的操作；真要跟它对话还需要自备一个 LLM 供应商的 API Key。下面按官方 README 整理，没有一步步跑通。

Linux、macOS、WSL2、Termux 用一行命令安装：

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

Windows 原生（不需要 WSL）用 PowerShell：

```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

安装脚本会自动处理好 uv、Python 3.11、Node.js、ripgrep、ffmpeg，以及 Windows 上一份便携版 Git Bash（解压到 `%LOCALAPPDATA%\hermes\git`，不需要管理员权限，跟系统装的 Git 完全隔离）。如果本机已经装了 Git，脚本会检测到并直接复用，不会重复装。

装完之后：

```bash
source ~/.bashrc    # 或 source ~/.zshrc，重新加载 shell
hermes              # 开始对话
```

想给贡献代码用的开发环境，官方建议基于安装器生成的完整 checkout（一般在 `$HERMES_HOME/hermes-agent`，也就是 `~/.hermes/hermes-agent`）去改，而不是另开一个手动 clone：

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
cd "${HERMES_HOME:-$HOME/.hermes}/hermes-agent"
uv pip install -e ".[all,dev]"
scripts/run_tests.sh
```

如果只是想要一次性、不留痕迹的手动 clone（比如 CI 环境），README 里特别提醒：虚拟环境要建在被 clone 的源码目录之外——因为 agent 本身可以对自己的 checkout 目录执行相对路径命令，如果 venv 就建在这个目录里面，agent 跑起来的相对路径操作有可能把正在运行的运行时环境自己删掉。

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv venv ~/.hermes/venvs/hermes-dev --python 3.11
source ~/.hermes/venvs/hermes-dev/bin/activate
uv pip install -e ".[all,dev]"
scripts/run_tests.sh
```

至此，安装流程已经按文档理清楚，下面是配置和启动的步骤。

---

## 运行

> 同样没有实际跑起来，按官方文档整理。

首次运行需要跑一遍设置向导，选模型供应商、填 API Key：

```bash
hermes setup
```

不想一个个账号申请 API Key 的话，官方提供了一个叫 Nous Portal 的托管方案，一次订阅覆盖模型调用、联网搜索（Firecrawl）、图片生成（FAL）、语音合成（OpenAI TTS）、云端浏览器（Browser Use）这几类工具，装完直接一条命令接入：

```bash
hermes setup --portal
```

日常用到的命令大致是这些：

```bash
hermes              # 交互式 CLI，开始一段对话
hermes model        # 选择/切换 LLM 供应商和模型
hermes tools        # 配置启用哪些工具
hermes gateway      # 启动消息网关，接 Telegram/Discord 等
hermes doctor        # 诊断安装/配置问题
hermes update        # 更新到最新版本
```

如果是从 OpenClaw 迁移过来的老用户，`hermes setup` 会自动检测 `~/.openclaw` 目录并提示迁移，人设文件、记忆、技能、命令白名单、API Key 都能带过来，也可以单独跑 `hermes claw migrate --dry-run` 先预览会迁移哪些东西。

---

## 效果展示

> 没有实际运行截图，这里按 README 的功能描述转述。

CLI 里是一个完整的终端 UI：多行输入、斜杠命令自动补全、流式输出工具调用过程，任务执行到一半可以直接打断插话重新引导方向。切到消息网关模式后，同一个 agent 进程可以同时挂在 Telegram、Discord、Slack、WhatsApp、Signal 上，对话上下文在不同平台之间是连续的，发一段语音备忘录过去也会自动转成文字处理。

记忆这块官方描述是"闭环"的：agent 会主动整理值得记住的信息、定期提醒自己该往记忆里沉淀点什么，复杂任务做完之后还会自动总结成一条可复用的技能，这些技能会在后续使用中不断被打磨；历史对话支持基于 FTS5 的全文检索，配合 LLM 做摘要，跨会话也能翻到之前聊过的内容。

（此处插入截图：`hermes` CLI 对话界面、Telegram 网关收发消息示例）

---

## 给 AI 编程助手的提示词

```text
## 目标
在本机把 Hermes Agent（github.com/NousResearch/hermes-agent）装起来，配好一个 LLM 供应商，能用 hermes 命令跑通一次对话。

## 步骤
Linux/macOS/WSL2 用 curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash 一键安装；Windows 原生用 PowerShell 跑 iex (irm https://hermes-agent.nousresearch.com/install.ps1)。装完 source 一下 shell 配置文件（~/.bashrc 或 ~/.zshrc）。
需要用户提供一个 LLM 供应商的 API Key（OpenRouter、OpenAI、Anthropic 任选其一，或者用户有 Nous Portal 订阅的话跑 hermes setup --portal 一次性接入模型/搜索/图片生成/语音这些能力），API Key 不要凭空生成或猜测，问用户要。
跑 hermes setup 走一遍设置向导，或者直接 hermes model 选供应商和模型。
如果本机之前装过 OpenClaw，hermes setup 会检测 ~/.openclaw 并提示迁移，按需处理，不是必须项。

## 核查结果
跑 hermes doctor 确认没有报错；跑 hermes 发一句话确认能收到模型的正常回复；如果配了消息网关，用 hermes gateway 启动后到对应平台发一条消息确认能收到回复。把结果贴给用户确认。

具体命令、参数细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/09/09/hermes-agent-github-project
```

---

## 卸载和下次运行

卸载对应"安装环境"那节装了什么，这里就删什么：删掉 `~/.hermes`（Windows 上是 `%LOCALAPPDATA%\hermes`）整个目录，如果 shell 配置文件里被安装脚本加过 PATH 之类的行，一并删掉。安装脚本顺带装的 uv、Node.js、ripgrep、ffmpeg 如果是脚本新装的（不是复用本机已有的），也可以按各自的方式卸载。

下次运行不用重新走一遍安装，直接：

```bash
hermes
```

想更新到最新版本：

```bash
hermes update
```
