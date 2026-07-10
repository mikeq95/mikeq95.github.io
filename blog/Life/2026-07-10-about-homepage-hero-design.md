---
slug: about-homepage-hero-design
title: 我的 homepage 主标题和副标题的完整设置
date: 2026-07-10
tags:
  - aboutme
description: "记录首页主标题和副标题从文案到排版的完整过程：怎么参考苹果官网抓真实的 CSS 数值，怎么写响应式字号和容器宽度，附完整代码和逐段讲解。"
---

之前首页一直是"欢迎 Hello～"配一句自我介绍，随手写的，没怎么讲究过。这次想改成苹果官网那种风格——就是 [apple.com/apple-podcasts](https://www.apple.com/apple-podcasts/) 那种大标题 + 一段描述的排法。这篇记录一下最后是怎么定文案、怎么抠排版细节的。

{/* truncate */}

---

## 先定文案：主标题写什么

参考苹果那句 "Listen, watch, or read. Now we're talking."——三个并列词 + 一句 punchline 的结构，最后落定成这样：

- 英文：**Claude, GitHub, or others.** / **I keep writing.**
- 中文：**Claude、GitHub，或者其他什么。** / **我一直在写。**

副标题也照着苹果"总纲 → 价值点 → 收尾利益点"的三句式写，但没有照抄苹果那种列具体功能名的写法（列太细的话，以后博客内容一变这段文案就得跟着改），改成了更通用的表达：

> 读你想读的内容，用你喜欢的方式——这是一个为记录而生的博客。探索能直接照做的教程，读懂经过验证的方法，用清晰的排版找到你需要的答案。没有广告干扰，内容持续更新，你随时都能找到你需要的。

英文对应：

> Read what you want, the way you like — a blog built for exactly that. Explore tutorials you can follow step by step, methods that have been put to the test, and a layout clear enough to find what you need. No ads in the way, content updated regularly, so what you're looking for is always here.

## 排版怎么定的：直接抓苹果官网真实的 CSS

文案定完，排版一开始是凭感觉写的——标题用了 800 字重（很粗），副标题用小号的 SF Pro Text。但直接跟苹果那张截图放一起比，总觉得"差点意思"，肉眼又说不出哪里不对。

后来想到一个更靠谱的办法：苹果的网页是公开的，直接把它的 HTML/CSS 拉下来，搜出主标题和副标题各自用的 class 名，再去 CSS 里查这两个 class 的具体数值，比瞪着截图猜准得多。

```bash
curl -sL "https://www.apple.com/apple-podcasts/" -o apple-podcasts.html
grep -o 'class="hero-title[^"]*"\|hero-headline\|hero-copy' apple-podcasts.html
```

顺着 HTML 里的结构，找到了这两行：

```html
<h2 class="hero-headline typography-hero-headline large-10 large-centered small-12">
  Listen, watch, or&nbsp;read. <span class="nowrap">Now we're&nbsp;talking.</span>
</h2>
<p class="hero-copy typography-hero-copy large-10 large-centered medium-9 small-10">
  Enjoy the shows you like, the way you like...
</p>
```

再去它的构建后 CSS 里搜 `typography-hero-headline` 和 `typography-hero-copy` 这两个类，挖出了真实数值：

| | 字体 | 字重 | 字号（桌面 → 大屏 → 移动） | 行高 | 字距 |
|---|---|---|---|---|---|
| 主标题 | SF Pro Display | **600**（不是我最初写的 800） | 72px → 80px（≥1441px）→ 40px（≤734px） | **1.05~1.1**（很紧） | -0.005~-0.015em |
| 副标题 | SF Pro Display（仅 ≤734px 才切到 SF Pro Text） | 400 | **21px → 28px**（≥1441px）→ 17px（≤734px） | 1.3~1.38 | ~0.01em |

对照下来，之前的实现有三处偏差：主标题字重用了 800（太黑，应该是 600 semibold）；副标题一直用小号 SF Pro Text（应该桌面端也是 SF Pro Display，字号要大得多——21px 而不是原来的 18.4px，行高也该收紧到 1.3 而不是 1.7）；副标题的容器宽度用的是固定 640px，而苹果实际是按栅格列（75%~83%）来限制宽度的。照着这份数据把 CSS 全部改了一遍。

## 布局结构

整个 hero 区域是三层嵌套：

```
.heroBanner        全屏高度的外层容器，负责背景渐变
  └─ .heroContainer   max-width: 1200px，居中，flex column
       └─ .heroText     文字整体容器，text-align: center
            ├─ h1.title       主标题
            ├─ p.description  副标题
            └─ .buttons       CTA 按钮
```

关键点在 `.title` 和 `.description` 各自又设了自己的 `max-width`（副标题 700px，大屏 820px），比外层 1200px 的容器窄一截。这样宽屏下文字不会拉成一两条贯穿全屏的长横线，而是自然折成三四行、居中显示——这正是苹果官网那种排版观感的来源，只是苹果是用整套响应式栅格系统（`large-10`、`medium-9` 这类按屏宽切换的列宽类）做的，这里为了简单，用固定 `max-width` 做了近似。

## 完整代码

### 主标题和副标题的 JSX（`src/pages/index.js`）

```jsx
<Heading as="h1" className={styles.title}>
  {isZh ? (
    <>
      Claude、GitHub，或者其他什么。
      <br />
      我一直在写。
    </>
  ) : (
    <>
      Claude, GitHub, or others.
      <br />
      I keep writing.
    </>
  )}
</Heading>
<p className={styles.description}>
  {isZh
    ? '读你想读的内容，用你喜欢的方式——这是一个为记录而生的博客。探索能直接照做的教程，读懂经过验证的方法，用清晰的排版找到你需要的答案。没有广告干扰，内容持续更新，你随时都能找到你需要的。'
    : "Read what you want, the way you like — a blog built for exactly that. Explore tutorials you can follow step by step, methods that have been put to the test, and a layout clear enough to find what you need. No ads in the way, content updated regularly, so what you're looking for is always here."}
</p>
```

标题两行是硬编码在 JSX 里的 `<br />`，没有用 CSS 自动换行——因为想精确控制"Claude, GitHub, or others."和"I keep writing."各占一行，而不是让浏览器根据屏宽随机决定在哪个词断行。`isZh` 是从 Docusaurus 的 `useDocusaurusContext()` 里拿到的当前语言，三元表达式负责中英文两份文案的切换。

### 主标题的 CSS（`src/pages/index.module.css`）

```css
.title {
  font-family: "SF Pro Display", "SF Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 4.5rem;        /* 72px，对应苹果默认桌面档 */
  font-weight: 600;         /* semibold，不是 800 那种偏黑的字重 */
  letter-spacing: -0.015em; /* 大字号要收紧字距，不然看着松散 */
  margin: 0 0 1rem 0;
  line-height: 1.08;        /* 苹果标题行高很紧，两行字几乎贴着 */
}

/* 超大屏（≥1441px）再放大一档 */
@media screen and (min-width: 1441px) {
  .title {
    font-size: 5rem; /* 80px */
  }
}

/* 平板宽度（≤1068px）缩一档，字距也松一点 */
@media screen and (max-width: 1068px) {
  .title {
    font-size: 3.5rem; /* 56px */
    letter-spacing: -0.005em;
  }
}
```

字体列表里 `"SF Pro Display"` 排第一位——只有用 Apple 系统（macOS / iOS / iPadOS）打开时才会真正命中这个字体，命中不了就顺着列表往后退到 `-apple-system`（非 Apple 设备上等效于系统默认无衬线字体），所以这套设置在 Windows/Android 上看不出苹果那种精确观感，是预期内的效果，不是 bug。

### 副标题的 CSS

```css
.description {
  font-family: "SF Pro Display", "SF Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 1.3125rem;   /* 21px，苹果副标题默认桌面档 */
  font-weight: 400;
  line-height: 1.35;      /* 从原来的 1.7 收紧，苹果原版就是这个密度 */
  letter-spacing: 0.01em;
  max-width: 700px;       /* 比外层容器窄，逼文字换行成短句 */
  margin: 0 auto 1.8rem;  /* auto 让这个更窄的盒子居中 */
  color: var(--ifm-color-content-secondary);
}

@media screen and (min-width: 1441px) {
  .description {
    font-size: 1.75rem; /* 28px */
    max-width: 820px;
  }
}
```

### 移动端（≤768px）覆盖规则

```css
@media screen and (max-width: 768px) {
  .title {
    font-size: 2.5rem; /* 40px */
    letter-spacing: 0;
  }

  .description {
    /* 苹果原版只有在这个断点才会真的切换成 SF Pro Text，
       桌面/大屏其实用的都是 SF Pro Display */
    font-family: "SF Pro Text", "SF", -apple-system, BlinkMacSystemFont,
      "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 1.0625rem; /* 17px */
    line-height: 1.24;
    letter-spacing: -0.0037em;
    max-width: 100%; /* 屏幕本来就窄，不用再额外收窄 */
  }
}
```

这里最容易搞反的一点：很多人（包括我最初的版本）会下意识觉得"标题用 Display 字体、正文用 Text 字体"，因为字体名字里写着"Display"和"Text"，听起来就该这么分工。但苹果自己的官网其实只有窄屏（手机）才会把副标题切到 SF Pro Text，桌面和大屏下副标题也是用 SF Pro Display 撑起 21~28px 的大字号——这也是我最初实现"看着不对"的根源，得去翻真实 CSS 才发现。

## 总结

| 元素 | 字体 | 字重 | 字号范围 | 行高 |
|---|---|---|---|---|
| 主标题 | SF Pro Display | 600 | 40px ~ 80px | 1.08 |
| 副标题（桌面/大屏） | SF Pro Display | 400 | 21px ~ 28px | 1.35 |
| 副标题（手机） | SF Pro Text | 400 | 17px | 1.24 |

排版这件事光靠肉眼比截图很容易差之毫厘，能拿到真实网页源码的时候，直接扒 CSS 数值比反复调参数猜快得多。
