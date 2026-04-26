import type { ReactElement } from 'react'
import './student.css'

export interface StudentRailCardProps {
  displayName?: string
  primaryFoxNickname?: string
  disabled?: boolean
  onChangeBinding?: () => void
}

export function StudentRailCard({
  displayName,
  primaryFoxNickname,
  disabled = false,
  onChangeBinding
}: StudentRailCardProps): ReactElement {
  const name = displayName || primaryFoxNickname || '未绑定棋手'
  const hasPlayer = Boolean(displayName || primaryFoxNickname)
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
        <em>{hasPlayer ? '修改' : '绑定'}</em>
      </button>
    </section>
  )
}
