import { supabase } from '../lib/supabase';
import { GameType, AssessmentPath } from '../types';

export class AssessmentPathManager {
  async createPath(
    childId: string,
    pathType: 'single' | 'all',
    targetGames: GameType[]
  ): Promise<AssessmentPath> {
    const { data, error } = await supabase
      .from('assessment_paths')
      .insert({
        child_id: childId,
        path_type: pathType,
        target_games: targetGames,
        completed_games: [],
        session_ids: [],
        total_games: targetGames.length,
        completed_games_count: 0,
        total_duration_seconds: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getActivePath(childId: string): Promise<AssessmentPath | null> {
    const { data, error } = await supabase
      .from('assessment_paths')
      .select('*')
      .eq('child_id', childId)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getPathById(pathId: string): Promise<AssessmentPath | null> {
    const { data, error } = await supabase
      .from('assessment_paths')
      .select('*')
      .eq('id', pathId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async addGameToPath(
    pathId: string,
    gameType: GameType,
    sessionId: string
  ): Promise<void> {
    const path = await this.getPathById(pathId);
    if (!path) throw new Error('Path not found');

    const completedGames = [...path.completed_games, gameType];
    const sessionIds = [...path.session_ids, sessionId];
    const completedCount = completedGames.length;

    const isCompleted = completedCount === path.total_games;

    const { error } = await supabase
      .from('assessment_paths')
      .update({
        completed_games: completedGames,
        session_ids: sessionIds,
        completed_games_count: completedCount,
        status: isCompleted ? 'completed' : 'in_progress',
        completed_at: isCompleted ? new Date().toISOString() : null,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', pathId);

    if (error) throw error;
  }

  async isGameCompletedInPath(
    pathId: string,
    gameType: GameType
  ): Promise<boolean> {
    const path = await this.getPathById(pathId);
    if (!path) return false;

    return path.completed_games.includes(gameType);
  }

  async updatePathScore(pathId: string, sessionData: {
    score: number;
    duration: number;
  }): Promise<void> {
    const path = await this.getPathById(pathId);
    if (!path) throw new Error('Path not found');

    const totalDuration = path.total_duration_seconds + sessionData.duration;
    const averageScore =
      path.average_score
        ? (path.average_score * path.completed_games_count + sessionData.score) /
          (path.completed_games_count + 1)
        : sessionData.score;

    const { error } = await supabase
      .from('assessment_paths')
      .update({
        average_score: averageScore,
        total_duration_seconds: totalDuration,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pathId);

    if (error) throw error;
  }

  async linkComprehensiveReport(
    pathId: string,
    reportId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('assessment_paths')
      .update({
        comprehensive_report_id: reportId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pathId);

    if (error) throw error;
  }

  async abandonPath(pathId: string): Promise<void> {
    const { error } = await supabase
      .from('assessment_paths')
      .update({
        status: 'abandoned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', pathId);

    if (error) throw error;
  }

  async getAllPathsForChild(childId: string): Promise<AssessmentPath[]> {
    const { data, error } = await supabase
      .from('assessment_paths')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCompletedPaths(childId: string): Promise<AssessmentPath[]> {
    const { data, error } = await supabase
      .from('assessment_paths')
      .select('*')
      .eq('child_id', childId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getNextGameInPath(pathId: string): Promise<GameType | null> {
    const path = await this.getPathById(pathId);
    if (!path) return null;

    const nextGame = path.target_games.find(
      (game) => !path.completed_games.includes(game)
    );

    return nextGame || null;
  }

  async getPathProgress(pathId: string): Promise<{
    completed: number;
    total: number;
    percentage: number;
    nextGame: GameType | null;
  }> {
    const path = await this.getPathById(pathId);
    if (!path) {
      return { completed: 0, total: 0, percentage: 0, nextGame: null };
    }

    const completed = path.completed_games_count;
    const total = path.total_games;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const nextGame = await this.getNextGameInPath(pathId);

    return { completed, total, percentage, nextGame };
  }
}

export const assessmentPathManager = new AssessmentPathManager();
