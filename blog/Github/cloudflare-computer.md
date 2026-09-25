---
slug: 2026/09/08/cloudflare-computer-github-project
title: Cloudflare Computer：给 Agent 一台云端工作电脑
date: 2026-09-08
tags: [github, open-source, AI]
description: Cloudflare Computer 是开源预览库，在 Durable Object 里放一个持久虚拟文件系统，并接上 Worker Shell、Worker JavaScript、Linux 容器三种执行后端。本文按官方文档整理，用 Claude Code 经 MCP 接入作为默认演示。项目仍是早期预览，不建议上生产。
---

{/* truncate */}

## 它是什么

[Cloudflare Computer](https://github.com/cloudflare/computer) 给 AI agent 一块**云上的工作目录**：文件存在 Durable Object 的 SQLite 里，重启还在；需要跑命令时，再选一种执行后端。

可以把它想成：不是把你的 Mac 插给模型，而是在 Cloudflare 上给每个 agent 租一张书桌。轻活用 Worker，重活再开 Linux 容器。两边看到的是**同一份文件**，不用来回拷。

库开源（MIT），包名 `@cloudflare/computer`。官方说得很清楚：现在是预览，API 会变，适合实验，不适合生产。单个 workspace 大约 **10GB**（和 Durable Object 存储共用），适合 agent 工作目录，不适合塞整个大仓库。

仓库：[github.com/cloudflare/computer](https://github.com/cloudflare/computer)

## 能干什么（官方能力一览）

**文件系统 `workspace.fs`**  
接口接近 `node:fs/promises`：`readFile` / `writeFile` / `mkdir` / `readdir` / `rm` / `grep`。可以只开这一层，不接任何执行后端。也可以把 R2 桶只读挂到某个目录。

**执行 `workspace.runtime.exec()`**  
所有命令走这一个入口，用 `{ backend }` 选后端：

| 后端 | 干什么 | 需要 |
|---|---|---|
| Worker Shell | 在 Dynamic Worker 里用 [just-bash](https://github.com/vercel-labs/just-bash) 跑命令，快，不经过第二份存储 | Worker Loader + `experimental` |
| Worker JavaScript | 在全新 Dynamic Worker 里跑一段 JS 模块 | 同上 |
| Container | 完整 Linux：真二进制、`npm`、出网。容器里的 `computerd` 用 FUSE 挂上同一份文件，改动同步回 Durable Object | Cloudflare Containers；本地开发要 Docker |

一个 Workspace 可以同时挂多个后端。Worker Shell 还可按需引入内置命令组：`curl`、`git`、`python`、`jq` 等，不用的不会打进包。

**给模型用的工具**  
`@cloudflare/computer/tools` 提供 AI SDK 工具：`read`、`ls`、`find`、`grep`、`write`、`edit`、`delete`，按需再开 `exec`。模型靠每条后端的 `description` 决定走 Worker 还是容器。

**Git**  
`workspace.git` 直接打在 SQLite 文件系统上（isomorphic-git），不必须开容器。可 clone / add / commit。

**往外送文件**  
可把 workspace 里的文件发到 R2，换签名链接（官方叫 assets / publish）。

**性能（官方基准一句话）**  
小文件、stat、git 这类 agent 常见活，FUSE 不差，有时比容器硬盘还快；大文件连续读写和整包 `npm install` 明显慢。别拿它当通用大磁盘去解压巨型 tarball。详见 [docs/19_performance.md](https://github.com/cloudflare/computer/blob/main/docs/19_performance.md)。

**钱**  
包免费。跑起来按 Cloudflare 用量：只用 DO + Worker Shell，可先试 Workers 免费档；要完整 Linux 容器，基本需要 **Workers Paid（约 $5/月）**，再加容器 CPU / 内存 / 磁盘 / 出网。模型费用另算。

## 默认演示：用 Claude Code 接上它

Claude Code 本身用的是你电脑。接 Computer 之后，多出来的是一台**远程 workspace**，适合「云上持久目录 + 必要时 Linux」，不是替换本地仓库。

官方示例就是这条路：[examples/mcp](https://github.com/cloudflare/computer/tree/main/examples/mcp)。对外只暴露一个 MCP 工具 `code`，模型在里面调 `codemode.read/write/edit/ls/exec`。默认 `worker-shell`；要 `npm`、编译、系统依赖时指定 `container-shell`。

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

具体文件名以你本机 Claude Code 版本为准，token 尽量放进客户端的密钥存储，不要明文进 git。

### 3. 试两句

先试轻活（走 Worker Shell）：

```text
Create /workspace/hello.txt, read it back, and list the workspace files.
```

再试重活（走容器）：

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

## 自己在 Worker 里用（不经过 Claude Code）

最小形态：只要文件系统。

```ts
import { withWorkspace, getWorkspace } from "@cloudflare/computer";
import { DurableObject } from "cloudflare:workers";

export class Agent extends withWorkspace(
  class extends DurableObject<Env> {},
  (self) => ({ storage: self.ctx.storage }),
) {}

export default {
  async fetch(_request: Request, env: Env): Promise<Response> {
    const id = env.Agent.idFromName("user-123");
    using ws = await getWorkspace(env.Agent.get(id));

    await ws.fs.writeFile("/notes.md", "- [ ] ship it\n");
    const notes = await ws.fs.readFile("/notes.md", "utf8");
    return new Response(notes);
  },
} satisfies ExportedHandler<Env>;
```

```jsonc
{
  "compatibility_flags": ["nodejs_compat"],
  "durable_objects": {
    "bindings": [{ "name": "Agent", "class_name": "Agent" }]
  },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["Agent"] }]
}
```

要跑命令、又不想上容器，加 Worker Shell：

```ts
import { WorkerShellBackend } from "@cloudflare/computer/backends/worker-shell";

// backends: [
//   new WorkerShellBackend({
//     loader: self.env.LOADER,
//     workspace: { binding: "Agent", id: self.ctx.id.toString() },
//     ctx: self.ctx,
//   }),
// ]
```

```jsonc
{
  "compatibility_flags": ["nodejs_compat", "experimental"],
  "worker_loaders": [{ "binding": "LOADER" }]
}
```

```ts
using ws = await getWorkspace(env.Agent.get(id));
await ws.fs.writeFile("/hello.txt", "world");
using run = await ws.runtime.exec("cat /hello.txt");
const { stdout, exitCode } = await run.result();
```

`npm install`、pandoc、系统包这类活，换成容器后端。官方 [tutorial](https://github.com/cloudflare/computer/tree/main/examples/tutorial) 就是：Durable Object 里写 markdown 菜谱，容器里 `pandoc` 转 PDF，再丢到 R2 换链接——文件始终在同一个 workspace 里。

给自己的 agent 挂工具：

```ts
import { createAITools } from "@cloudflare/computer/tools";

const tools = createAITools({
  workspace,
  shell: {
    defaultBackend: "shell",
    backends: {
      shell: { description: "Fast Worker shell for file and text tasks." },
      container: { description: "Full Linux: npm, binaries, network." },
    },
  },
});
```

## 现在别指望的事

- 不是 Claude Code 官方插件，也不是「免费云电脑 SaaS」。要自己部署 Worker。
- Worker Loader 仍标 `experimental`；设计文档 `docs/` 写的是目标，不等于今天全实现了。
- 容器冷启动比 Worker 慢；大 I/O 会疼。
- 官方 MCP 示例没有按用户隔离，也没有自动在失败时换后端。

先把 MCP 连上 Claude Code，能读写 `/workspace`、能 `exec`，这篇的目的就达到了。要深入再看包 README 和 `examples/`。
```

相对你原稿，主要改了三处：开头用人话对齐「云端书桌」；默认路径改成 Claude Code + 官方 MCP；文件系统 / 三后端 / git / 工具 / R2 / 性能 / 计费 / 限制压成一张能力表，源码 monorepo 和长基准数字拿掉了。需要再短一截或改回你原来的标题口吻，可以说一下。