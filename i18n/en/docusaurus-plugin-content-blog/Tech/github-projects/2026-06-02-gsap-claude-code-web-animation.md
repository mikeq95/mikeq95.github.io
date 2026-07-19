---
slug: 2026/06/02/gsap-claude-code-web-animation
title: GSAP + Claude Code — Add Smooth Animations to Your Website
date: 2026-06-02
image: https://cdn.mikeq95blog.uk/coverimage/gsap-skill-en-cn.png
tags:
  - github
  - macos
description: "GSAP's official Claude Code Skills package teaches the AI how to use the GSAP API correctly — add smooth animations to your site in minutes."
---

I recently came across an interesting GitHub project — [gsap-skills](https://github.com/greensock/gsap-skills), an official GSAP AI Skills package designed to "teach" Claude Code how to use the GSAP animation library correctly.

Looked interesting, so I gave it a try.

{/* truncate */}

---

## What Is GSAP

[GSAP](https://gsap.com) (GreenSock Animation Platform) is currently the most popular JavaScript web animation library. Its core strengths:

- GSAP itself = a JavaScript animation library (an npm package). To animate with it you `npm install gsap` in your project and write code that runs in the browser. It doesn't depend on Claude Code at all — it's a real frontend technology.
- The gsap-core/gsap-timeline skills = "instruction manuals" installed inside Claude Code, teaching the AI how to call GSAP's API correctly, what pitfalls to avoid, and what the best practices are. The skills themselves don't write or run code in the browser — they just help the AI write more accurate GSAP code for you.
- Cross-browser consistency: CSS animation/transition can behave differently across browsers and property combinations. GSAP smooths over all of that, so the result is predictable.
- Can animate almost anything: not just CSS properties — canvas, SVG, scroll position, even arbitrary values on a custom JS object. CSS animation can't match that range.
- Timeline orchestration: when multiple animations need to be precisely synced or chained (B starts 0.2s after A finishes, and the timing needs to stay easy to tweak), pure CSS gets painful fast. GSAP's timeline makes this much more pleasant.
- Performance: heavily optimized under the hood (uses transforms instead of layout-triggering properties), so animating lots of elements at once stays smooth.
- ScrollTrigger plugin: scroll-linked animation (play/pause/pin based on scroll position) is basically the industry standard here, and it's a lot less work than hand-rolling IntersectionObserver and computing progress yourself.

---

## What Is gsap-skills

AI models' knowledge of GSAP can be outdated — for example, how ScrollTrigger is written today, or how to clean things up in React. With `gsap-skills` installed, Claude Code can write code using the correct APIs, knows how each plugin works, and follows React best practices.

It includes 8 skills:

| Skill | Content |
|-------|---------|
| gsap-core | Core APIs: to / from / fromTo, easing, stagger |
| gsap-timeline | Timelines, sequencing, labels |
| gsap-scrolltrigger | Scroll animations, pinning, scrub |
| gsap-plugins | SplitText, Flip, Draggable, and all other plugins |
| gsap-react | useGSAP hook, cleanup, SSR |
| gsap-performance | Performance optimization tips |
| gsap-frameworks | Vue, Svelte, and other frameworks |
| gsap-utils | gsap.utils helper functions |

---

## Installing gsap-skills

Run in your terminal:

```bash
npx skills add https://github.com/greensock/gsap-skills
```

The first run will prompt you to install `skills@1.5.9` — enter `y` to confirm.

You'll then be asked which skills to install. **Use spacebar to check, Enter to confirm.** For a blog project (Docusaurus / React), these four are enough:

- ✅ gsap-core
- ✅ gsap-scrolltrigger
- ✅ gsap-timeline
- ✅ gsap-react

For the remaining prompts:

- **Agent**: select `Claude Code`
- **Installation scope**: select `Global` (global install — works across all projects without reinstalling)
- **Installation method**: select `Symlink` (recommended — auto-syncs when the skill updates)

After installation, the skills are saved to `~/.claude/skills/`.

---

## How to Use It

No special commands needed after installation. **Just describe the animation you want in Claude Code**, and Claude will automatically use the relevant skill to write correct code.

For example, describe:

1. What moves — which element/section (a title, a card, the whole banner...)
2. What triggers it — page load? mouse hover? scrolling into view? a click?
3. How it changes — from where to where (position/opacity/scale/rotation), e.g. "slide up from below while fading in" or "scale up to 1.05x"
4. The pacing — fast or slow, any bounce/elasticity, do multiple elements appear one after another (stagger) instead of all at once

For example, describing an animation along these four points might look like this:

"The homepage banner title, triggered once the page finishes loading: slide up from 30px below while fading in to its normal position, slightly fast (0.6s), with a bit of elastic bounce. If the title has multiple words/cards, stagger them by 0.1s each instead of having them all pop in at once."

> What's a "banner"? It's that big horizontal showcase block near the top of a page — the thing you see first.

---

## Real Example

In this blog's homepage `RecentPosts` component, both the sliding pill in the tab bar and the hover scale on the left/right scroll buttons are written with GSAP.

> Inspired by [Apple's site](https://www.apple.com/mac/) — "Explore the lineup."

The hover scale on the scroll buttons on either side of the tab bar is simple: scale up to 1.1x on mouse enter, back to 1 on leave. `overwrite: 'auto'` interrupts any tween still in flight, so rapid mouse-in/mouse-out doesn't stack animations and stutter:

```jsx
const enter = () => gsap.to(btn, { scale: 1.1, duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
const leave = () => gsap.to(btn, { scale: 1,   duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
btn.addEventListener('mouseenter', enter);
btn.addEventListener('mouseleave', leave);
```

The pill slide is a bit more involved: every time the active tab changes, `getBoundingClientRect` computes the newly selected tab's position and width relative to the tab bar, then GSAP animates the pill there instead of using a CSS transition:

```jsx
const barRect = bar.getBoundingClientRect();
const btnRect = activeEl.getBoundingClientRect();
const targetX = btnRect.left - barRect.left;
const targetW = btnRect.width;

gsap.to(pill, {
  x: targetX,
  width: targetW,
  duration: 0.15,
  // you can tweak the duration here — bump it to 0.30 if it feels too fast
  ease: 'power3.out',
  overwrite: true,
});
```
