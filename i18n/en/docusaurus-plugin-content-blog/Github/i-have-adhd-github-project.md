---
slug: 2026/08/28/i-have-adhd-github-project
title: "i-have-adhd: Making AI Coding Agents Answer Directly"
date: 2026-08-28
tags:
  - github
  - Claude Code
  - AI
  - open-source
  - Ai-friendly
description: "i-have-adhd is an open-source skill built around ten output rules in a SKILL.md file, making Claude Code, Codex, and similar coding agents lead with the action and drop the small talk."
---

{/* truncate */}

> If you're new to this, this article includes a ready-to-use AI prompt that can set up the environment for you in one go.

## Introduction

This isn't a new capability bolted onto the model — it's a fixed rule file, `SKILL.md`, with ten output rules. The first line has to be a command, a path, or a snippet; the explanation, if there is one, comes after. Anything with more than one step gets numbered, and the rules explicitly call for the fewest steps that still work, merging any that can be merged. Every reply has to end with one next action doable in under two minutes, even if that action is just "open this file." Lists are capped too — five items max, and past that they get split into "do now" and "later." When something breaks, words like "Uh oh" are banned; the reply states where it broke, why, and how to fix it.

The rules aren't applied blindly, though. SKILL.md has a whole section on when to break them. If the user explicitly asks for an explanation, the agent is free to explain in full. Before a risky action — `rm -rf`, a force push — it has to confirm first; safety wins over brevity there. If the last three turns have all been "still broken," it's supposed to stop and name the assumption that might be wrong instead of guessing again. And if the question itself is "give me a few options," the answer is naturally a handful of options with trade-offs, not a single forced path.

The repo is more than a markdown file. The `tests/` directory has 21 unit tests covering things like the always-on hook and the OpenCode plugin integration. `evals/cases.jsonl` adds 14 behavioral eval cases, each with its own scoring criteria, specifically to check that a rule change doesn't make the model answer the wrong question. The project has been growing fast on GitHub — it's past 25,000 stars now. It's not a one-person effort either: 31 people have contributed code, and the most recent commit landed two days ago.

The rule set isn't tied to the Claude ecosystem either — Codex, Cursor, Gemini CLI, and other common coding agents each have their own install path, documented in the repo's `INSTALL.md`. None of it needs an API key or any extra runtime setup.

## Setting Up the Environment

No dependencies to install — the `claude plugin` command already ships with Claude Code. Add the marketplace, then install the plugin:

```bash
claude plugin marketplace add ayghri/i-have-adhd
claude plugin install i-have-adhd@i-have-adhd
```

Run `claude plugin list` afterward; seeing `i-have-adhd@i-have-adhd` marked `enabled` means it's in.

If you just want to try it once without a proper install, you can also paste this straight into any coding agent that can read `AGENTS.md` and let it install itself:

```text
Install the i-have-adhd skill/plugin from https://github.com/ayghri/i-have-adhd, refer to the repo's AGENTS.md for instructions.
```

## Running It

Installing the plugin by itself changes nothing. In Claude Code, type this once:

```text
/i-have-adhd
```

The rules apply to every reply from that point on, but only for the current session. To turn it off mid-session, just say "stop adhd mode" or "normal mode."

> One thing worth flagging: right after installing, it'll feel like nothing happened — that's not a failed install, it's designed to stay off by default. Under Claude Code, Codex, or Qwen Code, you have to type `/i-have-adhd` yourself before it does anything.

If you don't want to type that every time, you can make it always-on instead. A `SessionStart` hook will inject the rules automatically at the start of every session:

```bash
touch ~/.claude/.i-have-adhd-always
```

Delete that flag file to turn always-on back off:

```bash
rm ~/.claude/.i-have-adhd-always
```

At this point, i-have-adhd is installed and triggering correctly.

## Seeing It in Action

I ran the same question twice — once without invoking `/i-have-adhd`, once right after invoking it. The question: "My Python script is running slower than I expected — what are the likely causes, roughly?"

Without invoking the skill, the answer looked like this:

> To track down why a Python script is slow, here's the general approach:
>
> Step one: measure first, don't guess. Run `cProfile` to find which function is eating the most time.
>
> **Common causes (roughly in order of frequency)**
>
> 1. I/O blocking
> 2. The wrong data structure
> 3. A loop doing something that should have been vectorized
> 4. String concatenation with `+=`
> 5. Repeated computation with no caching
> 6. Uncompiled regular expressions
> 7. GIL limitations
> 8. Unnecessary deep copies or serialization
> 9. Too much logging or printing
> 10. An inefficient third-party library version
>
> If you send me the script or the profiling results, I can help you pin down which one it is.

After invoking `/i-have-adhd`, the same question came back like this:

