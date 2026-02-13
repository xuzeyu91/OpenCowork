import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ProviderType, ReasoningEffortLevel } from '../lib/api/types'
import { ipcStorage } from '../lib/ipc/ipc-storage'

interface SettingsStore {
  provider: ProviderType
  apiKey: string
  baseUrl: string
  model: string
  fastModel: string
  maxTokens: number
  temperature: number
  systemPrompt: string
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'zh'
  autoApprove: boolean
  devMode: boolean
  thinkingEnabled: boolean
  reasoningEffort: ReasoningEffortLevel
  teamToolsEnabled: boolean
  contextCompressionEnabled: boolean

  updateSettings: (patch: Partial<Omit<SettingsStore, 'updateSettings'>>) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      provider: 'anthropic',
      apiKey: '',
      baseUrl: '',
      model: 'claude-sonnet-4-20250514',
      fastModel: 'claude-3-5-haiku-20241022',
      maxTokens: 32000,
      temperature: 0.7,
      systemPrompt: '',
      theme: 'system',
      language: 'en',
      autoApprove: false,
      devMode: false,
      thinkingEnabled: false,
      reasoningEffort: 'medium',
      teamToolsEnabled: false,
      contextCompressionEnabled: true,

      updateSettings: (patch) => set(patch),
    }),
    {
      name: 'opencowork-settings',
      storage: createJSONStorage(() => ipcStorage),
      partialize: (state) => ({
        provider: state.provider,
        baseUrl: state.baseUrl,
        model: state.model,
        fastModel: state.fastModel,
        maxTokens: state.maxTokens,
        temperature: state.temperature,
        systemPrompt: state.systemPrompt,
        theme: state.theme,
        language: state.language,
        autoApprove: state.autoApprove,
        devMode: state.devMode,
        thinkingEnabled: state.thinkingEnabled,
        reasoningEffort: state.reasoningEffort,
        teamToolsEnabled: state.teamToolsEnabled,
        contextCompressionEnabled: state.contextCompressionEnabled,
        // NOTE: apiKey is intentionally excluded from localStorage persistence.
        // In production, it should be stored securely in the main process.
      }),
    }
  )
)
