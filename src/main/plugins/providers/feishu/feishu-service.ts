import type {
  MessagingPluginService,
  PluginInstance,
  PluginEvent,
  PluginMessage,
  PluginGroup,
} from '../../plugin-types'
import { FeishuApi } from './feishu-api'

export class FeishuService implements MessagingPluginService {
  readonly pluginId: string
  readonly pluginType = 'feishu-bot'

  private api: FeishuApi
  private pollingTimer: NodeJS.Timeout | null = null
  private running = false
  private _instance: PluginInstance
  private _notify: (event: PluginEvent) => void

  constructor(instance: PluginInstance, notify: (event: PluginEvent) => void) {
    this._instance = instance
    this._notify = notify
    this.pluginId = instance.id
    this.api = new FeishuApi(instance.config.appId, instance.config.appSecret)
  }

  /** Access stored instance (for config refresh, reconnect, etc.) */
  get instance(): PluginInstance {
    return this._instance
  }

  /** Emit a plugin event to the renderer */
  protected emit(event: PluginEvent): void {
    this._notify(event)
  }

  async start(): Promise<void> {
    // Validate config before calling API
    const { appId, appSecret } = this._instance.config
    if (!appId || !appSecret) {
      throw new Error('Missing required config: App ID and App Secret must be provided')
    }
    // Validate token by fetching it
    await this.api.ensureToken()
    this.running = true
    // TODO: Start polling for incoming messages when event subscription is configured
    console.log(`[FeishuService] Started for plugin ${this.pluginId}`)
  }

  async stop(): Promise<void> {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer)
      this.pollingTimer = null
    }
    this.running = false
    console.log(`[FeishuService] Stopped for plugin ${this.pluginId}`)
  }

  isRunning(): boolean {
    return this.running
  }

  async sendMessage(chatId: string, content: string): Promise<{ messageId: string }> {
    return this.api.sendMessage(chatId, content)
  }

  async replyMessage(messageId: string, content: string): Promise<{ messageId: string }> {
    return this.api.replyMessage(messageId, content)
  }

  async getGroupMessages(chatId: string, count?: number): Promise<PluginMessage[]> {
    const messages = await this.api.getMessages(chatId, count)
    return messages.map((m) => ({
      id: m.message_id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      chatId,
      content: m.content,
      timestamp: parseInt(m.create_time, 10) || Date.now(),
      raw: m.raw,
    }))
  }

  async listGroups(): Promise<PluginGroup[]> {
    const chats = await this.api.listChats()
    return chats.map((c) => ({
      id: c.chat_id,
      name: c.name,
      memberCount: c.member_count,
      raw: c.raw,
    }))
  }
}

export function createFeishuService(
  instance: PluginInstance,
  notify: (event: PluginEvent) => void
): MessagingPluginService {
  return new FeishuService(instance, notify)
}
