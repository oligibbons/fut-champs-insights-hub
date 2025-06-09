/*
  # Add current_streak column to weekly_performances table

  1. Changes
    - Add `current_streak` column to `weekly_performances` table
    - Set default value to 0
    - Make column nullable to handle existing records

  2. Security
    - No RLS changes needed as this is just adding a column to existing table
*/

-- Add the missing current_streak column to weekly_performances table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'weekly_performances' AND column_name = 'current_streak'
  ) THEN
    ALTER TABLE weekly_performances ADD COLUMN current_streak integer DEFAULT 0;
  END IF;
END $$;