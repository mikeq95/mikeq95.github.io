---
slug: 2026/05/16/kokoro-tts-tutorial
title: "用 Kokoro 把文章变成播客音频"
date: 2026-05-16
image: /coverimage/kokoro-coverimage.png
tags:
  - github
  - macos
---

我想把自己写的英文文章转成音频，方便边走路边听。调研了一圈，免费、效果好、本地跑——这三个条件同时满足的，只有 [Kokoro](https://github.com/hexgrad/kokoro)。

{/* truncate */}

---

## Kokoro 是什么

Kokoro 是一个开源 [TTS](https://clearlove7-ai.vercel.app?word=TTS&postId=2026-05-16-kokoro-tts-tutorial)（文字转语音）模型，82M 参数，轻量但效果出奇地好。英文效果接近 ElevenLabs 商业级别，88 种声音可选，Apache 2.0 协议，免费商用。

我们要用的是 [kokoro-web](https://github.com/eduardolat/kokoro-web)——一个把 Kokoro 包成本地服务的项目，用 [Docker](https://clearlove7-ai.vercel.app?word=Docker&postId=2026-05-16-kokoro-tts-tutorial) 一键启动，带网页界面，开箱即用。

---

## 声音怎么选

Kokoro 的声音按质量分 A~D 级，A 最高。英文推荐直接从这几个里挑：

| 声音 | 级别 | 风格 |
|---|---|---|
| Heart | A | 温暖女声，首选 |
| Bella | A- | 高质量女声 |
| Michael | C+ | 成熟男声 |
| Emma | B- | 英式女声 |

> 每个声音第一次用会下载对应的模型文件，之后自动缓存，不用重复下载。

---

## 安装 Docker

如果还没装 Docker，先装。

**国际网络**，直接去官网下：[docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)

**国内网络**，官网访问慢，用阿里云镜像：

```
https://mirrors.aliyun.com/docker-toolbox/mac/docker-for-mac/
```

下载 `.dmg`，双击安装，打开 Docker Desktop，等菜单栏出现 🐳 图标。

然后配置一下命令行路径（让终端能找到 docker 命令）：

```bash
echo 'export PATH="$PATH:/Applications/Docker.app/Contents/Resources/bin"' >> ~/.zshrc
source ~/.zshrc
```

验证安装成功：

```bash
docker --version && docker compose version
```

---

## 部署 kokoro-web

### 1. 创建项目目录

```bash
mkdir kokoro-web && cd kokoro-web
```

> **一定要 `cd` 进去再操作**，后面的 `docker compose` 命令必须在这个目录里跑，否则会报 `no configuration file provided`。

### 2. 创建配置文件

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

`KW_SECRET_API_KEY` 是访问本地服务的密码，本地用随便填，记住这个值就行。
> 我建议不用改，默认就行。

### 3. 启动服务

```bash
docker compose up -d
```

第一次启动会拉取镜像，国内访问 `ghcr.io` 较慢，耐心等几分钟。

看到这行就说明成功了：

```bash
docker compose logs -f
# 看到 Listening on http://0.0.0.0:3000 即为成功
```

---

## 使用 WebUI

打开浏览器访问 `http://localhost:3000`，界面就出来了。

### 配置 API（重要）

右上角点 **API Settings**，弹出配置框：

- **Base URL** 填：`http://localhost:3000/api/v1`（默认就是这个，不用改）
- **API Key** 填：`my-secret-key`

> **坑**：API Key 只填值本身，不要带 `- KW_SECRET_API_KEY=` 前缀，那是配置文件里的格式，不是 key 的内容。

填完点 **OK**。

### 生成设置

回到主界面，几个关键选项：

| 选项 | 推荐值 | 说明 |
|---|---|---|
| **Execution place** | `API (Self-hosted)` | 用本地 Docker，不要选 Browser |
| **Model quantization** | `q8f16` | 速度和音质最平衡 |
| **Language accent** | `English (US)` | 英文选这个 |
| **Voice** | `Heart` | 推荐首选 |

**Execution place 一定要选 `API (Self-hosted)`**，选 Browser 会在浏览器里跑模型，速度很慢，而且每次都要重新下载。

在 **Text to process** 里粘贴文章内容，点 **Generate** 就行了。

### 效果示例

输入这段文字：

> Google is renowned for its innovative and employee-centric work environment. The company's campuses, often called "Googleplexes," feature vibrant designs with open spaces, recreational facilities, free gourmet meals, and wellness centers. Employees enjoy flexible work hours, remote options, and a strong emphasis on collaboration through team projects and hackathons.
>
> A culture of creativity thrives with "20% time," encouraging personal passion projects that have led to major products like Gmail. Diversity, inclusion, and continuous learning are prioritized through training programs and supportive leadership. This unique blend of fun, freedom, and purpose fosters high productivity and job satisfaction, making Google a top destination for tech talent worldwide.

用 Heart 声音生成的效果（约 150 词，本地生成耗时约 30 秒）：

<audio controls>
  <source src="/assets/kokoro-demo-google.mp3" type="audio/mpeg" />
</audio>

---

## 处理 Markdown 文件

Kokoro 只认纯文本，直接粘 `.md` 文件的话，`##`、`**bold**` 这些语法标记也会被读出来，很奇怪。

用 `pandoc` 先转成纯文本再粘：

```bash
# 安装 pandoc
brew install pandoc

# 把 md 转成纯文本，输出到终端，然后复制粘贴
pandoc article.md -t plain
```

---

## 常用命令

```bash
docker compose logs -f    # 查看实时日志
docker compose stop       # 停止服务
docker compose start      # 启动服务
docker compose pull       # 更新到最新版本
```

---

_运行环境：MacBook Pro M1 Pro · macOS · Docker Desktop 29.4.3_
