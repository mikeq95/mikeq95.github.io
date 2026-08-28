---
slug: 2026/08/28/stop-slop-github-project
title: "stop-slop: Rules That Teach Claude to Stop Writing Like AI"
date: 2026-08-28
tags: [github, Claude, prompt, writing, Ai-friendly]
description: "stop-slop is an open-source set of Claude skill rules — a banned-phrase list, structural rules, and a scoring rubric — that helps Claude strip out common AI writing tells during drafting and editing."
---

stop-slop is a Claude skill by Hardik Pandya that teaches Claude to recognize the tells in its own writing and cut them during editing. The whole repo has no executable code, just a handful of Markdown rule files.

{/* truncate */}

> If you're new to this, this article includes a ready-to-use AI prompt that can set up the environment for you in one go.

---

## What It Is

The repo structure is simple: a core instruction file, `SKILL.md`, plus three reference files under `references/`. `phrases.md` lists the phrases to cut, `structures.md` lists the sentence patterns to break up, and `examples.md` gives real before/after rewrites.

At the phrase level, it targets throat-clearing openers like "Here's the thing," and adverbs — really, literally, genuinely — which the rules require cutting entirely. Business jargon is on the list too: deep dive becomes analysis, navigate becomes handle, and SKILL.md ships a full substitution table.

The structural level is harsher. The "not A, it's B" binary contrast is public enemy number one, and so is the negative-listing trick of naming what something isn't before revealing what it is. Giving inanimate things human verbs is also banned, phrases like "the complaint becomes a fix" or "the decision emerges." The rules require naming the actual person doing the thing, and using "you" to put the reader in the scene when no specific person fits. Em dashes are banned too — SKILL.md says it plainly: no em dashes at all.

After a rewrite there's a scoring step. Directness, rhythm, trust, authenticity, and density each get rated 1-10, and a total below 35/50 means revise.

The repo sits at over 16,000 stars on GitHub, MIT licensed. According to the author, Hardik Pandya, replying to a critic on X, this started as a side project he built while spending 30 minutes learning how to write a Claude Skill.

---

## Setup

No dependencies to install. Cloning the repo gets you everything:

```bash
git clone https://github.com/hardikpandya/stop-slop.git
```

The directory looks like this after cloning:

```text
stop-slop/
├── SKILL.md
├── references/
│   ├── phrases.md
│   ├── structures.md
│   └── examples.md
├── README.md
└── LICENSE
```

The hard part isn't installing anything — it's getting these files into whichever Claude interface you're using. Claude Code, Claude Projects, and API calls each load a skill differently, which is worth its own section more than any dependency install would be. That's next.

---

## Running It

### Claude Code

Drop the cloned `stop-slop` folder into `~/.claude/skills/` (or `.claude/skills/` inside the current project directory, if you only want it scoped to that project). The folder name is the skill name — no separate registration step.

Start a new Claude Code session. On launch it scans this directory, reads the frontmatter in `SKILL.md`, and recognizes it as a skill. From then on, drafting, editing, and content-review tasks trigger it automatically — no need to say "check this with stop-slop" every time.

To confirm it's actually loaded, hand Claude a paragraph with obvious AI tells:

```text
Here's the thing: this update is genuinely important.
Not because it's big. Because it's necessary.
```

> ✅ Working: Claude flags "Here's the thing," "genuinely," and the binary-contrast structure, and offers a rewrite
>
> ❌ Not working: Claude just says something like "this reads fine" — meaning `SKILL.md` never actually got read. Check whether the folder landed in the right path.

### Claude Projects

Upload `SKILL.md` along with `phrases.md`, `structures.md`, and `examples.md` from `references/` to Project Knowledge. Once uploaded, every new conversation in that project can use it — no need to re-upload.

### System Prompts and API Calls

For custom-instructions fields, pasting in the core rules section of `SKILL.md` is enough. For API use, paste the full `SKILL.md` into the system prompt. The three reference files don't need to go in all at once — per the README, they load on demand, pulled into context only when the model actually needs an example or the banned-phrase table, which saves space.

---

## Demo

The repo ships its own before/after pairs in `examples.md`, and they're the clearest way to see what it does.

**Throat-clearing opener + binary contrast**

> Before: "Here's the thing: building products is hard. Not because the technology is complex. Because people are complex. Let that sink in."
>
> After: "Building products is hard. Technology is manageable. People aren't."

**Business jargon stack**

> Before: "In today's fast-paced landscape, we need to lean into discomfort and navigate uncertainty with clarity. This matters because your competition isn't waiting."
>
> After: "Move faster. Your competition is."

Both of these come straight from the repo's own examples. To confirm the rules actually take effect in a rewrite, not just on paper, I wrote a test paragraph that doesn't appear anywhere in the repo's examples and manually ran it through the rules in `SKILL.md` and the two reference files:

> Before: "Here's the thing: code review is genuinely hard to get right. It's not about finding bugs. It's about building trust. When it comes to feedback, mistakes were made, and the decision to merge often emerges from pressure rather than confidence."
>
> After: "Code review builds trust, not just catches bugs. Reviewers approve pull requests they haven't fully read because the deadline is tomorrow. Then production breaks, and nobody wants to trace it back to a rushed approval."

