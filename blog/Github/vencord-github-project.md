---
slug: 2026/09/09/vencord-github-project
title: Vencord，给 Discord 客户端打补丁的开源 mod 框架
date: 2026-09-09
tags: [github, open-source]
description: Vencord 是一个给 Discord 桌面/网页客户端注入功能的开源 mod 框架，内置 100 多个插件，靠劫持 preload 脚本而不是替换 asar 来实现更耐更新的补丁。本文没有在真实 Discord 客户端上执行注入验证——本机装的是日常在用的真实账号，改动它有风险，转而核实了安装脚本本身的内容，并如实交代了 Discord 官方对客户端 mod 的立场和封号风险。
---

{/* truncate */}

## 介绍

Vencord 是 Vendicated 做的一个开源项目，GitHub 上已经有 1.4 万多个 star，GPL-3.0 协议，源码几乎全是 TypeScript。它不是重写了一个 Discord 客户端，而是在官方客户端启动的时候往里面打补丁，给原有界面加一层自己的插件系统。项目从 2022 年 8 月开始维护，到写这篇文章时几乎每天都有提交，README 里说坏掉的插件通常 12 小时内修好，这个活跃度在同类项目里算是比较高的。

它能跑在三种地方：Windows/macOS/Linux 上的官方 Discord 客户端、Chrome 扩展形式的浏览器版，以及 Userscript（配合 Tampermonkey 之类的脚本管理器）。三种形态背后共享同一套插件代码，装在哪儿都能用同一批插件。

技术上它是怎么做到不重写客户端就能改功能的，这个问题值得单独说一下。Discord 桌面版是 Electron 应用，Vencord 的补丁分三步走：先在 Electron 主进程里抢在 Discord 之前执行，劫持 `BrowserWindow` 的创建过程，把窗口的 preload 脚本换成自己的；这个 preload 脚本再通过 `contextBridge` 往渲染进程里塞一个 `VencordNative` 接口，让插件能访问文件系统之类的原生能力；最后插件按三个时机（初始化、Discord 的 webpack 模块加载完、DOM 加载完）依次挂上去。补丁靠字符串匹配定位 Discord 内部模块的源码，一旦某条补丁匹配失败就整体放弃，不会留下改了一半的客户端。

