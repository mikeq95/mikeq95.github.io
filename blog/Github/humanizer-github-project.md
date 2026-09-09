---
slug: 2026/09/09/humanizer-github-project
title: Humanizer，一个专治"AI 写作味"的 Claude Skill
date: 2026-09-09
tags: [github, Claude, prompt, writing, Ai-friendly]
description: Humanizer 把维基百科编辑们总结的《AI 写作特征》词条拆成 25 条识别规则，装进一个 Claude Skill 里，读一遍文字就能挑出"不是而是""三段式排比""破折号连接一切"这类痕迹并重写。本文实际装了一遍，读了它的规则文件，拿一段文字手动过了一遍改写流程。
---

"不是 X，而是 Y"、每段结尾一句"这才是真正的胜利"、破折号——不管前后是不是真的需要停顿——满天飞。这几个句式熟不熟悉？[Humanizer](https://github.com/blader/humanizer) 就是专门盯着这套配方改写的一个 Claude Skill。

{/* truncate */}

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

---

## 介绍

Humanizer 的规则不是凭空拍出来的。作者 [blader](https://github.com/blader) 在 [X 上说](https://x.com/blader/status/2013015738622284156)，维基百科编辑社区维护着一份《[Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)》词条，专门收集判断一段文字是不是 AI 写的特征，他让 Claude Code 读完这份词条，直接生成了一个能照着这套标准去重写文字的 Skill。

最新的 v3.0.0 版本把规则精简到 25 条，分五大类：靠"铺垫代替直说"的句式（比如"不是而是"、每段结尾来一句戏剧性总结）、靠规则硬凑出来的节奏感（三段式排比、破折号当万能连接符）、靠虚张声势借来的权威感（"专家认为"却不给具体来源、堆砌"delve""testament"这类高频词）、靠模板刷出来的格式（加粗当装饰、标题硬加 emoji）、以及聊天机器人残留下来的口癖（"希望这有帮助！"）。规则按"出现频率和强度"排过序，前几条单次出现就能判定，后面几条标了"弱信号"，得几条一起出现才算数。

仓库在 GitHub 上有 4.5 万多个 star，2026 年 1 月创建，到 9 月还在密集更新，MIT 协议开源。整个项目就是一份 `SKILL.md`，不需要 API Key，不需要下载模型，跑在你已经在用的 Claude Code、Codex、Cursor 里。

## 安装环境

跑起来不需要额外依赖，用 Skills CLI 一条命令装完：

```bash
npx skills add blader/humanizer --global
```

去掉 `--global` 只装到当前项目。想指定装到哪个 agent，可以加 `--agent claude-code` 之类的参数，或者 `--agent '*'` 装到所有识别到的 agent。

Claude Code 用户还能走插件方式（需要 Claude Code 2.1.142 及以上版本）：

```text
/plugin marketplace add blader/humanizer
/plugin install humanizer@humanizer
```

Claude Desktop 没有 CLI，得手动来：去 [Releases](https://github.com/blader/humanizer/releases) 下载源码 ZIP 当作 skill 上传，或者直接把 `SKILL.md` 拷进对应 agent 的 skill 文件夹。

> 实测在沙盒环境里跑了一遍 `npx skills add blader/humanizer`（没加 `--global`，避免污染本机全局配置），CLI 检测到当前在 agent 里运行会自动切成非交互模式，clone 完仓库直接把 skill 装到 79 个受支持的 agent 里，Claude Code 那份是符号链接，整个过程没有卡住，也没有要求额外输入。

至此，装的这一步已经跑通。

## 运行

装完之后，最直接的用法是打开一个新会话，直接调用：

```text
/humanizer

[粘贴你的文本]
```

也可以用自然语言：`Please humanize this text: [你的文本]`。

想直接改一份文件，让它只动散文部分、不碰代码块和链接：`Humanize the prose in docs/launch-post.md`。

如果你想让改写带上自己的文风，可以先贴 2-3 段自己写的原创文字当样本，再贴要处理的 AI 味文本——Humanizer 会跟着样本的句子长短、用词习惯、标点走，连"要不要用破折号"这种细节都会照抄样本的用法。

## 效果展示

装完读了一遍真实的 `SKILL.md`（不是 README 里的摘要，是它读给 agent 的那份完整规则），里面每条规则都带官方自己的改写示例，比如第 13 条"夸大意义"：

> 改前：The Statistical Institute of Catalonia was officially established in 1989, marking a pivotal moment in the evolution of regional statistics in Spain.
>
> 改后：The Statistical Institute of Catalonia was established in 1989, part of a wider decentralization of administrative functions in Spain.

这组是仓库自带的例子，为了确认规则真的能用在没出现过的文字上，我另外写了一段没在仓库示例里出现过的中文测试文本，手动照着 `SKILL.md` 的流程走了一遍——先标记出所有命中的模式，起草一版重写，再检查有没有漏掉或者编造事实，最后定稿：

> 改前：老实说？这不只是一款笔记 App，更是效率与灵感的完美结合。全新界面——扁平化设计、深色模式、云同步——带来了极致流畅的体验。业内专家认为，这标志着笔记类应用进入了全新时代。
>
> ## 🚀核心亮点
>
> - **速度：** 启动速度得到了显著提升。
> - **同步：** 数据已通过端到端加密进行妥善保护。
> - **体验：** 界面设计兼具美观与实用，堪称行业标杆。
>
> 希望这些信息对你有帮助！
>
> 改后：这款笔记 App 采用扁平化设计，支持深色模式和云同步。
>
> ## 核心亮点
>
> 启动速度比上一版更快，数据用端到端加密保护，界面在美观和实用之间做了平衡。

改前那段一次性塞了七种规则：起势铺垫（"老实说？"）、不是而是句式、破折号堆并列项、借用权威（"业内专家认为"却不给来源）、夸大意义（"标志着全新时代"）、装饰性标题带 emoji、加粗当装饰的标签列表，收尾还带了一句聊天机器人残留语。改完之后信息量没丢——扁平化设计、深色模式、云同步、启动速度、端到端加密这几个事实全在，只是把铺垫和虚张声势的部分砍掉了。SKILL.md 里管这套流程叫"标记、起草、检查、定稿"四步，检查这一步专门用来确认改写有没有偷偷丢掉或编造事实。

（此处插入截图：Claude Code 里调用 `/humanizer` 处理一段文本的实际输出）

## 相关项目和评价

Humanizer 不是唯一在做这件事的项目，反而是这个赛道里体量最大的一个。[stop-slop](/blog/2026/08/28/stop-slop-github-project) 走的是相反的路子：不是拿到成稿之后再改写，而是靠一份禁用词表和句式规则，在生成的时候就拦住 AI 腔调。中文圈里，[Humanizer-zh](https://github.com/op7418/Humanizer-zh) 是 Humanizer 的汉化 fork，专门处理"值得注意的是""从某种意义上说"这类中文语境下的 AI 腔，star 数已经追到 1.6 万多，几乎是目前中文圈用得最多的版本；[说人话](https://github.com/MrGeDiao/shuorenhua) 走的是另一条路，规则从一开始就按中文写作习惯设计，而不是从英文规则翻译过来。视觉设计场景下还有 [taste-skill](https://github.com/Leonxlnx/taste-skill)，主打让 AI 生成的内容更有"品味"、少一点通用感，跟 Humanizer 专注文字改写有交集但不完全是一回事。

Hacker News 上这个项目被独立提交过好几次，但每次讨论都很冷淡，最高的一条也只有 3 分 1 条评论。真正有分量的评测反而来自两篇独立博客，观点正好相反。DEV Community 上的一篇[正面体验](https://dev.to/vasughanta09/this-claude-skill-fixed-my-ai-writing-3pko)认为它"先写一版、自己挑毛病、再定稿"这套两阶段流程比单纯换同义词的人性化工具要靠谱，作者用了两个月，还给它加了两条自定义规则，只花了几分钟。Stork.AI 的[一篇批评性评测](https://www.stork.ai/blog/the-broken-promise-of-human-ai)观点不同：去掉 AI 机器味不等于真的有人味，这是一种"减法思维"的局限——它举例说工具把"masterclass"这种有冲击力的词也一并砍掉，把"Lou didn't just stumble into success"改写成"Lou didn't luck into it"，读起来反而更别扭；改写完之后残留的逗号并列列表本身也是 LLM 输出的典型特征，并没有真正"消除所有 AI 痕迹"。这两篇放在一起看挺平衡：一个说流程设计有新意，一个说"更不像 AI"不等于"更像某个具体的人"。中文这边，博客园一篇[汇总去 AI 味 Skill 的文章](https://www.cnblogs.com/wintersun/p/20693837)把 Humanizer 定位成"元老级工具"，核心观点跟 Stork.AI 的批评呼应：这类工具的关键不是词汇替换，而是能不能模拟人类写作里的不完美，比如情绪波动和逻辑跳跃。

## 给 AI 编程助手的提示词

懒得自己一步步配？把下面这段丢给 Claude Code 或 Codex，让它帮你把 Humanizer 装进当前用的 Claude 环境，并验证真的生效。

```text
## 目标
把 Humanizer 这个 skill 配置到当前使用的 Claude 环境里（优先 Claude Code），并确认它在改写文字时真的会生效。

## 步骤
1. npx skills add blader/humanizer --global
2. 如果是 Claude Code 且版本够新，也可以走插件方式：/plugin marketplace add blader/humanizer 然后 /plugin install humanizer@humanizer
3. 常规步骤自己判断执行，不用逐条确认

## 核查结果
写一段带典型 AI 腔的测试文字（不是而是句式、破折号堆并列项、加粗装饰列表挑一两个），让 Claude 用 /humanizer 或自然语言调用改写一遍，确认它能指出问题并给出改写，把改前改后的对比汇报给我。

具体命令、加载路径可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/09/09/humanizer-github-project
```

## 卸载和下次运行

用 Skills CLI 装的，卸载也走 CLI：

```bash
npx skills remove humanizer -y
```

插件方式装的，在 Claude Code 里通过 `/plugin` 管理菜单移除；手动拷进 skill 文件夹的，直接把对应目录删掉就行。

下次还想用，不用重新装。Skills CLI 装的版本本地文件还在，直接调用 `/humanizer` 或者对应的自然语言指令即可；`npx skills update humanizer` 可以检查有没有新版本。

## 总结

Humanizer 处理的是一类很具体的问题：把"不是而是""三段式排比""破折号连接一切"这些能被规则描述出来的痕迹挑出来改掉。这一步它做得很扎实，规则来源公开、每条都有例句、改的时候不许编造事实。但 Stork.AI 那篇批评也说得在理——挑掉这些痕迹只是让文字"更不像 AI 写的"，不等于让它"更像某个具体的人写的"。两者不是一回事，读者用之前心里有这个数就好。
