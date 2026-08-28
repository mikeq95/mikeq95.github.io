---
slug: 2026/08/21/crosspoint-reader-github-project
title: CrossPoint Reader，一套开源的 Xteink 电纸书固件
date: 2026-08-28
tags: [e-reader, esp32, firmware, open-source, Ai-friendly]
description: CrossPoint Reader 是运行在 Xteink X3/X4 电纸书上的开源固件，用 C++ 写成、基于 PlatformIO 构建，这篇文章根据源码、官方文档和第三方评测整理，没有做实机验证。
---

CrossPoint Reader 是一套跑在 Xteink X3/X4 电纸书上的开源固件，社区自己维护，想解决的是官方固件（XTOS）在排版、字体和无线传书上一直被吐槽的问题。它不打算把电纸书做成什么都能干的万能机，SCOPE.md 里写得很直接，不装记事本，不装游戏，一门心思把阅读这件事做扎实。

{/* truncate */}

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

---

## 介绍

CrossPoint Reader 用 C++ 写成，基于 PlatformIO 和 Arduino 框架构建，跑在 ESP32-C3 芯片上。项目发起人是 Dave Allie，到现在他依然是提交量最高的贡献者，195 次提交，第二名只有 94 次。GitHub 上目前有 7300 多个 star、1500 多个 fork，用的是 MIT 协议，README 里也写明白了跟 Xteink 官方没有从属关系。

它目前正式支持的硬件只有 Xteink X3 和 X4，但 SCOPE.md 说得很清楚，核心团队正在有意把代码往更多 ESP32-C3/S3 电纸书设备上迁。已经有社区分支把它移植到了 M5Stack Paper S3 和 LilyGo T5S3 上，只是这些还没进主线，属于社区自己维护的独立分支。

ESP32-C3 只有大约 380KB 可用 RAM，这个限制几乎决定了整套固件的设计思路。书籍章节第一次打开时会解析并缓存到 SD 卡，之后直接读缓存，不用每次都重新解析全文。

项目的边界划得也很清楚。SCOPE.md 里明确把记事本、计算器、游戏这类"互动应用"划在范围外，也不打算做 RSS 阅读器或网页浏览器——常驻 Wi-Fi 太耗电，单核 CPU 也扛不住。PDF 更是直接被排除，理由是它属于固定排版格式，电纸书渲染出来只能靠平移缩放看，体验天生就差。眼下主题系统和新的网络同步类 PR 也暂时关闭，团队想先把代码和多设备支持这块收拢好，再谈新功能。项目靠 Royalty.dev 给贡献者分钱，开放资助的头几个小时就筹到 600 多美元，官方说这是社区需求真实存在的信号。

---

## 安装环境

这一节没有实机操作过，作者手头没有 Xteink 设备，下面按 README 和 SCOPE.md 里的官方步骤整理。

大多数人不需要装任何东西。CrossPoint 提供一个网页刷机工具（crosspointreader.com/#flash-tools），用 Chrome 或 Edge 打开，靠浏览器自带的串口能力直接跟设备通信，不用装驱动或客户端。

想从命令行刷，只需要装一个 esptool：

```bash
pip install esptool
```

想从源码构建，比如改代码、做贡献，才需要真正意义上的开发环境。得装 Python 3.8 以上、`clang-format` 21 和 pioarduino（或者带 pioarduino 插件的 VS Code），另外还要一根支持数据传输的 USB-C 线。克隆代码时要带上 `--recursive`，项目用了 git submodule：

```bash
git clone --recursive https://github.com/crosspoint-reader/crosspoint-reader
cd crosspoint-reader
# 如果之前 clone 时忘了加 --recursive
git submodule update --init --recursive
```

Nix/NixOS 用户可以直接 `nix develop -f nix` 或 `nix-shell nix` 进开发环境，要刷机的话还得在系统配置里加一行 `platformio-core.udev`，打开对应的 udev 规则。

