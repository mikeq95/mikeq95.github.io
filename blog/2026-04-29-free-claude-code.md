---
title: Claude Code 免费模型接入使用说明
date: 2026-04-29
tags:
  - "#claude"
  - "#github"
---
# 🚀 每次开机使用指南

## 快速启动（两步完成）

### 第一步：启动服务器（终端 1）

```bash
cd free-claude-code
uv run uvicorn server:app --host 0.0.0.0 --port 8082
```

> ✅ **成功标志：** 看到 `Uvicorn running on http://0.0.0.0:8082` 提示 ⚠️ **注意：** 不要关闭此窗口，必须保持运行状态

---

### 第二步：启动 Claude Code（终端 2）

新开一个终端窗口，运行：

```bash
ANTHROPIC_AUTH_TOKEN="freecc" ANTHROPIC_BASE_URL="http://localhost:8082" claude
```

---

## ⚙️ 切换模型配置

根据需求修改 `.env` 文件来切换底层模型：

**切换为 Kimi K2**（编程能力最强）

```bash
sed -i '' 's|MODEL="nvidia_nim/z-ai/glm4.7"|MODEL="nvidia_nim/moonshotai/kimi-k2-instruct"|' /Users/a1234/free-claude-code/.env
```

**切换为 GLM-4.7**（中文能力较强）

```bash
sed -i '' 's|MODEL="nvidia_nim/moonshotai/kimi-k2-instruct"|MODEL="nvidia_nim/z-ai/glm4.7"|' /Users/a1234/free-claude-code/.env
```

**验证当前模型**

```bash
grep MODEL /Users/a1234/free-claude-code/.env
```

---

## 🔄 应用更改

修改模型后，需重启服务器才能生效：

1. 在终端 1 按 `Ctrl+C` 停止当前服务
2. 重新运行启动命令：

```bash
cd free-claude-code
uv run uvicorn server:app --host 0.0.0.0 --port 8082
```

---

## 📝 注意事项

|事项|说明|
|---|---|
|🟢 保持运行|终端 1（服务器）必须一直开着，关闭后 Claude Code 将无法连接|
|💡 显示说明|底层使用 NVIDIA NIM 免费模型，界面显示 "Sonnet 4.6" 属正常现象|
|⏱️ 使用限额|免费额度限制为 **40 次 / 分钟**|
|🔒 安全提醒|请勿将 API Key 泄露给他人|