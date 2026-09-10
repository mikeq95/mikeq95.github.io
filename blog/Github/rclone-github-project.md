---
slug: 2026/09/09/rclone-github-project
title: rclone，命令行里的云存储瑞士军刀
date: 2026-09-09
tags: [github, open-source, Ai-friendly]
description: rclone 是一个开源命令行工具，用同一套 sync/copy/move/mount 命令操作 S3、Google Drive、OneDrive、Dropbox、Backblaze B2、Cloudflare R2 等几十种云存储，还带客户端加密和去重能力。本文实际装好环境，验证了本地 remote 的同步命令和 crypt 加密 remote。
---

{/* truncate */}

## 🗄️ rclone 是什么

rclone 官方管自己叫"rsync for cloud storage"，一个用 Go 写的命令行工具，GitHub 上已经攒了近 6 万 star，MIT 协议。它不是某一家云盘的客户端，而是把几十种存储服务的操作接口统一成同一套命令——不管对方是 S3 桶还是 Google Drive，`sync`、`copy` 的写法都一样。

维护节奏很稳，最新的 v1.75.1（2026-09-04）刚发不久，上一个大版本 v1.75.0 是 7 月底发的，基本一两个月一版。v1.75.1 这版几乎全是安全修复——压缩包解压时的路径遍历漏洞（zip slip）、squashfs 镜像解析问题、HTTP 跨主机重定向时请求头泄露、本地文件系统里符号链接可能跳出根目录，外加把 Go 依赖升到 1.26.6 修了几个 CVE。

### 📡 真实存储后端

1. **对象存储**：Amazon S3、Cloudflare R2（作为 S3 兼容 provider 接入）、Backblaze B2、阿里云 OSS、腾讯云 COS、华为 OBS、DigitalOcean Spaces、Wasabi、MinIO 等
2. **网盘 / 协作云盘**：Google Drive、Microsoft OneDrive、Dropbox、Box、pCloud、Mega、Yandex Disk 等
3. **企业云**：Google Cloud Storage、Azure Blob/Files、Oracle Cloud Storage 等
4. **传统协议**：WebDAV、FTP、SFTP、SMB/CIFS，以及本地文件系统

v1.75.0 里还新增了两个 S3 provider：Scality 和 Zero Services。

### 🎭 包装类后端

这几个不存数据本身，是在某个真实 remote 外面再包一层能力，可以叠加在任何后端上（包括本地磁盘）：

1. **crypt**：客户端加密，上传前加密、下载后解密
2. **compress**：透明压缩
3. **chunker**：大文件自动分块
4. **union**：把多个 remote 合并成一个虚拟盘
5. **hasher**：给不支持某种哈希算法的后端补一层哈希缓存

---

## 📥 装 rclone

跨平台都有官方装法，任选一种：

1. **包管理器**（macOS/Linux 有包管理器的话最省事）

   ```bash
   brew install rclone
   ```

2. **官方一键脚本**（跨发行版通用）

   ```bash
   sudo -v && curl https://rclone.org/install.sh | sudo bash
   ```

