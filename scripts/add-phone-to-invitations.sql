-- Migration: Add phone column to invitations table
-- This supports pre-filling phone numbers when sending admin invites

-- Add phone column to invitations table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invitations' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.invitations ADD COLUMN phone text;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN public.invitations.phone IS 'Optional phone number for the invitee, pre-filled during profile completion';
