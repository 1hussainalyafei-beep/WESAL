import OpenAI from 'openai';
import { supabase } from '../lib/supabase';
import type { GameType } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface BehaviorEvent {
  event_type: string;
  event_data: {
    game_type?: GameType;
    duration?: number;
    timestamp?: string;
    metadata?: any;
  };
}

interface BehaviorInsightData {
  classification: 'active' | 'cautious' | 'avoidant' | 'unstable' | 'consistent';
  insights: string[];
  guidance: string;
  markdown_content: string;
}

export class BehaviorTrackingService {
  static async logBehaviorEvent(
    childId: string,
    sessionId: string | null,
    eventType: string,
    eventData: any
  ): Promise<void> {
    try {
      await supabase.from('behavior_logs').insert({
        child_id: childId,
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData
      });
    } catch (error) {
      console.error('Error logging behavior event:', error);
    }
  }

  static async logGameStart(childId: string, sessionId: string, gameType: GameType): Promise<void> {
    await this.logBehaviorEvent(childId, sessionId, 'game_start', {
      game_type: gameType,
      timestamp: new Date().toISOString()
    });
  }

  static async logGameComplete(
    childId: string,
    sessionId: string,
    gameType: GameType,
    duration: number
  ): Promise<void> {
    await this.logBehaviorEvent(childId, sessionId, 'game_complete', {
      game_type: gameType,
      duration,
      timestamp: new Date().toISOString()
    });
  }

  static async logGameSkip(childId: string, gameType: GameType): Promise<void> {
    await this.logBehaviorEvent(childId, null, 'game_skip', {
      game_type: gameType,
      timestamp: new Date().toISOString()
    });
  }

  static async logHesitation(
    childId: string,
    sessionId: string,
    gameType: GameType,
    hesitationTime: number
  ): Promise<void> {
    await this.logBehaviorEvent(childId, sessionId, 'hesitation', {
      game_type: gameType,
      hesitation_time: hesitationTime,
      timestamp: new Date().toISOString()
    });
  }

  static async logGameSwitch(
    childId: string,
    fromGame: GameType,
    toGame: GameType
  ): Promise<void> {
    await this.logBehaviorEvent(childId, null, 'game_switch', {
      from_game: fromGame,
      to_game: toGame,
      timestamp: new Date().toISOString()
    });
  }

  static async logPause(childId: string, sessionId: string, gameType: GameType): Promise<void> {
    await this.logBehaviorEvent(childId, sessionId, 'pause', {
      game_type: gameType,
      timestamp: new Date().toISOString()
    });
  }

  static async getBehaviorLogs(
    childId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('behavior_logs')
        .select('*')
        .eq('child_id', childId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching behavior logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching behavior logs:', error);
      return [];
    }
  }

  static async analyzeBehaviorPatterns(
    childId: string,
    childAge: number,
    daysBack: number = 30
  ): Promise<BehaviorInsightData | null> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const logs = await this.getBehaviorLogs(childId, startDate, endDate);

      if (logs.length === 0) {
        return null;
      }

      const analysis = this.analyzeLogs(logs);
      const prompt = this.buildBehaviorPrompt(analysis, childAge);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير في تحليل الأنماط السلوكية للأطفال وتقديم توصيات شخصية.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const markdownContent = completion.choices[0]?.message?.content || '';

      const classification = this.extractClassification(markdownContent);
      const insights = this.extractInsights(markdownContent);
      const guidance = this.extractGuidance(markdownContent);

