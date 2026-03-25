-- Add last_seen column to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
