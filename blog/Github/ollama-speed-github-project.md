---
slug: 2026/09/09/ollama-speed-benchmark
title: Ollama 到底快不快？本地实测 tokens/s 全记录
date: 2026-09-09
tags: [github, open-source, AI, llm, Ai-friendly]
description: 不是泛泛介绍 Ollama 是什么，而是专门测它的速度——在 Apple M1 Pro 上用 llama3.2:1b、qwen2.5:0.5b 跑出真实的 tokens/s 数据，同时梳理社区里"Ollama 比原生 llama.cpp 慢"的争议、和 vLLM/MLX 的对比，以及量化、上下文长度、GPU 开关这些影响速度的关键因素。
---

{/* truncate */}

## 介绍

[Ollama](https://github.com/ollama/ollama) 是一个本地跑大语言模型的工具，底层引擎是 [llama.cpp](https://github.com/ggml-org/llama.cpp)（Georgi Gerganov 创建），GitHub 上有 18 万多个 star（180,493）。它把模型下载、量化格式管理、推理这几件事包成一条命令：`ollama run <model>`，不用自己折腾 llama.cpp 的编译参数和命令行标志。

正因为 Ollama 在 llama.cpp 上包了一层，"包这一层到底有没有性能代价"就成了一个长期被讨论的话题。有人说几乎没差，有人说慢了好几倍，本文后面的实测和相关讨论会把这个问题摊开看。这次测试用的是通过 Homebrew 装的 0.33.3 版本，运行在一台 Apple M1 Pro 的 Mac 上。

---

## 安装环境

Apple Silicon 上最省事的方式是 Homebrew：

```bash
brew install ollama
```

装的时候能看到一个细节：Homebrew 的 ollama 公式在 Apple Silicon 上会顺带装 `mlx` 和 `mlx-c` 这两个依赖——对应下文会提到的 MLX 后端。不用 Homebrew 的话，官方也提供一键安装脚本（`curl -fsSL https://ollama.com/install.sh | sh`）和 Windows/Linux 的独立安装包，装法在 [GitHub Releases](https://github.com/ollama/ollama/releases) 页面都能找到。

装完手动起服务（用 Homebrew 装的话也可以用 `brew services start ollama` 让它开机自启）：

```bash
ollama serve
```

验证一下版本，确认装成功：

```bash
ollama --version
# ollama version is 0.33.3
```

这次为了控制测试时长和磁盘占用，挑了两个体积小的模型：

```bash
ollama pull llama3.2:1b    # 1.3 GB
ollama pull qwen2.5:0.5b   # 397 MB
```

拉取速度完全取决于网络带宽，这次两个模型都卡在 1.6 MB/s 左右，`llama3.2:1b` 花了将近 9 分半——这一步和 Ollama 本身的推理速度没关系，纯粹是下载环节，不算进后面的跑分里。

---

## 运行

`ollama run` 加一个 `--verbose` 标志，推理结束后会打印真实的性能数字，不用自己写脚本计时：

```bash
ollama run llama3.2:1b --verbose "用一句话介绍你自己"
```

输出末尾会带这几行，这篇文章后面所有的表格数据都来自这里：

```text
total duration:       1.523093792s
load duration:        1.090135s
prompt eval count:    31 token(s)
prompt eval duration: 140.523ms
prompt eval rate:     220.60 tokens/s
eval count:           31 token(s)
eval duration:        290.211ms
eval rate:            106.82 tokens/s
```

几个字段的含义：`prompt eval rate` 是模型读入你的提示词的速度（prefill），`eval rate` 是模型逐个吐出新 token 的速度（decode），日常说的"生成速度"指的就是后者。`load duration` 是把模型权重加载进内存/显存的耗时，第一次跑一个模型时这个数字会比较大，之后模型留在内存里，这部分耗时几乎归零。

想拿到更细的原始数据（比如控制生成的 token 数量做对比），也可以直接打 API：

```bash
curl -s http://localhost:11434/api/generate -d '{
  "model": "llama3.2:1b",
  "prompt": "Write a short paragraph about the weather.",
  "stream": false,
  "options": {"num_predict": 100}
}'
```

返回的 JSON 里带 `eval_count`、`eval_duration` 这些纳秒级字段，自己除一下就是 tokens/s，下面几组对比数据都是这么算出来的。

---

## 效果展示

### 生成长度会不会拖慢速度

先看同一个模型跑短生成和长生成，`eval rate` 是不是稳定：

| 模型 | 场景 | 生成 token 数 | eval rate (tokens/s) |
| --- | --- | --- | --- |
| llama3.2:1b | 短生成（一句话） | 31 | 106.82 |
| llama3.2:1b | 长生成（约 300 字文章） | 343 | 105.00 |
| qwen2.5:0.5b | 短生成（一句话） | 40 | 159.88 |
| qwen2.5:0.5b | 长生成（约 300 字文章） | 375 | 162.54 |

生成越长，decode 速度并没有明显下降——一旦模型进入生成状态，每个 token 的吐出速度基本是恒定的，跟总共要生成多少个 token 关系不大。这点在两个模型上都成立。

### 冷启动和热启动差多少

第一次跑一个模型要把权重从磁盘读进内存，之后模型常驻内存，`load duration` 会有数量级的差异：

| 场景 | total duration | load duration |
| --- | --- | --- |
| qwen2.5:0.5b 第一次运行（冷） | 19.49s | 18.70s |
| qwen2.5:0.5b 第二次运行（热） | 273ms | 0.67ms |

第一次跑一个新模型，几乎所有耗时都花在加载上，真正生成内容只占零头；模型热了之后，一次短对话的总耗时可以压到 300 毫秒以内。

### GPU（Metal）到底比 CPU 快多少

Apple Silicon 上默认会用 Metal 加速，通过 API 传 `"num_gpu": 0` 可以强制走纯 CPU，两边用同一个英文提示词、固定 `num_predict: 100`，各跑两次：

| 模型 | 模式 | eval rate 跑一 | eval rate 跑二 |
| --- | --- | --- | --- |
| llama3.2:1b (1.3 GB) | Metal（默认） | 75.69 tokens/s | 76.13 tokens/s |
| llama3.2:1b (1.3 GB) | 纯 CPU | 63.79 tokens/s | 64.98 tokens/s |
| qwen2.5:0.5b (397 MB) | Metal（默认） | 161.23 tokens/s | 161.40 tokens/s |
| qwen2.5:0.5b (397 MB) | 纯 CPU | 161.76 tokens/s | 170.05 tokens/s |

`llama3.2:1b` 上 Metal 比纯 CPU 快 15%~18%；但 `qwen2.5:0.5b` 这个体积更小的模型上，GPU 和 CPU 基本没差别，其中一次纯 CPU 跑分甚至还略高一点。模型小到一定程度，瓶颈变成内存带宽和调度开销，而不是算力，GPU 加速的收益就体现不出来了——这和调研阶段查到的"MLX 在小模型上领先明显、大模型上和 llama.cpp 趋于收敛"是同一个道理，只是这次是 Metal 和 CPU 两条路径在同一台机器上对比。

> 有意思的是，同样是 `llama3.2:1b`，用 `ollama run --verbose` 跑中文短句测出来 eval rate 是 106.82 tokens/s，但用 API 固定 `num_predict` 跑英文提示词只有 75 左右，两次测试相隔不到十分钟，同一台机器同一个模型。这可能是分词效率、系统当时的负载状态共同造成的，没有深挖到底是哪个变量起主导作用——想说明的是单次跑分不能当绝对真理，自己动手测的时候最好在安静环境下多跑几次取平均，而不是信一次数字。

### 并发请求能不能提速

开三个请求，对比"一个个排队跑完"和"三个同时发出去"两种方式的总耗时：

| 方式 | 3 个请求总耗时 |
| --- | --- |
| 串行（依次等上一个跑完再发下一个） | 3.54s |
| 并发（三个同时发出） | 3.32s |

默认配置下，并发几乎没有带来提速——三个请求几乎是排队处理的，跟后面"相关"里提到的 vLLM 靠 continuous batching 吃到并发红利是完全不同的路子。

---

## 相关项目和评价

Ollama 和 llama.cpp 之间的速度差距，是个真实存在、结论高度取决于硬件的话题，不是"哪边粉丝多就信哪边"能说清的：

- GitHub 上有一条 [Issue #14579](https://github.com/ollama/ollama/issues/14579)，用户在 Windows 11 + RTX 3090 Ti 的机器上跑同一个 Q4 量化的 Qwen3.5-35B-A3B，Ollama 只有 15~20 tokens/s，llama.cpp 默认设置能到 100 tokens/s，差了 5 倍左右，提交到写这篇文章时还没有维护者给出明确解释。
- [InventiveHQ 的实测](https://inventivehq.com/blog/ollama-vs-llama-cpp-vs-lm-studio-benchmark)在 RTX 5090 上跑同一个 GGUF 文件，llama.cpp 是 249 tokens/s，Ollama 只有 108，差了一倍多；多并发场景下 llama.cpp 聚合吞吐 455 tokens/s，Ollama 是 200。
- 但换到 Apple 芯片，差距明显收窄：[ModelPiper 的 Mac 跑分](https://modelpiper.com/blog/ollama-vs-llamacpp-benchmark-mac)显示 M2 Max 上 Ollama 0.23.4 和上游 llama-server 用同一个 Q4_K_M 文件，差距只有 2%~7%。一种普遍的猜测是 llama.cpp 可以针对具体 GPU 型号从源码编译，Ollama 分发的是预编译通用二进制，牺牲了一部分针对性优化换来开箱即用。

跟其他本地/自托管推理方案比，Ollama 的定位更清楚——单用户场景够快，大并发场景不是它的强项：

- [vLLM](https://github.com/vllm-project/vllm) 面向的是多用户在线服务场景。单用户（batch size 1）下 Ollama 和 vLLM 差距很小，通常在个位数到 20% 以内；但到 8~10 个并发请求，多篇 2026 年的第三方测试都显示 vLLM 吞吐量是 Ollama 的 2~4 倍，Ki-Mittelstand 一份跑分里 10 并发下 vLLM 是 485 tokens/s，Ollama 只有 148。这背后是 vLLM 的 continuous batching 调度机制，跟本文实测里"Ollama 并发几乎不提速"是同一个现象。
- [LM Studio](https://lmstudio.ai) 底层同样基于 llama.cpp，单用户场景下速度和 Ollama 接近，差异更多体现在界面和模型管理体验上，不是推理引擎本身的差距。
- 在 Apple Silicon 上，Ollama 官方在 2026 年 3 月 30 日[发布了 MLX 后端预览版](https://ollama.com/blog/mlx)，替代此前的 Metal 后端。官方给出的数字是在 M5 Max 上跑 Qwen3.5-35B-A3B（NVFP4 量化），prefill 从 1154 tokens/s 提升到 1810，decode 从 58 提升到 112，涨幅分别是 57% 和 93%。目前这个后端还只支持 Qwen3.5 架构、要求统一内存大于 32GB，本文用的两个小模型没有触发 MLX 路径，跑的是常规 Metal 后端。

社区之外，Ollama 自己在近几个版本也在往速度上使劲：早期版本需要手动设置 `OLLAMA_FLASH_ATTENTION=1` 才能开启 flash attention，新版本在受支持的硬件上已经默认开启；开启之后官方文档给出的收益是上下文长度 16384 时苹果芯片提速 20%~35%、N 卡提速 10%~25%，上下文 32768 时最多快 30%~40%，同时 KV cache 显存占用减少 40%。

---

## 给 AI 编程助手的提示词

不想自己一步步敲命令、装模型、跑基准测试？把下面这段丢给 Claude Code 或 Codex，让它帮你在本机装好 Ollama，跑一个小模型验证生成速度。

```text
## 目标
在本机装好 Ollama（github.com/ollama/ollama），拉取一个体积较小的模型（比如 llama3.2:1b 或 qwen2.5:0.5b），用 --verbose 跑一次推理，拿到真实的 eval rate（tokens/s）数字，确认本机的生成速度。

## 步骤
macOS 优先用 brew install ollama；其他平台用官方一键脚本 curl -fsSL https://ollama.com/install.sh | sh，或去 GitHub Releases 拿对应平台的安装包。装完跑 ollama serve 起服务（或用系统服务方式常驻）。
拉取一个小模型，优先选 1B 参数级别以内的（llama3.2:1b、qwen2.5:0.5b 这类），避免拉取耗时过长或占用过多磁盘。
用 ollama run <model> --verbose "随便一句话" 跑一次，输出末尾会带 total duration、load duration、prompt eval rate、eval rate 这几行，这就是真实的速度数据。
如果想对比生成长度、GPU/CPU 差异，改用 curl 打 POST http://localhost:11434/api/generate，通过 options 里的 num_predict 控制生成长度、num_gpu 设为 0 强制走纯 CPU，返回 JSON 里的 eval_count 除以 eval_duration（纳秒转秒）就是 tokens/s。

## 核查结果
确认拿到了真实的 eval rate 数字（不是编造的），跑至少两次同一个 prompt 看数字是否稳定，把最终的 tokens/s 数字和机器配置（芯片型号、是否用了 GPU 加速）汇报给用户。

具体命令、参数细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/09/09/ollama-speed-benchmark
```

---

## 卸载和下次运行

Homebrew 装的直接卸载：

```bash
brew uninstall ollama
```

模型文件不会跟着卸载自动清掉，占地方的话单独删：

```bash
ollama rm llama3.2:1b
ollama rm qwen2.5:0.5b
```

下次想再跑，不用重新走一遍安装流程：

```bash
ollama serve
ollama run llama3.2:1b
```

---

## 总结

这次在一台 Apple M1 Pro 上实测下来，两个小模型的 decode 速度（eval rate）在 105~163 tokens/s 之间，且不随生成长度增加而明显下降；Metal 加速对 1.3GB 的 `llama3.2:1b` 有 15%~18% 的提升，但对 397MB 的 `qwen2.5:0.5b` 几乎没有影响；默认配置下并发请求也没有带来明显提速。社区里"Ollama 比 llama.cpp 慢"的说法是真实存在的争议，但差距高度依赖硬件——N 卡上可能差出几倍，苹果芯片上通常只有个位数到十几个百分点。真要知道自己机器上快不快，最靠谱的办法还是像本文这样自己动手跑一遍 `ollama run --verbose`，而不是照搬别人机器上的数字。
