---
slug: 2026/07/21/gifski-github-project
title: Gifski，Sindre Sorhus 做的 macOS 视频转高质量 GIF 工具
date: 2026-07-21
tags:
  - github
  - macos
description: "Gifski 是高产开源作者 Sindre Sorhus 的 macOS App，用同名的 gifski Rust 编码器把视频转成体积小、质量高的 GIF。这篇记录一下它的原理、安装方式和实际用下来的体验。"
---

之前整理这个博客用的表情包素材时，一直在找一个能把视频片段转成 GIF 又不糊的工具，翻到了 [Gifski](https://github.com/sindresorhus/Gifski)——⭐ 8.5k，MIT 协议，作者是开源圈很有名的 [Sindre Sorhus](https://github.com/sindresorhus)，用下来觉得值得写一篇。

{/* truncate */}

---

## 它是什么

Gifski 是一款 macOS 应用，把视频转换成高质量的 GIF 动图。名字和它底层用的编码器同名——[gifski](https://github.com/ImageOptim/gifski) 是一个用 Rust 写的 GIF 编码器，核心思路是用 [pngquant](https://pngquant.org/) 生成更精细的调色板，再交给 [gifsicle](https://www.lcdf.org/gifsicle/) 做质量调整，比系统自带或大多数在线工具转出来的 GIF 观感要清晰不少，尤其是渐变和肤色部分不容易出现色块。

这款 macOS App 本身是 Sindre Sorhus 众多开源小工具之一，界面很简洁：拖一个视频进去，调质量、尺寸、帧率、裁剪范围，导出就行。

---

## 安装

系统要求：最新版（3.0.4）需要 macOS 26 及以上；如果系统版本比较老，仓库里也列了对应的旧版本可以装：

- macOS 13+ 用 v2.23.0
- macOS 12+ 用 v2.22.3
- macOS 11+ 用 v2.21.2
- macOS 10.15+ 用 v2.20.2

装法：

主推是 [Mac App Store](https://apps.apple.com/app/gifski/id1351639930)，搜 "Gifski" 直接装，免费。

如果不想用 App Store，仓库 README 里也提供了不走商店的直接下载版（3.0.3，不会自动更新）。

从源码编译需要 Rust、SwiftLint 和 Xcode 命令行工具，仓库里有对应的构建说明。

---

## 实际使用感受

### 支持的格式和参数

几乎所有 macOS 能识别的视频格式都能拖进去转，包括 H264、HEVC、ProRes 编码的 MP4/MOV。可以调的参数挺全：尺寸（方向键微调 1px，Option+方向键调 10px）、帧率（最高支持到 50 FPS）、播放速度、裁剪范围、循环次数，以及最关键的质量滑块——质量和文件体积是直接挂钩的，想要小文件就得接受多一点压缩感。

### 顺逆播放效果

有个挺好玩的选项是"来回播放"（bounce/yo-yo），开启后 GIF 会正着放一遍再倒着放一遍，做循环动图时省得自己剪素材。

### 系统集成

支持 Share Extension，可以在其他 App 里选中视频直接分享给 Gifski；也注册了系统服务（Services），右键视频文件就能调用。快捷键也顺手：Cmd+C 直接复制生成的 GIF，Cmd+S 保存。

### 没有 CLI

需要注意的是这个 macOS App 本身不带命令行工具，纯 GUI 操作。如果想要命令行批量转换，得用底层那个同名的 [gifski](https://github.com/ImageOptim/gifski) 库单独编译 CLI 版本，是两个独立的仓库。

---

## 总结

如果只是偶尔需要把一段视频转成清晰一点的 GIF（写博客、发聊天记录之类），Gifski 是个开箱即用、体验很顺的选择——免费、开源、界面简单。如果是要写脚本批量处理一堆视频，得去用底层的 gifski CLI 库而不是这个 GUI App。

| | Gifski (App) | gifski (库/CLI) |
| --- | --- | --- |
| 形态 | macOS GUI 应用 | Rust 库 + 命令行工具 |
| 安装 | Mac App Store / 直接下载 | 从源码编译 |
| 适合场景 | 日常手动转几个 GIF | 脚本化批量转换 |
