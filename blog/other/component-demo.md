---
slug: demo/component-demo
title: 组件效果演示（临时草稿，不会发布）
date: 2026-08-30
draft: true
description: 卡片/分栏/步骤条/Tabs/手风琴/代码组在这个博客里的实际效果演示——全部零 import
---

> 这篇是 `draft: true`，只在本地 `npm start` 能看到，不会出现在正式构建里，看完效果可以直接删掉。
>
> 这一版把六个 `import` 全删了——`Tabs`/`TabItem`/`Card`/`CardGrid`/`Columns`/`Steps`/`Step` 现在都在 `src/theme/MDXComponents.js` 里全局注册了，下面这些组件标签是直接写的，文件里没有任何 import 语句。

---

## 1. 卡片（自建组件，已注册为全局，零 import）

<CardGrid>
  <Card title="🚀 快速开始" href="#">
    从零到能跑起来，大概五分钟。
  </Card>
  <Card title="📦 组件库" href="#">
    Tabs、手风琴都是现成的，卡片是我新写的。
  </Card>
  <Card title="🎨 主题" href="#">
    颜色和圆角都复用了博客已有的 CSS 变量。
  </Card>
</CardGrid>

---

## 2. 分栏（自建组件，已注册为全局，零 import）

<Columns>
  <div>

### 左边

分栏跟 Tabs 不一样，两块内容是同时并排显示的，不需要点击切换。适合放对比内容。

  </div>
  <div>

### 右边

比如"改之前 / 改之后"，或者"方案 A / 方案 B"这种需要一眼对比的场景。

  </div>
</Columns>

---

## 3. 步骤条（自建组件，已注册为全局，零 import）

<Steps>
  <Step title="安装依赖">

```bash
npm install
```

  </Step>
  <Step title="启动开发服务器">

```bash
npm start
```

  </Step>
  <Step title="打开浏览器确认效果">

访问 `http://localhost:3000`，改动会热更新。

  </Step>
</Steps>

---

## 4. Tabs（Docusaurus 原生，已注册为全局，零 import）

<Tabs>
  <TabItem value="mac" label="macOS" default>
    用 Homebrew：`brew install xxx`
  </TabItem>
  <TabItem value="win" label="Windows">
    用 winget：`winget install xxx`
  </TabItem>
  <TabItem value="linux" label="Linux">
    用发行版自带的包管理器。
  </TabItem>
</Tabs>

---

## 5. 手风琴（Docusaurus 原生，`<details>` 标签，不需要 import）

<details>
<summary>点开看第一部分</summary>

这里是折叠起来的内容，默认收起，点标题展开。原生 HTML `<details>`/`<summary>` 标签，Docusaurus 会自动接管样式。

</details>

<details>
<summary>点开看第二部分</summary>

可以放代码块、列表，都行：

```js
console.log('accordion 里也能放代码');
```

</details>

---

## 6. 代码组（没有原生组件，用零 import 的 Tabs 包代码块实现）

<Tabs>
  <TabItem value="npm" label="npm" default>

```bash
npm install blume
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```bash
pnpm add blume
```

  </TabItem>
  <TabItem value="yarn" label="yarn">

```bash
yarn add blume
```

  </TabItem>
</Tabs>

---

## 小结

- **手风琴**：原生 `<details>`/`<summary>`，从来就不用 import。
- **Tabs / 卡片 / 分栏 / 步骤条**：现在全部注册进了 `src/theme/MDXComponents.js`，任何一篇 `.md`/`.mdx` 文章都能直接用标签，不用再写 import。
- **代码组**：Docusaurus 没有专门的组件，用零 import 的 `Tabs` 包代码块是社区通用做法（Docusaurus 官方文档自己也这么写多包管理器安装命令）。
- 这六个标签现在是**全站生效**的，不只是这篇文章——任何新文章都能直接用，这也是 Blume 里 `<CardGroup>`/`<Tabs>` 不用 import 的同一种机制。
