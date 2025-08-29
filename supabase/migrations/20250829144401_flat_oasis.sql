/*
  # Create scenarios table for cap table modeling

  1. New Tables
    - `scenarios`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text, scenario name)
      - `data` (jsonb, complete scenario data)
      - `created_at` (timestamptz, auto-generated)

  2. Security
    - Enable RLS on `scenarios` table
    - Add policy for users to manage their own scenarios only
    - Users can insert, select, update, and delete their own scenarios

  3. Indexes
    - Index on user_id for fast scenario retrieval
    - Index on created_at for chronological ordering
*/

-- Create scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Create policies for scenarios
CREATE POLICY "Users can manage their own scenarios"
  ON scenarios
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS scenarios_user_id_idx ON scenarios(user_id);
CREATE INDEX IF NOT EXISTS scenarios_created_at_idx ON scenarios(created_at DESC);