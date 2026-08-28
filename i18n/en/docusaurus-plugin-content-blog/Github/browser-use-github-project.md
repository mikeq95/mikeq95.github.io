---
slug: 2026/08/28/browser-use-github-project
title: Browser Use, an Open-Source Framework That Lets AI Agents Take Over a Browser
date: 2026-08-28
tags:
  - github
  - python
  - AI
  - open-source
  - Ai-friendly
description: Browser Use is an open-source Python framework that lets an AI agent operate a browser through real-time LLM decisions, supporting both a CLI for coding agents and a standalone Python library.
---

Browser Use is an open-source Python framework that lets an AI agent operate a browser the way a person would. It doesn't decide in advance which button to click or which field to type into — that decision is made by an LLM at runtime, based on what's actually on the page, without a single line of pre-written CSS selector needed.

{/* truncate */}

> If you're new to this, this post includes a ready-to-use AI prompt that can set up the environment for you in one go.

---

## Introduction

The project was created in late 2024 by Magnus Müller and Gregor Žunič, one based in Zurich, the other in San Francisco. As of when this post was written, its GitHub star count had climbed to 111,498, with over 12,000 forks — one of the largest open-source projects in the AI browser-automation space. The repo is still getting commits regularly; this isn't a project that burned bright once and went quiet.

There are two ways to plug it in. If you're already using a coding agent like Claude Code, Codex, or Cursor, you can paste the official natural-language prompt and it installs browser-use itself, registers the corresponding skill, and connects to whatever browser is running locally. Once that's done, the coding agent pipes a snippet of Python directly into the CLI to control the browser — what to click, what to fill in is entirely up to the coding agent's own model. Browser-use's job at that point is just to carry out the resulting CDP instructions, and you don't need a separate LLM API key for this path.

If you want to run tasks in bulk from your own code, or embed browser capability into a product, that's the Python library path. Once installed, you import an `Agent` class and can spin up a browser agent in a few lines. In this case the agent's decisions come from browser-use's own full agent loop, which does need a separate LLM API key to run. The model isn't locked to one provider: there's an official `ChatBrowserUse` tuned specifically for browser tasks, or you can pass a provider-prefixed model id like `anthropic/claude-sonnet-4-6` or `openai/gpt-5.5` directly — a single `BROWSER_USE_API_KEY` reaches all of them. If you need extra capability, the `Tools()` class with the `@tools.action` decorator lets you add actions beyond browser operations (calling an internal API, for example) to the agent's toolset.

The open-source version is free, runs entirely on your own machine, and lets you deeply customize agent behavior. The README also says plainly that concurrent multi-browser sessions, proxy rotation, and anti-detection all concentrate in the paid Browser Use Cloud, and the accuracy chart it includes shows the cloud version scoring noticeably higher — a tradeoff the project acknowledges itself in its own documentation. The cloud tier additionally offers automatic CAPTCHA handling, sessions up to 4 hours long (for paid subscribers), over a thousand third-party integrations, and rerunnable scripts that keep working even after a target site's layout changes.

On the benchmark side, the project open-sourced `browser-use/benchmark`, covering 100 real-world browser tasks that anyone can pull down and verify for themselves. A separate third-party leaderboard, Odysseys, measures 200 long-horizon web tasks specifically, and browser-use ranks first there with an average score of 87.4%, ahead of the computer-use agents from OpenAI, Anthropic, Google, and Microsoft.

---

## Setup

Running it requires Python 3.11 or newer. Either `uv` or `pip` works for the install:

```bash
uv add browser-use
# or: pip install browser-use
```

If you don't have a usable Chromium locally, the CLI ships its own install command, which calls Playwright under the hood:

```bash
browser-use install
```

Only the Python library path — where browser-use runs its own agent loop — requires a `.env` file in your project directory with an LLM API key:

```bash
# .env
BROWSER_USE_API_KEY=your-key
# GOOGLE_API_KEY=your-key
# ANTHROPIC_API_KEY=your-key
```

`BROWSER_USE_API_KEY` is the project's own key, and it works with `ChatBrowserUse` as well as any provider-prefixed model id. If you'd rather not use it, you can fill in an OpenAI, Anthropic, or Google key directly instead. If you're going the CLI-plus-coding-agent route, you can skip this step entirely — the coding agent's own model subscription is enough.

