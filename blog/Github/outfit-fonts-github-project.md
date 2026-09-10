---
slug: 2026/09/10/outfit-fonts-github-project
title: Outfit，Google Fonts 上很多 SaaS 官网都在用的免费几何无衬线字体
date: 2026-09-10
tags: [github, open-source]
description: Outfit 是品牌自动化公司 outfit.io 找独立字体设计师 Rodrigo Fuenzalida 定制、以 SIL 开源协议免费发布的几何无衬线字体家族，9 个静态字重加一个可变字体文件，早已进了 Google Fonts。本文核对了仓库里实际的字重文件、下载渠道、Fonts In Use 上的真实使用案例，还给了 macOS 装字体和网页项目里用 @font-face 的具体步骤，源码仓库本身在 2025 年已经被归档只读。
---

{/* truncate */}

## 介绍

[Outfit](https://github.com/Outfitio/Outfit-Fonts) 最早是品牌自动化公司 [outfit.io](https://outfit.io) 给自己定制的品牌字体，2021 年 8 月以 v1.0 版本开源发布，用的是 SIL 开源字体许可证（OFL 1.1）。这意味着任何人都能免费拿它做商业项目、修改甚至二次分发，不用付费也不用署名。

字体是几何无衬线风格，设计者是常驻智利圣地亚哥的独立字体设计师 [Rodrigo Fuenzalida](https://fontsinuse.com/type_designers/2910/rodrigo-fuenzalida)。outfit.io 官方账号在 X 上[发过一条帖子](https://x.com/outfitio/status/1462632932460347392)，说他们专门找 Rodrigo 定制了这套字体，做完之后直接通过 Google Fonts 免费开放下载。仓库 README 里引用了排版理论家 Beatrice Warde 的一句话"typefaces are the clothes words wear"（字体是文字穿的衣服），跟 Outfit（穿搭）这个名字本身形成了一个双关。

仓库现在处于归档状态，2025 年 2 月被所有者标成只读。往前翻提交记录，最后一次实质更新是 2023 年 3 月的一次字形和字距调整，再早一次是 2022 年底那次——因为母公司 On Brand Investments 被 Smartsheet 收购，专门提交了一次更新版权信息。GitHub 上攒了 325 颗 star、25 个 fork。不过归档不等于过时——它照样在 Google Fonts 上正常提供下载，现在依然是不少网站在用的活跃字体，只是这个仓库本身不会再有新提交了。

## 字重和获取方式

Outfit 提供 9 个静态字重，从最细的 Thin（100）一路铺到最粗的 Black（900），中间依次是 Extra Light、Light、Regular、Medium、Semi Bold、Bold、Extra Bold。除了这 9 个固定字重的 otf/ttf 文件，仓库里还打包了一个可变字体（variable font），单个文件内置了 100 到 900 的连续字重轴，想做字重过渡动画或者想少加载几个文件的话，用这一个就够了。

想用这款字体，不用去仓库里翻文件，官方给了三条路。

最省事的是直接用 Google Fonts：打开 [Outfit 的 Google Fonts 页面](https://fonts.google.com/specimen/Outfit)，选好需要的字重，复制官方给的 `<link>` 标签或 `@import` 语句就能用，不用下载任何文件到本地。

如果项目走 npm 构建、想自己把字体文件打进项目里，可以用社区维护的 [Fontsource](https://fontsource.org/fonts/outfit) 包自托管，不依赖 Google 的 CDN：

```bash
npm install @fontsource/outfit
```

```js
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/700.css'
```

要最原始的字体文件，就去 [Outfit-Fonts 仓库](https://github.com/Outfitio/Outfit-Fonts)下载。`fonts/` 目录下按格式分了 `otf`、`ttf`、`variable`、`webfonts` 四个子目录，想要哪种格式直接进去拿对应文件，具体怎么装见下面两节。

注意，仓库最新的版本标签是 1.1，但里面其实还有一次 2023 年 3 月的字形修订没有对应打新标签，下载下来的文件已经包含这次更新。理论上和 Google Fonts、Fontsource 分发的是同一份内容，但如果这些平台之后又出现字体层面的小修订，这个已经归档的仓库不会跟着更新。

## 在 macOS 上安装

从仓库下载下来的是一个压缩包，解压后大概长这样：`~/Downloads/Outfit-Fonts-1.1/fonts/`。

### 用「字体册」安装

1. 打开 Finder，进入解压后的 `fonts/` 目录
2. 挑一种格式：日常用直接选 `variable/Outfit[wght].ttf`——可变字体，一个文件包含 Thin 到 Black 全部粗细，装这一个就够；如果要用的软件不支持可变字体（少数旧版设计、办公软件），就改用 `ttf/` 或 `otf/` 文件夹，把里面的静态字重文件全部选中一起装
3. 选中需要的文件后双击，或者右键选"打开方式"→"字体册"，会跳出 Font Book 的预览窗口
4. 点窗口左下角的"安装字体"

装完之后，重启一下正在用这款字体的软件（Word、Figma、Photoshop 这类），新字体才会出现在字体列表里。

### 命令行一次装完所有静态字重

不想点几次 Font Book 的话，直接把 `ttf/` 目录下的文件拷进系统字体目录也行：

```bash
cp ~/Downloads/Outfit-Fonts-1.1/fonts/ttf/*.ttf ~/Library/Fonts/
```

这样装完，每个字重会以独立字体名出现，比如 Outfit Thin、Outfit Bold。Windows 上更简单，双击字体文件、点"安装"就完事，不用额外找应用。

## 用在网页项目里

`webfonts/` 目录下是 `.woff2` 格式，不需要"安装"到系统，直接在项目里用 `@font-face` 引用：

```css
@font-face {
  font-family: 'Outfit';
  src: url('./fonts/Outfit-Regular.woff2') format('woff2');
  font-weight: 400;
}
```

这跟前面提到的 Fontsource 是两种路子——Fontsource 把引入和 npm 包管理都封装好了，这里是直接拿原始 woff2 文件自己接线，适合不想引入额外依赖、想自己控制到底加载哪几个字重的场景。

## 效果展示

（此处插入截图：Outfit 各字重的字形展示，或一个用 Outfit 做标题字体的网站截图）

Outfit 因为字形干净、比例统一，这几年在海外 SaaS 官网和品牌视觉设计里出现得很密集。设计案例站 [Fonts In Use](https://fontsinuse.com/typefaces/232248/outfit) 收录了好几个真实项目：设计工作室 Butter Creative Studio 给 Beztroskoc 做的品牌视觉拿到了编辑推荐（Staff Pick），Presentable、Curl Maven 这两个网站案例也是用它做的界面标题字体。

## 相关字体

如果 Outfit 的几何感不是你想要的那种，同一批经常被拿来对比的免费几何无衬线字体还有 [Sora](https://fonts.google.com/specimen/Sora) 和 [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)，都能在 Google Fonts 上免费拿到。另一个常被直接拿来对比的是 [Manrope](https://fonts.google.com/specimen/Manrope)。第三方字体对比站 [Font Alternatives](https://fontalternatives.com/compare/manrope-vs-outfit/) 的说法是，Manrope 在几何骨架上加了圆润处理，小写字母"a"和降部笔画带一点个性；Outfit 更纯粹地贴着几何比例走，不带这些"性格"细节。想要更中性、适合大段界面文案的选 Outfit，想要多一点辨识度可以看看 Manrope 或 Space Grotesk。

## 总结

Outfit 不是那种需要装环境、跑命令的项目，它就是一套字体文件，拿来就能用。唯一要花心思的地方是从上面三条获取渠道里挑一个适合自己项目的方式。仓库归档了，但作为一款字体它谈不上"过期"，现在依然能在不少网站的标题栏里看到它的身影。
