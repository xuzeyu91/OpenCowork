# Changelog

## [0.1.4] - 2026-02-14
### Added
- **Full MCP (Model Context Protocol) pipeline**: main process persistence, IPC endpoints, and a multi-connection manager so OpenCowork can talk to stdio, SSE, and streamable HTTP MCP servers.
- **Settings → MCP panel**: create, edit, and manage server configs with transport-aware forms, live capability refresh, and connection controls.
- **Chat composer awareness**: MCP servers now appear in the Skills menu and as inline badges, letting you toggle capabilities per session before sending a message.
- **Gitee AI preset refresh**: curated DeepSeek, Qwen, GLM, Kimi, MiniMax, ERNIE, and Hunyuan models with accurate token limits and thinking support flags.

### Changed
- README now positions OpenCowork as the open-source Claude Cowork alternative, adds a provider comparison table, and streamlines the download + quick start copy.
- Locales (EN + ZH) gained strings for the new MCP UX, ensuring consistent translations across chat and settings screens.

### Fixed
- Chat input warnings and badges now reliably reflect active providers, MCP servers, and context window usage so users see accurate execution state before running agent tasks.

---

> Older release notes will be backfilled in future updates once prior tags (0.1.0–0.1.3) are summarized.
