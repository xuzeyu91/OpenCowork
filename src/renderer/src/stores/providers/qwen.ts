import type { BuiltinProviderPreset } from './types'

export const qwenPreset: BuiltinProviderPreset = {
  builtinId: 'qwen',
  name: '通义千问',
  type: 'openai-chat',
  defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  defaultModels: [
    // Qwen3 series (tiered pricing, base tier ≤32K/≤256K shown)
    { id: 'qwen3-max', name: 'Qwen3 Max', enabled: true, contextLength: 262_144, inputPrice: 1.2, outputPrice: 6 },
    { id: 'qwen-plus', name: 'Qwen Plus (Qwen3)', enabled: true, contextLength: 1_000_000, inputPrice: 0.4, outputPrice: 1.2 },
    // Legacy Qwen models
    { id: 'qwen-max', name: 'Qwen Max', enabled: true, contextLength: 32_768, inputPrice: 1.6, outputPrice: 6.4 },
    // Qwen-Flash (free tier available)
    { id: 'qwen-flash', name: 'Qwen Flash', enabled: true, contextLength: 1_000_000, inputPrice: 0, outputPrice: 0 },
  ],
}
