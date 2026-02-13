import { toolRegistry } from '../agent/tool-registry'
import type { ToolHandler, ToolContext } from '../tools/tool-types'
import { IPC } from '../ipc/channels'

// ── 5 Unified Plugin Tools ──
// All provider-agnostic — route via plugin_id to the correct backend service

async function execPlugin(
  ctx: ToolContext,
  pluginId: unknown,
  action: string,
  params: Record<string, unknown>
): Promise<string> {
  if (!pluginId || typeof pluginId !== 'string') {
    return JSON.stringify({ error: 'Missing or invalid plugin_id. Check the active plugins list.' })
  }
  try {
    const result = await ctx.ipc.invoke(IPC.PLUGIN_EXEC, { pluginId, action, params })
    return JSON.stringify(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return JSON.stringify({ error: `Plugin action "${action}" failed: ${msg}` })
  }
}

const pluginSendMessage: ToolHandler = {
  definition: {
    name: 'PluginSendMessage',
    description:
      'Send a message to a chat/group via a messaging plugin (Feishu, DingTalk, etc.). Requires approval.',
    inputSchema: {
      type: 'object',
      properties: {
        plugin_id: { type: 'string', description: 'The plugin instance ID to use' },
        chat_id: { type: 'string', description: 'The chat/group ID to send the message to' },
        content: { type: 'string', description: 'The message content to send' },
      },
      required: ['plugin_id', 'chat_id', 'content'],
    },
  },
  execute: async (input, ctx) => {
    return execPlugin(ctx, input.plugin_id, 'sendMessage', { chatId: input.chat_id, content: input.content })
  },
  requiresApproval: () => true,
}

const pluginReplyMessage: ToolHandler = {
  definition: {
    name: 'PluginReplyMessage',
    description:
      'Reply to a specific message via a messaging plugin. Requires approval.',
    inputSchema: {
      type: 'object',
      properties: {
        plugin_id: { type: 'string', description: 'The plugin instance ID to use' },
        message_id: { type: 'string', description: 'The message ID to reply to' },
        content: { type: 'string', description: 'The reply content' },
      },
      required: ['plugin_id', 'message_id', 'content'],
    },
  },
  execute: async (input, ctx) => {
    return execPlugin(ctx, input.plugin_id, 'replyMessage', { messageId: input.message_id, content: input.content })
  },
  requiresApproval: () => true,
}

const pluginGetGroupMessages: ToolHandler = {
  definition: {
    name: 'PluginGetGroupMessages',
    description: 'Get recent messages from a chat/group via a messaging plugin.',
    inputSchema: {
      type: 'object',
      properties: {
        plugin_id: { type: 'string', description: 'The plugin instance ID to use' },
        chat_id: { type: 'string', description: 'The chat/group ID to get messages from' },
        count: { type: 'number', description: 'Number of messages to retrieve (default 20)' },
      },
      required: ['plugin_id', 'chat_id'],
    },
  },
  execute: async (input, ctx) => {
    return execPlugin(ctx, input.plugin_id, 'getGroupMessages', { chatId: input.chat_id, count: input.count ?? 20 })
  },
}

const pluginListGroups: ToolHandler = {
  definition: {
    name: 'PluginListGroups',
    description: 'List all available groups/chats for a messaging plugin.',
    inputSchema: {
      type: 'object',
      properties: {
        plugin_id: { type: 'string', description: 'The plugin instance ID to use' },
      },
      required: ['plugin_id'],
    },
  },
  execute: async (input, ctx) => {
    return execPlugin(ctx, input.plugin_id, 'listGroups', {})
  },
}

const pluginSummarizeGroup: ToolHandler = {
  definition: {
    name: 'PluginSummarizeGroup',
    description:
      'Get recent messages from a group and provide them for summarization. Returns raw messages — you should summarize them in your response.',
    inputSchema: {
      type: 'object',
      properties: {
        plugin_id: { type: 'string', description: 'The plugin instance ID to use' },
        chat_id: { type: 'string', description: 'The chat/group ID to summarize' },
        count: {
          type: 'number',
          description: 'Number of recent messages to include (default 50)',
        },
      },
      required: ['plugin_id', 'chat_id'],
    },
  },
  execute: async (input, ctx) => {
    return execPlugin(ctx, input.plugin_id, 'getGroupMessages', { chatId: input.chat_id, count: input.count ?? 50 })
  },
}

const ALL_PLUGIN_TOOLS: ToolHandler[] = [
  pluginSendMessage,
  pluginReplyMessage,
  pluginGetGroupMessages,
  pluginListGroups,
  pluginSummarizeGroup,
]

let _registered = false

export function registerPluginTools(): void {
  if (_registered) return
  _registered = true
  for (const tool of ALL_PLUGIN_TOOLS) {
    toolRegistry.register(tool)
  }
}

export function unregisterPluginTools(): void {
  if (!_registered) return
  _registered = false
  for (const tool of ALL_PLUGIN_TOOLS) {
    toolRegistry.unregister(tool.definition.name)
  }
}

export function isPluginToolsRegistered(): boolean {
  return _registered
}
