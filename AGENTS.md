# OpenCowork — Repository Guidelines & Architecture Reference

## 项目概述

OpenCowork 是一个基于 Electron 的桌面 AI Agent 协作平台，核心能力是让多个 AI Agent 在本地环境中协同工作——包括文件读写、Shell 命令执行、代码搜索/审查、任务规划以及多 Agent 并行团队协作。

---

## 核心技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 运行时 | Electron | 36.x |
| 构建 | electron-vite + Vite | 5.x / 7.x |
| 前端框架 | React | 19.x |
| 语言 | TypeScript (strict) | 5.9 |
| 样式 | Tailwind CSS 4 + shadcn/ui (new-york) | 4.1 |
| 组件库 | Radix UI + Lucide Icons + animate-ui | — |
| 状态管理 | Zustand 5 + Immer | 5.x / 11.x |
| 数据库 | better-sqlite3 (WAL 模式) | 12.x |
| 代码编辑器 | Monaco Editor | 0.55 |
| Markdown | react-markdown + remark-gfm + rehype-highlight | — |
| 动画 | Motion (Framer Motion) | 12.x |
| 打包 | electron-builder | 26.x |
| 其他 | nanoid, gpt-tokenizer, partial-json, cmdk, sonner, html-to-image, next-themes | — |

---

## 项目结构

