---
slug: 2026/05/16/recommended-commonly-used-search-engines
title: "常用的搜索引擎推荐"
date: 2026-05-16
image: https://cdn.mikeq95blog.uk/coverimage/%E5%B8%B8%E7%94%A8%E7%9A%84%E6%90%9C%E7%B4%A2%E5%BC%95%E6%93%8E%E6%8E%A8%E8%8D%90.png
tags:
  - collection
description: "介绍日常可用的搜索引擎及其适用场景，告别单一依赖，找到适合自己的搜索工具组合。"
---



### 一、搜索引擎选择

#### 推荐排序

Google适合日常搜索，DuckDuckGo和Brave适合注重隐私的人用，yandex适合搜索那种不正经的内容，Bing国内版，如果无法上外网，这个也能凑活用。

{/* truncate */}

#### 各引擎特点

- **Google**：搜争议内容时结果偏 PC，反方观点少且力度弱，不够尖锐。
- **DuckDuckGo**：比 Google 中立，但是每次用这个搜索结果的时候没有高亮，需要加一个脚本，我在文末会写到。（这个脚本用AI写就行）
- **Yandex**：完全不理会西方政治正确那套，适合搜一些敏感，比较劲爆的内容。
    - 例：搜「爱泼斯坦名单」，只有 Yandex 将名单置顶
    - 例：搜「好莱坞丑闻」，只有 Yandex 显示激烈结果
- **[政治正确](https://clearlove7-ai.vercel.app?word=政治正确&postId=2026-05-16-earch-engine-user-guide)程度**：`Google > Brave > DuckDuckGo > Yandex`

---

### 二、实用搜索技巧

#### 软件资源，免费音乐下载

用 **Yandex** 搜索：

```
软件名 + cracked / premium / unlocked / Скачать
```
结果中找带俄语的链接，一般可直接下载。
安卓、PC、Mac 均适用。


#### 搜电子书（[Anna's Archive](https://annas-archive.gl/) / [Z-Library](https://z-lib.fm/)）

> 我要补充一下，如果你在用Google 搜索引擎去搜索Anna's Archive/Z-library,大概率会出现一堆不相关的东西，直接用yandex搜索引擎搜索，大概率第一个搜索结果就是你要找的（yandex还是太夯了！）
```
关键词 + edition      
关键词 + 译           \
```


### 三、DuckDuckGo 搜索词高亮脚本

> 需安装 [Tampermonkey](https://clearlove7-ai.vercel.app?word=Tampermonkey&postId=2026-05-16-earch-engine-user-guide) 浏览器插件后使用。

javascript

```javascript
// ==UserScript==
// @name         DuckDuckGo 搜索词高亮
// @namespace    http://tampermonkey.net/
// @version      2025-08-05
// @description  为 DuckDuckGo 搜索结果中的关键词添加高亮颜色
// @author       You
// @match        https://duckduckgo.com/?*
// @grant        GM_addStyle
// ==/UserScript==
(function() {
    'use strict';
    GM_addStyle(`
        .kY2IgmnCmOGjharHErah span b {
            color: #ff897e !important;
        }
    `);
})();
```

---

### 四，FAQ
1. 为什么我按照你说的去搜索，但是我搜索不到？
答： 因为搜索引擎默认是安全模式，你要在setting里面把安全模式关掉，一般来讲找到“No fliter”选择就行，fliter好像就是滤镜的意思，no fliter就是不会过滤敏感内容，选这个就对了。
2. 