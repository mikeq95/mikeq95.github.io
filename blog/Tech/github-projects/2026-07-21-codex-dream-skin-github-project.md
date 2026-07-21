---
slug: 2026/07/21/codex-dream-skin-github-project
title: Codex Dream Skin，给 Codex 桌面客户端换背景皮肤的小工具
date: 2026-07-21
tags:
  - github
  - AI
description: "Codex Dream Skin 通过本地 CDP 注入给 OpenAI Codex 桌面客户端加自定义背景皮肤，不改官方二进制和签名，原生控件照常可交互。这篇记录一下它的原理、安装方式和使用体验。"
---

每天对着一样的编辑器界面难免审美疲劳，翻到 [Codex Dream Skin](https://github.com/Fei-Away/Codex-Dream-Skin) 这个项目——⭐ 1.1 万，创建才半个月就攒了一千多 Fork，专门给 OpenAI Codex 桌面客户端换皮肤，用下来觉得值得写一篇。

{/* truncate */}

---

## 它是什么

Codex Dream Skin 是一个给 Codex 桌面客户端加"皮肤"（skin）的工具，"皮肤"具体指的是给整个窗口铺一层自定义背景图，但侧边栏、建议卡片、项目选择器、输入框这些原生控件都保持真实可交互，不是简单地截图替换成静态图片。

实现原理是本地 CDP（Chrome DevTools Protocol）注入，只在 `127.0.0.1` 本地回环地址上操作，不修改 Codex 的官方二进制文件，也不破坏代码签名——换句话说，换皮肤这件事和 Codex 本体是完全分离的两层。

---

## 安装

macOS：进入仓库的 `macos/` 目录，双击 `Install Codex Dream Skin.command` 即可。

Windows：依次执行两个 PowerShell 脚本：

```powershell
install-dream-skin.ps1
start-dream-skin.ps1
```

前提是本机已经装好 Codex 桌面客户端。

---

## 实际使用感受

### 自带主题

仓库自带两套现成主题：默认的 "Gothic Void Crusade"（赛博朋克哥特风，社区设计，macOS 默认启用）,以及 "Arina Hashimoto"（浅色/深色模式都验证过，README 里附了真实界面截图）。

### 自定义背景

如果不想用预设主题，可以自己换一张纯背景图，官方建议尺寸 2560×1440 的 JPEG，按比例缩放的图也能用。

### 主题切换和一键还原

macOS 菜单栏、Windows 系统托盘里都能保存和切换主题；不想要的时候，一键就能恢复到官方原始外观，不会留下痕迹。

---

## 总结

如果每天长时间用 Codex 写代码、想让界面看着更舒服一点，Codex Dream Skin 是个轻量、可逆、不碰官方二进制的换肤方案；缺点是目前主题数量还不多，社区共创的性质比较重，能不能长期维护得看后续贡献者是否持续。项目本身和 OpenAI 官方无关，用的时候心里有数就好。