3. **手动下载二进制**：去 [rclone.org/downloads](https://rclone.org/downloads/) 拿对应平台的压缩包，解压后把 `rclone` 可执行文件扔进 `PATH`

我这次是用 Homebrew 装的，装完 Homebrew 打了一行提醒：

```text
==> rclone
Homebrew's installation does not include the `mount` subcommand on macOS which depends on FUSE, use `nfsmount` instead.
```

也就是说 macOS 上的 Homebrew 版本**不带 `mount` 子命令**，因为它依赖 macFUSE，Homebrew 的沙盒构建策略不带这个依赖，想挂载得换成 `rclone nfsmount`，或者用官方一键脚本装自带 mount 支持的版本。

验证装好了没有：

```bash
rclone version
```

```text
rclone v1.75.1
- os/version: darwin 26.6.2 (64 bit)
- os/kernel: 25.6.0 (arm64)
- os/type: darwin
- os/arch: arm64 (ARMv8 compatible)
- go/version: go1.27.1
- go/linking: dynamic
- go/tags: none
```

顺手确认一下是不是最新版：

```bash
rclone version --check
```

```text
yours:  1.75.1
latest: 1.75.1                                   (released 2026-09-04)
beta:   1.76.0-beta.10333.3eee2c0dd              (released 2026-09-08)
```

至此，装环境这一步已经完成。

---

## 🚀 核心命令怎么用

配置靠 `rclone config` 交互式向导，选后端类型、填 API key/endpoint、测连接，保存成一个叫 "remote" 的名字，写进配置文件（macOS 上默认在 `~/.config/rclone/rclone.conf`）。之后所有命令都是 `remote:路径` 这种写法。

常用子命令：

1. **`sync`**（让目标和源一致，会删除目标多出来的文件）

   ```bash
   rclone sync ~/本地目录 remote:远程目录
   ```

2. **`copy`**（只拷贝，不删除目标端多余文件，更安全）

   ```bash
   rclone copy ~/本地目录 remote:远程目录
   ```

3. **`move`**（拷贝后删除源）

   ```bash
   rclone move ~/本地目录 remote:远程目录
   ```

4. **`mount`**（把远程挂载成本地文件系统，需要 FUSE/WinFsp 支持）

   ```bash
   rclone mount remote:远程目录 /本地挂载点
   ```

5. **`serve`**（把 remote 通过 HTTP/WebDAV/FTP/SFTP 协议对外提供服务）

   ```bash
   rclone serve webdav remote:远程目录
   ```

6. **`check`**（校验源和目标文件是否一致）

   ```bash
   rclone check ~/本地目录 remote:远程目录
   ```

7. **`dedupe`**（交互式查找重复文件名并处理，Google Drive 这类允许同名文件的后端常用）

   ```bash
   rclone dedupe remote:目录
   ```

8. **`lsd` / `ls`**（列目录 / 列文件）

   ```bash
   rclone lsd remote:
   rclone ls remote:目录
   ```

9. **`about`**（查看 remote 的配额信息）

   ```bash
   rclone about remote:
   ```

### 🔒 crypt 加密

crypt 不是独立后端，是包在别的 remote 外面的一层：先配好底层 remote，再建一个指向 `remote:path` 的 crypt remote。文件名加密有三种模式——标准模式连文件名和目录结构一起加密（单个文件名上限约 143 字符）、混淆模式只是简单位移、关闭模式则只加个 `.bin` 后缀不动文件名。

> 注意，直接访问底层那个 remote 会绕过加密——读到的是密文，往里面直接写文件反而是明文，这是最容易踩的坑。官方也不建议把整个 remote 根目录都拿去加密，服务商喜欢在根目录塞一些特殊文件，容易冲突，建议单独建个子目录来加密。

因为 crypt 不存哈希，校验要用专门的 `cryptcheck` 而不是 `check`：

```bash
rclone cryptcheck ~/本地目录 crypt-remote:
```

至此，核心命令已经过一遍，实际验证记录看下一节。

---

## ✅ 效果展示（实际跑通记录）

没有真实云账号，所以这次验证用的是本地文件系统当 remote——rclone 把本地路径也当成一种 backend，命令逻辑和真实云存储完全一样，只是不用等网络。

**1. 建一个本地 remote，实际跑 `lsd`/`copy`/`ls`/`check`：**

```bash
rclone config create mylocal local
rclone copy ~/src mylocal:~/dst --progress
```

```text
Transferred:            37 B / 37 B, 100%, 0 B/s, ETA -
Checks:                 0 / 0, -, Listed 4
Transferred:            3 / 3, 100%
Elapsed time:         0.0s
```

```bash
rclone check ~/src mylocal:~/dst
```

```text
NOTICE: Local file system at ~/dst: 0 differences found
NOTICE: Local file system at ~/dst: 3 matching files
```

**2. 验证 `sync` 和 `copy` 的真实差异**——先在目标端塞一个 `copy` 不会碰的多余文件，再跑 `sync`：

```bash
echo "extra file only in dst" > ~/dst/extra.txt
rclone sync ~/src mylocal:~/dst --progress
```

```text
Transferred:              0 B / 0 B, -, 0 B/s, ETA -
Checks:                 4 / 4, 100%, Listed 9
Deleted:                1 (files), 0 (dirs), 23 B (freed)
```

`extra.txt` 真的被删掉了——这就是 `sync` 和 `copy` 的区别，`sync` 会让目标端和源完全一致，`copy` 不会。

**3. 配一个 crypt remote 包住本地 remote，验证加密确实发生了：**

```bash
rclone config create mycrypt crypt remote=mylocal:~/encrypted_store \
  filename_encryption=standard password=$(rclone obscure "test-password")
rclone copy ~/src mycrypt:
```

从 crypt remote 这一侧看，文件名还是明文：

```bash
rclone ls mycrypt:
```

```text
       13 a.txt
       12 b.txt
       12 subdir/c.txt
```

但底层存储上，文件名和内容全变成了乱码：

```bash
find ~/encrypted_store -type f
```

```text
encrypted_store/gklqia00jhvhvb2rh4sqdihia0
encrypted_store/44k6i43o3j9phv9l7atl4ojqkc
encrypted_store/gf9gk4av5jbjdk6lke8r07gimk/cern6f95e6k5vmqmprjmpmc1m8
```

直接读其中一个文件的前几个字节，能看到 rclone crypt 固定的魔数头：

```text
00000000: 5243 4c4f 4e45 0000 dd37 bbfd 23e1 88df  RCLONE...7..#...
```

再用 `cryptcheck` 校验一遍完整性：

```bash
rclone cryptcheck ~/src mycrypt:
```

```text
NOTICE: Encrypted drive 'mycrypt:': 0 differences found
NOTICE: Encrypted drive 'mycrypt:': 3 matching files
```

**没验证到的部分**：因为没有真实云账号，S3、Google Drive、R2 这些真实云存储的配置向导和实际同步没有测试，只验证到本地 remote 这一层——但命令语法和交互流程是一样的，`rclone config` 走一遍向导、填好 key，剩下的 sync/copy/check 命令不用改。`mount` 也没有实际跑，前面提过 Homebrew 版本在 macOS 上不带这个子命令。

---

## 🔍 相关项目和评价

### 同类 / 对标产品

1. [restic](https://restic.net) — 定位不同：rclone 是文件同步/搬运工具，restic 是专门的备份工具，带版本历史、去重、加密。restic 甚至可以直接把任意 rclone remote 当自己的存储后端用，两者更像是配合关系而不是竞品
2. [duplicati](https://www.duplicati.com/) — 图形界面 + 内置调度器 + AES-256/GPG 加密备份，更适合想要"装完就有 GUI 定时跑"的场景；社区常把 rclone 列为它的替代品，但要接受没有现成 GUI
3. [aws-cli](https://aws.amazon.com/cli/) / [s3cmd](https://s3tools.org/s3cmd) — 一份第三方跑分显示，列表操作 rclone 比 AWS CLI 快约 8.9 倍，但单个超大文件上传上 MinIO client 反而比 rclone 快约 33%；s3cmd 定位更轻量，适合简单脚本，不追求后端覆盖广度
4. [Cyberduck](https://cyberduck.io) — 图形客户端，适合手动/临时传输，同一份跑分里传输速度比 rclone 慢了约 3 倍，自动化场景不如 rclone

### 真实槽点

1. **mount 断网后可能卡死**：有用户在 Hacker News 上提到，笔记本挂载 Google Drive 后断网，应用直接永久锁住，超时参数没能完全解决
2. **mount 卸载不干净**：[GitHub issue #7766](https://github.com/rclone/rclone/issues/7766) 记录了 Ctrl+C 中断操作后，FUSE 挂载点可能卡在"Device or resource busy"状态，卸载失败要手动 `fusermount -u` 清理，这个 enhancement 请求目前还开着，没人认领
3. **mount 读取比 copy 慢很多**：[rclone 官方论坛的一个帖子](https://forum.rclone.org/t/download-transfer-speed-via-mount-20x-slower-than-via-copy-sync/39028)确认过，`copy` 走多线程下载，而 mount 场景下 `cp`/文件管理器这类调用方本身是单线程的，实测能差出 20 倍（1MB/s vs 20MB/s），这是已知限制不是 bug
4. **crypt 配置有坑**：需要先建底层 remote 再包一层 crypt，容易忘记"直接访问底层 remote 会看到密文、写进去反而变明文"这个反直觉的地方；[issue #7629](https://github.com/rclone/rclone/issues/7629) 还记录过 exFAT SD 卡场景下 crypt 文件损坏的问题
5. **大文件传输要手动调参数**：单个超大文件（比如 16GB）上传速度明显慢于把同样大小拆成多个文件传，S3 场景下经常需要手动调 `--s3-chunk-size`、`--drive-chunk-size` 才能跑满带宽

### 正面案例

1. Hacker News 上有人分享用 rclone 在 200GB 带宽链路上迁移了 4PB 媒体文件
2. 另一条评论提到 Google Takeout 导出 30TB 数据卡了 8 个月都没成功，换用 rclone 几天内完成迁移
3. 有人用树莓派 4 跑 `rclone serve ftp`，把 Dropbox 代理成局域网内的 FTP 服务器，配合 Backblaze B2 和 systemd 定时任务，搭了一套月成本约 16 美元的备份方案

### 和本博客的关系

本博客的 R2 图床走的是自建的 S3 接口脚本（`npm run upload-image`），不是用 rclone 管理的。不过 Cloudflare R2 本身兼容 S3 协议，rclone 官方文档也专门列出了 [R2 的配置方法](https://rclone.org/s3/#cloudflare-r2)（provider 选 Cloudflare，region 填 `auto`），是社区里管理 R2 存储桶的常见工具之一——如果以后想给图床加一层命令行批量管理或者跨存储备份，rclone 是现成的选项。

---

## 🤖 给 AI 编程助手的提示词

```text
## 目标
在当前系统上装好 rclone，配置至少一个 remote（本地文件系统或任意云存储），并跑通基本的同步/校验命令。

## 步骤
1. 检测系统类型，选合适的方式安装 rclone：有包管理器优先用包管理器，否则用官方脚本 `curl https://rclone.org/install.sh | sudo bash`（Windows 用官方下载的可执行文件）。
2. 装完用 `rclone version` 确认版本号，`rclone version --check` 看是否为最新版。
3. 用 `rclone config create <名字> <类型>` 或交互式 `rclone config` 建一个 remote；没有真实云账号的话先用 `local` 类型对着一个本地目录测试。
4. 找一个小的测试目录，依次跑 `rclone lsd`、`rclone copy`、`rclone sync`、`rclone check`，理解 sync 会删除目标端多余文件而 copy 不会。
5. 如果用户需要加密，指导配置 crypt remote：先确认底层 remote 已经工作，再用 `rclone config create` 建一个 crypt remote 包住它，密码用 `rclone obscure` 处理。
6. 如果用户平台是 macOS 且需要 `mount` 功能，检查 rclone 是否通过 Homebrew 安装——Homebrew 版本不带 mount 子命令，需要改用官方安装脚本或者 `nfsmount`。

## 核查结果
跑 `rclone version` 确认安装成功；用 `rclone lsd <remote>:` 确认 remote 配置成功且能连通；如果测试了 sync/copy，对比操作前后目标端文件列表，确认符合预期（sync 会同步删除，copy 不会）；把这几步的实际输出汇报给用户。

具体命令、参数细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/09/09/rclone-github-project
```

---

## 🗑️ 卸载和下次运行

用 Homebrew 装的话，卸载一条命令：

```bash
brew uninstall rclone
```

配置文件不会跟着一起删，默认在 `~/.config/rclone/rclone.conf`，想彻底清干净的话手动删掉这个目录。

下次运行：只要没卸载，直接用 `rclone` 命令，之前配置好的 remote 还在，不用重新走一遍 `rclone config`。

---

## 总结

rclone 的核心价值不在某一个花哨的功能，而在"一套命令打通几十种存储"这件事本身——真正省心的地方是不用为每家云盘学一套新的 CLI。crypt 加密和 sync/copy 的语义差异是最容易踩坑的两处，动手之前确认清楚这两点，剩下的基本就是照着 `rclone config` 的向导走。
