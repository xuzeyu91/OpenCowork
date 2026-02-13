import { Settings, BrainCircuit, Info, Server, Puzzle } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useUIStore, type SettingsTab } from '@renderer/stores/ui-store'
import { useSettingsStore } from '@renderer/stores/settings-store'
import { formatTokens } from '@renderer/lib/format-tokens'
import { useDebouncedTokens } from '@renderer/hooks/use-estimated-tokens'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import { Separator } from '@renderer/components/ui/separator'
import { Slider } from '@renderer/components/ui/slider'
import { Switch } from '@renderer/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { useProviderStore } from '@renderer/stores/provider-store'
import { ProviderPanel } from './ProviderPanel'
import { PluginPanel } from './PluginPanel'
import { WindowControls } from '@renderer/components/layout/WindowControls'

const menuItemDefs: { id: SettingsTab; icon: React.ReactNode; labelKey: string; descKey: string }[] = [
  { id: 'general', icon: <Settings className="size-4" />, labelKey: 'general.title', descKey: 'general.subtitle' },
  { id: 'provider', icon: <Server className="size-4" />, labelKey: 'provider.title', descKey: 'provider.subtitle' },
  { id: 'plugin', icon: <Puzzle className="size-4" />, labelKey: 'plugin.title', descKey: 'plugin.subtitle' },
  { id: 'model', icon: <BrainCircuit className="size-4" />, labelKey: 'model.title', descKey: 'model.subtitle' },
  { id: 'about', icon: <Info className="size-4" />, labelKey: 'about.title', descKey: 'about.subtitle' },
]

// ─── General Settings Panel ───

