import type {
  MessagingPluginService,
  PluginInstance,
  PluginEvent,
  PluginMessage,
  PluginGroup,
} from '../../plugin-types'
import { DingTalkApi } from './dingtalk-api'

export class DingTalkService implements MessagingPluginService {
  readonly pluginId: string
  readonly pluginType = 'dingtalk-bot'

  private api: DingTalkApi
  private pollingTimer: NodeJS.Timeout | null = null
  private running = false
  private _instance: PluginInstance
  private _notify: (event: PluginEvent) => void

  constructor(instance: PluginInstance, notify: (event: PluginEvent) => void) {
    this._instance = instance
    this._notify = notify
    this.pluginId = instance.id
    this.api = new DingTalkApi(instance.config.appKey, instance.config.appSecret)
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
    const { appKey, appSecret } = this._instance.config
    if (!appKey || !appSecret) {
      throw new Error('Missing required config: App Key and App Secret must be provided')
    }
    await this.api.ensureToken()
    this.running = true
    // TODO: Start Stream mode / event subscription for incoming messages
    console.log(`[DingTalkService] Started for plugin ${this.pluginId}`)
  }

  async stop(): Promise<void> {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer)
      this.pollingTimer = null
    }
    this.running = false
    console.log(`[DingTalkService] Stopped for plugin ${this.pluginId}`)
  }

  isRunning(): boolean {
    return this.running
  }

  async sendMessage(chatId: string, content: string): Promise<{ messageId: string }> {
    return this.api.sendMessage(chatId, content)
  }

  async replyMessage(messageId: string, content: string): Promise<{ messageId: string }> {
    // DingTalk reply needs conversation context — pass empty for now
    return this.api.replyMessage(messageId, content, '')
  }

  async getGroupMessages(chatId: string, count?: number): Promise<PluginMessage[]> {
    const messages = await this.api.getMessages(chatId, count)
    return messages.map((m) => ({
      id: m.messageId,
      senderId: m.senderId,
      senderName: m.senderName,
      chatId,
      content: m.content,
      timestamp: m.createTime,
      raw: m.raw,
    }))
  }

  async listGroups(): Promise<PluginGroup[]> {
    const groups = await this.api.listGroups()
    return groups.map((g) => ({
      id: g.openConversationId,
      name: g.name,
      memberCount: g.memberCount,
      raw: g.raw,
    }))
  }
}

export function createDingTalkService(
  instance: PluginInstance,
  notify: (event: PluginEvent) => void
): MessagingPluginService {
  return new DingTalkService(instance, notify)
}
