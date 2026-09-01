---
slug: 2026/08/28/i-have-adhd-github-project
title: i-have-adhd：让 AI 编程助手说话别绕弯子
date: 2026-08-28
tags:
  - github
  - Claude Code
  - AI
  - open-source
  - Ai-friendly
description: i-have-adhd 是一个开源 skill，靠 SKILL.md 里的十条输出规则，让 Claude Code、Codex 等编程 Agent 的回复先给动作、砍掉寒暄客套，这篇记录实际安装、触发和前后对比的效果。
---

{/* truncate */}

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

---

## 介绍

这不是给 AI 加了什么新本事，本质是一份写死的规则文件 `SKILL.md`，一共十条输出规则。第一句必须是命令、路径或代码片段，解释放后面，甚至可以不讲。超过一步的操作要编号，而且要求用最少的步数，能合并的步骤就合并。每条回复结尾都得留一个两分钟内能做完的下一步，哪怕只是"打开这个文件"也算。列表也有上限，最多 5 项，超了就拆成"现在做"和"以后做"两组。报错时不许说"Uh oh"这类语气词，直接把出错位置、原因和修复方式摆出来。

规则不是无脑一刀切。SKILL.md 里专门写了"什么时候可以打破规则"这一节。用户明确说要"解释"的时候，可以放开讲清楚。要执行 `rm -rf`、强制推送这类有风险的操作，得先确认再动手，安全优先于简洁。连续三轮都还是"没修好"，就该停下来说清楚是哪个假设可能错了，而不是接着瞎试。遇到"给我几个方案"这种问题，答案本来就该是几个带取舍说明的选项，规则也不会逼着模型只给一条路径。

仓库里不只是一份 Markdown。`tests/` 目录下有 21 个单元测试，覆盖常开钩子、OpenCode 插件这些集成点。`evals/cases.jsonl` 另外放了 14 条行为评测用例，每条都带一份判分标准，专门测规则改动会不会让模型答非所问。这个项目在 GitHub 上涨得很快，目前有 2.5 万+ star。贡献者也不止作者一个人，31 个人提交过代码，最近一次更新就在两天前。

这份规则不只服务 Claude 生态，Codex、Cursor、Gemini CLI 这些常见的编程 Agent 工具都有对应的安装方式，各自装法写在仓库的 `INSTALL.md` 里。装的时候不需要 API Key，也不用额外配运行环境。

---

## 安装环境

不用装任何依赖，`claude plugin` 命令是 Claude Code 自带的。先加市场源，再装插件：

```bash
claude plugin marketplace add ayghri/i-have-adhd
claude plugin install i-have-adhd@i-have-adhd
```

装完用 `claude plugin list` 看一眼，能看到 `i-have-adhd@i-have-adhd` 状态是 `enabled` 就是装好了。

如果只是想临时用一次，不想正式装插件，也可以把下面这段话直接贴给任意能读取 `AGENTS.md` 的编程 Agent，让它自己去装：

```text
Install the i-have-adhd skill/plugin from https://github.com/ayghri/i-have-adhd, refer to the repo's AGENTS.md for instructions.
```

---

## 运行

装完插件本身不会改变任何输出。在 Claude Code 里输入一次：

```text
/i-have-adhd
```

规则从这一轮开始应用到后面所有回复，只在当前会话生效。想临时关掉，会话里说一句"stop adhd mode"或"normal mode"就行。

> 注意，装完你会有种"装了跟没装一样"的错觉——这不是没装成功，是它本来就设计成默认不触发，Claude Code、Codex、Qwen Code 下都得手动喊一次 `/i-have-adhd` 才算数。

不想每次都手动喊，可以设成常开，让它在每次会话开始时通过 `SessionStart` 钩子自动注入规则：

```bash
touch ~/.claude/.i-have-adhd-always
```

关掉常开就删掉这个标记文件：

```bash
rm ~/.claude/.i-have-adhd-always
```

