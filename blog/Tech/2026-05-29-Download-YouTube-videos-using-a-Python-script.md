---
slug: 2026/05/29/download-youtube-videos-using-a-python-script
title: 用 Python 脚本下载 YouTube 视频
date: 2026-05-29
image: https://cdn.mikeq95blog.uk/coverimage/%E7%94%A8%E4%B8%80%E6%AE%B5python%E8%84%9A%E6%9C%AC%E4%B8%8B%E8%BD%BDyoutube%E8%A7%86%E9%A2%91.png
tags:
  - macos
description: "用一段 Python 脚本配合 yt-dlp，在 Mac 上本地下载 YouTube 视频，配置一次，换链接直接用。"
---

想下载 YouTube 视频存到本地？这篇文章用一个 Python 脚本帮你搞定，配置一次，之后换链接直接用。
放心，这很简单，真的。
{/* truncate */}

---

## 配置运行环境

你的 Mac 上需要以下四个工具，按顺序装好就行。

### Homebrew

macOS 包管理器，装其他工具的基础。

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

验证：

```bash
brew --version
```

✅ 正常：显示 `Homebrew 4.x.x` ❌ 异常：显示 `command not found`

> 如果不知道 Homebrew，请看[这篇文章](/blog/2026/05/28/homebrew-tutorials)
---

### [ffmpeg](https://clearlove7-ai.vercel.app?word=ffmpeg&postId=2026-05-29-Download-YouTube-videos-using-a-Python-script)

合并音视频流，缺它就只能下到没声音的视频。

```bash
brew install ffmpeg
```

验证：

```bash
ffmpeg -version
```

✅ 正常：显示 `ffmpeg version 7.x.x` ❌ 异常：显示 `command not found`

---

### Node.js

破解 YouTube 的 JS 加密挑战，缺它格式全部丢失。

```bash
brew install node
```

验证：

```bash
node --version
```

✅ 正常：显示 `v26.x.x` ❌ 异常：显示 `command not found`

---

### [yt-dlp](https://clearlove7-ai.vercel.app?word=yt-dlp&postId=2026-05-29-Download-YouTube-videos-using-a-Python-script)

核心下载库。

```bash
pip3 install yt-dlp --break-system-packages
```

验证：

```bash
yt-dlp --version
```

✅ 正常：显示 `2026.x.xx` ❌ 异常：显示 `command not found`

---

### 两项额外配置

