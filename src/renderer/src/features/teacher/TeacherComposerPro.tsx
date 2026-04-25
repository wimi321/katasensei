import type { FormEvent, ReactElement } from 'react'
import './teacher-pro.css'

interface TeacherComposerProProps {
  value: string
  busy?: boolean
  actions?: Array<{
    label: string
    onClick: () => void
    disabled?: boolean
    primary?: boolean
  }>
  onChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
  onQuickPrompt?: (prompt: string) => void
}

const QUICK_PROMPTS = [
  '这盘最大的问题是什么？',
  '我这手为什么不好？',
  '按我的画像给训练建议',
  '最近10局共同弱点是什么？'
]

export function TeacherComposerPro({ value, busy = false, actions = [], onChange, onSubmit, onQuickPrompt }: TeacherComposerProProps): ReactElement {
  return (
    <form className="ks-composer-pro" onSubmit={onSubmit}>
      <div className="ks-composer-pro__chrome">
        <span>Ask KataSensei</span>
        <small>{busy ? 'Running tools...' : 'Ready for a task'}</small>
      </div>
      {actions.length > 0 ? (
        <div className="ks-composer-pro__actions" aria-label="老师快捷动作">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={action.primary ? 'is-primary' : ''}
              onClick={action.onClick}
              disabled={busy || action.disabled}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="ks-composer-pro__quick">
        {QUICK_PROMPTS.map((prompt) => (
          <button key={prompt} type="button" onClick={() => onQuickPrompt?.(prompt)} disabled={busy}>
            {prompt}
          </button>
        ))}
      </div>
      <div className="ks-composer-pro__box">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="输入任务，例如：分析当前手、总结最近 10 局、解释第 87 手为什么亏..."
        />
        <button type="submit" disabled={busy || !value.trim()}>
          {busy ? '分析中' : '发送'}
        </button>
      </div>
    </form>
  )
}
