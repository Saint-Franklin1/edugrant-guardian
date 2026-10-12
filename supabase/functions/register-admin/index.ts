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

    const body = await req.json();
    const { email, password, code } = body;

    if (!email || !password || !code) {
      return new Response(JSON.stringify({ error: 'Email, password, and access code are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Hash the input code and look up
    const inputHash = await hashCode(code);

    const { data: accessCode, error: lookupError } = await supabaseAdmin
      .from('admin_access_codes')
      .select('*')
      .eq('email', email)
      .eq('code_hash', inputHash)
      .eq('used', false)
      .single();

    if (lookupError || !accessCode) {
      return new Response(JSON.stringify({ error: 'Invalid access code or email mismatch' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check expiry
    if (new Date(accessCode.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Access code has expired. Request a new one from your Super Admin.' }), {
        status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user already exists
    let userId: string;

    const { data: existingUserData } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUserData?.users?.find((u: any) => u.email === email);

    if (existingUser) {
      // User exists — check they don't already have a staff role
      const { data: existingRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', existingUser.id)
        .in('role', ['admin', 'chief', 'super_admin'])
        .maybeSingle();

      if (existingRole) {
        return new Response(JSON.stringify({ error: 'This user already has a staff role assigned.' }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      userId = existingUser.id;
    } else {
      // Create new auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name: '',
          role: accessCode.role,
          county: accessCode.county || '',
          constituency: accessCode.constituency || '',
          ward: accessCode.ward || '',
        },
      });

      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      userId = authData.user.id;
    }

    const newUserId = userId;

    // Assign the staff role using service role (bypasses RLS)
    await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: newUserId, role: accessCode.role }, { onConflict: 'user_id,role' });

    // Update profile with admin_level
    await supabaseAdmin
      .from('profiles')
      .update({
        admin_level: accessCode.admin_level,
        county: accessCode.county || '',
        constituency: accessCode.constituency || '',
        ward: accessCode.ward || '',
      })
      .eq('user_id', newUserId);

    // Mark code as used
    await supabaseAdmin
      .from('admin_access_codes')
      .update({ used: true })
      .eq('id', accessCode.id);

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: newUserId,
      actor_role: accessCode.role,
      action: 'admin_registered_via_code',
      target_type: 'user',
      target_id: newUserId,
      metadata: {
        access_code_id: accessCode.id,
        role: accessCode.role,
        admin_level: accessCode.admin_level,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      role: accessCode.role,
      admin_level: accessCode.admin_level,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('register-admin error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
