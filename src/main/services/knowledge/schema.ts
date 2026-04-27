export type KnowledgeCardKind =
  | 'concept'
  | 'error_type'
  | 'position_pattern'
  | 'training'
  | 'review_method'
  | 'joseki'
  | 'life_death'
  | 'tesuji_pattern'
  | 'shape_pattern'
export type GamePhase = 'opening' | 'middlegame' | 'endgame'

export interface KnowledgeCard {
  id: string
  title: string
  kind: KnowledgeCardKind
  phase: GamePhase[]
  errorTypes: string[]
  tags: string[]
  katagoSignals: string[]
  boardSignals: string[]
  summary: string
  coachShort: string
  coachLong: string
  drill: string
  related: string[]
}

export interface KnowledgeSearchQuery {
  text?: string
  phase?: GamePhase
  errorTypes?: string[]
  tags?: string[]
  limit?: number
}

export interface KnowledgeSearchResult {
  card: KnowledgeCard
  score: number
  reasons: string[]
}
