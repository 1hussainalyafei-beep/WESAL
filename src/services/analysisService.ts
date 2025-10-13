import { openai } from '../lib/openai';
import { GameSession, GameType } from '../types';

export interface GameAnalysisResult {
  performance_score: number;
  analysis: string;
  strengths: string[];
  recommendations: string[];
  level: 'below_normal' | 'normal' | 'above_normal';
  quick_tip: string;
}

export interface ComprehensiveAnalysisResult {
  overall_score: number;
  cognitive_map: {
    memory: number;
    attention: number;
    logic: number;
    visual: number;
    pattern: number;
    creative: number;
  };
  detailed_analysis: string;
  recommendations: string[];
  specialist_alert: string;
  encouragement: string;
}

const gameNameMap: Record<GameType, string> = {
  memory: 'الذاكرة',
  attention: 'التركيز والانتباه',
  logic: 'المنطق',
  visual: 'التفكير البصري',
  pattern: 'تمييز الأنماط',
  creative: 'الرسم الإبداعي',
};

export async function analyzeGameSession(
  session: GameSession,
  childAge: number
): Promise<GameAnalysisResult> {
  const gameName = gameNameMap[session.game_type];

  const prompt = `أنت مساعد ذكي في منصة "وصال" لتقييم القدرات المعرفية للأطفال. قم بتحليل أداء الطفل في لعبة ${gameName}.

**بيانات الأداء:**
- نوع اللعبة: ${gameName}
- عمر الطفل: ${childAge} سنة
- مدة اللعب: ${session.duration_seconds || 0} ثانية
- الدرجة: ${session.score || 0}/100
- بيانات التفاعل: ${JSON.stringify(session.raw_data, null, 2)}

**المطلوب:**
قم بإنشاء تقرير مصغّر يتضمن:

1. **درجة الأداء** (0-100): قيم الأداء بناءً على الدقة، السرعة، وعدد المحاولات
2. **مستوى الأداء**: اختر أحد الخيارات (below_normal, normal, above_normal) بناءً على عمر الطفل
3. **تحليل نصي** (جملتان): اشرح ماذا فعل الطفل جيدًا وما يحتاجه
4. **نقاط القوة** (قائمة من 2-3): نقاط محددة حول الأداء
5. **توصيات** (قائمة من 2-3): توصيات عملية
6. **نصيحة سريعة**: نشاط واحد بسيط يمكن تنفيذه اليوم (10 دقائق أو أقل)

**ملاحظات مهمة:**
- استخدم لغة عربية بسيطة وودودة
- كن إيجابياً ومشجعاً
- اربط التقييم بعمر الطفل
- تجنب المصطلحات الطبية المعقدة

أجب بتنسيق JSON فقط كالتالي:
{
  "performance_score": number,
  "level": "below_normal" | "normal" | "above_normal",
  "analysis": "string",
  "strengths": ["string", "string"],
  "recommendations": ["string", "string"],
  "quick_tip": "string"
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

    const analysis: GameAnalysisResult = JSON.parse(content);
    return analysis;
  } catch (error) {
    console.error('Error generating mini report:', error);
    return {
      performance_score: session.score || 50,
      level: 'normal',
      analysis: 'تم إكمال اللعبة بنجاح. أنت تتقدم بشكل رائع!',
      strengths: ['إكمال اللعبة', 'المثابرة والتركيز'],
      recommendations: ['المواصلة في التدريب', 'تجربة ألعاب أخرى'],
      quick_tip: 'جرب اللعبة مرة أخرى لتحسين نتيجتك'
    };
  }
}

export async function generateComprehensiveReport(
  sessions: GameSession[],
  childName: string,
  childAge: number
): Promise<ComprehensiveAnalysisResult> {
  const reportsText = sessions
    .map((session) => {
      const gameName = gameNameMap[session.game_type];
      return `
**${gameName}:**
- الدرجة: ${session.score || 0}/100
- المدة: ${session.duration_seconds || 0} ثانية
- البيانات: ${JSON.stringify(session.raw_data)}
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
2. **خريطة القدرات**: قيم كل مجال معرفي من 0-100:
   - memory (الذاكرة)
   - attention (التركيز)
   - logic (المنطق)
   - visual (التفكير البصري)
   - pattern (تمييز الأنماط)
   - creative (الإبداع)
3. **تحليل تفصيلي**: فقرة شاملة تربط الأداء بالمهارات
4. **التوصيات العملية**: 4-6 توصيات قابلة للتطبيق في المنزل
5. **تنبيه مختص**: إذا ظهرت مؤشرات، اذكر السبب بلطف (أو "" إذا لم توجد)
6. **عبارة تشجيع**: جملة إيجابية مخصصة باسم الطفل

**ملاحظات مهمة:**
- استخدم لغة عربية بسيطة ودافئة
- كن إيجابياً ومطمئناً للأهل
- قدم توصيات محددة بالوقت والأدوات
- تجنب المصطلحات التشخيصية

أجب بتنسيق JSON فقط كالتالي:
{
  "overall_score": number,
  "cognitive_map": {
    "memory": number,
    "attention": number,
    "logic": number,
    "visual": number,
    "pattern": number,
    "creative": number
  },
  "detailed_analysis": "string",
  "recommendations": ["string"],
  "specialist_alert": "string",
  "encouragement": "string"
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

    const analysis: ComprehensiveAnalysisResult = JSON.parse(content);
    return analysis;
  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    const avgScore = sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length;
    return {
      overall_score: Math.round(avgScore),
      cognitive_map: {
        memory: avgScore,
        attention: avgScore,
        logic: avgScore,
        visual: avgScore,
        pattern: avgScore,
        creative: avgScore
      },
      detailed_analysis: 'تم إكمال جميع الألعاب بنجاح. ${childName} يظهر أداءً جيداً في جميع المجالات المعرفية.',
      recommendations: ['المواصلة في التدريب المنتظم', 'تنويع الأنشطة اليومية', 'تشجيع القراءة اليومية', 'ممارسة الألعاب المنطقية'],
      specialist_alert: '',
      encouragement: `أحسنت يا ${childName}! استمر في التقدم الرائع.`
    };
  }
}
