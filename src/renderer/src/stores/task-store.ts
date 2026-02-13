import { create } from 'zustand'

export interface TaskItem {
  id: string
  subject: string
  description: string
  activeForm?: string
  status: 'pending' | 'in_progress' | 'completed'
  owner?: string | null
  blocks: string[]
  blockedBy: string[]
  metadata?: Record<string, unknown>
  createdAt: number
  updatedAt: number
}

/** @deprecated Use TaskItem instead */
export type TodoItem = TaskItem

interface TaskStore {
  tasks: TaskItem[]

  /** Add a single task (returns the added task) */
  addTask: (task: TaskItem) => TaskItem
  /** Get a task by ID */
  getTask: (id: string) => TaskItem | undefined
  /** Update a task by ID (partial patch). Returns updated task or undefined if not found. */
  updateTask: (id: string, patch: Partial<Omit<TaskItem, 'id' | 'createdAt'>>) => TaskItem | undefined
  /** Delete a task by ID */
  deleteTask: (id: string) => boolean
  /** Get all tasks */
  getTasks: () => TaskItem[]
  /** Get the currently in_progress task */
  getActiveTask: () => TaskItem | undefined
  /** Get progress stats */
  getProgress: () => { total: number; completed: number; percentage: number }
  /** Clear all tasks (e.g. on session change) */
  clearTasks: () => void

  // --- Backward-compatible aliases ---
  /** @deprecated Use tasks */
  todos: TaskItem[]
  /** @deprecated Use addTask / getTasks */
  setTodos: (todos: TaskItem[]) => void
  /** @deprecated Use getTasks */
  getTodos: () => TaskItem[]
  /** @deprecated Use getActiveTask */
  getActiveTodo: () => TaskItem | undefined
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],

  addTask: (task) => {
    const now = Date.now()
    const newTask: TaskItem = {
      ...task,
      blocks: task.blocks ?? [],
      blockedBy: task.blockedBy ?? [],
      createdAt: task.createdAt ?? now,
      updatedAt: now,
    }
    set((state) => {
      const updated = [...state.tasks, newTask]
      return { tasks: updated, todos: updated }
    })
    return newTask
  },

  getTask: (id) => get().tasks.find((t) => t.id === id),

  updateTask: (id, patch) => {
    const state = get()
    const idx = state.tasks.findIndex((t) => t.id === id)
    if (idx === -1) return undefined
    const updated = { ...state.tasks[idx], ...patch, updatedAt: Date.now() }
    const tasks = [...state.tasks]
    tasks[idx] = updated
    set({ tasks, todos: tasks })
    return updated
  },

  deleteTask: (id) => {
    const state = get()
    const before = state.tasks.length
    const tasks = state.tasks.filter((t) => t.id !== id)
    if (tasks.length === before) return false
    // Also remove this ID from blocks/blockedBy of other tasks
    const cleaned = tasks.map((t) => ({
      ...t,
      blocks: t.blocks.filter((b) => b !== id),
      blockedBy: t.blockedBy.filter((b) => b !== id),
    }))
    set({ tasks: cleaned, todos: cleaned })
    return true
  },

  getTasks: () => get().tasks,

  getActiveTask: () => get().tasks.find((t) => t.status === 'in_progress'),

  getProgress: () => {
    const { tasks } = get()
    const total = tasks.length
    const completed = tasks.filter((t) => t.status === 'completed').length
    return {
      total,
      completed,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    }
  },

  clearTasks: () => set({ tasks: [], todos: [] }),

  // --- Backward-compatible aliases ---
  todos: [],

  setTodos: (todos) => {
    const now = Date.now()
    const tasks = todos.map((t) => ({
      ...t,
      blocks: t.blocks ?? [],
      blockedBy: t.blockedBy ?? [],
      createdAt: t.createdAt ?? now,
      updatedAt: now,
    }))
    set({ tasks, todos: tasks })
  },

  getTodos: () => get().tasks,

  getActiveTodo: () => get().tasks.find((t) => t.status === 'in_progress'),
}))
