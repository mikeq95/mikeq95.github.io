---
slug: 2026/05/16/kokoro-tts-tutorial
title: "Convert Articles to Podcast Audio with Kokoro — A Full Deployment Guide"
date: 2026-05-16
tags:
  - github
  - macos
---

> This post documents how to locally deploy Kokoro TTS on a Mac (Apple Silicon) via Docker to convert English/Chinese articles into high-quality audio.

{/* truncate */}

---

## 1. Why Kokoro?

After evaluating several open-source TTS solutions, here's why **Kokoro + kokoro-web** came out on top:

| Solution | Stars | English Quality | Voice Variety | License |
|----------|-------|-----------------|---------------|---------|
| **Kokoro** | 7k+ | ⭐ Top-tier | 88 options | Apache 2.0 |
| ChatTTS | ~33k | Moderate | Random, non-selectable | CC BY-NC (non-commercial) |
| CosyVoice | High | Decent | Best Chinese | Apache 2.0 |

**Key advantages of Kokoro:**

- English quality approaches ElevenLabs commercial level
- 88 voices (American/British, male/female, A–D quality grades)
- 82M parameters — lightweight, runs directly on M1 Mac CPU
- Apache 2.0 — free for commercial use

---

## 2. Voice Quality Grades

Kokoro voices are graded A–D, with **A being the highest**:

### English (US) — Recommended

| Voice | Grade | Style |
|-------|-------|-------|
| Heart | A | Warm female voice (top pick) |
| Bella | A- | High-quality female voice |
| Nicole | B- | Natural female voice |
| Michael | C+ | Mature male voice |

### English (UK) — Recommended

| Voice | Grade | Style |
|-------|-------|-------|
| Emma | B- | British female voice |
| George | C | British male voice |

> 💡 The first time you use a voice, its `.bin` file is downloaded automatically and cached — no need to re-download.

---

## 3. Deployment Options

| | Docker Compose | From Source | Browser (WebGPU) |
|--|----------------|-------------|-----------------|
| Difficulty | ⭐⭐ | ⭐⭐⭐ | ⭐ |
| Requires | Docker | Node.js + npm | Nothing |
| Best For | Daily local use | Developers modifying source | Occasional testing |

**Verdict: Docker Compose is the recommended approach for daily use.**

---

## 4. Prerequisites

### 1. Install Docker Desktop

Download Docker Desktop from the official site: [docker.com](https://www.docker.com/products/docker-desktop/)

Download the `.dmg` file, double-click to install, open Docker Desktop, and wait for it to start (a 🐳 icon appears in the menu bar).

### 2. Configure the Command-Line Path (permanent)

```bash
echo 'export PATH="$PATH:/Applications/Docker.app/Contents/Resources/bin"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Verify Installation

```bash
docker --version && docker compose version
```

Expected output:

```
Docker version 29.4.3, build 055a478
Docker Compose version v5.1.3
```

---

## 5. Deploy kokoro-web

### 1. Create a Project Directory

```bash
mkdir kokoro-web && cd kokoro-web
```

### 2. Create `compose.yaml`

```bash
cat > compose.yaml << 'EOF'
services:
  kokoro-web:
    image: ghcr.io/eduardolat/kokoro-web:latest
    ports:
      - "3000:3000"
    environment:
      - KW_SECRET_API_KEY=my-secret-key
    volumes:
      - ./kokoro-cache:/kokoro/cache  # cache models to avoid re-downloading
    restart: unless-stopped
EOF
```

> `KW_SECRET_API_KEY` is the access password for the local service — for local use, any value works.

### 3. Start the Service

```bash
docker compose up -d
```

The first start pulls the image, which may take a few minutes.

### 4. Verify It's Running

```bash
docker compose logs -f
```

When you see `Listening on http://0.0.0.0:3000`, the service is up.

---

## 6. Using the WebUI

Open your browser and go to:

```
http://localhost:3000
```

### Key Settings

| Option | Recommended Value | Notes |
|--------|-------------------|-------|
| **Execution place** | `API (Self-hosted)` | Use local Docker model, not in-browser |
| **API URL** | `http://localhost:3000/api/v1` | Local service address |
| **API Key** | `my-secret-key` | Same as the value in compose.yaml |
| **Model quantization** | `model (q8f16)` | Best balance of speed and quality |
| **Voice quality** | `Heart (A)` | Top recommendation |

> ⚠️ **Important**: Always set `Execution place` to `API (Self-hosted)`. Running in the browser is very slow.

---

## 7. Markdown File Input

Kokoro only accepts plain text natively. Feeding a `.md` file directly will cause it to read out `##`, `**bold**`, and other Markdown syntax aloud.

**Solution**: Use `pandoc` to convert first:

```bash
# Install pandoc
brew install pandoc

# Convert and generate audio
pandoc article.md -t plain | kokoro-tts - output.mp3 --voice am_michael
```

---

## 8. Generation Speed

Factors that affect speed:

- **Article length**: scales linearly — ~300 words takes 30–60 seconds
- **Model quantization**: `fp32` is slowest, `q8f16` is balanced, `q4` is fastest
- **Execution location**: `API (Self-hosted)` runs on CPU; `Browser` uses GPU but requires an initial model download

---

## 9. Common Management Commands

```bash
docker compose logs -f    # view live logs
docker compose stop       # stop the service
docker compose start      # start the service
docker compose restart    # restart the service
docker compose pull       # update to the latest version
```

---

## 10. Related Links

| Resource | URL |
|----------|-----|
| Kokoro model (core) | github.com/hexgrad/kokoro |
| Model weights | huggingface.co/hexgrad/Kokoro-82M |
| Live demo | hf.co/spaces/hexgrad/Kokoro-TTS |
| kokoro-web (WebUI) | github.com/eduardolat/kokoro-web |

---

_Deployment environment: MacBook Pro M1 Pro · macOS · Docker Desktop 29.4.3_
