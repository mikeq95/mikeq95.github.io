---
slug: 2025/05/16/quick-reference-for-macOS network-reset-commands
title: "🌐 macOS Network Reset Commands — Quick Reference"
date: 2026-05-16
image: /coverimage/macosNetworkResetCommandCoverImage.png
tags:
  - macos
---

> In most cases, running **DNS flush + DHCP reset** is enough to fix the majority of network issues.

{/* truncate */}

---

## Common Commands (in recommended order)

### 1. Flush DNS Cache

```bash
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

### 2. Release and Renew IP Address (DHCP)

```bash
sudo ipconfig set en0 DHCP
```

