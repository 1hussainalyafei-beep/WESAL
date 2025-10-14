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
    detailed_analysis?: any;
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

  private static analyzeGameEvents(events: any[], gameType: GameType): any {
    if (!events || events.length === 0) {
      return { summary: 'لا توجد بيانات كافية للتحليل' };
    }

    const analysis: any = {
      totalEvents: events.length,
      gameStartTime: events[0]?.timestamp || 0,
      gameEndTime: events[events.length - 1]?.timestamp || 0,
    };

    if (gameType === 'memory') {
      const cardFlips = events.filter(e => e.type === 'card_flip');
      const matches = events.filter(e => e.type === 'match');
      const correctMatches = matches.filter(e => e.value?.correct);
      
      analysis.cardFlips = cardFlips.length;
      analysis.totalMatches = matches.length;
      analysis.correctMatches = correctMatches.length;
      analysis.matchAccuracy = matches.length > 0 ? (correctMatches.length / matches.length) * 100 : 0;
      
      // تحليل أوقات الاستجابة
      const responseTimes = cardFlips
        .map(e => e.value?.responseTime)
        .filter(t => t && t > 0 && t < 10000);
      
      if (responseTimes.length > 0) {
        analysis.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        analysis.minResponseTime = Math.min(...responseTimes);
        analysis.maxResponseTime = Math.max(...responseTimes);
      }
    }

    if (gameType === 'attention') {
      const clicks = events.filter(e => e.type === 'click');
      const correctClicks = clicks.filter(e => e.value?.correct);
      const falsePositives = clicks.filter(e => e.value?.isTarget === false);
      const missedTargets = events.filter(e => e.type === 'missed_target');
      
      analysis.totalClicks = clicks.length;
      analysis.correctClicks = correctClicks.length;
      analysis.falsePositives = falsePositives.length;
      analysis.missedTargets = missedTargets.length;
      analysis.clickAccuracy = clicks.length > 0 ? (correctClicks.length / clicks.length) * 100 : 0;
      
      // تحليل أوقات رد الفعل
      const responseTimes = clicks
        .map(e => e.value?.responseTime)
        .filter(t => t && t > 0 && t < 5000);
      
      if (responseTimes.length > 0) {
        analysis.avgReactionTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        analysis.fastestReaction = Math.min(...responseTimes);
        analysis.slowestReaction = Math.max(...responseTimes);
      }
    }

    return analysis;
  }

  private static buildMiniReportPrompt(
    gameType: GameType,
    sessionData: GameSession,
    childAge: number,
    eventAnalysis?: any
  ): string {
    const gameName = this.getGameNameArabic(gameType);
    
    // استخدام البيانات الحقيقية من اللعبة
    const rawData = sessionData.raw_data || {};
    const realMetrics = {
      score: sessionData.score || 0,
      duration: sessionData.duration_seconds || 0,
      accuracy: sessionData.accuracy_percentage || rawData.accuracy || 0,
      avgResponseTime: sessionData.average_response_time || rawData.averageResponseTime || 0,
      totalMoves: sessionData.total_moves || rawData.totalAttempts || 0,
      hesitations: sessionData.hesitation_count || rawData.hesitations || 0,
      rawGameData: rawData
    };

    let gameSpecificData = '';
    
    if (gameType === 'memory') {
      gameSpecificData = `
**بيانات لعبة الذاكرة:**
- الأزواج الصحيحة: ${rawData.correctPairs || 0}
- إجمالي المحاولات: ${rawData.totalAttempts || 0}
- الأخطاء: ${rawData.mistakes || 0}
- نقرات البطاقات: ${rawData.cardFlips || 0}
- دقة المطابقة: ${rawData.matchingAccuracy || 0}%`;
    }
    
    if (gameType === 'attention') {
      gameSpecificData = `
**بيانات لعبة التركيز:**
- النقرات الصحيحة: ${rawData.correct || 0}
- النقرات الخاطئة: ${rawData.incorrect || 0}
- الأهداف المفقودة: ${rawData.missed || 0}
- الإيجابيات الخاطئة: ${rawData.falsePositives || 0}`;
    }

    if (eventAnalysis && eventAnalysis.totalEvents > 0) {
      gameSpecificData += `

**تحليل الأحداث:**
- إجمالي الأحداث: ${eventAnalysis.totalEvents}
- مدة اللعب الفعلية: ${Math.round((eventAnalysis.gameEndTime - eventAnalysis.gameStartTime) / 1000)} ثانية`;
      
      if (eventAnalysis.avgResponseTime) {
        gameSpecificData += `
- متوسط وقت الاستجابة: ${Math.round(eventAnalysis.avgResponseTime)} مللي ثانية`;
      }
      
      if (eventAnalysis.matchAccuracy !== undefined) {
        gameSpecificData += `
- دقة المطابقة: ${Math.round(eventAnalysis.matchAccuracy)}%`;
      }
      
      if (eventAnalysis.clickAccuracy !== undefined) {
        gameSpecificData += `
- دقة النقرات: ${Math.round(eventAnalysis.clickAccuracy)}%`;
      }
    }

    return `أنت خبير نفسي متخصص في تقييم النمو المعرفي للأطفال.

قم بتحليل أداء طفل عمره ${childAge} سنة في ${gameName}.

البيانات:
- الدرجة النهائية: ${realMetrics.score}/100
- مدة اللعب: ${realMetrics.duration} ثانية
- نسبة الدقة: ${realMetrics.accuracy}%
- متوسط وقت الاستجابة: ${realMetrics.avgResponseTime} مللي ثانية
- إجمالي الحركات: ${realMetrics.totalMoves}
- عدد مرات التردد: ${realMetrics.hesitations}

${gameSpecificData}
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
      // تحليل الأحداث من البيانات الخام
      const rawData = sessionData.raw_data || {};
      const events = rawData.events || [];
      const eventAnalysis = this.analyzeGameEvents(events, gameType);
      
      const prompt = this.buildMiniReportPrompt(gameType, sessionData, childAge, eventAnalysis);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير في تقييم النمو المعرفي للأطفال. تقدم تحليلات دقيقة ومشجعة بتنسيق Markdown بناءً على البيانات الحقيقية فقط.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 600
      });

      const markdownContent = completion.choices[0]?.message?.content || '';

      // Extract score, feedback, and tip from markdown
      const scoreMatch = markdownContent.match(/\*\*الدرجة:\*\*\s*(\d+)/);
      const feedbackMatch = markdownContent.match(/\*\*الملاحظات:\*\*\s*(.+?)(?=\n|$)/);
      const tipMatch = markdownContent.match(/\*\*نصيحة:\*\*\s*(.+?)(?=\n|$)/);

      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : sessionData.score || 50;
      const feedback = feedbackMatch ? feedbackMatch[1].trim() : 'أداء جيد';
      const improvement_tip = tipMatch ? tipMatch[1].trim() : 'استمر في الممارسة';

      const metrics = {
        reaction_time: sessionData.average_response_time || rawData.averageResponseTime || 0,
        accuracy: sessionData.accuracy_percentage || rawData.accuracy || 0,
        attempts: sessionData.total_moves || rawData.totalAttempts || 0,
        hesitation_count: sessionData.hesitation_count || rawData.hesitations || 0,
        completion_time: sessionData.duration_seconds || 0,
        detailed_analysis: eventAnalysis
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
