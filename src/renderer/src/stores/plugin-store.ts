import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { ipcClient } from '@renderer/lib/ipc/ipc-client'
import type {
  PluginProviderDescriptor,
  PluginInstance,
  PluginIncomingEvent,
} from '@renderer/lib/plugins/types'
import { IPC } from '@renderer/lib/ipc/channels'

interface PluginStore {
  plugins: PluginInstance[]
  providers: PluginProviderDescriptor[]
  selectedPluginId: string | null
  pluginStatuses: Record<string, 'running' | 'stopped' | 'error'>

  // Per-session activation (toggled via + menu)
  activePluginIds: string[]

  // Init
  loadProviders: () => Promise<void>
  loadPlugins: () => Promise<void>

  // CRUD
  addPlugin: (type: string, name: string, config: Record<string, string>, systemPrompt?: string) => Promise<string>
  updatePlugin: (id: string, patch: Partial<PluginInstance>) => Promise<void>
  removePlugin: (id: string) => Promise<void>
  togglePluginEnabled: (id: string) => Promise<void>

  // Service control
  startPlugin: (id: string) => Promise<string | undefined>
  stopPlugin: (id: string) => Promise<void>
  refreshStatus: (id: string) => Promise<void>

  // UI
  setSelectedPlugin: (id: string | null) => void

  // Per-session activation
  toggleActivePlugin: (id: string) => void
  clearActivePlugins: () => void

  // Plugin sessions
  pluginSessions: Record<string, unknown[]>
  loadPluginSessions: (pluginId: string) => Promise<void>

  // Helpers
  getDescriptor: (type: string) => PluginProviderDescriptor | undefined
  getConfiguredPlugins: () => PluginInstance[]
  getActivePlugins: () => PluginInstance[]
}

// Incoming event listener — initialized once
let _eventListenerActive = false

export function initPluginEventListener(): void {
  if (_eventListenerActive) return
  _eventListenerActive = true

  ipcClient.on(IPC.PLUGIN_INCOMING_MESSAGE, (...args: unknown[]) => {
    // ipcClient.on handler already strips the IPC event — first arg is the data
    const data = args[0] as PluginIncomingEvent
    if (!data || !data.pluginId) return

    // Update status if it's a status change
    if (data.type === 'status_change') {
      const status = data.data as 'running' | 'stopped' | 'error'
      usePluginStore.setState((s) => ({
        pluginStatuses: { ...s.pluginStatuses, [data.pluginId]: status },
      }))
    }
    // Log incoming messages for now — future: route to plugin session
    if (data.type === 'incoming_message') {
      console.log(`[Plugin:${data.pluginId}] Incoming message:`, data.data)
    }
    if (data.type === 'error') {
      console.error(`[Plugin:${data.pluginId}] Error:`, data.data)
      usePluginStore.setState((s) => ({
        pluginStatuses: { ...s.pluginStatuses, [data.pluginId]: 'error' },
      }))
    }
  })
}

