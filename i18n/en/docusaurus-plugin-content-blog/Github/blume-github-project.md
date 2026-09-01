---
slug: 2026/08/28/blume-github-project
title: Blume, a Zero-Config AI-Ready Documentation Framework
date: 2026-08-28
tags: [markdown, open-source, llm, Ai-friendly]
description: Blume is an open-source documentation framework built on Astro and Vite — maintain a folder of Markdown and it generates a static docs site with local search, AI-ready output, and a component library, without you having to build a React app yourself.
---

{/* truncate */}

> If you're new to this, this post includes a ready-to-use AI prompt that can set up the environment for you in one go.

---

## Introduction

If you've used Fumadocs or Docusaurus before, you know the feeling: you first have to set up a Next.js or React project yourself, install a pile of dependencies, wire up routing and theming, and only then can you start writing your first doc page — and that app has to be maintained alongside the framework going forward. Blume flips this around. All you have is a folder of `.md`/`.mdx` files, and the `blume` CLI generates and drives a hidden Astro project behind the scenes. You don't have to build navigation or search yourself, theming is already built in, and even the Open Graph images used for link previews get generated automatically at build time. If you want finer-grained control at some point, running `blume eject` promotes that Astro project into a standalone one you own — so it doesn't lock you out of that path entirely.

The config file `blume.config.ts` and every `meta.ts` under a directory are real TypeScript, authored with `defineConfig` and `defineMeta`. Your editor flags a misspelled field name before you even build. Inside MDX you can use cards, columns, steps, tabs, accordions, and code groups directly, without stacking a long list of imports at the top of every doc.

The core theme ships no client-side framework JS — pages are plain static HTML, so Core Web Vitals scores well by default. Search runs on the built-in Orama engine, indexed locally, with no third-party service needed in either dev or production. SEO is also pre-wired: metadata and Open Graph images are generated automatically at build time, and routine files like sitemap and robots.txt are already there too, so you don't have to piece them together yourself. After building, I checked the output and all of these were actually generated.

Output aimed at AI consumers is also built in: append `.md` to any page URL and you get the raw Markdown for that page, and the build also generates `llms.txt` and `llms-full.txt` automatically. The page itself carries "Copy as Markdown" and "Open in ChatGPT/Cursor" buttons. Going a step further, the hosted MCP server and the built-in Ask AI assistant both require switching the deployment to server-side rendering, and Ask AI additionally needs you to configure an API key for a model gateway — it defaults to Vercel AI Gateway, but can be swapped for something like OpenRouter. Both of these need a paid key and a server environment, so I did not actually test them — stating that plainly here.

`blume check` runs `astro check` for type checking, `blume validate` checks internal links and assets, and `blume doctor` diagnoses configuration and content issues. I ran all three locally and the output was clean. `audit`, `validate --external`, `translate`, and `eval` can also hook into a locally installed Claude Code or Codex CLI to fix issues they find automatically, though these depend on a local agent environment I didn't test alongside this. Deploying to Vercel, Netlify, or Cloudflare Pages requires basically no manual adapter setup — it's auto-detected.

The repository was created in late June 2026, hit its 1.0 release on July 13, and had passed 1,350 stars on GitHub by the time I wrote this post, with commits still landing in late August. Hayden Bleasel previously built next-forge and Ultracite, both following the same "zero-config, works out of the box" approach — Blume is the newest entry in that lineup.

---

## Setup

You only need Node.js 22.12 or newer, and there's no need to prepare any content files ahead of time — `blume init` will create an example page for you automatically. Create an empty directory and run the init command:

```bash
npx blume init
```

This step is interactive, asking about the project location, site name, template, and content directory. If you don't want to answer each prompt, add `--yes` to use the defaults:

```bash
npx blume init --yes
```

This generates a `package.json` (already wired with `dev`, `build`, and `doctor` npm scripts), `blume.config.ts`, and an example `docs/index.mdx` page; `.gitignore` also gets `node_modules/`, `.blume/`, and `dist/` added automatically. Install the dependencies:

```bash
npm install
```

---

## Running

Start the dev server with hot reload:

```bash
npm run dev
```

The terminal prints a local address, `http://localhost:4321/` by default. On my end, the homepage returned a 200, with the page title made up of the `title` field from `docs/index.mdx` plus the site name. Appending `.md` to any page address — for example `http://localhost:4321/index.md` — gets you the raw Markdown behind that page directly, which is the most direct part of its "readable by AI" capability.

Once everything checks out, run the build, which bundles a local search index into `dist/` along with the site:

```bash
npm run build
```

This also ran cleanly on my end. The output directory contained `llms.txt`, `llms-full.txt`, `robots.txt`, and `blume-search.json`; `index.html` is the compiled static page, ready to drop onto any static host.

