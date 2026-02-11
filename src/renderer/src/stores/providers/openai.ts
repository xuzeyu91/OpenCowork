import type { BuiltinProviderPreset } from './types'

export const openaiPreset: BuiltinProviderPreset = {
  builtinId: 'openai',
  name: 'OpenAI',
  type: 'openai-chat',
  defaultBaseUrl: 'https://api.openai.com/v1',
  defaultModels: [
    // GPT-5 family (cache: 90% off input)
    { id: 'gpt-5.2', name: 'GPT-5.2', enabled: true, contextLength: 1_048_576, inputPrice: 1.75, outputPrice: 14, cacheCreationPrice: 1.75, cacheHitPrice: 0.175 },
    { id: 'gpt-5.1', name: 'GPT-5.1', enabled: true, contextLength: 1_048_576, inputPrice: 1.25, outputPrice: 10, cacheCreationPrice: 1.25, cacheHitPrice: 0.125 },
    { id: 'gpt-5', name: 'GPT-5', enabled: true, contextLength: 1_048_576, inputPrice: 1.25, outputPrice: 10, cacheCreationPrice: 1.25, cacheHitPrice: 0.125 },
    { id: 'gpt-5-mini', name: 'GPT-5 Mini', enabled: true, contextLength: 1_048_576, inputPrice: 0.25, outputPrice: 2, cacheCreationPrice: 0.25, cacheHitPrice: 0.025 },
    { id: 'gpt-5-nano', name: 'GPT-5 Nano', enabled: true, contextLength: 1_048_576, inputPrice: 0.05, outputPrice: 0.4, cacheCreationPrice: 0.05, cacheHitPrice: 0.005 },
    // O-series reasoning (cache: 50% off input)
    { id: 'o3', name: 'o3', enabled: true, contextLength: 200_000, inputPrice: 2, outputPrice: 8, cacheCreationPrice: 2, cacheHitPrice: 1 },
    { id: 'o4-mini', name: 'o4 Mini', enabled: true, contextLength: 200_000, inputPrice: 1.1, outputPrice: 4.4, cacheCreationPrice: 1.1, cacheHitPrice: 0.55 },
    { id: 'o3-mini', name: 'o3 Mini', enabled: true, contextLength: 200_000, inputPrice: 1.1, outputPrice: 4.4, cacheCreationPrice: 1.1, cacheHitPrice: 0.55 },
    // GPT-4.1 family (cache: 75% off input)
    { id: 'gpt-4.1', name: 'GPT-4.1', enabled: true, contextLength: 1_048_576, inputPrice: 2, outputPrice: 8, cacheCreationPrice: 2, cacheHitPrice: 0.5 },
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', enabled: true, contextLength: 1_048_576, inputPrice: 0.4, outputPrice: 1.6, cacheCreationPrice: 0.4, cacheHitPrice: 0.1 },
    { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', enabled: true, contextLength: 1_048_576, inputPrice: 0.1, outputPrice: 0.4, cacheCreationPrice: 0.1, cacheHitPrice: 0.025 },
    // GPT-4o family (cache: 50% off input)
    { id: 'gpt-4o', name: 'GPT-4o', enabled: true, contextLength: 128_000, inputPrice: 2.5, outputPrice: 10, cacheCreationPrice: 2.5, cacheHitPrice: 1.25 },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', enabled: true, contextLength: 128_000, inputPrice: 0.15, outputPrice: 0.6, cacheCreationPrice: 0.15, cacheHitPrice: 0.075 },
  ],
}
