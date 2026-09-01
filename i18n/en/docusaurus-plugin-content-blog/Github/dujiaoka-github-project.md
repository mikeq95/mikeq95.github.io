---
slug: 2026/08/28/dujiaoka-github-project
title: "dujiaoka: An Archived Open-Source Vending System"
date: 2026-08-28
tags: [github, open-source, Ai-friendly]
description: dujiaoka is an open-source, Laravel-based automated vending system for delivering digital goods, archived in February 2026; this post summarizes its setup and current status from official docs and third-party reviews.
---

{/* truncate */}

> If you're new to this, this post includes a ready-to-use AI prompt that can help you set up the environment in one go.

## Introduction

> Discontinued notice: dujiaoka stopped receiving updates and maintenance on February 12, 2026, and the repository is now archived and read-only. Author assimon has shifted development to a new project called Dujiao-Next, a rewrite in Go, and the top line of the README now simply says "please head to the new version." This post documents what dujiaoka looked like before it was discontinued — how it was designed and how the official docs describe deploying it. If you're setting up a vending site from scratch today, it's worth checking the successor project covered in the "Similar Projects and Reception" section below first.

When a buyer completes payment on a site built with dujiaoka, the system automatically delivers the card codes, software licenses, or membership accounts, so the site owner doesn't have to sit there processing orders by hand. The project is built on the Laravel framework, uses laravel-admin for the backend, and Bootstrap for the frontend UI — the most common combination in the Chinese PHP ecosystem. It currently has over 12,000 stars and more than 2,700 forks on GitHub, with [iLay1678](https://github.com/iLay1678) as its core contributor.

