-- Create the residence_invites table
CREATE TABLE IF NOT EXISTS public.residence_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    residence_id UUID REFERENCES public.residences(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(residence_id, email) -- A specific email can only be invited once per residence
);

-- Enable Row Level Security
ALTER TABLE public.residence_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Owners and Admins can view invites for their residences
CREATE POLICY "Owners and Admins can view invites"
ON public.residence_invites FOR SELECT
USING ( public.user_is_residence_admin(residence_id) );

-- Policy: Owners and Admins can insert invites
CREATE POLICY "Owners and Admins can insert invites"
ON public.residence_invites FOR INSERT
WITH CHECK ( public.user_is_residence_admin(residence_id) );

-- Policy: Owners and Admins can delete invites
CREATE POLICY "Owners and Admins can delete invites"
ON public.residence_invites FOR DELETE
USING ( public.user_is_residence_admin(residence_id) );

-- Function to process invites automatically when a new user_profile is created
CREATE OR REPLACE FUNCTION process_residence_invites()
RETURNS TRIGGER AS $$
DECLARE
    invite_row RECORD;
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;

    IF user_email IS NOT NULL THEN
        -- Loop through all pending invites for this email
        FOR invite_row IN (SELECT * FROM public.residence_invites WHERE email ILIKE user_email) LOOP
            -- Insert the user into the residence_members
            INSERT INTO public.residence_members (residence_id, user_id, role)
            VALUES (invite_row.residence_id, NEW.id, invite_row.role)
            ON CONFLICT (residence_id, user_id) DO NOTHING; -- Ignore if they somehow joined already
            
            -- Delete the processed invite
            DELETE FROM public.residence_invites WHERE id = invite_row.id;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to watch for new user profiles
DROP TRIGGER IF EXISTS on_user_profile_created_process_invites ON public.user_profiles;
CREATE TRIGGER on_user_profile_created_process_invites
AFTER INSERT ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION process_residence_invites();
