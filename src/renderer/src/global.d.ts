import type {
  AppSettings,
  AnalyzeGameQuickRequest,
  AnalyzeGameQuickProgress,
  AnalyzePositionRequest,
  DashboardData,
  FoxSyncRequest,
  FoxSyncResult,
  GameRecord,
  LlmSettingsTestRequest,
  LlmSettingsTestResult,
  KataGoMoveAnalysis,
  ReviewRequest,
  ReviewResult,
  StudentProfile,
  TeacherRunRequest,
  TeacherRunResult
} from '@main/lib/types'
import type { DiagnosticsReport } from '@main/services/diagnostics/types'
import type { KnowledgeSearchQuery, KnowledgeSearchResult } from '@main/services/knowledge/schema'

declare global {
  interface Window {
    katasensei: {
      getDashboard: () => Promise<DashboardData>
      getGameRecord: (gameId: string) => Promise<GameRecord>
      importLibrary: () => Promise<DashboardData>
      updateSettings: (payload: Partial<AppSettings>) => Promise<DashboardData>
      autoDetectSettings: () => Promise<DashboardData>
      syncFox: (payload: FoxSyncRequest) => Promise<{ dashboard: DashboardData; result: FoxSyncResult }>
      startReview: (payload: ReviewRequest) => Promise<ReviewResult>
      analyzePosition: (payload: AnalyzePositionRequest) => Promise<KataGoMoveAnalysis>
      analyzeGameQuick: (payload: AnalyzeGameQuickRequest) => Promise<KataGoMoveAnalysis[]>
      onAnalyzeGameQuickProgress: (handler: (payload: AnalyzeGameQuickProgress) => void) => () => void
      getDiagnostics: () => Promise<DiagnosticsReport>
      listStudents: () => Promise<StudentProfile[]>
      resolveStudentByFoxNickname: (nickname: string) => Promise<StudentProfile>
      attachGameToStudent: (payload: { gameId: string; studentId: string }) => Promise<StudentProfile>
      addStudentAlias: (payload: { studentId: string; alias: string }) => Promise<StudentProfile>
      searchKnowledge: (payload: KnowledgeSearchQuery) => Promise<KnowledgeSearchResult[]>
      runTeacherTask: (payload: TeacherRunRequest) => Promise<TeacherRunResult>
      testLlmSettings: (payload: LlmSettingsTestRequest) => Promise<LlmSettingsTestResult>
      openPath: (filePath: string) => Promise<void>
    }
  }
}

export {}
