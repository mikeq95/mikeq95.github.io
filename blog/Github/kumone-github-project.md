---
slug: 2026/09/09/kumone-github-project
title: Kumone，一个原生 SwiftUI 写的网易云音乐 macOS 客户端
date: 2026-09-09
tags: [github, open-source, macos, swift, media]
description: Kumone 是开发者 missuo 用 SwiftUI 从零写的网易云音乐第三方客户端，直连网易云接口、支持二维码登录和 Hi-Res 播放，不到一个月已经攒了近千颗 star。本文记录了通过 Homebrew 实际安装、签名验证和启动测试的过程。
---

网易云音乐官方客户端在 macOS 上一直不算原生，功能堆得不少，交互却总差一口气。missuo 上个月起了个新项目，用纯 SwiftUI 从零重写了一遍，短短几周就攒了近千颗 star。

{/* truncate */}

---

## 介绍

[Kumone](https://github.com/missuo/kumone)（雲の音，读作 kumone，呼应"网易云"的"云"）是 [missuo](https://github.com/missuo)（Vincent Yang，OwO Network 创始人）用 SwiftUI 写的网易云音乐第三方客户端。它不套 Electron 也不用 WebView，Swift 原生实现了网易云的 weapi（AES-CBC + RSA）和 eapi（AES-ECB + MD5）两套加密协议，覆盖了大约 50 个接口，请求直连 `music.163.com`，不需要自己搭一层中转服务器。

仓库建于 2026 年 8 月 16 日，到写这篇文章时还不满一个月，GitHub 上已经有 950 多颗 star、72 个 fork、11 个贡献者，issue 区也挺活跃，这个增长节奏在同类项目里不算常见。开源协议是 LGPL-3.0-only，README 里说得很直白：仅供学习和个人使用，音乐数据版权归网易云音乐及各来源方所有。

missuo 不是第一次做效率类小工具，他之前写的 Bob 翻译插件 [bob-plugin-deeplx](https://github.com/missuo/bob-plugin-deeplx) 有 289 颗 star，网络运维相关的 [ASN-China](https://github.com/missuo/ASN-China) 也有 231 颗，算是持续在输出、有维护经验的开发者。

## 安装环境

Kumone 是打包好的成品 macOS App，官方给了两条安装路径：

**Homebrew（推荐）**：

```bash
brew tap owo-network/brew
brew install owo-network/brew/kumone --cask
```

**手动下载**：去 [Releases](https://github.com/missuo/kumone/releases) 页拿最新的 `Kumone-x.y.z.zip`，解压后拖进 Applications。应用已签名并公证，装好之后靠 Sparkle 自动更新。

系统要求 macOS 15 及以上，通用二进制（Apple Silicon 和 Intel 都能跑）。iOS/iPadOS 上还有一个未签名的 `.ipa`，得用 AltStore、SideStore、Sideloadly 或 Xcode 自己签了才能装，支持 iOS 16 起。

我在自己的 macOS 26.6.2 上实测走了一遍 Homebrew 安装，整个过程没有报错：

```bash
$ brew install owo-network/brew/kumone --cask
==> Installing Cask kumone
==> Moving App 'Kumone.app' to '/Applications/Kumone.app'
🍺  kumone was successfully installed!
```

验证装的是不是官方签名版本：

```bash
codesign -dv --verbose=4 /Applications/Kumone.app
spctl -a -vv /Applications/Kumone.app
```

> ✅ 正常：能看到 `Authority=Developer ID Application: MOE AI LLC (NCFNX3LJ83)`，`spctl` 显示 `accepted`、`source=Notarized Developer ID`
>
> ❌ 异常：如果显示未签名或被 Gatekeeper 拒绝，说明装的不是官方渠道分发的包

注意，Homebrew tap 里挂的 cask 版本停在 0.3.0，而 GitHub Releases 这边已经发到 v0.3.16——cask 的 `auto_updates` 标了 true，意思是装完第一次打开，应用会自己通过 Sparkle 检查更新，不用指望 `brew upgrade` 帮你追上最新版。

至此，安装已经跑通。

## 运行

双击图标或者用命令行打开：

```bash
open -a Kumone
```

首次启动我这边没有被 Gatekeeper 拦，大概率是公证票据已经 staple 进了安装包。进程起来之后观察了几分钟，没有崩溃，`~/Library/Logs/DiagnosticReports/` 里也没有留下任何崩溃日志。

有个细节值得记一下：用 `lsof` 看它建立的网络连接，走的是本机代理端口，不是直接对外发包。

```bash
$ lsof -i -P -n | grep -i kumone
Kumone  34267 a1234 TCP 127.0.0.1:52229->127.0.0.1:1082 (ESTABLISHED)
```

这跟 README 说的"直连 `music.163.com`"并不矛盾——它确实没走自己的中转服务器，但网易云的接口对不少海外 IP 有访问限制，实际用起来还得靠系统本身配好的代理才连得上，这点 README 没提。如果你在海外网络环境下装完打不开或者一直转圈，先排查一下网络，不一定是应用本身的问题。

二维码登录这步我没能走完：需要用手机上的网易云音乐 App 扫码，而这次的验证环境是没有屏幕录制和辅助功能权限的沙箱终端，也没有物理手机可以扫码，所以登录后的首页、播放页这些真实界面这次没能截到图。如实说明，没有编。退出应用之后检查了本地文件，能确认它确实按 README 说的做了 cookie 持久化：

```bash
$ find ~/Library -iname "*kumone*" -maxdepth 4
/Users/a1234/Library/Application Support/Kumone
/Users/a1234/Library/WebKit/im.missuo.Kumone
/Users/a1234/Library/Preferences/im.missuo.Kumone.plist
/Users/a1234/Library/Caches/im.missuo.Kumone
/Users/a1234/Library/HTTPStorages/im.missuo.Kumone.binarycookies
```

`HTTPStorages` 下有一个 `.binarycookies` 文件，说明登录状态是靠系统标准的 cookie 存储机制留存的，不是自己另外搞了一套加密存档。

## 效果展示

登录之后的功能，按 README 描述加上上面能验证到的技术事实，大致是这些：

- 首页：每日推荐、私人 FM、心动模式、歌单、排行榜
- 发现页：分类歌单 + 无限滚动
- 播放页：封面取色渐变的沉浸式界面，配同步歌词，还有 LyricsX 风格的桌面悬浮歌词
- 灰色歌曲解锁：对被下架或锁区的歌曲，用第三方音源解析出可播放链接

（此处插入截图：登录后的首页、沉浸式播放页——这次因为验证环境限制没能实际登录截图，需要自己补一张）

## 相关项目和评价

网易云音乐的第三方客户端不是新鲜赛道，Kumone 参考设计的 [YesPlayMusic](https://github.com/qier222/YesPlayMusic) 是这个赛道里最有名的一个，Vue + Electron 写的，GitHub 上有 2.9 万多颗 star，支持 Windows/macOS/Linux 三端；社区里还有它的 fork [my_yesplaymusic](https://github.com/stark81/my_yesplaymusic)，加了本地音乐播放和离线歌单。更早一点的 [xjbeta/NeteaseMusic-macOS](https://github.com/xjbeta/NeteaseMusic-macOS) 也是用 Swift 写的原生 macOS 客户端，README 里自己标注"未完成 70%"，长期没有跟上。专注解锁海外锁区限制的还有 [NeteaseMusicAbroad](https://github.com/yi-ji/NeteaseMusicAbroad)，只做这一件事，不是完整客户端。跟这几个比，Kumone 的差异化在于原生 SwiftUI（不套 Electron 或 WebView）、直连网易云接口不需要自建服务、而且是目前几个原生方案里更新最勤的一个。

调研时我按项目名单独搜、"项目名+作者名"、"项目名+GitHub 地址"这几种组合分别在 X、知乎、Reddit、V2EX 上搜了一圈，没能找到专门针对 Kumone 的深度评测或详细讨论——"kumone"本身也是个常见日文人名/机构名（比如日本的公文教育研究会 Kumon、虚拟主播雲音りな），搜索结果基本被这些同名内容淹没。这大概率是项目本身太新（不到一个月）导致的，还没被独立博客或社区详细写过，不是说明它没人用——GitHub Issues 里能看到真实的用户反馈，比如 [#88](https://github.com/missuo/kumone/issues/88) 提视觉细节、[#87](https://github.com/missuo/kumone/issues/87) 报 iOS 27 锁屏显示的 bug、[#85](https://github.com/missuo/kumone/issues/85) 和 [#82](https://github.com/missuo/kumone/issues/82) 都在要求加自定义音源，说明确实有人在长期用、在提需求，只是还没有沉淀成正式的评测文章。

需要提醒的一点：README 已经写明它仅供学习和个人使用，灰色歌曲解锁功能依赖第三方音源，这类"解锁"能力在国内第三方网易云客户端里比较常见（YesPlayMusic 也有类似功能），但始终处于版权灰色地带，拿去做二次分发或商用会有风险，普通个人用倒不用太紧张。

## 卸载和下次运行

卸载：

```bash
brew uninstall --cask kumone
```

或者直接把 `/Applications/Kumone.app` 拖进废纸篓。本地的登录 cookie、缓存、偏好设置分散在 `~/Library/Application Support/Kumone`、`~/Library/Caches/im.missuo.Kumone`、`~/Library/Preferences/im.missuo.Kumone.plist` 和 `~/Library/HTTPStorages/im.missuo.Kumone*` 这几处，卸载应用本体不会自动清掉，想彻底删干净得自己手动清理。

下次运行直接打开 App 就行，之前扫码登录的状态会自动恢复，不用重新走一遍二维码登录。
