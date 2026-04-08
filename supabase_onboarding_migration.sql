-- Migration to update profiles table for onboarding
-- Execute this in your Supabase SQL Editor

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Optional: Update existing users to have a default value if needed
-- UPDATE profiles SET onboarding_completed = false WHERE onboarding_completed IS NULL;
-- UPDATE profiles SET terms_accepted = false WHERE terms_accepted IS NULL;