至此，[i-have-adhd](https://github.com/ayghri/i-have-adhd) 已经装好并且能正常触发了。

---

## 效果展示

拿同一个问题分别测了一遍：没喊 `/i-have-adhd` 问一次，喊过之后再问一次，问题是"我的 Python 脚本跑起来比预期慢，可能是什么原因，给我一个大致思路"。

没喊之前，回答是这样的：

> 排查 Python 脚本变慢，建议按这个思路来：
>
> 第一步：先测量，别猜，用 `cProfile` 跑一遍，找到耗时最多的函数。
>
> **常见慢的原因（按出现频率排序）**
>
> 1. I/O 阻塞
> 2. 不合适的数据结构
> 3. 循环里做了本可以向量化的事
> 4. 字符串拼接用 `+=`
> 5. 重复计算，没有缓存
> 6. 正则表达式没有预编译
> 7. GIL 限制
> 8. 不必要的深拷贝/序列化
> 9. 日志/打印过多
> 10. 第三方库版本问题
>
> 如果你把脚本或者 profiling 结果发给我，我可以帮你具体定位是哪一类问题。

喊了 `/i-have-adhd` 之后，同一个问题变成这样：

> 先跑一次 profiler，别猜：`python -m cProfile -s cumulative your_script.py`
>
> 看输出里 `cumtime` 排前几名的函数，那就是真正的瓶颈。
>
> **常见原因（按命中率排序）**
>
> 1. I/O 阻塞——网络请求、数据库查询、读写文件在循环里逐条做，没有批量/异步
> 2. 该向量化的用了 Python 循环——比如该用 numpy/pandas 的地方写了 `for` 循环
> 3. 算法复杂度问题——嵌套循环里做了 O(n²) 甚至更差的查找
> 4. 循环内重复开销——每次循环都开文件、建数据库连接、拼字符串、写日志
> 5. 内存不够，系统在换页——用 `top` 看内存占用，接近上限就是这个
>
> 下一步：跑上面那条 profiler 命令，把 cumtime 排名前 5 的函数名贴给我。

条数从 10 条砍到了 5 条。命令原来排在"第一步"里，现在直接是回复的第一句。结尾也不一样，原来是等你把脚本发过来，现在是一步能立刻执行的动作。

---

## 相关项目和评价

同样瞄准"AI 说话啰嗦"这个问题，思路不完全一样。[caveman](https://github.com/JuliusBrussee/caveman) 走的是压缩路线，直接把回复削成电报体，官方说法能砍掉六成多的输出 token。这跟 i-have-adhd 靠结构（先动作、编号、封顶列表）解决"读起来费脑子"是两个方向，一个省 token，一个省阅读成本，不冲突，可以一起装。

社区里也有人在原版基础上二次开发。[melodic-software 的 fork](https://github.com/melodic-software/claude-code-plugins/tree/main/plugins/adhd) 是 MIT 授权的改写版，`/adhd:shape` 基本照搬原规则，额外加了 `/adhd:clarify`，能把一大段文档拆成"一次只讲一个决定"的分块。

用过的人写了两篇比较扎实的体验文。[Medium 上一篇](https://medium.com/@joe.njenga/i-tried-this-claude-code-adhd-skill-that-no-one-is-talking-about-a990a647b1c7)从 git clone 到实际提问全程记录，附了装前装后的真实回复对比。[Android Authority 那篇](https://www.androidauthority.com/claude-i-have-adhd-skill-how-use-3697353/)用了两周之后提到一个官方文档没写的细节：回复默认变短了，用量额度消耗得也更慢；但也提醒不是所有 ADHD 用户都吃这套，有人反而更想要信息量拉满的长回复。

知乎上有篇[对比文章](https://zhuanlan.zhihu.com/p/2063679630872253251)用真实的前后回复做对比，强调这东西只是换了个说话方式，AI 本身没变聪明。X 上也有质疑的声音：Angelica Parente 在讨论"怎么让 AI 输出更简洁"时，[把自定义 output style 和装 skill 做了对比](https://x.com/draparente/status/2085785882788077991)，认为 output style 更省 token，但 skill 换来的是更明确的规则约束——两条路各有取舍，谈不上谁完全取代谁。

---

## 给 AI 编程助手的提示词

懒得自己一步步照着敲？把下面这段丢给 Claude Code、Codex 之类的 AI 编程助手，让它帮你装好插件，再自己对比一次触发前后的差别。

```text
## 目标
把 i-have-adhd 装成 Claude Code 插件并触发生效，能看出回复风格确实变了就算成功。

## 步骤
1. 添加市场源并安装插件：claude plugin marketplace add ayghri/i-have-adhd，然后 claude plugin install i-have-adhd@i-have-adhd
2. 用 claude plugin list 确认 i-have-adhd@i-have-adhd 状态是 enabled
3. 在一个新会话里输入 /i-have-adhd 触发规则，注意装完插件不会自动生效，必须手动调用这一步
4. 找一个开放性问题，分别在触发前后各问一次，对比两次回答的结构差异

## 核查结果
确认插件确实是 enabled 状态，且触发 /i-have-adhd 后的回复明显是先给动作、列表不超过 5 条、结尾有具体下一步这种结构，把对比结果汇报给我。

具体命令、代码细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/08/28/i-have-adhd-github-project
```

---

## 卸载和下次运行

对应"安装环境"那节装的插件和市场源，卸载时两个都要删：

```bash
claude plugin uninstall i-have-adhd
claude plugin marketplace remove i-have-adhd
```

如果开了常开模式，记得把标记文件也删掉：

```bash
rm -f ~/.claude/.i-have-adhd-always
```

下次运行：插件装好之后会一直留着，不用重装。想用的时候，直接在任意会话里喊一次 `/i-have-adhd` 就行。

---

## 总结

i-have-adhd 说到底没有让 AI 变聪明，改的只是说话的形状。先给动作，寒暄和客套能砍就砍。列表和步骤都有上限，不会无限堆下去。规则文本就是那一份 `SKILL.md`，不想用官方那套，可以直接 fork 改成自己的版本，换个市场源重装一遍就行，不用碰代码。装 Claude Code 版本只要两条命令，喊一次 `/i-have-adhd` 就能立刻看出回复风格的差别。
