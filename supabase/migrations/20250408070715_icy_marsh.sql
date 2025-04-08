/*
  # Fix chat history messages storage

  1. Changes
    - Update chat_history table to store messages as JSONB instead of JSONB[]
    - Add NOT NULL constraint to messages column
    - Add default empty array for messages

  2. Security
    - Maintain existing RLS policies
*/

-- Update messages column to be JSONB (not JSONB[]) with proper default
ALTER TABLE chat_history 
  ALTER COLUMN messages TYPE JSONB USING messages::jsonb,
  ALTER COLUMN messages SET DEFAULT '[]'::jsonb,
  ALTER COLUMN messages SET NOT NULL;