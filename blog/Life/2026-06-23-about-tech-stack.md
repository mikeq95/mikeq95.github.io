---
slug: about-tech-stack
title: 介绍这个网页的技术栈
date: 2026-06-23
tags:
  - 关于
description: "这个博客是怎么搭起来的：Docusaurus + Supabase + Cloudflare，外加 Claude Code 帮我写了大部分代码。"
---

之前在[关于这个博客](/blog/about)里说过，技术栈会单独写一篇文章详细说说。这就是那篇。

{/* truncate */}

## 网站本体：Docusaurus

这个博客是用 [Docusaurus](https://docusaurus.io) 搭的，本质上是一个 React 框架，专门用来做文档站和博客——写 Markdown，它帮你编译成静态网页。好像是 Meta 旗下的项目。

页面里需要交互的部分（比如导航栏、评论区、点赞按钮），就用 React 组件写，嵌进 Docusaurus 的主题里。

**为什么选它**：我要的是一个写博客的工具，不是一个从零搭网站的框架。Docusaurus 把"写文章"和"做页面"这两件事分开了——我只管写 Markdown，导航栏、搜索、分类、暗色模式这些它都默认给好了。而且它本质还是 React，真要自定义组件、加交互，随时能下沉到代码层面，不会被框架限制住。

## 样式：Tailwind CSS

页面样式用的是 [Tailwind CSS](https://tailwindcss.com)（v4），直接在组件上写 class，不用单独维护一堆 CSS 文件。

**为什么选它**：Tailwind 直接把样式写在组件标签上，改哪个看哪个，AI 改代码的时候也不容易改错文件、漏改某个地方。

## 动画：GSAP + Motion

动效用了两个库：[GSAP](https://gsap.com) 和 [Motion](https://motion.dev)。比如首页标签栏切换时那个会滑动的小药丸、按钮 hover 时的缩放，是 GSAP 写的；顶部的阅读进度条用的是 Motion。这两个库都是按需动态加载的，不需要动画的页面不会多背这部分体积。

**为什么选它们**：纯 CSS transition 能做的动画有限，遇到"目标值要运行时计算"（比如 pill 滑到哪个位置）这种场景就不好维护了，GSAP 处理这类需求很省心。Motion 则是因为它和 React 的状态结合得更自然，做阅读进度条这种跟着滚动状态实时变化的小组件比较顺手。

## 后端：Supabase

登录、评论、点赞、收藏这些需要存数据的功能，都是接的 [Supabase](https://supabase.com)。它本质上是一个托管的 Postgres 数据库，外加现成的用户认证和实时 API，不用我自己搭后端服务器。

**为什么选它**：我不是后端出身，自己搭服务器、管数据库、写认证这套东西成本太高，还容易出安全问题。Supabase 把这些都打包好了，我只要在前端调用它的 SDK 就行，省下来的时间用在写文章和打磨体验上。而且它底层是标准的 Postgres，不是什么封闭的私有格式，以后真要换平台，数据也不会被锁死。

## 图床：Cloudflare R2

文章里的图片不是放在仓库里的，是先传到 [Cloudflare R2](https://www.cloudflare.com/products/r2/) 对象存储，再通过自己的域名 `cdn.mikeq95blog.uk` 访问。传图这一步我写了个小脚本，本地存图片会自动上传并替换成 CDN 链接。

**为什么选它**：图片放进 Git 仓库会让仓库越来越大，每次构建也会被拖慢。R2 跟 S3 接口兼容但没有出口流量费用，对一个不靠这个网站赚钱的个人博客来说，长期看更省钱，也更轻量。

## 部署：GitHub Pages + Cloudflare

网站源码托管在 GitHub，每次推到 `main` 分支会自动跑 GitHub Actions，把 Docusaurus 构建出来的静态文件发布到 GitHub Pages。域名 `mikeq95blog.uk` 接在 Cloudflare 上，顺带用了它的 CDN 加速和 SSL。

**为什么选它**：这个博客本质是纯静态站点，不需要服务器常驻运行，GitHub Pages 免费、和仓库无缝绑定，推一次代码就自动发布，不用额外维护部署流程。Cloudflare 接在前面是为了 CDN 加速和免费 SSL，这两样对"网站要快"这个我很在意的点直接相关。

## 写代码这件事

大部分是 Claude Code 写的，很少部分是我写的。

## 总结

好了，这些就是所有我用到的技术，希望对你有所帮助。

| 模块 | 用的什么 |
|------|----------|
| 网站框架 | Docusaurus（React） |
| 样式 | Tailwind CSS |
| 动画 | GSAP、Motion |
| 后端/数据库 | Supabase |
| 图床 | Cloudflare R2 |
| 部署 | GitHub Pages + Cloudflare |
