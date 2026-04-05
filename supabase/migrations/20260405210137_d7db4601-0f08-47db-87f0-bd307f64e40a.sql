
-- Add funding_level to bursary_programs
ALTER TABLE public.bursary_programs ADD COLUMN IF NOT EXISTS funding_level text DEFAULT 'county';

-- School payment details submitted by students
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

-- Students can insert/view their own payment details
CREATE POLICY "students_manage_own_payment_details" ON public.school_payment_details
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins and super_admins can view all payment details
CREATE POLICY "admins_view_payment_details" ON public.school_payment_details
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can update payment details (verify/reject)
CREATE POLICY "admins_update_payment_details" ON public.school_payment_details
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Disbursements table
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

-- Students can view their own disbursements
CREATE POLICY "students_view_own_disbursements" ON public.disbursements
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM student_profiles sp WHERE sp.id = disbursements.student_id AND sp.user_id = auth.uid()));

-- Admins manage disbursements
CREATE POLICY "admins_manage_disbursements" ON public.disbursements
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.school_payment_details;
ALTER PUBLICATION supabase_realtime ADD TABLE public.disbursements;
