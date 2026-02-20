<p align="center">
  <h1 align="center">OpenCowork</h1>
  <p align="center">开源桌面 AI Agent 平台 — 让大模型真正动手干活</p>
</p>

---

OpenCowork 是一个基于 Electron + React + TypeScript 构建的桌面 AI Agent 应用。它不只是一个聊天界面，而是一个能让 LLM 调用文件系统、执行 Shell 命令、搜索代码、启动子 Agent、对接多平台消息插件的完整 Agent 工作台。

## 核心特性

### 🤖 完整的 Agent Loop

- 基于 AsyncGenerator 的流式 Agent 循环，支持多轮工具调用自动迭代
- 内置 10+ 工具：文件读写编辑（Read/Write/Edit）、Glob/Grep 搜索、Shell 执行、任务管理、定时任务、通知等
- 子 Agent 系统：内置 code-search、code-review、planner、cron-agent 四个专业子 Agent
- Agent 团队协作：Lead Agent 可并行启动多个 Teammate Agent，通过 MessageQueue 通信
- 上下文压缩：自动检测 token 阈值，智能压缩对话历史，支持长任务不断档

### 🔌 多平台消息插件

开箱即用的 IM 平台接入，将 AI Agent 能力直接投射到你的工作沟通场景：

| 平台 | 协议 | 状态 |
|------|------|------|
| 飞书 (Feishu/Lark) | Lark SDK WebSocket | ✅ 支持流式响应 |
| 钉钉 (DingTalk) | WebSocket | ✅ |
| Telegram | Bot API | ✅ |
| Discord | Gateway WebSocket | ✅ |
| WhatsApp | WebSocket | ✅ |
| 企业微信 (WeCom) | WebSocket | ✅ |

每个插件支持：
- **自动回复**：收到消息后自动触发 Agent Loop，带完整工具链
- **独立会话管理**：每个聊天对话独立 session，保持上下文连续
- **权限隔离**：插件级安全策略，限制文件访问范围和 Shell 执行权限
- **独立模型绑定**：每个插件可绑定不同的 AI Provider 和模型

### 💬 飞书 Bot 流式响应

OpenCowork 的飞书集成是一个亮点功能。基于飞书 CardKit API 实现了真正的流式响应体验：

**工作原理：**

1. 收到用户消息 → 通过 Lark SDK WebSocket 实时接收
2. 创建 CardKit 流式卡片（`streaming_mode: true`）→ 回复到聊天
3. Agent Loop 每产生一段文本 → 实时更新卡片内容（500ms 节流）
4. Agent 完成 → 最终内容写入卡片，流式结束

用户在飞书中看到的效果是：AI 的回答像打字一样逐步出现，而不是等待漫长的处理后一次性返回。

**效果展示：**

![飞书流式响应效果](images/1.jpg)

**额外能力：**
- 支持图片消息识别（多模态）：用户发送图片，Agent 可以理解图片内容
- 支持文件上传/下载：Agent 可以生成文件并直接发送到飞书聊天
- 群聊 @机器人 触发：群聊中仅在被 @mention 时响应，不打扰正常讨论
- 消息去重：防止 WebSocket 重连导致的重复处理

### 🧠 多 AI Provider 支持

- **Anthropic**（Claude 系列）
- **OpenAI Chat**（GPT 系列）
- **OpenAI Responses API**
- 支持自定义 Base URL，兼容各类 API 代理和中转服务
- 支持 Thinking/Reasoning 模式（深度思考）
- 按模型自动适配 token 上限和定价

### 🛠 技能系统 (Skills)

可扩展的技能模块，通过 Markdown 定义 + Python 脚本实现：

- **PDF 处理**：学术论文提取、法律条款搜索、数据表格提取、文档摘要
- **Web 爬虫**：动态页面抓取、链接提取、搜索引擎查询
- **小红书**：内容搜索、笔记创作发布
- **浏览器会话爬虫**：复用登录态抓取知乎、小红书等平台内容
- **微信 UI 自动化**：通过 UI 操作发送微信消息

### 📋 计划与任务管理

- **Plan 模式**：Agent 先制定计划再执行，支持用户审批
- **Todo 系统**：结构化任务追踪，实时显示进度
- **Cron 定时任务**：基于 node-cron 的持久化调度，支持自然语言创建定时任务

### 🔧 MCP 协议支持

集成 Model Context Protocol (MCP)，可连接外部 MCP Server 扩展 Agent 能力边界。

### 🎨 界面与体验

- 无边框窗口 + 系统托盘，桌面原生体验
- 深色/浅色主题切换
- 中英双语 i18n
- Monaco Editor 代码编辑器集成
- 文件预览系统：支持 PDF、Excel、Word、图片、Markdown
- 命令面板（cmdk）快速操作

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Electron + electron-vite |
| 前端 | React 19 + TypeScript 5 |
| 状态管理 | Zustand + Immer |
| 样式 | Tailwind CSS v4 + Radix UI |
| 数据库 | SQLite (better-sqlite3) WAL 模式 |
| AI SDK | @larksuiteoapi/node-sdk, @modelcontextprotocol/sdk |
| 动画 | Motion (Framer Motion) |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发环境（Electron + HMR）
npm run dev

# 类型检查
npm run typecheck

# 构建生产版本
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 项目结构

```
src/
├── main/              # Electron 主进程
│   ├── ipc/           # IPC 通信处理
│   ├── plugins/       # 消息平台插件
│   │   └── providers/ # 飞书/钉钉/Telegram/Discord/WhatsApp/企业微信
│   ├── db/            # SQLite 数据库
│   ├── cron/          # 定时任务调度
│   └── mcp/           # MCP Server 管理
├── renderer/          # React 前端
│   └── src/
│       ├── lib/
│       │   ├── agent/   # Agent Loop 核心
│       │   ├── api/     # AI Provider 适配
│       │   ├── tools/   # 工具实现
│       │   └── plugins/ # 插件前端逻辑
│       ├── stores/      # Zustand 状态管理
│       └── components/  # UI 组件
├── preload/           # Electron Preload Bridge
resources/
├── agents/            # 子 Agent 定义 (.md)
└── skills/            # 技能模块 (SKILL.md + scripts/)
```

---

## 📖 飞书 Bot 接入教程

> 🚧 **教程编写中** — 即将发布完整的飞书机器人配置指南
>
> 内容将包括：
> - 飞书开放平台创建应用
> - 配置 App ID 和 App Secret
> - 开启机器人能力和消息权限
> - 在 OpenCowork 中添加飞书插件
> - 流式响应和群聊 @机器人 配置
> - 常见问题排查
>
> 敬请期待，或在 Issues 中提出你的问题。

---

## License

MIT
