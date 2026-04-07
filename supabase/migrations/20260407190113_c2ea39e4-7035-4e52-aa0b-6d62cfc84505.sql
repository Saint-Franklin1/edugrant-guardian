
-- PART 1: Create admin_access_codes table
CREATE TABLE public.admin_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code_hash text NOT NULL,
  role app_role NOT NULL,
  admin_level text NOT NULL,
  county text,
  constituency text,
  ward text,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_manage_access_codes" ON public.admin_access_codes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- PART 5: Fix privilege escalation - drop permissive INSERT policy on user_roles
DROP POLICY IF EXISTS "System inserts roles" ON public.user_roles;

-- Create secure role assignment function
CREATE OR REPLACE FUNCTION public.assign_role_secure(
  target_user uuid,
  new_role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'super_admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only super_admin can assign roles.';
  END IF;
  IF target_user = auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot assign roles to yourself.';
  END IF;
  INSERT INTO public.user_roles(user_id, role)
  VALUES (target_user, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- PART 4: Fix invitation token exposure
DROP POLICY IF EXISTS "user_read_own_invite" ON public.invitations;

CREATE POLICY "user_read_own_invite_safe" ON public.invitations
  FOR SELECT TO authenticated
  USING (
    invited_email = (auth.jwt() ->> 'email'::text)
    AND status != 'pending'
  );

-- PART 6: Fix profile data leak
DROP POLICY IF EXISTS "Users see own profile" ON public.profiles;

CREATE POLICY "Users see own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (
      has_role(auth.uid(), 'chief'::app_role)
      AND ward = get_user_ward(auth.uid())
      AND ward != ''
    )
    OR (
      has_role(auth.uid(), 'admin'::app_role)
      AND constituency = get_user_constituency(auth.uid())
      AND constituency != ''
    )
  );

-- PART 8: Storage security - add UPDATE and DELETE policies
CREATE POLICY "Users update own documents" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- Fix storage SELECT to scope jurisdiction
DROP POLICY IF EXISTS "Users view own documents" ON storage.objects;

CREATE POLICY "Users view own documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR has_role(auth.uid(), 'super_admin'::app_role)
    )
  );
