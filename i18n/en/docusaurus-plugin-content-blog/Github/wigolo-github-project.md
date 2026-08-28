---
slug: 2026/08/28/wigolo-github-project
title: "wigolo: A Local-First, Key-Free Web Intelligence MCP Server"
date: 2026-08-28
tags: [github, AI, llm, open-source, Ai-friendly]
description: "wigolo is a local-first MCP server that turns web search, fetch, crawl, and structured extraction — six core tools total — into a local engine that needs no API key at all; this article covers actually setting it up and testing each of the six tools."
---

wigolo is an MCP server that runs on your own machine, built specifically to handle "going online" for AI coding agents. Its six core tools need no API key, queries are free, and the data never leaves your machine.

{/* truncate */}

> If you're new to this, this article includes a ready-to-use AI prompt that can set up the environment for you in one go.

---

## Introduction

wigolo is a local-first MCP server by KnockOutEZ. It packs the two things AI agents most often do online — web search and fetching — into an engine that runs locally, and on top of that it can crawl a site across multiple pages by following links, and pull structured data out of a page. All six core tools need no API key, and queries are free. All the data stays in the local `~/.wigolo/` directory and never gets sent anywhere else.

The project is written in TypeScript and was only created this April. It's already past 4,700 stars on GitHub, though it's still in public beta and hasn't reached v1. The author says the core functionality is backed by 7,600 test cases.

Beyond that, wigolo has two autonomous tools that need an LLM key to run. `research` breaks a question into several sub-queries, fetches sources in parallel, and synthesizes a report with citations. `agent` takes a single natural-language instruction and plans out what to search for and which URLs to fetch on its own, running within a given time budget. I didn't test either of these this time — they require a free Gemini key or a local Ollama setup, which I'll touch on later.

What actually sets wigolo apart from a regular search API is that every result comes with a byte offset back to the source text, which the project calls `source_span`. Testing it out, a search does return `start`/`end` fields under `source_span`, pinpointing exactly where the excerpted text sits in the original page — so an agent citing content can point to a specific passage instead of a vague "probably from this article." Each result's credibility is also broken down instead of collapsed into one generic relevance number: semantic relevance and keyword match are the main factors, and how many search engines independently surfaced the same result also plays a part. When an engine drops out or gets rate-limited, wigolo doesn't quietly paper over the gap — more on that in the demo section below.

---

## Setup

No dependencies to install ahead of time — just run the latest version with `npx`. The only requirement is Node.js ≥ 20:

```bash
npx wigolo init
```

The first run checks your system, then downloads a headless browser engine, an embedding model for semantic search, and an ML model for reranking search results, in that order — roughly 1.5 GB combined, which can take a few minutes depending on your connection. That's expected, not a hang. I'm on Node 26, and npm printed a warning up front that `better-sqlite3` falls outside its officially supported range (20.x-25.x); in practice it didn't matter, `init` still completed fine.

If you also want to wire it into a coding agent — Claude Code or Cursor, say — you can do that in the same step:

```bash
npx wigolo init --agents=claude-code,cursor
```

Once it's done, check the state of each component with `doctor`:

```bash
npx wigolo doctor
```

> One thing worth noting: the first time I ran `init`, a line appeared in the log — `reranker failed: Failed to load reranker model: terminated` — meaning the reranker model download failed partway through. `init` didn't exit because of it; it went on to finish installing the Firefox and WebKit browser engines. Running `doctor` afterward showed the reranker model as `installed`, and every real call I made after that loaded it correctly with no further issues.

At this point, wigolo's local environment is set up and ready to run.

---

## Running It

There are two ways to use it once it's installed. Run it with no arguments at all:

```bash
wigolo
```

This starts an MCP server on stdio, ready to use with whatever coding agent you wired up via `--agents` during `init`. The other way is a one-shot CLI call for a single tool, which is handy for testing one capability at a time — that's how each of the six core tools below was tested.

At this point, wigolo is up and running.

---

## Demo

### search

Starting with basic keyword search:

```bash
npx wigolo search "local-first software" --max-results 5 --json
```

The first run got stuck loading the reranker model — over three minutes with no result — so I killed the process and ran it again. The second time, with the model already loaded, the whole search took just 4.5 seconds. Of the four engines, bing, duckduckgo, and wikipedia all returned normally; marginalia got rate-limited and returned a 429. wigolo didn't quietly drop that result — it wrote `Marginalia returned 429` right into `engine_warnings` and marked the overall `engine_pool.degraded` as `true`. Of the 5 results returned, the top-ranked Wikipedia entry came with a full `evidence_score` breakdown, plus a `source_span` pointing precisely to bytes 39 through 539 of the source text.

> The three-minute stall on the first run might not happen every time, but it does show the reranker model's cold start can be slow. If you hit something similar, don't assume the install is broken — wait it out, or kill and retry.

### fetch

Fetching a specific page:

```bash
npx wigolo fetch "https://en.wikipedia.org/wiki/Local-first_software" --json
```

This one was fast — clean markdown body within a few seconds, title included, with all the navigation and sidebar clutter from the Wikipedia page itself filtered out.

### crawl

Crawling a small site to test multi-page traversal:

```bash
npx wigolo crawl "https://docs.astral.sh/uv/" --max-pages 3 --json
```

It found 23 crawlable links from the entry page and, per the limit, actually crawled 3, finishing in about two seconds. Each page's content came with an `evidence` field, again with `source_span` byte offsets and a matching excerpt from the source text.

