---
slug: 2025/05/16/quick-reference-for-macOS network-reset-commands
title: "🌐 macOS Network Reset Commands — Quick Reference"
date: 2026-05-16
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

### 3. Restart Wi-Fi

```bash
networksetup -setairportpower en0 off && networksetup -setairportpower en0 on
```

### 4. Restart Network Interface

```bash
sudo ifconfig en0 down && sudo ifconfig en0 up
```

---

## 🔧 Full Network Settings Reset (more thorough)

Delete network preference files — they will be automatically rebuilt after reboot:

```bash
sudo rm /Library/Preferences/SystemConfiguration/com.apple.network.identification.plist
sudo rm /Library/Preferences/SystemConfiguration/NetworkInterfaces.plist
sudo rm /Library/Preferences/SystemConfiguration/preferences.plist
```

> ⚠️ **Note:** A Mac restart is required after running these. All network configurations will be reset to defaults — Wi-Fi and other settings will need to be reconfigured.

---

## 📌 Notes

| Interface | Description |
|-----------|-------------|
| `en0` | Usually the Wi-Fi wireless adapter |
| `en1` | Usually the wired Ethernet adapter |

If you're unsure of your interface name, run `ifconfig` to check.
