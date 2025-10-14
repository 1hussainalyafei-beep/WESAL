import OpenAI from 'openai';
import { supabase } from '../lib/supabase';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface FinalReportData {
  markdown_content: string;
  skill_summary: {
    memory: 'normal' | 'above' | 'below';
    attention: 'normal' | 'above' | 'below';
    logic: 'normal' | 'above' | 'below';
    visual: 'normal' | 'above' | 'below';
    pattern: 'normal' | 'above' | 'below';
    creative: 'normal' | 'above' | 'below';
  };
  overall_trend: 'improving' | 'stable' | 'needs_support';
  ai_insights: string;
  recommendations: string[];
}

export class FinalReportService {
  private static buildFinalReportPrompt(
    miniReports: any[],
    childAge: number,
    childName: string
  ): string {
    const reportsText = miniReports
      .map((report, index) => {
        return `
### التقرير ${index + 1}: ${report.game_type}
${report.markdown_content}
---
الدرجة: ${report.score}/100
الملاحظات: ${report.feedback}
نصيحة التحسين: ${report.improvement_tip}
`;
      })
      .join('\n\n');

    return `أنت خبير نفسي متخصص في تقييم النمو المعرفي الشامل للأطفال.

الطفل: ${childName}
العمر: ${childAge} سنة
عدد الألعاب المكتملة: ${miniReports.length}

فيما يلي التقارير الصغيرة من جميع الألعاب الـ 6:

${reportsText}

بناءً على هذه التقارير الصغيرة، قم بتحليل الملف المعرفي الكامل للطفل.

قم بإرجاع تقرير شامل بتنسيق Markdown يحتوي على:

## 📊 ملخص المهارات

قيّم كل مهارة (طبيعي / فوق المتوسط / تحت المتوسط):
- **الذاكرة:** [تقييم]
- **التركيز:** [تقييم]
- **المنطق:** [تقييم]
- **الإدراك البصري:** [تقييم]
- **التعرف على الأنماط:** [تقييم]
- **الإبداع:** [تقييم]

## 📈 الاتجاه العام

[يتحسن / مستقر / يحتاج دعم]

## 💡 رؤى الذكاء الاصطناعي

[2-3 أسطر من الرؤى المتعمقة حول أنماط الأداء والنقاط القوية والمجالات التي تحتاج إلى تطوير]

## 🌟 التوصيات الشخصية

1. [توصية محددة وعملية]
2. [توصية محددة وعملية]
3. [توصية محددة وعملية]

ملاحظات مهمة:
- قارن الأداء مع معايير النمو للعمر ${childAge} سنة
- كن محددًا وإيجابيًا ومشجعًا
- قدم رؤى عملية يمكن للوالدين تطبيقها
- حدد الأنماط عبر الألعاب المختلفة
- استخدم لغة واضحة ومفهومة`;
  }

  static async generateFinalReport(
    assessmentPathId: string,
    childId: string,
    miniReports: any[],
    childAge: number,
    childName: string
  ): Promise<FinalReportData | null> {
    try {
      if (miniReports.length === 0) {
        console.error('No mini reports provided for final report generation');
        return null;
      }

      const prompt = this.buildFinalReportPrompt(miniReports, childAge, childName);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير في تقييم النمو المعرفي الشامل للأطفال. تقدم تحليلات شاملة ودقيقة بتنسيق Markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const markdownContent = completion.choices[0]?.message?.content || '';

      // Extract skill summary
      const skillSummary = this.extractSkillSummary(markdownContent);

      // Extract overall trend
      const overallTrend = this.extractOverallTrend(markdownContent);

      // Extract AI insights
      const aiInsights = this.extractAIInsights(markdownContent);

      // Extract recommendations
      const recommendations = this.extractRecommendations(markdownContent);

      return {
        markdown_content: markdownContent,
        skill_summary: skillSummary,
        overall_trend: overallTrend,
        ai_insights: aiInsights,
        recommendations
      };
    } catch (error) {
      console.error('Error generating final report:', error);
      return null;
    }
  }

  private static extractSkillSummary(markdown: string): any {
    const summary: any = {
      memory: 'normal',
      attention: 'normal',
      logic: 'normal',
      visual: 'normal',
      pattern: 'normal',
      creative: 'normal'
    };

    const skillMappings = {
      'الذاكرة': 'memory',
      'التركيز': 'attention',
      'المنطق': 'logic',
      'الإدراك البصري': 'visual',
      'التعرف على الأنماط': 'pattern',
      'الأنماط': 'pattern',
      'الإبداع': 'creative'
    };

    const statusMappings: Record<string, 'normal' | 'above' | 'below'> = {
      'طبيعي': 'normal',
      'فوق المتوسط': 'above',
      'تحت المتوسط': 'below',
      'ممتاز': 'above',
      'جيد': 'normal',
      'يحتاج تحسين': 'below'
    };

    Object.entries(skillMappings).forEach(([arabicName, englishKey]) => {
      const regex = new RegExp(`\\*\\*${arabicName}:\\*\\*\\s*(.+?)(?=\\n|$)`, 'i');
      const match = markdown.match(regex);
      if (match) {
        const statusText = match[1].trim();
        Object.entries(statusMappings).forEach(([arabicStatus, englishStatus]) => {
          if (statusText.includes(arabicStatus)) {
            summary[englishKey] = englishStatus;
          }
        });
      }
    });

    return summary;
  }

  private static extractOverallTrend(markdown: string): 'improving' | 'stable' | 'needs_support' {
    const trendSection = markdown.match(/##\s*📈\s*الاتجاه العام\s*\n+(.+?)(?=\n##|$)/s);
    if (trendSection) {
      const text = trendSection[1].toLowerCase();
      if (text.includes('يتحسن') || text.includes('تحسن')) return 'improving';
      if (text.includes('يحتاج دعم') || text.includes('يحتاج إلى دعم')) return 'needs_support';
    }
    return 'stable';
  }

  private static extractAIInsights(markdown: string): string {
    const insightsSection = markdown.match(/##\s*💡\s*رؤى الذكاء الاصطناعي\s*\n+(.+?)(?=\n##|$)/s);
    return insightsSection ? insightsSection[1].trim() : 'لا توجد رؤى متاحة';
  }

  private static extractRecommendations(markdown: string): string[] {
    const recommendationsSection = markdown.match(/##\s*🌟\s*التوصيات الشخصية\s*\n+([\s\S]+?)(?=\n##|$)/);
    if (recommendationsSection) {
      const text = recommendationsSection[1];
      const recommendations = text
        .split(/\n/)
        .filter(line => line.match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(rec => rec.length > 0);
      return recommendations;
    }
    return [];
  }

  static async saveFinalReport(
    assessmentPathId: string,
    childId: string,
    reportData: FinalReportData
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('final_reports')
        .insert({
          assessment_path_id: assessmentPathId,
          child_id: childId,
          markdown_content: reportData.markdown_content,
          skill_summary: reportData.skill_summary,
          overall_trend: reportData.overall_trend,
          ai_insights: reportData.ai_insights,
          recommendations: reportData.recommendations
        })
        .select('id')
        .maybeSingle();

      if (error) {
        console.error('Error saving final report:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error saving final report:', error);
      return null;
    }
  }

  static async getFinalReportByPathId(assessmentPathId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('final_reports')
        .select('*')
        .eq('assessment_path_id', assessmentPathId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching final report:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching final report:', error);
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
        console.error('Error fetching final reports:', error);
        return [];
      }

      console.log('Final reports found:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching final reports:', error);
      return [];
    }
  }
}
