import {
  completionTokenCount,
  extractText,
  finishReason,
  formatUsage,
  hasToolCall,
  responseShapeDiagnostics,
  type ChatResponse
} from '../llmResponse'
import type { ChatInput, ChatMessage, ChatResult, LlmProvider, ProviderProbeResult, ProviderSettings } from './provider'

const tinyPng =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/luzK4wAAAABJRU5ErkJggg=='

function endpoint(settings: ProviderSettings): string {
  return `${settings.llmBaseUrl.replace(/\/$/, '')}/chat/completions`
}

function headers(settings: ProviderSettings): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${settings.llmApiKey}`
  }
}

function isReasoningModel(model: string): boolean {
  return /(^|[-_.:/])gpt-5($|[-_.:/])|^o\d|[-_.:/]o\d|claude|reason|r1/i.test(model)
}

function requestBodies(model: string, messages: ChatMessage[], maxTokens: number): Array<Record<string, unknown>> {
  const base = { model, messages }
  const reasoning = isReasoningModel(model)
  const variants = reasoning
    ? [
        { ...base, max_completion_tokens: maxTokens, reasoning_effort: 'low' },
        { ...base, max_completion_tokens: maxTokens, modalities: ['text'] },
        { ...base, max_completion_tokens: maxTokens },
        { ...base, max_tokens: maxTokens }
      ]
    : [
        { ...base, temperature: 0.25, max_completion_tokens: maxTokens },
        { ...base, temperature: 0.25, max_tokens: maxTokens },
        { ...base, max_tokens: maxTokens }
      ]
  const seen = new Set<string>()
  return variants.filter((body) => {
    const key = JSON.stringify(body)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function retryableParameterError(status: number, text: string): boolean {
  return status === 400 && /max_completion_tokens|max_tokens|temperature|reasoning_effort|modalities|unsupported|unknown parameter|unrecognized/i.test(text)
}

function shouldTryNextVariantAfterEmpty(json: ChatResponse): boolean {
  const reason = finishReason(json).toLowerCase()
  if (reason === 'content_filter' || hasToolCall(json)) {
    return false
  }
  const used = completionTokenCount(json.usage)
  return used !== null && used > 0
}

function shouldRetryBudgetAfterEmpty(json: ChatResponse, budget: number): boolean {
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

export async function postOpenAICompatibleChat(
  settings: ProviderSettings,
  messages: ChatMessage[],
  maxTokens = 4096
): Promise<string> {
  let lastError = ''
  let lastEmptyResponse: ChatResponse | null = null
  const budgets = Array.from(new Set([maxTokens, Math.min(Math.max(maxTokens * 2, maxTokens + 1024), 8192)]))
  for (const budget of budgets) {
    const bodies = requestBodies(settings.llmModel, messages, budget)
    for (const [index, body] of bodies.entries()) {
      const response = await fetch(endpoint(settings), {
        method: 'POST',
        headers: headers(settings),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(180_000)
      })
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        if (retryableParameterError(response.status, text)) {
          lastError = `${response.status} ${text.slice(0, 240)}`
          continue
        }
        throw new Error(`LLM 请求失败: ${response.status} ${text.slice(0, 240)}`)
      }
      const json = (await response.json()) as ChatResponse
      const text = extractText(json)
      if (text) {
        return text
      }
      lastEmptyResponse = json
      lastError = `empty response: finish_reason=${finishReason(json)} ${formatUsage(json.usage)}`
      if (index < bodies.length - 1 && shouldTryNextVariantAfterEmpty(json)) {
        continue
      }
      if (budget < budgets[budgets.length - 1] && shouldRetryBudgetAfterEmpty(json, budget)) {
        break
      }
      throw emptyResponseError(json, settings.llmModel)
    }
  }
  if (lastEmptyResponse) {
    throw emptyResponseError(lastEmptyResponse, settings.llmModel)
  }
  throw new Error(`LLM 没有返回文本内容。${lastError}`)
}

export async function probeOpenAICompatibleProvider(settings: ProviderSettings): Promise<ProviderProbeResult> {
  if (!settings.llmBaseUrl.trim() || !settings.llmApiKey.trim() || !settings.llmModel.trim()) {
    return {
      ok: false,
      message: 'Claude 兼容代理未配置。',
      supportsImage: false
    }
  }
  try {
    const text = await postOpenAICompatibleChat(settings, [
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
      message: /ok/i.test(text) ? 'Claude 兼容代理连接成功，图片输入可用。' : `代理有返回，但未按预期回答: ${text}`,
      supportsImage: /ok/i.test(text)
    }
  } catch (error) {
    return {
      ok: false,
      message: 'Claude 兼容代理测试失败。',
      supportsImage: false,
      technicalDetail: String(error)
    }
  }
}

export async function chatOpenAICompatible(input: ChatInput): Promise<ChatResult> {
  const text = await postOpenAICompatibleChat(input.settings, input.messages, input.maxTokens ?? 4096)
  return { text }
}

export const openAICompatibleProvider: LlmProvider = {
  id: 'openai-compatible',
  label: 'OpenAI-compatible multimodal proxy',
  probe: probeOpenAICompatibleProvider,
  chat: chatOpenAICompatible
}
