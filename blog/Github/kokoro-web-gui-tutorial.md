---
slug: 2026/07/21/kokoro-web-gui-tutorial
title: "Kokoro Web：不用敲代码，网页界面本地生成 AI 配音"
date: 2026-07-21
image: https://cdn.mikeq95blog.uk/coverimage/kokoro-en-cn.png
tags:
  - github
description: "用 kokoro-web 把开源 TTS 模型 Kokoro 包成网页界面，Docker 一键启动，填文字点按钮就能生成配音，不用写一行 Python。"
---

之前写过[一篇 Kokoro 教程](/blog/2026/05/16/kokoro-tts-tutorial)，用 pip 装、写 Python 脚本调用模型。有朋友反馈不想敲命令、不想碰代码，只想要个网页填文字点一下就出音频的东西。正好 Kokoro 官方主页上就推荐了 [kokoro-web](https://github.com/eduardolat/kokoro-web)——把 Kokoro 包成了一个带网页界面的本地服务，Docker 一键启动，装完全程点鼠标就行。这篇记录一下怎么把它跑起来。

{/* truncate */}

---

## 它是什么

kokoro-web 是 [Kokoro](https://github.com/hexgrad/kokoro) 模型的一个第三方网页壳，作者是 [eduardolat](https://github.com/eduardolat)，⭐ 600+，MIT 协议。核心功能就是起一个网页，你在输入框里粘贴文字、选个声音、点 Generate，几秒钟后网页里直接出来一个能播放、能下载的音频文件。

支持两种运行方式：

- **Browser**：模型直接在你的浏览器里跑（WebGPU/WASM），什么都不用装，打开网页就能用，但速度慢、每次都要重新下载模型。
- **API (Self-hosted)**：本机用 Docker 起一个服务，网页调用这个本地服务生成，速度快很多，模型只下载一次。

这篇教程走第二种，效果更好，也是作者自己推荐的用法。

---

## 装 Docker

如果还没装 Docker，先装。

**能访问外网**的话，直接去官网下：[docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)

**国内网络**访问官网慢的话，用阿里云镜像：

```
https://mirrors.aliyun.com/docker-toolbox/mac/docker-for-mac/
```

下载 `.dmg`，双击安装，打开 Docker Desktop，等菜单栏出现 🐳 图标就算装好了。

如果想在终端里用 `docker` 命令（不是必须，纯网页操作也不需要），把命令行路径加进去：

```bash
echo 'export PATH="$PATH:/Applications/Docker.app/Contents/Resources/bin"' >> ~/.zshrc
source ~/.zshrc
```

验证一下：

```bash
docker --version && docker compose version
```

---

## 部署 kokoro-web

### 1. 新建一个文件夹

```bash
mkdir kokoro-web && cd kokoro-web
```

> **一定要先 `cd` 进去**，下一步的 `docker compose` 命令得在这个目录里跑，不然会报 `no configuration file provided`。

### 2. 写配置文件

在这个文件夹里新建一个 `compose.yaml`，内容如下（用文本编辑器新建也行，或者用下面这条命令直接生成）：

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

`KW_SECRET_API_KEY` 是访问本地服务用的密码，本地自己用随便填，记住这个值，下一步网页配置的时候要用到。

### 3. 启动

```bash
docker compose up -d
```

第一次启动要拉取镜像（几百 MB），国内访问 `ghcr.io` 可能会慢，耐心等。看日志确认启动成功：

```bash
docker compose logs -f
```

看到这一行就说明服务起来了：

```
Listening on http://0.0.0.0:3000
```

`Ctrl+C` 退出日志查看（不会影响服务运行，服务是后台跑的）。

---

## 打开网页，配置一下

浏览器访问 `http://localhost:3000`，就能看到界面：

![kokoro-web 输入界面](/img/kokoro-web-api-settings.jpg)

几个字段照下面这样填：

| 字段 | 设为 | 说明 |
|---|---|---|
| **Execution place** | `API` | 用本机 Docker 服务生成，不要选 Browser |
| **Model quantization** | 默认的 `fp32` 就行，追求速度可以选列表里体积更小的量化版本 | 体积越大精度越高、生成越慢，几十 MB 的量化版本速度快很多，效果差别不大 |
| **Language accent (region)** | `English (US)` | 中文文本选 `Chinese` |
| **Voice (quality)** | `Heart (A)` | 质量分 A~D，A 最高，英文首选 Heart |

### 配置 API（重要，只需要做一次）

把 **Execution place** 切到 `API` 之后，右边会多出一个齿轮图标 ⚙️（不在页面右上角，就挨着这个下拉框），点开它：

- **Base URL**：会自动填成 `http://localhost:3000/api/v1`，不用改
- **API Key**：填你在 `compose.yaml` 里设的那个值，这里是 `my-secret-key`

> **坑**：API Key 这里只填值本身（比如 `my-secret-key`），不要把 `KW_SECRET_API_KEY=` 这个前缀也带进去，那是配置文件的写法，不是 key 的内容。

点 **OK** 保存，这个设置存在浏览器 localStorage 里，关网页重开还在，不用每次都填。

### 生成

在 **Text to process** 里粘贴想转成语音的文字，点 **Generate Voice**：

![kokoro-web 生成结果](/img/kokoro-web-output.jpg)

生成完下面会出现一个播放器，能直接试听，右边的下载图标点一下就能存成音频文件。第一次生成会顺带下载模型（读取 Model quantization 里选的那个版本，几十到几百 MB 不等），之后就会缓存在 `./kokoro-cache` 目录里，不用重复下载。

---

## 效果示例

用 Heart 声音生成的效果：

<audio controls>
  <source src="/assets/kokoro-demo-google.mp3" type="audio/mpeg" />
</audio>

---

## 处理 Markdown 文件

网页只认纯文本，直接把 `.md` 文件的内容粘进去的话，`##`、`**bold**` 这些语法符号也会被读出来，很奇怪。

用 `pandoc` 先转成纯文本，再复制粘贴：

```bash
brew install pandoc
pandoc article.md -t plain
```

终端里会打印出转换后的纯文本，全选复制，粘到网页的 Text to process 框里就行。

---

## 常用命令

```bash
docker compose logs -f    # 查看实时日志
docker compose stop       # 停止服务
docker compose start      # 重新启动（不会丢配置和缓存）
docker compose pull       # 拉取新版本镜像
docker compose down       # 彻底停止并删除容器（./kokoro-cache 里的模型缓存不会被删）
```

---

## 常见问题

- **网页打不开 `localhost:3000`**：先 `docker compose ps` 看容器是不是真的在跑，没起来的话看 `docker compose logs` 里的报错。
- **Generate 之后报 401 / 认证失败**：API Key 填错了，去 ⚙️ 里核对是不是只填了值本身，没带 `KW_SECRET_API_KEY=` 前缀。
- **选了 Browser 模式巨慢**：模型是在浏览器里现下现跑的，正常但慢，改回 `API` 用本机 Docker 服务。
- **想换个端口**：`compose.yaml` 里 `"3000:3000"` 改成比如 `"3001:3000"`，重新 `docker compose up -d`，网页地址和 API Base URL 里的端口也要跟着改成 3001。

---

## 卸载

```bash
docker compose down          # 停止并删除容器
rm -rf kokoro-web             # 连同配置文件和缓存的模型一起删掉
```
