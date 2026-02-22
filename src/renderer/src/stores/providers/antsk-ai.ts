import type { BuiltinProviderPreset } from './types'

export const antskAiPreset: BuiltinProviderPreset = {
  builtinId: 'antsk-ai',
  name: 'AntSK AI',
  type: 'openai-chat',
  defaultBaseUrl: 'https://api.antsk.cn/v1',
  homepage: 'https://api.antsk.cn/',
  apiKeyUrl: 'https://api.antsk.cn/',
  defaultEnabled: true,
  defaultModels: [
    { id: 'gpt-5.1', name: 'GPT-5.1', icon: 'openai', enabled: true, contextLength: 400_000, maxOutputTokens: 64_384, supportsVision: true, supportsFunctionCall: false, supportsThinking: true, thinkingConfig: { bodyParams: { reasoning_effort: 'medium' }, reasoningEffortLevels: ['minimal', 'low', 'medium', 'high'], defaultReasoningEffort: 'medium' } },
    { id: 'gpt-5.2', name: 'GPT-5.2', icon: 'openai', enabled: true, contextLength: 400_000, maxOutputTokens: 64_384, supportsVision: true, supportsFunctionCall: false, supportsThinking: true, thinkingConfig: { bodyParams: { reasoning_effort: 'medium' }, reasoningEffortLevels: ['minimal', 'low', 'medium', 'high', 'xhigh'], defaultReasoningEffort: 'medium' } },
    { id: 'gpt-5.1-codex', name: 'GPT-5.1 Codex', icon: 'openai', enabled: true, contextLength: 400_000, maxOutputTokens: 64_384, supportsVision: true, supportsFunctionCall: false, supportsThinking: true, thinkingConfig: { bodyParams: { reasoning_effort: 'medium' }, reasoningEffortLevels: ['minimal', 'low', 'medium', 'high'], defaultReasoningEffort: 'medium' }, type: 'openai-responses' },
    { id: 'gpt-5.2-codex', name: 'GPT-5.2 Codex', icon: 'openai', enabled: true, contextLength: 400_000, maxOutputTokens: 64_384, supportsVision: true, supportsFunctionCall: false, supportsThinking: true, thinkingConfig: { bodyParams: { reasoning_effort: 'medium' }, reasoningEffortLevels: ['minimal', 'low', 'medium', 'high', 'xhigh'], defaultReasoningEffort: 'medium' }, type: 'openai-responses' },
    { id: 'gpt-5.3-codex', name: 'GPT-5.3 Codex', icon: 'openai', enabled: true, contextLength: 128_000, maxOutputTokens: 64_384, supportsVision: true, supportsFunctionCall: false, supportsThinking: true, thinkingConfig: { bodyParams: { reasoning_effort: 'medium' }, reasoningEffortLevels: ['minimal', 'low', 'medium', 'high', 'xhigh'], defaultReasoningEffort: 'medium' }, type: 'openai-responses' },
    { id: 'glm-4.7', name: 'GLM-4.7', icon: 'chatglm', enabled: true, contextLength: 1_048_576, maxOutputTokens: 8_192, supportsVision: false, supportsFunctionCall: true },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', icon: 'gemini', enabled: true, contextLength: 1_048_576, maxOutputTokens: 65_536, supportsVision: true, supportsFunctionCall: true, supportsThinking: true, thinkingConfig: { bodyParams: { reasoning_effort: 'medium' } } },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', icon: 'gemini', enabled: true, contextLength: 1_048_576, maxOutputTokens: 65_536, supportsVision: true, supportsFunctionCall: true, supportsThinking: true, thinkingConfig: { bodyParams: { reasoning_effort: 'medium' } } },
    { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', icon: 'claude', type: 'anthropic', enabled: true, contextLength: 200_000, maxOutputTokens: 64_384, supportsVision: true, supportsFunctionCall: true, supportsThinking: true, thinkingConfig: { bodyParams: { thinking: { type: 'enabled', budget_tokens: 10000 } }, forceTemperature: 1 } },
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', icon: 'claude', type: 'anthropic', enabled: true, contextLength: 200_000, maxOutputTokens: 64_384, supportsVision: true, supportsFunctionCall: true, supportsThinking: true, thinkingConfig: { bodyParams: { thinking: { type: 'enabled', budget_tokens: 10000 } }, forceTemperature: 1 } },
    { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', icon: 'claude', type: 'anthropic', enabled: true, contextLength: 200_000, maxOutputTokens: 64_384, supportsVision: true, supportsFunctionCall: true, supportsThinking: true, thinkingConfig: { bodyParams: { thinking: { type: 'enabled', budget_tokens: 10000 } }, forceTemperature: 1 } },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', icon: 'claude', type: 'anthropic', enabled: true, contextLength: 200_000, maxOutputTokens: 8_192, supportsVision: true, supportsFunctionCall: true, supportsThinking: true, thinkingConfig: { bodyParams: { thinking: { type: 'enabled', budget_tokens: 8000 } }, forceTemperature: 1 } },
    { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', icon: 'claude', type: 'anthropic', enabled: true, contextLength: 200_000, maxOutputTokens: 64_384, supportsVision: true, supportsFunctionCall: true, supportsThinking: true, thinkingConfig: { bodyParams: { thinking: { type: 'enabled', budget_tokens: 10000 } }, forceTemperature: 1 } },
  ],
}