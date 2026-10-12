-- =====================================================
-- EDUGRANT GUARDIAN - FULL DATABASE MIGRATION
-- Target: https://enlfdtlhtcsdeqjekkdq.supabase.co
-- 
-- HOW TO RUN:
-- 1. Go to your Supabase Dashboard > SQL Editor
-- 2. Paste this entire script
-- 3. Click "Run" to execute
-- =====================================================

-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('user', 'chief', 'admin', 'super_admin');
CREATE TYPE public.student_status AS ENUM ('draft', 'submitted', 'under_review', 'verified', 'rejected');
CREATE TYPE public.bursary_status AS ENUM ('verified', 'approved_for_funding', 'allocated', 'disbursed', 'completed');
CREATE TYPE public.document_type AS ENUM ('student_id', 'birth_certificate', 'parent_id', 'admission_letter', 'school_id', 'fee_structure', 'fee_statement', 'vulnerability_proof', 'residency_proof');
CREATE TYPE public.verification_decision AS ENUM ('approved', 'rejected');

-- ============ CORE TABLES ============

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  county TEXT NOT NULL,
  constituency TEXT NOT NULL,
  ward TEXT NOT NULL,
  admin_level TEXT CHECK (admin_level IN ('ward', 'constituency', 'county')),
  user_status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Student profiles
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  birth_cert_number TEXT,
  school_name TEXT,
  status student_status NOT NULL DEFAULT 'draft',
  education_id TEXT UNIQUE,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Documents (IMMUTABLE - no update/delete policies)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  type document_type NOT NULL,
  file_url TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  file_name TEXT,
  is_active BOOLEAN DEFAULT true,
  extraction_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Unique partial index: only one active document per student per type
CREATE UNIQUE INDEX IF NOT EXISTS one_active_doc_per_type ON public.documents (student_id, type) WHERE is_active = true;

-- Verification records
CREATE TABLE public.verification_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  verifier_id UUID REFERENCES auth.users(id) NOT NULL,
  role app_role NOT NULL,
  decision verification_decision NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.verification_records ENABLE ROW LEVEL SECURITY;

-- Comments (IMMUTABLE)
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  role app_role NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Bursary records
CREATE TABLE public.bursary_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status bursary_status NOT NULL DEFAULT 'verified',
  allocated_amount NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bursary_records ENABLE ROW LEVEL SECURITY;

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  actor_role TEXT,
  action TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Fraud flags
CREATE TABLE public.fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  flag_type TEXT NOT NULL,
  details TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;

-- ============ GEOGRAPHIC TABLES ============

CREATE TABLE public.counties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL
);

CREATE TABLE public.constituencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  county_id uuid NOT NULL REFERENCES public.counties(id) ON DELETE CASCADE
);

CREATE TABLE public.wards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  constituency_id uuid NOT NULL REFERENCES public.constituencies(id) ON DELETE CASCADE
);

ALTER TABLE public.counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constituencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;

-- ============ INVITATIONS TABLE ============

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

-- ============ BURSARY PROGRAMS TABLE ============

CREATE TABLE public.bursary_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  total_amount numeric NOT NULL,
  per_student_amount numeric,
  deadline timestamp with time zone NOT NULL,
  county text,
  constituency text,
  ward text,
  funding_level text DEFAULT 'county',
  created_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.bursary_programs ENABLE ROW LEVEL SECURITY;

-- ============ BURSARY APPLICATIONS TABLE ============

CREATE TABLE public.bursary_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.bursary_programs(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.student_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  applied_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  notes text,
  UNIQUE(program_id, student_id)
);

ALTER TABLE public.bursary_applications ENABLE ROW LEVEL SECURITY;

-- ============ SCHOOL PAYMENT DETAILS TABLE ============

CREATE TABLE public.school_payment_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  bank_name text NOT NULL,
  account_name text NOT NULL,
  account_number text NOT NULL,
  branch text,
  school_name text NOT NULL,
  admission_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  verified_by uuid,
  verified_at timestamptz,
  UNIQUE(student_id)
);

ALTER TABLE public.school_payment_details ENABLE ROW LEVEL SECURITY;

-- ============ DISBURSEMENTS TABLE ============

