---
slug: 2026/08/28/stop-slop-github-project
title: stop-slop：教 Claude 去掉 AI 写作痕迹的规则文件
date: 2026-08-28
tags: [github, Claude, prompt, writing, Ai-friendly]
description: stop-slop 是一套开源的 Claude skill 规则文件，靠禁用词表、句式规则和打分标准，帮 Claude 在写作和改稿时去掉常见的 AI 写作痕迹。
---

{/* truncate */}

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

---

## 介绍

仓库结构很简单：核心指令 `SKILL.md` 之外，`references/` 目录下有三个参考文件。`phrases.md` 列的是要删掉的词组，`structures.md` 列的是要打散的句式，`examples.md` 给了几组真实的改写示例。

词组这一层，管的是"Here's the thing"这类起手式清嗓子，也管副词——really、literally、genuinely 这些词，规则要求全部砍掉。商业黑话也在名单上，deep dive 换成 analysis，navigate 换成 handle，SKILL.md 里给了一整张对照表。

句式这一层更狠。"不是 A，是 B"的二元反转是头号打击对象，先罗列几个否定项、最后才揭晓答案的悬念写法也不放过。给没有生命的东西装上人类动词也禁止，比如"投诉变成了修复""决定浮现出来"这类说法。规则要求把动作还给具体做事的人，找不到具体的人就用"你"把读者拉进场景。破折号也在禁用之列，SKILL.md 写得很直白：不允许出现破折号。

改完之后还有一道打分关。方向性、节奏、信任感、真实感、信息密度，五个维度各打 1-10 分，总分低于 35/50 要求重写。

仓库在 GitHub 上有 1.6 万多个 star，MIT 协议开源。按作者 Hardik Pandya 在 X 上回复一条质疑时的说法，这东西最初是他花 30 分钟学怎么写 Claude Skill 时顺手做出来的练手项目。

---

## 安装环境

跑起来不需要装任何依赖，clone 下来就是全部内容：

```bash
git clone https://github.com/hardikpandya/stop-slop.git
```

拉下来之后目录长这样：

```text
stop-slop/
├── SKILL.md
├── references/
│   ├── phrases.md
│   ├── structures.md
│   └── examples.md
├── README.md
└── LICENSE
```

真正麻烦的不是装什么，是怎么把这几份文件塞进你在用的 Claude 界面。Claude Code、Claude Projects、API 三种入口的加载机制完全不同，这件事反而比"装依赖"更值得花一节讲清楚，下一节具体说。

---

## 运行

### Claude Code

把 clone 下来的 `stop-slop` 文件夹整个放进 `~/.claude/skills/`（或者当前项目目录下的 `.claude/skills/`，只对这个项目生效）。文件夹名本身就是 skill 名，不用额外注册。

开一个新的 Claude Code 会话，它启动时会自动扫描这个目录，读到 `SKILL.md` 的 frontmatter 就认出这是一个 skill。之后写作、改稿、审阅内容这类任务会自动触发，不用每次都手动说"用 stop-slop 检查一下"。

验证是不是真的挂上了，丢一段带典型 AI 腔的文字让 Claude 审：

```text
Here's the thing: this update is genuinely important.
Not because it's big. Because it's necessary.
```

> ✅ 正常：Claude 主动指出"Here's the thing"、"genuinely"、二元反转句式，并给出改写
>
> ❌ 异常：Claude 只回一句"这段写得挺好"——说明 `SKILL.md` 没被真正读进去，检查文件夹是不是放对了路径

### Claude Projects

把 `SKILL.md` 和 `references/` 下的 `phrases.md`、`structures.md`、`examples.md` 三个文件一起上传到 Project Knowledge。上传之后这个 Project 里开的所有新对话都用得上，不用每次重传。

### 系统提示词和 API 调用

自定义指令场景，把 `SKILL.md` 的核心规则那部分复制粘贴进去就够。走 API 的话，把整份 `SKILL.md` 贴进 system prompt。`references/` 下的三个参考文件不用一次性全塞进去——按 README 的说法，这些文件是按需加载，真正要举例子、查禁用词表的时候再补进 context，省地方。

---

## 效果展示

仓库自己在 `examples.md` 里放了几组真实的改写对照，直接看效果最直观。

**清嗓子开场 + 二元反转**

> Before: "Here's the thing: building products is hard. Not because the technology is complex. Because people are complex. Let that sink in."
>
> After: "Building products is hard. Technology is manageable. People aren't."

**商业黑话堆叠**

> Before: "In today's fast-paced landscape, we need to lean into discomfort and navigate uncertainty with clarity. This matters because your competition isn't waiting."
>
> After: "Move faster. Your competition is."

这两组都是仓库自带的示例。为了确认规则真的会在改写里生效，不是只停在文档里，我另外写了一段没在仓库示例里出现过的测试文字，照着 `SKILL.md` 和两份参考文件里的规则手动过了一遍：

> Before: "Here's the thing: code review is genuinely hard to get right. It's not about finding bugs. It's about building trust. When it comes to feedback, mistakes were made, and the decision to merge often emerges from pressure rather than confidence."
>
> After: "Code review builds trust, not just catches bugs. Reviewers approve pull requests they haven't fully read because the deadline is tomorrow. Then production breaks, and nobody wants to trace it back to a rushed approval."