注意，有一类设备需要额外一步。从 AliExpress 等第三方渠道买的部分 Xteink 机器出厂时锁了 USB 刷机，得先用官方的 Xteink Unlocker（crosspointreader.com/#unlock-tool）解锁。官方特别提醒，解锁工具里目前只有 CrossPoint 和 CrossInk 是官方支持的固件，刷别的固件有可能永久变砖，或者卡死在当前固件上没法恢复。直接从 xteink.com 买的机器不受影响，不用解锁。不确定自己的设备锁没锁，可以先直接试网页刷机，序列设备选择框里如果找不到设备，换个 USB 口或浏览器再试一次，还是不行才需要考虑解锁。

至此，装什么、什么时候不用装，应该已经分清楚了。

---

## 运行

同样没有实机验证过，这一节按 README「Install firmware」和「Development quick start」两节整理。

最简单的路径是网页刷机：设备用 USB-C 接好电脑，唤醒解锁屏幕，打开 crosspointreader.com/#flash-tools，选好设备型号（X3 或 X4），选一个官方 release，点 Flash 就行。想刷指定版本或者本地构建的固件，同一个页面选 "Custom .bin"，上传 `firmware.bin` 即可，这个文件可以从 Releases 页下载，也可以是本地构建或 CI 产物。想切回原厂固件，也是走这个页面，选刷入最新的官方固件。

命令行刷机稍微多两步，先确认设备端口。Linux 下接好设备后跑 `dmesg` 看，macOS 下用：

```bash
log stream --predicate 'subsystem == "com.apple.iokit"' --info
```

确认端口之后刷入：

```bash
esptool.py --chip esp32c3 --port /dev/ttyACM0 --baud 921600 write_flash 0x10000 /path/to/firmware.bin
```

`/dev/ttyACM0` 换成实际查到的端口。

从源码构建的话，装好开发环境之后一条命令搞定编译、刷写、串口监控：

```bash
pio run --target upload
```

想给项目提 PR，官方要求先跑一遍自查：

```bash
./bin/clang-format-fix
pio check -e default
pio run -e default
```

排查崩溃或者其他运行时问题，可以在装好依赖之后抓详细日志：

```bash
python3 -m pip install pyserial colorama matplotlib
python3 scripts/debugging_monitor.py                      # Linux
python3 scripts/debugging_monitor.py /dev/cu.usbmodem2101  # macOS，端口号按实际情况改
```

USER_GUIDE.md 里写了首次开机会直接停在 Home 主界面，之后每次重启会自动打开上次读到的那本书，不用重新翻文件夹找。

至此，几条刷机路径已经讲完，下面这些是刷完之后固件实际能做的事。

---

## 效果展示

这一节同样没有实机跑过，下面的功能描述来自 README、USER_GUIDE.md，以及「相关项目和评价」里链的第三方评测和视频。

### 阅读引擎

核心是 EPUB 2/3 渲染，支持内嵌样式开关、图片显示、断字、字距调整、章节导航、脚注、书签，还带 StarDict 词典查词，选中生词直接查释义，不用切出去搜手机。KOReader 进度同步走的是标准协议，记录的不是简单的百分比，而是章节内容里的 XPath 定位，所以换到字体、排版完全不同的设备上也能精确跳回同一句话。默认走官方免费的 `sync.crosspointreader.com`，也可以自建 Docker Compose 服务器，或者接 `sync.koreader.rocks` 这类老牌公共服务器。

还有一个叫 Focus Reading 的功能，把每个单词前半部分加粗制造视觉焦点，灵感来自 Bionic Reading。官方文档里提到，对多动症一类容易走神的读者会有帮助，默认是关的，设置里手动打开。

### 格式与设备支持

原生支持 `.epub`、Xteink 自家的 `.xtc/.xtch`、纯文本 `.txt` 和图片 `.bmp`。X3 独有陀螺仪驱动的倾斜翻页，倾斜设备就能翻页。自定义字体不用重新刷机，去 crosspointreader.com/fonts 上传最多四种字重的 TTF/OTF，生成 `.cpfont` 文件，拷到 SD 卡 `/fonts/字体名/` 目录，设备字体设置里选中即可。这个转换工具跑的就是仓库里 `lib/EpdFont/scripts/fontconvert_sdcard.py` 这份脚本本身，出来的结果跟本地构建一致。

