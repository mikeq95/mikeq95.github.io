---
slug: 2026/08/28/kimi-cli-github-project
title: "Kimi CLI: Moonshot's Terminal Coding Agent Being Replaced by Kimi Code CLI"
date: 2026-08-28
tags:
  - github
  - AI
  - llm
  - open-source
  - Ai-friendly
description: Kimi CLI is Moonshot AI's terminal-based AI coding agent that can read and edit code, run shell commands, and hook into MCP and ACP editor protocols; the project has now been flagged by its own maintainers as being gradually wound down, with new users pointed to the successor project Kimi Code CLI.
---

Kimi CLI is a terminal AI coding agent from Moonshot AI. It can read and edit code, run shell commands, and adjust its next move based on what those commands return, right inside the command line. It's also at a somewhat unusual point in its life right now: the maintainers have posted a notice on the repo's front page saying the project is being replaced by its successor, Kimi Code CLI.

{/* truncate */}

> If you're new to this, this post includes a ready-to-use AI prompt that can set up the environment for you in one go.

---

## Introduction

Right at the top of the README there's a notice marked with `[!IMPORTANT]`, and it doesn't mince words: Kimi CLI is evolving into [Kimi Code CLI](https://github.com/MoonshotAI/kimi-code), the next-generation terminal agent from the same team. Installing Kimi Code CLI automatically migrates your existing config and sessions, while Kimi CLI itself will be gradually wound down. The docs and any existing install still work, but it's no longer the path the team recommends. That detail matters more than any feature listed further down this page.

Setting that notice aside, Kimi CLI itself can read and edit code, run shell commands, search and fetch web pages, and autonomously plan its next step based on what it learns along the way. It's crossed five figures in GitHub stars — 11,279 as of writing. The latest release is 1.49.0, shipped in July 2026, and the changelog shows development is still going, just at a slower pace than before; the most recent commit landed in early August.

It's not just a chat-box coding assistant — it doubles as a shell. Press `Ctrl-X` and you can switch between "AI agent" mode and "native terminal" mode without leaving Kimi CLI to open a separate window for ordinary commands. Built-in shell commands like `cd` aren't supported yet, though; the documented workaround is to point `--work-dir` at a directory, or just exit and start a new session. Installing the official zsh-kimi-cli plugin carries this same switching habit over into whatever Zsh setup you already use day to day.

On the editor side, Kimi CLI ships a VS Code extension that brings the CLI into the editor UI. For editors that support the Agent Client Protocol (ACP), such as Zed or JetBrains, it can plug in directly as an external agent — one protocol covers all of them, so there's no need to write a separate integration for each editor. On the extensibility front, the `kimi mcp` subcommand group manages adding, removing, listing, and OAuth-authorizing MCP servers, and it also supports one-off connections via a config file. Beyond the terminal, the `kimi web` command spins up a local web UI, which by default only listens on `127.0.0.1` — reaching it from your LAN requires explicitly passing `--network` or specifying `--host`.

---

## Installation

Running it requires Python 3.12 through 3.14, with 3.13 recommended by the maintainers. The simplest route is the official install script, which installs `uv` (a Python package manager) first and then uses it to install Kimi CLI:

```bash
# Linux / macOS
curl -LsSf https://code.kimi.com/install.sh | bash
```

```powershell
# Windows (PowerShell)
Invoke-RestMethod https://code.kimi.com/install.ps1 | Invoke-Expression
```

If you already have `uv` installed, you can install the package directly with a specific Python version:

```bash
uv tool install --python 3.13 kimi-cli
```

Once it's installed, run `kimi --version` to check. A 1.x version is the Kimi CLI covered here (packaged in Python, distributed via PyPI); a 0.x version means you installed the successor, Kimi Code CLI instead (written in TypeScript, distributed via npm, as a single-file binary) — both install a command literally named `kimi`, which makes them easy to mix up.

Logging in is where money almost certainly enters the picture. On first run, execute `/login`; you can either go through browser OAuth on the Kimi Code platform, or manually enter an API key from the Moonshot AI Open Platform (moonshot.cn or moonshot.ai). The official docs' FAQ has a dedicated troubleshooting entry for "membership expired or quota exhausted," pointing to the `/usage` command and a renewal page, which suggests the free allotment doesn't stretch very far. Third-party hands-on write-ups have also documented free accounts hitting a 402 error on the first real call, with paid subscriptions starting at ¥49 per month. This article didn't go as far as opening a paid account to verify this step.

---

## Running It

Once it's installed and you're logged in, run `kimi` in the project directory where you want it to work, and it drops you into an interactive session:

```bash
cd your-project
kimi
```

The first time you open a project, you can run `/init` to have it analyze the codebase on its own and generate an `AGENTS.md` file, which helps it retain the project's structure and conventions. `/help` lists every available slash command.

`Ctrl-X` switches between agent mode and shell mode at any time; in shell mode you run native commands directly without exiting the program. If you want a graphical interface, `kimi web` spins up a local web UI at `http://127.0.0.1:5494` by default, and if that port is taken it automatically tries the next one up, up to 5503.

To hook it into an ACP-compatible editor, first run `/login` in the terminal to complete authentication, then configure the editor to launch Kimi CLI as an agent server via `kimi acp`. For example, in Zed's `~/.config/zed/settings.json`:

```json
{
  "agent_servers": {
    "Kimi CLI": {
      "type": "custom",
      "command": "kimi",
      "args": ["acp"],
      "env": {}
    }
  }
}
```

MCP servers are managed with `kimi mcp`. Adding one over HTTP looks like this:

```bash
kimi mcp add --transport http context7 https://mcp.context7.com/mcp --header "CONTEXT7_API_KEY: your-key"
```

`kimi mcp list` shows what's already configured, and `kimi mcp remove <name>` takes one back out. If you'd rather skip this management layer entirely, you can also point it at a config file directly:

```bash
kimi --mcp-config-file /path/to/mcp.json
```

At this point, the common paths — command line, editor integration, and MCP extension — all check out.

---

## Results

This section is compiled from official docs and third-party reviews, not a local hands-on test. Fully running through this workflow requires a paid Kimi or Moonshot account, and this article didn't go and open one.

The demo assets bundled with the docs give a rough sense of what it looks like in practice. The README's shell-mode animation shows command-line output switching over into a plain terminal prompt; the VS Code extension screenshot shows the agent panel docked in the editor's sidebar; the ACP integration animation walks through creating a new Kimi CLI session inside Zed. (Insert screenshot here: an actual run of any of the above.)

On the third-party side, [a hands-on guide on Zhihu](https://zhuanlan.zhihu.com/p/2003206943536326314) documents the process of configuring the API and switching modes in detail. [A Chinese-language review on wangruofeng007.com](https://wangruofeng007.com/blog/2026-01/kimi-code-cli-review/) paid ¥4.99 for a 7-day trial plan and tested it against scenarios like analyzing an unfamiliar codebase, generating project architecture docs, and rebuilding a tech blog site built on React, TypeScript, Vite, Tailwind, and Framer Motion — concluding that "the overall experience is close to Claude Code." These are the reviewers' own accounts, not results this article has verified itself.

---

## Similar Projects and Reception

### Comparable Tools

Kimi CLI isn't the only player in the terminal coding agent space. [Claude Code](https://github.com/anthropics/claude-code) is the tool it gets compared to most often in community reviews; most of them consider it stronger on editor integration, reliability, and ecosystem maturity — persistent project memory via CLAUDE.md, native enterprise routing through Bedrock/Vertex/Foundry — at the cost of being noticeably more expensive on a per-token basis. [OpenCode](https://github.com/anomalyco/opencode) takes a different approach and isn't tied to any one model; plenty of people on Reddit plug Kimi K2.5/K2.6 into OpenCode directly, making it another common way to run Kimi's models. [Codex CLI](https://github.com/openai/codex) is OpenAI's equivalent, bundled into ChatGPT Plus/Pro/Business subscriptions, with native support for running subagents in parallel. [Gemini CLI](https://github.com/google-gemini/gemini-cli) has the most generous free tier of the bunch — 1,000 requests a day on a personal Google account — though it doesn't yet have documented subagent functionality.

### In-Depth Reviews

An English-language independent blog, [andrew.ooo](https://andrew.ooo/posts/kimi-code-cli-review-moonshot-terminal-agent/), spells out that Kimi CLI is being replaced by Kimi Code CLI, and is skeptical of the official benchmark numbers, writing that "standout scores are vendor-run." It considers the ecosystem still younger than Claude Code's, with the pitch mostly boiling down to a similar workflow at a lower token cost. On the Chinese side, beyond the wangruofeng007.com review mentioned above, there's an earlier [getting-started guide](https://www.vibesparking.com/zh-cn/blog/ai/kimi/kimi-cli/2025-10-24-kimi-cli-terminal-agent-guide/) written in October 2025, shortly after the project first launched and before Kimi Code CLI existed as a successor. It focuses on concrete operations: switching between shell and agent mode, installing the Zsh plugin, and hooking into Zed via ACP.

### Community Discussion

[A Zhihu getting-started post](https://zhuanlan.zhihu.com/p/2003206943536326314) goes into fairly granular detail, stating plainly that "the first launch requires configuring the API, which means buying a monthly plan on Kimi's official site," and offers a specific comparison: "compared to a Claude Code plan, Kimi-CLI gets you 3x the usage at 1/7 the price." It also mentions a `--yolo` flag, a no-confirmation mode similar to what Claude Code offers.

Reddit's take is less uniform. [One thread](https://www.reddit.com/r/kimi/comments/1rth36f/incredible_trick_w_k25/) has a user stating outright that "kimi-cli is very barebones," with a specific complaint about access control: "it did not have a proper access control implementation. Either allow all commands or keep approving all commands." Another comment there argues "the Claude Code harness far outperforms Kimi CLI." [A second thread](https://www.reddit.com/r/kimi/comments/1r7dn7v/how_to_see_usage_of_kimi/) documents the practical flow of actually subscribing to a paid plan, getting a discount, generating an API key at kimi.com/code/console, and wiring that key into a third-party tool — useful as a reference for understanding Kimi's billing and key-issuance process.

---

## Prompt for AI Coding Agents

```text
## Goal
Install Kimi CLI on this machine, configure login, and get one basic agent conversation working end to end.

## Steps
1. Confirm the local Python version is between 3.12 and 3.14.
2. Install with the official script: curl -LsSf https://code.kimi.com/install.sh | bash (use the corresponding PowerShell command on Windows), or if uv is already installed, use uv tool install --python 3.13 kimi-cli.
3. Run kimi --version to confirm it's the 1.x Kimi CLI, not the 0.x Kimi Code CLI.
4. Ask the user whether they already have a Kimi Code or Moonshot AI Open Platform account or API key — this step almost certainly involves paying for something, so don't decide on the user's behalf whether to sign up.
5. Run kimi in a test project directory and execute /login to complete authentication.
6. Once logged in, verify things work with a simple task, like asking it to list the current directory structure or read a file.

## Verification
Share the output of kimi --version and the agent's actual reply after /login with the user, confirming login succeeded and it can read project files and respond correctly.

Specific commands and details can be checked against this article: https://mikeq95blog.uk/blog/2026/08/28/kimi-cli-github-project
```

---

## Uninstalling and Running It Again

Uninstalling means removing two things: Kimi CLI itself, and everything it's accumulated under `~/.kimi/` — config, sessions, login credentials, and logs.

```bash
uv tool uninstall kimi-cli
rm -rf ~/.kimi
```

If you only want to clear out one category of data, you don't have to delete everything. Login credentials live in `~/.kimi/credentials/` (or just run `/logout`); MCP config is in `~/.kimi/mcp.json`; session records are under `~/.kimi/sessions/`.

Next time you want to use it, there's no need to redo the install — just confirm your login is still valid and start it up:

```bash
kimi
```

If the login has expired, running `/login` again takes care of it.

---

## Summary

Kimi CLI is aimed at people who want to run coding tasks with Kimi's model family from the terminal without picking up an entirely separate tool to do it. Shell integration, ACP editor hookup, and MCP extensibility are all reasonably fleshed out. What's worth thinking through before installing comes down to two things. First, the project has been flagged by its own maintainers as being gradually wound down, so it's worth checking whether the successor, Kimi Code CLI, is the better fit before you commit to a new install. Second, the free tier is almost certainly not enough — the `/login` step will almost certainly need a paid account or a funded API key attached to it. On the community-feedback side, the "either allow everything or approve everything" access-control complaint doesn't have a more granular fix yet either, and that's worth having in mind before you dive in.
