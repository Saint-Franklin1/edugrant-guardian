
-- 1. Admin Requests table
CREATE TABLE public.admin_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  requested_role app_role NOT NULL DEFAULT 'admin',
  requested_level text NOT NULL,
  county text,
  constituency text,
  ward text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a request (public form)
CREATE POLICY "Anyone can submit admin request"
  ON public.admin_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Super admin can manage all requests
CREATE POLICY "Super admin manages requests"
  ON public.admin_requests FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Authenticated users can view their own request by email
CREATE POLICY "Users view own request"
  ON public.admin_requests FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'));

-- 2. Announcements table
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  eligibility text,
  deadline date,
  county text,
  constituency text,
  ward text,
  created_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active announcements
CREATE POLICY "Authenticated view announcements"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (true);

-- Admins and super admins can create announcements
CREATE POLICY "Admins create announcements"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Admins can update their own announcements, super admin can update all
CREATE POLICY "Admins update own announcements"
  ON public.announcements FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = created_by AND has_role(auth.uid(), 'admin'::app_role))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Super admin can delete announcements
CREATE POLICY "Super admin delete announcements"
  ON public.announcements FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Announcement Applications table
CREATE TABLE public.announcement_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, announcement_id)
);

ALTER TABLE public.announcement_applications ENABLE ROW LEVEL SECURITY;

-- Students can apply
CREATE POLICY "Students apply to announcements"
  ON public.announcement_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Students view own applications
CREATE POLICY "Students view own announcement apps"
  ON public.announcement_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins and super admins can view and update all
CREATE POLICY "Admins manage announcement apps"
  ON public.announcement_applications FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- 4. Education ID auto-generation trigger
CREATE OR REPLACE FUNCTION public.generate_education_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.education_id IS NULL OR NEW.education_id = '' THEN
    NEW.education_id := 'EDU-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_education_id
  BEFORE INSERT ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_education_id();
