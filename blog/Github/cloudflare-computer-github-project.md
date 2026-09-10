---
slug: 2026/09/08/cloudflare-computer-github-project
title: Cloudflare Computer，给 Durable Object 装一个虚拟文件系统
date: 2026-09-08
tags: [github, open-source, AI]
description: Cloudflare Computer 是 Cloudflare 开源的一个预览版基础设施库，在 Durable Object 里实现了一个持久化虚拟文件系统，并提供容器、Worker Shell、Worker JavaScript 三种可插拔的执行后端，主要面向需要给 AI agent 一块工作目录的开发者。本文基于源码和官方文档整理，项目还在早期预览阶段，没有实际部署运行。
---

{/* truncate */}

## 介绍

[Cloudflare Computer](https://github.com/cloudflare/computer) 是一个跑在 Durable Object 里的虚拟文件系统。SQLite 保存权威状态，`workspace.fs` 提供一套接近 `node:fs/promises` 的接口——`readFile`、`writeFile`、`mkdir`、`readdir`、`grep`——文件在 Durable Object 重启之后还在。这一层不依赖任何执行后端，只要文件系统、不接执行能力也能单独用。

真正让它有意思的是执行那一侧。`workspace.runtime.exec()` 是唯一的命令入口，具体怎么跑取决于挂载了哪个后端：

- 容器后端把 SQLite 状态投影成一个真实的 FUSE 挂载。sandbox 容器里跑着一个叫 computerd 的守护进程，负责挂载状态，再通过 capnweb RPC 把改动同步回 Durable Object。这条路径给的是完整 Linux 用户态，真实二进制，真实网络。
- Worker Shell 后端在 Dynamic Worker 里跑 [just-bash](https://github.com/vercel-labs/just-bash)，直接通过 Workers RPC 读写 Durable Object 里权威的 Workspace，中间不需要第二份存储，也没有同步往返。
- Worker JavaScript 后端在一个全新的 Dynamic Worker 里跑一段 ECMAScript 模块，带结构化输入输出、持久的相对导入，还有 Workspace 撑起来的 `node:fs/promises`。

一个 Workspace 可以同时挂多个后端，`exec(source, { backend })` 按名字选。整个仓库是 TypeScript 写的 monorepo：`packages/computer` 是发给 Durable Object 用的主包，`packages/dofs` 是底层的 SQLite 虚拟文件系统，`packages/computerd` 是跑在容器里的 FUSE 守护进程本身。

README 里写得很直白：现在是预览阶段，API 不稳定，只适合拿来做实验、探索和原型，不建议放进生产环境。`packages/computer` 目前发布在 npm 的 `unreleased` tag 下，版本号停在 `0.2.1`。

---

## 怎么接入

最小可用的形态是只要文件系统，不接执行后端。给 Durable Object 加上 `withWorkspace`：

```ts
import { withWorkspace, getWorkspace } from "@cloudflare/computer";
import { DurableObject } from "cloudflare:workers";

export class Agent extends withWorkspace(
  class extends DurableObject<Env> {},
  (self) => ({ storage: self.ctx.storage }),
) {}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.Agent.idFromName("user-123");
    using ws = await getWorkspace(env.Agent.get(id));

    await ws.fs.writeFile("/notes.md", "- [ ] ship it\n");
    const notes = await ws.fs.readFile("/notes.md", "utf8");

    return new Response(notes);
  },
} satisfies ExportedHandler<Env>;
```

`wrangler.jsonc` 只需要打开 `nodejs_compat`，再把这个 Durable Object 类注册成 SQLite-backed：

```jsonc
{
  "compatibility_flags": ["nodejs_compat"],
  "durable_objects": {
    "bindings": [{ "name": "Agent", "class_name": "Agent" }]
  },
  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["Agent"] }
  ]
}
```

想跑命令的话，最快的路是接 Worker Shell 后端，不用容器，也不用 Docker：

```ts
import { withWorkspace, getWorkspace } from "@cloudflare/computer";
import { WorkerShellBackend } from "@cloudflare/computer/backends/worker-shell";
import { DurableObject } from "cloudflare:workers";

export class Agent extends withWorkspace(
  class extends DurableObject<Env> {},
  (self) => ({
    storage: self.ctx.storage,
    backends: [
      new WorkerShellBackend({
        loader: self.env.LOADER,
        workspace: { binding: "Agent", id: self.ctx.id.toString() },
        ctx: self.ctx,
      }),
    ],
  }),
) {}
```

这条路径要多打开一个 `experimental` 标志，并且绑定一个 Worker Loader：

```jsonc
{
  "compatibility_flags": ["nodejs_compat", "experimental"],
  "worker_loaders": [{ "binding": "LOADER" }]
}
```

接上之后，`exec` 跑的命令和 `fs` 写的文件是同一份东西：

```ts
using ws = await getWorkspace(env.Agent.get(id));
await ws.fs.writeFile("/hello.txt", "world");
using run = await ws.runtime.exec("cat /hello.txt");
const { stdout, exitCode } = await run.result();
```

如果要的是完整 Linux 环境，跑 `npm install`、编译、装系统依赖，就得换成容器后端。这条路径需要本地跑 Docker，容器镜像里要把 computerd 这个二进制塞进去当 PID 1。

---

## 性能什么样

仓库自带了一份 [`fs-bench` 基准](https://github.com/cloudflare/computer/blob/main/docs/19_performance.md)，在 Cloudflare Containers 的 standard-2 实例上，把 computerd 的 FUSE 挂载和内存里的 tmpfs、容器自带的 ext4 硬盘做对比。

元数据密集的操作上，computerd 反而比真实硬盘快：`stat` 1000 个文件、`rm` 1000 个文件、建一棵 10×10×10 的目录树、`git init` 加提交 100 个文件，这几项耗时都低于 ext4 硬盘——inode 存在内存里，走的是查表，不是磁盘寻道。

大文件的连续读写是短板。写 64 MiB 比 tmpfs 慢了将近 5 倍，纯读 64 MiB 慢了 30 多倍。每释放一个 512 KiB 的 chunk，computerd 都要把它哈希成内容寻址的 blob，这样 Durable Object 才能只同步变化过的部分、去重相同内容，代价落在了吞吐量上。跑一次 [`cloudflare/sandbox-sdk`](https://github.com/cloudflare/sandbox-sdk) 的完整 `npm install`（854 个包，36675 个文件），computerd 挂载花了 124.7 秒，ext4 硬盘 63.9 秒，tmpfs 34.3 秒。

> 简单说，它更适合装一堆小文件、跑几条命令这种 agent 常见的工作方式，不太适合当成通用磁盘去解压大 tarball。

---

## 一个具体例子

官方的 [tutorial 示例](https://github.com/cloudflare/computer/tree/main/examples/tutorial)搭了一个"文字转 PDF 菜谱卡片"的 agent，能说明这套文件系统实际解决的问题：一次 HTTP 请求打进 agent，agent 从 [openstove.org](https://openstove.org/recipes) 抓一份菜谱，把 markdown 卡片写进 workspace，容器里的 `pandoc` 直接把这份文件转成 PDF，再传到 R2 生成一个签名链接返回。

写文件的 `write` 工具跑在宿主的 Durable Object 里，跑命令的 `bash` 工具跑在容器里，但两边看到的是同一个文件——容器通过 FUSE 挂载读到宿主刚写的 markdown，`pandoc` 产出的 PDF 又原样同步回宿主。整个流程没有一步是"把文件复制到另一个地方"，这正是这套 workspace 存在的意义。

---

## 现状和限制

`docs/` 下的设计文档官方标注为"前瞻性的"，写的是打算做成什么样，不是代码今天已经实现了什么。单个 workspace 的容量上限大约 10 GB，跟 Durable Object 共享存储配额；容器侧的文件系统整个放在内存里，适合 agent 规模的工作目录，不适合塞下一整个 monorepo。

三个后端里，容器后端要求跑 Docker；Worker Shell 和 Worker JavaScript 后端依赖 Worker Loader 这个绑定，目前标记为 `experimental`。项目本身也反复强调：这是预览阶段的东西，API 还会变，先别往生产环境里塞。