"Here's the thing" and "genuinely" are gone, and the binary-contrast sentence became a direct statement. The passive "mistakes were made" turned into a specific person (reviewers) doing a specific thing, and the false-agency phrasing in "the decision...emerges" got cleaned up along with it.

---

## Similar Projects and Reception

stop-slop isn't the only project doing this. [Humanizer](https://github.com/blader/humanizer) is bigger, past 38,000 stars, and its rules come from the 35 patterns catalogued in Wikipedia's "Signs of AI writing" entry. It can rewrite an entire document in place while leaving code blocks, data, and frontmatter untouched, and it supports feeding it a sample of your own writing to mimic your style — a capability stop-slop doesn't have. [No AI Slop](https://github.com/petergyang/no-ai-slop) takes a different approach, splitting into edit, detect, and satire-generation modes; its detect mode only quotes the flagged original sentences rather than guessing whether text is AI-written. [skill-deslop](https://github.com/stephenturner/skill-deslop) says outright that it merges stop-slop's phrase list, structural rules, and scoring rubric with a corpus from tropes.fyi, tuned specifically for scientific and technical writing — and it deliberately keeps the passive voice that methods sections are supposed to use, which happens to hit right at the blind spot in stop-slop's blanket ban on passive voice.

In outside reviews, [Gaurav Tiwari's long-term write-up](https://gauravtiwari.org/stop-slop-ai-slop/) says a cold first draft can turn up six or more violations in the opening paragraph alone, and that using it for a while makes you start avoiding those patterns before you even write them. He also notes that "if it has an em dash, it's AI" stopped being a reliable test by 2026. [Another review](https://gabrielcassady.com/tools/stop-slop-claude-skill-to-remove-ai-writing-tells/) classifies it as a prompting tool — a writing strategy loaded into the model's head — rather than software, and warns that in regulated or high-stakes writing you should check the diff and pin a version before trusting it, so it doesn't strip out hedging language, warnings, or citations that actually need to stay.

The community isn't unanimous either. After the author [posted the project on X](https://x.com/hvpandya/status/2010330642714894391), [one reply pushed back directly](https://x.com/nixxin/status/2010547235902124035): "Not everything is AI writing — you're flattening language and killing the personality out of it." The author's response was that it was just something he threw together in 30 minutes while learning how Claude Skills work. A [Zhihu article comparing several writing skills](https://zhuanlan.zhihu.com/p/2059620590072476766) puts stop-slop alongside Humanizer and taste-skill, and argues its strength isn't large rewrites but a fast quality check after you've already written something — a good fit for short copy, emails, and social posts.

---

## Prompt for AI Coding Agents

Don't want to set this up by hand? Hand the block below to Claude Code or Codex and let it install stop-slop into whatever Claude environment you're using, then verify it actually works.

```text
## Goal
Set up the stop-slop skill in the current Claude environment (Claude Code preferred), and confirm it actually takes effect when rewriting text.

## Steps
1. git clone https://github.com/hardikpandya/stop-slop.git
2. Pick the loading method for the current environment: for Claude Code, put the whole folder into the skills directory (personal or project-level both work); for Claude Projects, upload SKILL.md and the three files under references/ to project knowledge; only paste SKILL.md into the system prompt if this is a system-prompt/API use case
3. Use your own judgment on routine steps, no need to confirm each one

## Verification
Write a test paragraph with typical AI tells (pick one or two of: throat-clearing opener, binary-contrast sentence, passive voice), have Claude run it through the rules, confirm it flags the issues and offers a rewrite, then report the result back to me.

Specific commands and load paths can be checked against this article: https://mikeq95blog.uk/blog/2026/08/28/stop-slop-github-project
```

---

## Uninstalling and Running It Again

Uninstalling just means removing whatever you put in place during setup.

Claude Code:

```bash
rm -rf ~/.claude/skills/stop-slop
```

Claude Projects: delete the four uploaded files from Project Knowledge.

System prompt/API: remove the section you pasted into the system prompt.

Using it again doesn't require re-cloning — keep the local folder around. Claude Code rescans the skills directory on every launch, so there's nothing else to do; files uploaded to Claude Projects stay there until you delete them manually.

---

## Summary

stop-slop doesn't fully follow its own rules either. The "after" sentence in Example 4 of `references/examples.md` uses an em dash — "Speed, quality, cost—pick two." — while `structures.md` explicitly bans em dashes. There's an open issue in the repo titled "Fix five spots where the docs break stop-slop's own rules," opened in early July, still sitting at zero comments.

The repo's homepage shows it was updated today, but that's just star and watch activity — the last real code push landed on 2026-03-17. It currently has 25 open issues and 23 open pull requests, and 21 of those issues have zero comments, which doesn't look like anyone's actively maintaining it. In the end this is a subjective standard — "cut every adverb" won't fit every kind of writing — but if all you want is a pass over your draft to catch the most recognizable AI tells before you publish, handing it to Claude costs you almost nothing.
