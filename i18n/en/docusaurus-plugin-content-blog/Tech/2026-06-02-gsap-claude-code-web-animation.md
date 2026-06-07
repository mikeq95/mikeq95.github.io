---
slug: 2026/06/02/gsap-claude-code-web-animation
title: GSAP + Claude Code — Add Smooth Animations to Your Website
date: 2026-06-02
tags:
  - github
  - macos
---

I recently came across an interesting GitHub project — [gsap-skills](https://github.com/greensock/gsap-skills), an official GSAP AI Skills package designed to "teach" Claude Code how to use the GSAP animation library correctly.

Quick note: I initially thought GSAP was for video editing, like HeyGen — turns out it's completely different. **GSAP is for web animations** — the kind you see in a browser: elements flying in, scroll parallax, number counters rolling up, all rendered live on the page, not as video files. Once I got that straight, I decided to install it in Claude Code and give it a shot.

{/* truncate */}

---

## What Is GSAP

[GSAP](https://gsap.com) (GreenSock Animation Platform) is currently the most popular JavaScript web animation library. Its core strengths:

- **Fine-grained control**: pause, reverse, and precisely time every animation
- **ScrollTrigger**: handles scroll-linked animations — parallax, scroll-triggered effects, pinned elements, all straightforward
- **Timeline**: sequence multiple elements' animations in just a few lines
- **Performance**: operates on transforms under the hood, on par with CSS animations

Compared to CSS animations:

| | CSS Animations | GSAP |
|---|---|---|
| Language | CSS | JavaScript |
| Control | Limited | Extremely powerful |
| Scroll-linked | Hard to do | ScrollTrigger handles it |
| Complex sequences | Painful to write | Timeline, a few lines |
| Performance | Good | Equally good |

Good news: **GSAP is now completely free** — including previously paid-only plugins like SplitText and MorphSVG. Everything is open to everyone, including commercial use.

---

## What Is gsap-skills

AI models' knowledge of GSAP may be outdated — for example, how ScrollTrigger is written today, or how to clean up in React. With `gsap-skills` installed, Claude Code can write code using the correct APIs, knows how each plugin works, and follows React best practices.

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

> **Can't find the `.claude` folder?** It's hidden. In Finder, press **⌘ + Shift + . (period)** to show all hidden files. Press again to hide them.

---

## How to Use It

No special commands needed after installation. **Just describe the animation you want in Claude Code**, and Claude will automatically use the relevant skill to write correct code.

For example:

> "Add an entrance animation to the title on my blog homepage using GSAP"

> "Use ScrollTrigger to make an animation trigger when the user scrolls to a certain section"

---

## Real Example: Scroll-In Animation for Blog Post Cards

Say your blog has a post list page where each card flies in from below when the user scrolls to it — a very common effect.

First, install GSAP:

```bash
npm install gsap
```

Then in your React component:

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
        y: 60,           // flies in from 60px below
        opacity: 0,      // fades in from transparent
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",  // triggers when element top enters 85% of viewport
        },
      });
    }, cardRef);

    return () => ctx.revert(); // cleanup on unmount — prevents memory leaks
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

The result: as the user scrolls down, each card flies in from below one by one, creating a layered entrance effect. Change `start: "top 85%"` to `"top 70%"` to trigger later — experiment until it feels right.

---

## Summary

GSAP is for **web animations** — not video. That's the important thing to get right first 😂.

The value of `gsap-skills` is that it lets Claude Code truly understand GSAP — not just write code, but write *correct* code: no outdated APIs, no missing cleanup in React. Setup takes five minutes. After that, just describe what you want and let Claude write it — no need to memorize any API.

If your blog or project needs scroll animations, page transitions, or element entrances, GSAP is the best open-source option out there right now.
