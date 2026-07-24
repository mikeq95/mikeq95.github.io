---
slug: 2026/07/23/rime-squirrel-wanxiang-setup
title: "🐿️ macOS 装 Rime 输入法(鼠须管)+ 万象拼音，顺便调个好看的候选框"
date: 2026-07-23
tags:
  - github
description: "记录一下在 macOS 上装 Rime 输入法（鼠须管 Squirrel），配上万象拼音方案，再调一下候选框配色、排版和开发工具自动切英文。"
---

系统自带的拼音输入法一直觉得联想不够聪明、配色也没得选。鼠须管（Squirrel）是 macOS 上的 Rime 输入法前端，配合万象拼音这套词库方案，联想效果好不少，外观也能自己调。记录一下整个安装配置过程。

{/* truncate */}

---

## 安装鼠须管

去 [Squirrel 的 GitHub Releases 页面](https://github.com/rime/squirrel/releases/latest) 下载最新的 `.pkg` 安装包（要求 macOS 13.0 及以上），双击安装。习惯用 Homebrew 的话也可以直接：

```bash
brew install --cask squirrel-app
```

装完如果系统提示"无法验证开发者"，去 **系统设置 → 隐私与安全性**，找到被拦下的提示，点 **仍要打开** 就行。

安装完成后需要手动加到输入法列表：**系统设置 → 键盘 → 输入法**，点左下角 **+**，在中文分类下找到 **鼠须管** 添加进去。

第一次安装有个小细节：初次安装如果在部分应用里打不出字，注销重新登录一次（或者直接重启）就好，这是官方文档里特别提到的已知情况。

至此，鼠须管已经装好并加入了系统输入法列表，用切换输入法的快捷键就能切到它。

---

## 装万象拼音方案

鼠须管默认自带的方案比较基础，[万象拼音](https://github.com/amzxyz/rime-wanxiang) 是词库和联想都更完善的一套方案包，装上之后体验提升明显。

需要两个文件：

- 方案包：去 [rime-wanxiang 的 Releases 页面](https://github.com/amzxyz/rime-wanxiang/releases/latest) 下载 `rime-wanxiang-base.zip`（Base 版就够用，Pro/辅助码版本是给用五笔、双拼这类编码方式的用户准备的）
- 语法模型：去 [RIME-LMDG 的 Releases 页面](https://github.com/amzxyz/RIME-LMDG/releases) 下载 `wanxiang-lts-zh-hans.gram`（简体版，大约 400MB，下载需要点时间）

打开 **访达 → 前往 → 前往文件夹**（`Shift + Cmd + G`），输入 `~/Library/Rime` 进入鼠须管的用户配置目录。把 `rime-wanxiang-base.zip` 解压后，**进入解压出来的文件夹内部**，把里面所有内容全选，拖进 `~/Library/Rime` 直接覆盖（注意不要把整个文件夹拖进去，会变成嵌套目录）。再把 `wanxiang-lts-zh-hans.gram` 也直接拖进这个目录。

点菜单栏鼠须管图标，选 **重新部署**，稍等一会儿（词库比较大，编译要花点时间）。也可以用命令行直接触发，效果一样：

```bash
"/Library/Input Methods/Squirrel.app/Contents/MacOS/Squirrel" --reload
```

至此，万象拼音已经是默认方案，随便找个输入框打几个字，能感觉到候选词联想比之前聪明不少。

---

## 自定义候选框外观和行为

外观和一些细节行为通过两个自定义配置文件来调，都放在 `~/Library/Rime` 目录下，改完同样需要重新部署才会生效。

`default.custom.yaml` 用来调候选词个数：

```yaml
patch:
  menu/page_size: 6
```

`squirrel.custom.yaml` 用来调配色、排版，以及针对具体软件的行为：

```yaml
patch:
  style/color_scheme: solarized_light
  style/color_scheme_dark: solarized_dark
  style/horizontal: true
  style/inline_preedit: false
  style/display_tray_icon: false
  preset_color_schemes:
    solarized_light:
      font_face: PingFangSC
      font_point: 0x10
      corner_radius: 0x5
      hilited_corner_radius: 0x5
      candidate_list_layout: linear
      text_color: 0xFF424242
      hilited_candidate_back_color: 0xC2B5B05A
      hilited_back_color: 0xFF79AF22
      back_color: 0xFFFFFFFF
      name: 微信浅色／Wechat Light
    solarized_dark:
      font_face: PingFangSC
      font_point: 0x10
      corner_radius: 0x5
      hilited_corner_radius: 0x5
      candidate_list_layout: linear
      text_color: 0xFFBBBBBB
      hilited_candidate_back_color: 0xFF7982DD
      hilited_back_color: 0xFF79AF22
      back_color: 0xFF151515
      name: 微信深色／Wechat Dark
  app_options:
    com.apple.Terminal:
      ascii_mode: true
      no_inline: true
    com.googlecode.iterm2:
      ascii_mode: true
      no_inline: true
    com.microsoft.VSCode:
      ascii_mode: true
    com.apple.dt.Xcode:
      ascii_mode: true
    org.vim.MacVim:
      ascii_mode: true
      no_inline: true
      vim_mode: true
```

> 完整颜色数值参考的是知乎上一份"微信风格"配色方案（浅色/深色分别对应系统的明暗模式），比自己从零调颜色省事很多。

`candidate_list_layout: linear` 是横向单行排列候选词，改成 `stacked` 就是竖直堆叠——两种都是官方支持的排列方式，看个人习惯选。`app_options` 这部分是给终端、VS Code、Xcode、Vim 这些开发工具单独设置默认英文模式（`ascii_mode: true`），不会写代码写到一半蹦出中文候选框。

注意，鼠须管本身也自带一批官方预设配色（`native`、`aqua`、`azure`、`luna`、`ink` 等），不想自己写颜色数值的话，`color_scheme` 直接填这些名字就能用，不需要在 `preset_color_schemes` 里定义。

至此，候选框的配色、排版、以及开发工具下的输入行为都配置完成了。
