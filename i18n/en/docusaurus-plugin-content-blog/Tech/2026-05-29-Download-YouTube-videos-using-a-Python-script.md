---
slug: 2026/05/29/download-youtube-videos-using-a-python-script
title: Download YouTube Videos Using a Python Script
date: 2026-05-29
image: https://cdn.mikeq95blog.uk/coverimage/Download%20YouTube%20videos%20using%20a%20Python%20script..png
tags:
  - macos
description: "Download YouTube videos locally on Mac using a Python script with yt-dlp — set it up once, swap the link each time."
---

Want to save YouTube videos locally? This post walks through a Python script that handles everything for you — set it up once, then just swap the URL each time.

{/* truncate */}

---

## Setting Up the Environment

Your Mac needs the following four tools.

### [Homebrew](/en/2026/05/28/homebrew-tutorials)

macOS package manager — the foundation for installing everything else.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Verify:

```bash
brew --version
```

---

### ffmpeg

Merges audio and video streams — without it you'll only get a silent video.

```bash
brew install ffmpeg
```

Verify:

```bash
ffmpeg -version
```

---

### Node.js

Solves YouTube's JS encryption challenge — without it all format options are lost.

```bash
brew install node
```

Verify:

```bash
node --version
```

---

### yt-dlp

The core download library.

```bash
pip3 install yt-dlp --break-system-packages
```

Verify:

```bash
yt-dlp --version
```

---

### Two Extra Configuration Steps

**Grant Terminal Full Disk Access** (needed to read Safari cookies)

System Settings → Privacy & Security → Full Disk Access → Add "Terminal"

**Enable a proxy** (required to access YouTube outside China)

---

## Get the Code

You can download the script I wrote, or write it yourself (or have AI write it — see the next section).

[Download main.py](https://drive.google.com/file/d/14lFupv6bSw-cicSJ2KxoWYJgkII1uHeZ/view?usp=share_link)

Script contents:

```python
import subprocess
import sys
import os

# ── Configuration ────────────────────────────────────────────────────────────
VIDEO_URL  = "XXXX"                           # Replace with a real YouTube URL
OUTPUT_DIR = os.path.expanduser("~/Desktop")  # Output to Desktop
NODE_PATH  = "/opt/homebrew/bin/node"         # Node.js path (installed via Homebrew)
# ─────────────────────────────────────────────────────────────────────────────


def download_video(url: str, output_dir: str) -> None:
    """
    Calls the yt-dlp CLI to download a YouTube video in H.264 MP4 format.
    """
    output_template = os.path.join(output_dir, "%(title)s.%(ext)s")

    cmd = [
        "yt-dlp",
        # Prefer H.264 video stream + best audio
        "--format", "bestvideo[vcodec^=avc1]+bestaudio/bestvideo[ext=mp4]+bestaudio/best",
        # Force MP4 container
        "--merge-output-format", "mp4",
        # Specify Node.js path for solving YouTube's JS encryption
        "--js-runtimes", f"node:{NODE_PATH}",
        # Download JS challenge decryption script from GitHub (requires internet on first run)
        "--remote-components", "ejs:github",
        # Read Safari cookies to bypass bot detection
        "--cookies-from-browser", "safari",
        # Output file path template
        "--output", output_template,
        url,
    ]

    print(f"[INFO] Starting download: {url}")
    print(f"[INFO] Output directory: {output_dir}\n")

    result = subprocess.run(cmd)

    if result.returncode == 0:
        print("\n[✓] Download complete! Video saved to Desktop.")
    else:
        print("\n[✗] Download failed. Check the error output above.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    # Supports passing a URL as a command-line argument: python3 main.py <url>
    url = sys.argv[1] if len(sys.argv) > 1 else VIDEO_URL

    if url == "XXXX":
        print("[✗] Please replace VIDEO_URL with a real URL, or pass it as a command-line argument.",
              file=sys.stderr)
        print("    Usage: python3 main.py \"YouTube URL\"", file=sys.stderr)
        sys.exit(1)

    download_video(url, OUTPUT_DIR)
```

---

## The Lazy Approach: Let AI Write the Code

Don't want to write the code yourself? Just paste one of these prompts into ChatGPT, DeepSeek, or Claude and they'll output a working script.

**English prompt (recommended — more stable output):**

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

> AI can write the code for you, but **you still need to set up the environment yourself** (the four tools above). If you don't want to do that manually either, use Claude Code or Codex to run the install commands automatically — just keep clicking yes.

---

## Usage

Once the environment is set up, every download only takes one command.

Open Terminal and run:

```bash
python3 ~/Downloads/main.py "paste your YouTube URL here"
```

> If you saved `main.py` somewhere else, replace `~/Downloads/main.py` with the actual path. `~/Downloads` refers to your Downloads folder — no need to substitute your username.

Example:

```bash
python3 ~/Downloads/main.py "https://www.youtube.com/watch?v=5wvq8w7YBXU"
```

Press Enter and wait — the video will appear on your **Desktop** when done.

---

## FAQ

**What video quality will I get?** The highest available by default. This line in the script controls the resolution selection logic:

```python
"bestvideo[vcodec^=avc1]+bestaudio/bestvideo[ext=mp4]+bestaudio/best"
```

It selects the highest-quality stream among all H.264-encoded video tracks.

**Terminal is stuck and nothing's happening?** The first run downloads a decryption script from the internet, which can be slow on some networks. Make sure your proxy is active, or wait 1–2 minutes.

**`command not found` error?** A dependency didn't install correctly. Go back to the "Setting Up the Environment" section and verify each tool one by one.

**`permission denied` or cookie read failure?** Terminal doesn't have Full Disk Access. Go to System Settings → Privacy & Security → Full Disk Access → Add "Terminal", then open a new Terminal window and try again.

**Download failed and you can't read the error?** Ask Claude Code.
