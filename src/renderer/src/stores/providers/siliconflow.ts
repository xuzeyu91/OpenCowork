import type { BuiltinProviderPreset } from './types'

export const siliconflowPreset: BuiltinProviderPreset = {
  builtinId: 'siliconflow',
  name: '硅基流动',
  type: 'openai-chat',
  defaultBaseUrl: 'https://api.siliconflow.cn/v1',
  defaultModels: [
    // ── DeepSeek ──
    { id: 'deepseek-ai/DeepSeek-V3.2', name: 'DeepSeek V3.2', enabled: true, contextLength: 164_000, inputPrice: 0.27, outputPrice: 0.42 },
    { id: 'deepseek-ai/DeepSeek-V3.1', name: 'DeepSeek V3.1', enabled: true, contextLength: 164_000, inputPrice: 0.27, outputPrice: 1.0 },
    { id: 'deepseek-ai/DeepSeek-V3.1-Terminus', name: 'DeepSeek V3.1 Terminus', enabled: true, contextLength: 164_000, inputPrice: 0.27, outputPrice: 1.0 },
    // ── Qwen ──
    { id: 'Qwen/Qwen3-235B-A22B', name: 'Qwen3 235B', enabled: true, contextLength: 131_072, inputPrice: 0.25, outputPrice: 0.5 },
    { id: 'Qwen/Qwen3-30B-A3B', name: 'Qwen3 30B-A3B', enabled: true, contextLength: 131_072, inputPrice: 0.07, outputPrice: 0.14 },
    { id: 'Qwen/Qwen3-8B', name: 'Qwen3 8B', enabled: true, contextLength: 131_072, inputPrice: 0.05, outputPrice: 0.05 },
    // ── GLM (智谱) ──
    { id: 'THUDM/GLM-4.5-Air', name: 'GLM-4.5 Air', enabled: true, contextLength: 131_072, inputPrice: 0.14, outputPrice: 0.86 },
    { id: 'THUDM/GLM-4-32B-0414', name: 'GLM-4 32B', enabled: true, contextLength: 32_768, inputPrice: 0.27, outputPrice: 0.27 },
    // ── Moonshot / Kimi ──
    { id: 'moonshotai/Kimi-K2.5', name: 'Kimi K2.5', enabled: true, contextLength: 262_144, inputPrice: 0.55, outputPrice: 3.0 },
    { id: 'moonshotai/Kimi-K2-Instruct', name: 'Kimi K2 Instruct', enabled: true, contextLength: 131_072, inputPrice: 0.58, outputPrice: 2.29 },
    { id: 'moonshotai/Kimi-Dev-72B', name: 'Kimi Dev 72B', enabled: true, contextLength: 131_072, inputPrice: 0.29, outputPrice: 1.15 },
    // ── MiniMax ──
    { id: 'MiniMaxAI/MiniMax-M2.1', name: 'MiniMax M2.1', enabled: true, contextLength: 196_608, inputPrice: 0.29, outputPrice: 1.2 },
    { id: 'MiniMaxAI/MiniMax-M2', name: 'MiniMax M2', enabled: true, contextLength: 196_608, inputPrice: 0.3, outputPrice: 1.2 },
    { id: 'MiniMaxAI/MiniMax-M1-80k', name: 'MiniMax M1 80K', enabled: true, contextLength: 131_072, inputPrice: 0.55, outputPrice: 2.2 },
    // ── OpenAI (开源) ──
    { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', enabled: true, contextLength: 131_072, inputPrice: 0.05, outputPrice: 0.45 },
    { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', enabled: true, contextLength: 131_072, inputPrice: 0.04, outputPrice: 0.18 },
    // ── 其他 ──
    { id: 'baidu/ERNIE-4.5-300B-A47B', name: 'ERNIE 4.5 300B', enabled: true, contextLength: 131_072, inputPrice: 0.28, outputPrice: 1.1 },
    { id: 'tencent/Hunyuan-A13B-Instruct', name: 'Hunyuan A13B', enabled: true, contextLength: 131_072, inputPrice: 0.14, outputPrice: 0.57 },
  ],
}
