---
slug: 2026/06/03/codegraph-claude-code-knowledge-graph
title: "CodeGraph: Help Claude Code Work Smarter, Cut Token Usage in Half"
date: 2026-06-03
image: /coverimage/codegraphCowerImage.png
tags:
  - github
  - AI
---

I came across a GitHub project today — [CodeGraph](https://github.com/colbymchenry/codegraph), 38k+ stars, MIT licensed. The core idea: **pre-build your codebase into a knowledge graph so Claude Code can query it directly, instead of grep-scanning files every time**. I installed it and tried it out — on average, 16% cost savings and 58% fewer tool calls.

{/* truncate */}

---

## Why Claude Code "Wastes" Tokens

When you ask Claude Code an architecture question — like "how does this request reach the database?" — it first spins up an Explore sub-agent, runs a bunch of grep/ls/Read operations to find files, and only then starts analyzing. **The whole exploration process burns tokens**, and a lot of the time it reads a bunch of irrelevant files along the way.

CodeGraph's approach: do all that exploration work up front, index it into a local SQLite database. Claude Code queries it directly — one tool call returns the source code of relevant symbols, call graphs, and dependency relationships, without scanning files.

---

## Installation

**Install the CLI** (macOS/Linux, no Node.js required):

```bash
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh
```

After installing, **open a new terminal** — otherwise the `codegraph` command won't be found.

**Hook into Claude Code**:

```bash
codegraph install
```

It auto-detects which AI tools you have installed (Claude Code, Cursor, Gemini CLI, etc.) — just select Claude Code, no need to check anything else.

**Initialize a project**:

```bash
cd your-project
codegraph init -i
```

`-i` is `--index` — creates the directory and indexes the codebase in one step. After that, a file watcher handles incremental updates automatically — no manual management needed.

**How to tell if a project is already initialized?**

```bash
ls your-project/.codegraph
```

If the folder exists, it's been indexed. If not, run `codegraph init -i` once.
