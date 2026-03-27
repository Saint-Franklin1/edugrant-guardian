
-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invited_email text NOT NULL,
  role app_role NOT NULL DEFAULT 'admin',
  admin_level text CHECK (admin_level IN ('county', 'constituency', 'ward')),
  county text,
  constituency text,
  ward text,
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_manage_invitations"
  ON public.invitations FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "user_read_own_invite"
  ON public.invitations FOR SELECT
  USING (invited_email = (auth.jwt() ->> 'email'));

-- Update audit_logs
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS actor_role text,
  ADD COLUMN IF NOT EXISTS target_type text;

DROP POLICY IF EXISTS "Admins read audit logs" ON public.audit_logs;
CREATE POLICY "super_admin_full_access_audit"
  ON public.audit_logs FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "admin_read_audit_logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "chief_read_audit_logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'chief'));

DROP POLICY IF EXISTS "Authenticated insert audit logs" ON public.audit_logs;
CREATE POLICY "authenticated_insert_audit_logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);

-- Super admin global access policies
CREATE POLICY "super_admin_view_all_students" ON public.student_profiles FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super_admin_view_all_profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super_admin_update_profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super_admin_see_fraud_flags" ON public.fraud_flags FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super_admin_view_all_documents" ON public.documents FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super_admin_manage_bursary" ON public.bursary_records FOR ALL USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super_admin_view_all_roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super_admin_manage_roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super_admin_view_verifications" ON public.verification_records FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super_admin_view_comments" ON public.comments FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));
