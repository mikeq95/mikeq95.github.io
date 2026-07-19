---
slug: 2026/06/19/macos-terminal-create-file
title: "📄 macOS 终端常用命令"
date: 2026-06-19
image: https://cdn.mikeq95blog.uk/coverimage/macos-terminal-commands-en-cn.png
tags:
  - macos
description: "一张速查卡：touch、mkdir -p、code、heredoc、cat 拼命令操作文件，比 Finder 右键快不少，批量建文件时效率提升明显。"
---

在 Mac 电脑上常用的几个命令：`touch`、`mkdir`、`code`、`cat`，`heredoc`(个人推荐)

{/* truncate */}

---

## touch

`touch` 可以新建文件

```bash
touch index.html
```

> 个人感觉这个命令很好用，比如你想写一个 md 文档，直接 `touch strawberry.md` 就行。

> StrawBerry!!!🍓

## mkdir

`mkdir` 是 "make directory" 的缩写，顾名思义就是建文件夹的命令：

```bash
mkdir components
```

> 等同你在finder上cmd + shift + N或者鼠标右键新建文件夹

### 加上 `-p`

`-p` 是 `--parents` 的缩写，意思是"连同父级目录一起处理"。一般用在两种情况：

**情况一：中间路径还不存在**，帮你自动补全。比如 `src` 还没建，直接跑 `mkdir src/pages/about` 会报错：

```bash
mkdir src/pages/about
# mkdir: src/pages: No such file or directory
```

加上 `-p`，缺的中间层会一并自动建出来：

```bash
mkdir -p src/pages/about
```

**情况二：文件夹已经存在，不会报错中断**。不带 `-p` 时，重复跑同一条命令会报错：

```bash
mkdir components   # 第一次跑，正常建好
mkdir components   # 再跑一次
# mkdir: components: File exists
```

如果这条命令写在脚本里，跑到这一步就会中断，影响后面的步骤。加上 `-p` 就不会有这个问题：

```bash
mkdir -p components   # 第一次跑，正常建好
mkdir -p components   # 再跑一次也不会报错，什么都不会发生
```

一句话总结：`-p` 让 `mkdir` 变得"傻瓜式安全"——不用管路径深不深、文件夹建过没建过，直接敲一条命令就完事。
> 实际写脚本、敲命令的时候基本都是 `mkdir -p` 连着打，很少有人单独用不带参数的 `mkdir`。

## code

`code` 是 [VS Code](https://clearlove7-ai.vercel.app?word=VS%20Code&postId=2026-06-19-macos-terminal-create-file) 提供的命令行入口，不是 macOS 自带的命令，需要先在 VS Code 里 `Cmd+Shift+P` 搜 `Shell Command: Install 'code' command in PATH` 装一次。

跑完下面这行，VS Code 会直接弹出来，文件不存在的话顺手帮你建好并打开——光标就停在空文件里，直接开始写代码：

```bash
code components/GradientText.jsx
```

## heredoc

"heredoc" 是 "here document" 的缩写——这一段就是文档内容，直接写在命令里，不用单独开文件。

```bash
cat > components/GradientText.jsx << 'EOF'
export default function GradientText() {
  return <span className="gradient-text">Hello</span>;
}
EOF
```

- `<< 'EOF'`：开始标记，意思是"往下读到下一个单独出现的 `EOF` 为止，都算内容"；带单引号能防止 `$变量` 之类被终端提前解析，写代码时基本都这么用
- 结束的 `EOF` 必须顶格单独一行，否则终端会一直等你输入

已有文件想追加而不是覆盖，把 `>` 换成 `>>` 即可。

**有啥用？**

你可以直接让 AI 用 heredoc 的命令帮你写一个文档，拿到命令之后直接粘贴到 terminal 回车运行。这可比鼠标点点点省事多了对吧。

## cat

`cat` 是 "concatenate"（连接、拼接）的缩写，最基础的用法是把文件内容打印到终端上：

```bash
cat test.txt
```

**有啥用？**

我觉得问 AI 的时候有点用吧，比如你可以开个终端，然后 `cat` 你看不懂的多个文档，它会输出到 terminal 上，然后 `Cmd + A` 丢给 AI。我认为这比直接把文件丢给 AI 省事、更快。

## 总结

这些都是我常用的，就这些。

只需要懂最基本的就行了，没必要懂很复杂的。

