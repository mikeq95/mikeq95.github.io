---
slug: 2026/09/09/humanlayer-skills-github-project
title: humanlayer/skills，HumanLayer 团队开源的 5 个 Claude Code Agent Skill
date: 2026-09-09
tags: [github, "Claude Code", open-source, Ai-friendly]
description: humanlayer/skills 是 HumanLayer 团队开源的一套 Claude Code Agent Skills 合集，包含 improve-claude-md、narrow-react-prop-types、build-iterated-agentic-loop、design-control-loop、show-me 共 5 个 skill，用 npx skills 一条命令就能装。本文实际执行了安装命令，检查了本地生成的文件和目录结构，Skill 本身的运行效果（比如 show-me 判断该画哪种图）需要在真实 agent 会话里触发，文中会说明验证到了哪一步。
---

humanlayer/skills 是 [HumanLayer](https://humanlayer.dev) 团队开源的一套 Claude Code Agent Skills 合集，里面装了 5 个各自独立的 skill，分别处理 CLAUDE.md 写法、React 组件 prop 类型收紧、把一次性任务变成定时跑的 CI agent、以及用可视化替代大段文字这几件具体的事，用一条 `npx` 命令就能装到本地项目里。

{/* truncate */}

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

---

## 介绍

[humanlayer/skills](https://github.com/humanlayer/skills) 是 HumanLayer 团队自己在用 Claude Code 搭建 CI agent 自动化的过程中沉淀下来的经验包。截至发文时仓库有 3589 个 star、105 个 fork，MIT 协议，从 2026 年 3 月创建到现在一直在更新。HumanLayer 的主业不是这个仓库，而是一个协调编码 agent 和人工审批的平台（产品线包括开源 IDE CodeLayer，以及给 agent 加审批环节的 HumanLayer SDK），skills 仓库更像是他们把内部工作流经验开源出来的副产品。

仓库结构很直白，每个 skill 都在 `plugins/<name>/skills/<name>/SKILL.md` 这样一层套一层的路径下，配一个 `.claude-plugin/marketplace.json` 把 5 个 skill 分别包成独立的插件，方便被 Claude Code 官方插件市场格式直接引用。5 个 skill 里，`improve-claude-md` 和 `show-me` 是单文件的"判断力"型 skill，不需要额外模板；`narrow-react-prop-types` 是唯一一个纯代码重构类；`build-iterated-agentic-loop` 和 `design-control-loop` 则是重头戏，各自带了 8~10 个参考模板，而且后者明确点名前者是自己的"具体参考范式"。

值得一提的是 `improve-claude-md` 这个 skill 解决的问题很实在：Claude Code 每次注入 CLAUDE.md 时都会附带一句"这段内容不一定相关，不相关就别理"的系统提示，文件里堆的无关内容越多，连带重要内容也一起被忽略的概率越高。它的解法是把只在特定场景才用得上的规则包进 `<important if="具体触发条件">` 标签里，让基础信息保持裸露，条件性内容按窄触发条件分类，这个思路在 HumanLayer 官方博客的 [Stop Claude from ignoring your CLAUDE.md](https://www.humanlayer.dev/blog/stop-claude-from-ignoring-your-claude-md) 里也讲过一遍。

---

## 安装环境

装法统一走 [vercel-labs/skills](https://github.com/vercel-labs/skills) 这个第三方 CLI（Vercel Labs 维护，可以理解成"agent skills 的包管理器"，声称支持 70+ 个 agent 客户端）：

```bash
npx skills add humanlayer/skills --skill show-me
```

不装 `--skill` 参数会进入交互模式，列出全部 5 个 skill 让你多选。装的东西全是 Markdown 加少量模板文件，没有模型下载，没有二进制依赖，一条命令的事。

安装过程里能看到一步"Security Risk Assessments"，分别跑了 Gen、Socket、Snyk 三项检测，实测装 `show-me` 和 `improve-claude-md` 时结果都是 Safe / 0 alerts / Low Risk。

至此，环境已经装好了。

---

## 运行

装完之后，进对应的 agent（Claude Code、Cursor 等）里用斜杠命令触发，比如：

```text
/show-me
/improve-claude-md
```

实测跑了两次安装命令（`show-me` 和 `improve-claude-md`），真实生成的目录结构是这样的：

```text
.
├── .agents
│   └── skills
│       ├── improve-claude-md/SKILL.md
│       └── show-me/SKILL.md
├── .claude
│   └── skills
│       ├── improve-claude-md -> ../../.agents/skills/improve-claude-md
│       └── show-me -> ../../.agents/skills/show-me
└── skills-lock.json
```

可以看出这个 CLI 的实际做法是：内容统一落地到 `.agents/skills/` 下一份"通用格式"，给 Claude Code 用的 `.claude/skills/<name>` 只是一个指过去的符号链接，`skills-lock.json` 记了每个 skill 的来源仓库、路径和内容哈希，方便之后校验有没有被改过。

> 注意，这一步验证到的是"安装确实落地了正确的文件"，不是"skill 触发后的真实运行效果"。像 `show-me` 判断该画伪代码还是 Mermaid 图这类行为，只有在真实的 agent 对话里被触发才能看到，不是装完就能截图的东西。为了确认内容没有缩水，我另外把仓库 clone 到本地，对照读了一遍 `.agents/skills/show-me/SKILL.md` 的全文，和源码里 `plugins/show-me/skills/show-me/SKILL.md` 一字不差。

---

## 效果展示

装好之后读一下 `show-me` 的 `SKILL.md`，开头是这样的：

```yaml
---
name: show-me
description: Help the user understand the current topic visually with concise diagrams, code-shape sketches, and focused HTML artifacts.
---
```

正文一共 127 行，列了 7 种表达方式该在什么场景用：伪代码表达算法逻辑、调用树表达运行时控制流、组件树表达 UI 结构、浅层文件树表达重构范围、Mermaid 图表达组件交互、`diff` 语法表达"改了什么"、以及一个手写 HTML 页面应对 Mermaid 表达不了的复杂布局对比。核心原则是"你可能只用得上其中一两种，不太可能全用上，别堆砌"——这是一份教 Claude 判断力的说明书，不是一个会自己生成图片的工具，所以效果最终取决于它在真实对话里怎么被调用。

`skills-lock.json` 里记的内容：

```json
{
  "version": 1,
  "skills": {
    "show-me": {
      "source": "humanlayer/skills",
      "sourceType": "github",
      "skillPath": "plugins/show-me/skills/show-me/SKILL.md",
      "computedHash": "de32a72f802801f08a84641b467f2c6306d35a58ce5e59ea607ac3a993a18c91"
    }
  }
}
```

（此处插入截图：Claude Code 里 `/show-me` 触发后的实际输出示例）

---

## 相关项目和评价

放在同一个赛道里看，humanlayer/skills 的定位偏"精品小而美"，不是大而全：

- [anthropics/skills](https://github.com/anthropics/skills) 是 Anthropic 官方的 Agent Skills 参考实现，star 数在 17 万级别，带了 DOCX/PDF/PPTX/XLSX 这类生产级文档处理 skill，算是官方权威范本。跟 humanlayer/skills 不冲突，一个是标准范例，一个是第三方团队沉淀的实战经验——尤其是 CI agent 自动化那两个 skill，官方仓库里没有对标的东西。
- [obra/superpowers](https://github.com/obra/superpowers) 同样在 17 万+ star 级别，14 个以上的 skill 拼成一套完整的"强制流程"方法论（brainstorm→plan→TDD→review 才能 ship），甚至会检查每条用户消息该不该走流程，本质是一层强制纪律。humanlayer/skills 完全是另一种思路，5 个 skill 各管一段具体痛点，没有统一调度层，用户自己挑单个装。
- [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) 号称 380+ skill、30+ agent、70+ 自定义命令，覆盖工程到市场到合规几乎所有职能，是"数量取胜"的大杂烩型仓库，跟 humanlayer/skills 的精品路线正好是两个极端。
- [skills.sh](https://skills.sh)（Vercel 维护的开放 skill 搜索目录）和 [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)（约 1.3 万 star 的 curated list）都不是 skill 合集本身，而是发现渠道，humanlayer/skills 会被这类目录收录，但不算直接对标产品。

评价这块，目前搜到的最扎实的一条来自 Hacker News 的 [Show HN 帖子](https://news.ycombinator.com/item?id=49274489)，作者就是 HumanLayer 创始人 Dex Horthy（dhorthy）本人发的，专门介绍 `show-me`。评论区里用户 bhkdotdev 说自己一直维护一套个人的 mermaid 图 skill，但这个方案覆盖范围明显更全，还提到"可视化是 agent 系统里一直缺失的关键工具"。也有质疑的声音：用户 janpeuker 指出开放权重模型普遍视觉/多模态理解能力偏弱，会限制 `show-me` 在这类模型上的实际效果；dhorthy 回应说"至少调用栈 diff 这类任务上开放权重模型表现还不错"，算是承认了这是一个已知的适用边界。独立评测博客 Firecrawl 的《[Best Claude Code Skills to Try in 2026](https://www.firecrawl.dev/blog/best-claude-code-skills)》虽然没点名评测这个仓库，但给出的建议同样适用——装社区 skill 之前先通读完整 SKILL.md，审计里面有没有藏着未声明的网络调用，别只看介绍就直接装上用。

除了这条 HN 讨论，其余 4 个 skill（`improve-claude-md`、`narrow-react-prop-types`、`build-iterated-agentic-loop`、`design-control-loop`）目前还没搜到有具体理由、够得上门槛的独立讨论，搜到的大多是转述 README 内容的第三方索引站，不计入评价部分。

---

## 给 AI 编程助手的提示词

```text
## 目标
把 humanlayer/skills 仓库里的某个 skill（比如 show-me 或 improve-claude-md）装到当前项目，并确认 Claude Code 能正确识别加载。

## 步骤
用 `npx skills add humanlayer/skills --skill <skill 名称>` 安装，注意这一步会联网克隆仓库，确认当前网络能访问 GitHub。装完之后检查项目根目录下是否出现了 `.agents/skills/<skill 名称>/SKILL.md` 和 `.claude/skills/<skill 名称>` 这个符号链接，以及根目录的 `skills-lock.json` 里是否记录了对应条目。如果用户没有指定装哪个 skill，先列出仓库里的 5 个可选项（improve-claude-md、narrow-react-prop-types、build-iterated-agentic-loop、design-control-loop、show-me）让用户选。

## 核查结果
读一遍生成的 `SKILL.md` 内容，确认 frontmatter 里的 `name`/`description` 字段和正文没有明显缺失或截断；在当前会话里尝试用对应的斜杠命令触发一次，观察 Claude 是否按 SKILL.md 里描述的规则响应，把安装结果和触发效果汇报给用户。

具体命令、代码细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/09/09/humanlayer-skills-github-project
```

---

## 卸载和下次运行

卸载：删掉 `.agents/skills/<name>` 和 `.claude/skills/<name>` 这个符号链接，再把 `skills-lock.json` 里对应的条目删掉即可；如果一个 skill 都不留了，这三样东西整体删掉也没问题。

下次运行：已经装过的 skill 不用重新执行 `npx skills add`，直接在项目里用对应的斜杠命令（比如 `/show-me`）触发就行；想再装其他 skill，重复上面的安装命令换个 `--skill` 参数即可。

---

## 总结

这是一个体量不大但目标很具体的 skill 合集，5 个 skill 里 `build-iterated-agentic-loop` 和 `design-control-loop` 这两个 CI agent 自动化的思路是官方 anthropics/skills 里没有的东西，值得单独试试；`improve-claude-md` 和 `show-me` 则是几分钟就能装上、立刻能用的轻量工具。装之前记得按社区的通行建议，自己读一遍 SKILL.md 内容，搞清楚它到底会让 agent 做什么。
