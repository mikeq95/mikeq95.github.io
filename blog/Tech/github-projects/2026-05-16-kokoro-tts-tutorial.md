---
slug: 2026/05/16/kokoro-tts-tutorial
title: "开源 TTS 工具 Kokoro"
date: 2026-05-16
image: https://cdn.mikeq95blog.uk/coverimage/kokoro-en-cn.png
tags:
  - github
  - macos
description: "用开源 TTS 工具 Kokoro 把英文文章转成高质量音频，免费、本地运行、效果出色，边走路边听自己写的内容。"
---

我想把自己写的英文文章转成音频，方便边走路边听。调研了一圈，免费、效果好、本地跑——这三个条件同时满足的，只有 [Kokoro](https://github.com/hexgrad/kokoro)。

{/* truncate */}

---

## Kokoro 是什么

Kokoro 是一个开源 [TTS](https://clearlove7-ai.vercel.app?word=TTS&postId=2026-05-16-kokoro-tts-tutorial)（文字转语音）模型，82M 参数，轻量但效果出奇地好。英文效果接近 ElevenLabs 商业级别，Apache 2.0 协议，免费商用。

它本质上就是个 [PyPI](https://pypi.org/project/kokoro/) 包，`pip install kokoro` 就能装，不需要 clone 仓库、也不需要 Docker——这也是这篇教程和网上大部分"部署教程"的区别：跑起来只要几行 Python。

---

## 声音怎么选

Kokoro 的声音按质量分 A~D 级，A 最高。英文推荐直接从这几个里挑（调用时要用后面这个 ID）：

| 声音 | 调用 ID | 级别 | 风格 |
|---|---|---|---|
| Heart | `af_heart` | A | 温暖女声，首选 |
| Bella | `af_bella` | A- | 高质量女声 |
| Michael | `am_michael` | C+ | 成熟男声 |
| Emma | `bf_emma` | B- | 英式女声 |

> ID 前缀有讲究：`a` 开头是美式英语，`b` 开头是英式英语；`f` 是女声，`m` 是男声。每个声音第一次用会从 Hugging Face 自动下载对应的模型文件，之后自动缓存，不用重复下载。

---

## 安装环境

### 前置条件

- Python 3.10 ~ 3.12（官方包要求的范围）
- [espeak-ng](https://clearlove7-ai.vercel.app?word=espeak-ng&postId=2026-05-16-kokoro-tts-tutorial) 需要单独装（macOS 不自带），它负责处理模型没见过的单词、非英语的发音兜底

> **先查一下自己的 `python3` 是什么版本**：`python3 --version`。如果是 3.13 以上（比如系统自带或者新装的 3.14），`pip install kokoro` 会直接报找不到匹配版本——它现在最高只支持到 3.12。装个 3.12：`brew install python@3.12`，下面统一用 `python3.12` 而不是 `python3`。

用虚拟环境隔离依赖，避免污染系统 Python：

```bash
python3.12 -m venv kokoro-env
source kokoro-env/bin/activate
```

激活后命令行前面会出现 `(kokoro-env)`，说明进入了虚拟环境。

### 安装依赖

```bash
brew install espeak-ng
pip install "kokoro>=0.9.4" soundfile
```

> **国内网络下载 Hugging Face 权重很慢的话**，装之前先设置镜像：`export HF_ENDPOINT=https://hf-mirror.com`，再运行下面的生成命令。

### 以后每次用之前

每次开新终端，记得先激活环境：

```bash
source kokoro-env/bin/activate
```

---

## macOS 上有个坑，先处理掉

按官方 README 装完，直接跑 `python3 -m kokoro --text "..." -o hello.wav` 或者最简单的 Python 脚本，大概率会报这样一个错，`hello.wav` 生成出来是个 0 字节的空文件：

```
Error processing file '.../espeakng-loader/espeak-ng/_dynamic/share/espeak-ng-data/phontab': No such file or directory
```

原因是 Kokoro 依赖的 `espeakng-loader` 这个包，自带的 espeak-ng 动态库在 macOS 上有已知 bug，指向的数据路径是它自己打包时（GitHub CI 机器上）的路径，根本不存在。而且这个 bug 没法靠命令行参数绕过——`python3 -m kokoro` 这个入口不支持传路径，也就没法用，只能用脚本。

解决办法是在代码里显式换成前面 `brew install espeak-ng` 装的那一份，**必须在 `import kokoro` 之前**：

```python
from misaki.espeak import EspeakWrapper
EspeakWrapper.set_library('/opt/homebrew/opt/espeak-ng/lib/libespeak-ng.dylib')
EspeakWrapper.set_data_path('/opt/homebrew/opt/espeak-ng/share/espeak-ng-data')
```

> Intel Mac 的 Homebrew 装在 `/usr/local`，路径要改成 `/usr/local/opt/espeak-ng/...`。用 `brew --prefix espeak-ng` 能查到你机器上的实际路径。

下面所有脚本都要带上这三行，我已经实测过，加上就能正常生成。

---

## 跑起来

用 Python 脚本，把上面的 espeak 修复放在最前面：

```python
from misaki.espeak import EspeakWrapper
EspeakWrapper.set_library('/opt/homebrew/opt/espeak-ng/lib/libespeak-ng.dylib')
EspeakWrapper.set_data_path('/opt/homebrew/opt/espeak-ng/share/espeak-ng-data')

from kokoro import KPipeline
import soundfile as sf

pipeline = KPipeline(lang_code='a')  # 'a' = 美式英语
text = "Kokoro is an open-weight TTS model with 82 million parameters."

generator = pipeline(text, voice='af_heart')
for i, (gs, ps, audio) in enumerate(generator):
    sf.write(f'{i}.wav', audio, 24000)
```

存成 `say.py`，运行 `python3 say.py`，当前目录会多一个 `0.wav`，用 `afplay 0.wav` 就能听。第一次跑会顺带自动下载一个 spaCy 的英文模型（十几 MB，从 GitHub 下），网络不好的话这一步会等得久一点，属于正常现象。

> `lang_code` 要和 `voice` 的前缀对上：用 `af_*`/`am_*` 声音就填 `'a'`，用 `bf_*`/`bm_*` 声音就填 `'b'`，对不上会有 warning，声音也会变得很奇怪。

### Apple Silicon 加速

M1/M2/M3/M4 芯片可以显式开 GPU 加速：

```bash
PYTORCH_ENABLE_MPS_FALLBACK=1 python3 your_script.py
```

---

## 效果示例

输入这段文字：

> Google is renowned for its innovative and employee-centric work environment. The company's campuses, often called "Googleplexes," feature vibrant designs with open spaces, recreational facilities, free gourmet meals, and wellness centers. Employees enjoy flexible work hours, remote options, and a strong emphasis on collaboration through team projects and hackathons.
>
> A culture of creativity thrives with "20% time," encouraging personal passion projects that have led to major products like Gmail. Diversity, inclusion, and continuous learning are prioritized through training programs and supportive leadership. This unique blend of fun, freedom, and purpose fosters high productivity and job satisfaction, making Google a top destination for tech talent worldwide.

用 `af_heart` 声音生成的效果（约 150 词，M1 Pro 上 CPU 生成耗时约 30 秒，开了 MPS 加速会更快）：

<audio controls>
  <source src="/assets/kokoro-demo-google.mp3" type="audio/mpeg" />
</audio>

---

## 处理 Markdown 文件

Kokoro 只认纯文本，直接把 `.md` 文件喂进去的话，`##`、`**bold**` 这些语法标记也会被读出来，很奇怪。

先用 `pandoc` 转成纯文本：

```bash
brew install pandoc
pandoc article.md -t plain -o article.txt
```

再用脚本读取文本生成音频（同样要带上前面那三行 espeak 修复）：

```python
from misaki.espeak import EspeakWrapper
EspeakWrapper.set_library('/opt/homebrew/opt/espeak-ng/lib/libespeak-ng.dylib')
EspeakWrapper.set_data_path('/opt/homebrew/opt/espeak-ng/share/espeak-ng-data')

from kokoro import KPipeline
import soundfile as sf

with open('article.txt') as f:
    text = f.read()

pipeline = KPipeline(lang_code='a')
generator = pipeline(text, voice='af_heart', split_pattern=r'\n+')
for i, (gs, ps, audio) in enumerate(generator):
    sf.write(f'article_{i}.wav', audio, 24000)
```

文章长的话会按段落拆成 `article_0.wav`、`article_1.wav` ... 多个文件，不是一整个大文件。

---

## 常见问题

- **`pip install kokoro` 报找不到匹配版本**：Python 版本太新（3.13+），换成前面装的 `python3.12` 重新建虚拟环境。
- **生成出来是 0 字节的 wav，报 `phontab: No such file or directory`**：见上面「macOS 上有个坑」那一节，espeak 路径没手动指过去。
- **第一次生成卡很久 / 下载超时**：模型权重在下载，国内网络设置 `export HF_ENDPOINT=https://hf-mirror.com` 再试。
- **想用中文/日文**：Kokoro 支持普通话（`lang_code='z'`）和日语（`lang_code='j'`），需要额外装 `pip install misaki[zh]` 或 `misaki[ja]`。

---

## 卸载

```bash
deactivate                        # 退出虚拟环境
rm -rf kokoro-env                 # 删掉整个虚拟环境
rm -rf ~/.cache/huggingface/hub   # 顺带清掉缓存的模型权重
```

---

