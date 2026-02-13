# OpenCowork

<div align="center">

**开源版 Claude Cowork — AI Agent 桌面协作平台**

[![许可证](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/AIDotNet/OpenCowork)](https://github.com/AIDotNet/OpenCowork/releases)
[![Electron](https://img.shields.io/badge/Electron-36+-blue.svg)](https://electronjs.org/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://typescriptlang.org/)

灵感源自 [Claude Cowork](https://claude.com/blog/cowork-research-preview)，OpenCowork 将 AI Agent 协作能力带到你的桌面——支持**任意模型**、**数据完全本地**、**完全开源免费**。

[下载安装](https://github.com/AIDotNet/OpenCowork/releases) · [English](README.md) · [报告问题](https://github.com/AIDotNet/OpenCowork/issues) · [功能建议](https://github.com/AIDotNet/OpenCowork/issues)

</div>

---

## 💡 为什么做 OpenCowork？

[Claude Cowork](https://claude.com/blog/cowork-research-preview) 展示了一个强大的愿景：AI 不只是聊天，而是**读取你的文件、执行命令、直接帮你完成工作**。但它绑定 Claude 模型、需要 $100+/月订阅、数据经过云端。

**OpenCowork 是开源的替代方案：**

| | Claude Cowork | OpenCowork |
|---|---|---|
| **开源** | 否 | ✅ MIT 许可证 |
| **价格** | $100/月起 (Claude Max) | 免费 |
| **模型** | 仅 Claude | 13+ 供应商，任意模型 |
| **数据** | Anthropic 云端 | 100% 本地 |
| **平台** | macOS / Windows | Windows / Linux |
| **多 Agent** | 无 | ✅ 并行团队协作 |
| **可扩展** | MCP 连接器 | 工具 + 技能 + SubAgent |

## ✨ 功能特性

### 🤖 AI 智能体系统
- **13+ 内置供应商**：OpenAI、Anthropic、Google、DeepSeek、OpenRouter、硅基流动、通义千问、Moonshot、Gitee AI、Azure OpenAI、Ollama 等
- **Agentic Loop**：AI 自主规划并执行多步骤任务，支持工具调用
- **子智能体框架**：内置代码审查、代码搜索、规划等专业 Agent
- **团队协作**：多个 Agent 并行协同处理复杂任务
- **实时流式传输**：响应实时流式渲染，支持 Partial JSON 解析

### �️ 内置工具
- **文件操作** — 读取、写入、编辑、列目录
- **代码搜索** — Glob 文件搜索 + Grep 内容搜索（ripgrep 驱动）
- **命令执行** — Shell 命令执行，配备审批工作流
- **任务管理** — 内置待办清单，跟踪工作进度
- **技能系统** — 预置 PDF 分析、网页抓取等技能
- **文件预览** — HTML、Markdown、表格、Dev Server 预览

### 🎨 现代桌面体验
- **三种模式**：聊天（快速问答）、协作（文件操作 + 工具）、编码（完整开发工具链）
- **深色 / 浅色主题**，自动检测系统设置
- **Monaco Editor**（VS Code 同款编辑器），代码高亮和 Diff 对比
- **会话管理**：多会话、固定、导出、备份
- **键盘快捷键**：完整的快捷键系统

### 🔒 安全性
- **工具审批系统**：危险操作需用户明确确认
- **数据完全本地**：所有对话和文件留在你的电脑上
- **安全密钥存储**：API Key 存储在主进程中，不暴露给网页层

## � 下载安装

获取最新版本：

**➡️ [下载 v0.1.3](https://github.com/AIDotNet/OpenCowork/releases/tag/0.1.3)**

| 平台 | 格式 |
|------|------|
| Windows | `.exe` 安装包 |
| Linux | `.AppImage`、`.deb` |

## 🚀 快速开始

1. 从 [Releases](https://github.com/AIDotNet/OpenCowork/releases) 页面下载并安装
2. 打开应用，按 `Ctrl+,` 进入设置
3. 选择 AI 供应商，填入 API Key
4. 选择工作目录，开始协作！

### 支持的供应商

| 供应商 | 模型 |
|--------|------|
| OpenAI | GPT-4o、o3、o4-mini |
| Anthropic | Claude Sonnet 4、Claude Opus 4 |
| Google | Gemini 2.5 Pro、Gemini 2.5 Flash |
| DeepSeek | DeepSeek V3、DeepSeek R1 |
| OpenRouter | 100+ 模型 |
| 硅基流动 | 各类开源模型 |
| 通义千问 | Qwen 系列 |
| Moonshot (Kimi) | Moonshot 模型 |
| Ollama | 任意本地模型 |
| Azure OpenAI | 企业级 OpenAI |
| Gitee AI | 国产 AI 模型 |
| 小米 | MiLM 模型 |
| 自定义 | 任何兼容 OpenAI API 的服务 |

## 🏗️ 开发

### 环境要求
- Node.js 18+
- npm

### 本地开发

```bash
git clone https://github.com/AIDotNet/OpenCowork.git
cd OpenCowork
npm install
npm run dev
```

### 构建

```bash
npm run build:win    # Windows
npm run build:linux  # Linux
```

## 📁 项目结构

```
OpenCowork/
├── src/
│   ├── main/                 # Electron 主进程
│   │   ├── db/              # SQLite 数据库 (WAL 模式)
│   │   └── ipc/             # IPC 处理器 (文件、Shell、API 代理等)
│   ├── preload/              # Context Bridge
│   └── renderer/             # React 前端
│       └── src/
│           ├── components/   # UI 组件 (聊天、协作、布局、设置)
│           ├── lib/
│           │   ├── agent/   # Agent Loop、工具注册表、子智能体、团队
│           │   ├── api/     # LLM 供应商适配器
│           │   ├── tools/   # 内置工具 (文件、搜索、Shell、任务、技能)
│           │   └── preview/ # 文件预览系统
│           ├── stores/      # Zustand 状态管理
│           └── hooks/       # React Hooks
├── resources/
│   ├── agents/              # 内置子智能体定义 (.md)
│   └── skills/              # 内置技能定义
```

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 运行时 | Electron 36 |
| 前端 | React 19 + TypeScript 5.9 |
| 构建 | electron-vite + Vite 7 |
| 样式 | Tailwind CSS 4 + shadcn/ui + Radix UI |
| 状态管理 | Zustand 5 + Immer |
| 数据库 | better-sqlite3 (WAL 模式) |
| 编辑器 | Monaco Editor |
| 动画 | Motion (Framer Motion) |
| 打包 | electron-builder |

## ⌨️ 键盘快捷键

| 快捷键 | 操作 |
|--------|------|
| `Ctrl+N` | 新建会话 |
| `Ctrl+Shift+N` | 在下一模式中新建会话 |
| `Ctrl+1/2/3` | 切换到聊天/协作/编码模式 |
| `Ctrl+B` | 切换左侧边栏 |
| `Ctrl+Shift+B` | 切换右侧面板 |
| `Ctrl+L` | 清除当前对话 |
| `Ctrl+D` | 复制当前会话 |
| `Ctrl+P` | 固定/取消固定当前会话 |
| `Ctrl+Shift+C` | 复制对话为 Markdown |
| `Ctrl+Shift+E` | 导出当前对话 |
| `Ctrl+Shift+A` | 切换自动审批工具 |
| `Ctrl+Shift+D` | 切换深色/浅色主题 |
| `Escape` | 停止流式传输 |

## 🤝 贡献

欢迎贡献！请：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 发起 Pull Request

## 📝 许可证

[MIT 许可证](LICENSE) — 免费使用、修改和分发。

## 🙏 致谢

- [Claude Cowork](https://claude.com/blog/cowork-research-preview) by Anthropic — 本项目的灵感来源
- [Electron](https://electronjs.org/) · [React](https://reactjs.org/) · [Tailwind CSS](https://tailwindcss.com/) · [Radix UI](https://www.radix-ui.com/)

---

<div align="center">

**完全开源 · 永久免费 · 用 ❤️ 打造**

[![GitHub stars](https://img.shields.io/github/stars/AIDotNet/OpenCowork.svg?style=social&label=Star)](https://github.com/AIDotNet/OpenCowork)
[![GitHub forks](https://img.shields.io/github/forks/AIDotNet/OpenCowork.svg?style=social&label=Fork)](https://github.com/AIDotNet/OpenCowork)

</div>
