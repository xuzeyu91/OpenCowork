import type { BuiltinProviderPreset } from './types'

export const openrouterPreset: BuiltinProviderPreset = {
  builtinId: 'openrouter',
  name: 'OpenRouter',
  type: 'openai-chat',
  defaultBaseUrl: 'https://openrouter.ai/api/v1',
  defaultModels: [
    // ── Anthropic ──
    { id: 'anthropic/claude-opus-4.6', name: 'Claude Opus 4.6', enabled: true, contextLength: 1_000_000, inputPrice: 5, outputPrice: 25, cacheCreationPrice: 6.25, cacheHitPrice: 0.5 },
    { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', enabled: true, contextLength: 1_000_000, inputPrice: 3, outputPrice: 15, cacheCreationPrice: 3.75, cacheHitPrice: 0.3 },
    { id: 'anthropic/claude-opus-4.5', name: 'Claude Opus 4.5', enabled: true, contextLength: 200_000, inputPrice: 5, outputPrice: 25, cacheCreationPrice: 6.25, cacheHitPrice: 0.5 },
    { id: 'anthropic/claude-haiku-4.5', name: 'Claude Haiku 4.5', enabled: true, contextLength: 200_000, inputPrice: 1, outputPrice: 5, cacheCreationPrice: 1.25, cacheHitPrice: 0.1 },
    { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', enabled: true, contextLength: 200_000, inputPrice: 3, outputPrice: 15, cacheCreationPrice: 3.75, cacheHitPrice: 0.3 },

    // ── OpenAI — GPT-5 family ──
    { id: 'openai/gpt-5.2', name: 'GPT-5.2', enabled: true, contextLength: 1_048_576, inputPrice: 1.75, outputPrice: 14, cacheCreationPrice: 1.75, cacheHitPrice: 0.175 },
    { id: 'openai/gpt-5.2-codex', name: 'GPT-5.2 Codex', enabled: true, contextLength: 1_048_576, inputPrice: 1.75, outputPrice: 14, cacheCreationPrice: 1.75, cacheHitPrice: 0.175 },
    { id: 'openai/gpt-5.1', name: 'GPT-5.1', enabled: true, contextLength: 1_048_576, inputPrice: 1.25, outputPrice: 10, cacheCreationPrice: 1.25, cacheHitPrice: 0.125 },
    { id: 'openai/gpt-5', name: 'GPT-5', enabled: true, contextLength: 1_048_576, inputPrice: 1.25, outputPrice: 10, cacheCreationPrice: 1.25, cacheHitPrice: 0.125 },
    { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', enabled: true, contextLength: 1_048_576, inputPrice: 0.25, outputPrice: 2, cacheCreationPrice: 0.25, cacheHitPrice: 0.025 },
    { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano', enabled: true, contextLength: 1_048_576, inputPrice: 0.05, outputPrice: 0.4, cacheCreationPrice: 0.05, cacheHitPrice: 0.005 },
    { id: 'openai/gpt-5-pro', name: 'GPT-5 Pro', enabled: true, contextLength: 1_048_576, inputPrice: 15, outputPrice: 120 },
    // ── OpenAI — O-series ──
    { id: 'openai/o3', name: 'o3', enabled: true, contextLength: 200_000, inputPrice: 2, outputPrice: 8, cacheCreationPrice: 2, cacheHitPrice: 1 },
    { id: 'openai/o4-mini', name: 'o4 Mini', enabled: true, contextLength: 200_000, inputPrice: 1.1, outputPrice: 4.4, cacheCreationPrice: 1.1, cacheHitPrice: 0.55 },
    { id: 'openai/o3-mini', name: 'o3 Mini', enabled: true, contextLength: 200_000, inputPrice: 1.1, outputPrice: 4.4, cacheCreationPrice: 1.1, cacheHitPrice: 0.55 },
    // ── OpenAI — GPT-4.1 family ──
    { id: 'openai/gpt-4.1', name: 'GPT-4.1', enabled: true, contextLength: 1_048_576, inputPrice: 2, outputPrice: 8, cacheCreationPrice: 2, cacheHitPrice: 0.5 },
    { id: 'openai/gpt-4.1-mini', name: 'GPT-4.1 Mini', enabled: true, contextLength: 1_048_576, inputPrice: 0.4, outputPrice: 1.6, cacheCreationPrice: 0.4, cacheHitPrice: 0.1 },
    { id: 'openai/gpt-4.1-nano', name: 'GPT-4.1 Nano', enabled: true, contextLength: 1_048_576, inputPrice: 0.1, outputPrice: 0.4, cacheCreationPrice: 0.1, cacheHitPrice: 0.025 },
    // ── OpenAI — GPT-4o family ──
    { id: 'openai/gpt-4o', name: 'GPT-4o', enabled: true, contextLength: 128_000, inputPrice: 2.5, outputPrice: 10, cacheCreationPrice: 2.5, cacheHitPrice: 1.25 },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', enabled: true, contextLength: 128_000, inputPrice: 0.15, outputPrice: 0.6, cacheCreationPrice: 0.15, cacheHitPrice: 0.075 },

    // ── Google Gemini ──
    { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', enabled: true, contextLength: 1_048_576, inputPrice: 0.5, outputPrice: 3, cacheHitPrice: 0.05 },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', enabled: true, contextLength: 1_048_576, inputPrice: 1.25, outputPrice: 10 },
    { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', enabled: true, contextLength: 1_048_576, inputPrice: 0.3, outputPrice: 2.5 },
    { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', enabled: true, contextLength: 1_048_576, inputPrice: 0.1, outputPrice: 0.4 },
    { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', enabled: true, contextLength: 1_048_576, inputPrice: 0.1, outputPrice: 0.4 },

    // ── DeepSeek ──
    { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2', enabled: true, contextLength: 163_840, inputPrice: 0.25, outputPrice: 0.38, cacheHitPrice: 0.125 },
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', enabled: true, contextLength: 163_840, inputPrice: 0.5, outputPrice: 2.18 },
    { id: 'deepseek/deepseek-chat-v3.1', name: 'DeepSeek V3.1 Chat', enabled: true, contextLength: 131_072, inputPrice: 0.2, outputPrice: 0.3 },

    // ── Moonshot / Kimi ──
    { id: 'moonshotai/kimi-k2.5', name: 'Kimi K2.5', enabled: true, contextLength: 262_144, inputPrice: 0.45, outputPrice: 2.25, cacheHitPrice: 0.07 },

    // ── MiniMax ──
    { id: 'minimax/minimax-m2.1', name: 'MiniMax M2.1', enabled: true, contextLength: 196_608, inputPrice: 0.27, outputPrice: 0.95, cacheHitPrice: 0.03 },
    { id: 'minimax/minimax-m2.1-lightning', name: 'MiniMax M2.1 Lightning', enabled: true, contextLength: 196_608, inputPrice: 0.14, outputPrice: 0.48 },

    // ── xAI Grok ──
    { id: 'x-ai/grok-4', name: 'Grok 4', enabled: true, contextLength: 256_000, inputPrice: 3, outputPrice: 15 },
    { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1 Fast', enabled: true, contextLength: 256_000, inputPrice: 0.6, outputPrice: 4 },
    { id: 'x-ai/grok-4-fast', name: 'Grok 4 Fast', enabled: true, contextLength: 256_000, inputPrice: 0.6, outputPrice: 4 },
    { id: 'x-ai/grok-code-fast-1', name: 'Grok Code Fast', enabled: true, contextLength: 256_000, inputPrice: 0.6, outputPrice: 4 },

    // ── Z.AI / GLM (智谱) ──
    { id: 'z-ai/glm-4.7', name: 'GLM-4.7', enabled: true, contextLength: 128_000, inputPrice: 0.28, outputPrice: 1.12 },
    { id: 'z-ai/glm-4.6', name: 'GLM-4.6', enabled: true, contextLength: 128_000, inputPrice: 0.14, outputPrice: 0.56 },
    { id: 'z-ai/glm-4.5-air', name: 'GLM-4.5 Air', enabled: true, contextLength: 128_000, inputPrice: 0.07, outputPrice: 0.28 },

    // ── Qwen ──
    { id: 'qwen/qwen3-235b-a22b', name: 'Qwen3 235B', enabled: true, contextLength: 131_072, inputPrice: 0.25, outputPrice: 0.5 },
    { id: 'qwen/qwen3-coder-next', name: 'Qwen3 Coder Next', enabled: true, contextLength: 262_144, inputPrice: 0.16, outputPrice: 0.64 },
    { id: 'qwen/qwen3-30b-a3b', name: 'Qwen3 30B-A3B', enabled: true, contextLength: 131_072, inputPrice: 0.07, outputPrice: 0.14 },

    // ── Meta Llama ──
    { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', enabled: true, contextLength: 1_048_576, inputPrice: 0.22, outputPrice: 0.88 },

    // ── Mistral ──
    { id: 'mistralai/devstral-small', name: 'Devstral Small', enabled: true, contextLength: 131_072, inputPrice: 0.1, outputPrice: 0.3 },
    { id: 'mistralai/mistral-small-3.2', name: 'Mistral Small 3.2', enabled: true, contextLength: 131_072, inputPrice: 0.1, outputPrice: 0.3 },

    // ── ByteDance / StepFun / Tencent ──
    { id: 'stepfun-ai/step3', name: 'Step 3', enabled: true, contextLength: 256_000, inputPrice: 0.56, outputPrice: 2.24 },
    { id: 'tencent/hunyuan-a13b-instruct', name: 'Hunyuan A13B', enabled: true, contextLength: 131_072, inputPrice: 0.14, outputPrice: 0.42 },

    // ── Free models ──
    { id: 'xiaomi/mimo-v2-flash', name: 'MiMo V2 Flash (Free)', enabled: true, contextLength: 256_000, inputPrice: 0, outputPrice: 0 },
    { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'Nemotron Nano 9B (Free)', enabled: true, contextLength: 131_072, inputPrice: 0, outputPrice: 0 },
  ],
}
