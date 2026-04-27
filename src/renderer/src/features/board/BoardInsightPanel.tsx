import type { ReactElement } from 'react'
import type { KataGoMoveAnalysis } from '@main/lib/types'
import { formatScore, formatWinrate, renderCandidates } from './boardGeometry'
import './board-v2.css'

interface BoardInsightPanelProps {
  analysis?: KataGoMoveAnalysis | null
  moveNumber: number
  loading?: boolean
}

function valueOf(record: unknown, key: string): unknown {
  return typeof record === 'object' && record !== null ? (record as Record<string, unknown>)[key] : undefined
}

export function BoardInsightPanel({ analysis, moveNumber, loading = false }: BoardInsightPanelProps): ReactElement {
  const candidates = renderCandidates(analysis, 19)
  const after = valueOf(analysis, 'after')
  const winrate = formatWinrate(valueOf(after, 'winrate')) ?? '—'
  const scoreLead = formatScore(valueOf(after, 'scoreLead')) ?? '—'
  const best = candidates[0]
  return (
    <aside className="ks-board-insight ks-surface-card">
      <div className="ks-board-insight__head">
        <span>第 {moveNumber} 手分析</span>
        <small>{loading ? 'KataGo 分析中' : analysis ? '已就绪' : '暂无分析'}</small>
      </div>
      <div className="ks-board-insight__metrics">
        <div>
          <small>黑胜率</small>
          <strong>{winrate}</strong>
        </div>
        <div>
          <small>目差</small>
          <strong>{scoreLead}</strong>
        </div>
        <div>
          <small>首选</small>
          <strong>{best?.label ?? '—'}</strong>
        </div>
      </div>
      <div className="ks-board-insight__candidates">
        {candidates.slice(0, 4).map((candidate) => (
          <div key={`${candidate.rank}-${candidate.label}`} className={`ks-board-candidate-row ks-board-candidate-row--${candidate.emphasis}`}>
            <span>{candidate.rank}</span>
            <strong>{candidate.label}</strong>
            <small>{[candidate.winrateLabel, candidate.scoreLabel].filter(Boolean).join(' · ') || '候选点'}</small>
          </div>
        ))}
        {candidates.length === 0 ? <p>点击“分析当前手”后，这里会展示 KataGo 推荐点。</p> : null}
      </div>
    </aside>
  )
}
