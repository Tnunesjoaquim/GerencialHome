-- Allow members to also view the residences they are part of.
DROP POLICY IF EXISTS "Users can view their own residences" ON public.residences;
DROP POLICY IF EXISTS "Users can view residences they have access to" ON public.residences;

CREATE POLICY "Users can view residences they have access to" 
ON public.residences FOR SELECT 
USING ( public.user_has_residence_access(id) );
