import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type { UnifiedMessage, ContentBlock, TextBlock, ThinkingBlock, ToolUseBlock } from '../lib/api/types'
import { ipcClient } from '../lib/ipc/ipc-client'
import { useAgentStore } from './agent-store'
import { useTeamStore } from './team-store'
import { useTaskStore } from './task-store'

export type SessionMode = 'chat' | 'cowork' | 'code'

export interface Session {
  id: string
  title: string
  icon?: string
  mode: SessionMode
  messages: UnifiedMessage[]
  createdAt: number
  updatedAt: number
  workingFolder?: string
  pinned?: boolean
}

// --- DB persistence helpers (fire-and-forget) ---

function dbCreateSession(s: Session): void {
  ipcClient.invoke('db:sessions:create', {
    id: s.id,
    title: s.title,
    icon: s.icon,
    mode: s.mode,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    workingFolder: s.workingFolder,
    pinned: s.pinned,
  }).catch(() => {})
}

function dbUpdateSession(id: string, patch: Record<string, unknown>): void {
  ipcClient.invoke('db:sessions:update', { id, patch }).catch(() => {})
}

function dbDeleteSession(id: string): void {
  ipcClient.invoke('db:sessions:delete', id).catch(() => {})
}

function dbClearAllSessions(): void {
  ipcClient.invoke('db:sessions:clear-all').catch(() => {})
}

function dbAddMessage(sessionId: string, msg: UnifiedMessage, sortOrder: number): void {
  ipcClient.invoke('db:messages:add', {
    id: msg.id,
    sessionId,
    role: msg.role,
    content: JSON.stringify(msg.content),
    createdAt: msg.createdAt,
    usage: msg.usage ? JSON.stringify(msg.usage) : null,
    sortOrder,
  }).catch(() => {})
}

function dbUpdateMessage(msgId: string, content: unknown, usage?: unknown): void {
  const patch: Record<string, unknown> = { content: JSON.stringify(content) }
  if (usage !== undefined) patch.usage = JSON.stringify(usage)
  ipcClient.invoke('db:messages:update', { id: msgId, patch }).catch(() => {})
}

function dbClearMessages(sessionId: string): void {
  ipcClient.invoke('db:messages:clear', sessionId).catch(() => {})
}

function dbTruncateMessagesFrom(sessionId: string, fromSortOrder: number): void {
  ipcClient.invoke('db:messages:truncate-from', { sessionId, fromSortOrder }).catch(() => {})
}

// --- Debounced message persistence for streaming ---

const _pendingFlush = new Map<string, ReturnType<typeof setTimeout>>()

function dbFlushMessage(sessionId: string, msg: UnifiedMessage, sortOrder: number): void {
  const key = msg.id
  const existing = _pendingFlush.get(key)
  if (existing) clearTimeout(existing)
  _pendingFlush.set(
    key,
    setTimeout(() => {
      _pendingFlush.delete(key)
      dbAddMessage(sessionId, msg, sortOrder)
    }, 500)
  )
}

function dbFlushMessageImmediate(sessionId: string, msg: UnifiedMessage, sortOrder: number): void {
  const existing = _pendingFlush.get(msg.id)
  if (existing) {
    clearTimeout(existing)
    _pendingFlush.delete(msg.id)
  }
  dbAddMessage(sessionId, msg, sortOrder)
}

// --- Store ---

interface ChatStore {
  sessions: Session[]
  activeSessionId: string | null
  _loaded: boolean

  // Initialization
  loadFromDb: () => Promise<void>

  // Session CRUD
  createSession: (mode: SessionMode) => string
  deleteSession: (id: string) => void
  setActiveSession: (id: string | null) => void
  updateSessionTitle: (id: string, title: string) => void
  updateSessionIcon: (id: string, icon: string) => void
  updateSessionMode: (id: string, mode: SessionMode) => void
  setWorkingFolder: (sessionId: string, folder: string) => void
  clearSessionMessages: (sessionId: string) => void
  duplicateSession: (sessionId: string) => string | null
  togglePinSession: (sessionId: string) => void
  restoreSession: (session: Session) => void
  clearAllSessions: () => void
  removeLastAssistantMessage: (sessionId: string) => string | null
  removeLastUserMessage: (sessionId: string) => void
  truncateMessagesFrom: (sessionId: string, fromIndex: number) => void
  replaceSessionMessages: (sessionId: string, messages: UnifiedMessage[]) => void

