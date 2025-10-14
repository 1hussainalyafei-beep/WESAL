/*
  # نظام التتبع الشامل والتحليل الدقيق - WESAL

  ## التغييرات الرئيسية

  1. **تحديث جدول الأطفال**
     - إضافة معلومات تفصيلية: الجنس، الصورة الرمزية، الاهتمامات
     - تحسين تتبع التواريخ

  2. **تحديث جدول الجلسات**
     - إضافة حقول تفصيلية للتتبع الدقيق
     - تخزين كل event بشكل منفصل
     - إضافة حالة الإكمال والخروج المبكر

  3. **تحسين جدول التقارير**
     - تقارير مصغرة لكل لعبة
     - تقارير شاملة محسّنة
     - ربط مع جلسات متعددة

  4. **نظام المراقبة السلوكية**
     - تتبع أنماط الاستخدام
     - تحديد السلوكيات (تجنب، تكرار، خروج مبكر)
     - توصيات تلقائية

  5. **تحليل الذكاء الاصطناعي**
     - تخزين كل تحليل GPT
     - ربط التحليلات بالجلسات
     - تاريخ كامل للتحليلات

  ## الأمان
  - Row Level Security مفعّل على جميع الجداول
  - كل مستخدم يرى بياناته فقط
  - سياسات صارمة للوصول
*/

-- تحديث جدول الأطفال
ALTER TABLE children
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS interests text[],
ADD COLUMN IF NOT EXISTS parent_name text,
ADD COLUMN IF NOT EXISTS parent_phone text;

-- تحديث جدول الجلسات
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS completed_at timestamptz,
ADD COLUMN IF NOT EXISTS early_exit boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hesitations_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS repetitions_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS interaction_pattern jsonb,
ADD COLUMN IF NOT EXISTS behavioral_flags text[];

-- إنشاء جدول التحليلات الشاملة المحسّن
CREATE TABLE IF NOT EXISTS comprehensive_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  session_ids uuid[] NOT NULL,
  analysis_type text CHECK (analysis_type IN ('mini', 'comprehensive')) NOT NULL,

  -- بيانات التحليل
  overall_score integer CHECK (overall_score BETWEEN 0 AND 100),
  overall_level text CHECK (overall_level IN ('below_normal', 'normal', 'above_normal')),

  -- تفاصيل المهارات
  domain_scores jsonb DEFAULT '{}'::jsonb,
  skill_breakdown jsonb DEFAULT '{}'::jsonb,

  -- التحليل النصي من GPT
  ai_summary text,
  detailed_analysis text,
  strengths text[],
  areas_for_improvement text[],
  explanations text[],
  recommendations text[],

  -- خطة العمل
  weekly_plan jsonb,
  daily_activities jsonb,

  -- التنبيهات
  specialist_alert boolean DEFAULT false,
  specialist_alert_reason text,
  behavioral_concerns text[],

  -- بيانات إضافية
  comparison_with_age_group jsonb,
  progress_indicators jsonb,
  confidence_level decimal(3,2) CHECK (confidence_level BETWEEN 0 AND 1),

  -- التواريخ
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول المراقبة السلوكية
CREATE TABLE IF NOT EXISTS behavioral_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,

  -- نوع النمط
  pattern_type text CHECK (pattern_type IN (
    'regular', 'hesitant', 'avoidant', 'hyperactive',
    'stable', 'repetitive', 'early_exit', 'focused'
  )) NOT NULL,

  -- البيانات
  game_type text,
  frequency integer DEFAULT 1,
  duration_average integer,
  last_occurrence timestamptz DEFAULT now(),

  -- السياق
  context jsonb DEFAULT '{}'::jsonb,
  triggers text[],

  -- التحليل
  severity text CHECK (severity IN ('low', 'medium', 'high')) DEFAULT 'low',
  ai_interpretation text,
  recommended_action text,

  -- الحالة
  acknowledged boolean DEFAULT false,
  resolved boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول نشاط الذكاء الاصطناعي
CREATE TABLE IF NOT EXISTS ai_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,

  -- نوع العملية
  operation_type text CHECK (operation_type IN (
    'mini_analysis', 'comprehensive_analysis',
    'behavioral_analysis', 'recommendation_generation'
  )) NOT NULL,

  -- البيانات المُدخلة
  input_data jsonb NOT NULL,

  -- النتيجة
  output_data jsonb,
  ai_model text DEFAULT 'gpt-4o-mini',
  tokens_used integer,
  processing_time_ms integer,

  -- الحالة
  status text CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  error_message text,

  created_at timestamptz DEFAULT now()
);

-- جدول التقدم اليومي
CREATE TABLE IF NOT EXISTS daily_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,

  -- إحصائيات اليوم
  games_played integer DEFAULT 0,
  total_duration_seconds integer DEFAULT 0,
  games_completed integer DEFAULT 0,
  games_abandoned integer DEFAULT 0,

  -- الأداء
  average_score decimal(5,2),
  best_game text,
  worst_game text,

  -- السلوك
  engagement_level text CHECK (engagement_level IN ('low', 'medium', 'high')),
  mood_indicator text,

  -- الإنجازات
  achievements text[],
  milestones_reached text[],

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(child_id, date)
);

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_comprehensive_analyses_child
  ON comprehensive_analyses(child_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_behavioral_patterns_child
  ON behavioral_patterns(child_id, pattern_type, last_occurrence DESC);

CREATE INDEX IF NOT EXISTS idx_ai_activity_child
  ON ai_activity_log(child_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_progress_child_date
  ON daily_progress(child_id, date DESC);

-- Enable RLS
ALTER TABLE comprehensive_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comprehensive_analyses
CREATE POLICY "Users can view own comprehensive analyses"
  ON comprehensive_analyses FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own comprehensive analyses"
  ON comprehensive_analyses FOR INSERT
  TO authenticated
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for behavioral_patterns
CREATE POLICY "Users can view own behavioral patterns"
  ON behavioral_patterns FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own behavioral patterns"
  ON behavioral_patterns FOR INSERT
  TO authenticated
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own behavioral patterns"
  ON behavioral_patterns FOR UPDATE
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for ai_activity_log
CREATE POLICY "Users can view own ai activity"
  ON ai_activity_log FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own ai activity"
  ON ai_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for daily_progress
CREATE POLICY "Users can view own daily progress"
  ON daily_progress FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own daily progress"
  ON daily_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own daily progress"
  ON daily_progress FOR UPDATE
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_daily_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_progress (child_id, date, games_played, games_completed)
  VALUES (
    NEW.child_id,
    CURRENT_DATE,
    1,
    CASE WHEN NEW.completed THEN 1 ELSE 0 END
  )
  ON CONFLICT (child_id, date)
  DO UPDATE SET
    games_played = daily_progress.games_played + 1,
    games_completed = daily_progress.games_completed +
      CASE WHEN NEW.completed THEN 1 ELSE 0 END,
    total_duration_seconds = daily_progress.total_duration_seconds +
      COALESCE(NEW.duration_seconds, 0),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_daily_progress
  AFTER INSERT ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_progress();
