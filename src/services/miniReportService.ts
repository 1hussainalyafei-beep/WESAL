import OpenAI from 'openai';
import { supabase } from '../lib/supabase';
import type { GameSession, GameType } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface MiniReportData {
  score: number;
  feedback: string;
  improvement_tip: string;
  markdown_content: string;
  metrics: {
    reaction_time?: number;
    accuracy?: number;
    attempts?: number;
    hesitation_count?: number;
    completion_time?: number;
  };
}

export class MiniReportService {
  private static getGameNameArabic(gameType: GameType): string {
    const gameNames: Record<GameType, string> = {
      memory: 'لعبة الذاكرة',
      attention: 'لعبة التركيز',
      logic: 'لعبة المنطق',
      visual: 'لعبة الإدراك البصري',
      pattern: 'لعبة الأنماط',
      creative: 'لعبة الإبداع'
    };
    return gameNames[gameType] || gameType;
  }

  private static buildMiniReportPrompt(
    gameType: GameType,
    sessionData: GameSession,
    childAge: number
  ): string {
    const gameName = this.getGameNameArabic(gameType);
    const metrics = {
      reaction_time: sessionData.average_response_time || 0,
      accuracy: sessionData.accuracy_percentage || 0,
      attempts: sessionData.total_moves || 0,
      hesitation_count: sessionData.hesitation_count || 0,
      completion_time: sessionData.duration_seconds || 0
    };

    return `أنت خبير نفسي متخصص في تقييم النمو المعرفي للأطفال.

قم بتحليل أداء طفل عمره ${childAge} سنة في ${gameName}.

البيانات:
- وقت رد الفعل: ${metrics.reaction_time.toFixed(2)} ثانية
- نسبة الدقة: ${metrics.accuracy.toFixed(1)}%
- إجمالي المحاولات: ${metrics.attempts}
- عدد مرات التردد: ${metrics.hesitation_count}
- وقت الإكمال: ${metrics.completion_time} ثانية

قم بإرجاع تقرير صغير بتنسيق Markdown يحتوي على:

1. **الدرجة** (0-100): درجة رقمية تعكس الأداء الكلي
2. **الملاحظات** (سطر واحد): تعليق قصير وواضح على الأداء
3. **نصيحة للتحسين** (سطر واحد): توصية واحدة بسيطة وعملية

تنسيق الإخراج:
### 🧩 تقرير ${gameName}
**الدرجة:** [درجة]/100
**الملاحظات:** [ملاحظة قصيرة]
**نصيحة:** [توصية واحدة]

ملاحظات مهمة:
- كن محددًا ومشجعًا
- ركز على نقاط القوة والتحسين
- استخدم لغة بسيطة ومفهومة للآباء
- قارن الأداء بالمعايير العمرية المناسبة`;
  }

  static async generateMiniReport(
    sessionId: string,
    childId: string,
    gameType: GameType,
    sessionData: GameSession,
    childAge: number
  ): Promise<MiniReportData | null> {
    try {
      const prompt = this.buildMiniReportPrompt(gameType, sessionData, childAge);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير في تقييم النمو المعرفي للأطفال. تقدم تحليلات دقيقة ومشجعة بتنسيق Markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const markdownContent = completion.choices[0]?.message?.content || '';

      // Extract score, feedback, and tip from markdown
      const scoreMatch = markdownContent.match(/\*\*الدرجة:\*\*\s*(\d+)/);
      const feedbackMatch = markdownContent.match(/\*\*الملاحظات:\*\*\s*(.+?)(?=\n|$)/);
      const tipMatch = markdownContent.match(/\*\*نصيحة:\*\*\s*(.+?)(?=\n|$)/);

      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 50;
      const feedback = feedbackMatch ? feedbackMatch[1].trim() : 'أداء جيد';
      const improvement_tip = tipMatch ? tipMatch[1].trim() : 'استمر في الممارسة';

      const metrics = {
        reaction_time: sessionData.average_response_time || 0,
        accuracy: sessionData.accuracy_percentage || 0,
        attempts: sessionData.total_moves || 0,
        hesitation_count: sessionData.hesitation_count || 0,
        completion_time: sessionData.duration_seconds || 0
      };

      return {
        score,
        feedback,
        improvement_tip,
        markdown_content: markdownContent,
        metrics
      };
    } catch (error) {
      console.error('Error generating mini report:', error);
      return null;
    }
  }

  static async saveMiniReport(
    sessionId: string,
    childId: string,
    gameType: GameType,
    reportData: MiniReportData
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('mini_reports')
        .insert({
          session_id: sessionId,
          child_id: childId,
          game_type: gameType,
          score: reportData.score,
          feedback: reportData.feedback,
          improvement_tip: reportData.improvement_tip,
          markdown_content: reportData.markdown_content,
          metrics: reportData.metrics
        })
        .select('id')
        .maybeSingle();

      if (error) {
        console.error('Error saving mini report:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error saving mini report:', error);
      return null;
    }
  }

  static async getMiniReportsByPathId(assessmentPathId: string): Promise<any[]> {
    try {
      // Get all sessions for this assessment path
      const { data: sessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('assessment_path_id', assessmentPathId);

      if (sessionsError || !sessions) {
        console.error('Error fetching sessions:', sessionsError);
        return [];
      }

      const sessionIds = sessions.map(s => s.id);

      if (sessionIds.length === 0) {
        return [];
      }

      // Get all mini reports for these sessions
      const { data: miniReports, error: reportsError } = await supabase
        .from('mini_reports')
        .select('*')
        .in('session_id', sessionIds)
        .order('created_at', { ascending: true });

      if (reportsError) {
        console.error('Error fetching mini reports:', reportsError);
        return [];
      }

      return miniReports || [];
    } catch (error) {
      console.error('Error getting mini reports:', error);
      return [];
    }
  }

  static async getMiniReportBySessionId(sessionId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('mini_reports')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching mini report:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching mini report:', error);
      return null;
    }
  }
}
