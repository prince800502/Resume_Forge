import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create supabase client with service role key (admin privileges)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Create a client with the user's JWT to verify identity
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the current user from the JWT
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id

    // Verify the request body has the confirmation
    const body = await req.json()
    if (body.confirmation !== 'DELETE') {
      return new Response(
        JSON.stringify({ error: 'Invalid confirmation. Must type "DELETE"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Start a transaction-like cleanup
    // 1. Delete user's resumes (cascade will handle related data if FK constraints exist)
    const { error: resumesError } = await supabaseAdmin
      .from('resumes')
      .delete()
      .eq('user_id', userId)
    
    if (resumesError) {
      console.error('Error deleting resumes:', resumesError)
      // Continue anyway, don't fail the whole operation
    }

    // 2. Delete user's profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)
    
    if (profileError) {
      console.error('Error deleting profile:', profileError)
    }

    // 3. Delete user's avatar from storage (if any)
    // List files in the user's avatar folder
    const { data: avatarFiles, error: listError } = await supabaseAdmin.storage
      .from('avatars')
      .list(userId)
    
    if (!listError && avatarFiles && avatarFiles.length > 0) {
      const filePaths = avatarFiles.map(file => `${userId}/${file.name}`)
      const { error: storageError } = await supabaseAdmin.storage
        .from('avatars')
        .remove(filePaths)
      
      if (storageError) {
        console.error('Error deleting avatar files:', storageError)
      }
    }

    // 4. Delete the auth user (this will also revoke all sessions)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete account. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})