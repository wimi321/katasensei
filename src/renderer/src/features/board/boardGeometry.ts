import type { GameMove, GameRecord, KataGoCandidate, KataGoMoveAnalysis, StoneColor } from '@main/lib/types'

export interface BoardPoint {
  x: number
  y: number
}

export interface RenderStone extends BoardPoint {
  moveNumber: number
  color: StoneColor
  label?: string
  raw?: unknown
}

export interface RenderCandidate extends BoardPoint {
  rank: number
  label: string
  winrateLabel?: string
  scoreLabel?: string
  visitsLabel?: string
  emphasis: 'primary' | 'secondary' | 'quiet'
  raw?: unknown
}

export interface RenderPlayedMove extends BoardPoint {
  label: string
  move: string
  color: StoneColor
  winrateLabel?: string
  scoreLabel?: string
  visitsLabel?: string
  rank?: number
  winrateLoss?: number
  scoreLoss?: number
  raw?: unknown
}

export interface RenderKeyMove extends BoardPoint {
  moveNumber: number
  severity: 'blunder' | 'mistake' | 'inaccuracy' | 'turning-point'
  label: string
}

const GTP_LETTERS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'

function valueOf(record: unknown, key: string): unknown {
  return typeof record === 'object' && record !== null ? (record as Record<string, unknown>)[key] : undefined
}

export function getBoardSize(record?: GameRecord | null): number {
  const size = valueOf(record, 'boardSize') ?? valueOf(valueOf(record, 'game'), 'boardSize') ?? valueOf(record, 'size')
  return typeof size === 'number' && Number.isFinite(size) && size >= 2 ? size : 19
}

export function normalizeWinrate(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null
  }
  if (value <= 1.00001) {
    return Math.max(0, Math.min(1, value))
  }
  return Math.max(0, Math.min(1, value / 100))
}

export function formatWinrate(value: unknown): string | undefined {
  const normalized = normalizeWinrate(value)
  return normalized === null ? undefined : `${Math.round(normalized * 100)}%`
}

export function formatScore(value: unknown): string | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return undefined
  }
  const rounded = Math.abs(value) >= 10 ? value.toFixed(0) : value.toFixed(1)
  return `${value > 0 ? '+' : ''}${rounded}`
}

export function parseBoardPoint(input: unknown, boardSize = 19): BoardPoint | null {
  if (!input) {
    return null
  }
  if (typeof input === 'object') {
    const x = valueOf(input, 'x')
    const y = valueOf(input, 'y')
    if (typeof x === 'number' && typeof y === 'number') {
      return clampBoardPoint({ x, y }, boardSize)
    }
    const point = valueOf(input, 'point') ?? valueOf(input, 'gtp') ?? valueOf(input, 'move') ?? valueOf(input, 'loc')
    return parseBoardPoint(point, boardSize)
  }
  if (typeof input !== 'string') {
    return null
  }

  const trimmed = input.trim().toUpperCase()
  if (!trimmed || trimmed === 'PASS' || trimmed === 'RESIGN') {
    return null
  }

  // SGF coordinate, e.g. "dd".
  if (/^[A-Z]{2}$/.test(trimmed) && !/\d/.test(trimmed)) {
    const sx = trimmed.charCodeAt(0) - 65
    const sy = trimmed.charCodeAt(1) - 65
    return clampBoardPoint({ x: sx, y: sy }, boardSize)
  }

  // GTP coordinate, e.g. "D4". GTP skips I.
  const match = trimmed.match(/^([A-Z])(\d{1,2})$/)
  if (!match) {
    return null
  }
  const letter = match[1]
  const row = Number(match[2])
  const x = GTP_LETTERS.indexOf(letter)
  if (x < 0 || row < 1 || row > boardSize) {
    return null
  }
  const y = boardSize - row
  return clampBoardPoint({ x, y }, boardSize)
}

export function clampBoardPoint(point: BoardPoint, boardSize = 19): BoardPoint | null {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    return null
  }
  const x = Math.round(point.x)
  const y = Math.round(point.y)
  if (x < 0 || y < 0 || x >= boardSize || y >= boardSize) {
    return null
  }
  return { x, y }
}

export function boardPointLabel(point: BoardPoint, boardSize = 19): string {
  return `${GTP_LETTERS[point.x] ?? '?'}${boardSize - point.y}`
}

export function moveToPoint(move: GameMove | unknown, boardSize = 19): BoardPoint | null {
  return parseBoardPoint(move, boardSize)
}

export function moveToColor(move: GameMove | unknown): StoneColor {
  const color = valueOf(move, 'color')
  return color === 'W' ? 'W' : 'B'
}

export function candidateToPoint(candidate: KataGoCandidate | unknown, boardSize = 19): BoardPoint | null {
  return parseBoardPoint(candidate, boardSize)
}

export function getCandidateWinrate(candidate: unknown): unknown {
  return valueOf(candidate, 'winrate') ?? valueOf(candidate, 'winrateMean') ?? valueOf(candidate, 'utility')
}