```
OpenCowork/
├── src/
│   ├── main/                      # Electron 主进程
│   │   ├── index.ts               # 应用入口：窗口创建、IPC 注册、生命周期
│   │   ├── db/                    # SQLite 数据层
│   │   │   ├── database.ts        # 数据库初始化 (WAL, 建表, 迁移)
│   │   │   ├── sessions-dao.ts    # 会话 DAO
│   │   │   └── messages-dao.ts    # 消息 DAO
│   │   └── ipc/                   # IPC Handler 模块 (每个文件一个职责域)
│   │       ├── api-proxy.ts       # AI API HTTP/SSE 流式代理
│   │       ├── fs-handlers.ts     # 文件系统操作 (读写/glob/grep/watch)
│   │       ├── shell-handlers.ts  # Shell 命令执行 (支持超时/输出流)
│   │       ├── process-manager.ts # 长驻进程管理 (dev server)
│   │       ├── db-handlers.ts     # 数据库 IPC 桥接
│   │       ├── agents-handlers.ts # Agent 定义加载 (~/.open-cowork/agents/*.md)
│   │       ├── skills-handlers.ts # Skill 定义加载 (~/.open-cowork/skills/)
│   │       ├── settings-handlers.ts   # settings.json 读写
│   │       └── secure-key-store.ts    # config.json 读写 (API Key 等)
│   ├── preload/                   # Preload 脚本
│   │   ├── index.ts               # contextBridge 暴露 electron API
│   │   └── index.d.ts             # Window 类型声明
│   └── renderer/                  # 渲染进程 (React SPA)
│       └── src/
│           ├── App.tsx            # 应用根组件 (初始化 providers/tools/viewers)
│           ├── main.tsx           # React DOM 入口
│           ├── components/        # UI 组件
│           │   ├── chat/          # 聊天消息组件 (13 个)
│           │   ├── cowork/        # 协作面板组件 (8 个)
│           │   ├── layout/        # 布局组件 (8 个)
│           │   ├── settings/      # 设置组件 (5 个)
│           │   ├── ui/            # shadcn/ui 基础组件 (28 个)
│           │   └── animate-ui/    # 动画组件
│           ├── hooks/             # React Hooks
│           │   ├── use-chat-actions.ts  # 核心：驱动 Agent Loop 的 hook
│           │   ├── use-dev-server.ts    # Dev server 预览
│           │   ├── use-file-watcher.ts  # 文件变更监听
│           │   └── ...
│           ├── stores/            # Zustand 状态管理
│           │   ├── chat-store.ts      # 会话/消息 + DB 持久化
│           │   ├── agent-store.ts     # Agent 运行状态/工具调用/审批流
│           │   ├── team-store.ts      # 团队状态 (成员/任务/消息)
│           │   ├── provider-store.ts  # AI 供应商/模型管理
│           │   ├── settings-store.ts  # 用户设置
│           │   ├── ui-store.ts        # UI 状态 (面板/模式/预览)
│           │   ├── task-store.ts      # Todo 任务
│           │   ├── skills-store.ts    # Skills 列表
│           │   └── providers/         # 15+ 内置供应商预设
│           └── lib/               # 核心逻辑库
│               ├── agent/         # ★ Agent 系统核心
│               │   ├── agent-loop.ts          # Agentic Loop (AsyncGenerator)
│               │   ├── tool-registry.ts       # 工具注册表
│               │   ├── system-prompt.ts       # 系统提示词构建
│               │   ├── types.ts               # Agent 类型定义
│               │   ├── concurrency-limiter.ts # 信号量并发控制
│               │   ├── sub-agents/            # SubAgent 子系统
│               │   │   ├── registry.ts        # SubAgent 注册表
│               │   │   ├── runner.ts          # SubAgent 运行器
│               │   │   ├── create-tool.ts     # 统一 Task 工具创建
│               │   │   ├── types.ts           # SubAgent 类型
│               │   │   ├── events.ts          # SubAgent 事件总线
│               │   │   └── builtin/index.ts   # 内置 SubAgent 加载
│               │   └── teams/                 # Agent Teams 子系统
│               │       ├── teammate-runner.ts  # 队友独立运行器
│               │       ├── register.ts         # Team 工具注册
│               │       ├── types.ts            # Team 类型
│               │       ├── events.ts           # Team 事件总线
│               │       └── tools/              # 7 个团队工具
│               ├── tools/         # 工具实现
│               │   ├── index.ts           # 工具统一注册入口
│               │   ├── tool-types.ts      # ToolHandler / ToolContext 类型
│               │   ├── fs-tool.ts         # 文件操作 (Read/Write/Edit/LS)
│               │   ├── search-tool.ts     # 搜索 (Glob/Grep)
│               │   ├── bash-tool.ts       # Shell 执行
│               │   ├── todo-tool.ts       # 任务管理 (TodoWrite/TodoRead)
│               │   ├── skill-tool.ts      # Skill 加载工具
│               │   └── preview-tool.ts    # 文件预览工具
│               ├── api/           # AI API 适配层
│               │   ├── types.ts           # 统一类型系统
│               │   ├── provider.ts        # Provider 工厂
│               │   ├── index.ts           # Provider 注册入口
│               │   ├── anthropic.ts       # Anthropic API 适配
│               │   ├── openai-chat.ts     # OpenAI Chat API 适配
│               │   ├── openai-responses.ts # OpenAI Responses API 适配
│               │   ├── sse-parser.ts      # SSE 事件解析
│               │   └── generate-title.ts  # 会话标题自动生成
│               ├── ipc/           # IPC 通信层
│               │   ├── ipc-client.ts      # IPC 客户端封装
│               │   ├── api-stream.ts      # SSE 流式请求 (IPC → AsyncIterable)
│               │   ├── channels.ts        # IPC 通道常量
│               │   ├── ipc-storage.ts     # Zustand 持久化 → settings.json
│               │   └── config-storage.ts  # Zustand 持久化 → config.json
│               ├── preview/       # 文件预览系统
│               │   ├── viewer-registry.ts     # Viewer 注册表
│               │   ├── register-viewers.ts    # 内置 Viewer 注册
│               │   └── viewers/               # HTML/Spreadsheet/DevServer/Markdown
│               └── utils/         # 通用工具函数
├── resources/                     # 内置资源 (打包进应用)
│   ├── agents/                    # 内置 SubAgent 定义 (.md)
│   └── skills/                    # 内置 Skill 定义 (目录/SKILL.md)
├── build/                         # 构建资源 (图标/签名)
└── 配置文件                        # 见下方
```

