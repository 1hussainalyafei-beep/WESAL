/*
# إصلاح سياسات الأمان لجميع جداول التقارير

1. إصلاح mini_reports
2. إصلاح final_reports  
3. إصلاح comprehensive_reports
4. إصلاح game_reports
*/

-- إصلاح mini_reports
DROP POLICY IF EXISTS "Users can insert own mini reports" ON mini_reports;
DROP POLICY IF EXISTS "Users can view own mini reports" ON mini_reports;

CREATE POLICY "Users can insert mini reports for own children"
  ON mini_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children 
      WHERE children.id = mini_reports.child_id 
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view mini reports for own children"
  ON mini_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children 
      WHERE children.id = mini_reports.child_id 
      AND children.user_id = auth.uid()
    )
  );

-- إصلاح final_reports
DROP POLICY IF EXISTS "Users can insert own final reports" ON final_reports;
DROP POLICY IF EXISTS "Users can view own final reports" ON final_reports;

CREATE POLICY "Users can insert final reports for own children"
  ON final_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children 
      WHERE children.id = final_reports.child_id 
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view final reports for own children"
  ON final_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children 
      WHERE children.id = final_reports.child_id 
      AND children.user_id = auth.uid()
    )
  );

-- إصلاح comprehensive_reports (إذا لم تكن موجودة)
CREATE POLICY "Users can insert comprehensive reports for own children"
  ON comprehensive_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children 
      WHERE children.id = comprehensive_reports.child_id 
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view comprehensive reports for own children"
  ON comprehensive_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children 
      WHERE children.id = comprehensive_reports.child_id 
      AND children.user_id = auth.uid()
    )
  );

-- إصلاح game_reports
DROP POLICY IF EXISTS "Users can insert reports for own children's sessions" ON game_reports;
DROP POLICY IF EXISTS "Users can view reports for own children's sessions" ON game_reports;

CREATE POLICY "Users can insert game reports for own children"
  ON game_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_sessions
      JOIN children ON children.id = game_sessions.child_id
      WHERE game_sessions.id = game_reports.session_id 
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view game reports for own children"
  ON game_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_sessions
      JOIN children ON children.id = game_sessions.child_id
      WHERE game_sessions.id = game_reports.session_id 
      AND children.user_id = auth.uid()
    )
  );