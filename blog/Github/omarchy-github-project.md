---
slug: 2026/08/28/omarchy-github-project
title: Omarchy：DHH 做的 Arch Linux + Hyprland 发行版
date: 2026-08-28
tags: [github, open-source, macos, AI]
description: Omarchy 是 DHH 主导的 Arch Linux + Hyprland 发行版，官方只原生支持 Intel Mac，苹果芯片机型得靠社区移植或虚拟机；这篇文章基于官方手册和源码整理，没有实机装过。
---

Omarchy 是 DHH 做的一整套 Arch Linux 发行版，桌面用 Hyprland 平铺窗口管理器，配了他们自己写的 Quickshell 桌面壳。它不是一份装到别的系统上的配置脚本，而是直接给一个完整的安装 ISO。分区、全盘加密、桌面美化这些事在安装阶段就一次做完，重启进去就是一套调好的系统，不用自己从零折腾 Arch。

## 介绍

> 写在前面：Omarchy 官方原生支持的 Mac 只有 Intel 芯片机型。苹果芯片（M 系列）目前没有官方支持，只能装社区维护的 Asahi Linux 移植版，或者塞进 Parallels、VirtualBox 这类虚拟机，后一种官方手册原话是"相当繁琐"，性能也不理想。这是一个要接管整块硬盘的完整 Linux 发行版，这篇文章基于官方手册和源码整理，没有实机装过。

