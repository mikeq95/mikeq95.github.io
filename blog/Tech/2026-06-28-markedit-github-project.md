---
slug: 2026/06/28/markedit-github-project
title: MarkEdit，Mac 上一个 4MB 的 Markdown 编辑器
date: 2026-06-28
image: https://cdn.mikeq95blog.uk/coverimage/markedit.png
tags:
  - github
  - macos
description: "MarkEdit 是一款开源免费的 macOS 原生 Markdown 编辑器，安装包只有 4MB，主打轻量、原生、能扛大文件，记录一下它的特点和安装方法。"
---

一直在找一个纯粹一点的 Markdown 编辑器，不想要那种又大又卡、还要联网的 Electron 应用。最近发现了 [MarkEdit](https://github.com/MarkEdit-app/MarkEdit)，开源免费，专门给 macOS 做的，定位就是"Mac 上的 TextEdit，但专门用来写 Markdown"。这篇文章记录一下它的特点和安装方法。

{/* truncate */}

---

## 它是什么

MarkEdit 是一个 macOS 原生的 Markdown 编辑器，几个关键点：

- **免费开源**，MIT 协议
- **体积小**，安装包大概 4MB，比 Electron 应用小很多
- **能扛大文件**，处理 10MB 的文件依然很流畅
- **不收集任何用户数据**，纯本地编辑
- **严格遵循 [GFM 规范](https://github.github.com/gfm/)**，没有自创语法，编辑内核基于 [CodeMirror 6](https://codemirror.net/)

作者的说法是，他们不追求在某一个维度上做到最好，而是在**体积、速度、原生体验、正确性**这几个维度上找平衡——纯 Rust 写的编辑器性能强但缺原生功能，基于 TextKit 的编辑器原生但扛不住大文件，靠正则解析 Markdown 的编辑器又谈不上正确性。MarkEdit 想把这几头都兼顾到。

---

## 安装

最低系统要求是 macOS 15.0。两种方式：

去 [release 页面](https://github.com/MarkEdit-app/MarkEdit/releases/latest)下载 `MarkEdit.dmg`，打开后把 `MarkEdit.app` 拖进 `Applications` 即可。

或者用 Homebrew：

```bash
brew install --cask markedit
```

装完之后会自动检查更新，不用手动操心版本。

---

## 实际使用感受

### 界面和交互

整体就是 macOS 原生控件那一套，没有自定义皮肤的违和感，力触控查词、输入预测、Writing Tools 这些系统级功能都能直接用，跟用 TextEdit、备忘录的感觉是一致的。

### 扩展性

自定义是通过 CSS、JavaScript 和 [CodeMirror 插件](https://github.com/MarkEdit-app/MarkEdit-api)来做的，官方维护了几个扩展：

- [MarkEdit-preview](https://github.com/MarkEdit-app/MarkEdit-preview)：预览面板
- [MarkEdit-theming](https://github.com/MarkEdit-app/MarkEdit-theming)：自定义主题
- [MarkEdit-ai-writer](https://github.com/MarkEdit-app/MarkEdit-ai-writer)：macOS Tahoe 上接入 Apple Intelligence

还支持 Shortcuts 和 AppleScript，可以接到自动化流程里。如果想让 AI agent 来管理 MarkEdit，官方还专门做了一个 [MarkEdit-skill](https://github.com/MarkEdit-app/MarkEdit-skill)。

### 克制的功能取向

作者在 [Why MarkEdit](https://github.com/MarkEdit-app/MarkEdit/wiki/Why-MarkEdit) 里提到，这个项目是刻意"功能贫乏"的——能用扩展解决的就不往主程序里塞，core 保持精简。提需求要先讨论行为变化是否合理，不是无脑加功能。

---

## 和其他编辑器比

| | MarkEdit | Typora | iA Writer |
|---|:---:|:---:|:---:|
| 价格 | ✅ 免费 | 💳 一次性付费 | 💳 一次性付费 |
| 开源 | ✅ MIT | ❌ | ❌ |
| 体积 | ✅ ~4MB | 中等 | 中等 |
| 大文件性能 | ✅ 10MB 流畅 | 一般 | 一般 |
| 数据隐私 | ✅ 纯本地 | 本地 | 本地 |

---

## 总结

如果只是想要一个干净、原生、不卡顿的 Markdown 编辑器，不需要花里胡哨的功能，MarkEdit 是个挺合适的选择，而且免费。
