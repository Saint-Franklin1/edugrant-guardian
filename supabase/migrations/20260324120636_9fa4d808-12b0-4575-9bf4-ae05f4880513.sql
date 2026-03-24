
-- Add admin_level to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_level text CHECK (admin_level IN ('ward', 'constituency', 'county'));

-- Add fraud/flag columns to documents
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS flag_reason text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_name text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS extraction_attempts integer DEFAULT 0;

-- Unique partial index: only one active document per student per type
CREATE UNIQUE INDEX IF NOT EXISTS one_active_doc_per_type ON public.documents (student_id, type) WHERE is_active = true;

-- RLS policy: prevent admin_level update once set
CREATE POLICY "prevent_admin_level_update_once_set" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    -- Allow if admin_level is currently null (first time setting it)
    -- OR if the update doesn't change admin_level
    admin_level IS NULL OR admin_level = admin_level
  );
