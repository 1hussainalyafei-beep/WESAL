import OpenAI from 'openai';
import { GameType } from '../types';
import { supabase } from '../lib/supabase';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface GameSessionData {
  game_type: GameType;
  score: number;
  duration_seconds: number;
  accuracy_percentage: number;
  response_times: number[];
  interaction_data: any;
  completed: boolean;
  early_exit: boolean;
  hesitations_count: number;
  created_at: string;
}

interface ComprehensiveAnalysisResult {
  overallScore: number;
  overallLevel: 'below_normal' | 'normal' | 'above_normal';
  domainScores: {
    memory: number;
    attention: number;
    logic: number;
    visual_thinking: number;
    pattern_recognition: number;
    creativity: number;
  };
  skillBreakdown: Record<string, any>;
  aiSummary: string;
  detailedAnalysis: string;
  strengths: string[];
  areasForImprovement: string[];
  explanations: string[];
  recommendations: string[];
  weeklyPlan: Array<{
    day: number;
    dayName: string;
    activity: string;
    duration: string;
    skills: string[];
  }>;
  specialistAlert: boolean;
  specialistAlertReason?: string;
  behavioralConcerns: string[];
  comparisonWithAgeGroup: any;
  progressIndicators: any;
  confidenceLevel: number;
}

const gameNameMap: Record<GameType, string> = {
  memory: 'الذاكرة',
  attention: 'التركيز والانتباه',
  logic: 'المنطق',
  visual: 'التفكير البصري',
  pattern: 'تمييز الأنماط',
  creative: 'الرسم الإبداعي',
};

