import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const email = 'franklinsabsabi1994@gmail.com';
    const password = 'Frank@1994.';

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === email);

    if (existing) {
      // Ensure super_admin role exists
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', existing.id);
      const existingRoles = roles?.map(r => r.role) || [];

      // Remove old admin/chief roles, add super_admin
      if (!existingRoles.includes('super_admin')) {
        await supabase.from('user_roles').insert({ user_id: existing.id, role: 'super_admin' });
      }
      // Remove plain admin role if exists (super_admin replaces it)
      if (existingRoles.includes('admin')) {
        await supabase.from('user_roles').delete().eq('user_id', existing.id).eq('role', 'admin');
      }
      if (existingRoles.includes('chief')) {
        await supabase.from('user_roles').delete().eq('user_id', existing.id).eq('role', 'chief');
      }

      return new Response(JSON.stringify({ message: 'Super Admin role set for existing user' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create super admin user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: 'Franklin Sabsabi',
        county: '',
        constituency: '',
        ward: '',
        role: 'super_admin',
      },
    });

    if (createError) throw createError;

    if (newUser.user) {
      // The trigger creates a 'user' role by default from metadata, but we need super_admin
      // Delete the default role and add super_admin
      await supabase.from('user_roles').delete().eq('user_id', newUser.user.id);
      await supabase.from('user_roles').insert({ user_id: newUser.user.id, role: 'super_admin' });
    }

    return new Response(JSON.stringify({ message: 'Super Admin seeded successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
