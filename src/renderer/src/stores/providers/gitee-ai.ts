import type { BuiltinProviderPreset } from './types'

export const giteeAiPreset: BuiltinProviderPreset = {
  builtinId: 'gitee-ai',
  name: 'Gitee AI',
  type: 'openai-chat',
  defaultBaseUrl: 'https://ai.gitee.com/v1',
  defaultModels: [
    // ── DeepSeek ──
    { id: 'DeepSeek-V3', name: 'DeepSeek V3', enabled: true, contextLength: 131_072 },
    { id: 'DeepSeek-R1', name: 'DeepSeek R1', enabled: true, contextLength: 131_072 },
    // ── Qwen ──
    { id: 'Qwen3-235B-A22B', name: 'Qwen3 235B', enabled: true, contextLength: 131_072 },
    { id: 'Qwen3-30B-A3B', name: 'Qwen3 30B-A3B', enabled: true, contextLength: 131_072 },
    { id: 'Qwen3-8B', name: 'Qwen3 8B', enabled: true, contextLength: 131_072 },
    // ── GLM (智谱) ──
    { id: 'GLM-4.5', name: 'GLM-4.5', enabled: true, contextLength: 131_072 },
    { id: 'GLM-4.5-Air', name: 'GLM-4.5 Air', enabled: true, contextLength: 131_072 },
    // ── Moonshot / Kimi ──
    { id: 'Kimi-K2-Instruct', name: 'Kimi K2 Instruct', enabled: true, contextLength: 131_072 },
    // ── MiniMax ──
    { id: 'MiniMax-M2.1', name: 'MiniMax M2.1', enabled: true, contextLength: 196_608 },
    // ── 其他 ──
    { id: 'ERNIE-4.5-300B-A47B', name: 'ERNIE 4.5 300B', enabled: true, contextLength: 131_072 },
    { id: 'Hunyuan-A13B-Instruct', name: 'Hunyuan A13B', enabled: true, contextLength: 131_072 },
  ],
}