The entire frontend template can be swapped out. Besides the official unicorn template, the community has contributed two more — luna and hyper — maintained by [Julyssn](https://github.com/Julyssn) and [bimoe](https://github.com/bimoe) respectively, so switching templates completely changes how a site looks without touching the core code. Payment coverage is fairly broad too: mainstream options in China like Alipay and WeChat Pay are supported, along with PayPal and Stripe for overseas payments, plus "signature-free" gateways like V 免签 that don't require enterprise business credentials. The code is fully open source, all extension packages are loaded through Composer, and it's released under the MIT license.

## Environment Setup

Since dujiaoka is discontinued, spinning up a full PHP 7.4 + MySQL + Redis + Supervisor environment from scratch today has limited value. This section wasn't actually set up and run — it's compiled from the official README, the wiki, and the manual install guide shipped in the repository itself.

The official requirements are fairly strict: Linux only (not supported on shared hosting, and Windows is untested and not recommended), PHP plus PHP-CLI must be exactly version 7.4 — not "7.4 or higher," but an exact match — Nginx 1.16 or above, MySQL 5.6 or above, plus Redis, Supervisor, and Composer. On the PHP side, the `fileinfo` and `redis` extensions need to be installed, and the `putenv`, `proc_open`, `pcntl_signal`, and `pcntl_alarm` functions need to be enabled — many hosting control panels disable these by default, so they typically need to be manually re-enabled in `php.ini`.

> Note: the PHP version range declared in `composer.json` is actually `^7.2.5|^8.0`, which looks much more permissive. But the official docs and the Dockerfile — which uses the `webdevops/php-nginx:7.4` base image — both pin it to 7.4. If you're actually deploying this, follow what the docs say rather than being misled by the looser range in `composer.json`.

The official docs lay out three deployment paths: a manual Linux install without any control panel, a Docker install, and a one-click flow through the 宝塔 (aaPanel) control panel, with separate guides for its 2.x and 1.x versions — all of these live in the project wiki, and since the project is discontinued, none of them will be updated further. The repository also ships its own `debian_manual.md`, a community-contributed manual walkthrough for people who don't want to use a control panel and prefer to configure everything themselves — it goes from installing Nginx, MariaDB, PHP 7.4, and Redis all the way through configuring Supervisor, in more detail than the wiki.

With the environment requirements and the available deployment paths covered, the next section walks through the actual run steps based on the repo's own manual guide and Docker config files.

## Running It

A manual deployment roughly means putting the source on a server, installing dependencies, configuring Nginx, and then opening a browser to walk through the install wizard.

After cloning the code, install dependencies with Composer:

```bash
git clone https://github.com/assimon/dujiaoka.git
cd dujiaoka
composer install
```

Key points for the Nginx config: the site root should point to the `public` directory, and PHP requests need to be forwarded to the matching PHP-FPM socket (for example, `/var/run/php/php7.4-fpm.sock`). The repo's `debian_manual.md` includes a complete vhost config you can copy directly.

Once the config is correct, opening the domain in a browser automatically redirects to the `/install` setup wizard — this route is registered in `routes/common/web.php`. It walks through the database name, database password, Redis password, and site URL, and writes them all into `.env` once submitted. Two things still need to be done manually after installation: switching `APP_DEBUG` in `.env` from `true` to `false`, and if the site is running HTTPS, adding a line for `ADMIN_HTTPS=true` — the official docs note that a "0 error" on backend login is usually caused by this setting being missing.

Asynchronous tasks, like payment callbacks and queued messages, run through a Redis queue, which needs a Supervisor-managed worker process:

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/dujiaoka/artisan queue:work
autostart=true
autorestart=true
numprocs=1
```

After that config is in place, run `supervisorctl reread && supervisorctl update && supervisorctl start laravel-worker:*` to bring the worker up.

If you'd rather not configure all of this by hand, the repo also ships a `Dockerfile` and `docker-compose.yml`, based on the `webdevops/php-nginx:7.4` image. The container's startup script automatically runs `composer install --ignore-platform-reqs`, then brings up both `queue:work` and `supervisord`. The `docker-compose.yml` deliberately mounts `.env`, `install.lock`, and `public/uploads` as host volumes, so rebuilding the container doesn't force you through the install wizard again or lose uploaded images.

Once installed, `/admin` is the backend management entry point, with the default username and password both set to `admin` — the first thing to do after logging in is change it.

That covers the deployment process compiled from the official docs. Since the project itself is discontinued, none of the steps above have actually been run and verified end to end. If you're actually deploying it, it's worth checking the "Problems" (问题锦集) page on the repo's wiki first — a lot of environment errors are already documented there.

## Results

This section, too, wasn't put together from an actual hands-on run — the screenshots described below come from the three template previews posted in the official README.

### unicorn template (official default)

The homepage has a clean, white-background style with a line-art unicorn logo. The top bar has a text logo, "Home" and "Order Lookup" navigation, and a product search box. Below that are category filter tags and a grid of product cards, each showing a unicorn icon placeholder image, price, stock count, and an "Auto-delivery" or "Manual processing" status tag, with a blue "Order" button.

### luna template

The single-page layout is more minimal — the logo and "dujiaoka" title sit in the top-left, with an "Order Lookup" button in the top-right. An announcement banner highlights important notices in red text. Below that are category selection cards showing the item count per category, and products are listed as cards with tiered pricing (like "price per unit when buying 2 or more") and a stock progress bar.

### hyper template

The top bar uses a dark navigation style with the logo, "dujiaoka" title, and a search icon. The main body has an announcement banner and category tabs; selecting a category shows products in a table — with columns for name, type, stock, price, and action — with "Buy" buttons and sold-out states shown directly in the table rows, a distinctly different layout from the card-based grids in the other two templates.

The three templates differ quite a bit in information density and visual style, ranging from card grids to a table-style list. Which one to pick comes down to preference — none of them change the core auto-delivery logic.

## Similar Projects and Reception

After dujiaoka's discontinuation, the first thing worth looking at is [Dujiao-Next](https://github.com/dujiao-next/dujiao-next), the successor project led by the same author. It's a rewrite in Go, with a Gin + GORM backend and a Vue + TypeScript frontend, splitting the architecture into separate frontend and backend services. The default database also switched from MySQL to SQLite (with PostgreSQL as an option), removing the hard requirement to install MySQL and Redis, which lowers the deployment bar considerably compared to the old version. The license changed too, from MIT to GPL-3.0. It currently has just over 1,000 stars on GitHub and is still early stage, nowhere near the scale dujiaoka reached at its peak.

For anyone who wants to stay in the PHP stack, [hiouttime/dujiaoka](https://github.com/hiouttime/dujiaoka) is an actively developed community rewrite that upgrades the framework to Laravel 12 and PHP 8.2+, replaces the backend with Filament 3, and adds features like user tiers and batch cart checkout. Its own README states it's "under active development and not recommended for production use" — it's still at the technical preview stage.

Among comparable projects, [ZFAKA](https://github.com/ZFAKA/ZFAKA) targets basically the same use case as dujiaoka and also supports USDT payments, though it's much smaller — currently in the low hundreds of stars — and is still actively maintained. [acg-faka](https://github.com/lizhipay/acg-faka) is a vending system more commonly used in the ACG (anime/comic/game) community, with over 5,500 stars — fewer than dujiaoka, but not a niche project by any means. There's also [card-system](https://github.com/Tai7sy/card-system), a card-code storefront system built by Tai7sy with over 3,000 stars, another commonly used open-source alternative in this space.

Third-party deployment accounts are worth reading too. Verne [wrote a technical breakdown of Dujiao-Next](https://blog.einverne.info/post/2026/04/dujiao-next-digital-goods-selling-system.html) on their personal blog, having used dujiaoka for a while beforehand — their own words were that it's "functionally complete overall, but as a PHP project, there are genuinely some headaches around deployment and performance." The post compares the technical choices and deployment approaches of the old and new versions in detail. 老梁 [documented on their blog](https://laoliang.net/jsjh/news/7927.html) the process of choosing between zfaka and dujiaoka, ultimately picking dujiaoka for having an interface that's "fairly clean, without a bunch of different colors," and included the actual deployment steps taken.

On the community discussion side, [Nexmoe shared on X](https://x.com/nexmoe/status/1969239879599997250) an account of deploying a vending site with dujiaoka using a single command, with replies in the thread bringing up the earlier "彩虹发卡" (Rainbow Card) as a similar product. [叶学长 wrote a beginner's account on Zhihu](https://zhuanlan.zhihu.com/p/707483887) of setting up dujiaoka from scratch, mentioning they lost data and backups due to a poor server choice, while also saying "both the interface and the functionality are pretty much perfect — I personally like its UI." [小宇 posted on X](https://x.com/xiaoyuboi/article/2067094007868694572) about actually selling digital goods for a month, including revenue breakdowns and specifics about getting payment channels working — though this account is mainly about the post-discontinuation Dujiao-Next, not the original dujiaoka.

## Prompt for AI Coding Agents

Don't want to look up docs and configure the environment yourself? Paste the following into Claude Code or Codex and have it deploy dujiaoka and verify the purchase flow works, or explain clearly why it can't be installed.

```text
## Goal
Deploy dujiaoka (github.com/assimon/dujiaoka) from source on a Linux server, and get the "visit homepage → log into the backend" flow working, or clearly explain why it can't be installed.

## Steps
1. Confirm this only runs on Linux. PHP plus PHP-CLI must be exactly version 7.4 (not higher), Nginx >= 1.16, MySQL >= 5.6, and Redis, Supervisor, and Composer must all be installed. On the PHP side, confirm the fileinfo and redis extensions are installed, and that putenv, proc_open, pcntl_signal, and pcntl_alarm haven't been disabled in php.ini — a common gotcha on hosting control panels.
2. Prefer the repo's own Dockerfile and docker-compose.yml to avoid repeated manual environment issues; if installing manually, follow debian_manual.md in the repo root.
3. Run composer install for dependencies. Point the Nginx site root at the public directory, and forward PHP requests to the matching PHP-FPM version.
4. Open the site domain in a browser and go through the /install setup wizard, entering database and Redis connection info.
5. After install, switch APP_DEBUG to false in .env, and add ADMIN_HTTPS=true if the site runs HTTPS.
6. Configure Supervisor to keep php artisan queue:work running, for handling async tasks like payment callbacks.
7. The project is archived and discontinued — if you hit errors during install, check the "Problems" page on the repo's wiki first.

## Verification
Confirm you can log into the backend at /admin (default username and password are both admin — change it immediately after logging in), that the storefront homepage displays the product list correctly, and that the queue worker process is running (check with supervisorctl status). Report the results back to me.

Specific commands and parameter details can be verified against this article: https://mikeq95blog.uk/blog/2026/08/28/dujiaoka-github-project
```

## Uninstalling and Running It Again

Uninstalling maps directly to what got installed in the "Environment Setup" section: stop the Supervisor-managed worker process, and drop the corresponding database in MySQL. For a Docker deployment, run `docker-compose down` and then remove the mounted `.env`, `install.lock`, and `public/uploads` volumes. For a manual deployment, remove the source directory along with the Nginx vhost config.

To run it again later, there's no need to redo the dependency install or the setup wizard. For a Docker deployment, just run `docker-compose up -d`; for a manual deployment, confirm Nginx, PHP-FPM, Redis, and Supervisor are all running, then open the site domain.

## Summary

Before it was discontinued, dujiaoka was one of the most commonly mentioned choices for individual site owners in China building a vending site — a mature tech stack, broad payment coverage, and swappable frontend templates. But it's now archived, and official vulnerability response stopped along with everything else, so running the old version in production carries real security risk. For anyone setting up a vending site from scratch today, Dujiao-Next — maintained directly by the original author — has a lower deployment bar and is worth checking out first. For anyone tied to the PHP stack, community forks like hiouttime/dujiaoka that are still under active development are another direction, though it's currently labeled as not recommended for production. The deployment process compiled in this post hasn't actually been run and verified end to end — if you do deploy it this way, keeping an eye on the wiki's "Problems" page will save you from a fair number of pitfalls.
