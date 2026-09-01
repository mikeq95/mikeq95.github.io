---
slug: 2026/08/21/crosspoint-reader-github-project
title: "CrossPoint Reader: Open-Source Firmware for Xteink E-Readers"
date: 2026-08-28
tags: [e-reader, esp32, firmware, open-source, Ai-friendly]
description: CrossPoint Reader is open-source firmware for the Xteink X3/X4 e-reader, written in C++ and built with PlatformIO; this post is compiled from source code, official docs, and third-party reviews, without hands-on testing.
---

{/* truncate */}

> If you're new to this, this post includes a ready-to-use AI prompt that can help you set up the environment in one go.

## Introduction

CrossPoint Reader is written in C++, built with PlatformIO on the Arduino framework, and runs on the ESP32-C3 chip. The project was started by Dave Allie, who's still its top contributor by far — 195 commits, with the next closest contributor at 94. It currently has over 7,300 stars and more than 1,500 forks on GitHub, is released under the MIT license, and the README states clearly that it isn't affiliated with Xteink or any device manufacturer.

The only hardware it officially supports today is the Xteink X3 and X4, but SCOPE.md is explicit that the core team is intentionally broadening the codebase to more ESP32-C3/S3 e-reader devices. Community forks have already ported it to the M5Stack Paper S3 and the LilyGo T5S3, though those haven't merged into the main line — they're separately maintained community branches.

The ESP32-C3 has only about 380KB of usable RAM, and that constraint shapes nearly every design decision in the firmware. The first time a chapter is opened, it gets parsed and cached to the SD card; every subsequent load reads straight from that cache instead of re-parsing the whole thing.

The project's scope is drawn tightly. SCOPE.md explicitly puts notepads, calculators, and games — "interactive apps" — out of bounds, and rules out an RSS reader or web browser too, since a persistently active Wi-Fi radio drains the battery and the single-core CPU can't really handle it. PDF support is excluded outright, on the reasoning that PDF is a fixed-layout format, so rendering it on an e-reader means constant panning and zooming — a poor experience by design. New theme submissions and new network-sync PRs are also temporarily closed for now, while the team consolidates the codebase and multi-device support before taking on new features. The project funds contributors through Royalty.dev, and raised over $600 in the first few hours after opening funding, which the team cites as a signal that community demand for this is real.

## Environment Setup

This section wasn't set up hands-on — the author doesn't own an Xteink device — so it's compiled from the official steps in the README and SCOPE.md.

Most people don't need to install anything. CrossPoint ships a web-based flashing tool at crosspointreader.com/#flash-tools that you open in Chrome or Edge; it talks to the device directly through the browser's own serial capability, no driver or client needed.

To flash from the command line, the only thing to install is esptool:

```bash
pip install esptool
```

Building from source — say, to modify the code or contribute — is the only case that calls for a real development environment. You'll need Python 3.8 or later, `clang-format` 21, and pioarduino (or VS Code with the pioarduino plugin), plus a USB-C cable that actually supports data transfer. Clone with `--recursive`, since the project uses git submodules:

```bash
git clone --recursive https://github.com/crosspoint-reader/crosspoint-reader
cd crosspoint-reader
# if cloned without --recursive:
git submodule update --init --recursive
```

Nix/NixOS users can enter the dev shell directly with `nix develop -f nix` or `nix-shell nix`; to flash a device, you'll also need to add a line for `platformio-core.udev` to your system configuration to enable the matching udev rules.

