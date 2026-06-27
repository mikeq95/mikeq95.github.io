---
slug: about-tech-stack
title: The Tech Stack Behind This Site
date: 2026-06-23
image: https://cdn.mikeq95blog.uk/coverimage/about-tech-stack-en-cn.png
tags:
  - about
description: "How this blog is actually built: Docusaurus + Supabase + Cloudflare, with Claude Code writing most of the code."
---

I mentioned in [About This Blog](/blog/about) that I'd write a separate post going into the tech stack. This is that post.

{/* truncate */}

## The Site Itself: Docusaurus

This blog is built with [Docusaurus](https://docusaurus.io), which is essentially a React framework made for documentation sites and blogs — you write Markdown, and it compiles that into a static site. It's apparently a Meta project.

The interactive parts of the page (the navbar, the comment section, the like button) are written as React components and plugged into Docusaurus's theme.

**Why I picked it**: what I wanted was a tool for writing a blog, not a framework for building a website from scratch. Docusaurus separates "writing posts" from "building pages" — I just write Markdown, and it already handles the navbar, search, categories, and dark mode by default. And since it's still React underneath, whenever I need a custom component or extra interaction, I can drop down to actual code without the framework getting in the way.

## Styling: Tailwind CSS

The page styling uses [Tailwind CSS](https://tailwindcss.com) (v4) — classes go straight on the component, no separate pile of CSS files to maintain.

**Why I picked it**: Tailwind puts styles right on the component tag, so you see what you're changing as you change it, and it's harder for the AI to edit the wrong file or miss a spot when it's modifying code.

## Animation: GSAP + Motion

Two libraries handle the motion: [GSAP](https://gsap.com) and [Motion](https://motion.dev). The sliding pill in the homepage tab bar and the button hover scale, for example, are written with GSAP; the reading progress bar at the top uses Motion. Both are loaded on demand, so pages that don't need animation don't carry that extra weight.

**Why I picked them**: plain CSS transitions only go so far — once a target value has to be computed at runtime (like where the pill should slide to), they get hard to maintain, and GSAP handles that kind of thing painlessly. Motion, on the other hand, fits more naturally with React state, which made it a good match for something like the reading progress bar that updates live as you scroll.

## Backend: Supabase

Login, comments, likes, and bookmarks — anything that needs to persist data — runs on [Supabase](https://supabase.com). It's essentially a hosted Postgres database, plus ready-made user authentication and a realtime API, so I don't have to run my own backend server.

**Why I picked it**: I don't come from a backend background, so standing up my own server, managing a database, and writing auth from scratch would cost too much time and be an easy place to introduce security holes. Supabase packages all of that, and I just call its SDK from the frontend — freeing up time to spend on writing and polishing the experience instead. It's also just standard Postgres underneath, not some closed proprietary format, so the data isn't locked in if I ever need to move platforms.

## Image Hosting: Cloudflare R2

Images in posts aren't stored in the repo — they get uploaded to [Cloudflare R2](https://www.cloudflare.com/products/r2/) object storage first, then served through my own domain, `cdn.mikeq95blog.uk`. I wrote a small script for the upload step: drop an image locally and it gets uploaded and swapped for the CDN link automatically.

**Why I picked it**: keeping images in the Git repo would make it grow forever and slow down every build. R2 is S3-compatible but has no egress fees, which is cheaper and lighter in the long run for a personal blog that isn't trying to make money off itself.

## Deployment: GitHub Pages + Cloudflare

The site's source lives on GitHub. Every push to `main` triggers a GitHub Actions run that builds the site with Docusaurus and publishes the static output to GitHub Pages. The domain, `mikeq95blog.uk`, sits behind Cloudflare, which also handles CDN acceleration and SSL.

**Why I picked it**: this blog is purely static — it doesn't need a server running all the time. GitHub Pages is free, ties directly into the repo, and publishes automatically on every push, so there's no extra deployment pipeline to maintain. Cloudflare sits in front for CDN acceleration and free SSL, both of which directly serve the "the site has to be fast" thing I care a lot about.

## On Writing the Code

Most of it is written by Claude Code; only a small part is mine.

## Summary

So that's the whole tech stack — hope it's useful to you.

| Layer | What's Used |
|------|----------|
| Site framework | Docusaurus (React) |
| Styling | Tailwind CSS |
| Animation | GSAP, Motion |
| Backend / database | Supabase |
| Image hosting | Cloudflare R2 |
| Deployment | GitHub Pages + Cloudflare |
