import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { CoachUserLevel, GameMove } from '@main/lib/types'

export type PatternCategory = 'joseki' | 'life_death' | 'tesuji' | 'shape'
export type PatternPhase = 'opening' | 'middlegame' | 'endgame'
export type PatternRegion = 'corner' | 'side' | 'center'
export type PatternConfidence = 'low' | 'medium' | 'high'

export interface KnowledgePatternCard {
  id: string
  title: string
  category: PatternCategory
  patternType: string
  phase: PatternPhase[]
  levels: CoachUserLevel[]
  regions: PatternRegion[]
  tags: string[]
  aliases: string[]
  boardSignals: string[]
  triggers: {
    moveFeatures?: string[]
    candidateFeatures?: string[]
    pvFeatures?: string[]
    contextTags?: string[]
    minMoveNumber?: number
    maxMoveNumber?: number
    minLossScore?: number
    judgements?: string[]
  }
  shape: {
    anchor: string
    canonicalMoves: string[]
    gtpExamples: string[]
    symmetry: 'corner' | 'local'
  }
  variations: Array<{
    name: string
    mainLine: string
    whenToChoose: string
    warning?: string
  }>
  teaching: {
    recognition: string
    correctIdea: string
    memoryCue: string
    commonMistake: string
    drill: string
  }
}

export interface PatternSearchContext {
  userLevel: CoachUserLevel
  phase: PatternPhase
  region: PatternRegion
  boardSize: number
  moveNumber: number
  recentMoves: GameMove[]
  contextTags?: string[]
  text?: string
  playedMove?: string
  candidateMoves?: string[]
  principalVariation?: string[]
  lossScore?: number
  judgement?: string
}

export interface PatternSearchMatch {
  card: KnowledgePatternCard
  score: number
  confidence: PatternConfidence
  reasons: string[]
}

let cachedRoot = ''
let cachedPatterns: KnowledgePatternCard[] | null = null

export function loadKnowledgePatternCards(dataRoot: string): KnowledgePatternCard[] {
  if (cachedPatterns && cachedRoot === dataRoot) {
    return cachedPatterns
  }
  const path = join(dataRoot, 'knowledge', 'pattern-cards.json')
  if (!existsSync(path)) {
    cachedRoot = dataRoot
    cachedPatterns = []
    return cachedPatterns
  }
  try {
    cachedPatterns = JSON.parse(readFileSync(path, 'utf8')) as KnowledgePatternCard[]
  } catch {
    cachedPatterns = []
  }
  cachedRoot = dataRoot
  return cachedPatterns
}

function normalizeTokens(values: Array<string | undefined>): string[] {
  return values
    .flatMap((value) => String(value ?? '').split(/[，。！？、；：,.!?;:()\[\]【】\s\/]+/))
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
}

function gtpToPoint(point: string, boardSize: number): { row: number; col: number } | null {
  const match = point.trim().toUpperCase().match(/^([A-HJ-Z])(\d{1,2})$/)
  if (!match) {
    return null
  }
  const letters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'
  const col = letters.indexOf(match[1])
  const number = Number(match[2])
  if (col < 0 || col >= boardSize || number < 1 || number > boardSize) {
    return null
  }
  return { col, row: boardSize - number }
}

function addPointFeatures(features: Set<string>, row: number, col: number, boardSize: number): void {
  const x = Math.min(col, boardSize - 1 - col)
  const y = Math.min(row, boardSize - 1 - row)
  const minEdge = Math.min(x, y)
  const maxEdge = Math.max(x, y)

  if (x <= 5 && y <= 5) {
    features.add('corner')
  } else if (minEdge <= 3) {
    features.add('side')
  } else {
    features.add('center')
  }
  if (minEdge === 0) features.add('first-line')
  if (minEdge === 1) features.add('second-line')
  if (minEdge === 2) features.add('third-line')
  if (minEdge === 3) features.add('fourth-line')
  if (x === 3 && y === 3) features.add('4-4')
  if (x === 2 && y === 2) features.add('3-3')
  if ((x === 2 && y === 3) || (x === 3 && y === 2)) features.add('3-4')
  if (minEdge <= 3 && maxEdge >= 4 && maxEdge <= 6) features.add('approach')
  if (minEdge <= 2 && maxEdge <= 5) features.add('eye-shape')
}

