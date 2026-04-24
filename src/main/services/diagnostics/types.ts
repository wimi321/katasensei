export type DiagnosticStatus = 'pass' | 'warn' | 'fail'
export type DiagnosticsOverall = 'ready' | 'fixable' | 'blocked'

export interface DiagnosticCheck {
  id: string
  title: string
  status: DiagnosticStatus
  required: boolean
  detail: string
  action?: string
  technicalDetail?: string
}

export interface DiagnosticsReport {
  overall: DiagnosticsOverall
  summary: string
  generatedAt: string
  checks: DiagnosticCheck[]
}