export const usePluginStore = create<PluginStore>((set, get) => ({
  plugins: [],
  providers: [],
  selectedPluginId: null,
  pluginStatuses: {},
  activePluginIds: [],
  pluginSessions: {},

  loadProviders: async () => {
    try {
      const providers = (await ipcClient.invoke(IPC.PLUGIN_LIST_PROVIDERS)) as PluginProviderDescriptor[]
      set({ providers: Array.isArray(providers) ? providers : [] })
    } catch {
      set({ providers: [] })
    }
  },

  loadPlugins: async () => {
    try {
      const plugins = (await ipcClient.invoke(IPC.PLUGIN_LIST)) as PluginInstance[]
      set({ plugins: Array.isArray(plugins) ? plugins : [] })
    } catch {
      set({ plugins: [] })
    }
  },

  addPlugin: async (type, name, config, systemPrompt) => {
    const descriptor = get().providers.find((p) => p.type === type)
    const id = nanoid()
    const instance: PluginInstance = {
      id,
      type,
      name,
      enabled: true,
      userSystemPrompt: systemPrompt ?? descriptor?.defaultSystemPrompt ?? '',
      config,
      createdAt: Date.now(),
    }
    await ipcClient.invoke(IPC.PLUGIN_ADD, instance)
    set((s) => ({ plugins: [...s.plugins, instance] }))
    return id
  },

  updatePlugin: async (id, patch) => {
    await ipcClient.invoke(IPC.PLUGIN_UPDATE, { id, patch })
    set((s) => ({
      plugins: s.plugins.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  },

  removePlugin: async (id) => {
    await ipcClient.invoke(IPC.PLUGIN_REMOVE, id)
    set((s) => ({
      plugins: s.plugins.filter((p) => p.id !== id),
      selectedPluginId: s.selectedPluginId === id ? null : s.selectedPluginId,
      activePluginIds: s.activePluginIds.filter((pid) => pid !== id),
    }))
  },

  togglePluginEnabled: async (id) => {
    const plugin = get().plugins.find((p) => p.id === id)
    if (!plugin) return
    const enabled = !plugin.enabled
    await get().updatePlugin(id, { enabled })
    if (!enabled) {
      await get().stopPlugin(id)
      // Also deactivate if it was active
      set((s) => ({
        activePluginIds: s.activePluginIds.filter((pid) => pid !== id),
      }))
    }
  },

  startPlugin: async (id) => {
    try {
      const res = (await ipcClient.invoke(IPC.PLUGIN_START, id)) as {
        success: boolean
        error?: string
      }
      if (!res.success) {
        set((s) => ({
          pluginStatuses: { ...s.pluginStatuses, [id]: 'error' },
        }))
        return res.error ?? 'Unknown error'
      }
      set((s) => ({
        pluginStatuses: { ...s.pluginStatuses, [id]: 'running' },
      }))
      return undefined
    } catch (err) {
      set((s) => ({
        pluginStatuses: { ...s.pluginStatuses, [id]: 'error' },
      }))
      return err instanceof Error ? err.message : String(err)
    }
  },

  stopPlugin: async (id) => {
    try {
      await ipcClient.invoke(IPC.PLUGIN_STOP, id)
      set((s) => ({
        pluginStatuses: { ...s.pluginStatuses, [id]: 'stopped' },
      }))
    } catch {
      // ignore
    }
  },

  refreshStatus: async (id) => {
    try {
      const status = (await ipcClient.invoke(IPC.PLUGIN_STATUS, id)) as
        | 'running'
        | 'stopped'
        | 'error'
      set((s) => ({
        pluginStatuses: { ...s.pluginStatuses, [id]: status },
      }))
    } catch {
      // ignore
    }
  },

  setSelectedPlugin: (id) => set({ selectedPluginId: id }),

  toggleActivePlugin: (id) => {
    set((s) => {
      const isActive = s.activePluginIds.includes(id)
      return {
        activePluginIds: isActive
          ? s.activePluginIds.filter((pid) => pid !== id)
          : [...s.activePluginIds, id],
      }
    })
  },

  clearActivePlugins: () => set({ activePluginIds: [] }),

  loadPluginSessions: async (pluginId) => {
    try {
      const sessions = (await ipcClient.invoke(IPC.PLUGIN_SESSIONS_LIST, pluginId)) as unknown[]
      set((s) => ({
        pluginSessions: { ...s.pluginSessions, [pluginId]: sessions },
      }))
    } catch {
      // ignore
    }
  },

  getDescriptor: (type) => {
    return get().providers.find((p) => p.type === type)
  },

  getConfiguredPlugins: () => {
    return get().plugins.filter((p) => p.enabled)
  },

  getActivePlugins: () => {
    const { plugins, activePluginIds } = get()
    return plugins.filter((p) => activePluginIds.includes(p.id))
  },
}))
