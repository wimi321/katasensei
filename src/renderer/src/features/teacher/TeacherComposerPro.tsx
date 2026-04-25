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
      <div className="ks-composer-pro__chrome">
        <span>Agent Prompt</span>
        <small>{busy ? '老师正在执行工具链' : '输入任务，老师会规划并执行'}</small>
      </div>
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
          placeholder="让老师执行任务：分析当前手、总结最近 10 局、生成训练计划、解释某个候选点..."
        />
        <button type="submit" disabled={busy || !value.trim()}>
          {busy ? '分析中' : '发送'}
        </button>
      </div>
    </form>
  )
}