CREATE TABLE public.disbursements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.bursary_applications(id),
  student_id uuid NOT NULL REFERENCES public.student_profiles(id),
  program_id uuid NOT NULL REFERENCES public.bursary_programs(id),
  amount numeric NOT NULL,
  school_payment_id uuid REFERENCES public.school_payment_details(id),
  status text NOT NULL DEFAULT 'pending',
  disbursed_by uuid,
  disbursed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.disbursements ENABLE ROW LEVEL SECURITY;

-- ============ ADMIN ACCESS CODES TABLE ============

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

-- ============ ADMIN REQUESTS TABLE ============

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

-- ============ ANNOUNCEMENTS TABLE ============

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

-- ============ ANNOUNCEMENT APPLICATIONS TABLE ============

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

-- ============ SECURITY DEFINER FUNCTIONS ============

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_ward(_user_id UUID)
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT ward FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_user_constituency(_user_id UUID)
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT constituency FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_student_ward(_student_id UUID)
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.ward FROM public.profiles p
  JOIN public.student_profiles sp ON sp.user_id = p.user_id
  WHERE sp.id = _student_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_student_constituency(_student_id UUID)
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.constituency FROM public.profiles p
  JOIN public.student_profiles sp ON sp.user_id = p.user_id
  WHERE sp.id = _student_id LIMIT 1
$$;

-- Secure role assignment function (prevents privilege escalation)
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

-- Education ID auto-generation
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

-- ============ RLS POLICIES ============

-- user_roles
CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- profiles
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
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "super_admin_view_all_profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super_admin_update_profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "prevent_admin_level_update_once_set" ON public.profiles
  FOR UPDATE TO authenticated
  USING (admin_level IS NULL OR admin_level = admin_level);

-- student_profiles
CREATE POLICY "Users see own students" ON public.student_profiles FOR SELECT USING (
  auth.uid() = user_id
  OR (public.has_role(auth.uid(), 'chief') AND public.get_user_ward(auth.uid()) = (SELECT ward FROM public.profiles WHERE user_id = student_profiles.user_id))
  OR (public.has_role(auth.uid(), 'admin') AND public.get_user_constituency(auth.uid()) = (SELECT constituency FROM public.profiles WHERE user_id = student_profiles.user_id))
);
CREATE POLICY "Users insert own students" ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own draft students" ON public.student_profiles FOR UPDATE USING (
  (auth.uid() = user_id AND status = 'draft')
  OR public.has_role(auth.uid(), 'chief')
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "super_admin_view_all_students" ON public.student_profiles FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- documents
CREATE POLICY "View documents" ON public.documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = documents.student_id AND (
    sp.user_id = auth.uid()
    OR (public.has_role(auth.uid(), 'chief') AND public.get_student_ward(documents.student_id) = public.get_user_ward(auth.uid()))
    OR (public.has_role(auth.uid(), 'admin') AND public.get_student_constituency(documents.student_id) = public.get_user_constituency(auth.uid()))
  ))
);
CREATE POLICY "Users insert own documents" ON public.documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = documents.student_id AND sp.user_id = auth.uid())
);
CREATE POLICY "super_admin_view_all_documents" ON public.documents FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- verification_records
CREATE POLICY "View verification records" ON public.verification_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = verification_records.student_id AND (
    sp.user_id = auth.uid()
    OR public.has_role(auth.uid(), 'chief')
    OR public.has_role(auth.uid(), 'admin')
  ))
);
CREATE POLICY "Chiefs and admins insert verifications" ON public.verification_records FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'chief') OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "super_admin_view_verifications" ON public.verification_records FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- comments
CREATE POLICY "View comments" ON public.comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = comments.student_id AND (
    sp.user_id = auth.uid()
    OR public.has_role(auth.uid(), 'chief')
    OR public.has_role(auth.uid(), 'admin')
  ))
);
CREATE POLICY "Chiefs and admins insert comments" ON public.comments FOR INSERT WITH CHECK (
  (public.has_role(auth.uid(), 'chief') OR public.has_role(auth.uid(), 'admin'))
  AND auth.uid() = author_id
);
CREATE POLICY "super_admin_view_comments" ON public.comments FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- bursary_records
CREATE POLICY "View bursary records" ON public.bursary_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = bursary_records.student_id AND (
    sp.user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  ))
);
CREATE POLICY "Admins manage bursary" ON public.bursary_records FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update bursary" ON public.bursary_records FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "super_admin_manage_bursary" ON public.bursary_records FOR ALL USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- audit_logs
CREATE POLICY "super_admin_full_access_audit" ON public.audit_logs FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "admin_read_audit_logs" ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "chief_read_audit_logs" ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'chief'));
CREATE POLICY "authenticated_insert_audit_logs" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);

