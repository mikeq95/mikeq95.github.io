---
slug: 2026/05/28/homebrew-tutorials
title: Introduction to Homebrew
date: 2026-05-28
image: /coverimage/Homebrew-coverimage.png
tags:
  - macos
---

> "The most popular command-line package manager for macOS."

Still hunting down installers one by one on official websites? With Homebrew, one command handles everything — install, update, uninstall — all managed in one place. Say goodbye to manual downloads.

Homebrew is a package manager for macOS and Linux. Its core value in one sentence: **manage all your software from the command line, unified.**

{/* truncate */}

---

## Installing Homebrew

### In China

Due to network restrictions, using a domestic mirror is recommended: [source](https://github.com/ineo6/homebrew-install)

```bash
/bin/bash -c "$(curl -fsSL https://gitee.com/ineo6/homebrew-install/raw/master/install.sh)"
```

### Outside China

Use the official script: [source](https://brew.sh/)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

## Core Concepts: formula and cask

Before using Homebrew, understand two key concepts:

- **formula**: installs **command-line tools** like `git` or `python` — no graphical interface
- **cask**: installs **GUI apps** like Firefox or VS Code

Simple rule: **App with an icon → cask; command-line only → formula**.

> Not talking about Gragas from League of Legends 😂

---

## Installing Software

Install a command-line tool (formula), e.g. git:

```bash
brew install git
```

Install a GUI app (cask), e.g. Firefox:

```bash
brew install --cask firefox
```

---

## Updating Software

Before upgrading, refresh Homebrew's package list to get the latest versions:

```bash
brew update  # refresh the package list (like refreshing the App Store)
```

Then upgrade a specific package, e.g. Python:

```bash
brew upgrade python
```

> **Note:** `brew update` updates Homebrew's own package index; `brew upgrade` actually upgrades the software. They are different.

---

## Pinning a Version

Sometimes you don't want a package to be auto-upgraded — for example, your project depends on a specific version of Python and upgrading would break things. Use `pin` to lock the version:

```bash
brew pin python  # lock python, prevent auto-upgrade
```

List pinned packages:

```bash
brew list --pinned
```

Unpin to allow upgrades again:

```bash
brew unpin python
```

---

## Uninstalling Software

Uninstall a command-line tool:

```bash
brew uninstall node
```

Uninstall a GUI app:

```bash
brew uninstall --cask firefox
```

Uninstall Homebrew itself:

```bash
/bin/bash -c "$(curl -fsSL https://gitee.com/ineo6/homebrew-install/raw/master/uninstall.sh)"
```

---

## Summary

| Operation | Command |
|-----------|---------|
| Install CLI tool | `brew install <name>` |
| Install GUI app | `brew install --cask <name>` |
| Refresh package list | `brew update` |
| Upgrade software | `brew upgrade <name>` |
| Pin version | `brew pin <name>` |
| List pinned | `brew list --pinned` |
| Unpin version | `brew unpin <name>` |
| Uninstall | `brew uninstall <name>` |

These commands cover the vast majority of everyday Homebrew usage. In my opinion, Homebrew is an essential tool for every Mac — it's simply too convenient to go without.