### extract

Testing structured extraction against wigolo's own GitHub repo page:

```bash
npx wigolo extract "https://github.com/KnockOutEZ/wigolo" --json
```

A bit over a second, and it returned title, description, and Open Graph image as clean metadata fields — no need to write your own regex to scrape a page's structure.

### cache

After running the previous three tools, the cache already had content in it:

```bash
npx wigolo cache stats
```

It showed 4 cached URLs, 0.38 MB total. Searching the cache in hybrid mode, without touching the network again:

```bash
npx wigolo cache search "uv lock dependencies" --mode hybrid --json
```

It matched the uv docs page crawled just before, with keyword search and semantic search each scored separately and then fused into a single ranking — the top result was the most relevant page.

### find-similar

Finding related pages from a URL:

```bash
npx wigolo find-similar "https://docs.astral.sh/uv/" --max-results 5 --json
```

This one also runs a search-plus-rerank pass internally — the log showed the reranker model being invoked repeatedly — and took nearly a minute to finish, noticeably slower than a plain `search`. But it did return results and didn't hang indefinitely.

All six core tools ran successfully against real network requests. `research` and `agent`, which need an LLM key, weren't tested this time — they should work with a free Gemini key or a local Ollama setup, but I haven't actually verified that.

---

## Similar Projects and Reception

There's no shortage of commercial products doing the same thing. [Firecrawl](https://www.firecrawl.dev/) focuses on web scraping and structured extraction and also supports full-site crawling — wigolo's own README lists it as one of its comparison targets. The difference is that Firecrawl requires an API key and charges by usage, while wigolo adds byte-level source location and explainable scoring on top of free queries. [Exa](https://exa.ai/) is stronger on semantic search specifically — wigolo's README notes it can fully render structured content like comparison matrices — but it also requires an API key, charges per request, and lacks things like `source_span` and the scoring breakdown. [Tavily](https://www.tavily.com/) is positioned as a search API for agent and RAG use cases, with search and fetch capabilities roughly on par with wigolo's, except it doesn't support full-site crawling and, again, needs a key and charges for use.

A [Zhihu writeup on the open-source project](https://zhuanlan.zhihu.com/p/2062103128321930499) breaks down the design logic behind all 10 tools in some detail, explaining both the byte-level source location and explainable scoring mechanisms clearly, and its advice is to pick tools based on the scenario rather than blindly favoring one over the others; it also mentions an honest limitation — datacenter IPs clear anti-bot challenges less reliably than residential networks do. On X, a verified account, [@geekbb, posted a comparison thread](https://x.com/geekbb/status/2082645166876471506) titled "Firecrawl vs Wigolo, Wigolo is ridiculously strong," which picked up 464 likes and 69,000+ views. In the replies, [@Ericgongg_ pushed back](https://x.com/Ericgongg_/status/2082659076333563980) with a different take: "Looks strong, but setting it up is really unstable, and the search engines are a hassle too." That lines up exactly with the three-minute stall I hit on my first `search` call, which suggests it's not just my machine.

---

## Prompt for AI Coding Agents

Don't want to type all this in yourself? Hand the block below to Claude Code or Codex, and let it install wigolo and run through all six core tools to confirm they work.

```text
## Goal
Install wigolo, a local-first MCP server, on the current machine, and confirm all six key-free core tools — search, fetch, crawl, extract, cache, and find-similar — work correctly.

## Steps
1. Confirm Node.js is version 20 or later
2. npx wigolo init (the first run downloads a headless browser engine and local ML models, about 1.5 GB, which takes a few minutes — that's expected, not a hang)
3. npx wigolo doctor to confirm each component's status; if any component shows as not installed, run npx wigolo warmup --all to fix it
4. Actually call each of the six tools in turn — search, fetch, crawl (use a small --max-pages), extract, cache stats/search, find-similar — against real URLs, not just --help
5. If you want to wire it into a coding agent like Claude Code or Cursor, use npx wigolo init --agents=claude-code,cursor to do it in one step

## Verification
Send me the command and result for each of the six tools. Check specifically for any errors, and whether the returned content includes byte-level source location fields like source_span.

Exact commands and parameter details can be checked against this article: https://mikeq95blog.uk/blog/2026/08/28/wigolo-github-project
```

---

## Uninstalling and Running It Again

Everything was installed through `npx`, so nothing was installed globally — what actually takes up space is the browser engine and models downloaded by `init`. Uninstalling is a single command:

```bash
npx wigolo config --uninstall --yes
```

If you'd previously wired it into a coding agent with `--agents`, this also removes that integration.

To use it again, there's no need to rerun `init` — just run whichever tool command you need:

```bash
npx wigolo search "your query" --json
```

wigolo automatically detects whether the local components are already installed, and re-runs the download process for whatever's missing.

---

## Summary

All six key-free core tools were tested against real network requests this time, and every one of them worked. The `search` call stalled for over three minutes on its first run and only took a few seconds after being killed and retried — the one thing worth flagging from this whole verification, most likely the cost of the reranker model's cold start rather than a broken install. `research` and `agent`, the two autonomous tools that need an LLM key, weren't tested; I'll look into them once I've set up a free Gemini quota or a local Ollama instance. The project is still in public beta, and the 4,700-plus stars and 7,600 test cases are numbers from the author, but in practice, what the six core tools actually returned matched what the documentation describes.
