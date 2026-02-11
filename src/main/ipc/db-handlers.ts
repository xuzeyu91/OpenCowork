import { ipcMain } from 'electron'
import { getDb } from '../db/database'
import * as sessionsDao from '../db/sessions-dao'
import * as messagesDao from '../db/messages-dao'

export function registerDbHandlers(): void {
  // Initialize DB on registration
  getDb()

  // --- Sessions ---

  ipcMain.handle('db:sessions:list', () => {
    return sessionsDao.listSessions()
  })

  ipcMain.handle('db:sessions:get', (_event, id: string) => {
    const session = sessionsDao.getSession(id)
    if (!session) return null
    const messages = messagesDao.getMessages(id)
    return { session, messages }
  })

  ipcMain.handle(
    'db:sessions:create',
    (
      _event,
      session: {
        id: string
        title: string
        mode: string
        createdAt: number
        updatedAt: number
        workingFolder?: string
        pinned?: boolean
      }
    ) => {
      sessionsDao.createSession(session)
      return { success: true }
    }
  )

  ipcMain.handle(
    'db:sessions:update',
    (
      _event,
      args: {
        id: string
        patch: Partial<{
          title: string
          mode: string
          updatedAt: number
          workingFolder: string | null
          pinned: boolean
        }>
      }
    ) => {
      sessionsDao.updateSession(args.id, args.patch)
      return { success: true }
    }
  )

  ipcMain.handle('db:sessions:delete', (_event, id: string) => {
    sessionsDao.deleteSession(id)
    return { success: true }
  })

  ipcMain.handle('db:sessions:clear-all', () => {
    sessionsDao.clearAllSessions()
    return { success: true }
  })

  // --- Messages ---

  ipcMain.handle('db:messages:list', (_event, sessionId: string) => {
    return messagesDao.getMessages(sessionId)
  })

  ipcMain.handle(
    'db:messages:add',
    (
      _event,
      msg: {
        id: string
        sessionId: string
        role: string
        content: string
        createdAt: number
        usage?: string | null
        sortOrder: number
      }
    ) => {
      messagesDao.addMessage(msg)
      return { success: true }
    }
  )

  ipcMain.handle(
    'db:messages:update',
    (_event, args: { id: string; patch: Partial<{ content: string; usage: string | null }> }) => {
      messagesDao.updateMessage(args.id, args.patch)
      return { success: true }
    }
  )

  ipcMain.handle('db:messages:clear', (_event, sessionId: string) => {
    messagesDao.clearMessages(sessionId)
    return { success: true }
  })

  ipcMain.handle(
    'db:messages:truncate-from',
    (_event, args: { sessionId: string; fromSortOrder: number }) => {
      messagesDao.truncateMessagesFrom(args.sessionId, args.fromSortOrder)
      return { success: true }
    }
  )

  ipcMain.handle('db:messages:count', (_event, sessionId: string) => {
    return messagesDao.getMessageCount(sessionId)
  })
}
