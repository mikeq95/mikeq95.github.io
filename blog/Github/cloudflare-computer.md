---
slug: 2026/09/25/cloudflare-computer-github-project
title: Cloudflare Computer
date: 2026-09-25
tags: [github, open-source, AI]
description: Cloudflare Computer，给 Agent 一块云上的工作目录
---

{/* truncate */}

## 它是什么

[Cloudflare Computer](https://github.com/cloudflare/computer) 给 AI agent 一块**云上的工作目录**：文件落在 Durable Object 的 SQLite 里，重启还在；要跑命令时，再选一种执行后端。

可以把它想成：不是把你的 Mac 插给模型，而是在 Cloudflare 上给每个 agent 租一张书桌。轻活用 Worker，重活再开 Linux 容器。两边看到的是**同一份文件**，不用来回拷。

库开源（MIT），包名 [`@cloudflare/computer`](https://github.com/cloudflare/computer)。官方写得很清楚：现在是早期预览，API 会变，适合实验，不适合当生产底座。单个 workspace 大约 **10GB**（和 Durable Object 存储共用），够 agent 工作目录，不够塞整个大仓库。

仓库：[github.com/cloudflare/computer](https://github.com/cloudflare/computer)

---

## 一张图看完能力

### 文件系统 `workspace.fs`

接口接近 `node:fs/promises`：`readFile` / `writeFile` / `mkdir` / `readdir` / `rm` / `grep`。可以只开这一层，不接任何执行后端。也可以把 R2 桶只读挂到某个目录。

### 执行 `workspace.runtime.exec()`

所有命令走同一个入口，用 `{ backend }` 选后端：

| 后端 | 适合做什么 | 前提 |
| --- | --- | --- |
| Worker Shell | 在 Dynamic Worker 里用 [just-bash](https://github.com/vercel-labs/just-bash) 跑命令；快，不经过第二份存储 | Worker Loader + `experimental` |
| Worker JavaScript | 在全新 Dynamic Worker 里跑一段 JS 模块 | 同上 |
| Container | 完整 Linux：真二进制、`npm`、出网。容器里的 `computerd` 用 FUSE 挂上同一份文件，改动同步回 Durable Object | Cloudflare Containers；本地开发要 Docker |

一个 Workspace 可以同时挂多个后端。Worker Shell 还可按需引入内置命令组：`curl`、`git`、`python`、`jq` 等，不用的不会打进包。

### 给模型用的工具

`@cloudflare/computer/tools` 提供 AI SDK 工具：`read`、`ls`、`find`、`grep`、`write`、`edit`、`delete`，按需再开 `exec`。模型靠每条后端的 `description` 决定走 Worker 还是容器。

官方 MCP 示例更进一步：对外只暴露一个 `code` 工具，模型在里面调 `codemode.read / write / edit / ls / exec`。

### Git、往外送文件、性能、钱

- **Git**：`workspace.git` 直接打在 SQLite 文件系统上（isomorphic-git），clone / add / commit 不必开容器。
- **往外送**：可把 workspace 里的文件发到 R2，换签名链接（官方叫 assets / publish）。
- **性能**：小文件、stat、git 这类 agent 常见活，FUSE 不差，有时比容器硬盘还快；大文件连续读写和整包 `npm install` 明显慢。别拿它当通用大磁盘去解压巨型 tarball。详见 [docs/19_performance.md](https://github.com/cloudflare/computer/blob/main/docs/19_performance.md)。
- **钱**：包免费。跑起来按 Cloudflare 用量——只用 DO + Worker Shell，可先试 Workers 免费档；要完整 Linux 容器，基本需要 **Workers Paid（约 $5/月）**，再加容器 CPU / 内存 / 磁盘 / 出网。模型费用另算。

---

## 默认路径：接到 Claude Code

Claude Code 本身用的是你电脑。接上 Computer 之后，多出来的是一台**远程 workspace**：云上持久目录，必要时再开 Linux。它不是本地仓库的替代品。

官方示例就是这条路：[examples/mcp](https://github.com/cloudflare/computer/tree/main/examples/mcp)。

### 1. 部署 MCP

本机要有 Docker（容器后端用）。按官方模板：

```bash
npm create cloudflare@latest computer-mcp -- \
  --template=cloudflare/computer/examples/mcp
```

按提示部署。然后设一个随机 token，不要用登录密码：

```bash
openssl rand -hex 32
npx wrangler secret put MCP_TOKEN
```

部署成功后，MCP 地址是：

```text
https://<你的worker>.workers.dev/mcp
```

健康检查：`GET /health` 应返回 `ok`，这一步不用 token。

这个示例是**单用户**：所有带对 token 的请求打进同一个 Durable Object。token 别提交进仓库；要服务多人，得自己按用户拆 DO。

### 2. 写进 Claude Code

在 Claude Code 的 MCP 配置里加：

```json
{
  "mcpServers": {
    "computer": {
      "type": "http",
      "url": "https://<你的worker>.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer <MCP_TOKEN>"
      }
    }
  }
}
```

具体文件名以你本机 Claude Code 版本为准。token 尽量放进客户端的密钥存储，不要明文进 git。

### 3. 试两句

先试轻活（默认走 `worker-shell`）：

```text
Create /workspace/hello.txt, read it back, and list the workspace files.
```

再试重活（显式走容器）：

```text
Use container-shell to create a small Node.js project in /workspace, install its dependencies, and run its tests.
```

模型实际会写成类似：

```js
async () => {
  await codemode.write({
    path: "/workspace/package.json",
    content: JSON.stringify({ scripts: { test: "node --test" } }),
  });

  const result = await codemode.exec({
    command: "npm test",
    backend: "container-shell",
  });

  return { exitCode: result.exitCode, stdout: result.stdout };
};
```

容器只在选中 `container-shell` 时才启动；跑命令前后，`/workspace` 会在 Durable Object 和容器 FUSE 之间同步。

本地调试（仓库根目录）：

```bash
npm install
npm run build --workspace @cloudflare/computer
printf 'MCP_TOKEN=development-token\n' > examples/mcp/.dev.vars
npm run dev --workspace @example/computer-mcp
```

连 `http://127.0.0.1:8787/mcp`，token 用 `development-token`。

---

## 现在别指望的事

- 不是 Claude Code 官方插件，也不是「免费云电脑 SaaS」。要自己部署 Worker。
- Worker Loader 仍标 `experimental`；`docs/` 写的是设计目标，不等于今天全实现了。
- 容器冷启动比 Worker 慢；大 I/O 会疼。
- 官方 MCP 示例没有按用户隔离，也不会在失败时自动换后端。
- Worker shell 默认不出网；要 `npm`、编译、系统依赖，得显式选 `container-shell`。

先把 MCP 连上 Claude Code，能读写 `/workspace`、能 `exec`，这篇的目的就达到了。要自己在 Durable Object 里挂文件系统，再看包 README 和 `examples/`。

---

## 参考

- [Cloudflare 官方博文：Your agent needs a computer](https://blog.cloudflare.com/cloudflare-computer/)
- [github.com/cloudflare/computer](https://github.com/cloudflare/computer)
- [examples/mcp](https://github.com/cloudflare/computer/tree/main/examples/mcp)
- [examples/tutorial](https://github.com/cloudflare/computer/tree/main/examples/tutorial)（DO 里写 markdown，容器里 `pandoc` 转 PDF，再丢到 R2）
- [`@cloudflare/think`](https://www.npmjs.com/package/@cloudflare/think)（官方在 Worker 里写 agent 时用的 harness，本文主路径用不到）
```