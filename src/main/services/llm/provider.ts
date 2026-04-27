export type ChatContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | ChatContentPart[]
}

export interface ProviderSettings {
  llmBaseUrl: string
  llmApiKey: string
  llmModel: string
}

export interface ChatInput {
  settings: ProviderSettings
  messages: ChatMessage[]
  maxTokens?: number
}

export interface ChatResult {
  text: string
  raw?: unknown
}

export interface ChatDelta {
  text: string
  done?: boolean
}

export interface ProviderProbeResult {
  ok: boolean
  message: string
  supportsImage?: boolean
  technicalDetail?: string
}

export interface LlmProvider {
  id: string
  label: string
  probe(settings: ProviderSettings): Promise<ProviderProbeResult>
  chat(input: ChatInput): Promise<ChatResult>
  streamChat?(input: ChatInput): AsyncIterable<ChatDelta>
}
