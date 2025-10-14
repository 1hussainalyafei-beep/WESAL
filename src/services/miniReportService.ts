import OpenAI from 'openai';
import { storageService, type GameData, type MiniReport } from './storageService';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class MiniReportService {
  static async generateAndSaveMiniReport(gameData: GameData): Promise<string> {
    try {
      console.log('🎮 بدء تحليل اللعبة:', gameData.gameType);

      const prompt = `أنت خبير نفسي متخصص في تقييم الأطفال.

قم بتحليل أداء الطفل في لعبة ${gameData.gameType}:

📊 البيانات:
- النتيجة: ${gameData.score}/100
- الوقت: ${gameData.duration} ثانية
- عدد النقرات: ${gameData.clicks}
- الإجابات الصحيحة: ${gameData.correctAnswers}
- الإجابات الخاطئة: ${gameData.wrongAnswers}
- إجمالي المحاولات: ${gameData.totalAttempts}
- نسبة النجاح: ${((gameData.correctAnswers / gameData.totalAttempts) * 100).toFixed(1)}%

اكتب تحليل شامل باللغة العربية يتضمن:

1️⃣ تقييم الأداء العام (2-3 جمل)
2️⃣ نقاط القوة الملحوظة (2-3 نقاط)
3️⃣ المجالات التي تحتاج تطوير (1-2 نقطة)
4️⃣ نصائح عملية للتحسين (2-3 نصائح)
5️⃣ تقييم السلوك (مثل: سرعة الاستجابة، الدقة، الصبر)

استخدم أسلوب تشجيعي وإيجابي.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير نفسي متخصص في تقييم الأطفال. قدم تحليلات دقيقة ومشجعة باللغة العربية.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const analysis = completion.choices[0]?.message?.content || 'لم يتم إنشاء التحليل';

      console.log('✅ تم إنشاء التحليل من GPT');
      console.log('📝 التحليل:', analysis.substring(0, 100) + '...');

      const miniReport: MiniReport = {
        id: `mini_${Date.now()}`,
        gameId: gameData.id,
        gameType: gameData.gameType,
        analysis: analysis,
        score: gameData.score,
        timestamp: new Date().toISOString()
      };

      storageService.saveMiniReport(miniReport);
      console.log('💾 تم حفظ التقرير المصغر');

      return analysis;

    } catch (error) {
      console.error('❌ خطأ في توليد التقرير المصغر:', error);
      throw error;
    }
  }

  static getAllMiniReports(): MiniReport[] {
    return storageService.getAllMiniReports();
  }

  static getRecentMiniReports(count: number): MiniReport[] {
    return storageService.getRecentMiniReports(count);
  }
}
