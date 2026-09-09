---
slug: 2026/07/24/otty-terminal-app
title: Otty，一款为 AI 代码代理量身打造的原生终端
date: 2026-07-24
description: "Otty 是一款 GPU 加速的原生终端应用，专门针对 Claude Code、Codex 这类跑在终端里的代码代理做了适配。这篇记录一下它的定位、安装方式和主要功能。"
---

## 它是什么

[Otty](https://otty.sh) 是一款原生、GPU 加速的跨平台终端模拟器。定位介于"传统终端"和"完整的 Agent 开发环境"之间——既保留了终端本身简洁、键盘优先的操作方式，又针对终端里跑代理会话这件事做了专门设计。

> Designed for anyone who cares about the feel of every keystroke. Tuned for code agents you already run.

目前不是开源项目，[官网](https://otty.sh) 提供的是编译好的应用下载。

> 如果你是 M 芯片的 Mac，直接点击[下载链接](https://downloads.otty.sh/macos/Otty.dmg)就可以下载。

{/* truncate */}

---

## 官方文档怎么说

我看完了官方文档，这里给出一些总结——因为我知道大部分人懒得看。

### 首次启动要做的五件事

如果你是首次启动，文档里建议你做这些事情，分别是 Set On Launch、Set as Default Terminal、Install the Otty CLI、Change Theme、Install Agent Integration。

### CLI 装不上？这是我的解决办法

我觉得大家在安装 otty cli 时可能会遇到问题，比如我的，它显示这样：

![otty cli](https://cdn.mikeq95blog.uk/coverimage/Screenshot)

解决方法如下。

运行第一个：

```bash
sudo ln -sf "/Applications/Otty.app/Contents/MacOS/otty-cli" /usr/local/bin/otty
```

这行命令说人话就是：请管理员在公共命令抽屉里，强制做一个指向 Otty 真身的软链接，名字叫 otty。sudo 表示 superuser do，用管理员身份去做后面这件事情；ln 表示 link，做链接，相当于 Mac 上的快捷方式。为什么用 link 而不是 copy？因为 copy 出一份的话，虽然你还是可以正常打开，但是 otty 一更新，旧的文件还是旧的，会出问题。`-s` 这个参数中的 "s" 是 symbolic，软链接，就是快捷方式，指向真身，但不是复制一份；`-f` 的意思是 force。

> 一个问题来检验：上面的命令中，哪一个是真身，哪一个是快捷方式？（正确答案：前者为真身，后者快捷方式）

运行第二个：

```bash
otty completions zsh | sudo tee /usr/local/share/zsh/site-functions/_otty > /dev/null
```

completion（补全）说人话就是按 Tab 时候弹出的提示，`|` 是 pipe，把左边的输出送到右边当输入；tee 就像水管三通，一边写入文件，一边还可以在屏幕上再显示一份。

> 一个问题来检验：左边的 `otty completions zsh` 交出去的是什么？A. 一个会跑的程序 B. 一段文本（补全规则） C. 你的登录密码。正确答案是 B。

zsh 是啥？你打开终端，里面跟你对话的其实是 shell，也就是说，你打的 ls、cd 都交给 shell，然后 shell 去找真正的程序，zsh 就是一种 shell。你每次开一个 zsh 终端，它会自动加载一些配置文件，补全脚本就是其中一类：告诉它 otty 后面能跟哪些子命令。写进去之后，你打 otty 再按 Tab，它才知道该提示什么。

> 如果你使用的是 Mac 电脑，你的终端更可能是 zsh。

这两段总结一下：

1. `otty completions zsh` 打印一段"补全规则"文本。
2. `sudo tee` 把这段文本写进指定文件。
3. `> /dev/null` 是不再把内容显示在屏幕上一遍。

运行第三个：

```bash
otty completions bash | sudo tee /usr/local/etc/bash_completion.d/otty > /dev/null
```

> 不解释了，跟上一个一样。

验证一下装没装对：

```bash
which otty
```

敲完之后直接按回车，如果结果是 `/usr/local/bin/otty`，✅ 说明是对的。

或者你可以试试：

```bash
otty open ~/Documents
```

> 一个技巧可以帮你省下打字的时间：`~/Doc` + Tab → `Documents/`。

这个技巧不是 zsh 独有的，但我觉得 zsh 好用，别的 shell 看起来笨笨的，zsh 模糊一点也能帮你找出来。

至此，CLI 已经装好并且可以用了。

### otty cli 值不值得装

如果你不安装 CLI，那么其实把 otty 当作终端用完全没问题，CLI 的价值在于：我在别的 App、别的终端里，也可以派活给 otty。

### otty cli 常用命令

#### otty open [path] — 开新窗口

`otty open [path]` 具体来说可以展开成三个用处。

第一个就是快速打开窗口：先明确 `.` 表示这里，`..` 表示上一层，`~/` 表示家目录；如果你有具体的路径，直接 `otty open [路径]` 就行。

第二个是打开窗口快速干活，只需要在后面加上 `--command`。

> 你开新窗口时，有时希望它立刻跑 htop 或 vim，而不是空停在 shell。

这样写：

```bash
otty open [站哪] --command "要跑的命令"
```

比如 `otty open ~ --command "ls -la"`。

第三个，加上 `--title` 可以给窗口标题起名字，不改变它站哪，也不代替 `--command`：

```bash
otty open 位置 --command "命令" --title "名字"
```

#### otty read / edit — 把文件或网址开成窗格

只看用 `otty view`，如果你要修改用 `edit`——没有 `otty read`。

现在有个叫 README.md 的文件（`/Users/a1234/Desktop/README.md`），要读它就用 view（不是 read，otty 不用 read）：

```bash
otty view /Users/a1234/Desktop/README.md
```

`open` 会打开新窗口，但 `view` 不会，所以你要先打开 otty，然后再 view。也就是说，otty 没打开的话，你敲 `otty view README.md` 没有反应。

编辑这个文件：

```bash
otty edit /Users/a1234/Desktop/README.md
```

#### otty config — 改配置

先看文件在哪里：

```bash
otty config path
otty config get theme
```

修改 otty 的主题：

```bash
otty config set theme dracula --reload
# 如果没变的话，运行 otty config reload
```

#### otty font / theme / keybind — 外观与快捷键

列出所有 theme：

```bash
otty theme list
```

所有 dark 主题：

```bash
otty theme list --color dark
```

keybind：

```bash
otty keybind list --action tab
```

查看目前用的字体：

```bash
otty get config font-family
```

列出所有字体：

```bash
otty font list --monospace
```

#### otty windows / tabs / pane — 控制正在运行的界面

```bash
otty tab new --title monitor --command "echo hello-from-tab"
```

同一个标签里分屏（pane 是窗格的意思）：

```bash
otty pane split --right --command "echo hello-from-pane" --size 30
```

除此之外还有几个常用命令：

- `otty watch` 跑命令并且显示进度徽章
- `otty jump` 按常用目录跳转（像 [zoxide](https://github.com/ajeetdsouza/zoxide)）
- `otty learn` / `otty ignore`
- `otty import` / `otty export`

有两个习惯很重要：

1. 任何命令后面加 `-h` 看本命令帮助，比如 `otty open -h`
2. 想给脚本用，加 `--json`，比如 `otty panes --json`

直接敲 `otty` 会开图形窗口，和 [alacritty](https://alacritty.org/) 一样。

---

## 现代化的终端体验

支持编程连字（ligatures）、完整 Unicode、24 位真彩色、粗体/斜体/下划线等富文本样式，还能在终端里直接嵌入图片显示，配色方案可自定义、支持实时切换主题。

## 标签、窗格与会话恢复

一个窗口里可以开多个标签、拆分多个窗格，布局可以自由拖拽调整。关闭应用后再打开，窗格布局会按原样恢复，不用每次重新排列。

## 键盘优先的操作方式

内置命令面板（⌘⇧P）用来模糊搜索命令，⌘⇧O 用来在不同会话间快速跳转，另外还支持内联自动补全和自定义代码片段/快捷方式，官网的说法是"不用离开键盘就能拿到想要的东西"。

## 对代码代理的一级支持

这是 Otty 和普通终端最大的区别：对 Claude Code、Codex、OpenCode 提供了专门的适配，具体包括：

- 并排运行多个代理会话，同时监看每个任务的状态
- 追踪会话历史，支持对话分支
- 提示词队列和撰写工具
- 代理编辑代码时终端里带实时预览更新
- 把终端输出直接导入聊天上下文

配置方式上，Otty 用的是单个热重载配置文件，改完不用重启应用就能生效。

---

## 总结

如果日常工作流已经离不开在终端里跑 Claude Code、Codex 这类代理，Otty 提供的并行监看、会话历史和分支功能确实比裸终端方便不少；即便不用代理，单看 GPU 加速渲染、窗格管理和快捷键这些基础体验，也算是一款做得比较扎实的原生终端。目前只有 macOS 版本，跨平台还在等待名单阶段，想用 Windows/Linux 的话得再等等。
