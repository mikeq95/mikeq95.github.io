---
title: "用 Kokoro 把文章变成播客音频 —— 从零部署教程"
date: 2026-05-16
tags:
  - github
---


> 本文记录了如何在 Mac (Apple Silicon) 上通过 Docker 本地部署 Kokoro TTS，将英文/中文文章转换为高质量音频。

{/* truncate */}

---

## 一、为什么选 Kokoro？

在调研了多个开源 TTS 方案后，最终选择 **Kokoro + kokoro-web** 的原因：

|方案|Stars|英文效果|声音种类|协议|
|---|---|---|---|---|
|**Kokoro**|7k+|⭐ 顶级|88 种可选|Apache 2.0|
|ChatTTS|~33k|中等|随机生成，不可选|CC BY-NC（不可商用）|
|CosyVoice|高|一般|中文最强|Apache 2.0|

**Kokoro 的核心优势：**

- 英文效果接近 ElevenLabs 商业级别
- 88 种声音（美式/英式，男/女，A~D 分级）
- 82M 参数，轻量，M1 Mac CPU 可直接运行
- Apache 2.0，免费商用

---

## 二、声音分级说明

Kokoro 的声音按质量分为 A~D 级，**A 级最高**：

### English (US) 推荐

|声音|级别|风格|
|---|---|---|
|Heart|A|温暖女声（推荐首选）|
|Bella|A-|高质量女声|
|Nicole|B-|自然女声|
|Michael|C+|成熟男声|

### English (UK) 推荐

|声音|级别|风格|
|---|---|---|
|Emma|B-|英式女声|
|George|C|英式男声|

> 💡 每个声音第一次使用时会下载对应的 `.bin` 文件，之后自动缓存，无需重复下载。

---

## 三、部署方式对比

||Docker Compose|源码运行|纯浏览器（WebGPU）|
|---|---|---|---|
|难度|⭐⭐|⭐⭐⭐|⭐|
|需要安装|Docker|Node.js + npm|无|
|推荐场景|本地长期使用|开发者改源码|偶尔体验|

**结论：日常使用推荐 Docker Compose 方式。**

---

## 四、环境准备

### 1. 安装 Docker Desktop

由于国内访问 Docker 官网较慢，建议从阿里云镜像下载：

```
https://mirrors.aliyun.com/docker-toolbox/mac/docker-for-mac/
```

下载 `.dmg` 文件，双击安装，打开 Docker Desktop 等待启动（菜单栏出现 🐳 图标）。

### 2. 配置命令行路径（永久生效）

```bash
echo 'export PATH="$PATH:/Applications/Docker.app/Contents/Resources/bin"' >> ~/.zshrc
source ~/.zshrc
```

### 3. 验证安装

```bash
docker --version && docker compose version
```

输出类似以下内容即为成功：

```
Docker version 29.4.3, build 055a478
Docker Compose version v5.1.3
```

---

## 五、部署 kokoro-web

### 1. 创建项目目录

```bash
mkdir kokoro-web && cd kokoro-web
```

### 2. 创建 `compose.yaml`

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
      - ./kokoro-cache:/kokoro/cache  # 模型缓存，避免重复下载
    restart: unless-stopped
EOF
```

> `KW_SECRET_API_KEY` 是本地服务的访问密码，本地使用随便填即可。

### 3. 启动服务

```bash
docker compose up -d
```

第一次启动会拉取镜像，需要几分钟。国内访问 `ghcr.io` 较慢，耐心等待。

### 4. 验证运行

```bash
docker compose logs -f
```

看到 `Listening on http://0.0.0.0:3000` 即为成功。

---

## 六、使用 WebUI

打开浏览器访问：

```
http://localhost:3000
```

### 关键设置

|选项|推荐值|说明|
|---|---|---|
|**Execution place**|`API (Self-hosted)`|使用本地 Docker 模型，而非浏览器|
|**API URL**|`http://localhost:3000/api/v1`|本地服务地址|
|**API Key**|`my-secret-key`|就是 compose.yaml 里设置的那个|
|**Model quantization**|`model (q8f16)`|速度和音质最平衡|
|**Voice quality**|`Heart (A)`|推荐首选|

> ⚠️ **重要**：`Execution place` 一定要选 `API (Self-hosted)`，否则会在浏览器内运行，速度很慢。

---

## 七、关于 Markdown 文件输入

Kokoro 原生只接受纯文本，直接输入 `.md` 文件会把 `##`、`**bold**` 等 Markdown 语法也读出来。

**解决方案**：用 `pandoc` 先转换：

```bash
# 安装 pandoc
brew install pandoc

# 转换并生成音频
pandoc article.md -t plain | kokoro-tts - output.mp3 --voice am_michael
```

---

## 八、生成速度说明

影响生成速度的因素：

- **文章长度**：线性增长，300 词约需 30~60 秒
- **模型量化**：`fp32` 最慢，`q8f16` 平衡，`q4` 最快
- **运行位置**：`API (Self-hosted)` 用 CPU 跑；`Browser` 用 GPU 跑但首次需下载模型到浏览器

---

## 九、常用管理命令

```bash
docker compose logs -f    # 查看实时日志
docker compose stop       # 停止服务
docker compose start      # 启动服务
docker compose restart    # 重启服务
docker compose pull       # 更新到最新版本
```

---

## 十、相关链接

|资源|地址|
|---|---|
|Kokoro 模型（核心）|github.com/hexgrad/kokoro|
|模型权重下载|huggingface.co/hexgrad/Kokoro-82M|
|在线试听 Demo|hf.co/spaces/hexgrad/Kokoro-TTS|
|kokoro-web（WebUI）|github.com/eduardolat/kokoro-web|

---

_部署环境：MacBook Pro M1 Pro · macOS · Docker Desktop 29.4.3_