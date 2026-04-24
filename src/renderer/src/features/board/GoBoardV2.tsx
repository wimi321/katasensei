import type { PointerEvent, ReactElement } from 'react'
import { useMemo, useState } from 'react'
import type { GameRecord, KataGoMoveAnalysis } from '@main/lib/types'
import {
  boardPointLabel,
  getBoardSize,
  renderCandidates,
  renderStones,
  type BoardPoint,
  type RenderCandidate,
  type RenderKeyMove
} from './boardGeometry'
import './board-v2.css'

interface GoBoardV2Props {
  record: GameRecord
  moveNumber: number
  analysis?: KataGoMoveAnalysis | null
  keyMoves?: RenderKeyMove[]
  compact?: boolean
  onPointClick?: (point: BoardPoint) => void
  onCandidateHover?: (candidate: RenderCandidate | null) => void
}

const VIEWBOX = 920
const EDGE = 54
const INNER = VIEWBOX - EDGE * 2
const STAR_CONFIG: Record<number, number[]> = {
  19: [3, 9, 15],
  13: [3, 6, 9],
  9: [2, 4, 6]
}

function xy(point: BoardPoint, boardSize: number): { x: number; y: number } {
  const cell = INNER / (boardSize - 1)
  return {
    x: EDGE + point.x * cell,
    y: EDGE + point.y * cell
  }
}

function coordinateLetters(boardSize: number): string[] {
  return 'ABCDEFGHJKLMNOPQRSTUVWXYZ'.slice(0, boardSize).split('')
}

function starPoints(boardSize: number): BoardPoint[] {
  const anchors = STAR_CONFIG[boardSize] ?? (boardSize >= 15 ? [3, Math.floor(boardSize / 2), boardSize - 4] : [2, Math.floor(boardSize / 2), boardSize - 3])
  return anchors.flatMap((x) => anchors.map((y) => ({ x, y })))
}

function CandidateMark({ candidate, boardSize, onHover }: { candidate: RenderCandidate; boardSize: number; onHover?: (candidate: RenderCandidate | null) => void }): ReactElement {
  const p = xy(candidate, boardSize)
  const className = `ks-candidate ks-candidate--${candidate.emphasis}`
  const subLabel = candidate.scoreLabel ?? candidate.winrateLabel ?? candidate.visitsLabel ?? candidate.label
  return (
    <g
      className={className}
      transform={`translate(${p.x} ${p.y})`}
      onPointerEnter={() => onHover?.(candidate)}
      onPointerLeave={() => onHover?.(null)}
    >
      <circle className="ks-candidate-ring" r="27" />
      <circle className="ks-candidate-disc" r="20" />
      <text className="ks-candidate-rank" y="-2">{candidate.rank}</text>
      <text className="ks-candidate-sub" y="13">{subLabel}</text>
    </g>
  )
}

function KeyMoveMark({ mark, boardSize }: { mark: RenderKeyMove; boardSize: number }): ReactElement {
  const p = xy(mark, boardSize)
  return (
    <g className={`ks-keymove ks-keymove--${mark.severity}`} transform={`translate(${p.x} ${p.y})`}>
      <circle r="31" />
      <text y="-33">{mark.label}</text>
    </g>
  )
}

