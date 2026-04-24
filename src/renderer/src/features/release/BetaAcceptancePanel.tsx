import type { ReactElement } from 'react'
import type { ReleaseReadinessFlags } from '@main/lib/types'

export interface BetaAcceptanceItem {
  id: string
  label: string
  status: 'pass' | 'warn' | 'fail' | 'unknown'
  detail?: string
}

export interface BetaAcceptancePanelProps {
  items: BetaAcceptanceItem[]
  flags?: ReleaseReadinessFlags
  onRunChecks?: () => void
}

const statusLabel: Record<BetaAcceptanceItem['status'], string> = {
  pass: '通过',
  warn: '警告',
  fail: '失败',
  unknown: '未检查'
}

export function BetaAcceptancePanel({ items, flags, onRunChecks }: BetaAcceptancePanelProps): ReactElement {
  const failCount = items.filter((item) => item.status === 'fail').length
  const warnCount = items.filter((item) => item.status === 'warn').length
  const passCount = items.filter((item) => item.status === 'pass').length
  const publicBetaReady = flags?.publicBetaReady ?? failCount === 0

  return (
    <section className="beta-acceptance-panel">
      <div className="beta-acceptance-panel__head">
        <div>
          <strong>P0 Beta 验收</strong>
          <small>
            {publicBetaReady ? 'Public Beta Ready' : 'Public Beta 未就绪'} · {passCount} 通过 · {warnCount} 警告 · {failCount} 失败
          </small>
        </div>
        {onRunChecks ? <button type="button" onClick={onRunChecks}>重新检查</button> : null}
      </div>
      {flags ? (
        <div className="beta-acceptance-panel__flags">
          <span data-ready={flags.automationReady}>自动化</span>
          <span data-ready={flags.assetsReady}>资源</span>
          <span data-ready={flags.installersReady}>安装包</span>
          <span data-ready={flags.signingReady}>签名</span>
          <span data-ready={flags.windowsSmokeReady}>Windows smoke</span>
          <span data-ready={flags.visualQaReady}>视觉 QA</span>
        </div>
      ) : null}
      <div className="beta-acceptance-panel__list">
        {items.map((item) => (
          <article key={item.id} className={`beta-check beta-check--${item.status}`}>
            <span>{statusLabel[item.status]}</span>
            <div>
              <strong>{item.label}</strong>
              {item.detail ? <small>{item.detail}</small> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
