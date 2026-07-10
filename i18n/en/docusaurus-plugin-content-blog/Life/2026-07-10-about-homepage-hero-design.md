---
slug: about-homepage-hero-design
title: The Full Setup Behind My Homepage's Headline and Subtitle
date: 2026-07-10
tags:
  - aboutme
description: "How the homepage headline and subtitle went from copy to layout: pulling real CSS values off Apple's own site, writing the responsive font sizes and container widths, with the full code and a line-by-line walkthrough."
---

The homepage used to just say "欢迎 Hello～" (Welcome) with a one-line intro, written on the fly without much thought. This time I wanted something closer to how Apple does it on [apple.com/apple-podcasts](https://www.apple.com/apple-podcasts/) — a big headline plus a paragraph underneath. This post records how the copy and the typography details ended up where they are.

{/* truncate */}

---

## Nailing down the copy: what the headline says

Modeled on Apple's own "Listen, watch, or read. Now we're talking." — three parallel items plus a punchline — it landed on:

- English: **Claude, GitHub, or others.** / **I keep writing.**
- Chinese: **Claude、GitHub，或者其他什么。** / **我一直在写。**

The subtitle follows Apple's "framing → value points → closing benefit" three-sentence structure too, but skips Apple's habit of naming specific features (naming things too precisely means the copy has to change every time the blog's content shifts). It landed on something more general instead:

> Read what you want, the way you like — a blog built for exactly that. Explore tutorials you can follow step by step, methods that have been put to the test, and a layout clear enough to find what you need. No ads in the way, content updated regularly, so what you're looking for is always here.

## Figuring out the typography: pulling real CSS off Apple's site

Once the copy was set, the typography started out as a guess — the headline used a font-weight of 800 (quite heavy), and the subtitle used small SF Pro Text. But sitting it next to a screenshot of Apple's page, something felt off, without being able to say exactly what.

The more reliable move: Apple's page is public, so I could just pull down its HTML/CSS, find the class names the headline and subtitle actually use, and look up the exact values for those classes — much more accurate than staring at a screenshot and guessing.

```bash
curl -sL "https://www.apple.com/apple-podcasts/" -o apple-podcasts.html
grep -o 'class="hero-title[^"]*"\|hero-headline\|hero-copy' apple-podcasts.html
```

Following the HTML structure turned up these two lines:

```html
<h2 class="hero-headline typography-hero-headline large-10 large-centered small-12">
  Listen, watch, or&nbsp;read. <span class="nowrap">Now we're&nbsp;talking.</span>
</h2>
<p class="hero-copy typography-hero-copy large-10 large-centered medium-9 small-10">
  Enjoy the shows you like, the way you like...
</p>
```

Searching the built CSS for `typography-hero-headline` and `typography-hero-copy` turned up the real numbers:

| | Font | Weight | Size (desktop → large → mobile) | Line height | Letter spacing |
|---|---|---|---|---|---|
| Headline | SF Pro Display | **600** (not the 800 I'd originally used) | 72px → 80px (≥1441px) → 40px (≤734px) | **1.05–1.1** (very tight) | -0.005 to -0.015em |
| Subtitle | SF Pro Display (only switches to SF Pro Text at ≤734px) | 400 | **21px → 28px** (≥1441px) → 17px (≤734px) | 1.3–1.38 | ~0.01em |

Comparing this to what was already there turned up three mismatches: the headline was using a font-weight of 800 (too heavy — it should be 600, semibold); the subtitle was using small SF Pro Text the whole way through (it should be SF Pro Display at desktop sizes too, and quite a bit bigger — 21px, not the 18.4px it was — with a tighter line height of 1.3 instead of 1.7); and the subtitle's container used a fixed 640px width, while Apple's actual layout sizes it off a grid column (75%–83%). All of that got rewritten to match this data.

## Layout structure

The hero section is three layers deep:

```
.heroBanner        full-viewport-height outer wrapper, handles the background gradient
  └─ .heroContainer   max-width: 1200px, centered, flex column
       └─ .heroText     text wrapper, text-align: center
            ├─ h1.title       headline
            ├─ p.description  subtitle
            └─ .buttons       CTA button
```

The key detail is that `.title` and `.description` each set their own `max-width` (the subtitle is 700px, 820px on large screens) — narrower than the 1200px outer container. That way the text doesn't stretch into one or two very long lines on wide screens; it wraps naturally into three or four centered lines. That's exactly where Apple's layout feel comes from, except Apple does it with a full responsive grid system (column-width classes like `large-10` and `medium-9` that switch based on screen width), whereas here it's approximated with a fixed `max-width` for simplicity.

## The full code

### The headline and subtitle JSX (`src/pages/index.js`)

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

The headline's two lines are hardcoded with a `<br />` in the JSX rather than left to wrap on their own — the point was to control exactly where "Claude, GitHub, or others." ends and "I keep writing." begins, instead of letting the browser decide where to break based on screen width. `isZh` comes from Docusaurus's `useDocusaurusContext()` and reflects the current locale; the ternary switches between the Chinese and English copy.

### The headline's CSS (`src/pages/index.module.css`)

```css
.title {
  font-family: "SF Pro Display", "SF Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 4.5rem;        /* 72px, matches Apple's default desktop tier */
  font-weight: 600;         /* semibold, not the heavier 800 */
  letter-spacing: -0.015em; /* large sizes need tighter tracking or they look loose */
  margin: 0 0 1rem 0;
  line-height: 1.08;        /* Apple's headline is very tight — two lines almost touch */
}

/* extra-large screens (≥1441px) bump up one more tier */
@media screen and (min-width: 1441px) {
  .title {
    font-size: 5rem; /* 80px */
  }
}

/* tablet width (≤1068px) scales down a tier, tracking loosens slightly */
@media screen and (max-width: 1068px) {
  .title {
    font-size: 3.5rem; /* 56px */
    letter-spacing: -0.005em;
  }
}
```

`"SF Pro Display"` is listed first in the font stack — it only actually renders on Apple platforms (macOS / iOS / iPadOS); everywhere else it falls back through the list to `-apple-system` (which resolves to the system default sans-serif on non-Apple devices). So this setup won't produce Apple's exact look on Windows or Android — that's expected, not a bug.

### The subtitle's CSS

```css
.description {
  font-family: "SF Pro Display", "SF Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 1.3125rem;   /* 21px, Apple's default desktop tier for the subtitle */
  font-weight: 400;
  line-height: 1.35;      /* tightened from the original 1.7 to match Apple's actual density */
  letter-spacing: 0.01em;
  max-width: 700px;       /* narrower than the outer container, forces short-line wraps */
  margin: 0 auto 1.8rem;  /* auto centers this narrower box */
  color: var(--ifm-color-content-secondary);
}

@media screen and (min-width: 1441px) {
  .description {
    font-size: 1.75rem; /* 28px */
    max-width: 820px;
  }
}
```

### Mobile (≤768px) overrides

```css
@media screen and (max-width: 768px) {
  .title {
    font-size: 2.5rem; /* 40px */
    letter-spacing: 0;
  }

  .description {
    /* Apple's real site only switches to SF Pro Text at this breakpoint —
       desktop and large screens actually use SF Pro Display */
    font-family: "SF Pro Text", "SF", -apple-system, BlinkMacSystemFont,
      "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 1.0625rem; /* 17px */
    line-height: 1.24;
    letter-spacing: -0.0037em;
    max-width: 100%; /* the screen is already narrow, no extra constraint needed */
  }
}
```

The easiest thing to get backwards here: it's tempting to assume "the headline uses Display, the body uses Text" just because the names say "Display" and "Text." But Apple's own site only switches the subtitle to SF Pro Text on narrow (phone) screens — on desktop and large screens, the subtitle is also SF Pro Display, carrying a 21–28px size. That's exactly where my first attempt went wrong, and it only became obvious after pulling the actual CSS.

## Summary

| Element | Font | Weight | Size range | Line height |
|---|---|---|---|---|
| Headline | SF Pro Display | 600 | 40px – 80px | 1.08 |
| Subtitle (desktop/large) | SF Pro Display | 400 | 21px – 28px | 1.35 |
| Subtitle (mobile) | SF Pro Text | 400 | 17px | 1.24 |

Matching a layout by eyeballing a screenshot is easy to get slightly wrong. When the actual page source is available, pulling the real CSS values directly is a lot faster than guessing and re-guessing parameters.
