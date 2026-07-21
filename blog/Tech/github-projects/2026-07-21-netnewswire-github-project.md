---
slug: 2026/07/21/netnewswire-github-project
title: NetNewsWire，一款开源了 20 多年的 macOS/iOS RSS 阅读器
date: 2026-07-21
tags:
  - github
  - macos
description: "NetNewsWire 是一款免费开源的 macOS/iOS RSS 阅读器，2002 年由 Brent Simmons 做出来，中间被卖过两次，2018 年才重新开源。这篇记录一下它的来历、支持的订阅格式和实际用下来的感受。"
---

前两天在排查自己博客 RSS feed 的问题时，一直在用 [NetNewsWire](https://github.com/Ranchero-Software/NetNewsWire) 订阅、验证效果，用下来觉得挺值得写一篇——免费开源，⭐ 10.2k，MIT 协议，而且是少见的"活了 20 多年还在维护"的老项目。

{/* truncate */}

---

## 它是什么

NetNewsWire 是一款 macOS/iOS 上的免费开源 RSS/Atom 阅读器，支持 [RSS](https://cyber.harvard.edu/rss/rss.html)、[Atom](https://datatracker.ietf.org/doc/html/rfc4287)、[JSON Feed](https://jsonfeed.org/) 和 RSS-in-JSON 四种订阅格式。

它的历史比较特别：最早由 Brent Simmons 在 2002 年做出来，2005 年卖给了 NewsGator，后来又转手到 Black Pixel。2018 年 Simmons 拿回了知识产权，把它作为开源项目重新发布，也就是现在这个由 [Ranchero Software](https://github.com/Ranchero-Software) 维护的版本。算下来是少数几个从 Web 2.0 时代活到现在、还在持续更新的 RSS 阅读器之一。

---

## 安装

系统要求：Mac 需要 macOS 15 及以上，iPhone/iPad 需要 iOS 26 及以上。

macOS 上两种装法：

去 [release 页面](https://github.com/Ranchero-Software/NetNewsWire/releases/latest)下载 zip，解压后把 `NetNewsWire.app` 拖进 `Applications`。

或者用 Homebrew：

```bash
brew install --cask netnewswire
```

iOS 版本在 App Store 搜 "NetNewsWire" 就能装，也提供 TestFlight 测试版。

---

## 实际使用感受

### 订阅同步

如果只在一台设备上用，订阅列表直接存本地就行；想多设备同步的话，支持 iCloud、Feedbin、Feedly、BazQux、Inoreader、NewsBlur、The Old Reader、FreshRSS 这 8 种服务，账号在 App 内绑定即可。

### 多语言/多 locale 博客要分开订阅

我自己踩的一个坑：博客开了 i18n，中文和英文文章其实是两条独立的 feed（`/blog/rss.xml` 和 `/en/blog/rss.xml`），NetNewsWire 不会自动帮你找到另一种语言版本，得手动把两条链接都加进去。

### 隐私

官方[隐私政策](https://netnewswire.com/privacypolicy.html)写得很直接：netnewswire.com 和作者博客都不用 cookie、不用 JavaScript、不做追踪、不放广告；App 内唯一会收集的是用户主动选择开启的崩溃日志，用来定位闪退问题，没有其他遥测。

---

## 总结

如果想找一个不联网算法推荐、不塞广告、纯粹按订阅源看内容的 RSS 阅读器，NetNewsWire 是个可以放心长期用的选择——项目本身开源透明，历史也证明了它不会说没就没。唯一要注意的是多语言博客要分别订阅每个 locale 的 feed 链接。
