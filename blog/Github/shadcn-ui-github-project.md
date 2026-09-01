---
slug: 2026/08/28/shadcn-ui-github-project
title: shadcn/ui，把组件源码直接装进项目的 CLI
date: 2026-08-28
tags: [github, open-source, AI, Ai-friendly]
description: shadcn/ui 是一套通过 CLI 把组件源码直接拷贝进项目的开源 React 组件集合，不发布 npm 包，装完之后组件代码完全归你自己维护和修改。
---

[shadcn/ui](https://github.com/shadcn-ui/ui) 是一套开源的 React 组件集合，解决的是一个具体的老问题。用惯了的组件库，要么把你锁在它给的默认外观里，要么为了改样式层层覆盖、拼凑不兼容的 API。shadcn/ui 换了个方向。CLI 会把组件的源代码直接拷贝进项目里的 `components/ui` 目录，装完之后这些代码就是你自己的，想怎么改都行。

{/* truncate */}

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

---

## 介绍

这个项目由 shadcn（社区一般直接这么称呼他）在 2023 年 1 月发布，没过多久他就加入了 Vercel，现在是那边的设计工程师。仓库在 GitHub 上已经积累了 12 万多 star，fork 数也过了 1 万。它构建在 [Radix UI](https://www.radix-ui.com/) 或新支持的 [Base UI](https://base-ui.com/) 这两套无样式 primitive 之上，样式全部用 Tailwind CSS 写。

官方给这套东西定的调子是"开放代码"。组件顶层代码对你完全开放，可以直接改。这也是它主打对 AI 友好的原因，LLM 能直接读到这些代码、理解它的结构，再按你的设计系统去改，不像塞在 `node_modules` 里的第三方包那样是个黑盒。所有组件还遵循同一套可组合的接口约定，用惯一个组件之后，学别的组件不用重新摸索一遍 API。出厂的默认样式也经过认真挑选，彼此搭配一致，装完直接能用，深度定制的空间还留着。官方文档有一句原话，"这不是一个组件库，是你用来搭建自己组件库的东西"，把这套理念说得比较直白。

分发方式也没有走 npm 包那条路。它用一套叫 `registry.json` / `registry-item.json` 的 flat-file schema 做跨框架的组件分发，本质上是把"发布一个包"变成"发一份能被拷贝的代码清单"，绕开了包管理带来的版本锁死问题。你也可以自己搭一个私有或公开的 registry，把公司内部组件、hooks、页面模板用同一套 CLI 分发给团队，不依赖官方仓库。2026 年 8 月的更新还加了私有 GitHub registry 支持，用 `GH_TOKEN` 认证就行。更有意思的是官方的 MCP Server。任何兼容 shadcn 协议的 registry 不用额外配置，AI 助手就能用自然语言浏览、搜索、装组件，这件事从手动敲命令变成了让 AI 代理自己去读文档、拉源码、接线。

组件数量已经过 60 个，覆盖了 Accordion、Data Table、Dialog、Sidebar、Calendar 这些常见场景，也有 Field、Item、Empty、Kbd 这类偏细节的组件。2026 年 8 月还新增了 Questionnaire，一个专门做多步问答流的组件，适合表单调研、引导流程这类场景。底层引擎目前统一支持 Radix UI 和 Base UI 两套无样式 primitive。2025 年 6 月完成过一次 Radix UI 迁移，2026 年 2 月又统一了 Radix UI 包并加上了 blocks 支持，你可以在两者之间切换，上层用法不用跟着改。

跨框架的安装指南也齐全，Next.js、Vite、Laravel、Astro 等几个主流框架各自有单独的文档，任意 React 项目也支持手动接入。新项目官方还推荐先用可视化工具 shadcn/create 选好 style、图标、主题，再生成对应框架的初始化命令，省得自己一个个 flag 去试。

---

## 安装环境

这不是一个 clone 下来就能跑的项目，装的前提是你已经有一个 React 项目，或者先用 Vite、Next.js 这类工具起一个空项目。为了实测整个流程，我另起了一个全新的 Vite + React + TypeScript 项目验证。

```bash
npm create vite@latest app -- --template react-ts
cd app
npm install
```

shadcn/ui 目前基于 Tailwind CSS v4 写文档，需要单独装：

```bash
npm install tailwindcss @tailwindcss/vite
```

把 `src/index.css` 换成：

```css
@import "tailwindcss";
```

给 `@/*` 配一个路径别名，`tsconfig.json` 和 `tsconfig.app.json` 里都要加 `paths`：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

> 注意，官方文档这一步还会让你顺手加一个 `"baseUrl": "."`，但如果你的 TypeScript 版本比较新（我实测用的是 6.0.3），加了 `baseUrl` 反而会在 `tsc -b` 阶段报 `TS5101`，提示这个选项已经被弃用。`paths` 不靠 `baseUrl` 也能正常解析，直接不写这一行就行。

再装一下 `vite.config.ts` 里要用到的类型：

```bash
npm install -D @types/node
```

`vite.config.ts` 补上路径别名和 Tailwind 插件：

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

至此，shadcn/ui 本身需要的环境已经准备好了。

---

## 运行

装环境不算完，真正的 shadcn/ui 从 `init` 命令开始。

```bash
npx shadcn@latest init
```

第一次执行时 npx 会提示装的是 `shadcn@4.19.0`（我实测时的最新版本），这也印证了包名已经从早年的 `shadcn-ui` 换成了现在的 `shadcn`。这条命令会先后问两个问题：先选组件库（Base UI 目前是推荐项，另外还有 React Aria 和 Radix UI 可选），再选一个预设主题（Nova、Vega、Maia、Lyra、Mira、Luma、Sera、Rhea 或自定义，Nova 默认搭配 Lucide 图标和 Geist 字体）。不想被交互式提问打断，直接带参数：

```bash
npx shadcn@latest init -y -b radix -p nova
```

跑完会在项目根目录写一个 `components.json`，记录你选的组件库、预设、路径别名这些配置，同时把 `src/index.css` 改写成一整套基于 CSS 变量的主题（浅色、深色两套配色和圆角变量都在里面），还会装好 `class-variance-authority`、`radix-ui` 这些运行时依赖。

配置完就能装组件了：

```bash
npx shadcn@latest add button
```

命令跑完，`src/components/ui/button.tsx` 会实实在在地出现在项目里，不是占位符，是一份基于 `class-variance-authority` 写 variant、用 `radix-ui` 的 `Slot` 支持 `asChild` 的完整组件：

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

default、outline、secondary、ghost、destructive、link 六种变体，外加从 xs 到 icon-lg 好几档尺寸，都已经写好。在 `App.tsx` 里引一下确认能用：

```tsx
import { Button } from '@/components/ui/button'
// ...
<Button variant="outline">shadcn Button</Button>
```

跑一下生产构建：

```bash
npm run build
```

> ✅ 正常：`tsc -b && vite build` 走完，`dist/` 下生成打包好的 HTML/CSS/JS，没有报错。
>
> ❌ 异常：如果 `tsc` 报 `TS5101`，回去看上一节的注意事项，把 `baseUrl` 从 tsconfig 里删掉。

---

## 效果展示

（此处插入截图：Vite 开发服务器里渲染出来的 shadcn Button，outline 变体）

实测构建输出大致是这样：

```text
dist/index.html                        0.45 kB │ gzip:  0.29 kB
dist/assets/index-B4QWxhtV.css         25.65 kB │ gzip:  5.62 kB
dist/assets/index-CSebWqlH.js         227.49 kB │ gzip: 71.55 kB

✓ built in 499ms
```

`components.json` 里记着这次选的配置：

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

装第二个、第三个组件不用再重复上面的配置步骤，`npx shadcn@latest add card dialog` 这样列几个名字一次装多个就行。

---

## 相关项目和评价

shadcn/ui 底层用的 Radix UI，本身也是一套独立可用的东西。如果连 shadcn 预先选好的默认样式都不想要，想从零画自己的设计系统，直接用 [Radix UI](https://www.radix-ui.com/)（或新支持的 Base UI）这层原语，自己接 Tailwind 或别的方案也是常见做法。

更常被拿来跟它对比的是 [Mantine](https://mantine.dev/) 和 [Chakra UI](https://www.chakra-ui.com/) 这类"装好即用"的传统组件库。Mantine 有 120 多个组件、100 多个 hooks，直接能用，不用像 shadcn 那样自己去拼 TanStack Table、通知系统这类周边功能，代价是样式定制没有"拷贝源码自己改"那么彻底。Chakra UI 走的也是类似路线，开箱带一整套主题系统，适合想快速出活、不需要逐个组件深度定制的项目。

[Makers Den](https://makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra) 的工程师 Kalle Bertell 写过一篇横向对比，重点讲 shadcn 这套"拷贝粘贴架构"怎么消除隐藏依赖、避免样式锁定，也梳理了它和 Radix、Base UI 之间的分层关系。批评的声音也不少。有人在 [dev.to 上写文章](https://dev.to/devforgedev/why-i-chose-mantine-over-shadcnui-for-every-dashboard-project-5fd0)说自己做过十来个管理后台，最后每次都选 Mantine，理由很具体：Mantine 的 DataTable 开箱自带排序分页，shadcn 得自己接 TanStack Table；Mantine 的 `useForm` 能直接对接 Zod 处理嵌套校验；两者打包体积差 50KB 左右，作者觉得内部工具场景根本感知不到这点差距。

社区讨论这块，Vercel CEO Guillermo Rauch 在 [X 上的一条评价](https://x.com/rauchg/status/2088757738037989755)流传比较广，他说很多人没意识到 React 的成功很大程度上要归功于 shadcn，把 React 比作"给成年人的乐高积木"，认为 shadcn 才是大家真正想要的那一层。不是所有人都这么想，[alexanderisorax 在 X 上写过](https://x.com/alexanderisorax/status/1823617909223997932)自己做完一个中等规模 SaaS 后的结论：连按钮这种简单组件，Mantine 给的配置项都比 shadcn 多，hooks 和组件数量、完整度也更高，他不认同"随便什么项目都该无脑上 shadcn"这种说法。

知乎上也有两篇从不同角度切入的长文。[一篇](https://zhuanlan.zhihu.com/p/2004607340721218879)从"开发者该不该对组件代码有完全控制权"切入，重点讲 AI 友好性，传统组件库塞在 `node_modules` 里 AI 看不到实现，shadcn 把源码摆在项目里，AI 能直接读、能改。[另一篇](https://zhuanlan.zhihu.com/p/694048244)拿 shadcn 和 Ant Design 这类传统组件库做对比，认为 shadcn 定制样式更容易，但项目迭代过程中组件样式的维护成本也会跟着上去。

---

## 给 AI 编程助手的提示词

```text
## 目标
在一个已有的 React 项目（或新建的 Vite/Next.js 项目）里装好 shadcn/ui，跑通 init 和至少一个组件的 add，并确认项目能正常构建。

## 步骤
1. 确认项目里有 Tailwind CSS v4，没有的话先装好（`tailwindcss` + 对应框架插件，把 `@import "tailwindcss";` 写进主 CSS 文件）
2. 给 `@/*` 配一个路径别名（tsconfig 的 paths，加上构建工具自己的 alias 配置）；注意如果 TypeScript 版本较新，`compilerOptions.baseUrl` 会触发 TS5101 弃用报错，只写 paths 不写 baseUrl 也能正常工作
3. `npx shadcn@latest init`，遇到交互式提问（选组件库、选预设）按项目需要选，或者直接用 `-y -b <radix|base|aria> -p <预设名>` 跳过
4. 按需 `npx shadcn@latest add <组件名>` 装组件，可以一次列多个名字
5. 其余细节自己判断执行，不用逐条确认

## 核查结果
确认 src/components/ui/ 下真的生成了组件文件（不是空文件或占位符），项目能跑通生产构建（如 npm run build，也就是 tsc -b && vite build）不报错，把结果汇报给我。

具体命令、配置细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/08/28/shadcn-ui-github-project
```

---

## 卸载和下次运行

这套东西不是一个要"卸载"的独立程序。CLI 本身一直通过 `npx` / `pnpm dlx` 临时执行，没有全局安装的痕迹要清理，需要卸的是它写进你项目里的那些文件。

想彻底移除，对应"安装环境""运行"两节做过的事逆着来一遍：删掉 `src/components/ui/`、`src/lib/utils.ts`、`components.json`，把 `src/index.css` 换回你自己原来的样式，卸掉相关依赖。

```bash
rm -rf src/components/ui src/lib/utils.ts components.json
npm uninstall tailwindcss @tailwindcss/vite class-variance-authority radix-ui lucide-react
```

具体要卸掉哪些包，看 `package.json` 里 init 和 add 命令实际写进去的依赖，不同预设、不同组件装的东西不完全一样。

下次还想用，不用重装。项目结构和 `components.json` 都还在的话，直接接着跑就行，不用重新走一遍 init：

```bash
npx shadcn@latest add card dialog
```

---

## 总结

实测过程里唯一踩到的坑，是官方文档给的 tsconfig 配置在较新的 TypeScript 版本上会报废弃警告，前面已经写清楚怎么绕过去。除此之外，从 init 到 add 到最终 `npm run build` 跑通，整条链路没有别的意外。

要不要用它，其实是"要不要为了样式的完全自由，自己多担一份维护成本"这道选择题。团队追求开箱即用、没空天天调组件样式，Mantine 或 Chakra UI 这类传统组件库可能更省心。已经在用 Tailwind，又想让 AI 工具能直接读懂、改动组件代码，shadcn/ui 这套拷贝进项目的思路会更顺手。仓库现在维护活跃，2026 年 8 月还在加新组件和新功能，不是一个已经停更的项目。
