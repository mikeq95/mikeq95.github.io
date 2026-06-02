---
slug: 2026/06/01/open-codesign-review
title: Claude Design 平替，Open CoDesign 实际体验
date: 2026-06-01
tags:
  - github
  - macos
  - AI
---

最近 Claude Design 挺火的，用 prompt 直接生成页面原型，效果看着很爽。但问题是，它要单独订阅，而且只能用 Claude 一个模型，数据全在云端。我就在想，有没有开源平替？搜了一下，还真有——[Open CoDesign](https://github.com/OpenCoworkAI/open-codesign)，MIT 开源，本地运行，支持带自己的 API Key。这篇文章记录一下我的实际体验。

{/* truncate */}

---

## 它是什么

Open CoDesign 是一个桌面端的 AI 设计工具，核心逻辑就一句话：**你输入 prompt，它帮你生成可以直接看的 HTML 原型页面**。

它的定位是 Claude Design、v0、Lovable 这类工具的开源替代品。几个关键点：

- **本地运行**，数据不出你的电脑
- **BYOK**（Bring Your Own Key），Claude、GPT、Gemini、Ollama 都支持
- **MIT 开源**，免费用，只需要付你自己模型的 API 费用
- **导出真实文件**，HTML、PDF、PPTX、ZIP 都行

---

## 部署过程

### 环境要求

- Node.js v22+
- pnpm 10.x

```bash
# 检查 Node 版本
node -v

# 安装 pnpm
npm install -g pnpm@10.33.4
```

### 克隆 & 安装

```bash
git clone https://github.com/OpenCoworkAI/open-codesign.git
cd open-codesign
pnpm install
```

`pnpm install` 会跑一两分钟，等它装完。

### 启动

```bash
pnpm dev
```

稍等片刻，Electron 窗口会弹出来。第一次会让你配置 Provider，把你的 Claude API Key（`sk-ant-...`）粘进去，测试一下连接，就可以开始用了。

> **踩坑提示**：别像我一样手滑在项目目录里 `git clone`，记得先 `cd` 到你想放的地方再克隆😂

---

## 实际使用感受

### 生成速度

用 Claude API 的话，生成一个中等复杂度的页面大概需要 20-40 秒。页面生成过程中左边有个 Agent 面板，可以实时看到 AI 在做什么——写了哪些文件、调用了哪些工具，不是黑盒，看着还挺有意思的。

### 生成质量

内置了 15 个 Demo 模板（Landing Page、Dashboard、定价页、聊天 UI 等），直接选一个改 prompt 就能用，起点不低。它还内置了 12 个设计技能模块，会自动根据你的 prompt 选合适的模块，所以输出的页面不会是那种毫无设计感的"AI 味"风格。

### Comment 模式

这个功能挺实用的——点击预览页面上的任意元素，可以直接留一个批注，让 AI 只重写那个区域，不用重新描述整个页面。比直接改 prompt 精准多了。

### AI Sliders

生成完之后，AI 会自动识别出"值得调的参数"，比如主题色、字体大小、间距，用滑块的方式让你调，不用再写 prompt 说"把按钮颜色改成蓝色"之类的。

---

## 和 Claude Design 比

| | Open CoDesign | Claude Design |
|---|:---:|:---:|
| 开源 | ✅ MIT | ❌ |
| 本地运行 | ✅ | ❌ 云端 |
| 支持多模型 | ✅ 20+ | ❌ 仅 Claude |
| 价格 | ✅ 免费（自付 API 费用） | 💳 订阅制 |
| 数据隐私 | ✅ 本地 | ❌ 云端处理 |

---

## 目前的不足

说说不够满意的地方：

- 安装包目前还没有签名，macOS 上需要手动执行 `xattr -cr` 绕过 Gatekeeper，对不熟悉命令行的人来说有点门槛
- 现在还是 v0.2，功能还在快速迭代，偶尔会遇到一些小 bug
- 如果网络不稳定，API 调用偶尔会超时

---

## 总结

如果你已经有 Claude 或其他模型的 API Key，Open CoDesign 是目前开源 AI 设计工具里完成度最高的一个。本地运行、支持多模型、导出格式丰富，基本把"为什么不用 Claude Design"的问题都答上了。

对于开发者来说，它的 Agent 面板透明度很高，能看到 AI 实际在做什么，这点比很多商业工具强。设计质量上也不是那种随便生成的粗糙感，内置的 taste layer 做了不少工作。

整体来说值得一试，尤其是已经在用 Claude API 的人，装起来成本很低。

---

_基于 [OpenCoworkAI/open-codesign](https://github.com/OpenCoworkAI/open-codesign) v0.2.0_
