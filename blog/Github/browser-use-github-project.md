---
slug: 2026/08/28/browser-use-github-project
title: Browser Use，一个让 AI 智能体接管浏览器的开源框架
date: 2026-08-28
tags:
  - github
  - python
  - AI
  - open-source
  - Ai-friendly
description: Browser Use 是一个开源 Python 框架，让 AI 智能体通过 LLM 实时决策来操作浏览器，支持接入编码 Agent 的 CLI 和独立运行的 Python 库两种用法。
---

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

## 介绍

项目由 Magnus Müller 和 Gregor Žunič 两人在 2024 年底创建，一个在苏黎世，一个在旧金山。写这篇文章的时候，GitHub 上的 star 数已经涨到 111,498，fork 超过 1.2 万，在 AI 浏览器自动化这个细分方向里算是体量最大的开源项目之一。仓库最近还在持续提交代码，不是那种火过一阵就沉寂下去的项目。

接入方式分两条路。如果本来就在用 Claude Code、Codex、Cursor 这类编码 Agent，把官方给的一段自然语言提示词粘贴过去，它会自己装好 [browser-use](https://github.com/browser-use/browser-use)、注册对应的 skill，然后连上本机正在跑的浏览器。装完之后，编码 Agent 直接往 CLI 里管道一段 Python 代码去控制浏览器，点哪、填什么全靠编码 Agent 自己的模型判断，browser-use 这一层只负责把 CDP 指令真正落地，不用再单独配一个 LLM API Key。

想在自己的代码里批量跑任务，或者把浏览器能力嵌进产品逻辑，就用 Python 库这条路。装好之后 import 一个 `Agent` 类，几行代码起一个浏览器智能体。这时候智能体的判断是 browser-use 自己跑的一整套 Agent 循环，需要单独配一个 LLM API Key 才能跑起来。模型不锁定某一家：官方给了一个专门针对浏览器任务调过的 `ChatBrowserUse`，也可以直接传 `anthropic/claude-sonnet-4-6`、`openai/gpt-5.5` 这类带厂商前缀的模型 id，一个 `BROWSER_USE_API_KEY` 就能打通多家供应商。需要额外能力的话，用 `Tools()` 类配 `@tools.action` 装饰器，可以把浏览器操作之外的动作（比如调用内部 API）加进 Agent 能用的工具列表。

开源版免费，能在自己机器上完整跑起来，也能深度定制 Agent 行为。README 里也直说，多浏览器并发、代理轮换、反检测这些能力集中在付费的 Browser Use Cloud 上，配的那张跑分对比图里，云端版本的准确率明显高出一截——这是项目自己在文档里承认的取舍。云端版另外带验证码自动处理、4 小时长会话（面向付费订阅用户）、上千个第三方集成，还有可以反复执行、目标网站改版了也能继续跑的脚本能力。

跑分方面，官方开源了一个叫 `browser-use/benchmark` 的项目，覆盖 100 个真实浏览器任务，谁都能拉下来自己核实。另一项第三方的 [Odysseys](https://arxiv.org/abs/2604.24964) 榜单专门衡量 200 个长链路网页任务，browser-use 排在第一，平均分 87.4%，比 OpenAI、Anthropic、Google、微软各自的 computer-use 智能体都靠前。

## 安装环境

跑起来需要 Python 3.11 及以上。装包用 `uv` 或 `pip` 都行：

```bash
uv add browser-use
# 或者：pip install browser-use
```

如果本机还没有可用的 Chromium，CLI 自带一条安装命令，底层调的是 Playwright：

```bash
browser-use install
```

只要走的是 Python 库那条路（browser-use 自己跑 Agent 循环），就要在项目目录下建一个 `.env`，填上 LLM 的 API Key：

```bash
# .env
BROWSER_USE_API_KEY=your-key
# GOOGLE_API_KEY=your-key
# ANTHROPIC_API_KEY=your-key
```

`BROWSER_USE_API_KEY` 是官方自己发的 Key，走 `ChatBrowserUse` 或者带厂商前缀的模型 id 都能用；不用它的话，直接填 OpenAI、Anthropic、Google 这些厂商自己的 Key 也行。走 CLI 接编码 Agent 那条路，这一步可以跳过——编码 Agent 自己的模型订阅就够用。

## 运行

想直接接进 Claude Code、Codex 这类编码 Agent，把这段提示词粘贴过去，它会自己去装好环境、注册 skill、连上浏览器：

```text
Install or upgrade browser-use to the latest stable version with uv using Python 3.12, run `browser-use skill install` to register the skill, and connect it to my browser. If setup or connection fails, follow https://github.com/browser-use/browser-harness/blob/main/install.md.
```

装完之后，编码 Agent 会往 CLI 里管道一段 Python，用 `new_tab()`、`click_at_xy()`、`page_info()` 这些预置好的辅助函数直接操作浏览器，不用另起一套 browser-use 自己的 Agent 循环：

```bash
browser-use <<'PY'
new_tab("https://news.ycombinator.com")
print(page_info())
PY
```

想在自己的脚本里跑，就走 Python 库这条路，起一个 `Agent` 实例，把任务用一句自然语言描述清楚：

```python
import asyncio

from browser_use import Agent, ChatBrowserUse

async def main():
    agent = Agent(
        task="Find the number of stars of the browser-use repo",
        llm=ChatBrowserUse(model='openai/gpt-5.5'),
    )
    history = await agent.run()

if __name__ == "__main__":
    asyncio.run(main())
```

不想在本机起环境，也可以直接调 Cloud 的 REST 接口，把任务丢给云端跑：

```bash
curl -X POST https://api.browser-use.com/api/v4/runs \
  -H "X-Browser-Use-API-Key: $BROWSER_USE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"task": "Your task"}'
```

> 注意，CLI 那条路和 Python 库那条路是两套不同的机制。CLI 里编码 Agent 自己的模型是"大脑"，browser-use 只负责把 CDP 指令落地；Python 库里的 `Agent()` 是 browser-use 自己跑的一整套决策循环，两者不要混着理解。

## 效果展示

这一节的内容整理自官方文档、开源 benchmark 仓库和社区反馈，不是本地实测的结果。跑一次 Agent 循环要吃 LLM token，这篇文章按计划不实际起一个 Agent 任务去花这笔钱。

README 里给了两个具体场景。一个是帮你填一份求职申请表，把简历信息对着表单逐项填进去，[对应的示例脚本](https://github.com/browser-use/browser-use/blob/main/examples/use-cases/apply_to_job.py)在仓库里能直接找到；另一个是从社交平台提取粉丝的结构化数据，导出成 CSV，走的是 [Cloud 那条路](https://docs.browser-use.com/cloud/quickstart)。`examples/use-cases` 目录里还有比价、查预约、验证码处理、密码管理器联动这些场景的脚本，覆盖的任务类型比首页展示的要多。

跑分上，官方自建的 `browser-use/benchmark` 覆盖 100 个真实浏览器任务，这个基准本身也开源了，感兴趣可以自己跑一遍核实。第三方的 Odysseys 榜单单独衡量 200 个长链路网页任务，browser-use 排名第一，87.4% 的平均分——这条数据来自第三方榜单，不是官方自己出题自己判。

## 相关项目和评价

### 同类产品

走"AI 操作浏览器"这条路子的不止 browser-use 一家。[Stagehand](https://github.com/browserbase/stagehand) 是 Browserbase 出的项目，TypeScript 优先，思路是 Playwright 代码打底、AI 只在选择器失效或者页面结构变化的地方兜底，比 browser-use 整段任务交给 LLM 自主决策要可控一些，单步调试也更容易。[Skyvern](https://github.com/Skyvern-AI/skyvern) 走的是另一条路，靠视觉识别页面而不是读 DOM，卖点是不用针对每个网站单独适配，还带了一个无代码工作流编辑器，更适合多步骤表单和门户类的场景。

### 深度评测

独立博客 [artificiallyintimidating.com 的一篇分析](https://artificiallyintimidating.com/p/browser-use) 把 browser-use 和 Cloudflare 新出的 Kitesurf、以及 Browserbase、UiPath 的定价放在一起比较。文章提到"开源版故意留弱"这个说法是 README 自己承认的，不是外界猜测；也观察到一个现象，browser-use 的 star 数很高，但对应的社区实际讨论量相对偏少。[unsubbed.co 的评测](https://unsubbed.co/tools/browser-use/) 基于 GitHub 仓库、官方文档和另外五个第三方信息源写成，算了一笔自建 vs 云端的成本账，结论里提到非技术团队不太适合直接用这个。[CSDN 上一篇实战踩坑记录](https://blog.csdn.net/ol789012345/article/details/153603588)讲了作者用 browser-use 做项目时遇到的具体问题，比如把模型从 GPT-4o 换成 DeepSeek 之后视觉理解能力明显下降，以及每次任务都新建 Browser 实例导致会话状态丢失的 bug，文章也给出了对应的修复方法。

### 社区讨论

Reddit 上有两个帖子值得一看。[第一个](https://www.reddit.com/r/AI_Agents/comments/1r4wa5a/deterministic_verification_for_browseruse_run_step/)描述了一个真实遇到的"静默漂移"问题：点了按钮但页面状态其实没变，滚动了但内容没往下走，Agent 自己却以为操作成功了。发帖人分享了自己写的一个校验插件来堵这个漏洞。[第二个](https://www.reddit.com/r/AI_Agents/comments/1kfkp7u/how_do_you_handle_authentication_with_browseruse/)讨论的是开了 passkey 登录的网站，browser-use 用 Chromium session 登录经常会失败，这是一个具体的、目前还没被完全解决的场景。[Nous Research 在 X 上的一条帖子](https://x.com/NousResearch/status/2086881660658663469)是从性价比角度给的反馈。他们把 Hermes Agent 原本十二个独立的浏览器工具换成了 browser-use CLI 3.0 驱动的单一工具，实测下来 token 消耗降低了 48% 到 66%，准确率没有跟着掉。

## 给 AI 编程助手的提示词

```text
## 目标
在当前机器上装好 browser-use，跑通一个真实的浏览器 Agent 任务，验证 CLI 和 Python 库两条路都能正常工作。

## 步骤
1. 确认 Python 版本 >= 3.11。
2. 用 uv 安装：uv add browser-use（或 pip install browser-use）。
3. 如果本机没有可用的 Chromium，跑 browser-use install 装好浏览器依赖。
4. 跑 browser-use --doctor 检查安装、daemon、浏览器连接是否正常。
5. 询问用户是否已有 LLM API Key（BROWSER_USE_API_KEY，或者 OpenAI / Anthropic / Google 任一家的 Key），写进项目根目录的 .env；没有的话，带用户去 https://cloud.browser-use.com 申请一个，或者直接用手头已有的厂商 Key。
6. 用 Python 库跑一个最小示例验证：起一个 Agent，task 设成简单可核验的目标（比如查这个仓库的 star 数），llm 用 ChatBrowserUse 或用户提供的模型 id，await agent.run()。
7. 也可以走 CLI 那条路：跑 browser-use skill install 注册 skill，然后用 browser-use <<'PY' ... PY 直接管道 Python 调用 new_tab()、page_info() 验证浏览器连接是否通。

## 核查结果
把 browser-use --doctor 的输出，和 Agent 跑完之后的 history 结果（或者 CLI 模式下 page_info() 的返回值）贴给用户，确认浏览器确实被控制起来了，任务描述的目标真的达成了。

具体命令、细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/08/28/browser-use-github-project
```

## 卸载和下次运行

卸载对应装的两块东西：Python 包本身，还有它拉起来的 Chromium。

```bash
pip uninstall browser-use   # 或者 uv remove browser-use
rm -rf ~/Library/Caches/ms-playwright   # macOS 上删掉 browser-use install 装的 Chromium
```

`.env` 里配的 API Key 记得手动删掉或者作废，它不会跟着卸载命令自动清除。

下次想用，不用重新走一遍安装流程，确认 `.env` 里的 Key 还有效，直接跑脚本或者 CLI 命令就行：

```bash
browser-use --doctor
```

## 总结

browser-use 面向的是想让 AI 智能体真正动手操作浏览器的场景。CLI 那条路适合已经在用编码 Agent 的人，装完直接用自己 Agent 的模型订阅就能跑；Python 库那条路更适合批量、定时或者要嵌进产品里的场景，但需要单独配一个 LLM API Key，每一步操作都在消耗 token。社区反馈里，静默漂移、passkey 登录失败这些问题目前还需要自己写额外的校验或者绕过逻辑，跑分好看不代表所有场景都稳。开源版和付费云端版之间的能力差距，官方在文档里写得很直接，值不值得为验证码处理、代理轮换这些能力升级到云端，得看具体任务量。