One category of device needs an extra step. Some Xteink units bought through third-party stores like AliExpress ship with USB flashing locked from the factory, and need the official Xteink Unlocker (crosspointreader.com/#unlock-tool) before anything else. The official warning is specific: the unlocker currently only officially supports flashing CrossPoint and CrossInk, and flashing any other firmware through it risks permanently bricking the device or leaving it stuck with no way back. Units bought directly from xteink.com aren't affected and don't need unlocking. If you're not sure whether your device is locked, try the web flasher first — if the serial device picker doesn't show your device, try a different USB port or browser before assuming it's locked.

At this point, it should be clear what needs installing and when it doesn't.

## Running It

Also not verified hands-on — this section is compiled from the README's "Install firmware" and "Development quick start" sections.

The simplest path is the web flasher: connect the device via USB-C, wake and unlock the screen, open crosspointreader.com/#flash-tools, pick the device model (X3 or X4), choose an official release, and click Flash. To flash a specific version or a local build, the same page has a "Custom .bin" option — upload a `firmware.bin`, downloaded from the Releases page or produced by a local build or CI artifact. Reverting to the official firmware also goes through this same page, flashing the latest official release.

Command-line flashing takes a couple of extra steps. First, find the device's port — on Linux, run `dmesg` after connecting; on macOS:

```bash
log stream --predicate 'subsystem == "com.apple.iokit"' --info
```

Once you know the port, flash it:

```bash
esptool.py --chip esp32c3 --port /dev/ttyACM0 --baud 921600 write_flash 0x10000 /path/to/firmware.bin
```

Swap `/dev/ttyACM0` for whatever port you actually found.

Building from source, once the dev environment is set up, compiling, flashing, and monitoring the serial port all happen with a single command:

```bash
pio run --target upload
```

Before submitting a PR, the project asks contributors to run a self-check pass:

```bash
./bin/clang-format-fix
pio check -e default
pio run -e default
```

For chasing down crashes or other runtime issues, once the dependencies are installed you can pull detailed logs:

```bash
python3 -m pip install pyserial colorama matplotlib
python3 scripts/debugging_monitor.py                      # Linux
python3 scripts/debugging_monitor.py /dev/cu.usbmodem2101  # macOS, adjust the port to match your system
```

USER_GUIDE.md notes that first boot lands you straight on the Home screen, and every restart after that automatically reopens whatever book you were last reading, so you don't have to dig back through folders to find it.

At this point, the flashing paths are covered — here's what the firmware actually does once it's running.

## Results

This section wasn't run hands-on either — the feature descriptions below come from the README, USER_GUIDE.md, and the third-party reviews and videos linked in the "Similar Projects and Reception" section below.

### Reading engine

The core is EPUB 2/3 rendering, with an embedded-style toggle, image handling, hyphenation, kerning, chapter navigation, footnotes, bookmarks, and StarDict dictionary lookups — select a word and look it up without switching to your phone. KOReader progress sync uses the standard protocol, and rather than tracking a simple percentage, it records a chapter-content XPath position, so switching to a device with a completely different font or layout still returns you to the exact same sentence. By default it points at the official free `sync.crosspointreader.com`, though you can self-host a Docker Compose server or point it at a legacy public server like `sync.koreader.rocks`.

There's also a feature called Focus Reading, which bolds the first part of each word to create a visual fixation point, inspired by Bionic Reading. The official docs note it can help readers who are prone to losing focus, such as those with ADHD; it's off by default and needs to be switched on manually in settings.

### Formats and device support

Native support covers `.epub`, Xteink's own `.xtc`/`.xtch`, plain `.txt`, and `.bmp` images. The X3 has a gyroscope-driven tilt page turn feature unique to that model — tilt the device to turn the page. Custom fonts don't require reflashing: upload up to four font weights in TTF/OTF to crosspointreader.com/fonts, generate `.cpfont` files, copy them to `/fonts/YourFontName/` on the SD card, and select the font in device settings. That web conversion tool runs the exact same `lib/EpdFont/scripts/fontconvert_sdcard.py` script that lives in the repo, so the output matches a local build.

### Wireless and book transfer

You can drag files straight onto the device from a browser, or mount it as a WebDAV network drive. With the Calibre plugin installed, right-clicking a book sends it to the device directly. OPDS supports up to eight saved servers, with search, pagination, and direct download, which makes it easy to hook into a self-hosted library like Calibre Web. OTA updates are checked and installed straight from GitHub Releases, or you can drop a `firmware.bin` onto the SD card for an offline update.

### Personalization

The interface covers 24 languages, including Hebrew, with right-to-left reading support. Sleep-screen options include a book cover, a plain image, or a transparent overlay, plus a "quick wake" mode that prints the last page's text directly onto the sleep screen before the device sleeps, so it's ready to keep reading instantly instead of waiting for a full load. The four front buttons and the side volume buttons can all be remapped. Themes currently number four — Classic, Lyra, Lyra Extended, and RoundedRaff — though SCOPE.md notes this area is temporarily frozen; the plan is to move themes off the firmware entirely and load them from the SD card instead, so they stop eating into flash space.

The above is what the docs and README describe as capable; for how rendering speed and page-turn smoothness actually feel, the third-party reviews linked in "Similar Projects and Reception" below are a better reference. The eBook Reader's review notes that upgrading from 1.2.0 to 1.3.0 introduced uneven font rendering, and the author rolled back to the older version — a reminder that new versions don't only add features without also introducing regressions.

## Similar Projects and Reception

CrossPoint keeps its own scope tight, but most of what it deliberately leaves out has a community fork covering it. The README maintains its own "Community forks" list: [CrossInk](https://github.com/uxjulia/CrossInk) focuses on typography and reading tracking, adding Bionic Reading, guide dots between words, tighter paragraph indents, and swapped-in default fonts. [papyrix-reader](https://github.com/bigbag/papyrix-reader) adds FB2 and Markdown format support along with Arabic script handling. [crosspoint-reader-cjk](https://github.com/aBER0724/crosspoint-reader-cjk) is purpose-built for Chinese, Japanese, and Korean reading. The README's own position is that many of these features will eventually make their way into the main line — the team just wants to keep a slower pace, squashing bugs and locking down stability before merging them in. The project itself didn't come out of nowhere either: the README closes with a shoutout to [diy-esp32-epub-reader](https://github.com/atomic14/diy-esp32-epub-reader), an earlier open-source ESP32 e-reader implementation not tied to any specific commercial hardware, which served as the inspiration for CrossPoint.

On the review side, The eBook Reader's Nathan Groezinger wrote up [a review with video](https://blog.the-ebook-reader.com/2026/05/20/xteink-x4-with-crosspoint-software-review-with-video-demo/) detailed enough to name specific version numbers — after upgrading from 1.2.0 to 1.3.0 he found the new version's font rendering uneven and simply rolled back. PocketInk's blog wrote [a flashing troubleshooting guide](https://pocketink.io/blog/flash-crosspoint-xteink-x3-x4/) that specifically calls out the SD-card flashing "Error 9" bug that was unresolved at the time — the same one tracked as [issue #2536](https://github.com/crosspoint-reader/crosspoint-reader/issues/2536), still open on GitHub as of writing this — and offers a workaround. The personal blog brie.dev has [a long-term usage writeup](https://brie.dev/tiny-ereader) covering buying advice after the April 2026 USB-lock incident, and the tradeoffs between CrossPoint, CrossInk, and Crosspet. Pocket-lint also published [a full flashing walkthrough with screenshots](https://www.pocket-lint.com/custom-e-reader-firmware/), step by step from start to finish.

On the community side, r/xteinkereader on Reddit has [the project's original launch thread](https://www.reddit.com/r/xteinkereader/comments/1plj85s/crosspoint_custom_firmware_for_the_xteink_x4/), with plenty of first-hand feedback in the comments, and also [a specific bug report](https://www.reddit.com/r/xteinkereader/comments/1rq1vlm/epub_file_wont_open_w_crosspoint_x4_just_reboots/) where a particular EPUB file causes the device to reboot on open — a sign the firmware still has stability gaps on certain files, not a completely smooth experience. On Zhihu, [a post detailing a flashing experience](https://zhuanlan.zhihu.com/p/2004526108197011730) calls it the smoothest firmware-flashing experience the author has had, while also mentioning they'd tried the crosspoint-reader-cjk fork, which was buggy and froze often at the time, and observing that Xteink's own stock firmware seems to have later picked up some interface-design cues from CrossPoint — that last part is the author's own subjective read, not something officially confirmed.

## Prompt for AI Coding Agents

Don't want to dig through the docs and set up the environment yourself? Hand the block below to Claude Code or Codex and have it build CrossPoint Reader from source and flash it onto your connected Xteink device.

```text
## Goal
Build CrossPoint Reader (github.com/crosspoint-reader/crosspoint-reader), an open-source e-reader firmware, from source and flash it onto the currently connected Xteink X3/X4 device.

## Steps
1. Clone the repo with --recursive (the project uses git submodules): git clone --recursive https://github.com/crosspoint-reader/crosspoint-reader; if it was cloned without that flag, run git submodule update --init --recursive to fix it
2. Confirm pioarduino (or VS Code with the pioarduino plugin) and Python 3.8+ are installed
3. Connect the device via a USB-C data cable and confirm it's recognized by the system
4. Build and flash: pio run --target upload
5. If the device was bought from a third-party seller like AliExpress and isn't recognized during flashing, it may have USB flashing locked from the factory — unlock it first at https://crosspointreader.com/#unlock-tool; devices bought directly from xteink.com aren't affected
6. If building locally isn't wanted, the web flasher at https://crosspointreader.com/#flash-tools works too — pick the device model and flash an official release directly, no dev environment needed

## Verification
Confirm the flash command completed successfully and the device boots into the CrossPoint home screen after restarting. Report any errors encountered along the way, plus the final state.

Exact commands and parameter details can be checked against this article: https://mikeq95blog.uk/blog/2026/08/21/crosspoint-reader-github-project
```

## Uninstalling and Running It Again

Uninstalling maps to whatever got installed in "Environment Setup": if you only used the web flasher, nothing was installed on your computer at all, so there's nothing to remove. If you installed esptool, `pip uninstall esptool` clears it. If you built from source, deleting the local clone directory and the `.pio` build cache cleans everything up.

To actually restore the device itself, go back to crosspointreader.com/#flash-tools and flash the latest official firmware.

To flash a newer version later, there's nothing to reinstall. Once the device is online, checking for updates in settings triggers an OTA download and install; alternatively, drop a new `firmware.bin` onto the SD card for an offline update. If you're working from a local source build, `git pull` to get the latest code and a single `pio run --target upload` is all it takes.

## Summary

The only hardware CrossPoint officially supports right now is the Xteink X3 and X4. SCOPE.md says the plan is to expand to more ESP32-C3/S3 devices, but for now that mostly shows up as community-maintained ports rather than anything merged into the main line. The SD-card flashing "Error 9" bug was still unresolved as of writing this — if you hit it, check issue #2536 for any workarounds people have found. The firmware doesn't support PDFs or DRM-protected ebooks, both worth knowing before you get started.

Everything compiled in this post comes from the source code, README, USER_GUIDE.md, SCOPE.md, and the third-party reviews linked above — the author doesn't own an Xteink device and hasn't actually flashed or run any of this. If you're following this article to actually do it, it's worth reading through the reviews and issue discussions linked in "Similar Projects and Reception" first, so you can skip a few of the problems other people have already run into.
