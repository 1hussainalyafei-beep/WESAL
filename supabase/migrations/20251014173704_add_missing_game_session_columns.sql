/*
  # Add missing columns to game_sessions table

  1. Changes
    - Add average_response_time column for tracking response times
    - Add accuracy_percentage column for tracking accuracy
    - Add total_moves column for tracking number of moves/attempts
    
  2. Notes
    - These columns are needed for detailed game analysis
    - Used by mini report generation service
*/

-- Add missing columns to game_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_sessions' AND column_name = 'average_response_time'
  ) THEN
    ALTER TABLE game_sessions ADD COLUMN average_response_time numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_sessions' AND column_name = 'accuracy_percentage'
  ) THEN
    ALTER TABLE game_sessions ADD COLUMN accuracy_percentage numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_sessions' AND column_name = 'total_moves'
  ) THEN
    ALTER TABLE game_sessions ADD COLUMN total_moves integer DEFAULT 0;
  END IF;
END $$;
