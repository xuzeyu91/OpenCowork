import type { PluginProviderDescriptor } from './plugin-types'

/** Built-in plugin provider descriptors */
export const PLUGIN_PROVIDERS: PluginProviderDescriptor[] = [
  {
    type: 'feishu-bot',
    displayName: 'Feishu Bot',
    description: 'Lark/Feishu messaging bot',
    icon: 'feishu',
    configSchema: [
      {
        key: 'appId',
        label: 'plugin.feishu.appId',
        type: 'text',
        required: true,
        placeholder: 'cli_xxxxx',
      },
      {
        key: 'appSecret',
        label: 'plugin.feishu.appSecret',
        type: 'secret',
        required: true,
      },
    ],
    defaultSystemPrompt:
      'You are a Feishu bot assistant. Reply concisely in the language the user uses.',
  },
  {
    type: 'dingtalk-bot',
    displayName: 'DingTalk Bot',
    description: 'DingTalk messaging bot',
    icon: 'dingtalk',
    configSchema: [
      {
        key: 'appKey',
        label: 'plugin.dingtalk.appKey',
        type: 'text',
        required: true,
      },
      {
        key: 'appSecret',
        label: 'plugin.dingtalk.appSecret',
        type: 'secret',
        required: true,
      },
    ],
    defaultSystemPrompt:
      'You are a DingTalk bot assistant. Reply concisely in the language the user uses.',
  },
]