---

## 核心架构详解

### 1. 三进程 Electron 架构

```
┌─────────────┐    contextBridge     ┌─────────────┐     IPC (invoke/send)    ┌─────────────┐
│  Renderer    │ ◄─────────────────► │   Preload    │ ◄──────────────────────► │    Main      │
│  (React UI)  │    window.electron  │  (Bridge)    │    ipcMain.handle()     │  (Node.js)   │
│              │                     │              │    ipcMain.on()         │              │
│  - Agent Loop│                     │              │                         │  - SQLite DB  │
│  - Stores    │                     │              │                         │  - File I/O   │
│  - Tools     │                     │              │                         │  - Shell      │
│  - UI        │                     │              │                         │  - API Proxy  │
└─────────────┘                     └─────────────┘                         └─────────────┘
```

- **主进程** (`src/main/`)：轻量级，仅负责窗口管理、IPC Handler 注册、SQLite 数据库、本地文件/Shell 操作和 HTTP 代理。
- **Preload** (`src/preload/`)：通过 `contextBridge.exposeInMainWorld` 安全暴露 `window.electron` API。
- **渲染进程** (`src/renderer/`)：承载全部 React UI 和 Agent 逻辑。Agent Loop 运行在渲染进程中，通过 IPC 调用主进程能力。

### 2. Agent Loop — 核心 Agentic 循环

```
用户消息 → [Send to LLM] → [Parse Stream] → 有 Tool Calls? ─Yes→ [Execute Tools] → [Append Results] ─┐
                                                    │                                                    │
                                                   No                                                    │
                                                    │                                                    │
                                                    ▼                                                    │
                                              返回最终文本 ◄─────────────────────────────────────────────┘
```

- **实现**: `agent-loop.ts` — `AsyncGenerator<AgentEvent>`，每个事件驱动 UI 更新
- **流式解析**: 支持 `text_delta`、`thinking_delta`、`tool_call_start/delta/end`
- **Partial JSON**: 使用 `partial-json` 库实时解析工具参数，UI 可在参数流式传输时渲染
- **中止控制**: 通过 `AbortSignal` 支持即时取消
- **消息队列**: `MessageQueue` 允许在 iteration 边界注入外部消息（Team 通信用）
- **审批流**: `onApprovalNeeded` 回调支持危险操作的用户审批

### 3. 工具系统 (Tool System)

**注册表模式** — `ToolRegistry` (Map-based, 插件化):

```typescript
interface ToolHandler {
  definition: ToolDefinition    // JSON Schema 定义
  execute: (input, ctx) => Promise<ToolResultContent>
  requiresApproval?: (input, ctx) => boolean
}
```

**内置工具**:
| 工具名 | 模块 | 功能 |
|--------|------|------|
| Read, Write, Edit, LS | `fs-tool.ts` | 文件读写/编辑/列目录 |
| Glob, Grep | `search-tool.ts` | 文件搜索/内容搜索 |
| Shell | `bash-tool.ts` | 命令行执行 |
| TodoWrite, TodoRead | `todo-tool.ts` | 任务计划管理 |
| Skill | `skill-tool.ts` | 加载预定义技能指令 |
| Preview | `preview-tool.ts` | 文件/服务器预览 |
| Task | `sub-agents/create-tool.ts` | 统一 SubAgent/Teammate 调度 |
| TeamCreate, TaskCreate, TaskUpdate, TaskList, SendMessage, TeamStatus, TeamDelete | `teams/tools/` | 团队管理 |

**注册顺序**: 基础工具 → Skills → SubAgents (Task) → Team 工具

**添加新工具**:
1. 在 `src/renderer/src/lib/tools/` 创建 `xxx-tool.ts`，实现 `ToolHandler`
2. 若需要主进程能力，先在 `src/main/ipc/` 添加 IPC Handler
3. 在 `src/renderer/src/lib/tools/index.ts` 的 `registerAllTools()` 中注册
4. 保持工具输入可序列化，在定义中注释预期副作用

