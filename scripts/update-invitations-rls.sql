-- Update RLS policies for invitations table to allow direct database access
-- Run this on your Supabase project

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view invitations for their email" ON public.invitations;
DROP POLICY IF EXISTS "Super admins can manage invitations" ON public.invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON public.invitations;

-- Allow anyone to read invitations by token (for accept-invite page)
CREATE POLICY "Anyone can view invitations by token"
  ON public.invitations
  FOR SELECT
  USING (true);

-- Allow admins and super_admins to insert invitations
CREATE POLICY "Staff can create invitations"
  ON public.invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Allow admins and super_admins to update invitations
CREATE POLICY "Staff can update invitations"
  ON public.invitations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Allow admins and super_admins to delete invitations
CREATE POLICY "Staff can delete invitations"
  ON public.invitations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Also allow authenticated users to update invitations for their email (to mark as used)
CREATE POLICY "Users can accept their own invitations"
  ON public.invitations
  FOR UPDATE
  USING (
    lower(invited_email) = lower(auth.email())
    AND status = 'pending'
  );

-- Add phone column if it doesn't exist
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS phone text;
