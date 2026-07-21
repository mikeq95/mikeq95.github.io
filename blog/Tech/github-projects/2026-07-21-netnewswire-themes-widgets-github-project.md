---
slug: 2026/07/21/netnewswire-themes-widgets-github-project
title: NetNewsWire 进阶玩法，主题、iOS 小组件和隐藏偏好设置
date: 2026-07-21
tags:
  - github
  - macos
description: "接着上一篇 NetNewsWire 的来历和基础安装，这篇专门看它给深度用户留的自定义空间——.nnwtheme 主题包、iOS 小组件的数据来源，以及四个要靠 defaults write 才能开的隐藏偏好设置。"
---

之前写过一篇 [NetNewsWire](https://github.com/Ranchero-Software/NetNewsWire) 的来历和基础安装，这次翻它仓库里的 [Technotes](https://github.com/Ranchero-Software/NetNewsWire/tree/main/Technotes) 文档，发现给深度用户留了不少自定义空间——主题、iOS 小组件、隐藏偏好设置，用下来觉得值得单独写一篇。

{/* truncate */}

---

## 主题：.nnwtheme 包

NetNewsWire 的文章阅读页外观是可以换主题的，主题文件打包成 `.nnwtheme` 格式，里面有三个文件：`Info.plist`（主题元数据，必须包含 `ThemeIdentifier`、`Name`、`CreatorName`、`CreatorHomePage`、`Version` 这些字段）、`template.html`（页面结构模板）和 `stylesheet.css`（样式表）。因为用的是标准的 HTML/CSS，会写网页的人几乎没有学习成本，直接照着模板改样式就行。

安装方式也做得很简便，不用手动拖文件，而是走一个 URL Scheme：

```
netnewswire://theme/add?url={主题zip包的URL}
```

主题作者把这个链接分享出来，用户点一下就在 App 内直接触发安装。

---

## iOS 小组件

小组件只在 iOS 上提供，一共 7 个，分三种尺寸：

- 小尺寸 1 个：显示每个"智能收件箱"（Smart Feed，比如未读、今天、加星标）的当前数量
- 中尺寸 3 个：每个智能收件箱对应一个，支持点击直达对应视图
- 大尺寸 3 个：中尺寸的放大版

小组件里能看到 feed 标题、文章标题、摘要、feed 图标、发布时间，以及未读/今天/加星标各自的数量。有个实现细节挺有意思：小组件不是直接读主 App 的数据库，而是通过 App Group 容器里一份单独编码成 JSON 的数据来读取，算是 iOS Widget 沙盒机制下的标准做法。

---

## 四个隐藏偏好设置

`AppDefaults.swift` 里藏了四个默认关闭的偏好项，命名都是提出需求的人的姓氏，用 `defaults write` 命令开启：

```bash
defaults write com.ranchero.NetNewsWire-Evergreen KafasisTitleMode -bool true
defaults write com.ranchero.NetNewsWire-Evergreen CorreiaSeparators -bool true
defaults write com.ranchero.NetNewsWire-Evergreen GruberFeedDoubleClickMarkAsRead -bool true
defaults write com.ranchero.NetNewsWire-Evergreen DevroeSuppressSyncOnLaunch -bool true
```

分别是：

- `KafasisTitleMode`：开启窗口标题栏（默认关闭；官方注释提到 macOS Catalina 下没标题的窗口，工具栏按钮不会显示文字说明）
- `CorreiaSeparators`：文章列表里每条之间加一条分隔线
- `GruberFeedDoubleClickMarkAsRead`：侧边栏双击 feed 直接标记为已读
- `DevroeSuppressSyncOnLaunch`：启动时不自动同步

---

## 总结

NetNewsWire 表面上是个朴素的 RSS 阅读器，但主题系统开放给社区自己做皮肤、小组件通过独立 JSON 通道同步数据、还留了四个只有翻源码或者 Technotes 才能发现的隐藏开关——对愿意折腾的用户来说，这些细节比"能订阅 RSS"本身更值得挖一挖。
