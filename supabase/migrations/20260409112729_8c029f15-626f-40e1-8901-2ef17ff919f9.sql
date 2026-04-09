
-- Fix overly permissive INSERT policy on admin_requests
DROP POLICY "Anyone can submit admin request" ON public.admin_requests;

CREATE POLICY "Submit admin request with valid data"
  ON public.admin_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND name <> '' 
    AND email IS NOT NULL AND email <> ''
    AND requested_level IS NOT NULL AND requested_level <> ''
  );
