-- Create the residence_members table
CREATE TABLE IF NOT EXISTS public.residence_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    residence_id UUID REFERENCES public.residences(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(residence_id, user_id) -- A user can only have one role per residence
);

-- Enable Row Level Security
ALTER TABLE public.residence_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view members of residences they are a part of
CREATE POLICY "Users can view members of their residences"
ON public.residence_members FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.residence_members rm
        WHERE rm.residence_id = public.residence_members.residence_id
        AND rm.user_id = auth.uid()
    )
    OR auth.uid() IN (SELECT owner_id FROM public.residences WHERE id = public.residence_members.residence_id)
);

-- Policy: Owners and Admins can insert new members (except Owner role)
CREATE POLICY "Owners and Admins can insert members"
ON public.residence_members FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.residence_members rm
        WHERE rm.residence_id = public.residence_members.residence_id
        AND rm.user_id = auth.uid()
        AND rm.role = 'Admin'
    )
    OR auth.uid() IN (SELECT owner_id FROM public.residences WHERE id = public.residence_members.residence_id)
);

-- Policy: Owners can update any member, Admins can update Staff
CREATE POLICY "Owners and Admins can update members"
ON public.residence_members FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.residence_members rm
        WHERE rm.residence_id = public.residence_members.residence_id
        AND rm.user_id = auth.uid()
        AND (rm.role = 'Admin' AND public.residence_members.role = 'Staff')
    )
    OR auth.uid() IN (SELECT owner_id FROM public.residences WHERE id = public.residence_members.residence_id)
);

-- Policy: Owners can delete any member, Admins can delete Staff
CREATE POLICY "Owners and Admins can delete members"
ON public.residence_members FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.residence_members rm
        WHERE rm.residence_id = public.residence_members.residence_id
        AND rm.user_id = auth.uid()
        AND (rm.role = 'Admin' AND public.residence_members.role = 'Staff')
    )
    OR auth.uid() IN (SELECT owner_id FROM public.residences WHERE id = public.residence_members.residence_id)
);

-- Helper function to check if user has access to a residence (useful for other RLS policies)
CREATE OR REPLACE FUNCTION public.user_has_residence_access(target_residence_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.residences WHERE id = target_residence_id AND owner_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.residence_members WHERE residence_id = target_residence_id AND user_id = auth.uid()
    );
$$;
