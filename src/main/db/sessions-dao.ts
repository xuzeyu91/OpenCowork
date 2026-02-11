import { getDb } from './database'

export interface SessionRow {
  id: string
  title: string
  mode: string
  created_at: number
  updated_at: number
  working_folder: string | null
  pinned: number
}

export function listSessions(): SessionRow[] {
  const db = getDb()
  return db.prepare('SELECT * FROM sessions ORDER BY updated_at DESC').all() as SessionRow[]
}

export function getSession(id: string): SessionRow | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as SessionRow | undefined
}

export function createSession(session: {
  id: string
  title: string
  mode: string
  createdAt: number
  updatedAt: number
  workingFolder?: string
  pinned?: boolean
}): void {
  const db = getDb()
  db.prepare(
    `INSERT INTO sessions (id, title, mode, created_at, updated_at, working_folder, pinned)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    session.id,
    session.title,
    session.mode,
    session.createdAt,
    session.updatedAt,
    session.workingFolder ?? null,
    session.pinned ? 1 : 0
  )
}

export function updateSession(
  id: string,
  patch: Partial<{
    title: string
    mode: string
    updatedAt: number
    workingFolder: string | null
    pinned: boolean
  }>
): void {
  const db = getDb()
  const sets: string[] = []
  const values: unknown[] = []

  if (patch.title !== undefined) {
    sets.push('title = ?')
    values.push(patch.title)
  }
  if (patch.mode !== undefined) {
    sets.push('mode = ?')
    values.push(patch.mode)
  }
  if (patch.updatedAt !== undefined) {
    sets.push('updated_at = ?')
    values.push(patch.updatedAt)
  }
  if (patch.workingFolder !== undefined) {
    sets.push('working_folder = ?')
    values.push(patch.workingFolder)
  }
  if (patch.pinned !== undefined) {
    sets.push('pinned = ?')
    values.push(patch.pinned ? 1 : 0)
  }

  if (sets.length === 0) return

  values.push(id)
  db.prepare(`UPDATE sessions SET ${sets.join(', ')} WHERE id = ?`).run(...values)
}

export function deleteSession(id: string): void {
  const db = getDb()
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id)
}

export function clearAllSessions(): void {
  const db = getDb()
  db.prepare('DELETE FROM messages').run()
  db.prepare('DELETE FROM sessions').run()
}
