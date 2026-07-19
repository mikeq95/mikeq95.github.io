---
slug: 2026/05/16/kokoro-tts-tutorial
title: "Convert Articles to Podcast Audio with Kokoro"
date: 2026-05-16
image: https://cdn.mikeq95blog.uk/coverimage/kokoro-en-cn.png
tags:
  - github
  - macos
description: "Convert your English articles into high-quality audio using Kokoro, a free and locally-run open-source TTS tool."
---

I wanted to convert my English articles into audio so I could listen while walking. After looking around, the only option that's free, sounds good, and runs locally is [Kokoro](https://github.com/hexgrad/kokoro).

{/* truncate */}

---

## What Is Kokoro

Kokoro is an open-source TTS (text-to-speech) model with 82M parameters — lightweight but surprisingly good. English quality approaches ElevenLabs commercial level, with 88 voices to choose from and an Apache 2.0 license, free for commercial use.

We'll use [kokoro-web](https://github.com/eduardolat/kokoro-web) — a project that wraps Kokoro into a local service, launched with a single Docker command, with a web UI included, ready to use out of the box.

---

## Choosing a Voice

Kokoro voices are graded A–D by quality, A being highest. For English, just pick from these:

| Voice | Grade | Style |
|---|---|---|
| Heart | A | Warm female voice, top pick |
| Bella | A- | High-quality female voice |
| Michael | C+ | Mature male voice |
| Emma | B- | British female voice |

> The first time you use a voice, its model file is downloaded automatically and cached — no need to re-download.

---

## Installing Docker

If you don't have Docker yet, install it first.

**International network**: download from the official site: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)

**Chinese network**: the official site can be slow, use Aliyun's mirror:

```
https://mirrors.aliyun.com/docker-toolbox/mac/docker-for-mac/
```

Download the `.dmg`, double-click to install, open Docker Desktop, and wait for the 🐳 icon to appear in the menu bar.

Then configure the command-line path so Terminal can find the docker command:

```bash
echo 'export PATH="$PATH:/Applications/Docker.app/Contents/Resources/bin"' >> ~/.zshrc
source ~/.zshrc
```

Verify the installation:

```bash
docker --version && docker compose version
```

---

## Deploying kokoro-web

### 1. Create a project directory

```bash
mkdir kokoro-web && cd kokoro-web
```

> **Make sure you `cd` into the folder before doing anything else.** The `docker compose` commands must run inside this directory, otherwise you'll get `no configuration file provided`.

### 2. Create the config file

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
      - ./kokoro-cache:/kokoro/cache
    restart: unless-stopped
EOF
```

`KW_SECRET_API_KEY` is the access password for the local service — for local use, anything works, just remember what you set. I'd suggest leaving it as the default.

### 3. Start the service

```bash
docker compose up -d
```

The first start pulls the image, which can be slow on some networks — be patient.

Once you see this, it's up:

```bash
docker compose logs -f
# Success: Listening on http://0.0.0.0:3000
```

---

## Using the Web UI

Open your browser and go to `http://localhost:3000`.

### Configure the API (important)

Click **API Settings** in the top right corner:

- **Base URL**: `http://localhost:3000/api/v1` (default, no change needed)
- **API Key**: `my-secret-key`

> **Gotcha**: the API Key is just the value itself — don't include the `- KW_SECRET_API_KEY=` prefix from the compose file.

Click **OK**.

### Generation Settings

Back on the main screen, a few key options:

| Option | Recommended | Notes |
|---|---|---|
| **Execution place** | `API (Self-hosted)` | Use local Docker, not Browser |
| **Model quantization** | `q8f16` | Best balance of speed and quality |
| **Language accent** | `English (US)` | For English content |
| **Voice** | `Heart` | Top recommendation |

**Always set Execution place to `API (Self-hosted)`.** Running in the browser runs the model in your browser — much slower and re-downloads every time.

Paste your article into **Text to process**, then click **Generate**.

### Demo

Input text:

> Google is renowned for its innovative and employee-centric work environment. The company's campuses, often called "Googleplexes," feature vibrant designs with open spaces, recreational facilities, free gourmet meals, and wellness centers. Employees enjoy flexible work hours, remote options, and a strong emphasis on collaboration through team projects and hackathons.
>
> A culture of creativity thrives with "20% time," encouraging personal passion projects that have led to major products like Gmail. Diversity, inclusion, and continuous learning are prioritized through training programs and supportive leadership. This unique blend of fun, freedom, and purpose fosters high productivity and job satisfaction, making Google a top destination for tech talent worldwide.

Generated with the Heart voice (~150 words, ~30 seconds on local CPU):

<audio controls>
  <source src="/assets/kokoro-demo-google.mp3" type="audio/mpeg" />
</audio>

---

## Processing Markdown Files

Kokoro only accepts plain text. Pasting a `.md` file directly will cause it to read out `##`, `**bold**`, and other Markdown syntax aloud.

Use `pandoc` to convert first:

```bash
# Install pandoc
brew install pandoc

# Convert md to plain text, then copy-paste the output
pandoc article.md -t plain
```

---

## Useful Commands

```bash
docker compose logs -f    # view live logs
docker compose stop       # stop the service
docker compose start      # start the service
docker compose pull       # update to the latest version
```

---
