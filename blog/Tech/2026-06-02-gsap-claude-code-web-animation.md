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

有点意思，试试。

{/* truncate */}

---

## GSAP 是什么

[GSAP](https://gsap.com)（GreenSock Animation Platform）是目前最流行的 JavaScript 网页动画库，核心优势是：
- GSAP 本身 = 一个 JavaScript 动画库（npm 包），要用它做动画，得在项目里 npm install gsap，写到代码里跑在浏览器上。它不依赖 Claude Code，是真实的前端技术。
- gsap-core/gsap-timeline 等技能 = 装在 Claude Code 里的"使用说明书"，教我怎么正确调用 GSAP 的 API、踩过哪些坑、最佳实践是什么。技能本身不写代码、不在浏览器跑，只是帮（AI）更准确地帮你写 GSAP 代码。
- 跨浏览器一致性：CSS animation/transition 在不同浏览器、不同 CSS 属性组合下表现会有差异，GSAP 把这些坑都处理掉了，效果可预测。
- 可以动画几乎任何东西：不只是 CSS 属性，canvas、SVG、滚动位置、甚至自定义 JS 对象的数值都能动，CSS 动画做不到这个广度。
- 时间线编排（Timeline）：多个动画要精确同步/接续（A 做完 0.2 秒后 B 才开始，且要跟着调整很方便），纯 CSS 写起来很痛苦，GSAP 的 timeline 这块体验好很多。
- 性能：底层做了大量优化（用 transform 而不是触发重排的属性），大量元素同时动画也不卡。
- ScrollTrigger 插件：滚动联动动画（滚到哪儿播放/暂停/pin 住）这块基本是行业标准，做起来比手写 IntersectionObserver + 手动算进度轻松很多。

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

---

## 如何使用

安装完不需要任何特殊命令，**直接在 Claude Code 里描述你要做的动画就行**，Claude 会自动调用对应的 skill 来写出正确的代码。

比如：
1. 谁动——哪个元素/区域（标题、卡片、整个 banner...）
2. 什么时机触发——页面加载时？鼠标 hover？滚动到这个区域时？点击时？
3. 怎么变化——从哪到哪（位置/透明度/缩放/旋转），比如"从下往上滑入同时淡入"、"放大 1.05 倍"
4. 节奏感——快慢、是否有弹性/回弹、多个元素是不是依次出现（stagger）而不是同时

---

## 应用实例

这个博客首页的 [RecentPosts](src/components/RecentPosts/index.jsx) 组件里，标签栏的滑动小药丸（pill）和左右滚动按钮的 hover 缩放，都是用 GSAP 写的。

按钮 hover 缩放比较简单，鼠标进入时放大到 1.1 倍，离开时缩回 1，`overwrite: 'auto'` 用来打断上一次还没播完的动画，避免快速划入划出时动画叠加卡顿：

```jsx
const enter = () => gsap.to(btn, { scale: 1.1, duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
const leave = () => gsap.to(btn, { scale: 1,   duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
btn.addEventListener('mouseenter', enter);
btn.addEventListener('mouseleave', leave);
```

pill 滑动稍微复杂一点：每次切换 tab，先用 `getBoundingClientRect` 算出新选中标签相对标签栏的位置和宽度，再让 pill 用 GSAP 动画过去，而不是直接用 CSS transition：

```jsx
const barRect = bar.getBoundingClientRect();
const btnRect = activeEl.getBoundingClientRect();
const targetX = btnRect.left - barRect.left;
const targetW = btnRect.width;

gsap.to(pill, {
  x: targetX,
  width: targetW,
  duration: 0.15,
  ease: 'power3.out',
  overwrite: true,
});
```

之所以用 GSAP 而不是纯 CSS，是因为 `x` 和 `width` 要同时变化，且目标值是运行时算出来的（不同 tab 文字长度不同，pill 宽度也不一样），写成 CSS transition 不好维护，GSAP 一行 `to()` 就解决了。另外这两处动画都是动态 `import('gsap')` 加载的，首屏不会因为这点交互效果多背一个动画库的体积。

---

## 总结

GSAP 是做**网页动画**的。
我觉得只需要懂得如何给 AI 详细清晰描述你的需求，AI 会帮你做到的。Skill 不用每个都装，也不用在意让 AI 用哪个 skill，它会直接选择的。