DHH 是 Ruby on Rails 的作者，37signals 的联合创始人，这两年公开吐槽过苹果 App Store 的抽成机制和库克治下苹果产品缺乏创新，转而把日常主力设备换成了 Linux。[Omarchy](https://github.com/basecamp/omarchy) 就是这次转换的产物，在 GitHub 上已经攒了 3.2 万多个 star，仓库标注的主语言是 Shell，绝大部分代码是负责串起安装、包管理和桌面配置的脚本，不是一个传统意义上的应用程序。

项目挂在 basecamp 组织名下，由 DHH 所在的 37signals 孵化。它的目标不是做一个大而全的发行版，而是把 DHH 自己日常在用的那套工具链提前装好、调好。编辑器是 Neovim，浏览器是 Chromium，笔记用 Obsidian，办公软件是 LibreOffice，甚至还塞了一个复古风格的 Winamp 式播放器。官方手册里有一句话形容得挺直接，这套系统"零臃肿，只放我自己真正在用的东西"。

Omarchy 更早之前还有一个姊妹项目叫 [Omakub](https://omakub.org/)，是在 Ubuntu + GNOME 上叠一层平铺配置，面向还不想彻底换发行版的人。Omarchy 走得更远，直接换成 Arch + Hyprland，滚动更新、纯键盘操作，面向愿意折腾、想要更彻底体验的人。这两个项目和其他同类方案的具体差异，放在文末"相关项目和评价"里细说。

## 安装环境

Omarchy 的 ISO 从 [omarchy.org](https://omarchy.org/) 下载，几个 GB 大小。Mac 或 Windows 上用 [balenaEtcher](https://etcher.balena.io/)、Linux 上用 [caligula](https://github.com/ifd3f/caligula) 刻录到 U 盘，装之前必须先在 BIOS/UEFI 里关掉 Secure Boot 和 TPM，这两项是微软给 Windows 设计的安全机制，Omarchy 用不上，开着反而装不了。

安装分两种：全盘安装会清空所选整块磁盘；free-space install 只占用磁盘上的空闲空间，可以跟 Windows 之类的系统共存双启动。不管哪种，装之前都得先备份，官方手册也在这里特意提醒了一句。另外，全盘加密的解锁界面不支持蓝牙键盘，得准备一个有线键盘或者带 2.4GHz 接收器的无线键盘，不然开机连密码都输不进去。

> 全盘安装那句"会清空所选磁盘"看着轻描淡写，但真操作起来还是先备份一遍更踏实，这种事没有后悔药。

### Intel Mac

官方给 Intel 芯片的 Mac 做了原生支持。安装程序会自动识别 Mac 硬件，装好 Broadcom Wi-Fi 驱动、需要的机型上的 SPI 键盘驱动，以及针对同批机型的 NVMe 睡眠修复。官方在一台 2019 款 MacBook Pro 上做过对比测试，光是装上 Omarchy 就带来了 36% 的性能提升。

装之前要在恢复模式（开机按住 Command-R）里关闭 Secure Boot，安装过程和一般 PC 基本一致。**但要注意，Mac 上目前只支持把 Omarchy 装成唯一系统**，装完 macOS 会直接进不去，官方手册说可以之后用 Internet Recovery 恢复回来，但那是另一套流程了，不是简单的双启动。带 T1 芯片的初代 Touch Bar MacBook Pro（2016 款几个型号）装上去 Touch Bar 和声音都用不了；带 T2 芯片的机型（2017–2020 款不少型号）反而问题不大，安装程序会自动配好适配过的 `linux-t2` 内核、音频、Wi-Fi/蓝牙固件和风扇控制，具体型号列表在官方手册的 [Mac support](https://github.com/basecamp/omarchy/blob/quattro/manual/44-mac-support.md) 里。

### 苹果芯片 Mac

M 系列芯片没有官方支持，这一点手册里说得很明确。社区这边能走的路是 [Asahi Alarm](https://asahi-alarm.org/)——一个基于 Asahi Linux 项目、专门给 M1/M2 芯片做的 Arch 移植，在这个基础上再装 Omarchy，社区维护的 [omarchy-mac](https://github.com/omarchy-mac/omarchy-mac) 项目提供了具体教程，官方原话是"需要花点功夫"。

另一条路是虚拟机。官方手册专门有一页 [Omarchy on...](https://github.com/basecamp/omarchy/blob/quattro/manual/49-omarchy-on.md) 列了几种非标准跑法，其中 Parallels VM 的说法是"相当繁琐的过程"，VirtualBox 的说法是"性能大概率不会好"。这两条都是社区自发写的指南，不是官方保证会一直维护的路径。

## 运行

从 U 盘启动之后，安装程序会依次问键盘布局、用户名密码这类配置问题，确认好安装的磁盘就开始装，官方给的数字是最快的机器一分钟以内能装完，老一点的机器一般也不超过五分钟。装完重启，直接进的就是配置好的桌面，不需要再手动装桌面环境或者调窗口管理器。

日常控制 Omarchy 主要靠 `Super + Space` 打开的菜单，启动应用、调系统设置都在这里。装卸软件、截图录屏这些也没走单独的入口，同样塞在这个菜单里。命令行这边对应有一个 `omarchy` CLI，图形菜单能做的事基本都能用它重做一遍：

```bash
# 更新 Omarchy 本身和所有系统包，会自动先打一个快照
omarchy update

# 切换主题，22 套内置主题之一
omarchy theme set tokyo-night

# 列出所有可用子命令，方便探索
omarchy commands --all

# 让 sudo 在指定分钟内免密，常用于 AI agent 连续跑一长串操作
omarchy-sudo-passwordless 30
```

`omarchy debug` 会打印一份调试信息，去官方 Discord 求助时可以直接贴出来；`omarchy reinstall` 用来修复损坏的配置，会把默认包和配置文件重装一遍；`omarchy-channel-set` 用来在 stable、RC、edge、dev 四条更新通道之间切换，新装的系统默认在 stable，会比 Arch 官方镜像慢一个月上线，专门用来提前接住可能出问题的新版本。

## 效果展示

这一节没有实机装过跑过，下面写的是官方手册和截图里描述的效果，加上两篇第三方长期使用记录里的说法，不是第一手体验。

按官方手册的说法，Omarchy 内置 22 套主题，切换一次会同时改掉桌面壁纸、终端、Neovim、系统监控面板 btop、Chromium 和整个顶栏、锁屏的配色，`Super + Ctrl + Shift + Space` 直接呼出主题选择器。顶栏本身承担了原来菜单栏、系统托盘和通知中心的活，而且这几年加了个 AI agent 用量面板，能实时看 Claude Code、Codex 这些命令行 agent 的会话进度和额度消耗，第一次检测到本机有 AI coding agent 在跑就会自动长出这个图标。剪贴板走 `Super + Ctrl + V` 统一管理，图片和文字都能存进历史。

官方手册专门有一份从 Mac/Windows 过渡过来的对照表：Spotlight 或 Raycast 的肌肉记忆对应 `Super + Space`，AirDrop 换成走 `Super + Ctrl + S` 的 LocalSend，Time Machine 换成每次更新前自动打的系统快照，连 Cmd 键的位置都不用变，Linux 会把它当成 Super 键使用。

第三方的长期使用记录能提供更真实的一手参照。[Arch Linux (Omarchy) — 8 Months Later](https://www.ssp.sh/blog/linux-omarchy-the-good-bad-and-fixable/) 是一位从 Mac/Windows 转过来用了 8 个月的开发者写的详细复盘，列出了哪些 macOS 常用工具（比如 Raycast、日历、屏幕共享）在 Linux 上已经找到了替代品、哪些还没彻底解决。另一篇 [Giving Omarchy a Shot](https://chambers.io/blog/2025/08/28/omarchy.html) 是一位常年用 Mac 的开发者专门买了块新硬盘装 Omarchy 试用的记录，讲了自己为什么受够了 macOS 和 Windows 11、决定认真试一次 Arch。

## 相关项目和评价

拿 Omarchy 跟同类方案摆在一起看会更清楚它的定位。前面提到的 [Omakub](https://omakub.org/) 是 DHH 更早做的项目，在 Ubuntu + GNOME 上叠一层平铺配置和常用开发软件，面向想从 Mac/Windows 平滑过渡的人；Omarchy 直接换成 Arch + Hyprland，面向愿意折腾、想要滚动更新和纯键盘操作的资深用户。[CachyOS](https://cachyos.org/) 同样基于 Arch，也有 Hyprland 版本可选，卖点是自家优化过的内核和调度器，走的是"极致性能优先，桌面环境自选"的路线，跟 Omarchy 强调的开箱即用美化和 AI agent 工作流预设不是一个重点。[HyDE](https://github.com/HyDE-Project/HyDE) 则不是完整发行版，而是能叠加在任意 Arch 系统上的 Hyprland 美化配置脚本，主打 70 多套可一键切换的主题；Omarchy 把这类桌面美化和系统安装、更新、快照回滚打包成了一体化发行版，装的时候就已经决定了整套系统。

社区讨论里能看到不少真实的安装记录。知乎上[一位答主实测记录了安装、配置中文 locale 和输入法的完整过程](https://www.zhihu.com/question/1958561061436363590)，也提到了 DHH 转投 Linux 背后是不满苹果 App Store 30% 抽成、觉得库克治下的苹果缺乏创新。另一位答主[把系统装到 4K 屏 ThinkPad X1 Carbon 上试用](https://www.zhihu.com/question/1948774591897003042)，讲了中文 locale 默认没装、fcitx5 拼音主题不好看这些坑，同时也提到日常使用中系统资源占用很低。

X 上也有两条值得一看的帖子。[Hengqian Ling 刷到 Omarchy 后去翻了官网手册目录](https://x.com/linghengqian/status/2091395296274338239)，发现这个发行版根本没有 WSL 版本可用。更有意思的是 [quantumfire_io 的那条帖子](https://x.com/quantumfire_io/status/2092287329889100028)，他在 M1 Max 上测试社区维护的 Mac 移植版，体验反而比之前用的 Intel MacBook Pro 还流畅，测完之后直接把这台 M1 重新分区，把 Omarchy 换成了主力系统。这条帖子算是给前面那句"苹果芯片没有官方支持"加了个真实的反例，社区路线走通了确实能用，只是要自己承担折腾成本。

## 卸载和下次运行

Omarchy 不是装在系统里的一个 App，而是接管了整块硬盘的操作系统本身，所以严格意义上的"卸载"跟平时删软件不是一回事。Mac 用户想恢复回 macOS，官方手册给出的路径是用 Internet Recovery 重新联网装回系统；PC 用户想彻底换回原来的系统，就得用别的安装介质重新覆盖磁盘。如果只是想清空当前的个人设置、账号和 `/home`，但保留 Omarchy 本身重新走一遍开机向导，Omarchy 菜单里的 _Setup > Reset Computer_ 提供了这个选项，输入 `reset` 确认后会清掉所有用户账户和数据，回到首次开机的设置界面，前提是这台机器本来就是从 Omarchy ISO 装出来的。

下次运行不涉及"重新启动它"这件事，装好之后 Omarchy 就是这台机器的日常系统，开机即用。如果只是想回退到某次更新之前的状态，不用重装，`omarchy update` 每次执行前都会自动打一个系统快照，在 Limine 引导菜单里选回之前的快照重启就行，只回滚根文件系统，`/home` 里的个人文件不受影响。

## 总结

Omarchy 面向的是愿意放弃拖拽窗口和鼠标操作、认真尝试纯键盘 Linux 桌面的人，从安装阶段的全盘加密到默认防火墙拒绝所有入站，安全上的默认值都定得比较严格，更新自带快照回滚也降低了折腾中出问题的成本。但对苹果芯片 Mac 的用户来说，这不是一个"周末装个虚拟机随手试试"的项目，官方现在没有原生支持，社区的 Asahi 移植和虚拟机路线都需要额外投入，quantumfire_io 那条换成主力系统的帖子说明社区路线能走通，但门槛显然比 Intel Mac 或者普通 PC 高不少。这篇文章整理的内容全部来自官方手册、源码和公开的第三方使用记录，没有在真机上装过，真要试之前，建议先把手册里 Mac support 和 Omarchy on 那两页仔细看一遍。
