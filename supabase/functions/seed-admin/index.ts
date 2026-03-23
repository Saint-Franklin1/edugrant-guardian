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
      // Make sure both roles exist
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', existing.id);
      const existingRoles = roles?.map(r => r.role) || [];
      
      if (!existingRoles.includes('chief')) {
        await supabase.from('user_roles').insert({ user_id: existing.id, role: 'chief' });
      }
      if (!existingRoles.includes('admin')) {
        await supabase.from('user_roles').insert({ user_id: existing.id, role: 'admin' });
      }

      return new Response(JSON.stringify({ message: 'User already exists, roles updated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: 'Franklin Sabsabi',
        county: 'Nairobi',
        constituency: 'Westlands',
        ward: 'Parklands',
        role: 'admin',
      },
    });

    if (createError) throw createError;

    // Add chief role too (admin role added by trigger)
    if (newUser.user) {
      await supabase.from('user_roles').insert({ user_id: newUser.user.id, role: 'chief' });
    }

    return new Response(JSON.stringify({ message: 'Seed user created with admin and chief roles' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
