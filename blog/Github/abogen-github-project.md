---
slug: 2026/08/21/abogen-github-project
title: abogen：用 Kokoro 把 EPUB/PDF 转成有字幕的有声书
date: 2026-08-21
tags: [tts, audiobook, epub, python, open-source]
description: abogen 是一个本地运行的 TTS 工具，把 EPUB、PDF、TXT、Markdown、字幕文件转成带同步字幕的音频，底层用 Kokoro-82M 模型，支持桌面 GUI 和 Web UI 两种界面。
---
把一本 EPUB 丢进去，几秒钟出来一段能听的音频，字幕自动打好，甚至能同步到每个词——abogen 做的就是这件事，而且在本地跑，不需要 API key，不需要联网。
{/* truncate */}
---
## 介绍
abogen 是 [Deniz Safak](https://github.com/denizsafak) 写的一个 Python 工具，底层用 [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) 做文字转语音。Kokoro 是个 82M 参数的小模型，在 M 系列芯片上跑得很流畅，生成速度比实时快很多。

支持的输入格式：`.epub`、`.pdf`、`.txt`、`.md`、`.srt`、`.ass`、`.vtt`。

输出音频格式：WAV、FLAC、MP3、OPUS、M4B（带章节标记）。

字幕生成模式从「整行」到「逐词」都有，英文支持词级别时间戳，其他语言用句子级别。

两个界面可以选：
- `abogen`：PyQt6 桌面 GUI，功能稳定
- `abogen-web`：Flask Web UI，功能更新，多了 LLM 文本预处理、Audiobookshelf 直推集成

MIT 开源，Kokoro 本身是 Apache 2.0。

---
## 安装环境
macOS（M 系列）先装 espeak-ng：
```bash
brew install espeak-ng
```
然后装 abogen：

```bash
# Silicon Mac（M1/M2/M3/M4）
uv tool install --python 3.13 abogen --with "kokoro @ git+https://github.com/hexgrad/kokoro.git,numpy<2"


至此，abogen 已经装好。

---
## 运行
启动桌面 GUI：
```bash
abogen
```
启动 Web UI（功能更全，推荐）：
```bash
abogen-web
```
然后打开 http://localhost:8808 。

**基本流程**：把文件拖进去，选语音、语速、字幕模式、输出格式，点 Start（GUI）或 Create job（Web UI），等进度跑完下载文件。

**语音选择**：命名规则是语言代码 + 性别，比如 `af` 是美式英语女声，`am` 是美式英语男声，`bf` 是英式英语女声。Kokoro 支持英语、西班牙语、法语、印地语、意大利语、日语、葡萄牙语、普通话。

**章节处理**：EPUB 和 PDF 可以选具体章节，也可以把每章存成独立音频文件，同时生成一个合并版本。文本文件里用 `<<CHAPTER_MARKER:章节名>>` 手动打章节标记，abogen 会识别到。

**Voice Mixer**：GUI 里有个声音混合器，可以把多个 Kokoro 声音按权重混合，保存成自定义声音档案。

---
## 效果展示
（此处插入 GUI 主界面截图）
（此处插入 Web UI 截图）

---
## AI-friendly
把下面这段给 Claude Code 或 Codex，它可以独立装好 abogen 并转换一个文件：
```
Install abogen on macOS (Apple Silicon) and convert a text file to audio:

Prerequisites:
  brew install espeak-ng
  brew install uv  # if not already installed

Install:
  uv tool install --python 3.13 abogen \
    --with "kokoro @ git+https://github.com/hexgrad/kokoro.git,numpy<2"

Convert a text file (headless, no GUI):
  # Create a simple text file
  echo "Hello, this is a test of abogen text to speech." > /tmp/test.txt
  # abogen-cli for command-line conversion
  abogen-cli --help

Start Web UI:
  abogen-web
  # Then open http://localhost:8808 in a browser

For Intel Mac: replace --python 3.13 with --python 3.12
```

---
## 卸载和下次运行
下次运行直接启动，模型第一次运行时会从 HuggingFace 下载缓存，之后无需联网：
```bash
abogen        # 桌面 GUI
abogen-web    # Web UI，访问 http://localhost:8808
```
卸载：
```bash
uv tool uninstall abogen
uv cache clear
brew uninstall espeak-ng  # 如果不再需要
```
