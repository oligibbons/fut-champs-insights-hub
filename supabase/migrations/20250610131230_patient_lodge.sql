/*
  # Create gaming accounts table

  1. New Tables
    - `gaming_accounts`
      - `id` (text, primary key) - Custom ID for the gaming account
      - `user_id` (uuid, foreign key) - References auth.users
      - `name` (text) - Display name for the account
      - `platform` (text) - Gaming platform (PS5, Xbox, PC, Switch)
      - `is_active` (boolean) - Whether this is the currently active account
      - `created_at` (timestamp) - When the account was created
      - `games_played` (integer) - Total games played on this account
      - `total_wins` (integer) - Total wins on this account
      - `gamertag` (text) - Online gaming ID/username

  2. Security
    - Enable RLS on `gaming_accounts` table
    - Add policy for users to manage their own gaming accounts
*/

CREATE TABLE IF NOT EXISTS public.gaming_accounts (
    id text PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    platform text NOT NULL CHECK (platform IN ('PS5', 'Xbox', 'PC', 'Switch')),
    is_active boolean DEFAULT false,
    created_at timestamptz DEFAULT now() NOT NULL,
    games_played integer DEFAULT 0,
    total_wins integer DEFAULT 0,
    gamertag text
);

ALTER TABLE public.gaming_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own gaming accounts"
    ON public.gaming_accounts
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_gaming_accounts_user_id ON public.gaming_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_gaming_accounts_active ON public.gaming_accounts(user_id, is_active) WHERE is_active = true;