---
slug: 2025/05/16/quick-reference-for-macOS network-reset-commands
title: "🌐 macOS 网络重置命令速查"
date: 2026-05-16
image: https://cdn.mikeq95blog.uk/coverimage/%E8%8B%B9%E6%9E%9C%E7%94%B5%E8%84%91%E7%BD%91%E7%BB%9C%E9%87%8D%E5%88%B6%E5%91%BD%E4%BB%A4.png
tags:
  - macos
description: "一张速查卡：macOS 常见网络故障的终端修复命令，包含 DNS 刷新、DHCP 重置等，遇到断网问题直接查。"
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
