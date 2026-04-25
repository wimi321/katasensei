import type { ReactElement } from 'react'
import './student.css'

export interface StudentRailCardProps {
  displayName?: string
  primaryFoxNickname?: string
  gameCount?: number
}

export function StudentRailCard({
  displayName,
  primaryFoxNickname,
  gameCount = 0
}: StudentRailCardProps): ReactElement {
  const name = displayName || primaryFoxNickname || '未绑定学生'
  return (
    <section className="student-rail-card">
      <span>学生</span>
      <strong>{name}</strong>
      <small>{gameCount} 盘</small>
    </section>
  )
}
