import type { ReactElement } from 'react'
import './student.css'

export interface StudentRailCardProps {
  displayName?: string
  primaryFoxNickname?: string
  gameCount?: number
  disabled?: boolean
  onChangeBinding?: () => void
}

export function StudentRailCard({
  displayName,
  primaryFoxNickname,
  gameCount = 0,
  disabled = false,
  onChangeBinding
}: StudentRailCardProps): ReactElement {
  const name = displayName || primaryFoxNickname || '未绑定棋手'
  const hasPlayer = Boolean(displayName || primaryFoxNickname)
  const meta = hasPlayer
    ? `${primaryFoxNickname ? `Fox ${primaryFoxNickname}` : '本地棋手'} · ${gameCount} 盘`
    : '点击绑定'
  return (
    <section className="student-rail-card">
      <button
        type="button"
        className="student-rail-card__button"
        disabled={disabled}
        onClick={onChangeBinding}
        aria-label={hasPlayer ? `修改绑定棋手：${name}` : '绑定棋手'}
      >
        <span>棋手</span>
        <strong>{name}</strong>
        <small>{meta}</small>
        <em>{hasPlayer ? '修改' : '绑定'}</em>
      </button>
    </section>
  )
}
