---
slug: 2026/06/22/using-skill-in-claude-and-claude-code
title: "🧩 在 Claude Code 和 Claude 上用 skill"
date: 2026-06-22
image: https://cdn.mikeq95blog.uk/coverimage/claude-skills-en-cn.png
tags:
  - Claude Code
description: "claude.ai 和 Claude Code 的 skill 是两套独立系统，分别怎么装、怎么用、容易踩哪些坑，整理在这一篇。"
---

什么是 skill？如何在 Claude 和 Claude Code 中安装和使用 skill？

{/* truncate */}

---

## [skill](https://clearlove7-ai.vercel.app?word=skill&postId=2026-06-22-using-skill-in-claude-and-claude-code) 是什么

简单说，skill 就是一个文件夹，里面至少有一个 `SKILL.md`，写清楚"什么时候该用这个能力"和"具体怎么做"。
> 个人感觉也有点像是单机游戏的 MOD，但是这个 MOD 是专门为了增强游戏体验的。

---

## 在 Claude Code 里装

### 第一步：下载 `.skill`

如果你的 skill 是通过 Claude Code 的 skill creator 文件应该长这样：

![claude 生成的 skill 文件图标](https://cdn.mikeq95blog.uk/coverimage/claude-skill-file-icon.png)

一个橙色的"SKILL"图标，后缀名是`.skill`,但他还是一个zip包，后缀名和图标只是显示层面的东西。

如果你还是不信，打开终端，输入：

```bash
file ~/Downloads/blog-markdown-formatter.skill
```

✅ 正常：输出里带 `Zip archive data`，证明它确实是 zip

❌ 异常：如果输出是别的内容，说明下载过程文件损坏了，重新下载一次

### 第二步：解压

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

## 更新 skill

你第一次用claud做出的skill，可能你不太满意，你打开vscode编辑了一下这个md文件，这时候你需要更新skill。


**Claude Code 的做法**：

```bash
cd ~/Downloads
rm -rf ~/.claude/skills/blog-markdown-formatter
unzip blog-markdown-formatter.skill -d ~/.claude/skills/
```

**Claude 的做法**：去 Settings → Customize → Skills，找到这个 skill，删掉旧的，重新上传新文件。

---

## skill用法

打开skill.md，看description.

### 自动触发

直接跟 Claude 或 Claude Code 说：
```
> 假如这是一个优化博客文章的skill:

帮我把 /document/test.txt 这篇文章的 markdown 排版优化一下，按我博客的风格整理
```

### 手动指定

```
/blog-markdown-formatter /document/test.txt
```

> 只在Claude code中有效

## 总结

看到这你应该会用了

那么恭喜你，你被我恭喜到了。
