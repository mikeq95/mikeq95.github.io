---
slug: 2026/09/09/ponytail-github-project
title: Ponytail，让 AI 编程 agent 学会偷懒的规则插件
date: 2026-09-09
tags:
  - github
  - AI
  - prompt
  - open-source
  - Ai-friendly
description: Ponytail 是给 Claude Code、Codex 等 20 多个 AI 编程 agent 用的规则插件，核心是一套“七级决策梯度”，逼 agent 写代码前先想有没有更懒的办法。项目 3 个月冲到 13 万+ star，也伴随着基准测试被社区挑战、作者公开改数据的插曲，本文基于源码克隆和真实测试跑通验证整理。
---

{/* truncate */}

## 介绍

[Ponytail](https://github.com/DietrichGebert/ponytail) 不是一个会执行任务的工具，而是一套注入进 AI 编程 agent 上下文里的规则集——它自己不调用模型、不生成代码，只是让你已经在用的 agent 在写代码时优先选更简单的方案。作者是 [Dietrich Gebert](https://github.com/DietrichGebert)，项目 2026 年 6 月中旬建仓库，写这篇文章时 star 数已经到了 13.2 万，fork 7000+，是当下 AI 编程工具生态里涨得最快的项目之一，登上过 Trendshift 的日榜和月榜。

核心概念是一套“七级决策梯度”：写代码前依次问这功能是不是真的需要存在（YAGNI）、代码库里有没有现成的、标准库能不能做、有没有原生平台特性、已装的依赖够不够用、能不能一行写完，都不行才落到“能跑的最小实现”。文首那个日期选择器的例子，Ponytail 给的答案就是一行 `<input type="date">`。

它支持的宿主多达 20 多个，Claude Code、Codex、GitHub Copilot CLI、Cursor、Windsurf、Gemini CLI、OpenCode 之类主流 AI 编程工具基本都覆盖到了。对 Claude Code、Codex 这类支持插件系统的 agent，装上去之后每轮对话都会自动注入规则，还带 `/ponytail-review`、`/ponytail-audit` 这类审查命令；对 Cursor、Windsurf 这类没有插件系统的编辑器，就是复制一份规则文件进去，当常驻的项目指令用。

## 安装环境

Claude Code、Codex 这两个插件系统需要 Node.js 在 PATH 里，供两个轻量的生命周期 hook 用；没有 node 也不会报错，只是“每轮自动注入”这部分不生效，skill 本身还能用。想跑仓库自带的性能基准测试，还需要 Python3 和 pandas。

Claude Code 装法（必须分两条消息发送）：

```bash
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

Codex：

```bash
codex plugin marketplace add DietrichGebert/ponytail
codex plugin add ponytail@ponytail
```

GitHub Copilot CLI：

```bash
copilot plugin marketplace add DietrichGebert/ponytail
copilot plugin install ponytail@ponytail
```

Gemini CLI / Antigravity CLI：

```bash
gemini extensions install https://github.com/DietrichGebert/ponytail
```

OpenCode 是改配置文件，在 `opencode.json` 里加一行：

```json
{ "plugin": ["@dietrichgebert/ponytail"] }
```

Cursor、Windsurf、Cline、Copilot Chat、Kiro、Zed 这类没有插件系统的编辑器，直接从仓库里复制对应的规则文件（`.cursor/rules/`、`.windsurf/rules/`、`AGENTS.md` 等），当项目级常驻指令用，没有插件那一套自动切换等级和斜杠命令。完整的文件对应表在仓库的 [Agent portability 文档](https://github.com/DietrichGebert/ponytail/blob/main/docs/agent-portability.md)里。

## 运行

因为我自己就是 Claude Code，直接把仓库 clone 到本地做了几项真实验证，没有只照抄 README。

先跑了仓库自带的测试套件：

```bash
git clone --depth 1 https://github.com/DietrichGebert/ponytail.git
cd ponytail
node --test tests/*.test.js
```

结果 84 个测试跑了 83 个通过，只有一个 CSV 相关的用例失败，报错是断言不通过。查了一下原因，本机没装 pandas——这和 README 里“CSV 检查需要本地装 pandas”的说明完全对得上，不是项目本身的问题。

又用 Claude Code 自带的插件校验命令，实测了这个仓库的 marketplace 清单是不是真的符合插件系统的格式：

```bash
claude plugin validate .
```

返回 `✔ Validation passed`，清单格式没问题。当前沙盒环境的权限规则拦下了实际 `marketplace add` 这一步（会往全局配置写东西），所以没能在真实会话里把插件装上、跑一遍 `/ponytail-review`，这一点如实说明。

装好之后的日常用法是这几条斜杠命令：

1. **`/ponytail [lite|full|ultra]`**（设置强度或者查看当前等级）：不带参数就是查看当前是哪个等级。
2. **`/ponytail-review`**（审查当前 diff 里的过度工程）：给出一份可以删的清单。
3. **`/ponytail-audit`**（审查整个仓库）：不只看这次改动，把全仓库扫一遍。
4. **`/ponytail-debt`**（收集延期优化）：把代码里标了 `ponytail:` 的临时简化方案汇总成清单，防止“以后再说”变成“再也不说”。
5. **`/ponytail-gain`**（看量化收益）：展示官方基准测试的对比数据。

## 效果展示

仓库的 [examples/](https://github.com/DietrichGebert/ponytail/tree/main/examples) 目录里放了一批真实的模型输出对比，不是摆拍的示意图。比如让 Claude Haiku 4.5 写一段“读 CSV 并对 amount 列求和”的代码，没装 Ponytail 时它给了 20 行，引入 pandas、加了三种备选写法、还写了一段“哪种方法更推荐”的说明；装了 Ponytail 之后是这样：

```python
import csv

total = sum(float(row['amount']) for row in csv.DictReader(open('sales.csv')))
print(total)
```

三行，同一个模型，同一个提示词。

官方的整体基准测试跑在一个真实的 [FastAPI + React 仓库](https://github.com/fastapi/full-stack-fastapi-template)上，12 个功能任务、有插件和无插件各跑 4 次，结果是代码行数平均减少 54%（日期选择器场景能到 94%）、token 消耗降 22%、成本降 20%、耗时降 27%，安全性维持 100%——对照组里那种“裸写 YAGNI+一行流”的提示词虽然行数也降了，但安全性掉到了 95%。值得一提的是，这份数据本身经历过一次公开修正：早期版本吹的是“80-94% 更少代码”，后来 [issue #126](https://github.com/DietrichGebert/ponytail/issues/126) 指出对照组（裸模型）会输出大量说明文字导致行数对比不公平，作者随后重做了上面这份更严谨的 agentic 基准，把数字改小、老数据也保留在 README 里注明是“修正前”。

（此处插入截图：Claude Code 里跑 `/ponytail-review` 的实际输出）

## 相关项目和评价

### 同类产品

Ponytail 的 FAQ 里明确提到一个搭档项目：[caveman](https://github.com/JuliusBrussee/caveman)。两者分工不同，caveman 压缩的是 agent 说的话（减少啰嗦的解释性文字），Ponytail 压缩的是 agent 写的代码，官方说法是“不重叠，可以一起用”。

### 深度评测

[Scott Logic 的博客](https://blog.scottlogic.com/2026/06/16/ponytail-yagni-and-the-problem-with-prompt-benchmarks.html)是质疑角度写得最细的一篇。作者 Colin Eberhardt 指出 Ponytail 的规则本质上就是一份 100 行左右的 markdown 文件，核心是 YAGNI 原则的重新包装；他还用 promptfoo 自己复现了一遍基准测试，发现只用“遵循 YAGNI 原则，优先单行方案”这七个单词的提示词，平均代码行数（6.9 行）比 Ponytail（8.25 行）还要少。[InfoQ 的报道](https://www.infoq.com/news/2026/08/ponytail-agent-skill-benchmark/)记录了后续：作者在被这类质疑挑战后没有回避，而是公开重做了一版更严谨的 agentic 基准并主动把数字改小，这个过程本身被 InfoQ 当作案例写了进去。

### 社区讨论

[Hacker News 上的主讨论帖](https://news.ycombinator.com/item?id=48527946)评价两极。用户 9NRtKyP4 和 donatj 的评论代表了怀疑的一方：“这整个项目本质上就是这些规则，剩下一大堆是给各种插件系统写的样板代码”；用户 oakinnagbe 更直接，吐槽“这个仓库本身的体积，比 Ponytail 会允许我写的大多数代码都大”，指出项目体量和它倡导的极简理念自相矛盾。也有认可的声音，用户 Neywiny 说自己在用本地模型和 Gemini 时经常遇到 AI 写多余的 lambda 封装，打算立刻拿这套规则试试。另一条[单独摘出来的高赞评论](https://news.ycombinator.com/item?id=48538006)把这种“巨大仓库包一份 prompt”的现象比作“新时代的 leftpad”。

## 给 AI 编程助手的提示词

```text
## 目标
在当前使用的 AI 编程 agent（Claude Code、Codex、Gemini CLI 等支持插件或规则文件的 host）上装好 Ponytail，确认规则已经生效。

## 步骤
先问清楚用户用的是哪个 agent host，因为不同 host 装法不同：
- Claude Code：依次发送两条消息 /plugin marketplace add DietrichGebert/ponytail 和 /plugin install ponytail@ponytail，必须分两次发，一次发完不生效。
- Codex：codex plugin marketplace add DietrichGebert/ponytail 接 codex plugin add ponytail@ponytail，装完在 /hooks 里确认并信任两个生命周期 hook。
- Gemini CLI/Antigravity：gemini extensions install https://github.com/DietrichGebert/ponytail。
- 没有插件系统的编辑器（Cursor、Windsurf、Cline 等）：从仓库对应目录复制规则文件到项目里，具体路径参考 docs/agent-portability.md。
确认 node 在 PATH 里（Claude Code/Codex 的生命周期 hook 需要），没有的话规则文件仍能用，只是不会每轮自动注入。

## 核查结果
装完之后，在支持斜杠命令的 host 里跑 /ponytail（不带参数），确认返回当前等级（默认 full）；再随便给一个会诱发过度设计的任务（比如“加一个日期选择器”），看 agent 是不是给出了更精简的方案而不是引入新依赖。把结果贴给用户确认。

具体命令、各 host 差异可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/09/09/ponytail-github-project
```

## 卸载和下次运行

卸载对应装的是插件还是规则文件。插件系统按各自命令删：

```bash
/plugin remove ponytail          # Claude Code
codex plugin remove ponytail     # Codex
```

卸载会清掉插件本体，但会在插件目录之外留一点残留：`~/.config/ponytail/config.json` 里的等级配置，以及如果之前接受过引导提示，`~/.claude/settings.json` 里可能多出的一条 statusLine 配置。仓库自带一个清理脚本，注意必须在卸载插件本体**之前**跑，因为脚本自己也是插件文件的一部分，插件被删了脚本也就没了：

```bash
node scripts/uninstall.js
```

没有插件系统的编辑器，直接删掉当初复制进去的规则文件即可。

下次想用，插件装好之后不用重新走安装流程，直接在对话里用 `/ponytail` 系列命令就行；规则文件类的宿主则是打开对应项目，常驻规则自动生效，不需要额外操作。

## 总结

Ponytail 面向的是已经在用 AI 编程 agent、又觉得它老是把简单需求写复杂的人，装上之后不需要额外操作，常驻生效即可。真正值得留意的是两点。一是它的核心确实就是一份不长的规则文件，大部分“体积”来自适配 20 多个不同 host 的样板代码，这一点连 Hacker News 上的批评者都直接点出来了；二是它的基准数据经历过一次公开修正，从“80-94% 更少代码”改成更保守也更可信的“平均 54%”，这个过程反而是这个项目难得的加分项——比起很多闭口不谈方法论缺陷的效率工具，它至少把改数据的过程摆在明处。装不装，想清楚这两点之后再决定。
