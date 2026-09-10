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

我这次的验证流程：生成一段没有版权问题的短语音（用系统自带的文字转语音功能念一句英文），转成 Whisper 能吃的格式，再用体积最小的 `tiny` 模型跑一次转录。

跑转录：

```bash
whisper test_en.wav --model tiny --output_dir ./whisper_out
```

第一次跑会先下载模型（`tiny` 大概 72MB），下载和推理在同一条命令里完成，不用额外操作。真实终端输出（去掉了下载进度条）：

```text
Detecting language using up to the first 30 seconds. Use `--language` to specify the language
Detected language: English
[00:00.000 --> 00:04.000]  Hello, this is a test of the Whisper Speech Recognition model.
[00:04.000 --> 00:07.000]  The Quick Brown Fox jumps over the lazy dog.
```

我念的原文是"Hello, this is a test of the Whisper speech recognition model. The quick brown fox jumps over the lazy dog."——内容一字不差转录对了，语言也正确识别成英语。唯一的小出入是 Whisper 把"Speech Recognition""Quick Brown Fox"这几个词自作主张大写了，这是模型自己的输出风格，不影响准确性。

整个过程（含模型下载）在 CPU 上不到一分钟，`tiny` 模型确实轻，普通笔记本电脑跑起来没有压力。

✅ 正常情况：输出目录里能看到 `.txt`/`.srt`/`.vtt` 等格式的转录文件
❌ 报错 `FP16 is not supported on CPU; using FP32 instead`：这只是个警告不是错误，CPU 环境下会自动降级到 FP32，忽略即可

至此，一次真实的转录已经跑通。

> 想指定语言或者做翻译的话，命令是 `whisper japanese.wav --language Japanese` 和 `whisper japanese.wav --model medium --language Japanese --task translate`（翻译任务不能用 `turbo` 模型，原因看下面模型规格）。

---

## 模型规格

| 模型 | 参数量 | 所需显存 | 相对速度 |
|---|---|---|---|
| tiny | 39M | ~1GB | ~10x |
| base | 74M | ~1GB | ~7x |
| small | 244M | ~2GB | ~4x |
| medium | 769M | ~5GB | ~2x |
| large | 1550M | ~10GB | 1x |
| turbo | 809M | ~6GB | ~8x |

- `tiny`、`base` 这两档 CPU 就能跑，不需要 GPU，跟我这次的实测情况一致
- `turbo` 是 `large-v3` 的剪枝蒸馏版本，速度快、精度损失小，但**不支持翻译任务**——即使指定 `--task translate` 也只会原样转录，想做翻译得用 `medium` 或 `large`
- 英语专用的 `.en` 版本（比如 `tiny.en`）通常比对应的多语言版效果更好，模型越大这个差距越小
- 相对速度是官方在 A100 上用英语语音测的，实际速度受语言、语速、硬件影响很大

---

## 效果展示

上面"跑起来"里那段转录就是真实效果——短句、清晰发音、无背景噪音的场景下，`tiny` 模型已经能做到逐字准确。更大模型、更复杂场景（口音、专业术语、嘈杂环境）下的表现，可以看下面"相关项目和评价"里几篇第三方测评的数据。

---

## 相关项目和评价

Whisper 火了之后衍生出好几个专门优化推理速度的重实现，也有不少人拿它跟商业语音识别服务做对比，好评差评都有，这里尽量如实汇总，包括几个绕不开的负面反馈。

### 更快的推理引擎

- [whisper.cpp](https://github.com/ggml-org/whisper.cpp)：纯 C/C++ 重写，零依赖，5 万+ star。用的还是同一套 Whisper 权重，只是换了推理引擎，对 Apple Silicon 支持特别好（ARM NEON、Metal、Core ML 都吃满），也能跑在 iPhone、树莓派、WebAssembly 上，纯 CPU 也没问题。
- [faster-whisper](https://github.com/SYSTRAN/faster-whisper)：用 CTranslate2 重新实现，官方 benchmark 显示同样的 large-v2 模型在 GPU 上比原版 openai/whisper 快 4 倍左右、显存占用更低，配合 int8 量化还能再提速；CPU 场景下也比原版快不少。它不需要额外装 ffmpeg，自带 PyAV 做音频解码，这点跟原版不一样。
- [WhisperX](https://github.com/m-bain/whisperX)：不是独立推理引擎，是在 faster-whisper 上叠了一层——用 wav2vec2 做强制对齐拿到词级时间戳，再接 pyannote-audio 做说话人分离，适合会议记录、播客剪辑这类需要"谁在什么时间说了什么"的场景。

### 跟商业语音识别服务比

多篇中文测评（雪球、少数派）认为 Whisper 的中文识别准确率不输甚至优于讯飞语音输入，而且不用联网也不用订阅；但像飞书妙记这类带云端专有名词热词库的产品，在同音字人名纠错上还是比 Whisper 强。跟 Google Speech-to-Text 比，多篇 2026 年的对比文章给出的数据是 Whisper 整体准确率约 91.94%，高于 Google 的 79%~83%；但强噪声环境下 Google 更稳，Whisper 的准确率下降更明显。

### 幻觉问题

Whisper 有个被反复讨论的毛病：遇到静音或者听不清的片段，有时候不会老实说"没听清"，而是自己"编"一段话出来，业内叫这个现象幻觉（hallucination）。GitHub 官方 [Discussion #1606](https://github.com/openai/whisper/discussions/1606) 里有个典型案例——用户拿一段完全无声的 1 小时音频反复跑 large-v3，每次都幻觉出同一句葡萄牙语字幕署名。社区分析认为根因是训练数据里大量视频字幕含"Subtitles by Amara.org"这类署名文本，且经常挨着无声片段出现，模型学到了错误关联。

2024 年 [Fortune](https://fortune.com/2024/10/26/openai-transcription-tool-whisper-hallucination-rate-ai-tools-hospitals-patients-doctors)、[TechCrunch](https://techcrunch.com/2024/10/26/openais-whisper-transcription-tool-has-hallucination-issues-researchers-say) 等媒体报道过一项研究，发现约 1% 的转录片段整段是幻觉内容，长静音更容易触发；医疗转录场景里个别研究者报告的幻觉率甚至更高，部分幻觉内容还涉及暴力、歧视性表述，在医院这类高风险场景里引发过关注。

缓解办法社区讨论得比较多：先用 VAD 过滤掉静音段，检查 `no_speech_prob`、`avg_logprob` 这两个输出字段过滤可疑片段，或者关掉 `condition_on_previous_text`（这个参数开着的话，模型遇到识别不出的片段容易直接复读上一句）。

### 中文识别准确率偏低

[少数派实测文章](https://sspai.com/post/79977)用同一段 10 分钟视频对比飞书妙记、剪映、Whisper 的中文转录效果，结论是 Whisper 中文错误率 14.7%，明显高于英文的 4.2%，中文场景至少要上 `medium` 模型才勉强够用；带云端热词库的飞书妙记、剪映在同音字纠错上更准。官方论文附录里也公开了逐语言的 WER/CER 数据，非英语语言之间的表现差异本来就比较大。

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

具体命令、模型规格可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/09/09/whisper-github-project
```

---

## 卸载

```bash
deactivate                    # 退出虚拟环境
rm -rf whisper-env            # 删掉虚拟环境
rm -rf ~/.cache/whisper       # 删掉缓存的模型权重
```
