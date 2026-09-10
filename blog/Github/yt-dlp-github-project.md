---
slug: 2026/09/09/yt-dlp-github-project
title: yt-dlp，命令行音视频下载工具（youtube-dl 的活跃分支）
date: 2026-09-09
tags: [github, open-source, python, Ai-friendly]
description: yt-dlp 是 youtube-dl 停更风波后分裂出来的活跃分支，支持数千个站点的命令行下载。这篇实际装了一遍、真的下载了一段 CC 授权的短片验证格式合并和音频提取，也记录了它和 YouTube 反爬对抗的争议。
---

{/* truncate */}

## 介绍

[yt-dlp](https://github.com/yt-dlp/yt-dlp) 是一个命令行音视频下载工具，README 里列出的支持站点有几千个。它不是一个凭空冒出来的新项目，而是 fork 自已经停更的 `yt-dlc`，又和 [youtube-dl](https://github.com/ytdl-org/youtube-dl) 的某个版本合并而来，维护者是一批原 youtube-dl 贡献者，账号是组织账号，没有单一的"作者"人设。

GitHub 上现在有 18.9 万个 star，1.6 万多个 fork，issue 区常年开着 2600 多条。项目仓库创建于 2020 年 10 月 26 日，这个日期不是随便选的——三天前，youtube-dl 刚被 RIAA 用 DMCA 下架过一次，后面"相关"那节会展开讲这段历史。

用 Python 写的，官方仓库还挂了三条并行的发布线：`stable` 月更但容易被网站改版拖到"过期"、`nightly` 官方建议日常用户用、`master` 每次代码 push 就发一版但最不稳定。切换渠道用 `--update-to nightly` 或 `--update-to master`。

---

## 安装环境

最简单的装法是 `pip`，也是这次实测用的方式：

```bash
pip install -U yt-dlp
```

想要更完整的功能，还有两样东西建议一起装上。

第一个是 `ffmpeg`，合并分离的音视频流、转码、切章节都靠它，缺了这个只能下到没声音或者格式受限的视频：

```bash
brew install ffmpeg
```

第二个是一个 JS 运行时（deno、node.js、bun 或 quickjs 任选其一），yt-dlp 需要靠它跑一段 YouTube 播放器的 JS 逻辑（官方叫 `yt-dlp-ejs`），YouTube 的完整支持离不开这个：

```bash
brew install deno
```

验证都装好了：

```bash
yt-dlp --version
ffmpeg -version
```

✅ 正常：`yt-dlp` 打印出一串版本号（比如 `2026.08.19`），`ffmpeg` 打印出版本和编译参数

❌ 异常：提示 `command not found`，说明对应的包没装上或者不在 `PATH` 里

至此，跑 yt-dlp 需要的环境已经装好了。

---

## 运行

基本语法很简单：

```bash
yt-dlp [选项] URL
```

不加任何选项，默认约等于 `-f bestvideo*+bestaudio/best`，也就是自动挑最好的视频流和音频流合并下载。实测跑的时候习惯手动指定一下分辨率上限和排序规则，避免默认扒到一个又大又不需要的 4K 源：

```bash
yt-dlp -f "bv*+ba/b" -S "res:480" "https://commons.wikimedia.org/wiki/File:Big_Buck_Bunny_Trailer_400p.ogv" -o "test.%(ext)s"
```

只要音频，加 `-x` 就会在下载完之后用 ffmpeg 抽取并转码：

```bash
yt-dlp -x --audio-format mp3 "https://commons.wikimedia.org/wiki/File:Big_Buck_Bunny_Trailer_400p.ogv" -o "test_audio.%(ext)s"
```

至此，yt-dlp 已经能正常跑起来。

---

## 效果展示

这次没有拿 YouTube 视频做验证。第一次尝试用 yt-dlp 常见测试链接和 Big Buck Bunny 官方频道视频下载，两次都在拉取网页/播放器接口的时候撞上连接被重置（`IncompleteRead`），换了几个视频 ID 结果一样。本机走的是本地代理，这类反复的连接中断更像是代理链路本身不稳，但也确实印证了后面"相关"那节要讲的一点——yt-dlp 请求 YouTube 这条链路，本身就比普通网页请求脆弱得多。

为了不在版权和反爬问题上纠缠，改用了 [Wikimedia Commons](https://commons.wikimedia.org/) 上一段公开的 [Big Buck Bunny 预告片](https://commons.wikimedia.org/wiki/File:Big_Buck_Bunny_Trailer_400p.ogv)（CC BY 3.0 授权，33 秒）做实测：

```bash
yt-dlp --retries 10 --socket-timeout 20 \
  "https://commons.wikimedia.org/wiki/File:Big_Buck_Bunny_Trailer_400p.ogv" \
  -o "test.%(ext)s"
```

第一次到第三次同样因为连接被重置没下完，第四次跑通了：

```text
[download] 100% of 4.16MiB in 00:00:03 at 1.22MiB/s
```

`ffprobe` 核对了一下下载下来的文件，`Ogg` 容器、`Theora` 视频 + `Vorbis` 音频，720×400，时长 32.996875 秒，文件大小 4,360,399 字节——和 Wikimedia API 报的源文件体积一字不差。

> 注意，`yt-dlp` 报的"下载失败重试"和"最终成功"看着挺吓人，其实是它自己的分片校验在起作用——发现下载到的字节数和预期对不上就整段重来，不是文件本身有问题。

接着用同一个链接测了下 `-x --audio-format mp3` 音频提取，第二次尝试成功，`ffmpeg` 后处理把 Ogg 里的 Vorbis 轨转成了一个 480,069 字节的 MP3，`ffprobe` 显示 64kbps、48kHz、立体声，时长同样精确匹配 32.996875 秒。验证完两个文件都已经删除，没有留在仓库里。

（此处插入截图：下载过程的终端输出）

---

## 相关项目和评价

yt-dlp 能存在，本身就是一段版权博弈史。2020 年 10 月 23 日，RIAA 向 GitHub 提交 DMCA 下架通知，理由是 youtube-dl 绕过了 YouTube 的签名机制，援引的是反规避条款而不是普通的版权侵权，GitHub 当时直接下架了 youtube-dl——那会儿它已经是 GitHub star 数前 40 的仓库之一。三天后，yt-dlp 悄悄出现，创建时间和这次下架事件严丝合缝。[EFF](https://www.eff.org/deeplinks/2020/11/riaa-abuses-dmca-take-down-popular-youtube-download-software) 后来发文明确称这是"RIAA 滥用 DMCA"，GitHub 在 11 月中旬恢复了 youtube-dl 仓库并设了 100 万美元的开发者维权基金，但这时候大部分活跃贡献者已经转到了 yt-dlp，Ubuntu 和 Debian 后来也都把默认下载工具换成了 yt-dlp。

跟 yt-dlp 常被放在一起提的还有 [gallery-dl](https://github.com/mikf/gallery-dl)，不过两者其实是互补关系而不是竞品——gallery-dl 专攻 Imgur、Pixiv、Danbooru 这类图片画廊站点，yt-dlp 只管音视频，很多人的归档流程是两个一起用。

真正让 yt-dlp 头疼的是 YouTube 这边的反爬升级。README 里的 `po_token`、`fetch_pot`、`bind_to_visitor_id` 这些参数，背后是 YouTube 要求客户端跑一段 BotGuard 混淆过的 JS 去证明"请求来自真实浏览器"，2025 年之后播放器结构改版的频率也明显变高，一些用户反馈是"按月轮换"，纯靠正则表达式扒签名逻辑的老办法越来越容易失效。Hacker News 上一条 2025 年 9 月的[讨论](https://news.ycombinator.com/item?id=45306399)吵得比较凶：有人反驳"Google 默许下载器存在"这种说法，认为 Google 一直在主动加码封锁，yt-dlp 代码库里那些复杂到离谱的签名计算逻辑是被逼出来的；也有人管维护者叫"heroes"。但 GitHub issue 区同样有大量用户反馈"传了 PO Token 照样被拦"，说明这套对抗目前对 yt-dlp 并不总是占上风，`Sign in to confirm you're not a bot` 这类验证墙依旧是高频 issue。

法律层面，工具本身没问题，用途才决定风险。下载 YouTube 视频违反的是平台服务条款，不是刑事犯罪；如果下载的内容本身涉及未授权版权素材，那才构成侵权，跟用什么工具下载无关。目前没有查到"个人下载单个公开视频供离线观看"被起诉的先例，个人用户的实际法律风险接近零，但这不等于零风险，德国《著作权法》第 53 条这类"私人复制"例外也不是每个司法辖区都有对应条款。

---

## 给 AI 编程助手的提示词

不想自己一步步敲命令？把下面这段丢给 Claude Code 或 Codex，让它帮你把 yt-dlp 装好并跑一遍真实下载验证。

```text
## 目标
在当前机器上装好 yt-dlp，确认能正常下载一段音视频并做格式合并/音频提取。

## 步骤
1. 建一个 Python 虚拟环境，pip install -U yt-dlp
2. 确认系统装了 ffmpeg（macOS 用 brew install ffmpeg），没装就装上——合并音视频流和后处理都需要它
3. 建议装一个 JS 运行时（deno 优先），YouTube 完整支持需要跑一段播放器 JS 逻辑
4. 找一段版权无争议、时长很短的视频做验证（公开领域或 Creative Commons 授权内容优先，比如 Wikimedia Commons 上的公开素材），不要尝试下载有版权争议或需要绕过付费墙的内容
5. 分别测一次视频下载（-f 指定格式选择器）和一次音频提取（-x --audio-format mp3），用 ffprobe 核对下载结果的时长、编码、文件大小是否和源信息一致
6. 验证完删除测试文件，不要把下载产物提交进仓库

## 核查结果
把两次下载的命令、终端输出和 ffprobe 核对结果贴给我确认，重点看有没有报错、下载文件的时长/大小是否和源文件匹配。

具体命令、参数细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/09/09/yt-dlp-github-project
```

---

## 卸载和下次运行

用 `pip` 装的，卸载一步到位：

```bash
pip uninstall yt-dlp
```

如果是在虚拟环境里装的，直接把整个虚拟环境目录删掉就行，不会污染系统环境。

下次想再用，虚拟环境激活后直接跑命令即可，不用重新安装：

```bash
yt-dlp -f "bv*+ba/b" "你的链接"
```

想保持在最新版本，跑一下 `yt-dlp -U`（二进制安装）或者重新 `pip install -U yt-dlp`（pip 安装）就行——考虑到 YouTube 那边改版的频率，这条命令值得常跑。
