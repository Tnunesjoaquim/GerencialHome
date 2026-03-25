-- Drop recursive policies on residence_members
DROP POLICY IF EXISTS "Users can view members of their residences" ON public.residence_members;
DROP POLICY IF EXISTS "Owners and Admins can insert members" ON public.residence_members;
DROP POLICY IF EXISTS "Owners and Admins can update members" ON public.residence_members;
DROP POLICY IF EXISTS "Owners and Admins can delete members" ON public.residence_members;

-- Drop recursive policies on residence_invites
DROP POLICY IF EXISTS "Owners and Admins can view invites" ON public.residence_invites;
DROP POLICY IF EXISTS "Owners and Admins can insert invites" ON public.residence_invites;
DROP POLICY IF EXISTS "Owners and Admins can delete invites" ON public.residence_invites;

-- 1. Helper Function: Check general access
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

-- 2. Helper Function: Check Admin access
CREATE OR REPLACE FUNCTION public.user_is_residence_admin(target_residence_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.residences WHERE id = target_residence_id AND owner_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.residence_members WHERE residence_id = target_residence_id AND user_id = auth.uid() AND role = 'Admin'
    );
$$;

-- Apply non-recursive policies to residence_members
CREATE POLICY "Users can view members of their residences"
ON public.residence_members FOR SELECT
USING ( public.user_has_residence_access(residence_id) );

CREATE POLICY "Owners and Admins can insert members"
ON public.residence_members FOR INSERT
WITH CHECK ( public.user_is_residence_admin(residence_id) );

CREATE POLICY "Owners and Admins can update members"
ON public.residence_members FOR UPDATE
USING ( public.user_is_residence_admin(residence_id) );

CREATE POLICY "Owners and Admins can delete members"
ON public.residence_members FOR DELETE
USING ( public.user_is_residence_admin(residence_id) );


-- Apply non-recursive policies to residence_invites
CREATE POLICY "Owners and Admins can view invites"
ON public.residence_invites FOR SELECT
USING ( public.user_is_residence_admin(residence_id) );

CREATE POLICY "Owners and Admins can insert invites"
ON public.residence_invites FOR INSERT
WITH CHECK ( public.user_is_residence_admin(residence_id) );

CREATE POLICY "Owners and Admins can delete invites"
ON public.residence_invites FOR DELETE
USING ( public.user_is_residence_admin(residence_id) );
