---
slug: 2026/08/28/wigolo-github-project
title: wigolo：本地优先、免 API Key 的网络智能 MCP server
date: 2026-08-28
tags: [github, AI, llm, open-source, Ai-friendly]
description: wigolo 是一个本地优先的 MCP server，把网页搜索、抓取、爬取、结构化提取等六个核心工具做成完全不需要 API Key 的本地引擎，这篇记录实际装好后逐个测试这六个工具的过程。
---

[wigolo](https://github.com/KnockOutEZ/wigolo) 是一个跑在本机的 MCP server，专门给 AI coding agent 处理"上网"这件事。它的六个核心工具完全不用 API Key，查询免费，数据也不会离开本机。

{/* truncate */}

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

---

## 介绍

[wigolo](https://github.com/KnockOutEZ/wigolo) 是 KnockOutEZ 做的一个本地优先 MCP server。它把网页搜索和抓取这两件 AI agent 上网最常用的动作装进一个跑在本机的引擎里，另外还能顺着链接爬多页网站，也能把页面内容按结构化的方式提取出来。六个核心工具完全不需要 API Key，查询也不计费。数据全部留在本机的 `~/.wigolo/` 目录，不会传到别处。

项目用 TypeScript 写成，今年 4 月才创建。GitHub 上已经攒了 4700 多个 star，不过眼下还是 public beta 阶段，没到 v1。作者说核心功能背后有 7600 条测试用例撑着。

再往上，wigolo 还有两个需要接一个 LLM key 才能用的自治工具。research 把一个问题拆成好几个子查询，并行抓取来源，最后合成一份带引用的报告。agent 只要给一句自然语言指令，就会自己规划该搜什么、抓哪些 URL，在给定的时间预算内跑完。这两个工具我这次没测，得配一个免费的 Gemini key 或者本地 Ollama 才能用，怎么配后面会提一句。

真正让 wigolo 和普通搜索 API 不一样的，是它在每条结果里都带上原文出处的字节偏移量，官方叫 `source_span`。实测搜一个词，返回结果里确实带着 `source_span` 的 `start`/`end` 字段，精确到摘录文字在原网页里的哪个位置，agent 引用内容的时候能明确指到具体是哪一段，不是"大概来自这篇文章"这种模糊说法。每条结果的可信度也拆开给分，不是甩一个笼统的相关度数字了事，语义相关度和关键词匹配度是主要依据，另外还会看有几个搜索引擎同时召回同一条结果。哪个引擎掉线、被限流，wigolo 也不会悄悄把结果里的空缺抹平，这点在效果展示部分具体测过。

---

## 安装环境

不用提前装什么依赖，直接用 `npx` 跑最新版就行，只要求 Node.js ≥ 20：

```bash
npx wigolo init
```

第一次跑会先检查系统环境，然后依次下载无头浏览器引擎、语义检索用的 embedding 模型，以及给搜索结果重排序的 ML 模型，加起来大概 1.5 GB，看网速可能要等几分钟，这是正常现象，不是卡住了。我这边用的是 Node 26，npm 提前打印了一条 `better-sqlite3` 不在官方支持版本范围（20.x-25.x）的警告，不过实际跑下来没受影响，`init` 照样能装完。

如果想顺便接进某个编程 agent，比如 Claude Code 或 Cursor，装的时候可以一起接上：

```bash
npx wigolo init --agents=claude-code,cursor
```

装完用 `doctor` 看一眼各组件状态：

```bash
npx wigolo doctor
```

> 注意，我第一次跑 `init` 的时候，日志里冒出一行 `reranker failed: Failed to load reranker model: terminated`，重排序模型下载到一半失败了。`init` 没有因此整个退出，接着把 Firefox、WebKit 这两个浏览器内核也装完了。跑一遍 `doctor` 再看，重排序模型这时候已经显示 `installed`，后面几次实际调用也都能正常加载，没再出过问题。

至此，wigolo 的本地环境已经装好，可以往下运行了。

---

## 运行

装完之后有两种用法。什么参数都不加，直接跑：

```bash
wigolo
```

这条命令会在 stdio 上起一个 MCP server，配合 `init` 时 `--agents` 接好的编程 agent 就能直接用。另一种是命令行一次性调用某个工具，方便单独验证某个功能，接下来六个核心工具都是用这种方式测的。

至此，wigolo 已经能正常跑起来。

---

## 效果展示

### search

先测最基础的关键词搜索：

```bash
npx wigolo search "local-first software" --max-results 5 --json
```

第一次跑卡在加载重排序模型这一步，等了三分多钟都没出结果，我把进程杀掉重跑了一次。第二次模型已经加载过，整个搜索过程只用了 4.5 秒。4 个引擎里 bing、duckduckgo、wikipedia 都正常返回结果，marginalia 被限流返回了 429，wigolo 没有把这条结果悄悄藏起来，直接在 `engine_warnings` 里写明 `Marginalia returned 429`，同时把整体状态 `engine_pool.degraded` 标成 `true`。返回的 5 条结果里，排名第一的 Wikipedia 词条带着完整的 `evidence_score` 拆解，还带着 `source_span`，精确到原文第 39 到 539 字节。

> 第一次卡住的三分多钟不一定每次都会遇到，但至少说明重排序模型冷启动可能会很慢，遇到类似情况先别急着以为装坏了，等等或者杀掉重跑一次。

### fetch

抓一个具体页面：

```bash
npx wigolo fetch "https://en.wikipedia.org/wiki/Local-first_software" --json
```

这次很快，几秒内就拿到了干净的 markdown 正文，标题也一并返回，维基百科页面本身那堆导航栏和侧边栏噪音都被过滤掉了。

### crawl

爬一个小站点验证多页遍历：

```bash
npx wigolo crawl "https://docs.astral.sh/uv/" --max-pages 3 --json
```

从入口页发现了 23 个可爬的链接，按限制实际只抓了 3 页，两秒左右跑完。每一页正文后面都跟着 `evidence` 字段，同样带 `source_span` 字节偏移和一段命中的原文摘录。

### extract

拿 wigolo 自己的 GitHub 仓库页面测结构化提取：

```bash
npx wigolo extract "https://github.com/KnockOutEZ/wigolo" --json
```

一秒多一点，拿到标题、描述、Open Graph 图片这几个 metadata 字段，格式干净，不用自己写正则去页面里抠。

### cache

前面三个工具跑下来，缓存里已经攒了内容：

```bash
npx wigolo cache stats
```

显示缓存了 4 个 URL，占 0.38 MB。用混合模式搜一下缓存内容，不用重新联网：

```bash
npx wigolo cache search "uv lock dependencies" --mode hybrid --json
```

命中了刚才 crawl 抓到的 uv 文档页面，关键词检索和语义检索各自算完再融合排序，第一条就是最相关的那页。

### find-similar

给一个 URL 找同类页面：

```bash
npx wigolo find-similar "https://docs.astral.sh/uv/" --max-results 5 --json
```

这条内部也会走一遍搜索加重排序，日志里能看到重排序模型被反复调用了好几次，跑完花了小一分钟，比单纯 `search` 慢不少，但确实跑出了结果，没有卡死。

六个核心工具都在真实网络请求下跑通了。research 和 agent 这两个需要接 LLM key 的工具这次没测，配一个免费的 Gemini key 或者本地 Ollama 应该也能用，只是没有实际验证。

---

## 相关项目和评价

做同一件事的商业产品不少。[Firecrawl](https://www.firecrawl.dev/) 专注网页抓取和结构化提取，也支持全站爬取，wigolo 官方对比表里把它列为对标对象之一，差别在于 Firecrawl 要 API Key、按量计费，wigolo 额外做了字节级来源定位和可解释评分，查询也免费。[Exa](https://exa.ai/) 语义搜索这块更专精，wigolo 的 README 里实测过它能完整渲染对比矩阵这类结构化内容，但同样要 API Key、按次收费，也没有 source_span 和评分拆解这些东西。[Tavily](https://www.tavily.com/) 定位是给 agent、RAG 场景用的搜索 API，搜索和抓取能力跟 wigolo 差不多在一个量级，只是不支持全站爬取，同样要 Key 要计费。

知乎有篇[开源项目介绍文章](https://zhuanlan.zhihu.com/p/2062103128321930499)把这 10 个工具的设计逻辑拆得比较细，也讲清楚了字节级来源定位和可解释评分这两个机制，给出的建议是按场景挑工具，不是无脑吹一个踩另外几个；文章里也提到一个诚实的局限，数据中心 IP 在有反爬措施的网站上，挑战清除率不如家庭网络。X 上认证账号 [@geekbb 发的一条对比帖](https://x.com/geekbb/status/2082645166876471506)标题是"Firecrawl vs Wigolo，Wigolo 强得没边了"，拿到了 464 个赞、6.9 万次浏览，评论区里 [@Ericgongg_ 的回复](https://x.com/Ericgongg_/status/2082659076333563980)给出了不同意见："好像很强，但是配置下来非常不稳定，搜索引擎也费劲。"这条回复正好跟我这边第一次调用 `search` 卡了三分多钟的情况对得上，说明这不是我这台机器特有的问题。

---

## 给 AI 编程助手的提示词

不想自己一步步敲命令？把下面这段丢给 Claude Code 或 Codex，让它帮你把 wigolo 装好，再跑一遍六个核心工具确认能用。

```text
## 目标
在当前机器上装好 wigolo 这个本地优先 MCP server，确认 search、fetch、crawl、extract、cache、find-similar 六个免 Key 核心工具都能正常调用。

## 步骤
1. 确认 Node.js 版本 ≥ 20
2. npx wigolo init（首次运行会下载无头浏览器引擎和本地 ML 模型，约 1.5 GB，需要几分钟，是正常现象不是卡住）
3. npx wigolo doctor 确认各组件状态，如果某个组件显示未安装，跑 npx wigolo warmup --all 补一次
4. 依次实际调用 search、fetch、crawl（--max-pages 设小一点）、extract、cache stats/search、find-similar 六个工具，用真实网址测试，不要只看 --help
5. 如果要接入 Claude Code、Cursor 等编程 agent，用 npx wigolo init --agents=claude-code,cursor 一步到位

## 核查结果
把六个工具各自的调用命令和返回结果贴给我确认，重点看有没有报错、返回内容是否包含 source_span 这类字节级来源定位字段。

具体命令、参数细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/08/28/wigolo-github-project
```

---

## 卸载和下次运行

装的时候全程用 `npx`，没有全局安装什么东西，真正占地方的是 `init` 下载的浏览器引擎和模型。卸载一步到位：

```bash
npx wigolo config --uninstall --yes
```

如果之前用 `--agents` 接过某个编程 agent，这条命令会把对应的接入配置一并清掉。

下次想再用，不用重新 `init`，直接跑对应的工具命令就行：

```bash
npx wigolo search "your query" --json
```

wigolo 会自动判断本机有没有装好的组件，缺了再重新走一遍下载流程。

---

## 总结

六个免 Key 的核心工具这次都在真实网络请求下测了一遍，全部跑通了。search 第一次调用卡了三分多钟，杀掉重跑之后只用了几秒，这是这次验证过程中唯一需要多留意的地方，大概率是重排序模型冷启动的成本，不是装坏了。research、agent 这两个需要 LLM key 的自治工具没有测，等哪天配了 Gemini 免费额度或者本地 Ollama 再单独看看效果。项目现在还是 public beta，4700 多个 star、7600 条测试用例都是作者自己给的数字，实测下来六个核心工具的返回内容和文档描述对得上。
