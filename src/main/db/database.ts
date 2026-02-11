import Database from 'better-sqlite3'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'

const DATA_DIR = path.join(os.homedir(), '.open-cowork')
const DB_PATH = path.join(DATA_DIR, 'data.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  // Ensure directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  db = new Database(DB_PATH)

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'chat',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      working_folder TEXT,
      pinned INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      usage TEXT,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_session
      ON messages(session_id, sort_order);
  `)

  // Migration: add icon column if missing
  try {
    db.exec(`ALTER TABLE sessions ADD COLUMN icon TEXT`)
  } catch {
    // Column already exists — ignore
  }

  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}

export function getDataDir(): string {
  return DATA_DIR
}
