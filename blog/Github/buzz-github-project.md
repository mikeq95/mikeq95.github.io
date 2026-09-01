---
slug: 2026/07/26/buzz-github-project
title: Buzz，一个让人和 AI 代理同处一室的自托管工作台
date: 2026-07-26
tags:
  - github
description: "Buzz 是 Block 开源的自托管团队协作平台，基于 Nostr 协议把聊天、代码评审和 CI 流程都变成同一份事件日志，AI 代理可以像真正的同事一样加入频道、提交代码。这篇整理了它的原理、安装步骤和目前的完成度。"
---

## 介绍

{/* truncate */}

它引入的核心概念叫 community（社区/工作空间）。默认的单中继部署下，一个中继地址对应一个社区；如果是托管的多租户部署，一个后端可以承载多个社区，共享 Postgres、Redis、对象存储这些基础设施，但每个社区的数据、搜索索引、审计链在语义上仍然是隔离的。

代理进到 [Buzz](https://github.com/block/buzz) 里之后，能做的事和人类同事几乎一样：打开仓库、提交补丁、评审代码、跑工作流，也能去语音房间露个面、建个频道拉人进来。给代理加入一个频道，操作跟拉一个人进来没什么两样——有自己的密钥，有自己的频道成员关系，能做什么由身份决定，不是靠权限开关。目前 Goose、Codex、Claude Code 都已经做了 ACP 适配（`buzz-acp`）。

代码层面是一组职责单一的 Rust crate：`buzz-relay` 是核心（Axum WS + REST），`buzz-db`/`buzz-auth`/`buzz-pubsub`/`buzz-search`/`buzz-audit` 各管一摊，`buzz-cli`/`buzz-acp`/`buzz-workflow` 构成代理和自动化那一侧，`git-sign-nostr` 负责把 Git 操作也签成 Nostr 事件。项目今年 3 月才创建，在 GitHub 上已经有 12k+ star。

完成度上，README 给了一张进度表：中继、频道、私信、画布、媒体、搜索、审计日志、桌面应用（Tauri + React）、YAML 工作流、Git 事件（NIP-34）和 Git 托管后端都已经能用；移动端（iOS + Android，Flutter）、工作流审批环节、语音房间的完整生命周期还在接线；跨中继的信誉体系、推送通知这些还只是"强烈的想法，代码没写"。

---

## 安装环境

跑源码最简单的方式是装 [Docker](https://docs.docker.com/get-docker/) 和 [Hermit](https://cashapp.github.io/hermit/)，Hermit 会按仓库锁定的版本自动拉取 Rust、Node、pnpm 这些工具链，这些工具只安装在仓库的 `bin/` 目录里，不会动系统全局环境。如果不想用 Hermit，也可以自己装 Rust 1.88+、Node 24+、pnpm 10+ 和 `just`。

```bash
git clone https://github.com/block/buzz.git && cd buzz
. ./bin/activate-hermit
just setup && just build
```

`just setup` 会自动跑 `just bootstrap`：把 `.env.example` 复制成 `.env`（如果还没有的话）、通过 Hermit 下载所有需要的工具、启动 Docker 服务并跑数据库迁移。

---

## 运行

日常开发，同时起中继和桌面应用：

```bash
. ./bin/activate-hermit
just dev
```

中继会跑在 `ws://localhost:3000`，桌面应用自己弹出来。想把中继日志和前端输出分开看，可以在两个终端里分别跑 `just relay` 和 `just desktop-dev`。

只想试试桌面应用、不想碰源码的话，去 [release 页面](https://github.com/block/buzz/releases/latest)下载现成的包——macOS 是 `.dmg`，Linux 是 `.AppImage` / `.deb`，Windows 是 `.exe`。默认会连到 `ws://localhost:3000`，想连别的中继，启动前设置环境变量 `BUZZ_RELAY_URL`，或者在应用内切换。

只想要一个单节点 / VPS 上的生产中继，可以用 `deploy/compose/` 里现成的 Compose 配置（Postgres、Redis、MinIO，外加可选的 Caddy/TLS）；仓库根目录的 `docker-compose.yml` 只是给日常开发用的。

给代理用的话，设置好 `BUZZ_PRIVATE_KEY`，然后用 [`buzz-cli`](https://github.com/block/buzz/tree/main/crates/buzz-cli)——JSON 进、JSON 出，专门为 LLM 的 tool call 设计。

---

## 效果展示

（此处插入截图：桌面应用里一个频道，人类和一个代理同时在场，围绕一次代码评审来回打表情回应）

---

## AI-friendly

把下面这段丢给 Claude Code、Codex 这类 AI coding agent，让它照着这个流程把项目独立装起来：

```text
帮我把 https://github.com/block/buzz clone 下来并跑起来：
1. git clone https://github.com/block/buzz.git && cd buzz
2. 确保本机已装 Docker；执行 `. ./bin/activate-hermit` 激活 Hermit 锁定的工具链（首次运行会自动下载 Rust 1.88+、Node 24+、pnpm 10+、just，只作用于本仓库目录，不影响系统全局环境）
3. 执行 `just setup && just build` 完成初始化和构建——这一步会生成 .env、拉起 Docker 里的 Postgres/Redis/MinIO 并跑数据库迁移
4. 执行 `just dev` 同时启动中继（ws://localhost:3000）和桌面应用
如果 `just` 命令报缺失或版本不对，参考仓库根目录的 justfile 和 README.md 里 "Build & run from source" 一节。
```

---

## 卸载和下次运行

卸载：Hermit 拉的工具链只放在仓库自己的 `bin/` 目录里，删掉整个仓库目录基本就清干净了；Docker 那边跑着的 Postgres/Redis/MinIO 容器和数据卷，在仓库目录下执行 `docker compose down -v` 可以一并停掉、删掉。如果你是自己另外装的系统级 Rust/Node/pnpm（没走 Hermit），需要用对应的工具自己卸载。

下次运行：不用重新走一遍安装，直接执行：

```bash
. ./bin/activate-hermit && just dev
```

---

## 总结

Buzz 的思路是让聊天、代码托管、CI、发布这些工具共用同一份事件日志和同一套身份模型，而不是简单地把它们攒在一起。团队里如果已经有代理在跑日常任务，这一点会更明显——代理拿到的是和人类同事一样的房间、频道、审计记录，不是单独隔出来的"机器人专区"。项目今年 3 月才创建，移动端和部分工作流功能还在完善，Block 内部已经在用自己的托管版本；想自托管的话，目前更适合愿意自己搭 Docker、Postgres 这套基础设施的团队。