### 4. SubAgent 子系统

SubAgent 是聚焦特定任务的轻量级 Agent，拥有独立的 system prompt 和受限的工具集。

**定义方式** — `~/.open-cowork/agents/*.md` (YAML frontmatter + Markdown body):
```yaml
---
name: CodeSearch
description: 搜索代码库中的模式和结构
icon: search
allowedTools: Read, Glob, Grep, LS
maxIterations: 8
---
[System Prompt 内容]
```

**架构**:
- `SubAgentRegistry` — 管理所有 SubAgent 定义
- `SubAgent Runner` — 运行内部 agent loop，继承父级 provider 配置
- 统一 `Task` 工具 — 通过 `subagent_type` 参数分发到不同 SubAgent
- `ConcurrencyLimiter` — 最多 2 个 SubAgent 同时运行
- 只读工具自动审批，写入工具冒泡到父级审批流
- 内置 SubAgent: **CodeSearch**, **CodeReview**, **Planner** (从 `resources/agents/` 初始化)

### 5. Agent Teams 多智能体协作系统

Teams 是项目最复杂的子系统，实现了类似 Claude Code agent-teams 的并行多 Agent 协作。

**协作流程**:
```
Lead Agent: TeamCreate → TaskCreate(×N) → Task(run_in_background=true, ×N) → 结束当前轮次
                                                     │
                                              ┌──────┴──────┐
                                              ▼              ▼
                                         Teammate A     Teammate B
                                         (独立 Loop)    (独立 Loop)
                                              │              │
                                              ▼              ▼
                                         Auto-claim     Auto-claim
                                         next task      next task
                                              │              │
                                              └──────┬───────┘
                                                     ▼
                                              SendMessage → Lead
                                              (自动通知完成)
```

**关键机制**:
- **Teammate Runner** (`teammate-runner.ts`): 独立 agent loop，fire-and-forget 模式
- **任务自动认领**: 完成当前任务后自动认领下一个未分配、无阻塞依赖的 pending 任务
- **自动通知**: 完成后自动通过 `SendMessage` 向 Lead 发送摘要
- **优雅关闭**: `shutdown_request` 让 teammate 在当前迭代完成后停止
- **消息注入**: `MessageQueue` 在 iteration 边界注入 teammate 间消息
- **并发控制**: 每个 Team 最多 2 个 teammate 同时运行 (Per-team `ConcurrencyLimiter`)
- **事件总线**: `teamEvents` EventEmitter 桥接 teammate 状态到 UI Store
- **Lead 自动触发**: teammate 完成消息通过 `drainLeadMessages` 自动触发 Lead 新一轮对话
- **安全限制**: teammate 不能使用 TeamCreate/TeamDelete/TaskCreate 等 Lead 专属工具

### 6. AI API 适配层

**统一类型系统** (`api/types.ts`):
- `UnifiedMessage`: 统一消息格式 (role/content/ContentBlock[])
- `StreamEvent`: 统一流式事件 (text_delta/thinking_delta/tool_call_*/message_end/error)
- `ProviderConfig`: 统一供应商配置
- `APIProvider` 接口: `sendMessage()` 返回 `AsyncIterable<StreamEvent>`

**三种 Provider 适配**:
- `anthropic.ts`: Anthropic Messages API (支持 extended thinking, prompt caching)
- `openai-chat.ts`: OpenAI Chat Completions API (支持 reasoning tokens)
- `openai-responses.ts`: OpenAI Responses API

**SSE 流式传输路径**:
```
Renderer (ipcStreamRequest) → IPC send → Main (api-proxy.ts) → HTTP/HTTPS 请求
                                                                      │
Renderer (AsyncIterable) ◄── IPC events ◄── Main (stream-chunk/end/error)
```

