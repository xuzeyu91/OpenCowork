import type { BuiltinProviderPreset } from './types'

export const deepseekPreset: BuiltinProviderPreset = {
  builtinId: 'deepseek',
  name: 'DeepSeek',
  type: 'openai-chat',
  defaultBaseUrl: 'https://api.deepseek.com/v1',
  defaultModels: [
    // V3.2 unified pricing: cache hit $0.028, cache miss $0.28, output $0.42
    { id: 'deepseek-chat', name: 'DeepSeek V3.2 (Chat)', enabled: true, contextLength: 128_000, maxOutputTokens: 8_192, inputPrice: 0.28, outputPrice: 0.42, cacheCreationPrice: 0.28, cacheHitPrice: 0.028 },
    { id: 'deepseek-reasoner', name: 'DeepSeek V3.2 (Reasoner)', enabled: true, contextLength: 128_000, maxOutputTokens: 64_000, inputPrice: 0.28, outputPrice: 0.42, cacheCreationPrice: 0.28, cacheHitPrice: 0.028 },
  ],
}
