---
slug: 2026/08/21/atoll-dynamic-island-macos
title: Atoll：把 MacBook 刘海屏变成控制中心
date: 2026-08-21
tags: [macos, swift, open-source, notch, media, Ai-friendly]
description: Atoll 是一个开源 macOS 应用，把 MacBook 的刘海屏改造成媒体控制、系统监控和生产力工具的集合面板。本文基于源码阅读整理。
---

Atoll 是一款开源的 macOS 应用，专门用来盘活 MacBook 那块常年当摆设的刘海屏。它把这块区域改成一个可以展开的控制面板，装下媒体控制、系统监控和一堆生产力小工具。

{/* truncate */}

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

---

## 介绍

Atoll 是一个 Swift/SwiftUI 写的 macOS 原生应用，用刘海屏那块区域做展开式控制面板。平时收起来不占地方，鼠标移过去展开，里面可以放媒体控制、系统状态、定时器、剪贴板历史等一堆东西。

它起步于 [Boring.Notch](https://github.com/TheBoredTeam/boring.notch) 的代码库——媒体播放器集成、AirDrop 面板、文件 Dock 这些核心架构都是从那边改过来的，然后在上面加了一大圈自己的东西：锁屏挂件、LLM 用量追踪、终端标签页、可拖拽的剪贴板卡片……

翻了一下源码，测试覆盖是认真写的——`DynamicIslandTests` 目录里有针对 Apple Music 控制器、Spotify 库、飞出面板尺寸计算、媒体键重试策略的专项测试，不是摆样子的。

代码以 GPL v3 开源。

---

## 安装环境

去 [Releases 页](https://github.com/Ebullioscopic/Atoll/releases/latest) 下最新的 DMG，打开之后把 Atoll 拖进 Applications 就行。

安装完第一次启动，系统会陆续要权限：

- 辅助功能（Accessibility）——媒体按键拦截需要
- 屏幕录制（Screen Recording）——录屏状态指示需要
- 日历（Calendar）——日历预览需要
- 音乐（Music）——Apple Music 控制需要

> ✅ 正常：顶栏出现 Atoll 的菜单图标，刘海屏区域有响应
> ❌ 异常：刘海屏没反应——大概率是辅助功能权限还没给。去「系统设置 → 隐私与安全性 → 辅助功能」，手动加上 Atoll，然后完全退出重开

注意，给了权限但没重启的话经常没用。权限变化之后务必完全退出（⌘Q，不是关窗口）再重开。

---

## 运行

鼠标移到刘海屏区域，面板展开，顶部是几个标签：Media、Stats、Timers、Clipboard 等等，点对应标签切换。

几个值得试的地方：

- **Media**：Apple Music 和 Spotify 的播放控制、封面、歌词都在这里，Spotify 的「收藏当前歌曲」按钮也集成进来了（走 OAuth 2.0 PKCE，需要先在设置里授权）
- **Stats**：CPU、GPU、内存、网络、磁盘使用率实时显示，数据来自 SMC 和 IOReport，和 Stats.app 同源
- **Shelf**：从终端把文件扔进来：

    ```bash
    open -a Atoll /path/to/file
    ```

    也可以直接从 Finder 拖进去，之后可以拖出来扔给其他应用
- **LLM Usage**：如果你用 Claude Code、Codex 或者 Gemini CLI，Atoll 会读本地的会话日志，把近 7 天的用量汇总显示出来

我没在带刘海屏的机器上亲自装跑，以上描述来自源码和 README 的交叉验证，具体细节以你实际跑到的为准。

---

## 效果展示

（此处插入展开面板截图：媒体控制界面）

（此处插入锁屏挂件截图：媒体 + 天气 + 定时器）

---

## 给 AI 编程助手的提示词

懒得自己一步步照着装？把下面这段丢给 Claude Code 或者 Codex，它可以独立把 Atoll 装起来。

```text
## 目标
在一台带物理刘海屏的 MacBook 上从源码装好并跑起来 Atoll，能看到刘海屏区域展开出控制面板就算成功。

## 步骤
1. git clone https://github.com/Ebullioscopic/Atoll.git 并进入目录
2. 用 Xcode 15+ 打开 DynamicIsland.xcodeproj，把 signing team 改成自己的 Apple Developer 账号（或 Personal Team）
3. 选择 DynamicIsland scheme，在一台带物理刘海屏的 MacBook（14/16 寸 MBP，macOS 14+）上编译运行
4. 首次启动会依次要 Accessibility、Screen Recording、Calendar、Music 权限，在系统设置里逐个授予，然后完全退出（⌘Q）再重新打开一次

## 核查结果
确认顶栏出现 Atoll 的菜单图标，鼠标移到刘海屏区域能展开出面板，把结果（是否成功、卡在哪一步）汇报给我。

具体细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/08/21/atoll-dynamic-island-macos
```

---

## 卸载和下次运行

卸载：从 Applications 把 Atoll 拖进废纸篓，然后在「系统设置 → 隐私与安全性」里把之前给的权限收回来。

下次直接启动：

```bash
open -a Atoll
```
