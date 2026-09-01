---
slug: 2026/08/28/dujiaoka-github-project
title: 独角数卡（dujiaoka）：已停更的开源发卡系统
date: 2026-08-28
tags: [github, open-source, Ai-friendly]
description: 独角数卡（dujiaoka）是一款基于 Laravel 的开源自动售货系统，用来给虚拟商品自动发货，项目已在 2026 年 2 月停止维护并被归档，这篇文章根据官方文档和第三方评测整理它的部署方式与现状。
---

{/* truncate */}

> 如果你是新手小白，这篇文章提供了现成的 AI 提示词，可以帮你一键配置环境。

---

## 介绍

> 停更提醒：[dujiaoka](https://github.com/assimon/dujiaoka) 已经在 2026 年 2 月 12 日停止更新和维护，仓库目前是 archived 只读状态。作者 assimon 把开发重心转向了用 Go 重写的新项目 [Dujiao-Next](https://github.com/dujiao-next/dujiao-next)，README 首行现在也只剩一句"请前往新版"。这篇文章记录的是它停更之前的样子——是怎么设计的、按官方文档要怎么部署——如果是想现在从零搭一个发卡站，更值得先看看文末"相关项目和评价"里的继任版本。

买家在独角数卡搭的站上下单付款之后，系统自动把卡密、软件许可或者会员账号发出去，站长不用守在电脑前人工处理。项目基于 Laravel 框架搭建，后台管理套的是 laravel-admin，前端 UI 用 Bootstrap，走的是国内 PHP 生态里最主流的一套组合。GitHub 上目前有 1.2 万多个 star、2700 多个 fork，核心贡献者是 [iLay1678](https://github.com/iLay1678)。

前端模板可以整个换掉。官方自带 unicorn 模板，社区另外贡献了 luna 和 hyper 两套，分别由 [Julyssn](https://github.com/Julyssn) 和 [bimoe](https://github.com/bimoe) 维护，换个模板站点的观感就完全不一样，不用碰核心代码。支付渠道覆盖得也比较全，支付宝和微信这些国内常用方式都支持，也能接 PayPal、Stripe 收海外用户的钱，还有 V 免签这种不需要企业资质的免签方案。代码全部开源，扩展包都走 Composer 加载，用的是 MIT 协议。

---

## 安装环境

dujiaoka 已经停更，现在从零装一套 PHP 7.4 + MySQL + Redis + Supervisor 的环境意义有限，这一节没有真的搭起来跑一遍，是按官方 README、Wiki 和仓库自带的手动安装教程整理的。

官方给出的硬性要求不少：只支持 Linux（不支持虚拟主机，Windows 未测试也不建议用），PHP 加 PHP-CLI 版本要精确等于 7.4——不是"大于等于"，是必须一致，Nginx 要 1.16 以上，MySQL 5.6 以上，另外还要装好 Redis、Supervisor 和 Composer。PHP 这边要装好 `fileinfo`、`redis` 两个扩展，并且打开 `putenv`、`proc_open`、`pcntl_signal`、`pcntl_alarm` 这几个函数，不少云面板和虚拟主机默认是禁用这些函数的，得手动去 `php.ini` 里放开。

> 注意，`composer.json` 里声明的 PHP 版本范围其实是 `^7.2.5|^8.0`，看起来选择更宽，但官方文档、Dockerfile 用的 `webdevops/php-nginx:7.4` 镜像都钉死在 7.4，真要部署还是按文档说的来，不要被 `composer.json` 的宽松声明误导。

官方给了三条部署路径：不依赖面板的 Linux 手动安装、Docker 安装，还有宝塔面板一键流程（2.x 和 1.x 版本教程分开），都整理在项目 Wiki 里，项目停更之后这些教程不会再更新了。仓库自己还带了一份 `debian_manual.md`，是社区补的手动教程，针对不想用面板、想自己一步步配置的人，从装 Nginx、MariaDB、PHP 7.4、Redis 一路讲到配置 Supervisor，步骤写得比 Wiki 细。

至此，环境要求和几条部署路径已经理清楚，下面按仓库自带的手动教程和 Docker 配置文件，把实际运行的步骤过一遍。

---

## 运行

手动部署大致是把源码放到服务器目录、装依赖、配置 Nginx，最后打开浏览器走一遍安装向导。

代码克隆下来之后，用 Composer 装依赖：

```bash
git clone https://github.com/assimon/dujiaoka.git
cd dujiaoka
composer install
```

Nginx 配置要点：网站根目录指向 `public` 目录，PHP 请求转发到对应版本的 PHP-FPM socket（比如 `/var/run/php/php7.4-fpm.sock`），仓库自带的 `debian_manual.md` 里有一份完整的 vhost 配置可以直接抄。

配置弄对之后，浏览器打开域名会自动跳到 `/install` 安装向导——这条路由在 `routes/common/web.php` 里注册好了，会依次问数据库名、数据库密码、Redis 密码、网站 URL 这几项，填完自动写入 `.env`。装完还有两件事要手动收尾：把 `.env` 里的 `APP_DEBUG` 从 `true` 改成 `false`，如果站点开了 HTTPS，还要加一行 `ADMIN_HTTPS=true`，官方原话是"后台登录出现 0 error 大概率就是这个没配对"。

异步任务（比如支付回调、队列消息）走的是 Redis 队列，得配 Supervisor 常驻一个 worker 进程：

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/dujiaoka/artisan queue:work
autostart=true
autorestart=true
numprocs=1
```

配好之后跑 `supervisorctl reread && supervisorctl update && supervisorctl start laravel-worker:*` 让 worker 跑起来。

不想手动配这一整套的话，仓库也带了 `Dockerfile` 和 `docker-compose.yml`，基础镜像是 `webdevops/php-nginx:7.4`，容器启动脚本会自动跑 `composer install --ignore-platform-reqs`，再把 `queue:work` 和 `supervisord` 一起拉起来。`docker-compose.yml` 里特意把 `.env`、`install.lock`、`public/uploads` 挂载成宿主机卷，避免容器重建之后又要重新走一遍安装向导，上传的图片也不会跟着丢。

装完访问 `/admin` 路径就是后台管理入口，默认账号密码都是 `admin`，登录之后第一件事就是改密码。

至此，按官方文档整理的部署流程已经讲完。由于项目本身已经停更，上面这套流程没有实际跑通验证过，如果真要按这个教程部署，建议先看一眼仓库 Wiki 里的"问题锦集"，很多环境报错在那里能查到。

---

## 效果展示

这一节同样没有实际搭起来跑一遍，下面的截图描述来自官方 README 里贴出的三套模板预览图。

### unicorn 模板（官方默认）

首页是白底加独角兽线条 Logo 的简洁风格，顶部是文字 Logo、"首页"和"订单查询"导航，加一个商品搜索框。往下是分类筛选标签和商品卡片网格，每张卡片带独角兽图标占位图、价格、库存数量，还有"自动发货"或"人工处理"的状态标签，配一个蓝色"下单"按钮。

### luna 模板

单页布局更精简，左上角是 Logo 加"独角数卡"标题，右上角一个"订单查询"按钮。公告栏用红字标出重要提示，下面是分类选择卡片，会显示每个分类下的商品数量，商品用卡片形式列出价格阶梯（比如"满 2 个单价多少"）和库存进度条。

### hyper 模板

顶栏是深色导航，Logo 加"独角数卡"标题和一个搜索图标。页面主体是公告栏加分类标签，选中分类后下面用表格形式列商品，商品名称、类型、库存、价格、操作几列排开，"购买"按钮和售罄状态直接体现在表格里，跟前两套卡片式的布局风格不一样。

三套模板的信息密度和视觉风格差别不小，从卡片网格到列表式表格都有，选哪套更多是看个人喜好，功能上不影响自动发货这个核心逻辑。

---

## 相关项目和评价

dujiaoka 停更之后，最值得先看的是作者亲自主导的继任版本 [Dujiao-Next](https://github.com/dujiao-next/dujiao-next)。它用 Go 重写，后端换成 Gin + GORM，前端是 Vue + TypeScript，架构上做了前后端分离，默认数据库也从 MySQL 换成了 SQLite（可选 PostgreSQL），不再强制要求装 MySQL 和 Redis，部署门槛比旧版低不少。不过开源协议也从 MIT 换成了 GPL-3.0，目前 GitHub 上有 1000 多个 star，还在早期阶段，跟 dujiaoka 巅峰时期的体量没法比。

如果就是想留在 PHP 技术栈，[hiouttime/dujiaoka](https://github.com/hiouttime/dujiaoka) 是一个正在活跃开发的社区重构版，框架升级到了 Laravel 12、PHP 8.2+，后台管理换成了 Filament 3，新增了用户等级、购物车批量下单这些功能。它自己在 README 里标注"正在积极开发中，不建议用于生产环境"，现在还是技术预览阶段。

同类产品里，[ZFAKA](https://github.com/ZFAKA/ZFAKA) 定位和 dujiaoka 几乎一样，也支持 USDT 支付，不过体量小很多，目前一百多个 star，仍在正常维护。[acg-faka](https://github.com/lizhipay/acg-faka) 是二次元圈子里更常用的一套发卡系统，5500 多个 star，比 dujiaoka 少但也不算小众。另外还有 [card-system](https://github.com/Tai7sy/card-system)，是 Tai7sy 做的卡密商城系统，3000 多个 star，是国内另一个常见的开源发卡替代方案。

第三方的实际部署记录也能当参考。Verne 在自己的独立博客里[写过一篇 Dujiao-Next 的技术拆解](https://blog.einverne.info/post/2026/04/dujiao-next-digital-goods-selling-system.html)，他之前用过一段时间 dujiaoka，原话是"整体功能完整，但作为一个 PHP 项目，在部署和性能方面确实有一些让人头疼的地方"，文章里详细比较了新旧两版的技术选型和部署方式。老梁则在[博客里记录了自己在 zfaka 和 dujiaoka 之间选型的过程](https://laoliang.net/jsjh/news/7927.html)，最终选了 dujiaoka，理由是界面"比较简洁无各种颜色"，也贴出了具体的部署步骤。

社区讨论这边，[Nexmoe 在 X 上分享过用独角数卡一行指令部署发卡站的经历](https://x.com/nexmoe/status/1969239879599997250)，评论区还有人联想到更早的"彩虹发卡"。[叶学长在知乎写过一篇小白从零搭建独角数卡的踩坑记录](https://zhuanlan.zhihu.com/p/707483887)，提到自己因为服务器选得不好丢过数据和备份，同时也说"不管是界面还是功能都很完美，个人比较喜欢它的 UI"。[小宇在 X 上记录过自己实测卖了一个月虚拟商品的体验](https://x.com/xiaoyuboi/article/2067094007868694572)，包含收益核算和支付渠道打通的细节，不过这条内容主要针对的是停更后的 Dujiao-Next，不是原版 dujiaoka。

---

## 给 AI 编程助手的提示词

不想自己一步步查文档、配环境？把下面这段丢给 Claude Code 或 Codex，让它帮你把 dujiaoka 部署起来，跑通购买流程，或者说清楚为什么装不起来。

```text
## 目标
在一台 Linux 服务器上把 dujiaoka（github.com/assimon/dujiaoka）从源码部署起来，跑通"访问首页 → 后台登录"这条链路，或者说清楚为什么装不起来。

## 步骤
1. 确认只在 Linux 上装；PHP + PHP-CLI 必须精确是 7.4（不是更高版本），Nginx ≥ 1.16，MySQL ≥ 5.6，Redis、Supervisor、Composer 都要装好；PHP 侧确认 fileinfo、redis 扩展已装，且 php.ini 里 putenv、proc_open、pcntl_signal、pcntl_alarm 没被禁用，这是云面板常见的坑
2. 优先用仓库自带的 Dockerfile 和 docker-compose.yml，避免手动配环境反复踩坑；要手动装的话参考仓库根目录的 debian_manual.md
3. composer install 装依赖，Nginx 网站根目录指到 public 目录，PHP 请求转发到对应版本的 PHP-FPM
4. 浏览器打开站点域名，走 /install 安装向导，填数据库和 Redis 连接信息
5. 装完把 .env 里 APP_DEBUG 改成 false，站点用了 HTTPS 就加一行 ADMIN_HTTPS=true
6. 配 Supervisor 常驻 php artisan queue:work，处理支付回调这类异步任务
7. 项目已经归档停更，装的过程中遇到报错，先查仓库 Wiki 的"问题锦集"

## 核查结果
访问 /admin 确认能登录后台（默认账号密码都是 admin，登录后立刻改掉），前台首页能正常展示商品列表，队列 worker 进程（用 supervisorctl status 看一下）在正常运行，把结果贴给我确认。

具体命令、参数细节可以参考这篇文章核实：https://mikeq95blog.uk/blog/2026/08/28/dujiaoka-github-project
```

---

## 卸载和下次运行

卸载对应"安装环境"那节装了什么，这里就清掉什么：停掉 Supervisor 管的 worker 进程，删掉 MySQL 里对应的数据库；Docker 部署的话直接 `docker-compose down`，再删掉挂载的 `.env`、`install.lock`、`public/uploads` 这几个数据卷；手动部署的话把源码目录和 Nginx 的 vhost 配置一起清掉。

下次想再跑起来，不用重新走一遍装依赖和安装向导。Docker 部署直接 `docker-compose up -d`；手动部署确认 Nginx、PHP-FPM、Redis、Supervisor 这几个服务都在跑，再打开站点域名就行。

---

## 总结

独角数卡在停更之前，是国内个人站长搭发卡站最常被提起的选择之一，技术栈成熟、支付渠道覆盖广，前端模板还能整套换。但它现在已经归档，官方漏洞响应也一起停了，继续在生产环境用旧版有安全风险。如果是想现在从零搭一个发卡站，作者亲自维护的 Dujiao-Next 部署门槛更低，值得先看看；如果离不开 PHP 技术栈，hiouttime/dujiaoka 这类还在活跃开发的社区分支也是一个方向，只是目前还标注着不建议用于生产环境。这篇文章整理的部署流程本身没有实际跑通验证过，真要按它部署，多留意仓库 Wiki 的问题锦集，能少踩不少坑。
