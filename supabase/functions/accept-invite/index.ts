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

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch invitation
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (fetchError || !invitation) {
      return new Response(JSON.stringify({ error: 'Invalid invitation token' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if already used
    if (invitation.status === 'used') {
      return new Response(JSON.stringify({ error: 'This invitation has already been used' }), {
        status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check expiry
    if (new Date(invitation.expires_at) < new Date()) {
      await supabaseAdmin.from('invitations').update({ status: 'expired' }).eq('id', invitation.id);
      return new Response(JSON.stringify({ error: 'This invitation has expired' }), {
        status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check email matches
    if (user.email !== invitation.invited_email) {
      return new Response(JSON.stringify({ error: 'This invitation was sent to a different email address' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine the role to assign (admin or chief)
    const assignedRole = invitation.role || 'admin';

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert(
        { user_id: user.id, role: assignedRole },
        { onConflict: 'user_id,role' }
      );

    if (roleError) {
      console.error('Role assignment error:', roleError);
      return new Response(JSON.stringify({ error: 'Failed to assign role: ' + roleError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update profile with admin_level, jurisdiction, and phone
    const profileUpdate: Record<string, string | null> = {
      admin_level: invitation.admin_level,
      county: invitation.county || '',
      constituency: invitation.constituency || '',
      ward: invitation.ward || '',
      phone: invitation.phone || null,
    };

    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      await supabaseAdmin.from('profiles').update(profileUpdate).eq('user_id', user.id);
    } else {
      await supabaseAdmin.from('profiles').insert({
        user_id: user.id,
        name: user.user_metadata?.name || user.email || '',
        email: user.email,
        ...profileUpdate,
      });
    }

    // Mark invitation as used
    await supabaseAdmin.from('invitations').update({ status: 'used' }).eq('id', invitation.id);

    // Log audit
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: assignedRole,
      action: 'accepted_invite',
      target_type: 'user',
      target_id: user.id,
      metadata: { invitation_id: invitation.id, role: assignedRole, admin_level: invitation.admin_level },
    });

    return new Response(JSON.stringify({
      success: true,
      role: assignedRole,
      admin_level: invitation.admin_level,
      county: invitation.county,
      constituency: invitation.constituency,
      ward: invitation.ward,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('accept-invite error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
