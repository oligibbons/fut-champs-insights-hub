/*
  # Add admin fields to profiles table

  1. Changes
    - Add `is_admin` boolean column to profiles table
    - Add `is_banned` boolean column to profiles table
    - Set default values to false
    - Make columns nullable to handle existing records

  2. Security
    - No RLS changes needed as this is just adding columns to existing table
*/

-- Add admin fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_banned'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_banned boolean DEFAULT false;
  END IF;
END $$;

-- Set admin status for specific user
UPDATE profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'olipg@hotmail.co.uk'
);