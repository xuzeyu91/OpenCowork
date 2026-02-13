// ── Plugin System — Renderer-side Types ──
// Mirrors main process types for use in renderer

export interface ConfigFieldSchema {
  key: string
  label: string
  type: 'text' | 'secret'
  placeholder?: string
  required?: boolean
}

export interface PluginProviderDescriptor {
  type: string
  displayName: string
  description: string
  icon: string
  configSchema: ConfigFieldSchema[]
  defaultSystemPrompt?: string
}

export interface PluginInstance {
  id: string
  type: string
  name: string
  enabled: boolean
  userSystemPrompt: string
  config: Record<string, string>
  createdAt: number
}

export interface PluginMessage {
  id: string
  senderId: string
  senderName: string
  chatId: string
  chatName?: string
  content: string
  timestamp: number
  raw?: unknown
}

export interface PluginGroup {
  id: string
  name: string
  memberCount?: number
  raw?: unknown
}

export interface PluginIncomingEvent {
  type: 'incoming_message' | 'error' | 'status_change'
  pluginId: string
  pluginType: string
  data: unknown
}
