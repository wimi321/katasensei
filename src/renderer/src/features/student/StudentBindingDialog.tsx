import type { ReactElement } from 'react'
import { useEffect, useMemo, useState } from 'react'
import './student.css'

export interface StudentOption {
  id: string
  displayName: string
  primaryFoxNickname?: string
  aliases?: string[]
}

export interface StudentBindingDialogProps {
  open: boolean
  blackName?: string
  whiteName?: string
  suggestions?: StudentOption[]
  onClose: () => void
  onBindExisting: (input: { studentId: string; color?: 'B' | 'W'; aliasFromPlayerName?: string }) => void
  onCreateStudent: (input: { displayName: string; foxNickname?: string; color?: 'B' | 'W'; aliasFromPlayerName?: string }) => void
  onSkip: () => void
}

export function StudentBindingDialog(props: StudentBindingDialogProps): ReactElement | null {
  const [mode, setMode] = useState<'existing' | 'create'>(props.suggestions?.length ? 'existing' : 'create')
  const [studentId, setStudentId] = useState(props.suggestions?.[0]?.id ?? '')
  const [displayName, setDisplayName] = useState('')
  const [foxNickname, setFoxNickname] = useState('')
  const [color, setColor] = useState<'B' | 'W' | ''>('')

  const playerName = useMemo(() => {
    if (color === 'B') return props.blackName
    if (color === 'W') return props.whiteName
    return ''
  }, [color, props.blackName, props.whiteName])

  useEffect(() => {
    if (!props.open) {
      return
    }
    setMode(props.suggestions?.length ? 'existing' : 'create')
    setStudentId(props.suggestions?.[0]?.id ?? '')
    setDisplayName('')
    setFoxNickname('')
    setColor('')
  }, [props.open, props.blackName, props.whiteName, props.suggestions?.length, props.suggestions?.[0]?.id])

  if (!props.open) return null

  return (
    <div className="student-dialog-backdrop" role="presentation">
      <section className="student-dialog" role="dialog" aria-modal="true" aria-label="绑定棋手画像">
        <header>
          <h2>这盘棋绑定到哪个棋手？</h2>
          <p>老师会把复盘结果写入这个棋手的长期画像，之后分析最近 10 局会自动使用同一份上下文。</p>
        </header>

        <div className="student-player-choice">
          <button className={color === 'B' ? 'is-active' : ''} onClick={() => setColor('B')}>
            黑方：{props.blackName || '未知'}
          </button>
          <button className={color === 'W' ? 'is-active' : ''} onClick={() => setColor('W')}>
            白方：{props.whiteName || '未知'}
          </button>
        </div>

        <div className="student-mode-tabs">
          <button className={mode === 'existing' ? 'is-active' : ''} onClick={() => setMode('existing')}>绑定已有棋手</button>
          <button className={mode === 'create' ? 'is-active' : ''} onClick={() => setMode('create')}>创建新棋手</button>
        </div>

        {mode === 'existing' ? (
          <label>
            选择棋手
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)}>
              <option value="">请选择</option>
              {(props.suggestions ?? []).map((student) => (
                <option key={student.id} value={student.id}>
                  {student.displayName}{student.primaryFoxNickname ? ` · ${student.primaryFoxNickname}` : ''}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="student-create-form">
            <label>
              棋手名
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder={playerName || '输入棋手名'} />
            </label>
            <label>
              野狐昵称（可选）
              <input value={foxNickname} onChange={(event) => setFoxNickname(event.target.value)} placeholder="用于长期画像聚合" />
            </label>
          </div>
        )}

        <footer>
          <button className="ghost-button" onClick={props.onSkip}>暂不绑定</button>
          <button className="ghost-button" onClick={props.onClose}>取消</button>
          {mode === 'existing' ? (
            <button className="primary-button" disabled={!studentId} onClick={() => props.onBindExisting({ studentId, color: color || undefined, aliasFromPlayerName: playerName })}>绑定</button>
          ) : (
            <button className="primary-button" disabled={!displayName.trim() && !playerName} onClick={() => props.onCreateStudent({ displayName: displayName.trim() || playerName || '未命名棋手', foxNickname: foxNickname.trim() || undefined, color: color || undefined, aliasFromPlayerName: playerName })}>创建并绑定</button>
          )}
        </footer>
      </section>
    </div>
  )
}
