
-- Geographic tables for cascading dropdowns
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

-- RLS - all authenticated users can read geographic data
ALTER TABLE public.counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constituencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read counties" ON public.counties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read constituencies" ON public.constituencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read wards" ON public.wards FOR SELECT TO authenticated USING (true);
