/*
  # Fix RLS policy for mini_reports table

  1. Security Changes
    - Drop existing incorrect RLS policies on mini_reports table
    - Create new correct RLS policies that reference the children table instead of children_profiles
    - Allow authenticated users to insert and select mini_reports for their own children

  2. Policy Details
    - INSERT policy: Users can insert mini_reports for children they own
    - SELECT policy: Users can view mini_reports for children they own
*/

-- Drop existing incorrect policies
DROP POLICY IF EXISTS "Users can insert own mini reports" ON mini_reports;
DROP POLICY IF EXISTS "Users can view own mini reports" ON mini_reports;

-- Create correct INSERT policy for mini_reports
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

-- Create correct SELECT policy for mini_reports
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