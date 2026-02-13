import * as https from 'https'

const BASE_URL = 'https://open.feishu.cn'

interface HttpResponse {
  statusCode: number
  body: string
}

function request(
  method: string,
  path: string,
  headers: Record<string, string>,
  body?: string
): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL)
    const bodyBuffer = body ? Buffer.from(body, 'utf-8') : null
    const reqHeaders: Record<string, string> = { ...headers }
    if (bodyBuffer) {
      reqHeaders['Content-Length'] = String(bodyBuffer.byteLength)
      reqHeaders['Content-Type'] = 'application/json; charset=utf-8'
    }

    const req = https.request(
      {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let responseBody = ''
        res.on('data', (chunk: Buffer) => {
          responseBody += chunk.toString()
        })
        res.on('end', () => {
          resolve({ statusCode: res.statusCode ?? 0, body: responseBody })
        })
      }
    )

    req.on('error', reject)
    req.setTimeout(15000, () => {
      req.destroy()
      reject(new Error('Request timed out (15s)'))
    })

    if (bodyBuffer) req.write(bodyBuffer)
    req.end()
  })
}

// ── Feishu Open API Client ──

export class FeishuApi {
  private accessToken = ''
  private tokenExpiresAt = 0

  constructor(
    private appId: string,
    private appSecret: string
  ) {}

  /** Get or refresh tenant access token */
  async ensureToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    const res = await request(
      'POST',
      '/open-apis/auth/v3/tenant_access_token/internal',
      {},
      JSON.stringify({ app_id: this.appId, app_secret: this.appSecret })
    )

    const data = JSON.parse(res.body)
    if (data.code !== 0) {
      throw new Error(`Feishu auth failed: ${data.msg}`)
    }

    this.accessToken = data.tenant_access_token
    // Token expires in `expire` seconds, refresh 60s early
    this.tokenExpiresAt = Date.now() + (data.expire - 60) * 1000
    return this.accessToken
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const token = await this.ensureToken()
    return { Authorization: `Bearer ${token}` }
  }

  /** Send a message to a chat */
  async sendMessage(
    chatId: string,
    content: string,
    msgType = 'text'
  ): Promise<{ messageId: string }> {
    const headers = await this.authHeaders()
    const body = JSON.stringify({
      receive_id: chatId,
      msg_type: msgType,
      content: msgType === 'text' ? JSON.stringify({ text: content }) : content,
    })

    const res = await request(
      'POST',
      `/open-apis/im/v1/messages?receive_id_type=chat_id`,
      headers,
      body
    )

    const data = JSON.parse(res.body)
    if (data.code !== 0) {
      throw new Error(`Feishu sendMessage failed: ${data.msg}`)
    }
    return { messageId: data.data?.message_id ?? '' }
  }

  /** Reply to a specific message */
  async replyMessage(messageId: string, content: string): Promise<{ messageId: string }> {
    const headers = await this.authHeaders()
    const body = JSON.stringify({
      msg_type: 'text',
      content: JSON.stringify({ text: content }),
    })

    const res = await request(
      'POST',
      `/open-apis/im/v1/messages/${messageId}/reply`,
      headers,
      body
    )

    const data = JSON.parse(res.body)
    if (data.code !== 0) {
      throw new Error(`Feishu replyMessage failed: ${data.msg}`)
    }
    return { messageId: data.data?.message_id ?? '' }
  }

  /** List chats/groups the bot is in */
  async listChats(): Promise<
    Array<{ chat_id: string; name: string; member_count?: number; raw: unknown }>
  > {
    const headers = await this.authHeaders()
    const res = await request('GET', '/open-apis/im/v1/chats?page_size=50', headers)

    const data = JSON.parse(res.body)
    if (data.code !== 0) {
      throw new Error(`Feishu listChats failed: ${data.msg}`)
    }

    return (data.data?.items ?? []).map(
      (item: { chat_id: string; name: string; member_count?: number }) => ({
        chat_id: item.chat_id,
        name: item.name,
        member_count: item.member_count,
        raw: item,
      })
    )
  }

  /** Get messages from a chat */
  async getMessages(
    chatId: string,
    count = 20
  ): Promise<
    Array<{
      message_id: string
      sender_id: string
      sender_name: string
      content: string
      create_time: string
      raw: unknown
    }>
  > {
    const headers = await this.authHeaders()
    const res = await request(
      'GET',
      `/open-apis/im/v1/messages?container_id_type=chat&container_id=${chatId}&page_size=${count}`,
      headers
    )

    const data = JSON.parse(res.body)
    if (data.code !== 0) {
      throw new Error(`Feishu getMessages failed: ${data.msg}`)
    }

    return (data.data?.items ?? []).map(
      (item: {
        message_id: string
        sender: { sender_id: string; sender_type: string; tenant_key: string }
        body: { content: string }
        create_time: string
      }) => {
        let content = ''
        try {
          const parsed = JSON.parse(item.body?.content ?? '{}')
          content = parsed.text ?? item.body?.content ?? ''
        } catch {
          content = item.body?.content ?? ''
        }
        return {
          message_id: item.message_id,
          sender_id: item.sender?.sender_id ?? '',
          sender_name: '',
          content,
          create_time: item.create_time,
          raw: item,
        }
      }
    )
  }
}