export function getCandidateScore(candidate: unknown): unknown {
  return valueOf(candidate, 'scoreLead') ?? valueOf(candidate, 'scoreMean') ?? valueOf(candidate, 'score')
}

export function getCandidateVisits(candidate: unknown): unknown {
  return valueOf(candidate, 'visits') ?? valueOf(candidate, 'visitCount')
}

export function renderStones(record: GameRecord, moveNumber: number): RenderStone[] {
  const boardSize = getBoardSize(record)
  const moves = Array.isArray(record.moves) ? record.moves : []
  return moves.slice(0, Math.max(0, moveNumber)).flatMap((move, index) => {
    const point = moveToPoint(move, boardSize)
    if (!point) {
      return []
    }
    return [{ ...point, moveNumber: index + 1, color: moveToColor(move), raw: move } satisfies RenderStone]
  })
}

export function renderCandidates(analysis: KataGoMoveAnalysis | null | undefined, boardSize = 19): RenderCandidate[] {
  if (!analysis) {
    return []
  }
  const topMoves =
    Array.isArray(valueOf(valueOf(analysis, 'before'), 'topMoves'))
      ? valueOf(valueOf(analysis, 'before'), 'topMoves') as unknown[]
      : Array.isArray(valueOf(valueOf(analysis, 'after'), 'topMoves'))
        ? valueOf(valueOf(analysis, 'after'), 'topMoves') as unknown[]
        : []

  return topMoves.slice(0, 6).flatMap((candidate, index) => {
    const point = candidateToPoint(candidate, boardSize)
    if (!point) {
      return []
    }
    const visits = getCandidateVisits(candidate)
    const visitsLabel = typeof visits === 'number' ? `${visits}` : undefined
    return [{
      ...point,
      rank: index + 1,
      label: boardPointLabel(point, boardSize),
      winrateLabel: formatWinrate(getCandidateWinrate(candidate)),
      scoreLabel: formatScore(getCandidateScore(candidate)),
      visitsLabel,
      emphasis: index === 0 ? 'primary' : index <= 2 ? 'secondary' : 'quiet',
      raw: candidate
    } satisfies RenderCandidate]
  })
}

export function renderPlayedMove(analysis: KataGoMoveAnalysis | null | undefined, boardSize = 19): RenderPlayedMove | null {
  if (!analysis?.currentMove || !analysis.playedMove) {
    return null
  }
  const point = moveToPoint(analysis.currentMove, boardSize) ?? parseBoardPoint(analysis.playedMove.move, boardSize)
  if (!point) {
    return null
  }
  const beforeMoves = Array.isArray(valueOf(valueOf(analysis, 'before'), 'topMoves'))
    ? valueOf(valueOf(analysis, 'before'), 'topMoves') as unknown[]
    : []
  const playedMove = String(valueOf(analysis.playedMove, 'move') ?? analysis.currentMove.gtp ?? '').toUpperCase()
  const candidateIndex = beforeMoves.findIndex((candidate) => String(valueOf(candidate, 'move') ?? '').toUpperCase() === playedMove)
  const matchedCandidate = candidateIndex >= 0 ? beforeMoves[candidateIndex] : null
  const visits = valueOf(analysis.playedMove, 'visits') ?? getCandidateVisits(matchedCandidate)
  return {
    ...point,
    label: boardPointLabel(point, boardSize),
    move: playedMove || boardPointLabel(point, boardSize),
    color: moveToColor(analysis.currentMove),
    winrateLabel: formatWinrate(valueOf(analysis.playedMove, 'winrate')),
    scoreLabel: formatScore(valueOf(analysis.playedMove, 'scoreLead')),
    visitsLabel: typeof visits === 'number' && visits > 0 ? `${Math.round(visits)}` : undefined,
    rank: typeof valueOf(analysis.playedMove, 'rank') === 'number'
      ? valueOf(analysis.playedMove, 'rank') as number
      : candidateIndex >= 0 ? candidateIndex + 1 : undefined,
    winrateLoss: valueOf(analysis.playedMove, 'winrateLoss') as number | undefined,
    scoreLoss: valueOf(analysis.playedMove, 'scoreLoss') as number | undefined,
    raw: analysis.playedMove
  }
}

export function classifyMoveLoss(loss: unknown): RenderKeyMove['severity'] {
  if (typeof loss !== 'number' || Number.isNaN(loss)) {
    return 'turning-point'
  }
  const normalized = Math.abs(loss) > 1 ? Math.abs(loss) / 100 : Math.abs(loss)
  if (normalized >= 0.18) return 'blunder'
  if (normalized >= 0.09) return 'mistake'
  if (normalized >= 0.04) return 'inaccuracy'
  return 'turning-point'
}

export function getAnalysisWinrate(analysis: unknown): number | null {
  return normalizeWinrate(valueOf(valueOf(analysis, 'after'), 'winrate') ?? valueOf(analysis, 'winrate'))
}

export function getAnalysisMoveNumber(analysis: unknown): number | null {
  const moveNumber = valueOf(analysis, 'moveNumber')
  return typeof moveNumber === 'number' ? moveNumber : null
}
