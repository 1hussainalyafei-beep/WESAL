/*
  # Fix game_reports reasons column type

  1. Changes
    - Convert reasons column from jsonb to text[]
    - Handle existing data by converting jsonb arrays to text arrays
    - Use a temporary column to avoid subquery issues

  2. Notes
    - Creates temporary column for data migration
    - Copies converted data
    - Drops old column and renames new one
*/

-- Add a temporary text array column
ALTER TABLE game_reports ADD COLUMN IF NOT EXISTS reasons_temp text[];

-- Convert existing jsonb data to text array
UPDATE game_reports 
SET reasons_temp = ARRAY(
  SELECT jsonb_array_elements_text(reasons)
)
WHERE reasons IS NOT NULL AND jsonb_typeof(reasons) = 'array';

-- Drop the old jsonb column
ALTER TABLE game_reports DROP COLUMN IF EXISTS reasons;

-- Rename the temporary column to reasons
ALTER TABLE game_reports RENAME COLUMN reasons_temp TO reasons;

-- Set default value for the column
ALTER TABLE game_reports ALTER COLUMN reasons SET DEFAULT '{}';
