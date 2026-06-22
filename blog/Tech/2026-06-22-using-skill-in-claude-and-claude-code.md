---
slug: 2026/06/22/using-skill-in-claude-and-claude-code
title: "🧩 在 Claude Code 和 Claude 上用 skill"
date: 2026-06-22
tags:
  - AI
description: "claude.ai 和 Claude Code 的 skill 是两套独立系统，分别怎么装、怎么用、容易踩哪些坑，整理在这一篇。"
---

什么是 skill？如何在 Claude 和 Claude Code 中安装和使用 skill？

{/* truncate */}

---

## [skill](https://clearlove7-ai.vercel.app?word=skill&postId=2026-06-22-using-skill-in-claude-and-claude-code) 是什么

简单说，skill 就是一个文件夹，里面至少有一个 `SKILL.md`，写清楚"什么时候该用这个能力"和"具体怎么做"。这篇用到的例子是我让 Claude 用 skill-creator 写的一个 skill，叫 blog-markdown-formatter，接下来就是怎么装、怎么用。
> 个人感觉也有点像是单机游戏的 MOD，但是这个 MOD 是专门为了增强游戏体验的。

---

## 在 Claude Code 里装

### 第一步：下载 `.skill` 文件到底是什么

如果你的 skill 是通过 Claude Code 的 skill creator 创造出来的，或者别的方式做的，不管来源是什么，只要来自 Claude，文件应该长这样：

![claude 生成的 skill 文件图标](https://cdn.mikeq95blog.uk/coverimage/claude-skill-file-icon.png)

一个橙色的"SKILL"图标，Finder 里还带一个"通过 Claude 打开"的按钮——这是因为电脑上装的 Claude 桌面 App 给 `.skill` 后缀注册了专属样式，**不代表文件本身的格式变了**。不必担心，它骨子里还是一个标准的 zip 包，后缀名和图标只是显示层面的东西。

如果你还是不信，打开终端，输入：

```bash
file ~/Downloads/blog-markdown-formatter.skill
```

✅ 正常：输出里带 `Zip archive data`，证明它确实是 zip

❌ 异常：如果输出是别的内容，说明下载过程文件损坏了，重新下载一次

### 第二步：解压到 Claude Code 能读到的位置

```bash
cd ~/Downloads
unzip blog-markdown-formatter.skill -d ~/.claude/skills/
```

### 第三步：验证目录结构

```bash
ls ~/.claude/skills/blog-markdown-formatter
```

✅ 正常：看到 `SKILL.md` 和 `references/` 两项，直接躺在这个文件夹下面

❌ 异常：如果看到的是一个 `.skill` 文件躺在里面（说明只是把 zip 挪了位置，没解压），回到第二步重新执行 `unzip`

解压对了之后，目录结构应该是这样：

```
~/.claude/skills/blog-markdown-formatter/
├── SKILL.md
└── references/
    ├── blog-style-guide.md
    └── syntax-checklist.md
```

至此，在 Claude Code 上安装 skill 已经完成。

---

## 在 Claude 里装

1. 网页或 App 里找到 Settings → Customize → Skills
2. 点 "+" → "Create skill" → "Upload a skill"
3. 直接上传下载下来的 `.skill` 文件（不用解压，网页会自己解析里面的内容）
4. 上传完成后，在列表里把开关打开

至此，Claude 上安装 skill 已经完成。

注意，在 Claude 上装了 skill，不代表 Claude Code 也能用——两边要分别装一次，不是一回事。

---

## 更新已经装好的 skill

skill 内容改过之后（比如规则调整、加新功能），不会自动同步到本地已经装好的版本，两边都要手动覆盖一次。

**Claude Code 的做法**：

```bash
cd ~/Downloads
rm -rf ~/.claude/skills/blog-markdown-formatter
unzip blog-markdown-formatter.skill -d ~/.claude/skills/
```

**Claude 的做法**：去 Settings → Customize → Skills，找到这个 skill，删掉旧的，重新上传新文件。

---

## 怎么触发这个 skill

想要触发 skill 很简单，以这个 skill 为例：`SKILL.md` 里写了类似这样的描述——"当用户说'帮我优化一下这篇 markdown 的排版'、'帮我整理这篇文档格式'、'美化一下这篇博客文章'、'这篇文章排版有点乱帮我改一下'、'按照我博客的风格重新排版/重写'……"
> 这段话就在 `SKILL.md` 的 description 字段里，想知道一个 skill 会在什么时候被触发，直接打开看一眼就行。

### 自动触发

直接跟 Claude 或 Claude Code 说：
```
帮我把 /document/strawberry.txt 这篇文章的 markdown 排版优化一下，按我博客的风格整理
```
Claude 或 Claude Code 会根据 skill 的 description 自己判断要不要调用它。
> 想验证它有没有真的用上这个 skill，看它的 thinking 过程——里面会显示它有没有去读 `SKILL.md`。

### 手动指定（只有 Claude Code 支持斜杠命令）

`.claude/skills/<名字>/SKILL.md` 这种目录结构，会自动对应一个同名斜杠命令。这个 skill 对应的是：
```
/blog-markdown-formatter /document/strawberry.txt
```
不需要写一整段提示词，但斜杠命令后面**至少要接一个目标**（比如文件路径），不能什么都不接：
- 接了内容：在 `SKILL.md` 没有定义 `$ARGUMENTS` 占位符的情况下，Claude Code 会自动把打的内容追加成 `ARGUMENTS: 你打的内容`，接在 skill 规则末尾，让 Claude 知道具体要处理什么
- 什么都不接：只会把排版规则加载进上下文，但不知道要处理哪个文件，大概率会反问你

## 总结

不知道有啥好总结的，看到这里，你应该知道怎么用 skill 了。

那么恭喜你，你被窝恭喜到了。
