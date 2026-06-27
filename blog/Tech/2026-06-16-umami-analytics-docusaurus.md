---
slug: 2026/06/16/umami-analytics-docusaurus
title: 给 Docusaurus 博客接入 Umami 访客统计
date: 2026-06-16
image: https://cdn.mikeq95blog.uk/coverimage/umami-en-cn.png
tags:
  - github
description: "Umami 是隐私友好的开源访客统计工具，不需要 Cookie 弹窗。文章记录了从注册到接入 Docusaurus 博客的完整过程。"
---

[Umami](https://umami.is) 是开源的访客统计工具，不追踪用户行为、不需要 Cookie 弹窗，有免费的云托管版本，每月 10 万次事件额度，个人博客完全够用。

{/* truncate */}

---

## 第一步：注册账号并创建网站

Umami 有云托管版（免费，推荐新手）：

1. 访问 [umami.is](https://umami.is) → **Get started for free**
2. 注册账号
3. 登录后点 **Add website**，填入：
   - Name：你的博客名称
   - Domain：你的博客域名，比如 `mikeq95blog.uk`
4. 点击 **Save**，然后点 **Edit** → **Tracking code**，复制你的 `data-website-id`（是一串 UUID）

---

## 第二步：在 [Docusaurus](https://clearlove7-ai.vercel.app?word=Docusaurus&postId=2026-06-16-umami-analytics-docusaurus) 注入追踪脚本

在 `docusaurus.config.js` 里加入 `scripts` 字段（加在 `plugins` 之前即可）：

```js
scripts: [
  ...(process.env.NODE_ENV === 'production' ? [
    {
      src: 'https://cloud.umami.is/script.js',
      async: true,
      defer: true,
      'data-website-id': '你的-website-id',  // 替换成第一步拿到的 UUID
    },
  ] : []),
],
```

`NODE_ENV === 'production'` 的判断让本地开发时不发统计请求，不会把自己的浏览记录混进数据里。

Website ID 直接写死在这里就行——它本来就会被嵌进公开的 HTML 源码里，任何人都能看到，没有加密保护的必要。

---

## 第三步：推送，等待部署

提交并推送：

```bash
git add docusaurus.config.js
git commit -m "Add Umami analytics tracking script"
git push origin main
```

GitHub Actions 会自动触发构建和部署，等两三分钟。可以去仓库的 **Actions** 标签页确认——看到绿色的 `completed success` 就行。

---

## 第四步：验证

部署完之后，用 `curl` 检查线上页面有没有 Umami 的脚本：

```bash
curl -s https://你的博客域名 | grep 'umami'
```

如果看到带完整 UUID 的 `<script>` 标签说明配置成功了。

之后访问博客，刷新 [cloud.umami.is](https://cloud.umami.is) 控制台，就能看到实时访客、页面浏览量、来源国家等数据了。
