---
title: "🌐 macOS 网络重置命令速查"
date: 2026-05-16
tags:
  - macos
---


> 一般情况下，只需运行 **DNS 刷新 + DHCP 重置** 即可解决大多数网络问题。

---

## 常用命令（按推荐顺序）

### 1. 刷新 DNS 缓存


```bash
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

### 2. 释放并重新获取 IP（DHCP）

```bash
sudo ipconfig set en0 DHCP
```

### 3. 重启 Wi-Fi

```bash
networksetup -setairportpower en0 off && networksetup -setairportpower en0 on
```

### 4. 重启网络接口

```bash
sudo ifconfig en0 down && sudo ifconfig en0 up
```

---

## 🔧 完整重置网络设置（较彻底）

删除网络偏好设置文件，重启后自动重建：

```bash
sudo rm /Library/Preferences/SystemConfiguration/com.apple.network.identification.plist
sudo rm /Library/Preferences/SystemConfiguration/NetworkInterfaces.plist
sudo rm /Library/Preferences/SystemConfiguration/preferences.plist
```

> ⚠️ **注意：** 执行后需重启 Mac，所有网络配置将重置为默认状态，Wi-Fi 等需重新配置。

---

## 📌 补充说明

|接口|说明|
|---|---|
|`en0`|通常为 Wi-Fi 无线网卡|
|`en1`|通常为有线以太网卡|

如不确定接口名称，可运行 `ifconfig` 查看确认。