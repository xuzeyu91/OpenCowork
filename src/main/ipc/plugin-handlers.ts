import { ipcMain, BrowserWindow } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { PluginManager } from '../plugins/plugin-manager'
import { PLUGIN_PROVIDERS } from '../plugins/plugin-descriptors'
import { getDb } from '../db/database'
import type { PluginInstance, PluginEvent } from '../plugins/plugin-types'

const DATA_DIR = path.join(os.homedir(), '.open-cowork')
const PLUGINS_FILE = path.join(DATA_DIR, 'plugins.json')

// ── Persistence helpers ──

function readPlugins(): PluginInstance[] {
  try {
    if (fs.existsSync(PLUGINS_FILE)) {
      return JSON.parse(fs.readFileSync(PLUGINS_FILE, 'utf-8'))
    }
  } catch {
    // Return empty on any error
  }
  return []
}

function writePlugins(plugins: PluginInstance[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(PLUGINS_FILE, JSON.stringify(plugins, null, 2), 'utf-8')
  } catch (err) {
    console.error('[Plugins] Write error:', err)
  }
}

// ── Notify renderer of plugin events ──

function notifyRenderer(event: PluginEvent): void {
  const windows = BrowserWindow.getAllWindows()
  for (const win of windows) {
    win.webContents.send('plugin:incoming-message', event)
  }
}

// ── Register IPC handlers ──

export function registerPluginHandlers(pluginManager: PluginManager): void {
  // List available provider descriptors
  ipcMain.handle('plugin:list-providers', () => {
    return PLUGIN_PROVIDERS
  })

  // List persisted plugin instances
  ipcMain.handle('plugin:list', () => {
    return readPlugins()
  })

  // Add a new plugin instance
  ipcMain.handle('plugin:add', (_event, instance: PluginInstance) => {
    const plugins = readPlugins()
    plugins.push(instance)
    writePlugins(plugins)
    return { success: true }
  })

  // Update a plugin instance
  ipcMain.handle(
    'plugin:update',
    (_event, { id, patch }: { id: string; patch: Partial<PluginInstance> }) => {
      const plugins = readPlugins()
      const idx = plugins.findIndex((p) => p.id === id)
      if (idx === -1) return { success: false, error: 'Plugin not found' }
      plugins[idx] = { ...plugins[idx], ...patch }
      writePlugins(plugins)
      return { success: true }
    }
  )

  // Remove a plugin instance (also cascade-deletes plugin sessions)
  ipcMain.handle('plugin:remove', async (_event, id: string) => {
    // Stop service if running
    await pluginManager.stopPlugin(id)
    const plugins = readPlugins().filter((p) => p.id !== id)
    writePlugins(plugins)
    // Cascade-delete plugin sessions and their messages
    try {
      const db = getDb()
      const sessionIds = db
        .prepare('SELECT id FROM sessions WHERE plugin_id = ?')
        .all(id) as { id: string }[]
      if (sessionIds.length > 0) {
        const ids = sessionIds.map((s) => s.id)
        for (const sid of ids) {
          db.prepare('DELETE FROM messages WHERE session_id = ?').run(sid)
        }
        db.prepare('DELETE FROM sessions WHERE plugin_id = ?').run(id)
      }
    } catch (err) {
      console.error('[Plugins] Failed to cascade-delete sessions:', err)
    }
    return { success: true }
  })

  // Start a plugin service
  ipcMain.handle('plugin:start', async (_event, id: string) => {
    const plugins = readPlugins()
    const instance = plugins.find((p) => p.id === id)
    if (!instance) return { success: false, error: 'Plugin not found' }

    try {
      await pluginManager.startPlugin(instance, notifyRenderer)
      return { success: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return { success: false, error: msg }
    }
  })

  // Stop a plugin service
  ipcMain.handle('plugin:stop', async (_event, id: string) => {
    await pluginManager.stopPlugin(id)
    return { success: true }
  })

  // Get plugin status
  ipcMain.handle('plugin:status', (_event, id: string) => {
    return pluginManager.getStatus(id)
  })

  // Unified action dispatch — routes to the correct MessagingPluginService method
  ipcMain.handle(
    'plugin:exec',
    async (
      _event,
      { pluginId, action, params }: { pluginId: string; action: string; params: Record<string, unknown> }
    ) => {
      const service = pluginManager.getService(pluginId)
      if (!service) {
        throw new Error(`Plugin ${pluginId} is not running`)
      }

      // Dispatch to the unified MessagingPluginService method with named params
      switch (action) {
        case 'sendMessage':
          return await service.sendMessage(
            params.chatId as string,
            params.content as string
          )
        case 'replyMessage':
          return await service.replyMessage(
            params.messageId as string,
            params.content as string
          )
        case 'getGroupMessages':
          return await service.getGroupMessages(
            params.chatId as string,
            (params.count as number) ?? 20
          )
        case 'listGroups':
          return await service.listGroups()
        default:
          throw new Error(`Unknown action: ${action}`)
      }
    }
  )

  // List plugin sessions (filtered by plugin_id)
  ipcMain.handle('plugin:sessions:list', (_event, pluginId: string) => {
    const db = getDb()
    return db
      .prepare('SELECT * FROM sessions WHERE plugin_id = ? ORDER BY updated_at DESC')
      .all(pluginId)
  })

  // Get messages for a plugin session
  ipcMain.handle('plugin:sessions:messages', (_event, sessionId: string) => {
    const db = getDb()
    return db
      .prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY sort_order ASC')
      .all(sessionId)
  })

  // Create a plugin session
  ipcMain.handle(
    'plugin:sessions:create',
    (
      _event,
      args: {
        id: string
        pluginId: string
        title: string
        mode: string
        createdAt: number
        updatedAt: number
      }
    ) => {
      const db = getDb()
      db.prepare(
        `INSERT INTO sessions (id, title, icon, mode, created_at, updated_at, working_folder, pinned, plugin_id)
         VALUES (?, ?, NULL, ?, ?, ?, NULL, 0, ?)`
      ).run(args.id, args.title, args.mode, args.createdAt, args.updatedAt, args.pluginId)
      return { success: true }
    }
  )
}