**内置供应商预设** (15+):
Anthropic, OpenAI, DeepSeek, Google, Moonshot, Qwen, SiliconFlow, OpenRouter, Azure OpenAI, Gitee AI, AntSK AI, Ollama, Xiaomi 等

### 7. 状态管理

所有 Store 使用 Zustand + Immer，通过自定义 `ipcStorage` / `configStorage` 持久化到主进程文件（而非 localStorage）。

| Store | 文件 | 职责 | 持久化目标 |
|-------|------|------|-----------|
| `useChatStore` | `chat-store.ts` | 会话/消息 CRUD、DB 持久化 | SQLite |
| `useAgentStore` | `agent-store.ts` | Agent 运行状态、工具调用、SubAgent 跟踪、审批流 | settings.json |
| `useTeamStore` | `team-store.ts` | 团队成员/任务/消息、历史 | settings.json |
| `useProviderStore` | `provider-store.ts` | AI 供应商 CRUD、模型管理、活跃选择 | config.json |
| `useSettingsStore` | `settings-store.ts` | 用户偏好 (主题/语言/温度/自动审批) | settings.json |
| `useUIStore` | `ui-store.ts` | 面板状态/模式切换/预览 | 无 (内存) |
| `useTaskStore` | `task-store.ts` | Todo 任务列表 | 无 (内存) |
| `useSkillsStore` | `skills-store.ts` | 可用 Skills 列表 | 无 (内存) |

### 8. UI 组件体系

**布局**: 无边框窗口 (`frame: false`) + 自定义标题栏 (`TopBar` / `WindowControls`)

```
┌──────────────────────────────────────────────────────┐
│  TopBar (自定义标题栏 + 窗口控制)                       │
├──────────┬───────────────────────┬───────────────────┤
│          │                       │                   │
│  App     │    Chat Area          │   Right Panel     │
│  Sidebar │    (MessageList +     │   (Steps/Team/    │
│  (会话)   │     InputArea)        │    Artifacts/     │
│          │                       │    Context/       │
│          │                       │    Skills/Files)  │
│          │                       │                   │
├──────────┴───────────────────────┴───────────────────┤
│  Detail Panel / Preview Panel (可选，覆盖式)            │
└──────────────────────────────────────────────────────┘
```

