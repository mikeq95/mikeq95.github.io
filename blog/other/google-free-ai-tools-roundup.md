---
slug: 2026/09/09/google-free-ai-tools-roundup
title: Google 一口气推出的 15 款免费 AI 工具盘点
date: 2026-09-09
tags: [AI, Website, collection]
description: X 上流传的一份 Google 免费 AI 工具清单，覆盖品牌设计、界面生成、无代码开发、编程助手、学习辅助等场景。本文核实了每个工具的官方链接，并订正了几处已经过期的信息——Mixboard 即将下线、Gemini CLI 和 Gemini Code Assist 的个人免费版已经停服、Firebase Studio 在整体关停。
---

{/* truncate */}

## 1. Pomelli

输入你的网站链接，自动生成完整的品牌视觉识别，包括帖子、广告素材和配套图片。核心是先分析你的网站建出一份 "Business DNA"（语气、配色、字体、视觉风格），再照着这份 DNA 出素材。目前公开 Beta，仅限美国、加拿大、澳大利亚、新西兰的英文用户，无水印、无生成限制。

- 链接：[Pomelli](https://labs.google.com/pomelli/about/)

---

## 2. Stitch

用自然语言描述界面，直接输出可上线的 HTML + CSS + Tailwind 代码，还能一键导出到 Figma 继续改。免费使用，具体生成额度按模式（标准/实验）不同有区别。

- 链接：[Stitch](https://stitch.withgoogle.com/)

---

## 3. Opal

无需写代码，用自然语言描述就能创建小型 AI 应用和多步骤工作流，本质是把 prompt、模型调用、外部工具串成一条流水线，还带一个可视化节点编辑器。上线时只开放美国，现在已经扩展到 160 多个国家和地区。

- 链接：[Opal](https://opal.google/)

---

## 4. Antigravity

一款 Agentic IDE（智能开发环境），可以从一个提示词出发规划任务、跨文件修改，并生成完整应用，支持 macOS、Windows、Linux。免费个人版不限完成次数（有速率限制），能调用的模型也一直在更新——目前包括 Gemini 3.1 Pro、多个 Gemini 3 Flash 版本，以及 Claude Sonnet 4.6 / Opus 4.6，被看作 Cursor 的潜在竞品。

- 链接：[Antigravity](https://antigravity.google/)

---

## 5. Mixboard

结合 Canva 和 Pinterest 的 AI 灵感板工具，从一句话描述或者一个预置模板开始搭画布，支持用自然语言直接编辑和重新混合图片。

> 这个工具马上就要下线了：Google 官方已经宣布 Mixboard 将于 2026 年 9 月 28 日关停，届时所有画板、生成的图片和 prompt 记录都会一起消失。现在离下线只有不到三周，想试就得抓紧。

- 链接：[Mixboard](https://mixboard.google.com/)

---

## 6. Disco

原帖说的是"把浏览器里打开的标签页直接变成可交互的 AI 应用"，实际情况需要澄清一下：Disco 不是装在你现有浏览器里的一个功能，而是 Google Labs 单独做的一款实验性浏览器本体，核心功能叫 GenTab——分析你打开的标签页加一个目标（比如"帮我规划一次东京旅行"），自动生成一个整理好信息、带原始链接的交互式小应用。目前只有 macOS 版，而且要先加入 waitlist 排队才能用，不是打开链接就能直接用的状态。

- 链接：[Disco waitlist](https://labs.google/disco)

---

## 7. NotebookLM

Google 自家已经比较成熟的产品。上传 PDF、视频或笔记后，可以生成摘要、思维导图、测验，甚至基于内容制作播客。很多人用它替代 Notion AI、Perplexity 或 Readwise 的部分功能。

- 链接：[NotebookLM](https://notebooklm.google.com)

---

## 8. Learn Your Way

把任意主题变成个性化学习课程，包含文字/音频讲解、思维导图和测验，会根据学习方式自适应调整。背后用的是融合进 Gemini 的 LearnLM 模型，官方给出的数据是用它学习的学生即时测试分数高 9%，几天后的知识留存率高 11%。

- 链接：[Learn Your Way](https://learnyourway.withgoogle.com)

---

## 10. Google AI Studio

快速开发和测试 AI 应用的平台，提供免费 API Key，支持超长上下文（最高约 100 万 Token），适合替代部分付费的 OpenAI Playground 使用场景。眼下 Google 也在把它当成 Firebase Studio 的迁移落脚点之一（见下面第 14 条）。

- 链接：[Google AI Studio](https://aistudio.google.com)

---

## 11. Jules

给它一个 GitHub 任务，它会自动创建虚拟环境、制定执行计划、修改代码并提交 Pull Request，已经正式出了公开 Beta。免费额度会随 Google AI Pro / Ultra 订阅档位调整（付费档位额度是免费档的 5 倍/20 倍），具体每日免费任务数建议直接去官网确认最新的。

- 链接：[Jules](https://jules.google)

---

## 12. Gemini CLI

原帖说它"开源（Apache 2.0），完全免费"——代码本身确实是 Apache 2.0 开源在 [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)，这点没错。但要提醒一句：从 2026 年 6 月 18 日起，个人/免费账号的 Gemini CLI 已经停止响应请求了，Google 把这部分用户统一迁移到了新的 [Antigravity CLI](https://antigravity.google/product/antigravity-cli/)（第 4 条 Antigravity 的终端版）。也就是说现在装老的 Gemini CLI 装完也用不了，想要类似体验得装 Antigravity CLI。

---

## 13. Code Wiki

输入任意公开 GitHub 仓库，自动生成可交互的 Wiki，包含架构图、类图、时序图，还能直接用内嵌的 Gemini 聊天问关于这个仓库的问题，代码改了图会自动跟着刷新。目前只支持公开仓库，私有仓库的本地方案还在做。

- 链接：[Code Wiki](https://codewiki.google/)

---

## 14. Firebase Studio

用于后端和云逻辑的 AI 开发平台。

> 原帖的说法（"逐步停止对新用户开放"）已经不够准确了，实际是整体在关停：新用户注册从 2026 年 6 月 22 日起就已经关闭，官方给的最终关闭日期是 2027 年 3 月 22 日，之后留在里面的项目会被永久删除。Google 建议老用户迁到 Google AI Studio（偏好网页端 prompt 生成应用）或者 Antigravity（偏好本地代码优先的工作流）。所以现在不建议新项目用它是准确的，但原因是这个产品本身要没了，不只是"关闭新用户注册"这么简单。

---

## 15. Gemini Code Assist

原帖说是"GitHub Copilot 的免费替代方案，每月最高约 18 万次代码建议"——这个 18 万次数字是准的，官方确实给过这个数字（个人版每月 18 万次代码补全、每天 240 次对话）。但同样要提醒：跟第 12 条 Gemini CLI 一样，个人/免费账号从 2026 年 6 月 18 日起也已经停止服务了，同样是迁到 Antigravity 那一套产品线。企业版（Standard/Enterprise，付费）不受影响，继续正常用。

- 链接：[Gemini Code Assist](https://codeassist.google/)

---

## 总结

这份清单覆盖了从设计、营销、学习到编程开发的多个场景，核心优势是"免费"和"Google 生态整合"。但整理下来一个更明显的感觉是，Google Labs 这些工具的迭代速度非常快：原帖列的东西里，Gemini CLI 和 Gemini Code Assist 的个人免费版已经被砍掉迁去了 Antigravity，Firebase Studio 直接要下线，Mixboard 还有不到三周也要关。这份"清单"与其说是一份稳定的工具箱，不如说是 Google 这半年 AI 产品线快速洗牌的一张快照。

优先从相对成熟、目前确认还在正常服务的产品开始：`NotebookLM`、`Google AI Studio`、`Antigravity`（含 Antigravity CLI）。时间敏感的先试 `Mixboard`，还有不到三周就关停。已经用不了的是 `Gemini CLI`（个人版）和 `Gemini Code Assist`（个人版），这两个都得改用 Antigravity 系列。

如果正在找低成本或零成本的 AI 工具组合，这份清单可以当起点，但记得过几个月回来再核实一遍链接和额度。
