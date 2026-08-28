---
slug: 2026/08/28/omarchy-github-project
title: "Omarchy: DHH's Arch Linux + Hyprland Distribution"
date: 2026-08-28
tags: [github, open-source, macos, AI]
description: Omarchy is an Arch Linux + Hyprland distribution led by DHH. It only natively supports Intel Macs, and Apple Silicon needs a community port or a VM; this article is compiled from the official manual and source, not a hands-on install.
---

Omarchy is a full Arch Linux distribution built by DHH, with the Hyprland tiling window manager on top and a desktop shell called Quickshell that they wrote themselves. It isn't a config script you drop onto another system, it's a complete installer ISO. Partitioning, full-disk encryption, and desktop theming all happen during the install itself, so a reboot drops you straight into a tuned system without hand-rolling Arch from scratch.

{/* truncate */}

---

## What It Is

> Up front: Omarchy's official native support only covers Intel Macs. Apple Silicon (M-series) currently has no official support — the only options are a community-maintained Asahi Linux port, or squeezing it into a VM like Parallels or VirtualBox, and the manual's own words for the latter are "quite cumbersome," with performance that isn't great either. This is a full Linux distribution that takes over the whole disk. This article is compiled from the official manual and source, not something installed and run on real hardware.

DHH wrote Ruby on Rails and co-founded 37signals. Over the past couple of years he's publicly criticized Apple's App Store cut and what he sees as a lack of innovation under Tim Cook, and switched his own daily driver to Linux. Omarchy is the product of that switch. It's already picked up over 32,000 stars on GitHub, GitHub lists Shell as the primary language, and most of the code is scripts wiring together installation, package management, and desktop configuration rather than a conventional application.

The repo sits under the basecamp organization, incubated by DHH's own 37signals. The goal isn't a sprawling, do-everything distro — it's getting DHH's own daily toolchain installed and tuned ahead of time. Neovim for editing, Chromium for browsing, Obsidian for notes, LibreOffice for office work, and there's even a retro Winamp-style music player thrown in. One line in the official manual puts it bluntly: the system is "zero bloat, just everything I use."

