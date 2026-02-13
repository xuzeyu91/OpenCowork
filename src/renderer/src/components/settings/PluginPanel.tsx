import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Play,
  Square,
  Puzzle,
  MessageCircle,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import { Switch } from '@renderer/components/ui/switch'
import { Separator } from '@renderer/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog'
import { usePluginStore } from '@renderer/stores/plugin-store'
import type { PluginInstance, PluginProviderDescriptor } from '@renderer/lib/plugins/types'
import { FeishuIcon, DingTalkIcon } from '@renderer/components/icons/plugin-icons'

// ─── Plugin Icon Helper ───

const PLUGIN_ICON_COMPONENTS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  feishu: FeishuIcon,
  dingtalk: DingTalkIcon,
}

function PluginIcon({ icon, className = '' }: { icon: string; className?: string }): React.JSX.Element {
  const IconComponent = PLUGIN_ICON_COMPONENTS[icon]
  if (IconComponent) {
    return <IconComponent className={`shrink-0 ${className}`} />
  }
  return <Puzzle className={`shrink-0 ${className}`} />
}

// ─── Plugin Conversations (sub-component) ───

interface SessionRow {
  id: string
  title: string
  mode: string
  created_at: number
  updated_at: number
}

function PluginConversations({ pluginId }: { pluginId: string }): React.JSX.Element {
  const { t } = useTranslation('settings')
  const pluginSessions = usePluginStore((s) => s.pluginSessions)
  const loadPluginSessions = usePluginStore((s) => s.loadPluginSessions)

  const sessions = (pluginSessions[pluginId] ?? []) as SessionRow[]

  useEffect(() => {
    loadPluginSessions(pluginId)
  }, [pluginId, loadPluginSessions])

  const formatTime = (ts: number): string => {
    const d = new Date(ts)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <section className="space-y-2 mb-4">
      <div className="flex items-center gap-2 text-xs font-medium">
        <MessageCircle className="size-3.5" />
        {t('plugin.conversations', 'Conversations')}
        {sessions.length > 0 && (
          <span className="text-muted-foreground">({sessions.length})</span>
        )}
      </div>
      {sessions.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">
          {t('plugin.conversationsDesc', 'Plugin conversation history will appear here.')}
        </p>
      ) : (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted/50 transition-colors"
            >
              <MessageCircle className="size-3 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate">{s.title || 'Untitled'}</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                <Clock className="size-2.5" />
                {formatTime(s.updated_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Plugin Config Panel (right side) ───

function PluginConfigPanel({ plugin }: { plugin: PluginInstance }): React.JSX.Element {
  const { t } = useTranslation('settings')
  const updatePlugin = usePluginStore((s) => s.updatePlugin)
  const removePlugin = usePluginStore((s) => s.removePlugin)
  const startPlugin = usePluginStore((s) => s.startPlugin)
  const stopPlugin = usePluginStore((s) => s.stopPlugin)
  const togglePluginEnabled = usePluginStore((s) => s.togglePluginEnabled)
  const pluginStatuses = usePluginStore((s) => s.pluginStatuses)
  const getDescriptor = usePluginStore((s) => s.getDescriptor)
  const refreshStatus = usePluginStore((s) => s.refreshStatus)

  const descriptor = getDescriptor(plugin.type)
  const status = pluginStatuses[plugin.id] ?? 'stopped'

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  // Local state for debounced fields
  const [localName, setLocalName] = useState(plugin.name)
  const [localConfig, setLocalConfig] = useState(plugin.config)
  const [localSystemPrompt, setLocalSystemPrompt] = useState(plugin.userSystemPrompt)

  // Reset local state when selected plugin changes
  useEffect(() => {
    setLocalName(plugin.name)
    setLocalConfig(plugin.config)
    setLocalSystemPrompt(plugin.userSystemPrompt)
  }, [plugin.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh status on mount
  useEffect(() => {
    refreshStatus(plugin.id)
  }, [plugin.id, refreshStatus])

  // Debounced save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debouncedSave = useCallback(
    (patch: Partial<PluginInstance>) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        updatePlugin(plugin.id, patch)
      }, 500)
    },
    [plugin.id, updatePlugin]
  )

  const toggleSecret = (key: string): void => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleNameChange = (value: string): void => {
    setLocalName(value)
    debouncedSave({ name: value })
  }

  const handleConfigChange = (key: string, value: string): void => {
    const newConfig = { ...localConfig, [key]: value }
    setLocalConfig(newConfig)
    debouncedSave({ config: newConfig })
  }

  const handleSystemPromptChange = (value: string): void => {
    setLocalSystemPrompt(value)
    debouncedSave({ userSystemPrompt: value })
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-3">
      {/* Header with name + enabled toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold">{localName}</h3>
          <p className="text-xs text-muted-foreground">{descriptor?.displayName ?? plugin.type}</p>
        </div>
        <Switch
          checked={plugin.enabled}
          onCheckedChange={() => togglePluginEnabled(plugin.id)}
        />
      </div>

      <Separator className="mb-4" />

      {/* Bot Name */}
      <section className="space-y-2 mb-4">
        <label className="text-xs font-medium">{t('plugin.botName', 'Bot Name')}</label>
        <Input
          className="h-8 text-xs"
          value={localName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder={descriptor?.displayName ?? 'Plugin'}
        />
      </section>

      {/* Config fields from schema */}
      {descriptor?.configSchema.map((field) => (
        <section key={field.key} className="space-y-2 mb-4">
          <label className="text-xs font-medium">
            {t(field.label, field.key)}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </label>
          <div className="relative">
            <Input
              className="h-8 text-xs pr-8"
              type={field.type === 'secret' && !showSecrets[field.key] ? 'password' : 'text'}
              placeholder={field.placeholder}
              value={localConfig[field.key] ?? ''}
              onChange={(e) => handleConfigChange(field.key, e.target.value)}
            />
            {field.type === 'secret' && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-8 w-8 p-0"
                onClick={() => toggleSecret(field.key)}
              >
                {showSecrets[field.key] ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </Button>
            )}
          </div>
        </section>
      ))}

      {/* System Prompt */}
      <section className="space-y-2 mb-4">
        <label className="text-xs font-medium">{t('plugin.systemPrompt', 'System Prompt')}</label>
        <Textarea
          className="min-h-[80px] text-xs resize-none"
          value={localSystemPrompt}
          onChange={(e) => handleSystemPromptChange(e.target.value)}
          placeholder={descriptor?.defaultSystemPrompt ?? 'Custom system prompt for this plugin...'}
        />
      </section>

      <Separator className="mb-4" />

      {/* Service Status & Control */}
      <section className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">{t('plugin.status', 'Status')}</span>
            <span
              className={`inline-flex items-center gap-1 text-xs ${
                status === 'running'
                  ? 'text-emerald-500'
                  : status === 'error'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  status === 'running'
                    ? 'bg-emerald-500'
                    : status === 'error'
                      ? 'bg-destructive'
                      : 'bg-muted-foreground/50'
                }`}
              />
              {status === 'running'
                ? t('plugin.running', 'Running')
                : status === 'error'
                  ? t('plugin.error', 'Error')
                  : t('plugin.stopped', 'Stopped')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {status === 'running' ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={async () => {
                  await stopPlugin(plugin.id)
                  toast.success(t('plugin.stopped', 'Stopped'))
                }}
              >
                <Square className="size-3 mr-1" />
                {t('plugin.stop', 'Stop')}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={async () => {
                  const err = await startPlugin(plugin.id)
                  if (err) {
                    toast.error(t('plugin.error', 'Error'), { description: err })
                  } else {
                    toast.success(t('plugin.running', 'Running'))
                  }
                }}
                disabled={!plugin.enabled}
              >
                <Play className="size-3 mr-1" />
                {t('plugin.start', 'Start')}
              </Button>
            )}
          </div>
        </div>
      </section>

      <Separator className="mb-4" />

      {/* Conversations section */}
      <PluginConversations pluginId={plugin.id} />

      {/* Danger zone */}
      <div className="mt-auto pt-4">
        <Separator className="mb-4" />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            removePlugin(plugin.id)
            toast.success(t('plugin.removed', 'Plugin removed'))
          }}
        >
          <Trash2 className="size-3 mr-1" />
          {t('plugin.remove', 'Remove')}
        </Button>
      </div>
    </div>
  )
}

// ─── Add Plugin Dialog ───

function AddPluginDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}): React.JSX.Element {
  const { t } = useTranslation('settings')
  const providers = usePluginStore((s) => s.providers)
  const addPlugin = usePluginStore((s) => s.addPlugin)
  const setSelectedPlugin = usePluginStore((s) => s.setSelectedPlugin)

  const handleAdd = async (descriptor: PluginProviderDescriptor): Promise<void> => {
    const config: Record<string, string> = {}
    for (const field of descriptor.configSchema) {
      config[field.key] = ''
    }
    const id = await addPlugin(descriptor.type, descriptor.displayName, config, descriptor.defaultSystemPrompt)
    setSelectedPlugin(id)
    onOpenChange(false)
    toast.success(t('plugin.added', 'Plugin added'))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('plugin.addPlugin', 'Add Plugin')}</DialogTitle>
          <DialogDescription>
            {t('plugin.addPluginDesc', 'Choose a plugin provider to add.')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {providers.map((descriptor) => (
            <button
              key={descriptor.type}
              onClick={() => handleAdd(descriptor)}
              className="flex w-full items-start gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors"
            >
              <PluginIcon icon={descriptor.icon} className="size-5" />
              <div>
                <p className="text-sm font-medium">{descriptor.displayName}</p>
                <p className="text-xs text-muted-foreground">{descriptor.description}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Plugin Panel ───

export function PluginPanel(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const plugins = usePluginStore((s) => s.plugins)
  const selectedPluginId = usePluginStore((s) => s.selectedPluginId)
  const setSelectedPlugin = usePluginStore((s) => s.setSelectedPlugin)
  const loadProviders = usePluginStore((s) => s.loadProviders)
  const loadPlugins = usePluginStore((s) => s.loadPlugins)
  const pluginStatuses = usePluginStore((s) => s.pluginStatuses)
  const getDescriptor = usePluginStore((s) => s.getDescriptor)

  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  // Load providers and plugins on mount
  useEffect(() => {
    loadProviders()
    loadPlugins()
  }, [loadProviders, loadPlugins])

  // Auto-select first plugin if none selected
  useEffect(() => {
    if (!selectedPluginId && plugins.length > 0) {
      setSelectedPlugin(plugins[0].id)
    }
  }, [selectedPluginId, plugins, setSelectedPlugin])

  const filteredPlugins = useMemo(() => {
    if (!searchQuery.trim()) return plugins
    const q = searchQuery.toLowerCase()
    return plugins.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)
    )
  }, [plugins, searchQuery])

  const selectedPlugin = plugins.find((p) => p.id === selectedPluginId)

  const enabledPlugins = filteredPlugins.filter((p) => p.enabled)
  const disabledPlugins = filteredPlugins.filter((p) => !p.enabled)

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3 shrink-0">
        <h2 className="text-lg font-semibold">{t('plugin.title', 'Plugins')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('plugin.subtitle', 'Configure and manage your messaging plugins')}
        </p>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Plugin list */}
        <div className="w-52 shrink-0 border-r flex flex-col">
          {/* Search + Add */}
          <div className="flex items-center gap-1 p-2 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
              <Input
                placeholder={t('plugin.search', 'Search plugins...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 pl-7 text-[11px] bg-transparent border-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setDialogOpen(true)}
              title={t('plugin.addPlugin', 'Add Plugin')}
            >
              <Plus className="size-4" />
            </Button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto py-1">
            {enabledPlugins.length > 0 && (
              <div className="px-2 pt-1.5 pb-1">
                <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider px-1">
                  {t('plugin.enabled', 'Enabled')}
                </p>
                {enabledPlugins.map((p) => {
                  const status = pluginStatuses[p.id] ?? 'stopped'
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlugin(p.id)}
                      className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 mt-0.5 text-left transition-colors ${
                        selectedPluginId === p.id
                          ? 'bg-accent text-accent-foreground'
                          : 'text-foreground/80 hover:bg-muted/60'
                      }`}
                    >
                      <PluginIcon icon={getDescriptor(p.type)?.icon ?? ''} className="size-4" />
                      <span className="flex-1 truncate text-xs">{p.name}</span>
                      <span
                        className={`size-1.5 rounded-full shrink-0 ${
                          status === 'running' ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            )}

            {disabledPlugins.length > 0 && (
              <div className="px-2 pt-2 pb-1">
                <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider px-1">
                  {t('plugin.disabled', 'Disabled')}
                </p>
                {disabledPlugins.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlugin(p.id)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 mt-0.5 text-left transition-colors ${
                      selectedPluginId === p.id
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <span className="opacity-50"><PluginIcon icon={getDescriptor(p.type)?.icon ?? ''} className="size-4" /></span>
                    <span className="flex-1 truncate text-xs">{p.name}</span>
                  </button>
                ))}
              </div>
            )}

            {filteredPlugins.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Puzzle className="size-8 mb-2 opacity-30" />
                <p className="text-xs">{t('plugin.noPlugins', 'No plugins configured')}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 h-7 text-xs"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus className="size-3 mr-1" />
                  {t('plugin.addPlugin', 'Add Plugin')}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Config panel */}
        <div className="flex-1 min-w-0">
          {selectedPlugin ? (
            <PluginConfigPanel plugin={selectedPlugin} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {t('plugin.selectToConfig', 'Select a plugin to configure')}
            </div>
          )}
        </div>
      </div>

      <AddPluginDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
