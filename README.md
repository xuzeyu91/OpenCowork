# OpenCowork

<div align="center">

**Open-Source Alternative to Claude Cowork — AI Agent Desktop Collaboration Platform**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/AIDotNet/OpenCowork)](https://github.com/AIDotNet/OpenCowork/releases)
[![Electron](https://img.shields.io/badge/Electron-36+-blue.svg)](https://electronjs.org/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://typescriptlang.org/)

Inspired by [Claude Cowork](https://claude.com/blog/cowork-research-preview), OpenCowork brings AI agent collaboration to your desktop — with **any model**, **fully local data**, and **completely open source**.

[Download](https://github.com/AIDotNet/OpenCowork/releases) · [中文文档](README.zh-CN.md) · [Report Bug](https://github.com/AIDotNet/OpenCowork/issues) · [Request Feature](https://github.com/AIDotNet/OpenCowork/issues)

</div>

---

## 💡 Why OpenCowork?

[Claude Cowork](https://claude.com/blog/cowork-research-preview) showed us a powerful vision: AI that doesn't just chat — it **reads your files, executes commands, and gets work done**. But it's locked to Claude models, requires a $100+/month subscription, and sends data through the cloud.

**OpenCowork is the open-source answer:**

| | Claude Cowork | OpenCowork |
|---|---|---|
| **Open Source** | No | ✅ MIT License |
| **Price** | $100/mo+ (Claude Max) | Free |
| **Models** | Claude only | 13+ providers, any model |
| **Data** | Anthropic cloud | 100% local |
| **Platform** | macOS / Windows | Windows / Linux |
| **Multi-Agent** | No | ✅ Parallel team collaboration |
| **Extensible** | MCP connectors | Tools + Skills + SubAgents |

## ✨ Features

### 🤖 AI Agent System
- **13+ Built-in Providers**: OpenAI, Anthropic, Google, DeepSeek, OpenRouter, SiliconFlow, Qwen, Moonshot, Gitee AI, Azure OpenAI, Ollama, and more
- **Agentic Loop**: AI autonomously plans and executes multi-step tasks with tool calls
- **Sub-Agent Framework**: Specialized agents for code review, code search, and planning
- **Team Collaboration**: Multiple agents working in parallel on complex tasks
- **Real-time Streaming**: Live response streaming with partial JSON rendering

### �️ Built-in Tools
- **File Operations** — Read, Write, Edit, List directories
- **Code Search** — Glob file search + Grep content search (ripgrep-powered)
- **Shell Execution** — Run commands with approval workflow
- **Task Management** — Built-in todo list for tracking progress
- **Skills System** — Pre-built skills for PDF analysis, web scraping, and more
- **File Preview** — HTML, Markdown, Spreadsheet, Dev Server preview

### 🎨 Modern Desktop Experience
- **Three Modes**: Chat (quick Q&A), Cowork (file operations + tools), Code (full dev toolkit)
- **Dark / Light Themes** with system detection
- **Monaco Editor** (VS Code's editor) for code highlighting and diff
- **Session Management**: Multiple sessions, pinning, export, backup
- **Keyboard Shortcuts**: Full shortcut system for power users

### 🔒 Security
- **Tool Approval System**: Dangerous operations require explicit user approval
- **Local-Only Data**: All conversations and files stay on your machine
- **Secure Key Storage**: API keys stored in the main process, never exposed to web

## � Download

Get the latest release for your platform:

**➡️ [Download v0.1.3](https://github.com/AIDotNet/OpenCowork/releases/tag/0.1.3)**

| Platform | Format |
|----------|--------|
| Windows | `.exe` installer |
| Linux | `.AppImage`, `.deb` |

## 🚀 Quick Start

1. Download and install OpenCowork from the [Releases](https://github.com/AIDotNet/OpenCowork/releases) page
2. Open the app, press `Ctrl+,` to open Settings
3. Choose an AI provider and enter your API key
4. Select a working folder and start collaborating!

### Supported Providers

| Provider | Models |
|----------|--------|
| OpenAI | GPT-4o, o3, o4-mini |
| Anthropic | Claude Sonnet 4, Claude Opus 4 |
| Google | Gemini 2.5 Pro, Gemini 2.5 Flash |
| DeepSeek | DeepSeek V3, DeepSeek R1 |
| OpenRouter | 100+ models |
| SiliconFlow | Various open-source models |
| Qwen (Alibaba) | Qwen series |
| Moonshot (Kimi) | Moonshot models |
| Ollama | Any local model |
| Azure OpenAI | Enterprise OpenAI |
| Gitee AI | Chinese AI models |
| Xiaomi | MiLM models |
| Custom | Any OpenAI-compatible API |

## 🏗️ Development

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/AIDotNet/OpenCowork.git
cd OpenCowork
npm install
npm run dev
```

### Build

```bash
npm run build:win    # Windows
npm run build:linux  # Linux
```

## 📁 Project Structure

```
OpenCowork/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── db/              # SQLite database (WAL mode)
│   │   └── ipc/             # IPC handlers (fs, shell, api-proxy, etc.)
│   ├── preload/              # Context bridge
│   └── renderer/             # React frontend
│       └── src/
│           ├── components/   # UI components (chat, cowork, layout, settings)
│           ├── lib/
│           │   ├── agent/   # Agent loop, tool registry, sub-agents, teams
│           │   ├── api/     # LLM provider adapters
│           │   ├── tools/   # Built-in tools (fs, search, bash, todo, skill)
│           │   └── preview/ # File viewer system
│           ├── stores/      # Zustand state management
│           └── hooks/       # React hooks
├── resources/
│   ├── agents/              # Built-in sub-agent definitions (.md)
│   └── skills/              # Built-in skill definitions
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Electron 36 |
| Frontend | React 19 + TypeScript 5.9 |
| Build | electron-vite + Vite 7 |
| Styling | Tailwind CSS 4 + shadcn/ui + Radix UI |
| State | Zustand 5 + Immer |
| Database | better-sqlite3 (WAL mode) |
| Editor | Monaco Editor |
| Animation | Motion (Framer Motion) |
| Packaging | electron-builder |

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New session |
| `Ctrl+Shift+N` | New session in next mode |
| `Ctrl+1/2/3` | Switch to Chat/Cowork/Code mode |
| `Ctrl+B` | Toggle left sidebar |
| `Ctrl+Shift+B` | Toggle right panel |
| `Ctrl+L` | Clear current conversation |
| `Ctrl+D` | Duplicate current session |
| `Ctrl+P` | Pin/unpin current session |
| `Ctrl+Shift+C` | Copy conversation as markdown |
| `Ctrl+Shift+E` | Export current conversation |
| `Ctrl+Shift+A` | Toggle auto-approve tools |
| `Ctrl+Shift+D` | Toggle dark/light theme |
| `Escape` | Stop streaming |

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

[MIT License](LICENSE) — free to use, modify, and distribute.

## 🙏 Acknowledgments

- [Claude Cowork](https://claude.com/blog/cowork-research-preview) by Anthropic — the inspiration for this project
- [Electron](https://electronjs.org/) · [React](https://reactjs.org/) · [Tailwind CSS](https://tailwindcss.com/) · [Radix UI](https://www.radix-ui.com/)

---

<div align="center">

**Open Source · Free Forever · Built with ❤️**

[![GitHub stars](https://img.shields.io/github/stars/AIDotNet/OpenCowork.svg?style=social&label=Star)](https://github.com/AIDotNet/OpenCowork)
[![GitHub forks](https://img.shields.io/github/forks/AIDotNet/OpenCowork.svg?style=social&label=Fork)](https://github.com/AIDotNet/OpenCowork)

</div>
