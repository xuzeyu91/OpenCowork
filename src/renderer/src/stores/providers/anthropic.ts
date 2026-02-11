import type { BuiltinProviderPreset } from './types'

export const anthropicPreset: BuiltinProviderPreset = {
  builtinId: 'anthropic',
  name: 'Anthropic',
  type: 'anthropic',
  defaultBaseUrl: 'https://api.anthropic.com',
  defaultModels: [
    // Claude 4.6 / 4.5 series (cache write: 1.25x input, cache read: 0.1x input)
    { id: 'claude-opus-4-6-20260201', name: 'Claude Opus 4.6', enabled: true, contextLength: 1_000_000, maxOutputTokens: 16_384, supportsVision: true, supportsFunctionCall: true, inputPrice: 5, outputPrice: 25, cacheCreationPrice: 6.25, cacheHitPrice: 0.5 },
    { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', enabled: true, contextLength: 200_000, maxOutputTokens: 16_384, supportsVision: true, supportsFunctionCall: true, inputPrice: 3, outputPrice: 15, cacheCreationPrice: 3.75, cacheHitPrice: 0.3 },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', enabled: true, contextLength: 200_000, maxOutputTokens: 8_192, supportsVision: true, supportsFunctionCall: true, inputPrice: 1, outputPrice: 5, cacheCreationPrice: 1.25, cacheHitPrice: 0.1 },
    { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', enabled: true, contextLength: 200_000, maxOutputTokens: 16_384, supportsVision: true, supportsFunctionCall: true, inputPrice: 5, outputPrice: 25, cacheCreationPrice: 6.25, cacheHitPrice: 0.5 },
    // Claude 4 series (legacy pricing)
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', enabled: true, contextLength: 200_000, maxOutputTokens: 16_384, supportsVision: true, supportsFunctionCall: true, inputPrice: 3, outputPrice: 15, cacheCreationPrice: 3.75, cacheHitPrice: 0.3 },
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', enabled: true, contextLength: 200_000, maxOutputTokens: 16_384, supportsVision: true, supportsFunctionCall: true, inputPrice: 15, outputPrice: 75, cacheCreationPrice: 18.75, cacheHitPrice: 1.5 },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', enabled: true, contextLength: 200_000, maxOutputTokens: 8_192, supportsVision: true, supportsFunctionCall: true, inputPrice: 0.8, outputPrice: 4, cacheCreationPrice: 1, cacheHitPrice: 0.08 },
  ],
}
