import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { useTaskStore, type TaskItem } from '@renderer/stores/task-store'

function StatusDot({ status }: { status: TaskItem['status'] }): React.JSX.Element {
  switch (status) {
    case 'completed':
      return (
        <span className="relative flex size-3.5 shrink-0 items-center justify-center">
          <span className="size-2.5 rounded-full bg-green-500" />
        </span>
      )
    case 'in_progress':
      return (
        <span className="relative flex size-3.5 shrink-0 items-center justify-center">
          <span className="absolute size-2.5 rounded-full bg-blue-500/30 animate-ping" />
          <span className="size-2.5 rounded-full bg-blue-500" />
        </span>
      )
    case 'pending':
    default:
      return (
        <span className="relative flex size-3.5 shrink-0 items-center justify-center">
          <span className="size-2.5 rounded-full border border-muted-foreground/30" />
        </span>
      )
  }
}

interface TaskCardProps {
  name: string
  input: Record<string, unknown>
  isLive?: boolean
}

export function TaskCard({ name, input, isLive }: TaskCardProps): React.JSX.Element {
  const { t } = useTranslation('chat')
  const [expanded, setExpanded] = React.useState(false)
  const [showPending, setShowPending] = React.useState(false)

  // Use live store state during streaming
  const liveTasks = useTaskStore((s) => s.tasks)
  const tasks: TaskItem[] = isLive ? liveTasks : liveTasks

  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const hasInProgress = tasks.some((t) => t.status === 'in_progress')

  // Split: visible = completed + in_progress; hidden = trailing pending (only when in_progress exists)
  const lastActiveIdx = tasks.reduce((acc, t, i) => (t.status !== 'pending' ? i : acc), -1)
  const visibleTasks = hasInProgress && !showPending ? tasks.slice(0, lastActiveIdx + 1) : tasks
  const hiddenCount = hasInProgress && !showPending ? tasks.length - (lastActiveIdx + 1) : 0

  // For TaskCreate: show the subject being created even if store hasn't updated yet
  const pendingSubject = name === 'TaskCreate' && input.subject ? String(input.subject) : null

  if (total === 0 && !pendingSubject) {
    return <></>
  }

  return (
    <div className="my-5">
      {/* Header — click to toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{t('todo.tasksDone', { completed, total })}</span>
        <ChevronDown
          className={cn(
            'size-3 text-muted-foreground/40 transition-transform duration-200',
            !expanded && '-rotate-90'
          )}
        />
      </button>

      {/* Expanded task list */}
      {expanded && (
        <div className="mt-1.5 space-y-0.5 pl-1">
          {visibleTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-2 py-0.5"
            >
              <span className="mt-0.5">
                <StatusDot status={task.status} />
              </span>
              <span
                className={cn(
                  'text-xs leading-relaxed',
                  task.status === 'completed' && 'text-muted-foreground line-through',
                  task.status === 'pending' && 'text-muted-foreground/70'
                )}
              >
                {task.status === 'in_progress' && task.activeForm
                  ? task.activeForm
                  : task.subject}
              </span>
            </div>
          ))}
          {hiddenCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowPending(true) }}
              className="flex items-center gap-1.5 py-0.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <span className="relative flex size-3.5 shrink-0 items-center justify-center">
                <span className="size-2.5 rounded-full border border-muted-foreground/20" />
              </span>
              {t('todo.moreTasks', { count: hiddenCount })}
            </button>
          )}
          {showPending && hasInProgress && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowPending(false) }}
              className="py-0.5 pl-5.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {t('todo.showLess')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