function moveFeaturesFromGtp(points: string[] | undefined, boardSize: number): Set<string> {
  const features = new Set<string>()
  for (const point of points ?? []) {
    const parsed = gtpToPoint(point, boardSize)
    if (parsed) {
      addPointFeatures(features, parsed.row, parsed.col, boardSize)
    }
  }
  return features
}

function moveFeaturesFromRecord(moves: GameMove[], boardSize: number): Set<string> {
  const features = new Set<string>()
  for (const move of moves) {
    if (move.row === null || move.col === null) {
      continue
    }
    addPointFeatures(features, move.row, move.col, boardSize)
  }
  if (moves.length >= 2) {
    const last = moves[moves.length - 1]
    const prev = moves[moves.length - 2]
    if (last.row !== null && last.col !== null && prev.row !== null && prev.col !== null) {
      const dx = Math.abs(last.col - prev.col)
      const dy = Math.abs(last.row - prev.row)
      if (dx + dy === 1) features.add('contact')
      if ((dx === 1 && dy === 2) || (dx === 2 && dy === 1)) features.add('knight-move')
      if ((dx === 0 && dy === 2) || (dx === 2 && dy === 0)) features.add('jump')
    }
  }
  return features
}

function overlapScore(needles: string[] | undefined, haystack: Set<string>, weight: number, label: string, reasons: string[]): number {
  let score = 0
  for (const needle of needles ?? []) {
    if (haystack.has(needle.toLowerCase())) {
      score += weight
      reasons.push(`${label}:${needle}`)
    }
  }
  return score
}

function textScore(card: KnowledgePatternCard, context: PatternSearchContext, reasons: string[]): number {
  const queryTokens = new Set(normalizeTokens([context.text, ...(context.contextTags ?? [])]))
  if (queryTokens.size === 0) {
    return 0
  }
  const cardTokens = normalizeTokens([
    card.title,
    card.category,
    card.patternType,
    ...card.tags,
    ...card.aliases,
    ...card.boardSignals,
    card.teaching.recognition,
    card.teaching.correctIdea,
    card.teaching.memoryCue
  ])
  let score = 0
  for (const token of queryTokens) {
    if (cardTokens.some((candidate) => candidate.includes(token) || token.includes(candidate))) {
      score += 4
      reasons.push(`text:${token}`)
    }
  }
  return score
}

function confidenceFromScore(score: number): PatternConfidence {
  if (score >= 18) return 'high'
  if (score >= 10) return 'medium'
  return 'low'
}