---

## Results

(Insert screenshot here: the local docs site homepage, with the sidebar navigation and search box in the top right)

(Insert screenshot here: the raw Markdown shown in the browser after appending `.md` to a page address)

Here's a set of command outputs I actually ran locally:

```text
$ npm run dev
 astro  v7.2.9 ready in 4889 ms
┃ Local    http://localhost:4321/

$ curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/
200

$ npm run doctor
[blume] ℹ Pages: 1
[blume] ℹ Output: static
[blume] ℹ Search: orama
[blume] ✔ No problems found.
```

The summary panel printed after a build:

```text
╭───────────────────────────────────────╮
│  Output     static                    │
│  Adapter    none                      │
│  Search     orama                     │
│  Robots     yes                       │
│  Agent JSON yes                       │
│  LLM files  yes                       │
│  Server features  none                │
╰───────────────────────────────────────╯
```

---

## Similar Projects and Reception

Blume's own FAQ names a few competitors directly. [Mintlify](https://mintlify.com) gets you results fast, but you write inside its hosted system and deploy to its infrastructure — the core is closed-source. [Fumadocs](https://fumadocs.dev) goes the other way: an open-source component library that's flexible, but it hands you a Next.js project you have to scaffold and maintain yourself long-term. Docusaurus gets grouped in the same category — also open source, also requiring you to own and maintain a React app. Blume takes a third path, "framework as template," running on Astro, with no separate app for you to maintain.

[An analysis on Winbuzzer](https://winbuzzer.com/2026/07/16/blume-turns-markdown-folders-into-ai-ready-documentation-xcxwbn/) lines Blume up against VitePress and MkDocs, and raises its own question: features like Ask AI and MCP still require a team to run a server-side adapter, so whether Blume actually saves the operational overhead it promises depends on how it plays out in real deployments.

Blume is young — the repo went up in late June, and 1.0 shipped July 13 — and while stars are climbing fast, independent community discussion is thin so far. Multiple keyword searches across X, Reddit, and Zhihu turned up mostly the author's own launch posts and tech-media write-ups that followed the release cycle, not independent hands-on accounts. Author Hayden Bleasel currently works at OpenAI; his earlier projects, next-forge and Ultracite, follow the same "zero-config, works out of the box" positioning — Blume is the newest entry in that line.

---

## Prompt for AI Coding Agents

```text
## Goal
Set up the Blume documentation framework in the current directory, and get the dev server and static build both running.

## Steps
Confirm Node.js is >= 22.12. In an empty directory, run `npx blume init --yes` (interactive setup; --yes skips the prompts and uses defaults). This generates package.json, blume.config.ts, and docs/index.mdx.
Note: do not try `npm create blume@latest` or a similar scaffolding command to initialize it — that package name doesn't exist and will 404. The official way is to run `npx blume init` directly.
Run `npm install` to install dependencies, then `npm run dev` to start the dev server (default http://localhost:4321/), and confirm the homepage loads normally. Then run `npm run build`, and confirm the dist/ directory is generated and contains llms.txt, llms-full.txt, and index.html.
The Ask AI assistant and the hosted MCP server require switching to server-side rendering deployment, and Ask AI also needs an API key for a model gateway (defaults to Vercel AI Gateway) — skip both, don't attempt to configure them.

## Verification
Confirm that after `npm run dev` starts, the homepage returns a 200. Confirm that `npm run build` exits without errors and that dist/ actually contains llms.txt and index.html. Report both results back to me.

For exact commands and details, see this post: https://mikeq95blog.uk/blog/2026/08/28/blume-github-project
```

---

## Uninstalling and Running It Again

To uninstall, just remove the `blume` dependency along with the config, cache, and build output it generated.

```bash
npm uninstall blume
rm -rf blume.config.ts .blume dist
```

Whether to keep `docs/` depends on your situation — if it's still just the example page, you can remove it too with `rm -rf docs`; if you've already written real content into it, leave that directory alone.

To run it again later, there's no need to re-run init — just:

```bash
npm run dev
# or
npm run build
```

---

## Summary

What Blume is trying to solve is the fact that writing docs shouldn't require you to first maintain an app. Fumadocs and Docusaurus both require you to own and keep upgrading a React project; Blume tucks that layer into its CLI, leaving you with nothing but a folder of Markdown. It's only been out for about a month and a half, and community discussion is still thin — I searched a few rounds of keywords on X and Reddit and mostly found the author's own release posts and a handful of tech-media write-ups following the release, nothing independent with concrete usage details. If you're currently writing docs with Docusaurus or a homegrown MDX setup and want local search and AI-ready output out of the box, it's worth trying on a small project.
