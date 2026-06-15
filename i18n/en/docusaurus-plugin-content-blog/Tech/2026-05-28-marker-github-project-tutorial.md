---
slug: 2026/05/28/marker-github-project-tutorial
title: Marker Tutorial
date: 2026-05-28
image: https://cdn.mikeq95blog.uk/coverimage/maker-coverimage.png
tags:
  - github
  - macos
---

[Marker](https://github.com/datalab-to/marker) is an open-source tool that converts PDF, Word, PPT, and other file formats into Markdown. It's fast, and accuracy is pretty solid. This post documents how to get it running.

{/* truncate */}

---

### Preface:

I personally enjoy browsing [instructables](https://www.instructables.com) — the site helpfully provides an "Export article as PDF" button in the top right, but no "Export as Markdown" option. I really wanted Markdown format, since AI tools prefer reading `.md` over PDF. After searching online, I found this GitHub project.

## Setting Up the Environment

### Prerequisites

- Python 3.10 or higher
- Conda is recommended for environment management (explained below)

If you're on a Mac M1/M2/M3, no extra configuration is needed — PyTorch natively supports Apple Silicon.

---

### Install Conda

Miniforge is recommended: lightweight and well-supported on Apple Silicon.

```bash
# macOS Apple Silicon
curl -L -O https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-MacOSX-arm64.sh
bash Miniforge3-MacOSX-arm64.sh
```

After installation, run this command so Terminal recognizes conda:

```bash
~/miniforge3/bin/conda init zsh
```

Then close and reopen Terminal. You'll see `(base)` at the start of your prompt — conda is ready.

---

### Create a Virtual Environment

Think of a virtual environment as a separate "room" for this project — packages installed here won't affect anything else on your system.

```bash
conda create -n marker python=3.11 -y
conda activate marker
```

Once activated, your prompt changes from `(base)` to `(marker)`.

---

### Install Marker

```bash
pip install marker-pdf
```

If you also need to convert Word, PPT, or EPUB files:

```bash
pip install marker-pdf[full]
```

---

### Verify Installation

```bash
marker_single --help
```

Wait about 10–15 seconds. If a list of parameters is printed, you're good to go.

---

### Activating the Environment Each Session

Every time you open a new Terminal, remember to activate the environment first:

```bash
conda activate marker
```

---

## How to Use

The basic format is a single line:

```bash
marker_single /path/to/your/file --output_dir /output/directory
```

Useful options:

- `--output_dir`: specify the output folder
- `--output_format`: output format — `markdown`, `json`, or `html`
- `--page_range`: convert specific pages, e.g. `"0,5-10"` (pages are 0-indexed)
- `--force_ocr`: force OCR — use this when text in the PDF is actually an image
- `--langs zh`: tells Marker the document is in Chinese for better accuracy
- `--use_llm`: use an LLM for assistance — higher accuracy, requires an API key

After conversion, the output folder will contain a `.md` file and extracted images. Open with Typora or Obsidian for proper rendering.

---

## Practical Examples

### Convert a Research Paper

```bash
marker_single ~/Downloads/paper.pdf \
  --output_dir ~/Documents/notes
```

The first run downloads the AI models (~1 GB) — be patient. Afterwards, math formulas are converted to LaTeX, tables and headings are preserved. Results are quite good.

---

---

## Let AI Tools Handle the Deployment

If the steps above feel tedious, paste this prompt into Claude Code, Cursor, or a similar AI tool and let it set up the environment automatically.

```
You are a professional Python environment configuration engineer. Please fully deploy the marker-pdf runtime environment on this machine.

My setup: macOS Apple Silicon (M1 Pro), shell is zsh, Conda is installed at ~/miniforge3.

Please complete the following steps in order, check the result after each step, and immediately diagnose and fix any errors:

1. Check if conda is available (conda --version). If not, run ~/miniforge3/bin/conda init zsh and remind me to reopen Terminal.
2. Create and activate a virtual environment: conda create -n marker python=3.11 -y && conda activate marker
3. Install marker: pip install marker-pdf
4. Verify PyTorch: python -c "import torch; print(torch.__version__)". If you see a libtorch_cpu.dylib error, reinstall immediately: pip uninstall torch torchvision torchaudio -y && pip install torch torchvision torchaudio
5. Verify marker: run marker_single --help, wait ~20 seconds. A list of parameters means success.

Tell me what you're doing before each step. Do not modify system-level configuration. When done, output the installed versions of Python, PyTorch, and marker-pdf.
```

---

## Uninstalling

Uninstall only the marker package, keep the environment:

```bash
conda activate marker
pip uninstall marker-pdf
```

Delete the entire environment (more thorough):

```bash
conda deactivate
conda env remove -n marker
```

---

## Troubleshooting

**Terminal is stuck?** The first run downloads models, which can be slow on some networks. Try configuring a proxy for Terminal:

```bash
export https_proxy=http://127.0.0.1:YOUR_PORT
```

**`libtorch_cpu.dylib` error on Mac?** Reinstall PyTorch:

```bash
pip uninstall torch torchvision torchaudio -y
pip install torch torchvision torchaudio
```

**Poor Chinese recognition?** Add `--langs zh`. For scanned documents, also add `--force_ocr`.

**`command not found`?** The environment isn't activated. Run `conda activate marker` first.

---

## Summary

Marker is essentially a **locally-running document parsing engine**, powered by AI models specifically trained on document layouts — not a general-purpose LLM. This makes it fast, offline-capable, and effective without any API key. It excels at complex academic PDFs: converting math formulas to LaTeX, preserving table structure, and extracting images separately. If you need to organize large volumes of documents into a knowledge base, or want to feed PDF content into an LLM for further processing, Marker is one of the best open-source options available.

---

_Based on [datalab-to/marker](https://github.com/datalab-to/marker), compatible with marker v1.x_
