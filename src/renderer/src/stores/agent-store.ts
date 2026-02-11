import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ToolCallState } from '../lib/agent/types'
import type { SubAgentEvent } from '../lib/agent/sub-agents/types'
import { ipcStorage } from '../lib/ipc/ipc-storage'

// Approval resolvers live outside the store — they hold non-serializable
// callbacks and don't need to trigger React re-renders.
const approvalResolvers = new Map<string, (approved: boolean) => void>()

interface SubAgentState {
  name: string
  toolUseId: string
  isRunning: boolean
  iteration: number
  toolCalls: ToolCallState[]
  streamingText: string
  startedAt: number
  completedAt: number | null
}

export type { SubAgentState }

interface AgentStore {
  isRunning: boolean
  currentLoopId: string | null
  pendingToolCalls: ToolCallState[]
  executedToolCalls: ToolCallState[]

  /** Per-session agent running state for sidebar indicators */
  runningSessions: Record<string, 'running' | 'completed'>

  // SubAgent state keyed by toolUseId (supports multiple same-name SubAgent calls)
  activeSubAgents: Record<string, SubAgentState>
  /** Completed SubAgent results keyed by toolUseId — survives until clearToolCalls */
  completedSubAgents: Record<string, SubAgentState>
  /** Historical SubAgent records — persisted across agent runs */
  subAgentHistory: SubAgentState[]

  /** Tool names approved by user during this session — auto-approve on repeat */
  approvedToolNames: string[]
  addApprovedTool: (name: string) => void

  setRunning: (running: boolean) => void
  setCurrentLoopId: (id: string | null) => void
  /** Update per-session status. 'completed' auto-clears after ~3 s. null removes entry. */
  setSessionStatus: (sessionId: string, status: 'running' | 'completed' | null) => void
  addToolCall: (tc: ToolCallState) => void
  updateToolCall: (id: string, patch: Partial<ToolCallState>) => void
  clearToolCalls: () => void
  abort: () => void

  // SubAgent events
  handleSubAgentEvent: (event: SubAgentEvent) => void

  // Approval flow
  requestApproval: (toolCallId: string) => Promise<boolean>
  resolveApproval: (toolCallId: string, approved: boolean) => void
  /** Resolve all pending approvals as denied and clear pendingToolCalls (e.g. on team delete) */
  clearPendingApprovals: () => void
}

