---
slug: 2026/09/01/install-omarchy-on-apple-silicon-mac-via-parallels
title: 在 M 芯片 Mac 上用 Parallels 安装 Omarchy
date: 2026-09-01
tags:
  - macos
  - github
description: "在 Mac 上用 Parallels Desktop 安装 Omarchy 全过程"
---

## 1. 写在前面

### 1.1 适用环境
- M1 / M2 / M3 等 Apple Silicon Mac
- 只用虚拟机，不装双系统
- 虚拟机软件是 [Parallels Desktop](https://www.parallels.com/products/desktop/)

### 1.2 安装思路
官方 [Omarchy](https://omarchy.org) ISO 是 x86_64，不能在 M 芯片上直接虚拟化。  
正确顺序是：

1. 用 Archboot 先装 Arch Linux ARM
2. 再运行社区脚本装 Omarchy
3. 最后装 Parallels Tools 和动态分辨率

这不是官方支持的路径，但可以稳定进桌面。

### 1.3 需要准备的东西
- 可用的网络
- 大约 40 分钟安装时间
- 一个**全小写**的 Linux 用户名  
  例如 `amy`，不要用 `Amy`

## 2. 下载安装镜像

### 2.1 Archboot ARM64 下载地址
打开：

https://release.archboot.com/aarch64/latest/iso/

### 2.2 选择正确的 ISO 文件
页面里会有很多文件。注意：

- 只有大约 **1K** 的是 `.sig` 签名文件，不是系统盘
- 要下体积大约 **473MB / 473266k** 的 ISO
- 文件名通常带 `aarch64` 和 `.iso`
- Safari 可能把文件名显示不全，以大小为准

同目录里那个很小的 `.iso.sig` 可以一起下，用于校验，不是必须。

### 2.3 校验签名（可选）
如果你已经装了 GnuPG：

```bash
cd ~/Downloads
gpg --keyserver hkps://keyserver.ubuntu.com --recv-keys 5B7E3FB71B7F10329A1C03AB771DF6627EDF681F
gpg --verify archboot-*.iso.sig archboot-*.iso   # 验证 ISO 是否被篡改
```

## 3. 创建虚拟机

### 3.1 新建虚拟机
Parallels：

**File → New → Install Windows or another OS from a DVD or image file**

选刚刚下载的 Archboot ISO。

### 3.2 操作系统类型
如果提示无法识别系统：

- 优先选 **Manjaro Linux**
- 没有这个选项就选 **Other Linux**

### 3.3 硬件配置
建议：

- CPU：4
- 内存：8 GB
- 磁盘：64 GB，可扩展
- 网络：Shared Network
- 3D 加速：最高

### 3.4 固件与启动项
- 固件：EFI ARM64
- Secure Boot：关闭
- 启动顺序：硬盘优先，光盘不要排在最前

创建完成后先启动一次，确认能进 Archboot。

## 4. 安装 Arch Linux ARM

### 4.1 启动安装程序
启动菜单选：

**1 Launch Archboot Setup**

进入后按这个顺序做：

1. Prepare Storage Device
2. Install Packages
3. Configure System
4. Install Bootloader

### 4.2 分区方案
选择安装磁盘，一般是 `/dev/sda`。  
推荐填法：

- EFI System Partition（ESP）：`512`
- Swap：`256`（也可以填 `0` 跳过）
- `/` 的大小：填 `0`  
  `# 0 表示不单独分 /home，剩余空间全部给根分区`
- 文件系统：`btrfs`
- 确认 btrfs 时选 Yes

### 4.3 软件包与系统配置
建议选择：

- 编辑器：NANO
- Mkinitcpio Early Userspace：SYSTEMD
- 主机名、时区、语言按自己需要填
- root 密码记下来
- 普通用户名必须小写，例如 `amy`
- 显示名可以写成 `Amy`

### 4.4 启动器
选：

**SYSTEMD-BOOT**

如果弹出 nano 编辑启动配置，一般不用改。  
`Ctrl + X` 退出，不保存即可。

### 4.5 重启并进入系统
安装结束后：

1. 先在虚拟机里卸载光盘，或关机后  
   **Devices → CD/DVD → Disconnect**
2. 再重启
3. 启动菜单选 **Arch Linux**，按 Enter

登录时用户名大小写必须一致。  
`amy` 和 `Amy` 不是同一个账号。

## 5. 初始化系统

登录后先切到 root：

```bash
su -    # 输入 root 密码，变成管理员
```

### 5.1 创建用户与权限
如果安装时已经建了小写用户，执行：

```bash
usermod -aG wheel amy     # 把 amy 加入管理员组
echo '%wheel ALL=(ALL:ALL) ALL' > /etc/sudoers.d/wheel
chmod 440 /etc/sudoers.d/wheel
id amy                    # 确认用户存在，且包含 wheel
```

如果用户名是 `Amy` 这种大写，不要改正在使用的账号。  
新建一个小写用户：

```bash
useradd -m -g amy -G wheel -s /bin/bash amy   # 若组 amy 已存在，用 -g amy
passwd amy                                    # 给新用户设密码
id amy
```

后面安装 Omarchy 一律用这个小写用户。

### 5.2 更新基础软件

```bash
pacman -Syu --needed curl gnupg git base-devel sudo openssh xdg-user-dirs jq docker
```

### 5.3 开启 SSH

```bash
systemctl enable --now sshd    # 立即启动并开机自启 SSH
usermod -aG docker amy
ip -br address                 # 查看虚拟机 IP，常见是 10.211.55.x
```

### 5.4 从 Mac 连接虚拟机
在 **Mac 自己的终端**执行，不要在虚拟机里执行 `scp`：

```bash
ssh amy@10.211.55.12    # 把 IP 换成你刚才看到的地址
```

进去后再：

```bash
su -
```

重启后 IP 可能会变成 `10.211.55.13` 这类地址，连不上就回虚拟机再看一次 `ip -br address`。

## 6. 安装 Omarchy

### 6.1 获取安装脚本
在 Mac 终端：

```bash
cd ~/Documents
git clone https://github.com/nahime0/omarchy-parallels.git
cd omarchy-parallels
scp scripts/omarchy-parallels-arm64-bootstrap.sh amy@10.211.55.12:/tmp/
```

回到虚拟机 root 终端：

```bash
install -m 0700 /tmp/omarchy-parallels-arm64-bootstrap.sh /root/omarchy-parallels-arm64-bootstrap.sh
```

如果 `/tmp` 里没有脚本，但 `/root` 里已经有，可以直接用 `/root` 那份。

### 6.2 填写用户变量
用户名必须全小写，并且系统里已经存在：

```bash
OMARCHY_USER=amy OMARCHY_FULL_NAME="Amy" bash /root/omarchy-parallels-arm64-bootstrap.sh
```

脚本要求用户名符合：

```text
^[a-z_][a-z0-9_-]*$
```

也就是只能小写字母、数字、下划线、短横线。

### 6.3 修正脚本下载地址
如果一运行就出现 `curl: (22) 404`，先改脚本里的两个地址：

```bash
sed -i \
  -e 's#STABLE=https://github.com/maralcbr/omarchy-mx-mac/releases/latest/download#STABLE=https://raw.githubusercontent.com/maralcbr/omarchy-mx-mac/main/default#' \
  -e 's#CHANNEL=https://github.com/maralcbr/omarchy-pkgs/releases/download/asahi-quattro-channel#CHANNEL=https://github.com/maralcbr/omarchy-pkgs/releases/download/asahi-quattro-channel-25#' \
  /root/omarchy-parallels-arm64-bootstrap.sh
```

确认：

```bash
grep -E '^(STABLE|CHANNEL)=' /root/omarchy-parallels-arm64-bootstrap.sh
```

应显示：

```text
STABLE=https://raw.githubusercontent.com/maralcbr/omarchy-mx-mac/main/default
CHANNEL=https://github.com/maralcbr/omarchy-pkgs/releases/download/asahi-quattro-channel-25
```

### 6.4 安装依赖并执行脚本
如果提示缺少 `jq`：

```bash
pacman -S --needed --noconfirm jq
OMARCHY_USER=amy OMARCHY_FULL_NAME="Amy" bash /root/omarchy-parallels-arm64-bootstrap.sh
```

这一步大约 20 到 40 分钟，不要中断。

进度和报错在：

```text
/root/omarchy-vm-install.log
```

### 6.5 完成校验
如果最后停在 `verify-installation`，先检查：

```bash
cat /usr/share/omarchy/version
ls -l /home/amy/.local/state/omarchy/done/finalize-user
systemctl is-enabled NetworkManager.service sddm.service systemd-resolved.service
pacman -Q omarchy-dev omarchy-settings-dev omarchy-nvim quickshell-git mise yay
id amy
pacman -Qkk omarchy-dev | tail
```

若 `id amy` 里没有 `docker`：

```bash
getent group docker || groupadd docker
usermod -aG docker amy
systemctl enable docker.service
id amy
```

然后重启：

```bash
systemctl reboot
```

### 6.6 首次进入桌面
重启后应进入 Omarchy 图形界面。

桌面上的 **Update System** 先不要点。  
虚拟机里的更新有可能改掉 Arch Linux ARM 的软件源。

打开终端：

- `Command + Enter`
- 或 `Command + Space`，搜索 `terminal` / `kitty`

## 7. 安装 Parallels Tools

### 7.1 挂载 Tools 镜像
不要再挂 Archboot 那张 ISO。

先在虚拟机里卸载旧光盘：

```bash
sudo umount /mnt/prltools
sudo umount /run/media/amy/ARCHBOOT
```

然后在 Parallels：

**Devices → CD/DVD → Disconnect**  
提示光盘仍被占用时，选 **Disconnect Anyway**。

再：

**Devices → CD/DVD → Connect Image...**

按 `Command + Shift + G`，打开：

```text
/Applications/Parallels Desktop.app/Contents/Resources/Tools
```

选择：

```text
prl-tools-lin-arm.iso
```

这是 Apple Silicon 专用的 Linux Tools。

### 7.2 执行安装

```bash
sudo mkdir -p /mnt/prltools
sudo mount /dev/sr0 /mnt/prltools     # sr0 是光驱，字母是 s-r-零
ls /mnt/prltools
```

正确内容应类似：

```text
installer
tools
install
install-gui
version
```

如果看到的是 `boot`、`EFI`、`efi.img`，说明挂错盘了，回到上一步重挂。

确认无误后：

```bash
sudo /mnt/prltools/install
```

### 7.3 重启并确认服务

```bash
sudo reboot
```

进桌面后：

```bash
systemctl is-enabled prltoolsd
systemctl is-active prltoolsd
```

应分别是 `enabled` 和 `active`。

启动菜单如果停在 `Arch Linux`：

1. 用鼠标点一下虚拟机窗口
2. 用 **Actions → Send Keys → Return**
3. 不要选 `Reboot Into Firmware Interface`

## 8. 配置桌面集成

### 8.1 安装动态分辨率
用普通用户 `amy` 执行，不要用 root：

```bash
curl -fsSL -o /tmp/install-parallels-hyprland-dynamic-resolution.sh \
  https://raw.githubusercontent.com/nahime0/omarchy-parallels/main/scripts/install-parallels-hyprland-dynamic-resolution.sh
bash /tmp/install-parallels-hyprland-dynamic-resolution.sh
```

### 8.2 检查窗口缩放
1. 拖动 Parallels 窗口边缘
2. 鼠标移出窗口
3. 等大约 2 秒

桌面分辨率应跟着变化。

检查服务：

```bash
systemctl --user status parallels-dynamic-resolution.service
```

### 8.3 剪贴板与鼠标
Tools 和分辨率脚本都完成后，通常可以：

- Mac 和虚拟机之间复制文字
- 鼠标移出窗口时自动释放

如果 SSH 超时，先在虚拟机里重新查看 IP：

```bash
ip -br address
```

再用新 IP 连接。

## 9. 日常使用

### 9.1 常用快捷键
Mac 上 Super 键一般是 **Command**：

- `Command + Space`：Omarchy 菜单
- `Command + Enter`：终端
- `Command + K`：快捷键说明

### 9.2 建议的快照节点
在 Parallels 里建议各做一次快照：

1. Arch Linux ARM 刚装完
2. Omarchy 桌面能进之后
3. Parallels Tools 和分辨率都正常之后

### 9.3 系统更新注意
更新前先做快照。

更新后确认这些还在：

```bash
uname -m
pacman -Q linux-aarch64 omarchy-dev hyprland
systemctl is-active NetworkManager sddm prltoolsd
systemctl --user is-active parallels-dynamic-resolution.service
```

`uname -m` 应是 `aarch64`。

## 10. 附录

### 10.1 推荐配置一览

| 项目 | 建议值 |
|---|---|
| 虚拟机系统类型 | Manjaro Linux 或 Other Linux |
| CPU | 4 |
| 内存 | 8 GB |
| 磁盘 | 64 GB |
| 根文件系统 | Btrfs |
| ESP | 512 MB |
| 启动器 | systemd-boot |
| 用户名 | 全小写 |
| Tools 镜像 | `prl-tools-lin-arm.iso` |
| Omarchy | 4.0.1-mac.2 或同通道更新版本 |

### 10.2 常用检查命令

```bash
ip -br address
id amy
cat /usr/share/omarchy/version
systemctl is-active sddm prltoolsd sshd
systemctl --user is-active parallels-dynamic-resolution.service
ls /mnt/prltools
```

### 10.3 参考链接
- Archboot ISO：https://release.archboot.com/aarch64/latest/iso/
- 安装脚本仓库：https://github.com/nahime0/omarchy-parallels
- Omarchy MX Mac：https://github.com/maralcbr/omarchy-mx-mac
- 软件包通道：https://github.com/maralcbr/omarchy-pkgs

---

装完后先用几天，确认缩放、剪贴板、终端都正常，再考虑更新。  
后面要改主机名、装中文输入法，或修某个具体报错，直接说即可。
