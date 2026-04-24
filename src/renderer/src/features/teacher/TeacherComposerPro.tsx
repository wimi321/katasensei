import type { FormEvent, ReactElement } from 'react'
import './teacher-pro.css'

interface TeacherComposerProProps {
  value: string
  busy?: boolean
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

export function TeacherComposerPro({ value, busy = false, onChange, onSubmit, onQuickPrompt }: TeacherComposerProProps): ReactElement {
  return (
    <form className="ks-composer-pro" onSubmit={onSubmit}>
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
          placeholder="像问老师一样追问：这手的问题、整盘转折点、最近弱点、下一步训练..."
        />
        <button type="submit" disabled={busy || !value.trim()}>
          {busy ? '分析中' : '发送'}
        </button>
      </div>
    </form>
  )
}
