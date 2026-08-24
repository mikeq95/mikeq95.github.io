---
name: run-my-blog
description: Build, run, and drive mikeq95's Docusaurus blog (my-blog). Use when asked to start the blog's dev server, build it, take a screenshot of a page or post, or verify a change actually renders before pushing.
---

This is a Docusaurus 3 site (repo root = the unit, `blog/` is just the blog
content folder). It's driven like any web app: start the dev server, then
drive a headless browser against it with the **Playwright MCP tools**
already available in this environment (`browser_navigate`,
`browser_snapshot`, `browser_click`, `browser_take_screenshot`,
`browser_console_messages`) — no custom driver script needed. `chromium-cli`
is not installed as a shell binary here; the MCP tools are the equivalent
harness and are what was actually used to verify this skill.

All paths below are relative to the repo root (one level above `blog/`).

## Prerequisites

Nothing beyond Node — `node -v` showed v26 here, `engines` in `package.json`
only requires `>=20`. `node_modules/` was already installed; if it isn't:

```bash
npm install
```

## Build

```bash
npm run build
```

Builds both locales (`zh-Hans` default, `en`), then a `postbuild` step
(`scripts/clean-llms-txt.mjs`) trims the generated `llms-full.txt` files.
Confirmed working — full run finishes in well under a minute and ends with
`[SUCCESS] Generated static files in "build"` / `"build/en"`. You'll see
`[WARNING] Tags [...] are not defined in tags.yml` for a handful of posts —
pre-existing, harmless, not a build failure.

## Run (agent path)

**Port 3000 is often already taken on this machine by an unrelated project**
(observed: someone else's Vite/unocss app). Don't assume it's free and don't
kill whatever's listening there — pick another port instead, e.g. 3001:

```bash
(nohup npm run start -- --port 3001 --no-open > /tmp/docusaurus-dev.log 2>&1 &)
bash -c 'until curl -sf http://localhost:3001 >/dev/null 2>&1; do sleep 1; done; echo READY'
```

Then drive it directly with the Playwright MCP tools — no shell script,
these are called as tools:

1. `browser_navigate` → `http://localhost:3001` (homepage) or
   `http://localhost:3001/blog` (post list).
2. `browser_snapshot` — accessibility-tree view of the page; use this to
   find real post links (`/blog/YYYY/MM/DD/slug`) rather than guessing
   selectors.
3. `browser_click` with `target` set to the exact `ref=...` id from the
   snapshot (a plain CSS/text selector string errors out — it must be the
   ref, e.g. `f1e96`).
4. `browser_take_screenshot` (`fullPage: true` to see a whole article,
   comments widget included).
5. `browser_console_messages` with `level: "error"` — check this after
   every navigation; a page can render its shell while a client-side
   fetch (Supabase comments/reactions) silently fails.

Stop the dev server when done (npm doesn't forward SIGTERM to the child
Vite/webpack process, so killing the port's listener is what actually frees
it):

```bash
lsof -ti:3001 -sTCP:LISTEN | xargs -r kill
```

To smoke-test the production build instead of the dev server, `npm run
serve -- --port 3002 --no-open` after `npm run build`, same wait-for-curl
pattern, same port caveat.

## Run (human path)

```bash
npm start   # opens a browser window on :3000, live-reloads. Ctrl-C to stop.
```

## Test

No test suite in this repo (no `test` script in `package.json`) — `npm run
build` succeeding is the correctness signal, plus the manual
navigate/screenshot/console-check pass above.

---

## Gotchas

- **Port 3000 collisions are the norm here, not the exception.** This dev
  machine runs other projects that bind :3000. `docusaurus start` fails
  fast with `[ERROR] Something is already running on port 3000` rather
  than auto-picking a free one — always pass `--port` explicitly.
- **`browser_click` needs the snapshot `ref`, not a selector string.**
  Passing a human-readable description/selector directly (e.g. the link's
  visible text as a CSS selector) throws `Unexpected token "" while
  parsing css selector`. Take a `browser_snapshot` first, read off the
  `ref=fXeYY` for the target element, pass that as `target`.
- **Two locales build on every `npm run build`** (`zh-Hans` + `en`) — the
  English tree lives under `i18n/en/docusaurus-plugin-content-blog/`, a
  separate directory from `blog/`. A build that only touches one locale's
  content still rebuilds both.
- **Live Supabase-backed widgets (comments, reactions, login) render
  during local dev** and produced zero console errors when a real post
  page was loaded — `.env.local` already has working Supabase keys for
  local testing, no mocking needed.

## Troubleshooting

- **`[ERROR] Something is already running on port 3000`**: not this app —
  another project's dev server. Use `--port 3001` (or any free port)
  instead of investigating/killing it.
