import type { ReactElement } from 'react'

export interface TeacherKeyMistakeView {
  moveNumber?: number
  errorType: string
  severity: string
  explanation: string
  evidence: string
}

export interface TeacherResultView {
  headline: string
  summary: string
  keyMistakes: TeacherKeyMistakeView[]
  correctThinking: string[]
  drills: string[]
  followupQuestions: string[]
}

export function TeacherResultCard({ result }: { result: TeacherResultView }): ReactElement {
  return (
    <article className="teacher-result-card">
      <header>
        <p className="eyebrow">老师结论</p>
        <h3>{result.headline}</h3>
        <p>{result.summary}</p>
      </header>

      {result.keyMistakes.length > 0 ? (
        <section>
          <h4>关键问题手</h4>
          <div className="mistake-list">
            {result.keyMistakes.map((mistake, index) => (
              <div key={`${mistake.moveNumber ?? 'x'}-${index}`} className={`mistake-card mistake-card--${mistake.severity}`}>
                <strong>{mistake.moveNumber ? `第 ${mistake.moveNumber} 手` : '问题点'} · {mistake.errorType}</strong>
                <p>{mistake.explanation}</p>
                <small>{mistake.evidence}</small>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="teacher-two-column">
        <div>
          <h4>正确思路</h4>
          <ul>{result.correctThinking.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <h4>训练建议</h4>
          <ul>{result.drills.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      {result.followupQuestions.length > 0 ? (
        <footer>
          <h4>可以继续追问</h4>
          <div className="followup-chips">{result.followupQuestions.map((item) => <span key={item}>{item}</span>)}</div>
        </footer>
      ) : null}
    </article>
  )
}