  // Message operations
  addMessage: (sessionId: string, msg: UnifiedMessage) => void
  updateMessage: (sessionId: string, msgId: string, patch: Partial<UnifiedMessage>) => void
  appendTextDelta: (sessionId: string, msgId: string, text: string) => void
  appendThinkingDelta: (sessionId: string, msgId: string, thinking: string) => void
  completeThinking: (sessionId: string, msgId: string) => void
  appendToolUse: (sessionId: string, msgId: string, toolUse: ToolUseBlock) => void
  updateToolUseInput: (sessionId: string, msgId: string, toolUseId: string, input: Record<string, unknown>) => void

  // Streaming state (per-session)
  streamingMessageId: string | null
  /** Per-session streaming message map — allows concurrent agents across sessions */
  streamingMessages: Record<string, string>
  setStreamingMessageId: (sessionId: string, id: string | null) => void

  // Helpers
  getActiveSession: () => Session | undefined
  getSessionMessages: (sessionId: string) => UnifiedMessage[]
}

interface SessionRow {
  id: string
  title: string
  icon: string | null
  mode: string
  created_at: number
  updated_at: number
  working_folder: string | null
  pinned: number
}

interface MessageRow {
  id: string
  session_id: string
  role: string
  content: string
  created_at: number
  usage: string | null
  sort_order: number
}

function rowToSession(row: SessionRow, messages: UnifiedMessage[] = []): Session {
  return {
    id: row.id,
    title: row.title,
    icon: row.icon ?? undefined,
    mode: row.mode as SessionMode,
    messages,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    workingFolder: row.working_folder ?? undefined,
    pinned: row.pinned === 1,
  }
}

function rowToMessage(row: MessageRow): UnifiedMessage {
  let content: string | ContentBlock[]
  try {
    content = JSON.parse(row.content)
  } catch {
    content = row.content
  }
  return {
    id: row.id,
    role: row.role as UnifiedMessage['role'],
    content,
    createdAt: row.created_at,
    usage: row.usage ? JSON.parse(row.usage) : undefined,
  }
}

