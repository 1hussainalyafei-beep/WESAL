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

function getGameSpecificPrompt(gameType: GameType, sessionData: GameSession, childAge: number): string {
  const rawData = sessionData.raw_data || {};

  const baseInstructions = `
**المطلوب:**
أنشئ تحليلاً دقيقاً ومختصراً يتضمن:

1. **درجة الأداء** (0-100): قيم الأداء بناءً على المعايير المذكورة
2. **مستوى الأداء**: (below_normal, normal, above_normal) بناءً على عمر ${childAge} سنة
3. **تحليل نصي**: 2-3 جمل واضحة ومباشرة
4. **ملاحظات**: 2-3 نقاط محددة
5. **نصيحة سريعة**: نشاط عملي بسيط (10 دقائق)

**قواعد:**
- لغة عربية بسيطة ومباشرة
- إيجابي ومحفز
- مرتبط بعمر ${childAge} سنة
- لا مصطلحات طبية

أجب بـ JSON:
{
  "performanceScore": number,
  "performanceLevel": "below_normal" | "normal" | "above_normal",
  "analysisText": "string",
  "observations": ["string", "string"],
  "quickTip": "string"
}`;

  switch (gameType) {
    case 'memory':
      return `أنت خبير تقييم الذاكرة للأطفال في منصة "وصال". حلل أداء الطفل في لعبة الذاكرة.

**البيانات:**
- العمر: ${childAge} سنة
- المدة: ${sessionData.duration_seconds || 0} ثانية
- الدرجة: ${sessionData.score || 0}/100
- عدد الأزواج الصحيحة: ${rawData.correctPairs || 0}
- إجمالي المحاولات: ${rawData.totalAttempts || 0}
- متوسط وقت الاستجابة: ${rawData.averageResponseTime || 0} مللي ثانية
- الأخطاء: ${rawData.mistakes || 0}

**معايير التقييم:**
- الذاكرة قصيرة المدى: عدد الأزواج المحفوظة
- سرعة الاستدعاء: متوسط وقت الاستجابة
- الدقة: نسبة المحاولات الصحيحة
- التحسن: هل قل عدد الأخطاء مع التقدم؟

${baseInstructions}`;

    case 'attention':
      return `أنت خبير تقييم التركيز للأطفال في منصة "وصال". حلل أداء الطفل في لعبة التركيز.

**البيانات:**
- العمر: ${childAge} سنة
- المدة: ${sessionData.duration_seconds || 0} ثانية
- الدرجة: ${sessionData.score || 0}/100
- الضغطات الصحيحة: ${rawData.correctClicks || 0}
- الضغطات الخاطئة: ${rawData.incorrectClicks || 0}
- متوسط وقت رد الفعل: ${rawData.averageReactionTime || 0} مللي ثانية
- معدل الدقة: ${rawData.accuracyRate || 0}%

**معايير التقييم:**
- سرعة رد الفعل: هل الطفل سريع أم يحتاج وقت؟
- الانتباه المستمر: هل حافظ على التركيز؟
- التمييز البصري: دقة التعرف على الهدف
- التحكم في الاندفاع: نسبة الأخطاء

${baseInstructions}`;

    case 'logic':
      return `أنت خبير تقييم التفكير المنطقي للأطفال في منصة "وصال". حلل أداء الطفل في لعبة المنطق.

**البيانات:**
- العمر: ${childAge} سنة
- المدة: ${sessionData.duration_seconds || 0} ثانية
- الدرجة: ${sessionData.score || 0}/100
- الأنماط المكتملة: ${rawData.patternsCompleted || 0}
- المحاولات الفاشلة: ${rawData.failedAttempts || 0}
- متوسط وقت الحل: ${rawData.averageSolveTime || 0} ثانية
- مستوى الصعوبة: ${rawData.difficultyLevel || 'متوسط'}

**معايير التقييم:**
- التفكير المنطقي: فهم العلاقات والأنماط
- حل المشكلات: القدرة على إيجاد الحلول
- المثابرة: الاستمرار رغم الأخطاء
- التخطيط: التفكير قبل التنفيذ

${baseInstructions}`;

    case 'visual':
      return `أنت خبير تقييم التفكير البصري للأطفال في منصة "وصال". حلل أداء الطفل في لعبة التفكير البصري.

**البيانات:**
- العمر: ${childAge} سنة
- المدة: ${sessionData.duration_seconds || 0} ثانية
- الدرجة: ${sessionData.score || 0}/100
- الروابط الصحيحة: ${rawData.correctMatches || 0}
- الروابط الخاطئة: ${rawData.incorrectMatches || 0}
- متوسط وقت الربط: ${rawData.averageMatchTime || 0} ثانية
- الفئات المستخدمة: ${rawData.categoriesUsed || 0}

**معايير التقييم:**
- الإدراك البصري: التعرف على الأشكال والصور
- الربط المفاهيمي: ربط الصورة بالمعنى
- التصنيف: تجميع العناصر المتشابهة
- المرونة المعرفية: التبديل بين الفئات

${baseInstructions}`;

    case 'pattern':
      return `أنت خبير تقييم تمييز الأنماط للأطفال في منصة "وصال". حلل أداء الطفل في لعبة تمييز الأنماط.

**البيانات:**
- العمر: ${childAge} سنة
- المدة: ${sessionData.duration_seconds || 0} ثانية
- الدرجة: ${sessionData.score || 0}/100
- الأنماط المحددة: ${rawData.patternsIdentified || 0}
- التوقعات الصحيحة: ${rawData.correctPredictions || 0}
- الأخطاء: ${rawData.mistakes || 0}
- نوع الأنماط: ${rawData.patternTypes || 'متنوعة'}

**معايير التقييم:**
- التعرف على التسلسلات: اكتشاف القواعد
- التوقع: التنبؤ بالعنصر التالي
- التحليل: فهم العلاقات بين العناصر
- التعميم: تطبيق القاعدة على حالات جديدة

${baseInstructions}`;

    case 'creative':
      return `أنت خبير تقييم الإبداع للأطفال في منصة "وصال". حلل أداء الطفل في لعبة الرسم الإبداعي.

**البيانات:**
- العمر: ${childAge} سنة
- المدة: ${sessionData.duration_seconds || 0} ثانية
- الدرجة: ${sessionData.score || 0}/100
- عدد العناصر المرسومة: ${rawData.elementsDrawn || 0}
- الألوان المستخدمة: ${rawData.colorsUsed || 0}
- التفاصيل المضافة: ${rawData.detailsAdded || 0}
- مستوى التعقيد: ${rawData.complexityLevel || 'متوسط'}

**معايير التقييم:**
- الأصالة: الأفكار الجديدة والفريدة
- التفاصيل: مستوى التفاصيل في الرسم
- استخدام الألوان: التنوع والانسجام
- التعبير: القدرة على نقل الفكرة

${baseInstructions}`;

    default:
      return '';
  }
}

