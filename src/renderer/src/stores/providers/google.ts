import type { BuiltinProviderPreset } from './types'

export const googlePreset: BuiltinProviderPreset = {
  builtinId: 'google',
  name: 'Google Gemini',
  type: 'openai-chat',
  defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
  defaultModels: [
    // Gemini 3 (preview)
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', enabled: true, contextLength: 1_048_576, maxOutputTokens: 65_536, supportsVision: true, supportsFunctionCall: true, inputPrice: 2, outputPrice: 12 },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', enabled: true, contextLength: 1_048_576, maxOutputTokens: 65_536, supportsVision: true, supportsFunctionCall: true, inputPrice: 0.5, outputPrice: 3 },
    // Gemini 2.5
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', enabled: true, contextLength: 1_048_576, maxOutputTokens: 65_536, supportsVision: true, supportsFunctionCall: true, inputPrice: 1.25, outputPrice: 10 },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', enabled: true, contextLength: 1_048_576, maxOutputTokens: 65_536, supportsVision: true, supportsFunctionCall: true, inputPrice: 0.3, outputPrice: 2.5 },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', enabled: true, contextLength: 1_048_576, maxOutputTokens: 65_536, supportsVision: true, supportsFunctionCall: true, inputPrice: 0.1, outputPrice: 0.4 },
    // Gemini 2.0
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', enabled: true, contextLength: 1_048_576, maxOutputTokens: 8_192, supportsVision: true, supportsFunctionCall: true, inputPrice: 0.1, outputPrice: 0.4 },
  ],
}
