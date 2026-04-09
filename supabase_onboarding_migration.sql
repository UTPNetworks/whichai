-- Migration to update profiles table for strict 4-step onboarding
-- Execute this in your Supabase SQL Editor

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS ai_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false;

-- Create an index for username if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
