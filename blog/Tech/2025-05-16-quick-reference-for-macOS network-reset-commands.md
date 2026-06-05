---
slug: 2025/05/16/quick-reference-for-macOS network-reset-commands
title: "🌐 macOS 网络重置命令速查"
date: 2026-05-16
tags:
  - macos
---


> 一般情况下，只需运行 **DNS 刷新 + DHCP 重置** 即可解决大多数网络问题。

{/* truncate */}

---

## 常用命令（按推荐顺序）

### 1. 刷新 [DNS 缓存](https://clearlove7-ai.vercel.app?word=DNS缓存&postId=2025-05-16-quick-reference-for-macOS%20network-reset-commands)


```bash
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

### 2. 释放并重新获取 IP（[DHCP](https://clearlove7-ai.vercel.app?word=DHCP&postId=2025-05-16-quick-reference-for-macOS%20network-reset-commands)）

```bash
sudo ipconfig set en0 DHCP
```
