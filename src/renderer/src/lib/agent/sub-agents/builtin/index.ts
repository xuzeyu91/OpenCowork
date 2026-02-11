import { subAgentRegistry } from '../registry'
import { createSubAgentTool } from '../create-tool'
import { toolRegistry } from '../../tool-registry'
import { useSettingsStore } from '@renderer/stores/settings-store'
import { useProviderStore } from '@renderer/stores/provider-store'
import type { ProviderConfig } from '../../../api/types'

import { codeSearchAgent } from './code-search'
import { codeReviewAgent } from './code-review'
import { plannerAgent } from './planner'

const builtinAgents = [codeSearchAgent, codeReviewAgent, plannerAgent]

/**
 * Register all built-in SubAgents in both the SubAgent registry
 * and the tool registry (so the main agent can invoke them as tools).
 */
export function registerBuiltinSubAgents(): void {
  const providerGetter = (): ProviderConfig => {
    const s = useSettingsStore.getState()
    const store = useProviderStore.getState()
    const fastConfig = store.getFastProviderConfig()
    if (fastConfig && fastConfig.apiKey) {
      return {
        ...fastConfig,
        maxTokens: store.getEffectiveMaxTokens(s.maxTokens, fastConfig.model),
        temperature: s.temperature,
      }
    }
    const fallbackModel = s.fastModel || s.model
    return {
      type: s.provider,
      apiKey: s.apiKey,
      baseUrl: s.baseUrl || undefined,
      model: fallbackModel,
      maxTokens: store.getEffectiveMaxTokens(s.maxTokens, fallbackModel),
      temperature: s.temperature,
    }
  }

  for (const def of builtinAgents) {
    subAgentRegistry.register(def)
    toolRegistry.register(createSubAgentTool(def, providerGetter))
  }
}