function GeneralPanel(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const settings = useSettingsStore()
  const { setTheme } = useTheme()
  const promptTokens = useDebouncedTokens(settings.systemPrompt)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">{t('general.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('general.subtitle')}</p>
      </div>

      {/* Theme */}
      <section className="space-y-3">
        <div>
          <label className="text-sm font-medium">{t('general.theme')}</label>
          <p className="text-xs text-muted-foreground">{t('general.themeDesc')}</p>
        </div>
        <Select
          value={settings.theme}
          onValueChange={(v: 'light' | 'dark' | 'system') => {
            settings.updateSettings({ theme: v })
            setTheme(v)
          }}
        >
          <SelectTrigger className="w-60 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light" className="text-xs">
              {t('general.light')}
            </SelectItem>
            <SelectItem value="dark" className="text-xs">
              {t('general.dark')}
            </SelectItem>
            <SelectItem value="system" className="text-xs">
              {t('general.system')}
            </SelectItem>
          </SelectContent>
        </Select>
      </section>

      <Separator />

      {/* Language */}
      <section className="space-y-3">
        <div>
          <label className="text-sm font-medium">{t('general.language')}</label>
          <p className="text-xs text-muted-foreground">{t('general.languageDesc')}</p>
        </div>
        <Select
          value={settings.language}
          onValueChange={(v: 'en' | 'zh') => settings.updateSettings({ language: v })}
        >
          <SelectTrigger className="w-60 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zh" className="text-xs">
              {t('general.chinese')}
            </SelectItem>
            <SelectItem value="en" className="text-xs">
              {t('general.english')}
            </SelectItem>
          </SelectContent>
        </Select>
      </section>

      <Separator />

      {/* System Prompt */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">{t('general.systemPrompt')}</label>
            <p className="text-xs text-muted-foreground">{t('general.systemPromptDesc')}</p>
          </div>
          {settings.systemPrompt && (
            <span className="text-[10px] text-muted-foreground/50 tabular-nums">
              {promptTokens > 0 ? `~${formatTokens(promptTokens)} tokens` : ''}
            </span>
          )}
        </div>
        <Textarea
          placeholder={t('general.systemPromptPlaceholder')}
          value={settings.systemPrompt}
          onChange={(e) => settings.updateSettings({ systemPrompt: e.target.value })}
          rows={4}
          className="max-w-lg"
        />
      </section>

      <Separator />

      {/* Team Tools */}
      <section className="space-y-3">
        <div className="flex items-center justify-between max-w-lg">
          <div>
            <label className="text-sm font-medium">{t('general.teamTools')}</label>
            <p className="text-xs text-muted-foreground">
              {t('general.teamToolsDesc')}
            </p>
          </div>
          <Switch
            checked={settings.teamToolsEnabled}
            onCheckedChange={(checked) => settings.updateSettings({ teamToolsEnabled: checked })}
          />
        </div>
        {settings.teamToolsEnabled && (
          <p className="text-xs text-muted-foreground/70">
            {t('general.teamToolsEnabled')}
          </p>
        )}
      </section>

      <Separator />

      {/* Context Compression */}
      <section className="space-y-3">
        <div className="flex items-center justify-between max-w-lg">
          <div>
            <label className="text-sm font-medium">{t('general.contextCompression')}</label>
            <p className="text-xs text-muted-foreground">
              {t('general.contextCompressionDesc')}
            </p>
          </div>
          <Switch
            checked={settings.contextCompressionEnabled}
            onCheckedChange={(checked) => settings.updateSettings({ contextCompressionEnabled: checked })}
          />
        </div>
        {settings.contextCompressionEnabled && (
          <p className="text-xs text-muted-foreground/70">
            {t('general.contextCompressionEnabled')}
          </p>
        )}
      </section>

      <Separator />

      {/* Auto Approve */}
      <section className="space-y-3">
        <div className="flex items-center justify-between max-w-lg">
          <div>
            <label className="text-sm font-medium">{t('general.autoApprove')}</label>
            <p className="text-xs text-muted-foreground">{t('general.autoApproveDesc')}</p>
          </div>
          <Switch
            checked={settings.autoApprove}
            onCheckedChange={(checked) => {
              if (checked && !window.confirm(t('general.autoApproveWarning')))
                return
              settings.updateSettings({ autoApprove: checked })
            }}
          />
        </div>
        {settings.autoApprove && (
          <p className="text-xs text-destructive">{t('general.autoApproveWarning')}</p>
        )}
      </section>

      <Separator />

      {/* Developer Mode */}
      <section className="space-y-3">
        <div className="flex items-center justify-between max-w-lg">
          <div>
            <label className="text-sm font-medium">{t('general.devMode')}</label>
            <p className="text-xs text-muted-foreground">{t('general.devModeDesc')}</p>
          </div>
          <Switch
            checked={settings.devMode}
            onCheckedChange={(checked) => settings.updateSettings({ devMode: checked })}
          />
        </div>
      </section>

      <Separator />

      {/* Reset */}
      <section>
        <Button
          variant="outline"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => {
            if (!window.confirm(t('general.resetConfirm'))) return
            const currentKey = settings.apiKey
            settings.updateSettings({
              provider: 'anthropic',
              baseUrl: '',
              model: 'claude-sonnet-4-20250514',
              fastModel: 'claude-3-5-haiku-20241022',
              maxTokens: 32000,
              temperature: 0.7,
              systemPrompt: '',
              theme: 'system',
              apiKey: currentKey
            })
            setTheme('system')
            toast.success(t('general.resetDone'))
          }}
        >
          {t('general.resetDefault')}
        </Button>
      </section>
    </div>
  )
}

// ─── Model Configuration Panel ───

