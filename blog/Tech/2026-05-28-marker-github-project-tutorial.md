---
slug: 2026/05/28/marker-github-project-tutorial
title: Marker 使用教程
date: 2026-05-28
image: https://cdn.mikeq95blog.uk/coverimage/maker-coverimage.png
tags:
  - github
  - macos
description: "Marker 是一款开源工具，可将 PDF、Word、PPT 快速转换为 Markdown，记录本地运行 Marker 的完整流程。"
---

[Marker](https://github.com/datalab-to/marker) 是一个开源工具，可以把 PDF、Word、PPT 等文件转成 Markdown 格式，速度快，识别准确率也不错。这篇文章记录一下怎么把它跑起来。

{/* truncate */}

---
### 前言：
我个人很喜欢浏览[instructables](https://www.instructables.com)这个网站，网站很贴心的在右上角给了你”将文章导出为PDF”的选项，但是没有”导出为markdown”的选项。我很希望格式是md，因为在AI更喜欢读md而不是PDF的文件。我在网上搜索，最终找到这个github项目。
## 部署环境

### 前置条件

- Python 3.10 或以上
- 推荐用 [Conda](https://clearlove7-ai.vercel.app?word=Conda&postId=2026-05-28-marker-github-project-tutorial) 管理环境（下面会说为什么）

如果你用的是 Mac M1/M2/M3，不需要额外配置，PyTorch 已经原生支持。

---

### 安装 Conda

推荐装 Miniforge，体积小，对 Apple Silicon 支持好。

```bash
# macOS Apple Silicon
curl -L -O https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-MacOSX-arm64.sh
bash Miniforge3-MacOSX-arm64.sh
```

装完之后运行这条命令，让终端认识 conda：

```bash
~/miniforge3/bin/conda init zsh
```

然后关掉终端，重新打开。你会看到命令行前面多了一个 `(base)`，说明 conda 好了。

---

### 创建虚拟环境

简单理解：[虚拟环境](https://clearlove7-ai.vercel.app?word=虚拟环境&postId=2026-05-28-marker-github-project-tutorial)就是给这个项目单独开一个"房间"，里面装的东西不会影响你电脑上别的项目。

```bash
conda create -n marker python=3.11 -y
conda activate marker
```

进入环境后，命令行前面会从 `(base)` 变成 `(marker)`。

---

### 安装 Marker

```bash
pip install marker-pdf
```

如果还需要转 Word、PPT、EPUB 这些格式：

```bash
pip install marker-pdf[full]
```

---

### 验证一下

```bash
marker_single --help
```

等个十几秒，输出一堆参数说明就是成功了。

---

### 以后每次用之前

每次打开终端，记得先进环境：

```bash
conda activate marker
```

---

## 怎么用

基本格式就一行：

```bash
marker_single 你的文件路径 --output_dir 输出目录
```

几个常用参数：

- `--output_dir`：指定输出到哪个文件夹
- `--output_format`：输出格式，可以选 markdown、json、html
- `--page_range`：只转某几页，比如 `"0,5-10"`（页码从 0 开始）
- `--force_ocr`：强制 [OCR](https://clearlove7-ai.vercel.app?word=OCR&postId=2026-05-28-marker-github-project-tutorial)，PDF 里文字是图片时用这个
- `--langs zh`：告诉它文档是中文，识别更准
- `--use_llm`：用大模型辅助，精度更高，需要配 API Key

转换完成后，输出目录里会有一个 `.md` 文件和提取出来的图片，用 Typora 或 Obsidian 打开就能正常显示。

---

## 实际使用示例

### 转一篇论文

```bash
marker_single ~/Downloads/paper.pdf \
  --output_dir ~/Documents/notes
```

第一次跑会下载 AI 模型，大概 1GB 左右，耐心等一下。跑完之后数学公式会变成 [LaTeX](https://clearlove7-ai.vercel.app?word=LaTeX&postId=2026-05-28-marker-github-project-tutorial)，表格和标题格式都会保留，效果还不错。

---

## 用 AI 工具帮你自动部署

如果觉得上面的步骤麻烦，可以把下面这段提示词丢给 Claude Code、Cursor 这类 AI 工具，让它帮你自动把环境跑通。

**中文版：**

```
你是一个专业的 Python 环境配置工程师。请帮我在这台电脑上完整部署 marker-pdf 的运行环境。

我的环境：macOS Apple Silicon（M1 Pro），Shell 为 zsh，Conda 安装在 ~/miniforge3。

请依次完成以下步骤，每步执行完检查结果，遇到报错立即分析并修复：

1. 检查 conda 是否可用（conda --version），不可用则运行 ~/miniforge3/bin/conda init zsh 并提示我重开终端
2. 创建并激活虚拟环境：conda create -n marker python=3.11 -y && conda activate marker
3. 安装 marker：pip install marker-pdf
4. 验证 PyTorch：python -c "import torch; print(torch.__version__)"，若报 libtorch_cpu.dylib 错误，立即重装：pip uninstall torch torchvision torchaudio -y && pip install torch torchvision torchaudio
5. 验证 marker：运行 marker_single --help，等待约 20 秒，输出参数列表即为成功

每步执行前先告诉我你要做什么，不要修改系统级配置。完成后输出已安装的 Python、PyTorch、marker-pdf 版本号。
```

**English version:**

```
You are a professional Python environment setup engineer. Please help me fully deploy the marker-pdf runtime environment on this machine.

My setup: macOS Apple Silicon (M1 Pro), shell is zsh, Conda is installed at ~/miniforge3.

Complete the following steps in order. After each step, verify the result and immediately diagnose and fix any errors:

1. Check if conda is available (conda --version). If not, run ~/miniforge3/bin/conda init zsh and ask me to reopen the terminal.
2. Create and activate a virtual environment: conda create -n marker python=3.11 -y && conda activate marker
3. Install marker: pip install marker-pdf
4. Verify PyTorch: python -c "import torch; print(torch.__version__)". If you see a libtorch_cpu.dylib error, reinstall immediately: pip uninstall torch torchvision torchaudio -y && pip install torch torchvision torchaudio
5. Verify marker: run marker_single --help, wait about 20 seconds — a list of parameters means success.

Before each step, tell me what you are about to do. Do not modify any system-level configuration. When finished, print the installed versions of Python, PyTorch, and marker-pdf.
```

---

## 卸载

只卸载 marker 包，保留环境：

```bash
conda activate marker
pip uninstall marker-pdf
```

直接删掉整个环境（更彻底）：

```bash
conda deactivate
conda env remove -n marker
```

---

## 总结

本地跑，不用 API Key，格式保留得还不错。有大量 PDF 要整理的话挺好用的。

---

