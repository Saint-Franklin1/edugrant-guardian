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

    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Only Super Admin can manage users' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action, target_user_id } = body;

    if (!action || !target_user_id) {
      return new Response(JSON.stringify({ error: 'Missing action or target_user_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['suspend', 'ban', 'activate', 'delete'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prevent self-action
    if (target_user_id === user.id) {
      return new Response(JSON.stringify({ error: 'Cannot perform action on yourself' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete') {
      // Delete from auth (cascades to profiles, user_roles, etc.)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(target_user_id);
      if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      const statusMap: Record<string, string> = { suspend: 'suspended', ban: 'banned', activate: 'active' };
      const newStatus = statusMap[action];

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ user_status: newStatus })
        .eq('user_id', target_user_id);

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // If banning, also disable auth user
      if (action === 'ban') {
        await supabaseAdmin.auth.admin.updateUserById(target_user_id, { ban_duration: '876000h' });
      } else if (action === 'activate') {
        await supabaseAdmin.auth.admin.updateUserById(target_user_id, { ban_duration: 'none' });
      } else if (action === 'suspend') {
        await supabaseAdmin.auth.admin.updateUserById(target_user_id, { ban_duration: '876000h' });
      }
    }

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: 'super_admin',
      action: `user_${action}`,
      target_type: 'user',
      target_id: target_user_id,
      metadata: { action },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
