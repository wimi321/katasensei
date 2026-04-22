export interface ChatChoice {
  finish_reason?: string | null
  native_finish_reason?: string | null
  text?: string
  content?: ChatMessageContent
  message?: {
    content?: ChatMessageContent
    content_parts?: ChatMessageContent
    output_text?: unknown
    text?: unknown
    refusal?: string | null
    reasoning_content?: string | null
    tool_calls?: unknown[]
  }
}

export type ChatContentPart =
  | string
  | {
      type?: string
      text?: unknown
      output_text?: unknown
      content?: unknown
      value?: unknown
      transcript?: unknown
      parts?: unknown
      content_parts?: unknown
    }

export type ChatMessageContent = string | ChatContentPart[] | ChatContentPart | null

export interface ChatResponse {
  choices?: ChatChoice[]
  content?: ChatMessageContent
  output_text?: string
  message?: {
    content?: ChatMessageContent
  }
  output?: Array<{
    type?: string
    text?: unknown
    output_text?: unknown
    content?: ChatMessageContent
    value?: unknown
    message?: {
      content?: ChatMessageContent
    }
  }>
  data?: Array<{
    content?: ChatMessageContent
    text?: unknown
    output_text?: unknown
  }>
  usage?: unknown
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function textFromUnknown(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (Array.isArray(value)) {
    return value.map(textFromUnknown).filter(Boolean).join('\n').trim()
  }

  const record = objectValue(value)
  if (!record) {
    return ''
  }

  const type = typeof record.type === 'string' ? record.type.toLowerCase() : ''
  if (type.includes('reasoning') || type === 'refusal') {
    return ''
  }

  for (const key of ['text', 'output_text', 'content', 'value', 'transcript', 'parts', 'content_parts'] as const) {
    const nested = record[key]
    if (nested === value) {
      continue
    }
    const text = textFromUnknown(nested)
    if (text) {
      return text
    }
  }

  return ''
}

function textFromOutputItem(item: NonNullable<ChatResponse['output']>[number]): string {
  if (item.type?.toLowerCase().includes('reasoning')) {
    return ''
  }

  const direct = textFromUnknown(item)
  if (direct) {
    return direct
  }

  return textFromUnknown(item.message?.content)
}

export function extractText(json: ChatResponse): string {
  const choice = json.choices?.[0]
  const directCandidates = [
    choice?.message?.content,
    choice?.message?.content_parts,
    choice?.message?.output_text,
    choice?.message?.text,
    choice?.text,
    choice?.content,
    json.output_text,
    json.message?.content,
    json.content
  ]

  for (const candidate of directCandidates) {
    const text = textFromUnknown(candidate)
    if (text) {
      return text
    }
  }

  const outputText = json.output
    ?.map(textFromOutputItem)
    .filter(Boolean)
    .join('\n')
    .trim()
  if (outputText) {
    return outputText
  }

  const dataText = json.data
    ?.map((item) => textFromUnknown(item.content) || textFromUnknown(item.output_text) || textFromUnknown(item.text))
    .filter(Boolean)
    .join('\n')
    .trim()

  return dataText ?? ''
}

export function formatUsage(usage: unknown): string {
  if (!usage || typeof usage !== 'object') {
    return '无 usage'
  }
  const compact: Record<string, unknown> = {}
  for (const key of ['prompt_tokens', 'completion_tokens', 'total_tokens', 'output_tokens'] as const) {
    const value = (usage as Record<string, unknown>)[key]
    if (typeof value === 'number') {
      compact[key] = value
    }
  }
  const details = (usage as Record<string, unknown>).completion_tokens_details
  if (details && typeof details === 'object') {
    const reasoningTokens = (details as Record<string, unknown>).reasoning_tokens
    if (typeof reasoningTokens === 'number') {
      compact.reasoning_tokens = reasoningTokens
    }
  }
  return Object.keys(compact).length ? JSON.stringify(compact) : 'usage 格式未知'
}

export function completionTokenCount(usage: unknown): number | null {
  if (!usage || typeof usage !== 'object') {
    return null
  }
  for (const key of ['completion_tokens', 'output_tokens'] as const) {
    const value = (usage as Record<string, unknown>)[key]
    if (typeof value === 'number') {
      return value
    }
  }
  return null
}

export function finishReason(json: ChatResponse): string {
  return String(json.choices?.[0]?.finish_reason ?? json.choices?.[0]?.native_finish_reason ?? 'unknown')
}

export function hasToolCall(json: ChatResponse): boolean {
  return Boolean(json.choices?.[0]?.message?.tool_calls && json.choices[0]?.message?.tool_calls?.length)
}

export function responseShapeDiagnostics(json: ChatResponse): string {
  const choice = json.choices?.[0]
  const message = choice?.message
  const shape = {
    top: Object.keys(json).slice(0, 12),
    choice: choice ? Object.keys(choice).slice(0, 12) : [],
    message: message ? Object.keys(message).slice(0, 12) : [],
    outputTypes: json.output?.slice(0, 4).map((item) => item.type ?? 'unknown') ?? []
  }
  return `shape=${JSON.stringify(shape)}`
}
