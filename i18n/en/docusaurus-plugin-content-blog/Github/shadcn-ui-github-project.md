---
slug: 2026/08/28/shadcn-ui-github-project
title: "shadcn/ui: The CLI That Copies Component Source Straight Into Your Project"
date: 2026-08-28
tags: [github, open-source, AI, Ai-friendly]
description: "shadcn/ui is an open-source React component collection whose CLI copies component source code directly into your project instead of publishing an npm package, so the component code is fully yours to maintain and modify."
---

{/* truncate */}

> If you're new to this, this article includes a ready-to-use AI prompt that can set up the environment for you in one go.

## What It Is

The project was released by shadcn (the community generally just calls him that) in January 2023. Not long after, he joined Vercel, where he's now a design engineer. The repo has accumulated over 120,000 stars on GitHub, with forks past 10,000. It's built on top of Radix UI or the newly supported Base UI — both unstyled primitives — and all styling is written in Tailwind CSS.

The project's stated philosophy is "open code." Top-level component code is fully open to you and can be edited directly. That's also the reason it's marketed as AI-friendly: an LLM can read the code directly, understand its structure, and modify it to match your design system, rather than treating it as a black box the way a third-party package sitting in `node_modules` would be. All components also follow the same composable interface convention, so once you're used to one component you don't have to relearn the API for another. The default styles are also carefully chosen to work together, so they look good out of the box while still leaving room for deep customization. The official docs have a line that puts the philosophy plainly: "This is not a component library. It is how you build your component library."

Distribution doesn't go through npm packages either. It uses a flat-file schema called `registry.json` / `registry-item.json` for cross-framework component distribution — essentially turning "publishing a package" into "shipping a list of code that can be copied," which sidesteps the version lock-in that package management tends to bring. You can also host your own private or public registry, distributing internal components, hooks, and page templates to your team through the same CLI without depending on the official repo. The August 2026 update added support for private GitHub registries, authenticated with a `GH_TOKEN`. The more interesting piece is the official MCP Server. Any registry compatible with the shadcn protocol can be browsed, searched, and installed from by an AI assistant using natural language, with no extra configuration — turning "installing a component" from typing commands by hand into letting an AI agent read the docs, pull the source, and wire it up itself.

The component count has passed 60, covering common cases like Accordion, Data Table, Dialog, Sidebar, and Calendar, plus more niche ones like Field, Item, Empty, and Kbd. August 2026 also added Questionnaire, a component built specifically for multi-step Q&A flows — form research, onboarding flows, that kind of thing. The underlying engine now uniformly supports both Radix UI and Base UI as unstyled primitives. A Radix UI migration was completed in June 2025, and in February 2026 the Radix UI package was unified further with blocks support added, so you can switch between the two engines without changing how you use components at the top level.

Cross-framework install guides are also thorough — Next.js, Vite, Laravel, Astro, and a few other major frameworks each have their own dedicated docs, and manual integration into any React project is supported too. For new projects, the official recommendation is to first use the visual tool shadcn/create to pick a style, icon set, and theme, which then generates the right init command for your framework, so you don't have to try flags one by one yourself.

## Setup

This isn't a project you clone and run. It assumes you already have a React project, or that you spin up an empty one first with something like Vite or Next.js. To actually verify the whole flow, I started a brand-new Vite + React + TypeScript project for testing.

```bash
npm create vite@latest app -- --template react-ts
cd app
npm install
```

shadcn/ui's docs are currently written against Tailwind CSS v4, which needs to be installed separately:

```bash
npm install tailwindcss @tailwindcss/vite
```

Replace `src/index.css` with:

```css
@import "tailwindcss";
```

Set up a `@/*` path alias — both `tsconfig.json` and `tsconfig.app.json` need a `paths` entry:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

> Note: the official docs also have you add `"baseUrl": "."` at this step, but if you're on a newer TypeScript version (I tested with 6.0.3), adding `baseUrl` triggers a `TS5101` error during `tsc -b`, telling you the option has been deprecated. `paths` resolves fine without `baseUrl`, so just leave that line out.

Then install the type definitions `vite.config.ts` needs:

```bash
npm install -D @types/node
```

Update `vite.config.ts` with the path alias and the Tailwind plugin:

