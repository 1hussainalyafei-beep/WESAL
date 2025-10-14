import OpenAI from 'openai';
import { supabase } from '../lib/supabase';
import type { GameSession, GameType } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface MiniReportResult {
  score: number;
  feedback: string;
  improvement_tip: string;
  markdown_content: string;
}

export class MiniReportService {
  private static getGameNameArabic(gameType: GameType): string {
    const names: Record<GameType, string> = {
      memory: 'الذاكرة',
      attention: 'التركيز',
      logic: 'المنطق',
      visual: 'الإدراك البصري',
      pattern: 'الأنماط',
      creative: 'الإبداع'
    };
    return names[gameType] || gameType;
  }

  static async generateMiniReport(
    sessionId: string,
    childId: string,
    gameType: GameType,
    sessionData: GameSession,
    childAge: number
  ): Promise<MiniReportResult | null> {
    try {
      const gameName = this.getGameNameArabic(gameType);
      const score = sessionData.score || 0;
      const duration = sessionData.duration_seconds || 0;
      const accuracy = sessionData.accuracy_percentage || 0;

      const prompt = `أنت خبير نفسي متخصص في تقييم الأطفال.

قم بتحليل أداء طفل عمره ${childAge} سنة في لعبة ${gameName}.

البيانات:
- النتيجة: ${score}
- الوقت: ${duration} ثانية
- الدقة: ${accuracy}%

أرجع JSON فقط بهذا الشكل (بدون أي نص إضافي):
{
  "score": رقم من 0-100,
  "feedback": "جملة واحدة عن الأداء",
  "improvement_tip": "نصيحة واحدة بسيطة"
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير تقييم أطفال. أرجع JSON فقط بدون أي نص آخر.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      console.log('GPT Response:', responseText);
      const result = JSON.parse(responseText);

      const markdown = `### 🎮 تقرير لعبة ${gameName}

**النتيجة:** ${result.score}/100

**التقييم:** ${result.feedback}

**نصيحة للتحسين:** ${result.improvement_tip}`;

      return {
        score: result.score || score,
        feedback: result.feedback || 'أداء جيد',
        improvement_tip: result.improvement_tip || 'استمر في الممارسة',
        markdown_content: markdown
      };

    } catch (error) {
      console.error('خطأ في توليد التقرير الصغير:', error);
      throw error;
    }
  }

  static async saveMiniReport(
    sessionId: string,
    childId: string,
    gameType: GameType,
    reportData: MiniReportResult
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
          metrics: {}
        })
        .select('id')
        .single();

      if (error) {
        console.error('خطأ في حفظ التقرير:', error);
        throw error;
      }

      console.log('تم حفظ التقرير الصغير بنجاح:', data.id);
      return data.id;
    } catch (error) {
      console.error('خطأ في حفظ التقرير:', error);
      throw error;
    }
  }

  static async getMiniReportsByPathId(assessmentPathId: string): Promise<any[]> {
    try {
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('assessment_path_id', assessmentPathId);

      if (!sessions || sessions.length === 0) {
        return [];
      }

      const sessionIds = sessions.map(s => s.id);

      const { data: miniReports, error } = await supabase
        .from('mini_reports')
        .select('*')
        .in('session_id', sessionIds)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('خطأ في جلب التقارير:', error);
        return [];
      }

      return miniReports || [];
    } catch (error) {
      console.error('خطأ في جلب التقارير:', error);
      return [];
    }
  }

  static async getMiniReportsByChildId(childId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('mini_reports')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('خطأ في جلب التقارير:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('خطأ في جلب التقارير:', error);
      return [];
    }
  }

  static async getMiniReportBySessionId(sessionId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('mini_reports')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }
}