-- fraud_flags
CREATE POLICY "Admins see fraud flags" ON public.fraud_flags FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System inserts fraud flags" ON public.fraud_flags FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'chief'));
CREATE POLICY "super_admin_see_fraud_flags" ON public.fraud_flags FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- geographic tables
CREATE POLICY "Authenticated read counties" ON public.counties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read constituencies" ON public.constituencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read wards" ON public.wards FOR SELECT TO authenticated USING (true);

-- invitations
CREATE POLICY "super_admin_manage_invitations" ON public.invitations FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "user_read_own_invite_safe" ON public.invitations FOR SELECT TO authenticated
  USING (invited_email = (auth.jwt() ->> 'email'::text) AND status != 'pending');
CREATE POLICY "super_admin_delete_invitations" ON public.invitations FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- user_roles (super admin)
CREATE POLICY "super_admin_view_all_roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super_admin_manage_roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- bursary_programs
CREATE POLICY "admins_insert_bursary_programs" ON public.bursary_programs
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "authenticated_view_bursary_programs" ON public.bursary_programs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins_update_bursary_programs" ON public.bursary_programs
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- bursary_applications
CREATE POLICY "students_insert_applications" ON public.bursary_applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "view_bursary_applications" ON public.bursary_applications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "admins_update_applications" ON public.bursary_applications
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- school_payment_details
CREATE POLICY "students_manage_own_payment_details" ON public.school_payment_details
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins_view_payment_details" ON public.school_payment_details
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "admins_update_payment_details" ON public.school_payment_details
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- disbursements
CREATE POLICY "students_view_own_disbursements" ON public.disbursements
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_profiles sp WHERE sp.id = disbursements.student_id AND sp.user_id = auth.uid()));
CREATE POLICY "admins_manage_disbursements" ON public.disbursements
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- admin_access_codes
CREATE POLICY "super_admin_manage_access_codes" ON public.admin_access_codes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- admin_requests
CREATE POLICY "Submit admin request with valid data" ON public.admin_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (name IS NOT NULL AND name <> '' AND email IS NOT NULL AND email <> '' AND requested_level IS NOT NULL AND requested_level <> '');
CREATE POLICY "Super admin manages requests" ON public.admin_requests FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Users view own request" ON public.admin_requests FOR SELECT
  TO authenticated USING (email = (auth.jwt() ->> 'email'));

-- announcements
CREATE POLICY "Authenticated view announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins create announcements" ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins update own announcements" ON public.announcements FOR UPDATE TO authenticated
  USING ((auth.uid() = created_by AND has_role(auth.uid(), 'admin'::app_role)) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admin delete announcements" ON public.announcements FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- announcement_applications
CREATE POLICY "Students apply to announcements" ON public.announcement_applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students view own announcement apps" ON public.announcement_applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins manage announcement apps" ON public.announcement_applications FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- ============ TRIGGERS ============

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bursary_records_updated_at BEFORE UPDATE ON public.bursary_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Education ID trigger
CREATE TRIGGER set_education_id BEFORE INSERT ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.generate_education_id();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, county, constituency, ward)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'county', ''),
    COALESCE(NEW.raw_user_meta_data->>'constituency', ''),
    COALESCE(NEW.raw_user_meta_data->>'ward', '')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'user'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ STORAGE ============

INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Users upload own documents" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users view own documents" ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND ((auth.uid())::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "Users update own documents" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own documents" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- ============ REALTIME ============

ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bursary_programs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bursary_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.school_payment_details;
ALTER PUBLICATION supabase_realtime ADD TABLE public.disbursements;

-- =====================================================
-- MIGRATION COMPLETE!
-- 
-- Next steps:
-- 1. Deploy Edge Functions using: supabase functions deploy --project-ref enlfdtlhtcsdeqjekkdq
-- 2. Set your app's environment variables in Vercel
-- =====================================================