删掉了"Here's the thing"和"genuinely"，二元反转句改成直接陈述。"mistakes were made"这种被动语态换成了具体的人（reviewers）在做具体的事，"the decision...emerges"这种给决定装上人类动词的假拟人写法也一并处理掉了。

---

## 同类项目和评价

stop-slop 不是唯一在做这件事的项目。[Humanizer](https://github.com/blader/humanizer) 规模更大，star 数已经过 3.8 万，规则来自维基百科"Signs of AI writing"词条收录的 35 个模式，能直接对着整份文档改写，代码块、数据、frontmatter 保持不动，还支持喂一段自己的文字做文风模仿——这是 stop-slop 没有的能力。[No AI Slop](https://github.com/petergyang/no-ai-slop) 走的是另一条路，分编辑、检测、生成讽刺文三种模式，检测模式只引用抓到的原句，不猜文字是不是 AI 写的。[skill-deslop](https://github.com/stephenturner/skill-deslop) 明确说自己是拿 stop-slop 的短语表、结构规则、打分标准，加上 tropes.fyi 的语料库合并出来的，专门给科研和技术写作场景做了调整，会保留方法论部分本该用的被动语态——这一点正好戳中了 stop-slop"一律禁止被动语态"的盲区。

外部评测里，[Gaurav Tiwari 的长期使用体验](https://gauravtiwari.org/stop-slop-ai-slop/)提到，冷启动的初稿常常在第一段就能挑出六种以上的毛病，用久了会在动笔前就先绕开这些套路。他也提到，"看到破折号就当成 AI 写的"这种老判据到 2026 年已经不太可靠了。另一篇[评测](https://gabrielcassady.com/tools/stop-slop-claude-skill-to-remove-ai-writing-tells/)把它归类成"往模型脑子里装一套写作策略"的 prompting 工具而不是软件，提醒在监管严格或高风险场景下用之前先看 diff、锁定版本，别把必要的不确定性用语、警告、引用也一起削掉了。

社区里也有不同意见。作者在 X 上[发布这个项目](https://x.com/hvpandya/status/2010330642714894391)后，[有网友直接回复](https://x.com/nixxin/status/2010547235902124035)："不是所有东西都是 AI 写作，你这是在把语言压平、抹掉俏皮话。"作者回怼说这不过是他花 30 分钟学 Claude Skill 写法时顺手做的东西。知乎上一篇[比较几个写作 skill 的文章](https://zhuanlan.zhihu.com/p/2059620590072476766)把 stop-slop 和 Humanizer、taste-skill 放在一起看，认为它的强项不是大段重写，而是写完之后的快速质检，适合短文案、邮件、社交媒体这类场景。

---

## 给 AI 编程助手的提示词

懒得自己一步步配？把下面这段丢给 Claude Code 或 Codex，让它帮你把 stop-slop 装进当前用的 Claude 环境，并验证真的生效。

```text
## 目标
把 stop-slop 这个 skill 配置到当前使用的 Claude 环境里（优先 Claude Code），并确认它在改写文字时真的会生效。

## 步骤
1. git clone https://github.com/hardikpandya/stop-slop.git
2. 根据当前环境选加载方式：Claude Code 就把整个文件夹放进 skills 目录（个人级或项目级都行）；Claude Projects 就把 SKILL.md 和 references/ 下的三个文件上传到项目知识库；只有系统提示词/API 场景才需要把 SKILL.md 内容贴进 system prompt
3. 常规步骤自己判断执行，不用逐条确认

## 核查结果
写一段带典型 AI 腔的测试文字（清嗓子开场、二元反转句、被动语态挑一两个），让 Claude 按规则过一遍，确认它能指出问题并给出改写，把结果汇报给我。

具体命令、加载路径可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/08/28/stop-slop-github-project
```

---

## 卸载和下次运行

卸载对应装的时候放了什么，删掉什么就行。

Claude Code：

```bash
rm -rf ~/.claude/skills/stop-slop
```

Claude Projects：去 Project Knowledge 里把上传的四个文件删掉。

系统提示词/API：把塞进 system prompt 的那部分内容删掉。

下次还想用不用重新 clone，本地这份文件夹留着就行。Claude Code 每次启动都会重新扫描 skills 目录，不需要额外操作；Claude Projects 里传过的文件会一直留着，除非手动删。

---

## 总结

stop-slop 也没完全守住自己定的规矩。`references/examples.md` 里 Example 4 的改写后例句用了一个破折号——"Speed, quality, cost—pick two."——而 `structures.md` 明确把破折号列为禁用项。仓库里有个还开着的 issue，标题就叫"Fix five spots where the docs break stop-slop's own rules"，创建于 7 月初，到现在还是 0 条评论。

仓库主页写着最近更新是今天，但那只是 star、watch 这类数据变化，真正最后一次代码 push 停在 2026-03-17。现在挂着 25 个 open issue、23 个 open PR，issue 里 21 个是 0 评论，看起来没什么人在积极处理。这东西说到底是一套主观标准，"副词一律砍掉"不见得适合所有写作场景，但如果只是想在发出去之前拦一遍最容易被认出来的套路，丢给 Claude 读一遍成本不高。
