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

>Accessbility是必须的，Screen Recording 和 Calendar 和 Muscic 看情况选择。（建议全选）

---

## 运行

## 功能介绍：

Atoll让你的Mac的刘海变得有用了起来，变得更加好用，下面介绍软件功能

**在岛上可以做什么？**

### HomePage

1. 媒体控制

这个软件接入了spotify,Apple Music，或者其他任何小众的音乐软件，又或者是打开了网易云音乐Web版的Safar浏览器，他都支持，都可以上岛然后控制，下面这个视频展示Apple Music


然后他还可以切换播放模式，比如随机播放，也有顺序播放（不开启随机播放那就是顺序播放，个人觉得这个思路还挺好），可以设置输出源，可以快捷控制音量，非常方便，基本涵盖日常常用的所有功能

视频演示：

<video controls width="100%">
  <source src="https://cdn.mikeq95blog.uk/coverimage/apple-music-demo.mp4" type="video/mp4" />
  你的浏览器不支持视频播放。
</video>

1. Schedule

可以导入你的日历上的日程设置，一切都会在HomePage的右边显示，所有重要的事情就变得不容易错过。

<video controls width="100%">
  <source src="https://cdn.mikeq95blog.uk/coverimage/calendar.mp4" type="video/mp4" />
  你的浏览器不支持视频播放。
</video>

### Atoll AirDrop panel

1， 快速Airdrop

之前你需要做2步，1右键2分享，现在只需要一步，而且很简单——把需要Airdrop的文件拖到刘海里，他会切换到Airdrop选项，视频演示如下：

![Atoll AirDrop panel](https://cdn.mikeq95blog.uk/coverimage/AirDrop.png)

2， 暂存文件

你可以把需要时不时用到的文件快速存在刘海中，这样你可以方便快速粘贴。本人觉得这个功能非常好，比如我有一个文档A和图片B，提前存在刘海里，然后我可以很方便地把文档A发给小A，图片B发给小B，而不是Command + Tab切来切去。

### timer

1.自定义

在左边，你可以自定义你想要的时间，比如20min,40min,1h等。

2.根据模式

在右边，你可以根据此时的需要来快速计时。

视频展示：

<video controls width="100%">
  <source src="https://cdn.mikeq95blog.uk/coverimage/timer.mp4" type="video/mp4" />
  你的浏览器不支持视频播放。
</video>

### 剪切板

点击即可打开clipboard manager,然后可以快速复制粘贴一些内容进去，功能基本够用

![Atoll Clipboard manager](https://cdn.mikeq95blog.uk/coverimage/Clipboard.png)

### 锁屏

当你`Control + Command + Q`锁屏时候，会油独特的显示效果。
> 这还挺帅的，我觉得。

![Atoll lock screen](https://cdn.mikeq95blog.uk/coverimage/Atoll-lock-screen.png)

---

## 卸载和下次运行

卸载：从 Applications 把 Atoll 拖进废纸篓

下次直接启动：

```bash
open -a Atoll
# -a 参数告诉 open 按"应用名字"而不是"文件路径"去查找
```
