/*
  # إضافة نظام مسارات التقييم - Assessment Paths System

  ## التغييرات الرئيسية

  1. **جدول مسارات التقييم (assessment_paths)**
     - تتبع كل مسار تقييم يبدأه الطفل
     - حفظ نوع المسار (لعبة واحدة أو جميع الألعاب)
     - حالة المسار (قيد التنفيذ، مكتمل، متوقف)
     - الألعاب المكتملة في هذا المسار
     - ربط مع التقرير الشامل النهائي

  2. **تحديث جدول الجلسات**
     - ربط كل جلسة لعبة مع مسار التقييم الخاص بها
     - إضافة معلومات إضافية للتتبع

  3. **تحديث جدول التقارير**
     - ربط التقارير الشاملة بمسار التقييم
     - إضافة حقول جديدة للتحليل الأفضل

  ## الأمان
  - Row Level Security مفعّل على الجدول الجديد
  - كل مستخدم يرى مساراته فقط
  - سياسات صارمة للوصول والتعديل
*/

-- إنشاء جدول مسارات التقييم
CREATE TABLE IF NOT EXISTS assessment_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,

  -- نوع المسار
  path_type text CHECK (path_type IN ('single', 'all')) NOT NULL,

  -- حالة المسار
  status text CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',

  -- الألعاب في هذا المسار
  target_games text[] NOT NULL,
  completed_games text[] DEFAULT ARRAY[]::text[],

  -- الجلسات المرتبطة
  session_ids uuid[] DEFAULT ARRAY[]::uuid[],

  -- التقرير الشامل
  comprehensive_report_id uuid REFERENCES comprehensive_reports(id) ON DELETE SET NULL,

  -- الإحصائيات
  total_games integer DEFAULT 0,
  completed_games_count integer DEFAULT 0,
  average_score decimal(5,2),
  total_duration_seconds integer DEFAULT 0,

  -- التواريخ
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  last_activity_at timestamptz DEFAULT now(),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تحديث جدول game_sessions لإضافة assessment_path_id
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS assessment_path_id uuid REFERENCES assessment_paths(id) ON DELETE CASCADE;

-- تحديث جدول comprehensive_reports لإضافة assessment_path_id
ALTER TABLE comprehensive_reports
ADD COLUMN IF NOT EXISTS assessment_path_id uuid REFERENCES assessment_paths(id) ON DELETE CASCADE;

-- تحديث جدول game_reports لإضافة حقول جديدة
ALTER TABLE game_reports
ADD COLUMN IF NOT EXISTS status text DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS sub_scores jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS reasons text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS tip text DEFAULT '',
ADD COLUMN IF NOT EXISTS flags text[] DEFAULT ARRAY[]::text[];

-- إنشاء Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_assessment_paths_child_id
  ON assessment_paths(child_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_paths_status
  ON assessment_paths(status, last_activity_at DESC);

CREATE INDEX IF NOT EXISTS idx_game_sessions_assessment_path
  ON game_sessions(assessment_path_id);

-- Enable Row Level Security
ALTER TABLE assessment_paths ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessment_paths
CREATE POLICY "Users can view own assessment paths"
  ON assessment_paths FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own assessment paths"
  ON assessment_paths FOR INSERT
  TO authenticated
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own assessment paths"
  ON assessment_paths FOR UPDATE
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own assessment paths"
  ON assessment_paths FOR DELETE
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

-- Function لتحديث آخر نشاط تلقائياً
CREATE OR REPLACE FUNCTION update_assessment_path_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE assessment_paths
  SET
    last_activity_at = now(),
    updated_at = now()
  WHERE id = NEW.assessment_path_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث النشاط عند إضافة جلسة جديدة
CREATE TRIGGER update_path_activity_on_session
  AFTER INSERT ON game_sessions
  FOR EACH ROW
  WHEN (NEW.assessment_path_id IS NOT NULL)
  EXECUTE FUNCTION update_assessment_path_activity();
