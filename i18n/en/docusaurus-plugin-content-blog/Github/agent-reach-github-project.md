---
slug: 2026/08/28/agent-reach-github-project
title: Agent Reach, an Open-Source CLI That Gives AI Agents Internet Access
date: 2026-08-28
tags:
  - github
  - python
  - AI
  - open-source
  - Ai-friendly
description: Agent Reach is an open-source command-line tool that selects, installs, and health-checks the currently most reliable access method for a dozen-plus platforms for AI agents; the actual searching and reading is carried out directly by upstream tools like gh and yt-dlp.
---

{/* truncate */}

> If you're new to this, this post includes a ready-to-use AI prompt that can set up the environment for you in one go.

---

## Introduction

Once installed, an agent can read Twitter, search Reddit, pull YouTube captions, browse XiaoHongShu, and look up GitHub repos, covering public content across a dozen-plus platforms, with no API cost according to the project. It's written in Python and was created in late February this year. As of when this post was written, in late August, its GitHub star count had climbed past 76,000, with over 6,500 forks, making it one of the fastest-growing agent-infrastructure projects this year. The latest commit landed three days ago — this isn't a repo that burned bright and went quiet.

Platform support has two tiers. The first tier needs no configuration at all and works right after install; the second needs a cookie or a logged-in session to unlock deeper functionality.

| Channel | Works out of the box | To unlock more |
| --- | --- | --- |
| Web pages | Read any page (Jina Reader) | — |
| YouTube | Captions + video search (yt-dlp) | — |
| GitHub | Read public repos, search (gh CLI) | Log in for private repos, filing Issues/PRs |
| RSS/Atom | Parse feeds (feedparser) | — |
| V2EX | Hot topics, node topics, user info | — |
| Web-wide semantic search | Exa semantic search, MCP-connected, no key needed | — |
| Bilibili | Search + video details (bili-cli, no login needed) | Captions need OpenCLI |
| Twitter/X | Read a single tweet | Search, timeline browsing need a cookie |
| Reddit | — | Search, reading posts needs a logged-in session; the project says there's no zero-config path |
| XiaoHongShu | — | Search, reading, comments need a Chrome session or a cookie |
| Facebook / Instagram | — | Search, profile pages need a Chrome login session |
| LinkedIn | Jina Reader reads public pages | Profile details, job search need MCP |
| Xueqiu | — | Quotes, posts need a login cookie |
| Xiaoyuzhou podcasts | — | Transcription needs a free Groq key |

Two engineering details stand out as genuinely useful. One is that each platform isn't tied to a single tool — it's backed by an ordered list of a preferred backend plus fallbacks. Twitter, for example, tries `twitter-cli` first, falls back to OpenCLI, and falls back further to the older `bird` if needed. Switching access methods is just a matter of reordering that list rather than rewriting code, and the author says this is exactly how the project survived a wave of single-platform CLIs going unmaintained in March 2026. The other is `agent-reach doctor`, a single command that tells you the current status of every channel and which backend it's actually using right now, and how to fix it if something's broken.

By default, installation only runs read-only checks and doesn't quietly modify your system — you need to explicitly pass `--system` before it actually installs dependencies and writes configuration. `--dry-run` lets you preview what it would do beforehand, and uninstalling lets you choose to remove only the skill files while keeping cookies you've already configured.

---

## Setup

You need Python 3.10 or newer. The project specifically warns against installing directly from PyPI with `pip install agent-reach` — that's a different package with the same name, not this project. You have to install it from the GitHub source.

pipx is recommended:

```bash
pipx install https://github.com/Panniantong/agent-reach/archive/main.zip
```

If your Python comes from Homebrew, a direct `pip install` will most likely hit PEP 668's externally-managed-environment protection. In that case, use a virtual environment instead:

```bash
python3 -m venv ~/.agent-reach-venv
source ~/.agent-reach-venv/bin/activate
pip install https://github.com/Panniantong/agent-reach/archive/main.zip
```

Either way, the `agent-reach` command ends up linked into your PATH once installed.

---

## Running

First confirm it's installed:

```bash
agent-reach --version
# Agent Reach v1.5.0
```

Run the read-only check — this step doesn't modify your system, it just looks at what your machine already has:

