---
slug: 2026/07/21/uninstally-github-project
title: Uninstally，一款干净卸载 macOS App 的原生小工具
date: 2026-07-21
tags:
  - github
  - macos
description: "Uninstally 是一款开源的 macOS 卸载器，靠 bundle identifier 检测清理 App 留下的偏好设置、缓存、容器等残留文件。这篇记录一下它的原理、安装方式和实际用下来的体验。"
---

macOS 自带的删除方式是把 App 拖进废纸篓，但偏好设置、缓存、日志这些残留文件基本不会跟着走。翻到 [Uninstally](https://github.com/gostonx/uninstally) 这个项目——⭐ 509，MIT 协议，SwiftUI 写的原生小工具，专门干这件事，用下来觉得值得写一篇。

{/* truncate */}

---

## 它是什么

Uninstally 是一款原生 macOS 应用，卸载 App 的同时清理它散落在系统各处的残留文件——偏好设置、缓存、容器（container）、日志等。核心原理是通过 App 的 bundle identifier 去扫描关联文件，扫描完会先列出来让用户确认，再决定删不删，不会一上来就直接删。

除了卸载 App，它还能接管 Homebrew 安装的包，算是把"手动装的 App"和"命令行装的包"放在同一个界面里管理。

---

## 安装

系统要求：macOS 14 及以上；如果要从源码编译，需要 Xcode 16。

Homebrew 安装：

```bash
brew install --cask gostonx/tap/uninstally
```

或者去 [release 页面](https://github.com/gostonx/uninstally/releases/latest)下载最新的 DMG，拖进 `Applications` 即可。

---

## 实际使用感受

### Finder 集成和批量卸载

支持在 Finder 里右键 App 直接调出卸载菜单，也支持一次选多个 App 批量清理，比一个个手动拖进废纸篓效率高不少。

### 误删可恢复

有个"最近卸载"（Recently Uninstalled）功能，卸载记录会保留一段时间，手滑删错了还能找回来。

### 扫理"手动删除"留下的残留

如果之前已经直接拖进废纸篓删掉了 App，本体虽然没了，但残留文件还在——Uninstally 提供了单独的残留文件扫描器，能找到这些"孤儿文件"并清理掉。

### 隐私

README 里写得比较明确：不收集任何数据、不发送统计、不需要账号，所有处理都在本地完成；因为要扫描系统保护目录，需要授予"完全磁盘访问权限"（Full Disk Access），更新包用 EdDSA 签名校验。

### 多语言

界面支持 10 种语言，更新走 Sparkle 框架，提供多个更新渠道可选。

---

## 总结

如果长期在 Mac 上装卸各种 App、又不想手动去 `~/Library` 底下翻残留文件，Uninstally 是个轻量、免费、隐私上也交代清楚的选择；对已经用拖拽方式删过的 App，它的残留扫描器还能帮忙补一次"深度清洁"。项目刚起步不久（2026 年 7 月创建），后续功能和稳定性可以再观察一段时间。
