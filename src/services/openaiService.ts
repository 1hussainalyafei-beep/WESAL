import OpenAI from 'openai';
import { GameType, GameSession } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface MiniReportAnalysis {
  performanceScore: number;
  performanceLevel: 'below_normal' | 'normal' | 'above_normal';
  analysisText: string;
  observations: string[];
  quickTip: string;
}

export interface ComprehensiveAnalysis {
  overallScore: number;
  overallLevel: 'below_normal' | 'normal' | 'above_normal';
  domainScores: Record<string, number>;
  strengths: string[];
  areasForImprovement: string[];
  explanations: string[];
  recommendations: string[];
  weeklyPlan: Array<{ day: number; activity: string; duration: string }>;
  specialistAlert: boolean;
  specialistAlertReason?: string;
  aiSummary: string;
}

const gameNameMap: Record<GameType, string> = {
  memory: 'الذاكرة',
  attention: 'التركيز والانتباه',
  logic: 'المنطق',
  visual: 'التفكير البصري',
  pattern: 'تمييز الأنماط',
  creative: 'الرسم الإبداعي',
};

export async function generateMiniReport(
  sessionData: GameSession,
  childAge: number
): Promise<MiniReportAnalysis> {
  const gameName = gameNameMap[sessionData.game_type];

  const prompt = `أنت مساعد ذكي في منصة "وصال" لتقييم القدرات المعرفية للأطفال. قم بتحليل أداء الطفل في لعبة ${gameName}.

**بيانات الأداء:**
- نوع اللعبة: ${gameName}
- عمر الطفل: ${childAge} سنة
- مدة اللعب: ${sessionData.duration_seconds || 0} ثانية
- الدرجة: ${sessionData.score || 0}/100
- بيانات التفاعل: ${JSON.stringify(sessionData.raw_data, null, 2)}

**المطلوب:**
قم بإنشاء تقرير مصغّر يتضمن:

1. **درجة الأداء** (0-100): قيم الأداء بناءً على الدقة، السرعة، وعدد المحاولات
2. **مستوى الأداء**: اختر أحد الخيارات (below_normal, normal, above_normal) بناءً على عمر الطفل
3. **تحليل نصي** (جملتان-ثلاث): اشرح ماذا فعل الطفل جيدًا وما يحتاجه
4. **ملاحظات** (قائمة من 2-3 ملاحظات): نقاط محددة حول الأداء
5. **نصيحة سريعة**: نشاط واحد بسيط يمكن تنفيذه اليوم (10 دقائق أو أقل)

**ملاحظات مهمة:**
- استخدم لغة عربية بسيطة وودودة
- كن إيجابياً ومشجعاً
- اربط التقييم بعمر الطفل
- تجنب المصطلحات الطبية المعقدة

أجب بتنسيق JSON فقط كالتالي:
{
  "performanceScore": number,
  "performanceLevel": "below_normal" | "normal" | "above_normal",
  "analysisText": "string",
  "observations": ["string", "string"],
  "quickTip": "string"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from AI');

    const analysis: MiniReportAnalysis = JSON.parse(content);
    return analysis;
  } catch (error) {
    console.error('Error generating mini report:', error);
    throw error;
  }
}

export async function generateComprehensiveReport(
  miniReports: Array<{
    game_type: GameType;
    performance_score: number;
    performance_level: string;
    analysis_text?: string;
    observations: string[];
  }>,
  childName: string,
  childAge: number
): Promise<ComprehensiveAnalysis> {
  const reportsText = miniReports
    .map((report) => {
      const gameName = gameNameMap[report.game_type];
      return `
**${gameName}:**
- الدرجة: ${report.performance_score}/100
- المستوى: ${report.performance_level}
- التحليل: ${report.analysis_text || 'لا يوجد'}
- الملاحظات: ${report.observations.join(', ')}
`;
    })
    .join('\n');

  const prompt = `أنت محلل خبير في تطور الأطفال المعرفي في منصة "وصال". قم بإنشاء تقرير شامل بناءً على أداء الطفل في 6 ألعاب معرفية.

**معلومات الطفل:**
- الاسم: ${childName}
- العمر: ${childAge} سنة

**نتائج الألعاب الست:**
${reportsText}

**المطلوب:**
قم بإنشاء تقرير شامل يتضمن:

1. **الدرجة الكلية** (0-100): متوسط مرجح للألعاب الست
2. **المستوى العام**: (below_normal, normal, above_normal)
3. **درجات المجالات**: قيم كل مجال معرفي من 0-100:
   - memory (الذاكرة)
   - attention (التركيز)
   - logic (المنطق)
   - visual_thinking (التفكير البصري)
   - pattern_recognition (تمييز الأنماط)
   - creativity (الإبداع)
4. **نقاط القوة** (2-3 نقاط): المجالات التي تميز فيها الطفل
5. **مجالات التحسين** (2-3 نقاط): المجالات التي تحتاج دعم
6. **التفسيرات** (3-5 نقاط): اربط المستوى بالسلوك الملحوظ في الألعاب
7. **التوصيات العملية** (4-6 توصيات): أنشطة محددة قابلة للتطبيق في المنزل
8. **خطة أسبوعية**: 7 أنشطة (واحد لكل يوم) مع المدة المقترحة
9. **تنبيه مختص**: true/false - إذا ظهرت مؤشرات تستدعي العرض على مختص
10. **سبب التنبيه**: إذا كان هناك تنبيه، اذكر السبب بلغة لطيفة
11. **ملخص ذكي**: فقرة موجزة (4-5 جمل) تلخص الحالة العامة

**ملاحظات مهمة:**
- استخدم لغة عربية بسيطة ودافئة
- كن إيجابياً ومطمئناً للأهل
- قدم توصيات عملية محددة بالوقت والأدوات
- تجنب المصطلحات التشخيصية

أجب بتنسيق JSON فقط كالتالي:
{
  "overallScore": number,
  "overallLevel": "below_normal" | "normal" | "above_normal",
  "domainScores": {
    "memory": number,
    "attention": number,
    "logic": number,
    "visual_thinking": number,
    "pattern_recognition": number,
    "creativity": number
  },
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "explanations": ["string"],
  "recommendations": ["string"],
  "weeklyPlan": [
    {"day": 1, "activity": "string", "duration": "10 دقائق"}
  ],
  "specialistAlert": boolean,
  "specialistAlertReason": "string or null",
  "aiSummary": "string"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from AI');

    const analysis: ComprehensiveAnalysis = JSON.parse(content);
    return analysis;
  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    throw error;
  }
}
