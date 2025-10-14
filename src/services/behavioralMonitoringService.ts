import { supabase } from '../lib/supabase';
import { GameType } from '../types';

interface BehavioralPattern {
  pattern_type:
    | 'regular'
    | 'hesitant'
    | 'avoidant'
    | 'hyperactive'
    | 'stable'
    | 'repetitive'
    | 'early_exit'
    | 'focused';
  game_type?: GameType;
  frequency: number;
  duration_average?: number;
  context: any;
  triggers?: string[];
  severity: 'low' | 'medium' | 'high';
  ai_interpretation?: string;
  recommended_action?: string;
}

export class BehavioralMonitor {
  private childId: string;

  constructor(childId: string) {
    this.childId = childId;
  }

  async trackGameStart(gameType: GameType) {
    await supabase.from('behavior_logs').insert({
      child_id: this.childId,
      event_type: 'game_start',
      game_type: gameType,
      metadata: { timestamp: Date.now() },
    });
  }

  async trackGameComplete(gameType: GameType, duration: number, score: number) {
    await supabase.from('behavior_logs').insert({
      child_id: this.childId,
      event_type: 'game_complete',
      game_type: gameType,
      metadata: { duration, score, timestamp: Date.now() },
    });

    await this.analyzeBehavioralPatterns(gameType);
  }

  async trackGameQuit(gameType: GameType, duration: number, reason?: string) {
    await supabase.from('behavior_logs').insert({
      child_id: this.childId,
      event_type: 'game_quit',
      game_type: gameType,
      metadata: { duration, reason, timestamp: Date.now() },
    });

    await this.detectEarlyExitPattern(gameType);
  }

  async trackHesitation(gameType: GameType, hes

itationTime: number) {
    await supabase.from('behavior_logs').insert({
      child_id: this.childId,
      event_type: 'hesitation',
      game_type: gameType,
      metadata: { hesitationTime, timestamp: Date.now() },
    });
  }

  private async analyzeBehavioralPatterns(gameType: GameType) {
    const { data: recentSessions } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('child_id', this.childId)
      .eq('game_type', gameType)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!recentSessions || recentSessions.length < 3) return;

    const completionRate =
      recentSessions.filter((s) => s.completed).length / recentSessions.length;

    if (completionRate < 0.5) {
      await this.recordPattern({
        pattern_type: 'avoidant',
        game_type: gameType,
        frequency: recentSessions.length,
        context: { completionRate },
        severity: completionRate < 0.3 ? 'high' : 'medium',
        ai_interpretation: `الطفل يظهر نمط تجنب للعبة ${this.getGameNameArabic(gameType)}`,
        recommended_action: `حاول تقديم اللعبة بطريقة أكثر جاذبية أو تقليل صعوبتها`,
      });
    }

    const avgScore =
      recentSessions.reduce((sum, s) => sum + (s.score || 0), 0) /
      recentSessions.length;
    const scoreVariance = this.calculateVariance(
      recentSessions.map((s) => s.score || 0)
    );

