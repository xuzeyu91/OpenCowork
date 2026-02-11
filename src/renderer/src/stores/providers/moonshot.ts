import type { BuiltinProviderPreset } from './types'

export const moonshotPreset: BuiltinProviderPreset = {
  builtinId: 'moonshot',
  name: 'Moonshot',
  type: 'openai-chat',
  defaultBaseUrl: 'https://api.moonshot.cn/v1',
  defaultModels: [
    // Kimi K2.5 (latest, Jan 2026)
    { id: 'kimi-k2.5', name: 'Kimi K2.5', enabled: true, contextLength: 131_072, inputPrice: 0.6, outputPrice: 3 },
    { id: 'kimi-k2-thinking', name: 'Kimi K2 Thinking', enabled: true, contextLength: 131_072, inputPrice: 0.6, outputPrice: 2.5 },
    // Moonshot V1 series (cache: 75% off input)
    { id: 'moonshot-v1-auto', name: 'Moonshot v1 Auto', enabled: true, inputPrice: 0.6, outputPrice: 2.5, cacheHitPrice: 0.15 },
    { id: 'moonshot-v1-8k', name: 'Moonshot v1 8K', enabled: true, contextLength: 8_192, inputPrice: 0.2, outputPrice: 2, cacheHitPrice: 0.05 },
    { id: 'moonshot-v1-32k', name: 'Moonshot v1 32K', enabled: true, contextLength: 32_000, inputPrice: 1, outputPrice: 3, cacheHitPrice: 0.25 },
    { id: 'moonshot-v1-128k', name: 'Moonshot v1 128K', enabled: true, contextLength: 128_000, inputPrice: 2, outputPrice: 5, cacheHitPrice: 0.5 },
  ],
}
