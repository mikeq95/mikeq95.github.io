---
slug: 2026/08/28/dsh-desktop-github-project
title: DSH Desktop：给 DeepSeek Harness 装一个原生桌面壳
date: 2026-08-28
tags: [github, AI, llm, open-source, macos]
description: DSH Desktop 是社区做的 DeepSeek Harness 原生桌面客户端，把官方 Web UI、Host 服务和插件系统打包进一个下载即用的桌面应用，不隶属深度求索官方。
---

{/* truncate */}

---

## 介绍

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 是深度求索在 2026 年 8 月中旬开源的一个智能体框架，主打"万物皆插件"的思路，但它自己只给命令行和一个本地 Web 界面，没有官方桌面客户端。[DSH Desktop](https://github.com/anywhere-labs/dsh-desktop) 就是补这块空白的第三方桌面壳。

项目用 TypeScript 写成，仓库在 GitHub 上已经攒了两万多颗 star。它在 README 和文档里反复强调自己是独立社区项目，跟深度求索没有隶属、合作或背书关系。仓库贡献者列表里能看到一些"上游贡献者"，那只是 fork 继承下来的提交历史，不代表这些人真的参与了这个仓库的开发。

仓库最早叫 deepseek-harness-desktop，后来改成了现在的 dsh-desktop。GitHub 会自动把旧链接跳转过来，但网上不少地方（包括项目自己的 npm 包名）还在混用两个名字，说的是同一个项目。

它的核心设计原则是"桌面本身也是一个插件"。项目没有改动上游 DeepSeek Harness 的源码，窗口、托盘、终端这些桌面能力全部通过 Harness 自带的 [Cordis](https://github.com/cordiverse/cordis) 插件机制拼进同一个运行时，跟其他第三方插件遵守同一套组合规则。Cordis 这套插件框架并不新鲜，最早是从 [Koishi](https://github.com/koishijs/koishi) 机器人框架里拆出来的通用插件系统。

代码以 MIT 协议开源，仓库昨天还有代码推送，更新算勤快。

---

## 安装环境

官方下载入口在 dshdesktop.cn，点进去实际会重定向到别的托管源。我实测下载 macOS 版本时，链接最终跳到了 ModelScope 上的一个文件，名字是 `DSH Desktop-2.0.3-universal.dmg`，说明版本号和站上标的一致。

macOS 用户：

[下载 DMG](https://www.dshdesktop.cn/api/downloads/mac)，打开后把 DSH Desktop 拖进 Applications 就行。

Windows 用户：

[下载安装程序](https://www.dshdesktop.cn/api/downloads/windows)，是个 NSIS 安装包，按提示装完即可。

两边的安装包都自带 Electron、Node.js、pnpm 和固定版本的 DSH 依赖，普通用户不用提前装 Node 环境，也不用开终端敲命令。代价是安装包本身不小，macOS 版本我下载下来有 270 多 MB。

验证装的是不是官方签名的正版：

```bash
codesign -dv --verbose=4 "/Applications/DSH Desktop.app"
```

> ✅ 正常：能看到 `Authority=Developer ID Application: mengxin yang (UM3Z9G5DNH)`，说明经过 Apple 开发者签名
>
> ❌ 异常：报 `code object is not signed at all`，说明装的是没签名的野生包，回官方页面重新下载

---

## 运行

macOS 首次打开大概率会被 Gatekeeper 拦一下，右键点"打开"确认一次就行。

应用启动之后会先走几个内部阶段：Electron 就绪、准备 shell 环境、拉起运行时、选择或创建 profile，然后才决定要不要弹设置向导。我在没有图形界面的环境里跑了一遍完整的 macOS Universal 安装包，能确认这几个阶段真实存在、按顺序执行。应用会把每一步的时间戳写进 `~/Library/Application Support/DSH Desktop/lifecycle-events/startup.jsonl`，还生成了一个随机的本机安装 ID，托盘终端用的 pnpm shim 也确实被单独放进了 `runtime-commands/bin` 目录，没有碰系统全局的 PATH。

正常图形界面下，首次启动会有一个设置向导，走完才会启动 Host 服务和主窗口。向导里能选窗口材质、要不要装插件市场、通知开关、要不要用系统默认浏览器打开，以及局域网访问范围。

注意，Web 服务默认只监听本机的 127.0.0.1。只有你在设置里主动打开局域网选项，它才会监听所有网卡，官方文档专门把这一条标成"危险"——局域网里任何人不用登录就能直接打开操作你的电脑。

要用云端模型（比如默认的 DeepSeek）得先在设置里配好对应的模型服务商。官方 FAQ 说得很直白，用云端模型时请求仍会发给这家服务商，Desktop 本身的 Host、Profile 和 DSH home 数据留在本机，发不发数据出去取决于你自己选的模型和工具。

装插件从托盘打开的 DSH Terminal 里跑命令即可：

```bash
dsh plugin add dsh-web-ui
dsh plugin remove dsh-web-ui
dsh plugin update
```

装卸默认只作用于当前激活的 profile，重启应用后新插件才会生效。

---

## 效果展示

### 三种呈现模式

DSH Desktop 提供三档界面。兼容模式几乎原样保留官方网页布局，只在顶部叠一条 36 像素高的独立 Desktop frame。扩展模式换成桌面自有的三栏布局。增强模式做了更深的原生化处理，macOS 上窗口的红绿灯按钮会变成隐藏式的，Windows 上则换成 Mica 或亚克力材质。三种模式底层都是同一个 Host 和同一份 Web UI，换的只是外壳，切换时应用会有序重启，不是热替换。

（此处插入截图：兼容模式、扩展模式、增强模式的界面对比）

### 插件市场

DSH Community Market 内置在应用里，提供插件的发现、详情、安装和管理。它以一份公开 Schema 对接插件数据源，理论上任何人都可以提供或接入自己的数据源。桌面壳本身也是通过这套插件机制暴露了几个接口给插件作者用，比如查看和切换 Profile 的 `desktopProfiles`、跑内置包管理器的 `desktopPnpm`，插件作者不用自己写进程管理代码就能读写这些状态。

（此处插入截图：插件市场浏览界面）

### 安全与恢复

每次健康启动，应用都会记一份滚动恢复点，包含当前 profile 的声明式包、patch 文件和共享配置。出问题要恢复时得手动挑一个具体存档，它不会自动帮你切回上一个能跑的版本；凭证、会话、缓存这些不会写进恢复点。托盘里还有个"导出诊断信息"，能把最近日志和本地崩溃转储打成 ZIP，导出前会先弹隐私提示——日志里能识别的凭据会脱敏，但本地路径、会话 ID、prompt 这些内容仍可能留在里面，公开分享前最好自己先翻一遍。

更新走的是静默检查、非静默安装：后台每 6 小时查一次新版本，发现了只会更新托盘图标并弹一条系统通知，不会自动弹下载确认。

README 里手机远程控制还标着"即将推出"，宣传图上的功能目前用不了。

---

## 相关项目和评价

DSH Desktop 不是唯一在给 DeepSeek Harness 做桌面壳的项目。[MochiNek0/dsh-desktop](https://github.com/MochiNek0/dsh-desktop) 走的是 Tauri 路线而不是 Electron，同样把 `dsh web` 的界面装进原生窗口、共享同一份 session 数据，体积和资源占用上是个直接的对照组。[desktop-cc-gui](https://github.com/zhukunpenglinyutong/desktop-cc-gui) 走得更远，同一个 Tauri 桌面壳里塞了 Claude Code、Codex、Gemini、OpenCode 好几个 Agent 引擎，是"一个客户端管所有 Coding Agent"的思路，跟 DSH Desktop 死磕单一 Harness 深度集成正好相反，star 数（4000 多）也明显更高。

CSDN 博主"高擎 AI+"写过一篇[实测安装教程](https://blog.csdn.net/2501_91807877/article/details/163854963)，五步走完首次配置，还点名推荐了 dsh-web-ui 和能让纯文本模型"看懂"截图的 modlens 两个插件。知乎上一篇[实战贴](https://zhuanlan.zhihu.com/p/2072671952355980473)讲得更细，专门点出窗口关闭不等于退出、profile 切换会触发重启这些容易搞混的地方，也提醒插件市场和手机远程当时还没作为稳定功能交付，别把宣传图当成已经能用的东西。

极客邦联合创始人池建强在 X 上[发过一条推文](https://x.com/sagacity/status/2089183016807809385)，说他一直觉得 DeepSeek 的 Harness 应该像 Codex、Qoder 那样做成下载安装、打开就能用的桌面 App，装完 DSH 预览版之后特意提了这一点。这条推文侧面说明了为什么 DSH Desktop 这类第三方桌面壳会冒出来——官方框架本身没打算做这件事。

---

## 卸载和下次运行

卸载：macOS 从 Applications 把 DSH Desktop 拖进废纸篓；Windows 走系统"添加或删除程序"。

本地留存的 profile、日志、安装 ID 存在 `~/Library/Application Support/DSH Desktop`（macOS）或对应的 Windows AppData 目录下，卸载应用本体不会自动清掉这些文件，想彻底清干净得自己手动删。

下次运行直接打开应用即可，不需要重新走一遍设置向导，配置已经保存在 profile 里了。

---

## 总结

这是个刚满两周的项目，仓库建于 2026 年 8 月 13 日，功能和文档还在快速变动，README 里"插件市场已内置""手机远程即将推出"这些描述都只是当下的快照。它目前也没有 Linux 安装包，官方 FAQ 特别提醒过，不要因为源码里有跨平台代码就以为已经发布了对应版本，我翻了一下代码确实没找到打包配置。

同名或功能类似的仓库这段时间冒出来好几个，Electron 的、Tauri 的都有，介绍或调研时容易认错项目。认准 anywhere-labs 这个组织名和 dshdesktop.cn 这个官方域名，基本不会踩坑。
