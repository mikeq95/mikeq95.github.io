---
slug: 2026/07/21/starship-github-project
title: Starship，一个能在任何 Shell 里用的极简高速命令行提示符
date: 2026-07-21
tags:
  - github
description: "Starship 是用 Rust 写的跨 Shell 命令行提示符工具，Bash/Zsh/Fish/PowerShell 等十几种 Shell 都能用同一套配置。这篇记录一下它的原理、安装配置方式和实际用下来的体验。"
---

换了几次终端 Shell 之后，最烦的是每次都要重新折腾提示符（prompt）配置。翻到 [Starship](https://github.com/starship/starship) 解决了这个问题——⭐ 5.9 万，ISC 协议，用 Rust 写的跨 Shell 提示符工具，用下来觉得值得写一篇。

{/* truncate */}

---

## 它是什么

Starship 是一个命令行提示符（prompt）工具，定位是"极简、快、随便怎么定制"。它最大的特点是跨 Shell——同一套配置文件在 Bash、Zsh、Fish、PowerShell、Nushell、Elvish、Ion、Tcsh、Xonsh，甚至 Windows 的 Cmd（通过 Clink）上都能用，换 Shell 不用重新配置提示符。

底层用 Rust 写，官方主打的卖点就是"够快"，提示符里显示的 Git 状态、编程语言版本、执行耗时这些信息，实测切目录、敲命令的时候基本感觉不到延迟。

---

## 安装

最简单的方式是一条 curl 命令（Linux/macOS 通用）：

```bash
curl -sS https://starship.rs/install.sh | sh
```

也可以用各平台的包管理器装：

```bash
# macOS
brew install starship

# Rust 生态
cargo install starship --locked

# Windows
winget install --id Starship.Starship
scoop install starship
choco install starship
```

Linux 各发行版的 apt、pacman、dnf 也都能装，具体命令官网列得很全。

装完之后还要在 Shell 的配置文件里加一行初始化代码才会生效：

```bash
# ~/.bashrc
eval "$(starship init bash)"

# ~/.zshrc
eval "$(starship init zsh)"
```

```fish
# ~/.config/fish/config.fish
starship init fish | source
```

PowerShell 则是加进 `$PROFILE` 文件。

---

## 实际使用感受

### 配置文件

所有自定义都通过一个 `starship.toml` 文件完成，里面按"模块"（module）组织——当前目录、Git 分支、Git 状态、编程语言版本、命令耗时等等都是独立模块，哪个显示哪个不显示、顺序怎么排、图标和颜色，都能单独调。

### 预设配置

官方提供了一批预设（preset）主题，不想从零开始摸索的话可以直接套用一个再微调，比对着文档一个个模块试效率高很多。

### 跨 Shell 是真的省心

之前用 zsh 主题（比如 Powerlevel10k）换到 fish 就得重新配一遍，Starship 换 Shell 之后提示符观感基本不变，配置文件是共用的，不用重复劳动。

---

## 总结

如果经常在不同 Shell、不同系统（macOS/Linux/Windows）之间切换，又想要一个好看、够快、配置能复用的命令行提示符，Starship 目前算是这个方向上最成熟的选择——免费开源、生态活跃（Star 数接近 6 万），配置迁移成本也低。