### 无线与传书

浏览器里能直接往设备拖文件传书，也支持把设备当 WebDAV 网络硬盘挂载。装好 Calibre 插件之后，选中书籍右键就能推送到设备。OPDS 最多能存 8 个服务器，支持搜索、分页、直接下载，接自建的 Calibre Web 之类书库很方便。OTA 更新直接从 GitHub Releases 检测安装，也能把 `firmware.bin` 丢进 SD 卡离线升级。

### 个性化

界面语言覆盖 24 种，包含希伯来语，做了从右到左的 RTL 阅读支持。息屏画面能选书籍封面、纯图片或者透明叠加图，还有个"快速唤醒"模式，睡眠前最后一页的文字直接印在锁屏上，秒开接着看不用等完整加载。前置四个物理按键和侧边音量键都能重新映射功能。主题目前有 Classic、Lyra、Lyra Extended、RoundedRaff 四套，不过 SCOPE.md 里写了这块暂时冻结，团队计划把主题整体挪到从 SD 卡加载，而不是塞进固件本体占用 flash。

以上是文档和 README 里写的能力，实际渲染速度、翻页流畅度这些主观体验，下面「相关项目和评价」链的第三方评测可以当参考。The eBook Reader 那篇提到从 1.2.0 升到 1.3.0 之后字体渲染深浅不均，作者主动回退到了旧版本，说明版本之间不是只加功能不出问题。

---

## 相关项目和评价

