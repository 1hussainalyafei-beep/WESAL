export interface Child {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string;
  birth_date: string;
  created_at: string;
  updated_at: string;
}

export type GameType = 'memory' | 'attention' | 'logic' | 'visual' | 'pattern' | 'creative';

export interface GameSession {
  id: string;
  child_id: string;
  game_type: GameType;
  raw_data: Record<string, any>;
  score: number;
  duration_seconds: number;
  completed_at: string;
  created_at: string;
}

export interface GameReport {
  id: string;
  session_id: string;
  analysis: string;
  performance_score: number;
  strengths: string[];
  recommendations: string[];
  level: 'below_normal' | 'normal' | 'above_normal';
  created_at: string;
}

export interface ComprehensiveReport {
  id: string;
  child_id: string;
  assessment_date: string;
  overall_score: number;
  cognitive_map: {
    memory: number;
    attention: number;
    logic: number;
    visual: number;
    pattern: number;
    creative: number;
  };
  detailed_analysis: string;
  recommendations: string[];
  specialist_alert: string;
  encouragement: string;
  created_at: string;
}

export interface BehaviorLog {
  id: string;
  child_id: string;
  event_type: string;
  game_type: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Consultation {
  id: string;
  child_id: string;
  specialist_id: string;
  report_id: string | null;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  appointment_date: string | null;
  notes: string;
  created_at: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  recommended_for: string[];
  created_at: string;
}

export interface AssessmentPath {
  id: string;
  child_id: string;
  path_type: 'single' | 'all';
  status: 'in_progress' | 'completed' | 'abandoned';
  target_games: GameType[];
  completed_games: GameType[];
  session_ids: string[];
  comprehensive_report_id: string | null;
  total_games: number;
  completed_games_count: number;
  average_score: number | null;
  total_duration_seconds: number;
  started_at: string;
  completed_at: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}
