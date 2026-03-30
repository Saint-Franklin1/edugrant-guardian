
-- Add user_status to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_status text NOT NULL DEFAULT 'active';

-- Create bursary_programs table for admins to post available bursaries
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
  created_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.bursary_programs ENABLE ROW LEVEL SECURITY;

-- Admins and super_admins can create bursary programs
CREATE POLICY "admins_insert_bursary_programs" ON public.bursary_programs
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Everyone authenticated can view bursary programs
CREATE POLICY "authenticated_view_bursary_programs" ON public.bursary_programs
  FOR SELECT TO authenticated
  USING (true);

-- Admins can update their own programs
CREATE POLICY "admins_update_bursary_programs" ON public.bursary_programs
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create bursary_applications table for students to apply
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

-- Students can apply (insert)
CREATE POLICY "students_insert_applications" ON public.bursary_applications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Students see own, admins see all in jurisdiction
CREATE POLICY "view_bursary_applications" ON public.bursary_applications
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Admins can update application status
CREATE POLICY "admins_update_applications" ON public.bursary_applications
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Super admin can manage invitations (delete)
CREATE POLICY "super_admin_delete_invitations" ON public.invitations
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.bursary_programs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bursary_applications;
