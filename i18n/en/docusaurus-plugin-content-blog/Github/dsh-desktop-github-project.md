---
slug: 2026/08/28/dsh-desktop-github-project
title: "DSH Desktop: A Native Desktop Shell for DeepSeek Harness"
date: 2026-08-28
tags: [github, AI, llm, open-source, macos]
description: "DSH Desktop is a community-built native desktop client for DeepSeek Harness, packaging the official Web UI, Host service, and plugin system into a download-and-run desktop app, unaffiliated with DeepSeek's official team."
---

{/* truncate */}

## What It Is

DeepSeek Harness is an agent framework DeepSeek open-sourced in mid-August 2026, built around the idea that "everything is a plugin." On its own it only ships a CLI and a local web interface, with no official desktop client. DSH Desktop fills that gap as a third-party desktop shell.

The project is written in TypeScript, and the repo has already picked up over twenty thousand stars on GitHub. Its README and docs repeatedly stress that it's an independent community project with no affiliation, partnership, or endorsement from DeepSeek. The contributor list shows some "upstream contributors," but that's just commit history inherited through the fork — it doesn't mean those people actually worked on this repo.

The repo was originally named deepseek-harness-desktop before being renamed to dsh-desktop. GitHub redirects the old link automatically, but plenty of places online — including the project's own npm package name — still mix the two names, referring to the same project.

Its core design principle is that "the desktop shell is itself a plugin." The project doesn't modify upstream DeepSeek Harness's source code at all; the window, tray, and terminal capabilities are all wired into the same runtime through Harness's built-in Cordis plugin mechanism, following the same composition rules as any third-party plugin. Cordis itself isn't new — it was originally split out of the Koishi chatbot framework as a general-purpose plugin system.

The code is open source under the MIT license, and the repo had a code push just yesterday, so updates are frequent.

## Setup

The official download entry point is dshdesktop.cn, and clicking through actually redirects to a different hosting source. When I tested downloading the macOS build, the link ultimately landed on a file hosted on ModelScope named `DSH Desktop-2.0.3-universal.dmg`, confirming the version number matches what the site lists.

For macOS:

