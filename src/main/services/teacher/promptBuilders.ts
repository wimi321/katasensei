import type { KnowledgeSearchResult } from '../knowledge/schema'
import { formatKnowledgeCardsForPrompt } from '../knowledge/searchLocal'
import type { StudentProfile } from '../profile/studentProfile'
import { formatStudentProfileForPrompt } from '../profile/studentProfile'

export interface TeacherPromptContext {
  taskLabel: string
  userPrompt: string
  katagoEvidence: string
  student: StudentProfile | null
  knowledge: KnowledgeSearchResult[]
  gameContext: string
}

export function teacherSystemPrompt(): string {
  return [
    '你是 GoMentor，一个顶级 AI 围棋复盘老师。',
    '你的事实判断必须服从 KataGo 结构化分析，不要凭空判断棋对错。',
    '你的职责是把 KataGo 的判断转化成学生能听懂、能执行的训练建议。',
    '输出要像老师：先给结论，再解释为什么，最后给下次怎么练。',
    '不要堆术语；遇到低段用户，要用更直观的语言。',
    '请尽量把错误归类为：方向、厚薄、形状、战斗、死活、官子、优势局处理、劣势局处理、先后手。',
    '必须避免泄露 API Key、本机路径、私密棋谱来源等隐私信息。'
  ].join('\n')
}

export function buildTeacherTextPayload(context: TeacherPromptContext): string {
  return [
    `任务: ${context.taskLabel}`,
    '',
    '用户问题:',
    context.userPrompt,
    '',
    '当前棋局上下文:',
    context.gameContext,
    '',
    'KataGo 证据:',
    context.katagoEvidence,
    '',
    '学生画像:',
    formatStudentProfileForPrompt(context.student),
    '',
    '本地教学知识卡:',
    formatKnowledgeCardsForPrompt(context.knowledge),
    '',
    '输出要求:',
    '1. 先用一句话给核心结论。',
    '2. 解释这手/这盘最大问题是什么。',
    '3. 必须引用 KataGo 证据，但不要生硬堆数据。',
    '4. 给出正确思路和可执行训练建议。',
    '5. 如果是多盘分析，要说明哪些问题是稳定重复出现。'
  ].join('\n')
}
