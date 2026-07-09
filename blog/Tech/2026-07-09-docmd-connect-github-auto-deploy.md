---
slug: 2026/07/09/docmd-connect-github-auto-deploy
title: 把 docmd 从直传模式切换成 GitHub 自动部署
date: 2026-07-09
tags:
  - docmd
  - cloudflare
  - github
description: "docmd 笔记站最初用 wrangler 直传部署到 Cloudflare Pages，每次更新都要手动跑构建 + 上传两条命令。这次把它接上 GitHub，改成 git push 自动触发构建部署。"
---

docmd 笔记站最早是用 `wrangler pages deploy` 直传部署的，每次改完笔记都要手动跑一遍"构建 + 上传"两条命令，跟平时 `git push` 就能更新的博客比起来总觉得多了一步。这次把它接上 GitHub，改成推送自动部署，记录一下步骤。

{/* truncate */}

---

## 第一步：把项目变成 git 仓库

进项目目录，先排除不该进 git 的文件——`node_modules` 是依赖，`site` 是构建产物，交给 Cloudflare 自己在云端构建：

```bash
cd ~/Desktop/lalala
printf "node_modules/\nsite/\n" > .gitignore
```

初始化并提交：

```bash
git init
git add .
git commit -m "Initial commit: docmd notes site"
```

> 注意，macOS 会自动生成 `.DS_Store` 文件，第一次 `git add .` 很容易把它一起提交进去。不影响部署，但顺手也加进 `.gitignore` 更干净。

至此，本地仓库已经建好。

---

## 第二步：建 GitHub 仓库并推上去

装了 `gh` CLI 并登录过账号的话，一条命令就能建仓库 + 推送：

```bash
gh repo create docmd-notes --private --source=. --remote=origin --push
```

✅ 正常：终端打印出仓库地址（比如 `https://github.com/你的用户名/docmd-notes`），并提示 `Pushed commits to ...`

❌ 异常：提示未登录，先跑 `gh auth login` 走一遍授权

---

## 第三步：在 Cloudflare 里接上这个仓库

现有的 Pages 项目（用 `wrangler` 直传创建的）不用删掉重建，直接后补连 Git 仓库就行：

1. Cloudflare Dashboard → **Workers & Pages** → 对应项目 → **Settings → Build**
2. 找到 **Git repository** 这一行，点 **Connect**
3. 如果是第一次连 GitHub，会跳转到 GitHub 走一次 Cloudflare App 的安装/授权，选择只授权目标仓库（不用给全部仓库权限）
4. 选中刚才建的仓库、分支选 `main`
5. 构建配置填：
   - **Build command**：`npm run build`
   - **Build output directory**：`site`
6. 保存

---

## 验证

保存后 Cloudflare 会立刻拿最新一次提交跑一次构建，回到项目的 **Deployments** 页面看：

✅ 正常：顶部出现 **Automatic deployments enabled**，Production 下有一条新记录，Source 显示分支名和 commit 哈希，Status 是绿色对勾

❌ 异常：Status 显示失败，点进 **Details** 看构建日志，多半是构建命令或输出目录填错了

之后随便改一篇笔记，`git add` → `git commit` → `git push`，几十秒后回 Deployments 页面刷新，就能看到新的一次自动构建。

---

## 以后的日常流程

```bash
# 改完 docs/ 下的笔记之后
git add .
git commit -m "更新笔记"
git push
```

不用再记 `wrangler pages deploy` 那一长串命令，也不用手动跑 `npm run build`——Cloudflare 会在云端自己构建，构建成功后自动替换线上版本，跟博客的更新方式完全一致了。
