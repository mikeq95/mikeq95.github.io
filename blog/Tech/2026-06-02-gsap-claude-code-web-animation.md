---
slug: 2026/06/02/gsap-claude-code-web-animation
title: GSAP + Claude Code，为你的网页加上炫酷动画
date: 2026-06-02
image: https://cdn.mikeq95blog.uk/coverimage/GSAP-Skills-CoverImage.png
tags:
  - github
  - macos
description: "介绍 GSAP 官方出的 Claude Code Skills 包，让 AI 正确理解 GSAP API，几分钟为网页加上流畅动画效果。"
---

最近发现一个有意思的 GitHub 项目——[gsap-skills](https://github.com/greensock/gsap-skills)，是 GSAP 官方出的 AI Skills 包，专门用来"教" Claude Code 正确使用 GSAP 动画库。

顺带一提，我一开始以为 GSAP 是做视频的，类似 HeyGen 那种——其实完全不一样。**GSAP 是做网页动画的**，就是你在浏览器里看到的那种元素飞入、滚动视差、数字滚动这些效果，实时渲染在网页上，不是视频文件。搞清楚这个之后，我决定把它装进 Claude Code 试试。

{/* truncate */}

---

## GSAP 是什么

[GSAP](https://gsap.com)（GreenSock Animation Platform）是目前最流行的 JavaScript 网页动画库，核心优势是：

- **控制能力强**：可以暂停、倒放、精确控制每个动画的时序
- **ScrollTrigger**：专门处理滚动联动动画，视差效果、滚动触发、固定元素都很简单
- **Timeline**：多个元素的动画序列，几行代码搞定
- **性能好**：底层操作 transform，和 CSS 动画性能相当

和 CSS 动画对比一下：

| | CSS 动画 | GSAP |
|---|---|---|
| 语言 | CSS | JavaScript |
| 控制能力 | 有限 | 极强 |
| 滚动联动 | 很难做 | ScrollTrigger 专门处理 |
| 复杂序列 | 写起来很痛苦 | timeline 几行搞定 |
| 性能 | 好 | 同样好 |

还有一个好消息：**GSAP 现在完全免费**，包括之前需要付费会员才能用的 SplitText、MorphSVG 等高级插件，全部对所有人开放，含商业用途。

---

## gsap-skills 是什么

AI 对 GSAP 的了解可能是过时的——比如 ScrollTrigger 的写法、React 里的清理方式。装了 `gsap-skills` 之后，Claude Code 就能用正确的 API 写代码，知道各种插件怎么用，以及 React 里的最佳实践。

它一共包含 8 个 skill：

| Skill | 内容 |
|-------|------|
| gsap-core | 基础 API：to / from / fromTo、缓动、stagger |
| gsap-timeline | 时间轴、sequencing、标签 |
| gsap-scrolltrigger | 滚动动画、pinning、scrub |
| gsap-plugins | SplitText、Flip、Draggable 等所有插件 |
| gsap-react | useGSAP hook、cleanup、SSR |
| gsap-performance | 性能优化技巧 |
| gsap-frameworks | Vue、Svelte 等框架用法 |
| gsap-utils | gsap.utils 工具函数 |

---

## 安装 gsap-skills

在终端运行：

```bash
npx skills add https://github.com/greensock/gsap-skills
```

第一次运行会提示安装 `skills@1.5.9`，输入 `y` 确认。

然后会让你选择要安装哪些 skill，**用空格键勾选，回车确认**。博客项目（Docusaurus / React）建议选这四个就够用了：

- ✅ gsap-core
- ✅ gsap-scrolltrigger
- ✅ gsap-timeline
- ✅ gsap-react

接下来的选项：

- **Agent**：选 `Claude Code`
- **Installation scope**：选 `Global`（全局安装，所有项目都能用，不用每次重装）
- **Installation method**：选 `Symlink`（推荐，skill 更新后自动同步）

安装完成后，skill 会保存到 `~/.claude/skills/` 目录下。

> **找不到 `.claude` 文件夹？** 它是隐藏文件夹。在 Finder 里按 **⌘ + Shift + .（句号）** 就能显示所有隐藏文件，再按一次隐藏回去。

---

## 如何使用

安装完不需要任何特殊命令，**直接在 Claude Code 里描述你要做的动画就行**，Claude 会自动调用对应的 skill 来写出正确的代码。

比如：

> "帮我给博客首页的标题加一个进场动画，用 GSAP"

> "用 ScrollTrigger 做一个滚动到某个区域时触发的动画"

---

## 实际例子：给博客文章卡片加滚动进场动画

假设你的博客有一个文章列表页，每张卡片在用户滚动到它时从下方飞入，这是非常常见的效果。

首先安装 GSAP：

```bash
npm install gsap
```

然后在你的 React 组件里这样写：

```jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function BlogCard({ title, date, description }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 60,           // 从下方 60px 的位置飞入
        opacity: 0,      // 从透明到不透明
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",  // 元素顶部进入视口 85% 时触发
        },
      });
    }, cardRef);

    return () => ctx.revert(); // 组件卸载时清理，防止内存泄漏
  }, []);

  return (
    <div ref={cardRef} className="blog-card">
      <h2>{title}</h2>
      <span>{date}</span>
      <p>{description}</p>
    </div>
  );
}
```

效果就是：用户往下滚动，每张文章卡片依次从下方飞入，有一种层次感很强的进场效果。把 `start: "top 85%"` 改成 `"top 70%"` 可以让触发时机更晚一点，自己调着试就行。

---

## 总结

GSAP 是做**网页动画**的，不是视频，这点一定要搞清楚😂。

`gsap-skills` 的价值在于让 Claude Code 真正懂 GSAP——不只是能写代码，而是能写出正确的代码，不会用过时的 API，React 里的 cleanup 也不会漏。安装过程五分钟搞定，之后直接描述需求让 Claude 写就行，不需要自己记任何 API。

如果你的博客或者项目需要滚动动画、页面过渡、元素进场这类效果，GSAP 是目前开源方案里最值得用的一个。