export const useChatStore = create<ChatStore>()(
  immer((set, get) => ({
    sessions: [],
    activeSessionId: null,
    streamingMessageId: null,
    streamingMessages: {},
    _loaded: false,

    loadFromDb: async () => {
      try {
        const sessionRows = (await ipcClient.invoke('db:sessions:list')) as SessionRow[]
        const sessions: Session[] = []
        for (const row of sessionRows) {
          const msgRows = (await ipcClient.invoke('db:messages:list', row.id)) as MessageRow[]
          sessions.push(rowToSession(row, msgRows.map(rowToMessage)))
        }
        set((state) => {
          state.sessions = sessions
          state._loaded = true
          if (sessions.length > 0 && !state.activeSessionId) {
            state.activeSessionId = sessions[0].id
          }
        })
      } catch (err) {
        console.error('[ChatStore] Failed to load from DB:', err)
        set({ _loaded: true })
      }
    },

    createSession: (mode) => {
      const id = nanoid()
      const now = Date.now()
      const newSession: Session = {
        id,
        title: 'New Conversation',
        mode,
        messages: [],
        createdAt: now,
        updatedAt: now,
      }
      set((state) => {
        state.sessions.push(newSession)
        state.activeSessionId = id
      })
      dbCreateSession(newSession)
      useTaskStore.getState().clearTasks()
      return id
    },

    deleteSession: (id) => {
      set((state) => {
        const idx = state.sessions.findIndex((s) => s.id === id)
        if (idx !== -1) state.sessions.splice(idx, 1)
        if (state.activeSessionId === id) {
          state.activeSessionId = state.sessions[0]?.id ?? null
        }
        // Clean up per-session streaming state
        delete state.streamingMessages[id]
      })
      // Clean up agent-store per-session state
      useAgentStore.getState().setSessionStatus(id, null)
      useAgentStore.getState().clearSessionData(id)
      // Clean up team-store per-session state
      useTeamStore.getState().clearSessionTeam(id)
      dbDeleteSession(id)
    },

    setActiveSession: (id) => set((state) => {
      state.activeSessionId = id
      // Sync convenience field to the new active session's streaming state
      state.streamingMessageId = id ? (state.streamingMessages[id] ?? null) : null
    }),

    updateSessionTitle: (id, title) => {
      const now = Date.now()
      set((state) => {
        const session = state.sessions.find((s) => s.id === id)
        if (session) {
          session.title = title
          session.updatedAt = now
        }
      })
      dbUpdateSession(id, { title, updatedAt: now })
    },

    updateSessionIcon: (id, icon) => {
      const now = Date.now()
      set((state) => {
        const session = state.sessions.find((s) => s.id === id)
        if (session) {
          session.icon = icon
          session.updatedAt = now
        }
      })
      dbUpdateSession(id, { icon, updatedAt: now })
    },

    updateSessionMode: (id, mode) => {
      const now = Date.now()
      set((state) => {
        const session = state.sessions.find((s) => s.id === id)
        if (session) {
          session.mode = mode
          session.updatedAt = now
        }
      })
      dbUpdateSession(id, { mode, updatedAt: now })
    },

    setWorkingFolder: (sessionId, folder) => {
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId)
        if (session) session.workingFolder = folder
      })
      dbUpdateSession(sessionId, { workingFolder: folder })
    },

    togglePinSession: (sessionId) => {
      let pinned = false
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId)
        if (session) {
          session.pinned = !session.pinned
          pinned = session.pinned
        }
      })
      dbUpdateSession(sessionId, { pinned })
    },

    restoreSession: (session) => {
      set((state) => {
        state.sessions.push(session)
        state.activeSessionId = session.id
      })
      dbCreateSession(session)
      session.messages.forEach((msg, i) => dbAddMessage(session.id, msg, i))
    },

    clearAllSessions: () => {
      const ids = get().sessions.map((s) => s.id)
      set((state) => {
        state.sessions = []
        state.activeSessionId = null
      })
      // Clean up agent-store and team-store for all sessions
      const agentState = useAgentStore.getState()
      const teamState = useTeamStore.getState()
      for (const id of ids) {
        agentState.setSessionStatus(id, null)
        agentState.clearSessionData(id)
        teamState.clearSessionTeam(id)
      }
      dbClearAllSessions()
    },

    clearSessionMessages: (sessionId) => {
      const now = Date.now()
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId)
        if (session) {
          session.messages = []
          session.title = 'New Conversation'
          session.updatedAt = now
        }
      })
      dbClearMessages(sessionId)
      dbUpdateSession(sessionId, { title: 'New Conversation', updatedAt: now })
      useAgentStore.getState().setSessionStatus(sessionId, null)
      useAgentStore.getState().clearSessionData(sessionId)
      useTeamStore.getState().clearSessionTeam(sessionId)
      useTaskStore.getState().clearTasks()
    },

    duplicateSession: (sessionId) => {
      const source = get().sessions.find((s) => s.id === sessionId)
      if (!source) return null
      const newId = nanoid()
      const now = Date.now()
      const clonedMessages: UnifiedMessage[] = JSON.parse(JSON.stringify(source.messages))
      const newSession: Session = {
        id: newId,
        title: `${source.title} (copy)`,
        icon: source.icon,
        mode: source.mode,
        messages: clonedMessages,
        createdAt: now,
        updatedAt: now,
        workingFolder: source.workingFolder,
      }
      set((state) => {
        state.sessions.push(newSession)
        state.activeSessionId = newId
      })
      dbCreateSession(newSession)
      clonedMessages.forEach((msg, i) => dbAddMessage(newId, msg, i))
      return newId
    },

    removeLastAssistantMessage: (sessionId) => {
      const session = get().sessions.find((s) => s.id === sessionId)
      if (!session || session.messages.length === 0) return null
      const lastMsg = session.messages[session.messages.length - 1]
      if (lastMsg.role !== 'assistant') return null
      set((state) => {
        const s = state.sessions.find((s) => s.id === sessionId)
        if (s) s.messages.pop()
      })
      // Remove from DB: truncate from the last index
      const newLen = get().sessions.find((s) => s.id === sessionId)?.messages.length ?? 0
      dbTruncateMessagesFrom(sessionId, newLen)
      // Return the last user message text for retry
      const updated = get().sessions.find((s) => s.id === sessionId)
      const lastUser = updated?.messages.findLast((m) => m.role === 'user')
      return lastUser ? (typeof lastUser.content === 'string' ? lastUser.content : null) : null
    },

    removeLastUserMessage: (sessionId) => {
      const session = get().sessions.find((s) => s.id === sessionId)
      if (!session || session.messages.length === 0) return
      const lastMsg = session.messages[session.messages.length - 1]
      if (lastMsg.role !== 'user') return
      set((state) => {
        const s = state.sessions.find((s) => s.id === sessionId)
        if (s && s.messages.length > 0 && s.messages[s.messages.length - 1].role === 'user') {
          s.messages.pop()
        }
      })
      const newLen = get().sessions.find((s) => s.id === sessionId)?.messages.length ?? 0
      dbTruncateMessagesFrom(sessionId, newLen)
    },

    truncateMessagesFrom: (sessionId, fromIndex) => {
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId)
        if (session && fromIndex >= 0 && fromIndex < session.messages.length) {
          session.messages.splice(fromIndex)
          session.updatedAt = Date.now()
        }
      })
      dbTruncateMessagesFrom(sessionId, fromIndex)
      dbUpdateSession(sessionId, { updatedAt: Date.now() })
    },

    replaceSessionMessages: (sessionId, messages) => {
      const now = Date.now()
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId)
        if (session) {
          session.messages = messages
          session.updatedAt = now
        }
      })
      // Clear old DB messages and write new ones
      dbClearMessages(sessionId)
      messages.forEach((msg, i) => dbAddMessage(sessionId, msg, i))
      dbUpdateSession(sessionId, { updatedAt: now })
    },

    addMessage: (sessionId, msg) => {
      let sortOrder = 0
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId)
        if (session) {
          sortOrder = session.messages.length
          session.messages.push(msg)
          session.updatedAt = Date.now()
        }
      })
      dbAddMessage(sessionId, msg, sortOrder)
      dbUpdateSession(sessionId, { updatedAt: Date.now() })
    },

    updateMessage: (sessionId, msgId, patch) => {
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId)
        if (!session) return
        const msg = session.messages.find((m) => m.id === msgId)
        if (msg) Object.assign(msg, patch)
      })
      // Persist updated message
      const session = get().sessions.find((s) => s.id === sessionId)
      const msg = session?.messages.find((m) => m.id === msgId)
      if (msg) dbUpdateMessage(msgId, msg.content, msg.usage)
    },

    appendTextDelta: (sessionId, msgId, text) => {
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId)
        if (!session) return
        const msg = session.messages.find((m) => m.id === msgId)
        if (!msg) return

        if (typeof msg.content === 'string') {
          msg.content += text
        } else {
          // Find last text block or create one
          const blocks = msg.content as ContentBlock[]
          const lastBlock = blocks[blocks.length - 1]
          if (lastBlock && lastBlock.type === 'text') {
            ;(lastBlock as TextBlock).text += text
          } else {
            blocks.push({ type: 'text', text })
          }
        }
      })
      // Debounced persist for streaming
      const session = get().sessions.find((s) => s.id === sessionId)
      const msg = session?.messages.find((m) => m.id === msgId)
      const idx = session?.messages.indexOf(msg!) ?? 0
      if (msg) dbFlushMessage(sessionId, msg, idx)
    },

    appendThinkingDelta: (sessionId, msgId, thinking) => {
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId)
        if (!session) return
        const msg = session.messages.find((m) => m.id === msgId)
        if (!msg) return

        const now = Date.now()
        if (typeof msg.content === 'string') {
          // Convert empty string to block array with a thinking block
          msg.content = [{ type: 'thinking', thinking, startedAt: now }]
        } else {
          const blocks = msg.content as ContentBlock[]
          const lastBlock = blocks[blocks.length - 1]
          if (lastBlock && lastBlock.type === 'thinking') {
            ;(lastBlock as ThinkingBlock).thinking += thinking
          } else {
            blocks.push({ type: 'thinking', thinking, startedAt: now })
          }
        }
      })
      // Debounced persist
      const session = get().sessions.find((s) => s.id === sessionId)
      const msg = session?.messages.find((m) => m.id === msgId)
      const idx = session?.messages.indexOf(msg!) ?? 0
      if (msg) dbFlushMessage(sessionId, msg, idx)
    },

    completeThinking: (sessionId, msgId) => {
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId)
        if (!session) return
        const msg = session.messages.find((m) => m.id === msgId)
        if (!msg || typeof msg.content === 'string') return

        const blocks = msg.content as ContentBlock[]
        for (const block of blocks) {
          if (block.type === 'thinking' && !block.completedAt) {
            block.completedAt = Date.now()
          }
        }
      })
      // Immediate persist after thinking completes
      const session = get().sessions.find((s) => s.id === sessionId)
      const msg = session?.messages.find((m) => m.id === msgId)
      const idx = session?.messages.indexOf(msg!) ?? 0
      if (msg) dbFlushMessageImmediate(sessionId, msg, idx)
    },

    appendToolUse: (sessionId, msgId, toolUse) => {
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId)
        if (!session) return
        const msg = session.messages.find((m) => m.id === msgId)
        if (!msg) return

        if (typeof msg.content === 'string') {
          msg.content = [{ type: 'text', text: msg.content }, toolUse]
        } else {
          ;(msg.content as ContentBlock[]).push(toolUse)
        }
      })
      // Persist immediately for tool use blocks
      const session = get().sessions.find((s) => s.id === sessionId)
      const msg = session?.messages.find((m) => m.id === msgId)
      const idx = session?.messages.indexOf(msg!) ?? 0
      if (msg) dbFlushMessageImmediate(sessionId, msg, idx)
    },

    updateToolUseInput: (sessionId, msgId, toolUseId, input) => {
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId)
        if (!session) return
        const msg = session.messages.find((m) => m.id === msgId)
        if (!msg || typeof msg.content === 'string') return

        const block = (msg.content as ContentBlock[]).find(
          (b) => b.type === 'tool_use' && (b as ToolUseBlock).id === toolUseId
        ) as ToolUseBlock | undefined
        if (block) block.input = input
      })
      const session = get().sessions.find((s) => s.id === sessionId)
      const msg = session?.messages.find((m) => m.id === msgId)
      const idx = session?.messages.indexOf(msg!) ?? 0
      if (msg) dbFlushMessage(sessionId, msg, idx)
    },

    setStreamingMessageId: (sessionId, id) => set((state) => {
      if (id) {
        state.streamingMessages[sessionId] = id
      } else {
        delete state.streamingMessages[sessionId]
      }
      // Sync convenience field when updating the active session
      if (sessionId === state.activeSessionId) {
        state.streamingMessageId = id
      }
    }),

    getActiveSession: () => {
      const { sessions, activeSessionId } = get()
      return sessions.find((s) => s.id === activeSessionId)
    },

    getSessionMessages: (sessionId) => {
      const session = get().sessions.find((s) => s.id === sessionId)
      return session?.messages ?? []
    },
  }))
)