```ts
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

At this point, the environment shadcn/ui itself needs is ready.

## Running It

Setting up the environment isn't the whole job — shadcn/ui itself starts with the `init` command.

```bash
npx shadcn@latest init
```

The first time it runs, npx reports it's installing `shadcn@4.19.0` (the latest version as of my testing), which also confirms the package has been renamed from the old `shadcn-ui` to just `shadcn`. This command asks two questions in sequence: first, which component library to use (Base UI is currently the recommended option, with React Aria and Radix UI also available), then which preset theme to use (Nova, Vega, Maia, Lyra, Mira, Luma, Sera, Rhea, or a custom one — Nova defaults to Lucide icons and the Geist font). To skip the interactive prompts, pass the flags directly:

```bash
npx shadcn@latest init -y -b radix -p nova
```

Once it finishes, it writes a `components.json` at your project root recording the component library, preset, and path alias you chose, rewrites `src/index.css` into a full CSS-variable-based theme (both light and dark color sets, plus radius variables, are all in there), and installs runtime dependencies like `class-variance-authority` and `radix-ui`.

With that configured, you can install components:

```bash
npx shadcn@latest add button
```

Once the command finishes, `src/components/ui/button.tsx` is actually sitting in your project — not a placeholder. It's a complete component that uses `class-variance-authority` to define variants and `radix-ui`'s `Slot` to support `asChild`:

```tsx
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"
  // ...
}
```

Six variants — default, outline, secondary, ghost, destructive, link — plus several size options from xs up to icon-lg, are already written in. Import it in `App.tsx` to confirm it works:

```tsx
import { Button } from '@/components/ui/button'
// ...
<Button variant="outline">shadcn Button</Button>
```

Then run a production build:

```bash
npm run build
```

> ✅ Working: `tsc -b && vite build` completes, and `dist/` contains the bundled HTML/CSS/JS with no errors.
>
> ❌ Not working: if `tsc` reports `TS5101`, go back to the note in the previous section and remove `baseUrl` from your tsconfig.

## Demo

(Insert screenshot here: the shadcn Button, outline variant, rendered by the Vite dev server)

The build output I got looked roughly like this:

```text
dist/index.html                        0.45 kB │ gzip:  0.29 kB
dist/assets/index-B4QWxhtV.css         25.65 kB │ gzip:  5.62 kB
dist/assets/index-CSebWqlH.js         227.49 kB │ gzip: 71.55 kB

