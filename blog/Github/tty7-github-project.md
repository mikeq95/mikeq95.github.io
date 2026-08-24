---
slug: 2026/08/01/tty7-github-project
title: tty7，一个把 shell、SSH 和 coding agent 放在一起的终端工作台
date: 2026-08-01
tags:
  - github
  - Ai-friendly
description: "tty7 是用纯 Rust 写的跨平台终端工作台：会话常驻、原生 SSH、识别 Claude Code 等 coding agent。v26.8.1 新增远程工作区和可脚本化的 CLI。这篇整理它的定位、安装和实际跑通的用法。"
---

## 介绍

tty7 是一个终端工作台，不只是"再做一个更好看的终端"。它把 shell 会话、SSH 连接和 coding agent 放在同一套界面里：关掉窗口甚至重启机器，shell 还在跑，不用再靠 tmux 保活；pane 里如果跑着 Claude Code、Codex、OpenCode 这类 agent，侧栏会显示状态点、分支和 diff，agent 卡住等你批准时还会弹通知。

{/* truncate */}

---

底层是纯 Rust。界面走 [Zed](https://github.com/zed-industries/zed) 的 gpui 做 GPU 渲染，终端 VT 解析用的是 Alacritty 那一套。官方在同一台 M1 Pro 上做过对比：11 MB 纯文本 `cat` 大约 95 ms，同条件的 Alacritty / Ghostty / Kitty 在 179–239 ms；DOOM-fire 帧率也更高一截。冷启动内存大约 116 MB（GUI 加常驻 server）。

日常输入这块做得很满：历史影子建议、带说明的 Tab 补全、边打边高亮的语法着色、`⌃R` 模糊搜历史、多行编辑、点一下就能把光标放到任意位置。窗口侧有标签、分屏、`⌘P` 命令面板、`⌘F` 回滚搜索，侧栏还能按 git 仓库分组。SSH 不走系统 `ssh`，是内置的 russh 栈：profile、keychain 凭据、SFTP 面板、端口转发和跳板机都在应用里。

对 coding agent 的支持是外围增强，不是把 agent 包一层。它能识别大约 17 个 CLI agent，在标签和侧栏上显示品牌头像和状态；设置页可以给 Claude Code、Codex、OpenCode、Pi、Grok Build 等装 hooks，用来驱动状态点和会话恢复。重启后相关 pane 会按原来的启动参数把对话续上。v26.8.1 还加了 fork 会话和复制 session id。

这一版真正拉开差距的是两件事。第一是**远程工作区**：不再只是开一个 SSH 进去的 pane，而是整扇窗口绑定到一台机器。文件树、git 状态、diff 浮层都由远端的 `tty7-server` 提供，关窗口只是 detach，远端的 shell 和 agent 继续跑，换一台电脑也能接回去。WSL 发行版也会作为 machine 出现在工作区切换里。第二是**可脚本化的 `tty7` CLI**：安装包里自带，启动后会自动挂到 PATH。Coding agent 或脚本可以用 `run`、`send`、`capture`、`events` 这些非交互命令驱动 pane，全程支持 `--json`。

项目在 GitHub 上目前大约四百多 star，macOS / Windows / Linux 都有原生安装包。

---

## 安装环境

二进制安装不需要额外依赖。去 [v26.8.1 release](https://github.com/l0ng-ai/tty7/releases/tag/v26.8.1) 按平台下载即可：

| 平台 | 安装包 |
| --- | --- |
| macOS Apple Silicon | `tty7-26.8.1-macos-arm64.dmg` |
| macOS Intel | `tty7-26.8.1-macos-x86_64.dmg` |
| Windows | `tty7-26.8.1-windows-x86_64-setup.exe`，或便携版 `.zip` |
| Linux | `tty7-26.8.1-linux-x86_64.AppImage`，或 `.tar.gz` |

macOS 上打开 dmg，把 `tty7.app` 拖进「应用程序」。第一次打开如果被 Gatekeeper 拦住，在系统设置里允许一次就行。

Linux 的 AppImage 需要先 `chmod +x` 再运行。Windows 用 setup 安装，或解压 zip 直接跑。

不想从 release 装、非要从源码编的话，仓库是 Cargo workspace，需要较新的 Rust 工具链，还要拉 gpui 相关依赖，构建成本明显高于直接下安装包。日常使用走 release 就够。

---

## 运行

装好后从启动台或 Applications 打开 tty7。首次启动会拉起本机的 `tty7-server`（常驻进程），之后关掉窗口不等于关掉会话——shell 还在 server 这边活着。

CLI 会随应用一起安装。macOS 上常见位置是 `/opt/homebrew/bin/tty7` 指向 app bundle 里的二进制。新开一个终端，确认一下：

```bash
tty7 --version
# tty7 26.8.1

tty7 doctor
```

`doctor` 会检查 socket、协议 dialect、配置目录、版本和当前上下文。正常时大致是：

```text
CHECK            RESULT
server           ok (build 26.8.1)
dialect          ok (control v4, protocol v5)
status           pid …, up …s, N panes
```

配置和 socket 默认落在 `~/.config/tty7/`。

几个常用命令：

```bash
# 看本机有哪些 workspace / tab / pane
tty7 ls
tty7 pane ls

# 在新 pane 里跑命令，输出实时流回当前终端，退出码原样返回
tty7 run -- echo hello
tty7 run -- cargo test

# 把某次命令留在 pane 里不立刻关掉
tty7 run --keep -- uname -a

# 读某个 pane 的输出（默认当前 pane；--plain 去掉控制序列）
tty7 capture --plain

# 当前有没有 coding agent 在跑
tty7 agents

# 本机 + 已连接的远程机器
tty7 machine ls
```

地址可以用 `%N` 指 pane、`@N` 指 tab。在 tty7 自己的 shell 里，环境变量 `TTY7_PANE` / `TTY7_WS` 已经写好，多数命令不用再手填地址。需要机器可读输出时加 `--json`；要操作远端机器时加 `-m <machine>`。

远程工作区从应用里的 **Home → Connect to Host**（或工作区切换器）进入。第一次连上会把 `tty7-server` 推到那台机器，不需要 sudo，确认一次即可。之后那扇窗口的文件树、git、diff 都来自远端，而不是本机磁盘。

Agent hooks 在 **设置 → Agents** 里一键安装。装完之后，对应 agent 的状态点、通知、会话恢复和 fork 才有完整数据可依。

---

## 效果展示

（此处插入截图：tty7 主界面，左侧按仓库分组的侧栏，某个 pane 里跑着 Claude Code / Codex，状态点和分支 diff 可见）

（此处插入截图：远程工作区窗口，标题绑定到远端机器名，文件树与 git 状态来自远端）

CLI 侧，本机验证过的一组输出可以参考：

```text
$ tty7 status
SERVER
pid      …
uptime   …
panes    1
dialect  control v4, protocol v5
build    26.8.1
socket   ~/.config/tty7/control.sock

$ tty7 pane ls
PANE  WS        TAB  CWD     LIVE
%1    b63abbb0  @1   …       yes

$ tty7 run -- echo "hello from tty7"
hello from tty7
```

---

## AI-friendly

把下面这段丢给 Claude Code、Codex 这类 AI coding agent，让它照着装并验证：

```text
帮我在当前机器上安装并验证 tty7 v26.8.1（不要从源码编译，直接用 release 二进制）：

1. 打开 https://github.com/l0ng-ai/tty7/releases/tag/v26.8.1
2. 按平台下载对应包：
   - macOS arm64: tty7-26.8.1-macos-arm64.dmg
   - macOS x86_64: tty7-26.8.1-macos-x86_64.dmg
   - Windows: tty7-26.8.1-windows-x86_64-setup.exe（或便携 zip）
   - Linux: tty7-26.8.1-linux-x86_64.AppImage（或 tar.gz）
3. macOS：挂载 dmg，把 tty7.app 复制到 /Applications，必要时去掉隔离属性（xattr -cr）
   Linux AppImage：chmod +x 后直接运行
   Windows：跑 setup 或解压 zip
4. 启动一次 tty7 GUI，让它拉起本机 server，并把 CLI 链到 PATH
5. 新开 shell，依次执行并确认成功：
   - tty7 --version   （应输出 26.8.1）
   - tty7 doctor      （server / dialect 应为 ok）
   - tty7 status
   - tty7 run -- echo ok
如果 `tty7` 命令找不到，检查 /opt/homebrew/bin、/usr/local/bin、~/.local/bin 是否在 PATH 里，或直接调用 app bundle 内的 MacOS/tty7。
不要执行卸载以外的破坏性操作；配置目录默认在 ~/.config/tty7/。
```

---

## 卸载和下次运行

卸载（macOS 二进制安装）：

```bash
# 先退出应用；若只要关窗口、保留会话，用普通退出即可
# 若要连 server 一起停，用托盘菜单里的 Quit and Stop Daemon

rm -rf /Applications/tty7.app
rm -f /opt/homebrew/bin/tty7 /usr/local/bin/tty7 ~/.local/bin/tty7

# 可选：清掉配置、socket 和历史
rm -rf ~/.config/tty7
```

Windows 用安装器自带的卸载，或删掉解压目录，并确认用户 PATH 里不再指向该目录。Linux 删掉 AppImage / 解压目录即可。

下次运行：不用重新下载。打开 `tty7.app`（或对应平台的可执行文件）即可；CLI 仍直接用：

```bash
tty7 doctor
tty7 ls
tty7 run -- <你的命令>
```

---

## 总结

tty7 面向的是已经把日常工作放进终端的人：要常驻会话、要 SSH，还要并排跑多个 coding agent。它和"更快的终端模拟器"不在同一条线上——会话由本机 server 托管，agent 状态写进侧栏和托盘，v26.8.1 又把整机远程工作区和脚本化 CLI 补上了。目前 star 还不算多，迭代很快；如果主战场已经是 Claude Code / Codex 这类终端 agent，值得装一份试试。
