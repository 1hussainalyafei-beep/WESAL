import OpenAI from 'openai';
import { storageService, type MiniReport, type FinalReport } from './storageService';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class FinalReportService {
  static async generateAndSaveFinalReport(miniReportsCount: number = 6): Promise<string> {
    try {
      console.log('📊 بدء إنشاء التقرير الشامل');

      const recentReports = storageService.getRecentMiniReports(miniReportsCount);

      if (recentReports.length === 0) {
        throw new Error('لا توجد تقارير مصغرة لإنشاء التقرير الشامل');
      }

      console.log(`📝 عدد التقارير المصغرة: ${recentReports.length}`);

      const reportsText = recentReports
        .map((report, index) => {
          return `
=== التقرير ${index + 1}: ${report.gameType} ===
النتيجة: ${report.score}/100
التحليل:
${report.analysis}
`;
        })
        .join('\n\n');

      const prompt = `أنت خبير نفسي متخصص في التقييم الشامل للأطفال.

لديك ${recentReports.length} تقارير مصغرة من ألعاب مختلفة للطفل:

${reportsText}

قم بإنشاء تقرير تقييم شامل يتضمن:

## 📊 النظرة العامة
- ملخص الأداء الكلي (3-4 جمل)
- النتيجة الإجمالية من 100

## 🌟 نقاط القوة الرئيسية
- حدد 3-4 نقاط قوة بارزة عبر جميع الألعاب

## 🎯 المهارات المعرفية
قيّم كل مهارة (ممتاز/جيد/يحتاج تطوير):
- الذاكرة
- التركيز
- المنطق
- الإدراك البصري
- التعرف على الأنماط
- الإبداع

## 💡 التوصيات الشاملة
قدم 4-5 توصيات عملية لتطوير الطفل

## 🔍 الملاحظات السلوكية
- الأنماط السلوكية الملحوظة عبر الألعاب
- مستوى الصبر والمثابرة
- القدرة على التكيف

استخدم أسلوب احترافي ومشجع. اجعل التقرير شاملاً ومفيداً للآباء والمختصين.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير نفسي متخصص في التقييم الشامل للأطفال. قدم تحليلات شاملة ودقيقة باللغة العربية.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const analysis = completion.choices[0]?.message?.content || 'لم يتم إنشاء التقرير';

      console.log('✅ تم إنشاء التقرير الشامل من GPT');
      console.log('📝 التقرير:', analysis.substring(0, 150) + '...');

      const finalReport: FinalReport = {
        id: `final_${Date.now()}`,
        analysis: analysis,
        miniReportsIds: recentReports.map(r => r.id),
        timestamp: new Date().toISOString()
      };

      storageService.saveFinalReport(finalReport);
      console.log('💾 تم حفظ التقرير الشامل');

      return analysis;

    } catch (error) {
      console.error('❌ خطأ في توليد التقرير الشامل:', error);
      throw error;
    }
  }

  static getAllFinalReports(): FinalReport[] {
    return storageService.getAllFinalReports();
  }
}
