---
slug: 2026/05/16/kokoro-tts-tutorial
title: "开源 TTS 工具 Kokoro"
date: 2026-05-16
image: https://cdn.mikeq95blog.uk/coverimage/kokoro-en-cn.png
tags:
  - gitHub
  - Ai-friendly
description: "用开源 TTS 工具 Kokoro 把英文文章转成高质量音频，免费、本地运行、效果出色，边走路边听自己写的内容。"
---

我想把自己写的英文文章转成音频，方便边走路边听。调研了一圈，免费、效果好、本地跑——这三个条件同时满足的，只有 [Kokoro](https://github.com/hexgrad/kokoro)。

{/* truncate */}

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

---

## Kokoro 是什么

Kokoro 是一个开源 [TTS](https://clearlove7-ai.vercel.app?word=TTS&postId=2026-05-16-kokoro-tts-tutorial)（文字转语音）模型，82M 参数，轻量但效果出奇地好。英文效果接近 ElevenLabs 商业级别，Apache 2.0 协议，免费商用。

它本质上就是个 [PyPI](https://pypi.org/project/kokoro/) 包，`pip install kokoro` 就能装，不需要 clone 仓库、也不需要 Docker——这也是这篇教程和网上大部分"部署教程"的区别：跑起来只要几行 Python。

---

## 声音怎么选

英文声音）：

| 声音 | 调用 ID | 级别 | 风格 |
|---|---|---|---|
| Heart | `af_heart` | A | 温暖女声，首选 |
| Bella | `af_bella` | A- | 高质量女声 |
| Michael | `am_michael` | C+ | 成熟男声 |
| Emma | `bf_emma` | B- | 英式女声 |


中文声音：

| 声音 | 调用 ID | 性别 |
|---|---|---|
| Xiaobei | `zf_xiaobei` | 女声，实测用的这个，效果不错 |
| Xiaoni | `zf_xiaoni` | 女声 |
| Xiaoxiao | `zf_xiaoxiao` | 女声 |
| Xiaoyi | `zf_xiaoyi` | 女声 |
| Yunjian | `zm_yunjian` | 男声 |
| Yunxi | `zm_yunxi` | 男声 |
| Yunxia | `zm_yunxia` | 男声 |
| Yunyang | `zm_yunyang` | 男声 |

- 识别ID： ID 前缀有讲究：`a` 开头是美式英语，`b` 开头是英式英语；`f` 是女声，`m` 是男声
- 声音质量： Kokoro 的声音按质量分 A~D 级，A 最高
- 切换音色：不管中文英文，都是改代码里 `pipeline(text, voice='af_heart')` 这一行的 `voice` 参数，换成上面表里想要的 ID，其他代码不用动。

---

## 安装环境

### 前置条件

- Python 3.10 ~ 3.12
- [espeak-ng](https://clearlove7-ai.vercel.app?word=espeak-ng&postId=2026-05-16-kokoro-tts-tutorial) 它负责处理模型没见过的单词、非英语的发音兜底

1. 用 [Homebrew](/blog/2026/05/28/homebrew-tutorials) 安装python3.12：

```bash
brew install python@3.12
```

2. 建一个专门的项目文件夹，虚拟环境、脚本、生成的音频都放这里面：

```bash
mkdir ~/kokoro-tts
cd ~/kokoro-tts
```

3. 再用虚拟环境隔离依赖：

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

---

## 跑起来

跑起来这个项目很容易，写代码，运行，得到结果。两种写 `say.py` 的方式，挑一个顺手的就行。

### 用 IDE 写

```bash
touch say.py
code say.py
```

在 VS Code 里粘贴下面代码，保存（⌘S）：

```python
# macOS 上 espeak-ng 自带库有已知 bug，不手动指路径会报错生成 0 字节空文件，必须放在 import kokoro 之前
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

运行：

```bash
python3 say.py
```

然后听一下：

```bash
afplay 0.wav
```

---

## 效果示例

> Google is renowned for its innovative and employee-centric work environment. The company's campuses, often called "Googleplexes," feature vibrant designs with open spaces, recreational facilities, free gourmet meals, and wellness centers. Employees enjoy flexible work hours, remote options, and a strong emphasis on collaboration through team projects and hackathons.
>
> A culture of creativity thrives with "20% time," encouraging personal passion projects that have led to major products like Gmail. Diversity, inclusion, and continuous learning are prioritized through training programs and supportive leadership. This unique blend of fun, freedom, and purpose fosters high productivity and job satisfaction, making Google a top destination for tech talent worldwide.


<audio controls>
  <source src="/assets/kokoro-demo-google.mp3" type="audio/mpeg" />
</audio>

---

## 其他语言

前面全程用的是美式英语（`lang_code='a'`），如果要转中文文章，改法就三处：

1. `lang_code` 改成 `'z'`（普通话）
2. 声音换成中文的，比如 `zf_xiaobei`（规则跟英文一样，`z` 开头是中文，`f`/`m` 分别是女声/男声）
3. 多装一个依赖：

```bash
pip install "misaki[zh]"
```

这会带上 `jieba`（中文分词）、`pypinyin`（拼音标注）等库，第一次跑会看到 `Building prefix dict from the default dictionary...` 这类 jieba 初始化输出，属于正常现象。

完整代码（同样要带上前面那三行 espeak 修复）：

```python
from misaki.espeak import EspeakWrapper
EspeakWrapper.set_library('/opt/homebrew/opt/espeak-ng/lib/libespeak-ng.dylib')
EspeakWrapper.set_data_path('/opt/homebrew/opt/espeak-ng/share/espeak-ng-data')

from kokoro import KPipeline
import soundfile as sf

pipeline = KPipeline(lang_code='z')  # 'z' = 普通话
text = "把这里换成你要转换的中文内容。"

generator = pipeline(text, voice='zf_xiaobei')
for i, (gs, ps, audio) in enumerate(generator):
    sf.write(f'zh_{i}.wav', audio, 24000)
```

> 日语同理，`lang_code='j'`，装 `pip install "misaki[ja]"`。

---

## 给 AI 编程助手的提示词

懒得自己一步步照着敲？把下面这段丢给 Claude Code、Codex 之类的 AI 编程助手，让它帮你配好环境、跑通一次示例。

```text
## 目标
配好 Kokoro TTS 的运行环境，跑通一次示例，能听到生成的音频文件就算成功。

## 步骤
1. 确认 Python 版本在 3.10~3.12 之间，不满足就装一个符合要求的版本
2. 建一个独立的虚拟环境并激活，避免污染系统 Python
3. 装好 espeak-ng，再装 kokoro、soundfile 这几个依赖
4. 写个脚本，用任意一个声音跑一段文本，生成音频并播放确认

## 核查结果
确认生成的音频文件确实存在、不是 0 字节的空文件，把结果（成功与否、文件路径、过程中遇到的问题）汇报给我。

具体命令、代码细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/05/16/kokoro-tts-tutorial
```

---

### 以后每次用之前

每次开新终端，记得先进项目目录、激活环境：

```bash
cd ~/kokoro-tts
source kokoro-env/bin/activate
```
---

## 卸载

```bash
deactivate                        # 退出虚拟环境
rm -rf ~/kokoro-tts               # 删掉整个项目目录（虚拟环境、脚本、生成的音频都在里面）
rm -rf ~/.cache/huggingface/hub   # 顺带清掉缓存的模型权重
```

---