export function searchKnowledgePatterns(cards: KnowledgePatternCard[], context: PatternSearchContext): PatternSearchMatch[] {
  const contextTags = new Set(normalizeTokens(context.contextTags ?? []))
  const recentFeatures = moveFeaturesFromRecord(context.recentMoves.slice(-8), context.boardSize)
  const playedFeatures = moveFeaturesFromGtp(context.playedMove ? [context.playedMove] : [], context.boardSize)
  const candidateFeatures = moveFeaturesFromGtp(context.candidateMoves, context.boardSize)
  const pvFeatures = moveFeaturesFromGtp(context.principalVariation, context.boardSize)
  const moveFeatures = new Set([...recentFeatures, ...playedFeatures])

  return cards
    .map((card) => {
      let score = 0
      const reasons: string[] = []

      if (card.levels.includes(context.userLevel)) {
        score += 2
        reasons.push(`level:${context.userLevel}`)
      }
      if (card.phase.includes(context.phase)) {
        score += 4
        reasons.push(`phase:${context.phase}`)
      }
      if (card.regions.includes(context.region)) {
        score += 5
        reasons.push(`region:${context.region}`)
      }
      if (context.moveNumber >= (card.triggers.minMoveNumber ?? 0) && context.moveNumber <= (card.triggers.maxMoveNumber ?? Number.POSITIVE_INFINITY)) {
        score += card.triggers.minMoveNumber || card.triggers.maxMoveNumber ? 2 : 0
      }
      if ((context.lossScore ?? 0) >= (card.triggers.minLossScore ?? Number.POSITIVE_INFINITY)) {
        score += 3
        reasons.push(`loss>=${card.triggers.minLossScore}`)
      }
      if (context.judgement && card.triggers.judgements?.includes(context.judgement)) {
        score += 2
        reasons.push(`judgement:${context.judgement}`)
      }

      for (const tag of card.triggers.contextTags ?? []) {
        const normalized = tag.toLowerCase()
        if (contextTags.has(normalized) || [...contextTags].some((item) => item.includes(normalized) || normalized.includes(item))) {
          score += 4
          reasons.push(`tag:${tag}`)
        }
      }

      score += overlapScore(card.triggers.moveFeatures, moveFeatures, 5, 'shape', reasons)
      score += overlapScore(card.triggers.candidateFeatures, candidateFeatures, 6, 'candidate', reasons)
      score += overlapScore(card.triggers.pvFeatures, pvFeatures, 3, 'pv', reasons)
      score += textScore(card, context, reasons)

      if (card.category === 'joseki' && context.phase === 'opening' && context.region === 'corner') {
        score += 3
        reasons.push('joseki-opening-corner')
      }
      if (card.category === 'life_death' && (context.lossScore ?? 0) >= 2 && ['corner', 'side'].includes(context.region)) {
        score += 3
        reasons.push('life-death-risk')
      }

      return {
        card,
        score,
        confidence: confidenceFromScore(score),
        reasons: [...new Set(reasons)].slice(0, 8)
      }
    })
    .filter((match) => match.score >= 8)
    .sort((a, b) => b.score - a.score || a.card.title.localeCompare(b.card.title))
}

export function formatPatternForPrompt(match: PatternSearchMatch): string {
  const { card } = match
  const variations = card.variations
    .slice(0, 3)
    .map((variation, index) => [
      `${index + 1}. ${variation.name}`,
      `   主线: ${variation.mainLine}`,
      `   选择条件: ${variation.whenToChoose}`,
      variation.warning ? `   注意: ${variation.warning}` : ''
    ].filter(Boolean).join('\n'))
    .join('\n')

  return [
    `匹配置信度: ${match.confidence}`,
    `匹配依据: ${match.reasons.join(', ')}`,
    `棋形识别: ${card.teaching.recognition}`,
    `正确思路: ${card.teaching.correctIdea}`,
    `常见变化:\n${variations}`,
    `记忆法: ${card.teaching.memoryCue}`,
    `常见误区: ${card.teaching.commonMistake}`,
    `训练题: ${card.teaching.drill}`,
    '老师使用边界: 只有在棋形和手顺确实相近时才说“这是某定式/死活型”；匹配不完整时要说“这像这个型”，不要硬套。'
  ].join('\n')
}

export function patternToSearchText(card: KnowledgePatternCard): string {
  return [
    card.title,
    card.category,
    card.patternType,
    ...card.tags,
    ...card.aliases,
    ...card.boardSignals,
    ...card.shape.canonicalMoves,
    card.teaching.recognition,
    card.teaching.correctIdea,
    card.teaching.memoryCue,
    card.teaching.commonMistake,
    card.teaching.drill,
    ...card.variations.flatMap((variation) => [variation.name, variation.mainLine, variation.whenToChoose, variation.warning ?? ''])
  ].join(' ')
}
