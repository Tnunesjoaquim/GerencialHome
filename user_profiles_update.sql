-- Add avatar_url and nickname to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS nickname TEXT;
