import OpenAI from '@lobehub/icons/es/OpenAI'
import Anthropic from '@lobehub/icons/es/Anthropic'
import Gemini from '@lobehub/icons/es/Gemini'
import DeepSeek from '@lobehub/icons/es/DeepSeek'
import OpenRouter from '@lobehub/icons/es/OpenRouter'
import Ollama from '@lobehub/icons/es/Ollama'
import AzureAI from '@lobehub/icons/es/AzureAI'
import Moonshot from '@lobehub/icons/es/Moonshot'
import Qwen from '@lobehub/icons/es/Qwen'
import SiliconCloud from '@lobehub/icons/es/SiliconCloud'
import GiteeAI from '@lobehub/icons/es/GiteeAI'
import XiaomiMiMo from '@lobehub/icons/es/XiaomiMiMo'
import { Bot } from 'lucide-react'

const iconUrlMap: Record<string, string> = {
  'routin-ai': 'https://routin.ai/icons/favicon.ico',
}

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  openai: OpenAI,
  anthropic: Anthropic,
  google: Gemini,
  deepseek: DeepSeek,
  openrouter: OpenRouter,
  ollama: Ollama,
  'azure-openai': AzureAI,
  moonshot: Moonshot,
  qwen: Qwen,
  siliconflow: SiliconCloud,
  'gitee-ai': GiteeAI,
  xiaomi: XiaomiMiMo,
}

export function ProviderIcon({
  builtinId,
  size = 20,
  className,
}: {
  builtinId?: string
  size?: number
  className?: string
}): React.JSX.Element {
  const iconUrl = builtinId ? iconUrlMap[builtinId] : undefined
  if (iconUrl) {
    return (
      <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={iconUrl} alt="" width={size} height={size} className="rounded-sm" style={{ width: size, height: size }} />
      </span>
    )
  }
  const IconComp = builtinId ? iconMap[builtinId] : undefined
  if (IconComp) {
    return (
      <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconComp size={size} />
      </span>
    )
  }
  return <Bot size={size} className={className ?? 'text-muted-foreground'} />
}
