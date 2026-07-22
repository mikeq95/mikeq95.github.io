---
slug: 2026/05/16/kokoro-tts-tutorial
title: "开源 TTS 工具 Kokoro"
date: 2026-05-16
image: https://cdn.mikeq95blog.uk/coverimage/kokoro-en-cn.png
tags:
  - github
  - macos
  - Ai-friendly
description: "用开源 TTS 工具 Kokoro 把英文文章转成高质量音频，免费、本地运行、效果出色，边走路边听自己写的内容。"
---

我想把自己写的英文文章转成音频，方便边走路边听。调研了一圈，免费、效果好、本地跑——这三个条件同时满足的，只有 [Kokoro](https://github.com/hexgrad/kokoro)。

{/* truncate */}

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

---

## Kokoro 是什么

Kokoro 是一个开源 [TTS](https://clearlove7-ai.vercel.app?word=TTS&postId=2026-05-16-kokoro-tts-tutorial)（文字转语音）模型，82M 参数，轻量但效果出奇地好。英文效果接近 ElevenLabs 商业级别，Apache 2.0 协议，免费商用。

"轻量"不是营销话术：市面上效果能打的开源 TTS 模型普遍是几亿参数起步（比如 XTTS-v2、Bark 这类，体量是 Kokoro 的好几倍到十几倍），基本离不开 GPU 才能跑得动。Kokoro 只有 82M，纯 CPU 就能实时甚至超实时生成——前面实测过，M1 Pro 上纯 CPU 生成一段 150 词的英文只要 16 秒左右，比正常语速念出来还快，不用买显卡、不用排队等云端 API。

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

中文声音（配合 `lang_code='z'` 用）：

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

**怎么切换**：不管中文英文，都是改代码里 `pipeline(text, voice='af_heart')` 这一行的 `voice` 参数，换成上面表里想要的 ID，其他代码不用动。

---

## 安装环境

### 前置条件

- Python 3.10 ~ 3.12（官方包要求的范围，系统自带或新装的 Python 经常是 3.13+，kokoro 装不上）
- [espeak-ng](https://clearlove7-ai.vercel.app?word=espeak-ng&postId=2026-05-16-kokoro-tts-tutorial) 需要单独装（macOS 不自带），它负责处理模型没见过的单词、非英语的发音兜底

用 [Homebrew](/blog/2026/05/28/homebrew-tutorials) 装一个 3.12：

```bash
brew install python@3.12
```

> 注意命令是 `brew install python@3.12`，不是 `brew install python`——后者装的是 Homebrew 当前最新版本，很可能也是 3.13+，一样装不上 kokoro。

确认一下装的版本对不对：

```bash
python3.12 --version
```

> 这里要用 `python3.12`，不能用 `python3`——Homebrew 装带版本号的包不会占用这个命令，下面所有步骤统一用 `python3.12`。

建一个专门的项目文件夹，虚拟环境、脚本、生成的音频都放这里面，别直接堆在 home 目录根下：

```bash
mkdir ~/kokoro-tts
cd ~/kokoro-tts
```

再用虚拟环境隔离依赖，避免污染系统 Python：

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

这一步会拉一长串依赖：`torch`（约 110MB，最大的一个）、`transformers`、`spacy`、`numpy` 等等，刷屏刷很久是正常的。中间大概率会看到类似这样的输出：

```
INFO: pip is looking at multiple versions of spacy-curated-transformers to determine which version is compatible with other requirements. This could take a while.
```

这是 pip 在几个 `spacy` 相关包的版本之间来回试探、解决依赖冲突，不是卡住了，等它自己跑完就行，实测几分钟内能装完。

### 以后每次用之前

每次开新终端，记得先进项目目录、激活环境：

```bash
cd ~/kokoro-tts
source kokoro-env/bin/activate
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

### 命令行

嫌开 IDE 麻烦，也可以用 heredoc 直接在终端里写文件：

```bash
cat > say.py << 'EOF'
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
EOF
python3 say.py
```

> **文本内容长、带空行的时候（比如下面「效果示例」那种多段落文本）不建议用这种方式**：终端粘贴大段文本偶尔会把行序打乱，导致文件内容错位、语法都不对。粘贴完先 `cat say.py` 核对一遍再运行；内容一多，还是老实用 IDE 写更稳。

跑完 `~/kokoro-tts` 里会多一个 `0.wav`，用这个听：

```bash
afplay 0.wav
```

> 代码里 `sf.write(f'{i}.wav', audio, 24000)` 写的是相对路径，音频会生成在你运行 `python3 say.py` 时所在的目录——只要一直在 `~/kokoro-tts` 里操作（前面「安装环境」那步已经 `cd` 进来了），就会一直生成在这个项目文件夹下，不会跑到别处。

---

## 效果示例

把代码里 `text = "..."` 那一行换成下面这段。**注意这段有两个段落、中间隔了个空行，得改成三引号 `text = """..."""`**，还用原来的单行双引号会直接语法报错：

> Google is renowned for its innovative and employee-centric work environment. The company's campuses, often called "Googleplexes," feature vibrant designs with open spaces, recreational facilities, free gourmet meals, and wellness centers. Employees enjoy flexible work hours, remote options, and a strong emphasis on collaboration through team projects and hackathons.
>
> A culture of creativity thrives with "20% time," encouraging personal passion projects that have led to major products like Gmail. Diversity, inclusion, and continuous learning are prioritized through training programs and supportive leadership. This unique blend of fun, freedom, and purpose fosters high productivity and job satisfaction, making Google a top destination for tech talent worldwide.

用 `af_heart` 声音生成的效果（约 150 词，M1 Pro 上耗时约 16 秒，按段落拆成了 `0.wav`、`1.wav` 两个文件）：

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

## 卸载

```bash
deactivate                        # 退出虚拟环境
rm -rf ~/kokoro-tts               # 删掉整个项目目录（虚拟环境、脚本、生成的音频都在里面）
rm -rf ~/.cache/huggingface/hub   # 顺带清掉缓存的模型权重
```

---