**组件分类**:
- **chat/** (13): 消息渲染 — AssistantMessage, UserMessage, ToolCallCard, SubAgentCard, TeamEventCard, ThinkingBlock, FileChangeCard, TodoCard, SkillsMenu 等
- **cowork/** (8): 协作面板 — StepsPanel, TeamPanel, TeammateCard, ArtifactsPanel, ContextPanel, FileTreePanel, PermissionDialog, SkillsPanel
- **layout/** (8): 框架 — Layout, AppSidebar, TopBar, RightPanel, DetailPanel, PreviewPanel, CommandPalette, WindowControls
- **settings/** (5): 设置 — SettingsPage, SettingsDialog, ProviderPanel, KeyboardShortcutsDialog
- **ui/** (28): shadcn/ui 基础组件 (new-york 风格, Radix UI 底层)

### 9. 文件预览系统

- `ViewerRegistry`: 可扩展的文件预览器注册表
- 内置 Viewer: HTML (iframe), Spreadsheet (CSV/TSV/XLS/XLSX), DevServer (iframe + port 检测), Markdown (react-markdown)
- 代码视图使用 Monaco Editor

### 10. Skill 系统

Skill 是预定义的专家脚本/指令，存储在 `~/.open-cowork/skills/{name}/SKILL.md`。

- 内置 Skills 从 `resources/skills/` 初始化到用户目录
- YAML frontmatter 中的 `description` 字段用于 AI 匹配
- Agent 通过 `Skill` 工具加载对应 Skill 内容作为执行指令
- Skill 具有 `workingDirectory`，脚本路径需要基于此目录解析

---

## 用户数据目录

```
~/.open-cowork/
├── data.db          # SQLite 数据库 (会话 + 消息)
├── settings.json    # Zustand 持久化状态 (设置/Agent/Team)
├── config.json      # 供应商 API Key 等敏感配置
├── agents/          # SubAgent 定义文件 (*.md)
└── skills/          # Skill 定义目录 ({name}/SKILL.md)
```

项目级工作流存储在 `.open-cowork/workflows/*.md`。

---

## 构建、测试和开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 electron-vite 热重载开发模式 |
| `npm run start` | 预览生产构建 |
| `npm run build` | TypeScript 类型检查 + 构建打包 |
| `npm run typecheck` | 运行 `typecheck:node` + `typecheck:web` |
| `npm run lint` | ESLint 检查 |
| `npm run format` | Prettier 格式化 |
| `npm run build:win` | Windows 平台构建 |
| `npm run build:mac` | macOS 平台构建 |
| `npm run build:linux` | Linux 平台构建 |

---

## 编码风格与命名规范

- 遵循 `.editorconfig`: UTF-8, LF 换行, 2 空格缩进
- **TypeScript everywhere**; 严格类型，避免 `any`
- **React 组件**: PascalCase (`SessionPanel`)
- **Hooks**: `use` 前缀 (`useChatActions`)
- **Stores**: camelCase + `Store` 后缀 (`chatStore`)
- **Agent/Tool 模块**: 集中在 `src/renderer/src/lib/agent/**` 和 `src/renderer/src/lib/tools/**`
- **类型导出**: 从 `tool-types.ts`、`types.ts` 统一导出，避免重复
- 提交前运行 `npm run lint` + `npm run format`

---

## 测试指南

- 当前依赖 TypeScript 类型检查 (`npm run typecheck`) 和手动 electron-vite 预览
- 添加自动化测试时：渲染进程测试放在 `src/renderer/src/__tests__/`，命名 `ComponentName.test.tsx`
- Agent 逻辑使用集成测试，mock IPC 边界
- 优先有意义的覆盖率而非百分比

---

## 提交与 PR 规范

- 使用祈使句、现在时 (`Add timing display`, `Fix IPC routing`)
- Subject ≤72 字符，Body 中详述原因
- PR 需要：变更描述、关联 Issue、UI 改动附截图/录屏、新脚本/配置迁移说明
- 合并前 rebase 到 `main`，确保 `lint`、`typecheck` 和平台构建通过

---

## 关键设计模式

### 注册表模式 (Registry Pattern)
贯穿整个项目的核心模式：
- `ToolRegistry` — 工具注册/执行
- `SubAgentRegistry` — SubAgent 定义注册
- `ViewerRegistry` — 文件预览器注册
- Provider 工厂 — AI API 适配器注册

均采用 `Map<string, Handler>` + `register()/get()/execute()` API。

### AsyncGenerator 事件流
Agent Loop 和 API Provider 均使用 `AsyncGenerator` 产出流式事件，UI 层通过 `for await...of` 消费。这种模式使得：
- 流式渲染（文本/工具参数逐步显示）
- 可中止（AbortSignal 传播）
- 可组合（SubAgent 嵌套 Agent Loop）

### 事件总线 (EventEmitter)
- `subAgentEvents`: SubAgent 进度事件 → agent-store
- `teamEvents`: Team 状态事件 → team-store → UI

### IPC 桥接的 StateStorage
Zustand 持久化通过自定义 `ipcStorage` / `configStorage` 委托给主进程文件系统，而非 localStorage。这确保了：
- 数据存储在用户可控的文件中
- API Key 等敏感信息不暴露在 DevTools 中
- 支持跨窗口数据一致性

### 并发控制
`ConcurrencyLimiter` (信号量模式) 限制：
- SubAgent: 全局最多 2 个同时运行
- Teammate: 每个 Team 最多 2 个同时运行
- 支持 AbortSignal 取消等待中的任务

---

## Request Format
- 必须使用中文
- 在做任何复杂的需求之前必须先收集足够的背景资料，然后深刻思考，再进行下一步
