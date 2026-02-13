import { useState } from 'react'
import type { UnifiedMessage, ToolResultContent, ImageBlock } from '@renderer/lib/api/types'
import { UserMessage } from './UserMessage'
import { AssistantMessage } from './AssistantMessage'
import { Users, ChevronDown } from 'lucide-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MessageItemProps {
  message: UnifiedMessage
  isStreaming?: boolean
  isLastUserMessage?: boolean
  onEditUserMessage?: (newContent: string) => void
  toolResults?: Map<string, { content: ToolResultContent; isError?: boolean }>
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/** Render a teammate notification as a collapsible bar with smooth transition */
function TeamNotification({ content }: { content: string }): React.JSX.Element {
  const [expanded, setExpanded] = useState(false)

  // Extract the teammate name from the prefix "[Team message from X]:"
  const match = content.match(/^\[Team message from (.+?)\]:\n?/)
  const from = match?.[1] ?? 'teammate'
  const body = match ? content.slice(match[0].length) : content

  return (
    <div className="my-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left cursor-pointer"
      >
        <Users className="size-3.5 text-cyan-500 shrink-0" />
        <span className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400">
          {from}
        </span>
        <span className="flex-1" />
        <ChevronDown
          className={`size-3.5 text-muted-foreground/50 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-cyan-500/20 px-3 py-2 text-xs text-muted-foreground prose prose-sm dark:prose-invert max-w-none [&_h2]:text-sm [&_h2]:mt-3 [&_h2]:mb-1 [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0">
            <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MessageItem({ message, isStreaming, isLastUserMessage, onEditUserMessage, toolResults }: MessageItemProps): React.JSX.Element | null {
  const inner = (() => {
    switch (message.role) {
      case 'user': {
        // Team notification messages render as a distinct card, not a user bubble
        if (message.source === 'team') {
          const text = typeof message.content === 'string'
            ? message.content
            : message.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n')
          return <TeamNotification content={text} />
        }
        // Extract user text and images from complex content (ignore tool_result blocks)
        let userText: string
        let userImages: ImageBlock[] = []
        if (typeof message.content === 'string') {
          userText = message.content
        } else {
          const textBlocks = message.content.filter((b) => b.type === 'text')
          userText = textBlocks.length > 0 ? textBlocks.map((b) => b.text).join('\n') : ''
          userImages = message.content.filter((b): b is ImageBlock => b.type === 'image')
        }
        if (!userText && userImages.length === 0) return null
        return (
          <UserMessage
            content={userText}
            images={userImages}
            isLast={isLastUserMessage}
            onEdit={onEditUserMessage}
          />
        )
      }
      case 'assistant':
        return <AssistantMessage content={message.content} isStreaming={isStreaming} usage={message.usage} toolResults={toolResults} msgId={message.id} />
      default:
        return null
    }
  })()

  if (!inner) return null

  return (
    <div className="group/ts relative">
      <span className="absolute -left-12 top-1 hidden group-hover/ts:block text-[10px] text-muted-foreground/40 whitespace-nowrap">
        {formatTime(message.createdAt)}
      </span>
      {inner}
    </div>
  )
}
