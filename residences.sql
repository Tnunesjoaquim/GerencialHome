-- Drop the old houses column from user_profiles (optional, you can do this later)
-- ALTER TABLE user_profiles DROP COLUMN houses;

-- Create the new residences table
CREATE TABLE IF NOT EXISTS public.residences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    photo_url TEXT,
    address TEXT,
    number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.residences ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own residences
CREATE POLICY "Users can view their own residences" 
ON public.residences FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own residences" 
ON public.residences FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own residences" 
ON public.residences FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own residences" 
ON public.residences FOR DELETE 
USING (auth.uid() = owner_id);
