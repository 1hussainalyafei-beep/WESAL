/*
  # Cognitive Assessment Platform Schema

  ## Overview
  This migration creates the complete database schema for a children's cognitive assessment platform.

  ## New Tables
  
  ### 1. children
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `name` (text)
  - `avatar_url` (text)
  - `birth_date` (date)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. game_sessions
  - `id` (uuid, primary key)
  - `child_id` (uuid, foreign key)
  - `game_type` (text) - memory, attention, logic, visual, pattern, creative
  - `raw_data` (jsonb) - interaction data, times, clicks, etc.
  - `score` (integer) - 0-100
  - `duration_seconds` (integer)
  - `completed_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 3. game_reports
  - `id` (uuid, primary key)
  - `session_id` (uuid, foreign key)
  - `analysis` (text) - GPT generated analysis
  - `performance_score` (integer) - 0-100
  - `strengths` (jsonb) - array of strengths
  - `recommendations` (jsonb) - array of recommendations
  - `level` (text) - below_normal, normal, above_normal
  - `created_at` (timestamptz)

  ### 4. comprehensive_reports
  - `id` (uuid, primary key)
  - `child_id` (uuid, foreign key)
  - `assessment_date` (timestamptz)
  - `overall_score` (integer) - 0-100
  - `cognitive_map` (jsonb) - scores for each cognitive domain
  - `detailed_analysis` (text) - GPT generated comprehensive analysis
  - `recommendations` (jsonb) - array of practical recommendations
  - `specialist_alert` (text) - alert message if needed
  - `encouragement` (text) - personalized encouragement message
  - `created_at` (timestamptz)

  ### 5. behavior_logs
  - `id` (uuid, primary key)
  - `child_id` (uuid, foreign key)
  - `event_type` (text) - game_start, game_quit, long_pause, etc.
  - `game_type` (text)
  - `metadata` (jsonb)
  - `created_at` (timestamptz)

  ### 6. consultations
  - `id` (uuid, primary key)
  - `child_id` (uuid, foreign key)
  - `specialist_id` (uuid)
  - `report_id` (uuid, foreign key)
  - `status` (text) - pending, scheduled, completed
  - `appointment_date` (timestamptz)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 7. store_products
  - `id` (uuid, primary key)
  - `name` (text)
  - `description` (text)
  - `price` (decimal)
  - `image_url` (text)
  - `category` (text) - memory, logic, attention, etc.
  - `recommended_for` (jsonb) - cognitive profiles this suits
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to access their own children's data
*/

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  avatar_url text DEFAULT '',
  birth_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  game_type text NOT NULL CHECK (game_type IN ('memory', 'attention', 'logic', 'visual', 'pattern', 'creative')),
  raw_data jsonb DEFAULT '{}'::jsonb,
  score integer DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  duration_seconds integer DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create game_reports table
CREATE TABLE IF NOT EXISTS game_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE NOT NULL,
  analysis text DEFAULT '',
  performance_score integer DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
  strengths jsonb DEFAULT '[]'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  level text DEFAULT 'normal' CHECK (level IN ('below_normal', 'normal', 'above_normal')),
  created_at timestamptz DEFAULT now()
);

-- Create comprehensive_reports table
CREATE TABLE IF NOT EXISTS comprehensive_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  assessment_date timestamptz DEFAULT now(),
  overall_score integer DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  cognitive_map jsonb DEFAULT '{}'::jsonb,
  detailed_analysis text DEFAULT '',
  recommendations jsonb DEFAULT '[]'::jsonb,
  specialist_alert text DEFAULT '',
  encouragement text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create behavior_logs table
CREATE TABLE IF NOT EXISTS behavior_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  game_type text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  specialist_id uuid DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES comprehensive_reports(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  appointment_date timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create store_products table
CREATE TABLE IF NOT EXISTS store_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) DEFAULT 0,
  image_url text DEFAULT '',
  category text NOT NULL,
  recommended_for jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprehensive_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for children
CREATE POLICY "Users can view own children"
  ON children FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own children"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own children"
  ON children FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own children"
  ON children FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for game_sessions
CREATE POLICY "Users can view own children's sessions"
  ON game_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = game_sessions.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sessions for own children"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = game_sessions.child_id
      AND children.user_id = auth.uid()
    )
  );

-- RLS Policies for game_reports
CREATE POLICY "Users can view reports for own children's sessions"
  ON game_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_sessions
      JOIN children ON children.id = game_sessions.child_id
      WHERE game_sessions.id = game_reports.session_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reports for own children's sessions"
  ON game_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_sessions
      JOIN children ON children.id = game_sessions.child_id
      WHERE game_sessions.id = game_reports.session_id
      AND children.user_id = auth.uid()
    )
  );

-- RLS Policies for comprehensive_reports
CREATE POLICY "Users can view own children's comprehensive reports"
  ON comprehensive_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = comprehensive_reports.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert comprehensive reports for own children"
  ON comprehensive_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = comprehensive_reports.child_id
      AND children.user_id = auth.uid()
    )
  );

-- RLS Policies for behavior_logs
CREATE POLICY "Users can view own children's behavior logs"
  ON behavior_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = behavior_logs.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert behavior logs for own children"
  ON behavior_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = behavior_logs.child_id
      AND children.user_id = auth.uid()
    )
  );

-- RLS Policies for consultations
CREATE POLICY "Users can view own children's consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = consultations.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert consultations for own children"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = consultations.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own children's consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = consultations.child_id
      AND children.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = consultations.child_id
      AND children.user_id = auth.uid()
    )
  );

-- RLS Policies for store_products (public read)
CREATE POLICY "Anyone can view store products"
  ON store_products FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_child_id ON game_sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type ON game_sessions(game_type);
CREATE INDEX IF NOT EXISTS idx_game_reports_session_id ON game_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_comprehensive_reports_child_id ON comprehensive_reports(child_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_child_id ON behavior_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_consultations_child_id ON consultations(child_id);