Omarchy has an earlier sibling project called [Omakub](https://omakub.org/), which layers a tiling setup and common dev tools on top of Ubuntu + GNOME, aimed at people who aren't ready to fully switch distros yet. Omarchy goes further, moving all the way to Arch + Hyprland with rolling updates and keyboard-only operation, aimed at experienced users who want the fuller experience. The specific differences between these and other similar projects are covered later, in "Similar Projects and Reception."

---

## Setup

The Omarchy ISO downloads from [omarchy.org](https://omarchy.org/), a few gigabytes in size. Flash it to a USB drive with [balenaEtcher](https://etcher.balena.io/) on Mac or Windows, or [caligula](https://github.com/ifd3f/caligula) on Linux. Before installing, you have to disable Secure Boot and TPM in the BIOS/UEFI — these are Microsoft's security schemes for Windows, Omarchy doesn't need them, and leaving them on will actually block the install.

There are two install modes: a full-disk install wipes the entire selected drive, while a free-space install only claims the unallocated space on a drive, which is how you dual-boot alongside Windows or another OS. Either way, back up first — the official manual makes a point of saying so. One more thing: the full-disk-encryption unlock screen doesn't support Bluetooth keyboards, so you'll need a wired keyboard or a wireless one with a 2.4GHz receiver, or you won't even be able to type the password at boot.

> "Wipes the selected drive" reads pretty casually in the docs, but backing up first before you actually do it is still the safer move — there's no undo for this one.

### Intel Macs

Official native support covers Intel-chip Macs. The installer detects Mac hardware automatically and sets up Broadcom Wi-Fi drivers, the SPI keyboard driver on models that need it, and an NVMe suspend fix for the same batch of models. In an official comparison test on a 2019 MacBook Pro, just installing Omarchy delivered a 36% performance gain.

You disable Secure Boot beforehand in Recovery Mode (hold Command-R at boot), and the rest of the install proceeds like it would on any PC. **One thing to watch for: on Mac, Omarchy currently only supports being installed as the sole OS.** After installing, macOS won't boot at all — the official manual says you can restore it later via Internet Recovery, but that's a separate process, not a simple dual boot. Devices with the T1 chip (a few first-generation Touch Bar MacBook Pro models from 2016) lose Touch Bar and audio entirely. T2-chip models (a good number of 2017–2020 models), by contrast, are mostly fine — the installer automatically sets up a patched `linux-t2` kernel, T2 audio, Wi-Fi/Bluetooth firmware, and fan control. The full model list is in the official manual's [Mac support](https://github.com/basecamp/omarchy/blob/quattro/manual/44-mac-support.md) page.

### Apple Silicon Macs

M-series chips have no official support — the manual is explicit about that. The community route is [Asahi Alarm](https://asahi-alarm.org/), an Arch port built on top of the Asahi Linux project specifically for M1/M2 chips. On top of that, the community-maintained [omarchy-mac](https://github.com/omarchy-mac/omarchy-mac) project provides a guide for getting Omarchy running, and the official manual's own phrase for it is that it takes "some effort."

The other route is a VM. The official manual has a whole page, [Omarchy on...](https://github.com/basecamp/omarchy/blob/quattro/manual/49-omarchy-on.md), listing a few non-standard setups. It describes running it in Parallels as "quite the cumbersome process," and for VirtualBox says "performance probably won't be great." Both are community-written guides, not paths the official project guarantees to maintain going forward.

---

## Running It

After booting from the USB drive, the installer walks through configuration questions — keyboard layout, username, password — and once you confirm the target drive it starts installing. The official numbers put the fastest machines at under a minute, with older machines usually taking no more than five. After it finishes, a reboot drops you straight into the configured desktop; there's no separate step of installing a desktop environment or configuring a window manager by hand.

Day-to-day control of Omarchy mostly happens through the menu opened with `Super + Space`, where launching apps and adjusting system settings both live. Installing and removing software, and taking screenshots or recordings, don't have separate entry points either — they're in the same menu too. There's also an `omarchy` CLI on the command-line side, and it can redo pretty much everything the graphical menu can:

```bash
# Update Omarchy itself and every system package; takes a snapshot first automatically
omarchy update

# Switch themes — one of 22 built in
omarchy theme set tokyo-night

# List every available subcommand, handy for exploring
omarchy commands --all

# Let sudo skip the password for a set number of minutes
omarchy-sudo-passwordless 30
```

`omarchy debug` prints out debugging information you can paste directly when asking for help on the official Discord. `omarchy reinstall` fixes a broken configuration by reinstalling the default packages and config files. `omarchy-channel-set` switches between the four update channels — stable, RC, edge, and dev. A fresh install starts on stable, which tracks one month behind Arch's own official mirror, specifically to catch any new incompatibilities before they become someone's problem.

---

## Demo

This section wasn't run on real hardware. What follows is the effect as described in the official manual and its screenshots, plus what two long-term third-party write-ups have to say — not a first-hand account.

Per the official manual, Omarchy ships 22 built-in themes, and switching one changes the wallpaper, terminal, Neovim, the btop system monitor, Chromium, and the color scheme across the entire top bar and lock screen all at once, summoned directly with `Super + Ctrl + Shift + Space`. The top bar itself takes over the job that the menu bar, system tray, and notification center used to do, and in recent years it's grown an AI agent usage panel that tracks the session progress and quota consumption of CLI agents like Claude Code and Codex in real time — the icon only appears the first time Omarchy detects AI coding agent activity on the machine. Clipboard history is unified under `Super + Ctrl + V`, holding both images and text.

The official manual also has a dedicated table for people coming from Mac or Windows: the Spotlight or Raycast muscle memory maps to `Super + Space`, AirDrop becomes LocalSend via `Super + Ctrl + S`, Time Machine becomes the automatic system snapshot taken before every update, and even the Cmd key doesn't move — Linux treats it as Super.

Third-party long-term write-ups offer a more grounded reference point. [Arch Linux (Omarchy) — 8 Months Later](https://www.ssp.sh/blog/linux-omarchy-the-good-bad-and-fixable/) is a detailed retrospective from a developer who switched from Mac/Windows and used it for 8 months, listing which common macOS tools — Raycast, calendar apps, screen sharing — already have replacements on Linux, and which don't yet. [Giving Omarchy a Shot](https://chambers.io/blog/2025/08/28/omarchy.html) is a longtime Mac user's account of buying a new drive specifically to try Omarchy, explaining why he'd had enough of macOS and Windows 11 and decided to give Arch a serious try.

---

## Similar Projects and Reception

Putting Omarchy next to comparable projects makes its positioning clearer. [Omakub](https://omakub.org/), mentioned earlier, is DHH's earlier project layering a tiling setup and common dev tools on top of Ubuntu + GNOME, aimed at people trying to ease over from Mac/Windows. Omarchy goes all the way to Arch + Hyprland, aimed at experienced users who want rolling updates and keyboard-only operation. [CachyOS](https://cachyos.org/) is also Arch-based with a Hyprland option available, but its selling point is a custom-tuned kernel and scheduler — it's chasing raw performance with the desktop environment left up to you, which isn't quite the same emphasis as Omarchy's out-of-the-box theming and AI-agent workflow presets. [HyDE](https://github.com/HyDE-Project/HyDE) isn't a full distribution at all, but a Hyprland theming config that layers on top of any existing Arch install, built around 70-plus one-click themes. Omarchy bundles that kind of desktop theming together with the installer, updates, and snapshot rollback into one complete distribution — by the time you install it, the whole system is already decided.

Community discussion turns up some real installation accounts. On Zhihu, [one answer records a full hands-on account of installing Omarchy and configuring Chinese locale and input methods](https://www.zhihu.com/question/1958561061436363590), and also touches on DHH's move to Linux being driven by dissatisfaction with Apple's 30% App Store cut and a sense that Apple under Tim Cook has stopped innovating. [Another answer covers installing it on a 4K-screen ThinkPad X1 Carbon](https://www.zhihu.com/question/1948774591897003042), walking through the gotchas around Chinese locale not being installed by default and the fcitx5 pinyin theme looking rough, while also noting that day-to-day resource usage is low.

There are two posts on X worth a look too. [Hengqian Ling went digging through the official manual's table of contents after coming across Omarchy](https://x.com/linghengqian/status/2091395296274338239), and found that the distribution has no WSL version at all. More interesting is [the post from quantumfire_io](https://x.com/quantumfire_io/status/2092287329889100028), who tested the community-maintained Mac port on an M1 Max and found the experience smoother than the Intel MacBook Pro he'd used before — smooth enough that he repartitioned the M1 and made Omarchy his daily driver. That post is a real-world counterexample to the "no official support on Apple Silicon" line earlier: the community route does work, it's just on you to absorb the extra effort it takes.

---

## Uninstalling and Running It Again

Omarchy isn't an app installed inside a system, it's the operating system that takes over the entire disk, so "uninstalling" it in the usual app-deleting sense doesn't quite apply. Mac users who want macOS back go through Internet Recovery per the official manual, reinstalling over the network. On a PC, going back to whatever ran before means overwriting the disk again with different install media. If all you want is to wipe your personal settings, account, and `/home` while keeping Omarchy itself and running through the first-boot setup again, the Omarchy menu has _Setup > Reset Computer_ for exactly that — type `reset` to confirm, and it clears every user account and all data, dropping you back at the first-boot setup screen, provided the machine was installed from the Omarchy ISO to begin with.

Running it again isn't really about "relaunching" anything — once it's installed, Omarchy is just the machine's everyday OS, ready the moment you turn it on. If you only want to roll back to before a specific update, there's no need to reinstall: `omarchy update` takes an automatic system snapshot before every run, and picking an earlier snapshot from the Limine boot menu and rebooting does the trick. Only the root filesystem gets rolled back; personal files in `/home` are untouched.

---

## Summary

Omarchy is built for people willing to give up dragging windows around with a mouse and seriously try a keyboard-only Linux desktop. From full-disk encryption at install time to a default firewall that denies all inbound traffic, the security defaults are set on the strict side, and automatic snapshot rollback on updates lowers the cost of things going wrong while you tinker. But for Apple Silicon Mac users, this isn't a "spin up a VM over the weekend and try it" kind of project — there's currently no official native support, and both the community Asahi port and the VM route take real extra effort. quantumfire_io's post about switching an M1 Max to a daily driver shows the community path does work, but the bar is clearly higher than it is on an Intel Mac or a regular PC. Everything in this article is drawn from the official manual, the source, and public third-party accounts. It hasn't been installed on real hardware, so before actually trying it, it's worth reading the manual's Mac support and Omarchy on... pages closely first.
