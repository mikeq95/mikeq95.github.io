---
slug: 2026/07/21/langflow-github-project
title: Langflow，用可视化拖拽搭建 AI Agent 和工作流的开源平台
date: 2026-07-21
tags:
  - github
  - AI
description: "Langflow 是一个开源的可视化 AI 工作流构建平台，拖拽节点就能搭多 Agent 编排，也能随时切到 Python 源码自定义组件，支持导出成 API、JSON 或 MCP Server。这篇记录一下它的原理、安装方式和使用体验。"
---

搭 AI Agent 工作流经常卡在"想快速试想法，又不想从零手写胶水代码"这个中间地带。翻到 [Langflow](https://github.com/langflow-ai/langflow) 这个项目——⭐ 15 万+，MIT 协议，开源社区里数一数二热门的可视化 AI 工作流平台，用下来觉得值得写一篇。

{/* truncate */}

---

## 它是什么

Langflow 是一个开源的 AI Agent / 工作流构建平台，核心是一个可视化拖拽界面——把不同功能的节点（模型调用、检索、工具、条件分支等）拖到画布上连线，就能搭出一条完整的工作流,不用从零手写胶水代码。

它没有把自己限制成"纯拖拽工具"：每个节点背后都能打开源码用 Python 自定义，拖拽搭建和写代码可以随时切换。搭好的流程还能一步步单独执行调试,方便定位是哪个节点出的问题,而不是整条流程跑完才知道结果不对。

---

## 安装

推荐用 `uv` 装（需要 Python 3.10–3.14）：

```bash
uv pip install langflow -U
uv run langflow run
```

默认在 `http://127.0.0.1:7860` 本地跑起来。

也提供 Windows/macOS 的桌面客户端（依赖都打包好了，装完直接用），或者用 Docker：

```bash
docker run -p 7860:7860 langflowai/langflow:latest
```

想改源码的话也可以走克隆仓库的开发模式安装。

---

## 实际使用感受

### 多 Agent 编排

除了单条工作流，Langflow 支持多个 Agent 之间的协作编排，带对话状态管理，适合需要"多个角色分工"的复杂场景，而不只是单个 Agent 单轮问答。

### 部署方式灵活

搭好的工作流可以导出成 JSON 文件方便分享和版本管理，也可以直接暴露成 API 接口，或者包装成 MCP Server 接入 Claude Code 这类支持 MCP 协议的客户端，不用重新写一层适配代码。

### 生态覆盖广

主流的 LLM 服务商和向量数据库基本都能接，也原生支持接入 LangSmith、LangFuse 这类可观测性平台，方便追踪线上跑的工作流具体发生了什么。

---

## 总结

如果想快速验证一个 AI Agent 的想法、又不想在项目早期就陷入大量胶水代码，Langflow 的"拖拽为主、随时能看源码"的模式是个效率不错的起点；真到了需要精细控制的阶段，节点级别的 Python 自定义和 MCP 导出也留了足够的扩展空间。