```bash
agent-reach install --env=auto
```

My Mac already had gh CLI and mcporter installed, so the output looked roughly like this:

```text
✅ GitHub CLI already installed
✅ Node.js already installed
✅ mcporter already installed
Status: 5/15 channels active
```

Once you're ready to actually install dependencies and write config, add `--system`. If you just want to preview what it would do without touching anything, add `--dry-run`.

After installing, run `agent-reach doctor` to see the current status of every channel and which backend it's actually routing through:

```bash
agent-reach doctor
```

The zero-config channels — web pages, YouTube, RSS, V2EX — showed up as green ✅ right away on my machine.

> Note: `doctor` marked GitHub and web-wide semantic search with a yellow warning, which doesn't mean they're broken. It's a deliberate choice not to run live network checks for those (for example, it avoids running `gh auth status`, which writes a device ID). Both actually worked fine when called directly, as the next section shows.

---

## Results

Here are a few outputs I actually ran locally, pasted as-is.

Reading the GitHub repo the project itself lives in:

```bash
gh repo view Panniantong/Agent-Reach --json stargazerCount,forkCount,pushedAt
```

```json
{"stargazerCount":76080,"forkCount":6510,"pushedAt":"2026-08-25T05:36:18Z"}
```

Extracting YouTube video info, using a link I grabbed at random:

```bash
yt-dlp --dump-json "https://www.youtube.com/watch?v=dQw4w9WgXcQ" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['title'])"
```

```text
Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)
```

Yes, that's the link. Couldn't resist.

Reading V2EX's hot topics, through the official public JSON API — no login required anywhere in the flow:

```bash
curl -s "https://www.v2ex.com/api/topics/hot.json" -H "User-Agent: agent-reach/1.0"
```

This returns the full array of hot posts, with fields like node, author, and reply count on each entry — ready to feed straight into an agent for summarizing.

Web-wide semantic search is the most worth showing, since it's the one channel where the traditional option costs money and this one doesn't need a key at all:

```bash
mcporter call exa.web_search_exa query="LLM框架对比" numResults=3
```

The results come with body excerpts attached, not just titles and links:

```text
Title: 2026 年最佳 LLM 框架对比（附使用场景） – ModelRiver Blog
...
- LangChain — 最适合快速原型和迭代
- LlamaIndex — 最适合 RAG 和检索密集型应用
...
```

---

## Similar Projects and Reception

