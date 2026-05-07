# Changelog

All notable changes to this project will be documented in this file.

## [0.9.87] - 2026-05-07

### Added

- Added a new sidebar entry for drawing, with menu highlighting integrated so the feature is discoverable from the main navigation.
- Added streaming markdown incremental rendering support via `markstream-react` so LLM responses render only newly arrived content.
- Added clarify-prompt and AskUserQuestion flow improvements to make interactive follow-up questions more reliable.
- Added guarded session-clearing actions in the sidebar to reduce accidental destructive operations.

### Changed

- Aligned SSH workspace chrome with theme tokens for more consistent visual integration.
- Stabilized provider transport and image persistence in the main process to improve reliability during content handling.
- Improved chat prompt handling and refined the main user-interaction flow.

### Fixed

- Prevented the message list from auto-scrolling while `AskUserQuestion` is pending.

## [0.9.86] - 2026-05-07

### Added

- Added OpenAI image part support utilities and `request_debug` event type for richer streaming observability.
- Added model context length and max output token parsing so discovered model capabilities are reflected in provider settings.
- Added `request_debug` event emission in cron execution, image content filtering, and a 20-result cap on search tool output for consistency across environments.

### Changed

- Improved OpenAI chat provider with structured token usage tracking and image part support for more accurate streaming metadata.
- Normalized search result limits across SSH, local, and cron tool execution paths to cap at 20 results uniformly.

### Fixed

- Stopped auto-scroll when `AskUserQuestion` is pending, preventing the message list from jumping during user input prompts.
