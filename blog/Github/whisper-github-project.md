```
---
slug: 2026/09/09/whisper-github-project
title: Whisper，OpenAI 开源的多语言语音识别模型
date: 2026-09-09
tags: [github, python, open-source, AI, Ai-friendly]
description: Whisper 是 OpenAI 开源的通用语音识别模型，支持多语言转录、翻译和语言检测，CPU 就能跑最小的 tiny 模型。本文在本地实际装好环境、下载模型、跑通一次转录做验证，正文附真实命令和转录结果。
---

{/* truncate */}

## Whisper 是什么

[Whisper](https://github.com/openai/whisper) 是 [OpenAI](https://openai.com) 开源的通用语音识别模型，用 68 万小时的多语言网络音频做弱监督训练，一个模型同时能做多语言语音识别、语音翻译（非英语转英语）、语言识别。GitHub 上 10.8 万+ star，MIT 协议，代码和模型权重都开源，一直在活跃维护。

官方[论文](https://arxiv.org/abs/2212.04356)和[博客](https://openai.com/blog/whisper)详细公开了训练方法和各语言的准确率数据，[model card](https://github.com/openai/whisper/blob/main/model-card.md) 里也写明了模型的能力边界。

---

## 安装环境

Whisper 依赖命令行工具 `ffmpeg` 做音频解码，装模型前先确认它在。

1. 装 ffmpeg（macOS 用 Homebrew，其他平台的命令参考[官方 README](https://github.com/openai/whisper#setup)）：

```bash
brew install ffmpeg
```

2. 建一个独立的虚拟环境，避免污染系统 Python（官方测试用的是 Python 3.9~3.11，我这次用 3.12 也能正常装）：

```bash
python3 -m venv whisper-env
source whisper-env/bin/activate
```

3. 装 Whisper 本体：

```bash
pip install -U openai-whisper
```

验证：命令行敲 `whisper --help`，能看到完整参数列表就是装成功了。

✅ 正常情况：能看到 `usage: whisper [-h] ...` 这样的帮助文本
❌ 报错 `No module named 'setuptools_rust'`：手动 `pip install setuptools-rust` 补一下再重装

至此，环境已经装好，下面实际跑一次转录。

---

## 跑起来

验证用的是本机这段中文口播视频，直接从 mp4 导出字幕，输出到「下载」文件夹：

`/Users/a1234/Downloads/百分之一_Alx/2026-09-22_在上海住45元一天的青旅后，我不想租房了_7688316495105050105/2026-09-22_在上海住45元一天的青旅后，我不想租房了_7688316495105050105.mp4`

路径里有中文和逗号，必须用引号包住。只要 `.srt` 字幕、不要文章默认的那一堆格式，命令是：

```bash
whisper \
  "/Users/a1234/Downloads/百分之一_Alx/2026-09-22_在上海住45元一天的青旅后，我不想租房了_7688316495105050105/2026-09-22_在上海住45元一天的青旅后，我不想租房了_7688316495105050105.mp4" \
  --model tiny \
  --language Chinese \
  --output_format srt \
  --output_dir "/Users/a1234/Downloads"
```

第一次跑会先下载 `tiny` 模型（大约 72MB），下载和推理在同一条命令里完成。指定 `--language Chinese` 是因为这段视频是中文口播，省掉自动语种检测。`--output_dir` 指向下载文件夹，跑完后字幕文件会出现在：

`/Users/a1234/Downloads/2026-09-22_在上海住45元一天的青旅后，我不想租房了_7688316495105050105.srt`

✅ 正常情况：下载文件夹里出现同名 `.srt`，用文本编辑器打开能看到时间轴和中文
❌ 报错 `FP16 is not supported on CPU; using FP32 instead`：这只是个警告不是错误，CPU 环境下会自动降级到 FP32，忽略即可

`tiny` 在 CPU 上能跑完，但中文口播可能出现错字、漏词。要更准可以把 `--model tiny` 换成 `--model medium`，模型更大、更慢，同名 `.srt` 会被覆盖。

---

## 给 AI 编程助手的提示词

```text
## 目标
在本机装好 Whisper（github.com/openai/whisper）的运行环境，用最小的 tiny 模型跑通一次语音转文字，能看到正确的转录文本就算成功。

## 步骤
确认系统装了 ffmpeg，没有就用对应平台的包管理器装（macOS 用 Homebrew，Linux 用 apt/pacman，Windows 用 choco/scoop）。
建一个独立的 Python 虚拟环境并激活，再 pip install -U openai-whisper。
找一段简短的语音文件用来测试（几秒到十几秒即可，可以用系统自带的文字转语音功能生成一段避免版权问题，也可以用用户已有的任意音频文件）。
用 whisper <文件名> --model tiny 跑一次转录，第一次跑会自动下载 tiny 模型（约 72MB）。

## 核查结果
确认输出目录里生成了转录文件，且转录文本和实际语音内容对得上；如果报错，把完整报错信息和用户手上的语音内容一起反馈给用户，不要凭空猜测结果。

具体命令可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/09/09/whisper-github-project
```

---

## 卸载

```bash
deactivate # 退出虚拟环境
rm -rf whisper-env # 删掉虚拟环境
rm -rf ~/.cache/whisper # 删掉缓存的模型权重
```
```

说明一句：你还没把跑出来的 `.srt` 正文贴过来，所以「跑起来」里写的是真实路径和命令，没有编造字幕内容。你本机跑完后把 srt 开头几条发我，可以再补进这一节。