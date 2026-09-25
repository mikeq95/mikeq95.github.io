---
slug: 2026/05/28/homebrew-tutorials
title: 介绍 Homebrew
date: 2026-05-28
image: https://cdn.mikeq95blog.uk/coverimage/homebrew-en-cn.png
tags:
	- macos
description: "Mac 用户必备包管理工具 Homebrew 入门指南：一条命令安装、更新、卸载软件，告别手动下载。"
---

## 安装 Homebrew

### 在中国

由于网络原因，推荐使用国内镜像脚本：[来源](https://github.com/ineo6/homebrew-install)

国内镜像由社区维护，不是 [brew.sh](https://brew.sh/) 官方脚本。能打开 GitHub 时优先用官方安装。

```bash
/bin/bash -c "$(curl -fsSL https://gitee.com/ineo6/homebrew-install/raw/master/install.sh)"
```

### 在中国以外

使用官方脚本：[来源](https://brew.sh/)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

装完先确认命令可用：

```bash
brew --version
```

如果提示 `command not found: brew`，把安装结束时终端里提示的那两行加进 `~/.zprofile`（Apple Silicon 一般是 `eval "$(/opt/homebrew/bin/brew shellenv)"`），然后**新开一个终端**再执行 `brew --version`。

## 核心概念：formula 和 cask

在用 [Homebrew](https://brew.sh) 之前，先搞清楚两个概念：


> 我说的不是英雄联盟的那个酒桶😂

简单记忆：**有图标的 App → cask，纯命令行工具 → formula**。同一个名字既有 formula 又有 cask 时，装 App 请带上 `--cask`。

## 安装软件

安装命令行工具（formula），比如 git：

```bash
brew install git # 安装 git
```

安装图形界面 App（cask），比如 Firefox：

```bash
brew install --cask firefox # 安装 Firefox
```

不确定包名时可以先搜：

```bash
brew search git
```

## 更新软件

在升级之前，先刷新一下 Homebrew 的软件列表，确保拿到最新版本：

```bash
brew update # 刷新软件列表（类似刷新 App Store）
```

然后再升级指定软件，比如 Python：

```bash
brew upgrade python # 升级 Python 到最新版
```

只输入 `brew upgrade`、后面不跟名字，会升级所有**未锁定**的软件。

> **注意**：`brew update` 是更新 Homebrew 自己的清单，`brew upgrade` 才是真正升级软件，两者不一样哦。

## 锁定版本

有时候你不想让某个软件自动升级——比如你的项目依赖特定版本的 Python，升级了反而会出问题。这时候可以用 `pin` 锁定版本：

```bash
brew pin python # 锁定 python，阻止自动升级
```

查看已经锁定的软件：

```bash
brew list --pinned
```

想解锁了，允许升级：

```bash
brew unpin python # 解锁 python
```

## 卸载软件

卸载命令行工具：

```bash
brew uninstall node # 卸载 node
```

卸载图形界面 App：

```bash
brew uninstall --cask firefox # 卸载 Firefox
```

卸载 Homebrew 本身。脚本会先列出即将删除的路径，确认后再输入 `y`。

在中国：

```bash
/bin/bash -c "$(curl -fsSL https://gitee.com/ineo6/homebrew-install/raw/master/uninstall.sh)"
```

在中国以外（官方脚本）：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/uninstall.sh)"
```

## 总结

| 操作 | 命令 |
| --- | --- |
| 安装命令行工具 | `brew install <名称>` |
| 安装图形 App | `brew install --cask <名称>` |
| 搜索包名 | `brew search <关键词>` |
| 刷新软件列表 | `brew update` |
| 升级指定软件 | `brew upgrade <名称>` |
| 升级全部未锁定软件 | `brew upgrade` |
| 锁定版本 | `brew pin <名称>` |
| 查看已锁定 | `brew list --pinned` |
| 解锁版本 | `brew unpin <名称>` |
| 卸载命令行工具 | `brew uninstall <名称>` |
| 卸载图形 App | `brew uninstall --cask <名称>` |

以上这些命令，已经覆盖了日常使用 Homebrew 的绝大多数场景。在我看来，Homebrew 是 Mac 上必装的工具，实在是太方便了。
```