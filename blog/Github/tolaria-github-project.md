---
slug: 2026/08/21/tolaria-github-project
title: Tolaria：用 Git 管 Markdown 知识库的桌面应用
date: 2026-08-21
tags: [markdown, knowledge-base, tauri, open-source, macos]
description: Tolaria 是一个跨平台桌面应用，把 Markdown 文件夹变成带类型系统、双向链接和 Git 版本历史的知识库，不绑定账号，不依赖云服务。
---
笔记软件用久了，最怕的一件事是数据在别人那里。Notion 服务挂了你的文档打不开，Obsidian 的插件格式用三方工具不认，迁移一次劳民伤财。Tolaria 的出发点就是反这件事——你的笔记是普通 Markdown 文件，Git 管版本，换任何编辑器照样能用。
{/* truncate */}
---
## 介绍
Tolaria 是 [Luca Rossi](https://x.com/lucaronin)（Refactoring Newsletter 的作者）做的一个跨平台桌面应用，用 Tauri + React + TypeScript 写成，macOS、Windows、Linux 都能跑。它把一个普通文件夹当作「vault」，里面全是 `.md` 文件加 YAML frontmatter，Tolaria 在上面加了四栏式导航界面、类型系统、双向链接、属性面板和内置 MCP server。
几个核心设计决定值得说一下：
**文件是唯一真相来源。** 应用有内存缓存和 React 状态，但两者都是从磁盘文件派生出来的，随时可以删掉重建。文件在磁盘上是什么，应用就显示什么。
**每个 vault 是一个 Git 仓库。** 版本历史、回滚、多设备同步全靠 Git，不需要 Tolaria 自己的服务器。你用 GitHub 私仓、自建 Gitea 或者本地 bare repo 都行。
**类型是导航手段，不是约束。** 给笔记加一个 `type: Project` 的 frontmatter 字段，Tolaria 就把这些笔记归到「Project」这一类，支持按类型过滤、跳转。但没有必填字段，没有格式校验，你随时可以不用。
**AI 友好。** vault 里有一个 `AGENTS.md`，Claude Code、Codex CLI、Gemini CLI 装好之后读这个文件就知道 vault 的结构约定，不需要每次重新解释。内置 MCP server 让 AI agent 可以直接操作笔记。
项目以 AGPL-3.0 开源，作者自己用它管理一个 10,000 条以上的笔记库。
---
## 安装环境
macOS 用 Homebrew 最省事：
```bash
brew install --cask tolaria
```
> ✅ 正常：Applications 里出现 Tolaria，打开之后看到「新建 vault」的引导界面
> ❌ 异常：`cask 'tolaria' is unavailable` ——Homebrew 公式还没同步，直接去 [Releases 页](https://github.com/refactoringhq/tolaria/releases/latest) 下 DMG 手动装

Windows 和 Linux 从 Releases 页下对应安装包。Windows 的安装包有 Authenticode 签名，公司管理的设备可能需要 IT 提前授权 Tolaria 的发布者。
至此，Tolaria 已经装好。
---
## 运行
第一次打开，Tolaria 会提示你选一个 vault——可以新建空文件夹，也可以 clone 官方的入门 vault 跟着走一遍：
```bash
git clone https://github.com/refactoringhq/tolaria-getting-started
```
然后在 Tolaria 里「Open Vault」选这个文件夹就行。
界面是四栏布局：左侧是类型/标签导航，第二栏是笔记列表，第三栏是当前笔记，第四栏是属性面板（frontmatter 字段的可视化编辑区）。大部分操作有 Command Palette（⌘K），键盘党不用摸鼠标。
给笔记加类型只需要在 frontmatter 里写：
```yaml
---
type: Project
status: Active
belongs_to: "[[Work]]"
---
```
`type`、`status`、`belongs_to`、`related_to` 这些字段名是 Tolaria 的内置约定，直接触发对应的 UI 行为，不需要任何配置。
我没有在这台机器上把 vault 跑起来，以上描述来自源码（`docs/ARCHITECTURE.md`）和 README 的交叉验证。
---
## 效果展示
（此处插入四栏界面截图）
（此处插入类型导航 + 属性面板截图）
---
## AI-friendly
把下面这段给 Claude Code 或 Codex，它可以独立把 Tolaria 装起来并打开一个 vault：
```
Install Tolaria and open a sample vault:
1. macOS: brew install --cask tolaria
   Windows/Linux: download from https://github.com/refactoringhq/tolaria/releases/latest
2. Clone the getting-started vault:
   git clone https://github.com/refactoringhq/tolaria-getting-started ~/tolaria-demo
3. Open Tolaria, click "Open Vault", select ~/tolaria-demo
4. Explore the AGENTS.md file in the vault root — it describes vault conventions for AI agents
Requirements: macOS 13+, Windows 10+, or Linux with WebKit2GTK 4.1
To build from source: Node.js 20+, pnpm 8+, Rust stable, then run:
  pnpm install && pnpm tauri dev
```
---
## 卸载和下次运行
卸载：
```bash
brew uninstall --cask tolaria
```
Windows 走系统「添加或删除程序」，Linux 用对应包管理器卸载。vault 文件夹本身不会被删，它只是一个普通文件夹，你自己决定留还是删。
下次运行：
```bash
open -a Tolaria
```
上次打开的 vault 会自动恢复，不需要重新选。