export async function generateComprehensiveAnalysis(
  sessions: GameSessionData[],
  childName: string,
  childAge: number,
  childGender?: string
): Promise<ComprehensiveAnalysisResult> {
  const startTime = Date.now();

  const sessionsText = sessions
    .map((session, index) => {
      const gameName = gameNameMap[session.game_type];
      const avgResponseTime = session.response_times.length > 0
        ? (session.response_times.reduce((a, b) => a + b, 0) / session.response_times.length / 1000).toFixed(2)
        : 'غير متوفر';

      return `
## اللعبة ${index + 1}: ${gameName}

**الأداء:**
- الدرجة: ${session.score}/100
- مدة اللعب: ${session.duration_seconds} ثانية
- الدقة: ${session.accuracy_percentage || 0}%
- متوسط وقت الاستجابة: ${avgResponseTime} ثانية
- حالة الإكمال: ${session.completed ? 'مكتملة' : 'غير مكتملة'}
- خروج مبكر: ${session.early_exit ? 'نعم' : 'لا'}
- عدد مرات التردد: ${session.hesitations_count}

**بيانات التفاعل:**
${JSON.stringify(session.interaction_data, null, 2)}
`;
    })
    .join('\n---\n');

  const genderContext = childGender
    ? `الجنس: ${childGender === 'male' ? 'ذكر' : childGender === 'female' ? 'أنثى' : 'غير محدد'}`
    : '';

  const prompt = `أنت خبير عالمي في تحليل النمو المعرفي والعاطفي للأطفال. تعمل كمستشار رئيسي في منصة "وصال" المتخصصة في التقييم المعرفي الدقيق للأطفال.

# معلومات الطفل
- الاسم: ${childName}
- العمر: ${childAge} سنة
${genderContext}

# البيانات المجمعة من 6 ألعاب معرفية

${sessionsText}

---

# المطلوب منك

قم بتحليل شامل ومتعمق لأداء ${childName} عبر جميع الألعاب الستة، مع الأخذ بعين الاعتبار:

## 1. التقييم الكلي (Overall Assessment)
- احسب **الدرجة الإجمالية** من 0 إلى 100 بناءً على:
  - متوسط الدرجات
  - التناسق في الأداء
  - السرعة مقابل الدقة
  - مستوى الإكمال

- حدد **المستوى العام** بدقة:
  - **أعلى من الطبيعي** (above_normal): إذا كان الأداء يفوق أقرانه بوضوح
  - **طبيعي** (normal): يتماشى مع المعايير العمرية
  - **أقل من الطبيعي** (below_normal): يحتاج دعم ومتابعة

## 2. تقييم المجالات المعرفية (Domain Scores)
قيّم كل مجال من 0 إلى 100:

- **memory** (الذاكرة): قدرة التذكر والاستدعاء
- **attention** (التركيز): القدرة على الانتباه والتمييز
- **logic** (المنطق): التفكير المنطقي والاستنتاج
- **visual_thinking** (التفكير البصري): معالجة المعلومات البصرية
- **pattern_recognition** (تمييز الأنماط): التعرف على التسلسلات
- **creativity** (الإبداع): التفكير الإبداعي والتعبير

## 3. التحليل التفصيلي

**ملخص ذكي (aiSummary):**
فقرة واحدة (4-6 جمل) تلخص الحالة العامة للطفل بلغة دافئة ومطمئنة.

**التحليل المفصل (detailedAnalysis):**
3-4 فقرات تشرح:
- الأداء العام عبر الألعاب
- الأنماط الملحوظة في التفاعل
- المقارنة مع الأقران في نفس العمر
- العوامل المؤثرة (السرعة، الدقة، التردد)

## 4. نقاط القوة (Strengths)
3-4 نقاط محددة تبرز المهارات التي تميز فيها الطفل.

## 5. مجالات التحسين (Areas for Improvement)
2-3 مجالات تحتاج دعم وتطوير، بلغة إيجابية وبناءة.

## 6. التفسيرات (Explanations)
4-5 تفسيرات علمية مبسطة تربط الأداء بالسلوك الملحوظ.

## 7. التوصيات العملية (Recommendations)
5-7 توصيات واقعية يمكن للأهل تطبيقها فوراً:
- نشاط محدد
- المدة المقترحة
- الأدوات المطلوبة
- الهدف من النشاط

## 8. خطة أسبوعية (Weekly Plan)
7 أنشطة متنوعة (واحد لكل يوم):
```json
{
  "day": 1,
  "dayName": "الأحد",
  "activity": "نشاط محدد",
  "duration": "15 دقيقة",
  "skills": ["المهارة المستهدفة"]
}
```

## 9. التنبيه المختص (Specialist Alert)
- **specialistAlert**: true/false
- إذا كان true، اذكر السبب بلغة لطيفة وغير مخيفة
- ركز على الحالات التي تستدعي استشارة حقيقية

## 10. الاهتمامات السلوكية (Behavioral Concerns)
أي أنماط سلوكية لاحظتها:
- التجنب المتكرر
- الخروج المبكر
- التردد الزائد
- فرط النشاط

## 11. المقارنة مع الفئة العمرية (Comparison)
JSON يوضح موقع الطفل بين أقرانه:
```json
{
  "percentile": 65,
  "strengths_compared_to_peers": ["..."],
  "areas_behind_peers": ["..."]
}
```

## 12. مؤشرات التقدم (Progress Indicators)
مقاييس يمكن تتبعها:
```json
{
  "completion_rate": 0.85,
  "improvement_potential": "high",
  "consistency_score": 0.72
}
```

## 13. مستوى الثقة (Confidence Level)
رقم من 0.0 إلى 1.0 يعكس مدى ثقتك في التحليل بناءً على:
- كمية البيانات
- جودة الأداء
- التناسق

---

# تعليمات مهمة
- استخدم لغة عربية بسيطة ودافئة
- كن دقيقاً ومهنياً لكن طمئن الأهل
- اربط التحليل بالعمر ${childAge} سنوات
- تجنب المصطلحات التشخيصية الطبية
- كن صادقاً لكن إيجابياً

# صيغة الإخراج
أجب بتنسيق JSON فقط:

\`\`\`json
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
  "skillBreakdown": {
    "description": "string",
    "details": {}
  },
  "aiSummary": "string",
  "detailedAnalysis": "string",
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "explanations": ["string"],
  "recommendations": ["string"],
  "weeklyPlan": [
    {
      "day": 1,
      "dayName": "الأحد",
      "activity": "string",
      "duration": "string",
      "skills": ["string"]
    }
  ],
  "specialistAlert": boolean,
  "specialistAlertReason": "string or null",
  "behavioralConcerns": ["string"],
  "comparisonWithAgeGroup": {
    "percentile": number,
    "strengths_compared_to_peers": ["string"],
    "areas_behind_peers": ["string"]
  },
  "progressIndicators": {
    "completion_rate": number,
    "improvement_potential": "low" | "medium" | "high",
    "consistency_score": number
  },
  "confidenceLevel": number
}
\`\`\``;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from AI');

    const analysis: ComprehensiveAnalysisResult = JSON.parse(content);
    const processingTime = Date.now() - startTime;

    await supabase.from('ai_activity_log').insert({
      child_id: sessions[0]?.child_id,
      operation_type: 'comprehensive_analysis',
      input_data: {
        sessions: sessions.length,
        childAge,
        childName,
      },
      output_data: analysis,
      ai_model: 'gpt-4o',
      tokens_used: response.usage?.total_tokens || 0,
      processing_time_ms: processingTime,
      status: 'completed',
    });

    return analysis;
  } catch (error) {
    console.error('Error generating comprehensive analysis:', error);

    await supabase.from('ai_activity_log').insert({
      child_id: sessions[0]?.child_id,
      operation_type: 'comprehensive_analysis',
      input_data: {
        sessions: sessions.length,
        childAge,
        childName,
      },
      ai_model: 'gpt-4o',
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

export async function logAIActivity(
  childId: string,
  operationType: string,
  inputData: any,
  outputData?: any,
  error?: string
) {
  await supabase.from('ai_activity_log').insert({
    child_id: childId,
    operation_type: operationType,
    input_data: inputData,
    output_data: outputData,
    ai_model: 'gpt-4o-mini',
    status: error ? 'failed' : 'completed',
    error_message: error,
  });
}