---

## Running

To hook it straight into a coding agent like Claude Code or Codex, paste this prompt and it will install the environment, register the skill, and connect to your browser on its own:

```text
Install or upgrade browser-use to the latest stable version with uv using Python 3.12, run `browser-use skill install` to register the skill, and connect it to my browser. If setup or connection fails, follow https://github.com/browser-use/browser-harness/blob/main/install.md.
```

Once that's done, the coding agent pipes a snippet of Python into the CLI, using pre-imported helper functions like `new_tab()`, `click_at_xy()`, and `page_info()` to control the browser directly — no separate browser-use agent loop involved:

```bash
browser-use <<'PY'
new_tab("https://news.ycombinator.com")
print(page_info())
PY
```

To run it from your own script, take the Python library path instead — spin up an `Agent` instance and describe the task in a plain-language sentence:

```python
import asyncio

from browser_use import Agent, ChatBrowserUse

async def main():
    agent = Agent(
        task="Find the number of stars of the browser-use repo",
        llm=ChatBrowserUse(model='openai/gpt-5.5'),
    )
    history = await agent.run()

if __name__ == "__main__":
    asyncio.run(main())
```

If you'd rather not run any environment locally at all, you can call the Cloud REST endpoint directly and let the cloud run the task:

```bash
curl -X POST https://api.browser-use.com/api/v4/runs \
  -H "X-Browser-Use-API-Key: $BROWSER_USE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"task": "Your task"}'
```

> Note: the CLI path and the Python library path are two distinct mechanisms. In the CLI, the coding agent's own model is the "brain," and browser-use just carries out the resulting CDP instructions. In the Python library, `Agent()` is browser-use's own full decision loop. Don't conflate the two.

---

## Results

This section is put together from the official docs, the open-source benchmark repo, and community reports — not a local, hands-on test. Running an agent loop burns LLM tokens, and this post deliberately doesn't spin up an actual agent task to spend that money.