export function GoBoardV2({ record, moveNumber, analysis = null, keyMoves = [], compact = false, onPointClick, onCandidateHover }: GoBoardV2Props): ReactElement {
  const [hoveredCandidate, setHoveredCandidate] = useState<RenderCandidate | null>(null)
  const boardSize = getBoardSize(record)
  const stones = useMemo(() => renderStones(record, moveNumber), [record, moveNumber])
  const candidates = useMemo(() => renderCandidates(analysis, boardSize), [analysis, boardSize])
  const lastStone = stones[stones.length - 1]
  const letters = coordinateLetters(boardSize)
  const lines = Array.from({ length: boardSize }, (_, index) => index)
  const activeCandidate = hoveredCandidate

  function handleCandidateHover(candidate: RenderCandidate | null): void {
    setHoveredCandidate(candidate)
    onCandidateHover?.(candidate)
  }

  function handlePointerDown(event: PointerEvent<SVGSVGElement>): void {
    if (!onPointClick) {
      return
    }
    const svg = event.currentTarget
    const point = svg.createSVGPoint()
    point.x = event.clientX
    point.y = event.clientY
    const cursor = point.matrixTransform(svg.getScreenCTM()?.inverse())
    const cell = INNER / (boardSize - 1)
    const x = Math.round((cursor.x - EDGE) / cell)
    const y = Math.round((cursor.y - EDGE) / cell)
    if (x >= 0 && y >= 0 && x < boardSize && y < boardSize) {
      onPointClick({ x, y })
    }
  }

  return (
    <div className={`ks-board-shell ${compact ? 'ks-board-shell--compact' : ''}`}>
      <svg className="ks-go-board-v2" viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} role="img" aria-label="围棋棋盘" onPointerDown={handlePointerDown}>
        <defs>
          <linearGradient id="ks-board-wood" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d7a75f" />
            <stop offset="0.38" stopColor="#c18a43" />
            <stop offset="1" stopColor="#93612c" />
          </linearGradient>
          <filter id="ks-board-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="28" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
          </filter>
          <radialGradient id="ks-black-stone" cx="34%" cy="28%" r="72%">
            <stop offset="0" stopColor="#52565a" />
            <stop offset="0.2" stopColor="#23272b" />
            <stop offset="0.72" stopColor="#050607" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <radialGradient id="ks-white-stone" cx="32%" cy="24%" r="75%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.38" stopColor="#eee8dc" />
            <stop offset="0.82" stopColor="#b9b2a7" />
            <stop offset="1" stopColor="#8f887f" />
          </radialGradient>
          <pattern id="ks-board-grain" width="92" height="46" patternUnits="userSpaceOnUse">
            <path d="M0 8 C24 0 46 18 92 8" stroke="rgba(70,35,10,.14)" strokeWidth="2" fill="none" />
            <path d="M0 31 C30 44 58 23 92 36" stroke="rgba(255,232,165,.10)" strokeWidth="1.5" fill="none" />
          </pattern>
        </defs>

        <rect className="ks-board-drop" x="20" y="20" width="880" height="880" rx="30" filter="url(#ks-board-shadow)" />
        <rect className="ks-board-surface-v2" x="28" y="28" width="864" height="864" rx="26" />
        <rect x="28" y="28" width="864" height="864" rx="26" fill="url(#ks-board-grain)" opacity="0.55" />

        <g className="ks-grid-lines">
          {lines.map((index) => {
            const start = xy({ x: 0, y: index }, boardSize)
            const end = xy({ x: boardSize - 1, y: index }, boardSize)
            const verticalStart = xy({ x: index, y: 0 }, boardSize)
            const verticalEnd = xy({ x: index, y: boardSize - 1 }, boardSize)
            return (
              <g key={index}>
                <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
                <line x1={verticalStart.x} y1={verticalStart.y} x2={verticalEnd.x} y2={verticalEnd.y} />
              </g>
            )
          })}
        </g>

        <g className="ks-star-points">
          {starPoints(boardSize).map((point) => {
            const p = xy(point, boardSize)
            return <circle key={`${point.x}-${point.y}`} cx={p.x} cy={p.y} r="6" />
          })}
        </g>

        <g className="ks-board-coordinates-v2">
          {letters.map((letter, index) => {
            const top = xy({ x: index, y: 0 }, boardSize)
            const left = xy({ x: 0, y: index }, boardSize)
            return (
              <g key={letter}>
                <text x={top.x} y="31">{letter}</text>
                <text x={top.x} y="898">{letter}</text>
                <text x="30" y={left.y + 5}>{boardSize - index}</text>
                <text x="895" y={left.y + 5}>{boardSize - index}</text>
              </g>
            )
          })}
        </g>

        <g className="ks-keymoves-layer">
          {keyMoves.map((mark) => <KeyMoveMark key={`${mark.moveNumber}-${mark.label}`} mark={mark} boardSize={boardSize} />)}
        </g>

        <g className="ks-stones-layer">
          {stones.map((stone) => {
            const p = xy(stone, boardSize)
            const isLast = stone.moveNumber === lastStone?.moveNumber
            return (
              <g key={stone.moveNumber} className={`ks-stone ks-stone--${stone.color}`} transform={`translate(${p.x} ${p.y})`}>
                <circle r="22" />
                {isLast ? <circle className={`ks-last-move ks-last-move--${stone.color}`} r="8" /> : null}
              </g>
            )
          })}
        </g>

        <g className="ks-candidates-layer">
          {candidates.map((candidate) => (
            <CandidateMark key={`${candidate.rank}-${candidate.label}`} candidate={candidate} boardSize={boardSize} onHover={handleCandidateHover} />
          ))}
        </g>
      </svg>

      {activeCandidate ? (
        <div className="ks-board-tooltip" role="status">
          <strong>推荐 {activeCandidate.rank}: {activeCandidate.label}</strong>
          <span>{[activeCandidate.winrateLabel, activeCandidate.scoreLabel ? `目差 ${activeCandidate.scoreLabel}` : '', activeCandidate.visitsLabel ? `${activeCandidate.visitsLabel} visits` : ''].filter(Boolean).join(' · ')}</span>
        </div>
      ) : null}
    </div>
  )
}