      return {
        classification,
        insights,
        guidance,
        markdown_content: markdownContent
      };
    } catch (error) {
      console.error('Error analyzing behavior patterns:', error);
      return null;
    }
  }

  private static analyzeLogs(logs: any[]): any {
    const gameStarts = logs.filter(log => log.event_type === 'game_start');
    const gameCompletes = logs.filter(log => log.event_type === 'game_complete');
    const gameSkips = logs.filter(log => log.event_type === 'game_skip');
    const hesitations = logs.filter(log => log.event_type === 'hesitation');
    const switches = logs.filter(log => log.event_type === 'game_switch');
    const pauses = logs.filter(log => log.event_type === 'pause');

    const gameTypeCounts: Record<string, number> = {};
    gameCompletes.forEach(log => {
      const gameType = log.event_data?.game_type || 'unknown';
      gameTypeCounts[gameType] = (gameTypeCounts[gameType] || 0) + 1;
    });

    const skipsByGame: Record<string, number> = {};
    gameSkips.forEach(log => {
      const gameType = log.event_data?.game_type || 'unknown';
      skipsByGame[gameType] = (skipsByGame[gameType] || 0) + 1;
    });

    const avgDurations: Record<string, number> = {};
    const durationCounts: Record<string, number> = {};
    gameCompletes.forEach(log => {
      const gameType = log.event_data?.game_type || 'unknown';
      const duration = log.event_data?.duration || 0;
      avgDurations[gameType] = (avgDurations[gameType] || 0) + duration;
      durationCounts[gameType] = (durationCounts[gameType] || 0) + 1;
    });

    Object.keys(avgDurations).forEach(gameType => {
      avgDurations[gameType] = avgDurations[gameType] / (durationCounts[gameType] || 1);
    });

    return {
      totalSessions: gameCompletes.length,
      totalSkips: gameSkips.length,
      totalHesitations: hesitations.length,
      totalSwitches: switches.length,
      totalPauses: pauses.length,
      gameTypeCounts,
      skipsByGame,
      avgDurations,
      completionRate: gameCompletes.length / (gameStarts.length || 1)
    };
  }

  private static buildBehaviorPrompt(analysis: any, childAge: number): string {
    return `أنت خبير في تحليل الأنماط السلوكية للأطفال.

قم بتحليل الأنماط السلوكية التالية لطفل عمره ${childAge} سنة:

**إحصائيات الجلسات:**
- إجمالي الجلسات المكتملة: ${analysis.totalSessions}
- إجمالي التخطيات: ${analysis.totalSkips}
- إجمالي مرات التردد: ${analysis.totalHesitations}
- إجمالي التبديلات بين الألعاب: ${analysis.totalSwitches}
- إجمالي الإيقافات المؤقتة: ${analysis.totalPauses}
- نسبة الإكمال: ${(analysis.completionRate * 100).toFixed(1)}%

**الألعاب الأكثر لعبًا:**
${Object.entries(analysis.gameTypeCounts)
  .map(([game, count]) => `- ${game}: ${count} مرة`)
  .join('\n')}

**الألعاب المتخطاة:**
${Object.entries(analysis.skipsByGame)
  .map(([game, count]) => `- ${game}: ${count} مرة`)
  .join('\n')}

**متوسط وقت اللعب:**
${Object.entries(analysis.avgDurations)
  .map(([game, duration]: [string, any]) => `- ${game}: ${duration.toFixed(1)} ثانية`)
  .join('\n')}

قم بإرجاع تحليل بتنسيق Markdown يحتوي على:

## 🔍 التصنيف السلوكي

[اختر واحدًا: نشط / حذر / متجنب / غير مستقر / متسق]

## 📋 الرؤى

1. [رؤية محددة عن النمط الأول]
2. [رؤية محددة عن النمط الثاني]
3. [رؤية محددة عن النمط الثالث]

## 💡 التوجيه والنصائح

[نصيحة واحدة قصيرة وعملية يمكن تطبيقها بسهولة]

ملاحظات:
- قارن بالمعايير العمرية للعمر ${childAge} سنة
- كن محددًا وإيجابيًا
- ركز على الأنماط القابلة للتنفيذ`;
  }

  private static extractClassification(
    markdown: string
  ): 'active' | 'cautious' | 'avoidant' | 'unstable' | 'consistent' {
    const classificationMap: Record<string, 'active' | 'cautious' | 'avoidant' | 'unstable' | 'consistent'> = {
      'نشط': 'active',
      'حذر': 'cautious',
      'متجنب': 'avoidant',
      'غير مستقر': 'unstable',
      'متسق': 'consistent'
    };

    const section = markdown.match(/##\s*🔍\s*التصنيف السلوكي\s*\n+(.+?)(?=\n##|$)/s);
    if (section) {
      const text = section[1];
      for (const [arabic, english] of Object.entries(classificationMap)) {
        if (text.includes(arabic)) {
          return english;
        }
      }
    }
    return 'consistent';
  }

  private static extractInsights(markdown: string): string[] {
    const section = markdown.match(/##\s*📋\s*الرؤى\s*\n+([\s\S]+?)(?=\n##|$)/);
    if (section) {
      const text = section[1];
      const insights = text
        .split(/\n/)
        .filter(line => line.match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(insight => insight.length > 0);
      return insights;
    }
    return [];
  }

  private static extractGuidance(markdown: string): string {
    const section = markdown.match(/##\s*💡\s*التوجيه والنصائح\s*\n+(.+?)(?=\n##|$)/s);
    return section ? section[1].trim() : 'لا توجد نصائح متاحة';
  }

  static async saveBehaviorInsight(
    childId: string,
    insightData: BehaviorInsightData,
    startDate: Date,
    endDate: Date
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('behavior_insights')
        .insert({
          child_id: childId,
          classification: insightData.classification,
          insights: insightData.insights,
          guidance: insightData.guidance,
          markdown_content: insightData.markdown_content,
          analysis_period_start: startDate.toISOString(),
          analysis_period_end: endDate.toISOString()
        })
        .select('id')
        .maybeSingle();

      if (error) {
        console.error('Error saving behavior insight:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error saving behavior insight:', error);
      return null;
    }
  }

  static async getLatestBehaviorInsight(childId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('behavior_insights')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching behavior insight:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching behavior insight:', error);
      return null;
    }
  }
}