There's more than one way to help an AI read the web. [Firecrawl](https://www.firecrawl.dev) takes a pure SaaS route — it turns a single web page into clean Markdown or structured data, charges by usage, and doesn't touch platforms with login walls like Twitter, Reddit, or XiaoHongShu. The third-party site [opensourcealternatives.to](https://www.opensourcealternatives.to/item/agent-reach) lists Agent Reach as its open-source, free alternative. [Bright Data](https://brightdata.com) targets enterprise customers — proxy pools, Web Unlocker, prebuilt datasets, all real money — and operates at a scale and price point completely different from a self-hosted router meant for individuals or small teams like Agent Reach. [Browserbase](https://www.browserbase.com) gives you a managed headless browser session, and you still have to write your own Playwright scripts to parse the page. Agent Reach goes the other direction — it picks a ready-made CLI or MCP for each platform ahead of time, so you don't write your own scraping code.

[A hands-on review from Codefather.cn](https://www.codefather.cn/post/2082653593961345025) found a handful of concrete issues. XiaoHongShu search had only a 60% success rate due to anti-scraping measures, which they got up to 85% after adding retries and a proxy pool. Different platforms returned inconsistently formatted fields, so the author wrote their own adapter layer to normalize them. Under 30 concurrent requests, GitHub and Reddit returned 429s, and Twitter even had its IP temporarily banned for two hours — a rate limiter fixed that. Their conclusion was that the tool is good for quick validation, but not well suited to use cases that demand high data-collection precision.

Two hands-on write-ups on Zhihu are worth a look. [One](https://zhuanlan.zhihu.com/p/2015498181513864402) points out that Claude Code only scans the root-level SKILL.md by default and doesn't detect Agent Reach's SKILL.md nested inside `agent_reach/skill/`, so you have to copy it out manually. It also notes that server-side access to Bilibili and Reddit often gets a 403 because the platforms block datacenter IPs, which a residential proxy fixes. [The other](https://zhuanlan.zhihu.com/p/2014693200489652339), by an author going by "老金" (Lao Jin), tested nine platforms and ran into finer-grained issues. Chrome 130 and later added cookie encryption, which broke automatic-extraction tools like rookiepy outright, leaving manual copying of `auth_token` and `ct0` from DevTools as the only option. On Windows, Unicode characters in mcporter's output crashed Python's GBK decoding, which they fixed by patching the source to add `encoding='utf-8'`; separately on Windows, mcporter's subprocess launch also failed to find the `.CMD` file. They also mentioned that while cookie-based auth is stable, it does expire, and recommended using a secondary account so a primary account isn't put at risk.

---

## Prompt for AI Coding Agents

```text
## Goal
Install Agent Reach on the current machine, and verify that the zero-config channels — web pages, YouTube, GitHub, RSS, V2EX, and web-wide semantic search — can actually retrieve real content.

## Steps
1. Confirm Python version >= 3.10.
2. Install with pipx: pipx install https://github.com/Panniantong/agent-reach/archive/main.zip
   If you see an externally-managed-environment error (common with Homebrew Python), use a virtual environment instead:
   python3 -m venv ~/.agent-reach-venv && source ~/.agent-reach-venv/bin/activate && pip install https://github.com/Panniantong/agent-reach/archive/main.zip
   Do not install directly from PyPI with pip install agent-reach — that's a different package with the same name, not this project.
3. Run agent-reach install --env=auto for a read-only check; only after the user explicitly approves, add --system to actually install missing dependencies like gh CLI / Node.js / mcporter.
4. Run agent-reach doctor and confirm the status of each channel.
5. Verify a few zero-config channels for real, using the upstream tools directly:
   - curl https://r.jina.ai/<any web page URL>
   - gh repo view <owner/repo>
   - yt-dlp --dump-json <a YouTube link>
   - curl https://www.v2ex.com/api/topics/hot.json -H "User-Agent: agent-reach/1.0"
   - mcporter call exa.web_search_exa query="<any query>" numResults=3
6. For platforms that require a login session (Twitter, Reddit, XiaoHongShu, Facebook, Instagram, Xueqiu, Xiaoyuzhou podcasts), do not attempt to log in automatically or read browser cookies — follow doctor's guidance and tell the user what authorization step is needed.

## Verification
Paste the full output of agent-reach doctor back to the user, confirm the zero-config channels show as active, and explain which remaining channels need a cookie or key from the user to unlock.

For exact commands and details, see this post: https://mikeq95blog.uk/blog/2026/08/28/agent-reach-github-project
```

---

## Uninstalling and Running It Again

Uninstalling maps to the two things that got installed: Agent Reach's own configuration, and the upstream tool dependencies.

```bash
agent-reach uninstall               # removes the ~/.agent-reach/ config, each agent's skill files, and the MCP entries in mcporter
agent-reach uninstall --keep-config # removes only the skill files, keeps cookies/tokens you've already configured
pip uninstall agent-reach           # removes the Python package itself (pipx users: pipx uninstall agent-reach)
```

I ran `--dry-run` once, and the output clearly listed which directories would be removed, including `~/.agent-reach` (where all tokens and cookies live) and a few agents' skill directories — it doesn't touch tools like gh or mcporter that your system installed on its own.

To use it again later, there's no need to redo the installation flow — just run:

```bash
agent-reach doctor
```

Confirm the channel status still looks normal, and the agent can keep calling the upstream tools as usual.

---

## Summary

Agent Reach is aimed at people who already rely on a coding agent day to day and want it to reach out onto the internet too. It doesn't do any scraping or searching itself — it just figures out which access path is currently the most reliable, installs it, and health-checks it, leaving the actual work to mature tools like gh, yt-dlp, and bili-cli. The six or seven zero-config channels are essentially ready to use right after install. The real friction is platforms like Twitter, Reddit, and XiaoHongShu that need a logged-in session — whether it's worth wiring up a cookie for those is something you have to weigh for yourself. The project is still iterating quickly and its star count is climbing fast, so it's worth watching whether more channels get added down the line.
