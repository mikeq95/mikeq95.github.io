---
slug: 2026/09/08/douyin-tiktok-download-api-github-project
title: Douyin_TikTok_Download_API，抖音/TikTok/B站数据爬取和无水印下载工具
date: 2026-09-08
tags: [github, python, open-source, Ai-friendly]
description: Douyin_TikTok_Download_API 是一个开源的抖音/TikTok/Bilibili数据爬取和无水印下载工具，用 FastAPI 提供 REST API，用 PyWebIO 做了个网页端批量解析界面。本文基于源码阅读和本地实际运行整理，B站接口实测不用配置就能直接用，抖音/TikTok接口需要自己换一个有效的Cookie。
---

Douyin_TikTok_Download_API 是一个开源的数据爬取工具，专门解析抖音、TikTok 和 B 站的视频、直播、评论数据，顺带能把无水印视频或图集下载下来。它不是一个简单的下载脚本，而是把爬虫封装成了一整套 REST API，配了 Swagger 文档、网页端批量解析界面，还能配合 iOS 快捷指令在手机上直接调用。

{/* truncate */}

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

---

## 介绍

[Douyin_TikTok_Download_API](https://github.com/Evil0ctal/Douyin_TikTok_Download_API) 是一个用 Python 写的异步爬虫项目，从 2021 年 11 月开始维护到现在，GitHub 上已经有 2 万左右的 star。它同时覆盖抖音、TikTok 和 B 站三个平台，能拿到视频详情、用户主页、评论、直播流这些数据。

项目的核心分两层：`crawlers/` 目录是纯爬虫逻辑，负责向各平台的 Web/App 接口发请求、算签名、拿数据，返回统一的字典；`app/` 目录在外面包了两层壳子——`app/api` 用 [FastAPI](https://fastapi.tiangolo.com/) 把这些爬虫封装成 REST 接口，`app/web` 用 [PyWebIO](https://www.pyweb.io/) 做了一个不用写前端代码的网页端，浏览器里就能批量粘贴链接解析。HTTP 客户端用的是 [HTTPX](https://www.python-httpx.org/)，整条链路都是异步的。

抖音这块的接口做得比较细：生成 `msToken`、生成 `verify_fp`、用接口网址算 `X-Bogus`/`A-Bogus` 参数这些抖音风控要用到的签名逻辑，都单独暴露成了可调用的接口，不只是简单地拿数据。

---

## 安装环境

仓库根目录有个 `requirements.txt`，本地起一个虚拟环境装依赖就行：

```bash
git clone https://github.com/Evil0ctal/Douyin_TikTok_Download_API.git
cd Douyin_TikTok_Download_API
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> 注意，依赖版本锁得比较老（大多是 2024 年前后的版本号）。实测在 Python 3.12 下能顺利装完；换成刚发布不久的 Python 3.14，pip 会因为找不到预编译包卡在源码编译上，装了很久都没反应，建议直接用 3.11 或 3.12。

唯一必须改的地方是配置文件里的 Cookie。默认的 `config.yaml`，以及 `crawlers/douyin/web/config.yaml`、`crawlers/tiktok/web/config.yaml` 里都带了一份示例 Cookie，那是抖音风控日志里留下的旧数据，直接拿来跑抖音/TikTok 接口会返回 400。要用自己的账号登录抖音网页版，从浏览器开发者工具里复制一份新的 Cookie 换上去；仓库里的 `chrome-cookie-sniffer/` 也给了一个 Chrome 扩展，能自动嗅探并弹出 Cookie，省得手动翻网络请求面板。B 站的接口不需要这一步，公开数据不登录也能拿到。

如果打算走 `/api/download` 接口下载 B 站视频，还需要装一个 `ffmpeg`——B 站的视频流和音频流是分开的，下载接口内部会调 `ffmpeg` 命令把两路流合并成一个文件。

至此，环境已经装好了。

---

## 运行

配置文件里 `API.Host_Port` 默认是 80，本地测试记得改成一个不需要 sudo 权限的端口，比如 8899：

```yaml
API:
  Host_IP: 127.0.0.1
  Host_Port: 8899
```

然后启动：

```bash
python start.py
```

验证：

✅ 正常：终端打印出 `Uvicorn running on http://127.0.0.1:8899` 和 `Application startup complete`，浏览器打开 `http://127.0.0.1:8899/docs` 能看到 Swagger 接口文档，根路径 `http://127.0.0.1:8899` 是 PyWebIO 做的批量解析页面。

❌ 异常：如果卡在装依赖那一步没反应，先确认自己用的 Python 版本，3.11 或 3.12 最稳。

---

## 效果展示

实测跑起来之后，B 站接口不用任何配置直接就能用：

```bash
curl "http://127.0.0.1:8899/api/bilibili/web/fetch_one_video?bv_id=BV1M1421t7hT"
```

拿到的是一整段真实的视频详情 JSON——标题、播放量、点赞、评论数、UP 主信息都在里面，没有换 Cookie 也没报错。

抖音接口就没这么顺利了。拿默认配置文件里那份过期的示例 Cookie 去请求：

```bash
curl "http://127.0.0.1:8899/api/hybrid/video_data?url=https://v.douyin.com/L4FJNR3/&minimal=true"
```

返回的是 `400`、`An error occurred`。

> 这是预期内的结果，不是项目本身有问题——README 里反复提醒过，换一个自己账号的新鲜 Cookie 就能跑通。

（此处插入截图：网页端 PyWebIO 解析界面、Swagger `/docs` 页面）

---

## 给 AI 编程助手的提示词

```text
## 目标
在本地把 Douyin_TikTok_Download_API 跑起来，能通过网页端或 REST API 解析抖音/TikTok/B 站的视频数据。

## 步骤
克隆仓库，创建虚拟环境安装依赖，Python 用 3.11 或 3.12（3.14 会因为老版本依赖缺预编译包卡住）。把 config.yaml 里的 API.Host_Port 改成一个不需要 root 权限的端口（默认是 80）。如果要测试抖音/TikTok 接口，需要用户自己在浏览器登录抖音网页版后导出一份新鲜 Cookie，替换 crawlers/douyin/web/config.yaml 和 crawlers/tiktok/web/config.yaml 里 TokenManager 下的 Cookie 字段；仓库自带的示例 Cookie 已过期，直接用会返回 400。B 站接口不需要这一步。最后用 python start.py 启动服务。

## 核查结果
访问 /docs 确认 Swagger 文档能打开；用 curl 请求一个 B 站接口（比如 /api/bilibili/web/fetch_one_video?bv_id=BV1M1421t7hT）确认能拿到真实视频数据；如果测试了抖音/TikTok 接口且仍返回 400，检查是不是 Cookie 没换或者已经过期。

具体命令、代码细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/09/08/douyin-tiktok-download-api-github-project
```

---

## 卸载和下次运行

卸载：删掉整个克隆下来的项目文件夹，连同里面的 `.venv` 虚拟环境一起删掉就行。

下次运行：

```bash
cd Douyin_TikTok_Download_API
source .venv/bin/activate
python start.py
```