> Run a profiler first, don't guess: `python -m cProfile -s cumulative your_script.py`
>
> Look at whichever functions rank highest under `cumtime` — that's the real bottleneck.
>
> **Common causes (ranked by how often they're the culprit)**
>
> 1. I/O blocking — network calls, DB queries, or file reads/writes done one at a time instead of batched or async
> 2. A Python loop where vectorization belongs — a `for` loop where numpy/pandas should be doing the work
> 3. Algorithmic complexity — an O(n²) or worse lookup buried in nested loops
> 4. Repeated overhead inside a loop — opening files, opening DB connections, string building, or logging on every iteration
> 5. Memory pressure causing swapping — check with `top`; if usage is near the limit, this is it
>
> Next: run the profiler command above and paste the top 5 functions by cumulative time.

The count dropped from 10 items to 5. The command used to sit inside "step one" — now it's the first line of the reply. The ending changed too: instead of waiting for you to send over the script, it hands you one action you can run immediately.

## Related Projects and Reception

A few other projects are chasing the same "AI talks too much" problem, from different angles. [caveman](https://github.com/JuliusBrussee/caveman) goes for straight compression, cutting replies down to telegraphic style — the project claims over 60% fewer output tokens. That's a different axis from i-have-adhd's structural approach (lead with action, number steps, cap lists): one saves tokens, the other saves reading effort. They're not mutually exclusive — you can run both.

There's also a community fork building on the original. [melodic-software's version](https://github.com/melodic-software/claude-code-plugins/tree/main/plugins/adhd), MIT-licensed, keeps `/adhd:shape` close to the original rules but adds `/adhd:clarify`, which breaks a long document into chunks that each make one decision at a time.

Two people wrote fairly thorough hands-on reviews. [One on Medium](https://medium.com/@joe.njenga/i-tried-this-claude-code-adhd-skill-that-no-one-is-talking-about-a990a647b1c7) documents the whole process from cloning the repo to actually asking questions, with real before/after replies attached. [Android Authority's piece](https://www.androidauthority.com/claude-i-have-adhd-skill-how-use-3697353/), written after two weeks of use, mentions something the official docs don't: replies get shorter by default, so usage quota burns slower too — though it also notes the skill isn't for every ADHD user, since some people actually prefer longer, denser replies.

A [comparison piece on Zhihu](https://zhuanlan.zhihu.com/p/2063679630872253251) uses real before/after replies to make the point that this only changes how the model talks, not how smart it is. There's pushback on X too: discussing how to make AI output more concise, Angelica Parente [compared a custom output style against installing a skill](https://x.com/draparente/status/2085785882788077991), arguing the output style saves more tokens while a skill buys stricter rule enforcement — two different trade-offs, neither one clearly better.

## Prompt for AI Coding Agents

Don't feel like typing all this in yourself? Hand the block below to Claude Code, Codex, or a similar AI coding agent, and let it install the plugin and run its own before/after comparison.

```text
## Goal
Install i-have-adhd as a Claude Code plugin and trigger it; success means the reply style visibly changes.

## Steps
1. Add the marketplace and install the plugin: claude plugin marketplace add ayghri/i-have-adhd, then claude plugin install i-have-adhd@i-have-adhd
2. Confirm i-have-adhd@i-have-adhd shows as enabled with claude plugin list
3. In a fresh session, type /i-have-adhd to trigger the rules — note that installing the plugin alone does not activate it, this step is required
4. Pick an open-ended question and ask it once before triggering the skill and once after, then compare the structure of the two answers

## Verification
Confirm the plugin status is enabled, and that the post-trigger reply clearly leads with an action, keeps any list to 5 items or fewer, and ends with a concrete next step. Report the comparison back to me.

Exact commands and details can be checked against this article: https://mikeq95blog.uk/blog/2026/08/28/i-have-adhd-github-project
```

## Uninstalling and Running It Again

This undoes exactly what "Setting Up the Environment" installed — both the plugin and the marketplace need to go:

```bash
claude plugin uninstall i-have-adhd
claude plugin marketplace remove i-have-adhd
```

If you turned on always-on mode, delete that flag file too:

```bash
rm -f ~/.claude/.i-have-adhd-always
```

Running it again: the plugin stays installed once it's in, so there's no need to reinstall. Just type `/i-have-adhd` in any session whenever you want it.

## Summary

i-have-adhd doesn't make the model any smarter — it just reshapes how it talks. Lead with the action, cut the pleasantries wherever possible. Lists and steps both have a ceiling instead of growing without limit. The rules are nothing more than that one `SKILL.md` file, so if you don't like the official version, forking it and swapping in your own copy is just a matter of pointing the marketplace at your fork — no code involved. Installing the Claude Code version takes two commands, and one `/i-have-adhd` is enough to see the difference in reply style right away.
