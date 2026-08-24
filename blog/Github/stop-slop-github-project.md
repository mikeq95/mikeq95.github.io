---
slug: 2026/08/21/stop-slop-github-project
title: stop-slop：一个帮 AI 去掉 AI 腔的 Skill
date: 2026-08-21
tags: [claude, llm, prompt, writing, open-source]
description: stop-slop 是一个开源 skill 文件，教 Claude（或其他 LLM）识别并删掉 AI 写作里那些辨识度极高的套话、句式和结构。
---
用 AI 写完一段话，读一遍，总觉得哪里不对——语法没问题，信息也对，但就是有股味。「这很重要」「让我来解释一下」「不仅如此，还……」。stop-slop 就是专门针对这股味的。
{/* truncate */}
---
## 介绍
stop-slop 是 [Hardik Pandya](https://hvpandya.com) 写的一套 Claude skill，MIT 开源。整个仓库没有代码，只有规则文件：一份核心指令（`SKILL.md`），加三个参考文档——禁用词组列表、禁用句式结构、before/after 改写示例。
它管的东西分三层：
**词组层**：「Here's the thing:」「Let that sink in.」「genuinely」「fundamentally」这类开场白和副词，读起来像在表演诚恳，实际上是凑字。
**结构层**：「不是 X，是 Y」对比句、否定列举（先说三个不是什么，再说是什么）、把无生命的东西写成主语（「这个决定浮现了」「市场给予了回报」）——这些结构在人类写作里很少见，在 AI 输出里几乎每段都有。
**节奏层**：三项并列、每段结尾都是短句收锤、破折号滥用、Wh- 开头的句子。
仓库里还附了一套 1-10 的打分维度：直接性、节奏变化、对读者的信任度、真实感、信息密度。总分低于 35/50 就回去改。
---
## 加载进 Claude
```bash
git clone https://github.com/hardikpandya/stop-slop.git
```
然后根据你用的入口选一种加载方式：
**Claude Code**：把 `stop-slop/` 整个文件夹作为 skill 加进去，Claude Code 会自动读取 `SKILL.md` 和 `references/` 下的三个文件。
**Claude Projects**：把 `SKILL.md` 和三个参考文件上传到项目知识库。
**系统提示词 / API**：把 `SKILL.md` 的内容贴进 system prompt，参考文件在需要时追加。
> ✅ 正常：让 Claude 改一段文字，它会指出里面的 AI 腔并改掉
> ❌ 异常：Claude 只说「这段写得不错」——检查 `SKILL.md` 有没有真正加进 context，文件有没有读完整
至此，skill 已经加载完毕。
---
## 使用方式
加载之后，把需要检查的文字给 Claude，让它按 stop-slop 的规则过一遍。它会：
1. 标出违反规则的地方
2. 给出改写后的版本
3. 按五个维度打分
不需要每次都说「按 stop-slop 规则检查」——skill 加进去之后，写作和编辑任务会自动触发这套规则。
---
## 效果展示
几个仓库里自带的 before/after 示例，直接看改了什么：
**开场白 + 对比句**
> Before: 「Here's the thing: building products is hard. Not because the technology is complex. Because people are complex. Let that sink in.」
> After: 「Building products is hard. Technology is manageable. People aren't.」

**商业黑话堆叠**
> Before: 「In today's fast-paced landscape, we need to lean into discomfort and navigate uncertainty with clarity. This matters because your competition isn't waiting.」
> After: 「Move faster. Your competition is.」

**碎片化强调**
> Before: 「Speed. Quality. Cost. You can only pick two. That's it. That's the tradeoff.」
> After: 「Speed, quality, cost—pick two.」

改动方向很一致：删掉铺垫，直接说那件事。
---
## AI-friendly
把下面这段给 Claude Code 或 Codex，它可以独立把这个 skill 装进项目：
```
Set up the stop-slop skill for Claude:
1. git clone https://github.com/hardikpandya/stop-slop.git
2. Add the cloned folder as a skill in Claude Code (it will auto-load SKILL.md and references/)
3. For Claude Projects: upload SKILL.md, references/phrases.md, references/structures.md, references/examples.md to project knowledge
4. For API use: paste SKILL.md content into the system prompt
5. Test by asking Claude to review a paragraph for AI writing patterns
No build steps, no dependencies. Just the markdown files.
```
---
## 下次使用
skill 加进去之后不需要重新操作，Claude Code 每次启动会自动加载。
如果是 Claude Projects，文件传上去就一直在，不用重传。
