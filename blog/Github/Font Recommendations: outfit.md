---
slug: 2026/09/10/outfit-fonts-github-project
title: Outfit，Google Fonts 上很多 SaaS 官网都在用的免费几何无衬线字体
date: 2026-09-10
tags: [github, open-source]
description: Outfit 是品牌自动化公司 outfit.io 找独立字体设计师 Rodrigo Fuenzalida 定制、以 SIL 开源协议免费发布的几何无衬线字体家族，9 个静态字重加一个可变字体文件，早已进了 Google Fonts。本文核对了仓库里实际的字重文件、下载渠道、Fonts In Use 上的真实使用案例，还给了 macOS 装字体和网页项目里用 @font-face 的具体步骤，源码仓库本身在 2025 年已经被归档只读。
---

{/* truncate */}

## 介绍

![outfit](https://cdn.mikeq95blog.uk/coverimage/outfit-documentation-image1.png)
[Outfit](https://github.com/Outfitio/Outfit-Fonts) 最早是品牌自动化公司 [outfit.io](https://outfit.io) 给自己定制的品牌字体，2021 年 8 月以 v1.0 版本开源发布，用的是 SIL 开源字体许可证（OFL 1.1）。这意味着任何人都能免费拿它做商业项目、修改甚至二次分发，不用付费也不用署名。

![Strawberry font](https://cdn.mikeq95blog.uk/coverimage/outfit-strawberry-fruits.png)
字体是几何无衬线风格，设计者是常驻智利圣地亚哥的独立字体设计师 [Rodrigo Fuenzalida](https://fontsinuse.com/type_designers/2910/rodrigo-fuenzalida)。outfit.io 官方账号在 X 上[发过一条帖子](https://x.com/outfitio/status/1462632932460347392)，说他们专门找 Rodrigo 定制了这套字体，做完之后直接通过 Google Fonts 免费开放下载。

> 我是如何发现这个字体的? 我看到minimax code，他们用的标题的这个字体，我感觉很喜欢，看起来不像是苹方，我就问chatgpt，它告诉我是outfit.

## 字重和获取方式

要最原始的字体文件，就去 [Outfit-Fonts 仓库](https://github.com/Outfitio/Outfit-Fonts)下载。`fonts/` 目录下按格式分了 `otf`、`ttf`、`variable`、`webfonts` 四个子目录，想要哪种格式直接进去拿对应文件，具体怎么装见下面两节。

> 直接安装variable,就是可变的的意思。

## 在 macOS 上安装

用字体册这个软件打开variable文件夹下的文件，安装就行。


## 效果展示

![effectsdemonstration](https://cdn.mikeq95blog.uk/coverimage/outfit-effects-demonstration.png)
Outfit 因为字形干净、比例统一。拿它用来做Logo文字很合适，很好看，很有美感，

## 相关字体

如果 Outfit 的几何感不是你想要的那种，同一批经常被拿来对比的免费几何无衬线字体还有 [Sora](https://github.com/sora-xor/sora-font) 和 [Space Grotesk](https://github.com/floriankarsten/space-grotesk)，两款都是 SIL 开源字体许可证（OFL 1.1）发布，可以免费商用。另一个常被直接拿来对比的是 [Manrope](https://github.com/davelab6/manrope)，同样是 OFL 协议。第三方字体对比站 [Font Alternatives](https://fontalternatives.com/compare/manrope-vs-outfit/) 的说法是，Manrope 在几何骨架上加了圆润处理，小写字母"a"和降部笔画带一点个性；Outfit 更纯粹地贴着几何比例走，不带这些"性格"细节。想要更中性、适合大段界面文案的选 Outfit，想要多一点辨识度可以看看 Manrope 或 Space Grotesk。

## 总结

Outfit 不是那种需要装环境、跑命令的项目，它就是一套字体文件，拿来就能用。唯一要花心思的地方是从上面三条获取渠道里挑一个适合自己项目的方式。仓库归档了，但作为一款字体它谈不上"过期"，现在依然能在不少网站的标题栏里看到它的身影。