export const useAgentStore = create<AgentStore>()(
  persist(
  immer((set) => ({
    isRunning: false,
    currentLoopId: null,
    pendingToolCalls: [],
    executedToolCalls: [],
    runningSessions: {},
    activeSubAgents: {},
    completedSubAgents: {},
    subAgentHistory: [],
    approvedToolNames: [],

    setRunning: (running) => set({ isRunning: running }),

    setCurrentLoopId: (id) => set({ currentLoopId: id }),

    setSessionStatus: (sessionId, status) => {
      set((state) => {
        if (status) {
          state.runningSessions[sessionId] = status
        } else {
          delete state.runningSessions[sessionId]
        }
      })
      // Auto-clear 'completed' after 3 seconds
      if (status === 'completed') {
        setTimeout(() => {
          set((state) => {
            if (state.runningSessions[sessionId] === 'completed') {
              delete state.runningSessions[sessionId]
            }
          })
        }, 3000)
      }
    },

    addToolCall: (tc) => {
      set((state) => {
        // Idempotent: if already exists (e.g. from streaming phase), update in-place
        const execIdx = state.executedToolCalls.findIndex((t) => t.id === tc.id)
        if (execIdx !== -1) {
          if (tc.status === 'pending_approval') {
            // Move from executed → pending
            const [moved] = state.executedToolCalls.splice(execIdx, 1)
            Object.assign(moved, tc)
            state.pendingToolCalls.push(moved)
          } else {
            Object.assign(state.executedToolCalls[execIdx], tc)
          }
          return
        }
        const pendIdx = state.pendingToolCalls.findIndex((t) => t.id === tc.id)
        if (pendIdx !== -1) {
          if (tc.status !== 'pending_approval') {
            // Move from pending → executed
            const [moved] = state.pendingToolCalls.splice(pendIdx, 1)
            Object.assign(moved, tc)
            state.executedToolCalls.push(moved)
          } else {
            Object.assign(state.pendingToolCalls[pendIdx], tc)
          }
          return
        }
        // New entry
        if (tc.status === 'pending_approval') {
          state.pendingToolCalls.push(tc)
        } else {
          state.executedToolCalls.push(tc)
        }
      })
    },

    updateToolCall: (id, patch) => {
      set((state) => {
        const pending = state.pendingToolCalls.find((t) => t.id === id)
        if (pending) {
          Object.assign(pending, patch)
          if (patch.status && patch.status !== 'pending_approval') {
            const idx = state.pendingToolCalls.findIndex((t) => t.id === id)
            if (idx !== -1) {
              const [moved] = state.pendingToolCalls.splice(idx, 1)
              state.executedToolCalls.push(moved)
            }
          }
          return
        }
        const executed = state.executedToolCalls.find((t) => t.id === id)
        if (executed) Object.assign(executed, patch)
      })
    },

    addApprovedTool: (name) => {
      set((state) => {
        if (!state.approvedToolNames.includes(name)) {
          state.approvedToolNames.push(name)
        }
      })
    },

    clearToolCalls: () => {
      set((state) => {
        // Move completed SubAgents to history before clearing
        const completed = Object.values(state.completedSubAgents)
        if (completed.length > 0) {
          state.subAgentHistory.push(...completed)
        }
        state.pendingToolCalls = []
        state.executedToolCalls = []
        state.activeSubAgents = {}
        state.completedSubAgents = {}
        state.approvedToolNames = []
      })
    },

    handleSubAgentEvent: (event) => {
      set((state) => {
        const id = event.toolUseId
        switch (event.type) {
          case 'sub_agent_start':
            state.activeSubAgents[id] = {
              name: event.subAgentName,
              toolUseId: id,
              isRunning: true,
              iteration: 0,
              toolCalls: [],
              streamingText: '',
              startedAt: Date.now(),
              completedAt: null,
            }
            break
          case 'sub_agent_iteration': {
            const sa = state.activeSubAgents[id]
            if (sa) sa.iteration = event.iteration
            break
          }
          case 'sub_agent_tool_call': {
            const sa = state.activeSubAgents[id]
            if (sa) {
              const existing = sa.toolCalls.find((t) => t.id === event.toolCall.id)
              if (existing) {
                Object.assign(existing, event.toolCall)
              } else {
                sa.toolCalls.push(event.toolCall)
              }
            }
            break
          }
          case 'sub_agent_text_delta': {
            const sa = state.activeSubAgents[id]
            if (sa) sa.streamingText += event.text
            break
          }
          case 'sub_agent_end': {
            const sa = state.activeSubAgents[id]
            if (sa) {
              sa.isRunning = false
              sa.completedAt = Date.now()
              state.completedSubAgents[id] = sa
              delete state.activeSubAgents[id]
            }
            break
          }
        }
      })
    },

    abort: () => {
      set({ isRunning: false, currentLoopId: null })
      for (const [, resolve] of approvalResolvers) {
        resolve(false)
      }
      approvalResolvers.clear()
    },

    requestApproval: (toolCallId) => {
      return new Promise<boolean>((resolve) => {
        approvalResolvers.set(toolCallId, resolve)
      })
    },

    clearPendingApprovals: () => {
      // Resolve all pending approval promises as denied
      for (const [, resolve] of approvalResolvers) {
        resolve(false)
      }
      approvalResolvers.clear()
      // Move all pending tool calls to executed
      set((state) => {
        for (const tc of state.pendingToolCalls) {
          tc.status = 'error'
          tc.error = 'Aborted (team deleted)'
          state.executedToolCalls.push(tc)
        }
        state.pendingToolCalls = []
      })
    },

    resolveApproval: (toolCallId, approved) => {
      const resolve = approvalResolvers.get(toolCallId)
      if (resolve) {
        resolve(approved)
        approvalResolvers.delete(toolCallId)
      }
      // Move tool call from pending → executed so the dialog advances
      // to the next pending item. Without this, teammate tool calls
      // stay in pendingToolCalls and block subsequent approvals.
      set((state) => {
        const idx = state.pendingToolCalls.findIndex((t) => t.id === toolCallId)
        if (idx !== -1) {
          const [moved] = state.pendingToolCalls.splice(idx, 1)
          moved.status = approved ? 'running' : 'error'
          if (!approved) moved.error = 'User denied permission'
          state.executedToolCalls.push(moved)
        }
      })
    },
  })),
  {
    name: 'opencowork-agent',
    storage: createJSONStorage(() => ipcStorage),
    partialize: (state) => ({
      completedSubAgents: state.completedSubAgents,
      executedToolCalls: state.executedToolCalls,
      subAgentHistory: state.subAgentHistory,
    }),
  }
  )
)
