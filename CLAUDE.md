# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — dev server (`docusaurus start`). The saved launch config (`.claude/launch.json`) runs it as `npm run start -- --port 3000 --no-open`.
- `npm run build` — production build into `build/`. Automatically runs the `postbuild` script (`scripts/clean-llms-txt.mjs`) afterward. **Run this before pushing any change that touches content files or config** — Docusaurus can fail the build in ways that aren't obvious from the diff (e.g. deleting `docs/intro.md` broke deployment previously), and `.github/workflows/deploy.yml` builds and deploys straight to GitHub Pages on every push to `main` with no staging step.
- `npm run lint` — ESLint (flat config in `eslint.config.js`). There is no test suite in this repo.
- `npm run serve` — serve the already-built `build/` output locally.
- `npm run upload-image -- <local-file> [remote-key]` — uploads an image/video to the Cloudflare R2 bucket via the S3-compatible API and prints the public CDN URL (defaults to key `coverimage/<filename>`). Requires R2 credentials in `.env.local`.
- `npm run clear` — clears the `.docusaurus/` cache; use if the dev server behaves oddly after editing plugins/config.

Despite what README.md says, this project uses **npm**, not yarn — there's no `yarn.lock`, `package-lock.json` is the real lockfile, and CI runs `npm ci` / `npm run build`.

## Environment

Copy `.env.example` to `.env.local` for local dev (Docusaurus doesn't auto-load `.env.local`; it's loaded manually via `dotenv` at the top of `docusaurus.config.js`).

- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — injected into the client bundle at build time via an rspack `DefinePlugin` (`defineEnvPlugin` in `docusaurus.config.js`). The anon key is safe to expose publicly; Supabase Row Level Security is the actual access guard. `src/lib/supabase.js` also hardcodes a fallback URL/key, which is why the CI build works even though `deploy.yml` never sets these two.
- `DOCUSAURUS_ADMIN_USER_ID` — comma-separated Supabase user UUIDs, exposed via `customFields.adminUserIds`; the only one of these actually set as a GitHub Actions secret.
- `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE` — only used by the local `upload-image` script; never bundled into the site.

## Architecture

Docusaurus 3 + React 19 site, deployed to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main` — not via `docusaurus deploy` or Cloudflare Wrangler (`wrangler.toml` exists but isn't part of the active deploy path).

**Content layout**: blog posts live flat under `blog/<Category>/*.md` (categories: `Claude-Code`, `English`, `Github`, `Life`, `Macos`, `Other` — no further subfolders). Default locale is `zh-Hans`; `en` is a secondary locale, and an English translation of a post lives at `i18n/en/docusaurus-plugin-content-blog/<same relative path under blog/>`. `docs/` is not used for real content — `docs/intro.md` is a required hidden placeholder; removing it breaks the docs plugin/build.

**Two custom plugins re-parse every blog `.md`/`.mdx` file directly** (via the shared helper `plugins/shared/findMarkdownFiles.js`), independent of Docusaurus's own per-locale blog plugin instance:
- `src/plugins/blogGlobalDataPlugin.js` builds a locale-aware global list of all posts (title/date/permalink/tags/category/cover image), exposed as Docusaurus global data for cross-category features (recent posts, sidebars, etc.). Per post it merges the i18n frontmatter over the default-locale frontmatter, and falls back to the default-locale cover image when the i18n version isn't an absolute URL — cover images for English posts must be absolute CDN URLs (`https://cdn.mikeq95blog.uk/...`), not local `/coverimage/` paths.
- `plugins/posts-meta-plugin.js` writes `static/posts-meta.json` (slug → `{title, image}`) on build/dev startup, consumed client-side by pages that reference posts by slug without a full blog-post page context (`src/pages/my-bookmarks.js`, `src/pages/my-likes.js`).

**Supabase backend** (`src/lib/supabase.js`): powers auth (`src/context/AuthContext.js`, wired into `AuthProvider` in `src/theme/Root/index.js`), comments (`src/components/CommentSection`), and per-user likes/bookmarks (`src/hooks/useUserCollection.js`, tables `likes`/`bookmarks` sharing a `{post_id, user_id, created_at}` shape). The Supabase client is `null` during SSR/build (`typeof window !== 'undefined'` guard) — anything using it must be client-only (wrapped in `BrowserOnly` or otherwise only run in an effect).

**Swizzled theme components** under `src/theme/` (BlogListPage, BlogPostItem, BlogPostPage, BlogSidebar, Navbar, Footer, ColorModeToggle, MDXComponents) customize Docusaurus's default blog/navbar UI. `src/theme/NavbarItem/ComponentTypes.js` registers two custom navbar item types, `custom-NavbarLanguageSwitcher` and `custom-NavbarSettingsButton`, used directly in `docusaurus.config.js`'s `themeConfig.navbar.items`.

**Styling**: Tailwind CSS (utilities-only, no preflight) is layered on top of Docusaurus's Infima CSS via a custom `tailwindPlugin` in `docusaurus.config.js`, plus hand-ported shadcn/animate-ui components under `src/components/animate-ui` (imported via the `@/` alias → `src/`, distinct from Docusaurus's own `@site/` alias → repo root).

**Accent-color theming** is user-selectable and persisted to `localStorage` (`theme-accent-color`). It's applied twice: once via an inline `<script>` in `docusaurus.config.js`'s `headTags` (runs before hydration, to avoid a flash of the wrong color) and once at runtime via `src/utils/themeColor.js`.

**llms.txt generation**: `docusaurus-plugin-llms` generates `llms.txt`/`llms-full.txt` plus per-page markdown files (production build only), which power the "Copy as Markdown" / "Open in chat" post actions in `src/components/BlumeTableOfContents`. `scripts/clean-llms-txt.mjs` runs as the `postbuild` step to strip leaked MDX comment markers (e.g. `{/* truncate */}`) out of the generated txt files.

## Content conventions

Blog post frontmatter: `slug` (date-prefixed path, e.g. `2026/07/19/claude-code-recommended-plugins`), `title`, `date`, `tags` (keys must exist in `blog/tags.yml`), `description`, and an optional `image` that must be an absolute CDN URL (`https://cdn.mikeq95blog.uk/coverimage/...`) rather than a local path — required in particular for English translations, since local `/coverimage/` paths don't resolve under the `i18n/en` tree.
