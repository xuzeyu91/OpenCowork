import { registerTodoTools } from './todo-tool'
import { registerFsTools } from './fs-tool'
import { registerSearchTools } from './search-tool'
import { registerBashTools } from './bash-tool'
import { registerBuiltinSubAgents } from '../agent/sub-agents/builtin'
import { registerTeamTools } from '../agent/teams/register'
import { registerSkillTools } from './skill-tool'
import { registerPreviewTools } from './preview-tool'

/**
 * Register all built-in tools with the global tool registry.
 * Call this once at app initialization.
 *
 * SubAgents are registered AFTER regular tools because they
 * reference tool definitions from the registry.
 * Team tools are registered last.
 */
let _allToolsRegistered = false

export function registerAllTools(): void {
  if (_allToolsRegistered) return
  _allToolsRegistered = true

  registerTodoTools()
  registerFsTools()
  registerSearchTools()
  registerBashTools()
  registerSkillTools()
  registerPreviewTools()

  // SubAgents (registered as tools so the main agent can invoke them)
  registerBuiltinSubAgents()

  // Agent Team tools
  registerTeamTools()
}
