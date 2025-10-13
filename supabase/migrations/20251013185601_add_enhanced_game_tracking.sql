/*
  # Enhanced Game Tracking Schema

  ## Changes
  1. Add columns to game_sessions for enhanced tracking:
     - `completed` (boolean) - whether game was fully completed
     - `started_at` (timestamptz) - when game started
     - `metrics` (jsonb) - detailed metrics (accuracy, latency, attempts, hesitations, etc.)
     
  2. Add columns to game_reports for mini-reports:
     - `status` (text) - verbal status (ممتاز، جيد، مقبول يحتاج دعم، يحتاج دعم واضح)
     - `sub_scores` (jsonb) - breakdown of scores (accuracy, latency, impulsivity, stability)
     - `reasons` (jsonb) - array of reason snippets
     - `tip` (text) - single actionable tip
     - `flags` (jsonb) - array of behavioral flags
  
  3. Add assessment_sequences table for tracking multi-game sessions:
     - Track which games completed in sequence
     - Support resume functionality
     - Link to comprehensive report when complete
  
  4. Add domain_scores to comprehensive_reports:
     - Separate scores for each cognitive domain
     - Confidence levels
  
  ## Security
  - All tables already have RLS enabled
  - Policies ensure users only access their own data
*/

-- Add new columns to game_sessions if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_sessions' AND column_name = 'completed'
  ) THEN
    ALTER TABLE game_sessions ADD COLUMN completed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_sessions' AND column_name = 'started_at'
  ) THEN
    ALTER TABLE game_sessions ADD COLUMN started_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_sessions' AND column_name = 'metrics'
  ) THEN
    ALTER TABLE game_sessions ADD COLUMN metrics jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add new columns to game_reports if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_reports' AND column_name = 'status'
  ) THEN
    ALTER TABLE game_reports ADD COLUMN status text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_reports' AND column_name = 'sub_scores'
  ) THEN
    ALTER TABLE game_reports ADD COLUMN sub_scores jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_reports' AND column_name = 'reasons'
  ) THEN
    ALTER TABLE game_reports ADD COLUMN reasons jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_reports' AND column_name = 'tip'
  ) THEN
    ALTER TABLE game_reports ADD COLUMN tip text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_reports' AND column_name = 'flags'
  ) THEN
    ALTER TABLE game_reports ADD COLUMN flags jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create assessment_sequences table
CREATE TABLE IF NOT EXISTS assessment_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  sequence_type text DEFAULT 'all_games' CHECK (sequence_type IN ('single_game', 'all_games')),
  games_completed jsonb DEFAULT '[]'::jsonb,
  games_remaining jsonb DEFAULT '[]'::jsonb,
  current_game text DEFAULT '',
  completed boolean DEFAULT false,
  comprehensive_report_id uuid REFERENCES comprehensive_reports(id) ON DELETE SET NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add RLS for assessment_sequences
ALTER TABLE assessment_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own children's sequences"
  ON assessment_sequences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = assessment_sequences.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sequences for own children"
  ON assessment_sequences FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = assessment_sequences.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own children's sequences"
  ON assessment_sequences FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = assessment_sequences.child_id
      AND children.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = assessment_sequences.child_id
      AND children.user_id = auth.uid()
    )
  );

-- Add domain_scores to comprehensive_reports
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comprehensive_reports' AND column_name = 'domain_scores'
  ) THEN
    ALTER TABLE comprehensive_reports ADD COLUMN domain_scores jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comprehensive_reports' AND column_name = 'confidence'
  ) THEN
    ALTER TABLE comprehensive_reports ADD COLUMN confidence text DEFAULT 'متوسط';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comprehensive_reports' AND column_name = 'levels'
  ) THEN
    ALTER TABLE comprehensive_reports ADD COLUMN levels jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comprehensive_reports' AND column_name = 'reasons'
  ) THEN
    ALTER TABLE comprehensive_reports ADD COLUMN reasons jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_assessment_sequences_child_id ON assessment_sequences(child_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sequences_completed ON assessment_sequences(completed);
