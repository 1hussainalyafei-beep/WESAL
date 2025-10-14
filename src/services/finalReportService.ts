import OpenAI from 'openai';
import { supabase } from '../lib/supabase';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface FinalReportResult {
  markdown_content: string;
  overall_score: number;
  ai_insights: string;
  recommendations: string[];
}

export class FinalReportService {
  static async generateFinalReport(
    assessmentPathId: string,
    childId: string,
    miniReports: any[],
    childAge: number,
    childName: string
  ): Promise<FinalReportResult | null> {
    try {
      if (miniReports.length === 0) {
        console.error('لا توجد تقارير صغيرة');
        return null;
      }

      const reportsData = miniReports.map(r => ({
        game: r.game_type,
        score: r.score,
        feedback: r.feedback
      }));

      const prompt = `أنت خبير نفسي متخصص في تقييم الأطفال.

الطفل: ${childName}
العمر: ${childAge} سنة

النتائج من ${miniReports.length} ألعاب:
${JSON.stringify(reportsData, null, 2)}

أرجع JSON فقط بهذا الشكل:
{
  "overall_score": رقم من 0-100 (متوسط الدرجات),
  "ai_insights": "تحليل شامل 2-3 جمل",
  "recommendations": ["نصيحة 1", "نصيحة 2", "نصيحة 3"]
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير تقييم شامل للأطفال. أرجع JSON فقط.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      console.log('GPT Final Report Response:', responseText);
      const result = JSON.parse(responseText);

      const markdown = `# 📊 التقرير الشامل

## الطفل: ${childName} (${childAge} سنة)

### 🎯 النتيجة الإجمالية
**${result.overall_score}/100**

### 💡 تحليل الذكاء الاصطناعي
${result.ai_insights}

### 🌟 التوصيات
${(result.recommendations || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

---

### 📈 نتائج الألعاب الفردية

${miniReports.map(r => `**${r.game_type}:** ${r.score}/100 - ${r.feedback}`).join('\n\n')}`;

      return {
        markdown_content: markdown,
        overall_score: result.overall_score || 50,
        ai_insights: result.ai_insights || 'لا توجد رؤى متاحة',
        recommendations: result.recommendations || []
      };

    } catch (error) {
      console.error('خطأ في توليد التقرير الشامل:', error);
      throw error;
    }
  }

  static async saveFinalReport(
    assessmentPathId: string,
    childId: string,
    reportData: FinalReportResult
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('final_reports')
        .insert({
          assessment_path_id: assessmentPathId,
          child_id: childId,
          markdown_content: reportData.markdown_content,
          skill_summary: {},
          overall_trend: 'stable',
          ai_insights: reportData.ai_insights,
          recommendations: reportData.recommendations
        })
        .select('id')
        .single();

      if (error) {
        console.error('خطأ في حفظ التقرير الشامل:', error);
        throw error;
      }

      console.log('تم حفظ التقرير الشامل بنجاح:', data.id);
      return data.id;
    } catch (error) {
      console.error('خطأ في حفظ التقرير الشامل:', error);
      throw error;
    }
  }

  static async getFinalReportByPathId(assessmentPathId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('final_reports')
        .select('*')
        .eq('assessment_path_id', assessmentPathId)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  static async getFinalReportsByChildId(childId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('final_reports')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('خطأ في جلب التقارير الشاملة:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('خطأ في جلب التقارير الشاملة:', error);
      return [];
    }
  }
}
