import type { StructuredTeacherResult, TeacherTaskType } from './resultSchema'

function extractJson(text: string): unknown | null {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced?.[1]?.trim() ?? trimmed
  if (!candidate.startsWith('{')) return null
  try {
    return JSON.parse(candidate) as unknown
  } catch {
    return null
  }
}

function asString(value: unknown, defaultValue = ''): string {
  return typeof value === 'string' ? value : defaultValue
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : []
}

function normalizeSeverity(value: unknown): 'inaccuracy' | 'mistake' | 'blunder' {
  if (value === 'blunder' || value === 'mistake' || value === 'inaccuracy') return value
  return 'mistake'
}

function normalizeTaskType(value: unknown, defaultValue: TeacherTaskType): TeacherTaskType {
  if (value === 'current-move' || value === 'full-game' || value === 'recent-games' || value === 'freeform') return value
  return defaultValue
}

function normalizeColor(value: unknown): 'B' | 'W' | undefined {
  return value === 'B' || value === 'W' ? value : undefined
}

export function parseStructuredTeacherResult(input: {
  text: string
  taskType: TeacherTaskType
  knowledgeCardIds?: string[]
}): StructuredTeacherResult {
  const json = extractJson(input.text)
  if (json && typeof json === 'object') {
    const obj = json as Record<string, unknown>
    const keyMistakes = Array.isArray(obj.keyMistakes)
      ? obj.keyMistakes.map((item) => {
          const row = item && typeof item === 'object' ? item as Record<string, unknown> : {}
          return {
            moveNumber: typeof row.moveNumber === 'number' ? row.moveNumber : undefined,
            color: normalizeColor(row.color),
            played: asString(row.played),
            recommended: asString(row.recommended),
            errorType: asString(row.errorType),
            severity: normalizeSeverity(row.severity),
            evidence: asString(row.evidence),
            explanation: asString(row.explanation)
          }
        })
      : []

    const result: StructuredTeacherResult = {
      taskType: normalizeTaskType(obj.taskType, input.taskType),
      headline: asString(obj.headline),
      summary: asString(obj.summary, input.text.split('\n').find((line) => line.trim())?.trim() ?? ''),
      keyMistakes,
      correctThinking: asStringArray(obj.correctThinking),
      drills: asStringArray(obj.drills),
      followupQuestions: asStringArray(obj.followupQuestions),
      markdown: asString(obj.markdown) || input.text,
      knowledgeCardIds: asStringArray(obj.knowledgeCardIds).length > 0 ? asStringArray(obj.knowledgeCardIds) : input.knowledgeCardIds ?? [],
      profileUpdates: {
        errorTypes: asStringArray((obj.profileUpdates as Record<string, unknown> | undefined)?.errorTypes),
        patterns: asStringArray((obj.profileUpdates as Record<string, unknown> | undefined)?.patterns),
        trainingFocus: asStringArray((obj.profileUpdates as Record<string, unknown> | undefined)?.trainingFocus)
      }
    }
    return result
  }

  return {
    taskType: input.taskType,
    headline: '',
    summary: input.text.split('\n').find((line) => line.trim())?.trim() ?? '',
    keyMistakes: [],
    correctThinking: [],
    drills: [],
    followupQuestions: [],
    markdown: input.text,
    knowledgeCardIds: input.knowledgeCardIds ?? [],
    profileUpdates: {
      errorTypes: [],
      patterns: [],
      trainingFocus: []
    }
  }
}
