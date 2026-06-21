# StudyNotes

> Android 开发者的个人技术知识库，涵盖 Android、Kotlin、Flutter、算法、AI 工具等多个方向。
> 在线阅读：**https://heart-beats.github.io/StudyNotes/**

---

## 目录

- [关于本项目](#关于本项目)
- [内容分类](#内容分类)
- [本地预览](#本地预览)
- [技术栈](#技术栈)
- [License](#license)

---

## 关于本项目

这是我的编程学习笔记仓库，所有文章以 Markdown 格式存放，通过自动化脚本生成静态博客网站，部署在 GitHub Pages 上。

**在线访问：** [**https://heart-beats.github.io/StudyNotes/**](https://heart-beats.github.io/StudyNotes/)

---

## 内容分类

| 分类 | 说明 | 篇数 |
|------|------|------|
| 🤖 Android 开发 | JNI、WebView、Gradle、动画、混淆等 | 8 |
| ⚡ Android 进阶 | 架构模式、插件化、App 启动优化等 | 5 |
| 🦋 Flutter | Flutter 全栈开发，从基础到路由设计 | 14 |
| 📦 三方库解析 | Glide、Hilt、Shadow、Xposed 源码解析 | 4 |
| 🟣 Kotlin | 基础、Flow、类型推断、协程、Compose | 7 |
| 🔧 Groovy | Groovy 语言相关 | 1 |
| 🐍 Python | Python 语言相关 | 1 |
| 🦀 Rust | Rust 基础入门与开发环境搭建 | 2 |
| 🧮 算法与数据结构 | 排序、动态规划、LeetCode 高频题 | 13 |
| ✨ AI 工具 | AI 使用说明、Claude 配置、MCP、VibeCoding | 8 |
| 🌐 Web 开发 | Ajax、DOM、jQuery、JavaScript 核心知识 | 4 |
| 🔗 网络 | 网络相关基础 | 2 |
| 🔐 加解密 | 加解密算法与实战 | 1 |
| 🐧 Ubuntu | Linux 环境相关 | 3 |
| 📑 基础 | 编程基础 | 2 |

> 共 **114 篇**文章（含图片、思维导图、PPT 等非 Markdown 文件）

---

## 本地预览

```bash
# 克隆仓库
git clone git@github.com:Heart-Beats/StudyNotes.git
cd StudyNotes

# 用任意静态服务器打开，例如 Python
python -m http.server 8080
# 或 Node.js
npx serve .

# 浏览器访问 http://localhost:8080
```

> ⚠️ 仓库根目录的 `index.html` 即为博客入口，无需构建。

---

## 技术栈

| 技术 | 用途 |
|------|------|
| [marked.js](https://marked.js.org/) | Markdown 解析 |
| [highlight.js](https://highlightjs.org/) | 代码语法高亮 |
| [Mermaid](https://mermaid.js.org/) | 流程图 / 时序图渲染 |
| [JSZip](https://stuk.github.io/jszip/) | XMind 文件解析 |
| GitHub Pages | 免费静态托管 |

### 支持的文件格式

| 格式 | 渲染方式 |
|------|----------|
| `.md` | Markdown 解析渲染 |
| `.png` | 图片查看器 |
| `.xmind` | JSZip 解析为可折叠树形结构 |
| `.pptx` | Microsoft Office Online 在线预览 |
| `.drawio` | diagrams.net 在线渲染 |

---

## License

本文档内容仅供个人学习使用，转载请注明出处。