CrossPoint 定位收得很紧，不做的事情，社区分支里基本都能找到替代。README 自己列了一份「Community forks」清单：[CrossInk](https://github.com/uxjulia/CrossInk) 主打排版和阅读追踪，做了 Bionic Reading、词间引导点、更细的段落缩进，还换了默认字体；[papyrix-reader](https://github.com/bigbag/papyrix-reader) 加了 FB2 和 Markdown 格式支持，还做了阿拉伯文脚本适配；[crosspoint-reader-cjk](https://github.com/aBER0724/crosspoint-reader-cjk) 专门为中日韩文字阅读场景做了优化。README 原话是这些功能里很多迟早会并进主线，只是团队想保持慢一点的节奏，先把稳定性和 bug 修好再合入。项目本身也不是凭空冒出来的，README 结尾特意致谢了 [diy-esp32-epub-reader](https://github.com/atomic14/diy-esp32-epub-reader)，一个更早的、没绑定具体商用硬件的 ESP32 开源阅读器实现，是 CrossPoint 的灵感来源。

第三方评测这边，The eBook Reader 博主 Nathan Groezinger 写了一篇[带视频的实测](https://blog.the-ebook-reader.com/2026/05/20/xteink-x4-with-crosspoint-software-review-with-video-demo/)，细到具体版本号，从 1.2.0 升到 1.3.0 后发现新版字体渲染深浅不均，干脆主动回退。PocketInk 博客写了一篇[刷机故障排查指南](https://pocketink.io/blog/flash-crosspoint-xteink-x3-x4/)，专门点出了当时还没修好的 SD 卡刷机 "Error 9" 报错，也就是 [issue #2536](https://github.com/crosspoint-reader/crosspoint-reader/issues/2536)，写这篇文章时在 GitHub 上查依然是 open 状态，并给了临时规避思路。个人博客 brie.dev 有一篇[长期使用记录](https://brie.dev/tiny-ereader)，记录了 2026 年 4 月那次 USB 锁定事件之后的购买建议，以及在 CrossPoint、CrossInk、Crosspet 几个分支之间怎么取舍。Pocket-lint 也写了一篇[带截图的完整刷机实测](https://www.pocket-lint.com/custom-e-reader-firmware/)，走的是从头到尾的操作说明。

社区讨论方面，Reddit 的 r/xteinkereader 板块能找到[项目最早的发布帖](https://www.reddit.com/r/xteinkereader/comments/1plj85s/crosspoint_custom_firmware_for_the_xteink_x4/)，评论区有不少第一手反馈；也有一条[具体的故障案例](https://www.reddit.com/r/xteinkereader/comments/1rq1vlm/epub_file_wont_open_w_crosspoint_x4_just_reboots/)，某个 EPUB 文件一打开设备就重启，说明固件在个别文件上还是有稳定性问题，不是完全没坑。知乎上有一篇[实测刷机体验的帖子](https://zhuanlan.zhihu.com/p/2004526108197011730)，作者说这是他刷过最丝滑的固件刷入体验，同时提到自己也试过 crosspoint-reader-cjk 分支，当时 bug 比较多、经常卡死，还观察到 Xteink 官方固件后来在界面设计上似乎受到了 CrossPoint 的影响——这是作者自己的主观判断，不是官方证实的信息。

---

## 给 AI 编程助手的提示词

不想自己一步步查文档、装环境？把下面这段丢给 Claude Code 或 Codex，让它帮你把 CrossPoint Reader 从源码构建出来，刷进连接的 Xteink 设备。

```text
## 目标
把 CrossPoint Reader（github.com/crosspoint-reader/crosspoint-reader）这个开源电纸书固件从源码构建出来，刷进当前连接的 Xteink X3/X4 设备。

## 步骤
1. 带上 --recursive 克隆仓库（项目用了 git submodule）：git clone --recursive https://github.com/crosspoint-reader/crosspoint-reader；如果之前 clone 忘了加，用 git submodule update --init --recursive 补上
2. 确认已装好 pioarduino（或带 pioarduino 插件的 VS Code）和 Python 3.8+
3. 用 USB-C 数据线连接设备，确认能被系统识别
4. 构建并刷写：pio run --target upload
5. 如果设备是从 AliExpress 等第三方渠道购买、刷写时无法被识别，可能是出厂锁了 USB，需要先用 https://crosspointreader.com/#unlock-tool 解锁；从 xteink.com 直接购买的设备不受影响
6. 如果不想本地构建，也可以用网页刷机工具 https://crosspointreader.com/#flash-tools，选设备型号后直接刷官方 release，不用装任何开发环境

## 核查结果
确认刷写命令执行成功、设备重启后进入 CrossPoint 主界面，把过程中遇到的报错（如果有）和最终状态告诉我。

具体命令、参数细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/08/21/crosspoint-reader-github-project
```

---

## 卸载和下次运行

卸载对应「安装环境」那节装了什么：只用了网页刷机的话，没有任何东西装在电脑上，不用就行；装了 esptool 的话 `pip uninstall esptool`；从源码构建过的话，删掉本地 clone 目录和 `.pio` 编译缓存就干净了。

真想把设备恢复原状，回到 crosspointreader.com/#flash-tools，选刷入官方最新固件即可。

下次想再刷新版本，不用重装任何东西。设备联网后进设置检查更新，OTA 直接下载安装；或者手动把新的 `firmware.bin` 丢进 SD 卡离线升级；从源码构建的场景，仓库目录还在的话，`git pull` 拉最新代码，一条 `pio run --target upload` 就够了。

---

## 总结

CrossPoint 现在官方正式支持的还是只有 Xteink X3 和 X4 这两款硬件，SCOPE.md 里说要往更多 ESP32-C3/S3 设备扩展，眼下更多体现在社区分支的移植版本上，还没进到主线。SD 卡刷机路径的 "Error 9" 报错到写这篇文章时也还没修，遇到的话去 issue #2536 底下看看有没有临时规避办法。项目本身不支持 PDF，也不支持带 DRM 的电子书，这两点动手之前最好先弄清楚。

这篇文章整理的所有内容都来自源码、README、USER_GUIDE.md、SCOPE.md 和上面链的第三方评测，作者手头没有 Xteink 设备，没有真的刷过、跑过。真要照着这篇文章操作，多看一眼「相关项目和评价」里链的评测和 issue 讨论，能少踩几个别人已经踩过的坑。