function ModelPanel(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const settings = useSettingsStore()
  const providers = useProviderStore((s) => s.providers)
  const activeProviderId = useProviderStore((s) => s.activeProviderId)
  const activeModelId = useProviderStore((s) => s.activeModelId)
  const activeFastModelId = useProviderStore((s) => s.activeFastModelId)
  const setActiveProvider = useProviderStore((s) => s.setActiveProvider)
  const setActiveModel = useProviderStore((s) => s.setActiveModel)
  const setActiveFastModel = useProviderStore((s) => s.setActiveFastModel)

  const enabledProviders = providers.filter((p) => p.enabled)
  const activeProvider = providers.find((p) => p.id === activeProviderId) ?? null
  const enabledModels = activeProvider?.models.filter((m) => m.enabled) ?? []

  const noProviders = enabledProviders.length === 0

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">{t('model.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('model.subtitle')}</p>
      </div>

      {noProviders ? (
        <div className="rounded-lg border border-dashed p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">{t('model.noProviders')}</p>
          <p className="text-xs text-muted-foreground/60">
            {t('model.noProvidersHint')}
          </p>
        </div>
      ) : (
        <>
          {/* Provider Selection */}
          <section className="space-y-3">
            <div>
              <label className="text-sm font-medium">{t('model.provider')}</label>
              <p className="text-xs text-muted-foreground">{t('model.providerDesc')}</p>
            </div>
            <Select value={activeProviderId ?? ''} onValueChange={(v) => setActiveProvider(v)}>
              <SelectTrigger className="w-80 text-xs">
                <SelectValue placeholder={t('dialog.selectProvider')} />
              </SelectTrigger>
              <SelectContent>
                {enabledProviders.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <Separator />

          {/* Main Model */}
          <section className="space-y-3">
            <div>
              <label className="text-sm font-medium">{t('model.mainModel')}</label>
              <p className="text-xs text-muted-foreground">{t('model.mainModelDesc')}</p>
            </div>
            {enabledModels.length > 0 ? (
              <Select value={activeModelId} onValueChange={(v) => setActiveModel(v)}>
                <SelectTrigger className="w-80 text-xs">
                  <SelectValue placeholder={t('model.selectModel')} />
                </SelectTrigger>
                <SelectContent>
                  {enabledModels.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.name}
                      <span className="ml-2 text-muted-foreground/50">{m.id}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-muted-foreground/60">
                {t('model.noModelsHint')}
              </p>
            )}
          </section>

          {/* Fast Model */}
          <section className="space-y-3">
            <div>
              <label className="text-sm font-medium">{t('model.fastModel')}</label>
              <p className="text-xs text-muted-foreground">
                {t('model.fastModelDesc')}
              </p>
            </div>
            {enabledModels.length > 0 ? (
              <Select
                value={activeFastModelId || enabledModels[0]?.id || ''}
                onValueChange={(v) => setActiveFastModel(v)}
              >
                <SelectTrigger className="w-80 text-xs">
                  <SelectValue placeholder={t('model.selectFastModel')} />
                </SelectTrigger>
                <SelectContent>
                  {enabledModels.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.name}
                      <span className="ml-2 text-muted-foreground/50">{m.id}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-muted-foreground/60">{t('model.noModelsAvailable')}</p>
            )}
          </section>
        </>
      )}

      <Separator />

      {/* Temperature */}
      <section className="space-y-3">
        <div className="flex items-center justify-between max-w-lg">
          <div>
            <label className="text-sm font-medium">{t('model.temperature')}</label>
            <p className="text-xs text-muted-foreground">{t('model.temperatureDesc')}</p>
          </div>
          <span className="text-sm font-mono text-muted-foreground">{settings.temperature}</span>
        </div>
        <Slider
          value={[settings.temperature]}
          onValueChange={([v]) => settings.updateSettings({ temperature: v })}
          min={0}
          max={1}
          step={0.1}
          className="max-w-lg"
        />
        <div className="flex items-center justify-between max-w-lg">
          {[
            { v: 0, label: t('model.precise') },
            { v: 0.3, label: t('model.balanced') },
            { v: 0.7, label: t('model.creative') },
            { v: 1, label: t('model.random') }
          ].map(({ v, label }) => (
            <button
              key={v}
              onClick={() => settings.updateSettings({ temperature: v })}
              className={`text-[10px] transition-colors ${settings.temperature === v ? 'text-foreground font-medium' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Max Tokens */}
      <section className="space-y-3">
        <div>
          <label className="text-sm font-medium">{t('model.maxTokens')}</label>
          <p className="text-xs text-muted-foreground">{t('model.maxTokensDesc')}</p>
        </div>
        <Input
          type="number"
          value={settings.maxTokens}
          onChange={(e) =>
            settings.updateSettings({ maxTokens: parseInt(e.target.value) || 32000 })
          }
          className="max-w-60"
        />
        <div className="flex items-center gap-1">
          {[8192, 16384, 32000, 64000, 128000].map((v) => (
            <button
              key={v}
              onClick={() => settings.updateSettings({ maxTokens: v })}
              className={`rounded px-2 py-0.5 text-[10px] transition-colors ${settings.maxTokens === v ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              {v >= 1000 ? `${Math.round(v / 1024)}K` : v}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── About Panel ───

function AboutPanel(): React.JSX.Element {
  const { t } = useTranslation('settings')
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">{t('about.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('about.subtitle')}</p>
      </div>

      <div className="flex items-center gap-4">
        <img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230ea5e9'/%3E%3Ccircle cx='35' cy='40' r='14' fill='%23fff'/%3E%3Ccircle cx='65' cy='40' r='14' fill='%23fff' opacity='.85'/%3E%3Cpath d='M25 68 Q50 85 75 68' stroke='%23fff' stroke-width='6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"
          alt="OpenCowork"
          className="size-16 rounded-2xl shadow-md"
        />
        <div>
          <h3 className="text-xl font-bold">OpenCowork</h3>
          <p className="text-sm text-muted-foreground">{t('about.appDesc')}</p>
        </div>
      </div>

      <Separator />

      <section className="space-y-4">
        <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
          <span className="text-muted-foreground">{t('about.version')}</span>
          <span className="font-mono">0.1.0</span>
          <span className="text-muted-foreground">{t('about.framework')}</span>
          <span>Electron + React + TypeScript</span>
          <span className="text-muted-foreground">{t('about.ui')}</span>
          <span>shadcn/ui + TailwindCSS</span>
          <span className="text-muted-foreground">{t('about.license')}</span>
          <span>MIT</span>
        </div>
      </section>

      <Separator />

      <section className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {t('about.description')}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => window.open('https://github.com/AIDotNet/OpenCowork', '_blank')}
          >
            {t('about.github')}
          </Button>
        </div>
      </section>
    </div>
  )
}

// ─── Main Settings Page ───

const panelMap: Record<SettingsTab, () => React.JSX.Element> = {
  general: GeneralPanel,
  provider: ProviderPanel,
  plugin: PluginPanel,
  model: ModelPanel,
  about: AboutPanel
}

export function SettingsPage(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const settingsTab = useUIStore((s) => s.settingsTab)
  const setSettingsTab = useUIStore((s) => s.setSettingsTab)

  const ActivePanel = panelMap[settingsTab]

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Left Sidebar - LobeHub Style */}
      <div className="flex w-64 shrink-0 flex-col border-r bg-muted/20">
        {/* Titlebar drag area */}
        <div className="titlebar-drag h-10 w-full shrink-0" />

        {/* Header */}
        <div className="px-5 pb-5">
          <h1 className="text-xl font-bold">{t('page.title')}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{t('page.subtitle')}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
          {menuItemDefs.map((item) => (
            <button
              key={item.id}
              onClick={() => setSettingsTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                settingsTab === item.id
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <span
                className={`flex items-center justify-center size-5 ${
                  settingsTab === item.id ? 'text-accent-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.icon}
              </span>
              <span>{t(item.labelKey)}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 text-[11px] text-muted-foreground/50">
          {t('page.poweredBy')}
        </div>
      </div>

      {/* Right Content */}
      <div className="relative flex-1 flex flex-col">
        {/* Fixed titlebar area */}
        <div className="titlebar-drag h-10 w-full shrink-0" />
        <div className="absolute right-0 top-0 z-10">
          <WindowControls />
        </div>
        {/* Content */}
        {settingsTab === 'provider' || settingsTab === 'plugin' ? (
          <div className="flex-1 min-h-0 px-6 pb-4">
            <ActivePanel />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-2xl px-8 pb-16">
              <ActivePanel />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
