---
slug: 2026/08/21/crosspoint-reader-github-project
title: CrossPoint Reader：给 Xteink 电纸书刷一个开源固件
date: 2026-08-21
tags: [e-reader, esp32, firmware, open-source, epub]
description: CrossPoint Reader 是 Xteink X3/X4 电纸书的开源替代固件，解决了原厂固件在排版、字体、无线传书上的不足，用 C++ 写成，社区维护。
---
买电纸书，用一段时间总会发现原厂固件的某个地方不顺手——字体不能换、无线传书是个摆设、排版差强人意。CrossPoint Reader 就是冲这件事来的：给 Xteink X3/X4 刷一个完全开源的固件，你觉得哪里不对劲，可以自己改。
{/* truncate */}
---
## 介绍
CrossPoint Reader 是运行在 Xteink X3/X4 上的开源固件，基于 ESP32-C3 芯片，用 C++ 写成，用 PlatformIO/Arduino 框架构建，社区维护。
它的出发点是填原厂固件（XTOS）留下的坑，而不是把设备变成万能机。项目的 SCOPE.md 里明确写着：没有记事本、没有游戏、没有 RSS 阅读器——专注阅读体验本身。
覆盖的东西：
- EPUB 2/3 渲染，支持内嵌样式、脚注、书签、章节跳转、百分比定位、自动翻页、竖屏横屏切换
- StarDict 字典查词
- KOReader 阅读进度同步（官方 sync 服务或自建）
- Wi-Fi 文件传输 Web 界面、WebDAV、OPDS 书库浏览、Calibre 无线传书
- OTA 在线升级
- SD 卡自定义字体（TTF/OTF 转 `.cpfont`）
- X3 专属的倾斜翻页（陀螺仪驱动）
- 24 种 UI 语言，RTL 文字支持

硬件本身只有约 380KB 可用 RAM，固件的很多设计决定都围绕这个上限做的——章节内容第一次加载后缓存到 SD 卡，之后直接读缓存，不重新解析。
以 GPL-3.0 开源。

---
## 安装固件
不需要搭开发环境，用浏览器刷就行：
1. 用 USB-C 数据线连接设备，唤醒解锁屏幕
2. 打开 https://crosspointreader.com/#flash-tools
3. 选 X3 或 X4，选一个官方 release，点「Flash」

> ✅ 正常：浏览器弹出串口设备选择框，选中设备，刷写进度条走完，设备重启进入 CrossPoint 界面
> ❌ 异常：选择框里没有设备——先换个 USB 口或换 Chrome/Edge 试，如果还是没有，可能是从 AliExpress 买的设备做了 USB 刷写锁，需要先去 https://crosspointreader.com/#unlock-tool 解锁

注意，从 Xteink 官网直接购买的设备没有刷写锁，不需要解锁这步。

想用命令行刷，安装 esptool 之后：
```bash
pip install esptool
# macOS 找端口
log stream --predicate 'subsystem == "com.apple.iokit"' --info
# 刷写
esptool.py --chip esp32c3 --port /dev/ttyACM0 --baud 921600 write_flash 0x10000 firmware.bin
```
`firmware.bin` 从 [Releases 页](https://github.com/crosspoint-reader/crosspoint-reader/releases) 下载，端口号根据实际情况改。

至此，固件已经刷进去了。

---
## 使用
刷完首次启动，设备进入 CrossPoint 主界面。几个值得第一时间设置的地方：

**连 Wi-Fi**：进设置，连上家里的网，之后可以直接在浏览器里往设备传书，或者用 WebDAV 挂载成网络驱动器。

**Calibre 无线传书**：在 Calibre 里安装 CrossPoint 插件，填设备 IP，之后「发送到设备」就直接传过去，不用拔插 SD 卡。

**OPDS 书库**：支持保存最多 8 个 OPDS 服务器地址，比如 Calibre Content Server，在设备上直接浏览书库下载。

**自定义字体**：去 https://crosspointreader.com/fonts 上传 TTF/OTF，生成 `.cpfont` 文件，拷到 SD 卡 `/fonts/你的字体名/` 目录下，设备里选字体就能用，不用重新刷固件。

我没有 Xteink 设备，以上来自源码（`USER_GUIDE.md`、`SCOPE.md`、`docs/`）和 README 的交叉验证。

---
## 效果展示
（此处插入 CrossPoint 阅读界面截图）
（此处插入与原厂固件 XTOS 的排版对比图）

---
## AI-friendly
把下面这段给 Claude Code 或 Codex，它可以独立完成固件编译和刷写：
```
Build and flash CrossPoint Reader firmware to an Xteink X3/X4:
Requirements:
- Python 3.8+
- pioarduino (or VS Code + pioarduino plugin)
- USB-C data cable connected to Xteink device

Steps:
1. Clone with submodules:
   git clone --recursive https://github.com/crosspoint-reader/crosspoint-reader
   cd crosspoint-reader

2. Build and flash:
   pio run --target upload

3. Alternative (web flasher, no build needed):
   - Open https://crosspointreader.com/#flash-tools in Chrome/Edge
   - Connect device via USB-C, select device model, click Flash

Note: AliExpress units may have USB flashing locked — run the unlocker at
https://crosspointreader.com/#unlock-tool first if the device doesn't appear.
```

---
## 社区 Fork
CrossPoint 定位清晰，不做的东西社区 fork 里有：
- **CrossInk**：加了仿生阅读（词干加粗）、段落缩进、换了默认字体
- **crosspoint-reader-cjk**：专门针对中日韩文本优化
- **papyrix-reader**：加了 FB2 和 Markdown 格式支持，Arabic 文字支持

---
## 下次刷固件
OTA 升级：设备联网后，进设置 → System → 检查更新，有新版本直接在设备上下载安装，不需要连电脑。

手动刷：同安装步骤，去 https://crosspointreader.com/#flash-tools 选新版本重新刷一遍。
