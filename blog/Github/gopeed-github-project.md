---
slug: 2026/09/09/gopeed-github-project
title: Gopeed，一个 Go + Flutter 写的开源下载器
date: 2026-09-09
tags: [github, open-source, AI]
description: Gopeed 是一个用 Go 和 Flutter 写的跨平台开源下载管理器，支持 HTTP、BitTorrent、磁力链和 ed2k，还带了一个 MCP 接口能让 AI agent 直接管理下载任务。本文基于官方 README 整理，因为这次环境网络限速下不了安装包，没有实际跑起来验证。
---

Gopeed 是一个开源下载管理器，用 Go 写后端、Flutter 写界面，桌面端不套 Electron 也不用 WebView，走的是原生渲染这条路。它同时支持 HTTP/HTTPS、BitTorrent、磁力链接和 ed2k，桌面、移动端、Web 都能用。

{/* truncate */}

> 这篇文章没有实际下载运行验证——这次环境对 GitHub 大文件的下载限速得很厉害，release 包和源码包都卡在 20～40KB/s，几十兆的安装包下不完。下面的内容是照着官方 [README](https://github.com/GopeedLab/gopeed) 和文档整理的，实际体验建议直接去 [gopeed.com](https://gopeed.com) 下载试用。

---

## 介绍

[Gopeed](https://github.com/GopeedLab/gopeed)（Go Speed 的缩写）是一个跨平台下载管理器，核心逻辑用 Go 写，界面用 Flutter 渲染。GitHub 上有 2.6 万多个 star，项目从 2019 年就开始维护，不是新项目。开源协议是 GPLv3。

多协议支持是它的核心卖点：HTTP/HTTPS 多连接下载、BitTorrent（带 DHT 节点发现、uTP 传输、Web Seed、按文件选择下载、按比例或时间限速做种）、磁力链接、ed2k，一个客户端全覆盖，不用分别装迅雷和专门的 BT 客户端。界面这块选了 Flutter 而不是常见的 Electron 方案，官方说法是体积更小、开销更低、响应更快——原生渲染确实比套一个 Chromium 内核更轻。

比较有意思的是它给 AI agent 留了一个口子：内置了一个 MCP 端点，能让支持 MCP 协议的 AI 助手用自然语言创建、查询、暂停或删除下载任务，比如直接跟 AI 说"帮我下载 Gopeed 最新的 Windows 客户端"，agent 就能调用 `resolve_task`、`create_task` 这些工具帮你把任务建起来。除此之外还有浏览器扩展（[GopeedLab/browser-extension](https://github.com/GopeedLab/browser-extension)，支持 Chrome、Edge、Firefox）、JavaScript 扩展系统（用来接入视频站、AI 模型仓库、云存储这些下载源）、REST API 和 CLI，自动化程度比一般的下载器高不少。

目前 2.0.0 版本还在公测阶段，重写了通信架构——桌面和移动客户端直接通过 FFI 连 Go 核心，跨平台体验更一致，也是这次重写才加上的 MCP 集成。稳定版和 2.0 Beta 是两条并行的发布线，公测用户可以直接升级到正式版，但稳定版用户不会被自动切进 Beta 频道。

---

## 安装环境

Gopeed 主要是给终端用户用的成品软件，装法按平台分：

**图形界面（推荐给大多数人）**：去 [官方下载页](https://gopeed.com) 或者 [GitHub Releases](https://github.com/GopeedLab/gopeed/releases/latest) 拿对应平台的安装包——macOS 是 `.dmg`，Windows 有 `.exe`/绿色版 `.zip`，Linux 有 `.AppImage`/`.deb`/`.rpm`，Android 是 `.apk`，iOS 是 `.ipa`，NAS 用户还有专门的 QNAP `.qpkg` 包。想抢先用 2.0 新架构的话，Releases 页里单独挂了一个 [2.0.0 Beta 1](https://github.com/GopeedLab/gopeed/releases/tag/v2.0.0-beta.1)。

**只要 CLI**：装了 Go 环境的话，一条命令搞定：

```bash
go install github.com/GopeedLab/gopeed/cmd/gopeed@latest
```

**自己编译桌面版**：需要 Go 1.25+、Flutter 3.41+，外加一套能跑 cgo 的 C 工具链。以 macOS 为例：

```bash
git clone git@github.com:GopeedLab/gopeed.git
cd gopeed
go build -tags nosqlite -ldflags="-w -s" -buildmode=c-shared -o ui/flutter/macos/Frameworks/libgopeed.dylib github.com/GopeedLab/gopeed/bind/desktop
cd ui/flutter
flutter build macos
```

Windows、Linux 换对应平台的产物路径和 `flutter build` 目标即可，命令结构是一样的。手机端额外要装 `gomobile`：

```bash
go install golang.org/x/mobile/cmd/gomobile@latest
go get golang.org/x/mobile/bind
gomobile init
```

至此，几条安装路径已经理清楚，选哪条看你是想直接用，还是想接入自己的自动化流程。

---

## 运行

这一节同样没有实际跑起来，是按 README 描述整理的，仅供参考。

图形界面装完直接打开就是一个任务列表界面，新建任务粘贴链接（HTTP 链接、磁力链接或者种子文件）即可开始下载，界面会跟随系统深浅色主题，另外还给了 8 种强调色可选。

CLI 装完之后，官方文档里描述的是一套通过 REST API 驱动的工作模式——本地起一个 Gopeed 服务进程，前端界面、浏览器扩展、第三方脚本都通过这套 API 和 Unix Socket（Windows 上是 TCP）跟核心通信。想接自动化流程的话，走 Webhook 和下载完成后脚本这两个口子。

想让 AI agent 接管下载任务的话，按 README 的说法是把 Gopeed 的 MCP 端点配置进任意兼容 MCP 的 agent 客户端，之后就能直接用自然语言创建、查、暂停、删除任务。

---

## 效果展示

这一节没有实际运行的截图，只能照着 README 里的描述转述：主界面是任务列表形式，支持按状态筛选、分类管理、批量操作，重启后能自动恢复未完成的任务。README 里贴的截图显示界面走的是简洁的卡片式布局，跟主流下载器的观感差别不大，主要差异在协议覆盖广度和自动化接口上，不在界面创新上。

（此处插入截图：Gopeed 主界面、新建下载任务弹窗）

---

## 卸载和下次运行

图形界面版本直接按平台常规方式卸载——macOS 把 App 拖进废纸篓，Windows 用控制面板卸载，Linux 按包管理器对应命令删掉 `.deb`/`.rpm`。

CLI 版本卸载就是删掉 `go install` 装到 `$GOPATH/bin` 里的那个 `gopeed` 二进制文件。

下次运行：图形界面直接打开 App；CLI 版本执行 `gopeed` 命令重新启动服务进程。
