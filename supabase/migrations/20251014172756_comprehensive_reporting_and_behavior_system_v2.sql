/*
  # Comprehensive Reporting and Behavior Tracking System

  1. New Tables
    - `children_profiles` - Extended child information for personalized analysis
    - `mini_reports` - Individual game analysis reports (GPT-generated Markdown)
    - `final_reports` - Comprehensive session reports analyzing all mini reports
    - `behavior_logs` - Background behavioral pattern tracking
    - `behavior_insights` - AI-generated behavioral classifications and tips
    
  2. Changes to Existing Tables
    - Add behavior tracking fields to game_sessions
    - Add behavior metrics to assessment_paths
    
  3. Security
    - Enable RLS on all new tables
    - Policies ensure users only access their own data
    - Child profiles linked to authenticated users
*/

-- Children Profiles Table
CREATE TABLE IF NOT EXISTS children_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_name text NOT NULL,
  birth_date date NOT NULL,
  gender text CHECK (gender IN ('male', 'female', 'other')) NOT NULL,
  avatar_url text,
  parent_name text NOT NULL,
  parent_email text NOT NULL,
  parent_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE children_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own children profiles"
  ON children_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own children profiles"
  ON children_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own children profiles"
  ON children_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Mini Reports Table (per-game analysis)
CREATE TABLE IF NOT EXISTS mini_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE NOT NULL,
  child_id uuid REFERENCES children_profiles(id) ON DELETE CASCADE NOT NULL,
  game_type text NOT NULL,
  score integer CHECK (score >= 0 AND score <= 100) NOT NULL,
  feedback text NOT NULL,
  improvement_tip text NOT NULL,
  markdown_content text NOT NULL,
  metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mini_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mini reports"
  ON mini_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children_profiles
      WHERE children_profiles.id = mini_reports.child_id
      AND children_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own mini reports"
  ON mini_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children_profiles
      WHERE children_profiles.id = mini_reports.child_id
      AND children_profiles.user_id = auth.uid()
    )
  );

-- Final Reports Table (comprehensive session analysis)
CREATE TABLE IF NOT EXISTS final_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_path_id uuid REFERENCES assessment_paths(id) ON DELETE CASCADE NOT NULL,
  child_id uuid REFERENCES children_profiles(id) ON DELETE CASCADE NOT NULL,
  markdown_content text NOT NULL,
  skill_summary jsonb DEFAULT '{}'::jsonb,
  overall_trend text CHECK (overall_trend IN ('improving', 'stable', 'needs_support')),
  ai_insights text NOT NULL,
  recommendations text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE final_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own final reports"
  ON final_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children_profiles
      WHERE children_profiles.id = final_reports.child_id
      AND children_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own final reports"
  ON final_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children_profiles
      WHERE children_profiles.id = final_reports.child_id
      AND children_profiles.user_id = auth.uid()
    )
  );

-- Behavior Logs Table (background tracking)
CREATE TABLE IF NOT EXISTS behavior_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children_profiles(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE behavior_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own behavior logs"
  ON behavior_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children_profiles
      WHERE children_profiles.id = behavior_logs.child_id
      AND children_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own behavior logs"
  ON behavior_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children_profiles
      WHERE children_profiles.id = behavior_logs.child_id
      AND children_profiles.user_id = auth.uid()
    )
  );

-- Behavior Insights Table (AI analysis of patterns)
CREATE TABLE IF NOT EXISTS behavior_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children_profiles(id) ON DELETE CASCADE NOT NULL,
  classification text CHECK (classification IN ('active', 'cautious', 'avoidant', 'unstable', 'consistent')),
  insights text[] DEFAULT '{}'::text[],
  guidance text NOT NULL,
  markdown_content text NOT NULL,
  analysis_period_start timestamptz NOT NULL,
  analysis_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE behavior_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own behavior insights"
  ON behavior_insights FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children_profiles
      WHERE children_profiles.id = behavior_insights.child_id
      AND children_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own behavior insights"
  ON behavior_insights FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children_profiles
      WHERE children_profiles.id = behavior_insights.child_id
      AND children_profiles.user_id = auth.uid()
    )
  );

-- Add behavior tracking fields to game_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_sessions' AND column_name = 'hesitation_count'
  ) THEN
    ALTER TABLE game_sessions ADD COLUMN hesitation_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_sessions' AND column_name = 'pause_count'
  ) THEN
    ALTER TABLE game_sessions ADD COLUMN pause_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_sessions' AND column_name = 'switch_count'
  ) THEN
    ALTER TABLE game_sessions ADD COLUMN switch_count integer DEFAULT 0;
  END IF;
END $$;

-- Add behavior metrics to assessment_paths
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessment_paths' AND column_name = 'behavior_metrics'
  ) THEN
    ALTER TABLE assessment_paths ADD COLUMN behavior_metrics jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessment_paths' AND column_name = 'total_session_time'
  ) THEN
    ALTER TABLE assessment_paths ADD COLUMN total_session_time integer DEFAULT 0;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mini_reports_child_id ON mini_reports(child_id);
CREATE INDEX IF NOT EXISTS idx_mini_reports_session_id ON mini_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_final_reports_child_id ON final_reports(child_id);
CREATE INDEX IF NOT EXISTS idx_final_reports_assessment_path_id ON final_reports(assessment_path_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_child_id ON behavior_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_created_at ON behavior_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_behavior_insights_child_id ON behavior_insights(child_id);
CREATE INDEX IF NOT EXISTS idx_children_profiles_user_id ON children_profiles(user_id);
