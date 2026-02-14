# Changelog

All notable changes to **OpenCowork** will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/).

---

## [0.1.4] - 2026-02-14

### Added
- **MCP (Model Context Protocol) full pipeline** — main-process multi-connection manager supporting stdio, SSE, and streamable HTTP transports; IPC endpoints for lifecycle control; renderer-side tool bridge that injects MCP tools into the agent loop.
- **Settings → MCP panel** — create, edit, and manage MCP server configs with transport-aware forms, live capability refresh, and connection status controls.
- **Chat composer MCP awareness** — MCP servers appear in the Skills menu and as inline badges; users can toggle MCP capabilities per session before sending a message.
- **Gitee AI provider preset refresh** — curated DeepSeek, Qwen, GLM, Kimi, MiniMax, ERNIE, and Hunyuan models with accurate token limits and thinking support flags.
- **System prompt language injection** — agent system prompt now includes the user's selected language so AI responses match the UI locale.
- **Animated transitions component** (`animate-ui/transitions.tsx`) for smoother UI state changes.
- **Confirm dialog component** (`ui/confirm-dialog.tsx`) for destructive action confirmations.

### Changed
- README repositioned as the open-source Claude Cowork alternative; added provider comparison table, download links, and streamlined quick-start guide.
- Locales (EN + ZH) gained MCP-related strings, ensuring consistent translations across chat and settings screens.
- Settings page restructured with tabbed layout and expanded provider configuration.
- `AssistantMessage`, `ThinkingBlock`, `ToolCallCard`, and `FileChangeCard` components refactored for cleaner rendering and better streaming display.
- Layout simplified — `Layout.tsx` reduced by ~400 lines; panel logic extracted into dedicated components.
- Chat store enhanced with improved session management and message persistence.

### Fixed
- Chat input warnings and badges now reliably reflect active providers, MCP servers, and context window usage before running agent tasks.

---

## [0.1.3] - 2026-02-13

### Changed
- Removed macOS build target from GitHub Actions workflow due to code signing constraints.

---

## [0.1.2] - 2026-02-13

### Fixed
- Simplified GitHub Actions release handling — removed `release_id` output and streamlined release creation logic.
- Disabled electron-builder auto-publish to prevent premature artifact uploads.
- Fixed macOS code signing auto-discovery configuration.
- Removed snap target from Linux builds to reduce CI complexity.

---

## [0.1.1] - 2026-02-13

### Added
- Linux (AppImage / deb) build support in GitHub Actions workflow.

---

## [0.1.0] - 2026-02-13

First public release of OpenCowork.

### Added
- **Agentic Loop** — AsyncGenerator-based agent loop with streaming text, thinking, and tool-call events; abort control via `AbortSignal`; partial-JSON tool argument parsing for real-time UI rendering.
- **Tool System** — pluggable `ToolRegistry` with built-in tools: `Read`, `Write`, `Edit`, `LS`, `Glob`, `Grep`, `Bash`, `TodoWrite`, `TodoRead`, `Skill`, `Preview`.
- **SubAgent architecture** — `CodeSearch`, `CodeReview`, and `Planner` sub-agents loaded from Markdown definitions (`resources/agents/*.md`); dynamic user-defined agents from `~/.open-cowork/agents/`.
- **Agent Teams** — parallel multi-agent collaboration with `TeamCreate`, `SendMessage`, `TeamStatus`, `TeamDelete`; automatic task dispatch, dependency tracking, and teammate completion reporting.
- **Multi-provider AI support** — Anthropic, OpenAI (Chat + Responses API), and 15+ preset providers with SSE streaming proxy in the main process.
- **Skills system** — PDF analysis skills (academic, data-extract, legal) with Python extraction scripts; web-scraper skill; skill loading from `~/.open-cowork/skills/`.
- **SQLite persistence** — `better-sqlite3` in WAL mode for session and message storage with full DAO layer.
- **System prompt engine** — comprehensive prompt builder with environment detection, communication guidelines, tool-calling rules, code-change policies, task management, and workflow support.
- **Desktop UI** — Electron + React 19 + Tailwind CSS 4 + shadcn/ui (new-york); Monaco editor integration; Markdown rendering with syntax highlighting; motion animations.
- **Task management** — `TaskCreate`, `TaskGet`, `TaskUpdate`, `TaskList` tools with Zustand-backed task store.
- **File preview system** — viewer registry with HTML, Spreadsheet, DevServer, and Markdown viewers.
- **Token estimation** — client-side token counting via `gpt-tokenizer` for context window awareness.
- **Streaming shell output** — `spawn`-based shell execution with real-time stdout/stderr via IPC events.
- **Tool call UX** — execution timing display, output truncation (4 K chars), auto-expand for mutation tools, grep pattern highlighting.
- **Bilingual documentation** — `README.md` (EN) and `README.zh-CN.md` (ZH) with feature descriptions, architecture overview, and keyboard shortcuts.
- **`AGENTS.md`** — repository guidelines and architecture reference for AI-assisted development.
- **GitHub Actions CI** — automated Windows build and release workflow with version extraction from git tags.