    if (scoreVariance < 100) {
      await this.recordPattern({
        pattern_type: 'stable',
        game_type: gameType,
        frequency: recentSessions.length,
        context: { avgScore, scoreVariance },
        severity: 'low',
        ai_interpretation: `أداء الطفل مستقر في لعبة ${this.getGameNameArabic(gameType)}`,
        recommended_action: `يمكن الانتقال لمستوى أعلى من التحدي`,
      });
    }
  }

  private async detectEarlyExitPattern(gameType: GameType) {
    const { data: exits } = await supabase
      .from('behavior_logs')
      .select('*')
      .eq('child_id', this.childId)
      .eq('event_type', 'game_quit')
      .eq('game_type', gameType)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (exits && exits.length >= 3) {
      await this.recordPattern({
        pattern_type: 'early_exit',
        game_type: gameType,
        frequency: exits.length,
        context: { lastWeekExits: exits.length },
        triggers: ['difficulty', 'frustration', 'distraction'],
        severity: exits.length > 5 ? 'high' : 'medium',
        ai_interpretation: `الطفل يخرج مبكراً من لعبة ${this.getGameNameArabic(gameType)} بشكل متكرر`,
        recommended_action: `افحص مستوى صعوبة اللعبة أو قدم حوافز للإكمال`,
      });
    }
  }

  private async detectRepetitionPattern(gameType: GameType) {
    const { data: recentLogs } = await supabase
      .from('behavior_logs')
      .select('*')
      .eq('child_id', this.childId)
      .eq('game_type', gameType)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!recentLogs) return;

    const startEvents = recentLogs.filter((l) => l.event_type === 'game_start');
    const completeEvents = recentLogs.filter((l) => l.event_type === 'game_complete');

    if (startEvents.length >= 5 && completeEvents.length < 2) {
      await this.recordPattern({
        pattern_type: 'repetitive',
        game_type: gameType,
        frequency: startEvents.length,
        context: {
          starts: startEvents.length,
          completions: completeEvents.length,
        },
        severity: 'medium',
        ai_interpretation: `الطفل يكرر بدء لعبة ${this.getGameNameArabic(gameType)} دون إكمال`,
        recommended_action: `قد يواجه صعوبة في الفهم أو الإكمال - قدم مساعدة أو تبسيط`,
      });
    }
  }

  private async recordPattern(pattern: BehavioralPattern) {
    const existing = await supabase
      .from('behavioral_patterns')
      .select('*')
      .eq('child_id', this.childId)
      .eq('pattern_type', pattern.pattern_type)
      .eq('game_type', pattern.game_type || '')
      .single();

    if (existing.data) {
      await supabase
        .from('behavioral_patterns')
        .update({
          frequency: existing.data.frequency + 1,
          last_occurrence: new Date().toISOString(),
          context: pattern.context,
          severity: pattern.severity,
          ai_interpretation: pattern.ai_interpretation,
          recommended_action: pattern.recommended_action,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.data.id);
    } else {
      await supabase.from('behavioral_patterns').insert({
        child_id: this.childId,
        ...pattern,
      });
    }
  }

  async getBehavioralSummary() {
    const { data: patterns } = await supabase
      .from('behavioral_patterns')
      .select('*')
      .eq('child_id', this.childId)
      .eq('resolved', false)
      .order('severity', { ascending: false })
      .order('last_occurrence', { ascending: false });

    const { data: dailyProgress } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('child_id', this.childId)
      .order('date', { ascending: false })
      .limit(7);

    return {
      activePatterns: patterns || [],
      weeklyProgress: dailyProgress || [],
      alerts: (patterns || []).filter((p) => p.severity === 'high'),
    };
  }

  async acknowledgePattern(patternId: string) {
    await supabase
      .from('behavioral_patterns')
      .update({ acknowledged: true, updated_at: new Date().toISOString() })
      .eq('id', patternId);
  }

  async resolvePattern(patternId: string) {
    await supabase
      .from('behavioral_patterns')
      .update({
        resolved: true,
        acknowledged: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', patternId);
  }

  private getGameNameArabic(gameType: GameType): string {
    const names: Record<GameType, string> = {
      memory: 'الذاكرة',
      attention: 'التركيز والانتباه',
      logic: 'المنطق',
      visual: 'التفكير البصري',
      pattern: 'تمييز الأنماط',
      creative: 'الرسم الإبداعي',
    };
    return names[gameType] || gameType;
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, sq) => sum + sq, 0) / numbers.length;
  }
}

export async function generateBehavioralReport(childId: string) {
  const monitor = new BehavioralMonitor(childId);
  const summary = await monitor.getBehavioralSummary();

  return {
    summary: `تم رصد ${summary.activePatterns.length} نمط سلوكي`,
    patterns: summary.activePatterns,
    weeklyEngagement: summary.weeklyProgress,
    criticalAlerts: summary.alerts,
    recommendations: summary.activePatterns
      .filter((p) => p.recommended_action)
      .map((p) => p.recommended_action),
  };
}
