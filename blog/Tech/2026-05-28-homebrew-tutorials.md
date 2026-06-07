---
slug: 2026/05/28/homebrew-tutorials
title: 介绍 Homebrew
date: 2026-05-28
image: /coverimage/Homebrew-coverimage.png
tags:
  - macos
---

> "macOS 上最流行的命令行软件安装器。"

在 Mac 上装软件，你是不是还在官网一个个找安装包？有了 Homebrew，一条命令搞定一切——安装、更新、卸载，全部统一管理，告别手动下载的烦恼。

Homebrew 是一个用于 macOS 和 Linux 的[包管理器](https://clearlove7-ai.vercel.app?word=包管理器&postId=2026-05-28-homebrew-tutorials)，它的核心价值就一句话：**用命令行统一管理你电脑上的所有软件**。

{/* truncate */}

---

## 安装 Homebrew

### 在中国

由于网络原因，推荐使用国内镜像脚本：[来源](https://github.com/ineo6/homebrew-install)

```bash
/bin/bash -c "$(curl -fsSL https://gitee.com/ineo6/homebrew-install/raw/master/install.sh)"
```

### 在中国以外

使用官方脚本：[来源](https://brew.sh/)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

>"中国有他自己的世界，嗯"

---

## 核心概念：formula 和 cask

在用 Homebrew 之前，先搞清楚两个概念：

- **[formula](https://clearlove7-ai.vercel.app?word=formula&postId=2026-05-28-homebrew-tutorials)（配方）**：用来安装**命令行工具**，比如 `git`、`python`，没有图形界面
- **[cask](https://clearlove7-ai.vercel.app?word=cask&postId=2026-05-28-homebrew-tutorials)（酒桶）**：用来安装**有图形界面的 App**，比如 Firefox、VS Code

> 我说的不是英雄联盟的那个酒桶😂

简单记忆：**有图标的 App → cask，纯命令行工具 → formula**。

---

## 安装软件

安装命令行工具（formula），比如 git：

```bash
brew install git  # 安装 git
```

安装图形界面 App（cask），比如 Firefox：

```bash
brew install --cask firefox  # 安装 Firefox
```

---

## 更新软件

在升级之前，先刷新一下 Homebrew 的软件列表，确保拿到最新版本：

```bash
brew update  # 刷新软件列表（类似刷新 App Store）
```

然后再升级指定软件，比如 Python：

```bash
brew upgrade python  # 升级 Python 到最新版
```

> **注意**：`brew update` 是更新 Homebrew 自己的清单，`brew upgrade` 才是真正升级软件，两者不一样哦。

---

## 锁定版本

有时候你不想让某个软件自动升级——比如你的项目依赖特定版本的 Python，升级了反而会出问题。这时候可以用 `pin` 锁定版本：

```bash
brew pin python  # 锁定 python，阻止自动升级
```

查看已经锁定的软件：

```bash
brew list --pinned
```

想解锁了，允许升级：

```bash
brew unpin python  # 解锁 python
```

---

## 卸载软件

卸载命令行工具：

```bash
brew uninstall node  # 卸载 node
```

卸载图形界面 App：

```bash
brew uninstall --cask firefox  # 卸载 Firefox
```

卸载 Homebrew 本身：

```bash
/bin/bash -c "$(curl -fsSL https://gitee.com/ineo6/homebrew-install/raw/master/uninstall.sh)"
```

---

## 总结

|操作|命令|
|---|---|
|安装命令行工具|`brew install <名称>`|
|安装图形 App|`brew install --cask <名称>`|
|刷新软件列表|`brew update`|
|升级软件|`brew upgrade <名称>`|
|锁定版本|`brew pin <名称>`|
|查看已锁定|`brew list --pinned`|
|解锁版本|`brew unpin <名称>`|
|卸载软件|`brew uninstall <名称>`|

以上这些命令，已经覆盖了日常使用 Homebrew 的绝大多数场景。在我看来，Homebrew 是 Mac 上必装的工具，实在是太方便了。