[Download the DMG](https://www.dshdesktop.cn/api/downloads/mac), open it, and drag DSH Desktop into Applications.

For Windows:

[Download the installer](https://www.dshdesktop.cn/api/downloads/windows), an NSIS package — just follow the prompts.

Both installers bundle Electron, Node.js, pnpm, and pinned versions of the DSH dependencies, so regular users don't need to install Node beforehand or open a terminal at all. The tradeoff is that the installer itself isn't small — the macOS build I downloaded came out to over 270 MB.

To verify you installed the officially signed build:

```bash
codesign -dv --verbose=4 "/Applications/DSH Desktop.app"
```

> ✅ Working: you see `Authority=Developer ID Application: mengxin yang (UM3Z9G5DNH)`, confirming it's signed by an Apple developer certificate
>
> ❌ Not working: it reports `code object is not signed at all`, meaning you have an unsigned unofficial build — go back to the official page and re-download

## Running It

On macOS, the first launch will likely get flagged by Gatekeeper — right-click and choose "Open" to confirm once, and that's it.

Once the app launches, it goes through several internal stages: Electron ready, preparing the shell environment, bootstrapping the runtime, selecting or creating a profile, and only then deciding whether to show the setup wizard. I ran the full macOS Universal installer in an environment with no graphical display, and I can confirm these stages genuinely exist and run in order. The app writes a timestamp for each step to `~/Library/Application Support/DSH Desktop/lifecycle-events/startup.jsonl`, generates a random local installation ID, and the pnpm shim used by the tray terminal really is placed in its own `runtime-commands/bin` directory, without touching the system-wide PATH.

Under a normal graphical session, the first launch shows a setup wizard, and only after you complete it does the Host service and main window start. The wizard lets you pick a window material, whether to install the plugin market, notification toggles, whether to open links with the system default browser, and how far to open local network access.

Note that the web service only listens on the local 127.0.0.1 address by default. Only if you explicitly enable local network access in settings does it start listening on all network interfaces, and the official docs flag this option as "dangerous" — anyone on your local network can then open and control your computer without logging in.

To use a cloud model (the default DeepSeek model, for instance) you first need to configure the corresponding model provider in settings. The official FAQ states plainly that when you use a cloud model, the request still goes to that provider — the Desktop app's own Host, Profile, and DSH home data stay on your machine, and whether data leaves your machine at all depends on which model and tool you chose.

To install plugins, open DSH Terminal from the tray and run commands directly:

```bash
dsh plugin add dsh-web-ui
dsh plugin remove dsh-web-ui
dsh plugin update
```

Installing and removing only applies to the currently active profile by default, and a new plugin only takes effect after you restart the app.

## Demo

### Three Display Modes

DSH Desktop offers three tiers of interface. Compatible mode keeps almost the same layout as the official web page, just adding a separate 36-pixel Desktop frame on top. Extended mode switches to the desktop shell's own three-column layout. Enhanced mode goes further into native styling — on macOS the window's traffic-light buttons become a hidden-style variant, and on Windows it switches to a Mica or acrylic material. All three modes run on the same Host and the same Web UI underneath; only the shell changes, and switching between them restarts the app in an orderly way rather than hot-swapping.

(Insert screenshot here: a side-by-side comparison of Compatible, Extended, and Enhanced mode)

### Plugin Market

DSH Community Market is built into the app, offering discovery, details, installation, and management for plugins. It connects to plugin data sources through a public schema, and in theory anyone can provide or plug in their own data source. The desktop shell itself exposes a handful of interfaces to plugin authors through this same plugin mechanism — `desktopProfiles` for viewing and switching profiles, `desktopPnpm` for running the built-in package manager — so plugin authors can read and write this state without writing their own process-management code.

(Insert screenshot here: the plugin market browsing interface)

### Safety and Recovery

On every healthy startup, the app records a rolling recovery point containing the current profile's declarative packages, patch files, and shared settings. If something breaks and you need to restore, you have to manually pick a specific snapshot — it won't automatically roll you back to the last working version on its own. Credentials, sessions, and caches are never written into recovery points. There's also an "Export Diagnostics" option in the tray that packages recent logs and local crash dumps into a ZIP, showing a privacy notice before it does. Identifiable credentials in the logs are redacted, but local paths, session IDs, and prompts can still end up in there, so it's worth reviewing the file yourself before sharing it publicly.

Updates follow a silent-check, non-silent-install pattern: the app checks for a new version every 6 hours in the background, and if it finds one, it only updates the tray icon and shows a system notification — it never pops up a download confirmation automatically.

The README still marks mobile remote control as "coming soon," so the feature shown in the promotional images isn't usable yet.

## Similar Projects and Reception

DSH Desktop isn't the only project building a desktop shell for DeepSeek Harness. [MochiNek0/dsh-desktop](https://github.com/MochiNek0/dsh-desktop) takes the Tauri route instead of Electron, similarly wrapping the `dsh web` interface in a native window and sharing the same session data — a direct point of comparison on size and resource usage. [desktop-cc-gui](https://github.com/zhukunpenglinyutong/desktop-cc-gui) goes further, packing Claude Code, Codex, Gemini, and OpenCode into a single Tauri desktop shell — a "one client for every coding agent" approach that's the opposite of DSH Desktop's commitment to deep integration with a single harness. Its star count (over 4,000) is also noticeably higher.

CSDN blogger "高擎 AI+" wrote a [hands-on install tutorial](https://blog.csdn.net/2501_91807877/article/details/163854963), walking through first-time setup in five steps and specifically recommending two plugins: dsh-web-ui and modlens, which lets text-only models "read" screenshots. A more detailed [field report on Zhihu](https://zhuanlan.zhihu.com/p/2072671952355980473) goes into specifics that trip people up — closing the window doesn't quit the app, and switching profiles triggers a restart — and also notes that the plugin market and mobile remote control weren't shipped as stable features at the time it was written, warning readers not to mistake the promotional images for something already usable.

Geekbang co-founder Chi Jianqiang [posted on X](https://x.com/sagacity/status/2089183016807809385) saying he'd always felt DeepSeek's Harness should be packaged as a download-install-open desktop app the way Codex or Qoder are, and specifically called this out after installing a DSH preview build. That post is a small window into why third-party desktop shells like DSH Desktop showed up in the first place — the official framework was never meant to do this on its own.

## Uninstalling and Running It Again

Uninstalling: on macOS, drag DSH Desktop from Applications to the Trash; on Windows, use "Add or Remove Programs."

The local profile, logs, and installation ID persist in `~/Library/Application Support/DSH Desktop` on macOS, or the corresponding Windows AppData directory. Removing the app itself doesn't clear these files automatically — if you want a clean wipe, you'll need to delete them by hand.

To run it again, just open the app directly. There's no need to redo the setup wizard, since the configuration is already saved in the profile.

## Summary

This is a project that's barely two weeks old — the repo was created on August 13, 2026 — and its features and docs are still changing fast. Statements in the README like "the plugin market is built in" or "mobile remote is coming soon" are just a snapshot of where things stand right now. There's also no Linux installer yet, and the official FAQ specifically warns against assuming a release exists just because the source contains cross-platform code. I checked the code myself and didn't find any Linux packaging configuration.

Several repos with the same or similar names have popped up around the same time, some Electron-based and some Tauri-based, and it's easy to mix them up when researching or writing about this project. Sticking to the anywhere-labs organization name and the dshdesktop.cn official domain is the safest way to avoid that.