**终端获得完全磁盘访问权限**（读取 Safari [Cookie](https://clearlove7-ai.vercel.app?word=Cookie&postId=2026-05-29-Download-YouTube-videos-using-a-Python-script) 需要）

系统设置 → 隐私与安全性 → 完全磁盘访问权限 → 添加「终端」

**开启代理**（在国内访问 YouTube 必须）

> 我不可能教你这个的！

---

## 获取代码

你可以直接下载我写好的脚本，也可以自己写（或者让 AI 写，见下一节）。

[点击下载 main.py](https://drive.google.com/file/d/14lFupv6bSw-cicSJ2KxoWYJgkII1uHeZ/view?usp=share_link)

代码内容如下：

```python
import subprocess
import sys
import os

# ── 配置区 ──────────────────────────────────────────────
VIDEO_URL  = "XXXX"                           # 替换为真实的 YouTube 链接
OUTPUT_DIR = os.path.expanduser("~/Desktop")  # 输出到桌面
NODE_PATH  = "/opt/homebrew/bin/node"         # Homebrew 安装的 Node.js 路径
# ────────────────────────────────────────────────────────


def download_video(url: str, output_dir: str) -> None:
    """
    调用 yt-dlp 命令行下载 YouTube 视频，输出 H.264 MP4 格式。
    """
    output_template = os.path.join(output_dir, "%(title)s.%(ext)s")

    cmd = [
        "yt-dlp",
        # 优先 H.264 视频流 + 最佳音频
        "--format", "bestvideo[vcodec^=avc1]+bestaudio/bestvideo[ext=mp4]+bestaudio/best",
        # 强制输出 mp4 容器
        "--merge-output-format", "mp4",
        # 明确指定 Node.js 路径，用于解开 YouTube JS 加密
        "--js-runtimes", f"node:{NODE_PATH}",
        # 从 GitHub 下载 JS 挑战解密脚本（首次运行需要联网）
        "--remote-components", "ejs:github",
        # 读取 Safari Cookie，绕过机器人检测
        "--cookies-from-browser", "safari",
        # 输出文件路径模板
        "--output", output_template,
        url,
    ]

    print(f"[INFO] 开始下载：{url}")
    print(f"[INFO] 输出目录：{output_dir}\n")

    result = subprocess.run(cmd)

    if result.returncode == 0:
        print("\n[✓] 下载完成！视频已保存到桌面。")
    else:
        print("\n[✗] 下载失败，请查看上方错误信息。", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    # 支持从命令行传入链接：python3 main.py <url>
    url = sys.argv[1] if len(sys.argv) > 1 else VIDEO_URL

    if url == "XXXX":
        print("[✗] 请将 VIDEO_URL 替换为真实链接，或通过命令行参数传入。",
              file=sys.stderr)
        print("    用法：python3 main.py \"YouTube链接\"", file=sys.stderr)
        sys.exit(1)

    download_video(url, OUTPUT_DIR)
```

---

## 懒人做法：让 AI 帮你写代码

不想手动写代码？直接把下面的提示词丢给 ChatGPT、DeepSeek 或 Claude，它们都能给你输出一个可用的脚本。

**中文版提示词：**

```
请使用 Python 写一个下载 YouTube 视频的脚本，代码写在 main.py 文件里，
这是需要下载的视频链接：XXXX，最终获得的视频格式要为 H.264 的 MP4，
并输出到桌面。
```

**英文版提示词（更推荐，输出更稳定）：**

```
I need you to help me set up a YouTube video download environment on macOS and write a complete Python script.

## My Environment
- Device: MacBook (Apple Silicon, M-series chip)
- OS: macOS

## What I Need You To Do

### Step 1 — Check and Install Dependencies
Check whether the following tools are installed one by one. If not, provide the install command:
1. Homebrew: via https://brew.sh/
2. ffmpeg: via brew install ffmpeg
3. Node.js: via brew install node
4. yt-dlp: via pip3 install yt-dlp --break-system-packages

### Step 2 — Write the Python Script
Filename: youtube_downloader.py
Requirements:
- Use subprocess to call the yt-dlp CLI (do NOT use the yt_dlp Python API)
- Video format: H.264 codec, MP4 container
- Quality: automatically select the highest available quality
- Cookies: read from Safari (--cookies-from-browser safari)
- Node.js path: /opt/homebrew/bin/node
- Include --remote-components ejs:github to solve JS challenges
- Output directory: Desktop (~/Desktop)
- Accept video URL as a command-line argument: python3 youtube_downloader.py "YouTube URL"
- Add comments in English

### Step 3 — Tell Me How To Use It
Explain how to run the script in one sentence.

## Important Notes
- macOS root directory / is read-only — do NOT output files there
- Terminal needs Full Disk Access enabled in System Settings to read Safari cookies — please remind me to do this
- Do NOT use "ios" as the player_client — it does not support cookies
```

> AI 能帮你写好代码，但**环境还是要自己配置**（就是上面那四个工具）。如果你连这个也不想手动做，可以用 Claude Code / Codex 帮你自动执行安装命令，一路点 yes 就行。

---

## 使用步骤

配置好环境之后，每次使用只需要一条命令。

打开终端，输入：

```bash
python3 ~/Downloads/main.py "在这里粘贴YouTube链接"
```

> 如果你把 `main.py` 放在了其他位置，把 `~/Downloads/main.py` 替换成实际路径即可。`~/Downloads` 代表你的下载文件夹，不需要改成自己的用户名。

例如：

```bash
python3 ~/Downloads/main.py "https://www.youtube.com/watch?v=5wvq8w7YBXU"
```

回车之后等待下载完成，视频会自动出现在**桌面**上。

---

**每次使用前确认两件事：**

① 代理已开启（Shadowrocket 处于连接状态）

② 终端窗口是新开的（不是几天前没关的那个）

环境只需要搭建一次，之后换任何 YouTube 链接都可以直接用。

---

## FAQ

**什么是 Homebrew？** 我的另一篇文章写过，可以去看一下。

**下载之后的视频画质是多少？** 默认最高画质，脚本里这行代码决定了分辨率选择逻辑：

```python
"bestvideo[vcodec^=avc1]+bestaudio/bestvideo[ext=mp4]+bestaudio/best"
```

意思是：在所有 H.264 编码的视频流里，选画质最高的那个。

**终端卡住不动？** 首次运行会从网上下载解密脚本，国内网络可能较慢，耐心等一下。确认代理已开启，或者等个 1～2 分钟再看。

**提示 `command not found`？** 某个依赖没装好。按照"配置运行环境"一节逐一验证，找到没安装的那个重新装一遍。

**提示 `permission denied` 或 Cookie 读取失败？** 终端没有完全磁盘访问权限。去系统设置 → 隐私与安全性 → 完全磁盘访问权限 → 添加「终端」，然后重新开一个终端窗口再试。

**下载失败，看不懂报错？** 按顺序排查：① 代理是否开启 ② yt-dlp 是否是最新版（`pip3 install -U yt-dlp --break-system-packages`）③ 链接是否完整、有没有被引号包裹。