社区里常拿它跟老牌的 [BetterDiscord](https://betterdiscord.app) 比。BetterDiscord 更早，插件生态也更杂更大，但传统做法是直接改写 Discord 核心的 asar 包，Discord 一更新，补丁经常整个失效，得等作者重新适配。Vencord 走的是劫持 preload 这条路，不直接动 Discord 自己的代码，官方和社区的说法都是这样更扛得住版本更新。当然这个对比更多来自第三方评测和社区共识，不是 Vencord 官方逐条给出的定论。

---

## 安装环境

官网 [vencord.dev/download](https://vencord.dev/download) 是所有平台的入口，不需要自己 clone 源码编译。

**Windows** 有图形界面的 `VencordInstaller.exe`，自动找到本机的 Discord 装在哪儿，选好分支（Stable/Canary/PTB）点一下就行；GUI 打不开的话换命令行版 `VencordInstallerCli.exe`。官方特别提醒不要用管理员权限运行安装器。

**macOS** 下载 `VencordInstaller.MacOs.zip`，解压后运行图形界面版，和 Windows 一样能选要打补丁的 Discord 分支。第一次打开会被系统拦成"来自身份不明的开发者"，这是因为安装器没有走 Apple 的公证流程，不是代码本身有问题。

**Linux** 一条命令走完：

```bash
sh -c "$(curl -sS https://vencord.dev/install.sh)"
```

官方提示 snap 装的 Discord 不支持，得用 Flatpak 版或者官方 `.deb` 包。

**浏览器** 版不碰任何本地文件，Chrome 网上应用店直接搜 Vencord Web 装扩展，Firefox 配 Tampermonkey 装 Userscript，Safari 不支持。

我拉了 Linux 版安装脚本的源码看了一遍，逻辑很干净。它拒绝以 root 身份直接跑，检测到 ChromeOS 也会直接退出，引导用户去装浏览器扩展。下载临时文件的时候特意用 `$HOME` 而不是 `/tmp`，是因为有些发行版把 `/tmp` 挂载成了不可执行分区，这个细节说明作者确实踩过坑。脚本本身只是个下载器，真正干活的是从 [VencordInstaller](https://github.com/Vendicated/VencordInstaller) 这个独立仓库编译发布的二进制——那个仓库也开源，621 个 star，同样维护得很勤。也就是说这段 shell 脚本本身可审计、没有可疑的网络请求，但普通用户没法逐行看编译后的二进制，最终信任的其实是"这是从公开仓库经 GitHub Actions 构建发布"这条链路，跟审计脚本本身是两回事。

> 本机（/Applications/Discord.app）装的是日常在用的真实账号，配置目录里有最近几天的活跃会话数据。往这个客户端上打补丁会真的改动一个我在用的真实账号环境，所以这一步没有实际执行，只做到了上面说的脚本审查。想验证注入效果的话，更稳妥的做法是先在一个不重要的小号或者干净的虚拟机里试。

---

## 运行

装完之后不需要额外的启动命令，重新打开 Discord（桌面版会自动重启，浏览器版刷新页面），客户端设置里会多出一个 Vencord 分组，下面挂着插件列表、主题/CSS 编辑器、更新检查这些子页面。

按官方文档的说法，插件是一个个独立开关，进插件列表勾选启用就行，大部分插件还有自己的子设置（比如改快捷键、调显示格式）。CSS 编辑器支持直接粘贴 BetterDiscord 主题的 CSS，不需要转换格式。设置同步是可选功能，开启后插件配置能跨设备/跨端保持一致，不开也不影响正常使用。

这一节同样没有实际点开面板验证，是照着 README 和 DeepWiki 对源码的分析整理的，如果你要动手装，建议以官网当前的界面截图为准。

---

## 效果展示

（此处插入截图：Discord 设置里的 Vencord 插件列表页面）

（此处插入截图：内置 CSS 编辑器界面，导入一个 BetterDiscord 主题后的效果）

按官方 README 的描述，装完之后最直观的变化是能看到消息被编辑前的历史版本，表情和贴纸的显示效果也更完整。界面可以套上任意 CSS 主题，喜欢干净一点的话，Discord 自带的行为分析和崩溃上报也被默认屏蔽掉了。这些截图应该由实际装过的人补上，这里先留空。

---

## 相关项目和评价

这部分绕不开一个问题：**用 Vencord 到底会不会被封号**。Vencord 官方 FAQ 原话是这么说的：

> Client modifications are against Discord's Terms of Service. However, Discord is pretty indifferent about them and there are no known cases of users getting banned for using client mods!

翻译过来就是，改客户端确实违反 Discord 的服务条款，但 Discord 官方自己也承认目前没有已知的、因为用客户端 mod 而被封号的案例。风险集中在滥用类插件上——比如伪造 Nitro 专属画质去推流，这类行为更容易触发检测，内置插件本身官方保证是安全的。第三方评测（如 [crimash.com 的这篇分析](https://crimash.com/will-discord-ban-you-for-betterdiscord-or-vencord/)）也提到过用 FakeNitro 类插件强推 720p/60fps 画质导致账号被处理的案例，但账号级别的封禁跟服务器踢人是两回事——已知的一个具体案例是 Brick Rigs 官方服务器因为检测到 Vencord 把用户踢出服务器，这是那个服务器自己定的规则，不是 Discord 平台层面封号。

Reddit 上能看到两种真实态度并存。[r/antivirus 上有人问能不能信任 Vencord](https://www.reddit.com/r/antivirus/comments/1lu96w1/can_i_trust_vencord/)，起因是 VirusTotal 有一个引擎报毒，回帖里有长期用户说用了快两年没出过问题，社区共识是误报；[r/BetterDiscord 上也有人在纠结要不要换回 BetterDiscord](https://www.reddit.com/r/BetterDiscord/comments/1981pbd/ive_been_using_vencord_for_a_while_now_and_saw/)，因为听说对方插件更多，但回帖里换过去用了一个月的人反而觉得 Vencord 的设置云同步更省心，不用重装所有插件。

同类项目里，[BetterDiscord](https://betterdiscord.app) 起步最早、单独的插件生态也更大更杂，代价是补丁方式更容易被 Discord 更新冲掉；[Replugged](https://replugged.dev) 定位偏开发者向，插件商店审核更规范，但生态规模明显小于 Vencord。Vencord 自己的 FAQ 也说得很直接：BetterDiscord 或 Replugged 的插件不能直接装进 Vencord，但对应功能大概率已经有 Vencord 版本了。

**如果账号对你很重要，这句话值得认真看一眼**：不管是 Vencord 还是别的客户端 mod，官方自己都建议重要账号别装，大号能不用尽量不用。

---

## 卸载和下次运行

卸载对应装的方式来：桌面版用同一个安装器，加上 `--uninstall` 参数运行，会把补丁改动全部还原；浏览器扩展和 Userscript 直接从浏览器的扩展管理里删掉即可，不涉及本地文件改动。

下次想用不需要重装，桌面版打开 Discord 会自带一个更新检查，有新版本会提示；实在提示不出来或者客户端崩溃打不开，重新跑一遍安装器，选"Update Vencord"就行。
