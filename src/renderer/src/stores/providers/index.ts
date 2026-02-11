export type { BuiltinProviderPreset } from './types'

import { routinAiPreset } from './routin-ai'
import { openaiPreset } from './openai'
import { anthropicPreset } from './anthropic'
import { googlePreset } from './google'
import { deepseekPreset } from './deepseek'
import { openrouterPreset } from './openrouter'
import { ollamaPreset } from './ollama'
import { azureOpenaiPreset } from './azure-openai'
import { moonshotPreset } from './moonshot'
import { qwenPreset } from './qwen'
import { siliconflowPreset } from './siliconflow'
import { giteeAiPreset } from './gitee-ai'
import { xiaomiPreset } from './xiaomi'
import type { BuiltinProviderPreset } from './types'

export const builtinProviderPresets: BuiltinProviderPreset[] = [
  routinAiPreset,
  openaiPreset,
  anthropicPreset,
  googlePreset,
  deepseekPreset,
  openrouterPreset,
  ollamaPreset,
  azureOpenaiPreset,
  moonshotPreset,
  qwenPreset,
  siliconflowPreset,
  giteeAiPreset,
  xiaomiPreset,
]
