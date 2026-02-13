// ── Plugin System — Shared Types ──

/** Config field schema for descriptor-driven UI */
export interface ConfigFieldSchema {
  key: string
  label: string
  type: 'text' | 'secret'
  placeholder?: string
  required?: boolean
}

/** Static metadata describing a plugin provider type */
export interface PluginProviderDescriptor {
  type: string
  displayName: string
  description: string
  icon: string
  configSchema: ConfigFieldSchema[]
  defaultSystemPrompt?: string
}

/** Persisted plugin instance configuration */
export interface PluginInstance {
  id: string
  type: string
  name: string
  enabled: boolean
  userSystemPrompt: string
  config: Record<string, string>
  createdAt: number
}

/** Normalized message format returned by all providers */
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

/** Normalized group/chat format */
export interface PluginGroup {
  id: string
  name: string
  memberCount?: number
  raw?: unknown
}

/** Events emitted by plugin services */
export interface PluginEvent {
  type: 'incoming_message' | 'error' | 'status_change'
  pluginId: string
  pluginType: string
  data: unknown
}

/** Incoming message event data */
export interface PluginIncomingMessageData {
  chatId: string
  senderId: string
  senderName: string
  content: string
  messageId: string
}

/** Runtime service interface — every messaging plugin must implement this */
export interface MessagingPluginService {
  readonly pluginId: string
  readonly pluginType: string

  // Lifecycle
  start(): Promise<void>
  stop(): Promise<void>
  isRunning(): boolean

  // Unified messaging operations
  sendMessage(chatId: string, content: string): Promise<{ messageId: string }>
  replyMessage(messageId: string, content: string): Promise<{ messageId: string }>
  getGroupMessages(chatId: string, count?: number): Promise<PluginMessage[]>
  listGroups(): Promise<PluginGroup[]>
}

/** Factory function type — registered per provider */
export type ServiceFactory = (
  instance: PluginInstance,
  notify: (event: PluginEvent) => void
) => MessagingPluginService
