---
slug: 2026/06/19/macos-terminal-create-file
title: "📄 macOS Terminal Cheat Sheet: Creating Files"
date: 2026-06-19
image: https://cdn.mikeq95blog.uk/coverimage/macos-terminal-commands-en-cn.png
tags:
  - macos
description: "A cheat sheet for touch, mkdir -p, code, heredoc, and cat — these terminal commands beat right-clicking in Finder, especially when creating files in bulk."
---

A handful of commands I use all the time on my Mac: `touch`, `mkdir`, `code`, `cat`, plus a `cat`-based trick called `heredoc`.

{/* truncate */}

---

## touch

`touch` creates a new file:

```bash
touch index.html
```

> I find this one genuinely useful — say you want to write a markdown doc, just run `touch strawberry.md` and you're done.

> StrawBerry!!!🍓

## mkdir

`mkdir` is short for "make directory" — it does exactly what it sounds like, creates a folder:

```bash
mkdir components
```

> This is the terminal equivalent of `Cmd + Shift + N` in Finder, or right-click → New Folder.

### Adding `-p`

`-p` is short for `--parents`, meaning "handle the parent directories too." It's used in two situations.

**Case 1: an intermediate path doesn't exist yet**, and you want it created automatically. If `src` hasn't been created, running `mkdir src/pages/about` directly fails:

```bash
mkdir src/pages/about
# mkdir: src/pages: No such file or directory
```

Add `-p`, and any missing intermediate folders get created automatically:

```bash
mkdir -p src/pages/about
```

**Case 2: the folder already exists, and you don't want an error.** Without `-p`, running the same command twice throws an error:

```bash
mkdir components   # first run, creates it fine
mkdir components   # run it again
# mkdir: components: File exists
```

If this line is in a script, hitting this error breaks the rest of the run. With `-p`, that's not a problem:

```bash
mkdir -p components   # first run, creates it fine
mkdir -p components   # run it again, no error, nothing happens
```

The short version: `-p` makes `mkdir` "foolproof" — you don't need to worry about whether the path is nested or whether the folder already exists, just run the command.

> In practice, when writing scripts or typing commands, it's basically always `mkdir -p`. Hardly anyone uses bare `mkdir` without the flag.

## code

`code` is the command-line entry point that VS Code provides — it's not a built-in macOS command. You need to set it up once from VS Code: `Cmd+Shift+P` → search `Shell Command: Install 'code' command in PATH`.

Run the line below, and VS Code pops open immediately. If the file doesn't exist, it gets created and opened for you — cursor sitting in an empty file, ready to write:

```bash
code components/GradientText.jsx
```

## heredoc

"heredoc" is short for "here document" — the document content is written directly inline in the command, no need to open a separate file.

```bash
cat > components/GradientText.jsx << 'EOF'
export default function GradientText() {
  return <span className="gradient-text">Hello</span>;
}
EOF
```

- `<< 'EOF'`: the start marker, meaning "keep reading until the next line that's just `EOF` by itself — everything in between is content." The single quotes prevent things like `$variable` from being expanded early by the shell; this is the standard way to write it when the content includes code
- The closing `EOF` must be on its own line, starting at column 0 — otherwise the terminal just keeps waiting for input

To append to an existing file instead of overwriting it, swap `>` for `>>`.

**What's it good for?**

You can have an AI write a heredoc command for you, then paste it straight into the terminal and hit enter. Much less clicking around than doing it by hand.

## cat

`cat` is short for "concatenate" — its most basic use is printing a file's contents to the terminal:

```bash
cat test.txt
```

**What's it good for?**

I find it handy when talking to an AI — open a terminal, `cat` a bunch of files you don't understand, they get printed to the terminal, then `Cmd + A` and hand it all to the AI. I think this is faster and less hassle than uploading files directly. (Especially with a VPN running and uploading a file to Claude or ChatGPT — the upload speed is genuinely painful to watch 😂)

## Summary

These are just the ones I use regularly, nothing more.

You only need to know the basics. No need to go deep on the complicated stuff.
