
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('user', 'chief', 'admin');
CREATE TYPE public.student_status AS ENUM ('draft', 'submitted', 'under_review', 'verified', 'rejected');
CREATE TYPE public.bursary_status AS ENUM ('verified', 'approved_for_funding', 'allocated', 'disbursed', 'completed');
CREATE TYPE public.document_type AS ENUM ('student_id', 'birth_certificate', 'parent_id', 'admission_letter', 'school_id', 'fee_structure', 'fee_statement', 'vulnerability_proof', 'residency_proof');
CREATE TYPE public.verification_decision AS ENUM ('approved', 'rejected');

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

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
  action TEXT NOT NULL,
  target_id UUID,
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

-- ============ RLS POLICIES ============

-- user_roles
CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System inserts roles" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- profiles
CREATE POLICY "Users see own profile" ON public.profiles FOR SELECT USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'chief')
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

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

-- documents (IMMUTABLE: INSERT and SELECT only)
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

-- comments (IMMUTABLE)
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

-- bursary_records
CREATE POLICY "View bursary records" ON public.bursary_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = bursary_records.student_id AND (
    sp.user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  ))
);
CREATE POLICY "Admins manage bursary" ON public.bursary_records FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update bursary" ON public.bursary_records FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- audit_logs
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- fraud_flags
CREATE POLICY "Admins see fraud flags" ON public.fraud_flags FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System inserts fraud flags" ON public.fraud_flags FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'chief'));

-- ============ TRIGGERS ============

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bursary_records_updated_at BEFORE UPDATE ON public.bursary_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
  USING (bucket_id = 'documents' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'chief')
    OR public.has_role(auth.uid(), 'admin')
  ));
