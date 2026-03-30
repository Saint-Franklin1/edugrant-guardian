import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin/chief/super_admin role
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const userRoles = (roles || []).map(r => r.role);
    if (!userRoles.some(r => ['admin', 'chief', 'super_admin'].includes(r))) {
      return new Response(JSON.stringify({ error: 'Unauthorized role' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const educationId = url.searchParams.get('education_id');

    if (!educationId) {
      return new Response(JSON.stringify({ error: 'education_id parameter required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Look up student
    const { data: student, error: studentError } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('education_id', educationId)
      .single();

    if (studentError || !student) {
      return new Response(JSON.stringify({ error: 'Student not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get profile info
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name, ward, constituency, county')
      .eq('user_id', student.user_id)
      .single();

    // Get documents
    const { data: documents } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('student_id', student.id)
      .eq('is_active', true);

    // Get verification records
    const { data: verifications } = await supabaseAdmin
      .from('verification_records')
      .select('*')
      .eq('student_id', student.id);

    // Get comments
    const { data: comments } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: true });

    return new Response(JSON.stringify({
      student,
      profile,
      documents: documents || [],
      verifications: verifications || [],
      comments: comments || [],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
