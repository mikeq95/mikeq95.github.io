---
slug: 2026/07/09/docmd-reconfigure-from-auto-mode
title: "docmd 项目重新配置记录"
date: 2026-07-09
tags:
  - docmd
description: "记录 docmd 项目从零配置(auto)模式导致首页 404，到用 docmd init 生成正式 docmd.config.json 配置、规范目录结构的完整排查和迁移过程。"
---

本地跑 docmd，因为项目根目录下没建配置文件，直接进了"零配置(auto)模式"，结果首页直接 404——记录一下这次从排查原因到用 `docmd init` 生成正式配置、把笔记迁移进 `docs/` 目录的完整过程。

{/* truncate */}

---

## 背景：为什么首页会 404

最初直接运行 `npx @docmd/core dev`，因为项目根目录下没有配置文件，docmd 会进入"零配置(auto)模式"，自动扫描当前目录的 Markdown 文件来生成站点。

但零配置模式有一个规则（来自 docmd 内部的 `auto-router.js`）：**只有当源目录里存在 `index.md` 或 `README.md` 时，才会生成根路径的 `index.html`**。

当时目录下只有两篇普通命名的笔记：

- `01-slash command.md`
- `2026-07-05-claude-slash-command-notes.md`

没有 `index.md`/`README.md`，所以 `site/` 里没有生成根 `index.html`，访问 `http://127.0.0.1:3000/` 就会 404（终端当时也提示了 `Root index.html not found. Build may be incomplete.`）。

解决办法：不再依赖零配置模式，用 `docmd init` 生成正式配置，并规范源文件目录结构。以下是完整的六步操作。

---

## 第 1 步：删除旧的构建产物

```bash
rm -rf site
```

只删除 `site/` 这个生成的静态站点输出目录，不会影响任何 Markdown 笔记内容。

---

## 第 2 步：生成正式配置

```bash
npx @docmd/core init
```

这一步会自动创建：

- `package.json`
- `docmd.config.json` —— 正式配置文件（之前没有这个文件，才会跑"零配置自动模式"）
- `docs/` 目录，里面带一个示例首页 `docs/index.md`
- `assets/` 目录（css/js/images 基础结构）
- `SKILL.md`

---

## 第 3 步：把笔记迁移到 docs/ 目录

```bash
mv "01-slash command.md" "2026-07-05-claude-slash-command-notes.md" docs/
```

docmd 的源目录（`src`）默认是 `docs`，所以原本放在项目根目录的两篇笔记需要挪进 `docs/`，才能被识别为文档页面并生成路由。

迁移后可以用 `ls docs/` 确认，应该能看到：

```
01-slash command.md
2026-07-05-claude-slash-command-notes.md
index.md
```

至此，笔记文件已经全部迁移到位。

---

## 第 4 步：安装依赖

```bash
npm install
```

根据 `package.json` 把 `@docmd/core` 等依赖装到 `node_modules/`。

---

## 第 5 步：修改 docmd.config.json

`docmd init` 生成的默认配置里带有一个 `navigation` 数组，指向的是 docmd 官网的示例链接（Getting Started / GitHub），如果不处理，侧边栏会显示这些无关内容，而不是我们自己的两篇笔记。

解决方式：整个替换配置文件内容，**去掉 `navigation` 字段**，让 docmd 自动根据 `docs/` 目录结构生成导航；同时把标题改成实际站点名称。

```bash
cat > docmd.config.json << 'EOF'
{
  "title": "Kris 的笔记",
  "url": "https://docs.myproject.com",
  "src": "docs",
  "out": "site",
  "engine": "js",
  "layout": {
    "spa": true,
    "header": { "enabled": true },
    "sidebar": { "collapsible": true, "defaultCollapsed": false },
    "optionsMenu": {
      "position": "sidebar-top",
      "components": { "search": true, "themeSwitch": true }
    },
    "footer": {
      "style": "minimal",
      "content": "© 2026 Kris 的笔记.",
      "branding": true
    }
  },
  "theme": { "name": "default", "appearance": "system", "codeHighlight": true },
  "minify": true,
  "autoTitleFromH1": true,
  "copyCode": true,
  "pageNavigation": true,
  "plugins": {
    "git": { "commitHistory": true, "maxCommits": 5 },
    "seo": { "defaultDescription": "Documentation built with docmd." }
  }
}
EOF
```

字段说明：

- `title`：站点标题，展示在页面 meta 和 header 里。
- `url`：暂时用占位符，只影响 sitemap / SEO / OKF 这几个插件的输出，不影响本地开发预览。等有正式部署域名之后再改成真实地址。
- `src` / `out`：源目录 `docs`、输出目录 `site`，保持默认。
- 去掉了默认的 `navigation` 数组：不写这个字段，docmd 会在构建时自动扫描 `docs/` 目录生成侧边栏导航，无需手动维护链接。

---

## 第 6 步：启动开发服务器验证

```bash
npx @docmd/core dev
```

打开浏览器访问 `http://127.0.0.1:3000/`，确认：

✅ 正常：首页正常显示，不再是 404，侧边栏能看到两篇笔记

❌ 异常：还是 404，回头检查 `docs/` 目录下是否真的有 `index.md`

---

## 以后怎么添加新笔记

以后新增笔记，只要把 `.md` 文件放进 `docs/` 目录，docmd 就会在下次构建/热更新时自动：

- 根据文件名生成访问路径（空格会被转成短横线，例如 `我的笔记.md` → `/我的笔记/`）
- 自动加入侧边栏导航（因为 `docmd.config.json` 里没有手写 `navigation` 字段）

不需要手动改配置文件。
