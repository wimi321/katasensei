import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { KnowledgeCard, KnowledgeSearchQuery, KnowledgeSearchResult } from './schema'

let cache: KnowledgeCard[] | null = null

function knowledgePath(): string {
  const candidates = [
    join(process.cwd(), 'data', 'knowledge', 'p0-cards.json'),
    process.resourcesPath ? join(process.resourcesPath, 'data', 'knowledge', 'p0-cards.json') : ''
  ].filter(Boolean)
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0]
}

export async function loadKnowledgeCards(): Promise<KnowledgeCard[]> {
  if (cache) {
    return cache
  }
  const text = await readFile(knowledgePath(), 'utf8')
  const cards = JSON.parse(text) as KnowledgeCard[]
  cache = cards
  return cards
}

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[，。！？、；：,.!?;:()（）\[\]【】]/g, ' ')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function cardText(card: KnowledgeCard): string {
  return [card.title, card.kind, card.summary, card.coachShort, card.coachLong, card.drill, ...card.errorTypes, ...card.tags, ...card.katagoSignals, ...card.boardSignals].join(' ')
}

export async function searchKnowledgeCards(query: KnowledgeSearchQuery): Promise<KnowledgeSearchResult[]> {
  const cards = await loadKnowledgeCards()
  const terms = normalize(query.text ?? '')
  const wantedErrors = new Set((query.errorTypes ?? []).map((item) => item.toLowerCase()))
  const wantedTags = new Set((query.tags ?? []).map((item) => item.toLowerCase()))

  return cards
    .map((card) => {
      let score = 0
      const reasons: string[] = []
      const text = cardText(card).toLowerCase()
      for (const term of terms) {
        if (text.includes(term)) {
          score += 2
          reasons.push(`match:${term}`)
        }
      }
      if (query.phase && card.phase.includes(query.phase)) {
        score += 2
        reasons.push(`phase:${query.phase}`)
      }
      for (const errorType of card.errorTypes) {
        if (wantedErrors.has(errorType.toLowerCase())) {
          score += 5
          reasons.push(`error:${errorType}`)
        }
      }
      for (const tag of card.tags) {
        if (wantedTags.has(tag.toLowerCase())) {
          score += 3
          reasons.push(`tag:${tag}`)
        }
      }
      if (score === 0 && terms.length === 0 && wantedErrors.size === 0 && wantedTags.size === 0) {
        score = 1
        reasons.push('default')
      }
      return { card, score, reasons }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.card.title.localeCompare(b.card.title))
    .slice(0, query.limit ?? 4)
}

export function formatKnowledgeCardsForPrompt(results: KnowledgeSearchResult[]): string {
  return results.map(({ card }, index) => [
    `#${index + 1} ${card.title}`,
    `类型: ${card.kind}`,
    `错误类型: ${card.errorTypes.join(', ') || '通用'}`,
    `摘要: ${card.summary}`,
    `老师短讲: ${card.coachShort}`,
    `训练建议: ${card.drill}`
  ].join('\n')).join('\n\n')
}
