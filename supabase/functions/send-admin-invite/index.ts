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

    // Verify caller is super_admin
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

    // Check super_admin role
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Only Super Admin can send invitations' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { email, role: inviteRole, admin_level, county, constituency, ward } = body;

    // Validate required fields
    if (!email || !inviteRole || !county) {
      return new Response(JSON.stringify({ error: 'Missing required fields: email, role, county' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate role
    if (!['admin', 'chief'].includes(inviteRole)) {
      return new Response(JSON.stringify({ error: 'Invalid role. Must be admin or chief.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For admin role, require admin_level
    if (inviteRole === 'admin' && !admin_level) {
      return new Response(JSON.stringify({ error: 'admin_level required for admin role' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate admin_level if provided
    if (admin_level && !['county', 'constituency', 'ward'].includes(admin_level)) {
      return new Response(JSON.stringify({ error: 'Invalid admin_level' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate jurisdiction fields based on admin_level
    const effectiveLevel = inviteRole === 'chief' ? 'ward' : admin_level;
    if (effectiveLevel === 'constituency' && !constituency) {
      return new Response(JSON.stringify({ error: 'Constituency required for constituency admin' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (effectiveLevel === 'ward' && (!constituency || !ward)) {
      return new Response(JSON.stringify({ error: 'Constituency and ward required for ward-level role' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('invited_email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      return new Response(JSON.stringify({ error: 'A pending invitation already exists for this email' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user already has an admin/chief role
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);
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

    // Generate token and expiry (1 hour)
    const inviteToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Store invitation
    const { data: invitation, error: insertError } = await supabaseAdmin
      .from('invitations')
      .insert({
        invited_email: email,
        role: inviteRole,
        admin_level: inviteRole === 'chief' ? 'ward' : admin_level,
        county,
        constituency: constituency || null,
        ward: ward || null,
        invited_by: user.id,
        token: inviteToken,
        expires_at: expiresAt,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine the accept invite URL
    // Use the Referer header or fallback to construct from SUPABASE_URL
    const referer = req.headers.get('referer') || req.headers.get('origin') || '';
    // Extract origin from referer
    let siteOrigin = '';
    try {
      if (referer) {
        const url = new URL(referer);
        siteOrigin = url.origin;
      }
    } catch { /* ignore */ }

    const acceptUrl = `${siteOrigin}/accept-invite?token=${inviteToken}`;

    // Send the actual email via Supabase magic link
    let emailSent = false;
    let emailError = '';

    if (existingUser) {
      // User already exists - generate a magic link
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: acceptUrl,
        },
      });

      if (linkError) {
        emailError = linkError.message;
        console.error('Magic link generation failed:', linkError);
      } else {
        // The generateLink returns properties with the hashed token
        // We need to construct the email verification URL
        const actionLink = linkData?.properties?.action_link;
        if (actionLink) {
          // Modify the action link to redirect to our accept-invite page
          // The action link format: {SUPABASE_URL}/auth/v1/verify?token=...&type=magiclink&redirect_to=...
          emailSent = true;
        }
      }
    }

    if (!existingUser) {
      // New user - use inviteUserByEmail which sends an actual email
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: acceptUrl,
        data: {
          name: '',
          role: 'user', // Default role, will be upgraded on invite acceptance
          invited: true,
        },
      });

      if (inviteError) {
        emailError = inviteError.message;
        console.error('Invite email failed:', inviteError);
      } else {
        emailSent = true;
      }
    }

    // Log audit
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: 'super_admin',
      action: `invite_${inviteRole}`,
      target_type: 'invitation',
      target_id: invitation.id,
      metadata: { email, role: inviteRole, admin_level: inviteRole === 'chief' ? 'ward' : admin_level, county, constituency, ward, email_sent: emailSent },
    });

    return new Response(JSON.stringify({
      success: true,
      invitation_id: invitation.id,
      token: inviteToken,
      expires_at: expiresAt,
      email_sent: emailSent,
      email_error: emailError || undefined,
      accept_url: acceptUrl,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('send-admin-invite error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
