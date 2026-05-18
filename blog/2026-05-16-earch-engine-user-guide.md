---
title: "搜索引擎使用指南"
date: 2026-05-16
tags:
  
---



### 一、搜索引擎选择

#### 推荐排序

抛弃百度，以下引擎均可替代：

|引擎|适合场景|
|---|---|
|**Google**|日常搜索首选|
|**DuckDuckGo**|争议话题、隐私保护|
|**Yandex**|劲爆内容、软件资源、音乐|
|**Brave**|日常搜索备选|
|**Bing（国内版）**|萌新过渡使用|

#### 各引擎特点

- **Google**：搜争议内容时结果偏 PC，反方观点少且力度弱，不够尖锐
- **DuckDuckGo**：比 Google 中立，搜索词无高亮显示（可用脚本改善，见文末）
- **Yandex**：完全不理会西方政治正确那套，适合搜敏感/劲爆内容
    - 例：搜「爱泼斯坦名单」，只有 Yandex 将名单置顶
    - 例：搜「好莱坞丑闻」，只有 Yandex 显示激烈结果
- **政治正确程度**：`Google > Brave > DuckDuckGo > Yandex`

---

### 二、实用搜索技巧

#### 软件资源（学生党）

用 **Yandex** 搜索：

```
软件名 + cracked / premium / unlocked
```

安卓、PC、Mac 均适用。

#### 免费音乐下载（学生党）

用 **Yandex** 搜索：

```
歌名 + free download
歌名 + Скачать
```

结果中找带俄语的链接，一般可直接下载。

#### 限定网站搜索

```
关键词 site:https://x.com
```

适合某些自带搜索功能较差的资源网站。

#### 搜电子书（Anna's Archive / Z-Library）

```
关键词 + edition      # 搜再版书，质量通常更好，例：tort edition
关键词 + 译           # 搜中译版，例：文明史 译
```

#### 用豆瓣找好书

豆瓣搜索关键词 → 筛选高分书单；书籍详情页下方也会推荐同类书籍。

---

### 三、DuckDuckGo 搜索词高亮脚本

> 需安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器插件后使用。

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