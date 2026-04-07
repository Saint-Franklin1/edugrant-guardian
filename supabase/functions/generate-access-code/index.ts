import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jwtToken = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwtToken);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check super_admin role
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Only Super Admin can generate access codes' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { email, role: inviteRole, admin_level, county, constituency, ward } = body;

    // Validate
    if (!email || !inviteRole || !admin_level || !county) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['admin', 'chief'].includes(inviteRole)) {
      return new Response(JSON.stringify({ error: 'Invalid role' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['county', 'constituency', 'ward'].includes(admin_level)) {
      return new Response(JSON.stringify({ error: 'Invalid admin_level' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user already has a staff role
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);
    if (existingUser) {
      const { data: existingRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', existingUser.id)
        .in('role', ['admin', 'super_admin', 'chief'])
        .single();

      if (existingRole) {
        return new Response(JSON.stringify({ error: 'This user already has a staff role' }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Generate a 6-digit code
    const rawCode = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await hashCode(rawCode);

    // Expire any existing unused codes for this email
    await supabaseAdmin
      .from('admin_access_codes')
      .update({ used: true })
      .eq('email', email)
      .eq('used', false);

    // 15-minute expiry
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: insertError } = await supabaseAdmin
      .from('admin_access_codes')
      .insert({
        email,
        code_hash: codeHash,
        role: inviteRole,
        admin_level,
        county: county || null,
        constituency: constituency || null,
        ward: ward || null,
        expires_at: expiresAt,
        created_by: user.id,
      });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log audit
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: 'super_admin',
      action: 'generate_access_code',
      target_type: 'admin_access_code',
      metadata: { email, role: inviteRole, admin_level, county, constituency, ward },
    });

    return new Response(JSON.stringify({
      success: true,
      code: rawCode,
      expires_at: expiresAt,
      email,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('generate-access-code error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