export async function generateMiniReport(
  sessionData: GameSession,
  childAge: number
): Promise<MiniReportAnalysis> {
  const prompt = getGameSpecificPrompt(sessionData.game_type, sessionData, childAge);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 800,
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

  const prompt = `أنت خبير تطور الأطفال في منصة "وصال". أنشئ تقريراً شاملاً لـ ${childName} (${childAge} سنة).

# نتائج الألعاب الست:
${reportsText}

# المطلوب:

1. **الدرجة الكلية** (0-100): متوسط مرجح
2. **المستوى العام**: (below_normal, normal, above_normal)
3. **درجات المجالات**: قيم كل مجال (0-100):
   - memory, attention, logic, visual_thinking, pattern_recognition, creativity
4. **نقاط القوة**: 2-3 نقاط
5. **مجالات التحسين**: 2-3 نقاط
6. **التفسيرات**: 3-4 تفسيرات
7. **التوصيات**: 4-6 توصيات عملية
8. **خطة أسبوعية**: 7 أنشطة (يوم، نشاط، مدة)
9. **تنبيه مختص**: true/false + السبب
10. **ملخص**: 3-4 جمل

**قواعد:**
- لغة عربية بسيطة
- إيجابي ومطمئن
- عملي وقابل للتطبيق

أجب بـ JSON:
{
  "overallScore": number,
  "overallLevel": string,
  "domainScores": {...},
  "strengths": [],
  "areasForImprovement": [],
  "explanations": [],
  "recommendations": [],
  "weeklyPlan": [{day, activity, duration}],
  "specialistAlert": boolean,
  "specialistAlertReason": string,
  "aiSummary": string
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
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