The README gives two concrete scenarios. One is filling out a job application, matching resume details to form fields one by one — [the corresponding example script](https://github.com/browser-use/browser-use/blob/main/examples/use-cases/apply_to_job.py) is right there in the repo. The other is extracting structured data about a user's followers on a social platform and exporting it as a CSV, done through [the Cloud path](https://docs.browser-use.com/cloud/quickstart). The `examples/use-cases` directory also has scripts for price comparison, checking appointment availability, CAPTCHA handling, and password-manager integration — a wider range of tasks than what's shown on the front page.

On benchmarks, the project's own `browser-use/benchmark` covers 100 real-world browser tasks and is itself open source, so anyone curious can run it and check the numbers themselves. The third-party Odysseys leaderboard separately measures 200 long-horizon web tasks, and browser-use ranks first there with an average score of 87.4% — that number comes from a third-party leaderboard, not the project grading its own homework.

---

## Similar Projects and Reception

### Comparable Projects

Browser-use isn't the only project taking the "AI operates the browser" approach. [Stagehand](https://github.com/browserbase/stagehand), from Browserbase, is TypeScript-first and takes a hybrid approach — Playwright code handles most of the work, with AI stepping in only where a selector breaks or the page structure changes. That's more controllable than handing an entire task over to an LLM's own decisions the way browser-use does, and easier to debug step by step. [Skyvern](https://github.com/Skyvern-AI/skyvern) takes a different route entirely, relying on visual recognition of the page rather than reading the DOM. Its pitch is not needing per-site adaptation, and it comes with a no-code workflow editor, making it better suited to multi-step forms and portal-style scenarios.

### In-Depth Reviews

An analysis on the independent blog [artificiallyintimidating.com](https://artificiallyintimidating.com/p/browser-use) puts browser-use side by side with Cloudflare's newer Kitesurf, as well as pricing from Browserbase and UiPath. The piece notes that the "open-source version is deliberately kept weaker" framing comes from the README itself, not outside speculation, and also observes that browser-use's star count is high while the actual volume of community discussion around it is comparatively thin. [A review on unsubbed.co](https://unsubbed.co/tools/browser-use/), built from the GitHub repo, the official docs, and five other third-party sources, works out a cost comparison between self-hosting and the cloud tier, and concludes that non-technical teams probably aren't a good fit for using it directly. [A hands-on write-up on CSDN](https://blog.csdn.net/ol789012345/article/details/153603588) covers specific problems the author ran into while building with browser-use — for example, visual comprehension dropping noticeably after switching the model from GPT-4o to DeepSeek, and a bug where a new Browser instance created for every task caused session state to get lost, along with the fix the author applied.

### Community Discussion

Two Reddit threads are worth a look. [The first](https://www.reddit.com/r/AI_Agents/comments/1r4wa5a/deterministic_verification_for_browseruse_run_step/) describes a real "silent drift" problem: a click registers but the page state doesn't actually change, a scroll happens but the content doesn't move, and the agent believes the action succeeded anyway. The poster shared a verification plugin they wrote to catch this. [The second](https://www.reddit.com/r/AI_Agents/comments/1kfkp7u/how_do_you_handle_authentication_with_browseruse/) discusses sites with passkey login enabled, where logging in via browser-use's Chromium session frequently fails — a concrete scenario that, as of the discussion, still isn't fully solved. [A post on X from Nous Research](https://x.com/NousResearch/status/2086881660658663469) offers feedback from a cost-efficiency angle. After replacing Hermes Agent's original twelve separate browser tools with a single tool driven by browser-use CLI 3.0, they measured a 48% to 66% drop in token consumption, with no corresponding drop in accuracy.

---

## Prompt for AI Coding Agents

```text
## Goal
Install browser-use on the current machine and run a real browser agent task through it, verifying that both the CLI path and the Python library path work correctly.

## Steps
1. Confirm the Python version is >= 3.11.
2. Install with uv: uv add browser-use (or pip install browser-use).
3. If there's no usable Chromium on this machine, run browser-use install to set up the browser dependency.
4. Run browser-use --doctor to check that the install, daemon, and browser connection are all healthy.
5. Ask the user whether they already have an LLM API key (BROWSER_USE_API_KEY, or a key from OpenAI / Anthropic / Google), and write it into a .env file in the project root. If they don't have one, either walk them through getting one at https://cloud.browser-use.com, or use whatever provider key they already have on hand.
6. Verify with a minimal Python library example: create an Agent with a simple, checkable task (e.g. looking up this repo's star count), set llm to ChatBrowserUse or a model id the user provides, and await agent.run().
7. Optionally also verify the CLI path: run browser-use skill install to register the skill, then pipe Python via browser-use <<'PY' ... PY, calling new_tab() and page_info() to confirm the browser connection works.

## Verification
Paste back to the user the output of browser-use --doctor, along with the history result from the completed agent run (or the return value of page_info() if using the CLI path), confirming the browser was actually controlled and the stated task goal was genuinely achieved.

For exact commands and details, see this post: https://mikeq95blog.uk/blog/2026/08/28/browser-use-github-project
```

---

## Uninstalling and Running It Again

Uninstalling maps to the two things that got installed: the Python package itself, and the Chromium it pulled down.

```bash
pip uninstall browser-use   # or: uv remove browser-use
rm -rf ~/Library/Caches/ms-playwright   # on macOS, removes the Chromium that browser-use install downloaded
```

Remember to manually delete or revoke the API key configured in `.env` — it doesn't get cleared automatically by the uninstall commands.

To use it again later, there's no need to redo the whole install flow — just confirm the key in `.env` is still valid and run your script or CLI command directly:

```bash
browser-use --doctor
```

---

## Summary

Browser-use is aimed at cases where you want an AI agent to genuinely operate a browser hands-on. The CLI path suits people who are already using a coding agent — install it and it runs on that agent's own model subscription. The Python library path fits bulk, scheduled, or product-embedded use cases better, but it needs its own LLM API key, and every step of the run consumes tokens. Community reports point to issues like silent drift and passkey login failures that currently still need extra verification logic or workarounds written by hand — a strong benchmark score doesn't mean every scenario is equally solid. The gap between the open-source and paid cloud tiers is something the project states plainly in its own docs; whether upgrading to the cloud for things like CAPTCHA handling or proxy rotation is worth it comes down to how much task volume you actually have.
