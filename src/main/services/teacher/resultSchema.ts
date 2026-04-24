export type TeacherTaskType = 'current-move' | 'full-game' | 'recent-games' | 'freeform'

export interface TeacherKeyMistake {
  moveNumber?: number
  color?: 'B' | 'W'
  played?: string
  recommended?: string
  errorType: string
  severity: 'inaccuracy' | 'mistake' | 'blunder'
  evidence: string
  explanation: string
}

export interface StructuredTeacherResult {
  taskType: TeacherTaskType
  headline: string
  summary: string
  keyMistakes: TeacherKeyMistake[]
  correctThinking: string[]
  drills: string[]
  followupQuestions: string[]
  markdown: string
  knowledgeCardIds: string[]
  profileUpdates: {
    errorTypes: string[]
    patterns: string[]
    trainingFocus: string[]
  }
}

export function renderStructuredTeacherResult(result: StructuredTeacherResult): string {
  const mistakes = result.keyMistakes.length > 0
    ? result.keyMistakes.map((item) => `- ${item.moveNumber ? `第 ${item.moveNumber} 手 ` : ''}${item.errorType}：${item.explanation}（证据：${item.evidence}）`).join('\n')
    : '- 暂未定位到需要重点展开的问题手。'
  return [
    `# ${result.headline}`,
    '',
    result.summary,
    '',
    '## 关键问题',
    mistakes,
    '',
    '## 正确思路',
    result.correctThinking.map((item) => `- ${item}`).join('\n') || '- 先把当前局面按全局方向、局部效率、先后手三步重新判断。',
    '',
    '## 训练建议',
    result.drills.map((item) => `- ${item}`).join('\n') || '- 这盘先只记录 1 个最主要问题，下次复盘时检查是否重复出现。',
    '',
    '## 可以继续追问',
    result.followupQuestions.map((item) => `- ${item}`).join('\n') || '- 要不要我把这手的变化图拆开讲？'
  ].join('\n')
}
