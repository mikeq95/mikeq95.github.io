---
slug: 2026/08/21/echo-loop-github-project
title: Echo Loop，一款把英语听说练成闭环的开源 App
date: 2026-08-21
tags:
  - github
  - English
description: "Echo Loop 是一款开源的英语听说训练 App，把精听、跟读、盲听、复述和间隔复习串成自动推进的闭环。这篇整理它的学习方法论、下载安装和从源码跑起来的方式。"
---

## 介绍

学英语的人多半有个通病：材料越存越多，练透的越来越少。播客订了一打，演讲收藏了一夹子，每段都是听个大概就划走，过两周再放还是懵。问题不在毅力，在流程——今天练哪段、先听几遍、什么时候看字幕、几天后复习，全要自己拿主意，光做决定就把人耗没了。

{/* truncate */}

---

Echo Loop 就是把这个决策过程接管掉的 App。它是一款开源的英语听说训练工具，把练透一段音频拆成精听、跟读、盲听、复述四个固定动作，首学结束再排七轮间隔复习，间隔从 6 小时一路拉长到两周，到点自动提醒。你只管打开 App 跟着走，不用再想"现在该干嘛"。

项目用 Flutter 写的，GitHub 上目前三千多个 star。README 里注明训练方法由中央民族大学外国语学院的老师指导设计，倒不算程序员拍脑袋。iOS 和 Android 都已上架，macOS 还在开发中。

上面这些不是我照抄 README——复习调度写在 `lib/database/enums.dart` 里，首学加七轮共八个阶段一目了然；生词和难句的闪卡复习接的是 FSRS 算法包来排期。流程算不算"科学"可以争论，但每个环节都摆在明面上，怎么算的、改在哪儿，代码里查得到。

> 收藏不等于学会。我的收藏夹可以作证。

---

## 安装环境

两条路，看你想要哪种。

**直接下载**。iOS 去 [App Store](https://apps.apple.com/app/id6760324074)，Android 上 [Google Play](https://play.google.com/store/apps/details?id=app.echoloop)，或者去 [release 页面](https://github.com/echo-loop/Echo-Loop/releases)直接下 APK。

注意，中国区 App Store 现在搜不到它——ICP 备案还在申请，应用暂时下架，大陆用户得切非中国区账号（美区、港区都行）才能装。

**从源码编译**。适合想看代码或者不信商店包的人，机器上要有 Flutter SDK 3.9.2 以上版本：

```bash
git clone https://github.com/echo-loop/Echo-Loop.git
cd Echo-Loop
cp .dev.env.template .dev.env
flutter pub get
dart run build_runner build   # 生成 Riverpod 相关代码
```

`.dev.env` 里最关键的是 Supabase 两项（`SUPABASE_URL` 和 `SUPABASE_PUBLISHABLE_KEY`），登录功能靠它，去 supabase.com 免费建个项目就能拿到。RevenueCat 的 key 只影响订阅，留空照样能跑。这个文件已经被 `.gitignore` 排除，真实密钥别手滑提交上去。

---

## 运行

连上设备（真机或模拟器都行）：

```bash
flutter run -d ios --dart-define-from-file=.dev.env      # iOS
flutter run -d android --dart-define-from-file=.dev.env  # Android
```

首次启动会先让你填一份学习问卷，然后进主界面。不登录也能直接练，账号相关的东西收在设置里。

练习从导入素材开始：批量导入本地音频，可以自带 SRT 字幕，也可以让 App 用内置的 whisper 模型离线转录生成字幕。素材就位后按下开始，流程自动往下推——先逐句精听，再跟着原声读（AI 评测会高亮你念对的词），然后关掉字幕盲听，最后用自己的话把段落复述出来。长难句会按意群切开降低门槛，卡壳的句子自动进难句收藏，等复习轮次里回炉。

至此，一段素材的首学就算完成，剩下的事交给复习排程：到点提醒，重练难句，七轮走完这段素材才算"毕业"。练到哪一句、学了多久都有记录，五分钟碎片时间也能接着上次的进度继续。

---

## 效果展示

（此处插入截图：导入音频界面，本地文件列表与字幕选项）

（此处插入截图：逐句精听界面，意群划分与难句标注）

（此处插入截图：跟读评测结果，命中词高亮）

官方在仓库里放了整套截图（`assets/screenshots/`），懒得自己截可以直接取用。

---

## AI-friendly

把下面这段丢给 Claude Code、Codex 这类 agent，它能自己把项目跑起来：

```text
帮我在本机把 Echo Loop（https://github.com/echo-loop/Echo-Loop）从源码构建并运行：

1. 检查 Flutter SDK 是否安装且版本 >= 3.9.2，缺了就按官网指引装好
2. git clone https://github.com/echo-loop/Echo-Loop.git 并进入目录
3. cp .dev.env.template .dev.env，然后向我要 SUPABASE_URL 和
   SUPABASE_PUBLISHABLE_KEY（我在 supabase.com 免费建项目提供）；
   GOOGLE_WEB_CLIENT_ID 与 REVENUECAT_* 留空即可
4. 执行 flutter pub get 和 dart run build_runner build
5. flutter devices 列出设备，让我选一台，然后执行：
   flutter run -d <设备ID> --dart-define-from-file=.dev.env
6. 启动成功后确认能看到学习问卷和导入音频入口
注意：.dev.env 含密钥，不要输出其内容，也不要提交到 git。
```

---

## 卸载和下次运行

手机上装的，直接删 App 就完事，学习记录都存本地，删了也就没了。源码编译的，删掉 clone 出来的目录即可；Flutter SDK 要是专为它装的、之后也没别的用途，可以顺手一起卸。

下次运行不用重头再来。目录还在的话：

```bash
cd Echo-Loop
flutter run -d ios --dart-define-from-file=.dev.env
```

依赖早就装好了，这条命令就是全部。

---

## 总结

Echo Loop 适合手里有具体材料、真心想把它们练成自己表达的人。它不帮你找素材——音频你自己带；它管的是之后的一切：拆句、排复习、盯进度。开源的好处在这里很实在，复习间隔怎么定、阶段怎么推进，源码里都查得到，不用担心是个黑盒。桌面版还在路上，移动端现在已经能完整走完整个循环。