✓ built in 499ms
```

`components.json` records the configuration chosen for this run:

```json
{
  "style": "radix-nova",
  "tailwind": {
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

Installing a second or third component doesn't require repeating any of the setup above — you can list several names at once, like `npx shadcn@latest add card dialog`.

## Similar Projects and Reception

shadcn/ui is built on Radix UI, which is also a fully usable library on its own. If you don't even want shadcn's pre-chosen default styling and want to design your own system from scratch, it's common to work directly with the [Radix UI](https://www.radix-ui.com/) (or the newly supported Base UI) primitives and wire up Tailwind or something else yourself.

The more common comparison is against "install and go" traditional component libraries like [Mantine](https://mantine.dev/) and [Chakra UI](https://www.chakra-ui.com/). Mantine ships over 120 components and 100-plus hooks ready to use, so you don't have to wire up things like TanStack Table or a notification system yourself the way you would with shadcn — the tradeoff is that style customization isn't as thorough as shadcn's "copy the source and edit it" approach. Chakra UI takes a similar path, shipping a complete theming system out of the box, and fits projects that want to move fast without deep per-component customization.

[Makers Den](https://makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra) engineer Kalle Bertell wrote a side-by-side comparison focused on how shadcn's "copy-paste architecture" eliminates hidden dependencies and avoids style lock-in, and it also lays out how it relates to Radix and Base UI as a layer underneath. There's no shortage of criticism either. Someone wrote [on dev.to](https://dev.to/devforgedev/why-i-chose-mantine-over-shadcnui-for-every-dashboard-project-5fd0) that after building roughly a dozen admin dashboards, they picked Mantine every single time, for specific reasons: Mantine's DataTable comes with sorting and pagination out of the box, where shadcn requires wiring up TanStack Table yourself; Mantine's `useForm` connects directly to Zod for nested validation; and the two differ in bundle size by about 50KB, a gap the author felt was invisible in internal-tool use cases.

On the community-discussion side, Vercel CEO Guillermo Rauch's [comment on X](https://x.com/rauchg/status/2088757738037989755) got fairly widely shared — he said a lot of people don't realize how much of React's success owes to shadcn, calling React "Lego for adults" and arguing shadcn is the layer people actually wanted. Not everyone agrees. [alexanderisorax wrote on X](https://x.com/alexanderisorax/status/1823617909223997932) about their conclusion after building a mid-sized SaaS product: even for something as simple as a button, Mantine offers more configuration options than shadcn, and its hooks, component count, and overall completeness are higher too — they don't buy the idea that shadcn is the default choice for every project.

Zhihu has two longer pieces approaching this from different angles. [One](https://zhuanlan.zhihu.com/p/2004607340721218879) starts from the question of whether developers should have full control over component code, focusing on AI-friendliness — a traditional component library buried in `node_modules` is invisible to AI, while shadcn puts the source directly in the project where AI can read and edit it. [The other](https://zhuanlan.zhihu.com/p/694048244) compares shadcn against traditional libraries like Ant Design, arguing that while shadcn makes customization easier, it also raises the maintenance cost of component styling as a project evolves.

## Prompt for AI Coding Agents

```text
## Goal
Set up shadcn/ui in an existing React project (or a newly created Vite/Next.js project), get through init and adding at least one component, and confirm the project still builds correctly.

## Steps
1. Confirm the project has Tailwind CSS v4; if not, install it first (`tailwindcss` plus the framework-specific plugin, and add `@import "tailwindcss";` to the main CSS file)
2. Set up a `@/*` path alias (the `paths` entry in tsconfig, plus the build tool's own alias config). Note: if the TypeScript version is newer, `compilerOptions.baseUrl` triggers a TS5101 deprecation error — using only `paths` without `baseUrl` also works fine
3. Run `npx shadcn@latest init`. If it prompts interactively (component library, preset), choose based on the project's needs, or skip the prompts with `-y -b <radix|base|aria> -p <preset-name>`
4. Run `npx shadcn@latest add <component-name>` as needed to install components; multiple names can be listed at once
5. Use your own judgment on the rest, no need to confirm every step

## Verification
Confirm that component files were actually generated under src/components/ui/ (not empty files or placeholders), that the project builds for production (e.g. npm run build, which is tsc -b && vite build) without errors, and report the result back to me.

Specific commands and configuration details can be checked against this article: https://mikeq95blog.uk/blog/2026/08/28/shadcn-ui-github-project
```

## Uninstalling and Running It Again

This isn't a standalone program you "uninstall." The CLI itself always runs ephemerally through `npx` / `pnpm dlx`, so there's no global install footprint to clean up — what needs removing is what it wrote into your project.

To remove it fully, reverse what the Setup and Running It sections did: delete `src/components/ui/`, `src/lib/utils.ts`, and `components.json`, restore `src/index.css` to your own original styles, and uninstall the related dependencies.

```bash
rm -rf src/components/ui src/lib/utils.ts components.json
npm uninstall tailwindcss @tailwindcss/vite class-variance-authority radix-ui lucide-react
```

Exactly which packages to remove depends on what `init` and `add` actually wrote into your `package.json` — different presets and different components don't pull in the exact same set of dependencies.

Want to use it again later? No need to reinstall anything. If the project structure and `components.json` are still there, just keep running the add command — no need to go through init again:

```bash
npx shadcn@latest add card dialog
```

## Summary

The only real snag I hit during testing was that the tsconfig setup in the official docs triggers a deprecation warning on newer TypeScript versions — covered above, along with the workaround. Beyond that, the whole chain from init to add to a working `npm run build` had no other surprises.

Whether to use it comes down to a specific tradeoff: full styling freedom versus taking on more maintenance yourself. If a team wants something ready to go out of the box and doesn't have time to fine-tune component styles constantly, a traditional library like Mantine or Chakra UI may be the easier choice. If you're already using Tailwind and want AI tools to be able to read and edit component code directly, shadcn/ui's copy-into-your-project approach will likely fit better. The repo is actively maintained — it was still shipping new components and features in August 2026, not a project that's gone quiet.
