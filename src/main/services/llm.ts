import type { AppSettings, LlmSettingsTestRequest, LlmSettingsTestResult } from '@main/lib/types'
import { getSettings } from '@main/lib/store'
import {
  completionTokenCount,
  extractText,
  finishReason,
  formatUsage,
  hasToolCall,
  responseShapeDiagnostics,
  type ChatResponse
} from './llmResponse'

const tinyPng =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/luzK4wAAAABJRU5ErkJggg=='

interface ChatBody {
  model: string
  messages: unknown[]
  temperature?: number
  max_completion_tokens?: number
  max_tokens?: number
  reasoning_effort?: 'low'
  modalities?: ['text']
}

interface RequestVariant {
  label: string
  body: ChatBody
}

function isReasoningModel(model: string): boolean {
  return /(^|[-_.:/])gpt-5($|[-_.:/])|^o\d|[-_.:/]o\d|reason|r1/i.test(model)
}

function shouldRetryEmpty(json: ChatResponse, budget: number): boolean {
  const reason = finishReason(json).toLowerCase()
  if (/length|max.?tokens/.test(reason)) {
    return true
  }
  if (reason === 'stop' || reason === 'content_filter' || hasToolCall(json)) {
    return false
  }
  const used = completionTokenCount(json.usage)
  return used !== null && used >= Math.floor(budget * 0.9)
}

function shouldTryNextVariantAfterEmpty(json: ChatResponse): boolean {
  const reason = finishReason(json).toLowerCase()
  if (reason === 'content_filter' || hasToolCall(json)) {
    return false
  }
  const used = completionTokenCount(json.usage)
  return used !== null && used > 0
}

function emptyResponseError(json: ChatResponse, model: string): Error {
  const choice = json.choices?.[0]
  const diagnostics = [
    `finish_reason=${finishReason(json)}`,
    formatUsage(json.usage),
    responseShapeDiagnostics(json)
  ]
  if (choice?.message?.refusal) {
    diagnostics.push(`refusal=${choice.message.refusal.slice(0, 120)}`)
  }
  if (choice?.message?.reasoning_content && !choice.message.content) {
    diagnostics.push('仅返回了 reasoning_content，没有最终讲解文本')
  }
  if (hasToolCall(json)) {
    diagnostics.push('模型返回了 tool_calls，但当前接口需要最终自然语言文本')
  }
  return new Error(`LLM 没有返回文本内容（model=${model}，${diagnostics.join('，')}）。如果 finish_reason 是 length，说明输出预算被推理过程耗尽。`)
}

function requestVariants(model: string, messages: unknown[], maxTokens: number): RequestVariant[] {
  const base = { model, messages }
  const reasoning = isReasoningModel(model)
  const variants: RequestVariant[] = reasoning
    ? [
        { label: 'max_completion_tokens+reasoning_effort', body: { ...base, max_completion_tokens: maxTokens, reasoning_effort: 'low' } },
        { label: 'max_completion_tokens+text_modality', body: { ...base, max_completion_tokens: maxTokens, modalities: ['text'] } },
        { label: 'max_completion_tokens', body: { ...base, max_completion_tokens: maxTokens } },
        { label: 'max_tokens', body: { ...base, max_tokens: maxTokens } }
      ]
    : [
        { label: 'max_completion_tokens+temperature', body: { ...base, temperature: 0.25, max_completion_tokens: maxTokens } },
        { label: 'max_tokens+temperature', body: { ...base, temperature: 0.25, max_tokens: maxTokens } },
        { label: 'max_tokens', body: { ...base, max_tokens: maxTokens } }
      ]

  const seen = new Set<string>()
  return variants.filter((variant) => {
    const key = JSON.stringify(variant.body)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function retryableBodyError(text: string): boolean {
  return /max_completion_tokens|max_tokens|temperature|reasoning_effort|modalities|unsupported|unrecognized|unknown parameter/i.test(text)
}

function expandedTokenBudget(maxTokens: number): number {
  return Math.min(Math.max(maxTokens * 2, maxTokens + 1024), 8192)
}

async function postChat(
  settings: Pick<AppSettings, 'llmBaseUrl' | 'llmApiKey' | 'llmModel'>,
  messages: unknown[],
  maxTokens: number
): Promise<string> {
  const endpoint = `${settings.llmBaseUrl.replace(/\/$/, '')}/chat/completions`
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${settings.llmApiKey}`
  }
  const budgets = [maxTokens, expandedTokenBudget(maxTokens)].filter((value, index, values) => values.indexOf(value) === index)
  let lastRetryableError = ''
  let lastEmptyResponse: ChatResponse | null = null

  for (const budget of budgets) {
    const variants = requestVariants(settings.llmModel, messages, budget)
    for (const [variantIndex, variant] of variants.entries()) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(variant.body),
        signal: AbortSignal.timeout(180_000)
      })

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        if (response.status === 400 && retryableBodyError(text)) {
          lastRetryableError = `${response.status} ${text.slice(0, 240)}`
          continue
        }
        throw new Error(`LLM 请求失败: ${response.status} ${text.slice(0, 240)}`)
      }

      const json = (await response.json()) as ChatResponse
      const content = extractText(json)
      if (content) {
        return content
      }
      lastEmptyResponse = json
      if (variantIndex < variants.length - 1 && shouldTryNextVariantAfterEmpty(json)) {
        continue
      }
      if (budget < budgets[budgets.length - 1] && shouldRetryEmpty(json, budget)) {
        break
      }
      throw emptyResponseError(json, settings.llmModel)
    }
  }

  if (lastEmptyResponse) {
    throw emptyResponseError(lastEmptyResponse, settings.llmModel)
  }
  throw new Error(`LLM 请求失败: ${lastRetryableError || '请求参数不被当前 OpenAI-compatible 服务接受'}`)
}

export async function callMultimodalTeacher(
  settings: AppSettings,
  systemPrompt: string,
  textPayload: string,
  imageDataUrl: string
): Promise<string> {
  if (!settings.llmBaseUrl.trim() || !settings.llmApiKey.trim() || !settings.llmModel.trim()) {
    throw new Error('请先配置多模态 LLM API')
  }

  return postChat(settings, [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: textPayload },
        { type: 'image_url', image_url: { url: imageDataUrl } }
      ]
    }
  ], 4096)
}

export async function callTeacherText(
  settings: AppSettings,
  systemPrompt: string,
  textPayload: string
): Promise<string> {
  if (!settings.llmBaseUrl.trim() || !settings.llmApiKey.trim() || !settings.llmModel.trim()) {
    throw new Error('请先配置多模态 LLM API')
  }

  return postChat(settings, [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: textPayload
    }
  ], 4096)
}

export async function testLlmSettings(payload: LlmSettingsTestRequest): Promise<LlmSettingsTestResult> {
  try {
    const saved = getSettings()
    const text = await postChat({
      llmBaseUrl: payload.llmBaseUrl.trim() || saved.llmBaseUrl,
      llmApiKey: payload.llmApiKey.trim() || saved.llmApiKey,
      llmModel: payload.llmModel.trim() || saved.llmModel
    }, [
      {
        role: 'user',
        content: [
          { type: 'text', text: '请只回答 OK，确认你能读取图片输入。' },
          { type: 'image_url', image_url: { url: tinyPng } }
        ]
      }
    ], 512)
    return {
      ok: /ok/i.test(text),
      message: /ok/i.test(text) ? '多模态模型连接成功。' : `模型有返回，但未按图片测试预期回答: ${text}`
    }
  } catch (error) {
    return { ok: false, message: String(error) }
  }
}
